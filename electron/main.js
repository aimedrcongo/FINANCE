/**
 * =====================================================
 * PHARMA FINANCE PRO - ELECTRON MAIN PROCESS
 * Application Desktop Packagée (Windows/Mac/Linux)
 * AVEC AUTO-UPDATE VIA GITHUB RELEASES
 * =====================================================
 */

const { app, BrowserWindow, ipcMain, dialog, shell, Menu, powerMonitor } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

// Garder une référence globale de l'objet window
let mainWindow;

// Configuration de l'application
const isDev = !app.isPackaged;

// =====================================================
// AUTO-UPDATER CONFIGURATION
// =====================================================
autoUpdater.autoDownload = false; // Téléchargement manuel (contrôle utilisateur)
autoUpdater.autoInstallOnAppQuit = true; // Installer à la fermeture si téléchargé
autoUpdater.allowDowngrade = false;
autoUpdater.allowPrerelease = false;

function setupAutoUpdater() {
    // Mise à jour disponible
    autoUpdater.on('update-available', (info) => {
        console.log('[AutoUpdate] Update available:', info.version);
        
        if (mainWindow) {
            mainWindow.webContents.send('update-available', {
                version: info.version,
                releaseDate: info.releaseDate,
                releaseNotes: info.releaseNotes
            });
        }
    });

    // Pas de mise à jour
    autoUpdater.on('update-not-available', (info) => {
        console.log('[AutoUpdate] No update available:', info.version);
        
        if (mainWindow) {
            mainWindow.webContents.send('update-not-available', {
                version: info.version
            });
        }
    });

    // Progression du téléchargement
    autoUpdater.on('download-progress', (progressObj) => {
        const logMessage = `Download speed: ${Math.round(progressObj.bytesPerSecond / 1024)} KB/s\n`;
        logMessage += `Downloaded: ${Math.round(progressObj.percent)}%`;
        logMessage += ` (${progressObj.transferred}/${progressObj.total})`;
        console.log('[AutoUpdate]', logMessage);
        
        if (mainWindow) {
            mainWindow.webContents.send('download-progress', progressObj);
        }
    });

    // Téléchargement terminé
    autoUpdater.on('update-downloaded', (info) => {
        console.log('[AutoUpdate] Update downloaded:', info.version);
        
        if (mainWindow) {
            mainWindow.webContents.send('update-downloaded', {
                version: info.version
            });
        }
    });

    // Erreur
    autoUpdater.on('error', (err) => {
        console.error('[AutoUpdate] Error:', err);
        
        if (mainWindow) {
            mainWindow.webContents.send('update-error', {
                message: err.message,
                code: err.code
            });
        }
    });
}

/**
 * Créer la fenêtre principale
 */
function createWindow() {
    // Créer la fenêtre du navigateur
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1024,
        minHeight: 700,
        title: 'LA DIVINE PharmaFinance Pro',
        icon: path.join(__dirname, '../icons/icon-256x256.png') || path.join(__dirname, '../icons/icon-512x512.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            webSecurity: true,
            preload: path.join(__dirname, 'preload.js')
        },
        frame: true,
        titleBarStyle: 'default',
        backgroundColor: '#0A6E32',
        show: false // Afficher quand prêt
    });

    // Charger l'application
    const startUrl = isDev 
        ? 'http://localhost:8080' 
        : `file://${path.join(__dirname, '../index.html')}`;

    mainWindow.loadURL(startUrl);

    // Afficher la fenêtre quand elle est prête
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        
        // En mode développement, ouvrir DevTools
        if (isDev) {
            mainWindow.webContents.openDevTools();
        }

        // Vérifier les mises à jour après affichage (uniquement en production)
        if (!isDev) {
            setTimeout(() => {
                console.log('[AutoUpdate] Checking for updates...');
                autoUpdater.checkForUpdates().catch(err => {
                    console.log('[AutoUpdate] Initial check failed:', err.message);
                });
            }, 5000); // 5 secondes après le démarrage
        }
    });

    // Ouvrir les liens externes dans le navigateur par défaut
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    // Gérer la fermeture
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Créer le menu application
    createMenu();
}

// =====================================================
// PRELOAD SCRIPT - API SÉCURISÉE POUR LE RENDERER
// =====================================================

/**
 * Créer le script preload s'il n'existe pas
 */
function createPreloadScript() {
    const preloadPath = path.join(__dirname, 'preload.js');
    
    if (!fs.existsSync(preloadPath)) {
        const preloadContent = `
const { contextBridge, ipcRenderer } = require('electron');

// Exposer les API sécurisées au processus renderer
contextBridge.exposeInMainWorld('electronAPI', {
    // Auto-updater
    checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
    downloadUpdate: () => ipcRenderer.invoke('download-update'),
    quitAndInstall: () => ipcRenderer.invoke('quit-and-install'),
    
    // Fichiers
    exportData: (data) => ipcRenderer.invoke('export-data', data),
    importData: () => ipcRenderer.invoke('import-data'),
    saveFile: (params) => ipcRenderer.invoke('save-file', params),
    
    // App info
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    getAppPath: () => ipcRenderer.invoke('get-app-path'),
    
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
    
    // Menu events
    onMenuExport: (callback) => {
        ipcRenderer.on('menu-export', () => callback());
    },
    onMenuImport: (callback) => {
        ipcRenderer.on('menu-import', () => callback());
    }
});
`;
        fs.writeFileSync(preloadPath, preloadContent, 'utf-8');
        console.log('[Main] Preload script created');
    }
}

// Créer le menu personnalisé
function createMenu() {
    const template = [
        {
            label: 'Fichier',
            submenu: [
                {
                    label: 'Exporter les Données',
                    accelerator: 'CmdOrCtrl+E',
                    click: () => mainWindow?.webContents.send('menu-export')
                },
                {
                    label: 'Importer Backup',
                    accelerator: 'CmdOrCtrl+I',
                    click: () => mainWindow?.webContents.send('menu-import')
                },
                { type: 'separator' },
                {
                    label: 'Imprimer',
                    accelerator: 'CmdOrCtrl+P',
                    click: () => mainWindow?.webContents.print()
                },
                { type: 'separator' },
                {
                    label: 'Quitter',
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Alt+F4',
                    click: () => app.quit()
                }
            ]
        },
        {
            label: 'Édition',
            submenu: [
                { label: 'Annuler', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
                { label: 'Rétablir', accelerator: 'CmdOrCtrl+Y', role: 'redo' },
                { type: 'separator' },
                { label: 'Couper', accelerator: 'CmdOrCtrl+X', role: 'cut' },
                { label: 'Copier', accelerator: 'CmdOrCtrl+C', role: 'copy' },
                { label: 'Coller', accelerator: 'CmdOrCtrl+V', role: 'paste' }
            ]
        },
        {
            label: 'Affichage',
            submenu: [
                { label: 'Actualiser', accelerator: 'F5', role: 'reload' },
                { label: 'Forcer Actualiser', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
                { label: 'Zoom Avant', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
                { label: 'Zoom Arrière', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
                { label: 'Réinitialiser Zoom', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
                { type: 'separator' },
                { label: 'Plein Écran', accelerator: 'F11', role: 'togglefullscreen' },
                { label: 'Outils Développeur', accelerator: 'F12', role: 'toggleDevTools' }
            ]
        },
        {
            label: 'Aide',
            submenu: [
                {
                    label: '🔄 Vérifier les mises à jour...',
                    click: async () => {
                        try {
                            await autoUpdater.checkForUpdates();
                            dialog.showMessageBox(mainWindow, {
                                type: 'info',
                                title: 'Mise à jour',
                                message: 'Vérification des mises à jour en cours...',
                                detail: 'Une notification apparaîtra si une mise à jour est disponible.'
                            });
                        } catch (err) {
                            dialog.showErrorBox('Erreur', `Impossible de vérifier: ${err.message}`);
                        }
                    }
                },
                { type: 'separator' },
                {
                    label: 'Documentation',
                    click: () => shell.openExternal('https://ladivine-pharma.com/docs')
                },
                {
                    label: 'Support Technique',
                    click: () => shell.openExternal('https://ladivine-pharma.com/support')
                },
                { type: 'separator' },
                {
                    label: 'À propos de LA DIVINE PharmaFinance',
                    click: () => showAboutDialog()
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// Boîte de dialogue "À propos"
function showAboutDialog() {
    dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'À propos',
        message: 'LA DIVINE PharmaFinance Pro',
        detail: `Version: ${app.getVersion()}\n\n` +
                'Gestion Financière Multi-sites\n' +
                'Pharmacie LA DIVINE Health Care\n\n' +
                '© 2024 Tous droits réservés\n\n' +
                'Application développée pour la gestion\n' +
                'financière des 8 pharmacies LA DIVINE.',
        buttons: ['Fermer']
    });
}

// =====================================================
// IPC HANDLERS
// =====================================================

// Auto-updater handlers
ipcMain.handle('check-for-updates', async () => {
    try {
        return await autoUpdater.checkForUpdates();
    } catch (error) {
        throw error;
    }
});

ipcMain.handle('download-update', async () => {
    try {
        return await autoUpdater.downloadUpdate();
    } catch (error) {
        throw error;
    }
});

ipcMain.handle('quit-and-install', () => {
    autoUpdater.quitAndInstall();
});

// Export/Import handlers
ipcMain.handle('export-data', async (event, data) => {
    const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Exporter les données',
        defaultPath: `pharmafinance-export-${new Date().toISOString().split('T')[0]}.json`,
        filters: [
            { name: 'JSON', extensions: ['json'] },
            { name: 'CSV', extensions: ['csv'] },
            { name: 'Tous les fichiers', extensions: ['*'] }
        ]
    });

    if (!result.canceled && result.filePath) {
        fs.writeFileSync(result.filePath, JSON.stringify(data, null, 2));
        return { success: true, path: result.filePath };
    }
    return { success: false };
});

ipcMain.handle('import-data', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        title: 'Importer un backup',
        filters: [
            { name: 'JSON', extensions: ['json'] },
            { name: 'Tous les fichiers', extensions: ['*'] }
        ],
        properties: ['openFile']
    });

    if (!result.canceled && result.filePaths.length > 0) {
        const data = fs.readFileSync(result.filePaths[0], 'utf-8');
        return { success: true, data: JSON.parse(data) };
    }
    return { success: false };
});

ipcMain.handle('save-file', async (event, { content, filename }) => {
    const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Sauvegarder le fichier',
        defaultPath: filename,
        filters: [
            { name: filename.split('.').pop().toUpperCase(), extensions: [filename.split('.').pop()] },
            { name: 'Tous les fichiers', extensions: ['*'] }
        ]
    });

    if (!result.canceled && result.filePath) {
        fs.writeFileSync(result.filePath, content);
        return { success: true, path: result.filePath };
    }
    return { success: false };
});

ipcMain.handle('get-app-version', () => {
    return app.getVersion();
});

ipcMain.handle('get-app-path', () => {
    return app.getAppPath();
});

// =====================================================
// APP LIFECYCLE
// =====================================================

// App ready
app.whenReady().then(() => {
    // Créer le preload script
    createPreloadScript();
    
    // Configurer l'auto-updater
    setupAutoUpdater();

    // Créer la fenêtre
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quitter quand toutes les fenêtres sont fermées (sauf sur macOS)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Sécurité : empêcher nouvelle création de fenêtre
app.on('web-contents-created', (event, contents) => {
    contents.on('new-window', (event, navigationUrl) => {
        event.preventDefault();
        shell.openExternal(navigationUrl);
    });
});

// Gestion de la mise en veille/réveil pour re-vérifier les mises à jour
powerMonitor.on('resume', () => {
    if (!isDev && mainWindow) {
        console.log('[AutoUpdate] System resumed - checking for updates...');
        setTimeout(() => {
            autoUpdater.checkForUpdates().catch(() => {});
        }, 10000); // 10 secondes après le réveil
    }
});

console.log(`[Main] LA DIVINE PharmaFinance Pro v${app.getVersion()} starting...`);
console.log(`[Main] Mode: ${isDev ? 'Development' : 'Production'}`);
