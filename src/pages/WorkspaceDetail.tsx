import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus,
  Workflow,
  ArrowLeft,
  Play,
  Calendar,
  User,
  MoreHorizontal,
  Edit
} from 'lucide-react';

import { CreateFlowModal } from '@/components/modals/CreateFlowModal';
import { EditWorkspaceModal } from '@/components/modals/EditWorkspaceModal';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { useAppStore } from '@/stores/appStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { Flow } from '@/types';

// Mock flows data
const mockFlows: Flow[] = [
  {
    id: 'flow_1',
    workspaceId: 'ws_1',
    name: 'Customer Onboarding',
    description: 'Automated customer registration and verification process',
    version: '1.2.0',
    status: 'published',
    nodes: [],
    edges: [],
    metadata: {
      tags: ['customer', 'onboarding', 'verification'],
      category: 'Business Process',
      author: 'John Doe',
      lastModifiedBy: 'Jane Smith',
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'flow_2',
    workspaceId: 'ws_1',
    name: 'Data Processing Pipeline',
    description: 'ETL pipeline for processing customer data',
    version: '2.1.0',
    status: 'published',
    nodes: [],
    edges: [],
    metadata: {
      tags: ['data', 'etl', 'processing'],
      category: 'Data Pipeline',
      author: 'Jane Smith',
      lastModifiedBy: 'John Doe',
    },
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z',
  },
  {
    id: 'flow_3',
    workspaceId: 'ws_1',
    name: 'Quality Check Workflow',
    description: 'Automated quality assurance and testing workflow',
    version: '1.0.0',
    status: 'draft',
    nodes: [],
    edges: [],
    metadata: {
      tags: ['quality', 'testing', 'automation'],
      category: 'QA Process',
      author: 'Bob Wilson',
      lastModifiedBy: 'Bob Wilson',
    },
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-22T00:00:00Z',
  },
];

export default function WorkspaceDetail() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { currentWorkspace } = useAppStore();
  const { workspaces, getWorkspaceFlows } = useWorkspaceStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateFlowModalOpen, setIsCreateFlowModalOpen] = useState(false);

  const workspace = currentWorkspace || workspaces.find(ws => ws.id === workspaceId);
  const flows = workspaceId ? getWorkspaceFlows(workspaceId) : [];
  
  // Fallback to mock flows if no flows in store
  const displayFlows = flows.length > 0 ? flows : mockFlows.filter(flow => flow.workspaceId === workspaceId);

  const handleFlowClick = (flow: Flow) => {
    navigate(`/workspace/${workspaceId}/flow/${flow.id}`);
  };

  const handleFlowCreated = (flow: Flow) => {
    // Optionally navigate to the new flow
    navigate(`/workspace/${workspaceId}/flow/${flow.id}`);
  };

  const handleEditFlow = (flow: Flow) => {
    // Navigate to edit the flow
    navigate(`/workspace/${workspaceId}/flow/${flow.id}`);
  };

  const handleDuplicateFlow = (flow: Flow) => {
    // Create a copy of the flow with a new ID and name
    const duplicatedFlow = {
      ...flow,
      id: `flow_${Date.now()}`,
      name: `${flow.name} (Copy)`,
      status: 'draft' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // In a real app, this would call the store or API
    console.log('Duplicating flow:', duplicatedFlow);
  };

  const handleDeleteFlow = (flow: Flow) => {
    // In a real app, this would show a confirmation dialog and then delete
    console.log('Deleting flow:', flow.id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-success/10 text-success border-success/20';
      case 'draft':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'archived':
        return 'bg-muted/10 text-muted-foreground border-muted/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  if (!workspace) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Workspace not found</p>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: workspace.color }}
            />
            <div>
              <h1 className="text-2xl font-bold text-foreground">{workspace.name}</h1>
              <p className="text-muted-foreground">{workspace.description}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            onClick={() => setIsEditModalOpen(true)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Workspace
          </Button>
        </div>
      </div>

      {/* Workspace Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Workflow className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Total Flows</span>
            </div>
            <div className="text-2xl font-bold mt-1">{displayFlows.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 text-success" />
              <span className="text-sm text-muted-foreground">Published</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {displayFlows.filter(f => f.status === 'published').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Edit className="w-4 h-4 text-warning" />
              <span className="text-sm text-muted-foreground">Draft</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {displayFlows.filter(f => f.status === 'draft').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Members</span>
            </div>
            <div className="text-2xl font-bold mt-1">{workspace.members.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Team Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {workspace.members.map((member, index) => (
              <div key={member.userId} className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {`M${index + 1}`}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">Member {index + 1}</p>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Invite Member
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Flows Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Flows</h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsCreateFlowModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Flow
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayFlows.map((flow) => (
            <Card 
              key={flow.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleFlowClick(flow)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Workflow className="w-5 h-5 text-primary" />
                    <CardTitle className="text-base">{flow.name}</CardTitle>
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
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        handleEditFlow(flow);
                      }}>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateFlow(flow);
                      }}>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFlow(flow);
                        }}
                      >Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription className="text-sm">
                  {flow.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={getStatusColor(flow.status)} variant="outline">
                    {flow.status}
                  </Badge>
                  <Badge variant="secondary">v{flow.version}</Badge>
                  <Badge variant="outline">{flow.metadata.category}</Badge>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Updated {new Date(flow.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{flow.metadata.lastModifiedBy}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {flow.metadata.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {flow.metadata.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{flow.metadata.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {workspace && (
        <EditWorkspaceModal 
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          workspace={workspace}
        />
      )}
      
      {workspaceId && (
        <CreateFlowModal 
          open={isCreateFlowModalOpen}
          onOpenChange={setIsCreateFlowModalOpen}
          workspaceId={workspaceId}
          onFlowCreated={handleFlowCreated}
        />
      )}
    </div>
  );
}