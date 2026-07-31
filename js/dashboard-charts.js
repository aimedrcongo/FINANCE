/**
 * ============================================
 * LA DIVINE PharmaFinance Pro v3.0
 * Module DashboardCharts - Graphiques Interactifs
 * ============================================
 * 
 * Fonctionnalités:
 * - Graphique ligne: Tendance des revenus (7/14/30/90 jours)
 * - Graphique doughnut: Répartition des dépenses par catégorie
 * - Graphique barres: Comparaison performance par site
 * - Graphique aire: Évolution mensuelle avec statistiques
 * 
 * Dépendances: Chart.js v4.x, IndexedDB (DB)
 */

const DashboardCharts = {
    // Instances des graphiques (pour destruction avant re-création)
    charts: {
        revenus: null,
        depenses: null,
        sites: null,
        evolution: null
    },
    
    // Configuration globale
    config: {
        couleurs: {
            primary: '#0A6E32',
            primaryLight: '#5AAA1E',
            secondary: '#82BE1E',
            accent: '#C62828',
            info: '#1976D2',
            warning: '#F57C00',
            success: '#2E7D32',
            // Palette pour sites (8 pharmacies)
            sites: [
                '#0A6E32',  // BIAYI - Vert principal
                '#1976D2',  // PHARMAFRICA - Bleu
                '#7B1FA2',  // DE LA REVOLUTION - Violet
                '#C62828',  // KASAI - Rouge
                '#F57C00',  // HEWA BORA 1 - Orange
                '#00838F',  // HEWA BORA 2 - Cyan
                '#5D4037',  // KOLWEZI 1 - Marron
                '#455A64'   // KOLWEZI 2 - Bleu gris
            ],
            depenses: [
                '#0A6E32',  // Salaires
                '#1976D2',  // Loyer
                '#F57C00',  // Électricité
                '#7B1FA2',  // Eau
                '#C62828',  # Transport
                '#00838F',  // Fournitures
                '#455A64',  // Maintenance
                '#FF6F00'   // Autres
            ]
        },
        
        optionsBase: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: { size: 11, family: "'Inter', sans-serif" }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(31, 41, 55, 0.95)',
                    titleFont: { size: 13, family: "'Inter', sans-serif" },
                    bodyFont: { size: 12, family: "'Inter', sans-serif" },
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {}
                }
            }
        }
    },
    
    // Métrique active pour graphique sites
    currentMetric: 'versements',
    
    // Période active pour graphique revenus
    currentPeriode: 30,

    // ==========================================
    // INITIALISATION
    // ==========================================

    async init() {
        console.log('[DashboardCharts] Initialisation des graphiques v3.0...');
        
        // Vérifier que Chart.js est disponible
        if (typeof Chart === 'undefined') {
            console.error('[DashboardCharts] Chart.js non chargé!');
            return;
        }
        
        // Attendre que les données soient prêtes
        if (typeof DB !== 'undefined' && DB.db) {
            await this.renderAllCharts();
        } else {
            console.warn('[DashboardCharts] DB pas encore prêt, réessai dans 2s...');
            setTimeout(() => this.init(), 2000);
        }
    },

    async renderAllCharts() {
        console.log('[DashboardCharts] Rendu de tous les graphiques...');
        
        try {
            await Promise.all([
                this.renderRevenusTendance(),
                this.renderDepensesRepartition(),
                this.renderSitesComparaison(),
                this.renderEvolutionMensuelle()
            ]);
            
            console.log('[DashboardCharts] ✅ Tous les graphiques rendus');
        } catch (error) {
            console.error('[DashboardCharts] Erreur lors du rendu:', error);
        }
    },

    // ==========================================
    // GRAPHIQUE 1: TENDANCE DES REVENUS (LIGNE)
    // ==========================================

    async renderRevenusTendance() {
        const canvas = document.getElementById('chart-revenus-tendance');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Détruire l'instance précédente
        if (this.charts.revenus) {
            this.charts.revenus.destroy();
        }
        
        // Récupérer les données
        const data = await this.getRevenusData(this.currentPeriode);
        
        const chartConfig = {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Versements (FC)',
                    data: data.values,
                    borderColor: this.config.couleurs.primary,
                    backgroundColor: this.createGradient(ctx, this.config.couleurs.primary),
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: this.config.couleurs.primary,
                    pointBorderWidth: 2,
                    pointHoverBorderWidth: 3
                }]
            },
            options: {
                ...this.config.optionsBase,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            font: { size: 10 },
                            maxRotation: 45
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(0,0,0,0.05)' },
                        ticks: {
                            font: { size: 10 },
                            callback: (value) => this.formatCompact(value)
                        }
                    }
                },
                plugins: {
                    ...this.config.optionsBase.plugins,
                    tooltip: {
                        ...this.config.optionsBase.plugins.tooltip,
                        callbacks: {
                            label: (context) => `Versements: ${this.formatNumber(context.parsed.y)} FC`
                        }
                    }
                }
            }
        };
        
        this.charts.revenus = new Chart(ctx, chartConfig);
    },

    async getRevenusData(jours) {
        const versements = await DB.getAll('versements');
        const maintenant = new Date();
        const dateDebut = new Date(maintenant.getTime() - (jours * 24 * 60 * 60 * 1000));
        
        // Filtrer par période
        const filtres = versements.filter(v => {
            const dateV = new Date(v.date_versement || v.date);
            return dateV >= dateDebut;
        });
        
        // Grouper par jour
        const donneesParJour = {};
        for (let i = 0; i < jours; i++) {
            const date = new Date(maintenant.getTime() - (i * 24 * 60 * 60 * 1000));
            const cle = date.toISOString().split('T')[0];
            donneesParJour[cle] = 0;
        }
        
        filtres.forEach(v => {
            const cle = new Date(v.date_versement || v.date).toISOString().split('T')[0];
            if (donneesParJour.hasOwnProperty(cle)) {
                donneesParJour[cle] += parseFloat(v.montant_fc || v.montantFC || 0);
            }
        });
        
        // Trier et formater
        const labels = Object.keys(donneesParJour).sort().reverse();
        const values = labels.map(l => donneesParJour[l]);
        
        // Formater les labels pour affichage
        const labelsFormats = labels.map(l => {
            const d = new Date(l + 'T00:00:00');
            return `${d.getDate()}/${d.getMonth() + 1}`;
        });
        
        return { labels: labelsFormats, values };
    },

    // ==========================================
    // GRAPHIQUE 2: RÉPARTITION DÉPENSES (DOUGHNUT)
    // ==========================================

    async renderDepensesRepartition() {
        const canvas = document.getElementById('chart-depenses-repartition');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        if (this.charts.depenses) {
            this.charts.depenses.destroy();
        }
        
        const data = await this.getDepensesData();
        
        const chartConfig = {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: this.config.couleurs.depenses.slice(0, data.labels.length),
                    borderColor: '#fff',
                    borderWidth: 3,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: {
                        display: false // Légende personnalisée
                    },
                    tooltip: {
                        ...this.config.optionsBase.plugins.tooltip,
                        callbacks: {
                            label: (context) => {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const pct = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${this.formatNumber(context.parsed)} FC (${pct}%)`;
                            }
                        }
                    }
                }
            },
            plugins: [{
                id: 'centerText',
                afterDraw: (chart) => {
                    const { ctx, width, height } = chart;
                    ctx.save();
                    
                    const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                    
                    ctx.font = "bold 18px 'Inter', sans-serif";
                    ctx.fillStyle = '#1F2937';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(this.formatCompact(total), width / 2, height / 2 - 10);
                    
                    ctx.font = "12px 'Inter', sans-serif";
                    ctx.fillStyle = '#6B7280';
                    ctx.fillText('Total Dép.', width / 2, height / 2 + 12);
                    
                    ctx.restore();
                }
            }]
        };
        
        this.charts.depenses = new Chart(ctx, chartConfig);
        
        // Générer la légende personnalisée
        this.generateCustomLegend(data.labels, data.values);
    },

    async getDepensesData() {
        const depenses = await DB.getAll('depenses');
        const moisActuel = App.state.currentMois;
        anneeActuelle = App.state.currentAnnee;
        
        // Filtrer le mois courant
        const filtres = depenses.filter(d => {
            const dateD = new Date(d.date_depense || d.date);
            return dateD.getMonth() + 1 === moisActuel && 
                   dateD.getFullYear() === anneeActuelle;
        });
        
        // Grouper par catégorie
        const categories = {};
        filtres.forEach(d => {
            const cat = d.categorie || d.type_depense || 'Autres';
            categories[cat] = (categories[cat] || 0) + parseFloat(d.montant_fc || d.montant || 0);
        });
        
        // Trier par valeur décroissante
        const tries = Object.entries(categories).sort((a, b) => b[1] - a[1]);
        
        return {
            labels: tries.map(t => t[0]),
            values: tries.map(t => t[1])
        };
    },

    generateCustomLegend(labels, values) {
        const container = document.getElementById('chart-depenses-legend');
        if (!container) return;
        
        const total = values.reduce((a, b) => a + b, 0);
        const colors = this.config.couleurs.depenses;
        
        container.innerHTML = labels.slice(0, 4).map((label, i) => `
            <div class="legend-item">
                <span class="legend-dot" style="background: ${colors[i]}"></span>
                <span>${label.length > 10 ? label.substring(0, 10) + '..' : label}</span>
            </div>
        `).join('');
    },

    // ==========================================
    // GRAPHIQUE 3: COMPARAISON PAR SITE (BARRES)
    // ==========================================

    async renderSitesComparaison() {
        const canvas = document.getElementById('chart-sites-comparaison');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        if (this.charts.sites) {
            this.charts.sites.destroy();
        }
        
        const data = await this.getSitesData(this.currentMetric);
        
        const chartConfig = {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: data.datasetLabel,
                    data: data.values,
                    backgroundColor: this.config.couleurs.sites.slice(0, data.labels.length).map(c => c + 'CC'),
                    borderColor: this.config.couleurs.sites.slice(0, data.labels.length),
                    borderWidth: 2,
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                ...this.config.optionsBase,
                indexAxis: data.labels.length > 5 ? 'y' : 'x',
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            font: { size: data.labels.length > 5 ? 11 : 10 },
                            maxRotation: data.labels.length > 5 ? 0 : 45
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(0,0,0,0.05)' },
                        ticks: {
                            font: { size: 10 },
                            callback: (value) => this.formatCompact(value)
                        }
                    }
                },
                plugins: {
                    ...this.config.optionsBase.plugins,
                    tooltip: {
                        ...this.config.optionsBase.plugins.tooltip,
                        callbacks: {
                            label: (context) => `${data.datasetLabel}: ${this.formatNumber(context.parsed.x ?? context.parsed.y)} FC`
                        }
                    }
                }
            }
        };
        
        this.charts.sites = new Chart(ctx, chartConfig);
    },

    async getSitesData(metric) {
        const pharmacies = await DB.getAll('pharmacies');
        const versements = await DB.getAll('versements');
        const depenses = await DB.getAll('depenses');
        const rapports = await DB.getAll('rapports_journaliers');
        
        const moisActuel = App.state.currentMois;
        const anneeActuelle = App.state.currentAnnee;
        
        const result = {
            labels: [],
            values: [],
            datasetLabel: ''
        };
        
        pharmacies.forEach(pharma => {
            let value = 0;
            
            switch (metric) {
                case 'versements':
                    result.datasetLabel = 'Versements (FC)';
                    versements.filter(v => {
                        const d = new Date(v.date_versement || v.date);
                        return (v.pharmacie_id === pharma.id || v.pharmacie === pharma.nom) &&
                               d.getMonth() + 1 === moisActuel &&
                               d.getFullYear() === anneeActuelle;
                    }).forEach(v => {
                        value += parseFloat(v.montant_fc || v.montantFC || 0);
                    });
                    break;
                    
                case 'depenses':
                    result.datasetLabel = 'Dépenses (FC)';
                    depenses.filter(d => {
                        const dd = new Date(d.date_depense || d.date);
                        return (d.pharmacie_id === pharma.id || d.pharmacie === pharma.nom) &&
                               dd.getMonth() + 1 === moisActuel &&
                               dd.getFullYear() === anneeActuelle;
                    }).forEach(d => {
                        value += parseFloat(d.montant_fc || d.montant || 0);
                    });
                    break;
                    
                case 'balance':
                    result.datasetLabel = 'Balance (FC)';
                    let totalV = 0, totalD = 0;
                    versements.filter(v => {
                        const d = new Date(v.date_versement || v.date);
                        return (v.pharmacie_id === pharma.id || v.pharmacie === pharma.nom) &&
                               d.getMonth() + 1 === moisActuel &&
                               d.getFullYear() === anneeActuelle;
                    }).forEach(v => {
                        totalV += parseFloat(v.montant_fc || v.montantFC || 0);
                    });
                    depenses.filter(d => {
                        const dd = new Date(d.date_depense || d.date);
                        return (d.pharmacie_id === pharma.id || d.pharmacie === pharma.nom) &&
                               dd.getMonth() + 1 === moisActuel &&
                               dd.getFullYear() === anneeActuelle;
                    }).forEach(d => {
                        totalD += parseFloat(d.montant_fc || d.montant || 0);
                    });
                    value = totalV - totalD;
                    break;
            }
            
            // Nom court pour l'affichage
            const nomCourt = pharma.nom.length > 12 ? pharma.nom.substring(0, 12) + '..' : pharma.nom;
            result.labels.push(nomCourt);
            result.values.push(Math.round(value));
        });
        
        return result;
    },

    // ==========================================
    // GRAPHIQUE 4: ÉVOLUTION MENSUELLE (AIRE)
    // ==========================================

    async renderEvolutionMensuelle() {
        const canvas = document.getElementById('chart-evolution-mensuelle');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        if (this.charts.evolution) {
            this.charts.evolution.destroy();
        }
        
        const data = await this.getEvolutionData();
        
        const chartConfig = {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Versements',
                        data: data.versements,
                        borderColor: this.config.couleurs.primary,
                        backgroundColor: this.createGradientArea(ctx, this.config.couleurs.primary),
                        borderWidth: 2,
                        fill: true,
                        tension: 0.3,
                        pointRadius: 3,
                        pointHoverRadius: 5
                    },
                    {
                        label: 'Dépenses',
                        data: data.depenses,
                        borderColor: this.config.couleurs.accent,
                        backgroundColor: this.createGradientArea(ctx, this.config.couleurs.accent, 0.3),
                        borderWidth: 2,
                        fill: true,
                        tension: 0.3,
                        pointRadius: 3,
                        pointHoverRadius: 5
                    }
                ]
            },
            options: {
                ...this.config.optionsBase,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 10 } }
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(0,0,0,0.05)' },
                        ticks: {
                            font: { size: 10 },
                            callback: (value) => this.formatCompact(value)
                        }
                    }
                },
                plugins: {
                    ...this.config.optionsBase.plugins,
                    tooltip: {
                        ...this.config.optionsBase.plugins.tooltip,
                        callbacks: {
                            label: (context) => {
                                return `${context.dataset.label}: ${this.formatNumber(context.parsed.y)} FC`;
                            }
                        }
                    }
                }
            }
        };
        
        this.charts.evolution = new Chart(ctx, chartConfig);
        
        // Mettre à jour les statistiques
        this.updateEvolutionStats(data);
    },

    async getEvolutionData() {
        const versements = await DB.getAll('versements');
        const depenses = await DB.getAll('depenses');
        const joursDansMois = new Date(App.state.currentAnnee, App.state.currentMois, 0).getDate();
        const aujourdhui = new Date().getDate();
        
        const labels = [];
        const dataV = [];
        const dataD = [];
        
        for (let jour = 1; jour <= Math.min(aujourdhui, joursDansMois); jour++) {
            labels.push(`${jour}`);
            
            let totalV = 0, totalD = 0;
            
            versements.forEach(v => {
                const d = new Date(v.date_versement || v.date);
                if (d.getDate() === jour && 
                    d.getMonth() + 1 === App.state.currentMois && 
                    d.getFullYear() === App.state.currentAnnee) {
                    totalV += parseFloat(v.montant_fc || v.montantFC || 0);
                }
            });
            
            depenses.forEach(d => {
                const dd = new Date(d.date_depense || d.date);
                if (dd.getDate() === jour && 
                    dd.getMonth() + 1 === App.state.currentMois && 
                    dd.getFullYear() === App.state.currentAnnee) {
                    totalD += parseFloat(d.montant_fc || d.montant || 0);
                }
            });
            
            dataV.push(Math.round(totalV));
            dataD.push(Math.round(totalD));
        }
        
        return { labels, versements: dataV, depenses: dataD };
    },

    updateEvolutionStats(data) {
        // Moyenne journalière
        const totalV = data.versements.reduce((a, b) => a + b, 0);
        const jours = data.versements.filter(v => v > 0).length || 1;
        const moyenne = Math.round(totalV / jours);
        
        document.getElementById('stat-moyenne-jour').textContent = this.formatNumber(moyenne) + ' FC';
        
        // Croissance (comparer dernière semaine vs avant-dernière)
        const n = data.versements.length;
        if (n >= 14) {
            const derniereSemaine = data.versements.slice(-7).reduce((a, b) => a + b, 0) / 7;
            const avantDerniere = data.versements.slice(-14, -7).reduce((a, b) => a + b, 0) / 7;
            const croissance = avantDerniere > 0 ? ((derniereSemaine - avantDerniere) / avantDerniere * 100) : 0;
            
            const el = document.getElementById('stat-croissance');
            el.textContent = (croissance >= 0 ? '+' : '') + croissance.toFixed(1) + '%';
            el.style.color = croissance >= 0 ? this.config.couleurs.primary : this.config.couleurs.accent;
        } else {
            document.getElementById('stat-croissance').textContent = 'N/A';
        }
    },

    // ==========================================
    // CONTRÔLES INTERACTIFS
    // ==========================================

    async updatePeriode() {
        const select = document.getElementById('chart-revenus-periode');
        this.currentPeriode = parseInt(select.value);
        await this.renderRevenusTendance();
    },

    async changeMetric(btn) {
        // Mise à jour UI boutons
        document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        this.currentMetric = btn.dataset.metric;
        await this.renderSitesComparaison();
    },

    // ==========================================
    // RAFRAÎCHISSEMENT GLOBAL
    // ==========================================

    async refreshAll() {
        console.log('[DashboardCharts] Rafraîchissement de tous les graphiques...');
        await this.renderAllCharts();
    },

    // Rafraîchir un graphique spécifique
    async refreshChart(chartName) {
        switch (chartName) {
            case 'revenus': await this.renderRevenusTendance(); break;
            case 'depenses': await this.renderDepensesRepartition(); break;
            case 'sites': await this.renderSitesComparaison(); break;
            case 'evolution': await this.renderEvolutionMensuelle(); break;
        }
    },

    // ==========================================
    // UTILITAIRES
    // ==========================================

    // Créer un gradient vertical pour graphique ligne
    createGradient(ctx, color, opacity = 0.15) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 280);
        gradient.addColorStop(0, this.hexToRgba(color, opacity));
        gradient.addColorStop(1, this.hexToRgba(color, 0));
        return gradient;
    },

    // Créer un gradient pour graphique aire
    createGradientArea(ctx, color, opacity = 0.2) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 280);
        gradient.addColorStop(0, this.hexToRgba(color, opacity));
        gradient.addColorStop(0.5, this.hexToRgba(color, opacity * 0.5));
        gradient.addColorStop(1, this.hexToRgba(color, 0));
        return gradient;
    },

    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },

    formatNumber(num) {
        if (num === null || num === undefined || isNaN(num)) return '0';
        return new Intl.NumberFormat('fr-FR').format(Math.round(num));
    },

    formatCompact(num) {
        if (num === null || num === undefined || isNaN(num)) return '0';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
        return num.toString();
    },

    // Exporter les données d'un graphique en image
    async exportChartAsImage(chartName, filename) {
        const chart = this.charts[chartName];
        if (!chart) return null;
        
        try {
            const url = chart.toBase64Image('image/png', 1);
            const link = document.createElement('a');
            link.download = filename || `chart-${chartName}-${new Date().toISOString().split('T')[0]}.png`;
            link.href = url;
            link.click();
            return true;
        } catch (e) {
            console.error('[DashboardCharts] Erreur export:', e);
            return false;
        }
    },

    // Détruire toutes les instances (pour nettoyage)
    destroyAll() {
        Object.keys(this.charts).forEach(key => {
            if (this.charts[key]) {
                this.charts[key].destroy();
                this.charts[key] = null;
            }
        });
    }
};

// Variable globale pour compatibilité
var anneeActuelle = new Date().getFullYear();
