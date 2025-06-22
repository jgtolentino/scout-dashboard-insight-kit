import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  Send, 
  RefreshCw, 
  User,
  Sparkles,
  TrendingUp,
  Package,
  DollarSign,
  Settings,
  Brain,
  BarChart3,
  Clock,
  Calendar,
  Filter,
  Loader2,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { API_BASE_URL } from '@/config/api';
import { useFilterStore } from '@/stores/filterStore';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  type: 'user' | 'bot' | 'system';
  content: string;
  timestamp: Date;
  actions?: ActionItem[];
  metadata?: Record<string, string | number | boolean>;
}

interface ActionItem {
  id: string;
  title: string;
  description: string;
  confidence: number;
  category: 'pricing' | 'promotion' | 'inventory' | 'ops';
  filters?: Record<string, string | number | boolean>;
  impact?: 'high' | 'medium' | 'low';
  status?: 'pending' | 'applied' | 'rejected';
}

interface Insight {
  id: string;
  title: string;
  description: string;
  category: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  source: string;
  timestamp: Date;
}

const EnhancedRetailBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m RetailBot, your comprehensive AI assistant for Scout Analytics. I can help you analyze transaction data, identify trends, optimize inventory, improve pricing strategies, and provide actionable recommendations. What would you like to explore today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [insights, setInsights] = useState<Insight[]>([]);
  const [appliedActions, setAppliedActions] = useState<ActionItem[]>([]);
  const [isInsightsLoading, setIsInsightsLoading] = useState(false);
  const [expandedActionId, setExpandedActionId] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<'healthy' | 'warning' | 'error'>('healthy');
  const [systemMetrics, setSystemMetrics] = useState({
    responseTime: 842,
    dataQuality: 92,
    accuracy: 87,
    coverage: 94
  });
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const filters = useFilterStore();
  const { setFilter } = useFilterStore();
  const { toast } = useToast();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Load insights when tab changes to insights
    if (activeTab === 'insights' && insights.length === 0) {
      fetchInsights();
    }
  }, [activeTab, insights.length, fetchInsights]);

  const fetchInsights = useCallback(async () => {
    setIsInsightsLoading(true);
    try {
      // In a real implementation, this would be an API call
      // For now, we'll simulate a delay and return mock data
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockInsights: Insight[] = [
        {
          id: '1',
          title: 'Peak Transaction Hours',
          description: 'Transaction volume peaks between 6-8 PM across all regions, suggesting optimal staffing times.',
          category: 'Operations',
          confidence: 92,
          impact: 'high',
          source: 'Transaction Analysis',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
        },
        {
          id: '2',
          title: 'Regional Growth',
          description: 'Cebu region shows 23% higher growth rate compared to NCR in beverage categories.',
          category: 'Marketing',
          confidence: 89,
          impact: 'medium',
          source: 'Regional Comparison',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        },
        {
          id: '3',
          title: 'Product Correlation',
          description: 'Personal care purchases strongly correlate with beverage sales (r=0.74), indicating bundle opportunities.',
          category: 'Sales',
          confidence: 81,
          impact: 'medium',
          source: 'Basket Analysis',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
        },
        {
          id: '4',
          title: 'Pricing Elasticity',
          description: 'Snack category shows low price elasticity (-0.3), suggesting opportunity for premium pricing.',
          category: 'Pricing',
          confidence: 85,
          impact: 'high',
          source: 'Price Sensitivity Analysis',
          timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
        },
        {
          id: '5',
          title: 'Inventory Optimization',
          description: 'Stock levels for top 5 SKUs are 15% higher than optimal, suggesting inventory reduction opportunity.',
          category: 'Inventory',
          confidence: 88,
          impact: 'medium',
          source: 'Inventory Analysis',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
        }
      ];
      
      setInsights(mockInsights);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setIsInsightsLoading(false);
    }
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Call the real API
      const response = await fetch(`${API_BASE_URL}/retailbot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: inputMessage,
          filters,
          model: selectedModel
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response from RetailBot');
      }
      
      const data = await response.json();
      
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: `I've analyzed your query "${inputMessage}" and generated ${data.actions?.length || 0} actionable recommendations based on your current filters.`,
        timestamp: new Date(),
        actions: data.actions || [],
        metadata: {
          diagnostics: data.diagnostics,
          query: data.query,
          timestamp: data.timestamp
        }
      };
      
      setMessages(prev => [...prev, botResponse]);
      
      // Update system metrics based on response
      setSystemMetrics(prev => ({
        ...prev,
        responseTime: data.diagnostics?.response_time_ms || prev.responseTime,
        dataQuality: data.diagnostics?.data_quality === 'good' ? 92 : 75
      }));
      
      // Update system status based on diagnostics
      if (data.diagnostics?.data_quality === 'warn') {
        setSystemStatus('warning');
      } else if (data.diagnostics?.data_quality === 'bad') {
        setSystemStatus('error');
      } else {
        setSystemStatus('healthy');
      }
    } catch (error) {
      console.error('Error getting RetailBot response:', error);
      
      // Fallback response on error
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: "I'm sorry, I encountered an error processing your request. Please try again later.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setSystemStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyAction = (action: ActionItem) => {
    // Apply filters from the action
    if (action.filters) {
      Object.entries(action.filters).forEach(([key, value]) => {
        setFilter(key as keyof typeof filters, value);
      });
    }
    
    // Mark action as applied
    setMessages(prev => 
      prev.map(msg => {
        if (msg.actions) {
          return {
            ...msg,
            actions: msg.actions.map(a => 
              a.id === action.id ? { ...a, status: 'applied' } : a
            )
          };
        }
        return msg;
      })
    );
    
    // Add to applied actions
    setAppliedActions(prev => [...prev, { ...action, status: 'applied' }]);
    
    // Show toast notification
    toast({
      title: "Action Applied",
      description: `${action.title} has been applied to your filters.`,
      duration: 3000,
    });
  };

  const handleRejectAction = (action: ActionItem) => {
    // Mark action as rejected
    setMessages(prev => 
      prev.map(msg => {
        if (msg.actions) {
          return {
            ...msg,
            actions: msg.actions.map(a => 
              a.id === action.id ? { ...a, status: 'rejected' } : a
            )
          };
        }
        return msg;
      })
    );
    
    // Show toast notification
    toast({
      title: "Action Rejected",
      description: `${action.title} has been rejected.`,
      duration: 3000,
    });
  };

  const handleRefresh = () => {
    if (messages.length > 1) {
      const lastUserQuery = messages.filter(msg => msg.type === 'user').pop();
      if (lastUserQuery) {
        setInputMessage(lastUserQuery.content);
        handleSendMessage();
      }
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'pricing': return DollarSign;
      case 'promotion': return TrendingUp;
      case 'inventory': return Package;
      case 'ops': return Settings;
      case 'Operations': return Settings;
      case 'Marketing': return TrendingUp;
      case 'Sales': return BarChart3;
      case 'Pricing': return DollarSign;
      case 'Inventory': return Package;
      default: return Sparkles;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'pricing': return 'bg-green-500';
      case 'promotion': return 'bg-blue-500';
      case 'inventory': return 'bg-orange-500';
      case 'ops': return 'bg-purple-500';
      case 'Operations': return 'bg-purple-500';
      case 'Marketing': return 'bg-blue-500';
      case 'Sales': return 'bg-indigo-500';
      case 'Pricing': return 'bg-green-500';
      case 'Inventory': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const quickQueries = [
    'What are the top performing product categories?',
    'Show me peak transaction hours',
    'Which regions have the highest growth?',
    'Analyze customer behavior patterns',
    'Recommend pricing optimization strategies',
    'Identify inventory restocking needs',
    'Suggest staff scheduling improvements'
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg text-white">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">RetailBot Assistant</h3>
            <p className="text-sm text-muted-foreground">AI-powered retail intelligence</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4">GPT-4</SelectItem>
              <SelectItem value="gpt-3.5">GPT-3.5</SelectItem>
              <SelectItem value="claude-3">Claude 3</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" disabled={isLoading} onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b px-4">
          <TabsList className="h-10">
            <TabsTrigger value="chat" className="data-[state=active]:bg-background">
              <Bot className="h-4 w-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-background">
              <Brain className="h-4 w-4 mr-2" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="actions" className="data-[state=active]:bg-background">
              <CheckCircle className="h-4 w-4 mr-2" />
              Applied Actions
            </TabsTrigger>
            <TabsTrigger value="system" className="data-[state=active]:bg-background">
              <Settings className="h-4 w-4 mr-2" />
              System
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Chat Tab */}
        <TabsContent value="chat" className="flex-1 flex flex-col p-0 m-0 data-[state=active]:flex data-[state=inactive]:hidden">
          {/* Chat Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.type === 'bot' && (
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full text-white flex-shrink-0">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  
                  <div className={`max-w-[80%] ${message.type === 'user' ? 'order-1' : ''}`}>
                    <div className={`p-3 rounded-lg ${
                      message.type === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>

                    {/* Action Items */}
                    {message.actions && message.actions.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.actions.map((action) => {
                          const IconComponent = getCategoryIcon(action.category);
                          const isExpanded = expandedActionId === action.id;
                          
                          return (
                            <Card key={action.id} className="p-3">
                              <Collapsible 
                                open={isExpanded} 
                                onOpenChange={() => setExpandedActionId(isExpanded ? null : action.id)}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`p-2 rounded-lg ${getCategoryColor(action.category)}`}>
                                    <IconComponent className="h-4 w-4 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                      <div className="flex items-center gap-2">
                                        <h4 className="font-medium text-sm">{action.title}</h4>
                                        <Badge variant="outline">
                                          {action.confidence}% confidence
                                        </Badge>
                                        {action.impact && (
                                          <Badge className={getImpactColor(action.impact)}>
                                            {action.impact} impact
                                          </Badge>
                                        )}
                                      </div>
                                      <CollapsibleTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                          {isExpanded ? (
                                            <ChevronUp className="h-4 w-4" />
                                          ) : (
                                            <ChevronDown className="h-4 w-4" />
                                          )}
                                        </Button>
                                      </CollapsibleTrigger>
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-2">
                                      {action.description}
                                    </p>
                                    
                                    <CollapsibleContent>
                                      {action.filters && (
                                        <div className="mb-3">
                                          <p className="text-xs font-medium mb-1">Affected Filters:</p>
                                          <div className="flex flex-wrap gap-1">
                                            {Object.entries(action.filters).map(([key, value]) => (
                                              <Badge key={key} variant="secondary" className="text-xs">
                                                {key}: {Array.isArray(value) ? value.join(', ') : value}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      
                                      <div className="mb-3">
                                        <p className="text-xs font-medium mb-1">Expected Impact:</p>
                                        <div className="space-y-1">
                                          <div className="flex justify-between items-center text-xs">
                                            <span>Revenue</span>
                                            <span className="text-green-600">+8.2%</span>
                                          </div>
                                          <div className="flex justify-between items-center text-xs">
                                            <span>Customer Satisfaction</span>
                                            <span className="text-green-600">+4.5%</span>
                                          </div>
                                          <div className="flex justify-between items-center text-xs">
                                            <span>Operational Efficiency</span>
                                            <span className="text-green-600">+12.3%</span>
                                          </div>
                                        </div>
                                      </div>
                                    </CollapsibleContent>
                                    
                                    <div className="flex justify-end gap-2">
                                      {action.status === 'applied' ? (
                                        <Badge variant="outline" className="bg-green-100 text-green-800">
                                          Applied
                                        </Badge>
                                      ) : action.status === 'rejected' ? (
                                        <Badge variant="outline" className="bg-red-100 text-red-800">
                                          Rejected
                                        </Badge>
                                      ) : (
                                        <>
                                          <Button 
                                            size="sm" 
                                            variant="outline" 
                                            className="text-xs"
                                            onClick={() => handleRejectAction(action)}
                                          >
                                            <XCircle className="h-3 w-3 mr-1" />
                                            Reject
                                          </Button>
                                          <Button 
                                            size="sm" 
                                            variant="default" 
                                            className="text-xs"
                                            onClick={() => handleApplyAction(action)}
                                          >
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Apply
                                          </Button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </Collapsible>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {message.type === 'user' && (
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white flex-shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full text-white flex-shrink-0">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Quick Queries */}
          {messages.length === 1 && (
            <div className="p-4 border-t bg-muted/20">
              <p className="text-sm text-muted-foreground mb-3">Try asking:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickQueries.map((query, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-left justify-start h-auto p-2 text-xs"
                    onClick={() => setInputMessage(query)}
                  >
                    {query}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask RetailBot about your data..."
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isLoading}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                size="sm"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="flex-1 p-4 m-0 overflow-auto data-[state=active]:flex data-[state=inactive]:hidden flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">AI-Generated Insights</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchInsights}
              disabled={isInsightsLoading}
            >
              {isInsightsLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
          
          {isInsightsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="p-4">
                  <div className="animate-pulse space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-5 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : insights.length > 0 ? (
            <div className="space-y-4">
              {insights.map(insight => {
                const IconComponent = getCategoryIcon(insight.category);
                return (
                  <Card key={insight.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${getCategoryColor(insight.category)}`}>
                        <IconComponent className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{insight.title}</h4>
                            <Badge className={getImpactColor(insight.impact)}>
                              {insight.impact} impact
                            </Badge>
                          </div>
                          <Badge variant="outline">
                            {insight.confidence}% confidence
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {insight.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Source: {insight.source}</span>
                          <span>{insight.timestamp.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Brain className="h-12 w-12 mb-4 opacity-50" />
              <p>No insights available yet</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={fetchInsights}
              >
                Generate Insights
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Applied Actions Tab */}
        <TabsContent value="actions" className="flex-1 p-4 m-0 overflow-auto data-[state=active]:flex data-[state=inactive]:hidden flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Applied Actions</h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {appliedActions.length} actions applied
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setAppliedActions([])}
                disabled={appliedActions.length === 0}
              >
                Clear All
              </Button>
            </div>
          </div>
          
          {appliedActions.length > 0 ? (
            <div className="space-y-4">
              {appliedActions.map(action => {
                const IconComponent = getCategoryIcon(action.category);
                return (
                  <Card key={action.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${getCategoryColor(action.category)}`}>
                        <IconComponent className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">{action.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              Applied
                            </Badge>
                            <Badge variant="outline">
                              {action.confidence}% confidence
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {action.description}
                        </p>
                        {action.filters && (
                          <div className="mb-2">
                            <p className="text-xs font-medium mb-1">Applied Filters:</p>
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(action.filters).map(([key, value]) => (
                                <Badge key={key} variant="secondary" className="text-xs">
                                  {key}: {Array.isArray(value) ? value.join(', ') : value}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <CheckCircle className="h-12 w-12 mb-4 opacity-50" />
              <p>No actions applied yet</p>
              <p className="text-sm mt-1">Apply recommendations from the chat to see them here</p>
            </div>
          )}
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="flex-1 p-4 m-0 overflow-auto data-[state=active]:flex data-[state=inactive]:hidden flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">System Status</h3>
            <div className="flex items-center gap-2">
              {getStatusIcon(systemStatus)}
              <Badge variant={systemStatus === 'healthy' ? 'default' : systemStatus === 'warning' ? 'secondary' : 'destructive'}>
                {systemStatus === 'healthy' ? 'Healthy' : systemStatus === 'warning' ? 'Warning' : 'Error'}
              </Badge>
            </div>
          </div>
          
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-base">System Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Response Time</span>
                  <span>{systemMetrics.responseTime}ms</span>
                </div>
                <Progress value={100 - (systemMetrics.responseTime / 20)} className="h-2" />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Data Quality</span>
                  <span>{systemMetrics.dataQuality}%</span>
                </div>
                <Progress value={systemMetrics.dataQuality} className="h-2" />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>AI Accuracy</span>
                  <span>{systemMetrics.accuracy}%</span>
                </div>
                <Progress value={systemMetrics.accuracy} className="h-2" />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Data Coverage</span>
                  <span>{systemMetrics.coverage}%</span>
                </div>
                <Progress value={systemMetrics.coverage} className="h-2" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-base">Active Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Date Range:</span>
                  <span className="text-sm">
                    {filters.from && filters.to 
                      ? `${filters.from} to ${filters.to}` 
                      : 'No date filter applied'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Categories:</span>
                  <div className="flex flex-wrap gap-1">
                    {filters.categories && filters.categories.length > 0 ? (
                      filters.categories.map(cat => (
                        <Badge key={cat} variant="secondary" className="text-xs">
                          {cat}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No category filter applied</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Brands:</span>
                  <div className="flex flex-wrap gap-1">
                    {filters.brands && filters.brands.length > 0 ? (
                      filters.brands.map(brand => (
                        <Badge key={brand} variant="secondary" className="text-xs">
                          {brand}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No brand filter applied</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Hour:</span>
                  <span className="text-sm">
                    {filters.hour || 'No hour filter applied'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Model Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Current Model:</span>
                  <span className="text-sm">{selectedModel}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Last Updated:</span>
                  <span className="text-sm">{new Date().toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm font-medium">API Version:</span>
                  <span className="text-sm">v1.0.0</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Session ID:</span>
                  <span className="text-sm">{Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedRetailBot;