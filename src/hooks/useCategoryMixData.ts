import { useQuery } from '@tanstack/react-query';
import { scoutApi } from '@/config/scoutApi';

export interface CategoryMixItem {
  category: string;
  count: number;
  share: number;
  color?: string;
}

export interface CategoryMixResponse {
  data: CategoryMixItem[];
  total: number;
}

export const useCategoryMixData = (filters: Record<string, any> = {}) => {
  return useQuery({
    queryKey: ['category-mix', filters],
    queryFn: async () => {
      try {
        const data = await scoutApi.getAnalytics(filters);
        
        // Add colors to categories for visualization
        const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00C49F', '#FFBB28', '#FF8042'];
        
        // Transform Scout Analytics data to expected format
        const transformedData = data.data?.categories?.map((item: any, index: number) => ({
          category: item.category || item.brand,
          count: item.transactions || 0,
          share: item.percentage || 0,
          color: colors[index % colors.length]
        })) || [];

        return {
          data: transformedData,
          total: transformedData.reduce((sum: number, item: any) => sum + item.count, 0)
        } as CategoryMixResponse;
      } catch (error) {
        console.error('Error fetching category mix data:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};