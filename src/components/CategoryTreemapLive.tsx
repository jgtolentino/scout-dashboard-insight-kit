import React, { useState } from 'react';
import { ResponsiveContainer, Treemap, Tooltip, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useFilterStore } from '@/stores/filterStore';
import { useCategoryMixData } from '@/hooks/useCategoryMixData';
import { Button } from '@/components/ui/button';
import { BarChart3, PieChart as PieChartIcon, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CategoryTreemapLive() {
  const [viewType, setViewType] = useState<'treemap' | 'pie' | 'bar'>('treemap');
  const filters = useFilterStore();
  const { data, isLoading, error } = useCategoryMixData(filters);
  const navigate = useNavigate();
  const { setFilter, getQueryString } = useFilterStore();
  
  const handleCategoryClick = (categoryName: string) => {
    setFilter('categories', [categoryName]);
    navigate(`/product-mix?${getQueryString()}`);
  };
  
  if (isLoading) return <div className="animate-pulse h-48 bg-gray-100 rounded" />;
  if (error) return <div className="h-48 flex items-center justify-center text-gray-500">Unable to load data</div>;
  
  // Transform data for visualization
  const categories = data?.data || [];
  
  // Use real data or empty array if API returns empty
  const chartData = categories.length > 0 ? categories : [];
  
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00C49F', '#FFBB28', '#FF8042'];

  const renderTreemap = () => (
    <ResponsiveContainer width="100%" height={250}>
      <Treemap
        data={chartData}
        dataKey="share"
        aspectRatio={4/3}
        stroke="#fff"
        onClick={(data) => handleCategoryClick(data.category)}
      >
        <Tooltip 
          formatter={(value, name, props) => [`${value.toFixed(1)}%`, 'Share']}
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              return (
                <div className="bg-white p-2 border rounded shadow-sm">
                  <p className="font-medium">{data.category}</p>
                  <p className="text-sm">Share: {data.share.toFixed(1)}%</p>
                  <p className="text-sm">Count: {data.count.toLocaleString()}</p>
                </div>
              );
            }
            return null;
          }}
        />
      </Treemap>
    </ResponsiveContainer>
  );

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="share"
          nameKey="category"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          onClick={(data) => handleCategoryClick(data.category)}
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.color || COLORS[index % COLORS.length]} 
              className="cursor-pointer hover:opacity-80"
            />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value, name, props) => [`${value.toFixed(1)}%`, 'Share']}
        />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="category" />
        <YAxis />
        <Tooltip 
          formatter={(value, name) => [
            name === 'share' ? `${value.toFixed(1)}%` : value.toLocaleString(),
            name === 'share' ? 'Share' : 'Count'
          ]}
        />
        <Bar 
          dataKey="share" 
          fill="#8884d8" 
          onClick={(data) => handleCategoryClick(data.category)}
          cursor="pointer"
        />
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <div>
      <div className="flex justify-end mb-4 space-x-2">
        <Button
          variant={viewType === 'treemap' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewType('treemap')}
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button
          variant={viewType === 'pie' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewType('pie')}
        >
          <PieChartIcon className="h-4 w-4" />
        </Button>
        <Button
          variant={viewType === 'bar' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewType('bar')}
        >
          <BarChart3 className="h-4 w-4" />
        </Button>
      </div>
      
      {viewType === 'treemap' && renderTreemap()}
      {viewType === 'pie' && renderPieChart()}
      {viewType === 'bar' && renderBarChart()}
      
      {chartData.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
          <p className="text-sm text-blue-700">
            <span className="font-bold">Top Category:</span> {chartData[0]?.category} ({chartData[0]?.share.toFixed(1)}% of total)
          </p>
        </div>
      )}
      
      {chartData.length === 0 && (
        <div className="mt-4 p-3 bg-amber-50 rounded-lg border-l-4 border-amber-500">
          <p className="text-sm text-amber-700">
            No category data available for the current filters.
          </p>
        </div>
      )}
    </div>
  );
}