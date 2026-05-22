import React, { useState, useEffect, useRef } from 'react';
import { Send, Mail, AlertTriangle, CheckCircle, Loader2, ImagePlus, Trash2, Megaphone, Sparkles } from 'lucide-react';
import api from '../../services/api';
import Swal from 'sweetalert2';

const darkSwal = { background: '#141414', color: '#fff', confirmButtonColor: '#eab308' };

const MarketingBroadcast = () => {
    // ── Estado Email ──────────────────────────────────────────
    const [subject, setSubject]       = useState('');
    const [content, setContent]       = useState('');
    const [isLoading, setIsLoading]   = useState(false);
    const [previewMode, setPreviewMode] = useState(false);

    // ── Estado Banners ────────────────────────────────────────
    const [banners, setBanners]           = useState([]);
    const [loadingBanners, setLoadingBanners] = useState(true);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [nuevaTitulo, setNuevaTitulo]   = useState('');
    const [nuevaDesc, setNuevaDesc]       = useState('');
    const [nuevaEnlace, setNuevaEnlace]   = useState('https://www.facebook.com/p/Importadora-De-Veh%C3%ADculos-SAVS-100083511271381/');
    const [imagenPreview, setImagenPreview] = useState(null);
    const [imagenFile, setImagenFile]     = useState(null);
    const fileInputRef = useRef();
    const [generatingIA, setGeneratingIA] = useState(false);
    const [isDragging, setIsDragging]     = useState(false);

    // ── Cargar banners al iniciar ─────────────────────────────
    useEffect(() => {
        cargarBanners();
    }, []);

    const cargarBanners = async () => {
        try {
            setLoadingBanners(true);
            const res = await api.get('/marketing/banners');
            setBanners(res.data.banners || []);
        } catch (e) {
            console.error('Error cargando banners:', e);
        } finally {
            setLoadingBanners(false);
        }
    };

    // ── Selección de imagen ───────────────────────────────────
    const handleImagenSeleccionada = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImagenFile(file);
        setImagenPreview(URL.createObjectURL(file));
        analizarConIA(file);
    };

    // ── Drag & Drop Event Handlers ────────────────────────────
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            Swal.fire({ 
                ...darkSwal, 
                title: 'Formato incorrecto', 
                text: 'Por favor arrastrá solo archivos de imagen (JPG, PNG o WebP).', 
                icon: 'warning' 
            });
            return;
        }
        
        setImagenFile(file);
        setImagenPreview(URL.createObjectURL(file));
        analizarConIA(file);
    };

    // ── Analizar Imagen con IA (Automático) ───────────────────
    const analizarConIA = async (file) => {
        if (!file) return;

        const formData = new FormData();
        formData.append('imagen', file);

        setGeneratingIA(true);
        try {
            const res = await api.post('/marketing/banners/generate-copy', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (res.data.success) {
                setNuevaTitulo(res.data.titulo);
                setNuevaDesc(res.data.descripcion);
                Swal.fire({
                    ...darkSwal,
                    title: '¡Anuncio Generado!',
                    text: 'La IA ha analizado la imagen y generado el contenido de forma automática.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        } catch (e) {
            console.error('Error generando copy con IA:', e);
            Swal.fire({
                ...darkSwal,
                title: 'Error de IA',
                text: e.response?.data?.error || 'No se pudo generar el contenido con IA.',
                icon: 'error'
            });
        } finally {
            setGeneratingIA(false);
        }
    };

    // ── Publicar nuevo banner ─────────────────────────────────
    const handlePublicarBanner = async () => {
        if (!imagenFile) {
            Swal.fire({ ...darkSwal, title: 'Falta la imagen', text: 'Por favor seleccioná una imagen para el anuncio.', icon: 'warning' });
            return;
        }
        if (!nuevaTitulo.trim()) {
            Swal.fire({ ...darkSwal, title: 'Falta el título', text: 'Escribí un título para el anuncio.', icon: 'warning' });
            return;
        }

        const formData = new FormData();
        formData.append('imagen',      imagenFile);
        formData.append('titulo',      nuevaTitulo);
        formData.append('descripcion', nuevaDesc);
        formData.append('enlace',      nuevaEnlace);

        setUploadingBanner(true);
        try {
            await api.post('/marketing/banners', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            Swal.fire({ ...darkSwal, title: '¡Anuncio publicado!', text: 'Ya aparece en el sitio web.', icon: 'success' });
            // Limpiar formulario
            setNuevaTitulo('');
            setNuevaDesc('');
            setNuevaEnlace('https://www.facebook.com/p/Importadora-De-Veh%C3%ADculos-SAVS-100083511271381/');
            setImagenFile(null);
            setImagenPreview(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            cargarBanners();
        } catch (e) {
            Swal.fire({ ...darkSwal, title: 'Error', text: e.response?.data?.error || 'No se pudo publicar el anuncio.', icon: 'error' });
        } finally {
            setUploadingBanner(false);
        }
    };

    // ── Eliminar banner ───────────────────────────────────────
    const handleEliminarBanner = async (id, titulo) => {
        const confirm = await Swal.fire({
            ...darkSwal,
            title: '¿Eliminar este anuncio?',
            text: `"${titulo}" dejará de aparecer en el sitio web.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#444'
        });
        if (!confirm.isConfirmed) return;
        try {
            await api.delete(`/marketing/banners/${id}`);
            Swal.fire({ ...darkSwal, title: 'Eliminado', icon: 'success', timer: 1500, showConfirmButton: false });
            cargarBanners();
        } catch (e) {
            Swal.fire({ ...darkSwal, title: 'Error', text: 'No se pudo eliminar.', icon: 'error' });
        }
    };

    // ── Funciones Email ───────────────────────────────────────
    const handleSendTest = async () => {
        if (!subject || !content) {
            Swal.fire({ ...darkSwal, title: 'Campos incompletos', icon: 'warning' });
            return;
        }
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const myEmail = user.email || 'yosimarvv@gmail.com';
        setIsLoading(true);
        try {
            await api.post('/marketing/broadcast', { subject: `[TEST] ${subject}`, content, testEmail: myEmail });
            Swal.fire({ ...darkSwal, title: 'Prueba Enviada', text: `El correo de prueba fue enviado a ${myEmail}`, icon: 'success' });
        } catch (error) {
            Swal.fire({ ...darkSwal, title: 'Error de Prueba', text: error.response?.data?.error || 'Error', icon: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendBroadcast = async () => {
        if (!subject || !content) {
            Swal.fire({ ...darkSwal, title: 'Campos incompletos', text: 'Por favor escribí un asunto y el contenido.', icon: 'warning' });
            return;
        }
        const confirm = await Swal.fire({
            ...darkSwal,
            title: '¿Confirmar envío masivo?',
            text: 'Este correo se enviará a todos los usuarios registrados.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, enviar ahora',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#444'
        });
        if (confirm.isConfirmed) {
            setIsLoading(true);
            try {
                const response = await api.post('/marketing/broadcast', { subject, content });
                Swal.fire({ ...darkSwal, title: '¡Envío Exitoso!', text: response.data.message, icon: 'success' });
                setSubject(''); setContent('');
            } catch (error) {
                Swal.fire({ ...darkSwal, title: 'Error de Envío', text: error.response?.data?.error || 'No se pudo procesar.', icon: 'error' });
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="admin-marketing-container">

            {/* ══════════════ SECCIÓN: ANUNCIOS DEL SITIO ══════════════ */}
            <div className="admin-header" style={{ marginBottom: '0.5rem' }}>
                <h1 className="admin-title">
                    Anuncios del Sitio Web <Megaphone size={34} className="admin-icon-title" />
                </h1>
                <p className="admin-subtitle">
                    Publicá promociones directamente en el carrusel de la página web. Sin necesidad de tocar código.
                </p>
            </div>

            {/* Formulario para subir nuevo anuncio */}
            <div className="card-base banner-upload-card">
                <h3 style={{ marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: 10, color: '#eab308' }}>
                    <ImagePlus size={22} /> Publicar Nuevo Anuncio
                </h3>

                {/* Zona de carga de imagen */}
                <div
                    className={`banner-drop-zone ${isDragging ? 'dragging' : ''} ${generatingIA ? 'loading' : ''}`}
                    onClick={() => !generatingIA && fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    style={{ backgroundImage: imagenPreview ? `url(${imagenPreview})` : 'none' }}
                >
                    {generatingIA && (
                        <div className="banner-loading-overlay">
                            <Loader2 className="spinner" size={40} style={{ color: '#eab308', marginBottom: 12 }} />
                            <p style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>✨ IA analizando y creando copy...</p>
                            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>Generando título y descripción automáticos</p>
                        </div>
                    )}

                    {!generatingIA && !imagenPreview && (
                        <>
                            <ImagePlus size={40} style={{ color: '#eab308', marginBottom: 8 }} />
                            <p style={{ color: '#94a3b8', margin: 0 }}>📷 Arrastrá una imagen aquí o hacé clic para seleccionarla</p>
                            <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '4px 0 0' }}>JPG, PNG o WebP — máximo 5 MB</p>
                        </>
                    )}
                    
                    {!generatingIA && imagenPreview && (
                        <div className="banner-preview-overlay">
                            <p>✅ Imagen cargada — arrastrá o hacé clic para cambiarla</p>
                        </div>
                    )}
                </div>
                
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImagenSeleccionada}
                    style={{ display: 'none' }}
                />

                {/* Campos de título y descripción */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label>Título del anuncio *</label>
                        <input
                            type="text"
                            className="marketing-input"
                            placeholder='Ej: ¡Oferta del mes!'
                            value={nuevaTitulo}
                            onChange={e => setNuevaTitulo(e.target.value)}
                        />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label>Descripción (opcional)</label>
                        <input
                            type="text"
                            className="marketing-input"
                            placeholder='Ej: Visitanos esta semana y llevate el mejor precio'
                            value={nuevaDesc}
                            onChange={e => setNuevaDesc(e.target.value)}
                        />
                    </div>
                </div>

                <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label>Enlace de redirección (opcional) — Ej: /inventory, /contact, o una URL externa</label>
                    <input
                        type="text"
                        className="marketing-input"
                        placeholder='Ej: /inventory (para catálogo) o https://facebook.com/...'
                        value={nuevaEnlace}
                        onChange={e => setNuevaEnlace(e.target.value)}
                    />
                </div>

                <button
                    className="btn-send-broadcast"
                    style={{ marginTop: '1.2rem', background: '#eab308' }}
                    onClick={handlePublicarBanner}
                    disabled={uploadingBanner}
                >
                    {uploadingBanner ? <Loader2 className="spinner" size={18} /> : <Megaphone size={18} />}
                    {uploadingBanner ? 'Publicando...' : '🚀 Publicar en el Sitio Web'}
                </button>
            </div>

            {/* Lista de banners actuales */}
            <div className="card-base" style={{ marginTop: '1.5rem' }}>
                <h3 style={{ marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                    📋 Anuncios Activos en el Sitio
                    <span style={{ marginLeft: 'auto', background: 'rgba(234,179,8,0.15)', color: '#eab308', borderRadius: 20, padding: '2px 14px', fontSize: '0.85rem' }}>
                        {banners.length} publicados
                    </span>
                </h3>

                {loadingBanners ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        <Loader2 className="spinner" size={30} style={{ margin: '0 auto' }} />
                        <p style={{ marginTop: 10 }}>Cargando anuncios...</p>
                    </div>
                ) : banners.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                        <Megaphone size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                        <p>Todavía no hay anuncios publicados.</p>
                        <p style={{ fontSize: '0.85rem' }}>Usá el formulario de arriba para subir el primero.</p>
                    </div>
                ) : (
                    <div className="banners-grid">
                        {banners.map(banner => (
                            <div key={banner.id} className="banner-item-card">
                                <img
                                    src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || `http://${window.location.hostname}:5000`}${banner.imagen}`}
                                    alt={banner.titulo}
                                    className="banner-item-img"
                                />
                                <div className="banner-item-info">
                                    <strong>{banner.titulo}</strong>
                                    {banner.descripcion && <p>{banner.descripcion}</p>}
                                    {banner.enlace && (
                                        <p style={{ fontSize: '0.8rem', color: '#eab308', margin: '2px 0 0' }}>
                                            🔗 Enlace: <code>{banner.enlace}</code>
                                        </p>
                                    )}
                                    <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>📅 Subido el {banner.fechaSubida}</span>
                                </div>
                                <button
                                    className="banner-delete-btn"
                                    onClick={() => handleEliminarBanner(banner.id, banner.titulo)}
                                    title="Eliminar este anuncio"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ══════════════ SECCIÓN: EMAIL MARKETING ══════════════ */}
            <div className="admin-header" style={{ marginTop: '3rem', marginBottom: '0.5rem' }}>
                <h1 className="admin-title">Email Marketing <Mail size={34} className="admin-icon-title" /></h1>
                <p className="admin-subtitle">Comunicáte directamente con todos tus clientes registrados.</p>
            </div>

            <div className="marketing-grid">
                <div className="marketing-form card-base">
                    <div className="form-header">
                        <Mail className="form-icon" />
                        <h3>Redactar Nuevo Mensaje</h3>
                    </div>
                    <div className="form-group">
                        <label>Asunto del Correo</label>
                        <input type="text" placeholder='Ej: ¡Nuevos ingresos en SAVS esta semana!' value={subject} onChange={e => setSubject(e.target.value)} className="marketing-input" />
                    </div>
                    <div className="form-group">
                        <label>Contenido del Mensaje (Soporta HTML)</label>
                        <textarea placeholder="Escribí tu mensaje aquí..." value={content} onChange={e => setContent(e.target.value)} className="marketing-textarea" rows={10} />
                    </div>
                    <div className="marketing-actions">
                        <button className="btn-preview" onClick={() => setPreviewMode(!previewMode)}>
                            {previewMode ? 'Editar' : 'Vista Previa'}
                        </button>
                        <button className="btn-send-test" onClick={handleSendTest} disabled={isLoading}>
                            {isLoading ? <Loader2 className="spinner" /> : <Mail size={18} />} Enviar Prueba
                        </button>
                        <button className="btn-send-broadcast" onClick={handleSendBroadcast} disabled={isLoading}>
                            {isLoading ? <Loader2 className="spinner" /> : <Send size={18} />}
                            {isLoading ? 'Enviando...' : 'Enviar a Todos'}
                        </button>
                    </div>
                    <div className="marketing-warning">
                        <AlertTriangle size={16} />
                        <p>Atención: Esta acción no se puede deshacer y el envío es inmediato.</p>
                    </div>
                </div>

                <div className={`marketing-preview card-base ${previewMode ? 'active' : ''}`}>
                    <div className="preview-header">
                        <CheckCircle className="preview-icon" />
                        <h3>Vista Previa del Suscriptor</h3>
                    </div>
                    <div className="preview-envelope">
                        <div className="preview-field"><strong>De:</strong> SAVS Importadora &lt;notificaciones@savs.com&gt;</div>
                        <div className="preview-field"><strong>Asunto:</strong> {subject || '(Sin Asunto)'}</div>
                        <div className="preview-content-box">
                            {content ? <div dangerouslySetInnerHTML={{ __html: content }} /> : <p className="empty-preview">Escribí algo en el editor para ver la vista previa...</p>}
                        </div>
                    </div>
                    <div className="preview-footer">
                        <p>© 2024 Importadora SAVS. Todos los derechos reservados.</p>
                        <p className="unsubscribe-link">Si ya no deseás recibir estos correos, podés cancelar tu suscripción aquí.</p>
                    </div>
                </div>
            </div>

            <style>{`
                .banner-upload-card { margin-top: 1.5rem; }

                .banner-drop-zone {
                    border: 2px dashed rgba(234,179,8,0.3);
                    border-radius: 12px;
                    padding: 2.5rem;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s;
                    background-size: cover;
                    background-position: center;
                    min-height: 180px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                }
                .banner-drop-zone:hover:not(.loading) { border-color: #eab308; background-color: rgba(234,179,8,0.05); }
                .banner-drop-zone.dragging { border-color: #eab308; background-color: rgba(234,179,8,0.12); box-shadow: 0 0 15px rgba(234, 179, 8, 0.2) inset; }
                .banner-drop-zone.loading { cursor: default; }

                .banner-loading-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(10, 10, 10, 0.85);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: #fff;
                    z-index: 10;
                    animation: fadeInOverlay 0.3s ease-out;
                }
                @keyframes fadeInOverlay {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .banner-preview-overlay {
                    position: absolute; inset: 0;
                    background: rgba(0,0,0,0.65);
                    display: flex; align-items: center; justify-content: center;
                    color: #fff; font-weight: 600; font-size: 1.05rem;
                    transition: background 0.3s;
                }
                .banner-drop-zone:hover .banner-preview-overlay { background: rgba(0,0,0,0.75); }

                .banners-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                .banner-item-card {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 10px;
                    padding: 0.75rem 1rem;
                    transition: background 0.2s;
                }
                .banner-item-card:hover { background: rgba(255,255,255,0.06); }
                .banner-item-img {
                    width: 90px; height: 60px;
                    object-fit: cover;
                    border-radius: 8px;
                    flex-shrink: 0;
                }
                .banner-item-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .banner-item-info strong { font-size: 0.95rem; }
                .banner-item-info p { font-size: 0.85rem; color: #94a3b8; margin: 0; }
                .banner-delete-btn {
                    background: rgba(239,68,68,0.1);
                    border: 1px solid rgba(239,68,68,0.2);
                    color: #f87171;
                    padding: 0.5rem;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    flex-shrink: 0;
                }
                .banner-delete-btn:hover { background: rgba(239,68,68,0.25); }

                .marketing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 1.5rem; }
                .form-header, .preview-header { display: flex; align-items: center; gap: 12px; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 1rem; }
                .form-icon { color: #eab308; }
                .preview-icon { color: #10b981; }
                .marketing-input, .marketing-textarea { width: 100%; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.8rem 1rem; color: #fff; font-family: inherit; margin-top: 0.5rem; }
                .marketing-textarea { resize: vertical; min-height: 200px; }
                .marketing-actions { display: flex; gap: 1rem; margin-top: 1.5rem; }
                .btn-send-broadcast { flex: 1; background: #10b981; color: #fff; border: none; padding: 1rem; border-radius: 8px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; transition: all 0.3s; }
                .btn-send-broadcast:hover:not(:disabled) { background: #059669; transform: translateY(-2px); }
                .btn-send-broadcast:disabled { opacity: 0.5; cursor: not-allowed; }
                .btn-send-test { background: rgba(234,179,8,0.1); color: #eab308; border: 1px solid rgba(234,179,8,0.3); padding: 0 1.5rem; border-radius: 8px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: all 0.3s; }
                .btn-send-test:hover:not(:disabled) { background: rgba(234,179,8,0.2); border-color: #eab308; }
                .btn-preview { background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1); padding: 0 1.5rem; border-radius: 8px; cursor: pointer; }
                .marketing-warning { margin-top: 1.5rem; display: flex; align-items: center; gap: 10px; padding: 0.8rem; background: rgba(234,179,8,0.1); border: 1px solid rgba(234,179,8,0.2); border-radius: 8px; color: #eab308; font-size: 0.85rem; }
                .preview-envelope { background: #fff; color: #333; border-radius: 12px; padding: 2rem; min-height: 400px; }
                .preview-field { border-bottom: 1px solid #eee; padding: 0.5rem 0; font-size: 0.9rem; color: #666; }
                .preview-content-box { margin-top: 2rem; line-height: 1.6; }
                .empty-preview { color: #999; font-style: italic; text-align: center; margin-top: 4rem; }
                .preview-footer { margin-top: 2rem; text-align: center; font-size: 0.75rem; color: #6b7280; }
                .unsubscribe-link { margin-top: 0.5rem; text-decoration: underline; cursor: pointer; }
                .spinner { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @media (max-width: 1024px) { .marketing-grid { grid-template-columns: 1fr; } }
            `}</style>
        </div>
    );
};

export default MarketingBroadcast;
