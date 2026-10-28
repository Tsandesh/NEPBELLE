import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

const Booting = () => <div className="container-nb py-20"><Skeleton className="h-64 w-full" /></div>;

export const ProtectedRoute = () => {
  const { isAuthenticated, bootstrapped } = useAuth();
  const loc = useLocation();
  if (!bootstrapped) return <Booting />;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace state={{ from: loc.pathname + loc.search }} />;
};

export const GuestRoute = () => {
  const { isAuthenticated, bootstrapped } = useAuth();
  const loc = useLocation();
  if (!bootstrapped) return <Booting />;
  return isAuthenticated ? <Navigate to={(loc.state as any)?.from ?? '/account'} replace /> : <Outlet />;
};
