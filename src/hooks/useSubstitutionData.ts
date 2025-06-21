import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '@/config/api';

export interface SubstitutionItem {
  original_product_id: string;
  substitute_product_id: string;
  transaction_id: string;
  reason: string;
  count?: number;
  from_brand?: string;
  to_brand?: string;
}

export interface SubstitutionResponse {
  data: SubstitutionItem[];
}

export const useSubstitutionData = (filters: Record<string, any> = {}) => {
  const queryParams = new URLSearchParams();
  
  // Add filters to query params
  if (filters.from) queryParams.set('from_date', filters.from);
  if (filters.to) queryParams.set('to_date', filters.to);
  if (filters.categories?.length) queryParams.set('category', filters.categories.join(','));
  if (filters.brands?.length) queryParams.set('brand', filters.brands.join(','));
  
  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/substitution${queryString ? `?${queryString}` : ''}`;
  
  return useQuery({
    queryKey: ['substitution', filters],
    queryFn: async () => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch substitution data');
      }
      return response.json() as Promise<SubstitutionResponse>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};