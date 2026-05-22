import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Mail, AlertTriangle, CheckCircle, Loader2, ImagePlus, 
  Trash2, Megaphone, Users, Calendar, BarChart2, Clock 
} from 'lucide-react';
import { marketingService } from '../../admin/services';
import { getStoredAdminUser } from '../../admin/utils/auth';
import Swal from 'sweetalert2';

const darkSwal = { background: '#141414', color: '#fff', confirmButtonColor: '#eab308' };

// Mock data for history and metrics
const MOCK_HISTORY = [
  { id: 1, subject: 'Gran Venta de Verano', audience: 'Todos', status: 'Enviado', date: '2026-05-10 10:00', openRate: '45%', clickRate: '12%' },
  { id: 2, subject: 'Nuevos SUVs disponibles', audience: 'Leads', status: 'Enviado', date: '2026-05-05 14:30', openRate: '38%', clickRate: '8%' },
  { id: 3, subject: 'Tu próximo mantenimiento', audience: 'Clientes', status: 'Programado', date: '2026-05-25 09:00', openRate: '-', clickRate: '-' },
];

const MarketingBroadcast = () => {
    // ── Estado Email ──────────────────────────────────────────
    const [subject, setSubject]       = useState('');
    const [content, setContent]       = useState('');
    const [audience, setAudience]     = useState('todos');
    const [scheduleDate, setScheduleDate] = useState('');
    const [isLoading, setIsLoading]   = useState(false);
    const [previewMode, setPreviewMode] = useState(false);
    const [activeTab, setActiveTab]   = useState('compose'); // compose, history, banners

    // ── Estado Banners ────────────────────────────────────────
    const [banners, setBanners]           = useState([]);
    const [loadingBanners, setLoadingBanners] = useState(true);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [nuevaTitulo, setNuevaTitulo]   = useState('');
    const [nuevaDesc, setNuevaDesc]       = useState('');
    const [nuevaEnlace, setNuevaEnlace]   = useState('');
    const [imagenPreview, setImagenPreview] = useState(null);
    const [imagenFile, setImagenFile]     = useState(null);
    const fileInputRef = useRef();
    const [generatingIA, setGeneratingIA] = useState(false);
    const [isDragging, setIsDragging]     = useState(false);

    useEffect(() => {
        if (activeTab === 'banners') {
            cargarBanners();
        }
    }, [activeTab]);

    const cargarBanners = async () => {
        try {
            setLoadingBanners(true);
            const list = await marketingService.getBanners();
            setBanners(list);
        } catch (e) {
            console.error('Error cargando banners:', e);
        } finally {
            setLoadingBanners(false);
        }
    };

    const handleImagenSeleccionada = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImagenFile(file);
        setImagenPreview(URL.createObjectURL(file));
        analizarConIA(file);
    };

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => { setIsDragging(false); };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (!file || !file.type.startsWith('image/')) return;
        setImagenFile(file);
        setImagenPreview(URL.createObjectURL(file));
        analizarConIA(file);
    };

    const analizarConIA = async (file) => {
        if (!file) return;
        const formData = new FormData();
        formData.append('imagen', file);
        setGeneratingIA(true);
        try {
            const res = await marketingService.generateBannerCopy(formData);
            if (res.success) {
                setNuevaTitulo(res.titulo);
                setNuevaDesc(res.descripcion);
            }
        } catch (e) {
            console.error('Error IA:', e);
        } finally {
            setGeneratingIA(false);
        }
    };

    const handlePublicarBanner = async () => {
        if (!imagenFile || !nuevaTitulo.trim()) {
            Swal.fire({ ...darkSwal, title: 'Datos incompletos', icon: 'warning' });
            return;
        }
        const formData = new FormData();
        formData.append('imagen', imagenFile);
        formData.append('titulo', nuevaTitulo);
        formData.append('descripcion', nuevaDesc);
        formData.append('enlace', nuevaEnlace);

        setUploadingBanner(true);
        try {
            await marketingService.createBanner(formData);
            Swal.fire({ ...darkSwal, title: '¡Publicado!', icon: 'success' });
            setNuevaTitulo(''); setNuevaDesc(''); setNuevaEnlace(''); setImagenFile(null); setImagenPreview(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            cargarBanners();
        } catch (e) {
            Swal.fire({ ...darkSwal, title: 'Error', text: 'No se pudo publicar', icon: 'error' });
        } finally {
            setUploadingBanner(false);
        }
    };

    const handleEliminarBanner = async (id, titulo) => {
        const confirm = await Swal.fire({
            ...darkSwal, title: '¿Eliminar anuncio?', text: `"${titulo}" se eliminará.`, icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#ef4444'
        });
        if (!confirm.isConfirmed) return;
        try {
            await marketingService.deleteBanner(id);
            cargarBanners();
        } catch (e) {
            Swal.fire({ ...darkSwal, title: 'Error', icon: 'error' });
        }
    };

    const handleSendBroadcast = async () => {
        if (!subject || !content) {
            Swal.fire({ ...darkSwal, title: 'Campos incompletos', icon: 'warning' });
            return;
        }
        const confirmMsg = scheduleDate 
            ? `¿Programar envío para ${scheduleDate} a la audiencia: ${audience}?`
            : `¿Enviar ahora a la audiencia: ${audience}?`;

        const confirm = await Swal.fire({
            ...darkSwal, title: 'Confirmar Broadcast', text: confirmMsg, icon: 'question',
            showCancelButton: true, confirmButtonColor: '#10b981'
        });
        if (confirm.isConfirmed) {
            setIsLoading(true);
            try {
                // Mock API call to simulate sending based on audience and schedule
                setTimeout(() => {
                  Swal.fire({ ...darkSwal, title: '¡Éxito!', text: scheduleDate ? 'Campaña programada.' : 'Campaña enviada.', icon: 'success' });
                  setSubject(''); setContent(''); setScheduleDate('');
                  setIsLoading(false);
                  setActiveTab('history');
                }, 1500);
            } catch (error) {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="admin-marketing-container" style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
            
            <header className="admin-header" style={{ marginBottom: '2rem' }}>
                <h1 className="admin-title">Centro de <span className="highlight-gold">Marketing</span></h1>
                <p className="admin-subtitle">Gestiona campañas de correo, banners publicitarios y analiza el rendimiento.</p>
            </header>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                <button 
                  onClick={() => setActiveTab('compose')} 
                  style={{ background: activeTab === 'compose' ? '#eab308' : 'transparent', color: activeTab === 'compose' ? '#000' : '#fff', border: '1px solid #eab308', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  <Mail size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }}/> Redactar Email
                </button>
                <button 
                  onClick={() => setActiveTab('history')} 
                  style={{ background: activeTab === 'history' ? '#eab308' : 'transparent', color: activeTab === 'history' ? '#000' : '#fff', border: '1px solid #eab308', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  <BarChart2 size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }}/> Historial & Métricas
                </button>
                <button 
                  onClick={() => setActiveTab('banners')} 
                  style={{ background: activeTab === 'banners' ? '#eab308' : 'transparent', color: activeTab === 'banners' ? '#000' : '#fff', border: '1px solid #eab308', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  <ImagePlus size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }}/> Banners Web
                </button>
            </div>

            {/* TAB: COMPONER EMAIL */}
            {activeTab === 'compose' && (
                <div className="marketing-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div className="marketing-form card-base" style={{ background: 'rgba(20,20,20,0.6)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', color: '#fff' }}>
                            <Mail color="#eab308" /> Configuración de Campaña
                        </h3>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                           <div className="form-group" style={{ marginBottom: '1rem' }}>
                               <label style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Audiencia Objetivo</label>
                               <div style={{ position: 'relative' }}>
                                  <Users size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                                  <select 
                                    value={audience} 
                                    onChange={e => setAudience(e.target.value)} 
                                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '8px', marginTop: '0.3rem' }}
                                  >
                                      <option value="todos">Todos los Suscriptores</option>
                                      <option value="clientes">Solo Clientes (Han comprado)</option>
                                      <option value="leads">Leads (Sin compras)</option>
                                  </select>
                               </div>
                           </div>
                           <div className="form-group" style={{ marginBottom: '1rem' }}>
                               <label style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Programar Envío (Opcional)</label>
                               <div style={{ position: 'relative' }}>
                                  <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                                  <input 
                                    type="datetime-local" 
                                    value={scheduleDate} 
                                    onChange={e => setScheduleDate(e.target.value)} 
                                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '8px', marginTop: '0.3rem', fontFamily: 'inherit' }}
                                  />
                               </div>
                           </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Asunto del Correo</label>
                            <input type="text" value={subject} onChange={e => setSubject(e.target.value)} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.8rem 1rem', borderRadius: '8px', marginTop: '0.3rem' }} />
                        </div>
                        <div className="form-group">
                            <label style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Contenido (Soporta HTML)</label>
                            <textarea value={content} onChange={e => setContent(e.target.value)} rows={12} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.8rem 1rem', borderRadius: '8px', marginTop: '0.3rem', resize: 'vertical' }} />
                        </div>
                        
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                            <button onClick={() => setPreviewMode(!previewMode)} style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer' }}>
                                {previewMode ? 'Ocultar Preview' : 'Ver Preview'}
                            </button>
                            <button onClick={handleSendBroadcast} disabled={isLoading} style={{ flex: 1, background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                                {isLoading ? <Loader2 className="spinner" /> : (scheduleDate ? <Clock size={18}/> : <Send size={18} />)}
                                {isLoading ? 'Procesando...' : (scheduleDate ? 'Programar Campaña' : 'Enviar Ahora')}
                            </button>
                        </div>
                    </div>

                    <div className="marketing-preview card-base" style={{ background: '#fff', padding: '2rem', borderRadius: '16px', color: '#333', opacity: previewMode ? 1 : 0.5, transition: 'opacity 0.3s' }}>
                        <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CheckCircle color="#10b981" /> Vista Previa del Cliente
                        </h3>
                        <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#666' }}><strong>De:</strong> SAVS &lt;marketing@savs.com&gt;</p>
                        <p style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: '#666', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}><strong>Asunto:</strong> {subject || '(Sin asunto)'}</p>
                        <div style={{ minHeight: '300px', lineHeight: '1.6' }}>
                            {content ? <div dangerouslySetInnerHTML={{ __html: content }} /> : <p style={{ color: '#999', fontStyle: 'italic', textAlign: 'center', marginTop: '3rem' }}>El contenido aparecerá aquí...</p>}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: HISTORIAL */}
            {activeTab === 'history' && (
                <div className="card-base" style={{ background: 'rgba(20,20,20,0.6)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px' }}>
                            <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.85rem', textTransform: 'uppercase' }}>Tasa de Apertura Prom.</p>
                            <h2 style={{ color: '#fff', margin: '0.5rem 0 0 0', fontSize: '2rem' }}>41.5%</h2>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px' }}>
                            <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.85rem', textTransform: 'uppercase' }}>CTR Promedio</p>
                            <h2 style={{ color: '#eab308', margin: '0.5rem 0 0 0', fontSize: '2rem' }}>10.0%</h2>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px' }}>
                            <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.85rem', textTransform: 'uppercase' }}>Campañas Enviadas</p>
                            <h2 style={{ color: '#10b981', margin: '0.5rem 0 0 0', fontSize: '2rem' }}>12</h2>
                        </div>
                    </div>

                    <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Historial de Campañas</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', fontSize: '0.85rem' }}>
                                <th style={{ padding: '1rem 0' }}>Asunto</th>
                                <th style={{ padding: '1rem 0' }}>Audiencia</th>
                                <th style={{ padding: '1rem 0' }}>Estado</th>
                                <th style={{ padding: '1rem 0' }}>Fecha</th>
                                <th style={{ padding: '1rem 0' }}>Aperturas</th>
                                <th style={{ padding: '1rem 0' }}>Clics</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_HISTORY.map(h => (
                                <tr key={h.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#fff' }}>
                                    <td style={{ padding: '1rem 0', fontWeight: 'bold' }}>{h.subject}</td>
                                    <td style={{ padding: '1rem 0', color: '#9ca3af' }}>{h.audience}</td>
                                    <td style={{ padding: '1rem 0' }}>
                                        <span style={{ background: h.status === 'Enviado' ? 'rgba(16,185,129,0.1)' : 'rgba(234,179,8,0.1)', color: h.status === 'Enviado' ? '#10b981' : '#eab308', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                                            {h.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 0', color: '#9ca3af' }}>{h.date}</td>
                                    <td style={{ padding: '1rem 0' }}>{h.openRate}</td>
                                    <td style={{ padding: '1rem 0' }}>{h.clickRate}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* TAB: BANNERS */}
            {activeTab === 'banners' && (
                <div>
                    <div className="card-base" style={{ background: 'rgba(20,20,20,0.6)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', color: '#eab308' }}>
                            <ImagePlus /> Publicar Nuevo Banner
                        </h3>
                        
                        <div 
                           onClick={() => !generatingIA && fileInputRef.current?.click()}
                           onDragOver={handleDragOver}
                           onDragLeave={handleDragLeave}
                           onDrop={handleDrop}
                           style={{
                              border: isDragging ? '2px dashed #eab308' : '2px dashed rgba(255,255,255,0.2)',
                              background: imagenPreview ? `url(${imagenPreview}) center/cover` : (isDragging ? 'rgba(234,179,8,0.1)' : 'rgba(0,0,0,0.2)'),
                              borderRadius: '12px', padding: '3rem', textAlign: 'center', cursor: 'pointer',
                              position: 'relative', minHeight: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                           }}
                        >
                            {generatingIA && (
                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>
                                    <Loader2 className="spinner" size={40} color="#eab308" />
                                    <p style={{ color: '#fff', marginTop: '1rem', fontWeight: 'bold' }}>IA analizando imagen...</p>
                                </div>
                            )}
                            {!generatingIA && !imagenPreview && (
                                <>
                                  <ImagePlus size={40} color="#eab308" style={{ marginBottom: '1rem' }} />
                                  <p style={{ color: '#9ca3af', margin: 0 }}>Arrastra o haz clic para subir imagen</p>
                                </>
                            )}
                            {!generatingIA && imagenPreview && (
                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', opacity: 0, transition: 'opacity 0.3s' }} onMouseEnter={e => e.currentTarget.style.opacity=1} onMouseLeave={e => e.currentTarget.style.opacity=0}>
                                    <p style={{ color: '#fff', fontWeight: 'bold' }}>Cambiar Imagen</p>
                                </div>
                            )}
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImagenSeleccionada} style={{ display: 'none' }} />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
                            <div className="form-group">
                                <label style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Título</label>
                                <input type="text" value={nuevaTitulo} onChange={e => setNuevaTitulo(e.target.value)} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.8rem 1rem', borderRadius: '8px', marginTop: '0.3rem' }} />
                            </div>
                            <div className="form-group">
                                <label style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Descripción</label>
                                <input type="text" value={nuevaDesc} onChange={e => setNuevaDesc(e.target.value)} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.8rem 1rem', borderRadius: '8px', marginTop: '0.3rem' }} />
                            </div>
                        </div>
                        <div className="form-group" style={{ marginTop: '1rem' }}>
                            <label style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Enlace URL (Opcional)</label>
                            <input type="text" value={nuevaEnlace} onChange={e => setNuevaEnlace(e.target.value)} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.8rem 1rem', borderRadius: '8px', marginTop: '0.3rem' }} />
                        </div>
                        
                        <button onClick={handlePublicarBanner} disabled={uploadingBanner} style={{ width: '100%', marginTop: '1.5rem', background: '#eab308', color: '#000', border: 'none', padding: '1rem', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                            {uploadingBanner ? <Loader2 className="spinner" /> : <Megaphone size={18} />}
                            {uploadingBanner ? 'Publicando...' : 'Publicar Banner'}
                        </button>
                    </div>

                    <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {banners.map(b => (
                            <div key={b.id} style={{ background: 'rgba(20,20,20,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden' }}>
                                <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || `http://${window.location.hostname}:5000`}${b.imagen}`} alt={b.titulo} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                                <div style={{ padding: '1rem' }}>
                                    <h4 style={{ color: '#fff', margin: '0 0 5px 0' }}>{b.titulo}</h4>
                                    <p style={{ color: '#9ca3af', fontSize: '0.85rem', margin: '0 0 10px 0' }}>{b.descripcion}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{b.fechaSubida}</span>
                                        <button onClick={() => handleEliminarBanner(b.id, b.titulo)} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            <style>{`
                .spinner { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @media (max-width: 768px) {
                    .marketing-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
};

export default MarketingBroadcast;
