import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, User, Calculator, LogOut, Menu, X } from 'lucide-react';
import savsLogo from '../../img/imagecopy4.png';
import { useNavbarStatus } from '../../hooks/useNavbar';
import { useNavigate, useLocation, NavLink, Link } from 'react-router-dom';
import VehicleSelectionModal from '../VehicleSelection/VehicleSelectionModal';
import ShimmerText from '../ShimmerText/ShimmerText';
import './Navbar.css';

const NavbarDiseño = () => {
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { 
    user, 
    isLoggedIn, 
    handleUserClick, 
    handleLogout, 
    searchQuery, 
    setSearchQuery, 
    onSearchSubmit,
    isMenuOpen,
    toggleMenu,
    closeMenu
  } = useNavbarStatus();
  const navigate = useNavigate();
  const location = useLocation();
  const current = location.pathname;

  // Cerrar dropdown al hacer clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  return (
    <>
    <nav className="navbar">
      <div className="container navbar-container">
        {/* Logo Section */}
        <div className="navbar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div className="logo-icon-savs">
            <img src={savsLogo} alt="SAVS" className="savs-logo-img" />
          </div>
          <div className="logo-text-container">
            <ShimmerText className="logo-text-main" text="SAVS" as="span" shimmerWidth={100} />
            <span className="logo-text-sub">IMPORTADORA</span>
          </div>
        </div>

        {/* Navigation Links */}
        <ul className="navbar-links">
          <li><NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>Inicio</NavLink></li>
          <li><NavLink to="/inventory" className={({ isActive }) => isActive ? 'active' : ''}>Vehículos</NavLink></li>
          <li><NavLink to="/vender-auto" className={({ isActive }) => isActive ? 'active' : ''}>Trade In</NavLink></li>
          <li>
            <button 
              onClick={() => setIsVehicleModalOpen(true)}
              className={current === '/simulate-credit' ? 'active' : ''} 
            >
              Calcular Financiamiento
            </button>
          </li>
          <li><NavLink to="/agendar-cita" className={({ isActive }) => isActive ? 'active' : ''}>Agendar cita</NavLink></li>
          <li><NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''}>Contacto</NavLink></li>
          <li><NavLink to="/reseñas" className={({ isActive }) => isActive ? 'active' : ''}>Reseñas</NavLink></li>
          {(user?.rol === 'admin' || user?.rol === 'gerente') && (
            <li><NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : ''} style={{ color: '#eab308' }}>Gestión SAVS</NavLink></li>
          )}
        </ul>

        {/* Right Section */}
        <div className="navbar-actions">
          <div className="search-bar">
            {/* Search inputs and buttons */}
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Buscar modelos, marcas..." 
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit(e)}
            />
          </div>
          
          <div
            ref={dropdownRef}
            className={`user-dropdown-container ${isDropdownOpen ? 'open' : ''}`}>
            <div 
              className={`session-manager ${isLoggedIn ? 'logged-in' : ''}`}
              onClick={() => {
                if (isLoggedIn) {
                  setIsDropdownOpen(!isDropdownOpen);
                } else {
                  handleUserClick();
                }
              }}
              onMouseEnter={() => { if (isLoggedIn) setIsDropdownOpen(true); }}
            >
              <div className="avatar-wrapper">
                <User size={20} />
              </div>
              <span className="session-label">
                {isLoggedIn ? `Hola, ${user.nombre.split(' ')[0]}` : 'Iniciar Sesión'}
              </span>
              {isLoggedIn && (
                <svg className="dropdown-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              )}
            </div>

            {/* Dropdown Menu for Authenticated Users */}
            {isLoggedIn && (
              <div className={`user-dropdown-menu ${isDropdownOpen ? 'open' : ''}`}>
                <div style={{ padding: '0.5rem 1.25rem', marginBottom: '0.5rem' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#a1a1aa' }}>Conectado como</p>
                  <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 'bold', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
                </div>
                <div className="dropdown-divider"></div>
                <Link to="/perfil" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                  <User size={16} /> Mi Perfil
                </Link>
                <Link to="/vender-auto" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                  <Calculator size={16} /> Mis Vehículos
                </Link>
                {(user?.rol === 'admin' || user?.rol === 'gerente') && (
                  <Link to="/admin" className="dropdown-item" onClick={() => setIsDropdownOpen(false)} style={{ color: '#eab308' }}>
                    <Search size={16} /> Panel de Administración
                  </Link>
                )}
                <div className="dropdown-divider"></div>
                <button 
                  className="dropdown-item" 
                  onClick={(e) => { setIsDropdownOpen(false); handleLogout(e); }}
                  style={{ color: '#ef4444' }}
                >
                  <LogOut size={16} /> Cerrar Sesión
                </button>
              </div>
            )}
          </div>

          {/* Hamburger Menu Toggle */}
          <button className="hamburger-btn" onClick={toggleMenu} aria-label="Abrir Menú">
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div className={`mobile-menu-drawer ${isMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-content">
          <ul className="mobile-links">
            <li onClick={closeMenu}><NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>Inicio</NavLink></li>
            <li onClick={closeMenu}><NavLink to="/inventory" className={({ isActive }) => isActive ? 'active' : ''}>Vehículos</NavLink></li>
            <li onClick={closeMenu}><NavLink to="/vender-auto" className={({ isActive }) => isActive ? 'active' : ''}>Trade In</NavLink></li>
            <li>
              <button 
                onClick={() => {
                  setIsVehicleModalOpen(true);
                  closeMenu();
                }}
                className={current === '/simulate-credit' ? 'active' : ''} 
              >
                Calcular Financiamiento
              </button>
            </li>
            <li onClick={closeMenu}><NavLink to="/agendar-cita" className={({ isActive }) => isActive ? 'active' : ''}>Agendar cita</NavLink></li>
            <li onClick={closeMenu}><NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''}>Contacto</NavLink></li>
            <li onClick={closeMenu}><NavLink to="/reseñas" className={({ isActive }) => isActive ? 'active' : ''}>Reseñas</NavLink></li>
          {(user?.rol === 'admin' || user?.rol === 'gerente') && (
            <li onClick={closeMenu}><NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : ''} style={{ color: '#eab308' }}>Gestión SAVS</NavLink></li>
          )}
          </ul>
          
          <div className="mobile-footer">
            <img src={savsLogo} alt="SAVS" className="mobile-menu-logo" />
            <p>© 2024 Importadora SAVS. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isMenuOpen && <div className="mobile-menu-overlay" onClick={closeMenu}></div>}
    </nav>
      <VehicleSelectionModal 
        isOpen={isVehicleModalOpen} 
        onClose={() => setIsVehicleModalOpen(false)} 
      />
    </>
  );
};

export default NavbarDiseño;
