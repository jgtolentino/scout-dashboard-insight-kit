import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { useQuery } from '@tanstack/react-query';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useFilterStore } from '@/stores/filterStore';
import { API_BASE_URL, MAPBOX_ACCESS_TOKEN } from '@/config/api';
import type { GeographicApiResponse, LocationData } from '@/types/api';

interface GeoHeatmapProps {
  dataUrl?: string;
  className?: string;
}

export default function GeoHeatmap({ dataUrl, className }: GeoHeatmapProps) {
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
  
  const { data, isLoading, error } = useQuery<GeographicApiResponse>({
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
        const features = data.data.map((location: LocationData) => ({
          type: 'Feature' as const,
          properties: {
            count: location.count || 1,
            name: location.name || location.region || 'Unknown'
          },
          geometry: {
            type: 'Point' as const,
            coordinates: [location.longitude || 121, location.latitude || 14] as [number, number]
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
    return <div className={`animate-pulse bg-gray-100 rounded ${className}`} style={{ height: '300px' }} />;
  }

  if (error) {
    return (
      <div className={`bg-gray-50 rounded border-2 border-dashed border-gray-300 flex items-center justify-center ${className}`} style={{ height: '300px' }}>
        <div className="text-gray-500">Unable to load geographic data</div>
      </div>
    );
  }

  return <div ref={ref} className={className ?? 'w-full h-56 rounded'} />;
}