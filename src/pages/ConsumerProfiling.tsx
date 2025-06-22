import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Users, UserCheck, TrendingUp, MapPin, TreePine } from "lucide-react";
import GeoHeatmap from "@/components/GeoHeatmap";
import { GlobalFilterBar } from "@/components/GlobalFilterBar";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import TimeIntelligenceBar from "@/components/time/TimeIntelligenceBar";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import DemographicTreeMap from "@/components/charts/DemographicTreeMap";
import { useDemographicTreeMapData } from "@/hooks/useDemographicTreeMapData";
import { useFilterStore } from "@/stores/filterStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ConsumerProfiling = () => {
  const filters = useFilterStore();
  
  // Fetch demographic tree map data using real Scout Analytics API
  const { data: demographicData, isLoading: demographicLoading } = useDemographicTreeMapData(filters);

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
      <header className="flex items-center gap-4 border-b px-6 py-4 bg-background">
        <SidebarTrigger />
        <div className="flex items-center gap-3">
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
        <div className="ml-auto">
          <BreadcrumbNav />
        </div>
      </header>

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

        {/* Advanced Demographics TreeMap - Fourth Priority Implementation */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TreePine className="h-5 w-5 text-blue-600" />
              Advanced Demographic Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {demographicLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-96 bg-gray-200 rounded"></div>
                <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <DemographicTreeMap
                data={demographicData?.data || []}
                height={600}
                metric="value"
                className="w-full"
              />
            )}
          </CardContent>
        </Card>

        {/* Traditional Demographics Charts */}
        <Tabs defaultValue="gender" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="gender">Gender Distribution</TabsTrigger>
            <TabsTrigger value="age">Age Distribution</TabsTrigger>
          </TabsList>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TabsContent value="gender" className="mt-0 col-span-full">
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Gender Distribution</CardTitle>
                </CardHeader>
                <CardContent>
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
            </TabsContent>

            <TabsContent value="age" className="mt-0 col-span-full">
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Age Distribution</CardTitle>
                </CardHeader>
                <CardContent>
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
            </TabsContent>
          </div>
        </Tabs>

        {/* Geographic Heatmap */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-orange-600" />
              Geographic Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <GeoHeatmap dataUrl="/api/demographics?agg=barangay" className="w-full h-full rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConsumerProfiling;