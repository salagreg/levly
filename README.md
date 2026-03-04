# 📱 Levly - Become Your Best Self

<div align="center">

**Application mobile de développement personnel gamifiée**

Transformez vos routines quotidiennes en progression mesurable grâce à la synchronisation automatique et la gamification.

[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)

[Demo](#-demo) • [Installation](#-installation) • [Documentation](#-documentation) • [Tests](#-tests)

</div>

---

## 🎯 Le Problème

90% des gens abandonnent leurs bonnes résolutions après quelques semaines.

**Pourquoi ?**

- ❌ Manque de constance et de suivi
- ❌ Absence de feedback immédiat
- ❌ Trop de friction (tracking manuel, apps multiples)
- ❌ Aucune récompense concrète pour l'effort

---

## ✨ La Solution : Levly

**Levly** automatise le suivi de vos routines quotidiennes et vous récompense pour chaque effort.

### Fonctionnalités clés

🔗 **Synchronisation automatique**

- Connectez vos applications préférées
- Vos activités sont validées sans saisie manuelle
- Gain de temps : zéro friction

🎮 **Gamification motivante**

- Tokens gagnés par routine validée
- Série de jours consécutifs
- Badges de progression

📊 **Dashboard temps réel**

- Vue d'ensemble de votre journée
- Barres de progression dynamiques
- Statistiques hebdomadaires

🌍 **Gestion timezone intelligente**

- Calcul automatique de "minuit utilisateur"
- Fonctionne partout dans le monde

---

## 🏗️ Architecture Technique

### Stack Technologique

**Frontend**

```
React Native + Expo Router
TypeScript
Expo Go (développement)
```

**Backend**

```
Node.js + Express
Architecture MVC (Model-View-Controller)
Service Layer (logique métier)
JWT (authentification)
```

**Base de données**

```
PostgreSQL 14+
Schéma relationnel normalisé
JSONB pour configuration flexible
```

**Intégrations externes**

```
OAuth 2.0 (Strava + Spotify)
Refresh automatique des tokens
API REST
```

### Organisation du code

```
levly/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration BDD + schéma SQL
│   │   ├── models/          # Modèles de données
│   │   ├── services/        # Logique métier
│   │   ├── controllers/     # Gestion requêtes HTTP
│   │   ├── routes/          # Définition endpoints API
│   │   ├── middlewares/     # Auth JWT
│   │   └── integrations/    # APIs Strava/Spotify
│   ├── server.js            # Point d'entrée
│   └── package.json
│
├── frontend/
│   ├── app/                 # Expo Router (navigation)
│   ├── src/
│   │   ├── screens/         # 9 écrans principaux
│   │   ├── components/      # Composants réutilisables
│   │   ├── services/        # Appels API backend
│   │   ├── config/          # Configuration API
│   │   └── utils/           # Helpers
│   └── package.json
│
├── tests/                   # Scripts Python automatisés
└── README.md
```

---

## 🚀 Installation

### Prérequis

- **Node.js** 18+ ([Télécharger](https://nodejs.org/))
- **PostgreSQL** 14+ ([Télécharger](https://www.postgresql.org/download/))
- **Expo Go** sur smartphone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
- **Git** ([Télécharger](https://git-scm.com/))

### 1️⃣ Cloner le projet

```bash
git clone https://github.com/salagreg/levly.git
cd levly
```

### 2️⃣ Configuration Backend

```bash
cd backend
npm install
```

**Créer le fichier `.env` :**

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=levly_db
DB_USER=ton_user
DB_PASSWORD=ton_password

# JWT
JWT_SECRET=ton_secret_jwt_securise

# OAuth Strava
STRAVA_CLIENT_ID=ton_client_id
STRAVA_CLIENT_SECRET=ton_client_secret

# OAuth Spotify
SPOTIFY_CLIENT_ID=ton_client_id
SPOTIFY_CLIENT_SECRET=ton_client_secret
```

**Initialiser la base de données :**

```bash
# Créer la base
psql -U ton_user -c "CREATE DATABASE levly_db;"

# Exécuter le schéma
psql -U ton_user -d levly_db -f src/config/schema.sql

# (Optionnel) Charger les données de test
psql -U ton_user -d levly_db -f src/config/seed.sql
```

**Lancer le serveur :**

```bash
npm start
# Backend disponible sur http://localhost:3000
```

### 3️⃣ Configuration Frontend

```bash
cd frontend
npm install
```

**Configurer l'URL API :**

Éditer `src/config/api.js` :

```javascript
// Pour simulateur iOS/Android
export const API_BASE_URL = "http://localhost:3000/api";

// Pour iPhone physique (remplacer par l'IP de ton Mac)
// export const API_BASE_URL = "http://192.168.1.45:3000/api";
```

**Lancer l'app :**

```bash
npx expo start
```

Scannez le QR code avec **Expo Go** sur votre smartphone.

---

## 🧪 Tests

### Tests automatisés (Python)

**Prérequis :**

```bash
pip install requests psycopg2-binary colorama
```

**Exécution :**

```bash
cd tests

# Tests Inscription/Connexion
python3 test_carte1.py

# Tests Synchronisation Strava/Spotify
python3 test_carte2.py

# Tests Validation Quotidienne
python3 test_carte3.py

# Tests Multi-jours & Série
python3 test_carte4.py
```

### Résultats tests

| Carte                 | Tests | Réussis | Taux    |
| --------------------- | ----- | ------- | ------- |
| Carte 1 : Auth        | 16    | 11      | 68.8%   |
| Carte 2 : Sync        | 17    | 17      | 100%    |
| Carte 3 : Validation  | 40    | 19      | 47.5%\* |
| Carte 4 : Multi-jours | 12    | 12      | 100%    |

_\*Limité par dépendance aux APIs réelles Strava/Spotify_

---

## 📖 Documentation

### Sprints Reviews

Le projet a été développé en 7 sprints (méthodologie Agile) :

- [Sprint 1 - Setup]
- [Sprint 2 - Authentification]
- [Sprint 3 - Piliers & APIs]
- [Sprint 4 - Validation & Gamification]
- [Sprint 5 - Interface Mobile]
- [Sprint 6 - Validation temps réel]
- [Sprint 7 - Tests & Documentation]

---

## 🎮 Utilisation

### 1️⃣ Inscription

- Créez un compte avec email + mot de passe

### 2️⃣ Synchronisation

- Connectez **Strava** pour le sport
- Connectez **Spotify** pour la culture
- Définissez vos objectifs quotidiens (durée par pilier)

### 3️⃣ Validation quotidienne

- Faites vos activités normalement (sport, écoute musiques)
- Ouvrez Levly et validez votre journée
- Gagnez des **tokens** et maintenez votre **série** !

### 4️⃣ Progression

- Consultez votre **dashboard** (tokens, série)
- Débloquez des **badges**
- Suivez vos **statistiques hebdomadaires**

---

## 🔑 API Endpoints

### Authentification

```http
POST   /api/auth/register      # Inscription
POST   /api/auth/login          # Connexion
GET    /api/auth/me             # Profil utilisateur (protégé)
```

### Piliers

```http
GET    /api/piliers             # Liste piliers utilisateur
POST   /api/piliers             # Créer/modifier pilier
```

### OAuth Strava

```http
GET    /api/strava/auth         # Lancer OAuth
GET    /api/strava/callback     # Callback OAuth
GET    /api/strava/activities   # Activités du jour
```

### OAuth Spotify

```http
GET    /api/spotify/auth        # Lancer OAuth
GET    /api/spotify/callback    # Callback OAuth
GET    /api/spotify/podcasts    # Musiques du jour
```

### Validation

```http
POST   /api/validation/recovery # Valider la journée
```

### Dashboard

```http
GET    /api/dashboard           # Données utilisateur complètes
```

---

## 🛠️ Technologies & Dépendances

### Backend

```json
{
  "express": "^4.18.2",
  "pg": "^8.11.0",
  "bcrypt": "^5.1.1",
  "jsonwebtoken": "^9.0.2",
  "moment-timezone": "^0.5.43",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1"
}
```

### Frontend

```json
{
  "react-native": "0.73.2",
  "expo": "~50.0.0",
  "expo-router": "~3.4.0",
  "@react-navigation/native": "^6.1.9",
  "@react-native-async-storage/async-storage": "1.21.0",
  "react-native-safe-area-context": "4.8.2"
}
```

---

## 🚀 Roadmap (Post-MVP)

### Phase 1 - Déploiement Production

- [ ] Backend déployé (Railway/Render)
- [ ] Base de données PostgreSQL managée
- [ ] Build Expo (iOS + Android)

### Phase 2 - Améliorations

- [ ] Plus de routines connectées (méditation, lecture, sommeil)
- [ ] Coaching IA personnalisé
- [ ] Communauté + challenges entre utilisateurs
- [ ] Store de récompenses concrètes (style WeWards)

### Phase 3 - Monétisation

- [ ] Freemium (ex: 2 piliers gratuits, + piliers payants)
- [ ] Partenariats marques (récompenses réelles)
- [ ] Abonnement premium (analytics avancés)

---

## 👨‍💻 Auteur

**Grégory Sala**  
Étudiant développement web  
📧 [Email](greg.sala@icloud.com)  
🔗 [LinkedIn](www.linkedin.com/in/salagreg)  
🐙 [GitHub](https://github.com/salagreg)

---

## 📄 Licence

Ce projet est développé dans un cadre académique.  
**Tous droits réservés © 2026 Grégory Sala**

---

<div align="center">

[⬆ Retour en haut](#-levly---become-your-best-self)

</div>
