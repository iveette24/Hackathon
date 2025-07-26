# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# Sistema de Automatización de Formularios Municipales 🏛️

Este proyecto automatiza el llenado y generación de PDFs para trámites municipales a través de un asistente conversacional inteligente.

## 🚀 Características Principales

### ✅ **Auto-llenado Inteligente**
- Conversación guiada para recopilar información
- Auto-llenado automático de formularios basado en las respuestas del chat
- Campos destacados visualmente para mostrar datos auto-completados

### ✅ **Generación Automática de PDFs**
- Generación de PDFs a partir de los formularios originales
- Descarga directa del documento completado
- Respaldo con generación de PDF desde HTML si el template original no es editable

### ✅ **Formularios Municipales Incluidos**
1. **Solicitud de Certificado de Residencia**
2. **Solicitud de Licencia de Obras**
3. **Solicitud de Empadronamiento**

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React + TypeScript + Vite
- **Estilos**: Bootstrap 5 + CSS personalizado
- **PDF**: pdf-lib + jsPDF
- **Iconos**: Bootstrap Icons

## 📋 Instalación y Uso

### Prerrequisitos
- Node.js (versión 18 o superior)
- npm

### Instalación
```bash
cd frontend
npm install
```

### Desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5174/`

### Construcción para producción
```bash
npm run build
```

## 🎯 Cómo Usar la Aplicación

### Paso 1: Conversación Inicial
1. La aplicación inicia con un asistente conversacional
2. Responde las preguntas sobre tu información personal
3. Especifica qué tipo de trámite necesitas (residencia, obras, empadronamiento)

### Paso 2: Selección de Formulario
1. El sistema detecta el formulario apropiado basado en tus respuestas
2. Puedes seleccionar el formulario específico de una lista
3. Continúa respondiendo preguntas específicas del trámite

### Paso 3: Revisión del Formulario
1. El formulario se muestra con todos los campos auto-rellenados
2. Los campos completados automáticamente aparecen destacados en amarillo
3. Puedes editar cualquier campo si es necesario

### Paso 4: Generación de PDF
1. Haz clic en **"Generar PDF"** para crear el documento
2. Revisa los datos en la vista previa
3. Descarga el PDF completado automáticamente

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/
│   │   ├── FormRenderer.tsx      # Renderizador de formularios
│   │   └── PDFGenerator.tsx      # Generador de PDFs
│   ├── services/
│   │   └── pdfService.ts         # Servicio para manejo de PDFs
│   ├── data/
│   │   └── municipalForms.ts     # Definición de formularios
│   ├── types/
│   │   └── forms.ts              # Tipos TypeScript
│   └── App.tsx                   # Aplicación principal
├── public/
│   └── documentos/               # PDFs originales
│       ├── Solicitud de Certificado de Residencia.pdf
│       ├── Solicitud de Licencia de Obras.pdf
│       └── Solicitud de Empadronamiento.pdf
└── documentos/                   # PDFs fuente (respaldo)
```

## 🎨 Características de la Interfaz

### **Campos Auto-rellenados**
- Fondo amarillo dorado para máximo contraste
- Texto negro para óptima legibilidad
- Borde destacado para fácil identificación

### **Generador de PDF**
- Vista previa de datos antes de generar
- Modal elegante con tabla de información
- Botones intuitivos para generar y descargar

### **Diseño Responsivo**
- Compatible con dispositivos móviles
- Interfaz adaptativa para diferentes tamaños de pantalla
- Navegación optimizada para touch

## 🔧 Configuración Avanzada

### Agregar Nuevos Formularios
1. Edita `src/data/municipalForms.ts`
2. Define los campos del formulario
3. Configura el mapeo de respuestas del chat
4. Agrega el PDF original en `public/documentos/`

### Personalizar Mapeo de Campos PDF
Edita el método `getFieldMappings` en `src/services/pdfService.ts` para ajustar los nombres de campos según los PDFs originales.

## 🐛 Solución de Problemas

### Los PDFs no se generan correctamente
- Verifica que los PDFs originales estén en `public/documentos/`
- El sistema tiene un respaldo que genera PDF desde HTML si el template original no funciona

### Campos no se auto-rellenan
- Revisa la configuración de `chatMapping` en `municipalForms.ts`
- Verifica que las respuestas del chat coincidan con las claves configuradas

## 🚀 Próximas Mejoras

- [ ] Integración con API del ayuntamiento
- [ ] Firma digital de documentos
- [ ] Validación avanzada de campos
- [ ] Notificaciones por email
- [ ] Historial de trámites
- [ ] Soporte para más tipos de formularios

## 📞 Soporte

Para reportar problemas o sugerir mejoras, crea un issue en el repositorio del proyecto.

---

**¡Desarrollado para simplificar los trámites municipales y mejorar la experiencia ciudadana!** 🏛️✨

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
