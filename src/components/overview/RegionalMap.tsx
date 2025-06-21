
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

const RegionalMap = () => {
  const regions = [
    { name: "Metro Manila", revenue: 2400000, growth: 12.3, color: "#059669" },
    { name: "Cebu", revenue: 1800000, growth: 8.7, color: "#10b981" },
    { name: "Davao", revenue: 1200000, growth: 15.2, color: "#34d399" },
    { name: "Baguio", revenue: 800000, growth: -2.1, color: "#fbbf24" },
    { name: "Iloilo", revenue: 600000, growth: 5.4, color: "#60a5fa" },
  ];

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          Regional Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {regions.map((region, index) => (
            <div key={region.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: region.color }}
                ></div>
                <span className="font-medium">{region.name}</span>
              </div>
              <div className="text-right">
                <div className="font-bold">₱{(region.revenue / 1000000).toFixed(1)}M</div>
                <div className={`text-sm ${region.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {region.growth > 0 ? '+' : ''}{region.growth}%
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
          <p className="text-sm text-green-700">
            🎯 <strong>Top Performer:</strong> Metro Manila leads with ₱2.4M revenue (+12.3% growth)
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RegionalMap;
