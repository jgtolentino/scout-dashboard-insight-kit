import React, { useEffect, useState } from 'react';
import { useFilterStore } from '../store/useFilterStore';
import DrilldownBreadcrumb from './DrilldownBreadcrumb';
import CrossFilterVisualization from './CrossFilterVisualization';
import EnhancedPhilippineMap from './EnhancedPhilippineMap';
import { BarChart3, TrendingUp, Users, Package, MapPin, Filter, RefreshCw } from 'lucide-react';

// Mock data generator
const generateMockData = () => {
  const regions = ['Metro Manila', 'Central Luzon', 'Southern Luzon', 'Visayas', 'Mindanao'];
  const brands = ['Oishi', 'Del Monte', 'Champion', 'Coca-Cola', 'Nestle', 'Unilever'];
  const categories = ['Beverages', 'Snacks', 'Dairy', 'Personal Care', 'Household'];
  const stores = ['SM Supermarket', '7-Eleven', 'Puregold', 'Robinsons', 'Mercury Drug'];

  const data = [];
  for (let i = 0; i < 500; i++) {
    data.push({
      id: i,
      region: regions[Math.floor(Math.random() * regions.length)],
      brand: brands[Math.floor(Math.random() * brands.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      store: stores[Math.floor(Math.random() * stores.length)],
      revenue: Math.floor(Math.random() * 100000) + 10000,
      transactions: Math.floor(Math.random() * 500) + 50,
      customers: Math.floor(Math.random() * 200) + 20,
      date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
    });
  }
  return data;
};

const generateRegionalData = () => {
  return [
    {
      region: 'Metro Manila',
      code: 'NCR',
      revenue: 780000,
      transactions: 654,
      growth: 15.2,
      cities: ['Manila', 'Quezon City', 'Makati', 'Taguig'],
      stores: 85
    },
    {
      region: 'Central Luzon',
      code: 'III',
      revenue: 245000,
      transactions: 198,
      growth: 8.7,
      cities: ['San Fernando', 'Angeles', 'Olongapo'],
      stores: 45
    },
    {
      region: 'Southern Luzon',
      code: 'IV-A',
      revenue: 180000,
      transactions: 156,
      growth: -2.1,
      cities: ['Calamba', 'Antipolo', 'Bacoor'],
      stores: 32
    },
    {
      region: 'Visayas',
      code: 'VII',
      revenue: 80420,
      transactions: 89,
      growth: 22.4,
      cities: ['Cebu City', 'Mandaue', 'Lapu-Lapu'],
      stores: 28
    },
    {
      region: 'Mindanao',
      code: 'XI',
      revenue: 65320,
      transactions: 72,
      growth: 5.8,
      cities: ['Davao City', 'Cagayan de Oro'],
      stores: 18
    }
  ];
};

const PowerBIDashboard: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [regionalData, setRegionalData] = useState<any[]>([]);
  const [selectedMapView, setSelectedMapView] = useState<'regions' | 'heatmap' | 'clusters'>('regions');
  const [isLoading, setIsLoading] = useState(true);
  
  const filters = useFilterStore();

  useEffect(() => {
    // Initialize URL filters
    filters.initializeFromURL();
    
    // Load mock data
    setData(generateMockData());
    setRegionalData(generateRegionalData());
    setIsLoading(false);
  }, []);

  const handleDrilldown = (dimension: string, value: string) => {
    filters.addDrilldown(dimension, value);
    
    // Apply the filter based on dimension
    if (dimension === 'region') {
      filters.setBarangays([...filters.barangays, value]);
    } else if (dimension === 'brand') {
      filters.setBrands([...filters.brands, value]);
    } else if (dimension === 'category') {
      filters.setCategories([...filters.categories, value]);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading Scout Analytics Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Global Filter Bar */}
      <GlobalFilterBar />
      
      {/* Drilldown Breadcrumb */}
      <DrilldownBreadcrumb />
      
      {/* Main Dashboard Content */}
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <span>Scout Analytics</span>
            </h1>
            <p className="text-slate-600 mt-1">
              Power BI-style Interactive Dashboard for Philippine FMCG Market Intelligence
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-slate-500">
              {filters.getActiveFilterCount() > 0 && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                  {filters.getActiveFilterCount()} filters active
                </span>
              )}
            </div>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Revenue</p>
                <p className="text-3xl font-bold text-slate-900">
                  ₱{(data.reduce((sum, item) => sum + item.revenue, 0) / 1000000).toFixed(1)}M
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600">+12.5%</span>
                  <span className="text-sm text-slate-500">vs last period</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Transactions</p>
                <p className="text-3xl font-bold text-slate-900">
                  {data.reduce((sum, item) => sum + item.transactions, 0).toLocaleString()}
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600">+8.3%</span>
                  <span className="text-sm text-slate-500">vs last period</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Unique Customers</p>
                <p className="text-3xl font-bold text-slate-900">
                  {data.reduce((sum, item) => sum + item.customers, 0).toLocaleString()}
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-600">+5.2%</span>
                  <span className="text-sm text-slate-500">vs last period</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Avg Order Value</p>
                <p className="text-3xl font-bold text-slate-900">
                  ₱{(data.reduce((sum, item) => sum + item.revenue, 0) / 
                      data.reduce((sum, item) => sum + item.transactions, 0)).toFixed(0)}
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium text-amber-600">+3.8%</span>
                  <span className="text-sm text-slate-500">vs last period</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Revenue by Region */}
          <CrossFilterVisualization
            data={data}
            dimension="region"
            metric="revenue"
            chartType="bar"
            title="Revenue by Region"
            onDrilldown={handleDrilldown}
          />

          {/* Sales by Brand */}
          <CrossFilterVisualization
            data={data}
            dimension="brand"
            metric="revenue"
            chartType="doughnut"
            title="Revenue by Brand"
            onDrilldown={handleDrilldown}
          />

          {/* Transactions by Category */}
          <CrossFilterVisualization
            data={data}
            dimension="category"
            metric="transactions"
            chartType="bar"
            title="Transactions by Category"
            onDrilldown={handleDrilldown}
          />

          {/* Customer Distribution by Store */}
          <CrossFilterVisualization
            data={data}
            dimension="store"
            metric="customers"
            chartType="bar"
            title="Customers by Store"
            onDrilldown={handleDrilldown}
          />

          {/* Revenue Trend (Time Series) */}
          <div className="xl:col-span-2">
            <CrossFilterVisualization
              data={data}
              dimension="date"
              metric="revenue"
              chartType="line"
              title="Revenue Trend Over Time"
              onDrilldown={handleDrilldown}
            />
          </div>
        </div>

        {/* Philippine Regional Map */}
        <div className="grid grid-cols-1 gap-6">
          <EnhancedPhilippineMap
            data={regionalData}
            viewMode={selectedMapView}
            onRegionClick={(region) => handleDrilldown('region', region.region)}
            selectedRegion={filters.barangays[0]}
          />
        </div>

        {/* Filter Summary & Actions */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Dashboard Interactions</h3>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-500">Power BI-style filtering active</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-slate-900">🎯 Click to Filter</h4>
              <p className="text-slate-600">
                Click on any chart element to cross-filter all other visualizations.
                Multiple selections are supported.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-slate-900">🔍 Double-click to Drill Down</h4>
              <p className="text-slate-600">
                Double-click on chart elements to drill down into detailed views.
                Breadcrumb navigation shows your path.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-slate-900">🗺️ Interactive Mapping</h4>
              <p className="text-slate-600">
                Regional map supports multiple view modes: regions, heatmap, and cluster analysis.
                Click regions to add geographic filters.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PowerBIDashboard;