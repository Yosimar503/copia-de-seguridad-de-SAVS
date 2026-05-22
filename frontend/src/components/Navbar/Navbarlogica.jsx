import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

export const useNavbarLogica = () => {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Cerrar el menú si cambiamos de ruta
    setIsMenuOpen(false);
    
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      setUser(null);
    }
  }, [location.pathname]);

  const handleUserClick = () => {
    if (user) {
      navigate('/perfil');
    } else {
      navigate('/login');
    }
  };

  const handleSearch = (e) => {
    if (e && e.key === 'Enter') {
      e.preventDefault();
      if (searchQuery.trim()) {
        navigate(`/inventory?search=${encodeURIComponent(searchQuery.trim())}`);
      } else {
        navigate('/inventory'); // Si está vacío, recarga el catálogo completo
      }
    }
  };

  const onSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/inventory?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/inventory'); // Si está vacío, recarga el catálogo completo
    }
  };

  const handleLogout = async (e) => {
    if (e) e.stopPropagation();
    try {
      const { authService } = await import('../../services/api');
      await authService.logout();
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
    toast('Sesión cerrada', { icon: '👋' });
    localStorage.removeItem('user');
    setUser(null);
    setIsMenuOpen(false);
    navigate('/login');
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return { 
    user, 
    isLoggedIn: !!user,
    handleUserClick,
    handleLogout,
    searchQuery,
    setSearchQuery,
    handleSearch,
    onSearchSubmit,
    isMenuOpen,
    toggleMenu,
    closeMenu
  };
};
