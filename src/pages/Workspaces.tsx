import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Users, 
  Workflow, 
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Settings
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useAppStore } from '@/stores/appStore';
import { CreateWorkspaceModal } from '@/components/modals/CreateWorkspaceModal';

export default function Workspaces() {
  const navigate = useNavigate();
  const { workspaces } = useWorkspaceStore();
  const { setCurrentWorkspace } = useAppStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleWorkspaceClick = (workspace: any) => {
    setCurrentWorkspace(workspace);
    navigate(`/workspace/${workspace.id}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Workspaces</h1>
          <p className="text-muted-foreground mt-1">
            Manage your collaborative workspaces and team projects.
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-gradient-primary hover:opacity-90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Workspace
        </Button>
      </div>

      {/* Workspaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaces.map((workspace) => (
          <Card 
            key={workspace.id} 
            className="hover:shadow-md transition-shadow cursor-pointer group"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: workspace.color }}
                  />
                  <div className="flex-1">
                    <CardTitle 
                      className="text-lg font-semibold text-foreground hover:text-primary transition-colors"
                      onClick={() => handleWorkspaceClick(workspace)}
                    >
                      {workspace.name}
                    </CardTitle>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription className="text-sm text-muted-foreground">
                {workspace.description || 'No description provided'}
              </CardDescription>
            </CardHeader>
            <CardContent 
              className="space-y-4"
              onClick={() => handleWorkspaceClick(workspace)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Workflow className="w-4 h-4" />
                    <span>{workspace.flowCount} flows</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{workspace.members.length} members</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>Created {formatDate(workspace.createdAt)}</span>
              </div>
              <div className="flex gap-2">
                {workspace.members.slice(0, 3).map((member, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {member.role}
                  </Badge>
                ))}
                {workspace.members.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{workspace.members.length - 3} more
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Create New Workspace Card */}
        <Card 
          className="border-dashed border-2 hover:border-primary/50 cursor-pointer transition-colors group"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px] text-center space-y-3">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-muted-foreground/50 flex items-center justify-center group-hover:border-primary/50 transition-colors">
              <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div>
              <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                Create New Workspace
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Start a new collaborative project
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <CreateWorkspaceModal 
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </div>
  );
}