import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SessionState, User, Tenant } from '@/types';

interface SessionStore extends SessionState {
  // Actions
  setSession: (session: Partial<SessionState>) => void;
  setUser: (user: User) => void;
  setTenant: (tenant: Tenant) => void;
  clearSession: () => void;
  isTokenValid: () => boolean;
  // Simulated auth methods
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => void;
  refreshTokens: () => Promise<boolean>;
}

const initialState: SessionState = {
  isAuthenticated: false,
  user: null,
  tenant: null,
  accessToken: null,
  refreshToken: null,
  tokenExpiresAt: null,
};

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setSession: (session) => {
        set((state) => ({
          ...state,
          ...session,
        }));
      },

      setUser: (user) => {
        set({ user });
      },

      setTenant: (tenant) => {
        set({ tenant });
      },

      clearSession: () => {
        set(initialState);
      },

      isTokenValid: () => {
        const { tokenExpiresAt } = get();
        if (!tokenExpiresAt) return false;
        return Date.now() < tokenExpiresAt;
      },

      // Simulated authentication (in real app, this would call Keycloak)
      signIn: async (email, password) => {
        try {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // Mock user data based on email
          const mockUser: User = {
            id: `user_${Date.now()}`,
            email,
            name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            tenantIds: ['tenant_demo'],
            role: email.includes('admin') ? 'admin' : 'user',
            lastActiveAt: new Date().toISOString(),
          };

          // Mock tenant (in real app, resolved from subdomain or token)
          const mockTenant: Tenant = {
            id: 'tenant_demo',
            name: 'Demo Corporation',
            subdomain: 'demo',
            branding: {
              primaryColor: 'hsl(258 100% 65%)',
              secondaryColor: 'hsl(220 14% 96%)',
            },
            status: 'active',
            createdAt: new Date().toISOString(),
          };

          const session: SessionState = {
            isAuthenticated: true,
            user: mockUser,
            tenant: mockTenant,
            accessToken: `mock_token_${Date.now()}`,
            refreshToken: `mock_refresh_${Date.now()}`,
            tokenExpiresAt: Date.now() + (3600 * 1000), // 1 hour
          };

          get().setSession(session);
          return true;
        } catch (error) {
          console.error('Sign in failed:', error);
          return false;
        }
      },

      signOut: () => {
        get().clearSession();
      },

      refreshTokens: async () => {
        try {
          // Simulate token refresh
          await new Promise(resolve => setTimeout(resolve, 300));
          
          set({
            accessToken: `mock_token_${Date.now()}`,
            tokenExpiresAt: Date.now() + (3600 * 1000),
          });
          
          return true;
        } catch (error) {
          console.error('Token refresh failed:', error);
          get().clearSession();
          return false;
        }
      },
    }),
    {
      name: 'session-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        tenant: state.tenant,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        tokenExpiresAt: state.tokenExpiresAt,
      }),
    }
  )
);