const isElectron = window && window.process && window.process.type;

export const config = {
  isElectron,
  // Fonctions qui seront différentes selon le contexte
  saveFile: async (content, filename) => {
    if (isElectron) {
      // Utiliser l'API Electron
      return window.electron.saveFile({ content, filename });
    } else {
      // Version web : téléchargement direct
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
      return true;
    }
  },
  copyToClipboard: async (text) => {
    if (isElectron) {
      return window.electron.copyToClipboard(text);
    } else {
      return navigator.clipboard.writeText(text);
    }
  },
  showNotification: (title, body) => {
    if (isElectron) {
      window.electron.showNotification({ title, body });
    } else {
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
}; 