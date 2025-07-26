// Utilidades de validación para los campos del chat
export interface ValidationResult {
  isValid: boolean;
  message?: string;
  suggestedValue?: string;
}

// Lista de nacionalidades válidas
const VALID_NATIONALITIES = [
  'española', 'alemana', 'francesa', 'italiana', 'portuguesa', 'británica', 'irlandesa',
  'holandesa', 'belga', 'austriaca', 'suiza', 'danesa', 'sueca', 'noruega', 'finlandesa',
  'polaca', 'checa', 'eslovaca', 'húngara', 'rumana', 'búlgara', 'croata', 'eslovena',
  'estonia', 'letona', 'lituana', 'griega', 'chipriota', 'maltesa', 'luxemburguesa',
  'marroquí', 'argelina', 'tunecina', 'egipcia', 'nigeriana', 'sudafricana', 'ghanesa',
  'argentina', 'brasileña', 'chilena', 'colombiana', 'peruana', 'venezolana', 'ecuatoriana',
  'boliviana', 'paraguaya', 'uruguaya', 'mexicana', 'estadounidense', 'canadiense',
  'china', 'japonesa', 'coreana', 'india', 'paquistaní', 'bangladesí', 'filipina',
  'tailandesa', 'vietnamita', 'indonesia', 'malasia', 'singapurense', 'australiana',
  'neozelandesa', 'rusa', 'ucraniana', 'bielorrusa', 'serbia', 'bosnia', 'montenegrina',
  'macedonia', 'albanesa', 'moldava', 'georgiana', 'armenia', 'azerbaiyana', 'kazaja',
  'uzbeka', 'turkmena', 'kirguisa', 'tayika', 'afgana', 'iraní', 'iraquí', 'siria',
  'libanesa', 'jordana', 'israelí', 'palestina', 'saudí', 'emiratí', 'kuwaití', 'qatarí',
  'bahraní', 'omaní', 'yemení'
];

export class ValidationUtils {
  
  // Validar DNI/NIE español
  static validateDNI(dni: string): ValidationResult {
    if (!dni) {
      return { isValid: false, message: "El DNI/NIE es obligatorio" };
    }
    
    // Limpiar y formatear el DNI (eliminar espacios, guiones, puntos)
    const cleanDni = dni.toUpperCase().replace(/[\s\-\.]/g, '');
    
    // Verificar formato básico
    const dniRegex = /^[0-9]{8}[A-Z]$/;
    const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/;
    
    if (!dniRegex.test(cleanDni) && !nieRegex.test(cleanDni)) {
      // Verificar si tiene la longitud correcta pero formato incorrecto
      if (cleanDni.length === 9) {
        return { 
          isValid: false, 
          message: "Formato incorrecto. Debe tener 8 números + 1 letra (DNI) o X/Y/Z + 7 números + 1 letra (NIE)",
          suggestedValue: cleanDni
        };
      } else if (cleanDni.length < 9) {
        return { 
          isValid: false, 
          message: `Faltan ${9 - cleanDni.length} caracteres. El formato debe ser: 12345678A o X1234567A`,
          suggestedValue: cleanDni
        };
      } else {
        return { 
          isValid: false, 
          message: "Demasiados caracteres. El formato debe ser: 12345678A (DNI) o X1234567A (NIE)",
          suggestedValue: cleanDni.substring(0, 9)
        };
      }
    }
    
    // Solo verificar formato, no validar letra de control
    // El usuario puede escribir su propia letra
    return { isValid: true, suggestedValue: cleanDni };
  }
  
  // Validar nacionalidad
  static validateNationality(nationality: string): ValidationResult {
    if (!nationality) {
      return { isValid: false, message: "La nacionalidad es obligatoria" };
    }
    
    const cleanNationality = nationality.toLowerCase().trim();
    
    // Buscar coincidencia exacta o parcial
    const exactMatch = VALID_NATIONALITIES.includes(cleanNationality);
    const partialMatches = VALID_NATIONALITIES.filter(nat => 
      nat.includes(cleanNationality) || cleanNationality.includes(nat)
    );
    
    if (exactMatch) {
      // Capitalizar primera letra
      const formatted = cleanNationality.charAt(0).toUpperCase() + cleanNationality.slice(1);
      return { isValid: true, suggestedValue: formatted };
    }
    
    if (partialMatches.length > 0) {
      const suggestion = partialMatches[0];
      const formatted = suggestion.charAt(0).toUpperCase() + suggestion.slice(1);
      return { 
        isValid: false, 
        message: `¿Te refieres a "${formatted}"? Las nacionalidades válidas incluyen: ${partialMatches.slice(0, 3).map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(', ')}`,
        suggestedValue: formatted
      };
    }
    
    return { 
      isValid: false, 
      message: "Nacionalidad no reconocida. Ejemplos: Española, Francesa, Alemana, Marroquí, etc." 
    };
  }
  
  // Validar fecha de nacimiento
  static validateBirthDate(dateString: string): ValidationResult {
    if (!dateString) {
      return { isValid: false, message: "La fecha de nacimiento es obligatoria" };
    }
    
    const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = dateString.match(dateRegex);
    
    if (!match) {
      return { 
        isValid: false, 
        message: "Formato incorrecto. Use DD/MM/AAAA (ej: 15/03/1990)" 
      };
    }
    
    const day = parseInt(match[1]);
    const month = parseInt(match[2]);
    const year = parseInt(match[3]);
    
    // Validar rangos básicos
    if (month < 1 || month > 12) {
      return { isValid: false, message: "El mes debe estar entre 1 y 12" };
    }
    
    if (day < 1 || day > 31) {
      return { isValid: false, message: "El día debe estar entre 1 y 31" };
    }
    
    const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear) {
      return { isValid: false, message: `El año debe estar entre 1900 y ${currentYear}` };
    }
    
    // Crear fecha y validar que sea válida
    const date = new Date(year, month - 1, day);
    if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
      return { isValid: false, message: "Fecha inválida" };
    }
    
    // Validar que la persona sea mayor de edad
    const today = new Date();
    const age = today.getFullYear() - year - (today.getMonth() < month - 1 || (today.getMonth() === month - 1 && today.getDate() < day) ? 1 : 0);
    
    if (age < 16) {
      return { isValid: false, message: "Debe ser mayor de 16 años para realizar este trámite" };
    }
    
    // Formatear fecha correctamente
    const formattedDate = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
    
    return { isValid: true, suggestedValue: formattedDate };
  }
  
  // Validar teléfono
  static validatePhone(phone: string): ValidationResult {
    if (!phone) {
      return { isValid: false, message: "El teléfono es obligatorio" };
    }
    
    const cleanPhone = phone.replace(/\s/g, '').replace(/[-()]/g, '');
    const phoneRegex = /^[6-9]\d{8}$/;
    
    if (!phoneRegex.test(cleanPhone)) {
      return { 
        isValid: false, 
        message: "Formato incorrecto. Debe ser un teléfono español válido (ej: 612345678)" 
      };
    }
    
    return { isValid: true, suggestedValue: cleanPhone };
  }
  
  // Validar número
  static validateNumber(value: string): ValidationResult {
    if (!value) {
      return { isValid: false, message: "Este campo es obligatorio" };
    }
    
    const num = parseInt(value);
    if (isNaN(num) || num <= 0) {
      return { isValid: false, message: "Debe ser un número válido mayor que 0" };
    }
    
    return { isValid: true, suggestedValue: num.toString() };
  }
  
  // Validar texto requerido
  static validateRequired(value: string, fieldName: string = "campo"): ValidationResult {
    if (!value || value.trim().length === 0) {
      return { isValid: false, message: `El ${fieldName} es obligatorio` };
    }
    
    if (value.trim().length < 2) {
      return { isValid: false, message: `El ${fieldName} debe tener al menos 2 caracteres` };
    }
    
    return { isValid: true, suggestedValue: value.trim() };
  }
  
  // Validar campo basado en su tipo
  static validateField(value: string, validation?: string, fieldName: string = "campo", required: boolean = true): ValidationResult {
    if (required && (!value || value.trim().length === 0)) {
      return { isValid: false, message: `El ${fieldName} es obligatorio` };
    }
    
    if (!value || value.trim().length === 0) {
      return { isValid: true, suggestedValue: value };
    }
    
    switch (validation) {
      case 'dni':
        return this.validateDNI(value);
      case 'date':
        return this.validateBirthDate(value);
      case 'phone':
        return this.validatePhone(value);
      case 'number':
        return this.validateNumber(value);
      case 'nationality':
        return this.validateNationality(value);
      default:
        return this.validateRequired(value, fieldName);
    }
  }
}
