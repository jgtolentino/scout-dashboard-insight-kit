import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useVolumeData } from '@/hooks/useVolumeData';
import { useFilterStore } from '@/stores/filterStore';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const TransactionVolumeExample = () => {
  const filters = useFilterStore();
  const { data, isLoading, error } = useVolumeData(filters);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hourly Transaction Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hourly Transaction Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center flex-col space-y-4">
            <p className="text-muted-foreground">Unable to load transaction volume data</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Process data for chart
  const hourlyData = data?.hourly || [];
  
  // If no data, show empty state
  if (hourlyData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hourly Transaction Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">No transaction data available for the selected filters</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hourly Transaction Volume</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [value, 'Transactions']}
                labelFormatter={(label) => `Hour: ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="volume" 
                stroke="#8884d8" 
                fill="#8884d8"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Peak Hours Summary */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
          <p className="text-sm text-blue-700">
            <span className="font-bold">Peak Hours:</span> {
              hourlyData.reduce((max, current) => 
                current.volume > max.volume ? current : max, 
                { hour: '', volume: 0 }
              ).hour
            } ({
              hourlyData.reduce((max, current) => 
                current.volume > max.volume ? current : max, 
                { hour: '', volume: 0 }
              ).volume
            } transactions)
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionVolumeExample;