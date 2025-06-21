import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Clock, BarChart3, MapPin } from "lucide-react";
import { GlobalFilterBar } from "@/components/GlobalFilterBar";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import TimeIntelligenceBar from "@/components/time/TimeIntelligenceBar";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import AIAgent from "@/components/ai/AIAgent";

const Index = () => {
  // Hourly transaction volume data
  const hourlyData = [
    { hour: '6:00', transactions: 245, amount: 38420 },
    { hour: '7:00', transactions: 312, amount: 48672 },
    { hour: '8:00', transactions: 428, amount: 66768 },
    { hour: '9:00', transactions: 567, amount: 88452 },
    { hour: '10:00', transactions: 634, amount: 98904 },
    { hour: '11:00', transactions: 789, amount: 123084 },
    { hour: '12:00', transactions: 892, amount: 139152 },
    { hour: '13:00', transactions: 945, amount: 147420 },
    { hour: '14:00', transactions: 823, amount: 128388 },
    { hour: '15:00', transactions: 756, amount: 117936 },
    { hour: '16:00', transactions: 689, amount: 107484 },
    { hour: '17:00', transactions: 612, amount: 95472 },
    { hour: '18:00', transactions: 834, amount: 130104 },
    { hour: '19:00', transactions: 923, amount: 143988 },
    { hour: '20:00', transactions: 756, amount: 117936 },
    { hour: '21:00', transactions: 567, amount: 88452 },
    { hour: '22:00', transactions: 345, amount: 53820 },
  ];

  // Regional data
  const regionalData = [
    { region: 'Metro Manila', transactions: 8456, percentage: '46.3' },
    { region: 'Cebu', transactions: 3234, percentage: '17.7' },
    { region: 'Davao', transactions: 2891, percentage: '15.8' },
    { region: 'Iloilo', transactions: 1876, percentage: '10.3' },
    { region: 'Others', transactions: 1790, percentage: '9.9' }
  ];

  // Peak hours analysis
  const peakHoursData = [
    { period: 'Morning Peak (8-10 AM)', transactions: 2847 },
    { period: 'Lunch Peak (12-2 PM)', transactions: 3456 },
    { period: 'Evening Peak (6-8 PM)', transactions: 4123 }
  ];

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center gap-4 border-b px-6 py-4 bg-background">
        <SidebarTrigger />
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-white">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Transaction Trends
            </h1>
            <p className="text-gray-600 mt-1">Temporal and regional transaction dynamics</p>
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
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">18,247</p>
                  <p className="text-sm text-green-600">+8.2% vs last month</p>
                </div>
                <BarChart3 className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Transaction Value</p>
                  <p className="text-2xl font-bold text-gray-900">₱156.03</p>
                  <p className="text-sm text-green-600">+3.1% vs last month</p>
                </div>
                <TrendingUp className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Peak Hours</p>
                  <p className="text-2xl font-bold text-gray-900">6-8 PM</p>
                  <p className="text-sm text-green-600">23% of daily volume</p>
                </div>
                <Clock className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Top Location</p>
                  <p className="text-2xl font-bold text-gray-900">Metro Manila</p>
                  <p className="text-sm text-green-600">46.3% of transactions</p>
                </div>
                <MapPin className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and AI Assistant */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Hourly Transaction Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={hourlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip formatter={(value) => [value, 'Transactions']} />
                        <Area 
                          type="monotone" 
                          dataKey="transactions" 
                          stroke="#8884d8" 
                          fill="#8884d8"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Regional Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={regionalData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="region" />
                        <YAxis />
                        <Tooltip formatter={(value) => [value, 'Transactions']} />
                        <Bar 
                          dataKey="transactions" 
                          fill="#82ca9d"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Peak Hours Analysis */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Peak Hours Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {peakHoursData.map((peak) => (
                    <div key={peak.period} className="bg-muted/20 p-4 rounded-lg">
                      <h3 className="font-medium text-lg mb-2">{peak.period}</h3>
                      <p className="text-2xl font-bold">{peak.transactions.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">transactions</p>
                      <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(peak.transactions / 5000) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* AI Trends Analyst */}
          <div className="lg:col-span-1">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg h-full">
              <CardContent className="p-0 h-full">
                <AIAgent 
                  initialPrompt="I'm your Transaction Trends Analyst. I can help you understand patterns in your transaction data, identify peak hours, and analyze regional performance. What would you like to know about your transaction trends?"
                  title="Trends Analyst AI"
                  description="Specialized in transaction pattern analysis"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;