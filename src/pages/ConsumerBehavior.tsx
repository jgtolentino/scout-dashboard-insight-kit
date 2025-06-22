import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Users, ShoppingCart, Clock, Repeat } from "lucide-react";
import { GlobalFilterBar } from "@/components/GlobalFilterBar";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import TimeIntelligenceBar from "@/components/time/TimeIntelligenceBar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ConsumerBehavior = () => {
  const metrics = [
    { title: "Avg Session Duration", value: "12m 34s", change: "+5.2%", icon: Clock, positive: true },
    { title: "Purchase Frequency", value: "2.3x/month", change: "+8.7%", icon: Repeat, positive: true },
    { title: "Cart Abandonment", value: "23.5%", change: "-3.1%", icon: ShoppingCart, positive: true },
    { title: "Return Customers", value: "68.2%", change: "+12.4%", icon: Users, positive: true },
  ];

  const shoppingPatternData = [
    { hour: '8-9 AM', percentage: 12 },
    { hour: '10-11 AM', percentage: 32 },
    { hour: '12-1 PM', percentage: 28 },
    { hour: '2-3 PM', percentage: 18 },
    { hour: '4-5 PM', percentage: 22 },
    { hour: '6-7 PM', percentage: 25 },
  ];

  const basketData = [
    { type: 'Single Item', percentage: 45 },
    { type: '2-3 Items', percentage: 32 },
    { type: '4+ Items', percentage: 23 },
  ];

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between border-b px-6 py-4 bg-background">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <div className="p-2.5 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg text-white">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Consumer Behavior
            </h1>
            <p className="text-xs text-muted-foreground">Understanding customer shopping patterns</p>
          </div>
        </div>
        <div>
          <BreadcrumbNav />
        </div>
      </header>

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

        {/* Behavior Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium">Shopping Patterns</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={shoppingPatternData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                    <Bar dataKey="percentage" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium">Basket Analysis</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={basketData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="type" type="category" />
                    <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                    <Bar dataKey="percentage" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Journey */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-purple-600" />
              Customer Journey Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <h3 className="text-sm font-medium mb-3">Conversion Funnel</h3>
                <div className="space-y-2">
                  <div className="relative pt-1">
                    <div className="flex mb-1 items-center justify-between">
                      <div>
                        <span className="text-xs font-medium inline-block py-1 px-2 uppercase rounded-full bg-blue-200 text-blue-800">
                          Awareness
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-medium inline-block text-blue-800">
                          100%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-1.5 mb-3 text-xs flex rounded bg-blue-200">
                      <div style={{ width: "100%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
                    </div>
                  </div>
                  <div className="relative pt-1">
                    <div className="flex mb-1 items-center justify-between">
                      <div>
                        <span className="text-xs font-medium inline-block py-1 px-2 uppercase rounded-full bg-green-200 text-green-800">
                          Interest
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-medium inline-block text-green-800">
                          78%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-1.5 mb-3 text-xs flex rounded bg-green-200">
                      <div style={{ width: "78%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"></div>
                    </div>
                  </div>
                  <div className="relative pt-1">
                    <div className="flex mb-1 items-center justify-between">
                      <div>
                        <span className="text-xs font-medium inline-block py-1 px-2 uppercase rounded-full bg-yellow-200 text-yellow-800">
                          Consideration
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-medium inline-block text-yellow-800">
                          45%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-1.5 mb-3 text-xs flex rounded bg-yellow-200">
                      <div style={{ width: "45%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-yellow-500"></div>
                    </div>
                  </div>
                  <div className="relative pt-1">
                    <div className="flex mb-1 items-center justify-between">
                      <div>
                        <span className="text-xs font-medium inline-block py-1 px-2 uppercase rounded-full bg-orange-200 text-orange-800">
                          Purchase
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-medium inline-block text-orange-800">
                          23%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-1.5 mb-3 text-xs flex rounded bg-orange-200">
                      <div style={{ width: "23%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-orange-500"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="text-sm font-medium mb-3">Key Insights</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-blue-100 p-1 mt-0.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
                    </div>
                    <span className="text-xs">67% of customers browse multiple categories before purchase</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-green-100 p-1 mt-0.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-600"></div>
                    </div>
                    <span className="text-xs">Customers who use search functionality have 34% higher conversion</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-purple-100 p-1 mt-0.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-purple-600"></div>
                    </div>
                    <span className="text-xs">Mobile users spend 2.3x more time browsing than desktop users</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-orange-100 p-1 mt-0.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-orange-600"></div>
                    </div>
                    <span className="text-xs">Repeat customers have 45% larger average basket size</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConsumerBehavior;