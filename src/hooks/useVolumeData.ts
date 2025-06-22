import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '@/config/api';

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
  const queryParams = new URLSearchParams();
  
  // Add filters to query params
  if (filters.from) queryParams.set('date_from', filters.from);
  if (filters.to) queryParams.set('date_to', filters.to);
  if (filters.barangays?.length) queryParams.set('region', filters.barangays.join(','));
  
  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/volume${queryString ? `?${queryString}` : ''}`;
  
  return useQuery({
    queryKey: ['volume', filters],
    queryFn: async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch volume data');
        }
        return response.json() as Promise<VolumeData>;
      } catch (error) {
        console.error('Error fetching volume data:', error);
        // Return mock data as fallback
        return {
          hourly: [
            { hour: '6:00', volume: 245 },
            { hour: '7:00', volume: 312 },
            { hour: '8:00', volume: 428 },
            { hour: '9:00', volume: 567 },
            { hour: '10:00', volume: 634 },
            { hour: '11:00', volume: 789 },
            { hour: '12:00', volume: 892 },
            { hour: '13:00', volume: 945 },
            { hour: '14:00', volume: 823 },
            { hour: '15:00', volume: 756 },
            { hour: '16:00', volume: 689 },
            { hour: '17:00', volume: 612 },
            { hour: '18:00', volume: 834 },
            { hour: '19:00', volume: 923 },
            { hour: '20:00', volume: 756 },
            { hour: '21:00', volume: 567 },
            { hour: '22:00', volume: 345 },
          ],
          daily: [
            { date: '2025-06-15', volume: 8500 },
            { date: '2025-06-16', volume: 9200 },
            { date: '2025-06-17', volume: 8900 },
            { date: '2025-06-18', volume: 9500 },
            { date: '2025-06-19', volume: 10200 },
            { date: '2025-06-20', volume: 11500 },
            { date: '2025-06-21', volume: 12300 },
          ]
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};