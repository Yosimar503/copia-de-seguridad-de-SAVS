import { adminVehiclesService } from './vehiclesService';
import { usersService } from './usersService';
import { requestsService } from './requestsService';
import { reviewsService } from './reviewsService';
import { saleRequestsService } from './saleRequestsService';
import { settingsService } from './settingsService';

/**
 * Carga paralela de datos para el dashboard administrativo.
 */
export async function fetchDashboardData() {
  const [vehicles, users, requests, reviews, saleRequests, settings] =
    await Promise.allSettled([
      adminVehiclesService.getAll(),
      usersService.getAll(),
      requestsService.getAll(),
      reviewsService.getAll(),
      saleRequestsService.getAll(),
      settingsService.getAll(),
    ]);

  const pick = (result, fallback = []) =>
    result.status === 'fulfilled' ? result.value : fallback;

  const vehiclesRaw = pick(vehicles, []);
  const { items: vehicleList, total: vehicleTotal } =
    adminVehiclesService.normalizeList(vehiclesRaw);

  const userList = pick(users, []);
  const requestList = pick(requests, []);
  const reviewList = pick(reviews, []);
  const saleRequestList = pick(saleRequests, []);
  const settingsData = pick(settings, {});

  const safeV = vehicleList;
  const safeReq = requestList;
  const safeSreq = saleRequestList;

  const fuelMap = safeV.reduce((acc, curr) => {
    const type = curr.fuel || 'No especificado';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  const fuelData = Object.keys(fuelMap).map((name) => ({ name, value: fuelMap[name] }));

  const transMap = safeV.reduce((acc, curr) => {
    const type = curr.transmission || 'No especificado';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  const transData = Object.keys(transMap).map((name) => ({ name, value: transMap[name] }));

  const yearMap = safeV.reduce((acc, curr) => {
    const year = curr.year || curr.anio || 'N/D';
    acc[year] = (acc[year] || 0) + 1;
    return acc;
  }, {});
  const yearData = Object.keys(yearMap)
    .sort()
    .map((year) => ({ year, cantidad: yearMap[year] }));

  const statusMap = {
    pending: 'Pendiente',
    accepted: 'Aprobada',
    rejected: 'Rechazada',
    replied: 'Respondida',
  };
  const reqMap = safeReq.reduce((acc, curr) => {
    const status = statusMap[curr.status] || curr.status || 'Pendiente';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  const reqData = Object.keys(reqMap).map((name) => ({ name, value: reqMap[name] }));

  const tradeInMap = safeSreq.reduce((acc, curr) => {
    const status = curr.estado || 'En revisión';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  const tradeInData = Object.keys(tradeInMap).map((name) => ({ name, value: tradeInMap[name] }));

  return {
    stats: {
      vehicles: vehicleTotal,
      users: userList.length,
      requests: requestList.length,
      reviews: reviewList.length,
      tradeIn: saleRequestList.length,
      serverStatus: settingsData?.server_status ?? {
        is_online: true,
        status_text: 'SISTEMA ACTIVO',
      },
    },
    dataSets: { fuelData, transData, yearData, reqData, tradeInData },
    vehicleList: safeV.slice().sort((a, b) => (b.id - a.id)),
    tradeInList: safeSreq.slice().sort((a, b) => (b.id - a.id)),
    raw: {
      vehicles: vehiclesRaw,
      users: userList,
      requests: requestList,
      reviews: reviewList,
      saleRequests: saleRequestList,
      settings: settingsData,
    },
  };
}

export const dashboardService = {
  fetchDashboardData,
};
