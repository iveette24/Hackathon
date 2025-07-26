import React, { useState } from "react";
import "./App.css";
import { getFormsByKeyword } from './data/municipalForms';
import type { MunicipalForm } from './types/forms';
import FormRenderer from './components/FormRenderer';
import Login from './components/Login';
import LoadingScreen from './components/LoadingScreen';
import Navbar from './components/Navbar';
import { useAuth } from './hooks/useAuth';

// Extended questions including form selection
const baseQuestions = [
  { key: "name", question: "¿Cuál es tu nombre completo?" },
  { key: "email", question: "¿Cuál es tu correo electrónico?" },
  { key: "formType", question: "¿Qué tipo de trámite necesitas realizar? (escribe palabras clave como 'residencia', 'obras', 'empadronamiento')" },
];

const additionalQuestions: { [key: string]: Array<{ key: string; question: string }> } = {
  'solicitud-residencia': [
    { key: "age", question: "¿Cuántos años tienes?" },
    { key: "address", question: "¿Cuál es tu dirección actual?" },
    { key: "phone", question: "¿Cuál es tu teléfono de contacto?" },
    { key: "reason", question: "¿Para qué necesitas el certificado de residencia?" }
  ],
  'licencia-obras': [
    { key: "address", question: "¿Cuál es la dirección donde se realizará la obra?" },
    { key: "workType", question: "¿Qué tipo de obra vas a realizar? (reforma interior, fachada, ampliación, otro)" },
    { key: "description", question: "Describe brevemente la obra que quieres realizar" }
  ],
  'empadronamiento': [
    { key: "dni", question: "¿Cuál es tu DNI o NIE?" },
    { key: "birthDate", question: "¿Cuál es tu fecha de nacimiento? (DD/MM/AAAA)" },
    { key: "country", question: "¿Cuál es tu nacionalidad?" },
    { key: "previousAddress", question: "¿Cuál era tu dirección anterior? (opcional)" },
    { key: "newAddress", question: "¿Cuál es tu nueva dirección de empadronamiento?" }
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
  const [phase, setPhase] = useState<'chat' | 'form' | 'completed'>('chat');

  // Inicializar el chat cuando el usuario se autentica
  React.useEffect(() => {
    if (isAuthenticated && messages.length === 0) {
      setMessages([
        { 
          sender: "bot" as const, 
          text: `¡Hola ${user?.name}! Soy tu asistente para trámites del ayuntamiento. ${baseQuestions[0].question}` 
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
    setMessages([
      { 
        sender: "bot" as const, 
        text: `¡Hola ${user?.name}! Soy tu asistente para trámites del ayuntamiento. ${baseQuestions[0].question}` 
      },
    ]);
    setCurrentStep(0);
    setAnswers({});
    setInput("");
    setSelectedForm(null);
    setCurrentQuestions(baseQuestions);
    setPhase('chat');
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = { sender: "user", text: input };
    setMessages(prev => [...prev, userMessage]);

    // Update answers
    const currentQuestion = currentQuestions[currentStep];
    const newAnswers = { ...answers, [currentQuestion.key]: input };
    setAnswers(newAnswers);

    // Check if this is the form type question
    if (currentQuestion.key === 'formType') {
      const matchingForms = getFormsByKeyword(input);
      if (matchingForms.length > 0) {
        const formsMessage: Message = {
          sender: "bot",
          text: "He encontrado estos formularios que podrían ser útiles:",
          forms: matchingForms
        };
        setMessages(prev => [...prev, formsMessage]);
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
      // Chat phase completed
      const botResponse: Message = {
        sender: "bot",
        text: "¡Perfecto! He recopilado toda tu información. Ahora selecciona el botón para continuar."
      };
      setMessages(prev => [...prev, botResponse]);
    }

    setInput("");
  };

  const handleFormSelect = (form: MunicipalForm) => {
    setSelectedForm(form);
    
    // Get specific questions for this form
    const formSpecificQuestions = additionalQuestions[form.id] || [];
    const allQuestions = [...baseQuestions, ...formSpecificQuestions];
    setCurrentQuestions(allQuestions);
    
    // If we have incomplete information, continue chat
    if (currentStep < allQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
      const nextQuestion = allQuestions[currentStep + 1];
      const botResponse: Message = {
        sender: "bot",
        text: `Perfecto, has seleccionado: ${form.name}. ${nextQuestion.question}`
      };
      setMessages(prev => [...prev, botResponse]);
    } else {
      // We have all info, show form
      setPhase('form');
      const botResponse: Message = {
        sender: "bot",
        text: `Perfecto, has seleccionado: ${form.name}. Ahora vamos a completar el formulario con la información que me has proporcionado.`
      };
      setMessages(prev => [...prev, botResponse]);
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
        {phase === 'form' && selectedForm ? (
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
                                <div key={form.id} className="form-card" onClick={() => handleFormSelect(form)}>
                                  <div className="form-icon">
                                    <i className="bi bi-file-earmark-text"></i>
                                  </div>
                                  <h5>{form.name}</h5>
                                  <p>{form.description}</p>
                                  <span className="badge bg-primary">Municipal</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

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
                    <button
                      onClick={resetChat}
                      className="btn btn-outline-primary"
                    >
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      Realizar otro trámite
                    </button>
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
