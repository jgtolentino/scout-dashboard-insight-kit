import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Lightbulb, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { useFilterStore } from '@/stores/filterStore';
import { useAIInsights } from '@/hooks/useAIInsights';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';

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

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 90) return "bg-green-500";
  if (confidence >= 80) return "bg-blue-500";
  if (confidence >= 70) return "bg-yellow-500";
  return "bg-red-500";
};

const getImpactColor = (impact: string) => {
  switch (impact) {
    case "High": return "bg-red-100 text-red-800";
    case "Medium": return "bg-yellow-100 text-yellow-800";
    case "Low": return "bg-green-100 text-green-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

export function AIInsightsPanelExample() {
  const filters = useFilterStore();
  const [query, setQuery] = useState('Generate insights from current data');
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { data, isLoading, error, refetch } = useAIInsights(filters, query);
  
  const handleRefresh = () => {
    refetch();
  };

  // Limit insights to 2 when collapsed, show all when expanded
  const visibleInsights = isExpanded 
    ? data?.insights || [] 
    : (data?.insights || []).slice(0, 2);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <span>AI Insights</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[120px] w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Error loading insights</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={handleRefresh}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <div className="space-y-4">
              {visibleInsights.length > 0 ? (
                visibleInsights.map((insight, index) => {
                  const IconComponent = getCategoryIcon(insight.type || 'insight');
                  return (
                    <div key={index} className="border border-border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <IconComponent className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="outline">{insight.type || 'Insight'}</Badge>
                          {insight.impact && (
                            <Badge className={getImpactColor(insight.impact)}>
                              {insight.impact} Impact
                            </Badge>
                          )}
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
                        {insight.description || insight.title}
                      </p>
                      
                      {insight.action_items && insight.action_items.length > 0 && (
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
                      )}

                      <div className="flex justify-end">
                        <Button size="sm" variant="outline">
                          Apply Recommendation
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No insights available for current filters</p>
                </div>
              )}
              
              {data?.insights && data.insights.length > 2 && (
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full">
                    {isExpanded ? (
                      <div className="flex items-center">
                        <ChevronUp className="h-4 w-4 mr-2" />
                        <span>Show Less</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <ChevronDown className="h-4 w-4 mr-2" />
                        <span>Show More ({data.insights.length - 2} more insights)</span>
                      </div>
                    )}
                  </Button>
                </CollapsibleTrigger>
              )}
              
              <CollapsibleContent className="space-y-4">
                {data?.insights && data.insights.slice(2).map((insight, index) => {
                  const IconComponent = getCategoryIcon(insight.type || 'insight');
                  return (
                    <div key={index + 2} className="border border-border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <IconComponent className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="outline">{insight.type || 'Insight'}</Badge>
                          {insight.impact && (
                            <Badge className={getImpactColor(insight.impact)}>
                              {insight.impact} Impact
                            </Badge>
                          )}
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
                        {insight.description || insight.title}
                      </p>
                      
                      {insight.action_items && insight.action_items.length > 0 && (
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
                      )}

                      <div className="flex justify-end">
                        <Button size="sm" variant="outline">
                          Apply Recommendation
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CollapsibleContent>
            </div>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}