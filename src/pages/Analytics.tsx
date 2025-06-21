
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, PieChart, Activity, DollarSign, ShoppingCart } from "lucide-react";
import RevenueChart from "@/components/analytics/RevenueChart";
import CategoryBreakdown from "@/components/analytics/CategoryBreakdown";
import AnalyticsAIPanel from "@/components/analytics/AnalyticsAIPanel";

const Analytics = () => {
  const metrics = [
    { title: "Total Revenue", value: "$524,832", change: "+12.5%", icon: DollarSign, positive: true },
    { title: "Total Orders", value: "8,429", change: "+8.2%", icon: ShoppingCart, positive: true },
    { title: "Avg Order Value", value: "$156.20", change: "-2.1%", icon: TrendingUp, positive: false },
    { title: "Conversion Rate", value: "3.24%", change: "+0.8%", icon: Activity, positive: true },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl text-white">
          <TrendingUp className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Advanced Analytics
          </h1>
          <p className="text-gray-600 mt-1">Deep insights and trend analysis</p>
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

      {/* Main Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RevenueChart />
            <CategoryBreakdown />
          </div>

          {/* Detailed Analysis Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Transaction Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Peak Hours</span>
                    <span className="font-medium">2-4 PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Best Day</span>
                    <span className="font-medium">Saturday</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Top Location</span>
                    <span className="font-medium">Downtown</span>
                  </div>
                  <div className="pt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '75%'}}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">75% increase in weekend traffic</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-green-600" />
                  Product Mix Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Top Category</span>
                    <span className="font-medium">Electronics</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Growth Leader</span>
                    <span className="font-medium">Home & Garden</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Margin Leader</span>
                    <span className="font-medium">Books</span>
                  </div>
                  <div className="pt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '68%'}}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">68% of revenue from top 3 categories</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-600" />
                  Consumer Behavior
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Avg Session</span>
                    <span className="font-medium">8.5 min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Return Rate</span>
                    <span className="font-medium">34%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Cross-sell Rate</span>
                    <span className="font-medium">18%</span>
                  </div>
                  <div className="pt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{width: '82%'}}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">82% customer satisfaction score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="lg:col-span-1">
          <AnalyticsAIPanel />
        </div>
      </div>
    </div>
  );
};

export default Analytics;
