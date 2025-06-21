
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Sparkles } from "lucide-react";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your Scout Analytics AI assistant. I can help you analyze your transaction data, identify trends, and provide insights. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: generateAIResponse(inputMessage),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): string => {
    const responses = [
      "Based on your transaction data, I can see some interesting patterns. Your highest transaction volumes occur on weekends, particularly in the entertainment and dining categories.",
      "I've analyzed your customer behavior and found that users aged 25-35 make up 60% of your revenue. Would you like me to dive deeper into this demographic?",
      "Your data shows a 15% increase in mobile transactions over the past month. This indicates a growing preference for mobile commerce among your customers.",
      "I notice some unusual spending patterns in the electronics category. There's been a 30% spike in transactions between 2-4 PM. This could indicate lunch-time shopping behavior.",
      "Your substitution data reveals interesting brand preferences. When customers can't find their first choice, 70% switch to premium alternatives rather than budget options."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const suggestedQuestions = [
    "What are the top performing product categories?",
    "Show me customer behavior patterns",
    "Analyze transaction trends by time of day",
    "What insights can you provide about customer preferences?"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl text-white">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                AI Chat Assistant
              </h1>
              <p className="text-gray-600 mt-1">Get intelligent insights from your data</p>
            </div>
          </div>
        </div>

        <Card className="h-[calc(100vh-200px)] flex flex-col bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          {/* Chat Messages */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.type === 'ai' && (
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white flex-shrink-0">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] p-4 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <span className="text-xs opacity-70 mt-2 block">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>

                  {message.type === 'user' && (
                    <div className="p-2 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full text-white flex-shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white flex-shrink-0">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Suggested Questions */}
          {messages.length === 1 && (
            <div className="px-6 py-4 border-t bg-gray-50/50">
              <p className="text-sm text-gray-600 mb-3">Try asking:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-left justify-start h-auto p-3 text-xs"
                    onClick={() => setInputMessage(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-6 border-t bg-white/50">
            <div className="flex gap-3">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me about your data insights..."
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isLoading}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AIChat;
