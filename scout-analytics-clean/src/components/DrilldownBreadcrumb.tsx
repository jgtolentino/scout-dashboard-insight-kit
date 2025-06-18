import React from 'react';
import { ChevronRight, Home, X } from 'lucide-react';
import { useFilterStore } from '../store/useFilterStore';

interface DrilldownLevel {
  level: string;
  value: string;
  filters: Record<string, any>;
  timestamp: Date;
}

interface DrilldownBreadcrumbProps {
  className?: string;
}

const DrilldownBreadcrumb: React.FC<DrilldownBreadcrumbProps> = ({ className = '' }) => {
  const { drilldownPath, removeDrilldown, clearDrilldown } = useFilterStore();
  
  if (!drilldownPath || drilldownPath.length === 0) return null;
  
  return (
    <div className={`bg-gradient-to-r from-tbwa-navy-50 to-blue-50 border-b border-blue-200 px-6 py-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 overflow-x-auto">
          {/* Home/Overview */}
          <button
            onClick={() => clearDrilldown()}
            className="flex items-center space-x-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
          >
            <Home className="w-4 h-4" />
            <span>Overview</span>
          </button>
          
          {/* Drilldown Path */}
          {drilldownPath.map((level: DrilldownLevel, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <button
                onClick={() => removeDrilldown(index + 1)}
                className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium text-blue-700"
              >
                <span className="capitalize">{level.level}</span>
                <span className="text-blue-900 font-semibold">{level.value}</span>
                {index === drilldownPath.length - 1 && (
                  <X className="w-3 h-3 ml-1 hover:bg-blue-200 rounded" />
                )}
              </button>
            </div>
          ))}
        </div>
        
        {/* Clear All Drilldown */}
        <button
          onClick={() => clearDrilldown()}
          className="flex items-center space-x-1 px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors"
        >
          <X className="w-3 h-3" />
          <span>Clear drill-down</span>
        </button>
      </div>
      
      {/* Drill-down Info */}
      <div className="mt-2 text-xs text-gray-600">
        <span className="font-medium">Exploring:</span> 
        {drilldownPath.map((level: DrilldownLevel, index: number) => (
          <span key={index}>
            {index > 0 && ' → '}
            <span className="font-medium text-blue-700">{level.level}: {level.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default DrilldownBreadcrumb;