
import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface RegionData {
  name: string;
  value: number;
  color?: string;
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
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

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

  const formatValue = (value: number) => {
    if (value === 0) return 'No data';
    if (value >= 1000000) {
      return `₱${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `₱${(value / 1000).toFixed(0)}K`;
    }
    return `₱${value.toLocaleString()}`;
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    mapboxgl.accessToken = 'pk.eyJ1Ijoiamd0b2xlbnRpbm8iLCJhIjoiY21jMmNycWRiMDc0ajJqcHZoaDYyeTJ1NiJ9.Dns6WOql16BUQ4l7otaeww';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [122.5, 12.5], // Philippines center
      zoom: 5.5,
      pitch: 0,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    map.current.on('load', () => {
      if (!map.current) return;

      // Sample Philippine regions GeoJSON data
      const philippineRegions = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { name: 'NCR', region: 'National Capital Region' },
            geometry: {
              type: 'Polygon',
              coordinates: [[
                [121.0, 14.6], [121.1, 14.6], [121.1, 14.7], [121.0, 14.7], [121.0, 14.6]
              ]]
            }
          },
          {
            type: 'Feature',
            properties: { name: 'Cebu', region: 'Central Visayas' },
            geometry: {
              type: 'Polygon',
              coordinates: [[
                [123.8, 10.2], [124.0, 10.2], [124.0, 10.4], [123.8, 10.4], [123.8, 10.2]
              ]]
            }
          },
          {
            type: 'Feature',
            properties: { name: 'Davao', region: 'Davao Region' },
            geometry: {
              type: 'Polygon',
              coordinates: [[
                [125.5, 7.0], [125.7, 7.0], [125.7, 7.2], [125.5, 7.2], [125.5, 7.0]
              ]]
            }
          },
          {
            type: 'Feature',
            properties: { name: 'Iloilo', region: 'Western Visayas' },
            geometry: {
              type: 'Polygon',
              coordinates: [[
                [122.5, 10.7], [122.7, 10.7], [122.7, 10.9], [122.5, 10.9], [122.5, 10.7]
              ]]
            }
          },
          {
            type: 'Feature',
            properties: { name: 'Baguio', region: 'Cordillera Administrative Region' },
            geometry: {
              type: 'Polygon',
              coordinates: [[
                [120.5, 16.3], [120.7, 16.3], [120.7, 16.5], [120.5, 16.5], [120.5, 16.3]
              ]]
            }
          }
        ]
      };

      // Add source
      map.current.addSource('regions', {
        type: 'geojson',
        data: philippineRegions
      });

      // Calculate max value for color scaling
      const maxValue = Math.max(...data.map(d => d.value), 1);

      // Get region color function
      const getRegionColor = (regionName: string) => {
        const regionData = data.find(d => d.name === regionName);
        if (regionData) {
          return regionData.color || getColorFromValue(regionData.value, maxValue);
        }
        return '#e2e8f0'; // Default light gray for regions without data
      };

      // Add fill layer with data-driven styling
      map.current.addLayer({
        id: 'regions-fill',
        type: 'fill',
        source: 'regions',
        paint: {
          'fill-color': [
            'case',
            ['==', ['get', 'name'], 'NCR'], getRegionColor('NCR'),
            ['==', ['get', 'name'], 'Cebu'], getRegionColor('Cebu'),
            ['==', ['get', 'name'], 'Davao'], getRegionColor('Davao'),
            ['==', ['get', 'name'], 'Iloilo'], getRegionColor('Iloilo'),
            ['==', ['get', 'name'], 'Baguio'], getRegionColor('Baguio'),
            '#e2e8f0' // fallback color
          ],
          'fill-opacity': 0.8
        }
      });

      // Add border layer
      map.current.addLayer({
        id: 'regions-border',
        type: 'line',
        source: 'regions',
        paint: {
          'line-color': '#1e293b',
          'line-width': 2
        }
      });

      // Add labels
      map.current.addLayer({
        id: 'regions-labels',
        type: 'symbol',
        source: 'regions',
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 12,
          'text-anchor': 'center'
        },
        paint: {
          'text-color': '#1e293b',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1
        }
      });

      // Add click event for regions
      map.current.on('click', 'regions-fill', (e) => {
        if (e.features && e.features[0]) {
          const regionName = e.features[0].properties?.name;
          const regionData = data.find(d => d.name === regionName);
          const value = regionData ? regionData.value : 0;
          
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
              <div class="p-2">
                <h3 class="font-bold">${regionName}</h3>
                <p class="text-sm">Sales: ${formatValue(value)}</p>
              </div>
            `)
            .addTo(map.current!);
        }
      });

      // Change cursor on hover
      map.current.on('mouseenter', 'regions-fill', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
        }
      });

      map.current.on('mouseleave', 'regions-fill', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = '';
        }
      });
    });

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [data]);

  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="w-full">
      <div 
        ref={mapContainer} 
        className="w-full rounded-lg shadow-lg border"
        style={{ height: `${height}px` }}
      />
      
      {/* Enhanced Legend */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
          <span>Regional Sales Performance</span>
          <span>{data.length > 0 ? `₱${formatValue(maxValue)} max` : 'All regions shown'}</span>
        </div>
        <div className="flex items-center justify-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-slate-200 border rounded"></div>
            <span className="text-xs text-gray-600">No Data</span>
          </div>
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
