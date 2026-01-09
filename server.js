// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({
    origin: 'http://localhost:4200'
}));
app.use(express.json());

app.get('/convert', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).json({ error: "ID requis" });

    const options = {
        method: 'GET',
        url: 'https://youtube-mp36.p.rapidapi.com/dl',
        params: { id: videoId },
        headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            'x-rapidapi-host': 'youtube-mp36.p.rapidapi.com',
        }
    };

    try {
        let finished = false;
        while (!finished) {
            const response = await axios.request(options);
            const data = response.data;

            if (data.status === 'ok') {
                finished = true;
                return res.json(data); // Succès
            } else if (data.status === 'processing') {
                // On attend 1 seconde avant la prochaine itération de la boucle
                await new Promise(resolve => setTimeout(resolve, 1000));
            } else {
                finished = true;
                return res.status(500).json({ status: 'fail', msg: data.msg });
            }
        }
    } catch (error) {
        res.status(500).json({ error: "Erreur API" });
    }
});

app.get('/download', async (req, res) => {
    const fileUrl = req.query.url;
    const fileName = req.query.name || 'music.mp3';

    try {
        const response = await axios({
            url: fileUrl,
            method: 'GET',
            responseType: 'stream',
            headers: {
                'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) ${process.env.RAPIDAPI_USERNAME}`
            }
        });

        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
        res.setHeader('Content-Type', 'audio/mpeg');

        response.data.pipe(res);
    } catch (error) {
        res.status(500).send("Erreur lors du téléchargement");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur prêt sur le port ${PORT}`);
});