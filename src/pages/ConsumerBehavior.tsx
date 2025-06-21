
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Users, ShoppingCart, Clock, Repeat } from "lucide-react";
import { GlobalFilterBar } from "@/components/GlobalFilterBar";

const ConsumerBehavior = () => {
  const metrics = [
    { title: "Avg Session Duration", value: "12m 34s", change: "+5.2%", icon: Clock, positive: true },
    { title: "Purchase Frequency", value: "2.3x/month", change: "+8.7%", icon: Repeat, positive: true },
    { title: "Cart Abandonment", value: "23.5%", change: "-3.1%", icon: ShoppingCart, positive: true },
    { title: "Return Customers", value: "68.2%", change: "+12.4%", icon: Users, positive: true },
  ];

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="flex items-center gap-3 mb-6">
        <SidebarTrigger />
        <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl text-white">
          <Users className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Consumer Behavior Analysis
          </h1>
          <p className="text-gray-600 mt-1">Understanding customer shopping patterns and behaviors</p>
        </div>
      </div>

      {/* Global Filter Bar */}
      <GlobalFilterBar />

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
              <p className="text-sm">• Basket size trends (1 item, 2 items, 3+ items)</p>
            </div>
            <div>
              <p className="text-sm">• Shopping frequency patterns</p>
            </div>
            <div>
              <p className="text-sm">• Payment method preferences</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Behavior Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Shopping Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Peak Hours: 10-11 AM</span>
                  <span className="text-sm text-gray-500">32%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: "32%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Lunch Rush: 12-1 PM</span>
                  <span className="text-sm text-gray-500">28%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-pink-600 h-2 rounded-full" style={{ width: "28%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Evening: 6-7 PM</span>
                  <span className="text-sm text-gray-500">25%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: "25%" }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Basket Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Single Item Purchases</span>
                <span className="text-sm font-medium">45%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">2-3 Items</span>
                <span className="text-sm font-medium">32%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">4+ Items</span>
                <span className="text-sm font-medium">23%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visuals */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-purple-600" />
            📊 Visuals: Flow charts, time series, behavior heatmaps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 p-8 rounded-lg text-center">
            <p className="text-gray-600">Customer Journey Flow Chart</p>
            <div className="mt-4 h-40 bg-gradient-to-r from-purple-500 to-pink-600 rounded opacity-20"></div>
          </div>
          <div className="mt-4 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
            <p className="text-sm text-red-700">
              🎯 <strong>Goal:</strong> Understand how customers shop and what drives their decisions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsumerBehavior;
