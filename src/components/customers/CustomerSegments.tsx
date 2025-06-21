
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { segment: 'VIP', count: 1250, revenue: 85000, avgOrder: 680 },
  { segment: 'Loyal', count: 3200, revenue: 65000, avgOrder: 203 },
  { segment: 'Regular', count: 8500, revenue: 45000, avgOrder: 125 },
  { segment: 'New', count: 2100, revenue: 18000, avgOrder: 86 },
];

const CustomerSegments = () => {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Customer Segments Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="segment" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-4 gap-4 mt-4">
          {data.map((segment) => (
            <div key={segment.segment} className="text-center p-3 bg-gray-50 rounded">
              <h4 className="font-semibold">{segment.segment}</h4>
              <p className="text-sm text-gray-600">{segment.count} customers</p>
              <p className="text-sm font-medium">${segment.avgOrder} avg order</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerSegments;
