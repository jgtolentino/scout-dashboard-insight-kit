
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { useState } from "react";

const RegionalMap = () => {
  const [tooltip, setTooltip] = useState<any>(null);

  // Sample regional data (static for overview)
  const regions = [
    { id: 1, name: "Metro Manila", revenue: 678000, growth: 12, intensity: 0.9 },
    { id: 2, name: "Cebu", revenue: 445000, growth: 8, intensity: 0.7 },
    { id: 3, name: "Davao", revenue: 298000, growth: 15, intensity: 0.5 },
    { id: 4, name: "Iloilo", revenue: 167000, growth: 5, intensity: 0.3 },
    { id: 5, name: "Cagayan de Oro", revenue: 123000, growth: -2, intensity: 0.2 },
  ];

  const getRegionColor = (intensity: number) => {
    const baseColor = [59, 130, 246]; // blue-500
    const alpha = 0.3 + (intensity * 0.7); // 30% to 100% opacity
    return `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, ${alpha})`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="h-5 w-5 text-blue-600" />
          Regional Performance Snapshot
        </CardTitle>
        <p className="text-sm text-gray-600">Revenue distribution by region</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="relative">
          {/* Simplified map visualization */}
          <div className="h-64 w-full bg-gray-50 rounded-lg relative overflow-hidden">
            {/* Philippines outline (simplified) */}
            <svg 
              viewBox="0 0 400 300" 
              className="w-full h-full"
              style={{ background: 'linear-gradient(to bottom, #f0f9ff, #e0f2fe)' }}
            >
              {/* Sample region polygons */}
              {regions.map((region, i) => (
                <g key={region.id}>
                  <circle
                    cx={50 + (i * 70)}
                    cy={150 + (Math.sin(i) * 50)}
                    r={20 + (region.intensity * 30)}
                    fill={getRegionColor(region.intensity)}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200 hover:stroke-blue-500 hover:stroke-4"
                    onMouseEnter={() => setTooltip(region)}
                    onMouseLeave={() => setTooltip(null)}
                  />
                  <text
                    x={50 + (i * 70)}
                    y={190 + (Math.sin(i) * 50)}
                    textAnchor="middle"
                    className="text-xs font-medium fill-gray-700"
                  >
                    {region.name.split(' ')[0]}
                  </text>
                </g>
              ))}
            </svg>

            {/* Tooltip */}
            {tooltip && (
              <div className="absolute top-4 right-4 bg-white shadow-lg px-4 py-3 text-sm rounded-lg border">
                <p className="font-medium">{tooltip.name}</p>
                <p className="text-gray-600">{formatCurrency(tooltip.revenue)}</p>
                <p className={`text-xs ${tooltip.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {tooltip.growth > 0 ? '+' : ''}{tooltip.growth}% vs last month
                </p>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-200"></div>
                <span>Low</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>High</span>
              </div>
            </div>
            <span>Revenue intensity</span>
          </div>

          {/* Top Regions Summary */}
          <div className="mt-4 space-y-2">
            {regions.slice(0, 3).map((region, i) => (
              <div key={region.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-4 text-center font-medium text-gray-500">#{i + 1}</span>
                  <span>{region.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{formatCurrency(region.revenue)}</span>
                  <span className={`text-xs ${region.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {region.growth > 0 ? '+' : ''}{region.growth}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RegionalMap;
