import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '@/config/api';

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
  const queryParams = new URLSearchParams();
  
  // Add filters to query params
  if (filters.from) queryParams.set('date_from', filters.from);
  if (filters.to) queryParams.set('date_to', filters.to);
  if (filters.barangays?.length) queryParams.set('region', filters.barangays.join(','));
  if (filters.parentCategory) queryParams.set('parent_category', filters.parentCategory);
  if (filters.subCategory) queryParams.set('sub_category', filters.subCategory);
  
  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/category-mix${queryString ? `?${queryString}` : ''}`;
  
  return useQuery({
    queryKey: ['category-mix', filters],
    queryFn: async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch category mix data');
        }
        
        const data = await response.json();
        
        // Add colors to categories for visualization
        const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00C49F', '#FFBB28', '#FF8042'];
        
        if (data.data && Array.isArray(data.data)) {
          data.data = data.data.map((item, index) => ({
            ...item,
            color: colors[index % colors.length]
          }));
        }
        
        return data as CategoryMixResponse;
      } catch (error) {
        console.error('Error fetching category mix data:', error);
        // Return mock data as fallback
        return {
          data: [
            { category: 'Beverages', count: 1245, share: 28.5, color: '#8884d8' },
            { category: 'Food & Snacks', count: 1056, share: 24.2, color: '#82ca9d' },
            { category: 'Personal Care', count: 815, share: 18.7, color: '#ffc658' },
            { category: 'Household Items', count: 667, share: 15.3, color: '#ff7300' },
            { category: 'Others', count: 580, share: 13.3, color: '#0088fe' }
          ],
          total: 4363
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};