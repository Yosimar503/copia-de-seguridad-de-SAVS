import { useState, useEffect } from 'react';
import api from '../../services/api';

export const useHomeLogica = () => {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    api.get('/vehicles')
      .then(res => setVehicles(res.data || []))
      .catch(err => console.error("Error loading home vehicles:", err));
  }, []);

  const safeVehicles = Array.isArray(vehicles) ? vehicles : [];

  const motorCatalogo = safeVehicles.slice(0, 3);
  const kilometrajeCatalogo = safeVehicles.slice(3, 6);
  const tipoCatalogo = safeVehicles.slice(6, 9);
  const anioCatalogo = safeVehicles.slice(9, 12);

  return {
    motorCatalogo,
    kilometrajeCatalogo,
    tipoCatalogo,
    anioCatalogo
  };
};
