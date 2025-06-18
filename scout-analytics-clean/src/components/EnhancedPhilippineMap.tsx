import React, { useState, useEffect, useRef } from 'react';
import { MapPin, TrendingUp, TrendingDown, Info, Layers, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useFilterStore } from '../store/useFilterStore';

interface RegionData {
  region: string;
  code: string;
  revenue: number;
  transactions: number;
  growth: number;
  cities: string[];
  population?: number;
  stores?: number;
  coordinates?: [number, number];
}

interface EnhancedPhilippineMapProps {
  data: RegionData[];
  onRegionClick?: (region: RegionData) => void;
  selectedRegion?: string;
  viewMode?: 'regions' | 'heatmap' | 'clusters';
  className?: string;
}

const EnhancedPhilippineMap: React.FC<EnhancedPhilippineMapProps> = ({
  data,
  onRegionClick,
  selectedRegion,
  viewMode = 'regions',
  className = ''
}) => {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [currentViewMode, setCurrentViewMode] = useState(viewMode);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const mapRef = useRef<SVGSVGElement>(null);
  const filters = useFilterStore();

  // Enhanced Philippine regions with more accurate positioning and additional data
  const regionPositions = {
    'NCR': { 
      x: 50, y: 65, 
      label: 'Metro Manila (NCR)',
      population: 13484462,
      area: 619.57,
      cities: ['Manila', 'Quezon City', 'Makati', 'Taguig', 'Pasig', 'Mandaluyong']
    },
    'CAR': { 
      x: 35, y: 35, 
      label: 'Cordillera (CAR)',
      population: 1797660,
      area: 18294.05,
      cities: ['Baguio', 'Tabuk', 'La Trinidad']
    },
    'I': { 
      x: 25, y: 45, 
      label: 'Ilocos Region',
      population: 5301139,
      area: 12840.18,
      cities: ['Laoag', 'San Fernando', 'Vigan', 'Dagupan']
    },
    'II': { 
      x: 45, y: 35, 
      label: 'Cagayan Valley',
      population: 3685744,
      area: 26838.28,
      cities: ['Tuguegarao', 'Ilagan', 'Santiago']
    },
    'III': { 
      x: 45, y: 55, 
      label: 'Central Luzon',
      population: 12422172,
      area: 22014.63,
      cities: ['San Fernando', 'Angeles', 'Olongapo', 'Malolos', 'Cabanatuan']
    },
    'IV-A': { 
      x: 55, y: 75, 
      label: 'CALABARZON',
      population: 16195042,
      area: 16873.31,
      cities: ['Calamba', 'Antipolo', 'Bacoor', 'San Pedro', 'Biñan']
    },
    'IV-B': { 
      x: 35, y: 85, 
      label: 'MIMAROPA',
      population: 3228558,
      area: 29620.90,
      cities: ['Calapan', 'Puerto Princesa']
    },
    'V': { 
      x: 70, y: 85, 
      label: 'Bicol Region',
      population: 6082165,
      area: 18114.47,
      cities: ['Legazpi', 'Naga', 'Iriga', 'Tabaco']
    },
    'VI': { 
      x: 35, y: 95, 
      label: 'Western Visayas',
      population: 7954723,
      area: 20223.2,
      cities: ['Iloilo City', 'Bacolod', 'Roxas', 'Kalibo']
    },
    'VII': { 
      x: 55, y: 95, 
      label: 'Central Visayas',
      population: 8081988,
      area: 15895.66,
      cities: ['Cebu City', 'Mandaue', 'Lapu-Lapu', 'Bohol', 'Dumaguete']
    },
    'VIII': { 
      x: 75, y: 95, 
      label: 'Eastern Visayas',
      population: 4547150,
      area: 23234.78,
      cities: ['Tacloban', 'Ormoc', 'Calbayog', 'Maasin']
    },
    'IX': { 
      x: 25, y: 115, 
      label: 'Zamboanga Peninsula',
      population: 3875576,
      area: 17046.64,
      cities: ['Zamboanga City', 'Pagadian', 'Dipolog']
    },
    'X': { 
      x: 45, y: 115, 
      label: 'Northern Mindanao',
      population: 5022768,
      area: 20458.51,
      cities: ['Cagayan de Oro', 'Iligan', 'Valencia', 'Gingoog']
    },
    'XI': { 
      x: 65, y: 125, 
      label: 'Davao Region',
      population: 5243536,
      area: 20357.42,
      cities: ['Davao City', 'Tagum', 'Panabo', 'Samal']
    },
    'XII': { 
      x: 45, y: 125, 
      label: 'SOCCSKSARGEN',
      population: 4545276,
      area: 22513.30,
      cities: ['Koronadal', 'General Santos', 'Kidapawan']
    },
    'XIII': { 
      x: 75, y: 115, 
      label: 'Caraga',
      population: 2804788,
      area: 18846.97,
      cities: ['Butuan', 'Surigao', 'Bislig', 'Bayugan']
    },
    'BARMM': { 
      x: 35, y: 135, 
      label: 'BARMM',
      population: 4080825,
      area: 36826.95,
      cities: ['Cotabato City', 'Marawi', 'Jolo']
    }
  };

  const getRegionData = (regionCode: string) => {
    return data.find(d => 
      d.code === regionCode || 
      d.region === regionPositions[regionCode as keyof typeof regionPositions]?.label ||
      d.region.includes(regionCode)
    );
  };

  const getRegionColor = (regionData: RegionData | undefined) => {
    if (!regionData) return '#e2e8f0';
    
    const maxRevenue = Math.max(...data.map(d => d.revenue));
    const intensity = regionData.revenue / maxRevenue;
    
    if (currentViewMode === 'heatmap') {
      // Heat map coloring based on revenue density
      const alpha = 0.3 + intensity * 0.7;
      return `rgba(239, 68, 68, ${alpha})`;
    } else if (currentViewMode === 'clusters') {
      // Cluster coloring based on store count
      const storeCount = regionData.stores || Math.floor(regionData.transactions / 100);
      if (storeCount > 50) return '#10B981';
      else if (storeCount > 20) return '#F59E0B';
      else return '#6B7280';
    } else {
      // Standard growth-based coloring
      if (regionData.growth > 10) {
        return `rgba(34, 197, 94, ${0.3 + intensity * 0.7})`;
      } else if (regionData.growth > 0) {
        return `rgba(59, 130, 246, ${0.3 + intensity * 0.7})`;
      } else {
        return `rgba(239, 68, 68, ${0.3 + intensity * 0.7})`;
      }
    }
  };

  const getRegionSize = (regionData: RegionData | undefined) => {
    if (!regionData) return 3;
    
    if (currentViewMode === 'clusters') {
      const storeCount = regionData.stores || Math.floor(regionData.transactions / 100);
      return Math.max(4, Math.min(12, storeCount / 5));
    } else {
      return Math.max(4, Math.min(10, regionData.revenue / 100000));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-PH', { notation: 'compact' }).format(num);
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev / 1.2, 0.5));
  const handleReset = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleRegionClick = (regionData: RegionData) => {
    // Add to drill-down path
    if (filters.addDrilldown) {
      filters.addDrilldown('region', regionData.region);
    }
    
    // Update region filter
    if (!filters.barangays.includes(regionData.region)) {
      filters.setBarangays([...filters.barangays, regionData.region]);
    }
    
    onRegionClick?.(regionData);
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Philippine Regional Analytics</h3>
          <p className="text-sm text-slate-600 mt-1">
            Interactive map with {currentViewMode} visualization
          </p>
        </div>
        
        {/* View Mode Selector */}
        <div className="flex items-center space-x-2">
          <div className="flex rounded-lg border border-slate-200 p-1">
            {(['regions', 'heatmap', 'clusters'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setCurrentViewMode(mode)}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  currentViewMode === mode
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4 text-xs text-slate-500">
          {currentViewMode === 'regions' && (
            <>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-400 rounded-full" />
                <span>High Growth (&gt;10%)</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-400 rounded-full" />
                <span>Positive Growth</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-400 rounded-full" />
                <span>Declining</span>
              </div>
            </>
          )}
          {currentViewMode === 'heatmap' && (
            <div className="flex items-center space-x-2">
              <span>Revenue Intensity:</span>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-200 rounded-full" />
                <span>Low</span>
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span>High</span>
              </div>
            </div>
          )}
          {currentViewMode === 'clusters' && (
            <>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span>High Density (&gt;50 stores)</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-amber-500 rounded-full" />
                <span>Medium Density (20-50 stores)</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-gray-500 rounded-full" />
                <span>Low Density (&lt;20 stores)</span>
              </div>
            </>
          )}
        </div>
        
        {/* Zoom Controls */}
        <div className="flex items-center space-x-1">
          <button
            onClick={handleZoomIn}
            className="p-1 hover:bg-gray-100 rounded text-slate-600 hover:text-slate-900"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1 hover:bg-gray-100 rounded text-slate-600 hover:text-slate-900"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-1 hover:bg-gray-100 rounded text-slate-600 hover:text-slate-900"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enhanced Map Visualization */}
        <div className="lg:col-span-2 relative">
          <div className="bg-slate-50 rounded-lg p-4 h-96 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full max-w-md">
                <svg 
                  ref={mapRef}
                  viewBox="0 0 100 150" 
                  className="w-full h-full cursor-move"
                  style={{ 
                    transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)` 
                  }}
                >
                  {/* Enhanced Philippines silhouette with island details */}
                  <defs>
                    <pattern id="oceanPattern" patternUnits="userSpaceOnUse" width="4" height="4">
                      <rect width="4" height="4" fill="#f8fafc"/>
                      <circle cx="1" cy="1" r="0.5" fill="#e2e8f0" opacity="0.3"/>
                    </pattern>
                    <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="1" dy="1" stdDeviation="2" floodOpacity="0.3"/>
                    </filter>
                  </defs>
                  
                  {/* Ocean background */}
                  <rect width="100" height="150" fill="url(#oceanPattern)" />
                  
                  {/* Main Philippines landmass - more detailed */}
                  <g filter="url(#dropShadow)">
                    {/* Luzon */}
                    <path
                      d="M25 30 Q20 35 25 40 L30 45 Q35 50 40 45 L45 50 Q50 55 55 50 L60 55 Q65 60 70 55 L65 65 Q60 70 65 75 L70 80 Q65 85 60 80 L55 75 Q50 70 45 75 L40 70 Q35 65 30 70 L25 65 Q20 60 25 55 L30 50 Q35 45 30 40 L25 35 Q20 30 25 30 Z"
                      fill="#f1f5f9"
                      stroke="#cbd5e1"
                      strokeWidth="0.5"
                    />
                    
                    {/* Visayas */}
                    <path
                      d="M30 90 Q25 95 30 100 L40 95 Q50 90 60 95 L70 90 Q75 95 80 90 L75 100 Q70 105 65 100 L55 105 Q45 100 35 105 L25 100 Q20 95 25 90 L30 90 Z"
                      fill="#f1f5f9"
                      stroke="#cbd5e1"
                      strokeWidth="0.5"
                    />
                    
                    {/* Mindanao */}
                    <path
                      d="M20 110 Q15 115 20 120 L25 125 Q30 130 40 125 L50 130 Q60 135 70 130 L80 125 Q85 120 80 115 L75 120 Q70 115 65 120 L60 115 Q55 110 50 115 L45 110 Q40 115 35 110 L30 115 Q25 110 20 110 Z"
                      fill="#f1f5f9"
                      stroke="#cbd5e1"
                      strokeWidth="0.5"
                    />
                  </g>
                  
                  {/* Region markers with enhanced interactivity */}
                  {Object.entries(regionPositions).map(([code, position]) => {
                    const regionData = getRegionData(code);
                    const isHovered = hoveredRegion === code;
                    const isSelected = selectedRegion === regionData?.region;
                    const isFiltered = filters.barangays.includes(regionData?.region || '');
                    
                    return (
                      <g key={code}>
                        {/* Region circle with enhanced styling */}
                        <circle
                          cx={position.x}
                          cy={position.y}
                          r={getRegionSize(regionData)}
                          fill={getRegionColor(regionData)}
                          stroke={isHovered || isSelected || isFiltered ? '#1e40af' : '#64748b'}
                          strokeWidth={isHovered || isSelected || isFiltered ? 3 : 1}
                          className="cursor-pointer transition-all duration-200"
                          onMouseEnter={() => setHoveredRegion(code)}
                          onMouseLeave={() => setHoveredRegion(null)}
                          onClick={() => regionData && handleRegionClick(regionData)}
                          style={{
                            filter: isHovered ? 'brightness(1.1)' : 'none',
                            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                            transformOrigin: `${position.x}px ${position.y}px`
                          }}
                        />
                        
                        {/* Active filter indicator */}
                        {isFiltered && (
                          <circle
                            cx={position.x}
                            cy={position.y}
                            r={getRegionSize(regionData) + 2}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="2"
                            strokeDasharray="4,2"
                            className="animate-pulse"
                          />
                        )}
                        
                        {/* Enhanced tooltip */}
                        {(isHovered || isSelected) && regionData && (
                          <g>
                            <rect
                              x={position.x + 12}
                              y={position.y - 25}
                              width="100"
                              height="50"
                              fill="white"
                              stroke="#e2e8f0"
                              strokeWidth="1"
                              rx="6"
                              className="drop-shadow-lg"
                              style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
                            />
                            <text
                              x={position.x + 62}
                              y={position.y - 15}
                              textAnchor="middle"
                              className="text-xs font-semibold fill-slate-900"
                            >
                              {regionData.region}
                            </text>
                            <text
                              x={position.x + 62}
                              y={position.y - 5}
                              textAnchor="middle"
                              className="text-xs fill-slate-600"
                            >
                              {formatCurrency(regionData.revenue)}
                            </text>
                            <text
                              x={position.x + 62}
                              y={position.y + 5}
                              textAnchor="middle"
                              className="text-xs fill-slate-600"
                            >
                              {regionData.growth >= 0 ? '+' : ''}{regionData.growth.toFixed(1)}% growth
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
            
            {/* Enhanced tooltip for hovered region */}
            {hoveredRegion && (
              <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg border border-slate-200 p-4 min-w-64 max-w-xs">
                {(() => {
                  const regionData = getRegionData(hoveredRegion);
                  const regionInfo = regionPositions[hoveredRegion as keyof typeof regionPositions];
                  
                  if (!regionData || !regionInfo) {
                    return <div className="text-sm text-slate-500">No data available</div>;
                  }
                  
                  return (
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3">{regionData.region}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Revenue:</span>
                          <span className="font-medium">{formatCurrency(regionData.revenue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Transactions:</span>
                          <span className="font-medium">{formatNumber(regionData.transactions)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Growth:</span>
                          <div className="flex items-center space-x-1">
                            {regionData.growth >= 0 ? (
                              <TrendingUp className="h-3 w-3 text-green-500" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-red-500" />
                            )}
                            <span className={`font-medium ${
                              regionData.growth >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {regionData.growth >= 0 ? '+' : ''}{regionData.growth.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        {regionInfo.population && (
                          <div className="flex justify-between">
                            <span className="text-slate-600">Population:</span>
                            <span className="font-medium">{formatNumber(regionInfo.population)}</span>
                          </div>
                        )}
                        {regionInfo.cities && (
                          <div className="mt-3 pt-2 border-t border-slate-200">
                            <span className="text-slate-600 text-xs">Major Cities:</span>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {regionInfo.cities.slice(0, 3).map((city, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                                  {city}
                                </span>
                              ))}
                              {regionInfo.cities.length > 3 && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                  +{regionInfo.cities.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Region List with sorting and filtering */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-slate-900">Regional Rankings</h4>
            <select 
              className="text-xs border border-slate-200 rounded px-2 py-1"
              onChange={(e) => {
                // Sort logic here based on selection
              }}
            >
              <option value="revenue">By Revenue</option>
              <option value="growth">By Growth</option>
              <option value="transactions">By Transactions</option>
            </select>
          </div>
          
          {data
            .sort((a, b) => b.revenue - a.revenue)
            .map((region, index) => (
              <button
                key={region.region}
                onClick={() => handleRegionClick(region)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedRegion === region.region
                    ? 'border-blue-300 bg-blue-50'
                    : filters.barangays.includes(region.region)
                    ? 'border-blue-200 bg-blue-25'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-slate-500">#{index + 1}</span>
                    <span className="font-medium text-slate-900 text-sm">{region.region}</span>
                    {filters.barangays.includes(region.region) && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    {region.growth >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span className={`text-xs font-medium ${
                      region.growth >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {region.growth >= 0 ? '+' : ''}{region.growth.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="text-xs text-slate-600">
                  {formatCurrency(region.revenue)} • {formatNumber(region.transactions)} transactions
                </div>
              </button>
            ))}
        </div>
      </div>

      {/* Enhanced Summary Statistics */}
      <div className="mt-6 pt-6 border-t border-slate-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-slate-900">
              {data.length}
            </div>
            <div className="text-xs text-slate-600">Active Regions</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-slate-900">
              {formatCurrency(data.reduce((sum, region) => sum + region.revenue, 0))}
            </div>
            <div className="text-xs text-slate-600">Total Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-slate-900">
              {formatNumber(data.reduce((sum, region) => sum + region.transactions, 0))}
            </div>
            <div className="text-xs text-slate-600">Total Transactions</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-slate-900">
              {data.filter(region => region.growth > 0).length}
            </div>
            <div className="text-xs text-slate-600">Growing Regions</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPhilippineMap;