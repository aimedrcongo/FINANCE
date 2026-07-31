/**
 * =====================================================
 * PHARMA FINANCE PRO - AUTO-UPDATE MODULE
 * Gestion des mises à jour automatiques via GitHub Releases
 * =====================================================
 */

const AutoUpdater = {
    // Configuration
    config: {
        repo: 'ladivine/pharmafinance-pro',  // À modifier avec votre repo
        owner: 'ladivine',
        checkInterval: 3600000, // 1 heure en ms
        enabled: true
    },

    // État
    state: {
        isChecking: false,
        updateAvailable: false,
        downloadProgress: 0,
        currentVersion: null,
        newVersion: null
    },

    /**
     * Initialiser l'auto-updater
     */
    async init() {
        if (!this.config.enabled) {
            console.log('[AutoUpdate] Désactivé');
            return;
        }

        // Vérifier si on est dans Electron
        if (!window.electronAPI) {
            console.log('[AutoUpdate] Mode navigateur - auto-update non disponible');
            return;
        }

        try {
            const { autoUpdater } = window.electronAPI;
            
            if (!autoUpdater) {
                console.warn('[AutoUpdate] autoUpdater non disponible');
                return;
            }

            // Configuration
            autoUpdater.setFeedURL({
                provider: 'github',
                owner: this.config.owner,
                repo: this.config.repo.replace(`${this.config.owner}/`, '')
            });

            // Écouteurs d'événements
            this.setupEventListeners(autoUpdater);

            // Récupérer la version actuelle
            this.state.currentVersion = await window.electronAPI.getAppVersion();
            
            console.log(`[AutoUpdate] Version actuelle: ${this.state.currentVersion}`);

            // Première vérification après 10 secondes
            setTimeout(() => this.checkForUpdates(), 10000);

            // Vérification périodique
            setInterval(() => this.checkForUpdates(), this.config.checkInterval);

        } catch (error) {
            console.error('[AutoUpdate] Erreur initialisation:', error);
        }
    },

    /**
     * Configurer les écouteurs d'événements
     */
    setupEventListeners(autoUpdater) {
        // Mise à jour disponible
        autoUpdater.on('update-available', (info) => {
            console.log('[AutoUpdate] Mise à jour disponible:', info);
            this.state.updateAvailable = true;
            this.state.newVersion = info.version;
            this.showUpdateNotification(info);
        });

        // Mise à jour NON disponible
        autoUpdater.on('update-not-available', (info) => {
            console.log('[AutoUpdate] Application à jour:', info.version);
            this.state.updateAvailable = false;
        });

        // Téléchargement commencé
        autoUpdater.on('download-progress', (progressObj) => {
            let logMessage = `Téléchargement: ${Math.round(progressObj.percent)}%`;
            log_message += ` (${progressObj.transferred}/${progressObj.total})`;
            console.log('[AutoUpdate]', log_message);
            
            this.state.downloadProgress = Math.round(progressObj.percent);
            this.updateProgressBar(progressObj.percent);
        });

        // Téléchargement terminé
        autoUpdater.on('update-downloaded', (info) => {
            console.log('[AutoUpdate] Téléchargement terminé:', info);
            this.showInstallPrompt(info);
        });

        // Erreur
        autoUpdater.on('error', (err) => {
            console.error('[AutoUpdate] Erreur:', err);
            this.showErrorNotification(err);
        });
    },

    /**
     * Vérifier les mises à jour manuellement
     */
    async checkForUpdates() {
        if (this.state.isChecking) return;
        
        this.state.isChecking = true;
        
        try {
            console.log('[AutoUpdate] Vérification des mises à jour...');
            
            // Afficher indicateur dans UI
            this.showCheckingIndicator(true);

            const { autoUpdater } = window.electronAPI;
            await autoUpdater.checkForUpdates();

        } catch (error) {
            console.error('[AutoUpdate] Erreur vérification:', error);
        } finally {
            this.state.isChecking = false;
            this.showCheckingIndicator(false);
        }
    },

    /**
     * Forcer le téléchargement et installation
     */
    async downloadAndInstall() {
        try {
            const { autoUpdater } = window.electronAPI;
            await autoUpdater.downloadUpdate();
        } catch (error) {
            console.error('[AutoUpdate] Erreur téléchargement:', error);
        }
    },

    /**
     * Redémarrer et installer
     */
    quitAndInstall() {
        const { autoUpdater } = window.electronAPI;
        autoUpdater.quitAndInstall();
    },

    // ==================== UI NOTIFICATIONS ====================

    /**
     * Afficher notification de mise à jour disponible
     */
    showUpdateNotification(info) {
        // Créer une notification élégante
        const notification = document.createElement('div');
        notification.className = 'auto-update-notification';
        notification.innerHTML = `
            <div class="update-notification-content">
                <div class="update-icon">🚀</div>
                <div class="update-info">
                    <h4>Mise à jour disponible !</h4>
                    <p>Version <strong>${info.version}</strong> prête à être installée</p>
                    <p class="release-notes">${info.releaseNotes || 'Nouvelles fonctionnalités et corrections de bugs'}</p>
                </div>
                <div class="update-actions">
                    <button class="btn btn-primary" onclick="AutoUpdater.downloadAndInstall()">
                        📥 Télécharger maintenant
                    </button>
                    <button class="btn btn-secondary" onclick="this.closest('.auto-update-notification').remove()">
                        Plus tard
                    </button>
                </div>
            </div>
        `;

        // Ajouter au DOM
        document.body.appendChild(notification);

        // Animation d'entrée
        setTimeout(() => notification.classList.add('show'), 100);
    },

    /**
     * Afficher la barre de progression
     */
    updateProgressBar(percent) {
        let progressBar = document.getElementById('update-progress-bar');
        
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.id = 'update-progress-bar';
            progressBar.className = 'update-progress-container';
            progressBar.innerHTML = `
                <div class="progress-text">Mise à jour: <span id="update-percent">0</span>%</div>
                <div class="progress-bar">
                    <div class="progress-fill" id="update-fill"></div>
                </div>
            `;
            document.body.appendChild(progressBar);
        }

        document.getElementById('update-percent').textContent = Math.round(percent);
        document.getElementById('update-fill').style.width = `${percent}%`;
    },

    /**
     * Afficher prompt d'installation
     */
    showInstallPrompt(info) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'update-install-modal';
        modal.innerHTML = `
            <div class="modal-content update-modal">
                <div class="modal-header">
                    <h3>✅ Téléchargement terminé</h3>
                </div>
                <div class="modal-body">
                    <p>La version <strong>${info.version}</strong> a été téléchargée.</p>
                    <p>L'application doit redémarrer pour terminer l'installation.</p>
                    <div class="warning-box">
                        ⚠️ Sauvegardez votre travail avant de continuer.
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="document.getElementById('update-install-modal').remove()">
                        Plus tard (au prochain démarrage)
                    </button>
                    <button class="btn btn-primary" onclick="AutoUpdater.quitAndInstall()">
                        🔄 Redémarrer et installer
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    },

    /**
     * Afficher indicateur de vérification
     */
    showCheckingIndicator(show) {
        let indicator = document.getElementById('update-checking-indicator');
        
        if (show) {
            if (!indicator) {
                indicator = document.createElement('div');
                indicator.id = 'update-checking-indicator';
                indicator.className = 'update-checking-indicator';
                indicator.innerHTML = '🔄 Vérification des mises à jour...';
                document.querySelector('.app-header')?.appendChild(indicator) || 
                    document.body.appendChild(indicator);
            }
            indicator.style.display = 'block';
        } else if (indicator) {
            setTimeout(() => indicator.remove(), 2000);
        }
    },

    /**
     * Afficher erreur
     */
    showErrorNotification(error) {
        // Silencieux pour les erreurs réseau courantes
        if (error.message?.includes('network') || error.code === 'ERR_NETWORK') {
            console.log('[AutoUpdate] Pas de connexion réseau - vérification ignorée');
            return;
        }

        // Notification discrète en cas d'erreur réelle
        const toast = document.createElement('div');
        toast.className = 'toast toast-warning';
        toast.textContent = `Erreur de mise à jour: ${error.message}`;
        
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
    }
};

// ==================== STYLES CSS INJECTÉS ====================

const updateStyles = `
<style>
.auto-update-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    max-width: 420px;
    background: linear-gradient(135deg, #0A6E32 0%, #085a29 100%);
    color: white;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1);
    padding: 24px;
    z-index: 10000;
    transform: translateX(120%);
    transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.auto-update-notification.show {
    transform: translateX(0);
}

.update-notification-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.update-notification-content .update-icon {
    font-size: 48px;
    text-align: center;
    animation: bounce 1s infinite;
}

.update-notification-content h4 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
}

.update-notification-content p {
    margin: 4px 0;
    opacity: 0.9;
    font-size: 14px;
}

.release-notes {
    padding: 12px;
    background: rgba(255,255,255,0.1);
    border-radius: 8px;
    font-size: 13px !important;
}

.update-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
}

.update-actions .btn {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
}

.btn-primary {
    background: white;
    color: #0A6E32;
}

.btn-primary:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.btn-secondary {
    background: transparent;
    color: white;
    border: 1px solid rgba(255,255,255,0.3) !important;
}

.btn-secondary:hover {
    background: rgba(255,255,255,0.1);
}

/* Progress Bar */
.update-progress-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    left: 20px;
    max-width: 400px;
    margin: 0 auto;
    background: white;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.2);
    z-index: 10001;
}

.progress-text {
    font-size: 14px;
    color: #333;
    margin-bottom: 8px;
    font-weight: 500;
}

.progress-bar {
    height: 8px;
    background: #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #0A6E32, #28a745);
    border-radius: 4px;
    transition: width 0.3s ease;
    width: 0%;
}

/* Modal Installation */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10002;
    backdrop-filter: blur(4px);
}

.update-modal {
    background: white;
    border-radius: 20px;
    max-width: 450px;
    width: 90%;
    overflow: hidden;
    animation: slideUp 0.3s ease;
}

.modal-header {
    background: linear-gradient(135deg, #0A6E32, #28a745);
    color: white;
    padding: 20px 24px;
}

.modal-header h3 {
    margin: 0;
    font-size: 20px;
}

.modal-body {
    padding: 24px;
    color: #333;
}

.modal-body p {
    margin: 8px 0;
    line-height: 1.6;
}

.warning-box {
    background: #fff3cd;
    border: 1px solid #ffc107;
    border-radius: 8px;
    padding: 12px;
    margin-top: 16px;
    color: #856404;
    font-size: 14px;
}

.modal-footer {
    padding: 16px 24px;
    background: #f8f9fa;
    display: flex;
    gap: 12px;
    justify-content: flex-end;
}

/* Checking Indicator */
.update-checking-indicator {
    display: inline-block;
    margin-left: 16px;
    font-size: 13px;
    color: #666;
    animation: pulse 1.5s infinite;
}

@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}

@keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}
</style>
`;

// Injecter les styles
document.head.insertAdjacentHTML('beforeend', updateStyles);

// Export global
window.AutoUpdater = AutoUpdater;

// Initialisation automatique au chargement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AutoUpdater.init());
} else {
    AutoUpdater.init();
}
