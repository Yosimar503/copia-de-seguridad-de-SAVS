import React from 'react';
import './Login.css';
import { useLoginLogic } from './LoginLogica';
import { LoginHeader } from './LoginHeader';
import { LoginForm } from './LoginForm';
import { Link } from 'react-router-dom';
import BorderBeam from '../BorderBeam/BorderBeam';

export const LoginVista = () => {
  const { formData, loading, error, handleChange, handleSubmit } = useLoginLogic();

  return (
    <div className="login-page">
      {/* ... code above ... */}
      <section className="login-form-section">
        <div className="form-container">
          <BorderBeam 
            size={40} 
            duration={12} 
            colorFrom="rgba(234, 179, 8, 0)" 
            colorTo="rgba(234, 179, 8, 1)" 
            borderWidth={1} 
            className="form-beam" 
          />
          {/* ... header and form ... */}
          
          <LoginForm 
            formData={formData}
            loading={loading}
            error={error}
            onChange={handleChange}
            onSubmit={handleSubmit}
          />

          <div className="form-footer">
            ¿Aún no tienes cuenta? <Link to="/register">Crear una cuenta nueva</Link>
          </div>

          <div className="legal-notice">
            Al continuar, aceptas nuestros <a href="#!">Términos de Servicio</a> y <a href="#!">Acuerdos de Privacidad</a>.
          </div>
        </div>
      </section>
    </div>
  );
};

export default LoginVista;
