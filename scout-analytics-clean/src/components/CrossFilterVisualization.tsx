import React, { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useFilterStore } from '../store/useFilterStore';
import { Filter, TrendingUp, Users, Package } from 'lucide-react';

interface CrossFilterProps {
  data: any[];
  dimension: string;
  metric: string;
  chartType: 'bar' | 'line' | 'doughnut';
  title: string;
  onDrilldown?: (dimension: string, value: string) => void;
  className?: string;
}

const CrossFilterVisualization: React.FC<CrossFilterProps> = ({
  data,
  dimension,
  metric,
  chartType,
  title,
  onDrilldown,
  className = ''
}) => {
  const [filteredData, setFilteredData] = useState(data);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  
  const filters = useFilterStore();
  
  // Apply cross-filters
  useEffect(() => {
    let filtered = [...data];
    
    // Apply active filters
    if (filters.regions && filters.regions.length > 0) {
      filtered = filtered.filter(d => filters.regions.includes(d.region));
    }
    if (filters.brands && filters.brands.length > 0) {
      filtered = filtered.filter(d => filters.brands.includes(d.brand));
    }
    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(d => filters.categories.includes(d.category));
    }
    
    setFilteredData(filtered);
  }, [data, filters]);
  
  // Process data for chart
  const chartData = React.useMemo(() => {
    const aggregated = filteredData.reduce((acc, item) => {
      const key = item[dimension];
      if (!acc[key]) {
        acc[key] = { value: 0, count: 0 };
      }
      acc[key].value += item[metric] || 0;
      acc[key].count += 1;
      return acc;
    }, {} as Record<string, { value: number; count: number }>);
    
    // Convert to Recharts format
    return Object.entries(aggregated).map(([name, data], index) => ({
      name,
      value: data.value,
      count: data.count,
      color: getColor(dimension, index)
    }));
  }, [filteredData, dimension, metric]);

  // Color scheme based on dimension
  const getColor = (dimension: string, index: number) => {
    const colors = {
      region: ['#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE', '#1E40AF'],
      brand: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#047857'],
      category: ['#F59E0B', '#FBBF24', '#FCD34D', '#FEF3C7', '#D97706'],
      store: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#E9D5FF', '#7C3AED'],
      date: ['#EF4444', '#F87171', '#FCA5A5', '#FECACA', '#DC2626']
    };
    const colorSet = colors[dimension as keyof typeof colors] || colors.brand;
    return colorSet[index % colorSet.length];
  };
  
  // Handle chart interactions
  const handleChartClick = (data: any, index: number) => {
    const name = data.name;
    
    // Handle single click for cross-filtering
    if (selectedItems.has(name)) {
      selectedItems.delete(name);
    } else {
      selectedItems.add(name);
    }
    setSelectedItems(new Set(selectedItems));
    
    // Apply cross-filter
    if (dimension === 'region') {
      filters.setBarangays([...selectedItems]);
    } else if (dimension === 'brand') {
      filters.setBrands([...selectedItems]);
    } else if (dimension === 'category') {
      filters.setCategories([...selectedItems]);
    }
  };

  const handleDrillDown = (data: any) => {
    if (onDrilldown) {
      onDrilldown(dimension, data.name);
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-medium text-slate-900">{`${dimension}: ${label}`}</p>
          <p className="text-blue-600">
            {`${metric}: ${new Intl.NumberFormat('en-PH', {
              style: 'currency',
              currency: 'PHP',
              notation: 'compact'
            }).format(payload[0].value)}`}
          </p>
          <p className="text-xs text-slate-500 mt-1">Click to filter • Double-click to drill down</p>
        </div>
      );
    }
    return null;
  };
  
  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                onClick={handleChartClick}
                onDoubleClick={handleDrillDown}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'doughnut':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                onClick={handleChartClick}
                onDoubleClick={handleDrillDown}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    stroke={selectedItems.has(entry.name) ? '#1e40af' : 'none'}
                    strokeWidth={selectedItems.has(entry.name) ? 2 : 0}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                fill="#3B82F6"
                onClick={handleChartClick}
                onDoubleClick={handleDrillDown}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    stroke={selectedItems.has(entry.name) ? '#1e40af' : 'none'}
                    strokeWidth={selectedItems.has(entry.name) ? 2 : 0}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };
  
  const getIcon = () => {
    switch (dimension) {
      case 'region':
        return <TrendingUp className="w-4 h-4" />;
      case 'brand':
        return <Package className="w-4 h-4" />;
      case 'category':
        return <Filter className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };
  
  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
            {getIcon()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-600">
              {filteredData.length < data.length ? 
                `Filtered: ${filteredData.length}/${data.length} items` : 
                `${data.length} items`
              }
            </p>
          </div>
        </div>
        
        {/* Selection Indicator */}
        {selectedItems.size > 0 && (
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
              {selectedItems.size} selected
            </span>
            <button
              onClick={() => {
                setSelectedItems(new Set());
                // Clear corresponding filters
                if (dimension === 'region') filters.setBarangays([]);
                else if (dimension === 'brand') filters.setBrands([]);
                else if (dimension === 'category') filters.setCategories([]);
              }}
              className="text-xs text-blue-600 hover:text-blue-700 underline"
            >
              Clear
            </button>
          </div>
        )}
      </div>
      
      {/* Chart */}
      <div className="h-64 relative">
        {chartData.labels.length > 0 ? (
          renderChart()
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">
            <div className="text-center">
              <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No data matches current filters</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Interaction Instructions */}
      <div className="mt-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>💡 Click to filter • Double-click to drill down</span>
          <span className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full opacity-75"></div>
            <span>Cross-filtering active</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default CrossFilterVisualization;