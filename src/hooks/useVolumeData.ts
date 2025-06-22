import { useQuery } from '@tanstack/react-query';
import { scoutApi } from '@/config/scoutApi';

export interface VolumeData {
  hourly: {
    hour: string;
    volume: number;
  }[];
  daily: {
    date: string;
    volume: number;
  }[];
}

export const useVolumeData = (filters: Record<string, any> = {}) => {
  return useQuery({
    queryKey: ['volume', filters],
    queryFn: async () => {
      try {
        const data = await scoutApi.getAnalytics(filters);
        
        // Transform Scout Analytics transaction data to volume format
        const transactions = data.data?.transactions || [];
        
        return {
          hourly: [],  // Not available in current API structure
          daily: transactions.map((item: any) => ({
            date: item.date || new Date().toISOString().split('T')[0],
            volume: item.transactions || item.amount || 0
          }))
        } as VolumeData;
      } catch (error) {
        console.error('Error fetching volume data:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};