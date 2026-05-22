import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../../components/security/ProtectedRoute';
import AdminLayout from '../components/AdminLayout/AdminLayout';
import { ADMIN_ROUTES } from '../constants/routes';

import AdminDashboard from '../../pages/admin/AdminDashboard';
import UserManagement from '../../pages/admin/UserManagement';
import ReviewRequests from '../../pages/admin/ReviewRequests';
import BranchManagement from '../../pages/admin/BranchManagement';
import CreateVehicle from '../../pages/admin/CreateVehicle';
import TrackingManagement from '../../pages/admin/TrackingManagement';
import MarketingBroadcast from '../../pages/admin/MarketingBroadcast';
import TradeInPage from '../pages/TradeInPage';
import Reseñas from '../../components/TechnicalGlossary/ApartadoDeReseñas/Reseñas';

/**
 * Rutas anidadas del panel admin.
 * Uso en AppRoutes: {AdminRoutes()}
 */
export function AdminRoutes() {
  const guard = (element) => <ProtectedRoute>{element}</ProtectedRoute>;

  return (
    <Route path={ADMIN_ROUTES.dashboard} element={guard(<AdminLayout />)}>
      <Route index element={<AdminDashboard />} />
      <Route path="users" element={<UserManagement />} />
      <Route path="requests" element={<ReviewRequests />} />
      <Route path="branches" element={<BranchManagement />} />
      <Route path="create-vehicle" element={<CreateVehicle />} />
      <Route path="reviews" element={<Reseñas />} />
      <Route path="tracking" element={<TrackingManagement />} />
      <Route path="marketing" element={<MarketingBroadcast />} />
      <Route path="trade-in" element={<TradeInPage />} />
    </Route>
  );
}

export default AdminRoutes;
