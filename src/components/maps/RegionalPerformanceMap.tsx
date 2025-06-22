import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, BarChart3, List } from "lucide-react";
import PhilippinesChoroplethMap from './PhilippinesChoroplethMap';
import { useNavigate } from 'react-router-dom';
import { useFilterStore } from '@/stores/filterStore';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RegionalData {
  name: string;
  value: number;
  color?: string;
  percentage?: string;
}

interface RegionalPerformanceMapProps {
  title?: string;
  data: RegionalData[];
}

const RegionalPerformanceMap: React.FC<RegionalPerformanceMapProps> = ({ 
  title = "Regional Performance",
  data 
}) => {
  const navigate = useNavigate();
  const { setFilter, getQueryString } = useFilterStore();
  const [viewType, setViewType] = useState<'list' | 'chart'>('list');
  
  const handleRegionClick = (region: string) => {
    // Set filter for the clicked region
    setFilter('barangays', [region]);
    
    // Navigate to transaction trends with the filter applied
    navigate(`/transaction-trends?${getQueryString()}`);
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
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
            data={data} 
            height={250}
            onRegionClick={handleRegionClick}
          />
        </div>
        
        {viewType === 'list' ? (
          <div className="space-y-3 mt-4">
            {data.map((region) => (
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
            ))}
          </div>
        ) : (
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical">
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RegionalPerformanceMap;