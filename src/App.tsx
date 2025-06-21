
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "./components/AppSidebar";
import Overview from "./pages/Overview";
import Index from "./pages/Index";
import ProductMix from "./pages/ProductMix";
import ConsumerBehavior from "./pages/ConsumerBehavior";
import ConsumerProfiling from "./pages/ConsumerProfiling";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            <SidebarInset>
              <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="/transaction-trends" element={<Index />} />
                <Route path="/product-mix" element={<ProductMix />} />
                <Route path="/consumer-behavior" element={<ConsumerBehavior />} />
                <Route path="/consumer-profiling" element={<ConsumerProfiling />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
