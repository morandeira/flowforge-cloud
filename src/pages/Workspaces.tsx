import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus,
  Workflow,
  Users,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useAppStore } from '@/stores/appStore';

export default function Workspaces() {
  const navigate = useNavigate();
  const { workspaces } = useWorkspaceStore();
  const { setCurrentWorkspace } = useAppStore();

  const handleWorkspaceClick = (workspace: any) => {
    setCurrentWorkspace(workspace);
    navigate(`/workspace/${workspace.id}`);
  };

  const handleCreateWorkspace = () => {
    // TODO: Implement create workspace functionality
    console.log('Create workspace clicked');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Workspaces</h1>
          <p className="text-muted-foreground mt-1">
            Manage and organize your collaborative workspaces
          </p>
        </div>
        <Button onClick={handleCreateWorkspace} className="bg-gradient-primary hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Create Workspace
        </Button>
      </div>

      {/* Workspaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaces.map((workspace) => (
          <Card 
            key={workspace.id} 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleWorkspaceClick(workspace)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: workspace.color }}
                  />
                  <div>
                    <CardTitle className="text-lg">{workspace.name}</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {workspace.description}
                    </CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Workflow className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    {workspace.flowCount} flows
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {workspace.members.length} members
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>Updated {new Date(workspace.updatedAt).toLocaleDateString()}</span>
              </div>

              <div className="flex flex-wrap gap-1">
                {workspace.members.slice(0, 3).map((member, index) => (
                  <Badge key={member.userId} variant="outline" className="text-xs">
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
        {/* <Card 
          className="border-dashed hover:bg-muted/50 cursor-pointer transition-colors"
          onClick={handleCreateWorkspace}
        >
          <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px] space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="font-medium text-foreground">Create New Workspace</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Start a new collaborative workspace
              </p>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
}