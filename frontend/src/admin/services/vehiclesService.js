import { vehicleService } from '../../services/api';

/** Reexporta y extiende el servicio de vehículos para el panel admin */
export const adminVehiclesService = {
  ...vehicleService,

  /** Normaliza respuesta paginada o array plano */
  normalizeList: (raw) => {
    if (Array.isArray(raw)) return { items: raw, total: raw.length };
    const items = raw?.data ?? [];
    const total = raw?.pagination?.total ?? items.length;
    return { items, total };
  },
};

export default adminVehiclesService;
