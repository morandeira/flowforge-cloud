import React from 'react';
import { NodeProps, Handle, Position } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { GitBranch } from 'lucide-react';

export function DecisionNode({ data, selected }: NodeProps) {
  const conditions = (data as any).config?.conditions || [];

  return (
    <div
      className={cn(
        'relative bg-node-background border-2 border-warning rounded-lg shadow-md transition-all duration-200',
        'bg-warning/10',
        selected && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
        'min-w-[180px] min-h-[80px] p-3'
      )}
      style={{
        clipPath: 'polygon(15% 0%, 85% 0%, 100% 50%, 85% 100%, 15% 100%, 0% 50%)',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-background border-2 border-warning"
      />

      <div className="flex flex-col items-center text-center">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded bg-warning flex items-center justify-center text-warning-foreground">
            <GitBranch className="w-4 h-4" />
          </div>
          <div className="font-medium text-foreground text-sm">
            {(data as any).label}
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          {conditions.length} condition{conditions.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Multiple output handles for different conditions */}
      <Handle
        type="source"
        position={Position.Right}
        id="true"
        className="w-3 h-3 bg-success border-2 border-success"
        style={{ top: '30%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        className="w-3 h-3 bg-destructive border-2 border-destructive"
        style={{ top: '70%' }}
      />
    </div>
  );
}