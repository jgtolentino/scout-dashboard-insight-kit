
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Package, 
  MapPin, 
  Brain,
  Activity,
  ShoppingCart,
  ArrowRight
} from "lucide-react";
import RegionalMap from "@/components/overview/RegionalMap";
import RevenueChart from "@/components/overview/RevenueChart";
import CategoryTreemapLive from "@/components/CategoryTreemapLive";
import AIInsightsPreview from "@/components/overview/AIInsightsPreview";

const Overview = () => {
  const kpis = [
    { 
      title: "Total Revenue", 
      value: "₱2.4M", 
      change: "+12.3%", 
      icon: DollarSign, 
      positive: true,
      description: "Last 30 days"
    },
    { 
      title: "Total Transactions", 
      value: "24,853", 
      change: "+8.2%", 
      icon: ShoppingCart, 
      positive: true,
      description: "This month"
    },
    { 
      title: "Unique Customers", 
      value: "8,429", 
      change: "+15.4%", 
      icon: Users, 
      positive: true,
      description: "Active profiles"
    },
    { 
      title: "Top Category", 
      value: "Snacks", 
      change: "+18.1%", 
      icon: Package, 
      positive: true,
      description: "By revenue"
    },
    { 
      title: "Active Devices", 
      value: "47/50", 
      change: "94%", 
      icon: Activity, 
      positive: true,
      description: "Uptime"
    },
    { 
      title: "AI Insights", 
      value: "12", 
      change: "New", 
      icon: Brain, 
      positive: true,
      description: "Generated today"
    },
  ];

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
          <TrendingUp className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Scout Analytics Overview
          </h1>
          <p className="text-gray-600 mt-1">Executive summary and key insights</p>
        </div>
      </div>

      {/* Top Region Badge */}
      <div className="flex justify-between items-center">
        <div className="bg-green-100 text-green-700 text-sm font-medium rounded-lg px-4 py-2 flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          🏆 Top Region: Metro Manila ↑12% vs last month
        </div>
        <div className="text-sm text-gray-600">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Icon className="h-5 w-5 text-gray-400" />
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    kpi.positive ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
                  }`}>
                    {kpi.change}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{kpi.value}</p>
                <p className="text-sm text-gray-600">{kpi.title}</p>
                <p className="text-xs text-gray-500">{kpi.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <RevenueChart />
        
        {/* Regional Performance Map */}
        <RegionalMap />
      </div>

      {/* Secondary Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Performance */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-600" />
              Top Product Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryTreemapLive />
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm text-blue-700">
                📦 <strong>Category Leader:</strong> Snacks dominates with 32.5% of total revenue
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* AI Insights Preview */}
        <div className="lg:col-span-2">
          <AIInsightsPreview />
        </div>
      </div>

      {/* Quick Navigation */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Explore Detailed Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">Transaction Trends</span>
              </div>
              <span className="text-xs text-gray-600 text-left">Time series analysis & patterns</span>
              <ArrowRight className="h-4 w-4 self-end" />
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start space-y-2">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span className="font-medium">Product Mix</span>
              </div>
              <span className="text-xs text-gray-600 text-left">SKU performance & substitution</span>
              <ArrowRight className="h-4 w-4 self-end" />
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start space-y-2">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                <span className="font-medium">Consumer Behavior</span>
              </div>
              <span className="text-xs text-gray-600 text-left">Purchase decisions & preferences</span>
              <ArrowRight className="h-4 w-4 self-end" />
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="font-medium">Consumer Profiling</span>
              </div>
              <span className="text-xs text-gray-600 text-left">Demographics & segmentation</span>
              <ArrowRight className="h-4 w-4 self-end" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Overview;
