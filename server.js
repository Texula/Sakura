const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // Pentru a putea citi JSON din request-uri

// Configurăm serverul să servească fișiere statice (HTML, CSS, JS, Imagini) din folderul "public"
app.use(express.static(path.join(__dirname, 'public')));

// Rută pentru interfața web (Prototipul Sakura)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Am mutat mesajul de succes pe un endpoint de API separat
app.get('/api/status', (req, res) => {
    res.json({ 
        status: "success", 
        message: "🌸 Backend-ul Sakura funcționează perfect!" 
    });
});

// Pornim serverul
app.listen(PORT, () => {
    console.log(`🌸 Sakura Backend rulează pe portul ${PORT}`);
});