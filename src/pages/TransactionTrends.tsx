import React, { useState, useMemo } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Clock, BarChart3, MapPin, Activity, Calendar } from "lucide-react";
import { GlobalFilterBar } from "@/components/GlobalFilterBar";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import TimeIntelligenceBar from "@/components/time/TimeIntelligenceBar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFilterStore } from "@/stores/filterStore";
import { useTransactionData } from "@/hooks/useTransactionData";
import EnhancedTimeSeriesChart from "@/components/charts/EnhancedTimeSeriesChart";
import TransactionHeatmap from "@/components/charts/TransactionHeatmap";

const TransactionTrends = () => {
  const filters = useFilterStore();
  const { data: transactionData, isLoading } = useTransactionData(filters);
  const [selectedView, setSelectedView] = useState<'overview' | 'hourly' | 'patterns'>('overview');

  // Transform transaction data for visualizations
  const chartData = useMemo(() => {
    if (!transactionData?.data) return [];

    // Group transactions by date and calculate metrics
    const groupedData: { [date: string]: any } = {};

    transactionData.data.forEach((transaction: any) => {
      const date = transaction.date || transaction.timestamp;
      const dateKey = new Date(date).toISOString().split('T')[0];
      
      if (!groupedData[dateKey]) {
        groupedData[dateKey] = {
          date: dateKey,
          timestamp: new Date(date).getTime(),
          revenue: 0,
          transactions: 0,
          hour: new Date(date).getHours(),
          dayOfWeek: new Date(date).getDay(),
          isWeekend: [0, 6].includes(new Date(date).getDay())
        };
      }

      groupedData[dateKey].revenue += transaction.amount || transaction.revenue || 0;
      groupedData[dateKey].transactions += 1;
    });

    // Calculate average order value and format for charts
    return Object.values(groupedData).map((day: any) => ({
      ...day,
      avgOrderValue: day.transactions > 0 ? day.revenue / day.transactions : 0,
      date: new Date(day.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    })).sort((a, b) => a.timestamp - b.timestamp);
  }, [transactionData]);

  // Transform data for heatmap
  const heatmapData = useMemo(() => {
    if (!transactionData?.data) return [];

    return transactionData.data.map((transaction: any) => {
      const date = new Date(transaction.date || transaction.timestamp);
      return {
        date: date.toISOString().split('T')[0],
        hour: date.getHours(),
        dayOfWeek: date.getDay(),
        value: transaction.amount || transaction.revenue || 0,
        transactions: 1,
        revenue: transaction.amount || transaction.revenue || 0,
        isWeekend: [0, 6].includes(date.getDay())
      };
    });
  }, [transactionData]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (chartData.length === 0) {
      return {
        totalRevenue: 0,
        totalTransactions: 0,
        avgOrderValue: 0,
        peakDay: 'N/A',
        peakHour: 'N/A',
        weekendRatio: 0
      };
    }

    const totalRevenue = chartData.reduce((sum, day) => sum + day.revenue, 0);
    const totalTransactions = chartData.reduce((sum, day) => sum + day.transactions, 0);
    const avgOrderValue = totalRevenue / totalTransactions || 0;

    // Find peak day
    const peakDay = chartData.reduce((max, day) => 
      day.revenue > max.revenue ? day : max
    );

    // Calculate weekend transaction ratio
    const weekendTransactions = chartData
      .filter(day => day.isWeekend)
      .reduce((sum, day) => sum + day.transactions, 0);
    const weekendRatio = totalTransactions > 0 ? (weekendTransactions / totalTransactions) * 100 : 0;

    // Find peak hour from heatmap data
    const hourlyTotals: { [hour: number]: number } = {};
    heatmapData.forEach(point => {
      hourlyTotals[point.hour] = (hourlyTotals[point.hour] || 0) + point.revenue;
    });
    const peakHour = Object.entries(hourlyTotals).reduce((max, [hour, revenue]) => 
      revenue > max.revenue ? { hour: parseInt(hour), revenue } : max,
      { hour: 0, revenue: 0 }
    );

    return {
      totalRevenue,
      totalTransactions,
      avgOrderValue,
      peakDay: peakDay.date,
      peakHour: `${peakHour.hour}:00`,
      weekendRatio
    };
  }, [chartData, heatmapData]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="lg:hidden" />
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Transaction Trends</h1>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <BreadcrumbNav />

      {/* Time Intelligence Bar */}
      <TimeIntelligenceBar />

      {/* Filters */}
      <GlobalFilterBar />

      {/* View Selection */}
      <div className="flex gap-2">
        <Button
          variant={selectedView === 'overview' ? 'default' : 'outline'}
          onClick={() => setSelectedView('overview')}
          className="flex items-center gap-2"
        >
          <BarChart3 className="h-4 w-4" />
          Overview
        </Button>
        <Button
          variant={selectedView === 'hourly' ? 'default' : 'outline'}
          onClick={() => setSelectedView('hourly')}
          className="flex items-center gap-2"
        >
          <Clock className="h-4 w-4" />
          Hourly Patterns
        </Button>
        <Button
          variant={selectedView === 'patterns' ? 'default' : 'outline'}
          onClick={() => setSelectedView('patterns')}
          className="flex items-center gap-2"
        >
          <Calendar className="h-4 w-4" />
          Trend Analysis
        </Button>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-lg font-semibold">₱{summaryStats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Transactions</p>
                <p className="text-lg font-semibold">{summaryStats.totalTransactions.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Avg Order Value</p>
                <p className="text-lg font-semibold">₱{summaryStats.avgOrderValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Peak Day</p>
                <p className="text-lg font-semibold">{summaryStats.peakDay}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Peak Hour</p>
                <p className="text-lg font-semibold">{summaryStats.peakHour}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-600" />
              <div>
                <p className="text-sm text-gray-600">Weekend %</p>
                <p className="text-lg font-semibold">{summaryStats.weekendRatio.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Tabs value={selectedView} className="space-y-6">
          <TabsContent value="overview" className="space-y-6">
            {/* Enhanced Time Series Chart */}
            <EnhancedTimeSeriesChart
              data={chartData}
              height={500}
              showBrush={true}
              showWeekendToggle={true}
            />
          </TabsContent>

          <TabsContent value="hourly" className="space-y-6">
            {/* Transaction Heatmap */}
            <TransactionHeatmap
              data={heatmapData}
              metric="transactions"
            />
          </TabsContent>

          <TabsContent value="patterns" className="space-y-6">
            {/* Combined View */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EnhancedTimeSeriesChart
                data={chartData}
                height={400}
                showBrush={false}
                showWeekendToggle={true}
              />
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    Pattern Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Peak Performance</h4>
                      <p className="text-sm text-blue-800">
                        Highest revenue on {summaryStats.peakDay} with peak hour at {summaryStats.peakHour}
                      </p>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">Weekend Activity</h4>
                      <p className="text-sm text-green-800">
                        {summaryStats.weekendRatio.toFixed(1)}% of transactions occur on weekends
                      </p>
                    </div>
                    
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <h4 className="font-semibold text-orange-900 mb-2">Order Value Trends</h4>
                      <p className="text-sm text-orange-800">
                        Average order value: ₱{summaryStats.avgOrderValue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Heatmap for Pattern Analysis */}
            <TransactionHeatmap
              data={heatmapData}
              metric="revenue"
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default TransactionTrends;