const express = require('express');
const yt = require('@vreden/youtube_scraper');
const cors = require('cors');
const https = require('https');
require('dotenv').config();

const app = express();
app.use(cors({
    origin: 'http://localhost:4200'
}));
app.use(express.json());

app.get('/search', async (req, res) => {
    const query = req.query.q;
    if (query.length <= 2) return res.status(400).json({ error: "Query trop courte" });
    try {
        const result = await yt.search(query);
        console.log(result)
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
        console.log(result)
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