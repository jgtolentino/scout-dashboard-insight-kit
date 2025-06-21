import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '@/config/api';

export interface RetailBotAction {
  id: string;
  title: string;
  description: string;
  confidence: number;
  category: 'pricing' | 'promotion' | 'inventory' | 'ops';
  filters?: Record<string, any>;
}

export interface RetailBotResponse {
  actions: RetailBotAction[];
  diagnostics: {
    data_quality: 'good' | 'warn' | 'bad';
    response_time_ms: number;
    model_used: string;
    filters_applied: number;
  };
  query: string;
  timestamp: string;
}

export const useRetailBot = (query: string, filters: Record<string, any> = {}, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['retailbot', query, filters],
    queryFn: async () => {
      // In mock mode, return simulated response
      if (import.meta.env.VITE_USE_MOCKS === 'true') {
        await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate API delay
        
        const mockActions: RetailBotAction[] = [
          {
            id: 'pricing-optimization',
            title: 'Optimize Pricing for Beverages Category',
            description: 'Analysis shows 15% price elasticity in beverages. Recommend 8% price increase on premium SKUs during peak hours (6-8 PM) to maximize revenue without significant volume loss.',
            confidence: 89,
            category: 'pricing',
            filters: { categories: ['Beverages'], hour: '18-20' }
          },
          {
            id: 'inventory-restock',
            title: 'Urgent Restock Alert: Coca-Cola 500ml',
            description: 'Current stock levels at 23% capacity. Based on historical demand patterns, recommend immediate restock of 2,500 units to prevent stockouts during weekend rush.',
            confidence: 94,
            category: 'inventory',
            filters: { brands: ['Coca-Cola'] }
          },
          {
            id: 'promotion-strategy',
            title: 'Cross-Category Bundle Promotion',
            description: 'Data indicates 67% of beverage buyers also purchase snacks. Launch "Combo Deal" promotion: Buy 2 beverages + 1 snack for 15% discount to increase basket size.',
            confidence: 82,
            category: 'promotion',
            filters: { categories: ['Beverages', 'Food & Snacks'] }
          },
          {
            id: 'operational-efficiency',
            title: 'Staff Scheduling Optimization',
            description: 'Peak transaction hours (6-8 PM) show 23% of daily volume but only 18% staff allocation. Recommend adding 2 additional staff members during this period.',
            confidence: 91,
            category: 'ops',
            filters: { hour: '18-20' }
          }
        ];
        
        // Filter actions based on current filters
        let relevantActions = [...mockActions];
        
        if (filters.categories?.length > 0) {
          relevantActions = relevantActions.filter(action => 
            !action.filters?.categories || 
            action.filters.categories.some((cat: string) => filters.categories.includes(cat))
          );
        }
        
        if (filters.brands?.length > 0) {
          relevantActions = relevantActions.filter(action => 
            !action.filters?.brands || 
            action.filters.brands.some((brand: string) => filters.brands.includes(brand))
          );
        }
        
        // Ensure we have at least one action
        if (relevantActions.length === 0) {
          relevantActions = [mockActions[0]];
        }
        
        return {
          actions: relevantActions,
          diagnostics: {
            data_quality: 'good',
            response_time_ms: 842,
            model_used: 'gpt-4',
            filters_applied: Object.keys(filters).filter(key => 
              Array.isArray(filters[key]) ? filters[key].length > 0 : filters[key]
            ).length
          },
          query,
          timestamp: new Date().toISOString()
        };
      }
      
      // Call the real API
      const response = await fetch(`${API_BASE_URL}/retailbot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          filters
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch RetailBot response');
      }
      
      return response.json() as Promise<RetailBotResponse>;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};