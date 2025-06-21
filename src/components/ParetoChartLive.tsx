
import React from 'react';
import useSWR from 'swr';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart } from 'recharts';
import { useFilterStore } from '@/stores/filterStore';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function ParetoChartLive() {
  const { getQueryString } = useFilterStore();
  
  // Use the global filter store to build the query string
  const queryString = getQueryString();
  const apiUrl = `/api/products?sort=revenue&limit=10${queryString ? '&' + queryString : ''}`;
  
  const { data, error, isLoading } = useSWR(apiUrl, fetcher);
  
  if (isLoading) return <div className="animate-pulse h-48 bg-gray-100 rounded" />;
  if (error || !data) return <div className="h-48 flex items-center justify-center text-gray-500">Unable to load data</div>;
  
  // Transform data for Pareto chart (80/20 rule visualization)
  const products = data.data || [];
  const totalRevenue = products.reduce((sum: number, product: any) => sum + (product.revenue || product.price * 50), 0);
  
  let cumulativePercentage = 0;
  const paretoData = products.map((product: any, index: number) => {
    const revenue = product.revenue || product.price * (50 - index * 5);
    const percentage = (revenue / totalRevenue) * 100;
    cumulativePercentage += percentage;
    
    return {
      name: product.name || `Product ${index + 1}`,
      revenue: revenue,
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
            name === 'revenue' ? `₱${value.toLocaleString()}` : `${value.toFixed(1)}%`,
            name === 'revenue' ? 'Revenue' : name === 'cumulative' ? 'Cumulative %' : 'Share %'
          ]}
        />
        <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" />
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
