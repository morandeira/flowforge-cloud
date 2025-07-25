import React from 'react';
import { NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { CheckSquare, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function TaskNode({ data, selected }: NodeProps) {
  const timeout = (data as any).config?.timeout;
  const retries = (data as any).config?.retries;

  return (
    <BaseNode
      data={data}
      selected={selected}
      icon={CheckSquare}
      color="hsl(var(--primary))"
    >
      <div className="text-xs text-muted-foreground space-y-1">
        {timeout && (
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{timeout}s timeout</span>
          </div>
        )}
        {retries && retries > 0 && (
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>{retries} retries</span>
          </div>
        )}
      </div>
      {(data as any).status && (
        <Badge 
          variant="secondary" 
          className="absolute -top-2 -right-2 text-xs"
        >
          {(data as any).status}
        </Badge>
      )}
    </BaseNode>
  );
}