import React, { useState, useEffect } from 'react';
import type { MunicipalForm, FormField } from '../types/forms';

interface FormRendererProps {
  form: MunicipalForm;
  chatAnswers: { [key: string]: string };
  onSubmit: (formData: { [key: string]: string }) => void;
}

const FormRenderer: React.FC<FormRendererProps> = ({ form, chatAnswers, onSubmit }) => {
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set());

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
    const className = isAutoFilled ? 'form-field autofilled-field' : 'form-field';

    switch (field.type) {
      case 'select':
        return (
          <select
            key={field.id}
            className={className}
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
            className={className}
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
            className={className}
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
      <h2>{form.name}</h2>
      <p className="form-description">{form.description}</p>
      {autoFilledFields.size > 0 && (
        <div className="autofill-notice">
          ✨ Campos rellenados automáticamente desde el chat
        </div>
      )}
      <form onSubmit={handleSubmit} className="municipal-form">
        {form.fields.map(field => (
          <div key={field.id} className="field-group">
            <label htmlFor={field.id}>
              {field.label} {field.required && <span className="required">*</span>}
            </label>
            {renderField(field)}
          </div>
        ))}
        <button type="submit" className="submit-button">
          Enviar Solicitud
        </button>
      </form>
    </div>
  );
};

export default FormRenderer;
