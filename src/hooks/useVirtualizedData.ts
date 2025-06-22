import { useMemo, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

export interface VirtualizedDataOptions {
  pageSize?: number;
  enableVirtualization?: boolean;
  bufferSize?: number;
  threshold?: number;
}

export interface VirtualizedDataResult<T> {
  data: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: Error | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  setPageSize: (size: number) => void;
  refetch: () => void;
}

export const useVirtualizedData = <T>(
  queryKey: string[],
  fetchFn: (page: number, pageSize: number) => Promise<{ data: T[]; total: number }>,
  options: VirtualizedDataOptions = {}
): VirtualizedDataResult<T> => {
  const {
    pageSize: initialPageSize = 50,
    enableVirtualization = true,
    bufferSize = 10,
    threshold = 1000
  } = options;

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  // Query for paginated data
  const {
    data: queryResult,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [...queryKey, currentPage, pageSize],
    queryFn: () => fetchFn(currentPage, pageSize),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    keepPreviousData: true, // Keep previous data while loading new data
  });

  const totalCount = queryResult?.total || 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  const rawData = queryResult?.data || [];

  // Apply virtualization if enabled and data exceeds threshold
  const virtualizedData = useMemo(() => {
    if (!enableVirtualization || totalCount < threshold) {
      return rawData;
    }

    // For large datasets, only keep current page and buffer
    const startBuffer = Math.max(0, currentPage - bufferSize);
    const endBuffer = Math.min(totalPages, currentPage + bufferSize);
    
    // In a real implementation, this would fetch multiple pages
    // For now, we'll just return the current page data
    return rawData;
  }, [rawData, enableVirtualization, totalCount, threshold, currentPage, bufferSize, totalPages]);

  const goToPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  }, [totalPages]);

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setCurrentPage(1); // Reset to first page when changing page size
  }, []);

  return {
    data: virtualizedData,
    totalCount,
    currentPage,
    totalPages,
    isLoading,
    error: error as Error | null,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    setPageSize,
    refetch
  };
};

// Hook for infinite scroll/virtual list
export const useInfiniteVirtualizedData = <T>(
  queryKey: string[],
  fetchFn: (page: number, pageSize: number) => Promise<{ data: T[]; total: number; hasMore: boolean }>,
  options: VirtualizedDataOptions = {}
) => {
  const { pageSize = 50 } = options;
  const [allData, setAllData] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const {
    data: queryResult,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [...queryKey, currentPage, pageSize],
    queryFn: () => fetchFn(currentPage, pageSize),
    enabled: hasMore,
    onSuccess: (newData) => {
      if (currentPage === 1) {
        setAllData(newData.data);
      } else {
        setAllData(prev => [...prev, ...newData.data]);
      }
      setHasMore(newData.hasMore);
    }
  });

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  }, [isLoading, hasMore]);

  const reset = useCallback(() => {
    setAllData([]);
    setCurrentPage(1);
    setHasMore(true);
    refetch();
  }, [refetch]);

  return {
    data: allData,
    isLoading,
    error: error as Error | null,
    hasMore,
    loadMore,
    reset,
    totalLoaded: allData.length
  };
};

// Memory optimization hook
export const useMemoryOptimizedData = <T>(
  data: T[],
  options: {
    maxItems?: number;
    gcThreshold?: number;
    enableCompression?: boolean;
  } = {}
) => {
  const {
    maxItems = 1000,
    gcThreshold = 1500,
    enableCompression = false
  } = options;

  const [optimizedData, setOptimizedData] = useState<T[]>([]);

  useMemo(() => {
    if (data.length <= maxItems) {
      setOptimizedData(data);
      return;
    }

    // Implement garbage collection when threshold is reached
    if (data.length > gcThreshold) {
      // Keep the most recent items
      const recentData = data.slice(-maxItems);
      setOptimizedData(recentData);
      
      // Trigger garbage collection if available
      if ('gc' in window && typeof window.gc === 'function') {
        window.gc();
      }
    } else {
      setOptimizedData(data);
    }
  }, [data, maxItems, gcThreshold]);

  // Memory usage estimation
  const estimatedMemoryUsage = useMemo(() => {
    const itemSize = JSON.stringify(optimizedData[0] || {}).length;
    return (itemSize * optimizedData.length) / 1024; // KB
  }, [optimizedData]);

  return {
    data: optimizedData,
    originalCount: data.length,
    optimizedCount: optimizedData.length,
    estimatedMemoryUsage,
    isOptimized: optimizedData.length < data.length
  };
};