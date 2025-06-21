
import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import useSWR from 'swr';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useFilterStore } from '@/stores/filterStore';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface GeoHeatmapProps {
  dataUrl?: string;
  className?: string;
}

export default function GeoHeatmap({ dataUrl, className }: GeoHeatmapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { getQueryString } = useFilterStore();
  
  // Use the global filter store to build the query string or use provided dataUrl
  const queryString = getQueryString();
  const apiUrl = dataUrl || `/api/demographics?agg=barangay${queryString ? '&' + queryString : ''}`;
  
  const { data } = useSWR(apiUrl, fetcher);

  useEffect(() => {
    if (!ref.current || !data) return;
    
    // Set Mapbox access token
    mapboxgl.accessToken = 'pk.eyJ1Ijoiamd0b2xlbnRpbm8iLCJhIjoiY21jMmNycWRiMDc0ajJqcHZoaDYyeTJ1NiJ9.Dns6WOql16BUQ4l7otaeww';
    
    const map = new mapboxgl.Map({
      container: ref.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [121, 14], // Philippines centroid
      zoom: 5.5,
      interactive: false
    });
    
    map.on('load', () => {
      map.addSource('sales', { type: 'geojson', data });
      map.addLayer({
        id: 'sales-heat',
        type: 'heatmap',
        source: 'sales',
        paint: {
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'count'],
            0, 0,
            1000, 1
          ],
          'heatmap-intensity': 1,
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0, 0, 255, 0)',
            0.5, 'royalblue',
            1, 'red'
          ],
          'heatmap-radius': 20
        }
      });
    });
    
    return () => map.remove();
  }, [data]);

  return <div ref={ref} className={className ?? 'w-full h-56 rounded'} />;
}
