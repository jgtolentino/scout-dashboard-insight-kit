import { useQuery } from '@tanstack/react-query';
import { scoutApiClient } from '@/config/scoutApi';

interface SubstitutionDataPoint {
  source: string;
  target: string;
  value: number;
  frequency: number;
  revenue: number;
  substitutionRate: number;
}

interface SubstitutionFilters {
  timeRange?: string;
  categories?: string[];
  brands?: string[];
  regions?: string[];
  storeTypes?: string[];
}

export const useSubstitutionData = (filters: SubstitutionFilters = {}) => {
  return useQuery({
    queryKey: ['substitution-data', filters],
    queryFn: async (): Promise<{ data: SubstitutionDataPoint[]; summary: any }> => {
      try {
        // Use Scout Analytics API for real data
        const response = await scoutApiClient.getAnalytics(filters);
        
        // Transform the response data to substitution format
        // This assumes the API returns transaction data that we can analyze for substitution patterns
        const substitutionData = transformToSubstitutionData(response);
        
        // Calculate summary statistics
        const summary = {
          totalSubstitutions: substitutionData.reduce((sum, item) => sum + item.frequency, 0),
          totalRevenue: substitutionData.reduce((sum, item) => sum + item.revenue, 0),
          avgSubstitutionRate: substitutionData.length > 0 ? 
            substitutionData.reduce((sum, item) => sum + item.substitutionRate, 0) / substitutionData.length : 0,
          topSubstitution: substitutionData.length > 0 ? 
            substitutionData.reduce((max, item) => 
              item.frequency > max.frequency ? item : max, 
              substitutionData[0]
            ) : null,
          uniqueProducts: new Set([
            ...substitutionData.map(item => item.source),
            ...substitutionData.map(item => item.target)
          ]).size
        };

        return {
          data: substitutionData,
          summary
        };
      } catch (error) {
        console.error('Error fetching substitution data:', error);
        throw new Error('Failed to fetch substitution data');
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Transform Scout Analytics data to substitution patterns
const transformToSubstitutionData = (apiResponse: any): SubstitutionDataPoint[] => {
  try {
    // Get transaction data from the API response
    const transactions = apiResponse?.transactions?.data || [];
    
    if (transactions.length === 0) {
      return [];
    }

    // Analyze transaction patterns to detect substitutions
    // This is a simplified algorithm - in practice, you'd use more sophisticated methods
    const productPairs: { [key: string]: { 
      frequency: number, 
      revenue: number, 
      totalValue: number 
    } } = {};
    
    // Group transactions by customer and time window to find substitution patterns
    const customerTransactions: { [customerId: string]: any[] } = {};
    
    transactions.forEach((transaction: any) => {
      const customerId = transaction.customer_id;
      if (!customerTransactions[customerId]) {
        customerTransactions[customerId] = [];
      }
      customerTransactions[customerId].push(transaction);
    });

    // Analyze each customer's transaction patterns
    Object.values(customerTransactions).forEach((customerTxns: any[]) => {
      // Sort by date to find temporal patterns
      customerTxns.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Look for products that were purchased in sequence (potential substitutions)
      for (let i = 0; i < customerTxns.length - 1; i++) {
        const currentTxn = customerTxns[i];
        const nextTxn = customerTxns[i + 1];
        
        // Check if transactions are within a reasonable time window (e.g., 30 days)
        const timeDiff = new Date(nextTxn.date).getTime() - new Date(currentTxn.date).getTime();
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
        
        if (daysDiff <= 30 && daysDiff > 0) {
          const sourceProduct = getProductName(currentTxn);
          const targetProduct = getProductName(nextTxn);
          
          if (sourceProduct && targetProduct && sourceProduct !== targetProduct) {
            // Check if products are in similar categories (more likely to be substitutions)
            const sourceCategory = getCategoryFromProduct(sourceProduct);
            const targetCategory = getCategoryFromProduct(targetProduct);
            
            if (sourceCategory === targetCategory) {
              const pairKey = `${sourceProduct} → ${targetProduct}`;
              
              if (!productPairs[pairKey]) {
                productPairs[pairKey] = { frequency: 0, revenue: 0, totalValue: 0 };
              }
              
              productPairs[pairKey].frequency += 1;
              productPairs[pairKey].revenue += nextTxn.total_amount || nextTxn.amount || 0;
              productPairs[pairKey].totalValue += (nextTxn.quantity || 1);
            }
          }
        }
      }
    });

    // Convert to SubstitutionDataPoint format
    const substitutionData: SubstitutionDataPoint[] = Object.entries(productPairs)
      .filter(([_, data]) => data.frequency >= 2) // Only include pairs with at least 2 occurrences
      .map(([pairKey, data]) => {
        const [source, target] = pairKey.split(' → ');
        const substitutionRate = Math.min((data.frequency / transactions.length) * 100 * 20, 25); // Scaled rate
        
        return {
          source,
          target,
          value: data.totalValue,
          frequency: data.frequency,
          revenue: data.revenue,
          substitutionRate
        };
      })
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 20); // Top 20 substitution pairs

    return substitutionData;
  } catch (error) {
    console.error('Error transforming substitution data:', error);
    return [];
  }
};

// Extract product name from transaction
const getProductName = (transaction: any): string | null => {
  return transaction.product_name || 
         transaction.product || 
         transaction.item_name || 
         transaction.description || 
         null;
};

// Helper function to categorize products (simplified)
const getCategoryFromProduct = (productName: string): string => {
  const name = productName.toLowerCase();
  
  if (name.includes('cola') || name.includes('sprite') || name.includes('7-up') || 
      name.includes('red bull') || name.includes('monster')) {
    return 'beverages';
  }
  if (name.includes('chips') || name.includes('pringles') || name.includes('oreo') || 
      name.includes('kit kat') || name.includes('snickers')) {
    return 'snacks';
  }
  if (name.includes('shampoo') || name.includes('head') || name.includes('pantene') || 
      name.includes('colgate') || name.includes('oral-b') || name.includes('dove') || 
      name.includes('palmolive')) {
    return 'personal_care';
  }
  if (name.includes('tide') || name.includes('ariel') || name.includes('downy') || 
      name.includes('surf')) {
    return 'household';
  }
  if (name.includes('maggi') || name.includes('lucky') || name.includes('del monte') || 
      name.includes('argentina') || name.includes('nestle') || name.includes('nescafe')) {
    return 'food_staples';
  }
  
  return 'other';
};