import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, BarChart3, List } from "lucide-react";
import PhilippinesChoroplethMap from './PhilippinesChoroplethMap';
import { useNavigate } from 'react-router-dom';
import { useFilterStore } from '@/stores/filterStore';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '@/config/api';

interface RegionalData {
  name: string;
  value: number;
  color?: string;
  percentage?: string;
}

interface RegionalPerformanceMapProps {
  title?: string;
  data?: RegionalData[];
}

const RegionalPerformanceMap: React.FC<RegionalPerformanceMapProps> = ({ 
  title = "Regional Performance",
  data: initialData 
}) => {
  const navigate = useNavigate();
  const { setFilter, getQueryString } = useFilterStore();
  const [viewType, setViewType] = useState<'list' | 'chart'>('list');
  const filters = useFilterStore();
  
  // Fetch regional data if not provided
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['regional-performance', filters],
    queryFn: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/regions`);
        if (!response.ok) {
          throw new Error('Failed to fetch regional data');
        }
        const data = await response.json();
        
        // Transform API data to expected format
        return data.data.map((region: any) => ({
          name: region.name,
          value: region.revenue || region.count || 0,
          color: getRegionColor(region.revenue || region.count || 0),
          percentage: region.growth ? `${region.growth > 0 ? '+' : ''}${region.growth}%` : undefined
        }));
      } catch (error) {
        console.error('Error fetching regional data:', error);
        return [];
      }
    },
    enabled: !initialData,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
  
  // Use provided data or fetched data
  const regionalData = initialData || fetchedData || [];
  
  // Function to get color based on value
  function getRegionColor(value: number): string {
    if (value > 1000000) return '#1e40af'; // dark blue
    if (value > 750000) return '#3b82f6'; // medium blue
    if (value > 500000) return '#60a5fa'; // light blue
    if (value > 250000) return '#93c5fd'; // lighter blue
    return '#dbeafe'; // very light blue
  }
  
  const handleRegionClick = (region: string) => {
    // Set filter for the clicked region
    setFilter('barangays', [region]);
    
    // Navigate to transaction trends with the filter applied
    navigate(`/transaction-trends?${getQueryString()}`);
  };

  if (isLoading && !initialData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !initialData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center flex-col space-y-4">
            <p className="text-muted-foreground">Unable to load regional data</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            {title}
          </CardTitle>
          <div className="flex space-x-2">
            <Button
              variant={viewType === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewType('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewType === 'chart' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewType('chart')}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <PhilippinesChoroplethMap 
            data={regionalData} 
            height={250}
            onRegionClick={handleRegionClick}
          />
        </div>
        
        {viewType === 'list' ? (
          <div className="space-y-3 mt-4">
            {regionalData.length > 0 ? (
              regionalData.map((region) => (
                <div 
                  key={region.name} 
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                  onClick={() => handleRegionClick(region.name)}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: region.color }}
                    ></div>
                    <span className="font-medium">{region.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">₱{(region.value / 1000000).toFixed(1)}M</div>
                    {region.percentage && (
                      <div className={`text-sm ${region.percentage.startsWith('-') ? 'text-red-600' : 'text-green-600'}`}>
                        {region.percentage}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                No regional data available
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 h-64">
            {regionalData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionalData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => `₱${(value / 1000000).toFixed(1)}M`} />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip 
                    formatter={(value) => [`₱${(value as number / 1000000).toFixed(1)}M`, 'Revenue']}
                    labelFormatter={(value) => `Region: ${value}`}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#3b82f6" 
                    onClick={(data) => handleRegionClick(data.name)}
                    cursor="pointer"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No regional data available
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RegionalPerformanceMap;