import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useState } from "react";
import AppSidebar from "./components/AppSidebar";
import Overview from "./pages/Overview";
import TransactionTrends from "./pages/TransactionTrends";
import ProductMix from "./pages/ProductMix";
import ProductSubstitution from "./pages/ProductSubstitution";
import ConsumerBehavior from "./pages/ConsumerBehavior";
import ConsumerProfiling from "./pages/ConsumerProfiling";
import RetailBotInsights from "./pages/RetailBotInsights";
import AIChat from "./pages/AIChat";
import NotFound from "./pages/NotFound";
import HeatMapOverlay from "./components/heatmap/HeatMapOverlay";
import OperationsMonitor from "./components/monitor/OperationsMonitor";

const queryClient = new QueryClient();

const App = () => {
  const [heatMapVisible, setHeatMapVisible] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider defaultOpen={true}>
            <div className="min-h-screen flex w-full flex-col">
              <OperationsMonitor />
              <div className="flex flex-1">
                <AppSidebar />
                <SidebarInset className="flex-1">
                  <Routes>
                    <Route path="/" element={<Navigate to="/overview" replace />} />
                    <Route path="/overview" element={<Overview setHeatMapVisible={setHeatMapVisible} />} />
                    <Route path="/transaction-trends" element={<TransactionTrends />} />
                    <Route path="/product-mix" element={<ProductMix />} />
                    <Route path="/product-substitution" element={<ProductSubstitution />} />
                    <Route path="/consumer-behavior" element={<ConsumerBehavior />} />
                    <Route path="/consumer-profiling" element={<ConsumerProfiling />} />
                    <Route path="/retailbot" element={<RetailBotInsights />} />
                    <Route path="/ai-chat" element={<AIChat />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </SidebarInset>
              </div>
              <HeatMapOverlay visible={heatMapVisible} onVisibilityChange={setHeatMapVisible} />
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;