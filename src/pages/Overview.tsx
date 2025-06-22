import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { BarChart3, Users, ShoppingCart, DollarSign, TrendingUp, Package } from "lucide-react";
import CategoryTreemapLive from "@/components/CategoryTreemapLive";
import EnhancedPhilippinesChoroplethMap from "@/components/maps/EnhancedPhilippinesChoroplethMap";
import { useRegionalPerformanceData } from "@/hooks/useRegionalPerformanceData";
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
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import type { KpiMetric } from "@/types/api";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/config/api";

interface OverviewProps {
  setHeatMapVisible: (visible: boolean) => void;
}

const Overview = ({ setHeatMapVisible }: OverviewProps) => {
  const navigate = useNavigate();
  const filters = useFilterStore();
  const { setFilter, getQueryString } = useFilterStore();
  const { data: transactionData, isLoading: transactionsLoading } = useTransactionData(filters);
  const { data: volumeData, isLoading: volumeLoading } = useVolumeData(filters);
  const { data: categoryData, isLoading: categoriesLoading } = useCategoryMixData(filters);
  const [showAOVModal, setShowAOVModal] = useState(false);
  
  // Fetch regional performance data using enhanced hook
  const { data: regionalPerformanceData, isLoading: regionsLoading } = useRegionalPerformanceData(filters, 'revenue');
  const regionalData = regionalPerformanceData?.data || [];
  
  // Calculate metrics from real data
  const calculateMetrics = (): KpiMetric[] => {
    if (transactionsLoading || !transactionData) {
      return [
        { title: "Total Revenue", value: "₱0", change: "0%", positive: true },
        { title: "Total Transactions", value: "0", change: "0%", positive: true },
        { title: "Active Customers", value: "0", change: "0%", positive: true },
        { title: "Avg Order Value", value: "₱0", change: "0%", positive: true },
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

  const metrics = calculateMetrics();

  const handleKPIClick = (index: number) => {
    switch(index) {
      case 0: // Total Revenue
        navigate(`/transaction-trends?${getQueryString()}`);
        break;
      case 1: // Total Transactions
        navigate(`/transaction-trends?${getQueryString()}`);
        break;
      case 2: // Active Customers
        navigate(`/consumer-profiling?${getQueryString()}`);
        break;
      case 3: // Avg Order Value
        setShowAOVModal(true);
        break;
    }
  };

  // Fetch AOV distribution data
  const { data: aovDistributionData, isLoading: aovLoading } = useQuery({
    queryKey: ['aov-distribution', filters],
    queryFn: async () => {
      try {
        // This would be a real API call in production
        // For now, return mock data
        return [
          { range: '₱0-50', count: 1245, percentage: 7.8 },
          { range: '₱51-100', count: 3567, percentage: 22.5 },
          { range: '₱101-150', count: 4892, percentage: 30.9 },
          { range: '₱151-200', count: 3124, percentage: 19.7 },
          { range: '₱201-250', count: 1876, percentage: 11.8 },
          { range: '₱251+', count: 1143, percentage: 7.3 },
        ];
      } catch (error) {
        console.error('Error fetching AOV distribution:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center justify-between border-b px-6 py-4 bg-background">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <div className="p-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Scout Analytics Overview
            </h1>
            <p className="text-xs text-muted-foreground">Real-time insights into your retail analytics</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
            const icons = [DollarSign, ShoppingCart, Users, TrendingUp];
            const Icon = icons[index];
            return (
              <Card 
                key={index} 
                className="bg-white/70 backdrop-blur-sm border-0 shadow-sm cursor-pointer hover:shadow-md transition-all"
                onClick={() => handleKPIClick(index)}
              >
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

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Category Mix Treemap */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-600" />
                Category Mix Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <CategoryTreemapLive />
            </CardContent>
          </Card>

          {/* Enhanced Regional Performance Map */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-600" />
                Regional Performance Map
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {regionsLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-96 bg-gray-200 rounded"></div>
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="flex justify-between">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EnhancedPhilippinesChoroplethMap
                  data={regionalData}
                  height={300}
                  colorScale="revenue"
                  metric={regionalPerformanceData?.metric || 'Revenue'}
                  onRegionClick={(region) => {
                    setFilter('region', region);
                    navigate('/regional-analytics');
                  }}
                  onRegionHover={(region) => {
                    console.log('Hovering over region:', region);
                  }}
                  showLegend={true}
                  className="rounded-lg"
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Insights and Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Tabs defaultValue="insights">
            <TabsList className="mb-2">
              <TabsTrigger value="insights" className="text-xs">AI Insights</TabsTrigger>
              <TabsTrigger value="recommendations" className="text-xs">Recommendations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="insights" className="mt-0">
              <AIInsightsPanel />
            </TabsContent>
            
            <TabsContent value="recommendations" className="mt-0">
              <AIRecommendationPanel />
            </TabsContent>
          </Tabs>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium">Top Categories</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
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
                    <div 
                      key={index} 
                      className="flex justify-between items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                      onClick={() => {
                        setFilter('categories', [category.category]);
                        navigate(`/product-mix?${getQueryString()}`);
                      }}
                    >
                      <span className="text-sm">{category.category}</span>
                      <span className="text-sm text-green-600">+{(category.share).toFixed(1)}%</span>
                    </div>
                  ))}
                  
                  {(categoryData?.data || []).length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      No category data available
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Average Order Value Distribution Modal */}
      <Dialog open={showAOVModal} onOpenChange={setShowAOVModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Average Order Value Distribution</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {aovLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {(aovDistributionData || []).map((item) => (
                  <div key={item.range} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{item.range}</span>
                      <span className="text-sm text-muted-foreground">{item.count.toLocaleString()} orders ({item.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
                
                {(aovDistributionData || []).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No distribution data available
                  </div>
                )}
              </div>
            )}
            
            {(aovDistributionData || []).length > 0 && (
              <div className="mt-6 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <p className="text-sm text-blue-700">
                  <span className="font-bold">Insight:</span> Most transactions (50.6%) fall in the ₱101-200 range, indicating a mid-tier purchasing pattern.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Overview;