const { app, BrowserWindow, ipcMain, dialog, Tray, Menu } = require('electron');
const path = require('path');
const fs = require('fs/promises');

let mainWindow;
let tray = null;

function createTray() {
  const iconPath = path.join(__dirname, '..', 'public', 'icon.png');
  tray = new Tray(iconPath);
  
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: 'Afficher l\'application', 
      click: () => {
        if (mainWindow) {
          mainWindow.show();
        }
      }
    },
    { 
      label: 'Quitter', 
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setToolTip('ScoutMaster');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    }
  });
}

function createWindow() {
  console.log('Creating main window...');
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, '..', 'public', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  // En développement, charge l'URL de développement Vite
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.VITE_PORT || 5173;
    console.log(`Loading development URL: http://localhost:${port}`);
    mainWindow.loadURL(`http://localhost:${port}`);
    mainWindow.webContents.openDevTools();
  } else {
    // En production, charge le fichier index.html depuis le bon chemin
    const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
    console.log(`Loading production file: ${indexPath}`);
    mainWindow.loadFile(indexPath).catch(err => {
      console.error('Error loading index.html:', err);
      // Fallback au chemin alternatif si le premier échoue
      const altPath = path.join(process.resourcesPath, 'app.asar', 'dist', 'index.html');
      console.log(`Trying alternative path: ${altPath}`);
      mainWindow.loadFile(altPath).catch(err2 => {
        console.error('Error loading from alternative path:', err2);
      });
    });
  }

  // Gestion du système de fichiers
  ipcMain.handle('save-file', async (event, { content, filename }) => {
    try {
      const { filePath } = await dialog.showSaveDialog(mainWindow, {
        defaultPath: filename,
        filters: [
          { name: 'PDF Files', extensions: ['pdf'] }
        ]
      });

      if (filePath) {
        const buffer = Buffer.from(content);
        await fs.writeFile(filePath, buffer);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving file:', error);
      return false;
    }
  });

  // Gestion de la fermeture de la fenêtre
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      return false;
    }
    return true;
  });
}

// Configuration du lancement au démarrage pour macOS
function setAutoLaunch(enabled) {
  if (process.platform === 'darwin') {
    app.setLoginItemSettings({
      openAtLogin: enabled,
      name: 'ScoutMaster',
      path: app.getPath('exe'),
      args: []
    });
  }
}

app.whenReady().then(() => {
  console.log('App is ready, creating window...');
  createWindow();
  createTray();
  setAutoLaunch(true);
}).catch(error => {
  console.error('Error during app initialization:', error);
});

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

// Gestion de la fermeture propre de l'application
app.on('before-quit', () => {
  app.isQuitting = true;
}); 