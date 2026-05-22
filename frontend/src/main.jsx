import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

// Validadores Globales de Input
document.addEventListener('keydown', (e) => {
  const target = e.target;
  if (!target || (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA')) return;
  
  const isPhone = target.type === 'tel' || 
                  (target.name && (target.name.toLowerCase().includes('telefono') || target.name.toLowerCase().includes('phone'))) ||
                  (target.id && (target.id.toLowerCase().includes('telefono') || target.id.toLowerCase().includes('phone'))) || 
                  (target.placeholder && target.placeholder.toLowerCase().includes('teléfono'));

  // 1. Evitar "-" en todos los lados, EXCEPTO en números de teléfono.
  if (e.key === '-') {
    if (!isPhone) {
      e.preventDefault();
    }
  }

  // 2. En campos tipo número: evitar números negativos o notación exponencial (e, E, +, -)
  if (target.type === 'number') {
    if (['e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault();
    }
  }
});

document.addEventListener('paste', (e) => {
  const target = e.target;
  if (!target || (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA')) return;
  
  const isPhone = target.type === 'tel' || 
                  (target.name && (target.name.toLowerCase().includes('telefono') || target.name.toLowerCase().includes('phone'))) ||
                  (target.id && (target.id.toLowerCase().includes('telefono') || target.id.toLowerCase().includes('phone'))) || 
                  (target.placeholder && target.placeholder.toLowerCase().includes('teléfono'));

  const pastedData = (e.clipboardData || window.clipboardData).getData('text');

  // Si no es un campo telefónico y lo pegado contiene un guion (-), bloqueamos preventivamente.
  if (!isPhone && pastedData.includes('-')) {
    e.preventDefault();
  }

  // Si es un text/num field y lo pegado contiene caracteres matemáticos exponenciales.
  if (target.type === 'number') {
    if (['e', 'E', '+', '-'].some(char => pastedData.includes(char))) {
      e.preventDefault();
    }
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
