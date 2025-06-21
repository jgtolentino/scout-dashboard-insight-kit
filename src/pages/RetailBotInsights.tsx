import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Bot } from 'lucide-react';
import RetailBotChat from '@/components/ai/RetailBotChat';
import { AIInsightsPanel } from '@/components/ai/AIInsightsPanel';
import BreadcrumbNav from '@/components/BreadcrumbNav';

const RetailBotInsights = () => {
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center gap-4 border-b px-6 py-4 bg-background">
        <SidebarTrigger />
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl text-white">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              RetailBot & AI Insights
            </h1>
            <p className="text-gray-600 mt-1">AI-powered retail intelligence assistant</p>
          </div>
        </div>
        <div className="ml-auto">
          <BreadcrumbNav />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white/70 backdrop-blur-sm border-0 shadow-lg rounded-lg h-full">
              <RetailBotChat />
            </div>
          </div>

          {/* AI Insights Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 backdrop-blur-sm border-0 shadow-lg rounded-lg h-full">
              <AIInsightsPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetailBotInsights;