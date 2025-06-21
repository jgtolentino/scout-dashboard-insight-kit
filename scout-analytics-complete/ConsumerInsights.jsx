import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { API_BASE_URL } from '../config/api';
import Map, { Marker, Popup } from 'react-map-gl';
import { MAPBOX_ACCESS_TOKEN } from '../config/api';
import 'mapbox-gl/dist/mapbox-gl.css';

export function ConsumerInsights() {
  const [demographics, setDemographics] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConsumerData();
  }, []);

  const fetchConsumerData = async () => {
    try {
      setLoading(true);
      
      // Fetch demographics data
      const demographicsResponse = await fetch(`${API_BASE_URL}/demographics`);
      const demographicsData = await demographicsResponse.json();
      
      // Fetch stores data for map
      const storesResponse = await fetch(`${API_BASE_URL}/stores`);
      const storesData = await storesResponse.json();
      
      // Process demographics data
      if (demographicsData.age_groups) {
        const colors = ['bg-chart-1', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4', 'bg-chart-5'];
        const processedDemographics = demographicsData.age_groups.map((group, index) => ({
          group: group.age_group,
          percentage: (group.count / demographicsData.age_groups.reduce((sum, g) => sum + g.count, 0) * 100).toFixed(1),
          color: colors[index % colors.length],
          count: group.count
        }));
        setDemographics(processedDemographics);
      }
      
      // Set stores data
      setStores(storesData.data || []);
      
    } catch (error) {
      console.error('Error fetching consumer data:', error);
      // Fallback to simulated data
      setDemographics([
        { group: '18-25', percentage: 22.5, color: 'bg-chart-1', count: 2890 },
        { group: '26-35', percentage: 31.2, color: 'bg-chart-2', count: 4006 },
        { group: '36-45', percentage: 28.8, color: 'bg-chart-3', count: 3699 },
        { group: '46-55', percentage: 12.1, color: 'bg-chart-4', count: 1554 },
        { group: '55+', percentage: 5.4, color: 'bg-chart-5', count: 693 }
      ]);
      setStores([
        { store_id: '1', name: 'Metro Manila Store', latitude: 14.5995, longitude: 120.9842, city: 'Manila', region: 'NCR' },
        { store_id: '2', name: 'Cebu Store', latitude: 10.3157, longitude: 123.8854, city: 'Cebu', region: 'Central Visayas' },
        { store_id: '3', name: 'Davao Store', latitude: 7.1907, longitude: 125.4553, city: 'Davao', region: 'Davao Region' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Consumer Insights</h1>
        <p className="text-muted-foreground">
          Behavior signals and demographic profiling analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Age Group Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {demographics.map((demo) => (
                <div key={demo.group} className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded ${demo.color}`}></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{demo.group} years</span>
                      <span className="text-sm text-muted-foreground">{demo.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className={`h-2 rounded-full ${demo.color}`}
                        style={{ width: `${demo.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Store Locations Map</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 rounded-lg overflow-hidden">
              <Map
                mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
                initialViewState={{
                  longitude: 121.0,
                  latitude: 12.0,
                  zoom: 5
                }}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/light-v11"
              >
                {stores.map((store) => (
                  <Marker
                    key={store.store_id}
                    longitude={store.longitude}
                    latitude={store.latitude}
                    anchor="bottom"
                    onClick={(e) => {
                      e.originalEvent.stopPropagation();
                      setSelectedStore(store);
                    }}
                  >
                    <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg cursor-pointer hover:bg-blue-600 transition-colors"></div>
                  </Marker>
                ))}
                
                {selectedStore && (
                  <Popup
                    longitude={selectedStore.longitude}
                    latitude={selectedStore.latitude}
                    anchor="top"
                    onClose={() => setSelectedStore(null)}
                    closeButton={true}
                    closeOnClick={false}
                  >
                    <div className="p-2">
                      <h3 className="font-semibold">{selectedStore.name}</h3>
                      <p className="text-sm text-gray-600">{selectedStore.city}, {selectedStore.region}</p>
                    </div>
                  </Popup>
                )}
              </Map>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 mt-1">
                      <div 
                        className={`h-2 rounded-full ${demo.color}`}
                        style={{ width: `${demo.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gender Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
              <p className="text-muted-foreground">Donut Chart Placeholder</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Regional Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {regions.map((region) => (
                <div key={region.name} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{region.name}</p>
                    <p className="text-sm text-muted-foreground">{region.transactions} transactions</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">{region.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Purchase Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="font-medium">Awareness</span>
                <span className="text-lg font-bold">100%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="font-medium">Interest</span>
                <span className="text-lg font-bold">78%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <span className="font-medium">Consideration</span>
                <span className="text-lg font-bold">45%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <span className="font-medium">Purchase</span>
                <span className="text-lg font-bold">23%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="font-medium">Retention</span>
                <span className="text-lg font-bold">67%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Geographic Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
              <p className="text-muted-foreground">Geographic Heatmap Placeholder</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

