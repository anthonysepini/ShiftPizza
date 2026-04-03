import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import LoginPage from '../pages/login/LoginPage';
import AdminDashboardPage from '../pages/admin/DashboardPage';
import EmployeesPage from '../pages/admin/EmployeesPage';
import SchedulePage from '../pages/admin/SchedulePage';
import AuditPage from '../pages/admin/AuditPage';
import MyDashboardPage from '../pages/employee/MyDashboardPage';
import MyCalendarPage from '../pages/employee/MyCalendarPage';
import MyProfilePage from '../pages/employee/MyProfilePage';

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '/login', element: <LoginPage /> },
  {
    path: '/admin',
    element: <AppLayout />,
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'employees', element: <EmployeesPage /> },
      { path: 'schedule', element: <SchedulePage /> },
      { path: 'audit', element: <AuditPage /> },
    ],
  },
  {
    path: '/employee',
    element: <AppLayout />,
    children: [
      { index: true, element: <MyDashboardPage /> },
      { path: 'calendar', element: <MyCalendarPage /> },
      { path: 'profile', element: <MyProfilePage /> },
    ],
  },
]);
