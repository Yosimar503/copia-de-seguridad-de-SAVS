import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/homepage/Home';
import Catalog from '../pages/catalogpage/Catalog';
import VehicleDetails from '../pages/VehicleDetails/VehicleDetails';
import RegistroUsuarios from '../components/RegistroDeUsuarios/RegistroUsuarios';
import LoginVista from '../components/login/LoginVista';
import RedireccionContactos from '../components/Redirecciones/Redireccion Contactos/Redireccion Contactos/RedireccionContactos';
import RedireccionModeloAuto from '../components/Redirecciones/RedireccionModeloAuto/RedireccionModeloAuto/RedireccionModeloAuto';
import CreditSimulator from '../components/CreditSimulator/CreditSimulator';
import PerfilUsuarios from '../components/PerfilDeUsuarios/PerfilUsuarios';
import IntercambioDeAutos from '../components/IntercambioDeAutos/IntercambioDeAutos';
import Reseñas from '../components/TechnicalGlossary/ApartadoDeReseñas/Reseñas';
import RecuperarPassword from '../pages/RecuperarPassword/RecuperarPassword';

import ProtectedRoute from '../components/security/ProtectedRoute';
import AdminDashboard from '../pages/admin/AdminDashboard';
import ReviewRequests from '../pages/admin/ReviewRequests';
import CreateVehicle from '../pages/admin/CreateVehicle';
import UserManagement from '../pages/admin/UserManagement';
import BranchManagement from '../pages/admin/BranchManagement';
import TrackingManagement from '../pages/admin/TrackingManagement';
import MarketingBroadcast from '../pages/admin/MarketingBroadcast';
import AdminLayout from '../components/admin/AdminLayout';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/inventory" element={<Catalog />} />
      <Route path="/details" element={<VehicleDetails />} />
      <Route path="/details/:id" element={<VehicleDetails />} />
      <Route path="/register" element={<RegistroUsuarios />} />
      <Route path="/login" element={<LoginVista />} />
      <Route path="/contact" element={<RedireccionContactos />} />
      <Route path="/modelAuto" element={<RedireccionModeloAuto />} />
      <Route path="/simulate-credit" element={<CreditSimulator />} />
      <Route path="/perfil" element={
        <ProtectedRoute allowedRoles={['cliente', 'admin', 'gerente']}>
          <PerfilUsuarios />
        </ProtectedRoute>
      } />
      <Route path="/vender-auto" element={
        <ProtectedRoute allowedRoles={['cliente', 'admin', 'gerente']}>
          <IntercambioDeAutos />
        </ProtectedRoute>
      } />
      <Route path="/reseñas" element={<Reseñas />} />
      <Route path="/recuperar" element={<RecuperarPassword />} />
      
      {/* Rutas Privadas de Administración (Admin y Gerente) */}
      <Route path="/admin" element={<ProtectedRoute><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute><AdminLayout><UserManagement /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/requests" element={<ProtectedRoute><AdminLayout><ReviewRequests /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/branches" element={<ProtectedRoute><AdminLayout><BranchManagement /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/create-vehicle" element={<ProtectedRoute><AdminLayout><CreateVehicle /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/reviews" element={<ProtectedRoute><AdminLayout><Reseñas /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/tracking" element={<ProtectedRoute><AdminLayout><TrackingManagement /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/marketing" element={<ProtectedRoute><AdminLayout><MarketingBroadcast /></AdminLayout></ProtectedRoute>} />
    </Routes>
  );
};

export default AppRoutes;
