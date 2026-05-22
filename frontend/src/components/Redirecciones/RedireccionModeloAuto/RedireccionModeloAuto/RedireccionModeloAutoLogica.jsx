import { useState, useEffect } from 'react';
import api from '../../../../services/api';

export const useRedireccionModeloAutoLogica = () => {
  const [autos, setAutos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filtros, setFiltros] = useState({
    año: '',
    marca: '',
    modelo: '',
    precioMin: '',
    precioMax: '',
    transmision: '',
    combustible: ''
  });

  useEffect(() => {
    api.get('/vehicles')
      .then(res => {
        setAutos(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching vehicles:", err);
        setLoading(false);
      });
  }, []);

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      año: '',
      marca: '',
      modelo: '',
      precioMin: '',
      precioMax: '',
      transmision: '',
      combustible: ''
    });
  };

  const autosFiltrados = (Array.isArray(autos) ? autos : []).filter(auto => {
    // Basic text match on brand/name
    const matchMarca = filtros.marca === '' || auto.name.toLowerCase().includes(filtros.marca.toLowerCase());
    const matchModelo = filtros.modelo === '' || auto.name.toLowerCase().includes(filtros.modelo.toLowerCase());
    
    // Year match
    const matchAño = filtros.año === '' || auto.year.toString() === filtros.año;
    
    // Price
    const min = filtros.precioMin ? parseInt(filtros.precioMin) : 0;
    const max = filtros.precioMax ? parseInt(filtros.precioMax) : Infinity;
    const matchPrecio = auto.price >= min && auto.price <= max;
    
    // Transmision / Combustible
    const matchTransmision = filtros.transmision === '' || auto.transmission.toLowerCase() === filtros.transmision.toLowerCase();
    const matchCombustible = filtros.combustible === '' || auto.fuel.toLowerCase() === filtros.combustible.toLowerCase();

    return matchMarca && matchModelo && matchAño && matchPrecio && matchTransmision && matchCombustible;
  });

  return {
    autos: autosFiltrados,
    loading,
    filtros,
    handleFiltroChange,
    limpiarFiltros
  };
};
