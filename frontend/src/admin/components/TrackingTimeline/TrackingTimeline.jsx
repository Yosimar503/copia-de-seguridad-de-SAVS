import React, { useState } from 'react';
import {
  Check, Ship, Clock, MapPin, ChevronDown, ChevronUp,
  Package, Navigation, Anchor, Globe
} from 'lucide-react';
import './TrackingTimeline.css';

/* ─── Configuración de etapas ─── */
const STAGES = [
  {
    step: 1,
    label: 'Compra Realizada',
    icon: Check,
    color: '#10b981',
    bg: 'rgba(16,185,129,0.12)',
    description: 'La orden fue procesada y confirmada exitosamente.',
    details: ['Pago verificado', 'Contrato firmado', 'Vehículo reservado'],
  },
  {
    step: 2,
    label: 'En Tránsito',
    icon: Ship,
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.12)',
    description: 'El vehículo está en tránsito marítimo hacia el destino.',
    details: ['Embarcado en origen', 'En ruta oceánica', 'Documentos en trámite'],
  },
  {
    step: 3,
    label: 'En Aduanas',
    icon: Clock,
    color: '#eab308',
    bg: 'rgba(234,179,8,0.12)',
    description: 'El vehículo está siendo procesado en aduana nacional.',
    details: ['Inspección aduanal', 'Pago de aranceles', 'Liberación en proceso'],
  },
  {
    step: 4,
    label: 'Entrega Final',
    icon: MapPin,
    color: '#a855f7',
    bg: 'rgba(168,85,247,0.12)',
    description: 'El vehículo está listo para ser entregado al cliente.',
    details: ['Revisión mecánica OK', 'Placas tramitadas', 'Listo para retirar'],
  },
];

const STEP_ICONS_ALT = [Navigation, Ship, Anchor, Globe];

/**
 * TrackingTimeline — historial visual animado del proceso de importación.
 *
 * @param {{ tracking: object }} props
 *   tracking.importStatus  — número de etapa activa (1-4)
 *   tracking.vehicleName   — nombre del vehículo
 *   tracking.estimatedDate — fecha estimada de arribo
 *   tracking.location      — ubicación actual
 *   tracking.vessel        — nombre del barco/naviera
 *   tracking.statusText    — descripción adicional del estado
 */
const TrackingTimeline = ({ tracking = {} }) => {
  const [expandedStep, setExpandedStep] = useState(null);

  const currentStep = tracking.importStatus || 0;

  const toggleStep = (step) =>
    setExpandedStep(prev => (prev === step ? null : step));

  return (
    <div className="tracking-timeline-wrapper">
      {/* Info de ruta */}
      {tracking.vehicleName && (
        <div className="timeline-vehicle-bar">
          <Package size={16} className="tl-bar-icon" />
          <span className="tl-vehicle-name">{tracking.vehicleName}</span>
          {tracking.estimatedDate && (
            <span className="tl-eta">ETA: {tracking.estimatedDate}</span>
          )}
        </div>
      )}

      {/* Línea de tiempo */}
      <div className="timeline-track">
        {STAGES.map((stage, idx) => {
          const isCompleted = currentStep > stage.step;
          const isActive    = currentStep === stage.step;
          const isPending   = currentStep < stage.step;
          const isExpanded  = expandedStep === stage.step;
          const Icon        = stage.icon;
          const AltIcon     = STEP_ICONS_ALT[idx];

          return (
            <div key={stage.step} className="timeline-step-outer">
              {/* Conector entre pasos */}
              {idx < STAGES.length - 1 && (
                <div
                  className={`timeline-connector ${isCompleted ? 'done' : ''} ${isActive ? 'active' : ''}`}
                  style={{ '--stage-color': stage.color }}
                />
              )}

              {/* Nodo de etapa */}
              <div
                className={`timeline-node
                  ${isCompleted ? 'completed' : ''}
                  ${isActive    ? 'active'    : ''}
                  ${isPending   ? 'pending'   : ''}
                `}
                style={{ '--stage-color': stage.color, '--stage-bg': stage.bg }}
                onClick={() => toggleStep(stage.step)}
                role="button"
                aria-expanded={isExpanded}
              >
                {/* Icono del nodo */}
                <div className="node-icon-ring">
                  {isActive && <div className="node-pulse" style={{ '--stage-color': stage.color }} />}
                  <div className="node-icon-inner">
                    <Icon size={18} />
                  </div>
                </div>

                {/* Etiqueta */}
                <div className="node-label">
                  <span className="node-step-num">Etapa {stage.step}</span>
                  <span className="node-step-label">{stage.label}</span>
                  {isActive && tracking.location && (
                    <span className="node-location">
                      <Navigation size={11} /> {tracking.location}
                    </span>
                  )}
                </div>

                {/* Badge de estado */}
                <div className="node-status-badge">
                  {isCompleted && <span className="badge-done">✓ Completado</span>}
                  {isActive    && <span className="badge-active" style={{ color: stage.color }}>● En curso</span>}
                  {isPending   && <span className="badge-pending">Pendiente</span>}
                  {(isCompleted || isActive) && (
                    isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                  )}
                </div>
              </div>

              {/* Panel expandible de detalles */}
              {isExpanded && (
                <div
                  className="timeline-detail-panel"
                  style={{ '--stage-color': stage.color, '--stage-bg': stage.bg }}
                >
                  <div className="tdp-header">
                    <AltIcon size={20} style={{ color: stage.color }} />
                    <p className="tdp-description">{stage.description}</p>
                  </div>
                  <ul className="tdp-checklist">
                    {stage.details.map((item, i) => (
                      <li
                        key={i}
                        className={`tdp-check-item ${isCompleted || isActive ? 'done' : ''}`}
                        style={{ animationDelay: `${i * 0.07}s` }}
                      >
                        <span className="tdp-check-dot" style={{ background: isCompleted ? stage.color : isActive ? stage.color : '#374151' }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                  {isActive && tracking.vessel && (
                    <div className="tdp-extra">
                      <Ship size={13} /> {tracking.vessel}
                    </div>
                  )}
                  {isActive && tracking.statusText && (
                    <div className="tdp-status-text">{tracking.statusText}</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mensaje si no tiene tracking */}
      {currentStep === 0 && (
        <div className="timeline-empty">
          <Package size={32} />
          <p>No hay información de seguimiento disponible aún.</p>
        </div>
      )}
    </div>
  );
};

export default TrackingTimeline;
