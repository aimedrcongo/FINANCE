/**
 * =====================================================
 * LA DIVINE PHARMAFINANCE PRO v3.0 - INNOVATIONS AVANCÉES
 * Module 3: MODE SOMBRE / CLAIR (Dark/Light Theme)
 * 
 * Fonctionnalités:
 * - Toggle bouton avec animation lune/soleil
 * - Auto-détection préférence système
 * - Sauvegarde du choix utilisateur
 * - Transitions fluides CSS
 * - Support tous les composants
 * - Raccourci clavier Ctrl+Shift+D
 * =====================================================
 */

const DarkMode = {
    // Clés de stockage
    STORAGE_KEY: 'pharma_dark_mode',
    
    // État
    state: {
        isEnabled: false,
        isAuto: false,
        systemPreference: null,
        lastToggle: null
    },

    // ==========================================
    // INITIALISATION
    // ==========================================

    init() {
        console.log('[DarkMode] Initialisation du thème sombre/clair...');
        
        // Charger la préférence sauvegardée
        this.loadPreference();
        
        // Créer le toggle button
        this.createToggleButton();
        
        // Détecter la préférence système
        this.detectSystemPreference();
        
        // Appliquer le thème initial
        this.applyTheme(this.state.isEnabled);
        
        // Écouteurs d'événements
        this.setupListeners();

        console.log(`[DarkMode] ✅ Thème initialisé: ${this.state.isEnabled ? 'Sombre' : 'Clair'}`);
    },

    loadPreference() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved !== null) {
                const prefs = JSON.parse(saved);
                this.state.isEnabled = prefs.enabled || false;
                this.state.isAuto = prefs.auto || false;
            }
        } catch (e) {
            console.warn('[DarkMode] Erreur chargement préférence:', e);
            // Par défaut: clair
            this.state.isEnabled = false;
        }
    },

    savePreference() {
        const prefs = {
            enabled: this.state.isEnabled,
            auto: this.state.isAuto,
            systemPreference: this.state.systemPreference,
            lastToggled: new Date().toISOString()
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(prefs));
    },

    // ==========================================
    // DÉTECTION PRÉFÉRENCE SYSTÈME
    // ==========================================

    detectSystemPreference() {
        if (!window.matchMedia) return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        // Récupérer la valeur actuelle
        this.state.systemPreference = mediaQuery.matches ? 'dark' : 'light';

        // Écouter les changements
        mediaQuery.addEventListener('change', (e) => {
            this.state.systemPreference = e.matches ? 'dark' : 'light';
            
            // Si mode auto, appliquer automatiquement
            if (this.state.isAuto) {
                this.applyTheme(e.matches);
            }

            console.log(`[DarkMode] Préférence système changée: ${this.state.systemPreference}`);
        });

        // En mode auto, appliquer immédiatement la préférence système
        if (this.state.isAuto && !localStorage.getItem(this.STORAGE_KEY)) {
            this.state.isEnabled = this.state.systemPreference === 'dark';
        }
    },

    // ==========================================
    // TOGGLE BUTTON
    // ==========================================

    createToggleButton() {
        if (document.getElementById('dark-mode-toggle')) return;

        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'dark-mode-toggle';
        toggleBtn.className = 'dark-mode-toggle';
        toggleBtn.title = `Mode ${this.state.isEnabled ? 'Clair' : 'Sombre'} (Ctrl+Shift+D)`;
        toggleBtn.setAttribute('aria-label', 'Basculer thème sombre/clair');
        toggleBtn.innerHTML = `
            <span class="theme-icon sun">☀️</span>
            <span class="theme-icon moon" style="display: none;">🌙</span>
        `;

        toggleBtn.onclick = () => this.toggle();

        // Ajouter au header (à côté des autres boutons)
        const headerRight = document.querySelector('.header-right');
        if (headerRight) {
            headerRight.insertBefore(toggleBtn, headerRight.firstChild);
        } else {
            document.body.appendChild(toggleBtn);
        }

        // Mettre à jour l'état visuel
        this.updateToggleVisuals();
    },

    updateToggleVisuals() {
        const btn = document.getElementById('dark-mode-toggle');
        if (!btn) return;

        const sunIcon = btn.querySelector('.sun');
        const moonIcon = btn.querySelector('.moon');

        if (this.state.isEnabled) {
            btn.classList.add('dark');
            btn.title = 'Passer en mode Clair (Ctrl+Shift+D)';
            if (sunIcon) sunIcon.style.display = 'none';
            if (moonIcon) moonIcon.style.display = 'inline-block';
        } else {
            btn.classList.remove('dark');
            btn.title = 'Passer en mode Sombre (Ctrl+Shift+D)';
            if (sunIcon) sunIcon.style.display = 'inline-block';
            if (moonIcon) moonIcon.style.display = 'none';
        }
    },

    // ==========================================
    // TOGGLE DU THÈME
    // ==========================================

    toggle() {
        this.state.isEnabled = !this.state.isEnabled;
        this.state.lastToggle = new Date().toISOString();
        
        // Désactiver le mode auto si l'utilisateur force manuellement
        this.state.isAuto = false;

        // Appliquer le nouveau thème
        this.applyTheme(this.state.isEnabled);

        // Sauvegarder
        this.savePreference();

        // Mettre à jour le bouton
        this.updateToggleVisuals();

        // Feedback visuel
        this.showThemeChangeNotification();

        // Logger
        if (typeof authSystem !== 'undefined') {
            authSystem.logAction(
                'THEME_CHANGE',
                `Thème changé vers: ${this.state.isEnabled ? 'Sombre 🌙' : 'Clair ☀️'}`
            );
        }

        // Haptique (mobile)
        if (navigator.vibrate) {
            navigator.vibrate(20);
        }
    },

    applyTheme(isDark) {
        const root = document.documentElement;
        
        if (isDark) {
            root.classList.add('dark-mode');
            root.setAttribute('data-theme', 'dark');
            
            // Mettre à jour les meta tags
            this.updateMetaThemeColor('#1a1a2e');
            
            // Appliquer les variables CSS dark
            this.applyDarkCSSVariables();
        } else {
            root.classList.remove('dark-mode');
            root.setAttribute('data-theme', 'light');
            
            // Mettre à jour les meta tags
            this.updateMetaThemeColor('#0A6E32');
            
            // Retirer les variables CSS dark
            this.removeDarkCSSVariables();
        }

        // Notifier les composants du changement
        this.notifyComponents(isDark);
    },

    updateMetaThemeColor(color) {
        let metaTheme = document.querySelector('meta[name="theme-color"]');
        if (!metaTheme) {
            metaTheme = document.createElement('meta');
            metaTheme.name = 'theme-color';
            document.head.appendChild(metaTheme);
        }
        metaTheme.content = color;
    },

    // ==========================================
    // VARIABLES CSS DARK MODE
    // ==========================================

    applyDarkCSSVariables() {
        const root = document.documentElement;
        
        // Variables principales dark mode
        root.style.setProperty('--bg-primary', '#1a1a2e');
        root.style.setProperty('--bg-secondary', '#16213e');
        root.style.setProperty('--bg-dark', '#0f3460');
        root.style.setProperty('--text-primary', '#eaeaea');
        root.style.setProperty('--text-secondary', '#b8b8cc');
        root.style.setProperty('--text-muted', '#8888aa');
        
        // Couleurs adaptées
        root.style.setProperty('--gray-50', '#1e1e30');
        root.style.setProperty('--gray-100', '#252540');
        root.style.setProperty('--gray-200', '#303055');
        root.style.setProperty('--gray-300', '#454570');
        root.style.setProperty('--gray-400', '#606088');
        root.style.setProperty('--gray-500', '#8888aa');
        root.style.setProperty('--gray-600', '#9999bb');
        root.style.setProperty('--gray-700', '#aaaacc');
        root.style.setProperty('--gray-800', '#ccccee');
        root.style.setProperty('--gray-900', '#eeeeff');
        
        // Bordures
        root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.1)');
        
        // Ombres (plus légères en dark)
        root.style.setProperty('--shadow-sm', '0 2px 8px rgba(0, 0, 0, 0.3)');
        root.style.setProperty('--shadow-md', '0 4px 16px rgba(0, 0, 0, 0.4)');
        root.style.setProperty('--shadow-lg', '0 8px 24px rgba(0, 0, 0, 0.5)');
    },

    removeDarkCSSVariables() {
        const root = document.documentElement;
        
        // Retour aux valeurs par défaut (définies dans style.css)
        const varsToRemove = [
            '--bg-primary', '--bg-secondary', '--bg-dark',
            '--text-primary', '--text-secondary', '--text-muted',
            '--gray-50', '--gray-100', '--gray-200', '--gray-300',
            '--gray-400', '--gray-500', '--gray-600', '--gray-700',
            '--gray-800', '--gray-900', '--border-color',
            '--shadow-sm', '--shadow-md', '--shadow-lg'
        ];

        varsToRemove.forEach(varName => {
            root.style.removeProperty(varName);
        });
    },

    // ==========================================
    // NOTIFICATION DE CHANGEMENT
    // ==========================================

    showThemeChangeNotification() {
        // Créer un toast temporaire
        const toast = document.createElement('div');
        toast.className = 'theme-change-toast';
        toast.innerHTML = `
            <span class="theme-toast-icon">${this.state.isEnabled ? '🌙' : '☀️'}</span>
            <span>Mode ${this.state.isEnabled ? 'Sombre' : 'Clair'} activé</span>
        `;
        
        document.body.appendChild(toast);

        // Animation
        requestAnimationFrame(() => toast.classList.add('show'));

        // Auto-suppression
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 2000);
    },

    notifyComponents(isDark) {
        // Mettre à jour les composants qui ont besoin de savoir
        
        // Charts (si Chart.js est utilisé)
        if (typeof updateChartsForDarkMode === 'function') {
            updateChartsForDarkMode(isDark);
        }

        // Canvas/Canvas éléments spéciaux
        this.updateCanvases(isDark);
    },

    updateCanvases(isDark) {
        // Redessiner les canvas si nécessaire
        const canvases = document.querySelectorAll('canvas[data-dark-aware]');
        canvases.forEach(canvas => {
            if (canvas.redrawForTheme) {
                canvas.redrawForTheme(isDark);
            }
        });
    },

    // ==========================================
    // ÉCOUTEURS
    // ==========================================

    setupListeners() {
        // Raccourci clavier global
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                this.toggle();
            }
        });

        // Observer les changements de classe sur body pour debug
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    // Synchroniser si changement externe
                    const isDark = document.documentElement.classList.contains('dark-mode');
                    if (isDark !== this.state.isEnabled) {
                        this.state.isEnabled = isDark;
                        this.updateToggleVisuals();
                    }
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    },

    // ==========================================
    // MÉTHODES PUBLIQUES
    // ==========================================

    enable() {
        if (!this.state.isEnabled) {
            this.toggle();
        }
    },

    disable() {
        if (this.state.isEnabled) {
            this.toggle();
        }
    },

    setAuto(enabled) {
        this.state.isAuto = enabled;
        this.savePreference();
        
        if (enabled && window.matchMedia) {
            const isDarkSystem = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.state.isEnabled = isDarkSystem;
            this.applyTheme(isDarkSystem);
            this.updateToggleVisuals();
        }
    },

    getState() {
        return {
            enabled: this.state.isEnabled,
            auto: this.state.isAuto,
            systemPreference: this.state.systemPreference,
            lastToggle: this.state.lastToggle
        };
    },

    // Forcer un refresh complet du thème
    refresh() {
        this.applyTheme(this.state.isEnabled);
        this.updateToggleVisuals();
    }
};

// Export global
window.DarkMode = DarkMode;
