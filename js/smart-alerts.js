/**
 * =====================================================
 * LA DIVINE PHARMAFINANCE PRO v3.0 - INNOVATIONS AVANCÉES
 * Module 2: ALERTES PROACTIVES
 * 
 * Fonctionnalités:
 * - Alertes dettes échéance J-7, J-3, J-0
 * - Détection baisse anormale ventes >30%
 * - Rappel automatique 19h pour rapports
 * - Système de notifications avec badges
 * - Historique des alertes
 * - Son et vibration (mobile)
 * =====================================================
 */

const SmartAlerts = {
    // Configuration
    config: {
        checkInterval: 60000, // Vérification chaque minute
        eveningReminderHour: 19, // Rappel à 19h
        debtAlertDays: [7, 3, 0], // J-7, J-3, J-0 pour dettes
        salesDropThreshold: 30, // Seuil alerte baisse ventes (%)
        maxAlertsStored: 200,
        soundEnabled: true,
        notificationEnabled: true
    },

    // État
    state: {
        alerts: [],
        lastCheck: null,
        lastEveningCheck: null,
        isRunning: false,
        unreadCount: 0
    },

    // ==========================================
    // INITIALISATION
    // ==========================================

    async init() {
        console.log('[SmartAlerts] Initialisation du système d\'alertes proactives...');
        
        // Charger les alertes sauvegardées
        this.loadAlerts();
        
        // Créer le panneau de notifications
        this.createNotificationPanel();
        
        // Démarrer la surveillance
        this.startMonitoring();
        
        // Configurer les écouteurs
        this.setupListeners();

        console.log('[SmartAlerts] ✅ Système d\'alertes actif');
    },

    loadAlerts() {
        try {
            const stored = localStorage.getItem('pharma_smart_alerts');
            if (stored) {
                this.state.alerts = JSON.parse(stored);
                this.updateUnreadCount();
            }
        } catch (e) {
            console.warn('[SmartAlerts] Erreur chargement:', e);
            this.state.alerts = [];
        }
    },

    saveAlerts() {
        try {
            // Garder seulement les N dernières alertes
            const trimmed = this.state.alerts.slice(0, this.config.maxAlertsStored);
            localStorage.setItem('pharma_smart_alerts', JSON.stringify(trimmed));
        } catch (e) {
            console.error('[SmartAlerts] Erreur sauvegarde:', e);
        }
    },

    // ==========================================
    // PANNEAU DE NOTIFICATIONS
    // ==========================================

    createNotificationPanel() {
        if (document.getElementById('notification-panel')) return;

        const panel = document.createElement('div');
        panel.id = 'notification-panel';
        panel.className = 'notification-panel';
        panel.innerHTML = `
            <!-- Bouton cloche -->
            <button class="notification-bell" id="notification-bell" onclick="SmartAlerts.togglePanel()" title="Alertes & Notifications">
                <span class="bell-icon">🔔</span>
                <span class="notification-badge" id="alert-badge" style="display: none;">0</span>
            </button>

            <!-- Panneau déroulant -->
            <div class="notification-dropdown" id="notification-dropdown">
                <div class="notification-header">
                    <h4>🔔 Alertes Proactives</h4>
                    <div class="notification-actions">
                        <button onclick="SmartAlerts.markAllRead()" title="Tout marquer lu">✓ Tout lire</button>
                        <button onclick="SmartAlerts.clearAll()" title="Effacer tout">🗑️</button>
                    </div>
                </div>
                
                <div class="notification-filters">
                    <button class="filter-btn active" data-filter="all" onclick="SmartAlerts.filterAlerts('all')">Toutes</button>
                    <button class="filter-btn" data-filter="critical" onclick="SmartAlerts.filterAlerts('critical')">🚨 Critiques</button>
                    <button class="filter-btn" data-filter="warning" onclick="SmartAlerts.filterAlerts('warning')">⚠️ Avertissements</button>
                    <button class="filter-btn" data-filter="info" onclick="SmartAlerts.filterAlerts('info')">ℹ️ Infos</button>
                </div>

                <div class="notification-list" id="notification-list">
                    <!-- Alertes injectées ici -->
                </div>

                <div class="notification-footer">
                    <small>Dernière vérification: <span id="last-check-time">--</span></small>
                </div>
            </div>
        `;

        document.body.appendChild(panel);

        // Afficher les alertes existantes
        this.renderAlerts();
    },

    togglePanel() {
        const panel = document.getElementById('notification-panel');
        const dropdown = document.getElementById('notification-dropdown');
        
        panel.classList.toggle('open');

        if (panel.classList.contains('open')) {
            // Marquer comme lues à l'ouverture
            setTimeout(() => this.markAllRead(), 2000);
        }
    },

    closePanel() {
        const panel = document.getElementById('notification-panel');
        if (panel) panel.classList.remove('open');
    },

    renderAlerts(filter = 'all') {
        const list = document.getElementById('notification-list');
        if (!list) return;

        let filteredAlerts = [...this.state.alerts];

        if (filter !== 'all') {
            filteredAlerts = filteredAlerts.filter(a => a.severity === filter);
        }

        if (filteredAlerts.length === 0) {
            list.innerHTML = `
                <div class="no-alerts">
                    <span class="no-alerts-icon">✅</span>
                    <p>Aucune alerte</p>
                    <small>Tout va bien!</small>
                </div>
            `;
            return;
        }

        list.innerHTML = filteredAlerts.map(alert => `
            <div class="alert-item ${alert.severity} ${alert.read ? 'read' : 'unread'}" data-id="${alert.id}">
                <div class="alert-icon">${this.getSeverityIcon(alert.type)}</div>
                <div class="alert-content">
                    <div class="alert-title">${alert.title}</div>
                    <div class="alert-message">${alert.message}</div>
                    <div class="alert-time">${this.formatTime(alert.timestamp)}</div>
                </div>
                <button class="alert-dismiss" onclick="SmartAlerts.dismissAlert('${alert.id}')" title="Ignorer">×</button>
            </div>
        `).join('');
    },

    filterAlerts(filter) {
        // Mettre à jour les boutons filtre
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        this.renderAlerts(filter);
    },

    getSeverityIcon(type) {
        const icons = {
            'debt_due': '🏦',
            'debt_overdue': '🚨',
            'sales_drop': '📉',
            'evening_reminder': '🌙',
            'report_missing': '📝',
            'anomaly': '⚠️',
            'success': '✅'
        };
        return icons[type] || 'ℹ️';
    },

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        // Moins d'une minute
        if (diff < 60000) return "À l'instant";
        // Moins d'une heure
        if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} min`;
        // Aujourd'hui
        if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        }
        // Hier
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return "Hier " + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        }
        // Plus ancien
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    },

    // ==========================================
    // GESTION DES ALERTES
    // ==========================================

    addAlert(type, title, message, severity = 'warning', data = {}) {
        const alert = {
            id: 'alert_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            type,
            title,
            message,
            severity, // critical, warning, info
            timestamp: new Date().toISOString(),
            read: false,
            dismissed: false,
            data
        };

        // Ajouter au début
        this.state.alerts.unshift(alert);

        // Limiter le nombre d'alertes
        if (this.state.alerts.length > this.config.maxAlertsStored) {
            this.state.alerts = this.state.alerts.slice(0, this.config.maxAlertsStored);
        }

        // Sauvegarder
        this.saveAlerts();

        // Mettre à jour l'UI
        this.updateUnreadCount();
        this.renderAlerts();

        // Notification sonore/visuelle
        if (!data.silent) {
            this.triggerNotification(alert);
        }

        // Logger
        if (typeof authSystem !== 'undefined') {
            authSystem.logAction(`ALERT_${type.toUpperCase()}`, `${title}: ${message}`);
        }

        return alert;
    },

    dismissAlert(id) {
        const alert = this.state.alerts.find(a => a.id === id);
        if (alert) {
            alert.dismissed = true;
            alert.read = true;
            this.saveAlerts();
            this.renderAlerts();
            this.updateUnreadCount();
        }
    },

    markAllRead() {
        this.state.alerts.forEach(alert => alert.read = true);
        this.saveAlerts();
        this.updateUnreadCount();
        this.renderAlerts();
    },

    clearAll() {
        if (confirm('Voulez-vous vraiment effacer toutes les alertes?')) {
            this.state.alerts = [];
            this.saveAlerts();
            this.updateUnreadCount();
            this.renderAlerts();
        }
    },

    updateUnreadCount() {
        const unread = this.state.alerts.filter(a => !a.read).length;
        this.state.unreadCount = unread;

        const badge = document.getElementById('alert-badge');
        if (badge) {
            badge.textContent = unread > 99 ? '99+' : unread;
            badge.style.display = unread > 0 ? 'flex' : 'none';
        }
    },

    // ==========================================
    // NOTIFICATIONS SONORES/VISUELLES
    // ==========================================

    triggerNotification(alert) {
        // Son
        if (this.config.soundEnabled) {
            this.playSound(alert.severity);
        }

        // Vibration (mobile)
        if (navigator.vibrate) {
            switch (alert.severity) {
                case 'critical':
                    navigator.vibrate([500, 200, 500, 200, 500]);
                    break;
                case 'warning':
                    navigator.vibrate([300, 100, 300]);
                    break;
                default:
                    navigator.vibrate(100);
            }
        }

        // Notification navigateur (si permise)
        if (this.config.notificationEnabled && 'Notification' in window && Notification.permission === 'granted') {
            this.showBrowserNotification(alert);
        }
    },

    playSound(severity) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Fréquence selon sévérité
            switch (severity) {
                case 'critical':
                    oscillator.frequency.value = 800; // Aigu
                    gainNode.gain.value = 0.3;
                    break;
                case 'warning':
                    oscillator.frequency.value = 523; // Do moyen
                    gainNode.gain.value = 0.2;
                    break;
                default:
                    oscillator.frequency.value = 440; // La
                    gainNode.gain.value = 0.15;
            }

            oscillator.start();
            
            // Arrêter après un court moment
            setTimeout(() => {
                oscillator.stop();
                audioContext.close();
            }, severity === 'critical' ? 400 : 200);

        } catch (e) {
            // Audio non supporté, ignorer silencieusement
        }
    },

    showBrowserNotification(alert) {
        try {
            const notification = new Notification(alert.title, {
                body: alert.message,
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-72x72.png',
                tag: alert.id,
                requireInteraction: alert.severity === 'critical'
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
                this.togglePanel();
            };

            // Auto-fermeture après 10 secondes sauf critiques
            if (alert.severity !== 'critical') {
                setTimeout(() => notification.close(), 10000);
            }
        } catch (e) {
            console.log('[SmartAlerts] Notification navigateur bloquée');
        }
    },

    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                console.log('[SmartAlerts] Permission notifications:', permission);
            });
        }
    },

    // ==========================================
    // SURVEILLANCE ET VÉRIFICATIONS
    // ==========================================

    startMonitoring() {
        if (this.state.isRunning) return;

        this.state.isRunning = true;

        // Vérification immédiate
        this.runAllChecks();

        // Vérification périodique
        setInterval(() => {
            this.runAllChecks();
        }, this.config.checkInterval);

        // Demander permission notifications
        this.requestNotificationPermission();

        console.log('[SmartAlerts] Surveillance démarrée (toutes les', this.config.checkInterval / 1000, 'secondes)');
    },

    async runAllChecks() {
        try {
            await this.checkDebtDeadlines();
            await this.checkSalesAnomalies();
            await this.checkEveningReminder();
            
            this.state.lastCheck = new Date().toISOString();
            this.updateLastCheckTime();
        } catch (error) {
            console.error('[SmartAlerts] Erreur vérifications:', error);
        }
    },

    updateLastCheckTime() {
        const el = document.getElementById('last-check-time');
        if (el) {
            el.textContent = new Date().toLocaleTimeString('fr-FR');
        }
    },

    // ==========================================
    // VÉRIFICATION 1: ÉCHÉANCES DETTES
    // ==========================================

    async checkDebtDeadlines() {
        try {
            const dettes = await DB.dettes_fournisseurs.getAll();
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            dettes.forEach(dette => {
                if (!dette.date_echeance) return;

                const echeance = new Date(dette.date_echeance);
                echeance.setHours(0, 0, 0, 0);

                const diffDays = Math.ceil((echeance - today) / (1000 * 60 * 60 * 24));

                // Alerte J-7
                if (diffDays === 7 && this.config.debtAlertDays.includes(7)) {
                    this.addAlert(
                        'debt_due',
                        `💰 Dette en approche (J-7)`,
                        `${dette.fournisseur} - ${this.formatCurrency(dette.montant_restant)} restant`,
                        'warning',
                        { detteId: dette.id, daysLeft: 7 }
                    );
                }

                // Alerte J-3
                if (diffDays === 3 && this.config.debtAlertDays.includes(3)) {
                    this.addAlert(
                        'debt_due',
                        `🏦 Dette imminente (J-3)!`,
                        `${dette.fournisseur} - ${this.formatCurrency(dette.montant_restant)} à payer`,
                        'critical',
                        { detteId: dette.id, daysLeft: 3 }
                    );
                }

                // Alerte J-0 (échéance aujourd'hui)
                if (diffDays <= 0 && diffDays >= -3 && this.config.debtAlertDays.includes(0)) {
                    const isOverdue = diffDays < 0;
                    
                    this.addAlert(
                        isOverdue ? 'debt_overdue' : 'debt_due',
                        isOverdue ? `🚨 DETTE EN RETARD! (-${Math.abs(diffDays)}j)` : `📅 Échéance aujourd'hui!`,
                        `${dette.fournisseur} - ${this.formatCurrency(dette.montant_restant)}`,
                        'critical',
                        { detteId: dette.id, overdueDays: Math.abs(diffDays) },
                        { silent: isOverdue && diffDays < -1 } // Pas de son si déjà notifié
                    );
                }
            });
        } catch (error) {
            console.error('[SmartAlerts] Erreur vérification dettes:', error);
        }
    },

    // ==========================================
    // VÉRIFICATION 2: BAISSSE ANORMALE VENTES
    // ==========================================

    async checkSalesAnomalies() {
        try {
            const rapports = await DB.rapports_journaliers.getAll();
            
            if (rapports.length < 7) return; // Besoin d'au moins 7 jours de données

            // Grouper par pharmacie
            const byPharmacy = {};
            rapports.forEach(r => {
                if (!byPharmacy[r.pharmacy_id]) byPharmacy[r.pharmacy_id] = [];
                byPharmacy[r.pharmacy_id].push(r);
            });

            // Analyser chaque pharmacie
            Object.entries(byPharmacy).forEach(([pharmacyId, reports]) => {
                // Trier par date
                reports.sort((a, b) => new Date(b.date) - new Date(a.date));

                // Moyenne des 7 derniers jours
                const last7 = reports.slice(0, 7);
                const avgLast7 = last7.reduce((sum, r) => sum + (r.total_cahier || 0), 0) / 7;

                // Moyenne des 7 jours précédents
                const prev7 = reports.slice(7, 14);
                if (prev7.length < 5) return; // Pas assez de données historiques

                const avgPrev7 = prev7.reduce((sum, r) => sum + (r.total_cahier || 0), 0) / prev7.length;

                // Calculer la variation
                if (avgPrev7 > 0) {
                    const dropPercent = ((avgPrev7 - avgLast7) / avgPrev7) * 100;

                    if (dropPercent > this.config.salesDropThreshold) {
                        // Vérifier si on a déjà alerté récemment pour cette pharmacie
                        const recentAlert = this.state.alerts.find(a => 
                            a.type === 'sales_drop' && 
                            a.data?.pharmacyId === pharmacyId &&
                            (Date.now() - new Date(a.timestamp).getTime()) < 86400000 // 24h
                        );

                        if (!recentAlert) {
                            this.addAlert(
                                'sales_drop',
                                `📉 Baisse anormale détectée!`,
                                `Pharmacie ${pharmacyId}: -${dropPercent.toFixed(1)}% vs semaine précédente`,
                                'warning',
                                { pharmacyId, dropPercent, avgLast7, avgPrev7 }
                            );
                        }
                    }
                }
            });
        } catch (error) {
            console.error('[SmartAlerts] Erreur vérification ventes:', error);
        }
    },

    // ==========================================
    // VÉRIFICATION 3: RAPPEL SOIR 19H
    // ==========================================

    async checkEveningReminder() {
        const now = new Date();
        const currentHour = now.getHours();
        const today = now.toDateString();

        // Vérifier si on est autour de 19h (entre 19h et 20h)
        if (currentHour >= 19 && currentHour < 20) {
            // Ne pas envoyer plusieurs fois le même jour
            if (this.state.lastEveningCheck === today) return;

            this.state.lastEveningCheck = today;

            // Vérifier si un rapport existe pour aujourd'hui
            const todayStart = new Date(today);
            const todayEnd = new Date(today);
            todayEnd.setHours(23, 59, 59, 999);

            try {
                const rapports = await DB.rapports_journaliers.getAll();
                const todaysReports = rapports.filter(r => {
                    const reportDate = new Date(r.date);
                    return reportDate >= todayStart && reportDate <= todayEnd;
                });

                // Si pas de rapport ou rapport incomplet
                if (todaysReports.length === 0) {
                    this.addAlert(
                        'evening_reminder',
                        `🌙 Rapport journalier manquant!`,
                        `N'oubliez pas d'entrer le rapport de caisse d'aujourd'hui avant de partir.`,
                        'warning',
                        {},
                        { silent: false }
                    );

                    // Notification spéciale plus visible
                    this.showEveningReminderModal();
                } else {
                    // Rapport existant - confirmation positive
                    this.addAlert(
                        'success',
                        `✅ Rapport du jour enregistré!`,
                        `Merci! Le rapport d'aujourd'hui a bien été saisi.`,
                        'info',
                        {},
                        { silent: true }
                    );
                }
            } catch (error) {
                console.error('[SmartAlerts] Erreur rappel soir:', error);
            }
        }
    },

    showEveningReminderModal() {
        // Vérifier si un modal n'est pas déjà affiché
        if (document.getElementById('evening-reminder-modal')) return;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay evening-modal';
        modal.id = 'evening-reminder-modal';
        modal.innerHTML = `
            <div class="modal-content evening-content">
                <div class="evening-header">
                    <span class="evening-moon">🌙</span>
                    <h3>Rappel de Fin de Journée</h3>
                </div>
                <div class="evening-body">
                    <p>Bonsoir! Il est temps de faire votre <strong>rapport journalier</strong>.</p>
                    <p class="evening-subtitle">Cela ne prend que 2 minutes avec le Quick Add!</p>
                    <div class="evening-actions">
                        <button class="btn btn-primary" onclick="
                            SmartAdd.openForm('rapport');
                            document.getElementById('evening-reminder-modal').remove();
                        ">
                            💰 Faire le rapport maintenant
                        </button>
                        <button class="btn btn-secondary" onclick="document.getElementById('evening-reminder-modal').remove()">
                            ⏰ Plus tard
                        </button>
                        <button class="btn btn-text" onclick="document.getElementById('evening-reminder-modal').remove()">
                            ✅ Déjà fait
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        requestAnimationFrame(() => modal.classList.add('active'));

        // Auto-suppression après 5 minutes
        setTimeout(() => {
            if (document.body.contains(modal)) {
                modal.remove();
            }
        }, 300000);
    },

    // ==========================================
    // UTILITAIRES
    // ==========================================

    formatCurrency(amount) {
        if (!amount) return '0 FC';
        if (amount >= 1000000) {
            return (amount / 1000000).toFixed(1) + 'M FC';
        } else if (amount >= 1000) {
            return (amount / 1000).toFixed(0) + 'K FC';
        }
        return amount.toLocaleString('fr-FR') + ' FC';
    },

    setupListeners() {
        // Fermer le panneau en cliquant ailleurs
        document.addEventListener('click', (e) => {
            const panel = document.getElementById('notification-panel');
            if (panel && !panel.contains(e.target)) {
                this.closePanel();
            }
        });

        // Raccourci clavier
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') {
                e.preventDefault();
                this.togglePanel();
            }
        });
    },

    // ==========================================
    // STATISTIQUES (pour dashboard)
    // ==========================================

    getStats() {
        const now = new Date();
        const today = now.toDateString();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        return {
            total: this.state.alerts.length,
            unread: this.state.unreadCount,
            critical: this.state.alerts.filter(a => a.severity === 'critical' && !a.read).length,
            warning: this.state.alerts.filter(a => a.severity === 'warning' && !a.read).length,
            info: this.state.alerts.filter(a => a.severity === 'info' && !a.read).length,
            today: this.state.alerts.filter(a => new Date(a.timestamp).toDateString() === today).length,
            thisWeek: this.state.alerts.filter(a => new Date(a.timestamp) >= weekAgo).length
        };
    },

    // Export des alertes
    exportAlerts() {
        const csvContent = [
            ['Date', 'Type', 'Titre', 'Message', 'Sévérité', 'Lue'].join(';'),
            ...this.state.alerts.map(a => [
                new Date(a.timestamp).toLocaleString('fr-FR'),
                a.type,
                `"${a.title}"`,
                `"${a.message}"`,
                a.severity,
                a.read ? 'Oui' : 'Non'
            ].join(';'))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `alertes-ladivine-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    }
};

// Export global
window.SmartAlerts = SmartAlerts;
