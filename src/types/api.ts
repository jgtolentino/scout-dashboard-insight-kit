export interface KpiMetric {
  title: string;
  value: string;
  change: string;
  positive: boolean;
  icon?: React.ElementType;
}

export interface RegionalData {
  name: string;
  value: number;
  color?: string;
  percentage?: string;
}

export interface CategoryData {
  name: string;
  value: number;
  children?: CategoryData[];
}

export interface ApiResponse<T> {
  data: T;
  status: string;
  message?: string;
}

// Geographic data types
export interface LocationData {
  name?: string;
  region?: string;
  count: number;
  longitude?: number;
  latitude?: number;
}

export interface GeoFeature {
  type: 'Feature';
  properties: {
    count: number;
    name: string;
  };
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export interface GeoJsonData {
  type: 'FeatureCollection';
  features: GeoFeature[];
}

export interface GeographicApiResponse {
  type?: 'FeatureCollection';
  data?: LocationData[];
  features?: GeoFeature[];
}

// AI Insights types
export interface AIInsight {
  id: number;
  title: string;
  description: string;
  type: 'trend' | 'growth' | 'correlation' | 'alert';
  confidence: number;
}

export interface AIInsightsResponse {
  insights: AIInsight[];
}

// Filter types for API requests
export interface FilterParams {
  from_date?: string;
  to_date?: string;
  category?: string;
  brand?: string;
  region?: string;
  [key: string]: string | undefined;
}

// Component prop types for visualization components
export interface BaseVisualizationProps {
  height?: number;
  className?: string;
}

export interface ChoroplethMapProps extends BaseVisualizationProps {
  data?: GeographicApiResponse;
  colorScale?: string[];
  onRegionClick?: (regionData: RegionalData) => void;
}

export interface TimeSeriesDataPoint {
  date: string;
  timestamp: number;
  revenue: number;
  transactions: number;
  avgOrderValue: number;
  hour?: number;
  dayOfWeek?: number;
  isWeekend?: boolean;
}

export interface TimeSeriesChartProps extends BaseVisualizationProps {
  data: TimeSeriesDataPoint[];
  showBrush?: boolean;
  showWeekendToggle?: boolean;
}

export interface TransactionHeatmapProps extends BaseVisualizationProps {
  data: Array<{
    hour: number;
    day: string;
    value: number;
  }>;
}

export interface SubstitutionData {
  source: string;
  target: string;
  value: number;
}

export interface ProductSubstitutionSankeyProps extends BaseVisualizationProps {
  data: SubstitutionData[];
}

export interface DemographicData {
  name: string;
  value: number;
  category: string;
  subcategory?: string;
}

export interface DemographicTreeMapProps extends BaseVisualizationProps {
  data: DemographicData[];
}

// Common chart data types
export interface ChartDataPoint {
  [key: string]: string | number | boolean | null;
}

export interface TimeSeriesData {
  timestamp: string | Date;
  value: number;
  category?: string;
  metadata?: Record<string, string | number | boolean>;
}

// Generic metadata and filter types
export interface Metadata {
  [key: string]: string | number | boolean | null;
}

export interface GenericFilters {
  [key: string]: string | number | boolean | null | undefined;
}

// Hook return types
export interface ApiHookResponse<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}