import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getStoredAdminKey } from '../../api/adminClient';

export function AdminRoute() {
  const location = useLocation();
  const key = getStoredAdminKey();
  if (!key) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
