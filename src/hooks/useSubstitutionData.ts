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
        // In a real implementation, this would fetch from the Scout Analytics API
        // For now, we'll return realistic mock data based on FMCG retail patterns
        
        const mockSubstitutionData: SubstitutionDataPoint[] = [
          // Beverages substitutions
          {
            source: "Coca-Cola Regular",
            target: "Pepsi Cola",
            value: 2450,
            frequency: 1820,
            revenue: 156750,
            substitutionRate: 12.8
          },
          {
            source: "Coca-Cola Regular",
            target: "Coca-Cola Zero",
            value: 1890,
            frequency: 1340,
            revenue: 121200,
            substitutionRate: 9.6
          },
          {
            source: "Pepsi Cola",
            target: "Coca-Cola Regular",
            value: 1650,
            frequency: 1120,
            revenue: 105600,
            substitutionRate: 8.4
          },
          {
            source: "Sprite",
            target: "7-Up",
            value: 980,
            frequency: 720,
            revenue: 62720,
            substitutionRate: 6.2
          },
          {
            source: "Red Bull",
            target: "Monster Energy",
            value: 1320,
            frequency: 890,
            revenue: 184800,
            substitutionRate: 15.4
          },
          
          // Snacks substitutions
          {
            source: "Lay's Chips",
            target: "Pringles",
            value: 1740,
            frequency: 1280,
            revenue: 139200,
            substitutionRate: 11.3
          },
          {
            source: "Oreo Cookies",
            target: "Chips Ahoy",
            value: 1560,
            frequency: 1140,
            revenue: 124800,
            substitutionRate: 10.1
          },
          {
            source: "Kit Kat",
            target: "Snickers",
            value: 1230,
            frequency: 920,
            revenue: 98400,
            substitutionRate: 8.9
          },
          
          // Personal Care substitutions
          {
            source: "Head & Shoulders",
            target: "Pantene",
            value: 2100,
            frequency: 1450,
            revenue: 315000,
            substitutionRate: 14.2
          },
          {
            source: "Colgate Toothpaste",
            target: "Oral-B",
            value: 1680,
            frequency: 1200,
            revenue: 201600,
            substitutionRate: 12.6
          },
          {
            source: "Dove Soap",
            target: "Palmolive",
            value: 1420,
            frequency: 1050,
            revenue: 142000,
            substitutionRate: 9.8
          },
          
          // Household items substitutions
          {
            source: "Tide Detergent",
            target: "Ariel",
            value: 1890,
            frequency: 1320,
            revenue: 226800,
            substitutionRate: 13.7
          },
          {
            source: "Downy Fabric Softener",
            target: "Surf",
            value: 1340,
            frequency: 980,
            revenue: 160800,
            substitutionRate: 10.4
          },
          
          // Food staples substitutions
          {
            source: "Maggi Noodles",
            target: "Lucky Me",
            value: 3200,
            frequency: 2350,
            revenue: 224000,
            substitutionRate: 18.9
          },
          {
            source: "Del Monte Corned Beef",
            target: "Argentina Corned Beef",
            value: 1560,
            frequency: 1120,
            revenue: 187200,
            substitutionRate: 11.8
          },
          {
            source: "Nestle Coffee",
            target: "Nescafe 3-in-1",
            value: 2240,
            frequency: 1680,
            revenue: 179200,
            substitutionRate: 15.3
          }
        ];

        // Apply filters if provided
        let filteredData = mockSubstitutionData;

        // Filter by categories (simplified - in real implementation would use proper category mapping)
        if (filters.categories && filters.categories.length > 0) {
          filteredData = filteredData.filter(item => {
            const category = getCategoryFromProduct(item.source);
            return filters.categories!.includes(category);
          });
        }

        // Calculate summary statistics
        const summary = {
          totalSubstitutions: filteredData.reduce((sum, item) => sum + item.frequency, 0),
          totalRevenue: filteredData.reduce((sum, item) => sum + item.revenue, 0),
          avgSubstitutionRate: filteredData.reduce((sum, item) => sum + item.substitutionRate, 0) / filteredData.length,
          topSubstitution: filteredData.reduce((max, item) => 
            item.frequency > max.frequency ? item : max, 
            filteredData[0]
          ),
          uniqueProducts: new Set([
            ...filteredData.map(item => item.source),
            ...filteredData.map(item => item.target)
          ]).size
        };

        return {
          data: filteredData,
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