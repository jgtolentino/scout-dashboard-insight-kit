import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_ACCESS_TOKEN } from '@/config/api';
import { scaleLinear } from 'd3-scale';

// Set Mapbox access token
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

// More detailed GeoJSON for Philippines regions
const PHILIPPINES_REGIONS_GEOJSON = {
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
  percentage?: string;
}

interface PhilippinesRegionMapProps {
  data: RegionData[];
  width?: string | number;
  height?: number;
  className?: string;
  onRegionClick?: (region: string) => void;
}

const PhilippinesRegionMap: React.FC<PhilippinesRegionMapProps> = ({
  data,
  width = '100%',
  height = 400,
  className = '',
  onRegionClick
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;
    
    // Initialize map if it doesn't exist
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [122, 12], // Center of Philippines
        zoom: 5,
        interactive: true
      });
      
      // Add navigation control
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    }
    
    // Wait for map to load before adding layers
    const initializeMap = () => {
      if (!map.current) return;
      
      // Prepare GeoJSON with data values
      const geojson = JSON.parse(JSON.stringify(PHILIPPINES_REGIONS_GEOJSON));
      
      // Update values from provided data
      geojson.features.forEach((feature: any) => {
        const regionData = data.find(d => d.name === feature.properties.name);
        if (regionData) {
          feature.properties.value = regionData.value;
          feature.properties.percentage = regionData.percentage;
        }
      });
      
      // Get min and max values for color scale
      const values = data.map(d => d.value);
      const minValue = Math.min(...values);
      const maxValue = Math.max(...values);
      
      // Create color scale using d3-scale
      const colorScale = scaleLinear<string>()
        .domain([minValue, maxValue])
        .range(['rgba(255,165,0,0.7)', 'rgba(255,0,0,0.7)']); // orange to red
      
      // Add source if it doesn't exist
      if (!map.current.getSource('regions')) {
        map.current.addSource('regions', {
          type: 'geojson',
          data: geojson
        });
        
        // Add fill layer
        map.current.addLayer({
          id: 'regions-fill',
          type: 'fill',
          source: 'regions',
          paint: {
            'fill-color': [
              'interpolate',
              ['linear'],
              ['get', 'value'],
              minValue, 'rgba(255,165,0,0.7)', // light orange
              maxValue, 'rgba(255,0,0,0.7)'    // deep red
            ],
            'fill-outline-color': '#FFFFFF'
          }
        });
        
        // Add outline layer
        map.current.addLayer({
          id: 'regions-outline',
          type: 'line',
          source: 'regions',
          paint: {
            'line-color': '#FFFFFF',
            'line-width': 1
          }
        });
        
        // Add labels
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
        
        // Add hover popup
        map.current.on('mouseenter', 'regions-fill', (e) => {
          if (e.features && e.features.length > 0) {
            map.current!.getCanvas().style.cursor = 'pointer';
            
            const feature = e.features[0];
            const regionName = feature.properties.name;
            const regionValue = feature.properties.value;
            const percentage = feature.properties.percentage;
            
            new mapboxgl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(`
                <strong>${regionName}</strong><br>
                ₱${regionValue.toLocaleString()}<br>
                ${percentage ? percentage : ''}
              `)
              .addTo(map.current!);
          }
        });
        
        // Remove popup when mouse leaves
        map.current.on('mouseleave', 'regions-fill', () => {
          map.current!.getCanvas().style.cursor = '';
          const popups = document.getElementsByClassName('mapboxgl-popup');
          if (popups.length) {
            popups[0].remove();
          }
        });
        
        // Add click handler
        if (onRegionClick) {
          map.current.on('click', 'regions-fill', (e) => {
            if (e.features && e.features.length > 0) {
              const regionName = e.features[0].properties.name;
              onRegionClick(regionName);
            }
          });
        }
      } else {
        // Update existing source
        (map.current.getSource('regions') as mapboxgl.GeoJSONSource).setData(geojson);
        
        // Update fill color expression with new min/max values
        map.current.setPaintProperty('regions-fill', 'fill-color', [
          'interpolate',
          ['linear'],
          ['get', 'value'],
          minValue, 'rgba(255,165,0,0.7)', // light orange
          maxValue, 'rgba(255,0,0,0.7)'    // deep red
        ]);
      }
    };
    
    if (map.current.loaded()) {
      initializeMap();
    } else {
      map.current.on('load', initializeMap);
    }
    
    // Cleanup
    return () => {
      if (map.current) {
        // We don't remove the map here to avoid re-initialization
        // Just clean up event listeners if needed
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
        style={{ 
          width: typeof width === 'number' ? `${width}px` : width, 
          height: `${height}px` 
        }}
        className="rounded-lg overflow-hidden"
      />
      
      {/* Legend */}
      <div className="absolute bottom-2 right-2 bg-white p-2 rounded shadow-md text-xs">
        <div className="font-medium mb-1">Revenue (₱)</div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#dbeafe]"></div>
          <span>Low</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#93c5fd]"></div>
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#3b82f6]"></div>
          <span>High</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#1e40af]"></div>
          <span>Very High</span>
        </div>
      </div>
    </div>
  );
};

export default PhilippinesRegionMap;