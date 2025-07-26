import React, { useState } from "react";
import "./App.css";
import { municipalForms, getFormsByKeyword } from './data/municipalForms';
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
  const [messages, setMessages] = useState<Message[]>([
    { sender: "bot" as const, text: "¡Hola! Soy tu asistente para trámites del ayuntamiento. " + baseQuestions[0].question },
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [input, setInput] = useState("");
  const [selectedForm, setSelectedForm] = useState<MunicipalForm | null>(null);
  const [currentQuestions, setCurrentQuestions] = useState(baseQuestions);
  const [phase, setPhase] = useState<'chat' | 'form' | 'completed'>('chat');

  const handleFormSelection = (form: MunicipalForm) => {
    setSelectedForm(form);
    const additionalQs = additionalQuestions[form.id] || [];
    setCurrentQuestions([...baseQuestions, ...additionalQs]);
    
    setMessages(prev => [
      ...prev,
      { sender: "bot" as const, text: `Perfecto, te ayudo con: ${form.name}. ${baseQuestions[currentStep + 1]?.question || additionalQs[0]?.question || "Continuemos..."}` }
    ]);
    
    if (currentStep + 1 < baseQuestions.length) {
      setCurrentStep(currentStep + 1);
    } else if (additionalQs.length > 0) {
      setCurrentStep(baseQuestions.length);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages = [
      ...messages,
      { sender: "user" as const, text: input },
    ];

    const key = currentQuestions[currentStep].key;
    const newAnswers = { ...answers, [key]: input };

    // Handle form type selection
    if (key === 'formType' && !selectedForm) {
      const matchingForms = getFormsByKeyword(input);
      if (matchingForms.length > 0) {
        setMessages([
          ...newMessages,
          { 
            sender: "bot" as const, 
            text: "He encontrado estos formularios que podrían interesarte. Haz clic en el que necesites:",
            forms: matchingForms
          }
        ]);
        setAnswers(newAnswers);
        setInput("");
        return;
      } else {
        setMessages([
          ...newMessages,
          { sender: "bot" as const, text: "No he encontrado formularios con esas palabras clave. Los formularios disponibles son: Certificado de Residencia, Licencia de Obras, Empadronamiento. ¿Cuál necesitas?" }
        ]);
        setInput("");
        return;
      }
    }

    // Continue with questions
    if (currentStep < currentQuestions.length - 1) {
      setMessages([
        ...newMessages,
        { sender: "bot" as const, text: currentQuestions[currentStep + 1].question },
      ]);
      setCurrentStep(currentStep + 1);
    } else {
      // All questions completed
      setMessages([
        ...newMessages,
        { sender: "bot" as const, text: "¡Perfecto! He recopilado toda la información. Ahora te muestro el formulario con los datos rellenados automáticamente." },
      ]);
      setPhase('form');
    }
    setAnswers(newAnswers);
    setInput("");
  };

  const handleFormSubmit = (formData: { [key: string]: string }) => {
    setPhase('completed');
    setMessages(prev => [
      ...prev,
      { sender: "bot" as const, text: "¡Formulario enviado correctamente! Tu solicitud ha sido registrada y recibirás una confirmación por email." }
    ]);
  };

  return (
    <div className="container-fluid bg-light min-vh-100 py-4">
      <div className="chat-container shadow-lg">
        <div className="chat-header">
          <h1>🏛️ Asistente de Trámites - Ayuntamiento</h1>
          <p className="mb-0 opacity-75">Tu ayuda digital para gestiones municipales</p>
        </div>
        
        {phase === 'chat' && (
          <>
            <div className="chat-box">
              {messages.map((msg, idx) => (
                <div key={idx}>
                  <div className={`chat-message ${msg.sender}`}> 
                    <span>{msg.text}</span>
                  </div>
                  {msg.forms && (
                    <div className="form-options">
                      {msg.forms.map(form => (
                        <button
                          key={form.id}
                          className="form-option-button"
                          onClick={() => handleFormSelection(form)}
                        >
                          <strong>{form.name}</strong>
                          <small className="d-block text-muted mt-1">{form.description}</small>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <form className="chat-input d-flex gap-2" onSubmit={handleSend}>
              <input
                type="text"
                className="form-control"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Escribe tu respuesta..."
                autoFocus
              />
              <button type="submit" className="btn btn-primary px-4">
                <i className="bi bi-send me-1"></i>Enviar
              </button>
            </form>
          </>
        )}

        {phase === 'form' && selectedForm && (
          <FormRenderer
            form={selectedForm}
            chatAnswers={answers}
            onSubmit={handleFormSubmit}
          />
        )}

        {phase === 'completed' && (
          <div className="completion-message">
            <div className="mb-4">
              <i className="bi bi-check-circle-fill text-success" style={{fontSize: '4rem'}}></i>
            </div>
            <h2>✅ Trámite Completado</h2>
            <p>Tu solicitud ha sido enviada correctamente.</p>
            <button 
              className="btn restart-button"
              onClick={() => window.location.reload()}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Realizar otro trámite
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
