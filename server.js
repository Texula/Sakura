const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pentru procesarea datelor JSON și servirea fișierelor statice
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- CONFIGURARE ȘI INIȚIALIZARE BAZĂ DE DATE (SQLite) ---

// Ne asigurăm că folderul "data" există (esențial pentru maparea volumului în Podman)
const dataFolder = path.join(__dirname, 'data');
if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder);
}

// Conectăm baza de date SQLite în interiorul folderului protejat "data"
const dbPath = path.join(dataFolder, 'sakura.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error("❌ Eroare la deschiderea DB Sakura:", err);
    else console.log("✅ Baza de date SQLite Sakura este conectată și securizată în /data.");
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        color TEXT,
        token TEXT
    )`);

    // Migration: Add tasks column for existing databases without losing data
    db.run(`ALTER TABLE users ADD COLUMN tasks TEXT DEFAULT '[]'`, (err) => {
        // We ignore the error here because it just means the column already exists
    });
});

// --- RUTE DE AUTENTIFICARE (API) ---

// 1. Înregistrare (Register)
app.post('/api/register', (req, res) => {
    const { username, password, color } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: "Fill in all required fields!" });
    }

    // Criptăm parola folosind bcryptjs (la fel ca pe serverul principal hreniuc.net)
    const hash = bcrypt.hashSync(password, 10);
    
    db.run("INSERT INTO users (username, password, color) VALUES (?, ?, ?)", [username, hash, color || '#bb86fc'], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE')) {
                return res.status(400).json({ error: "This username already exists!" });
            }
            return res.status(500).json({ error: "Internal error saving to database." });
        }
        res.json({ success: true, message: "Account created successfully! You can log in." });
    });
});

// 2. Logare (Login)
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Enter username and password!" });
    }

    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (err) return res.status(500).json({ error: "Database query error." });
        
        // Verificăm dacă utilizatorul există și dacă parola se potrivește cu hash-ul stocat
        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ error: "Incorrect username or password." });
        }

        // Generăm un token securizat de sesiune pe bază de caractere hexazecimale
        const token = crypto.randomBytes(32).toString('hex');
        
        db.run("UPDATE users SET token = ? WHERE id = ?", [token, user.id], (updateErr) => {
            if (updateErr) return res.status(500).json({ error: "Error generating user session." });
            
            // Trimitem token-ul și datele de profil salvate înapoi la frontend
            res.json({ 
                success: true, 
                token: token, 
                username: user.username, 
                color: user.color,
                tasks: JSON.parse(user.tasks || '[]')
            });
        });
    });
});

// 3. Validare Sesiune (Verificare Token la reîncărcarea paginii în browser)
app.post('/api/verify', (req, res) => {
    const { token } = req.body;
    if (!token) return res.json({ valid: false });

    db.get("SELECT username, color, tasks FROM users WHERE token = ?", [token], (err, user) => {
        if (err || !user) {
            res.json({ valid: false });
        } else {
            res.json({ 
                valid: true, 
                username: user.username, 
                color: user.color,
                tasks: JSON.parse(user.tasks || '[]')
            });
        }
    });
});

// 4. Salvare Obiceiuri (Save Tasks)
app.post('/api/save-tasks', (req, res) => {
    const { token, tasks } = req.body;
    if (!token) return res.status(401).json({ success: false, error: "Unauthorized" });

    db.run("UPDATE users SET tasks = ? WHERE token = ?", [JSON.stringify(tasks), token], (err) => {
        if (err) return res.status(500).json({ success: false, error: "Database error" });
        res.json({ success: true });
    });
});
// --- SERVIREA INTERFEȚEI WEB ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Pornirea serverului independent Sakura
app.listen(PORT, () => {
    console.log(`🌸 Serverul independent Sakura rulează intern pe portul ${PORT}`);
});