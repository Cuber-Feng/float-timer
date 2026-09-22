import { BrowserWindow } from 'electron';
import { is } from '@electron-toolkit/utils';
import { join } from 'path';

export function createStatsWindow(onClosed) {
  const statsWindow = new BrowserWindow({
    width: 670,
    height: 600,
    show: false,
    frame: true,
    webPreferences: {
      preload: join(__dirname, '../preload/preload.js'),
      sandbox: false
    }
  });
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    statsWindow.loadURL(new URL('stats.html', process.env['ELECTRON_RENDERER_URL']).toString());
  } else {
    statsWindow.loadFile(join(__dirname, '../renderer/stats.html'));
  }
  statsWindow.on('closed', onClosed);
  return statsWindow;
}

export function toggleStatsWindow(statsWindow) {
  if (statsWindow.isVisible()) {
    statsWindow.hide();
    console.log('statsWindow | hide');
  } else {
    statsWindow.show();
    console.log('statsWindow | show');
  }
  return statsWindow;
}
