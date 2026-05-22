import React from 'react';
import { ArrowLeft, ChevronRight, Zap, Shield, Sparkles, Navigation } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useVehicleDetailsLogica } from './VehicleDetailsLogica';
import api from '../../services/api';
import VehicleCarousel from '../../components/VehicleCarousel/VehicleCarousel';
import ShimmerText from '../../components/ShimmerText/ShimmerText';
import FacebookPromo from '../../components/FacebookPromo/FacebookPromo';
import './VehicleDetails.css';

const localImages = import.meta.glob('../../carros/*.{jpg,jpeg,png,webp,avif}', { eager: true, import: 'default' });

const VehicleDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [vehicle, setVehicle] = React.useState(location.state?.vehicle);
  const [loading, setLoading] = React.useState(!location.state?.vehicle || !(location.state?.vehicle.engine_size || location.state?.vehicle.motor));
  const { getMonthlyPayment } = useVehicleDetailsLogica(vehicle);

  React.useEffect(() => {
    // Si no tenemos ID y no tenemos datos del vehículo desde el state, no podemos cargar
    if (!id && !vehicle?.id) {
      navigate('/inventory', { replace: true });
      return;
    }

    const needsUpdate = !vehicle || !(vehicle.engine_size || vehicle.motor);
    
    if (needsUpdate) {
      setLoading(true);
      const vehicleId = id || vehicle.id;
      
      api.get(`/vehicles/${vehicleId}`)
        .then(res => {
          setVehicle(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error al refrescar datos del vehículo:", err);
          setLoading(false);
        });
    } else {
        setLoading(false);
    }
  }, [id, vehicle?.id, navigate]);

  if (loading) return <div className="loading-container"><div className="loader"></div><span>Cargando detalles técnicos...</span></div>;
  if (!vehicle) return <div style={{marginTop: '100px', textAlign: 'center', color: '#fff'}}>Vehículo no encontrado. Redirigiendo...</div>;


  return (
    <div className="vehicle-details-page">
      {/* 1. Header / Hero Section */}
      <section className="details-hero">
        <img 
          src={localImages[vehicle.image] || vehicle.image} 
          alt={vehicle.name || vehicle.modelo} 
          className="hero-background-img"
          referrerPolicy="no-referrer"
        />
        <div className="details-hero-overlay"></div>
        <div className="container details-hero-content">
          <button 
            className="back-btn" 
            onClick={() => navigate(-1)}
            aria-label="Volver"
          >
            <ArrowLeft size={20} />
            Volver
          </button>

          <span className="hero-tag right-tag">{vehicle.tag || 'NUEVO INGRESO'}</span>
          
          <div className="hero-text-content">
            <ShimmerText className="hero-title" text={vehicle.name || `${vehicle.marca} ${vehicle.modelo}`} as="h1" />
            <p className="hero-subtitle">{vehicle.heroSubtitle || 'Importado con los más altos estándares de calidad. Diseñado para brindar rendimiento y confiabilidad excepcionales.'}</p>
            
            <div className="hero-stats-row">
              <div className="hero-stat">
                <span className="stat-label">Año</span>
                <span className="stat-value">{vehicle.year || vehicle.anio}</span>
              </div>
              <div className="stat-divider"></div>
              <div className="hero-stat">
                <span className="stat-label">Precio</span>
                <ShimmerText className="stat-value" text={`₡${Number(vehicle.price || vehicle.precio).toLocaleString('es-CR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} as="span" shimmerWidth={100} />
              </div>
              <div className="stat-divider"></div>
              <div className="hero-stat">
                <span className="stat-label">Cuota desde</span>
                <ShimmerText className="stat-value" text={`₡${getMonthlyPayment().toLocaleString('es-CR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/mes`} as="span" shimmerWidth={100} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Especificaciones Técnicas */}
      <section className="specs-section container wrapper-padding">
        <h2 className="section-heading">Ingeniería que Inspira</h2>
        
        <div className="specs-cards-grid">
          <div className="spec-card">
            <div className="spec-icon-wrapper"><Zap size={24} /></div>
            <h3 className="spec-title">Motorización</h3>
            <p className="spec-data">{vehicle.motor}</p>
            <p className="spec-desc">{vehicle.specDescriptions?.motor || 'Poder inmediato y respuesta aerodinámica superior.'}</p>
          </div>
          
          <div className="spec-card">
            <div className="spec-icon-wrapper"><Navigation size={24} /></div>
            <h3 className="spec-title">Dinámica de Conducción</h3>
            <p className="spec-data">{vehicle.performanceData || 'Alto rendimiento'}</p>
            <p className="spec-desc">{vehicle.specDescriptions?.rendimiento || 'Precisión y estabilidad en cada situación de manejo.'}</p>
          </div>

          <div className="spec-card">
            <div className="spec-icon-wrapper"><Sparkles size={24} /></div>
            <h3 className="spec-title">Historial de Unidad</h3>
            <p className="spec-data">{vehicle.mileage}</p>
            <p className="spec-desc">{vehicle.specDescriptions?.historial || 'Revisado y certificado por nuestros expertos bajo estándares premium.'}</p>
          </div>

          <div className="spec-card">
            <div className="spec-icon-wrapper"><Shield size={24} /></div>
            <h3 className="spec-title">Transmisión</h3>
            <p className="spec-data">{vehicle.transmission}</p>
            <p className="spec-desc">{vehicle.specDescriptions?.transmission || 'Gestión optimizada para máxima eficiencia.'}</p>
          </div>
        </div>

        <div className="technical-grid" style={{ marginTop: '4rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="tech-item" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <span style={{ color: '#9ca3af', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Cilindraje</span>
            <span style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600' }}>{vehicle.engine_size || 'N/D'}</span>
          </div>
          <div className="tech-item" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <span style={{ color: '#9ca3af', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Tipo de Motor</span>
            <span style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600' }}>{vehicle.motor || 'N/D'}</span>
          </div>
          <div className="tech-item" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <span style={{ color: '#9ca3af', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Puertas</span>
            <span style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600' }}>{vehicle.doors || 'N/D'} Puertas</span>
          </div>
          <div className="tech-item" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <span style={{ color: '#9ca3af', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Capacidad</span>
            <span style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600' }}>{vehicle.passengers || 'N/D'} Pasajeros</span>
          </div>
          <div className="tech-item" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <span style={{ color: '#9ca3af', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Tracción</span>
            <span style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600' }}>{vehicle.drive || 'N/D'}</span>
          </div>
          <div className="tech-item" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <span style={{ color: '#9ca3af', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Dirección</span>
            <span style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600' }}>{vehicle.steering || 'N/D'}</span>
          </div>
          <div className="tech-item" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <span style={{ color: '#9ca3af', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Combustible</span>
            <span style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600' }}>{vehicle.fuel || 'N/D'}</span>
          </div>
          <div className="tech-item" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <span style={{ color: '#9ca3af', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Color Exterior</span>
            <span style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600' }}>{vehicle.color || 'N/D'}</span>
          </div>
        </div>
        
        <div style={{ marginTop: '3rem' }}>
          <FacebookPromo type="banner" reverse={true} />
        </div>
      </section>

      <section className="vehicle-gallery-section" style={{ margin: '6rem 0', backgroundColor: '#080808', position: 'relative' }}>
        <div className="container" style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
          <ShimmerText className="section-heading" text="Explora Cada Detalle" as="h2" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }} />
          <p style={{ color: '#9ca3af', fontSize: '1.1rem', letterSpacing: '2px', textTransform: 'uppercase' }}>Vistas Exclusivas del Modelo</p>
        </div>
        <VehicleCarousel vehicle={vehicle} />
      </section>

      <section className="features-section">
        <div className="container wrapper-padding">
          <h2 className="section-heading centered">Conoce más sobre este vehículo</h2>
          
          <div className="summary-block">
            <p className="summary-text" style={{ fontSize: '1.4rem', lineHeight: '1.8', color: '#d1d5db', textAlign: 'center', maxWidth: '900px', margin: '0 auto', paddingBottom: '3rem' }}>
              {vehicle.summary || "Vehículo disponible para entrega y cotización. Importado desde Corea bajo los más exigentes estándares de calidad."}
            </p>
            
            <div className="autowini-features" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginTop: '3rem' }}>
              {(vehicle.features || [
                { icon: 'Shield', title: 'Origen Certificado', text: 'Importado directamente a través de canales exclusivos desde Corea del Sur como Autowini, garantizando una procedencia segura.' },
                { icon: 'Sparkles', title: 'Respaldo SAVS', text: 'Cada unidad que ofrecemos ha sido minuciosamente inspeccionada en motor, chasis y electrónica localmente por nuestro equipo experto.' },
                { icon: 'Navigation', title: 'Listo para Circular', text: 'Nuestros modelos son entregados en estado impecable. Completamos revisiones preventivas para que disfrutes tu inversión de forma inmediata.' }
              ]).map((feature, idx) => {
                const IconMap = { Shield, Sparkles, Navigation };
                const FeatureIcon = IconMap[feature.icon] || Shield;
                return (
                  <div key={idx} className="feature-card" style={{ background: 'rgba(15,15,15,0.6)', padding: '2.5rem', borderRadius: '16px', border: '1px solid rgba(234, 179, 8, 0.2)', transition: 'transform 0.3s ease' }}>
                    <h4 style={{ color: '#eab308', marginBottom: '1.2rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.8rem', fontFamily: 'Outfit, sans-serif' }}>
                      <FeatureIcon size={24} /> {feature.title}
                    </h4>
                    <p style={{ color: '#9ca3af', lineHeight: '1.7' }}>{feature.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container cta-content">
          <h2 className="cta-title">Dé el Siguiente Paso</h2>
          <p className="cta-subtitle">Nuestros asesores premium están listos para guiarle a través del proceso de financiamiento o coordinar una visita exclusiva.</p>
          
          <div className="cta-buttons">
            <button 
              className="btn btn-primary btn-lg"
              onClick={() => navigate('/contact?subject=Test Drive', { state: { vehicle } })}
            >
              Agendar un Test Drive VIP
            </button>
            <button 
              className="btn btn-outline btn-lg" 
              onClick={() => navigate('/contact', { state: { vehicle } })}
            >
              Solicitar Cotización Formal &rarr;
            </button>
          </div>
          
          <p className="cta-disclaimer">Aprobación de financiamiento sujeta a análisis crediticio. Garantía extendida disponible.</p>
        </div>
      </section>
    </div>
  );
};

export default VehicleDetails;
