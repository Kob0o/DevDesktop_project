const { app, BrowserWindow, ipcMain, Menu, Tray, Notification, clipboard, dialog } = require('electron');
const path = require('path');
const fs = require('fs/promises');

let mainWindow;
let tray = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
  });

  // En développement, charge l'URL de développement Vite
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(
      path.resolve(__dirname, "..", "dist", "index.html")
    );
  }

  // Gestion des redirections OAuth
  mainWindow.webContents.on('will-navigate', (event, url) => {
    // Gérer les redirections OAuth
    if (url.includes('/auth/callback')) {
      event.preventDefault();
      mainWindow.loadURL(url);
    }
  });

  // Gérer les nouvelles fenêtres (pour l'authentification OAuth)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.includes('accounts.google.com')) {
      return { action: 'allow' };
    }
    return { action: 'deny' };
  });

  // Gestion du clipboard
  ipcMain.handle('copy-to-clipboard', async (event, text) => {
    await clipboard.writeText(text);
  });

  // Gestion du système de fichiers
  ipcMain.handle('save-file', async (event, { content, filename }) => {
    const { filePath } = await dialog.showSaveDialog({
      defaultPath: filename,
      filters: [
        { name: 'Text Files', extensions: ['txt'] },
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'PDF Files', extensions: ['pdf'] }
      ]
    });
    if (filePath) {
      await fs.writeFile(filePath, content);
      return true;
    }
    return false;
  });

  // Création du menu contextuel
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Ajouter aux favoris', click: () => mainWindow.webContents.send('add-to-favorites') },
    { label: 'Ouvrir profil vidéo', click: () => mainWindow.webContents.send('open-video-profile') },
    { type: 'separator' },
    { label: 'Quitter', click: () => app.quit() }
  ]);

  // Création du tray icon
  const iconPath = path.join(__dirname, '../public/icon.png');
  try {
    tray = new Tray(iconPath);
    tray.setToolTip('ScoutMaster');
    tray.setContextMenu(contextMenu);
  } catch (err) {
    console.error('Erreur lors de la création du tray icon:', err);
  }

  // Gestion des notifications système
  ipcMain.on('show-notification', (event, { title, body }) => {
    new Notification({ title, body }).show();
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
}); 