const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/status', (req, res) => {
    res.json({ status: "success", message: "🌸 Backend funcționează perfect pe portul 3000!" });
});

app.listen(PORT, () => {
    console.log(`🌸 Sakura Backend rulează intern pe portul ${PORT}`);
});