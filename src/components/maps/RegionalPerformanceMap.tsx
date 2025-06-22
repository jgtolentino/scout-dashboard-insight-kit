import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import PhilippinesChoroplethMap from './PhilippinesChoroplethMap';
import { useNavigate } from 'react-router-dom';
import { useFilterStore } from '@/stores/filterStore';

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
  
  const handleRegionClick = (region: string) => {
    // Set filter for the clicked region
    setFilter('barangays', [region]);
    
    // Navigate to transaction trends with the filter applied
    navigate(`/transaction-trends?${getQueryString()}`);
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <PhilippinesChoroplethMap 
            data={data} 
            height={250}
            onRegionClick={handleRegionClick}
          />
        </div>
        
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
                  <div className="text-sm text-green-600">
                    {region.percentage}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RegionalPerformanceMap;