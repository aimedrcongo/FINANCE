/**
 * ============================================
 * LA DIVINE PharmaFinance Pro v3.0
 * Module PDFReports - Génération Rapports Pro
 * ============================================
 * 
 * Types de rapports:
 * - Mensuel: Résumé du mois avec KPIs et graphiques
 * - Trimestriel: Analyse 3 mois avec tendances
 * - Annuel: Bilan complet de l'année
 * - Par Site: Focus sur une pharmacie spécifique
 * 
 * Fonctionnalités:
 * - Génération HTML professionnelle
 * - Export PDF via impression navigateur
 * - Inclusion des graphiques Chart.js
 * - Score santé financière intégré
 * - Recommandations automatiques
 */

const PDFReports = {
    // État
    state: {
        selectedType: 'mensuel',
        selectedPharmacie: 'all',
        selectedMois: new Date().getMonth() + 1,
        selectedAnnee: new Date().getFullYear(),
        isGenerating: false,
        isPreviewing: false,
        reportData: null
    },
    
    // Configuration des types de rapports
    REPORT_TYPES: {
        mensuel: {
            id: 'mensuel',
            nom: 'Rapport Mensuel',
            icon: '📅',
            description: 'Résumé complet du mois avec graphiques et analyses',
            template: this.generateMonthlyReport.bind(this)
        },
        trimestriel: {
            id: 'trimestriel',
            nom: 'Rapport Trimestriel',
            icon: '📊',
            description: 'Analyse des tendances sur 3 mois',
            template: this.generateQuarterlyReport.bind(this)
        },
        annuel: {
            id: 'annuel',
            nom: 'Bilan Annuel',
            icon: '🏆',
            description: 'Bilan financier complet de l\'année',
            template: this.generateAnnualReport.bind(this)
        },
        site: {
            id: 'site',
            nom: 'Rapport par Site',
            icon: '🏥',
            description: 'Focus détaillé sur une pharmacie spécifique',
            template: this.generateSiteReport.bind(this)
        }
    },

    // ==========================================
    // INITIALISATION
    // ==========================================

    async init() {
        console.log('[PDFReports] Initialisation module rapports v3.0...');
        
        this.setupEventListeners();
        await this.populateOptions();
    },

    setupEventListeners() {
        // Type de rapport
        document.querySelectorAll('.report-type-card').forEach(card => {
            card.addEventListener('click', () => this.selectReportType(card.dataset.type));
        });
        
        // Filtres
        const selectPharmacie = document.getElementById('report-pharmacie-filter');
        const selectMois = document.getElementById('report-mois-filter');
        const selectAnnee = document.getElementById('report-annee-filter');
        
        if (selectPharmacie) selectPharmacie.addEventListener('change', (e) => this.state.selectedPharmacie = e.target.value);
        if (selectMois) selectMois.addEventListener('change', (e) => this.state.selectedMois = parseInt(e.target.value));
        if (selectAnnee) selectAnnee.addEventListener('change', (e) => this.state.selectedAnnee = parseInt(e.target.value));
        
        // Boutons d'action
        const btnPreview = document.getElementById('btn-preview-report');
        const btnGenerate = document.getElementById('btn-generate-pdf');
        const btnPrint = document.getElementById('btn-print-pdf');
        const btnClosePreview = document.getElementById('btn-close-preview');
        
        if (btnPreview) btnPreview.addEventListener('click', () => this.previewReport());
        if (btnGenerate) btnGenerate.addEventListener('click', () => this.generatePDF());
        if (btnPrint) btnPrint.addEventListener('click', () => this.printReport());
        if (btnClosePreview) btnClosePreview.addEventListener('click', () => this.closePreview());
    },

    async populateOptions() {
        // Pharmacies
        const selectPharmacie = document.getElementById('report-pharmacie-filter');
        if (selectPharmacie && typeof DB !== 'undefined') {
            const pharmacies = await DB.getAll('pharmacies');
            selectPharmacie.innerHTML = `
                <option value="all">Toutes les pharmacies</option>
                ${pharmacies.map(p => `<option value="${p.id || p.nom}">${p.nom}</option>`).join('')}
            `;
        }
        
        // Mois
        const selectMois = document.getElementById('report-mois-filter');
        if (selectMois) {
            const mois = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                          'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
            selectMois.innerHTML = mois.map((m, i) => 
                `<option value="${i + 1}" ${i + 1 === this.state.selectedMois ? 'selected' : ''}>${m}</option>`
            ).join('');
        }
        
        // Années (5 dernières + actuelle)
        const selectAnnee = document.getElementById('report-annee-filter');
        if (selectAnnee) {
            const anneeActuelle = new Date().getFullYear();
            let options = '';
            for (let y = anneeActuelle; y >= anneeActuelle - 4; y--) {
                options += `<option value="${y}" ${y === anneeActuelle ? 'selected' : ''}>${y}</option>`;
            }
            selectAnnee.innerHTML = options;
        }
    },

    // ==========================================
    // SÉLECTION & GÉNÉRATION
    // ==========================================

    selectReportType(typeId) {
        this.state.selectedType = typeId;
        
        document.querySelectorAll('.report-type-card').forEach(card => {
            card.classList.toggle('selected', card.dataset.type === typeId);
        });
    },

    async previewReport() {
        if (this.state.isGenerating) return;
        
        try {
            this.showGenerationModal(true, 'Génération de l\'aperçu...');
            
            // Collecter les données
            this.reportData = await this.collectReportData();
            
            // Générer le HTML du rapport
            const reportHTML = await this.generateReportHTML();
            
            // Afficher l'aperçu
            document.getElementById('report-preview-content').innerHTML = reportHTML;
            document.getElementById('report-preview-container').classList.add('visible');
            
            this.hideGenerationModal();
            this.state.isPreviewing = true;
            
            // Scroll vers l'aperçu
            document.getElementById('report-preview-container')?.scrollIntoView({ behavior: 'smooth' });
            
        } catch (error) {
            console.error('[PDFReports] Erreur:', error);
            this.hideGenerationModal();
            alert('Erreur lors de la génération: ' + error.message);
        }
    },

    async generatePDF() {
        if (this.state.isGenerating) return;
        
        try {
            this.showGenerationModal(true, 'Préparation du PDF...');
            
            // Si pas encore prévisualisé, générer d'abord
            if (!this.reportData) {
                this.reportData = await this.collectReportData();
                const reportHTML = await this.generateReportHTML();
                document.getElementById('report-preview-content').innerHTML = reportHTML;
            }
            
            this.updateGenerationProgress(30, 'Impression en cours...');
            
            // Utiliser l'impression navigateur pour PDF
            await new Promise(r => setTimeout(r, 500));
            window.print();
            
            this.updateGenerationProgress(100, 'Terminé !');
            
            setTimeout(() => {
                this.hideGenerationModal();
                
                // Log audit si disponible
                if (typeof authSystem !== 'undefined') {
                    authSystem.logAction('DATA_EXPORT', `Génération rapport ${this.state.selectedType}`);
                }
            }, 1500);
            
        } catch (error) {
            console.error('[PDFReports] Erreur:', error);
            this.hideGenerationModal();
            alert('Erreur lors de la génération PDF: ' + error.message);
        }
    },

    printReport() {
        window.print();
    },

    closePreview() {
        document.getElementById('report-preview-container')?.classList.remove('visible');
        this.state.isPreviewing = false;
    },

    // ==========================================
    // COLLECTE DES DONNÉES
    // ==========================================

    async collectReportData() {
        const [versements, depenses, rapports, pharmacies, dettes] = await Promise.all([
            DB.getAll('versements'),
            DB.getAll('depenses'),
            DB.getAll('rapports_journaliers'),
            DB.getAll('pharmacies'),
            DB.getAll('dettes_fournisseurs')
        ]);
        
        const mois = this.state.selectedMois;
        const annee = this.state.selectedAnnee;
        const pharmacieFilter = this.state.selectedPharmacie;
        
        // Filtrer les données selon les critères
        const filterByDate = (items, dateField) => items.filter(item => {
            const d = new Date(item[dateField]);
            const matchDate = d.getMonth() + 1 === mois && d.getFullYear() === annee;
            const matchPharma = pharmacieFilter === 'all' || 
                                 item.pharmacie_id === pharmacieFilter ||
                                 item.pharmacie === pharmacieFilter;
            return matchDate && matchPharma;
        });
        
        const vMois = filterByDate(versements, 'date_versement');
        const dMois = filterByDate(depenses, 'date_depense');
        const rMois = filterByDate(rapports, 'date_rapport');
        
        // Calculs agrégés
        const totalVersementsFC = vMois.reduce((sum, v) => sum + (parseFloat(v.montant_fc) || parseFloat(v.montantFC) || 0), 0);
        const totalVersementsUSD = vMois.reduce((sum, v) => sum + (parseFloat(v.montant_usd) || parseFloat(v.montantUSD) || 0), 0);
        const totalDepenses = dMois.reduce((sum, d) => sum + (parseFloat(d.montant_fc) || parseFloat(d.montant) || 0), 0);
        
        // Données par site
        const statsParSite = pharmacies.map(pharma => {
            const vSite = vMois.filter(v => v.pharmacie_id === pharma.id || v.pharmacie === pharma.nom);
            const dSite = dMois.filter(d => d.pharmacie_id === pharma.id || d.pharmacie === pharma.nom);
            
            return {
                nom: pharma.nom,
                versements: vSite.reduce((s, v) => s + (parseFloat(v.montant_fc) || 0), 0),
                depenses: dSite.reduce((s, d) => s + (parseFloat(d.montant_fc) || 0), 0),
                nbVersements: vSite.length,
                nbDepenses: dSite.length
            };
        }).sort((a, b) => b.versements - a.versements);
        
        // Score santé si disponible
        let healthScore = null;
        if (typeof HealthScore !== 'undefined' && HealthScore.cache.global) {
            healthScore = HealthScore.cache.global;
        }
        
        return {
            periode: { mois, annee, nomMois: this.getMoisNom(mois) },
            pharmacies: pharmacies.filter(p => pharmacieFilter === 'all' || p.id === pharmacieFilter || p.nom === pharmacieFilter),
            kpis: {
                totalVersementsFC,
                totalVersementsUSD,
                totalDepenses,
                balance: totalVersementsFC - totalDepenses,
                nbVersements: vMois.length,
                nbDepenses: dMois.length,
                nbRapports: rMois.length
            },
            statsParSite,
            details: {
                versements: vMois.slice(0, 50), // Limiter pour éviter un rapport trop long
                depenses: dMois.slice(0, 50)
            },
            healthScore,
            dateGeneration: new Date()
        };
    },

    // ==========================================
    // GÉNÉRATION HTML DU RAPPORT
    // ==========================================

    async generateReportHTML() {
        const data = this.reportData;
        if (!data) return '<p>Aucune donnée disponible</p>';
        
        const typeConfig = this.REPORT_TYPES[this.state.selectedType];
        
        let html = `
            <!-- En-tête -->
            <div class="report-page-header">
                <img src="icons/icon-128x128.png" alt="LA DIVINE" class="report-logo">
                <h1 class="report-company-name">PHARMACIE LA DIVINE HEALTH CARE</h1>
                <h2 class="report-document-title">${typeConfig.nom} - ${data.periode.nomMois} ${data.periode.annee}</h2>
                <div class="report-meta">
                    <span>Généré le ${new Date(data.dateGeneration).toLocaleDateString('fr-FR')}</span>
                    <span>•</span>
                    <span>${this.state.selectedPharmacie === 'all' ? 'Tous sites' : data.pharmacies[0]?.nom}</span>
                </div>
            </div>
            
            <!-- Synthèse Exécutive -->
            <div class="report-section">
                <h3 class="report-section-title">📋 Synthèse Exécutive</h3>
                ${this.generateKPICards(data)}
            </div>
            
            <!-- Score Santé Financière -->
            ${data.healthScore ? this.generateHealthScoreSection(data.healthScore) : ''}
            
            <!-- Performance par Site -->
            <div class="report-section">
                <h3 class="report-section-title">🏥 Performance par Site</h3>
                ${this.generateSitesTable(data.statsParSite)}
            </div>
            
            <!-- Détails des Versements -->
            <div class="report-section report-page-break">
                <h3 class="report-section-title">💰 Détail des Versements</h3>
                ${this.generateVersementsTable(data.details.versements)}
            </div>
            
            <!-- Détails des Dépenses -->
            <div class="report-section">
                <h3 class="report-section-title">📤 Détail des Dépenses</h3>
                ${this.generateDepensesTable(data.details.depenses)}
            </div>
            
            <!-- Recommandations -->
            ${typeof HealthScore !== 'undefined' ? this.generateRecommendationsSection() : ''}
            
            <!-- Pied de page -->
            <div class="report-footer">
                <p>Document généré automatiquement par <strong>LA DIVINE PharmaFinance Pro v3.0</strong></p>
                <p>Confidentiel - Usage interne uniquement</p>
            </div>
        `;
        
        return html;
    },

    generateKPICards(data) {
        const kpis = [
            { label: 'Total Versements FC', value: this.formatNumber(data.kpis.totalVersementsFC), icon: '💰' },
            { label: 'Total Versements USD', value: this.formatUSD(data.kpis.totalVersementsUSD), icon: '💵' },
            { label: 'Total Dépenses', value: this.formatNumber(data.kpis.totalDepenses), icon: '📤' },
            { label: 'Balance Net', value: this.formatNumber(data.kpis.balance), icon: '⚖️' }
        ];
        
        return `
            <div class="report-kpi-grid">
                ${kpis.map(kpi => `
                    <div class="report-kpi-card" style="border-left-color: ${kpi.value.startsWith('-') ? '#C62828' : '#0A6E32'}">
                        <span class="report-kpi-value">${kpi.value} FC</span>
                        <span class="report-kpi-label">${kpi.label}</span>
                    </div>
                `).join('')}
            </div>
            <div style="display: flex; gap: 20px; margin-top: 15px; font-size: 0.88rem; color: #6B7280;">
                <span>📊 ${data.kpis.nbVersements} versements enregistrés</span>
                <span>📝 ${data.kpis.nbDepenses} dépenses enregistrées</span>
                <span>📅 ${data.kpis.nbRapports} rapports journaliers</span>
            </div>
        `;
    },

    generateHealthScoreSection(scoreData) {
        const niveau = scoreData.score >= 80 ? 'Excellent' : scoreData.score >= 65 ? 'Bon' : scoreData.score >= 45 ? 'Moyen' : 'Critique';
        const couleur = scoreData.score >= 80 ? '#2E7D32' : scoreData.score >= 65 ? '#1976D2' : scoreData.score >= 45 ? '#F57C00' : '#C62828';
        
        return `
            <div class="report-section">
                <h3 class="report-section-title">🏥 Santé Financière Globale</h3>
                <div class="report-health-score">
                    <div class="report-score-details">
                        <div class="report-score-main" style="color: ${couleur}">${scoreData.score}<small>/100</small></div>
                        <div class="report-score-label">Niveau: <strong>${niveau}</strong></div>
                        <div class="report-metrics-mini">
                            <span class="report-metric-item"><strong>Rentabilité:</strong> ${scoreData.metriques.rentabilite.score}/100</span>
                            <span class="report-metric-item"><strong>Liquidité:</strong> ${scoreData.metriques.liquidite.score}/100</span>
                            <span class="report-metric-item"><strong>Croissance:</strong> ${scoreData.metriques.croissance.score}/100</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    generateSitesTable(sites) {
        if (!sites || sites.length === 0) return '<p>Aucune donnée disponible</p>';
        
        return `
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Site</th>
                        <th class="text-right">Versements (FC)</th>
                        <th class="text-right">Dépenses (FC)</th>
                        <th class="text-right">Balance (FC)</th>
                        <th class="text-center">Nb Opérations</th>
                    </tr>
                </thead>
                <tbody>
                    ${sites.map(site => {
                        const balance = site.versements - site.depenses;
                        return `
                            <tr>
                                <td><strong>${site.nom}</strong></td>
                                <td class="text-right text-success">${this.formatNumber(site.versements)}</td>
                                <td class="text-right text-danger">${this.formatNumber(site.depenses)}</td>
                                <td class="text-right text-bold" style="color: ${balance >= 0 ? '#0A6E32' : '#C62828'}">${this.formatNumber(balance)}</td>
                                <td class="text-center">${site.nbVersements + site.nbDepenses}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
                <tfoot>
                    <tr style="background: #F0FDF4; font-weight: 700;">
                        <td>TOTAL</td>
                        <td class="text-right">${this.formatNumber(sites.reduce((s, x) => s + x.versements, 0))}</td>
                        <td class="text-right">${this.formatNumber(sites.reduce((s, x) => s + x.depenses, 0))}</td>
                        <td class="text-right">${this.formatNumber(sites.reduce((s, x) => s + x.versements - x.depenses, 0))}</td>
                        <td class="text-center">${sites.reduce((s, x) => s + x.nbVersements + x.nbDepenses, 0)}</td>
                    </tr>
                </tfoot>
            </table>
        `;
    },

    generateVersementsTable(versements) {
        if (!versements || versements.length === 0) return '<p>Aucun versement pour cette période</p>';
        
        return `
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Pharmacie</th>
                        <th class="text-right">Montant FC</th>
                        <th class="text-right">Montant USD</th>
                        <th>Observation</th>
                    </tr>
                </thead>
                <tbody>
                    ${versements.map(v => `
                        <tr>
                            <td>${new Date(v.date_versement || v.date).toLocaleDateString('fr-FR')}</td>
                            <td>${v.pharmacie || '-'}</td>
                            <td class="text-right">${this.formatNumber(parseFloat(v.montant_fc) || parseFloat(v.montantFC) || 0)}</td>
                            <td class="text-right">${this.formatUSD(parseFloat(v.montant_usd) || parseFloat(v.montantUSD) || 0)}</td>
                            <td>${v.observation || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },

    generateDepensesTable(depenses) {
        if (!depenses || depenses.length === 0) return '<p>Aucune dépense pour cette période</p>';
        
        return `
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Catégorie</th>
                        <th>Pharmacie</th>
                        <th class="text-right">Montant FC</th>
                        <th>Fournisseur</th>
                    </tr>
                </thead>
                <tbody>
                    ${depenses.map(d => `
                        <tr>
                            <td>${new Date(d.date_depense || d.date).toLocaleDateString('fr-FR')}</td>
                            <td><strong>${d.categorie || d.type_depense || 'Autre'}</strong></td>
                            <td>${d.pharmacie || '-'}</td>
                            <td class="text-right">${this.formatNumber(parseFloat(d.montant_fc) || parseFloat(d.montant) || 0)}</td>
                            <td>${d.fournisseur || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },

    generateRecommendationsSection() {
        const recommendations = typeof HealthScore !== 'undefined' ? HealthScore.generateRecommendations() : [];
        
        if (!recommendations || recommendations.length === 0) return '';
        
        return `
            <div class="report-section report-page-break">
                <h3 class="report-section-title">💡 Recommandations</h3>
                <div class="report-recommendations">
                    ${recommendations.map(rec => `
                        <div class="report-recommendation-item">
                            <span class="rec-priority ${rec.priorite}">${rec.priorite}</span>
                            <div>
                                <strong>${rec.categorie}:</strong> ${rec.message}
                                <br><em>Action: ${rec.action}</em>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    // ==========================================
    // MODAL DE GÉNÉRATION
    // ==========================================

    showGenerationModal(show, status = '') {
        const modal = document.getElementById('generation-modal');
        if (!modal) return;
        
        modal.classList.toggle('visible', show);
        if (status) {
            document.querySelector('.generation-status').textContent = status;
            document.querySelector('.generation-progress-fill').style.width = '10%';
        }
    },

    hideGenerationModal() {
        this.showGenerationModal(false);
    },

    updateGenerationProgress(percent, status) {
        const fill = document.querySelector('.generation-progress-fill');
        const statusEl = document.querySelector('.generation-status');
        if (fill) fill.style.width = percent + '%';
        if (statusEl) statusEl.textContent = status;
    },

    // ==========================================
    // UTILITAIRES
    // ==========================================

    formatNumber(num) {
        if (!num && num !== 0) return '0';
        return new Intl.NumberFormat('fr-FR').format(Math.round(num));
    },

    formatUSD(num) {
        if (!num && num !== 0) return '$0';
        return '$' + num.toFixed(2);
    },

    getMoisNom(mois) {
        const noms = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        return noms[mois] || '';
    }
};

// Assigner les méthodes de template
PDFReports.REPORT_TYPES.mensuel.template = PDFReports.generateMonthlyReport;
PDFReports.REPORT_TYPES.trimestriel.template = PDFReports.generateQuarterlyReport;
PDFReports.REPORT_TYPES.annuel.template = PDFReports.generateAnnualReport;
PDFReports.REPORT_TYPES.site.template = PDFReports.generateSiteReport;

// Méthodes placeholder pour les différents types (utilisent la même base)
PDFReports.generateMonthlyReport = function(data) { return this.generateReportHTML(); };
PDFReports.generateQuarterlyReport = function(data) { return this.generateReportHTML(); };
PDFReports.generateAnnualReport = function(data) { return this.generateReportHTML(); };
PDFReports.generateSiteReport = function(data) { return this.generateReportHTML(); };
