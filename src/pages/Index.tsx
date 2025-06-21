
import { useState } from "react";
import MetricsOverview from "../components/MetricsOverview";
import TransactionTable from "../components/TransactionTable";
import InsightsPanel from "../components/InsightsPanel";
import ChartSection from "../components/ChartSection";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Index = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Period Selector */}
        <Card className="p-4 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
              <p className="text-gray-600 mt-1">Monitor your key metrics and insights</p>
            </div>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32 bg-white/80">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>
        
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
