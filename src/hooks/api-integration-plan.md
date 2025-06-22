# API Integration Plan for Scout Analytics Dashboard

## Current State Assessment

The Scout Analytics Dashboard currently uses hardcoded mock data throughout its components. To transition to real API data, we need to implement proper data fetching hooks and update all components to use these hooks.

## API Endpoints Available

Based on the backend code, these endpoints are available:

```
GET /api/health - Health check
GET /api/transactions - Transaction data with pagination and filtering
GET /api/products - Product catalog
GET /api/regions - Region hierarchy
GET /api/categories - Category hierarchy
GET /api/analytics/summary - Analytics summary
GET /api/analytics/brand-performance - Brand performance metrics
GET /api/analytics/consumer-insights - Consumer insights
GET /api/volume - Transaction volume data (hourly/daily)
GET /api/category-mix - Product category distribution
GET /api/demographics - Customer demographics
GET /api/substitution - Product substitution patterns
POST /api/ask - AI assistant for natural language queries
POST /api/retailbot - RetailBot AI assistant
POST /api/sql - Execute SQL queries (admin only)
```

## Implementation Priority

1. **Core Data Hooks** (High Priority)
   - `useTransactionData` - For transaction listings and counts
   - `useVolumeData` - For time-based charts
   - `useCategoryMixData` - For product category analysis
   - `useRegionsData` - For geographic visualizations

2. **Filter Components** (High Priority)
   - `CategoryCascade` - For category filtering
   - `GlobalFilterBar` - For all global filters

3. **Dashboard Components** (Medium Priority)
   - Overview page KPI cards
   - Charts and visualizations
   - Regional maps

4. **AI Components** (Lower Priority)
   - `AIInsightsPanel` - AI-generated insights
   - `RetailBotChat` - Interactive AI assistant

## Implementation Steps

### Step 1: Set Up API Configuration

1. Create a central API configuration file:
   - `src/config/api.ts` - Define API base URL from environment variables

2. Set up environment variables:
   - `.env.development` - Development API URL
   - `.env.production` - Production API URL

### Step 2: Implement Core Data Hooks

Create React Query hooks for each data type:

1. `useTransactionData.ts`
   ```typescript
   export const useTransactionData = (filters: Record<string, any> = {}) => {
     const queryParams = new URLSearchParams();
     // Add filters to query params
     if (filters.from) queryParams.set('from_date', filters.from);
     if (filters.to) queryParams.set('to_date', filters.to);
     // ... other filters
     
     const queryString = queryParams.toString();
     const url = `${API_BASE_URL}/transactions${queryString ? `?${queryString}` : ''}`;
     
     return useQuery({
       queryKey: ['transactions', filters],
       queryFn: async () => {
         const response = await fetch(url);
         if (!response.ok) {
           throw new Error('Failed to fetch transaction data');
         }
         return response.json();
       },
       staleTime: 5 * 60 * 1000, // 5 minutes
     });
   };
   ```

2. Repeat for other data types (volume, category-mix, regions, etc.)

### Step 3: Update Components to Use Real Data

For each component identified in the component list:

1. Import the appropriate hook
2. Replace hardcoded data with hook call
3. Add loading state (skeleton)
4. Add error handling
5. Implement data transformation if needed

Example:
```typescript
// Before
const categories = [
  { name: 'Beverages', share: 28.5, revenue: 812456 },
  { name: 'Food & Snacks', share: 24.2, revenue: 689234 },
  // ...more hardcoded data
];

// After
const { data, isLoading, error } = useCategoryMixData(filters);

if (isLoading) return <SkeletonLoader />;
if (error) return <ErrorDisplay error={error} />;

const categories = data?.data || [];
```

### Step 4: Implement Filter Integration

1. Update `GlobalFilterBar` to fetch filter options from API
2. Connect filter state to data fetching hooks
3. Ensure URL parameters reflect filter state

### Step 5: Test and Refine

1. Test each component with real API data
2. Verify loading states work correctly
3. Test error handling
4. Validate filter functionality
5. Check performance and implement optimizations if needed

## Component-Specific Integration Notes

### KPI Cards
- Replace hardcoded metrics with calculated values from `/api/analytics/summary`
- Add loading skeletons for metrics

### Charts
- Ensure proper data transformation for chart libraries
- Add empty state handling when no data is available
- Implement loading states for all charts

### Maps
- Connect GeoHeatmap to real location data
- Ensure proper coordinate handling
- Add fallback for missing location data

### AI Components
- Connect RetailBot to `/api/retailbot` endpoint
- Implement proper error handling for AI requests
- Add loading states for AI responses

## Testing Strategy

1. **Unit Tests**:
   - Test data transformation functions
   - Test hook behavior with mock responses

2. **Integration Tests**:
   - Test component rendering with real API responses
   - Test filter interactions

3. **End-to-End Tests**:
   - Test complete user flows with real backend

## Fallback Strategy

For components where API data might be unavailable:

1. Implement graceful fallbacks to empty states
2. Add user-friendly error messages
3. Consider keeping minimal mock data as absolute fallback