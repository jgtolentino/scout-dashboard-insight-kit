import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '@/config/api';

export interface CategoryMixItem {
  category: string;
  count: number;
  share: number;
  avg_price?: number;
  revenue?: number;
}

export interface CategoryMixResponse {
  data: CategoryMixItem[];
}

export const useCategoryMixData = (filters: Record<string, any> = {}) => {
  const queryParams = new URLSearchParams();
  
  // Add filters to query params
  if (filters.from) queryParams.set('from_date', filters.from);
  if (filters.to) queryParams.set('to_date', filters.to);
  if (filters.stores?.length) queryParams.set('store_id', filters.stores.join(','));
  
  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/category-mix${queryString ? `?${queryString}` : ''}`;
  
  return useQuery({
    queryKey: ['category-mix', filters],
    queryFn: async () => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch category mix data');
      }
      return response.json() as Promise<CategoryMixResponse>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};