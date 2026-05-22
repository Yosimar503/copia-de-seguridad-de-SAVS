import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/security/ProtectedRoute';
import { AdminRoutes } from '../admin/routes/AdminRoutes';

const Home = lazy(() => import('../pages/homepage/Home'));
const Catalog = lazy(() => import('../pages/catalogpage/Catalog'));
const VehicleDetails = lazy(() => import('../pages/VehicleDetails/VehicleDetails'));
const RegistroUsuarios = lazy(() => import('../components/RegistroDeUsuarios/RegistroUsuarios'));
const LoginVista = lazy(() => import('../components/login/LoginVista'));
const RedireccionContactos = lazy(() => import('../components/Redirecciones/Redireccion Contactos/Redireccion Contactos/RedireccionContactos'));
const RedireccionModeloAuto = lazy(() => import('../components/Redirecciones/RedireccionModeloAuto/RedireccionModeloAuto/RedireccionModeloAuto'));
const CreditSimulator = lazy(() => import('../components/CreditSimulator/CreditSimulator'));
const PerfilUsuarios = lazy(() => import('../components/PerfilDeUsuarios/PerfilUsuarios'));
const VenderAutoPage = lazy(() => import('../pages/VenderAuto/VenderAutoPage'));
const AgendarCita = lazy(() => import('../pages/AgendarCita/AgendarCita'));
const Reseñas = lazy(() => import('../components/TechnicalGlossary/ApartadoDeReseñas/Reseñas'));
const RecuperarPassword = lazy(() => import('../pages/RecuperarPassword/RecuperarPassword'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#eab308' }}>Cargando ruta...</div>}>
      <Routes>
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/inicio" element={<Navigate to="/" replace />} />

        <Route path="/" element={<Home />} />
        <Route path="/inventory" element={<Catalog />} />
        <Route path="/details" element={<VehicleDetails />} />
        <Route path="/details/:id" element={<VehicleDetails />} />
        <Route path="/register" element={<RegistroUsuarios />} />
        <Route path="/login" element={<LoginVista />} />
        <Route path="/contact" element={<RedireccionContactos />} />
        <Route path="/modelAuto" element={<RedireccionModeloAuto />} />
        <Route path="/simulate-credit" element={<CreditSimulator />} />
        <Route path="/reseñas" element={<Reseñas />} />
        <Route path="/recuperar" element={<RecuperarPassword />} />

        <Route path="/perfil" element={
          <ProtectedRoute allowedRoles={['cliente', 'admin', 'gerente']}>
            <PerfilUsuarios />
          </ProtectedRoute>
        } />
        <Route path="/vender-auto" element={
          <ProtectedRoute allowedRoles={['cliente', 'admin', 'gerente']}>
            <VenderAutoPage />
          </ProtectedRoute>
        } />
        <Route path="/agendar-cita" element={
          <ProtectedRoute allowedRoles={['cliente', 'admin', 'gerente']}>
            <AgendarCita />
          </ProtectedRoute>
        } />

        {AdminRoutes()}

        <Route path="*" element={
          <div style={{ textAlign: 'center', padding: '100px 20px', color: 'white', minHeight: '60vh' }}>
            <h1 style={{ color: '#eab308', fontSize: '3rem', marginBottom: '1rem' }}>404</h1>
            <h2>Página no encontrada</h2>
            <p style={{ marginTop: '1rem', color: '#a1a1aa' }}>La ruta que intentas buscar no existe o ha sido movida.</p>
            <Navigate to="/" replace={false} />
          </div>
        } />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
