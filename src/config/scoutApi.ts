// Scout Analytics API adapter following Medallion Architecture
import { MEDALLION_LAYERS, ACCESS_CONFIG, isPublicAccess, validateDataGovernance } from './medallionConfig';

const API_BASE_URL = import.meta.env.VITE_SCOUT_API_URL || 'http://localhost:3002';

// Medallion architecture compliance check
const governanceCheck = validateDataGovernance();
if (!governanceCheck.compliant) {
  console.warn('⚠️ Data governance issues detected:', governanceCheck.issues);
}

interface ScoutApiClient {
  getAnalytics: (filters?: Record<string, any>) => Promise<any>;
  authenticate: () => Promise<string>;
}

class ScoutAnalyticsClient implements ScoutApiClient {
  private token: string | null = null;

  async authenticate(): Promise<string> {
    if (this.token) return this.token;

    // Skip authentication in development when using MSW
    if (import.meta.env.MODE === 'development') {
      console.warn('⚠️  Scout API authentication disabled in development mode (using MSW)');
      this.token = 'dev-mock-token-12345';
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
      console.error('Scout Analytics API call failed:', error);
      throw error;
    }
  }
}

export const scoutApi = new ScoutAnalyticsClient();
export default scoutApi;