import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SessionState, User, Tenant } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface SessionStore extends SessionState {
  // Actions
  setSession: (session: Partial<SessionState>) => void;
  setUser: (user: User) => void;
  setTenant: (tenant: Tenant) => void;
  clearSession: () => void;
  isTokenValid: () => boolean;
  // Supabase auth methods
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  refreshTokens: () => Promise<boolean>;
  initialize: () => Promise<void>;
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

      // Supabase authentication
      signIn: async (email, password) => {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          if (data.user && data.session) {
            // Get or create user profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', data.user.id)
              .single();

            const user: User = {
              id: data.user.id,
              email: data.user.email!,
              name: profile?.display_name || data.user.email!.split('@')[0],
              avatar: profile?.avatar_url,
              tenantIds: [data.user.id], // For simplicity, using user ID as tenant ID
              role: 'user',
              lastActiveAt: new Date().toISOString(),
            };

            const mockTenant: Tenant = {
              id: data.user.id,
              name: `${user.name}'s Organization`,
              subdomain: user.name.toLowerCase().replace(/\s+/g, '-'),
              branding: {
                primaryColor: 'hsl(258 100% 65%)',
                secondaryColor: 'hsl(220 14% 96%)',
              },
              status: 'active',
              createdAt: new Date().toISOString(),
            };

            const session: SessionState = {
              isAuthenticated: true,
              user,
              tenant: mockTenant,
              accessToken: data.session.access_token,
              refreshToken: data.session.refresh_token,
              tokenExpiresAt: data.session.expires_at! * 1000,
            };

            get().setSession(session);
            return true;
          }
          return false;
        } catch (error) {
          console.error('Sign in failed:', error);
          return false;
        }
      },

      signUp: async (email, password) => {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          });

          if (error) throw error;

          // Registration successful
          return true;
        } catch (error) {
          console.error('Sign up failed:', error);
          return false;
        }
      },

      signOut: async () => {
        try {
          await supabase.auth.signOut();
          get().clearSession();
        } catch (error) {
          console.error('Sign out failed:', error);
          get().clearSession();
        }
      },

      refreshTokens: async () => {
        try {
          const { data, error } = await supabase.auth.refreshSession();
          
          if (error) throw error;
          
          if (data.session) {
            set({
              accessToken: data.session.access_token,
              refreshToken: data.session.refresh_token,
              tokenExpiresAt: data.session.expires_at! * 1000,
            });
            return true;
          }
          
          return false;
        } catch (error) {
          console.error('Token refresh failed:', error);
          get().clearSession();
          return false;
        }
      },

      initialize: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            // Get user profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();

            const user: User = {
              id: session.user.id,
              email: session.user.email!,
              name: profile?.display_name || session.user.email!.split('@')[0],
              avatar: profile?.avatar_url,
              tenantIds: [session.user.id],
              role: 'user',
              lastActiveAt: new Date().toISOString(),
            };

            const mockTenant: Tenant = {
              id: session.user.id,
              name: `${user.name}'s Organization`,
              subdomain: user.name.toLowerCase().replace(/\s+/g, '-'),
              branding: {
                primaryColor: 'hsl(258 100% 65%)',
                secondaryColor: 'hsl(220 14% 96%)',
              },
              status: 'active',
              createdAt: new Date().toISOString(),
            };

            const sessionState: SessionState = {
              isAuthenticated: true,
              user,
              tenant: mockTenant,
              accessToken: session.access_token,
              refreshToken: session.refresh_token,
              tokenExpiresAt: session.expires_at! * 1000,
            };

            get().setSession(sessionState);
          }
        } catch (error) {
          console.error('Initialize session failed:', error);
          get().clearSession();
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