import { NavLink, useLocation } from "react-router-dom";
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  Users, 
  Brain,
  Home,
  MessageSquare
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
  { path: "/overview", label: "Overview", icon: Home, description: "Executive summary" },
  { path: "/transaction-trends", label: "Trends", icon: TrendingUp, description: "Transaction patterns" },
  { path: "/product-mix", label: "Products", icon: Package, description: "Category analytics" },
  { path: "/consumer-behavior", label: "Behavior", icon: Brain, description: "Customer signals" },
  { path: "/consumer-profiling", label: "Profiling", icon: Users, description: "Demographics" },
  { path: "/retailbot", label: "RetailBot", icon: Brain, description: "AI assistant" }
];

const AppSidebar = () => {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className="border-r" collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white flex-shrink-0">
            <BarChart3 className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <span className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent truncate block">
                Scout
              </span>
              <span className="text-xs text-muted-foreground">Analytics Dashboard</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider">Navigation</SidebarGroupLabel>
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
                      tooltip={isCollapsed ? item.label : undefined}
                    >
                      <NavLink 
                        to={item.path} 
                        className="flex items-center gap-3 px-3 py-2 transition-colors"
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        {!isCollapsed && (
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium text-sm leading-tight truncate">{item.label}</span>
                            <span className="text-xs text-muted-foreground truncate">{item.description}</span>
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