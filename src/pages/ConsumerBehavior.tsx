
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Brain, TrendingUp, Clock, Heart } from "lucide-react";

const ConsumerBehavior = () => {
  const [brandCategory, setBrandCategory] = useState(true);
  const [ageGroup, setAgeGroup] = useState(false);
  const [gender, setGender] = useState(true);

  const metrics = [
    { title: "Avg Session Time", value: "8.5 min", change: "+12.3%", icon: Clock, positive: true },
    { title: "Conversion Rate", value: "3.24%", change: "+8.2%", icon: TrendingUp, positive: true },
    { title: "Return Visitors", value: "64.2%", change: "+15.4%", icon: Heart, positive: true },
    { title: "Engagement Score", value: "8.7/10", change: "+2.1%", icon: Brain, positive: true },
  ];

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="flex items-center gap-3 mb-6">
        <SidebarTrigger />
        <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl text-white">
          <Brain className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Consumer Behavior & Preference Signals
          </h1>
          <p className="text-gray-600 mt-1">Behavioral analysis and preferences</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm">• How the product was requested (branded, unbranded, unsure)</p>
              <p className="text-sm">• Pointing vs verbal vs indirect request</p>
            </div>
            <div>
              <p className="text-sm">• Acceptance of storeowner suggestion</p>
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
              <Label htmlFor="brand-category">Brand/category</Label>
              <Switch id="brand-category" checked={brandCategory} onCheckedChange={setBrandCategory} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="age-group">Age group</Label>
              <Switch id="age-group" checked={ageGroup} onCheckedChange={setAgeGroup} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="gender">Gender</Label>
              <Switch id="gender" checked={gender} onCheckedChange={setGender} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visuals */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            📊 Visuals: Pie charts, stacked bar, funnel chart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 p-8 rounded-lg text-center">
            <p className="text-gray-600">Funnel Chart showing consumer decision process</p>
            <div className="mt-4 h-40 bg-gradient-to-r from-purple-500 to-pink-600 rounded opacity-20"></div>
          </div>
          <div className="mt-4 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
            <p className="text-sm text-red-700">
              🎯 <strong>Goal:</strong> Decode how people decide and buy at the counter.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsumerBehavior;
