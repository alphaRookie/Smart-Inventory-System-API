import { Navigate, Outlet } from 'react-router-dom';

// 1. Blocks logged-in users from accidentally seeing login/register screens
export function PublicRoute() {
  const token = localStorage.getItem('access_token');
  return !token ? <Outlet /> : <Navigate to="/dashboard" replace />;
}

// 2. Blocks unauthenticated users from entering protected pages
export function ProtectedRoute() {
  const token = localStorage.getItem('access_token');
  return token ? <Outlet /> : <Navigate to="/login" replace />; 
}

// 3. Blocks user that has not a spesific role
export function RoleProtectedRoute({ allowedGroups }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // If they are a superuser, let them pass instantly
  if (user.is_superuser) {return <Outlet />;}

  const userGroups = user.groups || [];
  const hasAccess = allowedGroups.some(group => userGroups.includes(group));

  // If they have access, render all the nested routes inside. If not, kick them out
  return hasAccess ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
