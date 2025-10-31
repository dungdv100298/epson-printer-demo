const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const PrinterService = require('../src/services/PrinterService');

let mainWindow;
const printerService = new PrinterService();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Set the main window for printer service
  printerService.setMainWindow(mainWindow);
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

// IPC handlers for printer operations
ipcMain.handle('get-printers', async () => {
  try {
    return await printerService.getAllPrinters();
  } catch (error) {
    console.error('Error getting printers:', error);
    throw error;
  }
});

ipcMain.handle('print-receipt', async (event, { printerId, receiptData }) => {
  try {
    return await printerService.printReceipt(printerId, receiptData);
  } catch (error) {
    console.error('Printing error:', error);
    throw error;
  }
});

// All printer logic has been moved to PrinterService