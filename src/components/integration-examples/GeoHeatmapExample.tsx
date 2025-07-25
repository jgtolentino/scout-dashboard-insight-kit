import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { useQuery } from '@tanstack/react-query';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useFilterStore } from '@/stores/filterStore';
import { API_BASE_URL, MAPBOX_ACCESS_TOKEN } from '@/config/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface GeoHeatmapExampleProps {
  dataUrl?: string;
  className?: string;
}

export default function GeoHeatmapExample({ dataUrl, className }: GeoHeatmapExampleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const filters = useFilterStore();
  
  // Build query string from filters
  const queryParams = new URLSearchParams();
  if (filters.from) queryParams.set('from_date', filters.from);
  if (filters.to) queryParams.set('to_date', filters.to);
  if (filters.categories?.length) queryParams.set('category', filters.categories.join(','));
  if (filters.brands?.length) queryParams.set('brand', filters.brands.join(','));
  
  const queryString = queryParams.toString();
  const apiUrl = dataUrl || `${API_BASE_URL}/demographics?agg=barangay${queryString ? '&' + queryString : ''}`;
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['geo-heatmap', apiUrl],
    queryFn: async () => {
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error('Failed to fetch geographic data');
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching geographic data:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });

  useEffect(() => {
    if (!ref.current || isLoading || error) return;
    
    // Set Mapbox access token
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
    
    const map = new mapboxgl.Map({
      container: ref.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [121, 14], // Philippines centroid
      zoom: 5.5,
      interactive: true
    });
    
    map.on('load', () => {
      // If we have GeoJSON data
      if (data && data.type === 'FeatureCollection') {
        map.addSource('sales', { 
          type: 'geojson', 
          data 
        });
        
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
      } else if (data && Array.isArray(data.data) && data.data.length > 0) {
        // If we have array data, convert to GeoJSON
        const features = data.data.map((location: any) => ({
          type: 'Feature',
          properties: {
            count: location.count || 1,
            name: location.name || location.region || 'Unknown'
          },
          geometry: {
            type: 'Point',
            coordinates: [location.longitude || 121, location.latitude || 14]
          }
        }));
        
        const geoJson = {
          type: 'FeatureCollection',
          features
        };
        
        map.addSource('sales', { 
          type: 'geojson', 
          data: geoJson
        });
        
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
      } else {
        // Fallback to simple markers for Philippines regions
        const fallbackData = [
          { name: 'Metro Manila', lat: 14.5995, lng: 120.9842, count: 8456 },
          { name: 'Cebu', lat: 10.3157, lng: 123.8854, count: 3234 },
          { name: 'Davao', lat: 7.1907, lng: 125.4553, count: 2891 },
          { name: 'Iloilo', lat: 10.7202, lng: 122.5621, count: 1876 },
          { name: 'Baguio', lat: 16.4023, lng: 120.5960, count: 1790 }
        ];
        
        fallbackData.forEach(location => {
          // Create a marker
          new mapboxgl.Marker({
            color: '#3b82f6'
          })
            .setLngLat([location.lng, location.lat])
            .setPopup(new mapboxgl.Popup().setHTML(
              `<h3 class="font-bold">${location.name}</h3>
               <p>${location.count.toLocaleString()} transactions</p>`
            ))
            .addTo(map);
        });
      }
    });
    
    return () => map.remove();
  }, [data, isLoading, error]);

  if (isLoading) {
    return <Skeleton className={`${className || 'w-full h-56 rounded'}`} />;
  }

  if (error) {
    return (
      <div className={`bg-gray-50 rounded border-2 border-dashed border-gray-300 flex items-center justify-center ${className || 'w-full h-56'}`}>
        <div className="text-center">
          <div className="text-gray-500 mb-2">Unable to load geographic data</div>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return <div ref={ref} className={className || 'w-full h-56 rounded'} />;
}