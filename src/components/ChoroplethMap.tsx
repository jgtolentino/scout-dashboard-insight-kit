
import React from 'react';

interface RegionalData {
  name: string;
  value: number;
  color: string;
}

interface ChoroplethMapProps {
  data: RegionalData[];
  width?: number;
  height?: number;
  className?: string;
}

export default function ChoroplethMap({ data, width = 400, height = 300, className }: ChoroplethMapProps) {
  // Simple SVG-based choropleth map for Philippine regions
  const regions = [
    { name: 'NCR', path: 'M150,100 L200,100 L200,130 L150,130 Z', x: 175, y: 115 },
    { name: 'Cebu', path: 'M180,180 L220,180 L220,210 L180,210 Z', x: 200, y: 195 },
    { name: 'Davao', path: 'M250,220 L290,220 L290,250 L250,250 Z', x: 270, y: 235 },
    { name: 'Iloilo', path: 'M120,160 L160,160 L160,190 L120,190 Z', x: 140, y: 175 },
    { name: 'Baguio', path: 'M130,70 L170,70 L170,100 L130,100 Z', x: 150, y: 85 },
  ];

  const getRegionColor = (regionName: string) => {
    const regionData = data.find(d => d.name === regionName);
    return regionData?.color || '#e5e7eb';
  };

  const getRegionValue = (regionName: string) => {
    const regionData = data.find(d => d.name === regionName);
    return regionData?.value || 0;
  };

  return (
    <div className={`bg-white rounded-lg ${className}`}>
      <svg width={width} height={height} viewBox="0 0 400 300" className="w-full h-full">
        {regions.map((region) => (
          <g key={region.name}>
            <path
              d={region.path}
              fill={getRegionColor(region.name)}
              stroke="#ffffff"
              strokeWidth="2"
              className="hover:opacity-80 transition-opacity cursor-pointer"
            />
            <text
              x={region.x}
              y={region.y}
              textAnchor="middle"
              className="text-xs font-medium fill-gray-700 pointer-events-none"
            >
              {region.name}
            </text>
            <text
              x={region.x}
              y={region.y + 12}
              textAnchor="middle"
              className="text-xs fill-gray-600 pointer-events-none"
            >
              ₱{getRegionValue(region.name).toLocaleString()}
            </text>
          </g>
        ))}
      </svg>
      
      {/* Legend */}
      <div className="mt-4 flex items-center justify-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-200 rounded"></div>
          <span className="text-xs text-gray-600">Low</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-xs text-gray-600">High</span>
        </div>
      </div>
    </div>
  );
}
