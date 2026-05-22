import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Edit2, Trash2, Plus, CheckCircle } from 'lucide-react';
import FacebookPromo from '../../FacebookPromo/FacebookPromo';
import './DiseñoReseñas.css';

const darkSwal = {
    background: '#111',
    color: '#fff',
    confirmButtonColor: '#f5b400',
    cancelButtonColor: '#333',
    customClass: {
        popup: 'premium-swal'
    }
};

import api from '../../../services/api';

const Reseñas = () => {
    const [reviews, setReviews] = useState([]);
    const [activeFilter, setActiveFilter] = useState('Todos');
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [storedUser, setStoredUser] = useState({});
    const navigate = useNavigate();

    // Cargar usuario y datos iniciales
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setStoredUser(user);
        fetchReviews();
    }, []);

    const userRole = (storedUser.rol || '').toLowerCase();
    const isAdminOrManager = userRole === 'admin' || userRole === 'gerente' || userRole === 'manager';

    const initialReviewState = {
        name: storedUser.nombre || 'Invitado',
        avatar: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
        comment: '',
        rating: 0,
        category: 'Compras',
        clientType: storedUser.rol || 'Cliente',
        productImage: ''
    };

    const [newReview, setNewReview] = useState(initialReviewState);

    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/reviews');
            setReviews(response.data.reverse());
        } catch (error) {
            console.error("Error fetching reviews:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewReview({ ...newReview, productImage: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddReview = async (e) => {
        e.preventDefault();
        
        if (!storedUser.id) {
            Swal.fire({
                ...darkSwal,
                icon: 'warning',
                title: 'Acceso Denegado',
                text: 'Debes iniciar sesión para publicar una reseña.'
            });
            return;
        }

        if (newReview.rating === 0) {
            Swal.fire({
                ...darkSwal,
                icon: 'error',
                title: 'Calificación vacía',
                text: 'Por favor selecciona una calificación con estrellas.'
            });
            return;
        }

        if (newReview.comment.trim().length < 5) {
            Swal.fire({
                ...darkSwal,
                icon: 'error',
                title: 'Comentario muy corto',
                text: 'Tu experiencia es valiosa, cuéntanos un poco más.'
            });
            return;
        }

        const reviewData = {
            ...newReview,
            userId: isEditing ? newReview.userId : storedUser.id,
            date: isEditing ? newReview.date : new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
            verified: true
        };

        try {
            let response;
            if (isEditing) {
                response = await api.put(`/reviews/${editingId}`, reviewData);
            } else {
                response = await api.post('/reviews', reviewData);
            }

            if (response.status === 200 || response.status === 201) {
                const savedReview = response.data;
                if (isEditing) {
                    setReviews(reviews.map(r => r.id === editingId ? savedReview : r));
                } else {
                    setReviews([savedReview, ...reviews]);
                }
                
                Swal.fire({
                    ...darkSwal,
                    icon: 'success',
                    title: isEditing ? '¡Actualizado!' : '¡Publicado!',
                    text: 'Reseña procesada correctamente.',
                    timer: 2000,
                    showConfirmButton: false
                });
                
                closeModal();
            }
        } catch (error) {
            Swal.fire({
                ...darkSwal,
                icon: 'error',
                title: 'Error de Red',
                text: 'No se pudo contactar con el servidor.'
            });
        }
    };

    const handleDeleteReview = async (id) => {
        const result = await Swal.fire({
            ...darkSwal,
            icon: 'question',
            title: '¿Confirmar eliminación?',
            text: 'Esta acción no se puede deshacer.',
            showCancelButton: true,
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) return;

        try {
            const response = await api.delete(`/reviews/${id}`);
            if (response.status === 200) {
                setReviews(reviews.filter(review => review.id !== id));
                Swal.fire({
                    ...darkSwal,
                    icon: 'success',
                    title: 'Eliminado',
                    text: 'La reseña ha sido eliminada exitosamente.',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        } catch (error) {
            Swal.fire({
                ...darkSwal,
                icon: 'error',
                title: 'Error',
                text: 'No se pudo eliminar la reseña.'
            });
        }
    };

    const handleEditClick = (review) => {
        setNewReview(review);
        setEditingId(review.id);
        setIsEditing(true);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setIsEditing(false);
        setEditingId(null);
        setNewReview(initialReviewState);
    };

    const toggleModal = () => {
        if (showModal) {
            closeModal();
        } else {
            if (!storedUser.id) {
                Swal.fire({
                    ...darkSwal,
                    icon: 'warning',
                    title: 'Sesión Requerida',
                    text: 'Debes iniciar sesión para compartir tu experiencia.',
                    confirmButtonText: 'Ir al Login',
                    showCancelButton: true,
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = '/login';
                    }
                });
                return;
            }
            setShowModal(true);
        }
    };

    const filters = ['Todos', 'Compras', 'Ventas', 'Importaciones'];
    const filteredReviews = activeFilter === 'Todos' 
        ? reviews 
        : reviews.filter(rev => rev.category === activeFilter);

    return (
        <section className="reviews-section">
            <div className="reviews-header">
                <h1>Testimonios de Excelencia</h1>
                <p>Nuestra reputación se basa en la satisfacción de quienes confían en nosotros. Gestiona y visualiza las experiencias de nuestra comunidad.</p>
                <button className="btn-primary-gold" onClick={toggleModal}>
                    <span>Dejar mi reseña</span>
                    <Plus size={18} />
                </button>
            </div>

            <div className="filters-container">
                {filters.map(filter => (
                    <button 
                        key={filter} 
                        className={`filter-tab ${activeFilter === filter ? 'active' : ''}`}
                        onClick={() => setActiveFilter(filter)}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            <div style={{ marginBottom: '2rem', marginTop: '1rem', padding: '0 2rem' }}>
                <FacebookPromo type="banner" reverse={true} />
            </div>

            <div className="reviews-grid">
                <div className="review-card add-review-card" onClick={toggleModal}>
                    <div className="add-icon">+</div>
                    <p>Comparte tu experiencia</p>
                    <span className="btn-primary-gold">Agregar mi experiencia</span>
                </div>

                {isLoading ? (
                    <div className="loading-state">Cargando experiencias...</div>
                ) : (
                    filteredReviews.map(review => (
                        <ReviewCard 
                            key={review.id} 
                            review={review} 
                            isAdmin={isAdminOrManager}
                            currentUserId={storedUser.id}
                            onDelete={() => handleDeleteReview(review.id)}
                            onEdit={() => handleEditClick(review)}
                        />
                    ))
                )}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="close-modal" onClick={closeModal}>&times;</button>
                        <h2>{isEditing ? 'Editar Reseña' : 'Tu Experiencia'}</h2>
                        <form onSubmit={handleAddReview}>
                            <div className="form-group">
                                <label>Calificación</label>
                                <div className="star-rating-input">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <span 
                                            key={star} 
                                            className="star-input"
                                            onClick={() => setNewReview({...newReview, rating: star})}
                                            style={{ color: star <= newReview.rating ? '#f5b400' : '#333' }}
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group flex-1">
                                    <label>Categoría</label>
                                    <select 
                                        className="form-control"
                                        value={newReview.category}
                                        onChange={e => setNewReview({...newReview, category: e.target.value})}
                                    >
                                        <option value="Compras">Compras</option>
                                        <option value="Ventas">Ventas</option>
                                        <option value="Importaciones">Importaciones</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Foto del vehículo</label>
                                <div className="custom-file-upload-wrapper">
                                    <input 
                                        type="file" 
                                        id="product-photo-upload"
                                        accept="image/*"
                                        className="custom-file-upload"
                                        onChange={handleImageUpload}
                                    />
                                </div>
                                {newReview.productImage && (
                                    <div className="preview-container">
                                        <img src={newReview.productImage} alt="Preview" className="image-preview" />
                                        <button type="button" className="remove-img" onClick={() => setNewReview({...newReview, productImage: ''})}>Eliminar</button>
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Comentario</label>
                                <textarea 
                                    className="form-control"
                                    placeholder="Cuéntanos sobre tu adquisición o venta..."
                                    value={newReview.comment}
                                    onChange={e => setNewReview({...newReview, comment: e.target.value})}
                                    required
                                ></textarea>
                            </div>

                            <button type="submit" className="btn-primary-gold w-full">
                                {isEditing ? 'Guardar Cambios' : 'Publicar Reseña'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
};

const ReviewCard = ({ review, isAdmin, currentUserId, onDelete, onEdit }) => {
    // Verificación robusta de propiedad
    const reviewOwnerId = String(review.userId || '');
    const activeUserId = String(currentUserId || '');
    const isOwner = activeUserId !== '' && activeUserId === reviewOwnerId;
    
    // Los administradores y gerentes no pueden editar ni eliminar reseñas (según requerimiento)
    const canManage = isOwner && !isAdmin;

    return (
        <div className="review-card">
            {canManage && (
                <div className="admin-actions">
                    <button className="action-btn edit-btn" onClick={(e) => { e.stopPropagation(); onEdit(); }} title="Editar">
                        <Edit2 size={16} />
                    </button>
                    <button className="action-btn delete-btn" onClick={(e) => { e.stopPropagation(); onDelete(); }} title="Eliminar">
                        <Trash2 size={16} />
                    </button>
                </div>
            )}

            <div className="card-top">
                <img src={review.avatar} alt={review.name} className="user-avatar" />
                <div className="user-info">
                    <div className="name-wrapper">
                        <h3>{review.name}</h3>
                        {isOwner && <span className="owner-badge">Tú</span>}
                    </div>
                    <span className="client-type">{review.clientType}</span>
                </div>
            </div>
            
            <div className="rating-stars">
                {[...Array(5)].map((_, i) => (
                    <span key={i} style={{ color: i < review.rating ? '#f5b400' : '#333' }}>★</span>
                ))}
            </div>

            {review.productImage && (
                <div className="product-image-container">
                    <img src={review.productImage} alt="Producto" className="product-review-image" />
                </div>
            )}
            
            <p className="review-comment">{review.comment}</p>
            
            <div className="card-footer">
                <div className="card-info">
                    <span className="category-tag">{review.category}</span>
                    <span className="separator"> • </span>
                    <span className="date">{review.date}</span>
                </div>
                {review.verified && (
                    <div className="verified-badge">
                        <CheckCircle size={14} />
                        <span>Verificado</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reseñas;
