import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { NavLink, useLocation } from "react-router-dom";
import { Home, ChevronRight } from "lucide-react";

const routeLabels: Record<string, string> = {
  "/overview": "Overview",
  "/transaction-trends": "Transaction Trends",
  "/product-mix": "Product Mix & SKU Info",
  "/consumer-behavior": "Consumer Behavior & Preference Signals",
  "/consumer-profiling": "Consumer Profiling",
  "/retailbot": "RetailBot & AI Insights",
  "/ai-chat": "AI Chat Assistant",
};

export default function BreadcrumbNav() {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Handle drill-down paths with query parameters
  const pathParts = currentPath.split('/').filter(Boolean);
  const queryParams = location.search;
  
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <NavLink to="/overview" className="flex items-center gap-1">
              <Home className="h-3 w-3" />
              <span>Dashboard</span>
            </NavLink>
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        {pathParts.length > 0 && (
          <>
            <BreadcrumbSeparator>
              <ChevronRight className="h-3 w-3" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>{routeLabels[`/${pathParts[0]}`] || pathParts[0]}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
        
        {pathParts.length > 1 && (
          <>
            <BreadcrumbSeparator>
              <ChevronRight className="h-3 w-3" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>{pathParts[1].charAt(0).toUpperCase() + pathParts[1].slice(1).replace(/-/g, ' ')}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
        
        {queryParams && queryParams.includes('detail=') && (
          <>
            <BreadcrumbSeparator>
              <ChevronRight className="h-3 w-3" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>
                {new URLSearchParams(queryParams).get('detail')?.replace(/-/g, ' ')}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}