import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '@/config/api';

export interface RetailBotAction {
  id: string;
  title: string;
  description: string;
  confidence: number;
  category: 'pricing' | 'promotion' | 'inventory' | 'ops';
  filters?: Record<string, any>;
}

export interface RetailBotResponse {
  actions: RetailBotAction[];
  diagnostics: {
    data_quality: 'good' | 'warn' | 'bad';
    response_time_ms: number;
    model_used: string;
    filters_applied: number;
  };
  query: string;
  timestamp: string;
}

export const useRetailBot = (query: string, filters: Record<string, any> = {}, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['retailbot', query, filters],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/retailbot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          filters
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch RetailBot response');
      }
      
      return response.json() as Promise<RetailBotResponse>;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};