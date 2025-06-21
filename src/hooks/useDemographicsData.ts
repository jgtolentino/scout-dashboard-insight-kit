import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '@/config/api';

export interface DemographicsData {
  age_groups: {
    age_group: string;
    count: number;
  }[];
  gender: {
    gender: string;
    count: number;
  }[];
  regions: {
    region: string;
    count: number;
  }[];
}

export const useDemographicsData = (filters: Record<string, any> = {}) => {
  const queryParams = new URLSearchParams();
  
  // Add filters to query params
  if (filters.from) queryParams.set('from_date', filters.from);
  if (filters.to) queryParams.set('to_date', filters.to);
  if (filters.categories?.length) queryParams.set('category', filters.categories.join(','));
  if (filters.brands?.length) queryParams.set('brand', filters.brands.join(','));
  
  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/demographics${queryString ? `?${queryString}` : ''}`;
  
  return useQuery({
    queryKey: ['demographics', filters],
    queryFn: async () => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch demographics data');
      }
      return response.json() as Promise<DemographicsData>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};