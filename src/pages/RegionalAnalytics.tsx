import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { MapPin, TrendingUp, Users, DollarSign } from "lucide-react";
import EnhancedPhilippinesChoroplethMap from "@/components/maps/EnhancedPhilippinesChoroplethMap";
import { useRegionalPerformanceData } from "@/hooks/useRegionalPerformanceData";
import { GlobalFilterBar } from "@/components/GlobalFilterBar";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { useFilterStore } from "@/stores/filterStore";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const RegionalAnalytics = () => {
  const filters = useFilterStore();
  const { setFilter } = useFilterStore();
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'transactions' | 'growth'>('revenue');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  // Fetch regional performance data
  const { data: regionalPerformanceData, isLoading } = useRegionalPerformanceData(filters, selectedMetric);
  const regionalData = regionalPerformanceData?.data || [];

  // Get selected region details
  const selectedRegionData = selectedRegion 
    ? regionalData.find(r => r.name === selectedRegion)
    : null;

  // Calculate summary statistics
  const totalValue = regionalData.reduce((sum, region) => sum + region.value, 0);
  const avgValue = regionalData.length > 0 ? totalValue / regionalData.length : 0;
  const topRegion = regionalData.reduce((max, region) => 
    region.value > max.value ? region : max, 
    { value: 0, name: '', fullName: '', percentage: '', transactions: 0, avgOrderValue: 0 }
  );

  const handleRegionClick = (regionName: string) => {
    setSelectedRegion(regionName);
    setFilter('region', regionName);
  };

  const handleRegionHover = (regionName: string | null) => {
    // Optional: Show hover effects or update sidebar
  };

  const getMetricTitle = () => {
    switch (selectedMetric) {
      case 'revenue': return 'Revenue';
      case 'transactions': return 'Transactions';
      case 'growth': return 'Growth Rate';
      default: return 'Revenue';
    }
  };

  const getMetricIcon = () => {
    switch (selectedMetric) {
      case 'revenue': return <DollarSign className="h-5 w-5" />;
      case 'transactions': return <Users className="h-5 w-5" />;
      case 'growth': return <TrendingUp className="h-5 w-5" />;
      default: return <DollarSign className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="lg:hidden" />
          <div className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Regional Analytics</h1>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <BreadcrumbNav />

      {/* Filters */}
      <GlobalFilterBar />

      {/* Metric Selection */}
      <div className="flex gap-2">
        <Button
          variant={selectedMetric === 'revenue' ? 'default' : 'outline'}
          onClick={() => setSelectedMetric('revenue')}
          className="flex items-center gap-2"
        >
          <DollarSign className="h-4 w-4" />
          Revenue
        </Button>
        <Button
          variant={selectedMetric === 'transactions' ? 'default' : 'outline'}
          onClick={() => setSelectedMetric('transactions')}
          className="flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          Transactions
        </Button>
        <Button
          variant={selectedMetric === 'growth' ? 'default' : 'outline'}
          onClick={() => setSelectedMetric('growth')}
          className="flex items-center gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          Growth Rate
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Summary Stats */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total {getMetricTitle()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {getMetricIcon()}
                <span className="text-2xl font-bold">
                  {selectedMetric === 'growth' 
                    ? `${totalValue.toFixed(1)}%` 
                    : `₱${totalValue.toLocaleString()}`
                  }
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Average {getMetricTitle()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {getMetricIcon()}
                <span className="text-2xl font-bold">
                  {selectedMetric === 'growth' 
                    ? `${avgValue.toFixed(1)}%` 
                    : `₱${avgValue.toLocaleString()}`
                  }
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Top Performing Region
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="font-semibold">{topRegion.fullName || topRegion.name}</div>
                <div className="text-sm text-gray-600">{topRegion.name}</div>
                <div className="flex items-center gap-2">
                  {getMetricIcon()}
                  <span className="font-bold">
                    {selectedMetric === 'growth' 
                      ? `${topRegion.value.toFixed(1)}%` 
                      : `₱${topRegion.value.toLocaleString()}`
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Region Details */}
          {selectedRegionData && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-blue-800">
                  Selected Region
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="font-semibold text-blue-900">{selectedRegionData.fullName}</div>
                    <div className="text-sm text-blue-700">{selectedRegionData.name}</div>
                  </div>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Revenue:</span>
                      <span className="font-medium">₱{selectedRegionData.value.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Transactions:</span>
                      <span className="font-medium">{selectedRegionData.transactions.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Avg Order:</span>
                      <span className="font-medium">₱{selectedRegionData.avgOrderValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Market Share:</span>
                      <span className="font-medium">{selectedRegionData.percentage}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Enhanced Choropleth Map */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Philippines Regional {getMetricTitle()} Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-96 bg-gray-200 rounded"></div>
                </div>
              ) : (
                <EnhancedPhilippinesChoroplethMap
                  data={regionalData}
                  height={600}
                  colorScale={selectedMetric}
                  metric={getMetricTitle()}
                  onRegionClick={handleRegionClick}
                  onRegionHover={handleRegionHover}
                  showLegend={true}
                  className="rounded-lg"
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Regional Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Regional Performance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Region</th>
                  <th className="text-left p-3">Full Name</th>
                  <th className="text-right p-3">{getMetricTitle()}</th>
                  <th className="text-right p-3">Transactions</th>
                  <th className="text-right p-3">Avg Order Value</th>
                  <th className="text-right p-3">Market Share</th>
                </tr>
              </thead>
              <tbody>
                {regionalData
                  .filter(region => region.value > 0)
                  .sort((a, b) => b.value - a.value)
                  .map((region) => (
                    <tr 
                      key={region.name} 
                      className={`border-b hover:bg-gray-50 cursor-pointer ${
                        selectedRegion === region.name ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleRegionClick(region.name)}
                    >
                      <td className="p-3 font-medium">{region.name}</td>
                      <td className="p-3">{region.fullName}</td>
                      <td className="p-3 text-right font-medium">
                        {selectedMetric === 'growth' 
                          ? `${region.value.toFixed(1)}%` 
                          : `₱${region.value.toLocaleString()}`
                        }
                      </td>
                      <td className="p-3 text-right">{region.transactions.toLocaleString()}</td>
                      <td className="p-3 text-right">₱{region.avgOrderValue.toLocaleString()}</td>
                      <td className="p-3 text-right">{region.percentage}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegionalAnalytics;