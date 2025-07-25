import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus,
  Settings,
  File,
  Play,
  Save,
  Share,
  ArrowLeft,
  Layers,
  Zap
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

import { FlowEditor } from '@/components/flow/FlowEditor';
import { NodeParamsPanel } from '@/components/panels/NodeParamsPanel';
import { FileExplorerPanel } from '@/components/panels/FileExplorerPanel';

import { useAppStore } from '@/stores/appStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useFlowStore } from '@/stores/flowStore';
import { NodeType } from '@/types';

const nodeTypes: { type: NodeType; label: string; icon: React.ComponentType<any> }[] = [
  { type: 'start', label: 'Start', icon: Play },
  { type: 'end', label: 'End', icon: Zap },
  { type: 'task', label: 'Task', icon: Layers },
  { type: 'decision', label: 'Decision', icon: Settings },
  { type: 'api', label: 'API Call', icon: Settings },
];

export default function WorkspaceFlow() {
  const { workspaceId, flowId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { 
    currentWorkspace, 
    currentFlow, 
    selectedNodeId, 
    panelMode, 
    setPanelMode,
    setCurrentFlow 
  } = useAppStore();
  
  const { getFlow } = useWorkspaceStore();
  const { setNodes, setEdges, createNewNode, addNode, clearFlow } = useFlowStore();

  useEffect(() => {
    if (workspaceId && flowId) {
      const flow = getFlow(workspaceId, flowId);
      if (flow) {
        setCurrentFlow(flow);
        setNodes(flow.nodes);
        setEdges(flow.edges);
      }
    }

    return () => {
      clearFlow();
    };
  }, [workspaceId, flowId, getFlow, setCurrentFlow, setNodes, setEdges, clearFlow]);

  const handleAddNode = (type: NodeType) => {
    const newNode = createNewNode(type, {
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100,
    });
    addNode(newNode);
    
    toast({
      title: "Node added",
      description: `${type} node has been added to the flow.`,
    });
  };

  const handleSaveFlow = () => {
    toast({
      title: "Flow saved",
      description: "Your flow has been saved successfully.",
    });
  };

  const handleRunFlow = () => {
    toast({
      title: "Flow execution started",
      description: "Your flow is now running...",
    });
  };

  if (!currentWorkspace || !currentFlow) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Flow not found</p>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Top Toolbar */}
      <div className="h-14 bg-card border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/workspace/${workspaceId}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: currentWorkspace.color }}
            />
            <span className="text-sm text-muted-foreground">{currentWorkspace.name}</span>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium">{currentFlow.name}</span>
            <Badge variant="secondary" className="ml-2">
              {currentFlow.status}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Add Node Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Node
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {nodeTypes.map(({ type, label, icon: Icon }) => (
                <DropdownMenuItem
                  key={type}
                  onClick={() => handleAddNode(type)}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-6" />

          {/* Panel Mode Buttons */}
          <Button
            variant={panelMode === 'params' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setPanelMode(panelMode === 'params' ? null : 'params')}
            disabled={!selectedNodeId}
          >
            <Settings className="w-4 h-4 mr-2" />
            Params
          </Button>
          
          <Button
            variant={panelMode === 'files' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setPanelMode(panelMode === 'files' ? null : 'files')}
            disabled={!selectedNodeId}
          >
            <File className="w-4 h-4 mr-2" />
            Files
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Action Buttons */}
          <Button variant="outline" size="sm" onClick={handleSaveFlow}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          
          <Button size="sm" onClick={handleRunFlow} className="bg-gradient-primary hover:opacity-90">
            <Play className="w-4 h-4 mr-2" />
            Run Flow
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Flow Editor */}
        <div className="flex-1">
          <FlowEditor />
        </div>

        {/* Side Panel */}
        {panelMode === 'params' && (
          <NodeParamsPanel onClose={() => setPanelMode(null)} />
        )}
        {panelMode === 'files' && (
          <FileExplorerPanel onClose={() => setPanelMode(null)} />
        )}
      </div>
    </div>
  );
}