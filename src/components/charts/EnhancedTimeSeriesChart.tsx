import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
  LineChart,
  Line,
  ComposedChart,
  Bar
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, TrendingUp, BarChart3, Activity } from "lucide-react";

interface TimeSeriesDataPoint {
  date: string;
  timestamp: number;
  revenue: number;
  transactions: number;
  avgOrderValue: number;
  hour?: number;
  dayOfWeek?: number;
  isWeekend?: boolean;
}

interface EnhancedTimeSeriesChartProps {
  data: TimeSeriesDataPoint[];
  height?: number;
  showBrush?: boolean;
  showWeekendToggle?: boolean;
  className?: string;
}

const EnhancedTimeSeriesChart: React.FC<EnhancedTimeSeriesChartProps> = ({
  data,
  height = 400,
  showBrush = true,
  showWeekendToggle = true,
  className = ''
}) => {
  const [chartType, setChartType] = useState<'area' | 'line' | 'composed'>('area');
  const [weekendFilter, setWeekendFilter] = useState<'all' | 'weekdays' | 'weekends'>('all');
  const [brushDomain, setBrushDomain] = useState<[number, number] | null>(null);

  // Filter data based on weekend toggle
  const filteredData = useMemo(() => {
    if (weekendFilter === 'all') return data;
    
    return data.filter(point => {
      if (weekendFilter === 'weekends') return point.isWeekend;
      if (weekendFilter === 'weekdays') return !point.isWeekend;
      return true;
    });
  }, [data, weekendFilter]);

  // Apply brush domain filter
  const displayData = useMemo(() => {
    if (!brushDomain) return filteredData;
    
    return filteredData.filter((point, index) => 
      index >= brushDomain[0] && index <= brushDomain[1]
    );
  }, [filteredData, brushDomain]);

  // Calculate summary statistics
  const stats = useMemo(() => {
    if (displayData.length === 0) return { totalRevenue: 0, totalTransactions: 0, avgOrderValue: 0, growth: 0 };
    
    const totalRevenue = displayData.reduce((sum, point) => sum + point.revenue, 0);
    const totalTransactions = displayData.reduce((sum, point) => sum + point.transactions, 0);
    const avgOrderValue = totalRevenue / totalTransactions || 0;
    
    // Calculate growth rate (comparing first and last periods)
    const firstPeriod = displayData.slice(0, Math.floor(displayData.length / 2));
    const secondPeriod = displayData.slice(Math.floor(displayData.length / 2));
    
    const firstAvg = firstPeriod.reduce((sum, p) => sum + p.revenue, 0) / firstPeriod.length;
    const secondAvg = secondPeriod.reduce((sum, p) => sum + p.revenue, 0) / secondPeriod.length;
    const growth = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;
    
    return { totalRevenue, totalTransactions, avgOrderValue, growth };
  }, [displayData]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{`Date: ${label}`}</p>
          <div className="space-y-1 mt-2">
            {payload.map((entry: any, index: number) => (
              <p key={index} style={{ color: entry.color }} className="text-sm">
                {`${entry.dataKey === 'avgOrderValue' ? 'Avg Order Value' : 
                   entry.dataKey === 'transactions' ? 'Transactions' : 'Revenue'}: 
                  ${entry.dataKey === 'transactions' ? 
                    entry.value.toLocaleString() : 
                    '₱' + entry.value.toLocaleString()}`}
              </p>
            ))}
            {data.isWeekend && (
              <p className="text-xs text-blue-600 font-medium">Weekend</p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Handle brush change
  const handleBrushChange = (brushData: any) => {
    if (brushData && brushData.startIndex !== undefined && brushData.endIndex !== undefined) {
      setBrushDomain([brushData.startIndex, brushData.endIndex]);
    } else {
      setBrushDomain(null);
    }
  };

  const renderChart = () => {
    const commonProps = {
      data: displayData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              name="Revenue (₱)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="transactions"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              name="Transactions"
            />
          </LineChart>
        );

      case 'composed':
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              yAxisId="right"
              dataKey="transactions"
              fill="#10b981"
              fillOpacity={0.6}
              name="Transactions"
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
              name="Revenue (₱)"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="avgOrderValue"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              name="Avg Order Value (₱)"
            />
          </ComposedChart>
        );

      default: // area
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stackId="1"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.6}
              name="Revenue (₱)"
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="transactions"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.4}
              name="Transactions"
            />
          </AreaChart>
        );
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Transaction Trends Analysis
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* Chart Type Toggle */}
            <div className="flex rounded-lg border p-1">
              <Button
                variant={chartType === 'area' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('area')}
                className="px-3 py-1"
              >
                <Activity className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === 'line' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('line')}
                className="px-3 py-1"
              >
                <TrendingUp className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === 'composed' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('composed')}
                className="px-3 py-1"
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
            </div>

            {/* Weekend Filter Toggle */}
            {showWeekendToggle && (
              <div className="flex rounded-lg border p-1">
                <Button
                  variant={weekendFilter === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setWeekendFilter('all')}
                  className="px-3 py-1 text-xs"
                >
                  All
                </Button>
                <Button
                  variant={weekendFilter === 'weekdays' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setWeekendFilter('weekdays')}
                  className="px-3 py-1 text-xs"
                >
                  Weekdays
                </Button>
                <Button
                  variant={weekendFilter === 'weekends' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setWeekendFilter('weekends')}
                  className="px-3 py-1 text-xs"
                >
                  Weekends
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
          <div className="space-y-1">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-lg font-semibold">₱{stats.totalRevenue.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">Total Transactions</p>
            <p className="text-lg font-semibold">{stats.totalTransactions.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">Avg Order Value</p>
            <p className="text-lg font-semibold">₱{stats.avgOrderValue.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">Growth Rate</p>
            <p className={`text-lg font-semibold ${stats.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.growth >= 0 ? '+' : ''}{stats.growth.toFixed(1)}%
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div style={{ height: height }}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>

        {/* Brush for time window selection */}
        {showBrush && (
          <div className="mt-4" style={{ height: 100 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={filteredData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis hide />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
                <Brush
                  dataKey="date"
                  height={30}
                  stroke="#3b82f6"
                  onChange={handleBrushChange}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedTimeSeriesChart;