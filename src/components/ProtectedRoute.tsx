import { useEffect } from 'react';
import { Navigate } from 'react-router';
import useAuth from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    if (user) {
      checkUserRole();
    } else {
      setCheckingRole(false);
    }
  }, [user]);

  const checkUserRole = async () => {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('email', user?.email)
        .single();
      
      if (userData?.role) {
        setUserRole(userData.role);
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    } finally {
      setCheckingRole(false);
    }
  };

  if (loading || checkingRole) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on role
    if (userRole === 'researcher') {
      return <Navigate to="/researcher/dashboard" replace />;
    } else if (userRole === 'reviewer') {
      return <Navigate to="/reviewer/dashboard" replace />;
    } else if (userRole === 'staff') {
      return <Navigate to="/staff/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
