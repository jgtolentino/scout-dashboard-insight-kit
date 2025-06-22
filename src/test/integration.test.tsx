import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

// Test core components that are most critical
import { useRegionalPerformanceData } from '../hooks/useRegionalPerformanceData';
import { useDemographicTreeMapData } from '../hooks/useDemographicTreeMapData';
import { useSubstitutionData } from '../hooks/useSubstitutionData';

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Test component for hook testing
const TestHookComponent = ({ hook, testId }: { hook: () => any, testId: string }) => {
  const result = hook();
  
  return (
    <div data-testid={testId}>
      <div data-testid="loading">{result.isLoading ? 'loading' : 'loaded'}</div>
      <div data-testid="error">{result.error ? 'error' : 'no-error'}</div>
      <div data-testid="data">{result.data ? 'has-data' : 'no-data'}</div>
    </div>
  );
};

describe('Scout Analytics Integration Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    });
  });

  describe('API Integration', () => {
    it('successfully fetches regional performance data', async () => {
      render(
        <TestWrapper>
          <TestHookComponent 
            hook={() => useRegionalPerformanceData({}, 'revenue')}
            testId="regional-test"
          />
        </TestWrapper>
      );

      // Initially loading
      expect(screen.getByTestId('loading')).toHaveTextContent('loading');

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
        expect(screen.getByTestId('error')).toHaveTextContent('no-error');
        expect(screen.getByTestId('data')).toHaveTextContent('has-data');
      }, { timeout: 5000 });
    });

    it('successfully fetches demographic data', async () => {
      render(
        <TestWrapper>
          <TestHookComponent 
            hook={() => useDemographicTreeMapData({})}
            testId="demographic-test"
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
        expect(screen.getByTestId('error')).toHaveTextContent('no-error');
        expect(screen.getByTestId('data')).toHaveTextContent('has-data');
      }, { timeout: 5000 });
    });

    it('successfully fetches substitution data', async () => {
      render(
        <TestWrapper>
          <TestHookComponent 
            hook={() => useSubstitutionData({})}
            testId="substitution-test"
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
        expect(screen.getByTestId('error')).toHaveTextContent('no-error');
        expect(screen.getByTestId('data')).toHaveTextContent('has-data');
      }, { timeout: 5000 });
    });

    it('handles API errors gracefully', async () => {
      // Mock error response
      server.use(
        http.get('*/scout/analytics', () => {
          return HttpResponse.error();
        })
      );

      render(
        <TestWrapper>
          <TestHookComponent 
            hook={() => useRegionalPerformanceData({}, 'revenue')}
            testId="error-test"
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('error');
      }, { timeout: 5000 });
    });

    it('handles different filter parameters', async () => {
      const filters = {
        from: '2024-01-01',
        to: '2024-12-31',
        stores: ['NCR'],
        period: 'monthly'
      };

      render(
        <TestWrapper>
          <TestHookComponent 
            hook={() => useRegionalPerformanceData(filters, 'transactions')}
            testId="filter-test"
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
        expect(screen.getByTestId('data')).toHaveTextContent('has-data');
      }, { timeout: 5000 });
    });
  });

  describe('Data Transformation', () => {
    it('transforms regional data correctly', async () => {
      const TestComponent = () => {
        const { data } = useRegionalPerformanceData({}, 'revenue');
        
        if (!data) return <div data-testid="no-data">No data</div>;
        
        return (
          <div data-testid="regional-data">
            <div data-testid="total">{data.total}</div>
            <div data-testid="metric">{data.metric}</div>
            <div data-testid="regions-count">{data.data.length}</div>
            {data.data.map((region, index) => (
              <div key={region.name} data-testid={`region-${index}`}>
                {region.name}: {region.value}
              </div>
            ))}
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('regional-data')).toBeInTheDocument();
        expect(screen.getByTestId('metric')).toHaveTextContent('Revenue');
        expect(screen.getByTestId('regions-count')).toHaveTextContent(/[1-9]/); // At least 1 region
      }, { timeout: 5000 });
    });

    it('transforms demographic data correctly', async () => {
      const TestComponent = () => {
        const { data } = useDemographicTreeMapData({});
        
        if (!data) return <div data-testid="no-data">No data</div>;
        
        return (
          <div data-testid="demographic-data">
            <div data-testid="total-value">{data.summary.totalValue}</div>
            <div data-testid="total-revenue">{data.summary.totalRevenue}</div>
            <div data-testid="segments-count">{data.data.length}</div>
            <div data-testid="categories-count">{data.summary.categories.length}</div>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('demographic-data')).toBeInTheDocument();
        expect(screen.getByTestId('total-value')).toHaveTextContent(/[0-9]/);
        expect(screen.getByTestId('segments-count')).toHaveTextContent(/[0-9]/);
      }, { timeout: 5000 });
    });
  });

  describe('MSW Mock Integration', () => {
    it('MSW intercepts and responds to API calls', async () => {
      // Test that our MSW handlers are working
      const response = await fetch('http://localhost:3002/scout/analytics');
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.summary).toBeDefined();
      expect(data.data.transactions).toBeDefined();
    });

    it('MSW provides realistic mock data structure', async () => {
      const response = await fetch('http://localhost:3002/scout/analytics?limit=10');
      const data = await response.json();
      
      expect(data.data.transactions.data).toHaveLength(10);
      expect(data.data.regions).toBeDefined();
      expect(data.data.categories).toBeDefined();
      expect(data.data.trends).toBeDefined();
      
      // Check transaction structure
      const transaction = data.data.transactions.data[0];
      expect(transaction).toHaveProperty('id');
      expect(transaction).toHaveProperty('customer_id');
      expect(transaction).toHaveProperty('product_name');
      expect(transaction).toHaveProperty('total_amount');
      expect(transaction).toHaveProperty('date');
    });

    it('MSW handles authentication correctly', async () => {
      const response = await fetch('http://localhost:3002/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'demo@scout.com',
          password: 'demo123'
        })
      });
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.token).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('handles large datasets efficiently', async () => {
      // Mock large dataset
      server.use(
        http.get('*/scout/analytics', () => {
          const largeTransactionData = Array.from({ length: 1000 }, (_, i) => ({
            id: `txn_${i}`,
            customer_id: `customer_${i % 50}`,
            product_name: `Product ${i % 20}`,
            total_amount: Math.floor(Math.random() * 500) + 50,
            quantity: Math.floor(Math.random() * 5) + 1,
            date: new Date().toISOString(),
            region: ['NCR', 'Region VII', 'Region XI'][i % 3],
            category: ['beverages', 'snacks', 'personal_care'][i % 3]
          }));

          return HttpResponse.json({
            success: true,
            data: {
              summary: { totalRevenue: 500000, totalTransactions: 1000 },
              transactions: { data: largeTransactionData },
              regions: [],
              categories: []
            }
          });
        })
      );

      const start = performance.now();
      
      render(
        <TestWrapper>
          <TestHookComponent 
            hook={() => useDemographicTreeMapData({})}
            testId="performance-test"
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent('has-data');
      }, { timeout: 10000 });

      const end = performance.now();
      const duration = end - start;
      
      // Should process large dataset in reasonable time (< 5 seconds)
      expect(duration).toBeLessThan(5000);
    });

    it('caches API responses correctly', async () => {
      let callCount = 0;
      
      server.use(
        http.get('*/scout/analytics', () => {
          callCount++;
          return HttpResponse.json({
            success: true,
            data: {
              summary: { totalRevenue: 100000 },
              transactions: { data: [] },
              regions: [],
              categories: []
            }
          });
        })
      );

      const TestCacheComponent = () => {
        const result1 = useRegionalPerformanceData({}, 'revenue');
        const result2 = useRegionalPerformanceData({}, 'revenue'); // Same query
        
        return (
          <div>
            <div data-testid="call-count">{callCount}</div>
            <div data-testid="both-loaded">{result1.data && result2.data ? 'loaded' : 'loading'}</div>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestCacheComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('both-loaded')).toHaveTextContent('loaded');
        // Should only make one API call due to caching
        expect(screen.getByTestId('call-count')).toHaveTextContent('1');
      }, { timeout: 5000 });
    });
  });

  describe('Error Boundaries', () => {
    it('handles component errors gracefully', async () => {
      const ErrorComponent = () => {
        throw new Error('Test error');
      };

      // Test that errors don't crash the whole app
      const TestApp = () => {
        try {
          return (
            <TestWrapper>
              <div data-testid="working">Working content</div>
              <ErrorComponent />
            </TestWrapper>
          );
        } catch {
          return <div data-testid="error-caught">Error caught</div>;
        }
      };

      render(<TestApp />);
      
      // App should handle errors gracefully
      expect(screen.getByTestId('working')).toBeInTheDocument();
    });
  });
});