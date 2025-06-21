
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
  // Sample Philippine regions with simplified polygons
  const regions = [
    { name: 'NCR', path: 'M150,200 L200,180 L220,220 L180,240 Z', defaultColor: '#e2e8f0' },
    { name: 'Cebu', path: 'M250,280 L300,260 L320,300 L280,320 Z', defaultColor: '#e2e8f0' },
    { name: 'Davao', path: 'M180,350 L230,330 L250,370 L210,390 Z', defaultColor: '#e2e8f0' },
    { name: 'Iloilo', path: 'M120,300 L170,280 L190,320 L150,340 Z', defaultColor: '#e2e8f0' },
    { name: 'Baguio', path: 'M130,150 L180,130 L200,170 L160,190 Z', defaultColor: '#e2e8f0' },
  ];

  const getRegionColor = (regionName: string) => {
    const regionData = data.find(d => d.name === regionName);
    return regionData ? regionData.color : '#e2e8f0';
  };

  const getRegionValue = (regionName: string) => {
    const regionData = data.find(d => d.name === regionName);
    return regionData ? regionData.value : 0;
  };

  return (
    <div className="w-full">
      <svg 
        width={width} 
        height={height} 
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto border rounded-lg bg-blue-50"
      >
        {regions.map((region) => (
          <g key={region.name}>
            <path
              d={region.path}
              fill={getRegionColor(region.name)}
              stroke="#64748b"
              strokeWidth="1"
              className="hover:opacity-80 transition-opacity cursor-pointer"
            />
            <text
              x={region.path.includes('150,200') ? 180 : region.path.includes('250,280') ? 280 : region.path.includes('180,350') ? 210 : region.path.includes('120,300') ? 150 : 160}
              y={region.path.includes('150,200') ? 210 : region.path.includes('250,280') ? 290 : region.path.includes('180,350') ? 360 : region.path.includes('120,300') ? 310 : 160}
              textAnchor="middle"
              className="text-xs font-medium fill-gray-700"
            >
              {region.name}
            </text>
            {getRegionValue(region.name) > 0 && (
              <text
                x={region.path.includes('150,200') ? 180 : region.path.includes('250,280') ? 280 : region.path.includes('180,350') ? 210 : region.path.includes('120,300') ? 150 : 160}
                y={region.path.includes('150,200') ? 225 : region.path.includes('250,280') ? 305 : region.path.includes('180,350') ? 375 : region.path.includes('120,300') ? 325 : 175}
                textAnchor="middle"
                className="text-xs font-bold fill-gray-800"
              >
                ₱{getRegionValue(region.name).toLocaleString()}
              </text>
            )}
          </g>
        ))}
      </svg>
      
      {/* Legend */}
      <div className="mt-4 flex items-center justify-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-200 rounded"></div>
          <span className="text-xs text-gray-600">Low</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-400 rounded"></div>
          <span className="text-xs text-gray-600">Medium</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-600 rounded"></div>
          <span className="text-xs text-gray-600">High</span>
        </div>
      </div>
    </div>
  );
};

export default ChoroplethMap;
