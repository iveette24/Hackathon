import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { getFormsByKeyword } from './data/municipalForms';
import type { MunicipalForm } from './types/forms';
import FormRenderer from './components/FormRenderer';
import Login from './components/Login';
import LoadingScreen from './components/LoadingScreen';
import Navbar from './components/Navbar';
import DocumentInfo from './components/DocumentInfo';
import ProgressIndicator from './components/ProgressIndicator';
import { useAuth } from './hooks/useAuth';
import DocumentService, { type DocumentInfoResponse } from './services/documentService';
import { ValidationUtils } from './utils/validation';

// Extended questions including form selection
const baseQuestions = [
  { key: "name", question: "¿Cuál es tu nombre completo?" },
  { key: "formType", question: "¿Qué tipo de trámite necesitas realizar? (escribe palabras clave como 'residencia', 'obras', 'empadronamiento')" },
];

const additionalQuestions: { [key: string]: Array<{ key: string; question: string; validation?: string; required?: boolean }> } = {
  'solicitud-residencia': [
    { key: "age", question: "¿Cuántos años tienes?", validation: "number", required: true },
    { key: "address", question: "¿Cuál es tu dirección actual?", required: true },
    { key: "phone", question: "¿Cuál es tu teléfono de contacto?", validation: "phone", required: true },
    { key: "reason", question: "¿Para qué necesitas el certificado de residencia?", required: true }
  ],
  'licencia-obras': [
    { key: "address", question: "¿Cuál es la dirección donde se realizará la obra?", required: true },
    { key: "workType", question: "¿Qué tipo de obra vas a realizar? (reforma interior, fachada, ampliación, otro)", required: true },
    { key: "description", question: "Describe detalladamente la obra que quieres realizar", required: true }
  ],
  'empadronamiento': [
    { key: "dni", question: "¿Cuál es tu DNI o NIE? (Formato: 12345678A o X1234567A)", validation: "dni", required: true },
    { key: "birthDate", question: "¿Cuál es tu fecha de nacimiento? (DD/MM/AAAA)", validation: "date", required: true },
    { key: "country", question: "¿Cuál es tu nacionalidad? (ej: Española, Francesa, Alemana...)", validation: "nationality", required: true },
    { key: "previousAddress", question: "¿Cuál era tu dirección anterior? (Opcional si es tu primera vez)", required: false },
    { key: "newAddress", question: "¿Cuál es tu nueva dirección de empadronamiento?", required: true }
  ]
};

interface Message {
  sender: "bot" | "user";
  text: string;
  forms?: MunicipalForm[];
}

function App() {
  const { user, isAuthenticated, isLoading, error, login, logout } = useAuth();

  // Estado del chat y formularios (solo se inicializa si está autenticado)
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [input, setInput] = useState("");
  const [selectedForm, setSelectedForm] = useState<MunicipalForm | null>(null);
  const [currentQuestions, setCurrentQuestions] = useState(baseQuestions);
  const [phase, setPhase] = useState<'chat' | 'document-info' | 'form' | 'completed'>('chat');
  const [documentInfo, setDocumentInfo] = useState<DocumentInfoResponse | null>(null);
  const [loadingDocumentInfo, setLoadingDocumentInfo] = useState(false);
  
  // Referencia para auto-scroll
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Inicializar el chat cuando el usuario se autentica
  React.useEffect(() => {
    if (isAuthenticated && messages.length === 0 && user) {
      // Pre-llenar datos del usuario autenticado
      const initialAnswers = {
        email: user.email,
        name: user.name
      };
      setAnswers(initialAnswers);
      
      setMessages([
        { 
          sender: "bot" as const, 
          text: `¡Hola ${user.name}! Soy tu asistente para trámites del ayuntamiento. Ya tengo tu información de contacto. ${baseQuestions[0].question}` 
        },
      ]);
    }
  }, [isAuthenticated, user, messages.length]);

  // Mostrar pantalla de carga
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Mostrar login si no está autenticado
  if (!isAuthenticated) {
    return (
      <Login 
        onLogin={login} 
        error={error || undefined} 
      />
    );
  }

  // Resto de la lógica del chat (funciones existentes)
  const handleFormSubmit = (formData: { [key: string]: string }) => {
    console.log('Form submitted:', formData);
    setPhase('completed');
    setMessages(prev => [
      ...prev,
      { 
        sender: "bot" as const, 
        text: "¡Perfecto! Tu formulario ha sido completado. Puedes descargarlo desde arriba." 
      }
    ]);
  };

  const resetChat = () => {
    // Mantener datos del usuario autenticado
    const userAnswers: { [key: string]: string } = user ? { 
      email: user.email, 
      name: user.name 
    } : {};
    
    setMessages([
      { 
        sender: "bot" as const, 
        text: `¡Hola ${user?.name}! Soy tu asistente para trámites del ayuntamiento. ${baseQuestions[0].question}` 
      },
    ]);
    setCurrentStep(0);
    setAnswers(userAnswers);
    setInput("");
    setSelectedForm(null);
    setCurrentQuestions(baseQuestions);
    setPhase('chat');
    setDocumentInfo(null);
  };

  const handleDocumentInfoBack = () => {
    setPhase('chat');
    setDocumentInfo(null);
  };

  const handleDocumentInfoProceed = () => {
    if (!selectedForm) return;
    
    // Get specific questions for this form
    const formSpecificQuestions = additionalQuestions[selectedForm.id] || [];
    const allQuestions = [...baseQuestions, ...formSpecificQuestions];
    setCurrentQuestions(allQuestions);
    
    // Check what information we still need to collect
    const missingFields: string[] = [];
    allQuestions.forEach(question => {
      if (!answers[question.key] || answers[question.key].trim() === '') {
        missingFields.push(question.key);
      }
    });
    
    if (missingFields.length > 0) {
      // Find first missing field and continue chat
      const firstMissingIndex = allQuestions.findIndex(q => missingFields.includes(q.key));
      setCurrentStep(firstMissingIndex);
      setPhase('chat');
      
      const nextQuestion = allQuestions[firstMissingIndex];
      const botResponse: Message = {
        sender: "bot",
        text: `✅ Perfecto. Ahora necesito algunos datos específicos para este formulario.\n\n${nextQuestion.question}`
      };
      setMessages(prev => [...prev, botResponse]);
    } else {
      // All information collected, go to form
      setPhase('form');
      const botResponse: Message = {
        sender: "bot",
        text: "✅ ¡Excelente! Ya tengo toda la información necesaria. Te muestro el formulario completado con tus datos."
      };
      setMessages(prev => [...prev, botResponse]);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = { sender: "user", text: input };
    setMessages(prev => [...prev, userMessage]);

    // Get current question info
    const currentQuestion = currentQuestions[currentStep];
    const questionInfo = additionalQuestions[selectedForm?.id || '']?.find(q => q.key === currentQuestion.key);
    
    // Validate input if it's a specific field with validation
    if (questionInfo && selectedForm) {
      const validation = ValidationUtils.validateField(
        input, 
        questionInfo.validation, 
        currentQuestion.question.split('?')[0], 
        questionInfo.required !== false
      );
      
      if (!validation.isValid) {
        const errorMessage: Message = {
          sender: "bot",
          text: `❌ ${validation.message}\n\nPor favor, inténtalo de nuevo:`
        };
        setMessages(prev => [...prev, errorMessage]);
        setInput("");
        return;
      }
      
      // Use suggested value if available (formatted correctly)
      const finalValue = validation.suggestedValue || input;
      const correctedAnswers = { ...answers, [currentQuestion.key]: finalValue };
      setAnswers(correctedAnswers);
      
      // Show confirmation if value was corrected
      if (validation.suggestedValue && validation.suggestedValue !== input) {
        const correctionMessage: Message = {
          sender: "bot",
          text: `✅ Perfecto. He registrado: ${validation.suggestedValue}`
        };
        setMessages(prev => [...prev, correctionMessage]);
      }
    } else {
      // For non-validated fields, just save the answer
      const newAnswers = { ...answers, [currentQuestion.key]: input };
      setAnswers(newAnswers);
    }

    // Check if this is the form type question (only shown once per session)
    if (currentQuestion.key === 'formType' && !selectedForm) {
      const matchingForms = getFormsByKeyword(input);
      if (matchingForms.length > 0) {
        const formsMessage: Message = {
          sender: "bot",
          text: "He encontrado estos formularios que podrían ser útiles. Selecciona el que necesites:",
          forms: matchingForms
        };
        setMessages(prev => [...prev, formsMessage]);
        setInput("");
        return;
      } else {
        const noFormsMessage: Message = {
          sender: "bot",
          text: "No he encontrado formularios con esas palabras clave. Los documentos disponibles son:\n• Certificado de Residencia\n• Licencia de Obras\n• Empadronamiento\n\n¿Cuál de estos necesitas?"
        };
        setMessages(prev => [...prev, noFormsMessage]);
        setInput("");
        return;
      }
    }

    // Move to next question or finish
    if (currentStep < currentQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
      const nextQuestion = currentQuestions[currentStep + 1];
      const botResponse: Message = { 
        sender: "bot", 
        text: nextQuestion.question 
      };
      setMessages(prev => [...prev, botResponse]);
    } else {
      // Chat phase completed - bloquear chat
      const botResponse: Message = {
        sender: "bot",
        text: "¡Perfecto! He recopilado toda tu información. Ahora selecciona el botón para continuar."
      };
      setMessages(prev => [...prev, botResponse]);
      
      // Cambiar a fase de selección de formulario y bloquear input
      setPhase('document-info');
    }

    setInput("");
  };

  const handleFormSelect = async (form: MunicipalForm) => {
    // Prevenir selección múltiple - solo permitir si no hay formulario seleccionado
    if (selectedForm) {
      const warningMessage: Message = {
        sender: "bot",
        text: `Ya has seleccionado "${selectedForm.name}". Si quieres cambiar de formulario, reinicia la conversación usando el botón "Realizar otro trámite".`
      };
      setMessages(prev => [...prev, warningMessage]);
      return;
    }
    
    setSelectedForm(form);
    setLoadingDocumentInfo(true);
    
    try {
      // Llamar al backend para obtener información del documento
      const info = DocumentService.getMockDocumentInfo(form.id);
      
      setDocumentInfo(info);
      setPhase('document-info');
      
      const botResponse: Message = {
        sender: "bot",
        text: `✅ Has seleccionado: "${form.name}". Te muestro la información detallada de este trámite.`
      };
      setMessages(prev => [...prev, botResponse]);
      
    } catch (error) {
      console.error('Error loading document info:', error);
      
      const errorMessage: Message = {
        sender: "bot",
        text: "❌ Error al cargar la información del documento. Intentándolo de nuevo..."
      };
      setMessages(prev => [...prev, errorMessage]);
      
      // Fallback: ir directamente a recopilar datos
      setTimeout(() => {
        const formSpecificQuestions = additionalQuestions[form.id] || [];
        const allQuestions = [...baseQuestions, ...formSpecificQuestions];
        setCurrentQuestions(allQuestions);
        
        const botResponse: Message = {
          sender: "bot",
          text: `Continuemos con "${form.name}". ${allQuestions[currentStep + 1]?.question || "Procedamos con el formulario."}`
        };
        setMessages(prev => [...prev, botResponse]);
        
        if (currentStep + 1 < allQuestions.length) {
          setCurrentStep(currentStep + 1);
        } else {
          setPhase('form');
        }
      }, 1500);
      
    } finally {
      setLoadingDocumentInfo(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="App">
      <Navbar user={user!} onLogout={logout} />
      
      <div className="container-fluid h-100">
        {phase === 'document-info' && documentInfo ? (
          <DocumentInfo
            data={documentInfo}
            onProceed={handleDocumentInfoProceed}
            onBack={handleDocumentInfoBack}
            isLoading={loadingDocumentInfo}
          />
        ) : phase === 'form' && selectedForm ? (
          <FormRenderer
            form={selectedForm}
            chatAnswers={answers}
            onSubmit={handleFormSubmit}
          />
        ) : (
          <div className="row h-100">
            <div className="col-md-8 offset-md-2">
              <div className="chat-container">
                <div className="chat-header">
                  <h3><i className="bi bi-chat-dots me-2"></i>Asistente Virtual del Ayuntamiento</h3>
                  <p className="text-muted">Te ayudo a completar tus trámites de forma rápida y sencilla</p>
                </div>

                {/* Progress Indicator */}
                {selectedForm && phase === 'chat' && (
                  <ProgressIndicator
                    currentStep={currentStep + 1}
                    totalSteps={currentQuestions.length}
                    formName={selectedForm.name}
                    collectedData={answers}
                  />
                )}

                <div className="chat-messages">
                  {messages.map((message, index) => (
                    <div key={index} className={`message ${message.sender}`}>
                      <div className="message-content">
                        <div className="message-avatar">
                          {message.sender === 'bot' ? (
                            <i className="bi bi-robot"></i>
                          ) : (
                            <i className="bi bi-person-fill"></i>
                          )}
                        </div>
                        <div className="message-text">
                          {message.text}
                          {message.forms && (
                            <div className="forms-grid mt-3">
                              {message.forms.map((form) => (
                                <div key={form.id} className="form-card-container">
                                  <div className="form-card">
                                    <div className="form-icon">
                                      <i className="bi bi-file-earmark-text"></i>
                                    </div>
                                    <h5>{form.name}</h5>
                                    <p>{form.description}</p>
                                    <span className="badge bg-primary mb-3">Municipal</span>
                                    <button 
                                      className="btn btn-outline-primary w-100 form-select-btn"
                                      onClick={() => handleFormSelect(form)}
                                      disabled={selectedForm !== null}
                                    >
                                      <i className="bi bi-arrow-right-circle me-2"></i>
                                      {selectedForm ? 'Ya seleccionado' : 'Seleccionar este formulario'}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Elemento para auto-scroll */}
                  <div ref={chatEndRef} />
                </div>

                {/* Mensaje informativo cuando el chat está bloqueado para selección */}
                {phase === 'document-info' && !selectedForm && (
                  <div className="alert alert-info mt-3">
                    <i className="bi bi-info-circle me-2"></i>
                    Chat bloqueado. Selecciona un formulario usando los botones para continuar.
                  </div>
                )}

                {phase === 'chat' && (
                  <div className="chat-input">
                    <div className="input-group">
                      <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Escribe tu respuesta aquí..."
                        className="form-control"
                        rows={1}
                        style={{ resize: 'none' }}
                      />
                      <button
                        onClick={handleSend}
                        className="btn btn-primary"
                        disabled={!input.trim()}
                      >
                        <i className="bi bi-send"></i>
                      </button>
                    </div>
                  </div>
                )}

                {phase === 'completed' && (
                  <div className="text-center mt-4">
                    <div className="alert alert-success">
                      <i className="bi bi-check-circle me-2"></i>
                      ¡Trámite completado exitosamente!
                    </div>
                    <div className="alert alert-info mb-3">
                      <i className="bi bi-info-circle me-2"></i>
                      El chat está ahora bloqueado. Tu formulario ha sido procesado correctamente.
                    </div>
                    <div className="d-flex gap-3 justify-content-center">
                      <button
                        onClick={resetChat}
                        className="btn btn-primary"
                      >
                        <i className="bi bi-plus-circle me-2"></i>
                        Continuar con otro trámite
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="btn btn-outline-secondary"
                      >
                        <i className="bi bi-printer me-2"></i>
                        Imprimir formulario
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
