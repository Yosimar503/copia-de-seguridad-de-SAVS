import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import api from '../../services/api';

const darkSwal = {
  background: '#0a0a0a',
  color: '#fff',
  confirmButtonColor: '#eab308'
};

export const useLoginLogic = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validaciones de frontend
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Por favor, completa todos los campos.');
      setLoading(false);
      return;
    }

    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexCorreo.test(formData.email)) {
      setError('Ingresa un formato de correo válido.');
      setLoading(false);
      return;
    }

    try {
      // LLAMADA AL LOGIN REAL DEL BACKEND
      const response = await api.post('/auth/login', {
        email: formData.email.trim(),
        password: formData.password.trim()
      });

      const { usuario } = response.data;

      if (usuario) {
        // Guardamos los datos del usuario para el frontend
        localStorage.setItem('user', JSON.stringify({ 
          id: usuario.id, 
          nombre: usuario.nombre, 
          email: usuario.email,
          rol: usuario.rol
        }));
        
        toast.success(`¡Bienvenido de nuevo, ${usuario.nombre.split(' ')[0]}!`);
        
        Swal.fire({
          ...darkSwal,
          icon: 'success',
          title: '¡Bienvenido!',
          text: `Sesión iniciada como ${usuario.nombre}`
        }).then(() => {
          // Si es admin o gerente, mandarlo directo al panel
          if (usuario.rol === 'admin' || usuario.rol === 'gerente') {
            navigate('/admin');
          } else {
            navigate('/');
          }
        });
      }
    } catch (err) {
      // Manejar error de credenciales o servidor
      setError(err.response?.data?.error || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return { formData, loading, error, handleChange, handleSubmit };
};
