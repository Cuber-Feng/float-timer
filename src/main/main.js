import { app, shell, BrowserWindow, ipcMain, Menu } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import ElectronStore from 'electron-store';
import * as db from './db.js';
import { createAppMenu } from './menu/appMenu.js';
import { createMenuHandlers } from './menu/menuHandlers.js';
import { createStatsWindow } from './windows/statsWindow.js';
import { windowSize, setWindowSize } from './config.js';

app.setName('Float Timer');

let mainWindow = null;
let statsWindow = null;

const store = new (ElectronStore.default || ElectronStore)();

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 334,
    height: 261,
    x: 10,
    y: 50,
    show: false,
    transparent: false,
    frame: true,
    autoHideMenuBar: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/preload.js'),
      sandbox: false
    }
  });
  // 从 store 读取历史配置（带上默认值以防空值）
  const savedOpacity = store.get('opacity', 1.0);
  const savedAlwaysOnTop = store.get('alwaysOnTop', false);
  const currentEvent = store.get('lastEvent', '3x3');
  // 关键步骤：在窗口刚创建时，立即主动应用这些设置！
  mainWindow.setOpacity(savedOpacity);
  mainWindow.setAlwaysOnTop(savedAlwaysOnTop);
  setWindowSize(mainWindow, currentEvent);
  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

function setAppMenu() {
  console.log('Main | start set app menu');
  const currentOpacity = store.get('opacity', 0.8);
  const currentAlwaysOnTop = store.get('alwaysOnTop', false);
  const currentEvent = store.get('lastEvent', '3x3');
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setOpacity(currentOpacity);
    mainWindow.setAlwaysOnTop(currentAlwaysOnTop);
  }
  // The menu
  console.log('Main | start create menu handlers');
  const manuHandlers = createMenuHandlers({
    mainWindow,
    getStatsWindow: () => statsWindow,
    store,
    db
  });
  createAppMenu({
    currentAlwaysOnTop,
    currentOpacity,
    currentEvent,
    ...manuHandlers
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.disableHardwareAcceleration();

app.whenReady().then(() => {
  db.initDB(); // 初始化数据库
  console.log(
    'Main | Database initialized successfully. ',
    db.getTotalCount(),
    ' records in total.'
  );

  app.setAboutPanelOptions({
    applicationName: 'Float Timer',
    applicationVersion: app.getVersion(),
    copyright: 'Copyright © 2026 Cody Feng, All rights reserved.',
    authors: ['Cody Feng (2017FENG35)']
  });

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // 3. 在 whenReady 内部挂载 IPC 监听
  ipcMain.on('ping', () => console.log('Main | IPC Test: pong'));

  ipcMain.handle('get-high-scores', (event, minScore, event_name) => {
    return db.getHighScores(minScore, event_name);
  });

  ipcMain.handle('get-current-event', () => {
    return store.get('lastEvent', '3x3');
  });

  ipcMain.handle('add-scores', (event, records) => {
    db.addScores(records);
    console.log(`Main | ipcMain.handle('add-scores')`);
    if (statsWindow && !statsWindow.isDestroyed()) {
      statsWindow.webContents.send('score-updated', { type: 'add' });
    }
    mainWindow.webContents.send('score-updated', { type: 'add' });
    return { success: true };
  });

  ipcMain.handle('clear-scores', (event) => {
    db.clearScores();
    console.log('Main | All scores cleared.');
    mainWindow.webContents.send('score-updated', { type: 'clear' });
    return { success: true };
  });

  ipcMain.handle('delete-score', (event, id) => {
    db.deleteScore(id);
    mainWindow.webContents.send('score-updated', { type: 'delete' });
    return { success: true };
  });

  createWindow();
  statsWindow = createStatsWindow(() => {
    statsWindow = null;
  });
  setAppMenu();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  app.quit();
});
