import React from 'react';
import { NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { Globe, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function ApiNode({ data, selected }: NodeProps) {
  const method = (data as any).config?.method || 'GET';
  const timeout = (data as any).config?.timeout || 30;

  const methodColors = {
    GET: 'bg-blue-500',
    POST: 'bg-green-500',
    PUT: 'bg-yellow-500',
    DELETE: 'bg-red-500',
    PATCH: 'bg-purple-500',
  };

  return (
    <BaseNode
      data={data}
      selected={selected}
      icon={Globe}
      color="hsl(var(--accent-foreground))"
    >
      <div className="flex items-center gap-2 mt-1">
        <Badge 
          className={`text-white text-xs ${methodColors[method as keyof typeof methodColors] || 'bg-gray-500'}`}
        >
          {method}
        </Badge>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{timeout}s</span>
        </div>
      </div>
    </BaseNode>
  );
}