import { create } from 'zustand';
import { FlowNode, FlowEdge, NodeType } from '@/types';

interface FlowStore {
  nodes: Array<FlowNode>;
  edges: Array<FlowEdge>;
  selectedNodes: Array<string>;
  isLoading: boolean;
  
  // Actions
  setNodes: (nodes: Array<FlowNode>) => void;
  setEdges: (edges: Array<FlowEdge>) => void;
  addNode: (node: FlowNode) => void;
  updateNode: (id: string, updates: Partial<FlowNode>) => void;
  deleteNode: (id: string) => void;
  addEdge: (edge: FlowEdge) => void;
  updateEdge: (id: string, updates: Partial<FlowEdge>) => void;
  deleteEdge: (id: string) => void;
  setSelectedNodes: (nodeIds: Array<string>) => void;
  createNewNode: (type: NodeType, position: { x: number; y: number }) => FlowNode;
  setLoading: (loading: boolean) => void;
  clearFlow: () => void;
}

let nodeCounter = 1;
let edgeCounter = 1;

const createNodeData = (type: NodeType) => {
  const baseData = {
    label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
    config: {},
    fileSystemRoot: `/nodes/node_${nodeCounter}/`,
    status: 'pending' as const,
  };

  switch (type) {
    case 'start':
      return { ...baseData, label: 'Start', config: { autoStart: true } };
    case 'end':
      return { ...baseData, label: 'End', config: { finalizeData: true } };
    case 'task':
      return { ...baseData, label: 'Task', config: { timeout: 300, retries: 3 } };
    case 'decision':
      return { ...baseData, label: 'Decision', config: { conditions: [] } };
    case 'api':
      return { ...baseData, label: 'API Call', config: { method: 'GET', timeout: 30 } };
    default:
      return baseData;
  }
};

export const useFlowStore = create<FlowStore>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodes: [],
  isLoading: false,

  setNodes: (nodes) => {
    set({ nodes });
  },

  setEdges: (edges) => {
    set({ edges });
  },

  addNode: (node) => {
    set((state) => ({
      nodes: [...state.nodes, node]
    }));
  },

  updateNode: (id, updates) => {
    set((state) => ({
      nodes: state.nodes.map(node =>
        node.id === id ? { ...node, ...updates } : node
      )
    }));
  },

  deleteNode: (id) => {
    set((state) => ({
      nodes: state.nodes.filter(node => node.id !== id),
      edges: state.edges.filter(edge => edge.source !== id && edge.target !== id),
      selectedNodes: state.selectedNodes.filter(nodeId => nodeId !== id)
    }));
  },

  addEdge: (edge) => {
    set((state) => ({
      edges: [...state.edges, edge]
    }));
  },

  updateEdge: (id, updates) => {
    set((state) => ({
      edges: state.edges.map(edge =>
        edge.id === id ? { ...edge, ...updates } : edge
      )
    }));
  },

  deleteEdge: (id) => {
    set((state) => ({
      edges: state.edges.filter(edge => edge.id !== id)
    }));
  },

  setSelectedNodes: (nodeIds) => {
    set({ selectedNodes: nodeIds });
  },

  createNewNode: (type, position) => {
    const id = `node_${nodeCounter++}`;
    return {
      id,
      type,
      position,
      data: createNodeData(type),
    };
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  clearFlow: () => {
    set({
      nodes: [],
      edges: [],
      selectedNodes: [],
    });
    nodeCounter = 1;
    edgeCounter = 1;
  },
}));