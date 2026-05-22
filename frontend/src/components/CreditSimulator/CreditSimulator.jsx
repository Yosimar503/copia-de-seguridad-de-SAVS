import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { 
  Car, 
  Ship, 
  FileText, 
  DollarSign, 
  Calculator, 
  ArrowRight,
  ChevronRight,
  Info,
  CreditCard
} from 'lucide-react';
import { useCreditSimulatorLogica } from './CreditSimulatorLogica';
import './CreditSimulator.css';

// Pre-load images outside the component for performance and to avoid re-renders
const localImages = import.meta.glob('../../img/*.{jpg,jpeg,png,webp,avif}', { eager: true, import: 'default' });

const CreditSimulator = () => {
  const {
    vehicles,
    selectedVehicle,
    loading,
    shipping,
    insurance,
    downPaymentPerc,
    termMonths,
    calculations,
    documents,
    handleVehicleSelect,
    handleDocumentUpload,
    setTermMonths
  } = useCreditSimulatorLogica();

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      Swal.fire({
        background: '#0a0a0a',
        color: '#fff',
        confirmButtonColor: '#eab308',
        icon: 'warning',
        title: 'Acceso Restringido',
        text: 'Debes iniciar sesión para realizar simulaciones de crédito y subir documentos.'
      }).then(() => {
        navigate('/login');
      });
    }
  }, [navigate]);

  useEffect(() => {
    const passedVehicle = location.state?.selectedVehicle;
    // When vehicles are fully loaded and a passed vehicle exists, auto-select it.
    if (passedVehicle && vehicles.length > 0) {
      handleVehicleSelect(passedVehicle.id);
      
      // We clear the location state via history replace to prevent re-triggering on future internal navigations
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicles.length, location.state?.selectedVehicle]);

  // Helper for CRC display
  const formatCRC = (val) => new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC' }).format(val);
  const formatUSD = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  if (loading) return <div className="loading-container"><div className="loader"></div><span>Cargando vehículos...</span></div>;

  return (
    <div className="simulator-page">
      <div className="container">
        <header className="simulator-header">
          <div className="header-badge">
            <Calculator size={16} />
            <span>Simulador de Crédito "Llave en Mano"</span>
          </div>
          <h1>Importa tu vehículo desde Corea</h1>
          <p>La calculadora automática de SAVS para importaciones.</p>
        </header>

        <div className="simulator-body">
          <div className="main-layout">
            <section className="form-card card-base">
              <div className="step-section">
                <div className="section-intro">
                  <div className="icon-box"><Car /></div>
                  <h3>Paso 1: ¿Cuál auto te gusta?</h3>
                </div>

                <div className="input-group full">
                  <label>Vehículo del Catálogo</label>
                  <div className="input-wrapper">
                      <select 
                        className="simulator-select" 
                        onChange={(e) => handleVehicleSelect(e.target.value)}
                        value={selectedVehicle?.id || ""}
                      >
                        <option value="">Selecciona un vehículo...</option>
                        {vehicles
                          .slice()
                          .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
                          .map(v => (
                            <option key={v.id} value={v.id}>
                              {v.name || 'Vehículo sin nombre'} ({v.year || 'N/A'}) - {formatCRC(v.price || 0)}
                            </option>
                          ))}
                      </select>
                  </div>
                </div>

                {selectedVehicle && (
                  <div className="vehicle-mini-preview">
                    {(() => {
                      const imgKey = Object.keys(localImages).find(k => k.includes(selectedVehicle.image));
                      const imageSrc = imgKey ? localImages[imgKey] : selectedVehicle.image;
                      return <img src={imageSrc} alt={selectedVehicle.name} />;
                    })()}
                    <div className="v-info">
                      <h4>{selectedVehicle.name}</h4>
                      <p>{selectedVehicle.motor} • {selectedVehicle.transmission}</p>
                      <p>Vía Marítima desde Corea</p>
                    </div>
                  </div>
                )}

                <div className="divider" />

                <div className="section-intro">
                  <div className="icon-box"><Ship /></div>
                  <h3>Paso 2: Datos de Importación (Automático)</h3>
                </div>

                <div className="input-row">
                  <div className="input-group">
                    <label>Flete Marítimo (Pusan - Moín)</label>
                    <div className="input-wrapper disabled">
                      <span className="prefix">$</span>
                      <input 
                        type="number" 
                        value={shipping} 
                        readOnly
                        disabled
                      />
                    </div>
                    <small>Calculado según el tamaño del auto.</small>
                  </div>
                  <div className="input-group">
                    <label>Seguro de Carga</label>
                    <div className="input-wrapper disabled">
                      <span className="prefix">$</span>
                      <input 
                        type="number" 
                        value={insurance} 
                        readOnly
                        disabled
                      />
                    </div>
                    <small>1.5% del valor FOB automático.</small>
                  </div>
                </div>

                <div className="divider" />

                <div className="section-intro">
                  <div className="icon-box"><CreditCard /></div>
                  <h3>Paso 3: Financiamiento Bancario</h3>
                </div>

                <div className="input-row">
                  <div className="input-group">
                    <label>Prima (%)</label>
                    <div className="input-wrapper disabled">
                      <input 
                        type="number" 
                        value={downPaymentPerc} 
                        readOnly
                        disabled
                      />
                      <span className="suffix">%</span>
                    </div>
                    <small>Prima mínima fija del 20%.</small>
                  </div>
                  <div className="input-group">
                    <label>Plazo (Meses)</label>
                    <div className="term-container">
                      <select 
                        className="simulator-select" 
                        value={termMonths} 
                        onChange={(e) => setTermMonths(parseInt(e.target.value))}
                      >
                        {[12, 24, 36, 48, 60, 72, 84, 96].map(m => (
                          <option key={m} value={m}>{m} meses</option>
                        ))}
                      </select>
                      <span className="term-years-badge">
                        {Math.floor(termMonths / 12)} {termMonths / 12 === 1 ? 'Año' : 'Años'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="divider" />

                <div className="section-intro">
                  <div className="icon-box"><FileText /></div>
                  <h3>Paso 4: Documentación Requerida</h3>
                </div>

                <div className="docs-grid">
                  <div className="doc-item">
                    <div className="doc-icon"><CreditCard size={20} /></div>
                    <div className="doc-info">
                      <p className="doc-name">Cédula (Frente)</p>
                      <span className="doc-status">Obligatorio</span>
                    </div>
                    {documents.idCardFront && <img src={documents.idCardFront} alt="Preview" className="doc-preview-small" />}
                    <label className="doc-action">
                      {documents.idCardFront ? 'Cambiar' : 'Subir'}
                      <input 
                        type="file" 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                        onChange={(e) => handleDocumentUpload('idCardFront', e.target.files[0])}
                      />
                    </label>
                  </div>
                  <div className="doc-item">
                    <div className="doc-icon"><CreditCard size={20} /></div>
                    <div className="doc-info">
                      <p className="doc-name">Cédula (Trasera)</p>
                      <span className="doc-status">Obligatorio</span>
                    </div>
                    {documents.idCardBack && <img src={documents.idCardBack} alt="Preview" className="doc-preview-small" />}
                    <label className="doc-action">
                      {documents.idCardBack ? 'Cambiar' : 'Subir'}
                      <input 
                        type="file" 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                        onChange={(e) => handleDocumentUpload('idCardBack', e.target.files[0])}
                      />
                    </label>
                  </div>
                  <div className="doc-item">
                    <div className="doc-icon"><FileText size={20} /></div>
                    <div className="doc-info">
                      <p className="doc-name">Orden patronal</p>
                      <span className="doc-status">Obligatorio</span>
                    </div>
                    {documents.employmentOrder && <img src={documents.employmentOrder} alt="Preview" className="doc-preview-small" />}
                    <label className="doc-action">
                      {documents.employmentOrder ? 'Cambiar' : 'Subir'}
                      <input 
                        type="file" 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                        onChange={(e) => handleDocumentUpload('employmentOrder', e.target.files[0])}
                      />
                    </label>
                  </div>
                  <div className="doc-item">
                    <div className="doc-icon"><DollarSign size={20} /></div>
                    <div className="doc-info">
                      <p className="doc-name">Últimas 2 colillas de pago</p>
                      <span className="doc-status">Obligatorio</span>
                    </div>
                    {documents.paymentStubs && <img src={documents.paymentStubs} alt="Preview" className="doc-preview-small" />}
                    <label className="doc-action">
                      {documents.paymentStubs ? 'Cambiar' : 'Subir'}
                      <input 
                        type="file" 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                        onChange={(e) => handleDocumentUpload('paymentStubs', e.target.files[0])}
                      />
                    </label>
                  </div>
                  <div className="doc-item">
                    <div className="doc-icon"><FileText size={20} /></div>
                    <div className="doc-info">
                      <p className="doc-name">Constancia de salario</p>
                      <span className="doc-status">Obligatorio</span>
                    </div>
                    {documents.salaryConfirmation && <img src={documents.salaryConfirmation} alt="Preview" className="doc-preview-small" />}
                    <label className="doc-action">
                      {documents.salaryConfirmation ? 'Cambiar' : 'Subir'}
                      <input 
                        type="file" 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                        onChange={(e) => handleDocumentUpload('salaryConfirmation', e.target.files[0])}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-footer">
                <button 
                  className="btn btn-primary full-btn" 
                  onClick={() => {
                    if (!selectedVehicle) {
                      Swal.fire({
                        background: '#0a0a0a',
                        color: '#fff',
                        confirmButtonColor: '#eab308',
                        icon: 'error',
                        title: 'Selecciona un vehículo',
                        text: 'Debes elegir un vehículo antes de exportar la cotización.'
                      });
                      return;
                    }

                    const missingDocs = [];
                    if (!documents.idCardFront) missingDocs.push('Cédula (Frente)');
                    if (!documents.idCardBack) missingDocs.push('Cédula (Trasera)');
                    if (!documents.employmentOrder) missingDocs.push('Orden Patronal');
                    if (!documents.paymentStubs) missingDocs.push('Colillas de Pago');
                    if (!documents.salaryConfirmation) missingDocs.push('Constancia de Salario');

                    if (missingDocs.length > 0) {
                      Swal.fire({
                        background: '#0a0a0a',
                        color: '#fff',
                        confirmButtonColor: '#eab308',
                        icon: 'warning',
                        title: 'Documentación incompleta',
                        text: `Debes subir los siguientes archivos obligatorios: ${missingDocs.join(', ')}.`
                      });
                      return;
                    }

                    window.print();
                  }}
                >
                  Exportar Cotización como PDF <ArrowRight />
                </button>
              </div>
            </section>

            <aside className="totals-sidebar">
              <div className="totals-card card-base">
                <h4 className="card-title">Resumen SAVS</h4>
                
                <div className="line-item">
                  <span>Precio FOB Corea</span>
                  <strong>{formatCRC(calculations.priceFob)}</strong>
                </div>
                <div className="line-item">
                  <span>Transporte Pusan - Costa Rica</span>
                  <strong>{formatUSD(shipping + insurance)}</strong>
                </div>
                <div className="line-item highlight">
                  <span>Subtotal CIF Aduanas</span>
                  <strong>{formatUSD(calculations.cifValue)}</strong>
                </div>

                <div className="divider" />
                
                <div className="line-item tax">
                  <span>Total Impuestos Hacienda</span>
                  <strong>{formatUSD(calculations.totalTaxes)}</strong>
                </div>
                <div className="line-item">
                  <span>Nacionalización (Legal)</span>
                  <strong>$800.00</strong>
                </div>

                <div className="grand-total">
                  <p>Inversión Total Llave en Mano</p>
                  <div className="amount">
                    <strong>{formatCRC(calculations.totalCostCRC)}</strong>
                  </div>
                </div>

                <div className="loan-preview">
                  <div className="loan-header">
                    <Calculator size={18} />
                    <span>Calculadora de Cuota</span>
                  </div>
                  <div className="monthly-payment">
                    <p>Cuota Mensual Estimada</p>
                    <h3>{formatCRC(calculations.monthlyPayment)}</h3>
                  </div>
                </div>
              </div>

              <div className="helper-box">
                <Info size={16} />
                <p>Las tasas de impuestos son estimadas según la ley vigente para autos de menos de 10 años.</p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditSimulator;
