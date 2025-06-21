
import React from 'react';
import useSWR from 'swr';
import { useFilterStore } from '@/stores/filterStore';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface SubstitutionFlowChartProps {
  dataUrl?: string;
  className?: string;
}

export default function SubstitutionFlowChart({ dataUrl, className }: SubstitutionFlowChartProps) {
  const { getQueryString } = useFilterStore();
  
  // Use the global filter store to build the query string or use provided dataUrl
  const queryString = getQueryString();
  const apiUrl = dataUrl || `/api/substitution${queryString ? '?' + queryString : ''}`;
  
  const { data, error, isLoading } = useSWR(apiUrl, fetcher);
  
  if (isLoading) {
    return (
      <div className={`animate-pulse bg-gray-100 rounded ${className}`}>
        <div className="h-64 flex items-center justify-center">
          <div className="text-gray-500">Loading substitution data...</div>
        </div>
      </div>
    );
  }
  
  if (error || !data) {
    return (
      <div className={`bg-gray-50 rounded border-2 border-dashed border-gray-300 ${className}`}>
        <div className="h-64 flex items-center justify-center flex-col space-y-2">
          <div className="text-gray-600 font-medium">Brand Substitution Flow</div>
          <div className="text-sm text-gray-500">Sankey diagram showing brand switching patterns</div>
          <div className="text-xs text-gray-400">API endpoint: {apiUrl}</div>
        </div>
      </div>
    );
  }

  // Simplified substitution visualization (placeholder for full Sankey implementation)
  const substitutions = data.data || [
    { from: 'Coca-Cola', to: 'Pepsi', count: 234 },
    { from: 'Lucky Me', to: 'Nissin', count: 189 },
    { from: 'Tide', to: 'Surf', count: 156 },
    { from: 'San Miguel', to: 'Red Horse', count: 142 },
    { from: 'Nestle', to: 'Unilever', count: 98 }
  ];

  return (
    <div className={`bg-white rounded-lg border p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Brand Substitution Patterns</h3>
        <p className="text-sm text-gray-600">Top brand switching behaviors</p>
      </div>
      
      <div className="space-y-4">
        {substitutions.map((sub: any, index: number) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="font-medium text-gray-900">{sub.from}</span>
              <span className="text-gray-400">→</span>
              <span className="font-medium text-gray-900">{sub.to}</span>
            </div>
            <div className="text-sm text-gray-600">
              {sub.count} switches
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-xs text-gray-400 text-center">
        Full Sankey diagram implementation pending D3.js integration
      </div>
    </div>
  );
}
