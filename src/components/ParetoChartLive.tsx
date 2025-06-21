import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart } from 'recharts';
import { useFilterStore } from '@/stores/filterStore';
import { useCategoryMixData } from '@/hooks/useCategoryMixData';

export default function ParetoChartLive() {
  const filters = useFilterStore();
  const { data, error, isLoading } = useCategoryMixData(filters);
  
  if (isLoading) return <div className="animate-pulse h-48 bg-gray-100 rounded" />;
  if (error) return <div className="h-48 flex items-center justify-center text-gray-500">Unable to load data</div>;
  
  // Transform data for Pareto chart (80/20 rule visualization)
  const categories = data?.data || [];
  const totalShare = categories.reduce((sum, category) => sum + category.share, 0);
  
  let cumulativePercentage = 0;
  const paretoData = categories.map((category) => {
    const percentage = (category.share / totalShare) * 100;
    cumulativePercentage += percentage;
    
    return {
      name: category.category,
      share: category.share,
      percentage: percentage,
      cumulative: cumulativePercentage
    };
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={paretoData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          angle={-45}
          textAnchor="end"
          height={80}
          fontSize={12}
        />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip 
          formatter={(value, name) => [
            name === 'share' 
              ? value.toLocaleString()
              : `${typeof value === 'number' ? value.toFixed(1) : value}%`,
            name === 'share' ? 'Count' : name === 'cumulative' ? 'Cumulative %' : 'Share %'
          ]}
        />
        <Bar yAxisId="left" dataKey="share" fill="#3b82f6" />
        <Line 
          yAxisId="right" 
          type="monotone" 
          dataKey="cumulative" 
          stroke="#ef4444" 
          strokeWidth={2}
          dot={{ fill: '#ef4444' }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}