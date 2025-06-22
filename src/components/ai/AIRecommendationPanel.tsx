import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, Package, DollarSign, Settings, ArrowRight, Loader2 } from 'lucide-react';
import { useFilterStore } from '@/stores/filterStore';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/config/api';
import { useQuery } from '@tanstack/react-query';

interface AIRecommendationPanelProps {
  title?: string;
  query?: string;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  confidence: number;
  category: 'pricing' | 'promotion' | 'inventory' | 'ops';
  filters?: Record<string, string | number | boolean>;
}

export default function AIRecommendationPanel({
  title = "AI Recommendations",
  query = "Generate recommendations based on current data"
}: AIRecommendationPanelProps) {
  const filters = useFilterStore();
  const navigate = useNavigate();
  const { setFilter, getQueryString } = useFilterStore();
  
  // Fetch recommendations from API
  const { data, isLoading, error } = useQuery({
    queryKey: ['recommendations', filters, query],
    queryFn: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/retailbot`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            filters
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }
        
        const data = await response.json();
        return data.actions || [];
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const recommendations = data || [];
  
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

  const handleApplyAction = (action: Recommendation) => {
    // Apply filters from the action
    if (action.filters) {
      Object.entries(action.filters).forEach(([key, value]) => {
        setFilter(key as keyof typeof filters, value);
      });
    }
    
    // Navigate to appropriate page based on action category
    switch (action.category) {
      case 'pricing':
      case 'promotion':
        navigate(`/product-mix?${getQueryString()}`);
        break;
      case 'inventory':
        navigate(`/product-mix?${getQueryString()}`);
        break;
      case 'ops':
        navigate(`/transaction-trends?${getQueryString()}`);
        break;
      default:
        navigate(`/?${getQueryString()}`);
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
                  <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-8 w-24 bg-gray-200 rounded mt-3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Error loading recommendations</p>
            <Button variant="outline" size="sm" className="mt-4">
              Try Again
            </Button>
          </div>
        ) : recommendations.length > 0 ? (
          <div className="space-y-4">
            {recommendations.map((action, index) => {
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
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs"
                        onClick={() => handleApplyAction(action)}
                      >
                        Apply Action <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            <div className="pt-4 border-t text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Data Quality: good</span>
                <span>Response Time: 842ms</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recommendations available for current filters</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}