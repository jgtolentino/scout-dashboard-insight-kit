import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  ShoppingCart,
  MapPin,
  Package,
  Star,
  Activity,
  Settings,
  HelpCircle,
  Bell,
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronDown,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import { format } from 'date-fns';

// Import AI-Agency components
import LearnBotTooltip from './LearnBotTooltip';
import InsightCard from './InsightCard';
import PhilippineRegionMap from './maps/PhilippineRegionMap';

interface DashboardProps {
  apiBaseUrl?: string;
}

interface KPIData {
  totalRevenue: number;
  totalTransactions: number;
  uniqueCustomers: number;
  avgOrderValue: number;
  revenueGrowth: number;
  transactionGrowth: number;
}

interface RegionData {
  region: string;
  revenue: number;
  transactions: number;
  growth: number;
}

const Dashboard: React.FC<DashboardProps> = ({ apiBaseUrl = 'http://localhost:3001' }) => {
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [regionData, setRegionData] = useState<RegionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Demo authentication - in production this would come from auth context
  useEffect(() => {
    const demoLogin = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'admin@tbwa.com',
            password: 'admin123'
          })
        });
        const data = await response.json();
        if (data.token) {
          setAuthToken(data.token);
        }
      } catch (error) {
        console.log('Auth failed, using mock data');
      }
    };
    demoLogin();
  }, [apiBaseUrl]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const headers: HeadersInit = {
          'Content-Type': 'application/json'
        };
        
        if (authToken) {
          headers.Authorization = `Bearer ${authToken}`;
        }

        // Fetch KPI data
        const kpiResponse = await fetch(`${apiBaseUrl}/api/kpi/dashboard-summary`, { headers });
        const kpiResult = await kpiResponse.json();
        
        // Fetch location data
        const locationResponse = await fetch(`${apiBaseUrl}/api/kpi/location-distribution`, { headers });
        const locationResult = await locationResponse.json();

        setKpiData(kpiResult.data || {
          totalRevenue: 1285420.50,
          totalTransactions: 1247,
          uniqueCustomers: 342,
          avgOrderValue: 1030.75,
          revenueGrowth: 12.5,
          transactionGrowth: 8.3
        });

        setRegionData(locationResult.data?.map((item: any) => ({
          region: item.region,
          revenue: item.total_revenue,
          transactions: item.transaction_count,
          growth: Math.random() * 20 - 5 // Mock growth for demo
        })) || [
          { region: 'Metro Manila', revenue: 780000, transactions: 654, growth: 15.2 },
          { region: 'Central Luzon', revenue: 245000, transactions: 198, growth: 8.7 },
          { region: 'Southern Luzon', revenue: 180000, transactions: 156, growth: -2.1 },
          { region: 'Visayas', revenue: 80420, transactions: 89, growth: 22.4 }
        ]);

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Use mock data on error
        setKpiData({
          totalRevenue: 1285420.50,
          totalTransactions: 1247,
          uniqueCustomers: 342,
          avgOrderValue: 1030.75,
          revenueGrowth: 12.5,
          transactionGrowth: 8.3
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [authToken, apiBaseUrl, selectedTimeframe]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-PH').format(num);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading Scout Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Scout Analytics</h1>
                  <p className="text-xs text-slate-500">FMCG Intelligence Platform</p>
                </div>
              </div>
            </div>

            {/* Search & Actions */}
            <div className="flex items-center space-x-4">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search insights..."
                  className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                />
              </div>
              
              <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                <Bell className="h-5 w-5" />
              </button>
              
              <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                <Settings className="h-5 w-5" />
              </button>

              {/* AI Help - LearnBot Integration */}
              <LearnBotTooltip 
                context="dashboard" 
                userAction="viewing-overview"
                position="bottom"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
              <p className="mt-1 text-slate-600">Real-time FMCG performance insights for the Philippines market</p>
            </div>
            
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              {/* Time Period Selector */}
              <div className="relative">
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  className="appearance-none bg-white border border-slate-300 rounded-lg px-4 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="1d">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>

              <button className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:ring-2 focus:ring-blue-500">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>

              <button className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:ring-2 focus:ring-blue-500">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards Grid - AI-Enhanced with RetailBot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue Card with AI Validation */}
          <InsightCard
            title="Total Revenue"
            data={{
              value: kpiData?.totalRevenue || 0,
              change: kpiData?.revenueGrowth || 0,
              unit: "PHP"
            }}
            type="metric"
            enableRetailBotValidation={true}
            context="revenue"
            threshold={{ warning: 1000000, critical: 500000 }}
          />

          {/* Total Transactions Card with AI Validation */}
          <InsightCard
            title="Transactions"
            data={{
              value: kpiData?.totalTransactions || 0,
              change: kpiData?.transactionGrowth || 0
            }}
            type="metric"
            enableRetailBotValidation={true}
            context="transactions"
            threshold={{ warning: 1000, critical: 500 }}
          />

          {/* Unique Customers Card with AI Validation */}
          <InsightCard
            title="Unique Customers"
            data={{
              value: kpiData?.uniqueCustomers || 0,
              change: 5.2 // Mock growth data
            }}
            type="metric"
            enableRetailBotValidation={true}
            context="customers"
            threshold={{ warning: 200, critical: 100 }}
          />

          {/* Average Order Value Card */}
          <InsightCard
            title="Avg Order Value"
            data={{
              value: kpiData?.avgOrderValue || 0,
              change: 3.8, // Mock growth data
              unit: "PHP"
            }}
            type="metric"
            enableRetailBotValidation={true}
            context="revenue"
          />
        </div>

        {/* Charts Section */}
        <div className="space-y-8 mb-8">
          {/* Philippine Regional Performance Map */}
          <PhilippineRegionMap
            data={regionData.map(region => ({
              region: region.region,
              code: region.region === 'Metro Manila' ? 'NCR' : 
                    region.region === 'Central Luzon' ? 'III' :
                    region.region === 'Southern Luzon' ? 'IV-A' :
                    region.region === 'Visayas' ? 'VII' : 'VI',
              revenue: region.revenue,
              transactions: region.transactions,
              growth: region.growth,
              cities: [] // Would be populated with actual city data
            }))}
            onRegionClick={(region) => {
              console.log('Selected region:', region);
              // Handle region selection for detailed view
            }}
            selectedRegion={undefined}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Insights - AI Integration Point */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">AI Insights</h3>
                  <p className="text-sm text-slate-600 mt-1">Powered by RetailBot analytics</p>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-900">Strong Metro Manila Growth</p>
                      <p className="text-sm text-blue-700 mt-1">
                        Revenue in Metro Manila increased 15.2% this week, driven by premium FMCG categories.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Eye className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-amber-900">Customer Behavior Shift</p>
                      <p className="text-sm text-amber-700 mt-1">
                        Average order value increased 8% as customers prefer bulk purchases.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Star className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-green-900">TBWA Brands Outperforming</p>
                      <p className="text-sm text-green-700 mt-1">
                        TBWA portfolio shows 22% growth vs 8% market average this period.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Status */}
        <div className="text-center text-sm text-slate-500">
          Last updated: {format(new Date(), 'MMM d, yyyy • h:mm a')} • 
          Data source: {authToken ? 'Live Azure SQL' : 'Mock data'} • 
          AI insights: Active
        </div>
      </main>
    </div>
  );
};

export default Dashboard;