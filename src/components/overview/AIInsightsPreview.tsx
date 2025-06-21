
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, ArrowRight, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";

const AIInsightsPreview = () => {
  const insights = [
    {
      id: 1,
      type: "trend",
      icon: TrendingUp,
      title: "Store suggestions effective in 83% of cases",
      description: "Upselling works best during 2-4 PM peak hours, particularly for snack categories.",
      impact: "High",
      color: "text-green-600 bg-green-50",
      timestamp: "2 hours ago"
    },
    {
      id: 2,
      type: "insight",
      icon: Lightbulb,
      title: "Metro Manila driving 60% of TBWA brand revenue",
      description: "Regional concentration suggests opportunity for targeted expansion strategies.",
      impact: "Medium",
      color: "text-blue-600 bg-blue-50",
      timestamp: "4 hours ago"
    },
    {
      id: 3,
      type: "alert",
      icon: AlertTriangle,
      title: "Checkout duration impacting conversion in QSRs",
      description: "Average transaction time increased 15% in quick-service restaurants this week.",
      impact: "High",
      color: "text-amber-600 bg-amber-50",
      timestamp: "6 hours ago"
    }
  ];

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Insights Preview
          </CardTitle>
          <Button variant="outline" size="sm" className="text-xs">
            View All
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
        <p className="text-sm text-gray-600">Latest AI-generated insights and recommendations</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {insights.map((insight) => {
            const Icon = insight.icon;
            return (
              <div key={insight.id} className="p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${insight.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm text-gray-900 truncate">
                        {insight.title}
                      </h4>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          insight.impact === 'High' 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {insight.impact}
                        </span>
                        <span className="text-xs text-gray-500">{insight.timestamp}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-gray-900">12</p>
              <p className="text-xs text-gray-600">New Insights</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">83%</p>
              <p className="text-xs text-gray-600">Accuracy Rate</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">₱2.1M</p>
              <p className="text-xs text-gray-600">Impact Generated</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInsightsPreview;
