import React, { useState } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Bot, Brain, Sparkles, BarChart3, Calendar, Filter } from 'lucide-react';
import EnhancedRetailBot from '@/components/ai/EnhancedRetailBot';
import { AIInsightsPanel } from '@/components/ai/AIInsightsPanel';
import BreadcrumbNav from '@/components/BreadcrumbNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useFilterStore } from '@/stores/filterStore';

const RetailBotInsights = () => {
  const [activeView, setActiveView] = useState<'full' | 'split'>('split');
  const filters = useFilterStore();
  
  // Count active filters
  const activeFilterCount = [
    filters.from,
    filters.to,
    ...filters.barangays,
    ...filters.stores,
    ...filters.categories,
    ...filters.brands,
    filters.parentCategory,
    filters.subCategory,
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center justify-between border-b px-6 py-4 bg-background">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <div className="p-2.5 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg text-white">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              RetailBot & AI Insights
            </h1>
            <p className="text-xs text-muted-foreground">AI-powered retail intelligence assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              <Filter className="h-3 w-3" />
              <span>{activeFilterCount} active filters</span>
            </Badge>
            {filters.from && filters.to && (
              <Badge variant="outline" className="flex items-center gap-1 text-xs">
                <Calendar className="h-3 w-3" />
                <span>{filters.from} to {filters.to}</span>
              </Badge>
            )}
          </div>
          <BreadcrumbNav />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-4 bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
        <Tabs defaultValue="retailbot" className="h-full">
          <div className="flex items-center justify-between mb-3">
            <TabsList className="h-8">
              <TabsTrigger value="retailbot" className="text-xs flex items-center gap-1 h-7 px-3">
                <Bot className="h-3 w-3" />
                RetailBot
              </TabsTrigger>
              <TabsTrigger value="insights" className="text-xs flex items-center gap-1 h-7 px-3">
                <Brain className="h-3 w-3" />
                AI Insights
              </TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs flex items-center gap-1 h-7 px-3">
                <BarChart3 className="h-3 w-3" />
                Analytics
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <TabsList className="h-8">
                <TabsTrigger 
                  value="split" 
                  onClick={() => setActiveView('split')}
                  data-state={activeView === 'split' ? 'active' : 'inactive'}
                  className="text-xs h-7 px-3"
                >
                  Split View
                </TabsTrigger>
                <TabsTrigger 
                  value="full" 
                  onClick={() => setActiveView('full')}
                  data-state={activeView === 'full' ? 'active' : 'inactive'}
                  className="text-xs h-7 px-3"
                >
                  Full View
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
          
          <TabsContent value="retailbot" className="h-[calc(100%-40px)] m-0">
            {activeView === 'split' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
                {/* Chat Interface */}
                <div className="lg:col-span-2">
                  <Card className="h-full">
                    <CardContent className="p-0 h-full">
                      <EnhancedRetailBot />
                    </CardContent>
                  </Card>
                </div>

                {/* AI Insights Panel */}
                <div className="lg:col-span-1">
                  <AIInsightsPanel />
                </div>
              </div>
            ) : (
              <Card className="h-full">
                <CardContent className="p-0 h-full">
                  <EnhancedRetailBot />
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="insights" className="h-[calc(100%-40px)] m-0">
            <Card className="h-full">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  AI-Generated Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-center py-8">
                  <p className="text-xs text-muted-foreground">
                    Enhanced AI Insights view coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics" className="h-[calc(100%-40px)] m-0">
            <Card className="h-full">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  AI-Powered Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-center py-8">
                  <p className="text-xs text-muted-foreground">
                    Enhanced Analytics view coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RetailBotInsights;