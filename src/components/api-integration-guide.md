# UI Components Requiring Real API Integration

This document identifies all UI components that need to be connected to real API endpoints instead of using mock data.

## Overview Page Components

1. **KPI Metrics Cards**
   - File: `src/pages/Overview.tsx`
   - Current: Uses hardcoded metrics
   - API Endpoint: `/api/analytics/summary`
   - Data Needed: Total revenue, transaction count, customer count, average order value

2. **CategoryTreemapLive**
   - File: `src/components/CategoryTreemapLive.tsx`
   - Current: Uses mock category distribution data
   - API Endpoint: `/api/category-mix`
   - Data Needed: Category names, counts, percentages

3. **RegionalPerformanceMap**
   - File: `src/components/maps/RegionalPerformanceMap.tsx`
   - Current: Uses mock regional data
   - API Endpoint: `/api/regions`
   - Data Needed: Region names, transaction counts, revenue amounts

4. **AIInsightsPanel**
   - File: `src/components/ai/AIInsightsPanel.tsx`
   - Current: Uses mock insights
   - API Endpoint: `/api/ask` or `/api/ai-insights`
   - Data Needed: AI-generated insights based on current filters

## Transaction Trends Components

1. **Hourly Transaction Volume Chart**
   - File: `src/pages/TransactionTrends.tsx`
   - Current: Uses hardcoded hourly data
   - API Endpoint: `/api/volume`
   - Data Needed: Hourly transaction counts and amounts

2. **Regional Distribution Chart**
   - File: `src/pages/TransactionTrends.tsx`
   - Current: Uses mock regional data
   - API Endpoint: `/api/regions`
   - Data Needed: Region names, transaction counts, percentages

3. **Peak Hours Analysis**
   - File: `src/pages/TransactionTrends.tsx`
   - Current: Uses mock peak hour data
   - API Endpoint: `/api/volume?aggregation=peak`
   - Data Needed: Time periods, transaction counts

## Product Mix Components

1. **ParetoChartLive**
   - File: `src/components/ParetoChartLive.tsx`
   - Current: Uses mock category data
   - API Endpoint: `/api/category-mix`
   - Data Needed: Category names, counts, cumulative percentages

2. **SubstitutionFlowChart**
   - File: `src/components/SubstitutionFlowChart.tsx`
   - Current: Uses mock substitution data
   - API Endpoint: `/api/substitution`
   - Data Needed: Original product, substitute product, count, reason

## Consumer Behavior Components

1. **Shopping Patterns Chart**
   - File: `src/pages/ConsumerBehavior.tsx`
   - Current: Uses mock shopping pattern data
   - API Endpoint: `/api/volume?aggregation=hourly`
   - Data Needed: Hour ranges, transaction percentages

2. **Basket Analysis Chart**
   - File: `src/pages/ConsumerBehavior.tsx`
   - Current: Uses mock basket data
   - API Endpoint: `/api/analytics/basket`
   - Data Needed: Basket size categories, percentages

## Consumer Profiling Components

1. **GeoHeatmap**
   - File: `src/components/GeoHeatmap.tsx`
   - Current: Uses mock location data or fallback
   - API Endpoint: `/api/demographics?agg=barangay`
   - Data Needed: Location coordinates, transaction counts

2. **Demographics Charts**
   - File: `src/pages/ConsumerProfiling.tsx`
   - Current: Uses mock gender and age data
   - API Endpoint: `/api/demographics`
   - Data Needed: Gender distribution, age distribution

## RetailBot Components

1. **RetailBotChat**
   - File: `src/components/ai/RetailBotChat.tsx`
   - Current: Uses mock responses
   - API Endpoint: `/api/retailbot`
   - Data Needed: AI-generated responses, action recommendations

## Shared Components

1. **GlobalFilterBar**
   - File: `src/components/GlobalFilterBar.tsx`
   - Current: Uses hardcoded filter options
   - API Endpoints: 
     - `/api/categories` (for category options)
     - `/api/stores` (for store options)
     - `/api/brands` (for brand options)

2. **CategoryCascade**
   - File: `src/components/CategoryCascade.tsx`
   - Current: Uses mock category hierarchy
   - API Endpoint: `/api/categories` and `/api/categories?parent={id}`
   - Data Needed: Parent categories and subcategories

## Custom Hooks to Implement/Update

1. **useTransactionData**
   - File: `src/hooks/useTransactionData.ts`
   - API Endpoint: `/api/transactions`
   - Purpose: Fetch transaction data with filters

2. **useVolumeData**
   - File: `src/hooks/useVolumeData.ts`
   - API Endpoint: `/api/volume`
   - Purpose: Fetch hourly/daily transaction volume

3. **useCategoryMixData**
   - File: `src/hooks/useCategoryMixData.ts`
   - API Endpoint: `/api/category-mix`
   - Purpose: Fetch category distribution data

4. **useDemographicsData**
   - File: `src/hooks/useDemographicsData.ts`
   - API Endpoint: `/api/demographics`
   - Purpose: Fetch customer demographic data

5. **useSubstitutionData**
   - File: `src/hooks/useSubstitutionData.ts`
   - API Endpoint: `/api/substitution`
   - Purpose: Fetch product substitution data

6. **useAIInsights**
   - File: `src/hooks/useAIInsights.ts`
   - API Endpoint: `/api/ask` or `/api/ai-insights`
   - Purpose: Fetch AI-generated insights

7. **useRetailBot**
   - File: `src/hooks/useRetailBot.ts`
   - API Endpoint: `/api/retailbot`
   - Purpose: Interact with RetailBot AI assistant

## Implementation Strategy

1. **Create API Client**:
   - Implement a central API client with error handling and request formatting
   - Use environment variables for API base URL

2. **Implement Custom Hooks**:
   - Create React Query hooks for each data type
   - Include proper typing for request/response data
   - Handle loading, error, and success states

3. **Update Components**:
   - Replace mock data with hook calls
   - Add loading states (skeletons)
   - Add error handling
   - Implement proper data transformation

4. **Test API Integration**:
   - Verify all endpoints are correctly called
   - Ensure data is properly displayed
   - Test error handling
   - Validate filter functionality