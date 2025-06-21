import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Lightbulb, RefreshCw } from 'lucide-react';
import { useFilterStore } from '@/stores/filterStore';

interface Insight {
  id: string;
  insight: string;
  confidence: number;
  category: string;
  action_items: string[];
  impact: 'High' | 'Medium' | 'Low';
  type: 'opportunity' | 'alert' | 'insight';
}

const generateInsights = (filters: any): Insight[] => {
  const insights: Insight[] = [
    {
      id: '1',
      insight: "Peak transaction hours are between 6-8 PM, representing 23% of daily volume. Consider extending staff hours during this period.",
      confidence: 92,
      category: "Operations",
      action_items: ["Adjust staffing schedule", "Monitor inventory levels during peak hours"],
      impact: "High",
      type: "opportunity"
    },
    {
      id: '2',
      insight: "Beverages category shows 15% higher conversion rate in Metro Manila compared to other regions. Expand beverage promotions in this area.",
      confidence: 87,
      category: "Marketing",
      action_items: ["Launch targeted beverage campaigns", "Increase beverage shelf space in Metro Manila stores"],
      impact: "High",
      type: "opportunity"
    },
    {
      id: '3',
      insight: "Customer age group 26-35 has the highest average order value (₱189) but represents only 31% of transactions. Target this segment for upselling.",
      confidence: 84,
      category: "Customer Insights",
      action_items: ["Create premium product bundles", "Implement loyalty program for this age group"],
      impact: "Medium",
      type: "insight"
    },
    {
      id: '4',
      insight: "Brand substitution analysis shows 234 switches from Coca-Cola to Pepsi. Stock optimization needed to prevent lost sales.",
      confidence: 79,
      category: "Inventory",
      action_items: ["Review Coca-Cola stock levels", "Negotiate better terms with suppliers"],
      impact: "Medium",
      type: "alert"
    },
    {
      id: '5',
      insight: "Weekend transactions are 18% higher than weekdays, but average order value is 12% lower. Focus on increasing basket size during weekends.",
      confidence: 88,
      category: "Sales Strategy",
      action_items: ["Implement weekend bundle offers", "Train staff on upselling techniques"],
      impact: "High",
      type: "opportunity"
    }
  ];

  // Filter insights based on current filters (simplified logic)
  let filteredInsights = [...insights];
  
  if (filters.categories.length > 0) {
    filteredInsights = filteredInsights.filter(insight => 
      insight.insight.toLowerCase().includes(filters.categories[0].toLowerCase()) ||
      insight.category === "Marketing"
    );
  }
  
  if (filters.barangays.length > 0) {
    filteredInsights = filteredInsights.filter(insight => 
      insight.insight.toLowerCase().includes("metro manila") ||
      insight.category === "Operations"
    );
  }

  // Always return at least 3 insights
  if (filteredInsights.length < 3) {
    filteredInsights = insights.slice(0, 3);
  }

  return filteredInsights.slice(0, 5);
};

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 90) return "bg-green-500";
  if (confidence >= 80) return "bg-blue-500";
  if (confidence >= 70) return "bg-yellow-500";
  return "bg-red-500";
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Operations": return TrendingUp;
    case "Marketing": return Lightbulb;
    case "Customer Insights": return CheckCircle;
    case "Inventory": return AlertTriangle;
    case "Sales Strategy": return Brain;
    default: return Brain;
  }
};

const getImpactColor = (impact: string) => {
  switch (impact) {
    case "High": return "bg-red-100 text-red-800";
    case "Medium": return "bg-yellow-100 text-yellow-800";
    case "Low": return "bg-green-100 text-green-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

export function AIInsightsPanel() {
  const filters = useFilterStore();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshInsights = async () => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newInsights = generateInsights(filters);
    setInsights(newInsights);
    setIsLoading(false);
  };

  useEffect(() => {
    refreshInsights();
  }, [filters.categories, filters.barangays, filters.brands, filters.stores, filters.from, filters.to]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <span>AI Insights</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshInsights}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight) => {
            const IconComponent = getCategoryIcon(insight.category);
            return (
              <div key={insight.id} className="border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <IconComponent className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline">{insight.category}</Badge>
                    <Badge className={getImpactColor(insight.impact)}>
                      {insight.impact} Impact
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">Confidence:</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getConfidenceColor(insight.confidence)} transition-all duration-300`}
                          style={{ width: `${insight.confidence}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium">{insight.confidence}%</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-foreground leading-relaxed">
                  {insight.insight}
                </p>
                
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Action Items:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {insight.action_items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start space-x-1">
                        <span>•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-end">
                  <Button size="sm" variant="outline">
                    Apply Recommendation
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        
        {insights.length === 0 && !isLoading && (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No insights available for current filters</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}