import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '@/config/api';

export interface AIInsight {
  id?: string;
  title: string;
  description: string;
  type: string;
  confidence: number;
  impact?: string;
  action_items?: string[];
}

export interface AIInsightsResponse {
  insights: AIInsight[];
  query?: string;
  model?: string;
  timestamp?: string;
}

export const useAIInsights = (filters: Record<string, any> = {}, query: string = 'Generate insights from current data') => {
  return useQuery({
    queryKey: ['ai-insights', filters, query],
    queryFn: async () => {
      try {
        // Call the real API
        const response = await fetch(`${API_BASE_URL}/ask`, {
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
          throw new Error('Failed to fetch AI insights');
        }
        
        return response.json() as Promise<AIInsightsResponse>;
      } catch (error) {
        console.error('Error fetching AI insights:', error);
        // Return empty insights array on error
        return { insights: [] };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};