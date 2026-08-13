import { Navigate, type RouteObject } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Spinner from '../components/ui/Spinner';

export const SAFE_FALLBACK_PATH = '/login';

const routeLoadingElement = (
  <div
    role="status"
    aria-label="Carregando página"
    className="flex min-h-screen items-center justify-center bg-[#050505]"
  >
    <Spinner size="lg" />
  </div>
);

export const appRoutes: RouteObject[] = [
  { path: '/', element: <Navigate to={SAFE_FALLBACK_PATH} replace /> },
  {
    path: '/login',
    hydrateFallbackElement: routeLoadingElement,
    lazy: async () => ({
      Component: (await import('../pages/login/LoginPage')).default,
    }),
  },
  {
    path: '/admin',
    element: <AppLayout requiredRole="ADMIN" />,
    hydrateFallbackElement: routeLoadingElement,
    children: [
      {
        index: true,
        lazy: async () => ({
          Component: (await import('../pages/admin/DashboardPage')).default,
        }),
      },
      {
        path: 'employees',
        lazy: async () => ({
          Component: (await import('../pages/admin/EmployeesPage')).default,
        }),
      },
      {
        path: 'schedule',
        lazy: async () => ({
          Component: (await import('../pages/admin/SchedulePage')).default,
        }),
      },
      {
        path: 'audit',
        lazy: async () => ({
          Component: (await import('../pages/admin/AuditPage')).default,
        }),
      },
    ],
  },
  {
    path: '/employee',
    element: <AppLayout requiredRole="EMPLOYEE" />,
    hydrateFallbackElement: routeLoadingElement,
    children: [
      {
        index: true,
        lazy: async () => ({
          Component: (await import('../pages/employee/MyDashboardPage')).default,
        }),
      },
      {
        path: 'calendar',
        lazy: async () => ({
          Component: (await import('../pages/employee/MyCalendarPage')).default,
        }),
      },
      {
        path: 'profile',
        lazy: async () => ({
          Component: (await import('../pages/employee/MyProfilePage')).default,
        }),
      },
    ],
  },
  { path: '*', element: <Navigate to={SAFE_FALLBACK_PATH} replace /> },
];
