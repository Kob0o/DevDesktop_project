Nom : ScoutMaster / Permet à un utilisateur de suivre des joueurs de
football professionnels. L'objectif est de pouvoir créer une base de données
personnalisée avec des fiches joueurs, ajouter des notes personnelles,
consulter leurs statistiques via une API externe, et construire son propre
classement. L'application utilise l'authentification Google via Supabase, et
intègre des fonctionnalités système natives (notifications, menu contextuel,
etc.) ainsi que plusieurs APIs navigateur.


## Fonctionnalités

- Authentification via Google
- Gestion des joueurs (ajout, modification, suppression)
- Système de favoris
- Notes personnelles
- Statistiques des joueurs
- Thème clair/sombre
- Notifications système
- Export des données
- Menu contextuel
- Recherche de joueurs

## Technologies utilisées

- React
- Electron
- Tailwind CSS
- Supabase

📝 Cahier des charges – Application ScoutMaster
1. Objectif
Développer une application de bureau destinée à des passionnés de football, leur
permettant de :
Suivre des joueurs professionnels.
Enregistrer des commentaires personnels.
Organiser un classement personnel (favoris).
2. Technologies
Frontend : React + tailwind
Backend / Authentification : Supabase (base de données)
Application bureau : ElectronJS
Base de données : Supabase
3. Fonctionnalités principales
3.1 Authentification (2 pts)
Authentification Supabase.
3.2 CRUD (3 pts)
Création, lecture, mise à jour et suppression de fiches joueurs personnalisées.
Ajout de notes/commentaires sur chaque joueur.
Création d'un classement personnel.
3.3 Crash Reporter (1 pt)
Intégration d'un système de crash reporter pour gérer les erreurs en production (ex :
via Sentry).
3.4 Interface utilisateur (2 pts)
Écran de connexion.
Page de liste des joueurs suivis.
Page de détail pour chaque joueur (avec statistiques et section de commentaires).
Interface soignée et fluide.
3.5 Fonctionnalités Electron natives (3 pts)
Menu contextuel natif sur clic droit (ex : "ajouter au top 10", "ouvrir profil vidéo").
Service en arrière-plan vérifiant automatiquement si un joueur a joué récemment.
Icône dans la barre système (accès rapide aux favoris).
3.6 APIs navigateur (3 pts)
Utilisation de 3 APIs système compatibles navigateur :
Notifications API
Pour envoyer des rappels ou des alertes (ex : un joueur a joué aujourd'hui, pensez à le noter).
Clipboard API
Permet à l'utilisateur de copier rapidement un lien de profil joueur, une vidéo ou une fiche
d'analyse.
File System Access API
Pour permettre l'export d'une fiche joueur personnalisée (en .txt, .json, ou .pdf) vers le disque
local.
3.7 Installeur (2 pts)
Génération d'un installeur pour la plateforme de développement (ex : .exe via
electron-builder + NSIS).
3.8 Publication (2 pts)
Publication sur un gestionnaire de paquets adapté (ex : Scoop pour Windows).
3.9 Fonctionnalités supplémentaires (2 pts)
Export de la fiche d'un joueur en PDF.
Ajout d'un thème clair/sombre.