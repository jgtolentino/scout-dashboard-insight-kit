
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, AlertTriangle, Target, Lightbulb } from "lucide-react";

const AnalyticsAIPanel = () => {
  const insights = [
    {
      type: "performance",
      title: "Revenue Spike Detected",
      description: "Electronics category showing 40% increase in Q2. Consider expanding inventory.",
      impact: "high",
      icon: TrendingUp,
      action: "Analyze Further"
    },
    {
      type: "optimization",
      title: "Cross-selling Opportunity",
      description: "Customers buying electronics often purchase accessories. Bundle recommendations could increase AOV by 15%.",
      impact: "medium",
      icon: Target,
      action: "Create Bundles"
    },
    {
      type: "warning",
      title: "Seasonal Trend Alert",
      description: "Sports equipment sales typically decline 25% in Q3. Plan inventory accordingly.",
      impact: "medium",
      icon: AlertTriangle,
      action: "Adjust Inventory"
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

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          Analytics AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div key={index} className="p-4 rounded-lg bg-gray-50 border">
              <div className="flex items-start gap-3">
                <Icon className="h-5 w-5 text-blue-600 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-sm">{insight.title}</h4>
                    <Badge className={getImpactColor(insight.impact)}>
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
        
        <div className="pt-4 border-t">
          <Button className="w-full" variant="default" size="sm">
            <Lightbulb className="h-4 w-4 mr-2" />
            Generate More Insights
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsAIPanel;
