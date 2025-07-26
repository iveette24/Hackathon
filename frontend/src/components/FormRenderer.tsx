import React, { useState, useEffect } from 'react';
import type { MunicipalForm, FormField } from '../types/forms';
import PDFGenerator from './PDFGenerator';
import type { FormData } from '../services/pdfService';

interface FormRendererProps {
  form: MunicipalForm;
  chatAnswers: { [key: string]: string };
  onSubmit: (formData: { [key: string]: string }) => void;
}

const FormRenderer: React.FC<FormRendererProps> = ({ form, chatAnswers, onSubmit }) => {
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set());
  const [showPDFGenerator, setShowPDFGenerator] = useState(false);

  useEffect(() => {
    // Auto-fill form with chat answers
    const newFormData: { [key: string]: string } = {};
    const autoFilled = new Set<string>();

    Object.entries(form.chatMapping).forEach(([chatKey, fieldId]) => {
      if (chatAnswers[chatKey]) {
        newFormData[fieldId] = chatAnswers[chatKey];
        autoFilled.add(fieldId);
      }
    });

    setFormData(newFormData);
    setAutoFilledFields(autoFilled);
  }, [form, chatAnswers]);

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    // Remove from auto-filled if user modifies
    if (autoFilledFields.has(fieldId)) {
      setAutoFilledFields(prev => {
        const newSet = new Set(prev);
        newSet.delete(fieldId);
        return newSet;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderField = (field: FormField) => {
    const isAutoFilled = autoFilledFields.has(field.id);
    const baseClassName = isAutoFilled ? 'autofilled-field' : '';

    switch (field.type) {
      case 'select':
        return (
          <select
            key={field.id}
            className={`form-select ${baseClassName}`}
            value={formData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
          >
            <option value="">Seleccionar...</option>
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'textarea':
        return (
          <textarea
            key={field.id}
            className={`form-control ${baseClassName}`}
            value={formData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={3}
          />
        );
      default:
        return (
          <input
            key={field.id}
            type={field.type}
            className={`form-control ${baseClassName}`}
            value={formData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        );
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>{form.name}</h2>
        <p className="form-description">{form.description}</p>
      </div>
      
      {autoFilledFields.size > 0 && (
        <div className="autofill-notice">
          <strong>Campos rellenados automáticamente desde el chat</strong>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="municipal-form">
        <div className="row">
          {form.fields.map(field => (
            <div key={field.id} className="col-md-6 mb-3">
              <div className="form-group">
                <label htmlFor={field.id} className="form-label">
                  {field.label} {field.required && <span className="required">*</span>}
                </label>
                {renderField(field)}
              </div>
            </div>
          ))}
        </div>
        
        <div className="d-grid gap-2">
          <div className="row">
            <div className="col-md-6">
              <button 
                type="button" 
                className="btn btn-outline-primary w-100"
                onClick={() => setShowPDFGenerator(true)}
              >
                <i className="bi bi-file-earmark-pdf me-2"></i>
                Generar PDF
              </button>
            </div>
            <div className="col-md-6">
              <button type="submit" className="submit-button w-100">
                <i className="bi bi-check-lg me-2"></i>
                Enviar Solicitud
              </button>
            </div>
          </div>
        </div>
      </form>

      {showPDFGenerator && (
        <PDFGenerator
          form={form}
          formData={formData as FormData}
          onClose={() => setShowPDFGenerator(false)}
        />
      )}
    </div>
  );
};

export default FormRenderer;
