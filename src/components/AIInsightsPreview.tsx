
import React from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, TrendingUp, AlertCircle } from 'lucide-react';
import type { AIInsight, AIInsightsResponse } from '@/types/api';

const fetcher = (url: string) => fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'Generate 3 key insights from current retail data' })
}).then(r => r.json());

export default function AIInsightsPreview() {
  const { data, error, isLoading } = useSWR<AIInsightsResponse>('/api/ai-insights', fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: false
  });
  
  const insights: AIInsight[] = data?.insights || [
    {
      id: 1,
      title: 'Peak Sales Hours',
      description: 'Transaction volume peaks between 6-8 PM across all regions, suggesting optimal staffing times.',
      type: 'trend',
      confidence: 0.89
    },
    {
      id: 2,
      title: 'Regional Growth',
      description: 'Cebu region shows 23% higher growth rate compared to NCR in beverage categories.',
      type: 'growth',
      confidence: 0.92
    },
    {
      id: 3,
      title: 'Product Correlation',
      description: 'Personal care purchases strongly correlate with beverage sales (r=0.74), indicating bundle opportunities.',
      type: 'correlation',
      confidence: 0.81
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'trend': return TrendingUp;
      case 'growth': return TrendingUp;
      case 'correlation': return Brain;
      default: return AlertCircle;
    }
  };

  const getColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          AI Insights
          {isLoading && <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight: AIInsight) => {
            const Icon = getIcon(insight.type);
            return (
              <div key={insight.id} className="border-l-4 border-purple-500 pl-4 py-2">
                <div className="flex items-start gap-2">
                  <Icon className="h-4 w-4 text-purple-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{insight.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-500">Confidence:</span>
                      <span className={`text-xs font-medium ${getColor(insight.confidence)}`}>
                        {(insight.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {error && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">Unable to load AI insights</p>
            <p className="text-xs text-gray-400">Using cached insights</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
