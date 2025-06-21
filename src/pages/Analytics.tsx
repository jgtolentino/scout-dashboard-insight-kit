
import { Card } from "@/components/ui/card";
import { BarChart3, TrendingUp, PieChart, Activity } from "lucide-react";

const Analytics = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="container mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl text-white">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Advanced Analytics
            </h1>
            <p className="text-gray-600 mt-1">Deep insights and trend analysis</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold">Transaction Trends</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Analyze transaction patterns by time of day, location, and product category.
            </p>
          </Card>

          <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <PieChart className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold">Product Mix Analysis</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Understand category breakdowns and SKU performance metrics.
            </p>
          </Card>

          <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold">Consumer Behavior</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Track preference signals and substitution patterns.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
