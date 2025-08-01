import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Workflow,
  Plus,
  Settings,
  Users,
  FolderOpen,
  BarChart3,
  LogOut,
  Building2,
  Palette,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useSessionStore } from "@/stores/sessionStore";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useAppStore } from "@/stores/appStore";

const mainNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
  { title: "Workspaces", url: "/workspaces", icon: FolderOpen },
  { title: "Team", url: "/team", icon: Users },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user, tenant, signOut } = useSessionStore();
  const { workspaces } = useWorkspaceStore();
  const { currentWorkspace, setCurrentWorkspace } = useAppStore();
  
  const collapsed = state === "collapsed";
  
  const currentPath = location.pathname;
  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path);
  
  const getNavClassName = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
      : "hover:bg-sidebar-accent/50 text-sidebar-foreground";

  const handleWorkspaceSelect = (workspace: any) => {
    setCurrentWorkspace(workspace);
  };

  const handleSignOut = () => {
    signOut();
    window.location.href = '/login';
  };

  return (
    <Sidebar
      className={collapsed ? "w-14" : "w-64"}
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-3 py-2">
          {!collapsed && (
            <>
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Workflow className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sidebar-foreground truncate">
                  {tenant?.name || "FlowCraft"}
                </div>
                <div className="text-xs text-sidebar-foreground/60 truncate">
                  {tenant?.subdomain || "demo"}.flowcraft.com
                </div>
              </div>
            </>
          )}
          {collapsed && (
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto">
              <Workflow className="w-5 h-5 text-white" />
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClassName}>
                      <item.icon className="w-4 h-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && workspaces.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/60 flex items-center justify-between">
              Workspaces
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-sidebar-foreground/60 hover:text-sidebar-foreground"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {workspaces.map((workspace) => (
                  <SidebarMenuItem key={workspace.id}>
                    <SidebarMenuButton
                      onClick={() => handleWorkspaceSelect(workspace)}
                      className={
                        currentWorkspace?.id === workspace.id
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "hover:bg-sidebar-accent/50"
                      }
                    >
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: workspace.color }}
                      />
                      <span className="truncate">{workspace.name}</span>
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {workspace.flowCount}
                      </Badge>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {!collapsed && user && (
          <div className="px-3 py-2">
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sidebar-foreground text-sm truncate">
                  {user.name}
                </div>
                <div className="text-xs text-sidebar-foreground/60 truncate">
                  {user.email}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="h-8 w-8 p-0 text-sidebar-foreground/60 hover:text-sidebar-foreground"
              >
                <LogOut className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="h-8 w-8 p-0 mx-auto text-sidebar-foreground/60 hover:text-sidebar-foreground"
            >
              <LogOut className="w-3 h-3" />
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}