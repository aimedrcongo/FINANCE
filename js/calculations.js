/**
 * ============================================
 * PharmaFinance Pro - Moteur de Calculs Financiers
 * Formules basées sur les fichiers Excel originaux
 * ============================================
 */

const Calculations = {
    
    // ==========================================
    // CONSTANTES ET CONFIGURATION
    // ==========================================
    
    MOIS: {
        1: 'JANVIER', 2: 'FEVRIER', 3: 'MARS', 4: 'AVRIL',
        5: 'MAI', 6: 'JUIN', 7: 'JUILLET', 8: 'AOUT',
        9: 'SEPTEMBRE', 10: 'OCTOBRE', 11: 'NOVEMBRE', 12: 'DECEMBRE'
    },
    
    CATEGORIES_DEPENSES: [
        'MOON', 'UNIQUE', 'DIVERS', 'TRANSPORT PRODUITS', 
        'ENTRETIEN', 'MANUTENTION', 'DEMANDE FONDS',
        'TRANSPORT AGENTS', 'CARBURANT', 'TRAVAUX BOSS',
        'TEGERMO TAXES', 'SALAIRE FERMIERS', 'PROMED',
        'LOER', 'KIN MED', 'COMPTE MOUSSA', 'TRAVAUX PHA DEPOT'
    ],
    
    SITES_PREDEFINIS: [
        'BIAYI', 'PHARMAFRICA', 'DE LA REVOLUTION', 'KASAI',
        'HEWA BORA 1', 'HEWA BORA 2', 'KOLWEZI 1', 'KOLWEZI 2'
    ],
    
    // ==========================================
    // FORMATS ET UTILITAIRES
    // ==========================================
    
    /**
     * Formater un nombre en devise FC
     */
    formatFC(montant) {
        if (montant === null || montant === undefined || isNaN(montant)) return '0 FC';
        return new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(Math.round(montant)) + ' FC';
    },
    
    /**
     * Formater un nombre en USD
     */
    formatUSD(montant) {
        if (montant === null || montant === undefined || isNaN(montant)) return '$0';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(montant);
    },
    
    /**
     * Formater un pourcentage
     */
    formatPercent(valeur) {
        if (valeur === null || valeur === undefined) return '0%';
        return new Intl.NumberFormat('fr-FR', {
            style: 'percent',
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
        }).format(valeur / 100);
    },
    
    /**
     * Parser une valeur numérique
     */
    parseNumber(value) {
        if (typeof value === 'number') return value;
        if (!value) return 0;
        const cleaned = String(value).replace(/[^\d.,-]/g, '').replace(',', '.');
        return parseFloat(cleaned) || 0;
    },
    
    /**
     * Obtenir le mois et l'année d'une date
     */
    getDateParts(dateStr) {
        const date = new Date(dateStr);
        return {
            jour: date.getDate(),
            mois: date.getMonth() + 1,
            annee: date.getFullYear(),
            nomMois: this.MOIS[date.getMonth() + 1]
        };
    },
    
    // ==========================================
    // CALCULS RAPPORT JOURNALIER
    // ==========================================
    
    /**
     * Calculer les totaux du rapport journalier
     * Basé sur la structure Excel originale:
     * 
     * RAPPORT [PHARMACY NAME] DE REVOLUTION [MONTH]
     * DATE: [date]
     * 
     * 1. VENTE JOURNALIERE
     *    Dollars: xxxxxx
     *    Francs: 496000
     * 
     * 2. PAIEMENT par: E-money
     *    Equity: 0 | GGA: 0 | TMB: 0 | MOKO: 0
     *    Total E-Money: 0
     *    TOTAL Ventes J: 2405000
     * 
     * 3. Depenses
     *    Transport: 27000 | Achats Produits: 0 | Carburant: 0 | Autres: 0
     *    Total Depenses: 27000
     * 
     * 4. TOTAL CAHIER: 2432000
     * 5. TOTAL SYSTÈME: 2430500
     * 6. EXPIRE (Écart): 1500
     */
    calculerRapportJournalier(data, tauxChange = 2800) {
        const dollars = this.parseNumber(data.dollars) || 0;
        const francs = this.parseNumber(data.francs) || 0;
        
        // Paiements E-money
        const equity = this.parseNumber(data.equity) || 0;
        const gga = this.parseNumber(data.gga) || 0;
        const tmb = this.parseNumber(data.tmb) || 0;
        const moko = this.parseNumber(data.moko) || 0;
        
        // Dépenses
        const transport = this.parseNumber(data.transport) || 0;
        const achatsProduits = this.parseNumber(data.achats_produits) || 0;
        const carburant = this.parseNumber(data.carburant) || 0;
        const autresDepenses = this.parseNumber(data.autres_depenses) || 0;
        
        // Total E-Money (somme des paiements mobile)
        const totalEMoney = equity + gga + tmb + moko;
        
        // Conversion Dollars -> FC (selon taux de change)
        const dollarsEnFC = dollars * tauxChange;
        
        // TOTAL Ventes Journalières = (Dollars × taux) + Francs + Total E-Money
        const totalVentesJ = dollarsEnFC + francs + totalEMoney;
        
        // Total Dépenses
        const totalDepenses = transport + achatsProduits + carburant + autresDepenses;
        
        // TOTAL CAHIER = Total Ventes J + Total Dépenses
        // Note: Selon votre exemple: 2405000 + 27000 = 2432000
        const totalCahier = totalVentesJ + totalDepenses;
        
        // TOTAL SYSTÈME (à saisir ou calculer selon contexte)
        const totalSysteme = this.parseNumber(data.total_systeme) || totalCahier;
        
        // EXPIRE / Écart = Total Cahier - Total Système
        const expireEcart = Math.abs(totalCahier - totalSysteme);
        
        return {
            // Valeurs brutes
            dollars,
            francs,
            equity,
            gga,
            tmb,
            moko,
            transport,
            achatsProduits,
            carburant,
            autresDepenses,
            
            // Totaux calculés
            totalEMoney,
            dollarsEnFC,
            totalVentesJ,
            totalDepenses,
            totalCahier,
            totalSysteme,
            expireEcart,
            
            // Métadonnées
            tauxChange,
            dateCalcul: new Date().toISOString()
        };
    },
    
    // ==========================================
    // CALCULS VERSEMENTS
    // ==========================================
    
    /**
     * Calculer les totaux de versements par pharmacie et période
     */
    calculerTotauxVersements(versements) {
        let totalUSD = 0;
        let totalFC = 0;
        const parPharmacie = {};
        
        versements.forEach(v => {
            const usd = this.parseNumber(v.montant_usd) || 0;
            const fc = this.parseNumber(v.montant_fc) || 0;
            
            totalUSD += usd;
            totalFC += fc;
            
            const key = v.pharmacie_id || v.pharmacie_nom;
            if (!parPharmacie[key]) {
                parPharmacie[key] = {
                    pharmacie_id: key,
                    pharmacie_nom: v.pharmacie_nom,
                    total_usd: 0,
                    total_fc: 0,
                    nombre_versements: 0
                };
            }
            parPharmacie[key].total_usd += usd;
            parPharmacie[key].total_fc += fc;
            parPharmacie[key].nombre_versements++;
        });
        
        return {
            total_usd: totalUSD,
            total_fc: totalFC,
            par_pharmacie: Object.values(parPharmacie),
            nombre_total: versements.length
        };
    },
    
    /**
     * Calculer la moyenne quotidienne des versements
     */
    calculerMoyenneQuotidienne(versements, nombreJours) {
        if (!versements.length || !nombreJours) return { moyenne_fc: 0, moyenne_usd: 0 };
        
        const totaux = this.calculerTotauxVersements(versements);
        
        return {
            moyenne_fc: totaux.total_fc / nombreJours,
            moyenne_usd: totaux.total_usd / nombreJours
        };
    },
    
    // ==========================================
    // CALCULS DÉPENSES
    // ==========================================
    
    /**
     * Calculer les totaux de dépenses par catégorie
     */
    calculerTotauxDepensesParCategorie(depenses) {
        const parCategorie = {};
        let totalGeneral = 0;
        
        depenses.forEach(d => {
            const categorie = d.categorie || 'AUTRES';
            const montant = this.parseNumber(d.montant) || 0;
            
            if (!parCategorie[categorie]) {
                parCategorie[categorie] = {
                    categorie,
                    total: 0,
                    nombre: 0,
                    details: []
                };
            }
            
            parCategorie[categorie].total += montant;
            parCategorie[categorie].nombre++;
            parCategorie[categorie].details.push(d);
            totalGeneral += montant;
        });
        
        return {
            total_general: totalGeneral,
            par_categorie: Object.values(parCategorie).sort((a, b) => b.total - a.total)
        };
    },
    
    /**
     * Calculer les dépenses par site/pharmacie
     */
    calculerDepensesParSite(depenses) {
        const parSite = {};
        
        depenses.forEach(d => {
            const siteId = d.pharmacie_id;
            const montant = this.parseNumber(d.montant) || 0;
            
            if (!parSite[siteId]) {
                parSite[siteId] = {
                    pharmacie_id: siteId,
                    pharmacie_nom: d.pharmacie_nom || '',
                    total_depenses: 0,
                    nombre_depenses: 0,
                    categories: {}
                };
            }
            
            parSite[siteId].total_depenses += montant;
            parSite[siteId].nombre_depenses++;
            
            const cat = d.categorie || 'AUTRES';
            if (!parSite[siteId].categories[cat]) {
                parSite[siteId].categories[cat] = 0;
            }
            parSite[siteId].categories[cat] += montant;
        });
        
        return Object.values(parSite);
    },
    
    // ==========================================
    // CALCULS LIVRE DE COMPTES (BALANCE)
    // ==========================================
    
    /**
     * Calculer la balance cumulée du livre de comptes
     * Formule: Balance = Balance précédente + FC Verse - Dépenses
     */
    calculerBalanceLivreComptes(operations, soldeOuverture = 0) {
        let balanceCumulee = soldeOuverture;
        const operationsAvecBalance = [];
        
        // Trier par date croissante
        const sortedOps = [...operations].sort((a, b) => 
            new Date(a.date) - new Date(b.date)
        );
        
        sortedOps.forEach(op => {
            const montantSyst = this.parseNumber(op.montant_syst) || 0;
            const depense = this.parseNumber(op.depenses) || 0;
            const fc = this.parseNumber(op.fc) || 0;
            const usd = this.parseNumber(op.usd) || 0;
            const fcVerse = this.parseNumber(op.fc_verse) || 0;
            
            // Calcul de la nouvelle balance
            // Balance = Balance précédente + Entrées - Sorties
            balanceCumulee = balanceCumulee + fcVerse + fc - depense;
            
            operationsAvecBalance.push({
                ...op,
                balance_avant: balanceCumulee - fcVerse - fc + depense,
                balance_apres: balanceCumulee,
                variation: fcVerse + fc - depense
            });
        });
        
        return {
            solde_ouverture: soldeOuverture,
            solde_final: balanceCumulee,
            total_entrees: operations.reduce((sum, o) => sum + (this.parseNumber(o.fc_verse) || 0) + (this.parseNumber(o.fc) || 0), 0),
            total_sorties: operations.reduce((sum, o) => sum + (this.parseNumber(o.depenses) || 0), 0),
            operations: operationsAvecBalance
        };
    },
    
    /**
     * Calculer la balance mensuelle par site
     * Formule: SOLDE = OUVERTURE – DEPENSES + RECETTES
     */
    calculerBalanceMensuelle(pharmacieId, mois, annee, donnees) {
        const { rapports, versements, depenses, soldeOuverture } = donnees;
        
        // Filtrer par période et pharmacie
        const rapportsFiltres = (rapports || []).filter(r => 
            r.pharmacie_id == pharmacieId && r.mois == mois && r.annee == annee
        );
        
        const versementsFiltres = (versements || []).filter(v =>
            v.pharmacie_id == pharmacieId && v.mois == mois && v.annee == annee
        );
        
        const depensesFiltres = (depenses || []).filter(d =>
            d.pharmacie_id == pharmacieId && d.mois == mois && d.annee == annee
        );
        
        // Calcul des recettes (ventes)
        const recettes = rapportsFiltres.reduce((sum, r) => {
            const calc = this.calculerRapportJournalier(r);
            return sum + calc.totalVentesJ;
        }, 0);
        
        // Ajouter les versements aux recettes
        const totalVersements = versementsFiltres.reduce((sum, v) => 
            sum + (this.parseNumber(v.montant_fc) || 0), 0
        );
        
        const totalRecettes = recettes + totalVersements;
        
        // Calcul des dépenses totales
        const totalDepenses = depensesFiltres.reduce((sum, d) => 
            sum + (this.parseNumber(d.montant) || 0), 0
        );
        
        // Ajouter les dépenses des rapports
        const depensesRapports = rapportsFiltres.reduce((sum, r) => {
            const calc = this.calculerRapportJournalier(r);
            return sum + calc.totalDepenses;
        }, 0);
        
        const totalDepensesFinal = totalDepenses + depensesRapports;
        
        // SOLDE = OUVERTURE – DEPENSES + RECETTES
        const soldeFinal = (soldeOuverture || 0) - totalDepensesFinal + totalRecettes;
        
        return {
            pharmacie_id: pharmacieId,
            mois,
            annee,
            ouverture_fc: soldeOuverture || 0,
            depenses_fc: totalDepensesFinal,
            recettes_fc: totalRecettes,
            solde_fc: soldeFinal,
            nombre_rapports: rapportsFiltres.length,
            nombre_versements: versementsFiltres.length,
            nombre_depenses: depensesFiltres.length
        };
    },
    
    // ==========================================
    // CALCULS DETTES FOURNISSEURS
    // ==========================================
    
    /**
     * Calculer le statut automatique des dettes
     */
    calculerStatutDette(dateEcheance, datePaiement = null, montantTotal, montantPaye) {
        const total = this.parseNumber(montantTotal) || 0;
        const paye = this.parseNumber(montantPaye) || 0;
        const reste = total - paye;
        const aujourdhui = new Date();
        const echeance = new Date(dateEcheance);
        
        if (paye >= total) {
            return { statut: 'payee', label: 'Payée', class: 'badge-success' };
        }
        
        if (aujourdhui > echeance) {
            return { statut: 'retard', label: 'En retard', class: 'badge-error' };
        }
        
        const joursRestants = Math.ceil((echeance - aujourdhui) / (1000 * 60 * 60 * 24));
        
        if (joursRestants <= 7) {
            return { statut: 'urgent', label: 'Urgent (' + joursRestants + 'j)', class: 'badge-warning' };
        }
        
        return { statut: 'en_attente', label: 'En attente', class: 'badge-info' };
    },
    
    /**
     * Calculer les totaux des dettes
     */
    calculerTotauxDettes(dettes) {
        let totalMontant = 0;
        let totalPaye = 0;
        let totalRestant = 0;
        let totalEnRetard = 0;
        
        const stats = dettes.map(d => {
            const montant = this.parseNumber(d.montant_total) || this.parseNumber(d.montant_fc) || 0;
            const paye = this.parseNumber(d.monte_paye) || 0;
            const reste = montant - paye;
            const statutInfo = this.calculerStatutDette(d.date_echeance, d.date_paiement, montant, paye);
            
            totalMontant += montant;
            totalPaye += paye;
            totalRestant += reste;
            
            if (statutInfo.statut === 'retard') {
                totalEnRetard += reste;
            }
            
            return {
                ...d,
                montant_total: montant,
                monte_paye: paye,
                solde_restant: reste,
                ...statutInfo
            };
        });
        
        return {
            total_montant: totalMontant,
            total_paye: totalPaye,
            total_restant: totalRestant,
            total_en_retard: totalEnRetard,
            pourcentage_paye: totalMontant > 0 ? ((totalPaye / totalMontant) * 100) : 0,
            dettes: stats
        };
    },
    
    // ==========================================
    // CALCULS TABLEAU DE BORD (KPIs)
    // ==========================================
    
    /**
     * Calculer tous les KPIs du tableau de bord
     */
    async calculerKPIsDashboard(mois, annee) {
        try {
            const [pharmacies, versements, depenses, rapports] = await Promise.all([
                DB.pharmacies.getAll(),
                DB.versements.getAll({ mois, annee }),
                DB.depenses.getAll({ mois, annee }),
                DB.rapports.getAll({ mois, annee })
            ]);
            
            // KPI 1: Total Dépenses du mois
            const totalDepensesFC = depenses.reduce((sum, d) => 
                sum + (this.parseNumber(d.montant) || 0), 0
            );
            
            // Ajouter dépenses des rapports
            const depensesRapports = rapports.reduce((sum, r) => {
                const calc = this.calculerRapportJournalier(r);
                return sum + calc.totalDepenses;
            }, 0);
            
            const totalDepenses = totalDepensesFC + depensesRapports;
            
            // KPI 2: Total Versements du mois
            const totalVersementsFC = versements.reduce((sum, v) => 
                sum + (this.parseNumber(v.montant_fc) || 0), 0
            );
            
            const totalVersementsUSD = versements.reduce((sum, v) => 
                sum + (this.parseNumber(v.montant_usd) || 0), 0
            );
            
            // KPI 3: Nombre de sites actifs
            const sitesActifs = pharmacies.filter(p => p.statut === 'actif').length;
            
            // KPI 4: Nombre de jours avec données
            const datesUniques = new Set([
                ...versements.map(v => v.date),
                ...rapports.map(r => r.date)
            ]);
            const nombreJours = datesUniques.size;
            
            // Stats par site
            const statsParSite = pharmacies.map(p => {
                const versementsSite = versements.filter(v => v.pharmacie_id === p.id);
                const depensesSite = depenses.filter(d => d.pharmacie_id === p.id);
                
                const versementFC = versementsSite.reduce((sum, v) => 
                    sum + (this.parseNumber(v.montant_fc) || 0), 0
                );
                
                const versementUSD = versementsSite.reduce((sum, v) => 
                    sum + (this.parseNumber(v.montant_usd) || 0), 0
                );
                
                const depenseSite = depensesSite.reduce((sum, d) => 
                    sum + (this.parseNumber(d.montant) || 0), 0
                );
                
                return {
                    id: p.id,
                    nom: p.nom,
                    code: p.code,
                    versements_fc: versementFC,
                    versements_usd: versementUSD,
                    depenses: depenseSite,
                    balance: versementFC - depenseSite,
                    nombre_versements: versementsSite.length,
                    statut: versementFC > depenseSite ? 'POSITIF' : (versementFC < depenseSite ? 'NEGATIF' : 'NEUTRE')
                };
            });
            
            // Solde global
            const soldeGlobal = totalVersementsFC - totalDepenses;
            
            return {
                periode: `${this.MOIS[mois]} ${annee}`,
                kpis: {
                    total_depenses: totalDepenses,
                    total_versements_fc: totalVersementsFC,
                    total_versements_usd: totalVersementsUSD,
                    solde_global: soldeGlobal,
                    nombre_sites: pharmacies.length,
                    sites_actifs: sitesActifs,
                    nombre_jours: nombreJours,
                    moyenne_journaliere_versement: nombreJours > 0 ? totalVersementsFC / nombreJours : 0,
                    moyenne_journaliere_depense: nombreJours > 0 ? totalDepenses / nombreJours : 0
                },
                stats_par_site: statsParSite.sort((a, b) => b.balance - a.balance)
            };
            
        } catch (error) {
            console.error('[Calculs] Erreur calcul KPIs:', error);
            throw error;
        }
    },
    
    // ==========================================
    // VALIDATIONS
    // ==========================================
    
    /**
     * Valider un rapport journalier
     */
    validerRapportJournalier(data) {
        const erreurs = [];
        const warnings = [];
        
        if (!data.date) {
            erreurs.push('La date est obligatoire');
        }
        
        if (!data.pharmacie_id) {
            erreurs.push('La sélection de la pharmacie est obligatoire');
        }
        
        if (data.dollars < 0 || data.francs < 0) {
            erreurs.push('Les montants ne peuvent pas être négatifs');
        }
        
        // Vérifier l'écart si total système fourni
        if (data.total_systeme) {
            const calc = this.calculerRapportJournalier(data);
            if (calc.expireEcart > 10000) { // Seuil de 10000 FC
                warnings.push(`Écart important détecté: ${this.formatFC(calc.expireEcart)}`);
            }
        }
        
        return {
            valide: erreurs.length === 0,
            erreurs,
            warnings
        };
    },
    
    /**
     * Valider un versement
     */
    validerVersement(data) {
        const erreurs = [];
        
        if (!data.date) {
            erreurs.push('La date est obligatoire');
        }
        
        if (!data.pharmacie_id) {
            erreurs.push('La sélection de la pharmacie est obligatoire');
        }
        
        if ((!data.montant_usd || data.montant_usd <= 0) && (!data.montant_fc || data.montant_fc <= 0)) {
            erreurs.push('Au moins un montant (USD ou FC) doit être renseigné');
        }
        
        return {
            valide: erreurs.length === 0,
            erreurs
        };
    }
};

// Export global
window.Calculations = Calculations;

console.log('[Calculs] Module chargé - API disponible via window.Calculations');
