import { create } from 'zustand';
import { Workspace, Flow } from '@/types';

interface WorkspaceStore {
  workspaces: Workspace[];
  flows: Record<string, Flow[]>; // workspaceId -> flows
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setWorkspaces: (workspaces: Workspace[]) => void;
  addWorkspace: (workspace: Workspace) => void;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => void;
  deleteWorkspace: (id: string) => void;
  
  setFlows: (workspaceId: string, flows: Flow[]) => void;
  addFlow: (workspaceId: string, flow: Flow) => void;
  updateFlow: (workspaceId: string, flowId: string, updates: Partial<Flow>) => void;
  deleteFlow: (workspaceId: string, flowId: string) => void;
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Getters
  getWorkspaceFlows: (workspaceId: string) => Flow[];
  getFlow: (workspaceId: string, flowId: string) => Flow | undefined;
}

// Mock data
const mockWorkspaces: Workspace[] = [
  {
    id: 'ws_1',
    tenantId: 'tenant_demo',
    name: 'Production Workflows',
    description: 'Main production automation flows',
    color: '#8B5CF6',
    members: [
      { userId: 'user_1', role: 'owner', joinedAt: '2024-01-01T00:00:00Z' },
      { userId: 'user_2', role: 'editor', joinedAt: '2024-01-02T00:00:00Z' },
    ],
    flowCount: 3,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'ws_2',
    tenantId: 'tenant_demo',
    name: 'Quality Assurance',
    description: 'QA testing and validation processes',
    color: '#059669',
    members: [
      { userId: 'user_1', role: 'admin', joinedAt: '2024-01-03T00:00:00Z' },
    ],
    flowCount: 2,
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
  },
];

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  workspaces: mockWorkspaces,
  flows: {},
  isLoading: false,
  error: null,

  setWorkspaces: (workspaces) => {
    set({ workspaces });
  },

  addWorkspace: (workspace) => {
    set((state) => ({
      workspaces: [...state.workspaces, workspace]
    }));
  },

  updateWorkspace: (id, updates) => {
    set((state) => ({
      workspaces: state.workspaces.map(ws => 
        ws.id === id ? { ...ws, ...updates } : ws
      )
    }));
  },

  deleteWorkspace: (id) => {
    set((state) => ({
      workspaces: state.workspaces.filter(ws => ws.id !== id),
      flows: Object.fromEntries(
        Object.entries(state.flows).filter(([wsId]) => wsId !== id)
      )
    }));
  },

  setFlows: (workspaceId, flows) => {
    set((state) => ({
      flows: {
        ...state.flows,
        [workspaceId]: flows
      }
    }));
  },

  addFlow: (workspaceId, flow) => {
    set((state) => ({
      flows: {
        ...state.flows,
        [workspaceId]: [...(state.flows[workspaceId] || []), flow]
      }
    }));
  },

  updateFlow: (workspaceId, flowId, updates) => {
    set((state) => ({
      flows: {
        ...state.flows,
        [workspaceId]: (state.flows[workspaceId] || []).map(flow =>
          flow.id === flowId ? { ...flow, ...updates } : flow
        )
      }
    }));
  },

  deleteFlow: (workspaceId, flowId) => {
    set((state) => ({
      flows: {
        ...state.flows,
        [workspaceId]: (state.flows[workspaceId] || []).filter(flow => flow.id !== flowId)
      }
    }));
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error });
  },

  getWorkspaceFlows: (workspaceId) => {
    return get().flows[workspaceId] || [];
  },

  getFlow: (workspaceId, flowId) => {
    const flows = get().flows[workspaceId] || [];
    return flows.find(flow => flow.id === flowId);
  },
}));