/**
 * ============================================
 * LA DIVINE PharmaFinance Pro v3.0
 * Module HealthScore - Santé Financière
 * ============================================
 * 
 * Algorithme de scoring (0-100) basé sur 5 piliers:
 * 
 * 1. RENTABILITÉ (poids: 25%)
 *    - Marge bénéficiaire = (Revenus - Dépenses) / Revenus × 100
 *    - Score: >30%=100, 20-30%=75, 10-20%=50, 0-10%=25, <0%=0
 * 
 * 2. LIQUIDITÉ (poids: 20%)
 *    - Ratio cash flow = Versements / Dépenses
 *    - Score: >1.5=100, 1.2-1.5=80, 1-1.2=60, 0.8-1=40, <0.8=0
 * 
 * 3. CROISSANCE (poids: 20%)
 *    - Comparaison vs mois précédent
 *    - Score: >+20%=100, +10-20%=80, 0-10%=60, -10-0%=30, <-10%=0
 * 
 * 4. GESTION DETTES (poids: 20%)
 *    - Ratio dettes / revenus + échéances en retard
 *    - Score: pas de dette=100, <10% revenus=80, 10-25%=50, >25%=0
 * 
 * 5. RÉGULARITÉ (poids: 15%)
 *    - % jours avec rapport soumis ce mois
 *    - Score: >90%=100, 70-90%=75, 50-70%=50, 30-50%=25, <30%=0
 */

const HealthScore = {
    // Configuration des poids
    POIDS: {
        rentabilite: 0.25,
        liquidite: 0.20,
        croissance: 0.20,
        dettes: 0.20,
        regularite: 0.15
    },
    
    // Seuils de notation
    SEUILS: {
        excellent: 80,
        bon: 65,
        moyen: 45,
        critique: 0
    },
    
    // Cache des calculs
    cache: {
        global: null,
        parSite: {},
        lastUpdate: null
    },
    
    // Couleurs pour les scores
    couleurs: {
        excellent: { main: '#2E7D32', light: '#E8F5E9', text: 'Excellent 💚' },
        bon: { main: '#1976D2', light: '#E3F2FD', text: 'Bon 💙' },
        moyen: { main: '#F57C00', light: '#FFF3E0', text: 'Moyen 🧡' },
        critique: { main: '#C62828', light: '#FFEBEE', text: 'Critique ❤️‍🩹' }
    },

    // ==========================================
    // INITIALISATION & CALCUL PRINCIPAL
    // ==========================================

    async init() {
        console.log('[HealthScore] Initialisation du module Santé Financière v3.0...');
        
        if (typeof DB === 'undefined' || !DB.db) {
            console.warn('[HealthScore] DB pas prêt, réessai dans 2s...');
            setTimeout(() => this.init(), 2000);
            return;
        }
        
        await this.calculateAndDisplay();
    },

    async calculateAndDisplay() {
        try {
            // Calculer le score global
            const scoreGlobal = await this.calculateGlobalScore();
            
            // Afficher le score global
            this.displayGlobalScore(scoreGlobal);
            
            // Calculer et afficher les scores par site
            const scoresParSite = await this.calculateAllSitesScores();
            this.displayScoresParSite(scoresParSite);
            
            // Mettre à jour le cache
            this.cache.global = scoreGlobal;
            this.cache.parSite = scoresParSite;
            this.cache.lastUpdate = new Date();
            
            console.log('[HealthScore] ✅ Scores calculés et affichés');
            
        } catch (error) {
            console.error('[HealthScore] Erreur:', error);
        }
    },

    // ==========================================
    // CALCUL DU SCORE GLOBAL
    // ==========================================

    async calculateGlobalScore() {
        const moisActuel = App.state.currentMois;
        const anneeActuelle = App.state.currentAnnee;
        
        // Récupérer toutes les données
        const [versements, depenses, rapports, dettes, pharmacies] = await Promise.all([
            DB.getAll('versements'),
            DB.getAll('depenses'),
            DB.getAll('rapports_journaliers'),
            DB.getAll('dettes_fournisseurs'),
            DB.getAll('pharmacies')
        ]);
        
        // Filtrer par mois courant
        const vMois = this.filterByMonth(versements, 'date_versement', moisActuel, anneeActuelle);
        const dMois = this.filterByMonth(depenses, 'date_depense', moisActuel, anneeActuelle);
        const rMois = this.filterByMonth(rapports, 'date_rapport', moisActuel, anneeActuelle);
        
        // Données du mois précédent pour comparaison croissance
        const moisPrec = moisActuel === 1 ? 12 : moisActuel - 1;
        const anneePrec = moisActuel === 1 ? anneeActuelle - 1 : anneeActuelle;
        const vMoisPrec = this.filterByMonth(versements, 'date_versement', moisPrec, anneePrec);
        const dMoisPrec = this.filterByMonth(depenses, 'date_depense', moisPrec, anneePrec);
        
        // Calculer les totaux
        const totalRevenus = this.sumField(vMois, 'montant_fc', 'montantFC');
        const totalDepenses = this.sumField(dMois, 'montant_fc', 'montant');
        const totalRevenusPrec = this.sumField(vMoisPrec, 'montant_fc', 'montantFC');
        const totalDettesActives = this.getActiveDebt(dettes);
        
        // Calculer les 5 métriques
        const metriques = {
            rentabilite: this.calcRentabilite(totalRevenus, totalDepenses),
            liquidite: this.calcLiquidite(totalRevenus, totalDepenses),
            croissance: this.calcCroissance(totalRevenus, totalRevenusPrec),
            dettes: this.calcGestionDettes(totalDettesActives, totalRevenus),
            regularite: this.calcRegularite(rMois, pharmacies.length, moisActuel, anneeActuelle)
        };
        
        // Calculer le score pondéré global
        let scoreTotal = 0;
        Object.keys(metriques).forEach(key => {
            scoreTotal += metriques[key].score * this.POIDS[key];
        });
        
        return {
            score: Math.round(scoreTotal),
            metriques,
            details: {
                totalRevenus,
                totalDepenses,
                balance: totalRevenus - totalDepenses,
                totalDettes: totalDettesActives,
                nbRapports: rMois.length,
                nbPharmacies: pharmacies.length
            },
            periode: `${this.getMoisNom(moisActuel)} ${anneeActuelle}`
        };
    },

    // ==========================================
    // CALCUL DES SCORES PAR SITE
    // ==========================================

    async calculateAllSitesScores() {
        const pharmacies = await DB.getAll('pharmacies');
        const [versements, depenses, rapports, dettes] = await Promise.all([
            DB.getAll('versements'),
            DB.getAll('depenses'),
            DB.getAll('rapports_journaliers'),
            DB.getAll('dettes_fournisseurs')
        ]);
        
        const scores = [];
        
        for (const pharma of pharmacies) {
            const score = await this.calculateSiteScore(pharma, versements, depenses, rapports, dettes);
            scores.push(score);
        }
        
        // Trier par score décroissant
        return scores.sort((a, b) => b.score - a.score);
    },

    async calculateSiteScore(pharma, allVersements, allDepenses, allRapports, allDettes) {
        const moisActuel = App.state.currentMois;
        const anneeActuelle = App.state.currentAnnee;
        const pharmaId = pharma.id || pharma.nom;
        
        // Filtrer par pharmacie ET mois
        const vSite = allVersements.filter(v => 
            this.matchPharmacy(v, pharmaId) && 
            this.isInMonth(v.date_versement, moisActuel, anneeActuelle)
        );
        const dSite = allDepenses.filter(d =>
            this.matchPharmacy(d, pharmaId) &&
            this.isInMonth(d.date_depense, moisActuel, anneeActuelle)
        );
        const rSite = allRapports.filter(r =>
            this.matchPharmacy(r, pharmaId) &&
            this.isInMonth(r.date_rapport, moisActuel, anneeActuelle)
        );
        const dtSite = allDettes.filter(d => 
            this.matchPharmacy(d, pharmaId) && 
            !d.payee
        );
        
        // Mois précédent
        const moisPrec = moisActuel === 1 ? 12 : moisActuel - 1;
        const anneePrec = moisActuel === 1 ? anneeActuelle - 1 : anneeActuelle;
        const vSitePrec = allVersements.filter(v =>
            this.matchPharmacy(v, pharmaId) &&
            this.isInMonth(v.date_versement, moisPrec, anneePrec)
        );
        
        // Totaux
        const revenus = this.sumField(vSite, 'montant_fc', 'montantFC');
        const depenses = this.sumField(dSite, 'montant_fc', 'montant');
        const revenusPrec = this.sumField(vSitePrec, 'montant_fc', 'montantFC');
        const dettesTotales = this.sumField(dtSite, 'montant', 'montant_restant') || 0;
        
        // Métriques
        const metriques = {
            rentabilite: this.calcRentabilite(revenus, depenses),
            liquidite: this.calcLiquidite(revenus, depenses),
            croissance: this.calcCroissance(revenus, revenusPrec),
            dettes: this.calcGestionDettes(dettesTotales, revenus),
            regularite: this.calcRegularite(rSite, 1, moisActuel, anneeActuelle)
        };
        
        let scoreTotal = 0;
        Object.keys(metriques).forEach(key => {
            scoreTotal += metriques[key].score * this.POIDS[key];
        });
        
        return {
            id: pharma.id,
            nom: pharma.nom,
            score: Math.round(scoreTotal),
            metriques,
            details: {
                revenus,
                depenses,
                balance: revenus - depenses,
                dettes: dettesTotales,
                nbRapports: rSite.length
            },
            tendance: this.calculerTendance(revenus, revenusPrec)
        };
    },

    // ==========================================
    // FONCTIONS DE CALCUL DES MÉTRIQUES
    // ==========================================

    calcRentabilite(revenus, depenses) {
        if (revenus <= 0) return { score: 0, value: 0, label: 'Pas de revenus' };
        
        const marge = ((revenus - depenses) / revenus) * 100;
        let score, label;
        
        if (marge >= 30) { score = 100; label = 'Excellente marge'; }
        else if (marge >= 20) { score = 80; label = 'Bonne marge'; }
        else if (marge >= 10) { score = 60; label = 'Marge correcte'; }
        else if (marge >= 0) { score = 35; label = 'Marge faible'; }
        else { score = 0; label = 'Perte'; }
        
        return { score, value: Math.round(marge), label };
    },

    calcLiquidite(revenus, depenses) {
        if (depenses <= 0) return { score: 100, value: Infinity, label: 'Pas de dépenses' };
        
        const ratio = revenus / depenses;
        let score, label;
        
        if (ratio >= 1.5) { score = 100; label = 'Très liquide'; }
        else if (ratio >= 1.2) { score = 80; label = 'Bonne liquidité'; }
        else if (ratio >= 1.0) { score = 60; label = 'Équilibré'; }
        else if (ratio >= 0.8) { score = 35; label = 'Tension'; }
        else { score: 0; label = 'Déficit cash'; }
        
        return { score, value: Math.round(ratio * 10) / 10, label };
    },

    calcCroissance(revenusActuel, revenusPrecedent) {
        if (revenusPrecedent <= 0) {
            return revenusActuel > 0 
                ? { score: 70, value: null, label: 'Nouveau site' }
                : { score: 50, value: 0, label: 'Pas de données' };
        }
        
        const croissance = ((revenusActuel - revenusPrecedent) / revenusPrecedent) * 100;
        let score, label;
        
        if (croissance >= 20) { score = 100; label = 'Forte croissance'; }
        else if (croissance >= 10) { score = 85; label = 'Bonne croissance'; }
        else if (croissance >= 0) { score: 65; label: 'Stable'; }
        else if (croissance >= -10) { score: 30; label = 'Légère baisse'; }
        else { score: 0; label: 'Fort recul'; }
        
        return { score, value: Math.round(croissance), label };
    },

    calcGestionDettes(totalDettes, revenus) {
        if (totalDettes <= 0) return { score: 100, value: 0, label: 'Pas de dette' };
        if (revenus <= 0) return { score: 40, value: totalDettes, label: 'Dettes sans revenus' };
        
        const ratio = (totalDettes / revenus) * 100;
        let score, label;
        
        if (ratio <= 5) { score: 95; label: 'Dettes minimes'; }
        else if (ratio <= 10) { score: 80; label: 'Gérable'; }
        else if (ratio <= 25) { score: 55; label: 'Attention'; }
        else { score: 0; label: 'Critique'; }
        
        return { score, value: Math.round(ratio), label };
    },

    calcRegularite(rapports, nbPharmacies, mois, annee) {
        const joursDansMois = new Date(annee, mois, 0).getDate();
        const aujourdhui = Math.min(new Date().getDate(), joursDansMois);
        const joursAttendus = nbPharmacies > 0 ? aujourdhui : aujourdhui;
        
        if (joursAttendus <= 0) return { score: 100, value: 100, label: 'Début de mois' };
        
        const taux = (rapports.length / joursAttendus) * 100;
        let score, label;
        
        if (taux >= 90) { score: 100; label: 'Très régulier'; }
        else if (taux >= 70) { score: 80; label: 'Régulier'; }
        else if (taux >= 50) { score: 55; label: 'Irrégulier'; }
        else if (taux >= 30) { score: 30; label: 'Peu régulier'; }
        else { score: 0; label: 'Absence rapports'; }
        
        return { score, value: Math.round(taux), label };
    },

    // ==========================================
    // AFFICHAGE UI
    // ==========================================

    displayGlobalScore(scoreData) {
        // Mettre à jour la période
        document.getElementById('health-period').textContent = scoreData.periode;
        
        // Animer le nombre
        this.animateValue('global-score-value', 0, scoreData.score, 1500);
        
        // Mettre à jour la jauge SVG
        this.updateGauge(scoreData.score);
        
        // Mettre à jour le statut
        const statusEl = document.getElementById('global-score-status');
        const niveau = this.getNiveau(scoreData.score);
        const config = this.couleurs[niveau];
        
        statusEl.className = `health-score-status ${niveau}`;
        statusEl.innerHTML = `
            <span class="status-icon">${config.text.split(' ')[1]}</span>
            <span class="status-text">${config.text.split(' ')[0]} (${scoreData.score}/100)</span>
        `;
        
        // Mettre à jour les métriques détaillées
        Object.keys(scoreData.metriques).forEach(key => {
            const metrique = scoreData.metriques[key];
            const niveauMetrique = this.getNiveau(metrique.score);
            
            // Valeur
            const valueEl = document.getElementById(`score-${key}`);
            if (valueEl) {
                valueEl.textContent = metrique.score;
            }
            
            // Barre de progression
            const barEl = document.getElementById(`bar-${key}`);
            if (barEl) {
                barEl.style.width = `${metrique.score}%`;
                barEl.className = `metric-bar-fill ${niveauMetrique}`;
            }
            
            // Carte
            const cardEl = document.getElementById(`metric-${key}`);
            if (cardEl) {
                cardEl.className = `metric-card ${niveauMetrique}`;
                
                // Ajouter tooltip avec détails
                cardEl.title = `${metrique.label} (Valeur: ${metrique.value !== null ? metrique.value : 'N/A'})`;
            }
        });
    },

    displayScoresParSite(scores) {
        const container = document.getElementById('health-sites-container');
        if (!container) return;
        
        container.innerHTML = scores.map((site, index) => {
            const niveau = this.getNiveau(site.score);
            const config = this.couleurs[niveau];
            const trendClass = site.tendance > 5 ? 'up' : site.tendance < -5 ? 'down' : 'stable';
            const trendIcon = site.tendance > 5 ? '↑' : site.tendance < -5 ? '↓' : '→';
            const trendText = site.tendance > 5 ? '+' + site.tendance + '%' : site.tendance + '%';
            
            // Couleur du site basée sur l'index
            const siteColors = ['#0A6E32', '#1976D2', '#7B1FA2', '#C62828', '#F57C00', '#00838F', '#5D4037', '#455A64'];
            const siteColor = siteColors[index % siteColors.length];
            
            return `
                <div class="site-health-card" style="--site-color: ${siteColor}">
                    <div class="site-trend-badge ${trendClass}" title="Tendance vs mois dernier">
                        ${trendIcon} ${site.tendance !== null ? trendText : 'N/A'}
                    </div>
                    <div class="site-health-header">
                        <h5 class="site-health-name" title="${site.nom}">${site.nom}</h5>
                        <div class="site-health-score">
                            <span class="site-score-number" style="color: ${config.main}">${site.score}</span>
                            <span class="site-score-label">/100</span>
                        </div>
                    </div>
                    
                    <div class="site-metrics-mini">
                        <div class="site-metric-item">
                            <span class="site-metric-value" style="color: #0A6E32">${this.formatCompact(site.details.revenus)}</span>
                            <span class="site-metric-label">Rev.</span>
                        </div>
                        <div class="site-metric-item">
                            <span class="site-metric-value" style="color: #C62828">${this.formatCompact(site.details.depenses)}</span>
                            <span class="site-metric-label">Dép.</span>
                        </div>
                        <div class="site-metric-item">
                            <span class="site-metric-value" style="color: ${site.details.balance >= 0 ? '#0A6E32' : '#C62828'}">${this.formatCompact(site.details.balance)}</span>
                            <span class="site-metric-label">Balance</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    // ==========================================
    // ANIMATIONS Jauge SVG
    // ==========================================

    updateGauge(score) {
        const arc = document.getElementById('gauge-arc');
        const needle = document.getElementById('gauge-needle');
        
        if (!arc || !needle) return;
        
        // Arc: stroke-dashoffset (251.2 = circonférence, 0 = plein, 125.6 = demi)
        const maxOffset = 251.2; // Demi-cercle complet
        const offset = maxOffset - (score / 100) * maxOffset;
        arc.style.strokeDashoffset = offset;
        
        // Couleur selon score
        const niveau = this.getNiveau(score);
        arc.style.stroke = this.couleurs[niveau].main;
        
        // Aiguille: rotation (-90° = 0, 90° = 100)
        const angle = -90 + (score / 100) * 180;
        needle.style.transform = `rotate(${angle}deg)`;
    },

    animateValue(elementId, start, end, duration) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const range = end - start;
        const startTime = performance.now();
        
        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out cubic)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + range * easeOut);
            
            element.textContent = current;
            
            // Couleur dynamique
            const niveau = this.getNiveau(current);
            element.style.color = this.couleurs[niveau].main;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };
        
        requestAnimationFrame(update);
    },

    // ==========================================
    // UTILITAIRES
    // ==========================================

    getNiveau(score) {
        if (score >= this.SEUILS.excellent) return 'excellent';
        if (score >= this.SEUILS.bon) return 'bon';
        if (score >= this.SEUILS.moyen) return 'moyen';
        return 'critique';
    },

    getActiveDebt(dettes) {
        return dettes
            .filter(d => !d.payee && d.montant_restant > 0)
            .reduce((sum, d) => sum + (parseFloat(d.montant_restant) || parseFloat(d.montant) || 0), 0);
    },

    filterByMonth(data, dateField, month, year) {
        return data.filter(item => this.isInMonth(item[dateField], month, year));
    },

    isInMonth(dateStr, month, year) {
        if (!dateStr) return false;
        const date = new Date(dateStr);
        return date.getMonth() + 1 === month && date.getFullYear() === year;
    },

    matchPharmacy(record, pharmacyId) {
        return record.pharmacie_id === pharmacyId || 
               record.pharmacie === pharmacyId ||
               record.site === pharmacyId;
    },

    sumField(data, field1, field2) {
        return data.reduce((sum, item) => {
            const val = parseFloat(item[field1]) || parseFloat(item[field2]) || 0;
            return sum + val;
        }, 0);
    },

    formatCompact(num) {
        if (!num && num !== 0) return '0';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
        return Math.round(num).toString();
    },

    getMoisNom(mois) {
        const noms = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        return noms[mois] || '';
    },

    calculerTendance(actuel, precedent) {
        if (!precedent || precedent === 0) return null;
        return Math.round(((actuel - precedent) / precedent) * 100);
    },

    // ==========================================
    // EXPORT & RAPPORTS
    // ==========================================

    generateReport() {
        if (!this.cache.global) return null;
        
        return {
            dateGeneration: new Date().toISOString(),
            periode: this.cache.global.periode,
            scoreGlobal: this.cache.global.score,
            niveauGlobal: this.getNiveau(this.cache.global.score),
            metriques: this.cache.global.metriques,
            scoresParSite: this.cache.parSite.map(s => ({
                nom: s.nom,
                score: s.score,
                niveau: this.getNiveau(s.score),
                tendance: s.tendance,
                details: s.details
            })),
            recommandations: this.generateRecommendations()
        };
    },

    generateRecommendations() {
        const recos = [];
        const m = this.cache.global?.metriques;
        if (!m) return recos;
        
        if (m.rentabilite.score < 50) {
            recos.push({
                priorite: 'haute',
                categorie: 'Rentabilité',
                message: 'La marge bénéficiaire est faible. Analysez les coûts et optimisez les achats.',
                action: 'Réviser les dépenses fixes'
            });
        }
        
        if (m.liquidite.score < 50) {
            recos.push({
                priorite: 'critique',
                categorie: 'Liquidité',
                message: 'Le ratio cash flow est préoccupant. Risque de tension de trésorerie.',
                action: 'Accélérer les encaissements'
            });
        }
        
        if (m.dettes.score < 50) {
            recos.push({
                priorite: 'haute',
                categorie: 'Dettes',
                message: 'Le niveau de dettes est élevé par rapport aux revenus.',
                action: 'Négocier échéanciers'
            });
        }
        
        if (m.regularite.score < 60) {
            recos.push({
                priorite: 'moyenne',
                categorie: 'Régularité',
                message: 'Les rapports ne sont pas soumis régulièrement.',
                action: 'Instaurer un rappel quotidien'
            });
        }
        
        if (recos.length === 0) {
            recos.push({
                priorite: 'info',
                categorie: 'Général',
                message: 'La santé financière est bonne. Continuez sur cette lancée!',
                action: 'Maintenir les bonnes pratiques'
            });
        }
        
        return recos;
    },

    // Rafraîchir
    async refresh() {
        await this.calculateAndDisplay();
    }
};
