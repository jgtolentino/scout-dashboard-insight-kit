import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Package, TrendingUp, BarChart3, DollarSign } from "lucide-react";
import { GlobalFilterBar } from "@/components/GlobalFilterBar";
import ParetoChartLive from "@/components/ParetoChartLive";
import SubstitutionFlowChart from "@/components/SubstitutionFlowChart";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import TimeIntelligenceBar from "@/components/time/TimeIntelligenceBar";

const ProductMix = () => {
  const metrics = [
    { title: "Total SKUs", value: "2,847", change: "+12.3%", icon: Package, positive: true },
    { title: "Top Performing SKUs", value: "234", change: "+8.2%", icon: TrendingUp, positive: true },
    { title: "Revenue per SKU", value: "₱1,245", change: "+15.4%", icon: DollarSign, positive: true },
    { title: "Category Mix", value: "47 Categories", change: "+2.1%", icon: BarChart3, positive: true },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center gap-4 border-b px-6 py-4 bg-background">
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
      <div className="flex-1 p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 overflow-auto">
        {/* Time Intelligence Bar */}
        <TimeIntelligenceBar />
        
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

        {/* Charts */}
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
        
        {/* Product Insights */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Product Performance Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Top Performing Category: Beverages</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Beverages account for 28.5% of total revenue with 15% growth month-over-month.
                    Coca-Cola products lead with 42% of category sales.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Package className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Product Bundling Opportunity</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Customers who purchase snacks are 67% more likely to also buy beverages.
                    Consider creating bundle promotions to increase average order value.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-100 rounded-full">
                  <DollarSign className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Price Elasticity Analysis</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Personal care products show low price elasticity (-0.3), indicating opportunity
                    for premium pricing without significant volume impact.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductMix;