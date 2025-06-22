import { useQuery } from '@tanstack/react-query';
import { scoutApi } from '@/config/scoutApi';

export interface DemographicDataPoint {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  value: number;
  revenue: number;
  count: number;
  percentage: number;
  avgSpend: number;
  growth: number;
  children?: DemographicDataPoint[];
}

export interface DemographicTreeMapResponse {
  data: DemographicDataPoint[];
  summary: {
    totalValue: number;
    totalRevenue: number;
    totalCustomers: number;
    avgSpend: number;
    topSegment: string;
    categories: string[];
  };
}

interface DemographicFilters {
  timeRange?: string;
  categories?: string[];
  brands?: string[];
  regions?: string[];
  storeTypes?: string[];
}

export const useDemographicTreeMapData = (filters: DemographicFilters = {}) => {
  return useQuery({
    queryKey: ['demographic-treemap-data', filters],
    queryFn: async (): Promise<DemographicTreeMapResponse> => {
      try {
        // Fetch real data from Scout Analytics API
        const response = await scoutApi.getAnalytics(filters);
        
        // Transform the response data to demographic format
        const demographicData = transformToDemographicData(response);
        
        // Calculate summary statistics
        const summary = {
          totalValue: demographicData.reduce((sum, item) => sum + item.value, 0),
          totalRevenue: demographicData.reduce((sum, item) => sum + item.revenue, 0),
          totalCustomers: demographicData.reduce((sum, item) => sum + item.count, 0),
          avgSpend: demographicData.length > 0 ? 
            demographicData.reduce((sum, item) => sum + item.revenue, 0) / 
            demographicData.reduce((sum, item) => sum + item.count, 0) : 0,
          topSegment: demographicData.length > 0 ? 
            demographicData.reduce((max, item) => 
              item.value > max.value ? item : max, 
              demographicData[0]
            ).name : 'N/A',
          categories: Array.from(new Set(demographicData.map(item => item.category)))
        };

        return {
          data: demographicData,
          summary
        };
      } catch (error) {
        console.error('Error fetching demographic tree map data:', error);
        throw new Error('Failed to fetch demographic data');
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Transform Scout Analytics data to demographic tree map format
const transformToDemographicData = (apiResponse: any): DemographicDataPoint[] => {
  try {
    // Get transaction data from the API response
    const transactions = apiResponse?.transactions?.data || [];
    
    if (transactions.length === 0) {
      return [];
    }

    // Analyze customer demographics from transaction data
    const demographicSegments: { [key: string]: {
      revenue: number;
      count: number;
      transactions: any[];
    } } = {};

    // Process transactions to extract demographic insights
    transactions.forEach((transaction: any) => {
      const demographics = extractDemographics(transaction);
      
      demographics.forEach(({ category, subcategory, segment }) => {
        const key = `${category}_${subcategory}_${segment}`;
        
        if (!demographicSegments[key]) {
          demographicSegments[key] = {
            revenue: 0,
            count: 0,
            transactions: []
          };
        }
        
        demographicSegments[key].revenue += transaction.total_amount || transaction.amount || 0;
        demographicSegments[key].count += 1;
        demographicSegments[key].transactions.push(transaction);
      });
    });

    // Convert to DemographicDataPoint format
    const demographicData: DemographicDataPoint[] = Object.entries(demographicSegments)
      .map(([key, data]) => {
        const [category, subcategory, segment] = key.split('_');
        
        // Calculate growth rate based on transaction timeline
        const growth = calculateGrowthRate(data.transactions);
        const avgSpend = data.count > 0 ? data.revenue / data.count : 0;
        
        return {
          id: key,
          name: segment,
          category,
          subcategory,
          value: data.count, // Using transaction count as primary value
          revenue: data.revenue,
          count: data.count,
          percentage: 0, // Will be calculated later
          avgSpend,
          growth
        };
      })
      .filter(item => item.count >= 2) // Filter out segments with too few transactions
      .sort((a, b) => b.value - a.value)
      .slice(0, 50); // Top 50 segments

    // Calculate percentages
    const totalValue = demographicData.reduce((sum, item) => sum + item.value, 0);
    demographicData.forEach(item => {
      item.percentage = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
    });

    return demographicData;
  } catch (error) {
    console.error('Error transforming demographic data:', error);
    return [];
  }
};

// Extract demographic insights from transaction data
const extractDemographics = (transaction: any): Array<{
  category: string;
  subcategory: string;
  segment: string;
}> => {
  const demographics: Array<{ category: string; subcategory: string; segment: string }> = [];
  
  // Age Group Analysis (based on customer_id patterns, product preferences, etc.)
  const ageGroup = inferAgeGroup(transaction);
  if (ageGroup) {
    demographics.push({
      category: 'age_group',
      subcategory: ageGroup.subcategory,
      segment: ageGroup.segment
    });
  }

  // Income Level Analysis (based on spending patterns)
  const incomeLevel = inferIncomeLevel(transaction);
  if (incomeLevel) {
    demographics.push({
      category: 'income_level',
      subcategory: incomeLevel.subcategory,
      segment: incomeLevel.segment
    });
  }

  // Location Analysis (based on store/region data)
  const location = inferLocation(transaction);
  if (location) {
    demographics.push({
      category: 'location',
      subcategory: location.subcategory,
      segment: location.segment
    });
  }

  // Lifestyle Analysis (based on product mix)
  const lifestyle = inferLifestyle(transaction);
  if (lifestyle) {
    demographics.push({
      category: 'lifestyle',
      subcategory: lifestyle.subcategory,
      segment: lifestyle.segment
    });
  }

  // Behavior Analysis (based on transaction patterns)
  const behavior = inferBehavior(transaction);
  if (behavior) {
    demographics.push({
      category: 'behavior',
      subcategory: behavior.subcategory,
      segment: behavior.segment
    });
  }

  return demographics;
};

// Infer age group from transaction data
const inferAgeGroup = (transaction: any) => {
  const amount = transaction.total_amount || transaction.amount || 0;
  const productName = (transaction.product_name || transaction.product || '').toLowerCase();
  
  // Tech-savvy products might indicate younger demographics
  if (productName.includes('energy') || productName.includes('red bull') || 
      productName.includes('monster') || productName.includes('gaming')) {
    return { subcategory: 'young_adult', segment: '18-25' };
  }
  
  // Premium brands might indicate middle-aged demographics
  if (amount > 500 || productName.includes('premium') || productName.includes('organic')) {
    return { subcategory: 'middle_age', segment: '26-40' };
  }
  
  // Family-oriented products
  if (productName.includes('family') || productName.includes('kids') || 
      productName.includes('baby') || productName.includes('milk')) {
    return { subcategory: 'family', segment: '30-45' };
  }
  
  // Default to adult category
  return { subcategory: 'adult', segment: '25-35' };
};

// Infer income level from spending patterns
const inferIncomeLevel = (transaction: any) => {
  const amount = transaction.total_amount || transaction.amount || 0;
  const quantity = transaction.quantity || 1;
  const avgItemPrice = amount / quantity;
  
  if (avgItemPrice > 300) {
    return { subcategory: 'high_income', segment: 'Premium Shoppers' };
  } else if (avgItemPrice > 150) {
    return { subcategory: 'middle_income', segment: 'Mid-tier Shoppers' };
  } else if (avgItemPrice > 50) {
    return { subcategory: 'lower_middle', segment: 'Value Shoppers' };
  } else {
    return { subcategory: 'budget', segment: 'Budget Shoppers' };
  }
};

// Infer location demographics
const inferLocation = (transaction: any) => {
  const location = transaction.region || transaction.location || transaction.store_location || '';
  
  if (location.toLowerCase().includes('metro') || location.toLowerCase().includes('manila') || 
      location.toLowerCase().includes('ncr')) {
    return { subcategory: 'urban', segment: 'Metro Manila' };
  } else if (location.toLowerCase().includes('cebu') || location.toLowerCase().includes('davao')) {
    return { subcategory: 'urban', segment: 'Major Cities' };
  } else if (location.toLowerCase().includes('region')) {
    return { subcategory: 'provincial', segment: 'Provincial Areas' };
  } else {
    return { subcategory: 'suburban', segment: 'Suburban Areas' };
  }
};

// Infer lifestyle from product preferences
const inferLifestyle = (transaction: any) => {
  const productName = (transaction.product_name || transaction.product || '').toLowerCase();
  
  if (productName.includes('organic') || productName.includes('natural') || 
      productName.includes('healthy') || productName.includes('fitness')) {
    return { subcategory: 'health_conscious', segment: 'Health & Wellness' };
  } else if (productName.includes('luxury') || productName.includes('premium') || 
             productName.includes('imported')) {
    return { subcategory: 'luxury', segment: 'Luxury Seekers' };
  } else if (productName.includes('family') || productName.includes('bulk') || 
             productName.includes('economy')) {
    return { subcategory: 'family_oriented', segment: 'Family Focused' };
  } else if (productName.includes('convenience') || productName.includes('ready') || 
             productName.includes('instant')) {
    return { subcategory: 'convenience', segment: 'Convenience Seekers' };
  } else {
    return { subcategory: 'mainstream', segment: 'Mainstream Shoppers' };
  }
};

// Infer behavior patterns
const inferBehavior = (transaction: any) => {
  const amount = transaction.total_amount || transaction.amount || 0;
  const quantity = transaction.quantity || 1;
  const hour = new Date(transaction.date || transaction.timestamp).getHours();
  
  // High-value, low-quantity might indicate impulse buying
  if (amount > 200 && quantity <= 2) {
    return { subcategory: 'impulse', segment: 'Impulse Buyers' };
  }
  
  // High quantity might indicate bulk buyers
  if (quantity >= 5) {
    return { subcategory: 'bulk', segment: 'Bulk Buyers' };
  }
  
  // Time-based behavior
  if (hour >= 6 && hour <= 9) {
    return { subcategory: 'morning', segment: 'Morning Shoppers' };
  } else if (hour >= 17 && hour <= 20) {
    return { subcategory: 'evening', segment: 'Evening Shoppers' };
  } else if (hour >= 12 && hour <= 14) {
    return { subcategory: 'lunch', segment: 'Lunch Shoppers' };
  } else {
    return { subcategory: 'regular', segment: 'Regular Shoppers' };
  }
};

// Calculate growth rate for a set of transactions
const calculateGrowthRate = (transactions: any[]): number => {
  if (transactions.length < 2) return 0;
  
  // Sort transactions by date
  const sortedTxns = transactions.sort((a, b) => 
    new Date(a.date || a.timestamp).getTime() - new Date(b.date || b.timestamp).getTime()
  );
  
  // Split into two periods
  const halfPoint = Math.floor(sortedTxns.length / 2);
  const olderPeriod = sortedTxns.slice(0, halfPoint);
  const recentPeriod = sortedTxns.slice(halfPoint);
  
  if (olderPeriod.length === 0 || recentPeriod.length === 0) return 0;
  
  // Calculate average revenue for each period
  const olderAvg = olderPeriod.reduce((sum, t) => 
    sum + (t.total_amount || t.amount || 0), 0) / olderPeriod.length;
  const recentAvg = recentPeriod.reduce((sum, t) => 
    sum + (t.total_amount || t.amount || 0), 0) / recentPeriod.length;
  
  // Calculate growth rate
  return olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;
};