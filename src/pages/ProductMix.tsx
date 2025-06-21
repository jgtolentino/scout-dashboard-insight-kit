import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Package, TrendingUp, BarChart3, DollarSign } from "lucide-react";
import { GlobalFilterBar } from "@/components/GlobalFilterBar";
import ParetoChartLive from "@/components/ParetoChartLive";
import SubstitutionFlowChart from "@/components/SubstitutionFlowChart";
import BreadcrumbNav from "@/components/BreadcrumbNav";

const ProductMix = () => {
  const [categoryFilter, setCategoryFilter] = useState(true);
  const [brandFilter, setBrandFilter] = useState(false);
  const [skuName, setSkuName] = useState(false);
  const [location, setLocation] = useState(true);

  const metrics = [
    { title: "Total SKUs", value: "2,847", change: "+12.3%", icon: Package, positive: true },
    { title: "Top Performing SKUs", value: "234", change: "+8.2%", icon: TrendingUp, positive: true },
    { title: "Revenue per SKU", value: "₱1,245", change: "+15.4%", icon: DollarSign, positive: true },
    { title: "Category Mix", value: "47 Categories", change: "+2.1%", icon: BarChart3, positive: true },
  ];

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-4 border-b px-6 py-4">
        <SidebarTrigger />
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Product Mix & SKU Info
            </h1>
            <p className="text-gray-600 mt-1">Product analytics and SKU insights</p>
          </div>
        </div>
        <div className="ml-auto">
          <BreadcrumbNav />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm">• Category and brand breakdown per transaction</p>
                <p className="text-sm">• Top SKUs per category</p>
              </div>
              <div>
                <p className="text-sm">• Number of items per basket (1, 2, 3+)</p>
                <p className="text-sm">• Substitution patterns (brand A → brand B)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Toggles */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-white bg-black rounded-lg p-4">
              Toggles (User can toggle to see different permutations)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="category-filter">Category filter (e.g., haircare, snacks)</Label>
                  <Switch id="category-filter" checked={categoryFilter} onCheckedChange={setCategoryFilter} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="brand-filter">Brand filter</Label>
                  <Switch id="brand-filter" checked={brandFilter} onCheckedChange={setBrandFilter} />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sku-name">SKU name</Label>
                  <Switch id="sku-name" checked={skuName} onCheckedChange={setSkuName} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="location-toggle">Location</Label>
                  <Switch id="location-toggle" checked={location} onCheckedChange={setLocation} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pareto Chart */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Product Performance (Pareto)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ParetoChartLive />
            </CardContent>
          </Card>

          {/* Substitution Flow Chart */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Brand Substitution Flow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SubstitutionFlowChart />
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
          <p className="text-sm text-red-700">
            🎯 <strong>Goal:</strong> See what's being bought, in what combos, and what gets swapped.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductMix;
