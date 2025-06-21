
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, TrendingUp, Clock, Heart } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

const ConsumerBehavior = () => {
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

      {/* Behavior Analysis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Browsing Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Peak Hours</span>
                <span className="font-medium">2-4 PM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Most Active Day</span>
                <span className="font-medium">Saturday</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Mobile vs Desktop</span>
                <span className="font-medium">68% / 32%</span>
              </div>
              <div className="pt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '68%'}}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Mobile traffic dominance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-600" />
              Preference Signals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Favorite Categories</span>
                <span className="font-medium">Electronics</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Price Sensitivity</span>
                <span className="font-medium">Medium</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Brand Loyalty</span>
                <span className="font-medium">High (73%)</span>
              </div>
              <div className="pt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-600 h-2 rounded-full" style={{width: '73%'}}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Strong brand preference</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Behavioral Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Cart Abandonment</span>
                <span className="font-medium text-red-600">28%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Cross-sell Success</span>
                <span className="font-medium text-green-600">18%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Repeat Purchase Rate</span>
                <span className="font-medium">45%</span>
              </div>
              <div className="pt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{width: '45%'}}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Customer retention strength</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConsumerBehavior;
