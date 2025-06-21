import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '@/config/api';

export interface Transaction {
  transaction_id: string;
  timestamp: string;
  store_id: string;
  store_location: string;
  device_id: string;
  total_amount: number;
  payment_method: string;
  customer_id: string;
}

export interface TransactionResponse {
  data: Transaction[];
  total: number;
  offset: number;
  limit: number;
}

export const useTransactionData = (filters: Record<string, any> = {}) => {
  const queryParams = new URLSearchParams();
  
  // Add filters to query params
  if (filters.from) queryParams.set('from_date', filters.from);
  if (filters.to) queryParams.set('to_date', filters.to);
  if (filters.stores?.length) queryParams.set('store_id', filters.stores.join(','));
  if (filters.limit) queryParams.set('limit', filters.limit.toString());
  if (filters.offset) queryParams.set('offset', filters.offset.toString());
  
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