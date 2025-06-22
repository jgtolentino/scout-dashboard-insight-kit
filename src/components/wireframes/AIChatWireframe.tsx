import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, User, MessageCircle, Sparkles, Brain, Target } from 'lucide-react';

export const AIChatWireframe: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
      {/* Wireframe Header */}
      <div className="text-center py-2 border-b border-gray-300">
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <MessageCircle className="h-5 w-5" />
          <span className="font-semibold">AI Chat Interface Wireframe</span>
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            AdsBot Powered
          </Badge>
        </div>
      </div>

      {/* Main Chat Layout */}
      <div className="grid gap-4 lg:grid-cols-4">
        {/* Chat Area */}
        <div className="lg:col-span-3">
          <Card className="h-[500px] bg-white border-2 border-gray-200">
            <CardHeader className="bg-gray-100 border-b">
              <CardTitle className="flex items-center gap-2 text-sm">
                <MessageCircle className="h-4 w-4" />
                Chat Interface
                <Badge variant="outline" className="ml-auto text-xs">
                  Live Messages
                </Badge>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-4 space-y-4">
              {/* Bot Message */}
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-blue-600" />
                </div>
                <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                  <div className="text-sm space-y-2">
                    <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-full"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                    <span className="text-xs text-gray-500">9:42 AM</span>
                    <div className="flex items-center gap-1">
                      <Brain className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">95%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Message */}
              <div className="flex gap-3 justify-end">
                <div className="bg-blue-600 text-white rounded-lg p-3 max-w-[80%]">
                  <div className="text-sm space-y-2">
                    <div className="h-3 bg-blue-400 rounded w-2/3"></div>
                    <div className="h-3 bg-blue-400 rounded w-1/3"></div>
                  </div>
                  <div className="text-right mt-2 pt-2 border-t border-blue-500">
                    <span className="text-xs text-blue-200">9:43 AM</span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
              </div>

              {/* Bot Response */}
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-blue-600" />
                </div>
                <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                  <div className="text-sm space-y-2">
                    <div className="h-3 bg-gray-300 rounded w-full"></div>
                    <div className="h-3 bg-gray-300 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-300 rounded w-4/5"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                    <span className="text-xs text-gray-500">9:43 AM</span>
                    <div className="flex items-center gap-1">
                      <Brain className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">92%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Input Area */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex gap-2 bg-white border-2 border-gray-200 rounded-lg p-2">
                  <div className="flex-1 h-10 bg-gray-50 rounded border border-gray-200 flex items-center px-3">
                    <span className="text-gray-400 text-sm">Ask me about your data...</span>
                  </div>
                  <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs">Send</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Suggested Questions */}
          <Card className="bg-white border-2 border-gray-200">
            <CardHeader className="bg-gray-100 border-b pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 bg-gray-100 rounded border border-gray-200 flex items-center px-2">
                  <div className="h-2 bg-gray-300 rounded w-full"></div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white border-2 border-gray-200">
            <CardHeader className="bg-gray-100 border-b pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                  <div className="h-2 bg-gray-300 rounded w-3/4"></div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="bg-white border-2 border-gray-200">
            <CardHeader className="bg-gray-100 border-b pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AdsBot Features
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2 text-xs text-gray-600">
              <div className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Real-time analysis</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Trend identification</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Recommendations</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Performance insights</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Wireframe Footer */}
      <div className="text-center py-2 border-t border-gray-300">
        <span className="text-xs text-gray-500">
          Wireframe: AI Chat Interface with AdsBot Integration
        </span>
      </div>
    </div>
  );
};