const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Export data to file
  exportData: async (data, filename) => {
    return await ipcRenderer.invoke('export-data', data, filename);
  },
  
  // Import data from file
  importData: async () => {
    return await ipcRenderer.invoke('import-data');
  },
  
  // Platform info
  platform: process.platform,
  
  // App version
  version: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node
  }
});
