import React from 'react';
import './DiseñoRegistro.css';
import { useRegistroUsuariosLogica } from './RegistroUsuariosLogica';
import { useNavigate } from 'react-router-dom';
import AnimatedInput from '../AnimatedInput/AnimatedInput';
import BorderBeam from '../BorderBeam/BorderBeam';

function RegistroUsuarios() {
  const { formData, handleChange, handleSubmit } = useRegistroUsuariosLogica();
  const navigate = useNavigate();

  return (
    <div className="contenedorRegistro">
      {/* Left: Image side */}
      <div className="ladoImagen">
        <div className="overlay">
          <h1>
            Únete a <span className="gold-accent">The Destiny Vault</span>
          </h1>
          <p>
            Crea tu cuenta y accede a nuestro catálogo exclusivo de vehículos de lujo con financiamiento personalizado.
          </p>
        </div>
      </div>

      {/* Right: Form side */}
      <div className="ladoFormulario">
        <form className="formRegistro" onSubmit={handleSubmit}>
          <BorderBeam 
            size={40} 
            duration={12} 
            colorFrom="rgba(234, 179, 8, 0)" 
            colorTo="rgba(234, 179, 8, 1)" 
            borderWidth={1} 
            className="form-beam" 
          />
          <h2>Crear Cuenta</h2>
          <p className="subtitle">Completa tus datos para registrarte</p>

          <div style={{ marginBottom: "1.5rem" }}>
            <AnimatedInput
              label="Nombre completo"
              id="nombre"
              type="text"
              name="nombre"
              placeholder="Ej: Juan Pérez"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <AnimatedInput
              label="Correo electrónico"
              id="correo"
              type="email"
              name="correo"
              placeholder="nombre@ejemplo.com"
              value={formData.correo}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <AnimatedInput
              label="Teléfono"
              id="telefono"
              type="tel"
              name="telefono"
              placeholder="Ej: +506 72617462"
              value={formData.telefono}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <AnimatedInput
              label="Contraseña"
              id="password"
              type="password"
              name="password"
              placeholder="Mínimo 8 caracteres"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <AnimatedInput
              label="Confirmar Contraseña"
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="Repite tu contraseña"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit">Crear Cuenta</button>

          <p className="loginText">
            ¿Ya tienes cuenta?{' '}
            <span onClick={() => navigate('/login')}>Iniciar sesión</span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default RegistroUsuarios;
