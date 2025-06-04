const { contextBridge, ipcRenderer } = require('electron');

// Fonction utilitaire pour logger les erreurs
function logError(operation, error) {
  console.error(`Error in ${operation}:`, error);
}

// Fonction utilitaire pour wrapper les appels IPC avec gestion d'erreur
function safeIpcInvoke(channel, ...args) {
  try {
    return ipcRenderer.invoke(channel, ...args);
  } catch (error) {
    logError(`IPC invoke ${channel}`, error);
    throw error;
  }
}

// Fonction utilitaire pour wrapper les événements IPC avec gestion d'erreur
function safeIpcOn(channel, callback) {
  try {
    const wrappedCallback = (event, ...args) => {
      try {
        callback(...args);
      } catch (error) {
        logError(`IPC callback ${channel}`, error);
      }
    };
    ipcRenderer.on(channel, wrappedCallback);
    return () => ipcRenderer.removeListener(channel, wrappedCallback);
  } catch (error) {
    logError(`IPC on ${channel}`, error);
    return () => {};
  }
}

// Expose les fonctionnalités natives au processus de rendu
contextBridge.exposeInMainWorld('electron', {
  // Fonctionnalités existantes
  copyToClipboard: (text) => safeIpcInvoke('copy-to-clipboard', text),
  saveFile: (content, filename) => ipcRenderer.invoke('save-file', { content, filename }),
  showNotification: (options) => {
    try {
      ipcRenderer.send('show-notification', options);
    } catch (error) {
      logError('showNotification', error);
    }
  },
  showContextMenu: (options) => {
    try {
      ipcRenderer.send('show-context-menu', options);
    } catch (error) {
      logError('showContextMenu', error);
    }
  },
  
  // Service en arrière-plan
  startBackgroundService: () => safeIpcInvoke('start-background-service'),
  stopBackgroundService: () => safeIpcInvoke('stop-background-service'),
  
  // Événements
  onBackgroundServiceTick: (callback) => safeIpcOn('background-service-tick', callback),
  onAddToFavorites: (callback) => safeIpcOn('add-to-favorites', callback),
  onViewPlayerDetails: (callback) => safeIpcOn('view-player-details', callback),
  onDeletePlayer: (callback) => safeIpcOn('delete-player', callback)
}); 