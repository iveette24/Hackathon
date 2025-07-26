# 🧪 Guía de Prueba - Automatización de Formularios

## 🎯 Ejemplo de Uso Completo

### **Escenario: Solicitud de Certificado de Residencia**

Sigue estos pasos para probar la funcionalidad completa:

#### 1. **Inicio de Conversación**
- Abre la aplicación en `http://localhost:5174/`
- El bot preguntará: *"¿Cuál es tu nombre completo?"*
- **Responde:** "Juan Pérez García"

#### 2. **Información de Contacto**
- **Pregunta:** *"¿Cuál es tu correo electrónico?"*
- **Responde:** "juan.perez@email.com"

#### 3. **Selección de Trámite**
- **Pregunta:** *"¿Qué tipo de trámite necesitas realizar?"*
- **Responde:** "residencia" o "certificado de residencia"

#### 4. **Selección de Formulario**
- El sistema mostrará opciones de formularios
- **Haz clic en:** "Solicitud de Certificado de Residencia"

#### 5. **Información Específica**
- **Edad:** "30"
- **Dirección actual:** "Calle Mayor 123, Madrid"
- **Teléfono:** "666777888"
- **Motivo:** "Para trámites bancarios"

#### 6. **Revisión del Formulario**
- ✅ Verifica que todos los campos aparezcan en **amarillo** (auto-rellenados)
- ✅ Comprueba que los datos sean correctos
- ✅ Edita cualquier campo si es necesario

#### 7. **Generación de PDF**
- **Haz clic en:** "Generar PDF"
- ✅ Revisa la vista previa de datos en el modal
- **Haz clic en:** "Descargar PDF"
- ✅ Verifica que el PDF se descargue automáticamente

---

## 🔍 Otros Escenarios de Prueba

### **Licencia de Obras**
```
Nombre: "María López Fernández"
Email: "maria.lopez@email.com"
Trámite: "obras" o "licencia de obras"
Dirección obra: "Avenida Libertad 45, Barcelona"
Tipo obra: "Reforma interior"
Descripción: "Renovación de cocina y baño"
```

### **Empadronamiento**
```
Nombre: "Carlos Ruiz Martín"
Email: "carlos.ruiz@email.com"
Trámite: "empadronamiento"
DNI: "12345678Z"
Fecha nacimiento: "15/03/1985"
Nacionalidad: "Española"
Dirección anterior: "Plaza España 10, Valencia"
Nueva dirección: "Calle Luna 25, Sevilla"
```

---

## 🎨 Elementos Visuales a Verificar

### ✅ **Campos Auto-rellenados**
- [ ] Fondo amarillo dorado
- [ ] Texto negro y bold
- [ ] Borde oscuro destacado
- [ ] Animación de focus

### ✅ **Modal de PDF**
- [ ] Encabezado rojo corporativo
- [ ] Tabla con datos ordenados
- [ ] Botones responsivos
- [ ] Spinner de carga

### ✅ **Interfaz General**
- [ ] Chat fluido y responsivo
- [ ] Botones de formulario atractivos
- [ ] Iconos Bootstrap funcionando
- [ ] Navegación intuitiva

---

## 🐛 Casos de Error a Probar

### **PDF Template No Disponible**
- El sistema debería generar PDF desde HTML automáticamente
- Mensaje de consola: *"No se pudo usar el template PDF original, generando desde HTML"*

### **Campos Vacíos**
- Los campos requeridos deben mostrar validación
- El formulario no se debe enviar sin datos obligatorios

### **Respuestas No Reconocidas**
- Si escribes palabras que no coinciden con formularios
- El bot debe sugerir opciones disponibles

---

## 📊 Métricas de Éxito

✅ **Funcionalidad Básica**
- [ ] Chat conversacional funciona
- [ ] Auto-llenado de campos
- [ ] Generación de PDF
- [ ] Descarga automática

✅ **Experiencia de Usuario**
- [ ] Interfaz intuitiva
- [ ] Campos destacados visualmente
- [ ] Proceso fluido y rápido
- [ ] Feedback claro en cada paso

✅ **Robustez Técnica**
- [ ] Manejo de errores
- [ ] Respaldo de PDF HTML
- [ ] Validación de formularios
- [ ] Responsive design

---

🎉 **¡Prueba completada exitosamente si todos los elementos funcionan correctamente!**
