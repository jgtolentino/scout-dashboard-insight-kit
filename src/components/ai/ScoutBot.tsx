import React, { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import { Send, Bot, User, Sparkles, AlertCircle, TrendingUp, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useFilterStore } from '@/stores/filterStore';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';
import { callAzureOpenAI } from '@/lib/azure/azureBypass';
import { shouldBypassAuth } from '@/lib/auth/authFallback';

interface QuickAction {
  id: string;
  label: string;
  prompt: string;
  icon: React.ReactNode;
  category: 'insights' | 'trends' | 'recommendations';
}

const quickActions: QuickAction[] = [
  {
    id: 'top-skus',
    label: 'Top SKUs in location',
    prompt: 'Show me the top performing SKUs in the current location filter',
    icon: <TrendingUp className="h-4 w-4" />,
    category: 'trends'
  },
  {
    id: 'sales-summary',
    label: 'Sales summary',
    prompt: 'Give me a summary of sales performance with current filters',
    icon: <ShoppingCart className="h-4 w-4" />,
    category: 'insights'
  },
  {
    id: 'anomalies',
    label: 'Detect anomalies',
    prompt: 'Are there any unusual patterns or anomalies in the current data?',
    icon: <AlertCircle className="h-4 w-4" />,
    category: 'insights'
  },
  {
    id: 'recommendations',
    label: 'AI recommendations',
    prompt: 'What are your top 3 recommendations based on current data?',
    icon: <Sparkles className="h-4 w-4" />,
    category: 'recommendations'
  }
];

export const ScoutBot: React.FC = () => {
  const { filters } = useFilterStore();
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use AI hook with Medallion API integration
  const { messages, input, handleInputChange, handleSubmit, setMessages, append } = useChat({
    api: '/api/v1/ai/chat',
    body: {
      context: filters,
      feature_flags: {
        real_time_streaming: import.meta.env.VITE_REAL_TIME_STREAMING === 'true',
        advanced_analytics: import.meta.env.VITE_ADVANCED_ANALYTICS === 'true',
        ml_predictions: import.meta.env.VITE_ML_PREDICTIONS === 'true'
      }
    },
    onError: (error) => {
      console.error('Chat error:', error);
      toast.error('Failed to get AI response. Please try again.');
    }
  });

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Get filter context summary for display
  const getFilterContext = () => {
    const activeFilters = Object.entries(filters)
      .filter(([_, value]) => value && value !== 'all' && value !== '')
      .map(([key, value]) => `${key}: ${value}`);
    
    return activeFilters.length > 0 
      ? activeFilters.join(', ')
      : 'All data (no filters applied)';
  };

  // Handle quick action clicks
  const handleQuickAction = async (action: QuickAction) => {
    setIsLoading(true);
    try {
      await append({
        role: 'user',
        content: action.prompt
      });
    } catch (error) {
      console.error('Quick action error:', error);
      toast.error('Failed to execute quick action');
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced submit with context
  const handleEnhancedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    try {
      // Get fresh insights from Medallion API
      const insights = await apiService.getMedallionInsights?.(filters) || 
                      await apiService.getAIInsights?.(filters);
      
      // Submit with enhanced context
      await handleSubmit(e, {
        body: {
          context: filters,
          insights: insights,
          feature_flags: {
            real_time_streaming: import.meta.env.VITE_REAL_TIME_STREAMING === 'true',
            advanced_analytics: import.meta.env.VITE_ADVANCED_ANALYTICS === 'true',
            ml_predictions: import.meta.env.VITE_ML_PREDICTIONS === 'true'
          }
        }
      });
    } catch (error) {
      console.error('Enhanced submit error:', error);
      // Fallback to regular submit
      handleSubmit(e);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'insights': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'trends': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'recommendations': return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          ScoutBot - AI Analytics Assistant
          {import.meta.env.VITE_REAL_TIME_STREAMING === 'true' && (
            <Badge variant="secondary" className="ml-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
              Live
            </Badge>
          )}
        </CardTitle>
        
        {/* Current filter context */}
        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
          <strong>Current context:</strong> {getFilterContext()}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Quick Actions */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Quick Actions:</p>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                className={`justify-start gap-2 ${getCategoryColor(action.category)}`}
                onClick={() => handleQuickAction(action)}
                disabled={isLoading}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 max-h-96">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <Bot className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>Ask me anything about your retail analytics data!</p>
              <p className="text-sm mt-1">Try using a quick action above or type your question below.</p>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`flex gap-2 max-w-[80%] ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                } rounded-lg p-3`}
              >
                {message.role === 'assistant' && (
                  <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                )}
                <div className="space-y-2">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  {message.role === 'assistant' && (
                    <div className="text-xs opacity-70">
                      Powered by AdsBot (Azure OpenAI)
                    </div>
                  )}
                </div>
                {message.role === 'user' && (
                  <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleEnhancedSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about sales trends, product performance, or get recommendations..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>

        {/* Feature flags display (development only) */}
        {import.meta.env.DEV && (
          <div className="text-xs text-gray-500 space-y-1 border-t pt-2">
            <p>Debug - Feature Flags:</p>
            <div className="flex gap-2 flex-wrap">
              <Badge variant={import.meta.env.VITE_REAL_TIME_STREAMING === 'true' ? 'default' : 'outline'}>
                Streaming: {import.meta.env.VITE_REAL_TIME_STREAMING || 'false'}
              </Badge>
              <Badge variant={import.meta.env.VITE_ADVANCED_ANALYTICS === 'true' ? 'default' : 'outline'}>
                Analytics: {import.meta.env.VITE_ADVANCED_ANALYTICS || 'false'}
              </Badge>
              <Badge variant={import.meta.env.VITE_ML_PREDICTIONS === 'true' ? 'default' : 'outline'}>
                ML: {import.meta.env.VITE_ML_PREDICTIONS || 'false'}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScoutBot;