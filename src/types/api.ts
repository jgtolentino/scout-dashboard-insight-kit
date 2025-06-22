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