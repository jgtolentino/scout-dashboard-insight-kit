
import { NavLink, useLocation } from "react-router-dom";
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  Users, 
  Brain,
  Home
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { path: "/overview", label: "Overview", icon: Home, description: "Executive summary and key insights" },
  { path: "/transaction-trends", label: "Transaction Trends", icon: TrendingUp, description: "Track transaction patterns and trends" },
  { path: "/product-mix", label: "Product Mix & SKU Info", icon: Package, description: "Product analytics and SKU insights" },
  { path: "/consumer-behavior", label: "Consumer Behavior & Preference Signals", icon: Brain, description: "Behavioral analysis and preferences" },
  { path: "/consumer-profiling", label: "Consumer Profiling", icon: Users, description: "Customer demographics and profiling" },
];

const AppSidebar = () => {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white">
            <BarChart3 className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Scout Analytics
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Analytics Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={active}
                      className="w-full"
                    >
                      <NavLink 
                        to={item.path} 
                        className={({ isActive }) => 
                          `flex items-center gap-3 px-3 py-2 transition-colors ${
                            isActive 
                              ? "bg-primary text-primary-foreground font-medium" 
                              : "hover:bg-accent hover:text-accent-foreground"
                          }`
                        }
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        {!isCollapsed && (
                          <div className="flex flex-col">
                            <span className="font-medium text-sm leading-tight">{item.label}</span>
                            <span className="text-xs text-muted-foreground">{item.description}</span>
                          </div>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
