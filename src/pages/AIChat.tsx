import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Sparkles, RefreshCw, Brain, Lightbulb, Target, BarChart3, TrendingUp } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import BreadcrumbNav from "@/components/navigation/BreadcrumbNav";
import ReactMarkdown from 'react-markdown';
import { useAIChat } from "@/hooks/useAIChat";
import { adsBotApi, type AdsBotChatMessage, type AdsBotChatResponse } from '@/services/adsBotApi';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  confidence?: number;
  sources?: string[];
}

const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `👋 Hello! I'm **AdsBot**, your AI assistant for Scout Analytics. I can help you analyze your retail data, identify trends, and provide actionable recommendations.

**What I can help with:**
• Revenue and performance analysis
• Customer behavior insights  
• Product substitution patterns
• Regional performance comparisons
• Promotional optimization strategies
• Inventory recommendations

What would you like to explore in your data today?`,
      timestamp: new Date(),
      confidence: 1.0,
      sources: ['adsbot_system']
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [adsBotLoading, setAdsBotLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { generateResponse, isLoading } = useAIChat();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Initialize suggested questions
    setSuggestedQuestions([
      'Show me revenue trends for this month',
      'What are the top opportunities right now?',
      'Analyze customer segments and behavior',
      'Compare regional performance',
      'What products should I promote this weekend?'
    ]);
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || adsBotLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageContent = inputMessage;
    setInputMessage('');
    setAdsBotLoading(true);

    try {
      // Try AdsBot first
      const adsBotResponse: AdsBotChatResponse = await adsBotApi.sendChatMessage(messageContent);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: adsBotResponse.message.content,
        timestamp: new Date(),
        confidence: adsBotResponse.message.metadata?.confidence,
        sources: adsBotResponse.message.metadata?.sources
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      if (adsBotResponse.suggestedQuestions) {
        setSuggestedQuestions(adsBotResponse.suggestedQuestions);
      }
    } catch (adsBotError) {
      console.warn('AdsBot unavailable, falling back to original AI:', adsBotError);
      
      try {
        // Fallback to original AI system
        const aiResponse = await generateResponse(messageContent, messages);
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date(),
          confidence: 0.85
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } catch (error) {
        console.error('Error generating AI response:', error);
        
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I'm sorry, I encountered an error processing your request. Please try again later.",
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setAdsBotLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputMessage(question);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center gap-4 border-b px-6 py-4 bg-background">
        <SidebarTrigger />
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              AI Chat Assistant
            </h1>
            <p className="text-gray-600 mt-1">Powered by AdsBot • Get intelligent insights from your data</p>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <Bot className="h-3 w-3 mr-1" />
            AdsBot Online
          </Badge>
        </div>
        <div className="ml-auto">
          <BreadcrumbNav />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
        <Card className="h-full flex flex-col bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                <span>AI Assistant</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMessages([messages[0]])}
                disabled={messages.length <= 1}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Chat
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Chat History */}
            <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
              <div className="space-y-6">
                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.role === 'assistant' && (
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white flex-shrink-0">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}
                    
                    <div className={`max-w-[80%] p-4 rounded-lg ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      <div className="prose prose-sm dark:prose-invert">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-opacity-20 border-gray-500">
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                        {message.role === 'assistant' && message.confidence && (
                          <div className="flex items-center gap-1">
                            <Brain className="h-3 w-3 opacity-70" />
                            <span className="text-xs opacity-70">
                              {Math.round(message.confidence * 100)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {message.role === 'user' && (
                      <div className="p-2 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full text-white flex-shrink-0">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}
                
                {(isLoading || adsBotLoading) && (
                  <div className="flex justify-start">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white flex-shrink-0">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-muted p-4 rounded-lg ml-3">
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-sm">AdsBot is analyzing your data...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Suggested Questions */}
            {messages.length <= 2 && suggestedQuestions.length > 0 && (
              <div className="px-6 py-4 border-t bg-muted/20">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-4 w-4 text-blue-600" />
                  <p className="text-sm text-muted-foreground">Suggested questions:</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-left justify-start h-auto p-3 text-xs"
                      onClick={() => handleSuggestedQuestion(question)}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            {messages.length <= 2 && (
              <div className="px-6 py-4 border-t bg-blue-50">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-4 w-4 text-blue-600" />
                  <p className="text-sm text-muted-foreground">Quick actions:</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start h-auto p-3"
                    onClick={() => setInputMessage('Generate a revenue analysis report')}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    <span className="text-xs">Revenue Analysis</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start h-auto p-3"
                    onClick={() => setInputMessage('Show me trending products this week')}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    <span className="text-xs">Trending Products</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start h-auto p-3"
                    onClick={() => setInputMessage('What promotional strategies do you recommend?')}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    <span className="text-xs">Promo Ideas</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-6 border-t bg-white/50">
              <div className="flex gap-3">
                <Textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask me about your data insights..."
                  className="flex-1 min-h-[80px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={isLoading || adsBotLoading}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading || adsBotLoading}
                  className="self-end"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIChat;