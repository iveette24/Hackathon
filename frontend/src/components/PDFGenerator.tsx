import React, { useState } from 'react';
import { PDFService } from '../services/pdfService';
import type { FormData } from '../services/pdfService';
import type { MunicipalForm } from '../types/forms';

interface PDFGeneratorProps {
  form: MunicipalForm;
  formData: FormData;
  onClose: () => void;
}

export const PDFGenerator: React.FC<PDFGeneratorProps> = ({ form, formData, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePDF = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      
      // Intentar generar PDF rellenando el template original
      let pdfBytes: Uint8Array;
      try {
        pdfBytes = await PDFService.generateFilledPDF(form.id, formData);
      } catch (templateError) {
        console.warn('No se pudo usar el template PDF original, generando desde HTML:', templateError);
        // Si falla, generar PDF desde HTML
        pdfBytes = await PDFService.generatePDFFromHTML(form.id, formData);
      }
      
      // Descargar el PDF
      const fileName = `${form.name}_${new Date().toISOString().split('T')[0]}.pdf`;
      PDFService.downloadPDF(pdfBytes, fileName);
      
      onClose();
    } catch (error) {
      console.error('Error generando PDF:', error);
      setError('No se pudo generar el PDF. Por favor, inténtalo de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreviewData = () => {
    console.log('Datos del formulario:', formData);
    alert('Revisa la consola del navegador para ver los datos que se van a incluir en el PDF');
  };

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Generar PDF - {form.name}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            <div className="mb-4">
              <h6>Resumen de datos a incluir:</h6>
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Campo</th>
                      <th>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(formData).map(([key, value]) => {
                      const field = form.fields.find(f => f.id === key);
                      return (
                        <tr key={key}>
                          <td>{field?.label || key}</td>
                          <td>{String(value)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger" role="alert">
                <strong>Error:</strong> {error}
              </div>
            )}

            <div className="d-flex justify-content-between">
              <button 
                type="button" 
                className="btn btn-outline-info"
                onClick={handlePreviewData}
                disabled={isGenerating}
              >
                <i className="bi bi-eye me-2"></i>
                Vista previa de datos
              </button>
              
              <div>
                <button 
                  type="button" 
                  className="btn btn-secondary me-2"
                  onClick={onClose}
                  disabled={isGenerating}
                >
                  Cancelar
                </button>
                
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleGeneratePDF}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Generando PDF...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-download me-2"></i>
                      Descargar PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFGenerator;
