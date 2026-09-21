import { toggleStatsWindow } from '../windows/statsWindow.js';
import { windowSize, setWindowSize } from '../config.js';

export function createMenuHandlers({ mainWindow, getStatsWindow, store, db }) {
  function handleUpdateOpacity(menuItem) {
    const value = parseFloat(menuItem.label) / 100;
    store.set('opacity', value);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setOpacity(value);
    }
  }
  function handleSwitchEvent(cubeEvent) {
    store.set('lastEvent', cubeEvent);
    mainWindow.webContents.send('event-changed', { event: cubeEvent });
    setWindowSize(mainWindow, cubeEvent);
    const statsWindow = getStatsWindow();
    if (statsWindow) {
      statsWindow.webContents.send('event-changed', { event: cubeEvent });
    }
    console.log('Main | event:', cubeEvent);
  }
  function handleAlwaysOnTop(menuItem) {
    if (mainWindow) {
      mainWindow.setAlwaysOnTop(menuItem.checked);
      store.set('alwaysOnTop', menuItem.checked);
    }
  }
  function handleToggleStats() {
    toggleStatsWindow(getStatsWindow());
  }
  function handleClearAll() {
    db.clearScores();
    console.log('Main | All scores cleared.');
    mainWindow.reload();
  }

  return {
    handleUpdateOpacity,
    handleSwitchEvent,
    handleAlwaysOnTop,
    handleToggleStats,
    handleClearAll
  };
}
