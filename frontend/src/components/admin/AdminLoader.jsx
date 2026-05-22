import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const AdminLoader = ({ message = "Cargando datos del sistema...", height = "400px" }) => {
  return (
    <div className="admin-loader-container" style={{ minHeight: height }}>
      <motion.div 
        className="loader-content"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="spinner-wrapper">
          <Loader2 className="spinner-icon" size={48} />
          <div className="spinner-pulse"></div>
        </div>
        <p className="loader-text">{message}</p>
      </motion.div>

      <style>{`
        .admin-loader-container {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.02);
          border-radius: 24px;
        }

        .loader-content {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        .spinner-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .spinner-icon {
          color: #eab308;
          animation: spin 1s linear infinite;
          z-index: 2;
        }

        .spinner-pulse {
          position: absolute;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(234, 179, 8, 0.15);
          animation: pulse 2s ease-in-out infinite;
          z-index: 1;
        }

        .loader-text {
          color: #9ca3af;
          font-weight: 500;
          letter-spacing: 0.5px;
          font-size: 0.95rem;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 0.2; }
          100% { transform: scale(0.8); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default AdminLoader;
