import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, Package, DollarSign, Settings, ArrowRight } from 'lucide-react';
import { useFilterStore } from '@/stores/filterStore';
import { useNavigate } from 'react-router-dom';

interface AIRecommendationPanelProps {
  title?: string;
  query?: string;
}

export default function AIRecommendationPanel({
  title = "AI Recommendations",
  query = "Generate recommendations based on current data"
}: AIRecommendationPanelProps) {
  const filters = useFilterStore();
  const navigate = useNavigate();
  const { setFilter, getQueryString } = useFilterStore();
  
  // Mock data for recommendations
  const recommendations = [
    {
      id: '1',
      title: 'Optimize Pricing for Beverages',
      description: 'Analysis shows 15% price elasticity in beverages. Recommend 8% price increase on premium SKUs during peak hours (6-8 PM) to maximize revenue without significant volume loss.',
      confidence: 89,
      category: 'pricing',
      filters: { categories: ['Beverages'], hour: '18-20' }
    },
    {
      id: '2',
      title: 'Restock Alert: Coca-Cola 500ml',
      description: 'Current stock levels at 23% capacity. Based on historical demand patterns, recommend immediate restock of 2,500 units to prevent stockouts during weekend rush.',
      confidence: 94,
      category: 'inventory',
      filters: { brands: ['Coca-Cola'] }
    },
    {
      id: '3',
      title: 'Cross-Category Bundle Promotion',
      description: 'Data indicates 67% of beverage buyers also purchase snacks. Launch "Combo Deal" promotion: Buy 2 beverages + 1 snack for 15% discount to increase basket size.',
      confidence: 82,
      category: 'promotion',
      filters: { categories: ['Beverages', 'Food & Snacks'] }
    }
  ];
  
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

  const handleApplyAction = (action: any) => {
    // Apply filters from the action
    if (action.filters) {
      Object.entries(action.filters).forEach(([key, value]) => {
        setFilter(key as any, value);
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
      </CardContent>
    </Card>
  );
}