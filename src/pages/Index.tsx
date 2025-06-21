
import { useState } from "react";
import DashboardHeader from "../components/DashboardHeader";
import MetricsOverview from "../components/MetricsOverview";
import TransactionTable from "../components/TransactionTable";
import InsightsPanel from "../components/InsightsPanel";
import ChartSection from "../components/ChartSection";

const Index = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <DashboardHeader 
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
        />
        
        <MetricsOverview period={selectedPeriod} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ChartSection period={selectedPeriod} />
            <TransactionTable />
          </div>
          
          <div className="lg:col-span-1">
            <InsightsPanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
