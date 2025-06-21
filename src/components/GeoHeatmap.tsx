
import React, { useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import useSWR from 'swr';
import { useFilterStore } from '@/stores/filterStore';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function GeoHeatmap() {
  const ref = useRef<HTMLDivElement>(null);
  const { getQueryString } = useFilterStore();
  
  // Use the global filter store to build the query string
  const queryString = getQueryString();
  const apiUrl = `/api/demographics?agg=barangay${queryString ? '&' + queryString : ''}`;
  
  const { data } = useSWR(apiUrl, fetcher);

  useEffect(() => {
    if (!ref.current || !data) return;
    
    const map = new maplibregl.Map({
      container: ref.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [121, 14],
      zoom: 5.5,
      interactive: false
    });
    
    map.on('load', () => {
      map.addSource('sales', { type: 'geojson', data });
      map.addLayer({
        id: 'sales-heat',
        type: 'heatmap',
        source: 'sales',
        paint: { 'heatmap-weight': ['/', ['get', 'count'], 5000] }
      });
    });
    
    return () => map.remove();
  }, [data]);

  return <div ref={ref} className="w-full h-56 rounded" />;
}
