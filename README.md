# 🎵 YouTube to MP3 Converter – Backend

Un **serveur Node.js / Express robuste** permettant de convertir des vidéos YouTube en fichiers **MP3** en utilisant le package `vreden/youtube_scraper`, avec gestion automatique du temps de traitement et **téléchargement en streaming**.

Ce backend est conçu pour être **simple à intégrer côté frontend**, tout en contournant les limitations classiques comme le **CORS** et les délais de conversion.

---

## ✨ Fonctionnalités

- 🔁 **Conversion directe**  
  Le serveur utilise le package `vreden/youtube_scraper` pour convertir directement la vidéo sans attendre un statut externe.

- 🌐 **Téléchargement direct**  
  Le package `vreden/youtube_scraper` fournit une URL directe pour télécharger le fichier MP3.

- ⚡ **Prêt pour le Frontend**  
  Configuration **CORS** incluse pour `http://localhost:4200` (Angular par défaut).

---

## 🛠️ Stack Technique

- **Node.js**
- **Express** – Framework backend
- **youtube-scraper (vreden/youtube_scraper)** – Conversion et scraping YouTube
- **CORS** – Sécurité frontend/backend
- **Dotenv** – Gestion des variables d’environnement

---

## 🚀 Installation

### 1️⃣ Cloner le projet

```bash
git clone https://github.com/ton-pseudo/nom-du-repo.git
cd nom-du-repo
```

### 2️⃣ Installer les dépendances

```bash
npm install
```

### 3️⃣ Configuration de l’environnement

Créer un fichier **`.env`** à la racine du projet :

```env
PORT=3000
```

---

### 4️⃣ Lancer le serveur

```bash
npm start
```

Le serveur sera accessible sur :

```
http://localhost:3000
```

---

## 📡 Endpoints API

### 1️⃣ Convertir une vidéo YouTube

```http
GET /convert?id=VIDEO_ID
```

📌 **Description**  
- Utilise `vreden/youtube_scraper` pour convertir la vidéo.
- Retourne directement la réponse du package, qui contient l'URL du MP3 et d'autres informations.

✅ **Réponse (succès)**

```json
{
  "status": true,
  "creator": "@vreden/youtube_scraper",
  "metadata": {
    "type": "video",
    "videoId": "HoTYytnjCb0",
    "url": "https://youtube.com/watch?v=HoTYytnjCb0",
    "title": "Damso - Smog",
    "description": "...",
    "image": "https://i.ytimg.com/vi/HoTYytnjCb0/hq720.jpg",
    "thumbnail": "https://i.ytimg.com/vi/HoTYytnjCb0/hq720.jpg",
    "seconds": 167,
    "timestamp": "2:47",
    "duration": { "toString": "[Function: toString]", "seconds": 167, "timestamp": "2:47" },
    "ago": "7 years ago",
    "views": 61282483,
    "author": {
      "name": "le rappeur damso",
      "url": "https://youtube.com/channel/UCxsYR3_7CKZeRfdJpqGxmdw"
    }
  },
  "download": {
    "status": true,
    "quality": "128kbps",
    "availableQuality": [ 92, 128, 256, 320 ],
    "url": "https://cdn402.savetube.vip/media/HoTYytnjCb0/damso-smog-128-ytshorts.savetube.me.mp3",
    "filename": "Damso - Smog (128kbps).mp3"
  }
}
```

❌ **Erreur possible**

```json
{
  "error": "Conversion failed"
}
```



---

## 🔐 Sécurité

- Aucune clé API n’est exposée côté client
- Le backend agit comme **proxy sécurisé** pour les téléchargements
- Une validation basique est faite sur l'ID de la vidéo YouTube

---

## 🧩 Exemple d’utilisation (Frontend)

```ts
this.http.get('http://localhost:3000/convert?id=VIDEO_ID')
  .subscribe(res => {
    // L'URL du MP3 est dans res.download.url
    // Le titre est dans res.metadata.title
    window.open(res.download.url, '_blank');
  });
```

---

## 📝 Notes

- Compatible avec **Angular**, **React**, **Vue**, etc.
- Peut être déployé facilement sur un VPS ou un service type **Render / Railway / Fly.io**
- Le streaming évite les problèmes de fichiers temporaires

---

## 📄 Licence

Projet open-source – à adapter selon vos besoins.

---

