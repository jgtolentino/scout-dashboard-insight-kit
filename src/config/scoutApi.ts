// Scout Analytics API adapter
import { API_BASE_URL } from './api';

interface ScoutApiClient {
  getAnalytics: (filters?: Record<string, any>) => Promise<any>;
  authenticate: () => Promise<string>;
}

class ScoutAnalyticsClient implements ScoutApiClient {
  private token: string | null = null;

  async authenticate(): Promise<string> {
    if (this.token) return this.token;

    // Bypass authentication in development if flag is set
    if (import.meta.env.VITE_DISABLE_AUTH === 'true') {
      console.warn('⚠️ Auth disabled in development mode');
      this.token = 'dev-token';
      return this.token;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'demo@scout.com',
          password: 'demo123'
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Authentication failed');
      }

      this.token = data.token;
      return this.token;
    } catch (error) {
      console.error('Scout API authentication failed:', error);
      throw error;
    }
  }

  async getAnalytics(filters: Record<string, any> = {}): Promise<any> {
    const token = await this.authenticate();

    const queryParams = new URLSearchParams();
    
    // Map filters to Scout Analytics API format
    if (filters.from) queryParams.set('from', filters.from);
    if (filters.to) queryParams.set('to', filters.to);
    if (filters.stores?.length) queryParams.set('region', filters.stores[0]); // Map store to region
    if (filters.period) queryParams.set('period', filters.period);
    
    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/scout/analytics${queryString ? `?${queryString}` : ''}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        // Token might be expired, try refreshing
        if (response.status === 401) {
          this.token = null;
          const newToken = await this.authenticate();
          
          const retryResponse = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${newToken}`
            }
          });
          
          if (!retryResponse.ok) {
            throw new Error(`HTTP ${retryResponse.status}: ${retryResponse.statusText}`);
          }
          
          return retryResponse.json();
        }
        
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Scout API call failed:', error);
      
      // Return mock data as fallback
      return {
        data: {
          summary: {
            totalTransactions: 18247,
            totalRevenue: 2847392,
            avgOrderValue: 156.03
          },
          categories: [
            { category: 'Beverages', transactions: 5234, revenue: 812456, percentage: 28.5 },
            { category: 'Food & Snacks', transactions: 4123, revenue: 689234, percentage: 24.2 },
            { category: 'Personal Care', transactions: 3456, revenue: 532891, percentage: 18.7 },
            { category: 'Household Items', transactions: 2789, revenue: 435678, percentage: 15.3 },
            { category: 'Others', transactions: 2645, revenue: 378123, percentage: 13.3 }
          ],
          regions: [
            { name: 'NCR', transactions: 8456, revenue: 2400000, growth: 12.3 },
            { name: 'Cebu', transactions: 3234, revenue: 1800000, growth: 8.7 },
            { name: 'Davao', transactions: 2891, revenue: 1200000, growth: 15.2 },
            { name: 'Iloilo', transactions: 1876, revenue: 800000, growth: -2.1 },
            { name: 'Baguio', transactions: 1790, revenue: 600000, growth: 5.4 }
          ]
        }
      };
    }
  }
}

export const scoutApi = new ScoutAnalyticsClient();
export default scoutApi;