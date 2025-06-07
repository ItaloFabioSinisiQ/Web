// Cargar variables de entorno
require('dotenv').config();

const express = require('express');
const cors = require('cors');
// Usar la clase y el paquete correctos según la guía
const { GoogleGenAI } = require("@google/genai");
const fs = require('fs').promises; // Usar la versión de promesas del módulo fs
const path = require('path');

const app = express();
const port = process.env.PORT || 3000; // Puedes usar el puerto que prefieras

// Configurar CORS para permitir solicitudes desde tu frontend
// Asegúrate de reemplazar '*' con la URL específica de tu frontend en producción
app.use(cors());

// Middleware para parsear JSON
app.use(express.json());

// Inicializar la API de Gemini con la clave API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Ruta del archivo donde se guardarán los envíos del formulario
const submissionsFilePath = path.join(__dirname, 'submissions.json');

// Endpoint para manejar las solicitudes del chatbot
app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).json({ error: 'No message provided' });
    }

    try {
        // Llamar al método generateContent directamente en ai.models
        const response = await ai.models.generateContent({ 
            model: "gemini-2.0-flash", // Usar el nombre del modelo de la guía
            contents: userMessage,
        });

        // Acceder al texto de la respuesta (según la guía)
        const text = response.text;

        res.json({ response: text });

    } catch (error) {
        console.error('Error calling Gemini API:', error);
        res.status(500).json({ error: 'Error processing your message with Gemini' });
    }
});

// Nuevo endpoint para manejar los envíos del formulario de contacto
app.post('/submit-form', async (req, res) => {
    const formData = req.body;

    if (!formData || !formData.nombre || !formData.email || !formData.mensaje) {
        return res.status(400).json({ error: 'Missing form data' });
    }

    // Añadir marca de tiempo al envío
    const submission = {
        timestamp: new Date().toISOString(),
        ...formData
    };

    try {
        // Leer los envíos existentes (si los hay)
        let existingSubmissions = [];
        try {
            const data = await fs.readFile(submissionsFilePath, 'utf8');
            existingSubmissions = JSON.parse(data);
             // Asegurarse de que es un array por si el archivo está vacío o corrupto inicialmente
            if (!Array.isArray(existingSubmissions)) {
                existingSubmissions = [];
            }
        } catch (readError) {
            // Si el archivo no existe, simplemente empezamos con un array vacío
            if (readError.code !== 'ENOENT') {
                console.error('Error reading submissions file:', readError);
                 // Si es un error diferente a archivo no encontrado, reportarlo
            }
        }

        // Añadir el nuevo envío
        existingSubmissions.push(submission);

        // Escribir el array actualizado de vuelta al archivo
        await fs.writeFile(submissionsFilePath, JSON.stringify(existingSubmissions, null, 2), 'utf8');

        console.log('Form submission saved:', submission);
        res.status(200).json({ message: 'Form data saved successfully' });

    } catch (error) {
        console.error('Error saving form submission:', error);
        res.status(500).json({ error: 'Failed to save form data' });
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
}); 