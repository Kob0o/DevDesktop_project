# ⚽ ScoutMaster – Cahier des charges

## 📝 Description
**ScoutMaster** est une application de bureau destinée aux passionnés de football souhaitant suivre les performances de joueurs professionnels, créer une équipe personnalisée, des fiches joueurs, ajouter des commentaires et gérer une liste de favoris

---

## 🚀 Objectifs
- Suivre des joueurs professionnels.
- Ajouter une ou plusieurs équipes
- Enregistrer des commentaires et notes personnelles.
- Organiser un classement personnel avec des favoris.

---

## 🛠️ Technologies utilisées

| Composant      | Technologie          |
|----------------|----------------------|
| Frontend       | React + Tailwind CSS |
| Backend        | Supabase             |
| Authentification | Supabase          |
| Application Desktop | ElectronJS     |
| Base de données | Supabase           |

---

## 🎯 Fonctionnalités principales

### 3.1 Authentification (2/2 pts)
- Connexion via Supabase Auth.

### 3.2 Gestion des joueurs (CRUD) (3/3 pts)
- Création, lecture, modification et suppression de fiches joueurs et équipes
- Ajout de notes/commentaires personnalisés.
- Classement personnel via favoris.

### 3.3 Crash Reporter (1/1 pt)
- Intégration d’un système de gestion des erreurs en production (ex : Sentry).

### 3.4 Interface utilisateur (1.5/2 pts)
- Écran de connexion.
- Liste des joueurs suivis.
- Liste des équipes créés
- Page de détail de chaque joueur avec :
  - Notes personnelles
- Interface soignée, fluide, avec design responsive.

### 3.5 Fonctionnalités Electron natives (3/3 pts)
- **Menu contextuel natif** (clic droit) avec options comme :
  - Boite de dialogue pour télécharger un pdf et modifier le nom etc
- **AutoLaunch** Lancement de l'application au démarrage de l'ordinateur
- **file system** Pour le téléchargement du PDF (avec fs)

### 3.6 APIs navigateur (1/3 pts)
- **Clipboard API** : copier rapidement des liens (profil, vidéo, fiche).
- (-2) : Manque API naviguateur

### 3.7 Installeur (2/2 pts)
- Création d’un installeur pour MAC (ex : `.dmg` via Electron Builder).

### 3.8 Publicatio Gestionnaire de paquets (0/2 pts)
- NOK

### 3.9 Fonctionnalités supplémentaires (2/2 pts)
- Toast pour les notifications de susccès ou d'échec
- Thème clair / sombre pour l’interface.

Total : 15/20pts

---

## 📦 Livraison
- Fichier `.exe` pour Windows via installeur NSIS.
- Distribution via gestionnaire de paquets (Scoop). -> NOK
- Export des données utilisateur localement (JSON, PDF). 

