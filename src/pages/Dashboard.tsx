import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Workflow, 
  Users, 
  Activity, 
  Plus,
  TrendingUp,
  Clock,
  CheckCircle2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

import { useSessionStore } from '@/stores/sessionStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useAppStore } from '@/stores/appStore';

const statsData = [
  {
    title: "Active Flows",
    value: "12",
    change: "+2 from last week",
    icon: Workflow,
    color: "text-primary",
  },
  {
    title: "Total Executions",
    value: "1,426",
    change: "+18% from last month",
    icon: Activity,
    color: "text-success",
  },
  {
    title: "Team Members",
    value: "8",
    change: "2 pending invites",
    icon: Users,
    color: "text-warning",
  },
  {
    title: "Success Rate",
    value: "98.2%",
    change: "+0.5% improvement",
    icon: TrendingUp,
    color: "text-success",
  },
];

const recentActivity = [
  {
    id: 1,
    type: "flow_executed",
    title: "Production Workflow completed",
    time: "2 minutes ago",
    status: "success",
  },
  {
    id: 2,
    type: "flow_created",
    title: "New QA validation flow created",
    time: "1 hour ago",
    status: "info",
  },
  {
    id: 3,
    type: "user_joined",
    title: "Sarah joined Production Workflows",
    time: "3 hours ago",
    status: "info",
  },
  {
    id: 4,
    type: "flow_failed",
    title: "Data processing flow failed",
    time: "4 hours ago",
    status: "error",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, tenant } = useSessionStore();
  const { workspaces } = useWorkspaceStore();
  const { setCurrentWorkspace } = useAppStore();

  const handleWorkspaceClick = (workspace: any) => {
    setCurrentWorkspace(workspace);
    navigate(`/workspace/${workspace.id}`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'error':
        return <Activity className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your flows today.
          </p>
        </div>
        <Button className="bg-gradient-primary hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Create Workspace
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workspaces */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="w-5 h-5" />
              Your Workspaces
            </CardTitle>
            <CardDescription>
              Manage and access your collaborative workspaces
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {workspaces.map((workspace) => (
              <div
                key={workspace.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleWorkspaceClick(workspace)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: workspace.color }}
                  />
                  <div>
                    <h3 className="font-medium text-foreground">{workspace.name}</h3>
                    <p className="text-sm text-muted-foreground">{workspace.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{workspace.flowCount} flows</Badge>
                  <Badge variant="outline">{workspace.members.length} members</Badge>
                </div>
              </div>
            ))}
            
            <Button 
              variant="outline" 
              className="w-full border-dashed hover:bg-primary/5"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Workspace
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                {getStatusIcon(activity.status)}
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-foreground">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}