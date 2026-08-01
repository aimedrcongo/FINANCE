/**
 * DivFinance Pro v3.2 - Main Application Logic
 * Complete data management, calculations, and UI functionality
 */

class DivFinanceApp {
    constructor() {
        this.STORAGE_PREFIX = 'divfinance_';
        
        // Storage Keys
        this.STORAGE_KEYS = {
            RAPPORTS_JOURNALIERS: `${this.STORAGE_PREFIX}rapports_journaliers`,
            DEPENSES: `${this.STORAGE_PREFIX}depenses`,
            VERSEMENTS: `${this.STORAGE_PREFIX}versements`,
            DETTES_FOURNISSEURS: `${this.STORAGE_PREFIX}dettes_fournisseurs`,
            SETTINGS: `${this.STORAGE_PREFIX}settings`,
            CONVERSION_RATE: `${this.STORAGE_PREFIX}conversion_rate`
        };

        // Default conversion rate (FC per USD)
        this.DEFAULT_CONVERSION_RATE = 2800;

        // Expense categories from Excel
        this.EXPENSE_CATEGORIES = [
            { id: 'moon', name: 'MOON (Fournisseur)', type: 'fournisseur' },
            { id: 'unique', name: 'UNIQUE (Fournisseur)', type: 'fournisseur' },
            { id: 'divers', name: 'DIVERS', type: 'divers' },
            { id: 'transport_produits', name: 'TRANSPORT PRODUITS ET EXPEDITION', type: 'transport' },
            { id: 'entretien_moto', name: 'ENTRETIEN MOTO ET GROUPE ELECTROGENE', type: 'entretien' },
            { id: 'demande_fonds', name: 'DEMANDE DE FONDS', type: 'fonds' },
            { id: 'transport_agents', name: 'TRANSPORT AGENTS', type: 'transport' },
            { id: 'carburant', name: 'CARBURANT', type: 'carburant' },
            { id: 'travaux_boss', name: 'TRAVAUX BOSS', type: 'travaux' },
            { id: 'tegermo_taxes', name: 'TEGERMO ET TAXES', type: 'taxes' },
            { id: 'salaire_fermiers', name: 'SALAIRE FERMIERS', type: 'salaire' },
            { id: 'promed', name: 'PROMED', type: 'fournisseur' },
            { id: 'loer', name: 'LOER', type: 'fournisseur' },
            { id: 'kin_med', name: 'KIN MED', type: 'fournisseur' },
            { id: 'compte_moussa', name: 'COMPTE MOUSSA', type: 'divers' },
            { id: 'travaux_pha_depot', name: 'TRAVAUX PHA ET DEPOT', type: 'travaux' }
        ];

        // E-Money payment methods
        this.EMONEY_METHODS = ['equity', 'gga', 'tmb', 'moko'];

        // Initialize
        this.init();
    }

    /**
     * Initialize application
     */
    init() {
        this.initStorage();
        this.loadSettings();
    }

    /**
     * Initialize localStorage with default structures
     */
    initStorage() {
        const keys = [
            this.STORAGE_KEYS.RAPPORTS_JOURNALIERS,
            this.STORAGE_KEYS.DEPENSES,
            this.STORAGE_KEYS.VERSEMENTS,
            this.STORAGE_KEYS.DETTES_FOURNISSEURS
        ];

        keys.forEach(key => {
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, JSON.stringify([]));
            }
        });

        // Conversion rate
        if (!localStorage.getItem(this.STORAGE_KEYS.CONVERSION_RATE)) {
            localStorage.setItem(this.STORAGE_KEYS.CONVERSION_RATE, this.DEFAULT_CONVERSION_RATE.toString());
        }
    }

    /**
     * Load settings
     */
    loadSettings() {
        const settings = localStorage.getItem(this.STORAGE_KEYS.SETTINGS);
        this.settings = settings ? JSON.parse(settings) : {
            conversionRate: this.getConversionRate(),
            currencySymbol: '$',
            currencyFC: 'FC',
            companyName: 'LA DIVINE Health Care',
            reportFooter: 'Document généré par DivFinance Pro v3.2'
        };
    }

    /**
     * Get/Set conversion rate
     */
    getConversionRate() {
        return parseFloat(localStorage.getItem(this.STORAGE_KEYS.CONVERSION_RATE)) || this.DEFAULT_CONVERSION_RATE;
    }

    setConversionRate(rate) {
        localStorage.setItem(this.STORAGE_KEYS.CONVERSION_RATE, rate.toString());
        this.settings.conversionRate = rate;
    }

    // ============================================
    // DATA MANAGEMENT - RAPPORT JOURNALIER
    // ============================================

    /**
     * Save daily report (Rapport Journalier)
     */
    saveRapportJournalier(data) {
        const rapports = this.getRapportsJournaliers();
        
        const rapport = {
            id: `rj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            date: data.date,
            pharmacyId: data.pharmacyId,
            pharmacyName: data.pharmacyName,
            
            // VENTE JOURNALIERE
            venteUsd: parseFloat(data.venteUsd) || 0,
            venteFc: parseFloat(data.venteFc) || 0,
            
            // PAIEMENT E-MONEY
            emoneyEquity: parseFloat(data.emoneyEquity) || 0,
            emoneyGga: parseFloat(data.emoneyGga) || 0,
            emoneyTmb: parseFloat(data.emoneyTmb) || 0,
            emoneyMoko: parseFloat(data.emoneyMoko) || 0,
            
            // DEPENSES
            depenseTransport: parseFloat(data.depenseTransport) || 0,
            depenseAchats: parseFloat(data.depenseAchats) || 0,
            depenseCarburant: parseFloat(data.depenseCarburant) || 0,
            depenseAutres: parseFloat(data.depenseAutres) || 0,
            
            // TOTALS (calculated)
            totalEmoney: this.calculateTotalEmoney(data),
            totalDepenses: this.calculateTotalDepensesRJ(data),
            totalVentes: this.calculateTotalVentes(data),
            totalCahier: parseFloat(data.totalCahier) || 0,
            totalSysteme: this.calculateTotalSysteme(data),
            
            // Produit Expiré
            produitExpire: data.produitExpire || false,
            produitExpireMontant: parseFloat(data.produitExpireMontant) || 0,
            
            // Metadata
            createdBy: divFinanceAuth.getCurrentUser()?.fullName || 'Inconnu',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Check for existing report for same date/pharmacy and update or add
        const existingIndex = rapports.findIndex(r => 
            r.date === data.date && r.pharmacyId === data.pharmacyId
        );

        if (existingIndex >= 0) {
            rapport.id = rapports[existingIndex].id;
            rapport.createdAt = rapports[existingIndex].createdAt;
            rapports[existingIndex] = rapport;
        } else {
            rapports.push(rapport);
        }

        localStorage.setItem(this.STORAGE_KEYS.RAPPORTS_JOURNALIERS, JSON.stringify(rapports));
        
        return { success: true, rapport, message: 'Rapport journalier enregistré avec succès.' };
    }

    /**
     * Get all daily reports
     */
    getRapportsJournaliers(filters = {}) {
        let rapports = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.RAPPORTS_JOURNALIERS)) || [];

        // Apply filters
        if (filters.pharmacyId) {
            rapports = rapports.filter(r => r.pharmacyId === filters.pharmacyId);
        }
        if (filters.dateFrom) {
            rapports = rapports.filter(r => r.date >= filters.dateFrom);
        }
        if (filters.dateTo) {
            rapports = rapports.filter(r => r.date <= filters.dateTo);
        }
        if (filters.month) {
            rapports = rapports.filter(r => r.date.startsWith(filters.month));
        }

        // Sort by date descending
        rapports.sort((a, b) => new Date(b.date) - new Date(a.date));

        return rapports;
    }

    /**
     * Get single daily report
     */
    getRapportJournalier(id) {
        const rapports = this.getRapportsJournaliers();
        return rapports.find(r => r.id === id) || null;
    }

    /**
     * Delete daily report
     */
    deleteRapportJournalier(id) {
        let rapports = this.getRapportsJournaliers();
        rapports = rapports.filter(r => r.id !== id);
        localStorage.setItem(this.STORAGE_KEYS.RAPPORTS_JOURNALIERS, JSON.stringify(rapports));
        return { success: true, message: 'Rapport supprimé.' };
    }

    // ============================================
    // CALCULATIONS - RAPPORT JOURNALIER
    // ============================================

    calculateTotalEmoney(data) {
        return (parseFloat(data.emoneyEquity) || 0) +
               (parseFloat(data.emoneyGga) || 0) +
               (parseFloat(data.emoneyTmb) || 0) +
               (parseFloat(data.emoneyMoko) || 0);
    }

    calculateTotalDepensesRJ(data) {
        return (parseFloat(data.depenseTransport) || 0) +
               (parseFloat(data.depenseAchats) || 0) +
               (parseFloat(data.depenseCarburant) || 0) +
               (parseFloat(data.depenseAutres) || 0);
    }

    calculateTotalVentes(data) {
        return (parseFloat(data.venteUsd) || 0) + 
               ((parseFloat(data.venteFc) || 0) / this.getConversionRate());
    }

    calculateTotalSysteme(data) {
        return this.calculateTotalVentes(data) + 
               (this.calculateTotalEmoney(data) / this.getConversionRate()) -
               (this.calculateTotalDepensesRJ(data) / this.getConversionRate());
    }

    // ============================================
    // DATA MANAGEMENT - DEPENSES
    // ============================================

    /**
     * Save expense (Dépense)
     */
    saveDepense(data) {
        const depenses = this.getDepenses();
        
        const depense = {
            id: `dep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            date: data.date,
            pharmacyId: data.pharmacyId,
            pharmacyName: data.pharmacyName,
            
            // All expense categories
            moon: parseFloat(data.moon) || 0,
            unique: parseFloat(data.unique) || 0,
            divers: parseFloat(data.divers) || 0,
            transportProduits: parseFloat(data.transportProduits) || 0,
            entretienMoto: parseFloat(data.entretienMoto) || 0,
            demandeFonds: parseFloat(data.demandeFonds) || 0,
            transportAgents: parseFloat(data.transportAgents) || 0,
            carburant: parseFloat(data.carburant) || 0,
            travauxBoss: parseFloat(data.travauxBoss) || 0,
            tegermoTaxes: parseFloat(data.tegermoTaxes) || 0,
            salaireFermiers: parseFloat(data.salaireFermiers) || 0,
            promed: parseFloat(data.promed) || 0,
            loer: parseFloat(data.loer) || 0,
            kinMed: parseFloat(data.kinMed) || 0,
            compteMoussa: parseFloat(data.compteMoussa) || 0,
            travauxPhaDepot: parseFloat(data.travauxPhaDepot) || 0,
            
            // Total calculated
            totalite: this.calculateTotalDepense(data),
            
            // Description/Notes
            description: data.description || '',
            
            // Metadata
            createdBy: divFinanceAuth.getCurrentUser()?.fullName || 'Inconnu',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        depenses.push(depense);
        localStorage.setItem(this.STORAGE_KEYS.DEPENSES, JSON.stringify(depenses));
        
        return { success: true, depense, message: 'Dépense enregistrée avec succès.' };
    }

    /**
     * Get all expenses
     */
    getDepenses(filters = {}) {
        let depenses = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.DEPENSES)) || [];

        if (filters.pharmacyId) {
            depenses = depenses.filter(d => d.pharmacyId === filters.pharmacyId);
        }
        if (filters.dateFrom) {
            depenses = depenses.filter(d => d.date >= filters.dateFrom);
        }
        if (filters.dateTo) {
            depenses = depenses.filter(d => d.date <= filters.dateTo);
        }
        if (filters.category) {
            depenses = depenses.filter(d => d[filters.category] > 0);
        }
        if (filters.month) {
            depenses = depenses.filter(d => d.date.startsWith(filters.month));
        }

        depenses.sort((a, b) => new Date(b.date) - new Date(a.date));

        return depenses;
    }

    /**
     * Calculate total for expense entry
     */
    calculateTotalDepense(data) {
        let total = 0;
        this.EXPENSE_CATEGORIES.forEach(cat => {
            total += parseFloat(data[cat.id]) || 0;
        });
        return total;
    }

    /**
     * Delete expense
     */
    deleteDepense(id) {
        let depenses = this.getDepenses();
        depenses = depenses.filter(d => d.id !== id);
        localStorage.setItem(this.STORAGE_KEYS.DEPENSES, JSON.stringify(depenses));
        return { success: true, message: 'Dépense supprimée.' };
    }

    // ============================================
    // DATA MANAGEMENT - VERSEMENTS
    // ============================================

    /**
     * Save payment/deposit (Versement)
     */
    saveVersement(data) {
        const versements = this.getVersements();
        
        const versement = {
            id: `ver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            date: data.date,
            pharmacyId: data.pharmacyId,
            pharmacyName: data.pharmacyName,
            montantUsd: parseFloat(data.montantUsd) || 0,
            montantFc: parseFloat(data.montantFc) || 0,
            modeVersement: data.modeVersement || 'especes',
            reference: data.reference || '',
            notes: data.notes || '',
            
            // Metadata
            createdBy: divFinanceAuth.getCurrentUser()?.fullName || 'Inconnu',
            createdAt: new Date().toISOString()
        };

        versements.push(versement);
        localStorage.setItem(this.STORAGE_KEYS.VERSEMENTS, JSON.stringify(versements));
        
        return { success: true, versement, message: 'Versement enregistré avec succès.' };
    }

    /**
     * Get all payments
     */
    getVersements(filters = {}) {
        let versements = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.VERSEMENTS)) || [];

        if (filters.pharmacyId) {
            versements = versements.filter(v => v.pharmacyId === filters.pharmacyLId);
        }
        if (filters.dateFrom) {
            versements = versements.filter(v => v.date >= filters.dateFrom);
        }
        if (filters.dateTo) {
            versements = versements.filter(v => v.date <= filters.dateTo);
        }
        if (filters.month) {
            versements = versements.filter(v => v.date.startsWith(filters.month));
        }

        versements.sort((a, b) => new Date(b.date) - new Date(a.date));

        return versements;
    }

    /**
     * Delete payment
     */
    deleteVersement(id) {
        let versements = this.getVersements();
        versements = versements.filter(v => v.id !== id);
        localStorage.setItem(this.STORAGE_KEYS.VERSEMENTS, JSON.stringify(versements));
        return { success: true, message: 'Versement supprimé.' };
    }

    // ============================================
    // DATA MANAGEMENT - DETTES FOURNISSEURS
    // ============================================

    /**
     * Save supplier debt
     */
    saveDetteFournisseur(data) {
        const dettes = this.getDettesFournisseurs();
        
        const dette = {
            id: `det_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            fournisseurId: data.fournisseurId,
            fournisseurName: data.fournisseurName,
            montantInitial: parseFloat(data.montantInitial) || 0,
            montantPaye: parseFloat(data.montantPaye) || 0,
            montantRestant: (parseFloat(data.montantInitial) || 0) - (parseFloat(data.montantPaye) || 0),
            dateDette: data.dateDette,
            dateEcheance: data.dateEcheance || '',
            statut: this.calculateDetteStatut(data.dateEcheance, (parseFloat(data.montantInitial) || 0) - (parseFloat(data.montantPaye) || 0)),
            description: data.description || '',
            pharmacyId: data.pharmacyId || null,
            
            // Metadata
            createdBy: divFinanceAuth.getCurrentUser()?.fullName || 'Inconnu',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        dettes.push(dette);
        localStorage.setItem(this.STORAGE_KEYS.DETTES_FOURNISSEURS, JSON.stringify(dettes));
        
        return { success: true, dette, message: 'Dette enregistrée avec succès.' };
    }

    /**
     * Get all supplier debts
     */
    getDettesFournisseurs(filters = {}) {
        let dettes = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.DETTES_FOURNISSEURS)) || [];

        if (filters.fournisseurId) {
            dettes = dettes.filter(d => d.fournisseurId === filters.fournisseurId);
        }
        if (filters.statut) {
            dettes = dettes.filter(d => d.statut === filters.statut);
        }
        if (filters.pharmacyId) {
            dettes = dettes.filter(d => d.pharmacyId === filters.pharmacyId);
        }

        dettes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return dettes;
    }

    /**
     * Update debt payment
     */
    updateDettePayment(id, paymentAmount) {
        let dettes = this.getDettesFournisseurs();
        const index = dettes.findIndex(d => d.id === id);

        if (index >= 0) {
            dettes[index].montantPaye += parseFloat(paymentAmount) || 0;
            dettes[index].montantRestant = dettes[index].montantInitial - dettes[index].montantPaye;
            dettes[index].statut = this.calculateDetteStatut(
                dettes[index].dateEcheance, 
                dettes[index].montantRestant
            );
            dettes[index].updatedAt = new Date().toISOString();

            localStorage.setItem(this.STORAGE_KEYS.DETTES_FOURNISSEURS, JSON.stringify(dettes));
            return { success: true, dette: dettes[index], message: 'Paiement enregistré.' };
        }

        return { success: false, error: 'Dette non trouvée.' };
    }

    /**
     * Calculate debt status
     */
    calculateDetteStatut(dateEcheance, montantRestant) {
        if (montantRestant <= 0) return 'payee';
        if (dateEcheance && new Date(dateEcheance) < new Date()) return 'retard';
        return 'encours';
    }

    /**
     * Delete debt
     */
    deleteDetteFournisseur(id) {
        let dettes = this.getDettesFournisseurs();
        dettes = dettes.filter(d => d.id !== id);
        localStorage.setItem(this.STORAGE_KEYS.DETTES_FOURNISSEURS, JSON.stringify(dettes));
        return { success: true, message: 'Dette supprimée.' };
    }

    // ============================================
    // DASHBOARD KPIs & STATISTICS
    // ============================================

    /**
     * Get dashboard KPIs for today
     */
    getDashboardKPIs(todayDate) {
        const today = todayDate || this.formatDateForStorage(new Date());
        const currentMonth = today.substring(0, 7); // YYYY-MM
        
        // Today's reports
        const todaysReports = this.getRapportsJournaliers({ dateFrom: today, dateTo: today });
        const todaysDepenses = this.getDepenses({ dateFrom: today, dateTo: today });

        // Monthly data
        const monthReports = this.getRapportsJournaliers({ month: currentMonth });
        const monthDepenses = this.getDepenses({ month: currentMonth });

        // Calculations
        const ventesJourUsd = todaysReports.reduce((sum, r) => sum + r.venteUsd, 0);
        const ventesJourFc = todaysReports.reduce((sum, r) => sum + r.venteFc, 0);
        const ventesJourTotal = ventesJourUsd + (ventesJourFc / this.getConversionRate());

        const depensesJour = todaysDepenses.reduce((sum, d) => sum + d.totalite, 0);
        const depensesJourRj = todaysReports.reduce((sum, r) => sum + r.totalDepenses, 0);
        const totalDepensesJour = depensesJour + depensesJourRj;

        // Cash balance (from reports)
        const soldeCaisse = todaysReports.reduce((sum, r) => sum + r.totalCahier, 0);

        // Global variance
        const totalSysteme = todaysReports.reduce((sum, r) => sum + r.totalSysteme, 0);
        const ecartGlobal = soldeCaisse - totalSysteme;

        // Active debts
        const activeDebts = this.getDettesFournisseurs().filter(d => d.montantRestant > 0);
        const lateDebts = activeDebts.filter(d => d.statut === 'retard');

        // Active pharmacies
        const pharmacies = divFinanceAuth.getPharmacies();
        const activePharmacies = pharmacies.filter(p => p.isActive).length;

        // Monthly summary
        const monthVentes = monthReports.reduce((sum, r) => sum + r.totalVentes, 0);
        const monthDepensesTotal = monthDepenses.reduce((sum, d) => sum + d.totalite, 0) + 
                                   monthReports.reduce((sum, r) => sum + r.totalDepenses, 0);
        const monthBenefice = monthVentes - (monthDepensesTotal / this.getConversionRate());

        return {
            // Today KPIs
            ventesDuJour: ventesJourTotal,
            ventesDuJourUsd: ventesJourUsd,
            ventesDuJourFc: ventesJourFc,
            depensesDuJour: totalDepensesJour,
            soldeCaisse: soldeCaisse,
            ecartGlobal: ecartGlobal,

            // Status counts
            dettesActives: activeDebts.length,
            dettesEnRetard: lateDebts.length,
            pharmaciesActives: activePharmacies,
            rapportsAujourdhui: todaysReports.length,

            // Monthly summary
            moisVentes: monthVentes,
            moisDepenses: monthDepensesTotal,
            moisBeneficeNet: monthBenefice,

            // Raw data for charts
            todaysReports,
            todaysDepenses,
            activeDebts,
            lateDebts
        };
    }

    /**
     * Get balance by pharmacy (for Balance par Site tab)
     */
    getBalanceBySite(month) {
        const pharmacies = divFinanceAuth.getPharmacies();
        const reports = this.getRapportsJournaliers({ month: month });
        const depenses = this.getDepenses({ month: month });
        const versements = this.getVersements({ month: month });

        return pharmacies.map(pharma => {
            const pharmaReports = reports.filter(r => r.pharmacyId === pharma.id);
            const pharmaDepenses = depenses.filter(d => d.pharmacyId === pharma.id);
            const pharmaVersements = versements.filter(v => v.pharmacyId === pharma.id);

            const totalVentes = pharmaReports.reduce((sum, r) => sum + r.totalVentes, 0);
            const totalDepenses = pharmaDepenses.reduce((sum, d) => sum + d.totalite, 0) +
                                 pharmaReports.reduce((sum, r) => sum + r.totalDepenses, 0);
            const totalVersementsUsd = pharmaVersements.reduce((sum, v) => sum + v.montantUsd, 0);
            const totalVersementsFc = pharmaVersements.reduce((sum, v) => sum + v.montantFc, 0);

            return {
                pharmacyId: pharma.id,
                pharmacyName: pharma.name,
                shortName: pharma.shortName,
                code: pharma.code,
                totalVentes,
                totalDepenses,
                totalVersementsUsd,
                totalVersementsFc,
                solde: totalVentes - (totalDepenses / this.getConversionRate()),
                nombreRapports: pharmaReports.length
            };
        });
    }

    /**
     * Get Grand Livre Depenses (expense matrix)
     */
    getGrandLivredDepenses(month) {
        const pharmacies = divFinanceAuth.getPharmacies();
        const depenses = this.getDepenses({ month: month });

        const matrix = {
            categories: this.EXPENSE_CATEGORIES,
            sites: [],
            totals: {}
        };

        // Initialize totals
        this.EXPENSE_CATEGORIES.forEach(cat => {
            matrix.totals[cat.id] = 0;
        });
        matrix.totals.grandTotal = 0;

        pharmacies.forEach(pharma => {
            const pharmaDepenses = depenses.filter(d => d.pharmacyId === pharma.id);
            
            const siteData = {
                pharmacyId: pharma.id,
                pharmacyName: pharma.name,
                values: {}
            };

            let siteTotal = 0;

            this.EXPENSE_CATEGORIES.forEach(cat => {
                const catTotal = pharmaDepenses.reduce((sum, d) => sum + (d[cat.id] || 0), 0);
                siteData.values[cat.id] = catTotal;
                matrix.totals[cat.id] += catTotal;
                siteTotal += catTotal;
            });

            siteData.total = siteTotal;
            matrix.totals.grandTotal += siteTotal;
            matrix.sites.push(siteData);
        });

        return matrix;
    }

    /**
     * Get treasury/cash flow data
     */
    getTresorerie(month) {
        const reports = this.getRapportsJournaliers({ month: month });
        const depenses = this.getDepenses({ month: month });
        const versements = this.getVersements({ month: month });

        // Group by date
        const dates = [...new Set([
            ...reports.map(r => r.date),
            ...depenses.map(d => d.date),
            ...versements.map(v => v.date)
        ])].sort();

        let soldeCumule = 0;

        return dates.map(date => {
            const dayReports = reports.filter(r => r.date === date);
            const dayDepenses = depenses.filter(d => d.date === date);
            const dayVersements = versements.filter(v => v.date === date);

            const entrees = dayReports.reduce((sum, r) => sum + r.venteUsd + (r.venteFc / this.getConversionRate()), 0) +
                          dayVersements.reduce((sum, v) => sum + v.montantUsd + (v.montantFc / this.getConversionRate()), 0);
            
            const sorties = dayDepenses.reduce((sum, d) => sum + (d.totalite / this.getConversionRate()), 0) +
                           dayReports.reduce((sum, r) => sum + (r.totalDepenses / this.getConversionRate()), 0);

            soldeCumule += entrees - sorties;

            return {
                date,
                entrees,
                sorties,
                net: entrees - sorties,
                soldeCumule,
                statut: soldeCumule >= 0 ? 'positif' : 'negatif'
            };
        });
    }

    // ============================================
    // EXPORT FUNCTIONALITY
    // ============================================

    /**
     * Export data to CSV
     */
    exportToCSV(data, filename, headers) {
        if (!data || data.length === 0) {
            divFinanceAuth.showToast('Aucune donnée à exporter.', 'warning');
            return;
        }

        // Build CSV content
        const headerRow = headers.map(h => `"${h.label}"`).join(',');
        const rows = data.map(item => 
            headers.map(h => {
                let value = item[h.key];
                if (typeof value === 'number') {
                    value = value.toFixed(2);
                }
                return `"${value || ''}"`;
            }).join(',')
        );

        const csvContent = [headerRow, ...rows].join('\n');
        
        // Download
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}_${this.formatDateForFilename(new Date())}.csv`;
        link.click();

        divFinanceAuth.showToast('Export CSV réussi!', 'success');
    }

    /**
     * Export daily reports to Excel-compatible format
     */
    exportRapportsJournaliersCSV(filters = {}) {
        const data = this.getRapportsJournaliers(filters);
        const headers = [
            { key: 'date', label: 'DATE' },
            { key: 'pharmacyName', label: 'PHARMACIE' },
            { key: 'venteUsd', label: 'VENTE USD' },
            { key: 'venteFc', label: 'VENTE FC' },
            { key: 'totalEmoney', label: 'TOTAL E-MONEY' },
            { key: 'totalDepenses', label: 'TOTAL DEPENSES' },
            { key: 'totalVentes', label: 'TOTAL VENTES' },
            { key: 'totalCahier', label: 'TOTAL CAHIER' },
            { key: 'totalSysteme', label: 'TOTAL SYSTEME' }
        ];
        
        this.exportToCSV(data, 'rapports_journaliers', headers);
    }

    /**
     * Export expenses to CSV
     */
    exportDepensesCSV(filters = {}) {
        const data = this.getDepenses(filters);
        const headers = [
            { key: 'date', label: 'DATE' },
            { key: 'pharmacyName', label: 'PHARMACIE' },
            { key: 'moon', label: 'MOON' },
            { key: 'unique', label: 'UNIQUE' },
            { key: 'divers', label: 'DIVERS' },
            { key: 'carburant', label: 'CARBURANT' },
            { key: 'transportProduits', label: 'TRANSPORT PRODUITS' },
            { key: 'totalite', label: 'TOTALITE' }
        ];
        
        this.exportToCSV(data, 'depenses', headers);
    }

    /**
     * Export payments to CSV
     */
    exportVersementsCSV(filters = {}) {
        const data = this.getVersements(filters);
        const headers = [
            { key: 'date', label: 'DATE' },
            { key: 'pharmacyName', label: 'PHARMACIE' },
            { key: 'montantUsd', label: 'MONTANT USD' },
            { key: 'montantFc', label: 'MONTANT FC' },
            { key: 'modeVersement', label: 'MODE' },
            { key: 'reference', label: 'REFERENCE' }
        ];
        
        this.exportToCSV(data, 'versements', headers);
    }

    /**
     * Export supplier debts to CSV
     */
    exportDettesCSV() {
        const data = this.getDettesFournisseurs();
        const headers = [
            { key: 'fournisseurName', label: 'FOURNISSEUR' },
            { key: 'montantInitial', label: 'MONTANT INITIAL' },
            { key: 'montantPaye', label: 'MONTANT PAYÉ' },
            { key: 'montantRestant', label: 'RESTANT' },
            { key: 'statut', label: 'STATUT' },
            { key: 'dateEcheance', label: 'ÉCHÉANCE' }
        ];
        
        this.exportToCSV(data, 'dettes_fournisseurs', headers);
    }

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================

    /**
     * Format date for storage (YYYY-MM-DD)
     */
    formatDateForStorage(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * Format date for filename
     */
    formatDateForFilename(date) {
        return this.formatDateForStorage(date).replace(/-/g, '');
    }

    /**
     * Format date for display (French format)
     */
    formatDateDisplay(dateStr) {
        if (!dateStr) return '-';
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateStr).toLocaleDateString('fr-FR', options);
    }

    /**
     * Format number with thousand separators
     */
    formatNumber(num, decimals = 0) {
        if (num === null || num === undefined) return '0';
        return new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(num);
    }

    /**
     * Format as currency USD
     */
    formatUSD(amount) {
        return `${this.formatNumber(amount, 2)} $`;
    }

    /**
     * Format as currency FC
     */
    formatFC(amount) {
        return `${this.formatNumber(amount, 0)} FC`;
    }

    /**
     * Convert FC to USD
     */
    fcToUsd(fcAmount) {
        return fcAmount / this.getConversionRate();
    }

    /**
     * Convert USD to FC
     */
    usdToFc(usdAmount) {
        return usdAmount * this.getConversionRate();
    }

    /**
     * Get status badge class
     */
    getStatusBadgeClass(statut) {
        switch (statut) {
            case 'positif':
            case 'payee':
            case 'active':
                return 'badge-success';
            case 'negatif':
            case 'retard':
            case 'inactive':
                return 'badge-danger';
            case 'alerte':
            case 'encours':
                return 'badge-warning';
            default:
                return 'badge-secondary';
        }
    }

    /**
     * Get status label in French
     */
    getStatusLabel(statut) {
        const labels = {
            positif: 'POSITIF',
            negatif: 'NEGATIF',
            payee: 'PAYÉE',
            retard: 'EN RETARD',
            encours: 'EN COURS',
            active: 'ACTIVE',
            inactive: 'INACTIVE'
        };
        return labels[statut] || statut.toUpperCase();
    }

    /**
     * Generate unique ID
     */
    generateId(prefix = '') {
        return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Clear all data (for testing/reset)
     */
    clearAllData() {
        Object.values(this.STORAGE_KEYS).forEach(key => {
            if (key !== this.STORAGE_KEYS.CONVERSION_RATE) {
                localStorage.setItem(key, JSON.stringify([]));
            }
        });
        return { success: true, message: 'Toutes les données ont été effacées.' };
    }

    /**
     * Get summary statistics
     */
    getSummaryStats() {
        const rapports = this.getRapportsJournaliers();
        const depenses = this.getDepenses();
        const versements = this.getVersements();
        const dettes = this.getDettesFournisseurs();

        return {
            totalRapports: rapports.length,
            totalDepenses: depenses.length,
            totalVersements: versements.length,
            totalDettes: dettes.length,
            totalVentes: rapports.reduce((sum, r) => sum + r.totalVentes, 0),
            totalDepensesMontant: depenses.reduce((sum, d) => sum + d.totalite, 0),
            totalVersementsUsd: versements.reduce((sum, v) => sum + v.montantUsd, 0),
            totalDettesActives: dettes.filter(d => d.montantRestant > 0).reduce((sum, d) => sum + d.montantRestant, 0)
        };
    }
}

// Global instance
const divFinanceApp = new DivFinanceApp();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DivFinanceApp;
}
