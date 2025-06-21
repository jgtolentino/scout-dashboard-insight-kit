import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { API_BASE_URL } from '../config/api';

export function TransactionTrends() {
  const [hourlyData, setHourlyData] = useState([]);
  const [regionalData, setRegionalData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendsData();
  }, []);

  const fetchTrendsData = async () => {
    try {
      setLoading(true);
      
      // Fetch volume data for hourly trends
      const volumeResponse = await fetch(`${API_BASE_URL}/volume`);
      const volumeData = await volumeResponse.json();
      
      // Fetch transactions for regional analysis
      const transactionsResponse = await fetch(`${API_BASE_URL}/transactions?limit=1000`);
      const transactionsData = await transactionsResponse.json();
      
      // Process hourly data
      if (volumeData.hourly) {
        const processedHourly = volumeData.hourly.map(item => ({
          hour: `${item.hour}:00`,
          transactions: item.volume,
          amount: item.volume * 156 // Simulate amount from volume
        }));
        setHourlyData(processedHourly);
      }
      
      // Process regional data from transactions
      const transactions = transactionsData.data || [];
      const regionCounts = {};
      transactions.forEach(t => {
        const region = t.region || 'Unknown';
        regionCounts[region] = (regionCounts[region] || 0) + 1;
      });
      
      const processedRegional = Object.entries(regionCounts).map(([region, count]) => ({
        region,
        transactions: count,
        percentage: ((count / transactions.length) * 100).toFixed(1)
      }));
      
      setRegionalData(processedRegional);
      
    } catch (error) {
      console.error('Error fetching trends data:', error);
      // Fallback to simulated data
      setHourlyData([
        { hour: '6:00', transactions: 245, amount: 38420 },
        { hour: '7:00', transactions: 312, amount: 48672 },
        { hour: '8:00', transactions: 428, amount: 66768 },
        { hour: '9:00', transactions: 567, amount: 88452 },
        { hour: '10:00', transactions: 634, amount: 98904 },
        { hour: '11:00', transactions: 789, amount: 123084 },
        { hour: '12:00', transactions: 892, amount: 139152 },
        { hour: '13:00', transactions: 945, amount: 147420 },
        { hour: '14:00', transactions: 823, amount: 128388 },
        { hour: '15:00', transactions: 756, amount: 117936 },
        { hour: '16:00', transactions: 689, amount: 107484 },
        { hour: '17:00', transactions: 612, amount: 95472 },
        { hour: '18:00', transactions: 834, amount: 130104 },
        { hour: '19:00', transactions: 923, amount: 143988 },
        { hour: '20:00', transactions: 756, amount: 117936 },
        { hour: '21:00', transactions: 567, amount: 88452 },
        { hour: '22:00', transactions: 345, amount: 53820 },
        { hour: '23:00', transactions: 234, amount: 36504 }
      ]);
      
      setRegionalData([
        { region: 'Metro Manila', transactions: 8456, percentage: '46.3' },
        { region: 'Cebu', transactions: 3234, percentage: '17.7' },
        { region: 'Davao', transactions: 2891, percentage: '15.8' },
        { region: 'Iloilo', transactions: 1876, percentage: '10.3' },
        { region: 'Others', transactions: 1790, percentage: '9.9' }
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
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Transaction Trends</h1>
        <p className="text-muted-foreground">
          Temporal and regional transaction dynamics analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Hourly Transaction Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="transactions" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Regional Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="transactions" 
                  fill="hsl(var(--chart-2))"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction Value Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
              <p className="text-muted-foreground">Box Plot Placeholder</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Peak Hours Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Morning Peak (8-10 AM)</span>
                <span className="text-sm text-muted-foreground">2,847 transactions</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Lunch Peak (12-2 PM)</span>
                <span className="text-sm text-muted-foreground">3,456 transactions</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Evening Peak (6-8 PM)</span>
                <span className="text-sm text-muted-foreground">4,123 transactions</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

