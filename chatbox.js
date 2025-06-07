// Configuración de la API de Gemini
const GEMINI_API_KEY = 'AIzaSyAsjXWIqf5ecv4ZDjnAWSjr-zn_1nMMm4k'; // Reemplazar con tu API key
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Configuración del chat
const chatState = {
    phase: 'initial', // initial, collecting, closing
    userInfo: {},
    messages: []
};

// Configuración del asistente
const assistantConfig = {
    name: 'Italo',
    role: 'FULL-STACK DEV & DATA ANALYST',
    specialties: ['SQL','Python','React', 'Node.js', 'MongoDB', 'AWS'],
    initialMessage: '¡Hola! Soy {name}, {role} especializado en {specialties}. ¿En qué proyecto estás trabajando?',
    questions: {
        projectType: '¿Qué tipo de proyecto necesitas desarrollar?',
        timeline: '¿Tienes un timeline definido para el proyecto?',
        budget: '¿Cuál es tu presupuesto aproximado?',
        features: '¿Qué funcionalidades principales necesitas?',
        technologies: '¿Tienes preferencia por alguna tecnología específica?'
    }
};

// Elementos del DOM
const chatbox = document.createElement('div');
chatbox.className = 'chatbox minimized';
chatbox.innerHTML = `
    <div class="chatbox-header">
        <div class="chatbox-title">
            <i class="fas fa-robot"></i>
            <span>Asistente Virtual</span>
        </div>
        <button class="chatbox-minimize">
            <i class="fas fa-minus"></i>
        </button>
    </div>
    <div class="chatbox-messages"></div>
    <div class="chatbox-input">
        <textarea placeholder="Escribe tu mensaje..." rows="1"></textarea>
        <button class="send-button">
            <i class="fas fa-paper-plane"></i>
        </button>
    </div>
    <div class="chatbox-wave"></div>
`;

// Estilos del chatbox
const styles = `
    .chatbox {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 350px;
        height: 500px;
        background: var(--dark-light);
        border-radius: 15px;
        box-shadow: 0 5px 25px rgba(0,0,0,0.2);
        display: flex;
        flex-direction: column;
        z-index: 1000;
        overflow: hidden;
        border: 1px solid rgba(108, 99, 255, 0.2);
        backdrop-filter: blur(10px);
    }

    .chatbox-header {
        padding: 15px;
        background: rgba(108, 99, 255, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .chatbox-title {
        display: flex;
        align-items: center;
        gap: 10px;
        color: var(--primary);
        font-weight: 500;
    }

    .chatbox-title i {
        animation: subtle-pulse 1.5s infinite ease-in-out;
    }

    .chatbox-minimize {
        background: none;
        border: none;
        color: var(--light);
        cursor: pointer;
        padding: 5px;
        transition: var(--transition);
    }

    .chatbox-minimize:hover {
        color: var(--primary);
    }

    .chatbox-messages {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 15px;
    }

    .message {
        max-width: 80%;
        padding: 12px 15px;
        border-radius: 15px;
        animation: messageAppear 0.3s ease-out;
    }

    .message.assistant {
        background: rgba(108, 99, 255, 0.1);
        color: var(--light);
        align-self: flex-start;
        border-bottom-left-radius: 5px;
    }

    .message.user {
        background: var(--primary);
        color: white;
        align-self: flex-end;
        border-bottom-right-radius: 5px;
    }

    .chatbox-input {
        padding: 15px;
        display: flex;
        gap: 10px;
        background: rgba(0,0,0,0.2);
    }

    .chatbox-input textarea {
        flex: 1;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 20px;
        padding: 10px 15px;
        color: var(--light);
        resize: none;
        font-family: inherit;
        transition: var(--transition);
    }

    .chatbox-input textarea:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 2px rgba(108, 99, 255, 0.2);
    }

    .send-button {
        background: var(--primary);
        color: white;
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        transition: var(--transition);
    }

    .send-button:hover {
        transform: scale(1.1);
        box-shadow: 0 0 15px rgba(108, 99, 255, 0.3);
    }

    .chatbox.minimized {
        width: 60px; /* Ancho del icono minimizado */
        height: 60px; /* Altura del icono minimizado */
        border-radius: 50%; /* Forma circular */
        box-shadow: 0 0 8px var(--primary), 0 0 15px var(--primary-light);
        animation: attention-pulse 3s infinite ease-in-out;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .chatbox.minimized .chatbox-header {
        padding: 0;
        background: none;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
    }

    .chatbox.minimized .chatbox-header span,
    .chatbox.minimized .chatbox-header .chatbox-minimize {
        display: none;
    }

    .chatbox.minimized .chatbox-title {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(108, 99, 255, 0.2);
        border: 1px solid var(--primary);
        box-shadow: none;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
    }

    .chatbox.minimized .chatbox-messages,
    .chatbox.minimized .chatbox-input {
        display: none;
    }

    @keyframes messageAppear {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes pulse-wave {
        0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0.8;
        }
        100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
        }
    }

    @keyframes subtle-pulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.1);
        }
    }

    /* Animación para el parpadeo del ícono minimizado */
    @keyframes opacity-flash {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0.7; /* Menos opaco en el medio para el efecto de parpadeo */
        }
    }

    /* Aplicar un pulso sutil y parpadeo al ícono principal cuando está minimizado */
    .chatbox-title i {
        /* Animación de pulso sutil siempre activa */
        animation: subtle-pulse 1.5s infinite ease-in-out; 
    }

    .chatbox.minimized .chatbox-title i {
        /* Añadir animación de parpadeo solo cuando está minimizado */
        animation: subtle-pulse 1.5s infinite ease-in-out, opacity-flash 2s infinite step-end; /* Combinamos animaciones */
    }

    /* Estilos para el nuevo elemento de onda */
    .chatbox-wave { display: none; } /* Asegurarse de que el div de onda esté oculto */

    .chatbox.minimized {
        width: 60px; /* Ancho del icono minimizado */
        height: 60px; /* Altura del icono minimizado */
        border-radius: 50%; /* Forma circular */
        /* Mantener efecto neón existente */
        box-shadow: 0 0 8px var(--primary), 0 0 15px var(--primary-light);
        /* Eliminamos la animación attention-pulse de aquí */
        /* Asegurar que el contenido se oculte y solo quede el encabezado/icono */
    }
`;

// Agregar estilos al documento
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Almacenar respuestas de respaldo
let backupResponses = [];

// Funciones principales
async function initializeChat() {
    document.body.appendChild(chatbox);
    await loadBackupResponses(); // Cargar respuestas de respaldo al inicializar
    const initialMessage = assistantConfig.initialMessage
        .replace('{name}', assistantConfig.name)
        .replace('{role}', assistantConfig.role)
        .replace('{specialties}', assistantConfig.specialties.join(', '));
    
    addMessage(initialMessage, 'assistant');
    setupEventListeners();
}

// Función para cargar las respuestas de respaldo desde el archivo JSON
async function loadBackupResponses() {
    try {
        const response = await fetch('respuestas_backup.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        backupResponses = await response.json();
        console.log('Respuestas de respaldo cargadas:', backupResponses);
    } catch (error) {
        console.error('Error loading backup responses:', error);
        // Si falla la carga, backupResponses quedará vacío, lo cual es aceptable.
    }
}

// Función para buscar respuesta en el respaldo
function responder_backup(pregunta) {
    const cleanedPregunta = pregunta.toLowerCase().trim();

    for (const item of backupResponses) {
        // Iterar sobre las palabras clave definidas para cada respuesta
        if (item.keywords) { // Asegurarse de que el campo keywords exista
            for (const keyword of item.keywords) {
                const cleanedKeyword = keyword.toLowerCase().trim();
                // Buscar si la pregunta del usuario incluye la palabra clave
                // Asegurar que la palabra clave tenga más de 2 caracteres para evitar coincidencias triviales
                if (cleanedPregunta.includes(cleanedKeyword) && cleanedKeyword.length > 2) {
                    return item.respuesta; // Devolver la respuesta si encuentra una coincidencia
                }
            }
        }
    }

    // Si no encuentra coincidencia después de revisar todas las keywords
    return null; // Devolvemos null si no hay respuesta de respaldo
}

function setupEventListeners() {
    const minimizeBtn = chatbox.querySelector('.chatbox-minimize');
    const chatboxTitle = chatbox.querySelector('.chatbox-title');
    const sendBtn = chatbox.querySelector('.send-button');
    const textarea = chatbox.querySelector('textarea');

    // Event listener para minimizar/maximizar al hacer clic en el botón de minimizar
    minimizeBtn.addEventListener('click', () => {
        chatbox.classList.toggle('minimized');
    });

    // Event listener para maximizar al hacer clic en el título/icono cuando está minimizado
    chatboxTitle.addEventListener('click', () => {
        if (chatbox.classList.contains('minimized')) {
            chatbox.classList.remove('minimized');
        }
    });

    sendBtn.addEventListener('click', () => handleUserInput());
    textarea.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleUserInput();
        }
    });

    // Auto-resize textarea
    textarea.addEventListener('input', () => {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    });
}

async function handleUserInput() {
    const textarea = chatbox.querySelector('textarea');
    const message = textarea.value.trim();
    
    if (!message) return;

    addMessage(message, 'user');
    textarea.value = '';
    textarea.style.height = 'auto';

    // Procesar la respuesta
    const response = await processMessage(message);
    addMessage(response, 'assistant');

    // Actualizar estado del chat
    updateChatState(message, response);
}

async function processMessage(message) {
    try {
        // URL de tu servidor backend (ajusta el puerto si lo cambiaste)
        const backendUrl = 'http://localhost:3000/chat';

        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        });

        if (!response.ok) {
            // Si el backend devuelve un error (ej. API key inválida, servidor caído),
            // lanzamos un error para activar el sistema de respaldo.
             const errorDetails = await response.text(); // Leer cuerpo del error para depuración
             console.error('Backend response not OK:', response.status, errorDetails);
             throw new Error(`Backend error: ${response.status}`);
        }

        // Parseamos la respuesta JSON del backend
        const data = await response.json();
        // El backend nos envía la respuesta de Gemini en el campo 'response'
        return data.response; // Devolver respuesta de IA si todo salió bien

    } catch (error) {
        console.error('Error calling backend or Gemini API:', error);

        // *** Sistema de Respaldo ***
        console.log('Attempting to use backup response...');
        const backupResponse = responder_backup(message);

        if (backupResponse) {
            console.log('Backup response found:', backupResponse);
            return backupResponse; // Devolver respuesta de respaldo si se encuentra
        } else {
            console.log('No backup response found.');
            // Si no hay respuesta de respaldo, devolver mensaje genérico
            return 'Lo siento, no tengo una respuesta para eso en este momento. Intenta preguntar de otra manera o más tarde.';
        }
    }
}

function generatePrompt(message) {
    const professionalContext = `
    # Contexto Profesional de Ítalo Fabio Sinisi Quintana
    
    ## Perfil Principal
    - Nombre: Ítalo Fabio Sinisi Quintana
    - Rol: Full-Stack Developer & Data Analyst (3+ años de experiencia)
    - Especialidades: Desarrollo web, análisis de datos, automatización y business intelligence
    
    ## Habilidades Técnicas
    ### Desarrollo Full-Stack:
    - Frontend: React, HTML/CSS, JavaScript
    - Backend: Node.js, Python (Flask)
    - Bases de Datos: SQL, MongoDB
    - APIs: REST APIs
    
    ### Análisis de Datos:
    - Visualización: Power BI, Tableau
    - Procesamiento: Python (Pandas, Scikit-learn), Apache Spark
    - ETL/ELT: Databricks, diseño de pipelines
    - Cloud: AWS, GCP, Azure
    
    ### Otras Tecnologías:
    - Genesys Cloud | Docker | Linux | SCRUM | CI/CD
    
    ## Experiencia Laboral Relevante
    
    ### UBYCALL – Pizza Hut Salvador
    **Analista De Datos Call Center (2023-2024)**
    - Análisis de datos de servicio al cliente
    - Desarrollo de dashboards en Power BI y Excel
    - Implementación de KPIs que aumentaron conversiones en 15%
    - Uso de SQL y Genesys Cloud para extracción de datos
    
    ### ALFIN BANCO
    **Análisis Financiero (2022)**
    - Modelos de riesgo financiero en Excel
    - Automatización de procesos con Python
    - Análisis de solicitudes de crédito
    
    ### Gestión Inmobiliaria Pacífico S.A.C.
    **Asistente de Administración (2021-2022)**
    - Optimización de procesos administrativos
    - Estructuración de bases de datos SQL
    
    ## Educación y Certificaciones
    - SENCICO: Administración de Obras de Construcción Civil
    - EDTEAM: Cursos en Python, SQL, Análisis de Datos, Power BI
    - Certificaciones: SCRUM, Genesys Cloud
    
    ## Proyectos Destacados
    - Descargador universal de contenido en Python
    - Integraciones con IA (Gemini API, GPTs)
    - Desarrollo de chatbots y dashboards interactivos
    
    ## Contacto
    - Email: sinisiquintanaitalo@gmail.com
    - Teléfono: (+51) 977170609
    - LinkedIn: linkedin.com/in/italo-fabio-sinisi-quintana
    `;

    const personalityContext = `
    # Personalidad y Estilo de Comunicación
    - Actúas como representante digital de Ítalo
    - Tono: Profesional pero cercano, con toques de humor natural
    - Objetivo: Generar conexión humana mientras muestras experiencia
    - Usa emojis con moderación (🚀, 💻, 📊)
    - No eres un bot genérico, sino un "bro digital" de Ítalo
    
    # Directrices de Respuesta
    1. Siempre contextualiza respuestas con la experiencia real de Ítalo
    2. Para preguntas técnicas, menciona herramientas específicas que domina
    3. En proyectos, destaca logros cuantificables cuando sea posible
    4. Mantén respuestas concisas pero completas
    5. Ofrece ayuda concreta basada en sus habilidades reales
    `;

    return `
    ${professionalContext}
    
    ${personalityContext}
    
    Historial reciente del chat:
    ${chatState.messages.slice(-3).map(m => `Usuario: ${m.user}\nAsistente: ${m.assistant}`).join('\n')}
    
    Mensaje actual del usuario a responder:
    "${message}"
    
    Instrucción final: 
    Genera una respuesta útil, profesional y alineada con el perfil real de Ítalo, 
    usando un tono cercano pero técnicamente preciso.
    `;
}

function addMessage(text, type) {
    const messagesContainer = chatbox.querySelector('.chatbox-messages');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = text;
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function updateChatState(userMessage, assistantResponse) {
    chatState.messages.push({
        user: userMessage,
        assistant: assistantResponse
    });

    // Actualizar fase del chat basado en el contenido
    if (chatState.phase === 'initial' && chatState.messages.length >= 2) {
        chatState.phase = 'collecting';
    } else if (chatState.phase === 'collecting' && chatState.messages.length >= 6) {
        chatState.phase = 'closing';
    }

    // Guardar en sessionStorage
    sessionStorage.setItem('chatState', JSON.stringify(chatState));
}

// Inicializar el chat cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initializeChat); 