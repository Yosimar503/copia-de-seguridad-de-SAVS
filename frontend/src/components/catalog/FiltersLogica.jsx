import { useState } from 'react';

export const useFiltersLogica = () => {
  const [activeYear, setActiveYear] = useState('2024');

  const years = ['2024', '2023', '2022', '< 2021'];
  
  const mileageRanges = [
    { label: 'Nuevo / Re-estrene (0 - 5,000 km)', count: 24 },
    { label: 'Semi-nuevos A (5,001 - 25,000 km)', count: 56 },
    { label: 'Semi-nuevos B (25,001 - 60,000 km)', count: 31 }
  ];

  return {
    activeYear,
    setActiveYear,
    years,
    mileageRanges
  };
};
