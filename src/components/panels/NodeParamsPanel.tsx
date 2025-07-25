import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Save, Trash2, Settings } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

import { useFlowStore } from '@/stores/flowStore';
import { useAppStore } from '@/stores/appStore';
import { FlowNode, NodeType } from '@/types';

const nodeConfigSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  timeout: z.number().min(1).max(3600).optional(),
  retries: z.number().min(0).max(10).optional(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).optional(),
  autoStart: z.boolean().optional(),
  finalizeData: z.boolean().optional(),
});

type NodeConfigForm = z.infer<typeof nodeConfigSchema>;

interface NodeParamsPanelProps {
  onClose: () => void;
}

export function NodeParamsPanel({ onClose }: NodeParamsPanelProps) {
  const { toast } = useToast();
  const { nodes, updateNode, deleteNode } = useFlowStore();
  const { selectedNodeId, setSelectedNode } = useAppStore();

  const currentNode = nodes.find(node => node.id === selectedNodeId);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<NodeConfigForm>({
    resolver: zodResolver(nodeConfigSchema),
    defaultValues: {
      label: currentNode?.data.label || '',
      timeout: currentNode?.data.config?.timeout || 300,
      retries: currentNode?.data.config?.retries || 3,
      method: currentNode?.data.config?.method || 'GET',
      autoStart: currentNode?.data.config?.autoStart || false,
      finalizeData: currentNode?.data.config?.finalizeData || false,
    },
  });

  if (!currentNode) {
    return (
      <div className="w-80 h-full bg-card border-l border-border flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Settings className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Select a node to edit its parameters</p>
        </div>
      </div>
    );
  }

  const onSubmit = (data: NodeConfigForm) => {
    updateNode(currentNode.id, {
      data: {
        ...currentNode.data,
        label: data.label,
        config: {
          ...currentNode.data.config,
          ...data,
        },
      },
    });

    toast({
      title: "Node updated",
      description: "Node parameters have been saved successfully.",
    });
  };

  const handleDelete = () => {
    deleteNode(currentNode.id);
    setSelectedNode(null);
    onClose();
    
    toast({
      title: "Node deleted",
      description: "The node has been removed from the flow.",
      variant: "destructive",
    });
  };

  const renderTypeSpecificFields = () => {
    switch (currentNode.type) {
      case 'api':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="method">HTTP Method</Label>
              <Select value={watch('method')} onValueChange={(value) => setValue('method', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="timeout">Timeout (seconds)</Label>
              <Input
                id="timeout"
                type="number"
                {...register('timeout', { valueAsNumber: true })}
              />
              {errors.timeout && (
                <p className="text-sm text-destructive mt-1">{errors.timeout.message}</p>
              )}
            </div>
          </div>
        );

      case 'task':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="timeout">Timeout (seconds)</Label>
              <Input
                id="timeout"
                type="number"
                {...register('timeout', { valueAsNumber: true })}
              />
              {errors.timeout && (
                <p className="text-sm text-destructive mt-1">{errors.timeout.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="retries">Retry Count</Label>
              <Input
                id="retries"
                type="number"
                {...register('retries', { valueAsNumber: true })}
              />
              {errors.retries && (
                <p className="text-sm text-destructive mt-1">{errors.retries.message}</p>
              )}
            </div>
          </div>
        );

      case 'start':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="autoStart"
                checked={watch('autoStart')}
                onCheckedChange={(checked) => setValue('autoStart', checked)}
              />
              <Label htmlFor="autoStart">Auto-start flow</Label>
            </div>
          </div>
        );

      case 'end':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="finalizeData"
                checked={watch('finalizeData')}
                onCheckedChange={(checked) => setValue('finalizeData', checked)}
              />
              <Label htmlFor="finalizeData">Finalize data on completion</Label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-80 h-full bg-card border-l border-border flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          <h2 className="font-semibold">Node Parameters</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              Node Information
              <Badge variant="secondary">{currentNode.type}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-xs text-muted-foreground">
              ID: {currentNode.id}
            </div>
            <div className="text-xs text-muted-foreground">
              Position: ({Math.round(currentNode.position.x)}, {Math.round(currentNode.position.y)})
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Basic Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  {...register('label')}
                  placeholder="Enter node label"
                />
                {errors.label && (
                  <p className="text-sm text-destructive mt-1">{errors.label.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {renderTypeSpecificFields() && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Type-specific Settings</CardTitle>
              </CardHeader>
              <CardContent>
                {renderTypeSpecificFields()}
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
            <Button type="button" variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}