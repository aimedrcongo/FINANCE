/**
 * ============================================
 * PharmaFinance Pro - Application Principale
 * Navigation SPA, Gestion UI, Formulaires
 * ============================================
 */

const App = {
    // État de l'application
    state: {
        currentPage: 'dashboard',
        selectedPharmacie: null,
        currentMois: new Date().getMonth() + 1,
        currentAnnee: new Date().getFullYear(),
        pharmacies: [],
        isOffline: !navigator.onLine,
        editingId: null
    },

    // ==========================================
    // INITIALISATION
    // ==========================================

    async init() {
        console.log('[App] Initialisation de LA DIVINE PharmaFinance...');
        
        try {
            // 1. Initialiser la base de données
            await DB.init();
            console.log('[App] Base de données prête');
            
            // 2. Charger les paramètres et pharmacies
            await this.loadInitialData();
            
            // 3. Configurer la navigation
            this.setupNavigation();
            
            // 4. Configurer les événements globaux
            this.setupGlobalEvents();
            
            // 5. Enregistrer le Service Worker
            this.registerServiceWorker();
            
            // 6. Afficher la page par défaut (depuis URL ou dashboard)
            const hash = window.location.hash.slice(1) || 'dashboard';
            this.navigateTo(hash);
            
            // 7. Initialiser les modules innovants
            if (typeof Innovations !== 'undefined') {
                await Innovations.init();
            }
            
            console.log('[App] ✅ Application LA DIVINE initialisée avec succès');
            
        } catch (error) {
            console.error('[App] Erreur d\'initialisation:', error);
            this.showError('Erreur lors du chargement de l\'application');
        }
    },

    async loadInitialData() {
        // Charger les pharmacies
        this.state.pharmacies = await DB.pharmacies.getAll();
        
        // Charger les paramètres
        const params = await DB.params.getAll();
        if (params.mois_courant) this.state.currentMois = parseInt(params.mois_courant);
        if (params.annee_courante) this.state.currentAnnee = parseInt(params.annee_courante);
        
        // Mettre à jour les sélecteurs dans le header
        this.updateHeaderSelectors();
    },

    updateHeaderSelectors() {
        const moisSelect = document.getElementById('header-mois');
        const anneeSelect = document.getElementById('header-annee');
        
        if (moisSelect) moisSelect.value = this.state.currentMois;
        if (anneeSelect) anneeSelect.value = this.state.currentAnnee;
    },

    // ==========================================
    // NAVIGATION SPA
    // ==========================================

    setupNavigation() {
        // Clic sur les liens de navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.navigateTo(page);
                
                // Fermer sidebar sur mobile
                document.querySelector('.sidebar').classList.remove('open');
                document.querySelector('.sidebar-overlay')?.classList.remove('active');
            });
        });

        // Bouton menu mobile
        const menuToggle = document.querySelector('.menu-toggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                document.querySelector('.sidebar').classList.toggle('open');
                document.querySelector('.sidebar-overlay')?.classList.toggle('active');
            });
        }

        // Overlay sidebar mobile
        const overlay = document.querySelector('.sidebar-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                document.querySelector('.sidebar').classList.remove('open');
                overlay.classList.remove('active');
            });
        }
    },

    navigateTo(page) {
        // Masquer toutes les pages
        document.querySelectorAll('.page-view').forEach(p => p.classList.remove('active'));
        
        // Désactiver tous les nav items
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        
        // Afficher la page cible
        const targetPage = document.getElementById(`page-${page}`);
        if (targetPage) {
            targetPage.classList.add('active');
        }
        
        // Activer le nav item correspondant
        const activeNav = document.querySelector(`[data-page="${page}"]`);
        if (activeNav) activeNav.classList.add('active');
        
        // Mettre à jour le titre
        const titles = {
            'dashboard': 'Tableau de Bord',
            'pharmacies': 'Gestion des Pharmacies',
            'rapport-journalier': 'Rapport Journalier',
            'versements': 'Versements des Pharmacies',
            'depenses': 'Journal des Dépenses',
            'livre-comptes': 'Livre de Comptes',
            'dettes': 'Dettes Fournisseurs',
            'balance': 'Balance Mensuelle',
            'parametres': 'Paramètres',
            'utilisateurs': 'Gestion des Utilisateurs',
            'audit-log': 'Journal d\'Audit'
        };
        
        const pageTitle = document.getElementById('page-title');
        if (pageTitle && titles[page]) {
            pageTitle.textContent = titles[page];
        }
        
        // Mettre à jour l'état
        this.state.currentPage = page;
        window.location.hash = page;
        
        // Charger les données de la page
        this.loadPageData(page);
    },

    async loadPageData(page) {
        switch (page) {
            case 'dashboard':
                await this.loadDashboard();
                break;
            case 'pharmacies':
                await this.loadPharmaciesList();
                break;
            case 'versements':
                await this.loadVersements();
                break;
            case 'depenses':
                await this.loadDepenses();
                break;
            case 'livre-comptes':
                await this.loadLivreComptes();
                break;
            case 'dettes':
                await this.loadDettes();
                break;
            case 'balance':
                await this.loadBalanceMensuelle();
                break;
            case 'rapport-journalier':
                await this.loadRapportJournalierForm();
                break;
            case 'parametres':
                await this.loadParametres();
                break;
            case 'utilisateurs':
                this.renderUsersTable();
                this.updateUsersStats();
                break;
            case 'audit-log':
                this.loadAuditLog();
                break;
        }
    },

    // ==========================================
    // TABLEAU DE BORD (DASHBOARD)
    // ==========================================

    async loadDashboard() {
        try {
            const kpis = await Calculations.calculerKPIsDashboard(
                this.state.currentMois, 
                this.state.currentAnnee
            );
            
            // Mettre à jour les KPI cards
            this.updateKPICards(kpis.kpis);
            
            // Mettre à jour le tableau par site
            this.updateDashboardTable(kpis.stats_par_site);
            
        } catch (error) {
            console.error('[Dashboard] Erreur:', error);
        }
    },

    updateKPICards(kpis) {
        const cards = [
            { id: 'kpi-depenses', value: Calculations.formatFC(kpis.total_depenses), label: 'Total Dépenses' },
            { id: 'kpi-versements-fc', value: Calculations.formatFC(kpis.total_versements_fc), label: 'Versements FC' },
            { id: 'kpi-versements-usd', value: Calculations.formatUSD(kpis.total_versements_usd), label: 'Versements USD' },
            { id: 'kpi-solde', value: Calculations.formatFC(kpis.solde_global), label: 'Solde Net', class: kpis.solde_global >= 0 ? 'success' : 'error' },
            { id: 'kpi-sites', value: kpis.sites_actifs, label: 'Sites Actifs' },
            { id: 'kpi-jours', value: kpis.nombre_jours, label: 'Jours avec données' }
        ];
        
        cards.forEach(card => {
            const el = document.getElementById(card.id);
            if (el) {
                el.innerHTML = `<span class="kpi-value">${card.value}</span>
                               <span class="kpi-label">${card.label}</span>`;
                if (card.class) el.className = `kpi-card ${card.class}`;
            }
        });
    },

    updateDashboardTable(stats) {
        const tbody = document.getElementById('dashboard-table-body');
        if (!tbody) return;
        
        tbody.innerHTML = stats.map(site => `
            <tr>
                <td><strong>${site.nom}</strong></td>
                <td class="amount">${Calculations.formatFC(site.depenses)}</td>
                <td class="amount positive">${Calculations.formatFC(site.versements_fc)}</td>
                <td class="amount">${Calculations.formatUSD(site.versements_usd)}</td>
                <td class="amount ${site.balance >= 0 ? 'positive' : 'negative'}">
                    <strong>${Calculations.formatFC(site.balance)}</strong>
                </td>
                <td>
                    <span class="badge badge-${site.statut === 'POSITIF' ? 'success' : site.statut === 'NEGATIF' ? 'error' : 'neutral'}">
                        ${site.statut}
                    </span>
                </td>
            </tr>
        `).join('');
    },

    // ==========================================
    // MODULE PHARMACIES
    // ==========================================

    async loadPharmaciesList() {
        const pharmacies = await DB.pharmacies.getAll();
        const tbody = document.getElementById('pharmacies-list');
        if (!tbody) return;
        
        tbody.innerHTML = pharmacies.map(p => `
            <tr>
                <td><strong>${p.nom}</strong></td>
                <td>${p.code}</td>
                <td>${p.ville || '-'}</td>
                <td>${p.responsable || '-'}</td>
                <td class="amount">${p.taux_change || 2800}</td>
                <td>
                    <span class="badge badge-${p.statut === 'actif' ? 'success' : 'warning'}">
                        ${p.statut || 'inactif'}
                    </span>
                </td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-secondary" onclick="App.editPharmacy(${p.id})">✏️</button>
                        <button class="btn btn-sm btn-danger" onclick="App.deletePharmacy(${p.id})">🗑️</button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    openPharmacyModal(id = null) {
        this.state.editingId = id;
        const modal = document.getElementById('pharmacy-modal');
        const title = document.getElementById('pharmacy-modal-title');
        const form = document.getElementById('pharmacy-form');
        
        if (id) {
            title.textContent = 'Modifier la Pharmacien';
            DB.pharmacies.getById(id).then(pharma => {
                if (pharma) {
                    document.getElementById('pharma-nom').value = pharma.nom;
                    document.getElementById('pharma-code').value = pharma.code;
                    document.getElementById('pharma-ville').value = pharma.ville || '';
                    document.getElementById('pharma-responsable').value = pharma.responsable || '';
                    document.getElementById('pharma-taux').value = pharma.taux_change || 2800;
                    document.getElementById('pharma-statut').value = pharma.statut || 'actif';
                }
            });
        } else {
            title.textContent = 'Nouvelle Pharmacien';
            form.reset();
        }
        
        modal.classList.add('active');
    },

    closePharmacyModal() {
        document.getElementById('pharmacy-modal').classList.remove('active');
        this.state.editingId = null;
    },

    async savePharmacy(e) {
        e.preventDefault();
        
        const data = {
            nom: document.getElementById('pharma-nom').value.trim(),
            code: document.getElementById('pharma-code').value.trim().toUpperCase(),
            ville: document.getElementById('pharma-ville').value.trim(),
            responsable: document.getElementById('pharma-responsable').value.trim(),
            taux_change: parseFloat(document.getElementById('pharma-taux').value) || 2800,
            statut: document.getElementById('pharma-statut').value
        };
        
        if (!data.nom || !data.code) {
            Export.showToast('Nom et code sont obligatoires', 'error');
            return;
        }
        
        try {
            if (this.state.editingId) {
                await DB.pharmacies.update(this.state.editingId, data);
                Export.showToast('Pharmacien mise à jour', 'success');
            } else {
                await DB.pharmacies.add(data);
                Export.showToast('Pharmacien ajoutée', 'success');
            }
            
            this.closePharmacyModal();
            this.loadPharmaciesList();
            this.loadInitialData(); // Recharger pour mettre à jour les listes déroulantes
            
        } catch (error) {
            Export.showToast('Erreur: ' + error.message, 'error');
        }
    },

    async deletePharmacy(id) {
        if (!confirm('Confirmer la suppression de cette pharmacie?')) return;
        
        try {
            await DB.pharmacies.delete(id);
            Export.showToast('Pharmacien supprimée', 'success');
            this.loadPharmaciesList();
            this.loadInitialData();
        } catch (error) {
            Export.showToast('Erreur: ' + error.message, 'error');
        }
    },

    editPharmacy(id) {
        this.openPharmacyModal(id);
    },

    // ==========================================
    // MODULE VERSEMENTS
    // ==========================================

    async loadVersements() {
        const filters = {
            mois: this.state.currentMois,
            annee: this.state.currentAnnee
        };
        
        const versements = await DB.versements.getAll(filters);
        const pharmacies = await DB.pharmacies.getAll();
        const pharmacieMap = {};
        pharmacies.forEach(p => pharmacieMap[p.id] = p.nom);
        
        // Remplir le tableau
        const tbody = document.getElementById('versements-list');
        if (tbody) {
            tbody.innerHTML = versements.length ? versements.map(v => `
                <tr>
                    <td>${this.formatDate(v.date)}</td>
                    <td><strong>${pharmacieMap[v.pharmacie_id] || v.pharmacie_nom || '-'}</strong></td>
                    <td class="amount">${parseFloat(v.montant_usd || 0).toLocaleString('fr-FR')} $</td>
                    <td class="amount positive">${Calculations.formatFC(v.montant_fc)}</td>
                    <td>${v.observation || '-'}</td>
                    <td>
                        <button class="btn btn-sm btn-secondary" onclick="App.deleteVersement(${v.id})">🗑️</button>
                    </td>
                </tr>
            `).join('') : '<tr><td colspan="6" class="text-center text-muted">Aucun versement ce mois-ci</td></tr>';
        }
        
        // Totaux
        const totaux = Calculations.calculerTotauxVersements(versements);
        this.updateVersementTotaux(totaux);
    },

    updateVersementTotaux(totaux) {
        const el = document.getElementById('versements-totaux');
        if (el) {
            el.innerHTML = `
                <div class="kpi-card info">
                    <span class="kpi-label">Total USD</span>
                    <span class="kpi-value"><small>$</small>${totaux.total_usd.toLocaleString('fr-FR')}</span>
                </div>
                <div class="kpi-card success">
                    <span class="kpi-label">Total FC</span>
                    <span class="kpi-value">${Calculations.formatFC(totaux.total_fc)}</span>
                </div>
                <div class="kpi-card">
                    <span class="kpi-label">Nombre Versements</span>
                    <span class="kpi-value">${taux.nombre_total}</span>
                </div>
            `;
        }
    },

    openVersementModal() {
        const modal = document.getElementById('versement-modal');
        modal.classList.add('active');
        document.getElementById('versement-form').reset();
        document.getElementById('versement-date').value = new Date().toISOString().split('T')[0];
        
        // Remplir la liste des pharmacies
        this.populatePharmacieSelect('versement-pharmacie');
    },

    closeVersementModal() {
        document.getElementById('versement-modal').classList.remove('active');
    },

    async saveVersement(e) {
        e.preventDefault();
        
        const dateParts = Calculations.getDateParts(document.getElementById('versement-date').value);
        
        const data = {
            date: document.getElementById('versement-date').value,
            pharmacie_id: parseInt(document.getElementById('versement-pharmacie').value),
            pharmacie_nom: document.getElementById('versement-pharmacie').options[document.getElementById('versement-pharmacie').selectedIndex].text,
            montant_usd: parseFloat(document.getElementById('versement-usd').value) || 0,
            montant_fc: parseFloat(document.getElementById('versement-fc').value) || 0,
            observation: document.getElementById('versement-observation').value,
            mois: dateParts.mois,
            annee: dateParts.annee
        };
        
        const validation = Calculations.validerVersement(data);
        if (!validation.valide) {
            Export.showToast(validation.erreurs.join(', '), 'error');
            return;
        }
        
        try {
            await DB.versements.add(data);
            Export.showToast('Versement enregistré', 'success');
            this.closeVersementModal();
            this.loadVersements();
        } catch (error) {
            Export.showToast('Erreur: ' + error.message, 'error');
        }
    },

    async deleteVersement(id) {
        if (!confirm('Supprimer ce versement?')) return;
        await DB.versements.delete(id);
        Export.showToast('Versement supprimé', 'success');
        this.loadVersements();
    },

    // ==========================================
    // MODULE DÉPENSES
    // ==========================================

    async loadDepenses() {
        const filters = {
            mois: this.state.currentMois,
            annee: this.state.currentAnnee
        };
        
        const depenses = await DB.depenses.getAll(filters);
        const pharmacies = await DB.pharmacies.getAll();
        const pharmacieMap = {};
        pharmacies.forEach(p => pharmacieMap[p.id] = p.nom);
        
        const tbody = document.getElementById('depenses-list');
        if (tbody) {
            tbody.innerHTML = depenses.length ? depenses.map(d => `
                <tr>
                    <td>${this.formatDate(d.date)}</td>
                    <td><strong>${pharmacieMap[d.pharmacie_id] || d.pharmacie_nom || '-'}</strong></td>
                    <td>${d.categorie || '-'}</td>
                    <td>${d.libelle || '-'}</td>
                    <td class="amount negative">${Calculations.formatFC(d.montant)}</td>
                    <td>${d.mode_paiement || '-'}</td>
                    <td>
                        <button class="btn btn-sm btn-secondary" onclick="App.deleteDepense(${d.id})">🗑️</button>
                    </td>
                </tr>
            `).join('') : '<tr><td colspan="7" class="text-center text-muted">Aucune dépense ce mois-ci</td></tr>';
        }
        
        // Totaux par catégorie
        const totauxCategorie = Calculations.calculerTotauxDepensesParCategorie(depenses);
        this.updateDepensesStats(totauxCategorie);
    },

    updateDepensesStats(stats) {
        const el = document.getElementById('depenses-stats');
        if (el) {
            el.innerHTML = `
                <div class="kpi-card error">
                    <span class="kpi-label">Total Dépenses</span>
                    <span class="kpi-value">${Calculations.formatFC(stats.total_general)}</span>
                </div>
                <div class="kpi-card">
                    <span class="kpi-label">Catégories</span>
                    <span class="kpi-value">${stats.par_categorie.length}</span>
                </div>
            `;
        }
        
        // Graphique des catégories (optionnel - version simple)
        const chartEl = document.getElementById('depenses-chart');
        if (chartEl && stats.par_categorie.length > 0) {
            const maxVal = Math.max(...stats.par_categorie.map(c => c.total));
            chartEl.innerHTML = stats.par_categorie.slice(0, 8).map(cat => `
                <div style="margin-bottom: 8px;">
                    <div style="display: flex; justify-content: space-between; font-size: 12px;">
                        <span>${cat.categorie}</span>
                        <span>${Calculations.formatFC(cat.total)}</span>
                    </div>
                    <div style="background: #e0e0e0; border-radius: 4px; height: 20px; overflow: hidden;">
                        <div style="background: var(--primary-500); height: 100%; width: ${(cat.total / maxVal * 100)}%; transition: width 0.3s;"></div>
                    </div>
                </div>
            `).join('');
        }
    },

    openDepenseModal() {
        const modal = document.getElementById('depense-modal');
        modal.classList.add('active');
        document.getElementById('depense-form').reset();
        document.getElementById('depense-date').value = new Date().toISOString().split('T')[0];
        
        this.populatePharmacieSelect('depense-pharmacie');
        this.populateCategoriesSelect('depense-categorie');
    },

    closeDepenseModal() {
        document.getElementById('depense-modal').classList.remove('active');
    },

    async saveDepense(e) {
        e.preventDefault();
        
        const dateParts = Calculations.getDateParts(document.getElementById('depense-date').value);
        
        const data = {
            date: document.getElementById('depense-date').value,
            pharmacie_id: parseInt(document.getElementById('depense-pharmacie').value),
            pharmacie_nom: document.getElementById('depense-pharmacie').options[document.getElementById('depense-pharmacie').selectedIndex].text,
            categorie: document.getElementById('depense-categorie').value,
            sous_categorie: document.getElementById('depense-sous-categorie').value,
            libelle: document.getElementById('depense-libelle').value,
            montant: parseFloat(document.getElementById('depense-montant').value) || 0,
            mode_paiement: document.getElementById('depense-mode-paiement').value,
            observation: document.getElementById('depense-observation').value,
            mois: dateParts.mois,
            annee: dateParts.annee
        };
        
        if (!data.categorie || data.montant <= 0) {
            Export.showToast('Catégorie et montant sont obligatoires', 'error');
            return;
        }
        
        try {
            await DB.depenses.add(data);
            Export.showToast('Dépense enregistrée', 'success');
            this.closeDepenseModal();
            this.loadDepenses();
        } catch (error) {
            Export.showToast('Erreur: ' + error.message, 'error');
        }
    },

    async deleteDepense(id) {
        if (!confirm('Supprimer cette dépense?')) return;
        await DB.depenses.delete(id);
        Export.showToast('Dépense supprimée', 'success');
        this.loadDepenses();
    },

    // ==========================================
    // MODULE LIVRE DE COMPTES
    // ==========================================

    async loadLivreComptes() {
        const filters = {
            mois: this.state.currentMois,
            annee: this.state.currentAnnee
        };
        
        let operations = await DB.livre.getAll(filters);
        const pharmacies = await DB.pharmacies.getAll();
        const pharmacieMap = {};
        pharmacies.forEach(p => pharmacieMap[p.id] = p.nom);
        
        // Si pas d'operations directes, générer depuis rapports et versements
        if (operations.length === 0) {
            operations = await this.generateLivreComptesFromData(filters);
        }
        
        // Calculer la balance cumulée
        const balanceCalculee = Calculations.calculerBalanceLivreComptes(operations);
        
        const tbody = document.getElementById('livre-comptes-list');
        if (tbody) {
            tbody.innerHTML = balanceCalculee.operations.length ? balanceCalculee.operations.map(op => `
                <tr>
                    <td>${this.formatDate(op.date)}</td>
                    <td><strong>${pharmacieMap[op.pharmacie_id] || op.pharmacie_nom || '-'}</strong></td>
                    <td class="amount">${op.montant_syst ? Calculations.formatFC(op.montant_syst) : '-'}</td>
                    <td class="amount negative">${op.depenses ? Calculations.formatFC(op.depenses) : '-'}</td>
                    <td class="amount">${op.fc ? Calculations.formatFC(op.fc) : '-'}</td>
                    <td class="amount">${op.usd ? Calculations.formatUSD(op.usd) : '-'}</td>
                    <td class="amount positive">${op.fc_verse ? Calculations.formatFC(op.fc_verse) : '-'}</td>
                    <td class="amount font-bold ${op.balance_apres >= 0 ? 'positive' : 'negative'}">
                        ${Calculations.formatFC(op.balance_apres)}
                    </td>
                </tr>
            `).join('') : '<tr><td colspan="8" class="text-center text-muted">Aucune opération ce mois-ci</td></tr>';
        }
        
        // Résumé
        this.updateLivreComptesResume(balanceCalculee);
    },

    async generateLivreComptesFromData(filters) {
        // Récupérer les versements et dépenses pour générer le livre
        const [versements, depenses] = await Promise.all([
            DB.versements.getAll(filters),
            DB.depenses.getAll(filters)
        ]);
        
        const operations = [];
        
        // Ajouter les versements comme entrées
        versements.forEach(v => {
            operations.push({
                date: v.date,
                pharmacie_id: v.pharmacie_id,
                pharmacie_nom: v.pharmacie_nom,
                type_operation: 'VERSEMENT',
                montant_syst: 0,
                depenses: 0,
                fc: 0,
                usd: v.montant_usd || 0,
                fc_verse: v.montant_fc || 0,
                reference: `VER-${v.id}`,
                nature_operation: 'Versement pharmacie'
            });
        });
        
        // Ajouter les dépenses comme sorties
        depenses.forEach(d => {
            operations.push({
                date: d.date,
                pharmacie_id: d.pharmacie_id,
                pharmacie_nom: d.pharmacie_nom,
                type_operation: 'DEPENSE',
                montant_syst: 0,
                depenses: d.montant,
                fc: 0,
                usd: 0,
                fc_verse: 0,
                reference: `DEP-${d.id}`,
                nature_operation: `${d.categorie}: ${d.libelle}`
            });
        });
        
        return operations;
    },

    updateLivreComptesResume(data) {
        const el = document.getElementById('livre-comptes-resume');
        if (el) {
            el.innerHTML = `
                <div class="kpi-card success">
                    <span class="kpi-label">Solde Ouverture</span>
                    <span class="kpi-value">${Calculations.formatFC(data.solde_ouverture)}</span>
                </div>
                <div class="kpi-card">
                    <span class="kpi-label">Total Entrées</span>
                    <span class="kpi-value positive">${Calculations.formatFC(data.total_entrees)}</span>
                </div>
                <div class="kpi-card error">
                    <span class="kpi-label">Total Sorties</span>
                    <span class="kpi-value negative">${Calculations.formatFC(data.total_sorties)}</span>
                </div>
                <div class="kpi-card ${data.solde_final >= 0 ? 'success' : 'error'}">
                    <span class="kpi-label">Solde Final</span>
                    <span class="kpi-value">${Calculations.formatFC(data.solde_final)}</span>
                </div>
            `;
        }
    },

    // ==========================================
    // MODULE DETTES FOURNISSEURS
    // ==========================================

    async loadDettes() {
        let dettes = await DB.dettes.getAll();
        const pharmacies = await DB.pharmacies.getAll();
        const pharmacieMap = {};
        pharmacies.forEach(p => pharmacieMap[p.id] = p.nom;
        
        // Calculer les statuts
        const dettesAvecStatut = Calculations.calculerTotauxDettes(dettes);
        
        const tbody = document.getElementById('dettes-list');
        if (tbody) {
            tbody.innerHTML = dettesAvecStatut.dettes.length ? dettesAvecStatut.dettes.map(d => `
                <tr>
                    <td><strong>${d.fournisseur || '-'}</strong></td>
                    <td>${pharmacieMap[d.pharmacie_id] || d.pharmacie_nom || '-'}</td>
                    <td class="amount">${Calculations.formatFC(d.montant_total)}</td>
                    <td class="amount positive">${Calculations.formatFC(d.monte_paye)}</td>
                    <td class="amount negative">${Calculations.formatFC(d.solde_restant)}</td>
                    <td>${this.formatDate(d.date_echeance)}</td>
                    <td><span class="badge ${d.class}">${d.label}</span></td>
                    <td>
                        <button class="btn btn-sm btn-secondary" onclick="App.editDette(${d.id})">✏️</button>
                        <button class="btn btn-sm btn-danger" onclick="App.deleteDette(${d.id})">🗑️</button>
                    </td>
                </tr>
            `).join('') : '<tr><td colspan="8" class="text-center text-muted">Aucune dette enregistrée</td></tr>';
        }
        
        // Résumé global
        this.updateDettesResume(dettesAvecStatut);
    },

    updateDettesResume(stats) {
        const el = document.getElementById('dettes-resume');
        if (el) {
            el.innerHTML = `
                <div class="kpi-card warning">
                    <span class="kpi-label">Total Dettes</span>
                    <span class="kpi-value">${Calculations.formatFC(stats.total_montant)}</span>
                </div>
                <div class="kpi-card success">
                    <span class="kpi-label">Total Payé (${stats.pourcentage_paye.toFixed(1)}%)</span>
                    <span class="kpi-value">${Calculations.formatFC(stats.total_paye)}</span>
                </div>
                <div class="kpi-card error">
                    <span class="kpi-label">Restant à Payer</span>
                    <span class="kpi-value">${Calculations.formatFC(stats.total_restant)}</span>
                </div>
                ${stats.total_en_retard > 0 ? `
                <div class="kpi-card error">
                    <span class="kpi-label">En Retard!</span>
                    <span class="kpi-value">${Calculations.formatFC(stats.total_en_retard)}</span>
                </div>` : ''}
            `;
        }
    },

    openDetteModal(id = null) {
        this.state.editingId = id;
        const modal = document.getElementById('dette-modal');
        const form = document.getElementById('dette-form');
        
        if (id) {
            DB.dettes.getById(id).then(dette => {
                if (dette) {
                    document.getElementById('dette-fournisseur').value = dette.fournisseur || '';
                    document.getElementById('dette-montant-fc').value = dette.montant_fc || '';
                    document.getElementById('dette-montant-usd').value = dette.montant_usd || '';
                    document.getElementById('dette-date-facture').value = dette.date_facture || '';
                    document.getElementById('dette-date-echeance').value = dette.date_echeance || '';
                    document.getElementById('dette-monte-paye').value = dette.monte_paye || '';
                    document.getElementById('dette-observation').value = dette.observation || '';
                }
            });
        } else {
            form.reset();
            document.getElementById('dette-date-echeance').value = new Date().toISOString().split('T')[0];
        }
        
        this.populatePharmacieSelect('dette-pharmacie');
        modal.classList.add('active');
    },

    closeDetteModal() {
        document.getElementById('dette-modal').classList.remove('active');
    },

    async saveDette(e) {
        e.preventDefault();
        
        const data = {
            fournisseur: document.getElementById('dette-fournisseur').value.trim(),
            pharmacie_id: parseInt(document.getElementById('dette-pharmacie').value),
            pharmacie_nom: document.getElementById('dette-pharmacie').options[document.getElementById('dette-pharmacie').selectedIndex].text,
            montant_fc: parseFloat(document.getElementById('dette-montant-fc').value) || 0,
            montant_usd: parseFloat(document.getElementById('dette-montant-usd').value) || 0,
            montant_total: parseFloat(document.getElementById('dette-montant-fc').value) || 0,
            date_facture: document.getElementById('dette-date-facture').value,
            date_echeance: document.getElementById('dette-date-echeance').value,
            monte_paye: parseFloat(document.getElementById('dette-monte-paye').value) || 0,
            solde_restant: 0, // Sera calculé automatiquement
            statut: 'en_attente',
            observation: document.getElementById('dette-observation').value
        };
        
        if (!data.fournisseur || data.montant_total <= 0) {
            Export.showToast('Fournisseur et montant sont obligatoires', 'error');
            return;
        }
        
        data.solde_restant = data.montant_total - data.monte_paye;
        
        try {
            if (this.state.editingId) {
                await DB.dettes.update(this.state.editingId, data);
            } else {
                await DB.dettes.add(data);
            }
            Export.showToast('Dette enregistrée', 'success');
            this.closeDetteModal();
            this.loadDettes();
        } catch (error) {
            Export.showToast('Erreur: ' + error.message, 'error');
        }
    },

    editDette(id) {
        this.openDetteModal(id);
    },

    async deleteDette(id) {
        if (!confirm('Supprimer cette dette?')) return;
        await DB.dettes.delete(id);
        Export.showToast('Dette supprimée', 'success');
        this.loadDettes();
    },

    // ==========================================
    // MODULE BALANCE MENSUELLE
    // ==========================================

    async loadBalanceMensuelle() {
        const pharmacies = await DB.pharmacies.getAll();
        const mois = this.state.currentMois;
        const annee = this.state.currentAnnee;
        
        const balances = [];
        
        for (const pharma of pharmacies) {
            const balance = await Calculations.calculerBalanceMensuelle(
                pharma.id,
                mois,
                annee,
                {
                    rapports: await DB.rapports.getAll({ pharmacie_id: pharma.id, mois, annee }),
                    versements: await DB.versements.getAll({ pharmacie_id: pharma.id, mois, annee }),
                    depenses: await DB.depenses.getAll({ pharmacie_id: pharma.id, mois, annee }),
                    soldeOuverture: pharma.solde_ouverture_fc || 0
                }
            );
            balances.push({ ...balance, pharmacie_nom: pharma.nom });
        }
        
        // Trier par solde décroissant
        balances.sort((a, b) => b.solde_fc - a.solde_fc);
        
        const tbody = document.getElementById('balance-list');
        if (tbody) {
            tbody.innerHTML = balances.map(b => `
                <tr>
                    <td><strong>${b.pharmacie_nom}</strong></td>
                    <td class="amount">${Calculations.formatFC(b.ouverture_fc)}</td>
                    <td class="amount negative">${Calculations.formatFC(b.depenses_fc)}</td>
                    <td class="amount positive">${Calculations.formatFC(b.recettes_fc)}</td>
                    <td class="amount font-bold ${b.solde_fc >= 0 ? 'positive' : 'negative'}">
                        ${Calculations.formatFC(b.solde_fc)}
                    </td>
                </tr>
            `).join('');
            
            // Ligne TOTAL
            const total = balances.reduce((acc, b) => ({
                ouverture_fc: acc.ouverture_fc + b.ouverture_fc,
                depenses_fc: acc.depenses_fc + b.depenses_fc,
                recettes_fc: acc.recettes_fc + b.recettes_fc,
                solde_fc: acc.solde_fc + b.solde_fc
            }), { ouverture_fc: 0, depenses_fc: 0, recettes_fc: 0, solde_fc: 0 });
            
            tbody.innerHTML += `
                <tr class="total-row" style="background: var(--primary-50); font-weight: bold;">
                    <td>TOTAL</td>
                    <td class="amount">${Calculations.formatFC(total.ouverture_fc)}</td>
                    <td class="amount">${Calculations.formatFC(total.depenses_fc)}</td>
                    <td class="amount">${Calculations.formatFC(total.recettes_fc)}</td>
                    <td class="amount">${Calculations.formatFC(total.solde_fc)}</td>
                </tr>
            `;
        }
    },

    // ==========================================
    // MODULE RAPPORT JOURNALIER
    // ==========================================

    async loadRapportJournalierForm() {
        document.getElementById('rapport-date').value = new Date().toISOString().split('T')[0];
        this.populatePharmacieSelect('rapport-pharmacie');
    },

    async saveRapportJournalier(e) {
        e.preventDefault();
        
        const dateStr = document.getElementById('rapport-date').value;
        const dateParts = Calculations.getDateParts(dateStr);
        
        const data = {
            date: dateStr,
            pharmacie_id: parseInt(document.getElementById('rapport-pharmacie').value),
            pharmacie_nom: document.getElementById('rapport-pharmacie').options[document.getElementById('rapport-pharmacie').selectedIndex].text,
            
            // Ventes
            dollars: parseFloat(document.getElementById('rapport-dollars').value) || 0,
            francs: parseFloat(document.getElementById('rapport-francs').value) || 0,
            
            // E-money
            equity: parseFloat(document.getElementById('rapport-equity').value) || 0,
            gga: parseFloat(document.getElementById('rapport-gga').value) || 0,
            tmb: parseFloat(document.getElementById('rapport-tmb').value) || 0,
            moko: parseFloat(document.getElementById('rapport-moko').value) || 0,
            
            // Dépenses
            transport: parseFloat(document.getElementById('rapport-transport').value) || 0,
            achats_produits: parseFloat(document.getElementById('rapport-achats').value) || 0,
            carburant: parseFloat(document.getElementById('rapport-carburant').value) || 0,
            autres_depenses: parseFloat(document.getElementById('rapport-autres').value) || 0,
            
            // Total système (optionnel)
            total_systeme: parseFloat(document.getElementById('rapport-total-systeme').value) || 0,
            
            // Métadonnées
            mois: dateParts.mois,
            annee: dateParts.annee
        };
        
        // Validation
        const validation = Calculations.validerRapportJournalier(data);
        if (!validation.valide) {
            Export.showToast(validation.erreurs.join(', '), 'error');
            return;
        }
        
        // Calculs automatiques
        const calculs = Calculations.calculerRapportJournalier(data);
        
        // Afficher les résultats calculés
        this.showRapportResultats(calculs);
        
        // Sauvegarder
        try {
            // Vérifier si un rapport existe déjà pour cette date/pharmacie
            const existant = await DB.rapports.getByDate(data.pharmacie_id, data.date);
            
            if (existant && existant.length > 0) {
                if (!confirm('Un rapport existe déjà pour cette date. Le remplacer?')) return;
                await DB.rapports.update(existant[0].id, { ...data, ...calcs });
            } else {
                await DB.rapports.add({ ...data, ...calcs });
            }
            
            Export.showToast('Rapport journalier sauvegardé!', 'success');
            
        } catch (error) {
            Export.showToast('Erreur: ' + error.message, 'error');
        }
    },

    showRapportResultats(calculs) {
        const container = document.getElementById('rapport-resultats');
        if (container) {
            container.innerHTML = `
                <div class="alert alert-success">
                    <h4>✅ Calculs Automatiques</h4>
                    <div class="form-grid" style="margin-top: 12px;">
                        <div class="form-group">
                            <label>Total E-Money:</label>
                            <span class="font-bold">${Calculations.formatFC(calculs.totalEMoney)}</span>
                        </div>
                        <div class="form-group">
                            <label>Dollars en FC (@${calculs.tauxChange}):</label>
                            <span class="font-bold">${Calculations.formatFC(calculs.dollarsEnFC)}</span>
                        </div>
                        <div class="form-group">
                            <label>Total Ventes J:</label>
                            <span class="font-bold text-success">${Calculations.formatFC(calculs.totalVentesJ)}</span>
                        </div>
                        <div class="form-group">
                            <label>Total Dépenses:</label>
                            <span class="font-bold text-error">${Calculations.formatFC(calculs.totalDepenses)}</span>
                        </div>
                        <div class="form-group">
                            <label>Total Cahier:</label>
                            <span class="font-bold text-primary">${Calculations.formatFC(calculs.totalCahier)}</span>
                        </div>
                        <div class="form-group">
                            <label>Écart (Expire):</label>
                            <span class="font-bold ${calculs.expireEcart > 1000 ? 'text-error' : ''}">${Calculations.formatFC(calculs.expireEcart)}</span>
                        </div>
                    </div>
                </div>
            `;
            container.style.display = 'block';
        }
    },

    // Calcul en temps réel du rapport
    calculerRapportEnTempsReel() {
        const data = {
            dollars: parseFloat(document.getElementById('rapport-dollars').value) || 0,
            francs: parseFloat(document.getElementById('rapport-francs').value) || 0,
            equity: parseFloat(document.getElementById('rapport-equity').value) || 0,
            gga: parseFloat(document.getElementById('rapport-gga').value) || 0,
            tmb: parseFloat(document.getElementById('rapport-tmb').value) || 0,
            moko: parseFloat(document.getElementById('rapport-moko').value) || 0,
            transport: parseFloat(document.getElementById('rapport-transport').value) || 0,
            achats_produits: parseFloat(document.getElementById('rapport-achats').value) || 0,
            carburant: parseFloat(document.getElementById('rapport-carburant').value) || 0,
            autres_depenses: parseFloat(document.getElementById('rapport-autres').value) || 0,
            total_systeme: parseFloat(document.getElementById('rapport-total-systeme').value) || 0
        };
        
        const calculs = Calculations.calculerRapportJournalier(data);
        
        // Mettre à jour les champs calculés
        const updateField = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.value = Math.round(value).toLocaleString('fr-FR');
        };
        
        updateField('rapport-auto-emoney', calculs.totalEMoney);
        updateField('rapport-auto-ventesj', calculs.totalVentesJ);
        updateField('rapport-auto-depenses', calculs.totalDepenses);
        updateField('rapport-auto-cahier', calculs.totalCahier);
        updateField('rapport-auto-ecart', calculs.expireEcart);
    },

    // ==========================================
    // MODULE PARAMÈTRES
    // ==========================================

    async loadParametres() {
        const params = await DB.params.getAll();
        
        // Remplir le formulaire
        if (params.devise_principale) document.getElementById('param-devise').value = params.devise_principale;
        if (params.taux_change_defaut) document.getElementById('param-taux').value = params.taux_change_defaut;
        if (params.nom_entreprise) document.getElementById('param-entreprise').value = params.nom_entreprise;
        if (params.mois_courant) document.getElementById('param-mois-debut').value = params.mois_courant;
        if (params.annee_courante) document.getElementById('param-annee').value = params.annee_courante;
    },

    async saveParametres(e) {
        e.preventDefault();
        
        const params = {
            devise_principale: document.getElementById('param-devise').value,
            taux_change_defaut: document.getElementById('param-taux').value,
            nom_entreprise: document.getElementById('param-entreprise').value,
            mois_courant: document.getElementById('param-mois-debut').value,
            annee_courante: document.getElementById('param-annee').value
        };
        
        for (const [cle, valeur] of Object.entries(params)) {
            await DB.params.set(cle, valeur);
        }
        
        Export.showToast('Paramètres sauvegardés!', 'success');
        this.loadInitialData();
    },

    // ==========================================
    // UTILITAIRES
    // ==========================================

    populatePharmacieSelect(selectId) {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        select.innerHTML = '<option value="">-- Sélectionner --</option>' +
            this.state.pharmacies.map(p => 
                `<option value="${p.id}">${p.nom}</option>`
            ).join('');
    },

    populateCategoriesSelect(selectId) {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        select.innerHTML = '<option value="">-- Sélectionner --</option>' +
            Calculations.CATEGORIES_DEPENSES.map(cat => 
                `<option value="${cat}">${cat}</option>`
            ).join('');
    },

    formatDate(dateStr) {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    },

    showError(message) {
        alert(message); // Fallback simple
    },

    setupGlobalEvents() {
        // Changement de période dans le header
        const moisSelect = document.getElementById('header-mois');
        const anneeSelect = document.getElementById('header-annee');
        
        if (moisSelect) {
            moisSelect.addEventListener('change', (e) => {
                this.state.currentMois = parseInt(e.target.value);
                this.loadPageData(this.state.currentPage);
            });
        }
        
        if (anneeSelect) {
            anneeSelect.addEventListener('change', (e) => {
                this.state.currentAnnee = parseInt(e.target.value);
                this.loadPageData(this.state.currentPage);
            });
        }
        
        // Statut connexion
        window.addEventListener('online', () => {
            this.state.isOffline = false;
            this.updateOnlineStatus();
        });
        
        window.addEventListener('offline', () => {
            this.state.isOffline = true;
            this.updateOnlineStatus();
        });
        
        this.updateOnlineStatus();
    },

    updateOnlineStatus() {
        const indicator = document.querySelector('.offline-dot');
        if (indicator) {
            indicator.classList.toggle('offline', this.state.isOffline);
        }
    },

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js')
                .then(reg => {
                    console.log('[SW] Service Worker enregistré:', reg.scope);
                })
                .catch(err => {
                    console.log('[SW] Erreur enregistrement SW:', err);
                });
        }
    },

    // ==========================================
    // EXPORTS (Wrappers)
    // ==========================================

    async exportCurrentPage() {
        const page = this.state.currentPage;
        
        switch (page) {
            case 'versements':
                await Export.exportVersementsExcel({ 
                    mois: this.state.currentMois, 
                    annee: this.state.currentAnnee 
                });
                break;
            case 'depenses':
                await Export.exportDepensesExcel({ 
                    mois: this.state.currentMois, 
                    annee: this.state.currentAnnee 
                });
                break;
            case 'livre-comptes':
                await Export.exportLivreComptesCSV({ 
                    mois: this.state.currentMois, 
                    annee: this.state.currentAnnee 
                });
                break;
            case 'dettes':
                await Export.exportDettesCSV();
                break;
            case 'balance':
                await Export.exportBalanceMensuelleCSV(
                    this.state.currentMois, 
                    this.state.currentAnnee
                );
                break;
            default:
                Export.showToast('Export non disponible pour cette page', 'info');
        }
    },

    async importBackup(e) {
        const file = e.target.files[0];
        if (file) {
            await Export.importBackupJSON(file);
        }
    },

    async exportBackup() {
        await Export.exportBackupComplet();
    },

    // ==========================================
    // GESTION UTILISATEURS (ADMIN)
    // ==========================================

    showUserModal(userId = null) {
        if (!authSystem.canDo('canManageUsers')) {
            Export.showToast('Permission refusée - Administrateur requis', 'error');
            return;
        }

        const modal = document.getElementById('user-modal');
        const title = document.getElementById('user-modal-title');
        const form = document.getElementById('user-form');
        
        // Reset form
        form.reset();
        document.getElementById('user-edit-id').value = '';
        document.getElementById('pharmacy-assign-group').style.display = 'none';

        // Charger les pharmacies dans le select
        this.populatePharmacySelect();

        if (userId) {
            // Mode édition
            const user = authSystem.users.find(u => u.id === userId);
            if (user) {
                title.innerHTML = '<i class="fas fa-user-edit"></i> Modifier l\'Utilisateur';
                document.getElementById('user-edit-id').value = userId;
                document.getElementById('user-fullname').value = user.fullName;
                document.getElementById('user-username').value = user.username;
                document.getElementById('user-role').value = user.role;
                document.getElementById('user-notes').value = user.notes || '';
                
                if (user.role === 'manager') {
                    document.getElementById('pharmacy-assign-group').style.display = 'block';
                    document.getElementById('user-pharmacy').value = user.pharmacyId;
                }
            }
        } else {
            // Mode création
            title.innerHTML = '<i class="fas fa-user-plus"></i> Nouvel Utilisateur';
        }

        modal.classList.add('active');
    },

    closeUserModal() {
        document.getElementById('user-modal').classList.remove('active');
    },

    onUserRoleChange() {
        const roleSelect = document.getElementById('user-role');
        const pharmacyGroup = document.getElementById('pharmacy-assign-group');
        
        pharmacyGroup.style.display = roleSelect.value === 'manager' ? 'block' : 'none';
    },

    populatePharmacySelect() {
        const select = document.getElementById('user-pharmacy');
        const pharmacies = this.state.pharmacies || [];
        
        select.innerHTML = pharmacies.map(p => 
            `<option value="${p.id}">${p.name}</option>`
        ).join('');
    },

    saveUser(e) {
        e.preventDefault();

        const editId = document.getElementById('user-edit-id').value;
        const userData = {
            fullName: document.getElementById('user-fullname').value.trim(),
            username: document.getElementById('user-username').value.trim().toLowerCase(),
            password: document.getElementById('user-password').value,
            role: document.getElementById('user-role').value,
            notes: document.getElementById('user-notes').value.trim()
        };

        // Validation
        if (!userData.fullName || !userData.username || !userData.password || !userData.role) {
            Export.showToast('Veuillez remplir tous les champs obligatoires', 'error');
            return;
        }

        // Ajouter la pharmacie pour les managers
        if (userData.role === 'manager') {
            userData.pharmacyId = document.getElementById('user-pharmacy').value;
            const pharmacy = this.state.pharmacies.find(p => p.id === userData.pharmacyId);
            userData.pharmacyName = pharmacy ? pharmacy.name : 'Non assignée';
        } else {
            userData.pharmacyId = 'all';
            userData.pharmacyName = 'Toutes';
        }

        let result;

        if (editId) {
            // Mise à jour
            result = authSystem.updateUser(editId, userData);
        } else {
            // Création
            result = authSystem.createUser(userData);
        }

        if (result.success) {
            this.closeUserModal();
            this.renderUsersTable();
            this.updateUsersStats();
            Export.showToast(editId ? 'Utilisateur mis à jour!' : 'Utilisateur créé!', 'success');
        } else {
            Export.showToast(result.error, 'error');
        }
    },

    editUser(userId) {
        this.showUserModal(userId);
    },

    deleteUser(userId) {
        if (!confirm('Voulez-vous vraiment supprimer cet utilisateur?')) return;

        const result = authSystem.deleteUser(userId);
        if (result.success) {
            this.renderUsersTable();
            this.updateUsersStats();
            Export.showToast('Utilisateur supprimé', 'success');
        } else {
            Export.showToast(result.error, 'error');
        }
    },

    resetUserPassword(userId) {
        const newPassword = prompt('Entrez le nouveau mot de passe (min 6 caractères):');
        if (newPassword && newPassword.length >= 6) {
            const result = authSystem.resetPassword(userId, newPassword);
            if (result.success) {
                Export.showToast('Mot de passe réinitialisé avec succès', 'success');
            } else {
                Export.showToast(result.error, 'error');
            }
        } else if (newPassword) {
            Export.showToast('Le mot de passe doit contenir au moins 6 caractères', 'error');
        }
    },

    renderUsersTable() {
        const tbody = document.getElementById('users-tbody');
        const users = authSystem.getAllUsers();
        const searchQuery = (document.getElementById('user-search')?.value || '').toLowerCase();

        const filteredUsers = users.filter(user => 
            user.fullName.toLowerCase().includes(searchQuery) ||
            user.username.toLowerCase().includes(searchQuery) ||
            user.roleName.toLowerCase().includes(searchQuery) ||
            user.pharmacyName.toLowerCase().includes(searchQuery)
        );

        tbody.innerHTML = filteredUsers.map(user => `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div class="user-avatar" style="width: 32px; height: 32px; font-size: 14px; background-color: ${authSystem.ROLES[user.role.toUpperCase()]?.color || '#666'}">
                            ${authSystem.ROLES[user.role.toUpperCase()]?.icon || '👤'}
                        </div>
                        <div>
                            <strong>${user.fullName}</strong><br>
                            <small class="text-muted">@${user.username}</small>
                        </div>
                    </div>
                </td>
                <td><span class="badge badge-${this.getRoleBadgeClass(user.role)}">${user.roleName}</span></td>
                <td>${user.pharmacyName}</td>
                <td>
                    <span class="badge badge-${user.active ? 'success' : 'danger'}">
                        ${user.active ? 'Actif' : 'Inactif'}
                    </span>
                </td>
                <td>
                    <small>${user.lastLogin ? new Date(user.lastLogin).toLocaleString('fr-FR') : 'Jamais'}</small>
                </td>
                <td>
                    <div class="btn-group" style="gap: 4px;">
                        ${authSystem.canDo('canManageUsers') ? `
                            <button class="btn btn-sm btn-secondary" onclick="App.editUser('${user.id}')" title="Modifier">
                                ✏️
                            </button>
                            <button class="btn btn-sm btn-warning" onclick="App.resetUserPassword('${user.id}')" title="Réinitialiser mot de passe">
                                🔑
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="App.deleteUser('${user.id}')" title="Supprimer">
                                🗑️
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');

        if (filteredUsers.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Aucun utilisateur trouvé</td></tr>`;
        }
    },

    getRoleBadgeClass(role) {
        switch(role) {
            case 'admin': return 'danger';
            case 'manager': return 'success';
            case 'comptable': return 'info';
            default: return 'warning';
        }
    },

    updateUsersStats() {
        const users = authSystem.getAllUsers();
        
        document.getElementById('users-total').textContent = users.length;
        document.getElementById('users-admins').textContent = users.filter(u => u.role === 'admin').length;
        document.getElementById('users-managers').textContent = users.filter(u => u.role === 'manager').length;
        document.getElementById('users-comptables').textContent = users.filter(u => u.role === 'comptable').length;
    },

    filterUsersTable() {
        this.renderUsersTable();
    },

    exportUsersList() {
        const users = authSystem.getAllUsers();
        const csvContent = [
            ['Nom d\'utilisateur', 'Nom complet', 'Rôle', 'Pharmacie', 'Statut', 'Dernière connexion', 'Date création'].join(';'),
            ...users.map(u => [
                u.username,
                u.fullName,
                u.roleName,
                u.pharmacyName,
                u.active ? 'Actif' : 'Inactif',
                u.lastLogin ? new Date(u.lastLogin).toLocaleString('fr-FR') : 'Jamais',
                new Date(u.createdAt).toLocaleString('fr-FR')
            ].join(';'))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `utilisateurs-ladivine-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        authSystem.logAction('DATA_EXPORT', 'Export liste utilisateurs CSV');
        Export.showToast('Liste exportée!', 'success');
    },

    // ==========================================
    // JOURNAL D'AUDIT
    // ==========================================

    loadAuditLog() {
        const filters = {
            action: document.getElementById('audit-filter-action')?.value || '',
            dateFrom: document.getElementById('audit-filter-date-from')?.value || '',
            dateTo: document.getElementById('audit-filter-date-to')?.value || ''
        };

        const logs = authSystem.getAuditLogs(filters);
        this.renderAuditTable(logs);
    },

    renderAuditTable(logs) {
        const tbody = document.getElementById('audit-tbody');

        tbody.innerHTML = logs.slice(0, 100).map(log => `
            <tr>
                <td>
                    <small>${new Date(log.timestamp).toLocaleString('fr-FR')}</small>
                </td>
                <td><strong>${log.userName}</strong></td>
                <td>
                    <span class="badge badge-${this.getRoleBadgeClass(log.userRole)}">${log.userRole.toUpperCase()}</span>
                </td>
                <td>
                    <span class="badge badge-info">${log.action}</span>
                </td>
                <td>${log.details}</td>
                <td><small>${log.pharmacyId !== 'all' ? log.pharmacyId : '-'}</small></td>
            </tr>
        `).join('');

        if (logs.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Aucune entrée dans le journal</td></tr>`;
        }
    },

    clearAuditFilters() {
        document.getElementById('audit-filter-action').value = '';
        document.getElementById('audit-filter-date-from').value = '';
        document.getElementById('audit-filter-date-to').value = '';
        this.loadAuditLog();
    },

    exportAuditLog() {
        const logs = authSystem.getAuditLogs();
        const csvContent = [
            ['Date/Heure', 'Utilisateur', 'Rôle', 'Action', 'Détails', 'Pharmacie'].join(';'),
            ...logs.map(l => [
                new Date(l.timestamp).toLocaleString('fr-FR'),
                l.userName,
                l.userRole,
                l.action,
                `"${l.details.replace(/"/g, '""')}"`,
                l.pharmacyId
            ].join(';'))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `journal-audit-ladivine-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        authSystem.logAction('DATA_EXPORT', 'Export journal audit CSV');
        Export.showToast('Journal d\'audit exporté!', 'success');
    }

};

// ==========================================
// DÉMARRAGE DE L'APPLICATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Exposer globalement pour les attributs onclick
window.App = App;

console.log('[App] Module chargé - API disponible via window.App');
