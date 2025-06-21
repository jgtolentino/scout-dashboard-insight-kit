
import React from 'react';

interface RegionData {
  name: string;
  value: number;
  color: string;
}

interface ChoroplethMapProps {
  data?: RegionData[];
  width?: number;
  height?: number;
}

const ChoroplethMap: React.FC<ChoroplethMapProps> = ({ 
  data = [], 
  width = 600, 
  height = 400 
}) => {
  // More realistic Philippine regions with better polygon shapes
  const regions = [
    { 
      name: 'NCR', 
      path: 'M280,180 L320,175 L325,185 L330,195 L325,205 L315,210 L305,215 L290,210 L275,200 L275,185 Z', 
      center: { x: 300, y: 195 }
    },
    { 
      name: 'Cebu', 
      path: 'M350,260 L365,255 L375,265 L380,275 L385,285 L380,295 L370,300 L360,305 L350,300 L345,290 L340,280 L345,270 Z', 
      center: { x: 365, y: 280 }
    },
    { 
      name: 'Davao', 
      path: 'M400,320 L420,315 L435,325 L445,335 L450,350 L445,365 L435,375 L420,380 L405,375 L395,365 L390,350 L395,335 Z', 
      center: { x: 420, y: 350 }
    },
    { 
      name: 'Iloilo', 
      path: 'M300,280 L315,275 L325,285 L330,295 L325,305 L315,315 L305,320 L295,315 L285,305 L280,295 L285,285 Z', 
      center: { x: 305, y: 295 }
    },
    { 
      name: 'Baguio', 
      path: 'M260,140 L280,135 L290,145 L295,155 L290,165 L280,175 L270,180 L260,175 L250,165 L245,155 L250,145 Z', 
      center: { x: 270, y: 155 }
    },
  ];

  // Color scale function for data-driven coloring
  const getColorFromValue = (value: number, maxValue: number) => {
    if (value === 0) return '#f1f5f9'; // Light gray for no data
    
    const intensity = value / maxValue;
    if (intensity <= 0.2) return '#dbeafe'; // Very light blue
    if (intensity <= 0.4) return '#93c5fd'; // Light blue
    if (intensity <= 0.6) return '#60a5fa'; // Medium blue
    if (intensity <= 0.8) return '#3b82f6'; // Blue
    return '#1e40af'; // Dark blue
  };

  const maxValue = Math.max(...data.map(d => d.value), 1);

  const getRegionColor = (regionName: string) => {
    const regionData = data.find(d => d.name === regionName);
    if (regionData) {
      return regionData.color || getColorFromValue(regionData.value, maxValue);
    }
    return '#f1f5f9'; // Default light gray
  };

  const getRegionValue = (regionName: string) => {
    const regionData = data.find(d => d.name === regionName);
    return regionData ? regionData.value : 0;
  };

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `₱${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `₱${(value / 1000).toFixed(0)}K`;
    }
    return `₱${value.toLocaleString()}`;
  };

  return (
    <div className="w-full">
      <svg 
        width={width} 
        height={height} 
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto border rounded-lg bg-gradient-to-br from-blue-50 to-slate-100"
      >
        {/* Background ocean/water */}
        <rect width={width} height={height} fill="#e0f2fe" />
        
        {/* Region polygons */}
        {regions.map((region) => {
          const regionValue = getRegionValue(region.name);
          const regionColor = getRegionColor(region.name);
          
          return (
            <g key={region.name}>
              {/* Main region polygon */}
              <path
                d={region.path}
                fill={regionColor}
                stroke="#1e293b"
                strokeWidth="2"
                className="hover:opacity-80 hover:stroke-blue-600 transition-all duration-200 cursor-pointer filter drop-shadow-sm"
              />
              
              {/* Region name label */}
              <text
                x={region.center.x}
                y={region.center.y - 5}
                textAnchor="middle"
                className="text-xs font-semibold fill-slate-700 pointer-events-none"
                style={{ textShadow: '1px 1px 2px rgba(255,255,255,0.8)' }}
              >
                {region.name}
              </text>
              
              {/* Value label */}
              {regionValue > 0 && (
                <text
                  x={region.center.x}
                  y={region.center.y + 10}
                  textAnchor="middle"
                  className="text-xs font-bold fill-slate-800 pointer-events-none"
                  style={{ textShadow: '1px 1px 2px rgba(255,255,255,0.8)' }}
                >
                  {formatValue(regionValue)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      
      {/* Enhanced Legend */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
          <span>Sales Performance</span>
          <span>₱{formatValue(maxValue)} max</span>
        </div>
        <div className="flex items-center justify-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-100 border rounded"></div>
            <span className="text-xs text-gray-600">Low</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-300 border rounded"></div>
            <span className="text-xs text-gray-600">Medium</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 border rounded"></div>
            <span className="text-xs text-gray-600">High</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-700 border rounded"></div>
            <span className="text-xs text-gray-600">Very High</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChoroplethMap;
