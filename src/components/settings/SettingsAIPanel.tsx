
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Shield, Database, Bell, Settings as SettingsIcon } from "lucide-react";

const SettingsAIPanel = () => {
  const recommendations = [
    {
      type: "security",
      title: "Security Enhancement",
      description: "Enable 2FA for admin accounts. 3 accounts still using password-only authentication.",
      impact: "high",
      icon: Shield,
      action: "Configure 2FA"
    },
    {
      type: "performance",
      title: "Database Optimization",
      description: "Query performance can be improved by 40% with suggested index optimizations.",
      impact: "medium",
      icon: Database,
      action: "Optimize Database"
    },
    {
      type: "notifications",
      title: "Alert Configuration",
      description: "Setup automated alerts for system performance thresholds and security events.",
      impact: "medium",
      icon: Bell,
      action: "Setup Alerts"
    }
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          System Optimization AI
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((rec, index) => {
          const Icon = rec.icon;
          return (
            <div key={index} className="p-4 rounded-lg bg-gray-50 border">
              <div className="flex items-start gap-3">
                <Icon className="h-5 w-5 text-gray-600 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-sm">{rec.title}</h4>
                    <Badge className={getImpactColor(rec.impact)}>
                      {rec.impact}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                  <Button variant="outline" size="sm" className="text-xs">
                    {rec.action}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
        
        <div className="pt-4 border-t">
          <Button className="w-full" variant="default" size="sm">
            <SettingsIcon className="h-4 w-4 mr-2" />
            Run System Analysis
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsAIPanel;
