
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { NavLink, useLocation } from "react-router-dom";
import { Home } from "lucide-react";

const routeLabels: Record<string, string> = {
  "/overview": "Overview",
  "/transaction-trends": "Transaction Trends",
  "/product-mix": "Product Mix & SKU Info",
  "/consumer-behavior": "Consumer Behavior & Preference Signals",
  "/consumer-profiling": "Consumer Profiling",
};

export default function BreadcrumbNav() {
  const location = useLocation();
  const currentPath = location.pathname;
  
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <NavLink to="/overview" className="flex items-center gap-1">
              <Home className="h-3 w-3" />
              Dashboard
            </NavLink>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {currentPath !== "/overview" && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{routeLabels[currentPath] || "Page"}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
