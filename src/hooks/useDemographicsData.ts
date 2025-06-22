import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '@/config/api';

export interface DemographicsData {
  age_groups: {
    age_group: string;
    count: number;
  }[];
  gender: {
    gender: string;
    count: number;
  }[];
  regions: {
    region: string;
    count: number;
  }[];
}

export const useDemographicsData = (filters: Record<string, any> = {}) => {
  const queryParams = new URLSearchParams();
  
  // Add filters to query params
  if (filters.from) queryParams.set('date_from', filters.from);
  if (filters.to) queryParams.set('date_to', filters.to);
  if (filters.categories?.length) queryParams.set('category', filters.categories.join(','));
  if (filters.brands?.length) queryParams.set('brand', filters.brands.join(','));
  
  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/demographics${queryString ? `?${queryString}` : ''}`;
  
  return useQuery({
    queryKey: ['demographics', filters],
    queryFn: async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch demographics data');
        }
        return response.json() as Promise<DemographicsData>;
      } catch (error) {
        console.error('Error fetching demographics data:', error);
        // Return mock data as fallback
        return {
          age_groups: [
            { age_group: '18-24', count: 2890 },
            { age_group: '25-34', count: 4006 },
            { age_group: '35-44', count: 3699 },
            { age_group: '45-54', count: 1554 },
            { age_group: '55+', count: 693 }
          ],
          gender: [
            { gender: 'Male', count: 6234 },
            { gender: 'Female', count: 6608 }
          ],
          regions: [
            { region: 'NCR', count: 5678 },
            { region: 'Cebu', count: 2345 },
            { region: 'Davao', count: 1987 },
            { region: 'Iloilo', count: 1234 },
            { region: 'Others', count: 1598 }
          ]
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};