import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, Package, DollarSign, Settings, ArrowRight } from 'lucide-react';
import { useFilterStore } from '@/stores/filterStore';
import { useRetailBot } from '@/hooks/useRetailBot';

interface AIRecommendationPanelProps {
  title?: string;
  query?: string;
}

export function AIRecommendationPanel({
  title = "AI Recommendations",
  query = "Generate recommendations based on current data"
}: AIRecommendationPanelProps) {
  const filters = useFilterStore();
  const { data, isLoading, error, refetch } = useRetailBot(query, filters);
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'pricing': return DollarSign;
      case 'promotion': return TrendingUp;
      case 'inventory': return Package;
      case 'ops': return Settings;
      default: return Brain;
    }
  };
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'pricing': return 'bg-green-500';
      case 'promotion': return 'bg-blue-500';
      case 'inventory': return 'bg-orange-500';
      case 'ops': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse border rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 bg-gray-200 rounded"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Error loading recommendations</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => refetch()}
            >
              Try Again
            </Button>
          </div>
        ) : data?.actions && data.actions.length > 0 ? (
          <div className="space-y-4">
            {data.actions.map((action, index) => {
              const IconComponent = getCategoryIcon(action.category);
              return (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getCategoryColor(action.category)}`}>
                      <IconComponent className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{action.title}</h4>
                        <Badge variant="outline">
                          {action.confidence}% confidence
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {action.description}
                      </p>
                      <Button variant="outline" size="sm" className="text-xs">
                        Apply Action <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {data.diagnostics && (
              <div className="pt-4 border-t text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Data Quality: {data.diagnostics.data_quality}</span>
                  <span>Response Time: {data.diagnostics.response_time_ms}ms</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No recommendations available for current filters</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => refetch()}
            >
              Generate Recommendations
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}