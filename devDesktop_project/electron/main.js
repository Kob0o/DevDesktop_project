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
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
  });

  // En développement, charge l'URL de développement Vite
  if (process.env.NODE_ENV === 'development') {
    console.log('Mode développement : Chargement de http://localhost:5173');
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // En production, charge le fichier HTML construit
    const indexPath = path.join(__dirname, '../dist/index.html');
    console.log('Mode production : Tentative de chargement de', indexPath);
    
    // Vérifier si le fichier existe
    fs.access(indexPath)
      .then(() => {
        console.log('Fichier index.html trouvé');
        mainWindow.loadFile(indexPath).catch(err => {
          console.error('Erreur lors du chargement de index.html:', err);
          dialog.showErrorBox(
            'Erreur de chargement',
            `Impossible de charger l'application.\nChemin recherché: ${indexPath}\nErreur: ${err.message}`
          );
        });
      })
      .catch(err => {
        console.error('Fichier index.html non trouvé:', err);
        dialog.showErrorBox(
          'Erreur de chargement',
          `Le fichier index.html est introuvable.\nChemin recherché: ${indexPath}\nErreur: ${err.message}`
        );
      });
  }

  // Création du menu contextuel
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Ajouter aux favoris', click: () => mainWindow.webContents.send('add-to-favorites') },
    { label: 'Ouvrir profil vidéo', click: () => mainWindow.webContents.send('open-video-profile') },
    { type: 'separator' },
    { label: 'Quitter', click: () => app.quit() }
  ]);

  // Création du tray icon
  const iconPath = path.join(__dirname, '../public/icon.png');
  console.log('Chemin de l\'icône:', iconPath);
  
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
}

// Attendre que l'application soit prête
app.whenReady().then(() => {
  console.log('Application prête, création de la fenêtre...');
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
}); 