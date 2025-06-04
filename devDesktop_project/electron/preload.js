const { contextBridge, ipcRenderer } = require('electron');

// Expose les fonctionnalités Electron à l'application React
contextBridge.exposeInMainWorld('electron', {
  // Gestion du clipboard
  copyToClipboard: (text) => ipcRenderer.invoke('copy-to-clipboard', text),
  
  // Gestion des fichiers
  saveFile: (content, filename) => ipcRenderer.invoke('save-file', { content, filename }),
  
  // Notifications
  showNotification: (title, body) => ipcRenderer.send('show-notification', { title, body }),
  
  // Événements
  onAddToFavorites: (callback) => ipcRenderer.on('add-to-favorites', callback),
  onOpenVideoProfile: (callback) => ipcRenderer.on('open-video-profile', callback),
}); 