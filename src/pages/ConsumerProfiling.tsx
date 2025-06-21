
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, TrendingUp, MapPin } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

const ConsumerProfiling = () => {
  const metrics = [
    { title: "Total Profiles", value: "15,847", change: "+12.3%", icon: Users, positive: true },
    { title: "Active Profiles", value: "8,429", change: "+8.2%", icon: UserCheck, positive: true },
    { title: "Profile Completeness", value: "87.5%", change: "+15.4%", icon: TrendingUp, positive: true },
    { title: "Geographic Reach", value: "47 States", change: "+2.1%", icon: MapPin, positive: true },
  ];

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="flex items-center gap-3 mb-6">
        <SidebarTrigger />
        <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl text-white">
          <Users className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Consumer Profiling
          </h1>
          <p className="text-gray-600 mt-1">Customer demographics and profiling</p>
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

      {/* Consumer Profiling Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-blue-600" />
              Demographics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Average Age</span>
                <span className="font-medium">34.2 years</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Gender Split</span>
                <span className="font-medium">52% F / 48% M</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Education Level</span>
                <span className="font-medium">College+ 68%</span>
              </div>
              <div className="pt-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>25-34 years (Primary)</span>
                    <span>42%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '42%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Income & Spending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Avg Household Income</span>
                <span className="font-medium">$75,500</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Spending Power</span>
                <span className="font-medium">High (73%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Purchase Frequency</span>
                <span className="font-medium">2.8/month</span>
              </div>
              <div className="pt-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>High Spenders ($1000+)</span>
                    <span>28%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '28%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-purple-600" />
              Geographic Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Top State</span>
                <span className="font-medium">California (22%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Urban vs Suburban</span>
                <span className="font-medium">65% / 35%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">International</span>
                <span className="font-medium">8.5%</span>
              </div>
              <div className="pt-2">
                <div className="space-y-1">
                  <div className="text-xs text-gray-500">Regional Distribution</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      <span className="text-xs">West Coast 45%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="text-xs">East Coast 32%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConsumerProfiling;
