import { useQuery } from '@tanstack/react-query';
import { scoutApi } from '@/config/scoutApi';

export interface RegionalPerformanceData {
  name: string;
  fullName: string;
  value: number;
  percentage: string;
  transactions: number;
  avgOrderValue: number;
  population?: number;
}

export interface RegionalPerformanceResponse {
  data: RegionalPerformanceData[];
  total: number;
  metric: string;
}

// Mapping between Scout Analytics region names and Philippines region codes
const REGION_MAPPING: Record<string, string> = {
  'NCR': 'NCR',
  'Metro Manila': 'NCR',
  'National Capital Region': 'NCR',
  'Cebu': 'Region VII',
  'Central Visayas': 'Region VII',
  'Davao': 'Region XI',
  'Davao Region': 'Region XI',
  'Iloilo': 'Region VI',
  'Western Visayas': 'Region VI',
  'Baguio': 'CAR',
  'Cordillera': 'CAR',
  'Cordillera Administrative Region': 'CAR'
};

// Philippines region full names
const REGION_FULL_NAMES: Record<string, string> = {
  'NCR': 'National Capital Region',
  'Region I': 'Ilocos Region',
  'Region II': 'Cagayan Valley',
  'Region III': 'Central Luzon',
  'Region IV-A': 'CALABARZON',
  'Region IV-B': 'MIMAROPA',
  'Region V': 'Bicol Region',
  'Region VI': 'Western Visayas',
  'Region VII': 'Central Visayas',
  'Region VIII': 'Eastern Visayas',
  'Region IX': 'Zamboanga Peninsula',
  'Region X': 'Northern Mindanao',
  'Region XI': 'Davao Region',
  'Region XII': 'SOCCSKSARGEN',
  'Region XIII': 'Caraga',
  'BARMM': 'Bangsamoro Autonomous Region',
  'CAR': 'Cordillera Administrative Region'
};

export const useRegionalPerformanceData = (
  filters: Record<string, any> = {},
  metric: 'revenue' | 'transactions' | 'growth' = 'revenue'
) => {
  return useQuery({
    queryKey: ['regional-performance', filters, metric],
    queryFn: async () => {
      try {
        const data = await scoutApi.getAnalytics(filters);
        
        // Transform Scout Analytics regional data
        const regionsData = data.data?.regions || [];
        const totalValue = regionsData.reduce((sum: number, item: any) => sum + (item.revenue || item.amount || 0), 0);
        
        // Map Scout Analytics regions to Philippines regions
        const transformedData: RegionalPerformanceData[] = regionsData.map((item: any) => {
          const scoutRegion = item.region || item.name;
          const regionCode = REGION_MAPPING[scoutRegion] || scoutRegion;
          const fullName = REGION_FULL_NAMES[regionCode] || scoutRegion;
          
          let value = 0;
          switch (metric) {
            case 'revenue':
              value = item.revenue || item.amount || 0;
              break;
            case 'transactions':
              value = item.transactions || 0;
              break;
            case 'growth': {
              // Calculate actual growth rate from historical data
              // This would require time-series analysis of the data
              // For now, calculate based on recent vs older transactions
              const recentRevenue = item.revenue || item.amount || 0;
              const transactions = response?.transactions?.data || [];
              const regionalTransactions = transactions.filter((t: any) => 
                (t.region === scoutRegion || t.location?.includes(scoutRegion))
              );
              
              if (regionalTransactions.length > 1) {
                // Sort by date and compare recent vs older periods
                const sortedTxns = regionalTransactions.sort((a: any, b: any) => 
                  new Date(b.date || b.timestamp).getTime() - new Date(a.date || a.timestamp).getTime()
                );
                
                const halfPoint = Math.floor(sortedTxns.length / 2);
                const recentPeriod = sortedTxns.slice(0, halfPoint);
                const olderPeriod = sortedTxns.slice(halfPoint);
                
                const recentAvg = recentPeriod.reduce((sum: number, t: any) => 
                  sum + (t.total_amount || t.amount || 0), 0) / recentPeriod.length;
                const olderAvg = olderPeriod.reduce((sum: number, t: any) => 
                  sum + (t.total_amount || t.amount || 0), 0) / olderPeriod.length;
                
                value = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;
              } else {
                value = 0;
              }
              break;
            }
          }
          
          const percentage = totalValue > 0 ? ((value / totalValue) * 100).toFixed(1) + '%' : '0%';
          
          return {
            name: regionCode,
            fullName,
            value,
            percentage,
            transactions: item.transactions || 0,
            avgOrderValue: item.avgOrderValue || 0
          };
        });
        
        // Add regions with no data as zero values
        Object.keys(REGION_FULL_NAMES).forEach(regionCode => {
          if (!transformedData.find(d => d.name === regionCode)) {
            transformedData.push({
              name: regionCode,
              fullName: REGION_FULL_NAMES[regionCode],
              value: 0,
              percentage: '0%',
              transactions: 0,
              avgOrderValue: 0
            });
          }
        });
        
        return {
          data: transformedData,
          total: totalValue,
          metric: metric.charAt(0).toUpperCase() + metric.slice(1)
        } as RegionalPerformanceResponse;
        
      } catch (error) {
        console.error('Error fetching regional performance data:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};