import React from 'react';
import { Facebook, Twitter, Linkedin, Car } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="container footer-content">
        <div className="footer-left">
          <div className="footer-brand">
            <Car size={20} className="footer-icon"/>
            <span className="footer-name">Gestionadora de Créditos</span>
          </div>
          <p className="footer-text">
            &copy; 2024 Todos los derechos reservados. Tu confianza, nuestro motor.
          </p>
        </div>
        
        <div className="footer-right">
          <div className="social-icons">
            <a href="https://www.facebook.com/p/Importadora-De-Veh%C3%ADculos-SAVS-100083511271381/" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Facebook"><Facebook size={20} /></a>
            <a href="#" className="social-link" aria-label="Twitter"><Twitter size={20} /></a>
            <a href="#" className="social-link" aria-label="LinkedIn"><Linkedin size={20} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
