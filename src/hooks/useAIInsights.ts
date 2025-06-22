import { useQuery } from '@tanstack/react-query';
import { scoutApi } from '@/config/scoutApi';

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
        // Get real data from Scout Analytics API
        const data = await scoutApi.getAnalytics(filters);
        
        // Generate insights based on real data
        const insights: AIInsight[] = [
          {
            title: "Real Data Analysis",
            description: `Based on current data: ${data.data?.summary?.totalTransactions || 0} transactions with total revenue of ₱${(data.data?.summary?.totalRevenue || 0).toLocaleString()}`,
            confidence: 95,
            type: "Data Summary",
            impact: "High",
            action_items: ["Review performance metrics", "Analyze trends"]
          }
        ];
        
        // Add category insights if available
        if (data.data?.categories?.length > 0) {
          const topCategory = data.data.categories[0];
          insights.push({
            title: `Top Category Performance`,
            description: `${topCategory.category || topCategory.brand} leads with ${topCategory.transactions || 0} transactions generating ₱${(topCategory.revenue || topCategory.amount || 0).toLocaleString()}`,
            confidence: 88,
            type: "Category Analysis",
            impact: "Medium",
            action_items: ["Focus on top performers", "Optimize inventory for leading categories"]
          });
        }
        
        return {
          insights,
          query,
          model: "scout-analytics",
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        console.error('Error fetching AI insights:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};