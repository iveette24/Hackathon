import React from 'react';
import './DocumentInfo.css';

interface DocumentInfoData {
  key_info: string[];
  requirements: string[];
  success: boolean;
  summary: string;
  title: string;
}

interface DocumentInfoProps {
  data: DocumentInfoData;
  onProceed: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

const DocumentInfo: React.FC<DocumentInfoProps> = ({ 
  data, 
  onProceed, 
  onBack, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="document-info-container">
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando información...</span>
          </div>
          <p className="mt-3 text-muted">Obteniendo información del documento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="document-info-container">
      <div className="document-info-card">
        {/* Header */}
        <div className="document-header">
          <div className="d-flex align-items-center mb-3">
            <button 
              className="btn btn-outline-secondary me-3" 
              onClick={onBack}
              aria-label="Volver atrás"
            >
              <i className="bi bi-arrow-left"></i>
            </button>
            <div>
              <h2 className="document-title mb-1">{data.title}</h2>
              <span className="badge bg-success">
                <i className="bi bi-check-circle me-1"></i>
                Documento disponible
              </span>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="document-section">
          <div className="section-header">
            <i className="bi bi-info-circle text-primary me-2"></i>
            <h4>Descripción</h4>
          </div>
          <div className="alert alert-info" role="alert">
            <i className="bi bi-lightbulb me-2"></i>
            {data.summary}
          </div>
        </div>

        {/* Key Information */}
        <div className="document-section">
          <div className="section-header">
            <i className="bi bi-key text-warning me-2"></i>
            <h4>Información Importante</h4>
          </div>
          <div className="key-info-grid">
            {data.key_info.map((info, index) => (
              <div key={index} className="key-info-item">
                <div className="key-info-icon">
                  <i className="bi bi-check2-circle text-success"></i>
                </div>
                <p className="key-info-text">{info}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Requirements */}
        <div className="document-section">
          <div className="section-header">
            <i className="bi bi-clipboard-check text-danger me-2"></i>
            <h4>Documentación Requerida</h4>
          </div>
          <div className="requirements-list">
            {data.requirements.map((requirement, index) => (
              <div key={index} className="requirement-item">
                <div className="requirement-icon">
                  <i className="bi bi-file-earmark-text text-primary"></i>
                </div>
                <span className="requirement-text">{requirement}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="document-actions">
          <div className="row g-3">
            <div className="col-md-6">
              <button 
                className="btn btn-outline-secondary w-100"
                onClick={onBack}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Volver al Chat
              </button>
            </div>
            <div className="col-md-6">
              <button 
                className="btn btn-primary w-100"
                onClick={onProceed}
              >
                <i className="bi bi-arrow-right me-2"></i>
                Continuar con el Formulario
              </button>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="document-footer">
          <div className="row text-center">
            <div className="col-md-4">
              <div className="info-badge">
                <i className="bi bi-clock text-primary"></i>
                <small className="d-block text-muted">Disponible 24/7</small>
              </div>
            </div>
            <div className="col-md-4">
              <div className="info-badge">
                <i className="bi bi-shield-check text-success"></i>
                <small className="d-block text-muted">Proceso Seguro</small>
              </div>
            </div>
            <div className="col-md-4">
              <div className="info-badge">
                <i className="bi bi-award text-warning"></i>
                <small className="d-block text-muted">Trámite Gratuito</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentInfo;
