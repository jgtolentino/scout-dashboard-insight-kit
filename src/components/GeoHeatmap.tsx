
import React, { useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function GeoHeatmap() {
  const ref = useRef<HTMLDivElement>(null);
  const { data } = useSWR('/api/demographics?agg=barangay', fetcher);

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
