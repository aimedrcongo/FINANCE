/**
 * ============================================
 * PharmaFinance LA DIVINE - Module Innovations
 * Quick Add, Alertes Intelligentes, Dark Mode
 * Score de Santé, Animations
 * ============================================
 */

const Innovations = {
    
    // === ÉTAT DES INNOVATIONS ===
    state: {
        fabOpen: false,
        alertsOpen: false,
        alerts: [],
        dismissedAlerts: [],
        theme: localStorage.getItem('pharmafinance-theme') || 'light',
        lastPharmacyId: null,
        healthScores: {}
    },

    // ==========================================
    // 1. QUICK ADD (Bouton Flottant)
    // ==========================================

    initQuickAdd() {
        // Créer le FAB container
        const fab = document.createElement('div');
        fab.className = 'fab-container';
        fab.id = 'fab-container';
        fab.innerHTML = `
            <div class="fab-options">
                <button class="fab-option" onclick="Innovations.quickVersement()" title="Nouveau Versement">
                    💰
                    <span class="fab-label">Versement</span>
                </button>
                <button class="fab-option" onclick="Innovations.quickDepense()" title="Nouvelle Dépense">
                    📤
                    <span class="fab-label">Dépense</span>
                </button>
                <button class="fab-option" onclick="Innovations.quickRapport()" title="Rapport Journalier">
                    📝
                    <span class="fab-label">Rapport</span>
                </button>
                <button class="fab-option" onclick="Innovations.quickDette()" title="Nouvelle Dette">
                    🏦
                    <span class="fab-label">Dette</span>
                </button>
            </div>
            <button class="fab-main" id="fab-main" onclick="Innovations.toggleFAB()" title="Ajouter rapide">
                +
            </button>
        `;
        
        document.body.appendChild(fab);
        console.log('[Innovations] Quick Add initialisé');
    },

    toggleFAB() {
        this.state.fabOpen = !this.state.fabOpen;
        const container = document.getElementById('fab-container');
        const mainBtn = document.getElementById('fab-main');
        
        if (this.state.fabOpen) {
            container.classList.add('open');
            mainBtn.classList.add('active');
        } else {
            container.classList.remove('open');
            mainBtn.classList.remove('active');
        }
    },

    closeFAB() {
        if (this.state.fabOpen) {
            this.toggleFAB();
        }
    },

    async quickVersement() {
        this.closeFAB();
        App.navigateTo('versements');
        setTimeout(() => App.openVersementModal(), 300);
        
        // Pré-remplir avec la dernière pharmacie utilisée
        if (this.state.lastPharmacyId) {
            await new Promise(r => setTimeout(r, 100));
            const select = document.getElementById('versement-pharmacie');
            if (select) select.value = this.state.lastPharmacyId;
        }
    },

    async quickDepense() {
        this.closeFAB();
        App.navigateTo('depenses');
        setTimeout(() => App.openDepenseModal(), 300);
        
        if (this.state.lastPharmacyId) {
            await new Promise(r => setTimeout(r, 100));
            const select = document.getElementById('depense-pharmacie');
            if (select) select.value = this.state.lastPharmacyId;
        }
    },

    quickRapport() {
        this.closeFAB();
        App.navigateTo('rapport-journalier');
    },

    quickDette() {
        this.closeFAB();
        App.navigateTo('dettes');
        setTimeout(() => App.openDetteModal(), 300);
    },

    // ==========================================
    // 2. SYSTÈME D'ALERTES INTELLIGENTES
    // ==========================================

    initAlerts() {
        // Créer le panneau d'alertes
        const alertsPanel = document.createElement('div');
        alertsPanel.className = 'alerts-panel';
        alertsPanel.id = 'alerts-panel';
        alertsPanel.innerHTML = `
            <div class="alerts-header">
                <div class="alerts-title">
                    🔔 Notifications
                    <span class="alerts-count" id="alerts-count">0</span>
                </div>
                <button class="alerts-clear-all" onclick="Innovations.clearAllAlerts()">
                    Tout marquer lu
                </button>
            </div>
            <div id="alerts-list"></div>
        `;
        document.body.appendChild(alertsPanel);

        // Bouton d'alerte dans le header
        const alertBtn = document.createElement('button');
        alertBtn.className = 'btn btn-sm btn-secondary';
        alertBtn.id = 'alert-btn';
        alertBtn.innerHTML = `🔔 <span class="nav-badge" id="alert-badge" style="display:none;">0</span>`;
        alertBtn.onclick = () => this.toggleAlerts();
        alertBtn.title = 'Notifications';
        
        const headerRight = document.querySelector('.header-right');
        if (headerRight) headerRight.insertBefore(alertBtn, headerRight.firstChild);

        console.log('[Innovations] Système d\'alertes initialisé');
    },

    toggleAlerts() {
        this.state.alertsOpen = !this.state.alertsOpen;
        const panel = document.getElementById('alerts-panel');
        panel.classList.toggle('open', this.state.alertsOpen);
    },

    async checkAlerts() {
        const alerts = [];
        const today = new Date();
        
        // 1. Alertes dettes en retard ou proches
        try {
            const dettes = await DB.dettes.getAll();
            dettes.forEach(dette => {
                const echeance = new Date(dette.date_echeance);
                const joursRestants = Math.ceil((echeance - today) / (1000 * 60 * 60 * 24));
                
                if (dette.statut !== 'payee') {
                    if (joursRestants < 0) {
                        alerts.push({
                            type: 'danger',
                            icon: '🚨',
                            title: `Dette en retard: ${dette.fournisseur}`,
                            desc: `Échéance dépassée de ${Math.abs(joursRestants)} jour(s). Solde: ${Calculations.formatFC(dette.solde_restant || 0)}`,
                            action: () => { App.navigateTo('dettes'); this.toggleAlerts(); },
                            date: dette.date_echeance
                        });
                    } else if (joursRestants <= 7) {
                        alerts.push({
                            type: 'warning',
                            icon: '⚠️',
                            title: `Dette proche échéance: ${dette.fournisseur}`,
                            desc: `Échéance dans ${joursRestants} jour(s). Montant: ${Calculations.formatFC(dette.montant_total || 0)}`,
                            action: () => { App.navigateTo('dettes'); this.toggleAlerts(); },
                            date: dette.date_echeance
                        });
                    } else if (joursRestants <= 14) {
                        alerts.push({
                            type: 'info',
                            icon: '📅',
                            title: `Dette à venir: ${dette.fournisseur}`,
                            desc: `Échéance dans ${joursRestants} jours`,
                            action: null,
                            date: dette.date_echeance
                        });
                    }
                }
            });
        } catch (e) {
            console.error('[Alerts] Erreur vérification dettes:', e);
        }

        // 2. Alertes performance versements
        try {
            const versements = await DB.versements.getAll({
                mois: today.getMonth() + 1,
                annee: today.getFullYear()
            });
            
            const pharmacies = await DB.pharmacies.getAll();
            const sitesActifs = pharmacies.filter(p => p.statut === 'actif').length;
            
            if (sitesActifs > 0 && versements.length > 0) {
                const avgParSite = versements.length / sitesActifs;
                
                // Vérifier les sites sans versements récents
                const sitesAvecVersements = new Set(versements.map(v => v.pharmacie_id));
                pharmacies.filter(p => p.statut === 'actif').forEach(pharma => {
                    if (!sitesAvecVersements.has(pharma.id)) {
                        const dernierVersement = versements
                            .filter(v => v.pharmacie_id === pharma.id)
                            .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
                        
                        if (!dernierVersement || new Date(dernierVersement.date) < new Date(today - 3*24*60*60*1000)) {
                            alerts.push({
                                type: 'warning',
                                icon: '💊',
                                title: `Pas de versement: ${pharma.nom}`,
                                desc: `Aucun versement depuis plus de 3 jours`,
                                action: () => { 
                                    this.state.lastPharmacyId = pharma.id;
                                    this.quickVersement(); 
                                    this.toggleAlerts();
                                },
                                date: today.toISOString()
                            });
                        }
                    }
                });
            }
        } catch (e) {
            console.error('[Alerts] Erreur vérification versements:', e);
        }

        // 3. Alertes objectifs mensuels
        try {
            const params = await DB.params.getAll();
            const objectifMensuel = parseFloat(params.objectif_versement) || 0;
            
            if (objectifMensuel > 0) {
                const versementsMois = await DB.versements.getAll({
                    mois: today.getMonth() + 1,
                    annee: today.getFullYear()
                });
                
                const totalFC = versementsMois.reduce((sum, v) => sum + (parseFloat(v.montant_fc) || 0), 0);
                const progression = Math.min(100, (totalFC / objectifMensuel) * 100);
                const joursPassés = today.getDate();
                const joursDansMois = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
                const progressionAttendue = (joursPassés / joursDansMois) * 100;
                
                if (progression < progressionAttendue - 10) {
                    alerts.push({
                        type: 'warning',
                        icon: '📉',
                        title: 'Objectif mensuel en retard',
                        desc: `Progression: ${progression.toFixed(1)}% (attendu: ${progressionAttendue.toFixed(1)}%)`,
                        action: () => { App.navigateTo('dashboard'); this.toggleAlerts(); },
                        date: today.toISOString()
                    });
                } else if (progression >= 100) {
                    alerts.push({
                        type: 'success',
                        icon: '🎉',
                        title: 'Objectif mensuel atteint !',
                        desc: `${Calculations.formatFC(totalFC)} collectés ce mois`,
                        action: null,
                        date: today.toISOString()
                    });
                }
            }
        } catch (e) {
            console.error('[Alerts] Erreur vérification objectifs:', e);
        }

        // Filtrer les alertes déjà dismissées et mettre à jour
        this.state.alerts = alerts.filter(a => !this.state.dismissedAlerts.includes(a.title));
        this.renderAlerts();
        
        // Sauvegarder pour consultation hors ligne
        localStorage.setItem('pharmafinance-alerts', JSON.stringify({
            date: today.toISOString(),
            count: this.state.alerts.length,
            alerts: this.state.alerts.slice(0, 5)
        }));
    },

    renderAlerts() {
        const list = document.getElementById('alerts-list');
        const badge = document.getElementById('alert-badge');
        const countEl = document.getElementById('alerts-count');
        
        if (!list) return;

        if (this.state.alerts.length === 0) {
            list.innerHTML = `
                <div style="padding: 30px; text-align: center; color: var(--gray-500);">
                    <div style="font-size: 40px; margin-bottom: 12px;">✨</div>
                    <p>Tout est en ordre !</p>
                    <p style="font-size: 12px; margin-top: 4px;">Aucune alerte pour le moment</p>
                </div>
            `;
        } else {
            list.innerHTML = this.state.alerts.map((alert, i) => `
                <div class="alert-item alert-${alert.type}" style="animation-delay: ${i * 0.1}s">
                    <button class="alert-dismiss" onclick="Innovations.dismissAlert('${alert.title.replace(/'/g, "\\'")}')">✕</button>
                    <div style="display: flex; align-items: flex-start; gap: 10px;">
                        <span class="alert-icon-large">${alert.icon}</span>
                        <div style="flex: 1;">
                            <div class="alert-title-text">${alert.title}</div>
                            <div class="alert-desc-text">${alert.desc}</div>
                            ${alert.action ? `<button onclick="Innovations.executeAlertAction(${i})" 
                                style="margin-top: 8px; padding: 4px 12px; font-size: 12px; background: var(--primary-700); color: white; border: none; border-radius: 4px; cursor: pointer;">
                                Voir →
                            </button>` : ''}
                        </div>
                    </div>
                </div>
            `).join('');
        }

        // Mettre à jour le badge
        const count = this.state.alerts.length;
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline' : 'none';
        }
        if (countEl) countEl.textContent = count;
    },

    dismissAlert(title) {
        this.state.dismissedAlerts.push(title);
        this.state.alerts = this.state.alerts.filter(a => a.title !== title);
        this.renderAlerts();
    },

    clearAllAlerts() {
        this.state.dismissedAlerts = [...new Set([...this.state.dismissedAlerts, ...this.state.alerts.map(a => a.title)])];
        this.state.alerts = [];
        this.renderAlerts();
        Export.showToast('Toutes les alertes marquées comme lues', 'success');
    },

    executeAlertAction(index) {
        const alert = this.state.alerts[index];
        if (alert && alert.action) {
            alert.action();
        }
    },

    // ==========================================
    // 3. DARK MODE / THÈME
    // ==========================================

    initTheme() {
        // Appliquer le thème sauvegardé
        this.applyTheme(this.state.theme);
        
        // Ajouter le toggle dans le sidebar footer
        const sidebarFooter = document.querySelector('.sidebar-footer');
        if (sidebarFooter) {
            const themeToggle = document.createElement('div');
            themeToggle.className = 'theme-toggle';
            themeToggle.style.marginTop = '12px';
            themeToggle.style.padding = '8px 16px';
            themeToggle.innerHTML = `
                <span class="theme-toggle-label">☀️ Clair</span>
                <div class="toggle-switch" onclick="Innovations.toggleTheme()"></div>
                <span class="theme-toggle-label">🌙 Sombre</span>
            `;
            sidebarFooter.insertBefore(themeToggle, sidebarFooter.firstChild);
        }

        // Écouter les préférences système
        if (window.matchMedia('(prefers-color-scheme: dark)').matches && !localStorage.getItem('pharmafinance-theme')) {
            this.applyTheme('dark');
        }
        
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('pharmaforce-theme-manual')) {
                this.applyTheme(e.matches ? 'dark' : 'light');
            }
        });

        console.log(`[Innovations] Thème initialisé: ${this.state.theme}`);
    },

    toggleTheme() {
        const newTheme = this.state.theme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        localStorage.setItem('pharmafinance-theme', newTheme);
        localStorage.setItem('pharmaforce-theme-manual', 'true');
    },

    applyTheme(theme) {
        this.state.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        
        // Mettre à jour le label du toggle si présent
        const labels = document.querySelectorAll('.theme-toggle-label');
        if (labels.length >= 2) {
            labels[0].textContent = theme === 'light' ? '☀️' : '';
            labels[1].textContent = theme === 'dark' ? '🌙' : '';
        }
    },

    // ==========================================
    // 4. SCORE DE SANTÉ FINANCIÈRE
    // ==========================================

    async calculateHealthScore(pharmacieId, mois, annee) {
        let score = 100;
        let details = [];
        
        try {
            // Facteur 1: Régularité des versements (30%)
            const versements = await DB.versements.getAll({ pharmacie_id: pharmacieId, mois, annee });
            const joursDansMois = new Date(annee, mois, 0).getDate();
            const joursAvecVersement = new Set(versements.map(v => new Date(v.date).getDate())).size;
            const regularitePct = (joursAvecVersement / joursDansMois) * 100;
            
            if (regularitePct >= 80) {
                details.push({ factor: 'Régularité', score: 30, max: 30, status: 'excellent' });
            } else if (regularitePct >= 50) {
                score -= 10;
                details.push({ factor: 'Régularité', score: 20, max: 30, status: 'good' });
            } else {
                score -= 20;
                details.push({ factor: 'Régularité', score: 10, max: 30, status: 'warning' });
            }

            // Facteur 2: Ratio dépenses/recettes (25%)
            const depenses = await DB.depenses.getAll({ pharmacie_id: pharmacieId, mois, annee });
            const totalVersements = versements.reduce((s, v) => s + (parseFloat(v.montant_fc) || 0), 0);
            const totalDepenses = depenses.reduce((s, d) => s + (parseFloat(d.montant) || 0), 0);
            
            if (totalVersements > 0) {
                const ratio = (totalDepenses / totalVersements) * 100;
                if (ratio <= 40) {
                    details.push({ factor: 'Ratio Dép/Rev', score: 25, max: 25, status: 'excellent' });
                } else if (ratio <= 70) {
                    score -= 8;
                    details.push({ factor: 'Ratio Dép/Rev', score: 17, max: 25, status: 'good' });
                } else {
                    score -= 15;
                    details.push({ factor: 'Ratio Dép/Rev', score: 10, max: 25, status: 'critical' });
                }
            } else {
                details.push({ factor: 'Ratio Dép/Rev', score: 25, max: 25, status: 'neutral' });
            }

            // Facteur 3: Gestion des dettes (25%)
            const dettes = await DB.dettes.getAll({ pharmacie_id: pharmacieId });
            const dettesEnRetard = dettes.filter(d => {
                const statutInfo = Calculations.calculerStatutDette(d.date_echeance, null, d.montant_fc, d.monte_paye);
                return statutInfo.statut === 'retard';
            }).length;
            
            if (dettesEnRetard === 0) {
                details.push({ factor: 'Dettes', score: 25, max: 25, status: 'excellent' });
            } else if (dettesEnRetard <= 2) {
                score -= 10;
                details.push({ factor: 'Dettes', score: 15, max: 25, status: 'warning' });
            } else {
                score -= 20;
                details.push({ factor: 'Dettes', score: 5, max: 25, status: 'critical' });
            }

            // Facteur 4: Ponctualité (20%)
            const aujourdhui = new Date();
            const dernierVersement = versements.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            
            if (dernierVersement) {
                const joursDepuis = Math.floor((aujourdhui - new Date(dernierVersement.date)) / (1000 * 60 * 60 * 24));
                if (joursDepuis <= 1) {
                    details.push({ factor: 'Ponctualité', score: 20, max: 20, status: 'excellent' });
                } else if (joursDepuis <= 3) {
                    score -= 5;
                    details.push({ factor: 'Ponctualité', score: 15, max: 20, status: 'good' });
                } else {
                    score -= 12;
                    details.push({ factor: 'Ponctualité', score: 8, max: 20, status: 'warning' });
                }
            } else {
                score -= 15;
                details.push({ factor: 'Ponctualité', score: 5, max: 20, status: 'critical' });
            }

        } catch (error) {
            console.error('[Health Score] Erreur calcul:', error);
        }

        score = Math.max(0, Math.min(100, score));
        
        return {
            score: Math.round(score),
            grade: score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D',
            class: score >= 80 ? 'health-excellent' : score >= 60 ? 'health-good' : score >= 40 ? 'health-warning' : 'health-critical',
            details,
            '--score': `${score}%`
        };
    },

    renderHealthScore(scoreData, containerId) {
        const container = document.getElementById(containerId);
        if (!container || !scoreData) return;

        container.innerHTML = `
            <div class="health-score ${scoreData.class}" style="--score: ${scoreData['--score']}">
                <span>${scoreData.score}</span>
            </div>
        `;
    },

    // ==========================================
    // 5. RACCOURCIS CLAVIER
    // ==========================================

    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ignorer si dans un input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
                return;
            }

            // Ctrl/Cmd + combinaisons
            if ((e.ctrlKey || e.metaKey)) {
                switch(e.key.toLowerCase()) {
                    case 'n':
                        e.preventDefault();
                        this.quickVersement();
                        break;
                    case 'e':
                        e.preventDefault();
                        App.exportCurrentPage();
                        break;
                    case 'p':
                        e.preventDefault();
                        window.print();
                        break;
                    case 'd':
                        e.preventDefault();
                        this.toggleTheme();
                        break;
                }
            }

            // Raccourcis simples
            switch(e.key) {
                case '/':
                    e.preventDefault();
                    this.focusSearch();
                    break;
                case '?':
                    this.showHelp();
                    break;
                case 'Escape':
                    this.closeFAB();
                    if (this.state.alertsOpen) this.toggleAlerts();
                    break;
            }
        });

        console.log('[Innovations] Raccourcis clavier activés');
    },

    focusSearch() {
        // Placeholder - pourrait être implémenté avec une recherche globale
        Export.showToast('Recherche globale (bientôt disponible)', 'info');
    },

    showHelp() {
        const helpContent = `
            <h3>⌨️ Raccourcis Clavier</h3>
            <table style="width:100%; margin-top:12px;">
                <tr><td><kbd>Ctrl+N</kbd></td><td>Nouveau versement rapide</td></tr>
                <tr><td><kbd>Ctrl+E</kbd></td><td>Exporter vue courante</td></tr>
                <tr><td><kbd>Ctrl+P</kbd></td><td>Imprimer</td></tr>
                <tr><td><kbd>Ctrl+D</kbd></td><td>Changer thème clair/sombre</td></tr>
                <tr><td><kbd>/</kbd></td><td>Recherche</td></tr>
                <tr><td><kbd>Echap</kbd></td><td>Fermer modales/FAB</td></tr>
                <tr><td><kbd>?</kbd></td><td>Cette aide</td></tr>
            </table>
        `;
        
        alert(helpContent.replace(/<[^>]*>/g, '\n').replace(/\n{2,}/g, '\n'));
    },

    // ==========================================
    // 6. ANIMATIONS & UX
    // ==========================================

    animateValue(element, start, end, duration, formatter) {
        if (!element) return;
        
        const range = end - start;
        const startTime = performance.now();
        
        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out cubic)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = start + (range * easeOut);
            
            element.textContent = formatter ? formatter(current) : Math.round(current);
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };
        
        requestAnimationFrame(update);
    },

    animateKPIs() {
        // Animer les valeurs KPI au chargement
        document.querySelectorAll('.kpi-value').forEach(el => {
            el.classList.add('animate-fade-in-up');
        });
    },

    // ==========================================
    // INITIALISATION GLOBALE
    // ==========================================

    async init() {
        console.log('[Innovations] Initialisation des modules innovants...');
        
        // Initialiser chaque module
        this.initQuickAdd();
        this.initAlerts();
        this.initTheme();
        this.initKeyboardShortcuts();
        
        // Vérifier les alertes après chargement des données
        setTimeout(() => {
            this.checkAlerts();
        }, 2000);
        
        // Vérifier les alertes périodiquement (toutes les 5 minutes)
        setInterval(() => {
            this.checkAlerts();
        }, 5 * 60 * 1000);
        
        console.log('[Innovations] ✅ Tous les modules innovants sont prêts!');
    }
};

// Exposer globalement
window.Innovations = Innovations;

console.log('[Innovations] Module chargé - API disponible via window.Innovations');
