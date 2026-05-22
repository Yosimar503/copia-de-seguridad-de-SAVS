import React, { useState, useEffect } from "react";
import { useRedireccionContactosLogica } from "./RedireccionContactosLogica";
import { Clock, MapPin, Phone, Mail, Send, Car } from 'lucide-react';
import { useLocation } from "react-router-dom";
import FacebookPromo from '../../../FacebookPromo/FacebookPromo';
import "./DiseñoContacto.css";

const RedireccionContactos = () => {
  const { formData, loading, handleChange, sendEmail, setFormData } = useRedireccionContactosLogica();
  const [settings, setSettings] = useState(null);
  const [activeMap, setActiveMap] = useState('');
  const location = useLocation();
  const initialVehicle = location.state?.vehicle;

  useEffect(() => {
    // Carga de configuración dinámica
    fetch('http://localhost:5000/settings')
      .then(res => res.ok ? res.json() : null)
      .then(data => setSettings(data))
      .catch(err => console.error("Error fetching settings:", err));

    // Carga de sedes desde el nuevo endpoint
    fetch('http://localhost:5000/branches')
      .then(res => res.ok ? res.json() : [])
      .then(data => setBranches(data))
      .catch(err => console.error("Error fetching branches:", err));

    // Lógica para pre-seleccionar asunto (Test Drive)
    const params = new URLSearchParams(location.search);
    const subjectParam = params.get('subject');
    if (subjectParam) {
      setFormData(prev => ({ ...prev, subject: subjectParam }));
    } else if (initialVehicle) {
      setFormData(prev => ({ ...prev, subject: 'Cotización de vehículo' }));
    }
  }, [location.search, setFormData, initialVehicle]);

  const [branches, setBranches] = useState([]);
  
  // Datos estáticos de respaldo por si el fetch falla o es lento
  const defaultBranches = [
    {
      id: "heredia",
      name: "Sede Heredia",
      location: "C.C. Real Cariari, Heredia (BeeWorking)",
      phone: "+506 6476-9091",
      schedule: "L-V: 8:00 AM - 5:00 PM",
      map_embed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3929.5855260026214!2d-84.16194218520268!3d9.98198589286378!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8fa0fb060411b931%3A0xeab308c10b981!2sBoulevard+Cariari!5e0!3m2!1ses!2scr!4v1711200000000"
    },
    {
      id: "puntarenas",
      name: "Sede Puntarenas",
      location: "Chacarita, Puntarenas (Frente a Femsa)",
      phone: "+506 6476-9091",
      schedule: "L-V: 8:00 AM - 5:00 PM",
      map_embed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3930.2225!2d-84.7666!3d9.9850!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8fa01bd!2sPuntarenas!5e0!3m2!1ses!2scr!4v1711200000000"
    }
  ];

  const branchHeredia = (branches.length > 0 ? branches : defaultBranches).find(b => b.id === 'heredia');
  const branchPuntarenas = (branches.length > 0 ? branches : defaultBranches).find(b => b.id === 'puntarenas');

  return (
    <div className="paginaContacto">
      <div style={{ paddingTop: '100px' }}></div>

      <header className="headerContacto">
        <div className="headerInfo">
          <h1>Contacta con Importadora SAVS</h1>
          <p>Expertos en importación directa. Tu próximo vehículo de alta gama está a un mensaje de distancia.</p>
        </div>
        <div className="headerPromoContainer">
          <FacebookPromo 
            type="horizontal" 
            className="header-promo" 
            reverse={false}
            title="Únete a la Comunidad"
            desc="Sé el primero en ver los nuevos ingresos y primicias de importación."
          />
        </div>
      </header>

      <section className="contenidoContacto" style={{ gap: '20px', paddingBottom: '100px' }}>
        {/* Lado Izquierdo: Formulario */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {initialVehicle && (
            <div style={{ 
              background: '#000', 
              padding: '20px', 
              borderRadius: '12px', 
              border: '1px solid rgba(234, 179, 8, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              animation: 'fadeIn 0.5s ease'
            }}>
              <div style={{ background: '#eab308', padding: '10px', borderRadius: '8px' }}>
                <Car color="#000" size={24} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#eab308', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '1px' }}>Unidad de Interés</p>
                <p style={{ margin: 0, fontSize: '1.2rem', color: '#fff', fontWeight: 700 }}>{initialVehicle.name}</p>
              </div>
            </div>
          )}

          <form className="formulario" onSubmit={sendEmail} style={{ width: '100%', padding: '40px', boxSizing: 'border-box' }}>
            <h2 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '2rem', fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>
              <Mail style={{ verticalAlign: 'middle', marginRight: '15px' }} color="#eab308" size={32} />
              Redactar Consulta
            </h2>
            
            <input 
              name="user_name"
              value={formData.user_name}
              onChange={handleChange}
              placeholder="Nombre y Apellidos" 
              required 
              style={{ padding: '16px', fontSize: '1rem', borderRadius: '8px' }}
            />
            
            <input 
              name="user_email"
              value={formData.user_email}
              onChange={handleChange}
              type="email" 
              placeholder="Correo Electrónico" 
              required 
              style={{ padding: '16px', fontSize: '1rem', borderRadius: '8px' }}
            />

            <input 
              name="user_phone"
              value={formData.user_phone}
              onChange={handleChange}
              type="tel" 
              placeholder="Número de Teléfono (+506...)" 
              required 
              style={{ padding: '16px', fontSize: '1rem', borderRadius: '8px' }}
            />

            <select 
              name="subject"
              value={formData.subject || ""}
              onChange={handleChange}
              required
              style={{ padding: '16px', fontSize: '1rem', borderRadius: '8px' }}
            >
              <option value="" disabled>Motivo del Contacto</option>
              <option value="Consulta General">Consulta General</option>
              <option value="Test Drive">Programar Test Drive</option>
              <option value="Asesoría de crédito">Asesoría de Crédito</option>
              <option value="Servicio Post-Venta">Servicio Post-Venta</option>
            </select>

            <textarea 
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Describe detalladamente tu consulta..." 
              required
              style={{ padding: '16px', fontSize: '1rem', height: '180px', borderRadius: '8px' }}
            />

            <button type="submit" className="btnEnviar" disabled={loading} style={{ padding: '18px', fontSize: '1.1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              {loading ? 'Transmitiendo...' : <><Send size={22} /> Enviar Mensaje</>}
            </button>

            {/* WhatsApp Chat Section */}
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
              <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '15px' }}>¿Prefieres chatear directamente?</p>
              <a 
                href={`https://wa.me/${settings?.company?.whatsapp?.replace(/\D/g, '')}`} 
                target="_blank" 
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  backgroundColor: '#25D366',
                  color: '#fff',
                  padding: '14px 30px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  boxShadow: '0 8px 20px rgba(37, 211, 102, 0.25)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 12px 25px rgba(37, 211, 102, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(37, 211, 102, 0.25)';
                }}
              >
                <svg 
                  viewBox="0 0 24 24" 
                  width="26" 
                  height="26" 
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                Chat de WhatsApp
              </a>
            </div>
          </form>
          
        </div>

        {/* Lado Derecho: Info y Sedes (Expandido) */}
        <div className="infoContacto" style={{ flex: '1.5', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="branches-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '15px' 
          }}>
            {(branches.length > 0 ? branches : defaultBranches).map((branch) => (
              <div 
                key={branch.id}
                className={`cardDireccion ${activeMap === branch.id ? 'wp-card-highlight' : ''}`}
                onClick={() => setActiveMap(branch.id)}
                style={{ 
                  cursor: 'pointer', 
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', 
                  padding: '20px',
                  border: activeMap === branch.id ? '1px solid #eab308' : '1px solid rgba(255,255,255,0.05)',
                  background: activeMap === branch.id ? 'rgba(234, 179, 8, 0.05)' : 'rgba(255,255,255,0.02)',
                  borderRadius: '12px'
                }}
              >
                <h3 style={{ margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: 700, textTransform: 'capitalize' }}>
                  <MapPin size={20} color="#eab308" /> {branch.name}
                </h3>
                <p style={{ margin: '12px 0', color: '#9ca3af', fontSize: '0.9rem', lineHeight: '1.4', textTransform: 'capitalize' }}>{branch.location}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: '#eab308', fontSize: '0.8rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={12} /> {branch.phone}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={12} /> {branch.schedule}</span>
                </div>
              </div>
            ))}
          </div>
 
          {/* Mapa Visual */}
          <div className="mapa" style={{ 
            height: '450px', 
            boxShadow: '0 20px 50px rgba(0,0,0,0.7)', 
            border: '1px solid rgba(234, 179, 8, 0.35)', 
            borderRadius: '15px',
            overflow: 'hidden'
          }}>
             {(() => {
               const activeBranch = (branches.length > 0 ? branches : defaultBranches).find(b => b.id === activeMap) || (branches.length > 0 ? branches[0] : defaultBranches[0]);
               return (
                 <iframe 
                    title="Mapa savs interactivo"
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }}
                    src={activeBranch?.map_embed}
                    allowFullScreen="" 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                  />
               );
             })()}
          </div>
        </div>
      </section>
    </div>
  );
};

export default RedireccionContactos;
