/**
 * =====================================================
 * PHARMA FINANCE PRO - PRELOAD SCRIPT
 * Bridge sécurisé entre Main et Renderer Process
 * =====================================================
 */

const { contextBridge, ipcRenderer } = require('electron');

// Exposer les API sécurisées au processus renderer
contextBridge.exposeInMainWorld('electronAPI', {
    // ==================== AUTO-UPDATER ====================
    checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
    downloadUpdate: () => ipcRenderer.invoke('download-update'),
    quitAndInstall: () => ipcRenderer.invoke('quit-and-install'),

    // Écouteurs d'événements update
    onUpdateAvailable: (callback) => {
        ipcRenderer.on('update-available', (event, info) => callback(info));
    },
    onUpdateNotAvailable: (callback) => {
        ipcRenderer.on('update-not-available', (event, info) => callback(info));
    },
    onDownloadProgress: (callback) => {
        ipcRenderer.on('download-progress', (event, progress) => callback(progress));
    },
    onUpdateDownloaded: (callback) => {
        ipcRenderer.on('update-downloaded', (event, info) => callback(info));
    },
    onUpdateError: (callback) => {
        ipcRenderer.on('update-error', (event, error) => callback(error));
    },

    // ==================== FICHIERS ====================
    exportData: (data) => ipcRenderer.invoke('export-data', data),
    importData: () => ipcRenderer.invoke('import-data'),
    saveFile: (params) => ipcRenderer.invoke('save-file', params),

    // ==================== APP INFO ====================
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    getAppPath: () => ipcRenderer.invoke('get-app-path'),

    // ==================== MENU EVENTS ====================
    onMenuExport: (callback) => {
        ipcRenderer.removeAllListeners('menu-export');
        ipcRenderer.on('menu-export', () => callback());
    },
    onMenuImport: (callback) => {
        ipcRenderer.removeAllListeners('menu-import');
        ipcRenderer.on('menu-import', () => callback());
    }
});

console.log('[Preload] Electron API exposed to renderer');
