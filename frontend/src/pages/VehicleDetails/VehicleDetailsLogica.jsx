import { useEffect } from 'react';

export const useVehicleDetailsLogica = (vehicle) => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const getMonthlyPayment = () => {
    if (!vehicle) return 0;
    return Math.round(vehicle.price * 0.015);
  };

  return {
    getMonthlyPayment
  };
};
