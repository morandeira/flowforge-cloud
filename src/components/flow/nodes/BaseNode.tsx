import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface BaseNodeProps {
  data: any;
  selected?: boolean;
  icon?: LucideIcon;
  color?: string;
  children?: React.ReactNode;
  showTargetHandle?: boolean;
  showSourceHandle?: boolean;
  className?: string;
}

const statusColors = {
  pending: 'border-muted-foreground/30 bg-muted/30',
  running: 'border-primary bg-primary/10 shadow-glow',
  completed: 'border-success bg-success/10',
  error: 'border-destructive bg-destructive/10',
};

export function BaseNode({
  data,
  selected,
  icon: Icon,
  color = 'hsl(var(--primary))',
  children,
  showTargetHandle = true,
  showSourceHandle = true,
  className,
}: BaseNodeProps) {
  const status = data.status || 'pending';

  return (
    <div
      className={cn(
        'relative bg-node-background border-2 border-node-border rounded-lg shadow-md transition-all duration-200',
        statusColors[status],
        selected && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
        'min-w-[160px] min-h-[60px] p-3',
        className
      )}
    >
      {showTargetHandle && (
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 bg-background border-2 border-primary"
        />
      )}

      <div className="flex items-center gap-2 mb-1">
        {Icon && (
          <div 
            className="w-6 h-6 rounded flex items-center justify-center text-white text-sm"
            style={{ backgroundColor: color }}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}
        <div className="font-medium text-foreground text-sm leading-tight">
          {data.label}
        </div>
      </div>

      {children}

      {showSourceHandle && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3 bg-background border-2 border-primary"
        />
      )}
    </div>
  );
}