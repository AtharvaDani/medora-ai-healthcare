import { Navigate } from 'react-router-dom';
import { userService } from '../services/userService';

// Replaces the Angular AuthGuard (+ RoleGuard when `role` is given).
export default function RequireAuth({ role, children }: { role?: string; children: JSX.Element }) {
  if (!userService.isLoggedIn()) return <Navigate to="/login" replace />;
  if (role) {
    const user = userService.getUserInfoFromToken();
    if (!user || user.role !== role) return <Navigate to="/login" replace />;
  }
  return children;
}
