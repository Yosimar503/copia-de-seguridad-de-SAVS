import { useState } from 'react';
import Swal from 'sweetalert2';
import api from '../../services/api';

const darkSwal = {
  background: '#0a0a0a',
  color: '#fff',
  confirmButtonColor: '#eab308'
};

export const useRegistroUsuariosLogica = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validarFormulario = () => {
    const { nombre, correo, telefono, password, confirmPassword } = formData;

    if (!nombre.trim() || !correo.trim() || !telefono.trim() || !password.trim()) {
      Swal.fire({ ...darkSwal, icon: 'error', title: 'Campos incompletos', text: 'Todos los campos son obligatorios.' });
      return false;
    }

    const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,50}$/;
    if (!regexNombre.test(nombre.trim())) {
      Swal.fire({ ...darkSwal, icon: 'error', title: 'Nombre no válido', text: 'El nombre debe tener entre 3 y 50 caracteres y no contener números ni símbolos.' });
      return false;
    }

    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexCorreo.test(correo.trim())) {
      Swal.fire({ ...darkSwal, icon: 'error', title: 'Correo inválido', text: 'Ingresa un formato de correo electrónico válido.' });
      return false;
    }

    const regexTelefono = /^[0-9+\s\-()]{8,20}$/;
    if (!regexTelefono.test(telefono.trim())) {
      Swal.fire({ ...darkSwal, icon: 'error', title: 'Teléfono inválido', text: 'Formato de teléfono no reconocido.' });
      return false;
    }

    const regexPassword = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!regexPassword.test(password)) {
      Swal.fire({ 
        ...darkSwal, 
        icon: 'error', 
        title: 'Seguridad insuficiente', 
        text: 'La contraseña debe tener al menos 8 caracteres e incluir al menos una letra MAYÚSCULA y un NÚMERO.' 
      });
      return false;
    }

    if (password !== confirmPassword) {
      Swal.fire({ ...darkSwal, icon: 'error', title: 'Error de coincidencia', text: 'Las contraseñas no coinciden.' });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    try {
      // Registrar al usuario usando el endpoint de autenticación oficial
      const res = await api.post('/auth/register', {
        id: crypto.randomUUID(), // Usando UUID para evitar duplicidad de IDs de fecha
        nombre: formData.nombre.trim(),
        email: formData.correo.trim().toLowerCase(),
        telefono: formData.telefono.trim(),
        password: formData.password,
        ubicacion: 'Costa Rica'
      });

      Swal.fire({
        ...darkSwal,
        icon: 'success',
        title: '¡Registro exitoso!',
        text: 'Tu cuenta ha sido creada con éxito. Ya puedes iniciar sesión.',
        confirmButtonText: 'Ir a Iniciar Sesión'
      }).then(() => {
        window.location.href = '/login';
      });

      setFormData({ nombre: '', correo: '', telefono: '', password: '', confirmPassword: '' });

    } catch (err) {
      console.error("Error en registro:", err);
      const errorMsg = err.response?.data?.error || 'No se pudo completar el registro en la base de datos.';
      Swal.fire({ 
        ...darkSwal, 
        icon: 'error', 
        title: 'Error de registro', 
        text: errorMsg 
      });
    }
  };

  return { formData, handleChange, handleSubmit };
};
