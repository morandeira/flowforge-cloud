import React, { useCallback, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeTypes,
  EdgeTypes,
  NodeChange,
  EdgeChange,
  OnConnect,
  OnNodesChange,
  OnEdgesChange,
  SelectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useFlowStore } from '@/stores/flowStore';
import { useAppStore } from '@/stores/appStore';
import { FlowNode as CustomFlowNode, FlowEdge, NodeType } from '@/types';

// Custom node components
import { TaskNode } from './nodes/TaskNode';
import { StartNode } from './nodes/StartNode';
import { EndNode } from './nodes/EndNode';
import { DecisionNode } from './nodes/DecisionNode';
import { ApiNode } from './nodes/ApiNode';

// Custom edge components
import { CustomEdge } from './edges/CustomEdge';

const nodeTypes: NodeTypes = {
  start: StartNode,
  end: EndNode,
  task: TaskNode,
  decision: DecisionNode,
  api: ApiNode,
  condition: TaskNode,
  parallel: TaskNode,
  merge: TaskNode,
  transform: TaskNode,
  notification: TaskNode,
};

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

interface FlowEditorProps {
  className?: string;
}

export function FlowEditor({ className = '' }: FlowEditorProps) {
  const {
    nodes: storeNodes,
    edges: storeEdges,
    setNodes: setStoreNodes,
    setEdges: setStoreEdges,
    addNode,
    updateNode,
    deleteNode,
    addEdge: addStoreEdge,
    updateEdge,
    deleteEdge,
    createNewNode,
  } = useFlowStore();

  const { setSelectedNode, selectedNodeId } = useAppStore();

  // Convert store data to React Flow format
  const reactFlowNodes: Node[] = useMemo(() => 
    storeNodes.map(node => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: node.data,
      selected: node.id === selectedNodeId,
      width: node.width,
      height: node.height,
    })),
    [storeNodes, selectedNodeId]
  );

  const reactFlowEdges: Edge[] = useMemo(() =>
    storeEdges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type || 'custom',
      data: edge.data,
      style: { stroke: 'hsl(var(--edge-default))' },
    })),
    [storeEdges]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(reactFlowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(reactFlowEdges);

  // Sync with store when store changes
  useEffect(() => {
    setNodes(reactFlowNodes);
  }, [storeNodes, selectedNodeId, setNodes]);

  useEffect(() => {
    setEdges(reactFlowEdges);
  }, [storeEdges, setEdges]);

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        const newEdge: FlowEdge = {
          id: `edge_${Date.now()}`,
          source: connection.source,
          target: connection.target,
          type: 'custom',
        };
        addStoreEdge(newEdge);
      }
    },
    [addStoreEdge]
  );

  const handleNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);
      
      // Update store for position changes and deletions
      changes.forEach(change => {
        if (change.type === 'position' && change.position && change.dragging === false) {
          updateNode(change.id, { position: change.position });
        } else if (change.type === 'remove') {
          deleteNode(change.id);
        } else if (change.type === 'select') {
          if (change.selected) {
            setSelectedNode(change.id);
          }
        }
      });
    },
    [onNodesChange, updateNode, deleteNode, setSelectedNode]
  );

  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChange(changes);
      
      // Update store for deletions
      changes.forEach(change => {
        if (change.type === 'remove') {
          deleteEdge(change.id);
        }
      });
    },
    [onEdgesChange, deleteEdge]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNode(node.id);
    },
    [setSelectedNode]
  );

  const onNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNode(node.id);
    },
    [setSelectedNode]
  );

  return (
    <div className={`w-full h-full bg-canvas ${className}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onPaneClick={onPaneClick}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        snapToGrid
        snapGrid={[15, 15]}
        fitView
        fitViewOptions={{
          padding: 0.2,
        }}
        selectionMode={SelectionMode.Partial}
        multiSelectionKeyCode="Shift"
        deleteKeyCode="Delete"
        style={{
          backgroundColor: 'hsl(var(--canvas))',
        }}
      >
        <Background 
          color="hsl(var(--canvas-grid))" 
          gap={20} 
          size={1}
        />
        <Controls 
          className="bg-card border border-border rounded-lg shadow-md"
          showZoom
          showFitView
          showInteractive
        />
        <MiniMap 
          className="bg-card border border-border rounded-lg shadow-md"
          maskColor="hsl(var(--muted) / 0.3)"
          nodeColor="hsl(var(--primary))"
        />
      </ReactFlow>
    </div>
  );
}