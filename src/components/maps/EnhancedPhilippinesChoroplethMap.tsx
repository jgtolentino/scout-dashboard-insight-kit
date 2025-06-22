import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_ACCESS_TOKEN } from '@/config/api';
import { scaleLinear } from 'd3-scale';
import { PHILIPPINES_REGIONS_ENHANCED, COLOR_SCALES } from '@/data/philippinesRegions';

// Set Mapbox access token
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

interface RegionalData {
  name: string;
  value: number;
  color?: string;
  percentage?: string;
  fullName?: string;
  population?: number;
}

interface EnhancedPhilippinesChoroplethMapProps {
  data: RegionalData[];
  className?: string;
  height?: number;
  width?: string | number;
  colorScale?: 'revenue' | 'transactions' | 'growth';
  metric?: string;
  onRegionClick?: (region: string) => void;
  onRegionHover?: (region: string | null) => void;
  showLegend?: boolean;
}

const EnhancedPhilippinesChoroplethMap: React.FC<EnhancedPhilippinesChoroplethMapProps> = ({
  data,
  className = '',
  height = 600,
  width = '100%',
  colorScale = 'revenue',
  metric = 'Revenue',
  onRegionClick,
  onRegionHover,
  showLegend = true,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [popup, setPopup] = useState<mapboxgl.Popup | null>(null);

  // Create enhanced GeoJSON with data values
  const createDataGeoJSON = useCallback(() => {
    const geoJSON = JSON.parse(JSON.stringify(PHILIPPINES_REGIONS_ENHANCED));
    
    // Update values from provided data
    geoJSON.features.forEach((feature: any) => {
      const regionData = data.find(d => d.name === feature.properties.name);
      if (regionData) {
        feature.properties.value = regionData.value;
        feature.properties.percentage = regionData.percentage;
        if (regionData.fullName) {
          feature.properties.fullName = regionData.fullName;
        }
      }
    });
    
    return geoJSON;
  }, [data]);

  // Get color based on value using selected color scale
  const getColor = useCallback((value: number) => {
    if (!value || value === 0) return COLOR_SCALES[colorScale][0];
    
    const values = data.map(d => d.value).filter(v => v > 0);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    
    const colorRange = COLOR_SCALES[colorScale];
    const colorScale_d3 = scaleLinear<string>()
      .domain([minValue, maxValue])
      .range([colorRange[0], colorRange[colorRange.length - 1]])
      .interpolate(() => (t: number) => {
        const index = Math.floor(t * (colorRange.length - 1));
        return colorRange[Math.min(index, colorRange.length - 1)];
      });
    
    return colorScale_d3(value);
  }, [data, colorScale]);

  // Create color legend
  const createLegend = useCallback(() => {
    if (!showLegend) return null;
    
    const values = data.map(d => d.value).filter(v => v > 0);
    if (values.length === 0) return null;
    
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const colorRange = COLOR_SCALES[colorScale];
    
    return (
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg border z-10">
        <div className="text-sm font-semibold mb-2">{metric}</div>
        <div className="flex items-center space-x-2">
          <span className="text-xs">₱{minValue.toLocaleString()}</span>
          <div className="flex">
            {colorRange.map((color, index) => (
              <div
                key={index}
                className="w-4 h-4"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span className="text-xs">₱{maxValue.toLocaleString()}</span>
        </div>
      </div>
    );
  }, [data, colorScale, metric, showLegend]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [122.5, 12.0], // Center of Philippines
      zoom: 5.5,
      maxZoom: 8,
      minZoom: 4,
    });

    map.current.on('load', () => {
      setIsLoaded(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update map data when data changes
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    const geoJSON = createDataGeoJSON();

    // Remove existing layers and sources
    if (map.current.getLayer('regions-fill')) {
      map.current.removeLayer('regions-fill');
    }
    if (map.current.getLayer('regions-stroke')) {
      map.current.removeLayer('regions-stroke');
    }
    if (map.current.getSource('regions')) {
      map.current.removeSource('regions');
    }

    // Add new source and layers
    map.current.addSource('regions', {
      type: 'geojson',
      data: geoJSON,
      generateId: true
    });

    // Add fill layer with data-driven styling
    map.current.addLayer({
      id: 'regions-fill',
      type: 'fill',
      source: 'regions',
      paint: {
        'fill-color': [
          'case',
          ['!=', ['get', 'value'], 0],
          [
            'interpolate',
            ['linear'],
            ['get', 'value'],
            0, COLOR_SCALES[colorScale][0],
            Math.max(...data.map(d => d.value)), COLOR_SCALES[colorScale][COLOR_SCALES[colorScale].length - 1]
          ],
          COLOR_SCALES[colorScale][0]
        ],
        'fill-opacity': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          0.8,
          0.6
        ]
      }
    });

    // Add stroke layer
    map.current.addLayer({
      id: 'regions-stroke',
      type: 'line',
      source: 'regions',
      paint: {
        'line-color': '#ffffff',
        'line-width': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          3,
          1
        ]
      }
    });

    // Add interaction handlers
    map.current.on('mouseenter', 'regions-fill', (e) => {
      if (e.features && e.features[0]) {
        const regionName = e.features[0].properties?.name;
        const regionValue = e.features[0].properties?.value || 0;
        const regionFullName = e.features[0].properties?.fullName || regionName;
        const regionPercentage = e.features[0].properties?.percentage;
        
        if (regionName && regionName !== hoveredRegion) {
          // Remove previous hover state
          if (hoveredRegion) {
            map.current?.setFeatureState(
              { source: 'regions', id: hoveredRegion },
              { hover: false }
            );
          }
          
          // Set new hover state
          setHoveredRegion(regionName);
          onRegionHover?.(regionName);
          
          map.current?.setFeatureState(
            { source: 'regions', id: regionName },
            { hover: true }
          );
          
          // Create popup
          const newPopup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: 15
          })
            .setLngLat(e.lngLat)
            .setHTML(`
              <div class="p-2">
                <div class="font-semibold text-sm">${regionFullName}</div>
                <div class="text-xs text-gray-600">${regionName}</div>
                <div class="text-sm mt-1">
                  <strong>${metric}:</strong> ₱${regionValue.toLocaleString()}
                </div>
                ${regionPercentage ? `<div class="text-xs text-gray-500">${regionPercentage}</div>` : ''}
              </div>
            `)
            .addTo(map.current!);
          
          // Remove old popup
          if (popup) {
            popup.remove();
          }
          setPopup(newPopup);
        }
      }
    });

    map.current.on('mouseleave', 'regions-fill', () => {
      if (hoveredRegion) {
        map.current?.setFeatureState(
          { source: 'regions', id: hoveredRegion },
          { hover: false }
        );
        setHoveredRegion(null);
        onRegionHover?.(null);
      }
      
      if (popup) {
        popup.remove();
        setPopup(null);
      }
    });

    map.current.on('click', 'regions-fill', (e) => {
      if (e.features && e.features[0]) {
        const regionName = e.features[0].properties?.name;
        if (regionName) {
          onRegionClick?.(regionName);
        }
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

  }, [data, isLoaded, colorScale, metric, hoveredRegion, popup, onRegionClick, onRegionHover, createDataGeoJSON]);

  return (
    <div className={`relative ${className}`} style={{ height, width }}>
      <div ref={mapContainer} className="w-full h-full rounded-lg overflow-hidden" />
      {createLegend()}
      
      {/* Loading indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="flex items-center space-x-2 text-gray-600">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Loading map...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedPhilippinesChoroplethMap;