
import { Card } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon, DollarSign, CreditCard, TrendingUp, Users } from "lucide-react";

interface MetricsOverviewProps {
  period: string;
}

const MetricsOverview = ({ period }: MetricsOverviewProps) => {
  // Mock data - in real app this would come from your API
  const metrics = [
    {
      title: "Total Revenue",
      value: "$47,245.89",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "Transactions",
      value: "2,847",
      change: "+8.2%", 
      trend: "up",
      icon: CreditCard,
      color: "from-blue-500 to-cyan-600"
    },
    {
      title: "Average Order",
      value: "$165.73",
      change: "-2.1%",
      trend: "down", 
      icon: TrendingUp,
      color: "from-purple-500 to-violet-600"
    },
    {
      title: "Active Users",
      value: "1,429",
      change: "+15.8%",
      trend: "up",
      icon: Users,
      color: "from-orange-500 to-red-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index} className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                <div className="flex items-center mt-2">
                  {metric.trend === "up" ? (
                    <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    metric.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}>
                    {metric.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs {period}</span>
                </div>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-r ${metric.color} text-white`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default MetricsOverview;
