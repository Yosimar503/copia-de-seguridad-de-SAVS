import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Mail, Lock, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import { sendRecoveryEmail } from '../../utils/security';
import './RecuperarPassword.css';

const darkSwal = {
  background: '#141414',
  color: '#fff',
  confirmButtonColor: '#eab308'
};

const RecuperarPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: New Password
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [userFound, setUserFound] = useState(null);
  const navigate = useNavigate();

  // Paso 1: Buscar usuario y enviar código
  const handleRequestCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Usamos el endpoint configurado en la API centralizada
      const resp = await api.post('/auth/check-email', { email: email.trim() });
      
      const user = resp.data;
      setUserFound(user);
      const tempCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      setGeneratedCode(tempCode);

      // Enviar correo real vía EmailJS
      await sendRecoveryEmail(user.email, user.nombre, tempCode);

      Swal.fire({
        ...darkSwal,
        icon: 'success',
        title: 'Código enviado',
        text: `Hemos enviado un código de recuperación a ${email}`
      });
      setStep(2);
    } catch (err) {
      Swal.fire({ ...darkSwal, icon: 'error', title: 'Error', text: err.response?.data?.error || err.message });
    } finally {
      setLoading(false);
    }
  };

  // Paso 2: Verificar código
  const handleVerifyCode = (e) => {
    e.preventDefault();
    if (code.trim().toUpperCase() === generatedCode) {
      setStep(3);
    } else {
      Swal.fire({ ...darkSwal, icon: 'error', title: 'Código Incorrecto', text: 'El código ingresado no es válido.' });
    }
  };

  // Paso 3: Actualizar contraseña
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      Swal.fire({ ...darkSwal, icon: 'warning', title: 'No coinciden', text: 'Las contraseñas deben ser iguales.' });
      return;
    }

    // Validación de complejidad de contraseña (Tarea solicitada)
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      Swal.fire({ 
        ...darkSwal, 
        icon: 'error', 
        title: 'Seguridad insuficiente', 
        text: 'La nueva contraseña debe tener al menos 8 caracteres e incluir al menos una letra MAYÚSCULA y un NÚMERO.' 
      });
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { 
        userId: userFound.id,
        newPassword: newPassword 
      });

      Swal.fire({
        ...darkSwal,
        icon: 'success',
        title: 'Contraseña Actualizada',
        text: 'Ya puedes iniciar sesión con tu nueva contraseña.'
      }).then(() => navigate('/login'));
    } catch (err) {
      Swal.fire({ ...darkSwal, icon: 'error', title: 'Error', text: err.response?.data?.error || err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recovery-page">
      <div className="recovery-visual-section">
        <div className="hero-background"></div>
        <div className="hero-content">
          <span className="hero-badge">SEGURIDAD AVANZADA</span>
          <h1>Recupera tu Acceso</h1>
          <p>En Importadora SAVS nos tomamos en serio tu seguridad. Sigue los pasos para restablecer tu contraseña y volver al inventario.</p>
        </div>
      </div>

      <div className="recovery-form-section">
        <div className="recovery-container">
          <div className="recovery-header">
            <button className="back-btn" onClick={() => step > 1 ? setStep(step - 1) : navigate('/login')}>
              <ArrowLeft size={20} />
            </button>
            <h2>{step === 1 ? '¿Olvidaste tu contraseña?' : step === 2 ? 'Verificación' : 'Nueva Contraseña'}</h2>
            <p>
              {step === 1 && 'Ingresa tu correo para recibir un código de recuperación.'}
              {step === 2 && 'Ingresa el código de 6 caracteres que enviamos a tu bandeja.'}
              {step === 3 && 'Define tu nueva contraseña de acceso.'}
            </p>
          </div>

          <div className="recovery-stepper">
            <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
            <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
            <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
            <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
            <div className={`step-dot ${step === 3 ? 'active' : ''}`}>3</div>
          </div>

          {step === 1 && (
            <form onSubmit={handleRequestCode} className="premium-form">
              <div className="form-group">
                <label>Correo Electrónico</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input 
                    type="email" 
                    className="premium-input-icon" 
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="recovery-btn" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar Código'} <ArrowRight size={18} />
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="premium-form">
              <div className="form-group">
                <label>Código de Verificación</label>
                <div className="input-wrapper">
                  <ShieldCheck className="input-icon" size={18} />
                  <input 
                    type="text" 
                    className="premium-input-icon" 
                    placeholder="ABC123"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="recovery-btn">
                Verificar Código <ArrowRight size={18} />
              </button>
              <p className="resend-text">¿No recibiste nada? <span onClick={handleRequestCode}>Reenviar código</span></p>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleUpdatePassword} className="premium-form">
              <div className="form-group">
                <label>Nueva Contraseña</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input 
                    type="password" 
                    className="premium-input-icon" 
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Confirmar Contraseña</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input 
                    type="password" 
                    className="premium-input-icon" 
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="recovery-btn" disabled={loading}>
                {loading ? 'Actualizando...' : 'Restablecer Contraseña'}
              </button>
            </form>
          )}

          <div className="recovery-footer">
            <Link to="/login">Volver al inicio de sesión</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecuperarPassword;
