import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bot, 
  Send, 
  RefreshCw, 
  User,
  Sparkles,
  TrendingUp,
  Package,
  DollarSign,
  Settings
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  actions?: ActionItem[];
}

interface ActionItem {
  id: string;
  title: string;
  description: string;
  confidence: number;
  category: 'pricing' | 'promotion' | 'inventory' | 'ops';
  filters?: Record<string, any>;
}

const RetailBotChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m RetailBot, your AI assistant for Scout Analytics. I can help you analyze transaction data, identify trends, and provide actionable recommendations. What would you like to explore?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

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

    // Simulate API call delay based on model
    const delay = selectedModel === 'gpt-4' ? 1200 : 800;
    
    setTimeout(() => {
      const botResponse = generateBotResponse(inputMessage);
      setMessages(prev => [...prev, botResponse]);
      setIsLoading(false);
    }, delay);
  };

  const generateBotResponse = (query: string): Message => {
    const responses = [
      {
        content: "Based on your transaction data, I've identified several optimization opportunities. Peak sales occur between 6-8 PM, representing 23% of daily volume. Consider adjusting staffing and inventory during these hours.",
        actions: [
          {
            id: '1',
            title: 'Optimize Staff Scheduling',
            description: 'Add 2 additional staff members during 6-8 PM peak hours to handle 23% of daily volume',
            confidence: 91,
            category: 'ops' as const,
            filters: { hour: '18-20' }
          }
        ]
      },
      {
        content: "Your beverage category shows strong performance in Metro Manila with 15% higher conversion rates. This presents an excellent expansion opportunity for targeted marketing campaigns.",
        actions: [
          {
            id: '2',
            title: 'Launch Beverage Campaign',
            description: 'Target Metro Manila with beverage promotions based on 15% higher conversion rates',
            confidence: 87,
            category: 'promotion' as const,
            filters: { categories: ['Beverages'], regions: ['Metro Manila'] }
          }
        ]
      },
      {
        content: "Analysis reveals that customers aged 26-35 have the highest average order value at ₱189, but represent only 31% of transactions. This segment has significant upselling potential.",
        actions: [
          {
            id: '3',
            title: 'Target Premium Segment',
            description: 'Create premium product bundles for 26-35 age group with ₱189 average order value',
            confidence: 84,
            category: 'pricing' as const,
            filters: { age_group: '26-35' }
          }
        ]
      }
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      id: (Date.now() + 1).toString(),
      type: 'bot',
      content: randomResponse.content,
      timestamp: new Date(),
      actions: randomResponse.actions
    };
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'pricing': return DollarSign;
      case 'promotion': return TrendingUp;
      case 'inventory': return Package;
      case 'ops': return Settings;
      default: return Sparkles;
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

  const quickQueries = [
    'What are the top performing product categories?',
    'Show me peak transaction hours',
    'Which regions have the highest growth?',
    'Analyze customer behavior patterns'
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
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4">GPT-4</SelectItem>
              <SelectItem value="gpt-3.5">GPT-3.5</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

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
                      return (
                        <Card key={action.id} className="p-3">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${getCategoryColor(action.category)}`}>
                              <IconComponent className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-sm">{action.title}</h4>
                                <Badge variant="outline">
                                  {action.confidence}% confidence
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mb-2">
                                {action.description}
                              </p>
                              <Button size="sm" variant="outline" className="text-xs">
                                Apply Action
                              </Button>
                            </div>
                          </div>
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
          <div className="grid grid-cols-2 gap-2">
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
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RetailBotChat;