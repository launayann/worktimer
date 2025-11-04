# WorkTimer

Application de suivi du temps de travail par catégorie avec statistiques visuelles..

## Fonctionnalités

- ⏱️ Chronomètre avec start/pause/stop
- 📁 Gestion de catégories personnalisables
- 📊 Statistiques hebdomadaires avec graphiques
- 📈 Statistiques mensuelles avec graphiques
- 🔔 Notifications pour sessions longues (2h d'affilée, 4h par jour)
- 📱 PWA installable sur mobile et desktop
- 🔄 Synchronisation des données en temps réel

## Stack technique

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Realtime)
- **Graphiques**: Recharts
- **PWA**: next-pwa
- **Déploiement**: Vercel

## Installation et configuration

### 1. Cloner le projet

```bash
git clone <votre-repo>
cd App-Temps-Travail
npm install
```

### 2. Configurer Supabase

1. Créez un compte sur [Supabase](https://supabase.com)
2. Créez un nouveau projet
3. Allez dans l'éditeur SQL et exécutez le contenu de `supabase-schema.sql`
4. Récupérez vos clés API dans Settings > API

### 3. Configuration des variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon_supabase
```

### 4. Générer les icônes PWA

Pour convertir l'icône SVG en PNG, vous pouvez utiliser un outil comme ImageMagick ou un convertisseur en ligne :

```bash
# Avec ImageMagick (si installé)
convert public/icon.svg -resize 192x192 public/icon-192.png
convert public/icon.svg -resize 512x512 public/icon-512.png
```

Ou utilisez un service en ligne comme [CloudConvert](https://cloudconvert.com/svg-to-png).

### 5. Lancer le projet en développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`.

## Déploiement sur Vercel

### 1. Préparer le repository Git

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/votre-username/worktimer.git
git push -u origin main
```

### 2. Déployer sur Vercel

1. Allez sur [Vercel](https://vercel.com)
2. Cliquez sur "New Project"
3. Importez votre repository GitHub
4. Ajoutez les variables d'environnement :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Cliquez sur "Deploy"

Vercel va automatiquement détecter Next.js et configurer le build.

## Structure du projet

```
/
├── app/                    # Pages Next.js (App Router)
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Page d'accueil
│   └── globals.css        # Styles globaux
├── components/            # Composants React
│   ├── Timer.tsx          # Chronomètre
│   ├── TimerWidget.tsx    # Widget collapsible
│   ├── CategoryManager.tsx # Gestion des catégories
│   ├── WeeklyStats.tsx    # Stats hebdomadaires
│   └── MonthlyStats.tsx   # Stats mensuelles
├── lib/                   # Utilitaires
│   ├── supabase.ts        # Client Supabase
│   ├── stats.ts           # Calculs statistiques
│   └── hooks/             # Custom React hooks
│       ├── useCategories.ts
│       └── useSessions.ts
├── types/                 # Types TypeScript
│   └── database.ts        # Types Supabase
├── public/                # Fichiers statiques
│   ├── manifest.json      # Manifest PWA
│   └── icon.svg           # Icône de l'app
└── supabase-schema.sql   # Schéma de base de données

## Utilisation

### Créer une catégorie

1. Allez dans l'onglet "Catégories"
2. Cliquez sur "+ Ajouter"
3. Entrez le nom et choisissez une couleur
4. Cliquez sur "Créer"

### Démarrer une session de travail

1. Dans l'onglet "Chronomètre"
2. Sélectionnez une catégorie
3. Cliquez sur "Démarrer"
4. Utilisez "Pause" pour faire une pause
5. Cliquez sur "Arrêter" pour terminer la session

### Consulter les statistiques

- **Hebdomadaires**: Onglet "Hebdomadaire" - Vue de la semaine en cours avec navigation
- **Mensuelles**: Onglet "Mensuel" - Vue du mois en cours avec graphiques détaillés

## Notifications

L'application demande la permission d'envoyer des notifications pour :
- Vous alerter après 2h de travail ininterrompu
- Vous rappeler après 4h de travail total dans la journée

## PWA

L'application peut être installée sur votre appareil :
- **Desktop**: Cliquez sur l'icône "Installer" dans la barre d'adresse
- **Mobile**: Menu > "Ajouter à l'écran d'accueil"

## Support

Pour toute question ou problème, ouvrez une issue sur GitHub.

## Licence

MIT
