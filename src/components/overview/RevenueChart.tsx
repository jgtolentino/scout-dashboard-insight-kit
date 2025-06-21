
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from "lucide-react";

const RevenueChart = () => {
  const data = [
    { date: '1/1', revenue: 45000, transactions: 234 },
    { date: '1/8', revenue: 52000, transactions: 267 },
    { date: '1/15', revenue: 48000, transactions: 245 },
    { date: '1/22', revenue: 61000, transactions: 312 },
    { date: '1/29', revenue: 55000, transactions: 289 },
    { date: '2/5', revenue: 67000, transactions: 334 },
    { date: '2/12', revenue: 71000, transactions: 367 },
    { date: '2/19', revenue: 64000, transactions: 324 },
    { date: '2/26', revenue: 78000, transactions: 401 },
    { date: '3/5', revenue: 82000, transactions: 423 },
    { date: '3/12', revenue: 75000, transactions: 387 },
    { date: '3/19', revenue: 89000, transactions: 456 },
    { date: '3/26', revenue: 94000, transactions: 482 },
  ];

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Revenue Trend (Last 30 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'revenue' ? `₱${value.toLocaleString()}` : value,
                  name === 'revenue' ? 'Revenue' : 'Transactions'
                ]}
                labelStyle={{ color: '#374151' }}
                contentStyle={{ 
                  backgroundColor: '#f9fafb', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#1d4ed8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Average daily revenue: <span className="font-semibold text-gray-900">₱67,384</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
