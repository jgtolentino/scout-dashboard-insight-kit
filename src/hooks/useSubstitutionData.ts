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
  if (filters.from) queryParams.set('date_from', filters.from);
  if (filters.to) queryParams.set('date_to', filters.to);
  if (filters.categories?.length) queryParams.set('category', filters.categories.join(','));
  if (filters.brands?.length) queryParams.set('brand', filters.brands.join(','));
  
  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/substitution${queryString ? `?${queryString}` : ''}`;
  
  return useQuery({
    queryKey: ['substitution', filters],
    queryFn: async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch substitution data');
        }
        return response.json() as Promise<SubstitutionResponse>;
      } catch (error) {
        console.error('Error fetching substitution data:', error);
        // Return mock data as fallback
        return {
          data: [
            { original_product_id: '1', substitute_product_id: '2', transaction_id: '123', reason: 'Out of stock', from_brand: 'Coca-Cola', to_brand: 'Pepsi' },
            { original_product_id: '3', substitute_product_id: '4', transaction_id: '124', reason: 'Price preference', from_brand: 'Lucky Me', to_brand: 'Nissin' },
            { original_product_id: '5', substitute_product_id: '6', transaction_id: '125', reason: 'Brand loyalty', from_brand: 'Surf', to_brand: 'Tide' },
            { original_product_id: '7', substitute_product_id: '8', transaction_id: '126', reason: 'Out of stock', from_brand: 'San Miguel', to_brand: 'Red Horse' },
            { original_product_id: '9', substitute_product_id: '10', transaction_id: '127', reason: 'Price preference', from_brand: 'Nestle', to_brand: 'Alaska' }
          ]
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};