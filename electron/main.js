/**
 * =====================================================
 * PHARMA FINANCE PRO - ELECTRON MAIN PROCESS
 * Application Desktop Packagée (Windows/Mac/Linux)
 * =====================================================
 */

const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

// Garder une référence globale de l'objet window
let mainWindow;

// Configuration de l'application
const isDev = !app.isPackaged;

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
            webSecurity: true
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

// Créer le menu personnalisé
function createMenu() {
    const template = [
        {
            label: 'Fichier',
            submenu: [
                {
                    label: 'Exporter les Données',
                    accelerator: 'CmdOrCtrl+E',
                    click: () => mainWindow.webContents.send('menu-export')
                },
                {
                    label: 'Importer Backup',
                    accelerator: 'CmdOrCtrl+I',
                    click: () => mainWindow.webContents.send('menu-import')
                },
                { type: 'separator' },
                {
                    label: 'Imprimer',
                    accelerator: 'CmdOrCtrl+P',
                    click: () => mainWindow.webContents.print()
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

// IPC Handlers pour les opérations fichier
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
        fs.writeFileSync(result.filePath, JSON.stringify(data, null,2));
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

// App ready
app.whenReady().then(() => {
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
