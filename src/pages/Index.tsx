
import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import MetricsOverview from "@/components/MetricsOverview";
import ChartSection from "@/components/ChartSection";
import TransactionTable from "@/components/TransactionTable";
import { GlobalFilterBar } from "@/components/GlobalFilterBar";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <DashboardHeader />
        </div>
        
        {/* Global Filter Bar */}
        <GlobalFilterBar />
        
        <MetricsOverview />
        <ChartSection />
        <TransactionTable />
      </div>
    </div>
  );
};

export default Index;
