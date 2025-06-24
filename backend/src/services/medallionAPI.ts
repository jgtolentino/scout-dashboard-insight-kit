import { DefaultAzureCredential } from '@azure/identity';
import axios, { AxiosInstance } from 'axios';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

// Import bypass utilities for auth fallback
interface MockCredential {
  getToken: () => Promise<{ token: string; expiresOnTimestamp: number }>;
}

function shouldBypassAuth(): boolean {
  return process.env.VITE_BYPASS_AZURE_AUTH === 'true' || 
         process.env.VITE_USE_MOCKS === 'true' ||
         process.env.NODE_ENV === 'development';
}

function createMockCredential(): MockCredential {
  return {
    getToken: async () => ({
      token: process.env.MOCK_AZURE_TOKEN || 'mock-azure-token-dev',
      expiresOnTimestamp: Date.now() + 3600000 // 1 hour
    })
  };
}

export interface FilterContext {
  region?: string;
  city?: string;
  municipality?: string;
  barangay?: string;
  location?: string;
  holding_company?: string;
  client?: string;
  category?: string;
  brand?: string;
  sku?: string;
  year?: number;
  quarter?: number;
  month?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface InsightsResponse {
  insights: Array<{
    type: 'recommendation' | 'alert' | 'trend';
    title: string;
    description: string;
    confidence: number;
    metadata?: Record<string, any>;
  }>;
  summary: string;
  timestamp: string;
}

export interface StreamCallback {
  (error: Error | null, data?: any): void;
}

/**
 * MedallionAPI - Production-grade Azure Databricks and ADLS2 integration
 * Handles all data pipeline interactions with medallion architecture
 */
export class MedallionAPI {
  private static instance: MedallionAPI;
  private client: AxiosInstance;
  private credential: DefaultAzureCredential | MockCredential;
  private wsConnections: Set<WebSocket> = new Set();
  private useMockAuth: boolean;

  constructor() {
    this.useMockAuth = shouldBypassAuth();
    
    if (this.useMockAuth) {
      logger.info('Using mock authentication for MedallionAPI');
      this.credential = createMockCredential();
    } else {
      logger.info('Using Azure AD authentication for MedallionAPI');
      this.credential = new DefaultAzureCredential();
    }

    this.client = axios.create({
      baseURL: config.medallion.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Scout-Analytics-v3.0'
      }
    });

    this.setupInterceptors();
  }

  public static getInstance(): MedallionAPI {
    if (!MedallionAPI.instance) {
      MedallionAPI.instance = new MedallionAPI();
    }
    return MedallionAPI.instance;
  }

  private setupInterceptors(): void {
    // Request interceptor for authentication (mock or real)
    this.client.interceptors.request.use(async (config) => {
      try {
        if (this.useMockAuth) {
          // Use mock token for development
          const token = await this.credential.getToken();
          config.headers.Authorization = `Bearer ${token.token}`;
          logger.debug('Using mock authentication token');
        } else {
          // Use real Azure AD token
          const token = await (this.credential as DefaultAzureCredential).getToken('https://management.azure.com/.default');
          config.headers.Authorization = `Bearer ${token.token}`;
          logger.debug('Using Azure AD authentication token');
        }
      } catch (error) {
        logger.warn('Failed to get authentication token, proceeding without auth', { 
          error, 
          useMockAuth: this.useMockAuth 
        });
      }
      return config;
    });

    // Response interceptor for error handling and telemetry
    this.client.interceptors.response.use(
      (response) => {
        logger.info('Medallion API request successful', {
          url: response.config.url,
          status: response.status,
          duration: Date.now() - (response.config as any).startTime
        });
        return response;
      },
      (error) => {
        logger.error('Medallion API request failed', {
          url: error.config?.url,
          status: error.response?.status,
          message: error.message
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get AI insights based on filter context
   */
  public async insights(filters: FilterContext): Promise<InsightsResponse> {
    try {
      const response = await this.client.post('/insights', {
        context: filters,
        feature_flags: {
          real_time_streaming: config.featureFlags.realTimeStreaming,
          advanced_analytics: config.featureFlags.advancedAnalytics,
          ml_predictions: config.featureFlags.mlPredictions
        }
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to fetch insights', { error, filters });
      throw new Error('Failed to fetch AI insights');
    }
  }

  /**
   * Get data schema for dynamic filter population
   */
  public async getSchema(): Promise<Record<string, string[]>> {
    try {
      const response = await this.client.get('/schema');
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch schema', { error });
      throw new Error('Failed to fetch data schema');
    }
  }

  /**
   * Query bronze layer (raw data)
   */
  public async queryBronze(query: string, params?: Record<string, any>): Promise<any[]> {
    try {
      const response = await this.client.post('/bronze/query', {
        query,
        params,
        format: 'json'
      });
      return response.data.results;
    } catch (error) {
      logger.error('Failed to query bronze layer', { error, query });
      throw new Error('Failed to query bronze layer');
    }
  }

  /**
   * Query silver layer (cleaned data)
   */
  public async querySilver(query: string, params?: Record<string, any>): Promise<any[]> {
    try {
      const response = await this.client.post('/silver/query', {
        query,
        params,
        format: 'json'
      });
      return response.data.results;
    } catch (error) {
      logger.error('Failed to query silver layer', { error, query });
      throw new Error('Failed to query silver layer');
    }
  }

  /**
   * Query gold layer (aggregated business metrics)
   */
  public async queryGold(query: string, params?: Record<string, any>): Promise<any[]> {
    try {
      const response = await this.client.post('/gold/query', {
        query,
        params,
        format: 'json'
      });
      return response.data.results;
    } catch (error) {
      logger.error('Failed to query gold layer', { error, query });
      throw new Error('Failed to query gold layer');
    }
  }

  /**
   * Stream real-time data updates (WebSocket fallback)
   * Only enabled if real_time_streaming feature flag is true
   */
  public stream(callback: StreamCallback): void {
    if (!config.featureFlags.realTimeStreaming) {
      logger.warn('Real-time streaming is disabled');
      callback(new Error('Real-time streaming is disabled'));
      return;
    }

    try {
      const ws = new WebSocket(`${config.medallion.wsUrl}/stream`);
      
      ws.onopen = () => {
        logger.info('WebSocket connection established');
        this.wsConnections.add(ws);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          callback(null, data);
        } catch (error) {
          callback(error as Error);
        }
      };

      ws.onerror = (error) => {
        logger.error('WebSocket error', { error });
        callback(new Error('WebSocket connection error'));
      };

      ws.onclose = () => {
        logger.info('WebSocket connection closed');
        this.wsConnections.delete(ws);
      };

    } catch (error) {
      logger.error('Failed to establish WebSocket connection', { error });
      callback(error as Error);
    }
  }

  /**
   * Get analytics data with filters
   */
  public async getAnalytics(endpoint: string, filters: FilterContext): Promise<any> {
    try {
      const response = await this.client.get(`/analytics/${endpoint}`, {
        params: filters
      });
      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch analytics for ${endpoint}`, { error, filters });
      throw new Error(`Failed to fetch analytics for ${endpoint}`);
    }
  }

  /**
   * Get filter options for cascading filters
   */
  public async getFilterOptions(filterType: string, parentFilters?: FilterContext): Promise<string[]> {
    try {
      const response = await this.client.get(`/filters/${filterType}/options`, {
        params: parentFilters
      });
      return response.data.options;
    } catch (error) {
      logger.error(`Failed to fetch filter options for ${filterType}`, { error });
      throw new Error(`Failed to fetch filter options for ${filterType}`);
    }
  }

  /**
   * Close all WebSocket connections
   */
  public disconnect(): void {
    this.wsConnections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });
    this.wsConnections.clear();
  }
}

// Export singleton instance
export const medallionAPI = MedallionAPI.getInstance();