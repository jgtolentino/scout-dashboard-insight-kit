
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, AlertTriangle, Lightbulb, RefreshCw } from "lucide-react";

const InsightsPanel = () => {
  const insights = [
    {
      type: "spending",
      title: "High Spending Alert",
      description: "Your dining expenses are 23% higher than last month. Consider setting a budget.",
      impact: "high",
      icon: AlertTriangle,
      action: "Set Budget"
    },
    {
      type: "opportunity",
      title: "Savings Opportunity",
      description: "You could save $45/month by switching to a different subscription plan.",
      impact: "medium",
      icon: Lightbulb,
      action: "Explore Options"
    },
    {
      type: "trend",
      title: "Positive Trend",
      description: "Your transportation costs decreased by 15% this month. Great job!",
      impact: "positive",
      icon: TrendingUp,
      action: "View Details"
    }
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "positive": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getIconColor = (impact: string) => {
    switch (impact) {
      case "high": return "text-red-500";
      case "medium": return "text-yellow-500";
      case "positive": return "text-green-500";
      default: return "text-gray-500";
    }
  };

  return (
    <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <h3 className="text-xl font-semibold text-gray-900">AI Insights</h3>
        </div>
        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div key={index} className="p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100/50 border border-gray-200/50">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${getIconColor(insight.impact)}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-gray-900 text-sm">{insight.title}</h4>
                    <Badge variant="secondary" className={getImpactColor(insight.impact)}>
                      {insight.impact}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                  <Button variant="outline" size="sm" className="text-xs">
                    {insight.action}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-2">Powered by AI Analytics</p>
          <Button variant="outline" size="sm" className="w-full">
            Generate More Insights
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default InsightsPanel;
