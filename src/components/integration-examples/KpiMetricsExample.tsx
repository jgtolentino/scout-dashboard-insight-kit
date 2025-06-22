import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, ShoppingCart, Users, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '@/config/api';
import { useFilterStore } from '@/stores/filterStore';
import { Skeleton } from '@/components/ui/skeleton';
import { useTransactionData } from '@/hooks/useTransactionData';

interface KpiMetric {
  title: string;
  value: string;
  change: string;
  positive: boolean;
  icon: React.ElementType;
}

const KpiMetricsExample = () => {
  const filters = useFilterStore();
  
  // Fetch transaction data for KPI calculation
  const { data: transactionData, isLoading: transactionsLoading, error: transactionsError } = useTransactionData(filters);
  
  // Fetch summary data from analytics endpoint
  const { data: summaryData, isLoading: summaryLoading, error: summaryError } = useQuery({
    queryKey: ['analytics-summary', filters],
    queryFn: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/analytics/summary?${new URLSearchParams({
          ...(filters.from ? { date_from: filters.from } : {}),
          ...(filters.to ? { date_to: filters.to } : {}),
          ...(filters.barangays?.length ? { region: filters.barangays.join(',') } : {})
        })}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch analytics summary');
        }
        
        return response.json();
      } catch (error) {
        console.error('Error fetching analytics summary:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
  
  const isLoading = transactionsLoading || summaryLoading;
  const hasError = transactionsError || summaryError;
  
  // Calculate metrics from real data
  const calculateMetrics = (): KpiMetric[] => {
    if (isLoading || hasError) {
      return [
        { title: "Total Revenue", value: "₱0", change: "0%", positive: true, icon: DollarSign },
        { title: "Total Transactions", value: "0", change: "0%", positive: true, icon: ShoppingCart },
        { title: "Active Customers", value: "0", change: "0%", positive: true, icon: Users },
        { title: "Avg Order Value", value: "₱0", change: "0%", positive: true, icon: TrendingUp },
      ];
    }
    
    // If we have summary data, use it
    if (summaryData) {
      return [
        { 
          title: "Total Revenue", 
          value: `₱${summaryData.total_revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 
          change: "+12.3%", // This would come from API in a real implementation
          positive: true,
          icon: DollarSign
        },
        { 
          title: "Total Transactions", 
          value: summaryData.total_transactions.toLocaleString(), 
          change: "+8.2%", 
          positive: true,
          icon: ShoppingCart
        },
        { 
          title: "Active Customers", 
          value: (summaryData.unique_customers || 0).toLocaleString(), 
          change: "+15.4%", 
          positive: true,
          icon: Users
        },
        { 
          title: "Avg Order Value", 
          value: `₱${summaryData.average_basket_size.toFixed(2)}`, 
          change: "-2.1%", 
          positive: false,
          icon: TrendingUp
        },
      ];
    }
    
    // Otherwise calculate from transaction data
    const transactions = transactionData?.data || [];
    const totalRevenue = transactions.reduce((sum, t) => sum + (t.total_amount || 0), 0);
    const totalTransactions = transactions.length;
    const avgOrderValue = totalRevenue / totalTransactions || 0;
    const uniqueCustomers = new Set(transactions.map(t => t.customer_id)).size;
    
    return [
      { 
        title: "Total Revenue", 
        value: `₱${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 
        change: "+12.3%", 
        positive: true,
        icon: DollarSign
      },
      { 
        title: "Total Transactions", 
        value: totalTransactions.toLocaleString(), 
        change: "+8.2%", 
        positive: true,
        icon: ShoppingCart
      },
      { 
        title: "Active Customers", 
        value: uniqueCustomers.toLocaleString(), 
        change: "+15.4%", 
        positive: true,
        icon: Users
      },
      { 
        title: "Avg Order Value", 
        value: `₱${avgOrderValue.toFixed(2)}`, 
        change: "-2.1%", 
        positive: false,
        icon: TrendingUp
      },
    ];
  };

  const metrics = calculateMetrics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-[120px] w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.title}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <p className={`text-sm ${metric.positive ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.change} vs last month
                  </p>
                </div>
                <Icon className="h-8 w-8 text-muted-foreground/70" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default KpiMetricsExample;