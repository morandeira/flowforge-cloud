import { create } from 'zustand';
import { Workspace, Flow } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface WorkspaceStore {
  workspaces: Array<Workspace>;
  flows: Record<string, Array<Flow>>; // workspaceId -> flows
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchWorkspaces: () => Promise<void>;
  createWorkspace: (workspace: Omit<Workspace, 'id' | 'createdAt' | 'updatedAt' | 'flowCount'>) => Promise<void>;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  
  fetchFlows: (workspaceId: string) => Promise<void>;
  createFlow: (workspaceId: string, flow: Omit<Flow, 'id' | 'createdAt' | 'updatedAt' | 'workspaceId'>) => Promise<void>;
  updateFlow: (workspaceId: string, flowId: string, updates: Partial<Flow>) => Promise<void>;
  deleteFlow: (workspaceId: string, flowId: string) => Promise<void>;
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Getters
  getWorkspaceFlows: (workspaceId: string) => Array<Flow>;
  getFlow: (workspaceId: string, flowId: string) => Flow | undefined;
}


export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  workspaces: [],
  flows: {},
  isLoading: false,
  error: null,

  fetchWorkspaces: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const { data: workspacesData, error: workspacesError } = await supabase
        .from('workspaces')
        .select(`
          *,
          workspace_members!inner(
            user_id,
            role,
            joined_at
          )
        `);

      if (workspacesError) throw workspacesError;

      // Transform the data to match our Workspace interface
      const workspaces: Workspace[] = workspacesData?.map(ws => ({
        id: ws.id,
        tenantId: ws.tenant_id,
        name: ws.name,
        description: ws.description,
        color: ws.color,
        flowCount: ws.flow_count,
        members: ws.workspace_members.map((member: any) => ({
          userId: member.user_id,
          role: member.role,
          joinedAt: member.joined_at
        })),
        createdAt: ws.created_at,
        updatedAt: ws.updated_at
      })) || [];

      set({ workspaces, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch workspaces', isLoading: false });
    }
  },

  createWorkspace: async (workspace) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('workspaces')
        .insert({
          tenant_id: user.user.id,
          name: workspace.name,
          description: workspace.description,
          color: workspace.color
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh workspaces
      await get().fetchWorkspaces();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create workspace', isLoading: false });
    }
  },

  updateWorkspace: async (id, updates) => {
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase
        .from('workspaces')
        .update({
          name: updates.name,
          description: updates.description,
          color: updates.color
        })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      set((state) => ({
        workspaces: state.workspaces.map(ws => 
          ws.id === id ? { ...ws, ...updates } : ws
        ),
        isLoading: false
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update workspace', isLoading: false });
    }
  },

  deleteWorkspace: async (id) => {
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      set((state) => ({
        workspaces: state.workspaces.filter(ws => ws.id !== id),
        flows: Object.fromEntries(
          Object.entries(state.flows).filter(([wsId]) => wsId !== id)
        ),
        isLoading: false
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete workspace', isLoading: false });
    }
  },

  fetchFlows: async (workspaceId) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('flows')
        .select('*')
        .eq('workspace_id', workspaceId);

      if (error) throw error;

      const flows: Flow[] = data?.map(flow => {
        const flowData = flow.flow_data as any || { nodes: [], edges: [] };
        return {
          id: flow.id,
          workspaceId: flow.workspace_id,
          name: flow.name,
          description: flow.description,
          status: flow.status as 'draft' | 'published' | 'archived',
          version: flow.version,
          nodes: flowData.nodes || [],
          edges: flowData.edges || [],
          metadata: {
            tags: flow.tags || [],
            category: flow.category || 'General',
            author: flow.created_by,
            lastModifiedBy: flow.created_by
          },
          createdAt: flow.created_at,
          updatedAt: flow.updated_at
        };
      }) || [];

      set((state) => ({
        flows: {
          ...state.flows,
          [workspaceId]: flows
        },
        isLoading: false
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch flows', isLoading: false });
    }
  },

  createFlow: async (workspaceId, flow) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('flows')
        .insert({
          workspace_id: workspaceId,
          name: flow.name,
          description: flow.description,
          status: flow.status,
          version: flow.version,
          category: flow.metadata.category,
          tags: flow.metadata.tags,
          flow_data: JSON.parse(JSON.stringify({ nodes: flow.nodes, edges: flow.edges })),
          created_by: user.user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh flows for this workspace
      await get().fetchFlows(workspaceId);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create flow', isLoading: false });
    }
  },

  updateFlow: async (workspaceId, flowId, updates) => {
    try {
      set({ isLoading: true, error: null });
      
      const updateData: any = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.description) updateData.description = updates.description;
      if (updates.status) updateData.status = updates.status;
      if (updates.version) updateData.version = updates.version;
      if (updates.metadata?.category) updateData.category = updates.metadata.category;
      if (updates.metadata?.tags) updateData.tags = updates.metadata.tags;
      if (updates.nodes || updates.edges) {
        updateData.flow_data = { 
          nodes: updates.nodes || [], 
          edges: updates.edges || [] 
        };
      }

      const { error } = await supabase
        .from('flows')
        .update(updateData)
        .eq('id', flowId);

      if (error) throw error;

      // Update local state
      set((state) => ({
        flows: {
          ...state.flows,
          [workspaceId]: (state.flows[workspaceId] || []).map(flow =>
            flow.id === flowId ? { ...flow, ...updates } : flow
          )
        },
        isLoading: false
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update flow', isLoading: false });
    }
  },

  deleteFlow: async (workspaceId, flowId) => {
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase
        .from('flows')
        .delete()
        .eq('id', flowId);

      if (error) throw error;

      // Update local state
      set((state) => ({
        flows: {
          ...state.flows,
          [workspaceId]: (state.flows[workspaceId] || []).filter(flow => flow.id !== flowId)
        },
        isLoading: false
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete flow', isLoading: false });
    }
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