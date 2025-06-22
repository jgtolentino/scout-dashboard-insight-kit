import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

// Components to test
import EnhancedPhilippinesChoroplethMap from '../components/maps/EnhancedPhilippinesChoroplethMap';
import EnhancedTimeSeriesChart from '../components/charts/EnhancedTimeSeriesChart';
import TransactionHeatmap from '../components/charts/TransactionHeatmap';
import ProductSubstitutionSankey from '../components/charts/ProductSubstitutionSankey';
import DemographicTreeMap from '../components/charts/DemographicTreeMap';

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

// Mock data for tests
const mockRegionalData = [
  { name: 'NCR', fullName: 'National Capital Region', value: 2500000, percentage: '35.5%', transactions: 1200, avgOrderValue: 2083 },
  { name: 'Region VII', fullName: 'Central Visayas', value: 1800000, percentage: '25.7%', transactions: 900, avgOrderValue: 2000 },
  { name: 'Region XI', fullName: 'Davao Region', value: 1500000, percentage: '21.4%', transactions: 750, avgOrderValue: 2000 },
];

const mockTimeSeriesData = [
  { date: '2024-01-01', revenue: 150000, transactions: 120, growth: 12.5 },
  { date: '2024-01-02', revenue: 165000, transactions: 135, growth: 15.2 },
  { date: '2024-01-03', revenue: 142000, transactions: 110, growth: 8.9 },
];

const mockHeatmapData = Array.from({ length: 24 }, (_, hour) => 
  Array.from({ length: 7 }, (_, day) => ({
    hour,
    day,
    value: Math.floor(Math.random() * 100) + 20,
    dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]
  }))
).flat();

const mockSubstitutionData = [
  { source: 'Coca-Cola 500ml', target: 'Pepsi 500ml', value: 45, frequency: 12, revenue: 2400, substitutionRate: 15.8 },
  { source: 'Lays Classic', target: 'Pringles Original', value: 32, frequency: 8, revenue: 1600, substitutionRate: 12.3 },
];

const mockDemographicData = [
  { id: 'age_young_18-25', name: '18-25', category: 'age_group', value: 150, revenue: 75000, count: 300, percentage: 25.5, avgSpend: 250, growth: 12.3 },
  { id: 'income_premium_high', name: 'Premium Shoppers', category: 'income_level', value: 120, revenue: 120000, count: 200, percentage: 20.4, avgSpend: 600, growth: 18.7 },
];

describe('Scout Analytics Visualizations Integration Tests', () => {
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

  describe('EnhancedPhilippinesChoroplethMap', () => {
    it('renders map container and legend', async () => {
      render(
        <TestWrapper>
          <EnhancedPhilippinesChoroplethMap 
            data={mockRegionalData}
            height={500}
            colorScale="revenue"
            metric="Revenue"
            onRegionClick={vi.fn()}
            onRegionHover={vi.fn()}
            showLegend={true}
          />
        </TestWrapper>
      );

      // Check for map container by finding canvas or div element
      await waitFor(() => {
        expect(document.querySelector('.mapbox-container, canvas, [data-testid="mapbox-container"]')).toBeInTheDocument();
      });
      
      // Check for legend content
      await waitFor(() => {
        expect(screen.getByText(/Revenue/)).toBeInTheDocument();
      });
    });

    it('handles region click events', async () => {
      const mockOnRegionClick = vi.fn();
      
      render(
        <TestWrapper>
          <EnhancedPhilippinesChoroplethMap 
            data={mockRegionalData}
            height={500}
            colorScale="revenue"
            metric="Revenue"
            onRegionClick={mockOnRegionClick}
            onRegionHover={vi.fn()}
            showLegend={true}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        const ncrButton = screen.getByText('NCR');
        fireEvent.click(ncrButton);
        expect(mockOnRegionClick).toHaveBeenCalledWith('NCR');
      });
    });

    it('displays different metrics correctly', async () => {
      render(
        <TestWrapper>
          <EnhancedPhilippinesChoroplethMap 
            data={mockRegionalData}
            height={500}
            colorScale="transactions"
            metric="Transactions"
            onRegionClick={vi.fn()}
            onRegionHover={vi.fn()}
            showLegend={true}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Transactions Distribution')).toBeInTheDocument();
        expect(screen.getByText('1,200')).toBeInTheDocument();
      });
    });
  });

  describe('EnhancedTimeSeriesChart', () => {
    it('renders chart container and controls', async () => {
      render(
        <TestWrapper>
          <EnhancedTimeSeriesChart 
            data={mockTimeSeriesData}
            height={400}
            enableBrush={true}
            showTooltip={true}
          />
        </TestWrapper>
      );

      // Check for chart container
      expect(screen.getByRole('img')).toBeInTheDocument(); // Recharts creates an svg with role="img"
      
      // Check for brush controls
      expect(screen.getByText('Brush & Zoom')).toBeInTheDocument();
    });

    it('handles metric switching', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <EnhancedTimeSeriesChart 
            data={mockTimeSeriesData}
            height={400}
            enableBrush={true}
            showTooltip={true}
          />
        </TestWrapper>
      );

      // Switch to transactions metric
      const transactionsButton = screen.getByText('Transactions');
      await user.click(transactionsButton);
      
      expect(transactionsButton).toHaveAttribute('data-state', 'active');
    });

    it('displays trend indicators', async () => {
      render(
        <TestWrapper>
          <EnhancedTimeSeriesChart 
            data={mockTimeSeriesData}
            height={400}
            enableBrush={true}
            showTooltip={true}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Trend:/)).toBeInTheDocument();
      });
    });
  });

  describe('TransactionHeatmap', () => {
    it('renders heatmap with hour and day labels', async () => {
      render(
        <TestWrapper>
          <TransactionHeatmap 
            data={mockHeatmapData}
            height={400}
            metric="transactions"
          />
        </TestWrapper>
      );

      // Check for time labels
      await waitFor(() => {
        expect(screen.getByText('00:00')).toBeInTheDocument();
        expect(screen.getByText('Mon')).toBeInTheDocument();
        expect(screen.getByText('Fri')).toBeInTheDocument();
      });
    });

    it('handles metric switching in heatmap', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TransactionHeatmap 
            data={mockHeatmapData}
            height={400}
            metric="transactions"
          />
        </TestWrapper>
      );

      // Switch to revenue metric
      const revenueButton = screen.getByText('Revenue');
      await user.click(revenueButton);
      
      expect(revenueButton).toHaveClass('bg-blue-600');
    });

    it('displays peak hours analysis', async () => {
      render(
        <TestWrapper>
          <TransactionHeatmap 
            data={mockHeatmapData}
            height={400}
            metric="transactions"
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Peak Hours/)).toBeInTheDocument();
      });
    });
  });

  describe('ProductSubstitutionSankey', () => {
    it('renders sankey diagram with product flows', async () => {
      render(
        <TestWrapper>
          <ProductSubstitutionSankey 
            data={mockSubstitutionData}
            height={500}
            nodeWidth={20}
            nodePadding={10}
          />
        </TestWrapper>
      );

      // Check for SVG container
      expect(screen.getByRole('img')).toBeInTheDocument();
      
      // Check for product names in flows
      await waitFor(() => {
        expect(screen.getByText('Coca-Cola 500ml')).toBeInTheDocument();
        expect(screen.getByText('Pepsi 500ml')).toBeInTheDocument();
      });
    });

    it('displays substitution statistics', async () => {
      render(
        <TestWrapper>
          <ProductSubstitutionSankey 
            data={mockSubstitutionData}
            height={500}
            nodeWidth={20}
            nodePadding={10}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Total Substitutions/)).toBeInTheDocument();
        expect(screen.getByText(/Substitution Revenue/)).toBeInTheDocument();
      });
    });

    it('handles empty data gracefully', async () => {
      render(
        <TestWrapper>
          <ProductSubstitutionSankey 
            data={[]}
            height={500}
            nodeWidth={20}
            nodePadding={10}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/No substitution data available/)).toBeInTheDocument();
      });
    });
  });

  describe('DemographicTreeMap', () => {
    it('renders treemap with demographic segments', async () => {
      render(
        <TestWrapper>
          <DemographicTreeMap 
            data={mockDemographicData}
            height={600}
            metric="value"
          />
        </TestWrapper>
      );

      // Check for treemap container
      expect(screen.getByRole('img')).toBeInTheDocument();
      
      // Check for demographic categories
      await waitFor(() => {
        expect(screen.getByText('18-25')).toBeInTheDocument();
        expect(screen.getByText('Premium Shoppers')).toBeInTheDocument();
      });
    });

    it('handles metric switching in treemap', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <DemographicTreeMap 
            data={mockDemographicData}
            height={600}
            metric="value"
          />
        </TestWrapper>
      );

      // Switch to revenue metric
      const revenueButton = screen.getByText('Revenue');
      await user.click(revenueButton);
      
      // Check if metric changed
      await waitFor(() => {
        expect(screen.getByText(/Total Revenue/)).toBeInTheDocument();
      });
    });

    it('displays summary statistics', async () => {
      render(
        <TestWrapper>
          <DemographicTreeMap 
            data={mockDemographicData}
            height={600}
            metric="value"
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Total Value')).toBeInTheDocument();
        expect(screen.getByText('Total Revenue')).toBeInTheDocument();
        expect(screen.getByText('Total Customers')).toBeInTheDocument();
        expect(screen.getByText('Top Segment')).toBeInTheDocument();
      });
    });

    it('shows demographic category legend', async () => {
      render(
        <TestWrapper>
          <DemographicTreeMap 
            data={mockDemographicData}
            height={600}
            metric="value"
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Demographic Categories')).toBeInTheDocument();
        expect(screen.getByText('Age group')).toBeInTheDocument();
        expect(screen.getByText('Income level')).toBeInTheDocument();
      });
    });
  });

  describe('API Integration', () => {
    it('handles loading states correctly', async () => {
      // Mock delayed response
      server.use(
        http.get('*/scout/analytics', async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return HttpResponse.json({
            success: true,
            data: {
              summary: { totalRevenue: 1000000 },
              transactions: { data: [] }
            }
          });
        })
      );

      render(
        <TestWrapper>
          <DemographicTreeMap 
            data={[]}
            height={600}
            metric="value"
          />
        </TestWrapper>
      );

      // Should show loading skeleton initially
      expect(screen.getByRole('img')).toBeInTheDocument();
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
          <EnhancedPhilippinesChoroplethMap 
            data={[]}
            height={500}
            colorScale="revenue"
            metric="Revenue"
            onRegionClick={vi.fn()}
            onRegionHover={vi.fn()}
            showLegend={true}
          />
        </TestWrapper>
      );

      // Component should render without crashing
      expect(screen.getByTestId('mapbox-container')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('adapts to different screen sizes', async () => {
      // Mock smaller viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(
        <TestWrapper>
          <EnhancedTimeSeriesChart 
            data={mockTimeSeriesData}
            height={400}
            enableBrush={true}
            showTooltip={true}
          />
        </TestWrapper>
      );

      // Chart should still render
      expect(screen.getByRole('img')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA labels', async () => {
      render(
        <TestWrapper>
          <TransactionHeatmap 
            data={mockHeatmapData}
            height={400}
            metric="transactions"
          />
        </TestWrapper>
      );

      // Check for accessibility attributes
      const chartElement = screen.getByRole('img');
      expect(chartElement).toHaveAttribute('aria-label');
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <DemographicTreeMap 
            data={mockDemographicData}
            height={600}
            metric="value"
          />
        </TestWrapper>
      );

      // Tab through metric buttons
      await user.tab();
      const valueButton = screen.getByText('Value');
      expect(valueButton).toHaveFocus();
    });
  });
});