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
      // In mock mode, return simulated insights
      if (import.meta.env.VITE_USE_MOCKS === 'true') {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
        
        const mockInsights: AIInsight[] = [
          {
            title: "Peak Transaction Hours",
            description: "Peak transaction hours are between 6-8 PM, representing 23% of daily volume. Consider extending staff hours during this period.",
            confidence: 92,
            type: "Operations",
            impact: "High",
            action_items: ["Adjust staffing schedule", "Monitor inventory levels during peak hours"]
          },
          {
            title: "Regional Beverage Performance",
            description: "Beverages category shows 15% higher conversion rate in Metro Manila compared to other regions. Expand beverage promotions in this area.",
            confidence: 87,
            type: "Marketing",
            impact: "Medium",
            action_items: ["Launch targeted beverage campaigns", "Increase beverage shelf space in Metro Manila stores"]
          },
          {
            title: "Customer Age Group Analysis",
            description: "Customer age group 26-35 has the highest average order value (₱189) but represents only 31% of transactions. Target this segment for upselling.",
            confidence: 84,
            type: "Customer Insights",
            impact: "High",
            action_items: ["Create premium product bundles", "Implement loyalty program for this age group"]
          }
        ];
        
        // Filter insights based on current filters
        let filteredInsights = [...mockInsights];
        
        if (filters.categories?.length > 0) {
          const categoryFilter = filters.categories[0].toLowerCase();
          filteredInsights = filteredInsights.filter(insight => 
            insight.description.toLowerCase().includes(categoryFilter) ||
            insight.type === "Marketing"
          );
        }
        
        if (filters.barangays?.length > 0) {
          filteredInsights = filteredInsights.filter(insight => 
            insight.description.toLowerCase().includes("metro manila") ||
            insight.type === "Operations"
          );
        }
        
        // Always return at least one insight
        if (filteredInsights.length === 0) {
          filteredInsights = [mockInsights[0]];
        }
        
        return {
          insights: filteredInsights,
          query,
          model: "gpt-4",
          timestamp: new Date().toISOString()
        };
      }
      
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
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};