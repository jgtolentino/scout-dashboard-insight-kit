
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { TrendingUp, BarChart3, Clock, MapPin } from "lucide-react";

const Index = () => {
  const [timeOfDay, setTimeOfDay] = useState(true);
  const [barangayRegion, setBarangayRegion] = useState(true);
  const [category, setCategory] = useState(true);
  const [weekVsWeekend, setWeekVsWeekend] = useState(false);
  const [location, setLocation] = useState(false);

  const metrics = [
    { title: "Total Transactions", value: "24,853", change: "+12.3%", icon: TrendingUp, positive: true },
    { title: "Average Transaction Value", value: "₱342.50", change: "+8.2%", icon: BarChart3, positive: true },
    { title: "Peak Hours", value: "2-4 PM", change: "+15.4%", icon: Clock, positive: true },
    { title: "Top Location", value: "Makati", change: "+5.1%", icon: MapPin, positive: true },
  ];

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-white">
          <TrendingUp className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Transaction Trends
          </h1>
          <p className="text-gray-600 mt-1">Track transaction patterns and trends</p>
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
                    <p className="text-sm text-gray-600 mb-1">{metric.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
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
        <CardHeader className="pb-4">
          <CardTitle className="text-white bg-black rounded-lg p-4 text-lg">
            What it includes:
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <p className="text-sm text-gray-700">• Volume of transactions by time of day & location</p>
              <p className="text-sm text-gray-700">• Peso value distribution</p>
              <p className="text-sm text-gray-700">• Duration of transaction</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-700">• Units per transaction</p>
              <p className="text-sm text-gray-700">• Brand and category</p>
              <p className="text-sm text-gray-700">• Average value per transaction</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Toggles */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-white bg-black rounded-lg p-4 text-lg">
            Toggles (User can toggle to see different permutations)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="time-toggle" className="text-sm font-medium">Time of day</Label>
                <Switch id="time-toggle" checked={timeOfDay} onCheckedChange={setTimeOfDay} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="location-toggle" className="text-sm font-medium">Barangay / Region</Label>
                <Switch id="location-toggle" checked={barangayRegion} onCheckedChange={setBarangayRegion} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="category-toggle" className="text-sm font-medium">Category</Label>
                <Switch id="category-toggle" checked={category} onCheckedChange={setCategory} />
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="week-toggle" className="text-sm font-medium">Week vs weekend</Label>
                <Switch id="week-toggle" checked={weekVsWeekend} onCheckedChange={setWeekVsWeekend} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="location-main-toggle" className="text-sm font-medium">Location</Label>
                <Switch id="location-main-toggle" checked={location} onCheckedChange={setLocation} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visuals */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            📊 Visuals: Time series chart, box plot, heatmap
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="bg-gray-100 p-8 rounded-lg text-center mb-4">
            <p className="text-gray-600 mb-4">Time Series Chart showing transaction patterns</p>
            <div className="h-40 bg-gradient-to-r from-blue-500 to-purple-600 rounded opacity-20"></div>
          </div>
          <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
            <p className="text-sm text-red-700">
              🎯 <strong>Goal:</strong> Understand transaction dynamics and patterns by dimension.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
