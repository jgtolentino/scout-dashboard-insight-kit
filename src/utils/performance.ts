// Performance monitoring and optimization utilities

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  private observers: PerformanceObserver[] = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Measure component render time
  measureRender(componentName: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      this.addMetric(`render_${componentName}`, duration);
    };
  }

  // Measure API call duration
  measureApiCall(endpoint: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      this.addMetric(`api_${endpoint}`, duration);
    };
  }

  // Add metric to collection
  private addMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
  }

  // Get performance statistics
  getMetrics(name: string): {
    min: number;
    max: number;
    avg: number;
    count: number;
  } | null {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return null;

    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((sum, val) => sum + val, 0) / values.length,
      count: values.length
    };
  }

  // Start monitoring Core Web Vitals
  startCoreWebVitalsMonitoring(): void {
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.addMetric('lcp', entry.startTime);
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      this.observers.push(lcpObserver);

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.addMetric('fid', entry.processingStart - entry.startTime);
        }
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
      this.observers.push(fidObserver);

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        this.addMetric('cls', clsValue);
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
      this.observers.push(clsObserver);
    }
  }

  // Clean up observers
  disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }

  // Export metrics for analysis
  exportMetrics(): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const [name, values] of this.metrics.entries()) {
      result[name] = this.getMetrics(name);
    }
    
    return result;
  }
}

// Data processing optimization utilities
export const DataProcessor = {
  // Debounce function for expensive operations
  debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  },

  // Throttle function for frequent events
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // Chunk large arrays for processing
  chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  },

  // Process data in chunks with yielding
  async processInChunks<T, R>(
    data: T[],
    processor: (chunk: T[]) => R[],
    chunkSize: number = 100
  ): Promise<R[]> {
    const chunks = this.chunkArray(data, chunkSize);
    const results: R[] = [];

    for (const chunk of chunks) {
      const chunkResults = processor(chunk);
      results.push(...chunkResults);
      
      // Yield control to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    return results;
  },

  // Memoization with LRU cache
  createMemoized<T extends (...args: any[]) => any>(
    fn: T,
    maxSize: number = 100
  ): T {
    const cache = new Map();
    const keys: any[] = [];

    return ((...args: Parameters<T>) => {
      const key = JSON.stringify(args);
      
      if (cache.has(key)) {
        return cache.get(key);
      }

      const result = fn(...args);
      
      if (keys.length >= maxSize) {
        const oldestKey = keys.shift();
        cache.delete(oldestKey);
      }
      
      keys.push(key);
      cache.set(key, result);
      
      return result;
    }) as T;
  }
};

// Memory management utilities
export const MemoryManager = {
  // Monitor memory usage
  getMemoryUsage(): {
    used: number;
    total: number;
    percentage: number;
  } | null {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
      };
    }
    return null;
  },

  // Force garbage collection if available
  forceGC(): boolean {
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
      return true;
    }
    return false;
  },

  // Clean up large objects
  cleanupLargeObjects(refs: Array<{ current: any }>): void {
    refs.forEach(ref => {
      if (ref.current) {
        // Clear DOM references
        if (ref.current.querySelector) {
          ref.current.innerHTML = '';
        }
        ref.current = null;
      }
    });
  }
};

// Bundle analysis utilities
export const BundleAnalyzer = {
  // Measure initial bundle load time
  measureBundleLoad(): Promise<number> {
    return new Promise((resolve) => {
      const startTime = performance.now();
      
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name.includes('chunk') || entry.name.includes('bundle')) {
            const loadTime = entry.responseEnd - entry.requestStart;
            resolve(loadTime);
            observer.disconnect();
            return;
          }
        }
      });
      
      observer.observe({ type: 'navigation', buffered: true });
      
      // Fallback timeout
      setTimeout(() => {
        const endTime = performance.now();
        resolve(endTime - startTime);
        observer.disconnect();
      }, 5000);
    });
  },

  // Analyze loaded resources
  getLoadedResources(): {
    scripts: PerformanceEntry[];
    stylesheets: PerformanceEntry[];
    images: PerformanceEntry[];
    total: number;
  } {
    const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    const scripts = entries.filter(entry => 
      entry.name.includes('.js') || entry.name.includes('.mjs')
    );
    
    const stylesheets = entries.filter(entry => 
      entry.name.includes('.css')
    );
    
    const images = entries.filter(entry => 
      /\.(jpg|jpeg|png|gif|svg|webp)/.test(entry.name)
    );

    return {
      scripts,
      stylesheets,
      images,
      total: entries.length
    };
  }
};

// Performance React hooks
export const usePerformanceMonitoring = (componentName: string) => {
  const monitor = PerformanceMonitor.getInstance();
  
  return {
    measureRender: () => monitor.measureRender(componentName),
    getMetrics: () => monitor.getMetrics(`render_${componentName}`)
  };
};

// Initialize performance monitoring
export const initializePerformanceMonitoring = () => {
  const monitor = PerformanceMonitor.getInstance();
  monitor.startCoreWebVitalsMonitoring();
  
  // Report metrics periodically in development
  if (import.meta.env.MODE === 'development') {
    setInterval(() => {
      const metrics = monitor.exportMetrics();
      console.group('📊 Performance Metrics');
      console.table(metrics);
      console.groupEnd();
    }, 30000); // Every 30 seconds
  }
  
  return monitor;
};