// Importation conditionnelle d'Electron
let electron;
try {
  electron = window.electron;
  console.log('Electron API disponible');
} catch (error) {
  console.warn('Electron non disponible, utilisation du mode web:', error);
}

// Gestion des notifications
export async function showNotification(title, body) {
  try {
    if (electron) {
      electron.showNotification({ title, body });
    } else {
      // Fallback pour le web
      if (Notification.permission === 'granted') {
        new Notification(title, { body });
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification(title, { body });
        }
      }
    }
  } catch (error) {
    console.error('Erreur lors de l\'affichage de la notification:', error);
  }
}

// Gestion du clipboard
export async function copyToClipboard(text) {
  try {
    if (electron) {
      await electron.copyToClipboard(text);
    } else {
      await navigator.clipboard.writeText(text);
    }
    return true;
  } catch (error) {
    console.error('Erreur lors de la copie:', error);
    return false;
  }
}

// Gestion des fichiers
export async function saveFile(content, filename) {
  try {
    if (electron) {
      // Convertir le Blob en ArrayBuffer
      const arrayBuffer = await content.arrayBuffer();
      
      // Convertir en Uint8Array
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Convertir en array normal pour la transmission
      const normalArray = Array.from(uint8Array);
      
      return await electron.saveFile(normalArray, filename);
    } else {
      // Fallback pour le web
      const blob = new Blob([content], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return true;
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du fichier:', error);
    return false;
  }
}

// Gestion du menu contextuel
export function setupContextMenu(playerId, playerName) {
  try {
    if (electron) {
      electron.showContextMenu({ playerId, playerName });
    }
  } catch (error) {
    console.error('Erreur lors de l\'affichage du menu contextuel:', error);
  }
}

// Alias pour la compatibilité
export const showContextMenu = setupContextMenu;

// Gestion du service en arrière-plan
export function startBackgroundService() {
  try {
    if (electron) {
      electron.startBackgroundService();
    }
  } catch (error) {
    console.error('Erreur lors du démarrage du service en arrière-plan:', error);
  }
}

export function stopBackgroundService() {
  try {
    if (electron) {
      electron.stopBackgroundService();
    }
  } catch (error) {
    console.error('Erreur lors de l\'arrêt du service en arrière-plan:', error);
  }
}

// Gestion des événements
export function setupEventListeners() {
  try {
    if (electron) {
      // Service en arrière-plan
      electron.onBackgroundServiceTick((data) => {
        console.log('Background service tick:', data);
      });

      // Favoris
      electron.onAddToFavorites((playerId) => {
        console.log('Player added to favorites:', playerId);
      });

      // Détails du joueur
      electron.onViewPlayerDetails((playerId) => {
        console.log('View player details:', playerId);
      });

      // Suppression du joueur
      electron.onDeletePlayer((playerId) => {
        console.log('Delete player:', playerId);
      });
    }
  } catch (error) {
    console.error('Erreur lors de la configuration des écouteurs d\'événements:', error);
  }
}

// Initialisation
export function init() {
  try {
    console.log('Initialisation du service système...');
    setupEventListeners();
    startBackgroundService();
    console.log('Service système initialisé avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation du service système:', error);
  }
}

// Gestion du thème
export function toggleDarkMode() {
  try {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', isDark);
    return isDark;
  } catch (error) {
    console.error('Erreur lors du changement de thème:', error);
    return false;
  }
}

export function initDarkMode() {
  try {
    const isDark = localStorage.getItem('darkMode') === 'true' ||
      (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
    return isDark;
  } catch (error) {
    console.error('Erreur lors de l\'initialisation du thème:', error);
    return false;
  }
}

// Gestion des mises à jour automatiques
export function checkForUpdates() {
  if (electron.checkForUpdates) {
    electron.checkForUpdates();
  }
}

// Gestion des raccourcis clavier
export function setupKeyboardShortcuts() {
  try {
    const handleKeyPress = (e) => {
      // Ctrl/Cmd + S pour sauvegarder
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (electron?.saveCurrent) {
          electron.saveCurrent();
        }
      }
      // Ctrl/Cmd + F pour rechercher
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        if (electron?.focusSearch) {
          electron.focusSearch();
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  } catch (error) {
    console.error('Erreur lors de la configuration des raccourcis clavier:', error);
    return () => {};
  }
} 