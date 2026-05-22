import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { vehicleService } from '../../services/api';

/**
 * Hook personalizado para manejar la lógica del catálogo conectada al Backend.
 * Implementa Tarea 2 (Integración) y Tarea 3 (Filtros dinámicos).
 */
export const useCatalogoLogica = () => {
  const location = useLocation();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1
  });

  const [expandedSection, setExpandedSection] = useState('technical');
  const [activeFilters, setActiveFilters] = useState({
    transmission: '', 
    fuel: '', 
    marca: '', 
    modelo: '', 
    type: '',
    minPrice: '', 
    maxPrice: '',
    minYear: '',
    maxYear: '',
    color: '',
    search: new URLSearchParams(location.search).get('search') || ''
  });

  // Función para cargar vehículos desde la API (Servidor)
  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      
      // Mapeamos los filtros activos a los parámetros que espera el Backend de Randy
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: activeFilters.search,
        type: activeFilters.type,
        fuel: activeFilters.fuel,
        transmission: activeFilters.transmission,
        minPrice: activeFilters.minPrice,
        maxPrice: activeFilters.maxPrice,
        minYear: activeFilters.minYear,
        maxYear: activeFilters.maxYear,
        color: activeFilters.color
      };

      // Tarea 2: Llamada real al servicio centralizado
      const response = await vehicleService.getAll(params);
      
      setVehicles(response.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 1
      }));
    } catch (error) {
      console.error("Error al cargar vehículos:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, activeFilters]);

  // Efecto para recargar cuando cambian los filtros o la página
  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // Manejadores de eventos
  const toggleSection = (section) => setExpandedSection(expandedSection === section ? null : section);

  const handleFilterChange = (name, value) => {
    setActiveFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Resetear a página 1 al filtrar
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setActiveFilters({
      transmission: '', fuel: '', marca: '', modelo: '', type: '',
      minPrice: '', maxPrice: '', minYear: '', maxYear: '', color: '',
      search: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return {
    expandedSection,
    activeFilters,
    loading,
    vehicles, // Ahora vienen del servidor
    pagination,
    toggleSection,
    handleFilterChange,
    handlePageChange,
    resetFilters,
    searchQueryParam: activeFilters.search
  };
};
