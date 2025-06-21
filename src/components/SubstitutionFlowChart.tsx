import React from 'react';
import { useSubstitutionData } from '@/hooks/useSubstitutionData';
import { useFilterStore } from '@/stores/filterStore';

export default function SubstitutionFlowChart() {
  const filters = useFilterStore();
  const { data, error, isLoading } = useSubstitutionData(filters);
  
  if (isLoading) {
    return (
      <div className="animate-pulse bg-gray-100 rounded">
        <div className="h-64 flex items-center justify-center">
          <div className="text-gray-500">Loading substitution data...</div>
        </div>
      </div>
    );
  }
  
  if (error || !data) {
    return (
      <div className="bg-gray-50 rounded border-2 border-dashed border-gray-300">
        <div className="h-64 flex items-center justify-center flex-col space-y-2">
          <div className="text-gray-600 font-medium">Brand Substitution Flow</div>
          <div className="text-sm text-gray-500">Unable to load substitution data</div>
        </div>
      </div>
    );
  }

  // Process substitution data
  // Group by original and substitute product pairs
  const substitutionCounts: Record<string, number> = {};
  const brandMap: Record<string, string> = {};
  
  data.data.forEach(sub => {
    const key = `${sub.original_product_id}-${sub.substitute_product_id}`;
    substitutionCounts[key] = (substitutionCounts[key] || 0) + 1;
    
    // Store brand names if available
    if (sub.from_brand && sub.to_brand) {
      brandMap[key] = `${sub.from_brand}-${sub.to_brand}`;
    }
  });
  
  // Convert to array and sort by count
  const substitutions = Object.entries(substitutionCounts)
    .map(([key, count]) => {
      const [from, to] = key.split('-');
      const brandKey = brandMap[key];
      let fromBrand = from;
      let toBrand = to;
      
      if (brandKey) {
        [fromBrand, toBrand] = brandKey.split('-');
      }
      
      return { from: fromBrand, to: toBrand, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5 substitutions

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Brand Substitution Patterns</h3>
        <p className="text-sm text-gray-600">Top brand switching behaviors</p>
      </div>
      
      <div className="space-y-4">
        {substitutions.map((sub, index) => (
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
        
        {substitutions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No substitution data available
          </div>
        )}
      </div>
      
      <div className="mt-4 text-xs text-gray-400 text-center">
        Full Sankey diagram implementation pending D3.js integration
      </div>
    </div>
  );
}