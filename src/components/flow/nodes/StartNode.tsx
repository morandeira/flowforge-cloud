import React from 'react';
import { NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { Play } from 'lucide-react';

export function StartNode({ data, selected }: NodeProps) {
  return (
    <BaseNode
      data={data}
      selected={selected}
      icon={Play}
      color="hsl(var(--success))"
      showTargetHandle={false}
      className="bg-success/10 border-success"
    >
      <div className="text-xs text-muted-foreground">
        Flow entry point
      </div>
    </BaseNode>
  );
}