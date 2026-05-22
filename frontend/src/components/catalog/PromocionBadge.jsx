import React from 'react';
import { Tag } from 'lucide-react';
import './PromocionBadge.css';

const PROMO_TAGS = ['Oferta', 'Promoción', 'Descuento', 'Hot Deal'];

const PromocionBadge = ({ tag, promoActiva }) => {
  const isPromo = promoActiva || PROMO_TAGS.some((t) => (tag || '').toLowerCase().includes(t.toLowerCase()));

  if (!isPromo) return null;

  return (
    <span className="promocion-badge" title="Promoción activa">
      <Tag size={12} />
      {tag || 'Promo'}
    </span>
  );
};

export default PromocionBadge;
