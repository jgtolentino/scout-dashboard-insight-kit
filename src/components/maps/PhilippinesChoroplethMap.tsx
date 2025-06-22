import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_ACCESS_TOKEN } from '@/config/api';
import * as turf from '@turf/turf';

// Set Mapbox access token
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

// GeoJSON for simplified Philippine regions
const PHILIPPINES_REGIONS = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": { "name": "NCR", "value": 0 },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[120.9, 14.4], [121.1, 14.4], [121.1, 14.8], [120.9, 14.8], [120.9, 14.4]]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Cebu", "value": 0 },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[123.8, 10.2], [124.0, 10.2], [124.0, 10.4], [123.8, 10.4], [123.8, 10.2]]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Davao", "value": 0 },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[125.3, 7.0], [125.6, 7.0], [125.6, 7.3], [125.3, 7.3], [125.3, 7.0]]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Iloilo", "value": 0 },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[122.4, 10.6], [122.7, 10.6], [122.7, 10.9], [122.4, 10.9], [122.4, 10.6]]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Baguio", "value": 0 },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[120.5, 16.3], [120.7, 16.3], [120.7, 16.5], [120.5, 16.5], [120.5, 16.3]]]
      }
    }
  ]
};

interface RegionData {
  name: string;
  value: number;
  color?: string;
}

interface PhilippinesChoroplethMapProps {
  data: RegionData[];
  className?: string;
  height?: number;
  width?: number;
  onRegionClick?: (region: string) => void;
}

const PhilippinesChoroplethMap: React.FC<PhilippinesChoroplethMapProps> = ({
  data,
  className = '',
  height = 400,
  width = '100%',
  onRegionClick
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  // Prepare GeoJSON with data values
  const getGeoJSONWithData = () => {
    const geoJSON = JSON.parse(JSON.stringify(PHILIPPINES_REGIONS));
    
    // Update values from provided data
    geoJSON.features.forEach((feature: any) => {
      const regionData = data.find(d => d.name === feature.properties.name);
      if (regionData) {
        feature.properties.value = regionData.value;
        if (regionData.color) {
          feature.properties.color = regionData.color;
        }
      }
    });
    
    return geoJSON;
  };

  // Get color based on value
  const getColor = (value: number) => {
    // Color scale from light to dark blue
    if (value > 1000000) return '#1e40af'; // dark blue
    if (value > 750000) return '#3b82f6'; // medium blue
    if (value > 500000) return '#60a5fa'; // light blue
    if (value > 250000) return '#93c5fd'; // lighter blue
    return '#dbeafe'; // very light blue
  };

  useEffect(() => {
    if (!mapContainer.current) return;
    
    // Initialize map
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [122, 12], // Center of Philippines
        zoom: 5,
        interactive: true,
        attributionControl: true
      });
      
      // Add navigation control
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Wait for map to load
      map.current.on('load', () => {
        // Add source and layer
        if (map.current) {
          const geoJSON = getGeoJSONWithData();
          
          map.current.addSource('regions', {
            type: 'geojson',
            data: geoJSON
          });
          
          // Add fill layer
          map.current.addLayer({
            id: 'regions-fill',
            type: 'fill',
            source: 'regions',
            paint: {
              'fill-color': [
                'case',
                ['has', 'color'], ['get', 'color'],
                ['interpolate', ['linear'], ['get', 'value'],
                  0, '#dbeafe',
                  250000, '#93c5fd',
                  500000, '#60a5fa',
                  750000, '#3b82f6',
                  1000000, '#1e40af'
                ]
              ],
              'fill-opacity': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                0.9,
                0.7
              ]
            }
          });
          
          // Add outline layer
          map.current.addLayer({
            id: 'regions-outline',
            type: 'line',
            source: 'regions',
            paint: {
              'line-color': '#ffffff',
              'line-width': 1
            }
          });
          
          // Add region labels
          map.current.addLayer({
            id: 'regions-label',
            type: 'symbol',
            source: 'regions',
            layout: {
              'text-field': ['format',
                ['get', 'name'], { 'font-scale': 1 },
                '\n', {},
                ['number-format', ['get', 'value'], { 'min-fraction-digits': 0, 'max-fraction-digits': 0 }], { 'font-scale': 0.8 }
              ],
              'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
              'text-size': 12,
              'text-anchor': 'center',
              'text-justify': 'center'
            },
            paint: {
              'text-color': '#333',
              'text-halo-color': '#fff',
              'text-halo-width': 1
            }
          });
          
          // Add hover effect
          map.current.on('mousemove', 'regions-fill', (e) => {
            if (e.features && e.features.length > 0) {
              if (hoveredRegion) {
                map.current?.setFeatureState(
                  { source: 'regions', id: hoveredRegion },
                  { hover: false }
                );
              }
              
              const regionName = e.features[0].properties.name;
              setHoveredRegion(regionName);
              
              map.current?.setFeatureState(
                { source: 'regions', id: regionName },
                { hover: true }
              );
              
              // Show popup
              const regionValue = e.features[0].properties.value;
              new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(`<strong>${regionName}</strong><br>₱${regionValue.toLocaleString()}`)
                .addTo(map.current);
            }
          });
          
          // Remove hover effect when mouse leaves
          map.current.on('mouseleave', 'regions-fill', () => {
            if (hoveredRegion) {
              map.current?.setFeatureState(
                { source: 'regions', id: hoveredRegion },
                { hover: false }
              );
            }
            setHoveredRegion(null);
            
            // Remove popup
            const popups = document.getElementsByClassName('mapboxgl-popup');
            if (popups.length) {
              popups[0].remove();
            }
          });
          
          // Handle click events
          if (onRegionClick) {
            map.current.on('click', 'regions-fill', (e) => {
              if (e.features && e.features.length > 0) {
                const regionName = e.features[0].properties.name;
                onRegionClick(regionName);
              }
            });
          }
        }
      });
    } else {
      // Update data if map already exists
      const source = map.current.getSource('regions') as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData(getGeoJSONWithData());
      }
    }
    
    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [data, onRegionClick]);

  // Update map size when container size changes
  useEffect(() => {
    if (map.current) {
      map.current.resize();
    }
  }, [width, height]);

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={mapContainer} 
        style={{ width: typeof width === 'number' ? `${width}px` : width, height: `${height}px` }}
        className="rounded-lg overflow-hidden"
      />
      
      {/* Legend */}
      <div className="absolute bottom-2 right-2 bg-white p-2 rounded shadow-md text-xs">
        <div className="font-medium mb-1">Revenue (₱)</div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#dbeafe]"></div>
          <span>0 - 250K</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#93c5fd]"></div>
          <span>250K - 500K</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#60a5fa]"></div>
          <span>500K - 750K</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#3b82f6]"></div>
          <span>750K - 1M</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#1e40af]"></div>
          <span>1M+</span>
        </div>
      </div>
    </div>
  );
};

export default PhilippinesChoroplethMap;