import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';
import Sidebar from './Sidebar';

export default function AppLayout() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#070C18]">
      <Sidebar />
      <main className="flex-1 min-w-0 w-full overflow-y-auto">
        <div className="w-full min-h-full px-8 py-7">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
