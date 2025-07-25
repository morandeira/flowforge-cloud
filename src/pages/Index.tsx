import { Navigate } from 'react-router-dom';
import { useSessionStore } from '@/stores/sessionStore';

const Index = () => {
  const { isAuthenticated } = useSessionStore();
  
  // Redirect based on authentication status
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
};

export default Index;
