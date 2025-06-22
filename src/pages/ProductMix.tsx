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
      <header className="flex items-center justify-between border-b px-6 py-4 bg-background">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <div className="p-2.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg text-white">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Product Mix & SKU Info
            </h1>
            <p className="text-xs text-muted-foreground">Product analytics and SKU insights</p>
          </div>
        </div>
        <div>
          <BreadcrumbNav />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-4 space-y-4 bg-gradient-to-br from-slate-50 to-blue-50 overflow-auto">
        {/* Time Intelligence Bar */}
        <TimeIntelligenceBar />
        
        {/* Global Filter Bar */}
        <GlobalFilterBar />

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card key={index} className="bg-white/70 backdrop-blur-sm border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{metric.title}</p>
                      <p className="text-lg font-bold text-gray-900">{metric.value}</p>
                      <p className={`text-xs ${metric.positive ? 'text-green-600' : 'text-red-600'}`}>
                        {metric.change} vs last month
                      </p>
                    </div>
                    <Icon className="h-6 w-6 text-muted-foreground/70" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Pareto Chart */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-green-600" />
                Product Performance (Pareto)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <ParetoChartLive />
            </CardContent>
          </Card>

          {/* Substitution Flow Chart */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-green-600" />
                Brand Substitution Flow
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <SubstitutionFlowChart />
            </CardContent>
          </Card>
        </div>
        
        {/* Product Insights */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium">Product Performance Insights</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="p-1.5 bg-green-100 rounded-full">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-xs">Top Performing Category: Beverages</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Beverages account for 28.5% of total revenue with 15% growth month-over-month.
                    Coca-Cola products lead with 42% of category sales.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="p-1.5 bg-blue-100 rounded-full">
                  <Package className="h-3 w-3 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-xs">Product Bundling Opportunity</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Customers who purchase snacks are 67% more likely to also buy beverages.
                    Consider creating bundle promotions to increase average order value.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="p-1.5 bg-orange-100 rounded-full">
                  <DollarSign className="h-3 w-3 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-medium text-xs">Price Elasticity Analysis</h3>
                  <p className="text-xs text-muted-foreground mt-1">
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