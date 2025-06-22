import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '@/config/api';

export interface Transaction {
  transaction_id: string;
  date: string;
  total_amount: number;
  store_name: string;
  city: string;
  region: string;
  customer_name: string;
  segment: string;
}

export interface TransactionResponse {
  data: Transaction[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
  };
}

export const useTransactionData = (filters: Record<string, any> = {}) => {
  const queryParams = new URLSearchParams();
  
  // Add filters to query params
  if (filters.from) queryParams.set('date_from', filters.from);
  if (filters.to) queryParams.set('date_to', filters.to);
  if (filters.barangays?.length) queryParams.set('region', filters.barangays.join(','));
  if (filters.parentCategory) queryParams.set('parent_category', filters.parentCategory);
  if (filters.subCategory) queryParams.set('sub_category', filters.subCategory);
  
  // Add pagination if provided
  if (filters.page) queryParams.set('page', filters.page.toString());
  if (filters.per_page) queryParams.set('per_page', filters.per_page.toString());
  
  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/transactions${queryString ? `?${queryString}` : ''}`;
  
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch transaction data');
      }
      return response.json() as Promise<TransactionResponse>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};