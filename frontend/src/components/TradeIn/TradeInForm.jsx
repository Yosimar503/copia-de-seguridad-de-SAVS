import React, { useState } from 'react';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { handleApiError } from '../../utils/apiError';
import '../IntercambioDeAutos/IntercambioDeAutos.css';

const darkSwal = {
  background: '#141414',
  color: '#fff',
  confirmButtonColor: '#f5b400'
};

const initialFormState = {
  marca: '',
  modelo: '',
  anio: '',
  kilometraje: '',
  condicion: '',
  precio: '',
  descripcion: '',
  imagen: null
};

const TradeInForm = ({ userId, onSuccess, isEditing, editData, onCancelEdit }) => {
  const [formData, setFormData] = useState(editData || initialFormState);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const next = {};
    if (!formData.marca?.trim()) next.marca = 'Marca requerida';
    if (!formData.modelo?.trim()) next.modelo = 'Modelo requerido';
    if (!formData.anio || Number(formData.anio) <= 0) next.anio = 'Año inválido';
    if (formData.kilometraje === '' || Number(formData.kilometraje) < 0) next.kilometraje = 'Kilometraje inválido';
    if (!formData.condicion?.trim()) next.condicion = 'Condición requerida';
    if (!formData.precio || Number(formData.precio) <= 0) next.precio = 'Precio inválido';
    if (!formData.descripcion?.trim()) next.descripcion = 'Descripción requerida';
    if (!formData.imagen && !isEditing) next.imagen = 'Imagen requerida';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const clean = (name === 'precio' || name === 'kilometraje' || name === 'anio')
      ? value.replace(/\D/g, '')
      : value.replace(/-/g, '');
    setFormData((prev) => ({ ...prev, [name]: clean }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setFormData((prev) => ({ ...prev, imagen: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Revisa los campos marcados');
      return;
    }

    const payload = {
      marca: formData.marca.trim(),
      modelo: formData.modelo.trim(),
      anio: Number(formData.anio),
      kilometraje: Number(formData.kilometraje),
      condicion: formData.condicion.trim(),
      precio: Number(formData.precio),
      descripcion: `[${formData.condicion}] ${formData.descripcion.trim()}`,
      imagen: formData.imagen,
      estado: 'Pendiente',
      userId
    };

    setLoading(true);
    try {
      if (isEditing && formData.id) {
        await api.put(`/sale_requests/${formData.id}`, payload);
        toast.success('Solicitud actualizada');
      } else {
        await api.post('/sale_requests', { ...payload, id: String(Date.now()) });
        toast.success('Solicitud enviada correctamente', { icon: '📋' });
        Swal.fire({ ...darkSwal, icon: 'success', title: '¡Recibido!', text: 'Tu trade-in fue registrado.' });
      }
      setFormData(initialFormState);
      onSuccess?.();
    } catch (err) {
      handleApiError('TradeInForm', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="vender-auto-form" onSubmit={handleSubmit} noValidate>
      <div className="form-group-row">
        <div className="form-group">
          <label>Marca</label>
          <input type="text" name="marca" value={formData.marca} onChange={handleInputChange} required placeholder="Ej. Toyota" />
          {errors.marca && <span className="field-error">{errors.marca}</span>}
        </div>
        <div className="form-group">
          <label>Modelo</label>
          <input type="text" name="modelo" value={formData.modelo} onChange={handleInputChange} required placeholder="Ej. Corolla" />
          {errors.modelo && <span className="field-error">{errors.modelo}</span>}
        </div>
      </div>

      <div className="form-group-row">
        <div className="form-group">
          <label>Año</label>
          <input type="text" inputMode="numeric" name="anio" value={formData.anio} onChange={handleInputChange} required />
          {errors.anio && <span className="field-error">{errors.anio}</span>}
        </div>
        <div className="form-group">
          <label>Kilometraje</label>
          <input type="text" inputMode="numeric" name="kilometraje" value={formData.kilometraje} onChange={handleInputChange} required />
          {errors.kilometraje && <span className="field-error">{errors.kilometraje}</span>}
        </div>
      </div>

      <div className="form-group">
        <label>Condición del vehículo</label>
        <select name="condicion" value={formData.condicion} onChange={handleInputChange} required>
          <option value="">Seleccionar...</option>
          <option value="Excelente">Excelente</option>
          <option value="Bueno">Bueno</option>
          <option value="Regular">Regular</option>
          <option value="Necesita reparación">Necesita reparación</option>
        </select>
        {errors.condicion && <span className="field-error">{errors.condicion}</span>}
      </div>

      <div className="form-group">
        <label>Precio esperado (CRC)</label>
        <input type="text" inputMode="numeric" name="precio" value={formData.precio} onChange={handleInputChange} required />
        {errors.precio && <span className="field-error">{errors.precio}</span>}
      </div>

      <div className="form-group">
        <label>Descripción adicional</label>
        <textarea name="descripcion" value={formData.descripcion} onChange={handleInputChange} required rows="4" />
        {errors.descripcion && <span className="field-error">{errors.descripcion}</span>}
      </div>

      <div className="form-group">
        <label>Imagen del vehículo</label>
        <input type="file" id="imagen-upload" accept="image/*" onChange={handleImageChange} className="file-upload-input" />
        {errors.imagen && <span className="field-error">{errors.imagen}</span>}
        {formData.imagen && (
          <div className="image-preview">
            <img src={formData.imagen} alt="Vista previa" />
          </div>
        )}
      </div>

      <div className="form-actions">
        {isEditing && (
          <button type="button" className="btn-cancel" onClick={onCancelEdit}>Cancelar</button>
        )}
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Procesando...' : (isEditing ? 'Guardar cambios' : 'Enviar para avalúo')}
        </button>
      </div>
    </form>
  );
};

export default TradeInForm;
