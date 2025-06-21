
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, DollarSign } from "lucide-react";

interface DashboardHeaderProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

const DashboardHeader = ({ selectedPeriod, onPeriodChange }: DashboardHeaderProps) => {
  return (
    <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Scout Analytics
            </h1>
            <p className="text-gray-600 mt-1">Financial Intelligence Dashboard</p>
          </div>
        </div>
        
        <Select value={selectedPeriod} onValueChange={onPeriodChange}>
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
  );
};

export default DashboardHeader;
