import { useState, useEffect } from 'react';
import api from '../../services/api';

export const useCreditSimulatorLogica = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // State for additional logistics (Automatic)
  const [shipping, setShipping] = useState(0);
  const [insurance, setInsurance] = useState(0);
  
  // Credit details
  const [downPaymentPerc, setDownPaymentPerc] = useState(20);
  const [termMonths, setTermMonths] = useState(72);
  const [interestRate, setInterestRate] = useState(9.5);
  
  // State for required documents
  const [documents, setDocuments] = useState({
    idCardFront: null,
    idCardBack: null,
    employmentOrder: null,
    paymentStubs: null,
    salaryConfirmation: null
  });

  // Fetch logic for credit simulator vehicles
  useEffect(() => {
    setLoading(true);
    api.get('/vehicles')
      .then(res => {
        // Soporta tanto la respuesta antigua (array) como la nueva (paginada: { data: [] })
        const vehiclesData = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setVehicles(vehiclesData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading credit simulator vehicles:", err);
        setLoading(false);
      });
  }, []);

  // Update logistics automatically when vehicle changes
  useEffect(() => {
    if (selectedVehicle && selectedVehicle.name) {
      const name = String(selectedVehicle.name).toLowerCase();
      const isBig = name.includes('4x4') || name.includes('suv') || name.includes('hilux') || name.includes('ranger') || name.includes('prado') || name.includes('porter') || name.includes('bongo');
      
      const autoShipping = isBig ? 2800 : 1800;
      const vehiclePrice = Number(selectedVehicle.price) || 0;
      const autoInsurance = (vehiclePrice / 520) * 0.015;

      setShipping(autoShipping);
      setInsurance(Math.round(autoInsurance));
      setDownPaymentPerc(20);
    } else {
      setShipping(0);
      setInsurance(0);
    }
  }, [selectedVehicle]);

  const handleVehicleSelect = (idStr) => {
    if (!idStr) {
      setSelectedVehicle(null);
      return;
    }
    const vehicle = vehicles.find(v => v.id && v.id.toString() === idStr.toString());
    setSelectedVehicle(vehicle || null);
  };

  const handleDocumentUpload = (name, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocuments(prev => ({ ...prev, [name]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const priceFob = selectedVehicle ? selectedVehicle.price : 0;
  const cifValue = priceFob > 0 ? (priceFob / 520) + shipping + insurance : 0;
  const selectiveTax = cifValue * 0.20;
  const vatTax = (cifValue + selectiveTax) * 0.13;
  const otherTaxes = cifValue * 0.05;
  const totalTaxes = selectedVehicle ? (selectiveTax + vatTax + otherTaxes) : 0;
  const registrationFees = selectedVehicle ? 800 : 0;
  const totalCostUSD = cifValue + totalTaxes + registrationFees;
  const totalCostCRC = totalCostUSD * 520;
  const loanAmount = totalCostCRC * ((100 - downPaymentPerc) / 100);
  const monthlyRate = (interestRate / 100) / 12;
  const monthlyPayment = loanAmount > 0 
    ? (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths))
    : 0;

  return {
    vehicles,
    selectedVehicle,
    loading,
    shipping,
    insurance,
    downPaymentPerc,
    termMonths,
    interestRate,
    calculations: { priceFob, cifValue, totalTaxes, totalCostCRC, monthlyPayment, loanAmount },
    documents,
    handleVehicleSelect,
    handleDocumentUpload,
    setShipping,
    setInsurance,
    setDownPaymentPerc,
    setTermMonths
  };
};
