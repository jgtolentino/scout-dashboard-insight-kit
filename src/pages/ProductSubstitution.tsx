import React, { useState, useMemo } from 'react';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, TrendingUp, Package, BarChart3, Users, DollarSign } from "lucide-react";
import { GlobalFilterBar } from "@/components/GlobalFilterBar";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import TimeIntelligenceBar from "@/components/time/TimeIntelligenceBar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFilterStore } from "@/stores/filterStore";
import { useSubstitutionData } from "@/hooks/useSubstitutionData";
import ProductSubstitutionSankey from "@/components/charts/ProductSubstitutionSankey";

const ProductSubstitution = () => {
  const filters = useFilterStore();
  const { data: substitutionData, isLoading } = useSubstitutionData(filters);
  const [selectedView, setSelectedView] = useState<'overview' | 'flows' | 'analysis'>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Transform data for different views
  const sankeyData = substitutionData?.data || [];
  const summaryStats = substitutionData?.summary || {};

  // Filter data by category if selected
  const filteredSankeyData = useMemo(() => {
    if (!selectedCategory) return sankeyData;
    
    return sankeyData.filter(item => {
      const sourceCategory = getCategoryFromProduct(item.source);
      const targetCategory = getCategoryFromProduct(item.target);
      return sourceCategory === selectedCategory || targetCategory === selectedCategory;
    });
  }, [sankeyData, selectedCategory]);

  // Category breakdown for analysis
  const categoryBreakdown = useMemo(() => {
    const breakdown: { [key: string]: { 
      substitutions: number, 
      revenue: number, 
      avgRate: number,
      topFlow: string 
    } } = {};
    
    sankeyData.forEach(item => {
      const category = getCategoryFromProduct(item.source);
      if (!breakdown[category]) {
        breakdown[category] = {
          substitutions: 0,
          revenue: 0,
          avgRate: 0,
          topFlow: ''
        };
      }
      
      breakdown[category].substitutions += item.frequency;
      breakdown[category].revenue += item.revenue;
      breakdown[category].avgRate += item.substitutionRate;
    });

    // Calculate averages and find top flows
    Object.keys(breakdown).forEach(category => {
      const categoryItems = sankeyData.filter(item => getCategoryFromProduct(item.source) === category);
      breakdown[category].avgRate = breakdown[category].avgRate / categoryItems.length;
      
      const topFlow = categoryItems.reduce((max, item) => 
        item.frequency > max.frequency ? item : max,
        categoryItems[0]
      );
      breakdown[category].topFlow = `${topFlow?.source} → ${topFlow?.target}`;
    });

    return Object.entries(breakdown).map(([category, stats]) => ({
      category,
      ...stats
    }));
  }, [sankeyData]);

  // Top substitution flows
  const topFlows = useMemo(() => {
    return sankeyData
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);
  }, [sankeyData]);

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category === selectedCategory ? null : category);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="lg:hidden" />
          <div className="flex items-center gap-2">
            <ArrowRight className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Product Substitution Analysis</h1>
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
          variant={selectedView === 'flows' ? 'default' : 'outline'}
          onClick={() => setSelectedView('flows')}
          className="flex items-center gap-2"
        >
          <ArrowRight className="h-4 w-4" />
          Substitution Flows
        </Button>
        <Button
          variant={selectedView === 'analysis' ? 'default' : 'outline'}
          onClick={() => setSelectedView('analysis')}
          className="flex items-center gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          Category Analysis
        </Button>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Substitutions</p>
                <p className="text-lg font-semibold">{summaryStats.totalSubstitutions?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Revenue Impact</p>
                <p className="text-lg font-semibold">₱{summaryStats.totalRevenue?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Avg Substitution Rate</p>
                <p className="text-lg font-semibold">{summaryStats.avgSubstitutionRate?.toFixed(1) || '0'}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Unique Products</p>
                <p className="text-lg font-semibold">{summaryStats.uniqueProducts || '0'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Top Flow</p>
                <p className="text-sm font-semibold">
                  {summaryStats.topSubstitution ? 
                    `${summaryStats.topSubstitution.source} → ${summaryStats.topSubstitution.target}` : 
                    'N/A'
                  }
                </p>
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
                <div className="h-96 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Tabs value={selectedView} className="space-y-6">
          <TabsContent value="overview" className="space-y-6">
            {/* Main Sankey Diagram */}
            <ProductSubstitutionSankey
              data={filteredSankeyData}
              height={700}
            />

            {/* Category Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filter by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {['beverages', 'snacks', 'personal_care', 'household', 'food_staples'].map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleCategoryFilter(category)}
                      className="capitalize"
                    >
                      {category.replace('_', ' ')}
                    </Button>
                  ))}
                  {selectedCategory && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCategory(null)}
                    >
                      Clear Filter
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="flows" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Substitution Flows */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Top Substitution Flows
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topFlows.map((flow, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">#{index + 1}</span>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{flow.source}</span>
                          <ArrowRight className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">{flow.target}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">{flow.frequency.toLocaleString()}</div>
                          <div className="text-xs text-gray-600">{flow.substitutionRate.toFixed(1)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Sankey Diagram */}
              <ProductSubstitutionSankey
                data={filteredSankeyData}
                height={500}
              />
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Category Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Category</th>
                        <th className="text-right p-3">Substitutions</th>
                        <th className="text-right p-3">Revenue Impact</th>
                        <th className="text-right p-3">Avg Rate</th>
                        <th className="text-left p-3">Top Flow</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryBreakdown
                        .sort((a, b) => b.substitutions - a.substitutions)
                        .map((category) => (
                          <tr 
                            key={category.category} 
                            className="border-b hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleCategoryFilter(category.category)}
                          >
                            <td className="p-3 font-medium capitalize">
                              {category.category.replace('_', ' ')}
                            </td>
                            <td className="p-3 text-right">{category.substitutions.toLocaleString()}</td>
                            <td className="p-3 text-right">₱{category.revenue.toLocaleString()}</td>
                            <td className="p-3 text-right">{category.avgRate.toFixed(1)}%</td>
                            <td className="p-3 text-sm text-gray-600">{category.topFlow}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Insights Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Key Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">High Substitution Categories</h4>
                      <p className="text-sm text-green-800">
                        Food staples show the highest substitution rates, indicating strong brand competition.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Revenue Opportunities</h4>
                      <p className="text-sm text-blue-800">
                        Personal care products have high revenue impact per substitution.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <h4 className="font-semibold text-orange-900 mb-2">Brand Loyalty</h4>
                      <p className="text-sm text-orange-800">
                        Beverages show bidirectional substitution patterns indicating low brand loyalty.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-purple-600" />
                    Strategic Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-2">Inventory Optimization</h4>
                      <p className="text-sm text-purple-800">
                        Stock substitute products based on observed substitution patterns.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-red-50 rounded-lg">
                      <h4 className="font-semibold text-red-900 mb-2">Promotional Strategy</h4>
                      <p className="text-sm text-red-800">
                        Target promotions for products with high outgoing substitution rates.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <h4 className="font-semibold text-yellow-900 mb-2">Category Management</h4>
                      <p className="text-sm text-yellow-800">
                        Focus on categories with high substitution frequency for better margins.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

// Helper function to categorize products (same as in hook)
const getCategoryFromProduct = (productName: string): string => {
  const name = productName.toLowerCase();
  
  if (name.includes('cola') || name.includes('sprite') || name.includes('7-up') || 
      name.includes('red bull') || name.includes('monster')) {
    return 'beverages';
  }
  if (name.includes('chips') || name.includes('pringles') || name.includes('oreo') || 
      name.includes('kit kat') || name.includes('snickers')) {
    return 'snacks';
  }
  if (name.includes('shampoo') || name.includes('head') || name.includes('pantene') || 
      name.includes('colgate') || name.includes('oral-b') || name.includes('dove') || 
      name.includes('palmolive')) {
    return 'personal_care';
  }
  if (name.includes('tide') || name.includes('ariel') || name.includes('downy') || 
      name.includes('surf')) {
    return 'household';
  }
  if (name.includes('maggi') || name.includes('lucky') || name.includes('del monte') || 
      name.includes('argentina') || name.includes('nestle') || name.includes('nescafe')) {
    return 'food_staples';
  }
  
  return 'other';
};

export default ProductSubstitution;