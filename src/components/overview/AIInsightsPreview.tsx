
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, ArrowRight, TrendingUp, AlertCircle } from "lucide-react";

const AIInsightsPreview = () => {
  const insights = [
    {
      id: 1,
      type: "opportunity",
      title: "Store suggestions effective in 83% of cases",
      description: "When store owners suggest alternatives, customers accept 83% of the time, generating 12% higher basket value.",
      impact: "High",
      action: "Train more store owners on product recommendation techniques",
      icon: TrendingUp,
      color: "bg-green-100 text-green-700"
    },
    {
      id: 2,
      type: "alert",
      title: "Metro Manila driving 60% of TBWA brand revenue",
      description: "Regional concentration risk detected. Consider expansion strategies for other regions.",
      impact: "Medium",
      action: "Develop regional expansion plan",
      icon: AlertCircle,
      color: "bg-orange-100 text-orange-700"
    },
    {
      id: 3,
      type: "insight",
      title: "Checkout duration impacting conversion in QSRs",
      description: "Transactions over 3 minutes show 15% higher abandonment rate in quick-service retail locations.",
      impact: "Medium",
      action: "Optimize checkout flow for speed",
      icon: Brain,
      color: "bg-blue-100 text-blue-700"
    }
  ];

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          AI Insights Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight) => {
          const Icon = insight.icon;
          return (
            <div key={insight.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${insight.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{insight.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      insight.impact === 'High' ? 'bg-red-100 text-red-700' : 
                      insight.impact === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {insight.impact} Impact
                    </span>
                    <Button variant="ghost" size="sm" className="text-xs">
                      View Details <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              12 total insights generated today
            </div>
            <Button variant="outline" size="sm">
              View All Insights <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInsightsPreview;
