// Tipos para la respuesta del backend
export interface DocumentInfoResponse {
  key_info: string[];
  requirements: string[];
  success: boolean;
  summary: string;
  title: string;
}

// Servicio para obtener información de documentos
export class DocumentService {
  private static baseUrl = 'http://localhost:3000/api'; // Ajustar según tu backend

  static async getDocumentInfo(documentType: string): Promise<DocumentInfoResponse> {
    try {
      const endpoint = this.getEndpointByDocumentType(documentType);
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Agregar token de autenticación si es necesario
          // 'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: DocumentInfoResponse = await response.json();
      
      if (!data.success) {
        throw new Error('Error al obtener información del documento');
      }

      return data;
    } catch (error) {
      console.error('Error fetching document info:', error);
      throw error;
    }
  }

  private static getEndpointByDocumentType(documentType: string): string {
    const endpoints: { [key: string]: string } = {
      'empadronamiento': '/chat/padron',
      'solicitud-residencia': '/chat/residencia',
      'licencia-obras': '/chat/obras',
    };

    return endpoints[documentType] || '/chat/info';
  }

  // Simulación de datos para desarrollo (remover cuando el backend esté listo)
  static getMockDocumentInfo(documentType: string): DocumentInfoResponse {
    const mockData: { [key: string]: DocumentInfoResponse } = {
      'empadronamiento': {
        key_info: [
          "Qualsevol persona major de 16 anys que visqui al municipi pot presentar la sol·licitud",
          "Es pot presentar en qualsevol moment",
          "La inscripció es realitza a l'instant a les oficines OMAC",
          "El tràmit és gratuït",
          "Estrangers no comunitaris han de renovar cada dos anys",
          "Presentació a Oficines Municipals d'Atenció Ciutadana (OMAC)"
        ],
        requirements: [
          "Documentació d'identitat segons nacionalitat (DNI, NIE, passaport)",
          "Documentació que acrediti el domicili (escriptura, contracte de lloguer, autorització)",
          "Per menors d'edat: llibre de família o certificat de naixement",
          "Autorització si és necessària per fer tràmits"
        ],
        success: true,
        summary: "Es la inscripció al padró municipal d'habitants de la ciutat de Tarragona. El padró municipal és el registre administratiu on consten els veïns del municipi.",
        title: "Alta al padró d'habitants - Tarragona"
      },
      'solicitud-residencia': {
        key_info: [
          "Documento válido para trámites oficiales",
          "Se expide en el momento si se presenta en persona",
          "Válido en todo el territorio nacional",
          "Necesario para múltiples gestiones administrativas",
          "Se puede solicitar por terceras personas con autorización"
        ],
        requirements: [
          "Documento de identidad (DNI, NIE o Pasaporte)",
          "Justificante del pago de tasas si aplica",
          "Autorización firmada si lo solicita otra persona",
          "Documento de identidad del representante"
        ],
        success: true,
        summary: "Certificado que acredita el empadronamiento de una persona en el municipio, necesario para múltiples trámites administrativos.",
        title: "Certificado de Residencia"
      },
      'licencia-obras': {
        key_info: [
          "Obligatorio para obras que modifiquen la estructura",
          "Plazo de resolución: 30 días hábiles",
          "Se requiere proyecto técnico para obras mayores",
          "Inspección municipal durante la obra",
          "Certificado final de obra obligatorio"
        ],
        requirements: [
          "Proyecto técnico firmado por profesional competente",
          "Documento de propiedad o autorización del propietario",
          "Justificante del pago de tasas municipales",
          "Fotografías del estado actual",
          "Memoria descriptiva de la obra"
        ],
        success: true,
        summary: "Licencia municipal requerida para realizar obras de construcción, reforma o ampliación en propiedades del municipio.",
        title: "Licencia de Obras Menores"
      }
    };

    return mockData[documentType] || {
      key_info: ["Información no disponible"],
      requirements: ["Documentación no especificada"],
      success: false,
      summary: "Información del documento no encontrada",
      title: "Documento no identificado"
    };
  }
}

export default DocumentService;
