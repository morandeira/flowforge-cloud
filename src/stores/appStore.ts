import { create } from 'zustand';
import { AppState, Workspace, Flow } from '@/types';

interface AppStore extends AppState {
  // Actions
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  setCurrentFlow: (flow: Flow | null) => void;
  setSelectedNode: (nodeId: string | null) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setPanelMode: (mode: 'params' | 'files' | null) => void;
  resetApp: () => void;
}

const initialState: AppState = {
  currentWorkspace: null,
  currentFlow: null,
  selectedNodeId: null,
  sidebarCollapsed: false,
  panelMode: null,
};

export const useAppStore = create<AppStore>((set, get) => ({
  ...initialState,

  setCurrentWorkspace: (workspace) => {
    set({ 
      currentWorkspace: workspace,
      // Reset flow when workspace changes
      currentFlow: null,
      selectedNodeId: null,
      panelMode: null
    });
  },

  setCurrentFlow: (flow) => {
    set({ 
      currentFlow: flow,
      selectedNodeId: null,
      panelMode: null
    });
  },

  setSelectedNode: (nodeId) => {
    set({ 
      selectedNodeId: nodeId,
      panelMode: nodeId ? 'params' : null
    });
  },

  toggleSidebar: () => {
    set((state) => ({
      sidebarCollapsed: !state.sidebarCollapsed
    }));
  },

  setSidebarCollapsed: (collapsed) => {
    set({ sidebarCollapsed: collapsed });
  },

  setPanelMode: (mode) => {
    set({ panelMode: mode });
  },

  resetApp: () => {
    set(initialState);
  },
}));