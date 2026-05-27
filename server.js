const express = require('express');
const cors = require('cors');
const path = require('path');
const https = require('https');
const fs = require('fs');

const app = express();
// Portul pentru HTTPS
const PORT = process.env.PORT || 443;

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
        message: "🌸 Backend-ul Sakura funcționează perfect prin HTTPS!" 
    });
});

// Configurarea pentru Certbot SSL
const domain = 'sakura.hreniuc.net';

try {
    // Citim certificatele SSL generate de Certbot
    const privateKey = fs.readFileSync(`/etc/letsencrypt/live/${domain}/privkey.pem`, 'utf8');
    const certificate = fs.readFileSync(`/etc/letsencrypt/live/${domain}/fullchain.pem`, 'utf8');
    
    const credentials = { key: privateKey, cert: certificate };

    // Pornim serverul HTTPS
    const httpsServer = https.createServer(credentials, app);
    
    httpsServer.listen(PORT, () => {
        console.log(`🌸 Sakura Backend rulează securizat (HTTPS) pe portul ${PORT}`);
    });
} catch (error) {
    // Fallback în cazul în care certificatele nu există încă sau nu avem permisiuni
    console.error("⚠️ Nu am putut încărca certificatele SSL. Serverul va porni pe portul 80 (HTTP).");
    console.error(error.message);
    
    const fallbackPort = 80;
    app.listen(fallbackPort, () => {
        console.log(`🌸 Sakura Backend rulează nesecurizat (HTTP) pe portul ${fallbackPort}`);
    });
}