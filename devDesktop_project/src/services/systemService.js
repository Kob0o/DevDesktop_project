// Importation conditionnelle d'Electron
let ipcRenderer;
try {
  ipcRenderer = window.require('electron').ipcRenderer;
} catch (error) {
  // Fallback pour le développement
  ipcRenderer = {
    invoke: async () => false,
    send: () => {},
  };
}

// Gestion des notifications
export function showNotification(title, body) {
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification(title, { body });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, { body });
        }
      });
    }
  }
}

// Gestion du clipboard
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Erreur lors de la copie dans le presse-papier:', error);
    return false;
  }
}

// Gestion du système de fichiers
export async function saveFile(content, filename) {
  try {
    const result = await ipcRenderer.invoke('save-file', { content, filename });
    return result;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du fichier:', error);
    return false;
  }
}

// Gestion du menu contextuel
export function setupContextMenu(playerId, playerName) {
  const handleContextMenu = (e) => {
    e.preventDefault();
    ipcRenderer.send('show-context-menu', { playerId, playerName });
  };

  document.addEventListener('contextmenu', handleContextMenu);
  return () => document.removeEventListener('contextmenu', handleContextMenu);
}

// Gestion du thème
export function toggleDarkMode() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('darkMode', isDark);
  return isDark;
}

export function initDarkMode() {
  const isDark = localStorage.getItem('darkMode') === 'true' ||
    (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  if (isDark) {
    document.documentElement.classList.add('dark');
  }
  return isDark;
}

// Gestion des mises à jour automatiques
export function checkForUpdates() {
  ipcRenderer.send('check-for-updates');
}

// Gestion des raccourcis clavier
export function setupKeyboardShortcuts() {
  const handleKeyPress = (e) => {
    // Ctrl/Cmd + S pour sauvegarder
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      ipcRenderer.send('save-current');
    }
    // Ctrl/Cmd + F pour rechercher
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      ipcRenderer.send('focus-search');
    }
  };

  document.addEventListener('keydown', handleKeyPress);
  return () => document.removeEventListener('keydown', handleKeyPress);
} 