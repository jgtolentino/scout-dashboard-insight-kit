import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { BarChart3, Users, ShoppingCart, DollarSign, TrendingUp, Package, Eye } from "lucide-react";
import CategoryTreemapLive from "@/components/CategoryTreemapLive";
import RegionalPerformanceMap from "@/components/maps/RegionalPerformanceMap";
import { AIInsightsPanel } from "@/components/ai/AIInsightsPanel";
import AIRecommendationPanel from "@/components/ai/AIRecommendationPanel";
import { GlobalFilterBar } from "@/components/GlobalFilterBar";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import TimeIntelligenceBar from "@/components/time/TimeIntelligenceBar";
import { Button } from "@/components/ui/button";
import { useTransactionData } from "@/hooks/useTransactionData";
import { useVolumeData } from "@/hooks/useVolumeData";
import { useCategoryMixData } from "@/hooks/useCategoryMixData";
import { useFilterStore } from "@/stores/filterStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { KpiMetric, RegionalData } from "@/types/api";

interface OverviewProps {
  setHeatMapVisible: (visible: boolean) => void;
}

const Overview = ({ setHeatMapVisible }: OverviewProps) => {
  const filters = useFilterStore();
  const { data: transactionData, isLoading: transactionsLoading } = useTransactionData(filters);
  const { data: volumeData, isLoading: volumeLoading } = useVolumeData(filters);
  const { data: categoryData, isLoading: categoriesLoading } = useCategoryMixData(filters);
  
  // Calculate metrics from real data
  const calculateMetrics = (): KpiMetric[] => {
    if (transactionsLoading || !transactionData) {
      return [
        { title: "Total Revenue", value: "₱2.4M", change: "+12.3%", positive: true },
        { title: "Total Transactions", value: "15,847", change: "+8.2%", positive: true },
        { title: "Active Customers", value: "8,429", change: "+15.4%", positive: true },
        { title: "Avg Order Value", value: "₱186", change: "-2.1%", positive: false },
      ];
    }
    
    const transactions = transactionData.data || [];
    const totalRevenue = transactions.reduce((sum, t) => sum + (t.total_amount || 0), 0);
    const totalTransactions = transactions.length;
    const avgOrderValue = totalRevenue / totalTransactions || 0;
    const uniqueCustomers = new Set(transactions.map(t => t.customer_id)).size;
    
    return [
      { 
        title: "Total Revenue", 
        value: `₱${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 
        change: "+12.3%", 
        positive: true 
      },
      { 
        title: "Total Transactions", 
        value: totalTransactions.toLocaleString(), 
        change: "+8.2%", 
        positive: true 
      },
      { 
        title: "Active Customers", 
        value: uniqueCustomers.toLocaleString(), 
        change: "+15.4%", 
        positive: true 
      },
      { 
        title: "Avg Order Value", 
        value: `₱${avgOrderValue.toFixed(2)}`, 
        change: "-2.1%", 
        positive: false 
      },
    ];
  };

  const regionalData: RegionalData[] = [
    { name: 'NCR', value: 1200000, color: '#1e40af', percentage: '+12.3%' },
    { name: 'Cebu', value: 680000, color: '#3b82f6', percentage: '+8.7%' },
    { name: 'Davao', value: 520000, color: '#60a5fa', percentage: '+15.2%' },
    { name: 'Iloilo', value: 350000, color: '#93c5fd', percentage: '+5.4%' },
    { name: 'Baguio', value: 200000, color: '#dbeafe', percentage: '-2.1%' },
  ];

  const metrics = calculateMetrics();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center gap-4 border-b px-6 py-4 bg-background">
        <SidebarTrigger />
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Scout Analytics Overview
            </h1>
            <p className="text-gray-600 mt-1">Real-time insights into your retail analytics</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => setHeatMapVisible(prev => !prev)}
          >
            <Eye className="h-4 w-4" />
            <span>Heat Map</span>
          </Button>
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
            const icons = [DollarSign, ShoppingCart, Users, TrendingUp];
            const Icon = icons[index];
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

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Mix Treemap */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Category Mix Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryTreemapLive />
            </CardContent>
          </Card>

          {/* Regional Performance Map */}
          <RegionalPerformanceMap data={regionalData} />
        </div>

        {/* AI Insights and Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Tabs defaultValue="insights">
            <TabsList className="mb-4">
              <TabsTrigger value="insights">AI Insights</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="insights" className="mt-0">
              <AIInsightsPanel />
            </TabsContent>
            
            <TabsContent value="recommendations" className="mt-0">
              <AIRecommendationPanel />
            </TabsContent>
          </Tabs>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Top Categories</CardTitle>
            </CardHeader>
            <CardContent>
              {categoriesLoading ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                      <div className="h-4 w-16 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {(categoryData?.data || []).slice(0, 4).map((category, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{category.category}</span>
                      <span className="text-sm text-green-600">+{(category.share).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Overview;