import React from 'react';
import { NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { Square } from 'lucide-react';

export function EndNode({ data, selected }: NodeProps) {
  return (
    <BaseNode
      data={data}
      selected={selected}
      icon={Square}
      color="hsl(var(--destructive))"
      showSourceHandle={false}
      className="bg-destructive/10 border-destructive"
    >
      <div className="text-xs text-muted-foreground">
        Flow termination
      </div>
    </BaseNode>
  );
}