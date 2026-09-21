import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Custom APIs for renderer
const api = {};

contextBridge.exposeInMainWorld('api', {
  ping: () => ipcRenderer.send('ping'),
  getCurrentEvent: () => ipcRenderer.invoke('get-current-event'),
  getHighScores: (minScore, event) => ipcRenderer.invoke('get-high-scores', minScore, event),
  addScores: (records) => ipcRenderer.invoke('add-scores', records),
  clearScores: () => ipcRenderer.invoke('clear-scores'),
  deleteScore: (id) => ipcRenderer.invoke('delete-score', id),
  onScoreUpdated: (callback) => {
    ipcRenderer.on('score-updated', (_event, data) => {
      callback(data);
    });
  },
  onEventChanged: (callback) => {
    ipcRenderer.on('event-changed', (_event, data) => {
      callback(data);
    });
  }
});

// Use `contextBridge` APIs to expose Electron APIs to renderer only if context isolation is enabled, otherwise just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = electronAPI;
  window.api = api;
}
