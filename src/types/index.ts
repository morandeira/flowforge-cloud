// Core types for the SaaS multitenant application

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  branding: {
    logoUrl?: string;
    primaryColor: string;
    secondaryColor: string;
  };
  status: 'active' | 'suspended' | 'trial';
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  tenantIds: Array<string>;
  role: 'admin' | 'user' | 'viewer';
  lastActiveAt: string;
}

export interface Workspace {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  color: string;
  members: WorkspaceMember[];
  flowCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  userId: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  joinedAt: string;
}

export interface Flow {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  version: string;
  status: 'draft' | 'published' | 'archived';
  nodes: Array<FlowNode>;
  edges: Array<FlowEdge>;
  metadata: FlowMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface FlowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: {
    label: string;
    config: Record<string, any>;
    fileSystemRoot: string;
    status?: 'pending' | 'running' | 'completed' | 'error';
  };
  width?: number;
  height?: number;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  data?: {
    label?: string;
    condition?: string;
  };
}

export interface FlowMetadata {
  tags: Array<string>;
  category: string;
  author: string;
  lastModifiedBy: string;
}

export type NodeType = 
  | 'start' 
  | 'end' 
  | 'task' 
  | 'decision' 
  | 'condition' 
  | 'parallel' 
  | 'merge' 
  | 'api' 
  | 'transform' 
  | 'notification';

export interface FileSystemItem {
  id: string;
  nodeId: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  mimeType?: string;
  size?: number;
  url?: string;
  children?: FileSystemItem[];
  createdAt: string;
  modifiedAt: string;
}

export interface SessionState {
  isAuthenticated: boolean;
  user: User | null;
  tenant: Tenant | null;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresAt: number | null;
}

export interface AppState {
  currentWorkspace: Workspace | null;
  currentFlow: Flow | null;
  selectedNodeId: string | null;
  sidebarCollapsed: boolean;
  panelMode: 'params' | 'files' | null;
}

// Mock data interfaces for simulation
export interface MockAuthProvider {
  signIn: (email: string, password: string) => Promise<SessionState>;
  signOut: () => Promise<void>;
  refreshToken: () => Promise<string>;
  getCurrentUser: () => Promise<User>;
}

export interface MockTenantResolver {
  resolveTenantFromSubdomain: (subdomain: string) => Promise<Tenant | null>;
  resolveTenantFromToken: (token: string) => Promise<Tenant | null>;
}