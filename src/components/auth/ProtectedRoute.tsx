import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSessionStore } from '@/stores/sessionStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isTokenValid, refreshTokens } = useSessionStore();
  const location = useLocation();

  useEffect(() => {
    // Auto-refresh token if it's about to expire
    if (isAuthenticated && !isTokenValid()) {
      refreshTokens().catch(() => {
        // If refresh fails, user will be redirected to login
      });
    }
  }, [isAuthenticated, isTokenValid, refreshTokens]);

  if (!isAuthenticated || !isTokenValid()) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}