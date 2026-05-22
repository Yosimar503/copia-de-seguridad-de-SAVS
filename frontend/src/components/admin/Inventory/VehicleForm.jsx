import React, { useState, useEffect } from 'react';
import { 
  CarFront, 
  Settings, 
  Fuel, 
  FileText, 
  Image as ImageIcon, 
  CheckCircle, 
  X, 
  Plus, 
  ChevronRight,
  Info,
  Layers,
  Palette,
  Tag,
  Sparkles,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import { vehicleService } from '../../../services/api';

const darkSwal = {
  background: '#1a1a1a',
  color: '#fff',
  confirmButtonColor: '#eab308'
};

const VehicleForm = ({ initialData, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState(initialData);
  const [activeTab, setActiveTab] = useState('general');
  const [detailImages, setDetailImages] = useState(initialData.detailImages || []);
  const [aiLoading, setAiLoading] = useState(false);

  const handleAiAutofill = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      Swal.fire({
        ...darkSwal,
        icon: 'warning',
        title: 'Archivo no válido',
        text: 'Solo se aceptan imágenes (JPG, PNG, WebP, GIF).'
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        ...darkSwal,
        icon: 'warning',
        title: 'Archivo muy grande',
        text: 'El tamaño máximo es 5 MB.'
      });
      return;
    }

    setAiLoading(true);
    try {
      const result = await vehicleService.generateAutoAd(file);
      if (result.success && result.data?.detectedFields) {
        const fields = result.data.detectedFields;
        const previewUrl = URL.createObjectURL(file);

        setFormData(prev => ({
          ...prev,
          name: fields.name || prev.name || '',
          motor: fields.motor || fields.engine_size || prev.motor || '',
          type: fields.type || prev.type || 'SUV',
          year: fields.year || fields.anio || prev.year || new Date().getFullYear(),
          mileage: fields.mileage || prev.mileage || '',
          price: fields.price || fields.precio || prev.price || '',
          tag: fields.tag || prev.tag || 'Disponible',
          transmission: fields.transmission || prev.transmission || 'Automática',
          fuel: fields.fuel || prev.fuel || 'Gasolina',
          color: fields.color || prev.color || '',
          summary: fields.summary || fields.heroSubtitle || prev.summary || '',
          doors: fields.doors ? String(fields.doors) : prev.doors || '5',
          passengers: fields.passengers ? String(fields.passengers) : prev.passengers || '5',
          image: file,
          preview: previewUrl
        }));

        Swal.fire({
          ...darkSwal,
          icon: 'success',
          title: '¡Autocompletado con éxito!',
          text: 'Hemos analizado la imagen y rellenado la ficha técnica. Por favor, revísala.',
          timer: 3000,
          showConfirmButton: false
        });
      } else {
        throw new Error(result.error || 'No se pudieron extraer datos de la imagen.');
      }
    } catch (err) {
      console.error('Error en autocompletado con IA:', err);
      Swal.fire({
        ...darkSwal,
        icon: 'error',
        title: 'Error al analizar',
        text: err.response?.data?.error || err.message || 'No se pudo obtener información del vehículo.'
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Sanitización básica para números
    if (['price', 'year', 'mileage', 'doors', 'passengers'].includes(name)) {
      setFormData(prev => ({ ...prev, [name]: value.replace(/[^0-9]/g, '') }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Generamos una URL temporal solo para la previsualización visual
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({ 
        ...prev, 
        image: file, // Guardamos el archivo REAL para el envío
        preview: previewUrl // Guardamos la URL para la vista
      }));
    }
  };

  const handleDetailImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const readers = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target.result);
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readers).then(results => {
      setDetailImages(prev => [...prev, ...results]);
    });
  };

  const removeDetailImage = (index) => {
    setDetailImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validaciones de Cliente - Robustas
    if (!formData.name?.trim()) {
      Swal.fire({ ...darkSwal, icon: 'warning', title: 'Nombre requerido', text: 'El nombre del vehículo es obligatorio.' });
      return;
    }
    
    if (!formData.price || Number(formData.price) <= 0) {
      Swal.fire({ ...darkSwal, icon: 'warning', title: 'Precio inválido', text: 'Debes ingresar un precio mayor a cero.' });
      return;
    }

    if (!formData.year || Number(formData.year) < 1900 || Number(formData.year) > 2030) {
      Swal.fire({ ...darkSwal, icon: 'warning', title: 'Año inválido', text: 'Por favor ingresa un año válido entre 1900 y 2030.' });
      return;
    }

    if (!formData.image) {
      Swal.fire({ ...darkSwal, icon: 'warning', title: 'Imagen requerida', text: 'Debes subir al menos una imagen principal para el catálogo.' });
      return;
    }

    onSubmit({ ...formData, detailImages });
  };

  const tabs = [
    { id: 'general', label: 'Información General', icon: <Info size={18} /> },
    { id: 'technical', label: 'Ficha Técnica', icon: <Settings size={18} /> },
    { id: 'media', label: 'Multimedia', icon: <ImageIcon size={18} /> }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="inventory-form-card"
    >
      <div className="form-header">
        <div className="header-info">
          <h2>{formData.id ? 'Editar Vehículo' : 'Añadir Nuevo Vehículo'}</h2>
          <p>{formData.id ? `ID: ${formData.id}` : 'Completa los campos para publicar en el catálogo'}</p>
        </div>
        {!formData.id && (
          <div className="header-actions-form" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto', marginRight: '1rem' }}>
            <button 
              type="button" 
              className="btn-ai-autofill"
              disabled={aiLoading}
              onClick={() => document.getElementById('ai-autofill-input').click()}
            >
              {aiLoading ? (
                <>
                  <Loader2 className="spinner" size={16} />
                  <span>Analizando con IA...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Rellenar con IA</span>
                </>
              )}
            </button>
            <input 
              id="ai-autofill-input" 
              type="file" 
              hidden 
              onChange={handleAiAutofill} 
              accept="image/*" 
            />
          </div>
        )}
        <button onClick={onCancel} className="btn-close-form">
          <X size={24} />
        </button>
      </div>

      <div className="form-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="premium-admin-form">
        <div className="tab-content">
          <AnimatePresence mode="wait">
            {activeTab === 'general' && (
              <motion.div
                key="general"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="form-section-grid"
              >
                <div className="form-input-group full">
                  <label><CarFront size={16} /> Marca y Modelo</label>
                  <input 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    placeholder="Ej: Toyota Land Cruiser Prado 2024"
                  />
                </div>
                <div className="form-input-group">
                  <label><Tag size={16} /> Precio (₡)</label>
                  <input 
                    name="price" 
                    value={formData.price} 
                    onChange={handleChange} 
                    placeholder="Ej: 45000000"
                  />
                </div>
                <div className="form-input-group">
                  <label>Año</label>
                  <input 
                    name="year" 
                    value={formData.year} 
                    onChange={handleChange} 
                    placeholder="2024"
                  />
                </div>
                <div className="form-input-group">
                  <label>Estado / Etiqueta</label>
                  <select name="tag" value={formData.tag} onChange={handleChange}>
                    <option value="Disponible">Disponible</option>
                    <option value="Vendido">Vendido</option>
                    <option value="Reservado">Reservado</option>
                    <option value="Próximamente">Próximamente</option>
                  </select>
                </div>
                <div className="form-input-group">
                  <label><Palette size={16} /> Color</label>
                  <input 
                    name="color" 
                    value={formData.color} 
                    onChange={handleChange} 
                    placeholder="Gris Metalizado"
                  />
                </div>
                <div className="form-input-group full">
                  <label><FileText size={16} /> Descripción Breve</label>
                  <textarea 
                    name="summary" 
                    value={formData.summary} 
                    onChange={handleChange} 
                    rows="3"
                    placeholder="Resumen del vehículo para el catálogo..."
                  />
                </div>
              </motion.div>
            )}

            {activeTab === 'technical' && (
              <motion.div
                key="technical"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="form-section-grid"
              >
                <div className="form-input-group">
                  <label><Settings size={16} /> Motor / Cilindrada</label>
                  <input name="motor" value={formData.motor} onChange={handleChange} placeholder="3000cc V6" />
                </div>
                <div className="form-input-group">
                  <label><Fuel size={16} /> Combustible</label>
                  <select name="fuel" value={formData.fuel} onChange={handleChange}>
                    <option value="Gasolina">Gasolina</option>
                    <option value="Diésel">Diésel</option>
                    <option value="Eléctrico">Eléctrico</option>
                    <option value="Híbrido">Híbrido</option>
                  </select>
                </div>
                <div className="form-input-group">
                  <label><Layers size={16} /> Transmisión</label>
                  <select name="transmission" value={formData.transmission} onChange={handleChange}>
                    <option value="Automática">Automática</option>
                    <option value="Manual">Manual</option>
                    <option value="Dual">Dual</option>
                  </select>
                </div>
                <div className="form-input-group">
                  <label>Kilometraje</label>
                  <input name="mileage" value={formData.mileage} onChange={handleChange} placeholder="0 km" />
                </div>
                <div className="form-input-group">
                  <label>Puertas</label>
                  <input name="doors" value={formData.doors} onChange={handleChange} placeholder="5" />
                </div>
                <div className="form-input-group">
                  <label>Pasajeros</label>
                  <input name="passengers" value={formData.passengers} onChange={handleChange} placeholder="7" />
                </div>
              </motion.div>
            )}

            {activeTab === 'media' && (
              <motion.div
                key="media"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="media-section"
              >
                <div className="main-image-upload">
                  <label>Foto de Portada (Principal)</label>
                  <div 
                    className="dropzone-area"
                    onClick={() => document.getElementById('main-img-input').click()}
                  >
                    {formData.preview || formData.image ? (
                      <img 
                        src={
                          formData.preview || 
                          (typeof formData.image === 'string' && formData.image.startsWith('/uploads') 
                            ? `http://localhost:5000${formData.image}` 
                            : formData.image)
                        } 
                        alt="Preview" 
                        className="img-preview-main" 
                      />
                    ) : (
                      <div className="dropzone-placeholder">
                        <Plus size={40} />
                        <p>Haz clic para subir la imagen principal</p>
                      </div>
                    )}
                    <input 
                      id="main-img-input" 
                      type="file" 
                      hidden 
                      onChange={handleMainImageChange} 
                      accept="image/*" 
                    />
                  </div>
                </div>

                <div className="detail-images-gallery">
                  <label>Galería de Detalles (Carrusel interno)</label>
                  <div className="gallery-grid">
                    <div 
                      className="add-gallery-item"
                      onClick={() => document.getElementById('gallery-input').click()}
                    >
                      <Plus size={24} />
                      <input 
                        id="gallery-input" 
                        type="file" 
                        hidden 
                        multiple 
                        onChange={handleDetailImagesChange} 
                        accept="image/*" 
                      />
                    </div>
                    {detailImages.map((img, idx) => (
                      <div key={idx} className="gallery-item">
                        <img src={img} alt={`Detail ${idx}`} />
                        <button 
                          type="button" 
                          onClick={() => removeDetailImage(idx)} 
                          className="remove-detail-btn"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="form-footer">
          <button type="button" onClick={onCancel} className="btn-cancel">
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={loading} 
            className={`btn-save ${loading ? 'loading' : ''}`}
          >
            {loading ? 'Procesando...' : (
              <>
                <CheckCircle size={18} />
                <span>{formData.id ? 'Guardar Cambios' : 'Publicar Vehículo'}</span>
              </>
            )}
          </button>
        </div>
      </form>

      <style>{`
        .inventory-form-card {
          background: rgba(15, 15, 15, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(10px);
        }

        .form-header {
          padding: 1.5rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          background: rgba(255, 255, 255, 0.02);
        }

        .header-info h2 { font-size: 1.5rem; margin-bottom: 4px; color: #fff; }
        .header-info p { color: #6b7280; font-size: 0.9rem; }

        .btn-close-form {
          background: none;
          border: none;
          color: #4b5563;
          cursor: pointer;
          transition: color 0.2s;
        }

        .btn-close-form:hover { color: #ef4444; }

        .form-tabs {
          display: flex;
          padding: 0 1rem;
          background: rgba(255, 255, 255, 0.01);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .tab-btn {
          padding: 1.2rem 1.5rem;
          background: none;
          border: none;
          color: #6b7280;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          cursor: pointer;
          position: relative;
          transition: all 0.3s;
        }

        .tab-btn.active { color: #eab308; }
        .tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: #eab308;
          box-shadow: 0 0 10px #eab308;
        }

        .tab-content { padding: 2rem; min-height: 400px; }

        .form-section-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .form-input-group.full { grid-column: 1 / -1; }

        .form-input-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #9ca3af;
          font-size: 0.85rem;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .form-input-group input, 
        .form-input-group select, 
        .form-input-group textarea {
          width: 100%;
          padding: 0.8rem 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #fff;
          font-family: inherit;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .form-input-group select option {
          background-color: #1a1a1a;
          color: #fff;
        }

        .form-input-group input:focus, 
        .form-input-group select:focus, 
        .form-input-group textarea:focus {
          outline: none;
          border-color: #eab308;
          box-shadow: 0 0 0 2px rgba(234, 179, 8, 0.1);
        }

        /* Media Section */
        .media-section { display: flex; flex-direction: column; gap: 2rem; }

        .dropzone-area {
          width: 100%;
          height: 200px;
          border: 2px dashed rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          overflow: hidden;
          transition: border-color 0.2s;
        }

        .dropzone-area:hover { border-color: #eab308; }

        .img-preview-main { width: 100%; height: 100%; object-fit: cover; }

        .dropzone-placeholder { text-align: center; color: #4b5563; }
        .dropzone-placeholder p { margin-top: 8px; font-size: 0.9rem; }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .add-gallery-item {
          aspect-ratio: 1;
          background: rgba(255, 255, 255, 0.03);
          border: 2px dashed rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4b5563;
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-gallery-item:hover { border-color: #eab308; color: #eab308; }

        .gallery-item {
          position: relative;
          aspect-ratio: 1;
          border-radius: 12px;
          overflow: hidden;
        }

        .gallery-item img { width: 100%; height: 100%; object-fit: cover; }

        .remove-detail-btn {
          position: absolute;
          top: 5px;
          right: 5px;
          background: #ef4444;
          color: #fff;
          border: none;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          cursor: pointer;
        }

        .form-footer {
          padding: 1.5rem 2rem;
          background: rgba(0, 0, 0, 0.2);
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .btn-cancel {
          padding: 0.8rem 1.5rem;
          background: none;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #9ca3af;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-cancel:hover { background: rgba(255, 255, 255, 0.05); color: #fff; }

        .btn-save {
          padding: 0.8rem 2rem;
          background: #eab308;
          color: #000;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-save:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(234, 179, 8, 0.2); }
        .btn-save:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        /* Estilos del Autocompletado con IA */
        .btn-ai-autofill {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(234, 179, 8, 0.1);
          color: #eab308;
          border: 1px solid rgba(234, 179, 8, 0.3);
          padding: 0.6rem 1.2rem;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-ai-autofill:hover:not(:disabled) {
          background: rgba(234, 179, 8, 0.2);
          border-color: #eab308;
          transform: translateY(-1px);
        }

        .btn-ai-autofill:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          animation: spin-ai 1s linear infinite;
        }

        @keyframes spin-ai {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
};

export default VehicleForm;
