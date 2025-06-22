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
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Filter className="h-3 w-3" />
              <span>{activeFilterCount} active filters</span>
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{filters.from && filters.to ? `${filters.from} to ${filters.to}` : 'All dates'}</span>
            </Badge>
          </div>
          <BreadcrumbNav />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
        <Tabs defaultValue="retailbot" className="h-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="retailbot" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                RetailBot
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI Insights
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <TabsList>
                <TabsTrigger 
                  value="split" 
                  onClick={() => setActiveView('split')}
                  data-state={activeView === 'split' ? 'active' : 'inactive'}
                >
                  Split View
                </TabsTrigger>
                <TabsTrigger 
                  value="full" 
                  onClick={() => setActiveView('full')}
                  data-state={activeView === 'full' ? 'active' : 'inactive'}
                >
                  Full View
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
          
          <TabsContent value="retailbot" className="h-[calc(100%-44px)] m-0">
            {activeView === 'split' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
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
          
          <TabsContent value="insights" className="h-[calc(100%-44px)] m-0">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  AI-Generated Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Enhanced AI Insights view coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics" className="h-[calc(100%-44px)] m-0">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  AI-Powered Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
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