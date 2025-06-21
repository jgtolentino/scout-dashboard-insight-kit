
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', revenue: 65000, growth: 12 },
  { month: 'Feb', revenue: 72000, growth: 15 },
  { month: 'Mar', revenue: 68000, growth: 8 },
  { month: 'Apr', revenue: 85000, growth: 22 },
  { month: 'May', revenue: 92000, growth: 18 },
  { month: 'Jun', revenue: 98000, growth: 25 },
];

const RevenueChart = () => {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Revenue Trends
          <span className="text-sm font-normal text-green-600 bg-green-100 px-2 py-1 rounded">
            +25% vs last month
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
