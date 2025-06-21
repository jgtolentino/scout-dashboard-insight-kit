
export interface KpiMetric {
  title: string;
  value: string;
  change: string;
  positive: boolean;
}

export interface RegionalData {
  name: string;
  value: number;
  color: string;
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
