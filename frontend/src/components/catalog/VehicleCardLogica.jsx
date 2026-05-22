import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

// Helper para SweetAlert con estilo oscuro
const darkSwal = {
  background: '#0a0a0a',
  color: '#fff',
  confirmButtonColor: '#eab308'
};

export const useVehicleCardLogica = (vehicleId) => {
  const [isFavorite, setIsFavorite] = useState(false);

  // Al cargar el componente, verificamos si el vehículo está en favoritos de la sesión
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      // Asegurar que comparamos strings para evitar errores de tipo
      setIsFavorite(user.favorites?.map(String).includes(String(vehicleId)) || false);
    }
  }, [vehicleId]);

  const getTagClass = (tag) => {
    switch(tag) {
      case 'Nuevo': return 'tag-new';
      case 'Recomendado': return 'tag-recommended';
      case 'Oferta': return 'tag-offer';
      default: return 'tag-default';
    }
  };

  const toggleFavorite = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation(); // Evitar navegar a detalles al dar click al corazón
    }
    
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      Swal.fire({
        ...darkSwal,
        icon: 'info',
        title: '¡Añade a favoritos!',
        text: 'Debes iniciar sesión para guardar tus favoritos.'
      });
      return;
    }

    const user = JSON.parse(savedUser);
    
    if (!user.id) {
      Swal.fire({
        ...darkSwal,
        icon: 'error',
        title: 'Sesión Inválida',
        text: 'Tu sesión ha expirado o es antigua. Por favor, cierra sesión e inicia de nuevo.'
      });
      return;
    }

    let updatedFavorites = Array.isArray(user.favorites) ? [...user.favorites] : [];
    const vidStr = String(vehicleId);

    if (isFavorite) {
      updatedFavorites = updatedFavorites.filter(id => String(id) !== vidStr);
    } else {
      updatedFavorites.push(vidStr);
    }

    try {
      // Sincronizar con el servidor (CRUD - Update)
      const res = await fetch(`http://localhost:5000/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorites: updatedFavorites })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al sincronizar favoritos con el servidor.');
      }

      // Actualizar estado local y sesión activa
      setIsFavorite(!isFavorite);
      user.favorites = updatedFavorites;
      localStorage.setItem('user', JSON.stringify(user));
      
      if (!isFavorite) {
        toast.success('Añadido a favoritos', { icon: '⭐' });
      } else {
        toast('Eliminado de favoritos');
      }

    } catch (err) {
      console.error("Error al guardar favorito:", err);
      Swal.fire({ 
        ...darkSwal,
        icon: 'error', 
        title: 'Error de Red', 
        text: 'Asegúrate de que el servidor esté encendido o intenta cerrar y abrir sesión de nuevo.' 
      });
    }
  };

  return { isFavorite, getTagClass, toggleFavorite };
};
