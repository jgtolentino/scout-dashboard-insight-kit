import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Brain, Search, ArrowRight, Loader2 } from 'lucide-react';
import { useAIInsights } from '@/hooks/useAIInsights';
import { useFilterStore } from '@/stores/filterStore';

interface AIAgentProps {
  title?: string;
  description?: string;
  placeholder?: string;
  showFilters?: boolean;
}

export function AIAgent({ 
  title = "AI Agent", 
  description = "Ask questions about your data",
  placeholder = "What insights can you provide about my data?",
  showFilters = true
}: AIAgentProps) {
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const filters = useFilterStore();
  
  const { data, isLoading, error, refetch } = useAIInsights(
    showFilters ? filters : {},
    activeQuery || 'Generate key insights from the data'
  );
  
  const handleSearch = () => {
    if (!query.trim() || isLoading) return;
    setActiveQuery(query);
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
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={!query.trim() || isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>
        
        {showFilters && filters && (
          <div className="text-xs text-muted-foreground">
            <p>Using filters: {Object.entries(filters)
              .filter(([key, value]) => {
                if (Array.isArray(value)) return value.length > 0;
                return value;
              })
              .map(([key]) => key)
              .join(', ') || 'None'}
            </p>
          </div>
        )}
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="border rounded-lg p-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-6 text-muted-foreground">
              <p>Error loading insights. Please try again.</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : data?.insights && data.insights.length > 0 ? (
            data.insights.map((insight, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{insight.title || `Insight ${index + 1}`}</h4>
                  {insight.confidence && (
                    <Badge variant="outline">
                      {insight.confidence}% confidence
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {insight.description}
                </p>
                {insight.action_items && insight.action_items.length > 0 && (
                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="text-xs">
                      View Actions <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            ))
          ) : activeQuery ? (
            <div className="text-center py-6 text-muted-foreground">
              <p>No insights found for your query.</p>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <p>{description}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}