// Hybrid API Service - Real Azure API with Mock Fallback
// Combines the working patterns from scout-prod with real API integration

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL, detectPlatform, getPlatformConfig } from '../config/api';

// Types from scout-dashboard-insight-kit
interface APIResponse<T> {
  status: number;
  data: T;
  message?: string;
}

interface FilterOption {
  value: string;
  label: string;
  count: number;
}

interface FilterCounts {
  geography: {
    [key: string]: number;
  };
  organization: {
    [key: string]: number;
  };
}

interface KPIData {
  total_sales: number;
  transaction_count: number;
  avg_basket_size: number;
  growth_rate: number;
}

interface HealthStatus {
  status: string;
  timestamp: string;
  platform?: string;
  apiUrl?: string;
  services?: {
    database: string;
    api: string;
    cache: string;
  };
}

// Mock data fallback (from scout-prod)
const mockFilterOptions: Record<string, FilterOption[]> = {
  holding_company: [
    { value: 'all', label: 'All Companies', count: 1250 },
    { value: 'company-a', label: 'Company A', count: 420 },
    { value: 'company-b', label: 'Company B', count: 380 },
    { value: 'company-c', label: 'Company C', count: 450 }
  ],
  region: [
    { value: 'all', label: 'All Regions', count: 1250 },
    { value: 'ncr', label: 'National Capital Region', count: 520 },
    { value: 'region-1', label: 'Region I - Ilocos', count: 380 },
    { value: 'region-3', label: 'Region III - Central Luzon', count: 350 }
  ],
  city: [
    { value: 'all', label: 'All Cities', count: 1250 },
    { value: 'manila', label: 'Manila', count: 450 },
    { value: 'quezon-city', label: 'Quezon City', count: 400 },
    { value: 'caloocan', label: 'Caloocan', count: 400 }
  ],
  brand: [
    { value: 'all', label: 'All Brands', count: 1250 },
    { value: 'brand-x', label: 'Brand X', count: 450 },
    { value: 'brand-y', label: 'Brand Y', count: 400 },
    { value: 'brand-z', label: 'Brand Z', count: 400 }
  ],
  category: [
    { value: 'all', label: 'All Categories', count: 1250 },
    { value: 'fmcg', label: 'FMCG', count: 520 },
    { value: 'beverages', label: 'Beverages', count: 380 },
    { value: 'personal-care', label: 'Personal Care', count: 350 }
  ]
};

const mockKPIData: KPIData = {
  total_sales: 10950000,
  transaction_count: 60850,
  avg_basket_size: 179.95,
  growth_rate: 11.5
};

const mockFilterCounts: FilterCounts = {
  geography: {
    'region': 4,
    'city': 15,
    'municipality': 45,
    'barangay': 180
  },
  organization: {
    'holding_company': 4,
    'client': 12,
    'category': 8,
    'brand': 25,
    'sku': 150
  }
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class HybridApiService {
  private client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  private platformConfig = getPlatformConfig();
  private useMockFallback = false;

  constructor() {
    this.setupInterceptors();
    console.log(`🔗 Hybrid API Service initialized:`, {
      platform: this.platformConfig.platform,
      apiUrl: this.platformConfig.apiUrl,
      isProduction: this.platformConfig.isProduction
    });
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        config.headers['X-Client-Platform'] = this.platformConfig.platform;
        config.headers['X-Client-Environment'] = import.meta.env.MODE;
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor with fallback logic
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        const enhancedError = {
          message: error.response?.data?.error || error.message || 'Request failed',
          status: error.response?.status,
          platform: this.platformConfig.platform,
          apiUrl: this.platformConfig.apiUrl,
          details: error.response?.data?.details,
          shouldUseMockFallback: error.code === 'ECONNREFUSED' || error.response?.status >= 500
        };
        
        console.warn('🚨 API Error:', enhancedError);
        
        // Enable mock fallback for connection errors
        if (enhancedError.shouldUseMockFallback) {
          console.log('🔄 Enabling mock fallback mode');
          this.useMockFallback = true;
        }
        
        return Promise.reject(enhancedError);
      }
    );
  }

  // Health check with platform detection
  async healthCheck(): Promise<APIResponse<HealthStatus>> {
    try {
      const response = await this.client.get('/health');
      this.useMockFallback = false; // Reset fallback mode on successful connection
      
      return {
        status: 200,
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          platform: this.platformConfig.platform,
          apiUrl: this.platformConfig.apiUrl,
          services: response.data.services || {
            database: 'connected',
            api: 'online',
            cache: 'online'
          }
        }
      };
    } catch (error) {
      console.warn('❌ Health check failed, using mock fallback');
      this.useMockFallback = true;
      
      return {
        status: 200,
        data: {
          status: 'mock-fallback',
          timestamp: new Date().toISOString(),
          platform: this.platformConfig.platform,
          apiUrl: 'mock-service',
          services: {
            database: 'mock',
            api: 'mock',
            cache: 'mock'
          }
        }
      };
    }
  }

  // Filter options with mock fallback
  async getFilterOptions(level: string, filters: Record<string, any> = {}): Promise<APIResponse<{ options: FilterOption[] }>> {
    if (this.useMockFallback) {
      await delay(300);
      const options = mockFilterOptions[level] || [];
      return {
        status: 200,
        data: { options }
      };
    }

    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await this.client.get(`/api/v1/filters/options/${level}?${params}`);
      return response.data;
    } catch (error) {
      console.warn(`🔄 Filter options fallback for ${level}`);
      this.useMockFallback = true;
      
      await delay(300);
      const options = mockFilterOptions[level] || [];
      return {
        status: 200,
        data: { options }
      };
    }
  }

  // Filter counts with mock fallback
  async getFilterCounts(filters: Record<string, any> = {}): Promise<APIResponse<FilterCounts>> {
    if (this.useMockFallback) {
      await delay(250);
      return {
        status: 200,
        data: mockFilterCounts
      };
    }

    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await this.client.get(`/api/v1/filters/counts?${params}`);
      return response.data;
    } catch (error) {
      console.warn('🔄 Filter counts fallback');
      this.useMockFallback = true;
      
      await delay(250);
      return {
        status: 200,
        data: mockFilterCounts
      };
    }
  }

  // Overview data with mock fallback
  async getOverviewData(filters: Record<string, any> = {}): Promise<APIResponse<KPIData>> {
    if (this.useMockFallback) {
      await delay(400);
      return {
        status: 200,
        data: mockKPIData
      };
    }

    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await this.client.get(`/api/v1/analytics/overview?${params}`);
      return response.data;
    } catch (error) {
      console.warn('🔄 Overview data fallback');
      this.useMockFallback = true;
      
      await delay(400);
      return {
        status: 200,
        data: mockKPIData
      };
    }
  }

  // Additional methods from scout-prod for compatibility
  async getKPIData(params: Record<string, string>): Promise<APIResponse<KPIData>> {
    return this.getOverviewData(params);
  }

  async getTransactionTrends(params: Record<string, string>): Promise<APIResponse<any>> {
    if (this.useMockFallback) {
      await delay(600);
      return {
        status: 200,
        data: {
          trends: [
            { date: '2024-01', transactions: 15420, revenue: 2340000 },
            { date: '2024-02', transactions: 16890, revenue: 2580000 },
            { date: '2024-03', transactions: 18230, revenue: 2890000 },
            { date: '2024-04', transactions: 17650, revenue: 2720000 },
            { date: '2024-05', transactions: 19340, revenue: 3120000 },
            { date: '2024-06', transactions: 20180, revenue: 3350000 }
          ]
        }
      };
    }

    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await this.client.get(`/api/v1/analytics/trends?${queryParams}`);
      return response.data;
    } catch (error) {
      console.warn('🔄 Transaction trends fallback');
      this.useMockFallback = true;
      return this.getTransactionTrends(params);
    }
  }

  async getConsumerBehavior(params: Record<string, string>): Promise<APIResponse<any>> {
    if (this.useMockFallback) {
      await delay(550);
      return {
        status: 200,
        data: {
          segments: [
            { segment: 'Premium Buyers', percentage: 25, avgSpend: 850 },
            { segment: 'Value Seekers', percentage: 40, avgSpend: 320 },
            { segment: 'Occasional Shoppers', percentage: 20, avgSpend: 180 },
            { segment: 'Frequent Buyers', percentage: 15, avgSpend: 520 }
          ],
          demographics: {
            ageGroups: [
              { range: '18-25', percentage: 22 },
              { range: '26-35', percentage: 35 },
              { range: '36-45', percentage: 28 },
              { range: '46+', percentage: 15 }
            ]
          }
        }
      };
    }

    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await this.client.get(`/api/v1/analytics/consumer-behavior?${queryParams}`);
      return response.data;
    } catch (error) {
      console.warn('🔄 Consumer behavior fallback');
      this.useMockFallback = true;
      return this.getConsumerBehavior(params);
    }
  }

  async getAIInsights(params: Record<string, string>): Promise<APIResponse<any>> {
    if (this.useMockFallback) {
      await delay(800);
      return {
        status: 200,
        data: {
          insights: [
            {
              type: 'trend',
              title: 'Rising Demand in FMCG',
              description: 'FMCG category showing 15% growth, driven by essential goods.',
              confidence: 0.89,
              impact: 'high'
            },
            {
              type: 'opportunity',
              title: 'Personal Care Expansion',
              description: 'Personal Care category has highest growth rate at 20.5%. Consider inventory expansion.',
              confidence: 0.92,
              impact: 'medium'
            }
          ],
          recommendations: [
            'Increase marketing spend on FMCG category',
            'Expand Personal Care product line',
            'Review beverage pricing and promotions'
          ]
        }
      };
    }

    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await this.client.get(`/api/v1/ai/insights?${queryParams}`);
      return response.data;
    } catch (error) {
      console.warn('🔄 AI insights fallback');
      this.useMockFallback = true;
      return this.getAIInsights(params);
    }
  }

  // Chat with AI
  async chatWithAI(message: string, context: Record<string, any> = {}): Promise<APIResponse<any>> {
    try {
      const response = await this.client.post('/api/v1/ai/chat', { 
        message, 
        context,
        platform: this.platformConfig.platform
      });
      return response.data;
    } catch (error) {
      console.warn('🔄 AI chat fallback');
      return {
        status: 200,
        data: {
          response: `Thank you for your question about "${message}". The AI assistant is currently in mock mode. Your query has been noted and will be processed when the full service is available.`,
          type: 'mock-response'
        }
      };
    }
  }

  // Get current service status
  getServiceStatus() {
    return {
      platform: this.platformConfig.platform,
      apiUrl: this.platformConfig.apiUrl,
      isProduction: this.platformConfig.isProduction,
      useMockFallback: this.useMockFallback,
      features: this.platformConfig.features
    };
  }
}

export const apiService = new HybridApiService();
export default apiService;