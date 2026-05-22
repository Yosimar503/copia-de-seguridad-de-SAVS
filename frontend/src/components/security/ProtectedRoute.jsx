import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/api';

/**
 * Componente para proteger rutas privadas.
 * Verifica si existe un usuario válido validando el token en el backend.
 */
const ProtectedRoute = ({ children, allowedRoles = ['admin', 'gerente'] }) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await authService.getMe();
        if (userData && userData.rol) {
          setUserRole(userData.rol.nombre?.toLowerCase() || 'user');
          setIsAuthenticated(true);
          // Opcional: sincronizar localStorage
          localStorage.setItem('user', JSON.stringify({
            id: userData.id,
            nombre: userData.nombre,
            email: userData.email,
            rol: userData.rol.nombre?.toLowerCase() || 'user'
          }));
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#eab308' }}>Cargando...</div>;
  }

  // 1. Si no hay usuario, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Si el rol no está permitido, redirigir al inicio
  const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());
  if (allowedRoles && !normalizedAllowed.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  // 3. Si todo está bien, renderizar el contenido protegido
  return children;
};

export default ProtectedRoute;
