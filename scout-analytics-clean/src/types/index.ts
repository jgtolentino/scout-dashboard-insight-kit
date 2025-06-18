// Filter State Types
export interface FilterState {
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  regions: string[];
  categories: string[];
  brands: string[];
  stores: string[];
}

// Dashboard Data Types
export interface KPIData {
  totalRevenue: number;
  totalTransactions: number;
  uniqueCustomers: number;
  avgOrderValue: number;
  revenueGrowth: number;
  transactionGrowth: number;
}

export interface RegionData {
  region: string;
  code: string;
  revenue: number;
  transactions: number;
  growth: number;
  cities: string[];
  population?: number;
  stores?: number;
  coordinates?: [number, number];
}

// Chart Data Types
export interface ChartDataPoint {
  id: string | number;
  region: string;
  brand: string;
  category: string;
  store: string;
  revenue: number;
  transactions: number;
  customers: number;
  date: Date;
}

// Cross-Filter Types
export interface DrilldownLevel {
  level: string;
  value: string;
  filters: Record<string, any>;
  timestamp: Date;
}

// AI Component Types
export interface ValidationResult {
  status: 'valid' | 'warning' | 'error' | 'info';
  confidence: number;
  message: string;
  suggestions?: string[];
  alternative_views?: string[];
}

export interface InsightCardProps {
  title: string;
  data: {
    value: number | string;
    change?: number;
    unit?: string;
    previousValue?: number;
  };
  type: 'metric' | 'trend' | 'comparison' | 'status';
  enableRetailBotValidation?: boolean;
  threshold?: {
    warning?: number;
    critical?: number;
  };
  context?: string;
  className?: string;
}

// Map Component Types
export interface MapRegionPosition {
  x: number;
  y: number;
  label: string;
  population?: number;
  area?: number;
  cities?: string[];
}

// Chat/LearnBot Types
export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: string;
}

export interface LearnBotTooltipProps {
  trigger?: React.ReactNode;
  context?: string;
  userAction?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}