const express = require('express');
const yt = require('@vreden/youtube_scraper');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const SECRET_KEY = process.env.SECRET_KEY || 'votre_cle_secrete_par_defaut';
const USERS_FILE = path.join(__dirname, 'users.json');

app.use(cors({
    origin: process.env.APP_DOMAIN,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// --- AUTHENTICATION ---

function getUsers() {
    if (!fs.existsSync(USERS_FILE)) {
        fs.writeFileSync(USERS_FILE, '[]');
    }
    const data = fs.readFileSync(USERS_FILE);
    return JSON.parse(data);
}

function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

app.post('/auth/register', async (req, res) => {
    const { username, password } = req.body;
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

    if (!username || !password) {
        return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    if (!usernameRegex.test(username)) {
        return res.status(400).json({ message: "Nom d'utilisateur invalide (3-20 caractères, alphanumérique)." });
    }

    const users = getUsers();
    if (users.find(u => u.username === username)) {
        return res.status(409).json({ message: "Nom d'utilisateur déjà pris." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: Date.now(), username, password: hashedPassword };

    users.push(newUser);
    saveUsers(users);

    res.status(201).json({ message: "Inscription réussie." });
});

app.post('/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const users = getUsers();
    const user = users.find(u => u.username === username);

    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '6h' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: true, // Passer à true si vous utilisez HTTPS
            sameSite: 'strict',
            maxAge: 21600000 // 6 heures
        });

        const { password: _, ...userWithoutPassword } = user;
        res.json({ message: "Connexion réussie", user: userWithoutPassword });
    } else {
        res.status(401).json({ message: "Identifiants incorrects." });
    }
});

app.post('/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: "Déconnexion réussie" });
});

app.get('/auth/me', (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.json({ user: null });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const users = getUsers();
        const user = users.find(u => u.id === decoded.id);

        if (user) {
            const { password: _, ...userWithoutPassword } = user;
            return res.json({ user: userWithoutPassword });
        }
        res.json({ user: null });
    } catch (err) {
        res.clearCookie('token');
        res.json({ user: null });
    }
});


// --- YOUTUBE FEATURES ---

app.get('/search', async (req, res) => {
    const query = req.query.q;
    if (query.length <= 2) return res.status(400).json({ error: "Query trop courte" });
    try {
        const result = await yt.search(query);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Erreur lors de la conversion", error: error.message });
    }
});

app.get('/metadata', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).json({ error: "ID requis" });
    try {
        const url = `https://www.youtube.com/watch?v=${videoId}`;
        const result = await yt.metadata(url);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Erreur lors de la conversion", error: error.message });
    }
});

app.get('/convert', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).json({ error: "ID requis" });
    try {
        const url = `https://www.youtube.com/watch?v=${videoId}`;
        const result = await yt.ytmp3(url, 128);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Erreur lors de la conversion", error: error.message });
    }
});

app.get('/download-mp3', async (req, res) => {
    const videoId = req.query.id;
    const filename = req.query.title;
    if (!videoId) return res.status(400).json({ error: "ID requis" });
    try {
        const url = `https://www.youtube.com/watch?v=${videoId}`;
        const result = await yt.ytmp3(url, 128);

        const fileUrl = result.download.url;

        const rawTitle = filename ?? result.download.filename ?? 'audio';
        const safeTitle = rawTitle.replace(/[\\/:*?"<>|]/g, "").trim();
        const encodedTitle = encodeURIComponent(safeTitle);

        res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}"; filename*=UTF-8''${encodedTitle}.mp3`);
        res.setHeader('Content-Type', 'audio/mpeg');

        https.get(fileUrl, (mp3Response) => {
            mp3Response.pipe(res);
        }).on('error', (e) => {
            console.error(e);
            res.status(500).json({ message: "Erreur lors de la récupération du fichier MP3.", error: e });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Erreur lors de la conversion", error: error.message });
    }
});

const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Serveur prêt sur le port ${PORT}`);
});