import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import './Breadcrumbs.css';

/** Mapa de segmentos de ruta → etiqueta legible */
const ROUTE_LABELS = {
  admin:          'Admin',
  users:          'Usuarios',
  requests:       'Solicitudes',
  tracking:       'Tracking',
  reviews:        'Reseñas',
  branches:       'Sedes',
  'create-vehicle': 'Inventario',
  'trade-in':     'Trade-In',
  marketing:      'Marketing',
  perfil:         'Perfil',
  inventory:      'Vehículos',
  details:        'Detalle',
  contact:        'Contacto',
};

/**
 * Breadcrumbs — genera navegación contextual a partir de la URL actual.
 * Muestra hasta el segmento activo como texto (sin link).
 */
const Breadcrumbs = () => {
  const location = useLocation();

  // Partir la ruta en segmentos filtrando vacíos
  const segments = location.pathname.split('/').filter(Boolean);

  // Construir acumulado de paths
  const crumbs = segments.map((seg, i) => {
    const path  = '/' + segments.slice(0, i + 1).join('/');
    const label = ROUTE_LABELS[seg] || decodeURIComponent(seg);
    const isLast = i === segments.length - 1;
    return { path, label, isLast };
  });

  return (
    <nav className="admin-breadcrumbs" aria-label="Breadcrumb">
      {/* Inicio siempre visible */}
      <NavLink to="/" className="breadcrumb-home" title="Ir al inicio">
        <Home size={14} />
      </NavLink>

      {crumbs.map(({ path, label, isLast }) => (
        <React.Fragment key={path}>
          <ChevronRight size={14} className="breadcrumb-sep" />
          {isLast ? (
            <span className="breadcrumb-current" aria-current="page">
              {label}
            </span>
          ) : (
            <NavLink to={path} className="breadcrumb-link" end>
              {label}
            </NavLink>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
