
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { BarChart3, Users, ShoppingCart, DollarSign, TrendingUp, Package } from "lucide-react";
import CategoryTreemapLive from "@/components/CategoryTreemapLive";
import { GlobalFilterBar } from "@/components/GlobalFilterBar";

const Overview = () => {
  const metrics = [
    { title: "Total Revenue", value: "₱2.4M", change: "+12.3%", icon: DollarSign, positive: true },
    { title: "Total Transactions", value: "15,847", change: "+8.2%", icon: ShoppingCart, positive: true },
    { title: "Active Customers", value: "8,429", change: "+15.4%", icon: Users, positive: true },
    { title: "Avg Order Value", value: "₱186", change: "-2.1%", icon: TrendingUp, positive: false },
  ];

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="flex items-center gap-3 mb-6">
        <SidebarTrigger />
        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
          <BarChart3 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Scout Analytics Overview
          </h1>
          <p className="text-gray-600 mt-1">Real-time insights into your retail analytics</p>
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

      {/* Category Mix Treemap */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Category Mix Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryTreemapLive />
        </CardContent>
      </Card>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Beverages</span>
                <span className="text-sm text-green-600">+15.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Food & Snacks</span>
                <span className="text-sm text-green-600">+12.8%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Personal Care</span>
                <span className="text-sm text-green-600">+8.9%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Household Items</span>
                <span className="text-sm text-red-600">-3.2%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Regional Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Metro Manila</span>
                <span className="text-sm font-medium">₱1.2M</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Cebu</span>
                <span className="text-sm font-medium">₱680K</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Davao</span>
                <span className="text-sm font-medium">₱520K</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Overview;
