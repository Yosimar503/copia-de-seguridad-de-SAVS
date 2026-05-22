import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../../../../services/api';

const darkSwal = {
  background: '#0a0a0a',
  color: '#fff',
  confirmButtonColor: '#eab308'
};

export const useRedireccionContactosLogica = () => {
  const location = useLocation();
  const initialVehicle = location.state?.vehicle;

  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    user_phone: '',
    subject: initialVehicle ? 'Cotización de vehículo' : 'Asesoría de crédito',
    message: ''
  });

  // No pre-llenamos el mensaje para que el formulario se vea limpio
  useEffect(() => {
    // Solo actualizamos el asunto si es necesario, pero mantenemos el mensaje vacío
  }, [initialVehicle]);

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const sendEmail = (e) => {
    e.preventDefault();

    // Requisito de inicio de sesión
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      Swal.fire({
        ...darkSwal,
        icon: 'warning',
        title: 'Sesión Requerida',
        text: 'Debes iniciar sesión para enviar una solicitud de contacto.',
        confirmButtonText: 'Ir al Login',
        showCancelButton: true,
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = '/login';
        }
      });
      return;
    }

    const { user_name, user_email, user_phone, message } = formData;

    // Validación básica de campos obligatorios
    if (!user_name.trim() || !user_email.trim() || !user_phone.trim()) {
      Swal.fire({
        ...darkSwal,
        icon: 'error',
        title: 'Campos obligatorios',
        text: 'Por favor, ingresa tu nombre, correo y teléfono.',
        confirmButtonColor: '#eab308'
      });
      return;
    }

    if (message.trim().length < 10 && !initialVehicle) {
      Swal.fire({
        ...darkSwal,
        icon: 'warning',
        title: 'Mensaje demasiado corto',
        text: 'Por favor, describe tu consulta con al menos 10 caracteres.',
        confirmButtonColor: '#eab308'
      });
      return;
    }

    // Validación de formato de correo
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(user_email)) {
      Swal.fire({
        ...darkSwal,
        icon: 'error',
        title: 'Correo inválido',
        text: 'Por favor, ingresa un formato de correo electrónico válido.',
        confirmButtonColor: '#eab308'
      });
      return;
    }

    // Validación de teléfono (permite +, números y espacios)
    const regexPhone = /^[0-9+\s\-()]{8,20}$/;
    if (!regexPhone.test(user_phone.trim())) {
      Swal.fire({
        ...darkSwal,
        icon: 'error',
        title: 'Teléfono inválido',
        text: 'Asegúrate de incluir el código de país con un espacio, ej: +506 72617462.',
        confirmButtonColor: '#eab308'
      });
      return;
    }
    
    // Si viene de un vehículo, construimos el mensaje especial
    let finalMessage = message;
    
    if (initialVehicle) {
      const vehicleUrl = `${window.location.origin}/details/${initialVehicle.id}`;
      finalMessage = `Hola mi nombre es ${user_name}, estoy interesado en este modelo: ${vehicleUrl}. Mi contacto es ${user_phone}.`;
    }

    if (!finalMessage && !initialVehicle) {
      Swal.fire({
        ...darkSwal,
        icon: 'warning',
        title: 'Mensaje vacío',
        text: 'Por favor escribe tu consulta.',
        confirmButtonColor: '#eab308'
      });
      return;
    }

    // En lugar de redirigir directamente a WhatsApp, guardamos la solicitud en la base de datos para que el admin la procese
    const requestPayload = {
      user_name,
      user_email: user_email.trim().toLowerCase(),
      user_phone,
      subject: formData.subject,
      message: finalMessage,
      status: 'pending', // 'pending', 'accepted', 'rejected', 'replied'
      date: new Date().toISOString()
    };

    setLoading(true);

    api.post('/requests', requestPayload)
      .then(res => {
        Swal.fire({
          ...darkSwal,
          icon: 'success',
          title: '¡Solicitud Enviada!',
          text: 'Nuestro equipo evaluará tu consulta y te responderá pronto.',
          confirmButtonColor: '#10b981'
        });
        setFormData(prev => ({ ...prev, message: '' })); // Limpiamos mensaje
      })
      .catch(err => {
        console.error(err);
        Swal.fire({
          ...darkSwal,
          icon: 'error',
          title: 'Error',
          text: 'No pudimos procesar tu solicitud en este momento. Inténtalo más tarde.'
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return {
    formData,
    setFormData,
    loading,
    handleChange,
    sendEmail
  };
};
