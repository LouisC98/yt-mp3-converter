# 🎵 YouTube to MP3 Converter – Backend

Un **serveur Node.js / Express robuste** permettant de convertir des vidéos YouTube en fichiers **MP3**, avec gestion automatique du temps de traitement et **téléchargement en streaming**.

Ce backend est conçu pour être **simple à intégrer côté frontend**, tout en contournant les limitations classiques comme le **CORS** et les délais de conversion.

---

## ✨ Fonctionnalités

- 🔁 **Polling automatique**  
  Le serveur interroge l’API de conversion et attend que le statut passe à `completed` avant de répondre au client.

- 🌐 **Proxy de téléchargement (streaming)**  
  Le MP3 est téléchargé via Axios en mode `stream` puis renvoyé directement au navigateur.

- 🔒 **Sécurisé**  
  Les clés API sont stockées dans des **variables d’environnement** (`.env`).

- ⚡ **Prêt pour le Frontend**  
  Configuration **CORS** incluse pour `http://localhost:4200` (Angular par défaut).

---

## 🛠️ Stack Technique

- **Node.js**
- **Express** – Framework backend
- **Axios** – Client HTTP (streaming)
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
RAPIDAPI_KEY=votre_cle_api
RAPIDAPI_USERNAME=votre_username_rapidapi
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
- Envoie la requête de conversion à l’API externe
- Boucle tant que le statut est `processing`
- Retourne l’URL finale du MP3

✅ **Réponse (succès)**

```json
{
  "status": "completed",
  "title": "Nom de la vidéo",
  "mp3Url": "https://url-du-fichier.mp3"
}
```

❌ **Erreur possible**

```json
{
  "error": "Conversion failed"
}
```

---

### 2️⃣ Télécharger le fichier MP3

```http
GET /download?url=FICHIER_URL&name=NOM_OPTIONNEL
```

📌 **Description**  
- Télécharge le fichier MP3 via Axios en streaming
- Le renvoie directement au navigateur
- Force le téléchargement (`Content-Disposition: attachment`)

📎 **Paramètres**

| Paramètre | Description |
|----------|-------------|
| `url` | URL du fichier MP3 (obligatoire) |
| `name` | Nom du fichier (optionnel, sans `.mp3`) |

---

## 🔐 Sécurité

- Les clés API sont stockées dans `.env`
- Aucune clé n’est exposée côté client
- Le backend agit comme **proxy sécurisé**

---

## 🧩 Exemple d’utilisation (Frontend)

```ts
this.http.get('http://localhost:3000/convert?id=VIDEO_ID')
  .subscribe(res => {
    window.location.href = `http://localhost:3000/download?url=${res.mp3Url}`;
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

