import React from 'react';
import { Facebook, Mail, MapPin, Phone, Globe, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import savsLogo from '../../img/imagecopy4.png';
import api from '../../services/api';
import './Footer.css';

const Footer = () => {
  const [settings, setSettings] = React.useState(null);

  React.useEffect(() => {
    api.get('/settings')
      .then(res => setSettings(res.data))
      .catch(err => console.error("Error fetching footer settings:", err));
  }, []);

  const company = settings?.company || {
    name: "Importadora de Vehículos SAVS",
    main_email: "ventas@importadorasavs.com",
    main_phone: "+506 6476-9091"
  };

  return (
    <footer className="footer-savs">
      <div className="footer-top">
        {/* Left Column */}
        <div className="footer-col-left">
          <img src={savsLogo} alt="SAVS Logo" className="footer-logo" />
          <p className="footer-brand-name">{company.name}</p>
          <p className="footer-follow">Síguenos</p>
          <div className="footer-social-top">
            <a href="https://www.facebook.com/p/Importadora-De-Veh%C3%ADculos-SAVS-100083511271381/" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Facebook size={20} /></a>
          </div>
        </div>

        {/* Middle Column */}
        <div className="footer-col-mid">
          <h3 className="footer-title">Información</h3>
          <ul className="footer-links">
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/inventory">Catálogo</Link></li>
            <li><Link to="/perfil">Mi Perfil</Link></li>
            <li><Link to="/vender-auto">Auto como parte de pago</Link></li>
            <li><Link to="/reseñas">Reseñas</Link></li>
            <li><Link to="/contact">Contacto</Link></li>
          </ul>
        </div>

        {/* Right Column */}
        <div className="footer-col-right">
          <h3 className="footer-title">Ubicación y Contacto</h3>

          <ul className="footer-contact-info">
            <li><Mail size={18} /> {company.main_email}</li>
            <li><MapPin size={18} /> Heredia & Puntarenas</li>
            <li><Phone size={18} /> {company.main_phone}</li>
            <li><Clock size={18} /> Lun-Sáb: 8:00 AM - 6:00 PM</li>
          </ul>
        </div>

        {/* Image Column */}
        <div className="footer-col-img">
          <img 
            src={company.footer_car_img || "https://importadorasavs.com/wp-content/uploads/2025/03/hyundai-2013-ix-1.png"} 
            alt="Vehículo SAVS" 
            className="footer-car-img" 
          />
        </div>
      </div>

      <div className="footer-bottom">
        <p>Copyright © {new Date().getFullYear()}. All rights reserved. Powered by Grid Studio Costa Rica.</p>
        <div className="footer-social-bottom">
          <a href="https://www.facebook.com/p/Importadora-De-Veh%C3%ADculos-SAVS-100083511271381/" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Facebook size={18} /></a>
          <a href="#!" aria-label="Website"><Globe size={18} /></a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
