import React from 'react';
import './ProgressIndicator.css';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  formName?: string;
  collectedData: { [key: string]: string };
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ 
  currentStep, 
  totalSteps, 
  formName,
  collectedData 
}) => {
  const progressPercentage = totalSteps > 0 ? Math.round((currentStep / totalSteps) * 100) : 0;
  const collectedFieldsCount = Object.keys(collectedData).filter(key => collectedData[key]?.trim()).length;
  
  return (
    <div className="progress-indicator">
      <div className="progress-header">
        <div className="progress-info">
          <span className="progress-label">
            <i className="bi bi-list-check me-1"></i>
            {formName ? `Formulario: ${formName}` : 'Recopilando información'}
          </span>
          <span className="progress-stats">
            {collectedFieldsCount}/{totalSteps} campos completados
          </span>
        </div>
        <span className="progress-percentage">{progressPercentage}%</span>
      </div>
      
      <div className="progress-bar-container">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      
      <div className="collected-data-preview">
        {Object.entries(collectedData)
          .filter(([_, value]) => value?.trim())
          .slice(0, 3)
          .map(([key, value]) => (
            <div key={key} className="data-pill">
              <i className="bi bi-check-circle-fill me-1"></i>
              <span className="data-label">{key}:</span>
              <span className="data-value">{value}</span>
            </div>
          ))}
        {collectedFieldsCount > 3 && (
          <div className="data-pill more-indicator">
            <i className="bi bi-three-dots me-1"></i>
            +{collectedFieldsCount - 3} más
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressIndicator;
