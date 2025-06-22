import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Users, UserCheck, TrendingUp, MapPin } from "lucide-react";
import GeoHeatmap from "@/components/GeoHeatmap";
import { GlobalFilterBar } from "@/components/GlobalFilterBar";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import TimeIntelligenceBar from "@/components/time/TimeIntelligenceBar";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const ConsumerProfiling = () => {
  const metrics = [
    { title: "Total Profiles", value: "15,847", change: "+12.3%", icon: Users, positive: true },
    { title: "Active Profiles", value: "8,429", change: "+8.2%", icon: UserCheck, positive: true },
    { title: "Profile Completeness", value: "87.5%", change: "+15.4%", icon: TrendingUp, positive: true },
    { title: "Geographic Reach", value: "47 Barangays", change: "+2.1%", icon: MapPin, positive: true },
  ];

  const genderData = [
    { name: 'Male', value: 48 },
    { name: 'Female', value: 52 }
  ];

  const ageData = [
    { name: '18-24', value: 22 },
    { name: '25-34', value: 38 },
    { name: '35-44', value: 25 },
    { name: '45-54', value: 10 },
    { name: '55+', value: 5 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between border-b px-6 py-4 bg-background">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <div className="p-2.5 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg text-white">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Consumer Profiling
            </h1>
            <p className="text-xs text-muted-foreground">Customer demographics and profiling</p>
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

        {/* Demographics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium">Gender Distribution</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium">Age Distribution</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ageData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {ageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Geographic Heatmap */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-orange-600" />
              Geographic Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="h-80">
              <GeoHeatmap dataUrl="/api/demographics?agg=barangay" className="w-full h-full rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConsumerProfiling;