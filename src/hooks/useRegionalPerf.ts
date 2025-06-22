import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '@/config/api';

export interface RegionalData {
  name: string;
  value: number;
  color?: string;
  percentage?: string;
  geometry?: any;
}

export const useRegionalPerf = (filters: Record<string, any> = {}) => {
  const queryParams = new URLSearchParams();
  
  // Add filters to query params
  if (filters.from) queryParams.set('date_from', filters.from);
  if (filters.to) queryParams.set('date_to', filters.to);
  if (filters.categories?.length) queryParams.set('category', filters.categories.join(','));
  if (filters.brands?.length) queryParams.set('brand', filters.brands.join(','));
  
  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/regions${queryString ? `?${queryString}` : ''}`;
  
  return useQuery({
    queryKey: ['regions', filters],
    queryFn: async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch regional data');
        }
        
        const data = await response.json();
        
        // Process the data to include colors based on value
        const processedData = data.data.map((region: any) => {
          const value = region.revenue || region.count || 0;
          return {
            name: region.name,
            value,
            color: getRegionColor(value),
            percentage: region.growth ? `${region.growth > 0 ? '+' : ''}${region.growth}%` : undefined,
            // If the API returns geometry, include it
            geometry: region.geometry
          };
        });
        
        return processedData;
      } catch (error) {
        console.error('Error fetching regional data:', error);
        // Return mock data as fallback
        return [
          { name: 'NCR', value: 2400000, percentage: '+12.3%', color: '#1e40af' },
          { name: 'Cebu', value: 1800000, percentage: '+8.7%', color: '#3b82f6' },
          { name: 'Davao', value: 1200000, percentage: '+15.2%', color: '#60a5fa' },
          { name: 'Iloilo', value: 800000, percentage: '-2.1%', color: '#93c5fd' },
          { name: 'Baguio', value: 600000, percentage: '+5.4%', color: '#dbeafe' }
        ];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Function to get color based on value
function getRegionColor(value: number): string {
  if (value > 1000000) return '#1e40af'; // dark blue
  if (value > 750000) return '#3b82f6'; // medium blue
  if (value > 500000) return '#60a5fa'; // light blue
  if (value > 250000) return '#93c5fd'; // lighter blue
  return '#dbeafe'; // very light blue
}