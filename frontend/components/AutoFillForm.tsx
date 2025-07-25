import React, { useEffect } from 'react';

interface AutoFillFormProps {
  chatData: { [key: string]: string };
  selectedForm: string;
  onChange: (field: string, value: string) => void;
  formFields: string[];
}

const fieldMapping: { [formName: string]: { [field: string]: string } } = {
  // Ejemplo de mapeo: formulario => campo del formulario => clave en chatData
  'formulario1': {
    nombre: 'nombre',
    email: 'correo',
    telefono: 'telefono'
  },
  // ...otros formularios...
};

const AutoFillForm: React.FC<AutoFillFormProps> = ({
  chatData,
  selectedForm,
  onChange,
  formFields
}) => {
  useEffect(() => {
    const mapping = fieldMapping[selectedForm] || {};
    formFields.forEach(field => {
      const chatKey = mapping[field];
      if (chatKey && chatData[chatKey]) {
        onChange(field, chatData[chatKey]);
      }
    });
  }, [chatData, selectedForm, formFields, onChange]);

  return null; // Este componente solo rellena, no renderiza nada
};

/**
 * Devuelve un objeto con los campos que han sido rellenados automáticamente.
 * El componente padre puede usar esto para aplicar una clase de alto contraste.
 */
export function getAutoFilledFields(
  chatData: { [key: string]: string },
  selectedForm: string,
  formFields: string[]
): { [field: string]: boolean } {
  const mapping = fieldMapping[selectedForm] || {};
  const result: { [field: string]: boolean } = {};
  formFields.forEach(field => {
    const chatKey = mapping[field];
    if (chatKey && chatData[chatKey]) {
      result[field] = true;
    }
  });
  return result;
}

/*
  Sugerencia de CSS para alto contraste y texto negro en los campos rellenados automáticamente:

  .autofilled-field {
    background-color: #FFD700 !important;   // Fondo amarillo dorado para alto contraste
    color: #000 !important;                 // Texto negro para máxima legibilidad
    border: 2px solid #222 !important;      // Borde oscuro
    font-weight: bold !important;
    letter-spacing: 0.5px;
  }
*/

export default AutoFillForm;
