import type { MunicipalForm } from '../types/forms';

export const municipalForms: MunicipalForm[] = [
  {
    id: 'solicitud-residencia',
    name: 'Solicitud de Certificado de Residencia',
    description: 'Formulario para solicitar certificado de residencia',
    fields: [
      { id: 'nombre', label: 'Nombre completo', type: 'text', required: true },
      { id: 'email', label: 'Correo electrónico', type: 'email', required: true },
      { id: 'edad', label: 'Edad', type: 'number', required: true },
      { id: 'direccion', label: 'Dirección actual', type: 'text', required: true },
      { id: 'telefono', label: 'Teléfono de contacto', type: 'text', required: true },
      { id: 'motivo', label: 'Motivo de la solicitud', type: 'textarea', required: true }
    ],
    chatMapping: {
      'name': 'nombre',
      'email': 'email',
      'age': 'edad',
      'address': 'direccion',
      'phone': 'telefono',
      'reason': 'motivo'
    }
  },
  {
    id: 'licencia-obras',
    name: 'Solicitud de Licencia de Obras',
    description: 'Formulario para solicitar licencia de obras menores',
    fields: [
      { id: 'solicitante', label: 'Nombre del solicitante', type: 'text', required: true },
      { id: 'email', label: 'Correo electrónico', type: 'email', required: true },
      { id: 'direccion_obra', label: 'Dirección de la obra', type: 'text', required: true },
      { id: 'tipo_obra', label: 'Tipo de obra', type: 'select', required: true, 
        options: ['Reforma interior', 'Reforma fachada', 'Ampliación', 'Otro'] },
      { id: 'descripcion', label: 'Descripción de la obra', type: 'textarea', required: true }
    ],
    chatMapping: {
      'name': 'solicitante',
      'email': 'email',
      'address': 'direccion_obra',
      'workType': 'tipo_obra',
      'description': 'descripcion'
    }
  },
  {
    id: 'empadronamiento',
    name: 'Solicitud de Empadronamiento',
    description: 'Formulario para solicitar empadronamiento',
    fields: [
      { id: 'nombre', label: 'Nombre y apellidos', type: 'text', required: true },
      { id: 'email', label: 'Correo electrónico', type: 'email', required: true },
      { id: 'dni', label: 'DNI/NIE', type: 'text', required: true },
      { id: 'fecha_nacimiento', label: 'Fecha de nacimiento', type: 'text', required: true },
      { id: 'nacionalidad', label: 'Nacionalidad', type: 'text', required: true },
      { id: 'direccion_anterior', label: 'Dirección anterior', type: 'text' },
      { id: 'direccion_nueva', label: 'Nueva dirección', type: 'text', required: true }
    ],
    chatMapping: {
      'name': 'nombre',
      'email': 'email',
      'dni': 'dni',
      'birthDate': 'fecha_nacimiento',
      'country': 'nacionalidad',
      'previousAddress': 'direccion_anterior',
      'newAddress': 'direccion_nueva'
    }
  }
];

export function getFormById(id: string): MunicipalForm | undefined {
  return municipalForms.find(form => form.id === id);
}

export function getFormsByKeyword(keyword: string): MunicipalForm[] {
  const lowerKeyword = keyword.toLowerCase();
  return municipalForms.filter(form => 
    form.name.toLowerCase().includes(lowerKeyword) ||
    form.description.toLowerCase().includes(lowerKeyword)
  );
}
