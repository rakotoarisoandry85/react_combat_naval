const { app, BrowserWindow } = require('electron');
const path = require('path');

const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Naval Combat',
    icon: path.join(__dirname, '../src/assets/splash1.png'), // ou .ico
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true, // cache la barre de menu
  });

  if (isDev) {
    // Mode développement → Vite
    win.loadURL('http://localhost:5173');
    // win.webContents.openDevTools(); // décommente pour debug
  } else {
    // Mode production → fichiers buildés
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});