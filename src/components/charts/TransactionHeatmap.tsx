import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, TrendingUp } from "lucide-react";
import { scaleLinear } from 'd3-scale';

interface HeatmapDataPoint {
  date: string;
  hour: number;
  dayOfWeek: number;
  value: number;
  transactions: number;
  revenue: number;
  isWeekend: boolean;
}

interface TransactionHeatmapProps {
  data: HeatmapDataPoint[];
  metric?: 'transactions' | 'revenue' | 'avgOrderValue';
  className?: string;
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const TransactionHeatmap: React.FC<TransactionHeatmapProps> = ({
  data,
  metric = 'transactions',
  className = ''
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'transactions' | 'revenue' | 'avgOrderValue'>(metric);
  const [hoveredCell, setHoveredCell] = useState<{ day: number; hour: number } | null>(null);

  // Process data into heatmap format
  const heatmapData = useMemo(() => {
    const matrix: { [key: string]: number } = {};
    const cellData: { [key: string]: HeatmapDataPoint[] } = {};
    
    // Initialize matrix and cell data
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const key = `${day}-${hour}`;
        matrix[key] = 0;
        cellData[key] = [];
      }
    }
    
    // Populate matrix with data
    data.forEach(point => {
      const key = `${point.dayOfWeek}-${point.hour}`;
      
      let value = 0;
      switch (selectedMetric) {
        case 'transactions':
          value = point.transactions;
          break;
        case 'revenue':
          value = point.revenue;
          break;
        case 'avgOrderValue':
          value = point.transactions > 0 ? point.revenue / point.transactions : 0;
          break;
      }
      
      matrix[key] += value;
      cellData[key].push({ ...point, value });
    });
    
    // Calculate averages for cells with multiple data points
    Object.keys(matrix).forEach(key => {
      if (cellData[key].length > 1) {
        matrix[key] = matrix[key] / cellData[key].length;
      }
    });
    
    return { matrix, cellData };
  }, [data, selectedMetric]);

  // Calculate color scale
  const colorScale = useMemo(() => {
    const values = Object.values(heatmapData.matrix).filter(v => v > 0);
    if (values.length === 0) return () => '#f3f4f6';
    
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    
    return scaleLinear<string>()
      .domain([0, minValue, maxValue])
      .range(['#f3f4f6', '#dbeafe', '#1e40af']);
  }, [heatmapData.matrix]);

  // Get cell statistics
  const getCellStats = (day: number, hour: number) => {
    const key = `${day}-${hour}`;
    const cells = heatmapData.cellData[key];
    const value = heatmapData.matrix[key];
    
    if (cells.length === 0) {
      return {
        value: 0,
        transactions: 0,
        revenue: 0,
        avgOrderValue: 0,
        count: 0
      };
    }
    
    const totalTransactions = cells.reduce((sum, cell) => sum + cell.transactions, 0);
    const totalRevenue = cells.reduce((sum, cell) => sum + cell.revenue, 0);
    const avgTransactions = totalTransactions / cells.length;
    const avgRevenue = totalRevenue / cells.length;
    const avgOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    
    return {
      value,
      transactions: avgTransactions,
      revenue: avgRevenue,
      avgOrderValue,
      count: cells.length
    };
  };

  // Format value for display
  const formatValue = (value: number) => {
    switch (selectedMetric) {
      case 'transactions':
        return value.toFixed(0);
      case 'revenue':
      case 'avgOrderValue':
        return `₱${value.toLocaleString()}`;
      default:
        return value.toString();
    }
  };

  // Get metric title
  const getMetricTitle = () => {
    switch (selectedMetric) {
      case 'transactions':
        return 'Average Transactions';
      case 'revenue':
        return 'Average Revenue';
      case 'avgOrderValue':
        return 'Average Order Value';
      default:
        return 'Transactions';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Transaction Heatmap - {getMetricTitle()}
          </CardTitle>
          
          {/* Metric Selection */}
          <div className="flex rounded-lg border p-1">
            <Button
              variant={selectedMetric === 'transactions' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedMetric('transactions')}
              className="px-3 py-1 text-xs"
            >
              Transactions
            </Button>
            <Button
              variant={selectedMetric === 'revenue' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedMetric('revenue')}
              className="px-3 py-1 text-xs"
            >
              Revenue
            </Button>
            <Button
              variant={selectedMetric === 'avgOrderValue' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedMetric('avgOrderValue')}
              className="px-3 py-1 text-xs"
            >
              AOV
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Heatmap Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Hour headers */}
              <div className="flex">
                <div className="w-20 h-8 flex items-center justify-center text-xs font-medium text-gray-600">
                  Hour
                </div>
                {HOURS.map(hour => (
                  <div
                    key={hour}
                    className="w-8 h-8 flex items-center justify-center text-xs font-medium text-gray-600 border-l border-gray-200"
                  >
                    {hour}
                  </div>
                ))}
              </div>
              
              {/* Heatmap rows */}
              {DAYS_OF_WEEK.map((day, dayIndex) => (
                <div key={dayIndex} className="flex border-t border-gray-200">
                  <div className="w-20 h-12 flex items-center justify-start px-2 text-xs font-medium text-gray-700 bg-gray-50">
                    {day}
                  </div>
                  {HOURS.map(hour => {
                    const stats = getCellStats(dayIndex, hour);
                    const isHovered = hoveredCell?.day === dayIndex && hoveredCell?.hour === hour;
                    
                    return (
                      <div
                        key={`${dayIndex}-${hour}`}
                        className={`w-8 h-12 border-l border-gray-200 cursor-pointer relative transition-all duration-200 ${
                          isHovered ? 'ring-2 ring-blue-500 z-10' : ''
                        }`}
                        style={{ 
                          backgroundColor: colorScale(stats.value),
                        }}
                        onMouseEnter={() => setHoveredCell({ day: dayIndex, hour })}
                        onMouseLeave={() => setHoveredCell(null)}
                        title={`${day} ${hour}:00 - ${formatValue(stats.value)}`}
                      >
                        {/* Tooltip */}
                        {isHovered && (
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white border rounded-lg shadow-lg p-3 text-xs z-20 min-w-48">
                            <div className="font-semibold text-gray-800 mb-2">
                              {day} {hour}:00 - {hour + 1}:00
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Transactions:</span>
                                <span className="font-medium">{stats.transactions.toFixed(0)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Revenue:</span>
                                <span className="font-medium">₱{stats.revenue.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Avg Order:</span>
                                <span className="font-medium">₱{stats.avgOrderValue.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Data Points:</span>
                                <span className="font-medium">{stats.count}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Intensity Scale:</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">Low</span>
                <div className="flex">
                  {Array.from({ length: 10 }, (_, i) => {
                    const intensity = i / 9;
                    return (
                      <div
                        key={i}
                        className="w-4 h-4"
                        style={{
                          backgroundColor: colorScale(intensity * Math.max(...Object.values(heatmapData.matrix)))
                        }}
                      />
                    );
                  })}
                </div>
                <span className="text-xs text-gray-600">High</span>
              </div>
            </div>
            
            {/* Peak hours summary */}
            <div className="text-right">
              <div className="text-sm font-medium text-gray-700">Peak Activity</div>
              <div className="text-xs text-gray-600">
                {(() => {
                  const maxValue = Math.max(...Object.values(heatmapData.matrix));
                  const peakCells = Object.entries(heatmapData.matrix)
                    .filter(([_, value]) => value === maxValue)
                    .slice(0, 3);
                  
                  return peakCells.map(([key]) => {
                    const [day, hour] = key.split('-').map(Number);
                    return `${DAYS_OF_WEEK[day].slice(0, 3)} ${hour}:00`;
                  }).join(', ');
                })()}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionHeatmap;