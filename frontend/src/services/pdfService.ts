import { PDFDocument, PDFForm } from 'pdf-lib';

export interface FormData {
  [key: string]: string | number | boolean;
}

export class PDFService {
  
  /**
   * Genera un PDF rellenado basado en los datos del formulario
   */
  static async generateFilledPDF(formId: string, formData: FormData): Promise<Uint8Array> {
    try {
      // Cargar el PDF template correspondiente
      const pdfBytes = await this.loadPDFTemplate(formId);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      
      // Obtener el formulario PDF
      const form = pdfDoc.getForm();
      
      // Rellenar los campos según el tipo de formulario
      await this.fillFormFields(form, formId, formData);
      
      // Aplanar el formulario para que no sea editable
      form.flatten();
      
      // Generar el PDF final
      const filledPdfBytes = await pdfDoc.save();
      return filledPdfBytes;
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      throw new Error('No se pudo generar el PDF');
    }
  }

  /**
   * Carga el template PDF correspondiente al formulario
   */
  private static async loadPDFTemplate(formId: string): Promise<ArrayBuffer> {
    const pdfPaths = {
      'solicitud-residencia': '/documentos/Solicitud de Certificado de Residencia.pdf',
      'licencia-obras': '/documentos/Solicitud de Licencia de Obras.pdf',
      'empadronamiento': '/documentos/Solicitud de Empadronamiento.pdf'
    };

    const pdfPath = pdfPaths[formId as keyof typeof pdfPaths];
    if (!pdfPath) {
      throw new Error(`No se encontró template para el formulario: ${formId}`);
    }

    const response = await fetch(pdfPath);
    if (!response.ok) {
      throw new Error(`No se pudo cargar el PDF: ${pdfPath}`);
    }

    return await response.arrayBuffer();
  }

  /**
   * Rellena los campos del formulario PDF
   */
  private static async fillFormFields(form: PDFForm, formId: string, formData: FormData): Promise<void> {
    // Mapeo de campos por formulario
    const fieldMappings = this.getFieldMappings(formId);
    
    // Obtener todos los campos del formulario PDF
    const fields = form.getFields();
    console.log('Campos disponibles en el PDF:', fields.map(f => f.getName()));

    // Rellenar cada campo
    Object.entries(formData).forEach(([key, value]) => {
      const pdfFieldName = fieldMappings[key];
      if (!pdfFieldName) {
        console.warn(`No se encontró mapeo para el campo: ${key}`);
        return;
      }

      try {
        // Intentar obtener el campo como texto
        const textField = form.getTextField(pdfFieldName);
        if (textField) {
          textField.setText(String(value));
          return;
        }
      } catch (error) {
        // El campo no es de texto, intentar otros tipos
      }

      try {
        // Intentar obtener el campo como checkbox
        const checkboxField = form.getCheckBox(pdfFieldName);
        if (checkboxField && typeof value === 'boolean') {
          if (value) {
            checkboxField.check();
          } else {
            checkboxField.uncheck();
          }
          return;
        }
      } catch (error) {
        // El campo no es checkbox
      }

      console.warn(`No se pudo rellenar el campo: ${pdfFieldName}`);
    });
  }

  /**
   * Obtiene el mapeo de campos para cada formulario
   */
  private static getFieldMappings(formId: string): { [key: string]: string } {
    const mappings = {
      'solicitud-residencia': {
        'nombre': 'nombre_completo',
        'email': 'correo_electronico',
        'edad': 'edad',
        'direccion': 'direccion_actual',
        'telefono': 'telefono_contacto',
        'motivo': 'motivo_solicitud'
      },
      'licencia-obras': {
        'solicitante': 'nombre_solicitante',
        'email': 'correo_electronico',
        'direccion_obra': 'direccion_obra',
        'tipo_obra': 'tipo_obra',
        'descripcion': 'descripcion_obra'
      },
      'empadronamiento': {
        'nombre': 'nombre_apellidos',
        'email': 'correo_electronico',
        'dni': 'dni_nie',
        'fecha_nacimiento': 'fecha_nacimiento',
        'nacionalidad': 'nacionalidad',
        'direccion_anterior': 'direccion_anterior',
        'direccion_nueva': 'nueva_direccion'
      }
    };

    return mappings[formId as keyof typeof mappings] || {};
  }

  /**
   * Descarga el PDF original sin rellenar
   */
  static async downloadOriginalPDF(formId: string): Promise<Uint8Array> {
    try {
      const pdfBytes = await this.loadPDFTemplate(formId);
      return new Uint8Array(pdfBytes);
    } catch (error) {
      console.error('Error cargando PDF original:', error);
      throw new Error('No se pudo cargar el PDF original');
    }
  }

  /**
   * Descarga el PDF generado
   */
  static downloadPDF(pdfBytes: Uint8Array, fileName: string): void {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Genera un PDF usando HTML como alternativa si los PDFs originales no tienen campos editables
   */
  static async generatePDFFromHTML(formId: string, formData: FormData): Promise<Uint8Array> {
    console.log('=== Generando PDF ===');
    console.log('Form ID:', formId);
    console.log('Form Data:', formData);
    
    const { jsPDF } = await import('jspdf');
    
    const doc = new jsPDF();
    const formName = this.getFormName(formId);
    
    // Título del documento
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(formName, 20, 25);
    
    // Fecha actual
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha de solicitud: ${new Date().toLocaleDateString('es-ES')}`, 20, 35);
    
    // Línea separadora
    doc.line(20, 40, 190, 40);
    
    // Datos del formulario
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    let yPosition = 55;
    
    console.log('Procesando campos...');
    Object.entries(formData).forEach(([key, value]) => {
      if (value && value.toString().trim() !== '') {
        const label = this.getFieldLabel(formId, key);
        console.log(`Campo: ${key} -> ${label}: ${value}`);
        
        // Etiqueta en negrita
        doc.setFont('helvetica', 'bold');
        doc.text(`${label}:`, 20, yPosition);
        
        // Valor en normal
        doc.setFont('helvetica', 'normal');
        const valueText = value.toString();
        const splitText = doc.splitTextToSize(valueText, 150);
        doc.text(splitText, 20, yPosition + 6);
        
        yPosition += 6 + (splitText.length * 6) + 4; // Espaciado dinámico
        
        // Nueva página si es necesario
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
      }
    });
    
    console.log('PDF generado correctamente');
    return new Uint8Array(doc.output('arraybuffer'));
  }

  private static getFormName(formId: string): string {
    const names = {
      'solicitud-residencia': 'Solicitud de Certificado de Residencia',
      'licencia-obras': 'Solicitud de Licencia de Obras',
      'empadronamiento': 'Solicitud de Empadronamiento'
    };
    return names[formId as keyof typeof names] || 'Formulario Municipal';
  }

  private static getFieldLabel(formId: string, fieldKey: string): string {
    const labels = {
      'solicitud-residencia': {
        'nombre': 'Nombre completo',
        'email': 'Correo electrónico',
        'edad': 'Edad',
        'direccion': 'Dirección actual',
        'telefono': 'Teléfono de contacto',
        'motivo': 'Motivo de la solicitud'
      },
      'licencia-obras': {
        'solicitante': 'Nombre del solicitante',
        'email': 'Correo electrónico',
        'direccion_obra': 'Dirección de la obra',
        'tipo_obra': 'Tipo de obra',
        'descripcion': 'Descripción de la obra'
      },
      'empadronamiento': {
        'nombre': 'Nombre y apellidos',
        'email': 'Correo electrónico',
        'dni': 'DNI/NIE',
        'fecha_nacimiento': 'Fecha de nacimiento',
        'nacionalidad': 'Nacionalidad',
        'direccion_anterior': 'Dirección anterior',
        'direccion_nueva': 'Nueva dirección'
      }
    };

    const formLabels = labels[formId as keyof typeof labels] || {};
    return formLabels[fieldKey as keyof typeof formLabels] || fieldKey;
  }
}
