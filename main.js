const { app, BrowserWindow } = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // В режиме разработки загружаем локальный сервер Next.js.
  // В собранном приложении - статический HTML файл. (Для этого нужно будет настроить next export)
  // Пока что, для простоты, будем всегда ориентироваться на dev-сервер.
  win.loadURL(
    isDev
      ? 'http://localhost:9002'
      : 'http://localhost:9002' // В реальном приложении здесь будет `file://${path.join(__dirname, '../build/index.html')}`
  );

  if (isDev) {
    win.webContents.openDevTools();
  }
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
