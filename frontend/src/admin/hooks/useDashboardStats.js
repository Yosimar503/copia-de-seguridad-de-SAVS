import { useState, useCallback } from 'react';
import { fetchDashboardData } from '../services/dashboardService';
import { adminVehiclesService } from '../services/vehiclesService';
import { saleRequestsService } from '../services/saleRequestsService';
import { getApiErrorMessage } from '../services/client';

/**
 * Estadísticas, gráficas y acciones del dashboard admin.
 */
export function useDashboardStats() {
  const [stats, setStats] = useState({
    vehicles: 0,
    users: 0,
    requests: 0,
    reviews: 0,
    tradeIn: 0,
    serverStatus: { is_online: true, status_text: 'SISTEMA ACTIVO' },
  });
  const [dataSets, setDataSets] = useState({
    fuelData: [],
    transData: [],
    yearData: [],
    reqData: [],
    tradeInData: [],
  });
  const [tradeInList, setTradeInList] = useState([]);
  const [vehicleList, setVehicleList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchDashboardData();
      setStats(result.stats);
      setDataSets(result.dataSets);
      setVehicleList(result.vehicleList);
      setTradeInList(result.tradeInList);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteVehicle = useCallback(
    async (id) => {
      await adminVehiclesService.delete(id);
      await refetch();
    },
    [refetch]
  );

  const updateTradeInStatus = useCallback(
    async (id, newStatus, message = '') => {
      await saleRequestsService.updateStatus(id, newStatus, message);
      await refetch();
    },
    [refetch]
  );

  return {
    stats,
    dataSets,
    tradeInList,
    vehicleList,
    loading,
    error,
    refetch,
    deleteVehicle,
    updateTradeInStatus,
  };
}

export default useDashboardStats;
