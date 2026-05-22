import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop — se monta una vez en el árbol y hace scroll
 * al inicio de la página en cada cambio de ruta.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
