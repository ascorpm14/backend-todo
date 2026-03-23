# Task Manager Backend

API Node.js + Express + MongoDB pour gérer les tâches entre 2 utilisateurs.

## Installation

```bash
npm install
```

## Configuration MongoDB

### Option 1: Local
1. Télécharge et installe MongoDB Community: https://www.mongodb.com/try/download/community
2. Démarre le service MongoDB
3. URL défaut dans `.env`: `mongodb://localhost:27017/task-manager`

### Option 2: MongoDB Atlas (Cloud)
1. Crée un compte gratuit: https://www.mongodb.com/cloud/atlas
2. Crée un cluster
3. Copie la connexion string dans `.env`

## Démarrage

**Mode développement (avec auto-reload):**
```bash
npm run dev
```

**Mode production:**
```bash
npm start
```

Le serveur démarre sur `http://localhost:3000`

## API Endpoints

### Users
- `GET /api/users` - Lister tous les users
- `POST /api/user` - Créer/obtenir un user
  ```json
  { "pseudo": "Tojo" }
  ```

### Tasks
- `GET /api/tasks` - Lister toutes les tâches
- `GET /api/tasks/user/:userId` - Tâches d'un user
- `POST /api/tasks` - Créer une tâche
  ```json
  { "titre": "...", "importance": 3, "userId": "..." }
  ```
- `PUT /api/tasks/:id` - Marquer comme complétée
  ```json
  { "completedBy": "userId" }
  ```
- `DELETE /api/tasks/:id` - Supprimer une tâche

### Stats
- `GET /api/stats/weekly` - Stats hebdomadaires
- `GET /api/stats/user/:userId` - Stats d'un user
- `GET /api/stats/chart/:userId` - Données graphiques (7 jours)

## Health Check
- `GET /health` - Vérifier si le serveur fonctionne
