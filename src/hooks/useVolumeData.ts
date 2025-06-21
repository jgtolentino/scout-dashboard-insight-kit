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
  if (filters.from) queryParams.set('from_date', filters.from);
  if (filters.to) queryParams.set('to_date', filters.to);
  if (filters.stores?.length) queryParams.set('store_id', filters.stores.join(','));
  
  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/volume${queryString ? `?${queryString}` : ''}`;
  
  return useQuery({
    queryKey: ['volume', filters],
    queryFn: async () => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch volume data');
      }
      return response.json() as Promise<VolumeData>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};