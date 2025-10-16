import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { admin, checkAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const isAdminUser = await checkAdmin();
        setIsAdmin(isAdminUser);
      } catch (error) {
        console.error('Error verifying admin:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    verifyAdmin();
  }, [checkAdmin]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAdmin ? <>{children}</> : <Navigate to="/admin/login" replace />;
};

export const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};
