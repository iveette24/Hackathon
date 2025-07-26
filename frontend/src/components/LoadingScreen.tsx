import React from 'react';
import './LoadingScreen.css';

const LoadingScreen: React.FC = () => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-logo">
          <i className="bi bi-building"></i>
        </div>
        <h2 className="loading-title">Portal del Ayuntamiento</h2>
        <div className="loading-spinner">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
        <p className="loading-text">Iniciando aplicación...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
