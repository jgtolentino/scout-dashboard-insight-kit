
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Users, Target, Heart, MessageCircle } from "lucide-react";

const CustomersAIPanel = () => {
  const insights = [
    {
      type: "retention",
      title: "Churn Risk Identified",
      description: "124 VIP customers haven't purchased in 45+ days. Consider targeted re-engagement campaign.",
      impact: "high",
      icon: Users,
      action: "Create Campaign"
    },
    {
      type: "engagement",
      title: "Personalization Opportunity",
      description: "Loyal customers respond 65% better to personalized product recommendations.",
      impact: "medium",
      icon: Heart,
      action: "Enable Personalization"
    },
    {
      type: "acquisition",
      title: "Referral Program Potential",
      description: "VIP customers have 4.2x higher referral rates. Implement referral incentives.",
      impact: "medium",
      icon: Target,
      action: "Setup Referrals"
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
          Customer Intelligence AI
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div key={index} className="p-4 rounded-lg bg-gray-50 border">
              <div className="flex items-start gap-3">
                <Icon className="h-5 w-5 text-green-600 mt-1" />
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
            <MessageCircle className="h-4 w-4 mr-2" />
            Customer Insights Chat
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomersAIPanel;
