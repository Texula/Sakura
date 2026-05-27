const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // Pentru a putea citi JSON din request-uri

// Rută de test
app.get('/', (req, res) => {
    res.json({ 
        status: "success", 
        message: "🌸 Serverul Sakura funcționează perfect în Podman!" 
    });
});

// Pornim serverul
app.listen(PORT, () => {
    console.log(`🌸 Sakura Backend rulează pe portul ${PORT}`);
});