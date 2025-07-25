import React from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  EdgeProps,
  useReactFlow,
} from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {},
  markerEnd,
}: EdgeProps) {
  const { setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = () => {
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{
          ...style,
          strokeWidth: 2,
          stroke: 'hsl(var(--edge-default))',
        }} 
      />
      <EdgeLabelRenderer>
        <div
          className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
        >
          {(data as any)?.label && (
            <div className="bg-card border border-border rounded px-2 py-1 text-xs font-medium text-foreground shadow-sm mb-1">
              {(data as any).label}
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onEdgeClick}
            className="h-6 w-6 p-0 rounded-full bg-background border-border hover:bg-destructive hover:text-destructive-foreground hover:border-destructive opacity-60 hover:opacity-100"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}