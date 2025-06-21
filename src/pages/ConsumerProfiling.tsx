
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Users, UserCheck, TrendingUp, MapPin } from "lucide-react";
import GeoHeatmap from "@/components/GeoHeatmap";

const ConsumerProfiling = () => {
  const [barangay, setBarangay] = useState(true);
  const [productCategory, setProductCategory] = useState(false);
  const [brand, setBrand] = useState(true);

  const metrics = [
    { title: "Total Profiles", value: "15,847", change: "+12.3%", icon: Users, positive: true },
    { title: "Active Profiles", value: "8,429", change: "+8.2%", icon: UserCheck, positive: true },
    { title: "Profile Completeness", value: "87.5%", change: "+15.4%", icon: TrendingUp, positive: true },
    { title: "Geographic Reach", value: "47 Barangays", change: "+2.1%", icon: MapPin, positive: true },
  ];

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="flex items-center gap-3 mb-6">
        <SidebarTrigger />
        <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl text-white">
          <Users className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Consumer Profiling
          </h1>
          <p className="text-gray-600 mt-1">Customer demographics and profiling</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{metric.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                    <p className={`text-sm ${metric.positive ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.change} vs last month
                    </p>
                  </div>
                  <Icon className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* What it includes */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-white bg-black rounded-lg p-4">
            What it includes:
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm">• Gender (inferred)</p>
            </div>
            <div>
              <p className="text-sm">• Age bracket (estimated from audio/video)</p>
            </div>
            <div>
              <p className="text-sm">• Location mapping</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Toggles */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-white bg-black rounded-lg p-4">
            Toggles:
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="barangay">Barangay</Label>
              <Switch id="barangay" checked={barangay} onCheckedChange={setBarangay} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="product-category">Product category</Label>
              <Switch id="product-category" checked={productCategory} onCheckedChange={setProductCategory} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="brand">Brand</Label>
              <Switch id="brand" checked={brand} onCheckedChange={setBrand} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visuals */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-orange-600" />
            📊 Visuals: Donut charts, demographic trees, geo heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 p-8 rounded-lg text-center">
            <p className="text-gray-600 mb-4">Geographic Heatmap showing customer distribution</p>
            <GeoHeatmap />
          </div>
          <div className="mt-4 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
            <p className="text-sm text-red-700">
              🎯 <strong>Goal:</strong> See who is buying, and where.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsumerProfiling;
