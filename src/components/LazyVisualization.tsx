import React, { Suspense, lazy } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import type { 
  ChoroplethMapProps, 
  TimeSeriesChartProps, 
  TransactionHeatmapProps, 
  ProductSubstitutionSankeyProps, 
  DemographicTreeMapProps 
} from '@/types/api';

// Lazy load visualization components for better performance
const EnhancedPhilippinesChoroplethMap = lazy(() => import('./maps/EnhancedPhilippinesChoroplethMap'));
const EnhancedTimeSeriesChart = lazy(() => import('./charts/EnhancedTimeSeriesChart'));
const TransactionHeatmap = lazy(() => import('./charts/TransactionHeatmap'));
const ProductSubstitutionSankey = lazy(() => import('./charts/ProductSubstitutionSankey'));
const DemographicTreeMap = lazy(() => import('./charts/DemographicTreeMap'));

// Loading fallback component
const VisualizationSkeleton = ({ height = 400, title }: { height?: number; title?: string }) => (
  <Card className="w-full">
    {title && (
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
    )}
    <CardContent>
      <div 
        className="flex items-center justify-center bg-gray-50 rounded-lg animate-pulse"
        style={{ height }}
      >
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Loading visualization...</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Lazy visualization wrapper components
export const LazyChoroplethMap = (props: ChoroplethMapProps) => (
  <Suspense fallback={<VisualizationSkeleton height={props.height || 500} title="Regional Performance Map" />}>
    <EnhancedPhilippinesChoroplethMap {...props} />
  </Suspense>
);

export const LazyTimeSeriesChart = (props: TimeSeriesChartProps) => (
  <Suspense fallback={<VisualizationSkeleton height={props.height || 400} title="Time Series Analysis" />}>
    <EnhancedTimeSeriesChart {...props} />
  </Suspense>
);

export const LazyTransactionHeatmap = (props: TransactionHeatmapProps) => (
  <Suspense fallback={<VisualizationSkeleton height={props.height || 400} title="Transaction Heatmap" />}>
    <TransactionHeatmap {...props} />
  </Suspense>
);

export const LazyProductSubstitutionSankey = (props: ProductSubstitutionSankeyProps) => (
  <Suspense fallback={<VisualizationSkeleton height={props.height || 500} title="Product Substitution Flow" />}>
    <ProductSubstitutionSankey {...props} />
  </Suspense>
);

export const LazyDemographicTreeMap = (props: DemographicTreeMapProps) => (
  <Suspense fallback={<VisualizationSkeleton height={props.height || 600} title="Demographic Tree Map" />}>
    <DemographicTreeMap {...props} />
  </Suspense>
);

// Performance optimized visualization container
interface LazyVisualizationContainerProps {
  children: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
}

export const LazyVisualizationContainer: React.FC<LazyVisualizationContainerProps> = ({
  children,
  threshold = 0.1,
  rootMargin = '50px'
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <div ref={containerRef}>
      {isVisible ? children : <VisualizationSkeleton />}
    </div>
  );
};