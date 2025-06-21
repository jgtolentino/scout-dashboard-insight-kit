
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, TrendingUp, MapPin, Heart, Star } from "lucide-react";
import CustomerSegments from "@/components/customers/CustomerSegments";
import CustomersAIPanel from "@/components/customers/CustomersAIPanel";

const Customers = () => {
  const metrics = [
    { title: "Total Customers", value: "15,847", change: "+12.3%", icon: Users, positive: true },
    { title: "Active This Month", value: "8,429", change: "+8.2%", icon: UserCheck, positive: true },
    { title: "Customer LTV", value: "$1,245", change: "+15.4%", icon: TrendingUp, positive: true },
    { title: "Retention Rate", value: "84.2%", change: "+2.1%", icon: Heart, positive: true },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl text-white">
          <Users className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Customer Insights
          </h1>
          <p className="text-gray-600 mt-1">Consumer profiling and demographics</p>
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

      {/* Main Customer Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <CustomerSegments />

          {/* Detailed Customer Analysis Cards */}
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
                    <span className="text-sm">Avg Age</span>
                    <span className="font-medium">34.2 years</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Gender Split</span>
                    <span className="font-medium">52% F / 48% M</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Top Location</span>
                    <span className="font-medium">California</span>
                  </div>
                  <div className="pt-2">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>25-34 years</span>
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
                  Behavior Patterns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Avg Orders/Month</span>
                    <span className="font-medium">2.8</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Brand Loyalty</span>
                    <span className="font-medium">High (73%)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Mobile Usage</span>
                    <span className="font-medium">68%</span>
                  </div>
                  <div className="pt-2">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Repeat Customers</span>
                        <span>73%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{width: '73%'}}></div>
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
                  Location Mapping
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Top State</span>
                    <span className="font-medium">California (22%)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Top City</span>
                    <span className="font-medium">Los Angeles</span>
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

          {/* Customer Satisfaction */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-600" />
                Customer Satisfaction & Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">4.8</div>
                  <div className="text-sm text-gray-600">Overall Rating</div>
                  <div className="flex justify-center mt-2">
                    {[1,2,3,4,5].map((star) => (
                      <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">94%</div>
                  <div className="text-sm text-gray-600">Satisfaction Rate</div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '94%'}}></div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">12,847</div>
                  <div className="text-sm text-gray-600">Total Reviews</div>
                  <div className="text-xs text-gray-500 mt-2">+28% this month</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <CustomersAIPanel />
        </div>
      </div>
    </div>
  );
};

export default Customers;
