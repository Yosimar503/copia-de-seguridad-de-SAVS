import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedInput from '../AnimatedInput/AnimatedInput';

export const LoginForm = ({ formData, loading, error, onChange, onSubmit }) => {
  return (
    <form onSubmit={onSubmit} className="premium-form">
      <div className="form-group" style={{ marginBottom: "1.5rem" }}>
        <AnimatedInput
          label="Correo Electrónico"
          type="email"
          id="email"
          name="email"
          placeholder="nombre@ejemplo.com"
          value={formData.email}
          onChange={onChange}
          disabled={loading}
          required
        />
      </div>

      <div className="form-group" style={{ marginBottom: "1.5rem" }}>
        <AnimatedInput
          label="Contraseña"
          type="password"
          id="password"
          name="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={onChange}
          disabled={loading}
          required
        />
        <div className="forgot-password-container">
          <a href="/recuperar" className="forgot-password-link">¿Olvidaste tu contraseña?</a>
        </div>
      </div>

      <button 
        type="submit" 
        className="login-submit-btn" 
        disabled={loading}
      >
        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </button>

      {error && (
        <div className="error-bubble">
          <span>⚠️ {error}</span>
        </div>
      )}
    </form>
  );
};

export default LoginForm;
