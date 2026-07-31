/**
 * ============================================
 * PHARMAFINANCE PRO - Données de Test Juillet 2024
 * Script de génération de données réalistes
 * ============================================
 * 
 * Exécutez ce script dans la console du navigateur
 * après avoir chargé l'application pour peupler
 * la base de données avec des données de test.
 */

const TestDataGenerator = {
    // Configuration
    config: {
        mois: 7,      // Juillet
        annee: 2024,
        joursDansMois: 31,
        tauxChange: 2800  // 1 USD = 2800 FC (moyenne RDC)
    },
    
    // Pharmacies disponibles
    pharmacies: [
        { id: 'pharma_1', nom: 'BIAYI' },
        { id: 'pharma_2', nom: 'PHARMAFRICA' },
        { id: 'pharma_3', nom: 'DE LA REVOLUTION' },
        { id: 'pharma_4', nom: 'KASAI' },
        { id: 'pharma_5', nom: 'HEWA BORA 1' },
        { id: 'pharma_6', nom: 'HEWA BORA 2' },
        { id: 'pharma_7', nom: 'KOLWEZI 1' },
        { id: 'pharma_8', nom: 'KOLWEZI 2' }
    ],
    
    // Catégories de dépenses
    categoriesDepenses: [
        'Salaires',
        'Loyer',
        'Électricité',
        'Eau',
        'Transport',
        'Fournitures médicales',
        'Maintenance',
        'Communication',
        'Taxe et impôts',
        'Assurance',
        'Divers'
    ],
    
    // Générer un montant aléatoire entre min et max
    randomAmount(min, max) {
        return Math.round((Math.random() * (max - min) + min) / 1000) * 1000;
    },
    
    // Générer une date aléatoire en juillet 2024
    randomDate() {
        const jour = Math.floor(Math.random() * this.config.joursDansMois) + 1;
        return `2024-07-${String(jour).padStart(2, '0')}`;
    },
    
    // ==========================================
    // GÉNÉRATION DES VERSEMENTS
    // ==========================================
    
    async generateVersements() {
        console.log('[TestData] Génération des versements pour Juillet 2024...');
        
        const versements = [];
        
        // Pour chaque pharmacie, générer des versements quotidiens
        for (const pharma of this.pharmacies) {
            // Nombre de jours actifs (80% du mois environ)
            const joursActifs = Math.floor(this.config.joursDansMois * 0.8);
            
            for (let i = 0; i < joursActifs; i++) {
                const date = this.randomDate();
                
                // Montants variables selon le "jour" (plus élevé en fin de mois)
                const jour = parseInt(date.split('-')[2]);
                const multiplicateurFinMois = jour > 20 ? 1.3 : jour > 15 ? 1.1 : 1.0;
                
                // Montant base selon la pharmacie (certaines sont plus grosses)
                const baseFC = this.randomAmount(500000, 3500000) * multiplicateurFinMois;
                const baseUSD = baseFC / this.config.tauxChange;
                
                versements.push({
                    id: `v_${pharma.id}_${date}_${i}`,
                    date_versement: date,
                    pharmacie_id: pharma.id,
                    pharmacie: pharma.nom,
                    montant_fc: Math.round(baseFC),
                    montant_usd: Math.round(baseUSD * 100) / 100,
                    observation: this.getRandomObservation('versement'),
                    created_at: new Date().toISOString(),
                    source: 'test_data'
                });
            }
        }
        
        // Insérer dans IndexedDB
        const tx = DB.db.transaction(['versements'], 'readwrite');
        const store = tx.objectStore('versements');
        
        for (const v of versements) {
            store.add(v);
        }
        
        return new Promise((resolve) => {
            tx.oncomplete = () => {
                console.log(`[TestData] ✅ ${versements.length} versements générés`);
                resolve(versements.length);
            };
        });
    },
    
    // ==========================================
    // GÉNÉRATION DES DÉPENSES
    // ==========================================
    
    async generateDepenses() {
        console.log('[TestData] Génération des dépenses pour Juillet 2024...');
        
        const depenses = [];
        
        // Dépenses fixes mensuelles (salaires, loyer)
        const depensesFixes = [
            { categorie: 'Salaires', montantMin: 800000, montantMax: 2500000, freq: 1 },     // 1x par mois
            { categorie: 'Loyer', montantMin: 400000, montantMax: 1200000, freq: 1 },
            { categorie: 'Assurance', montantMin: 150000, montantMax: 450000, freq: 1 },
            { categorie: 'Taxe et impôts', montantMin: 100000, montantMax: 300000, freq: 1 }
        ];
        
        // Dépenses variables
        const depensesVariables = [
            { categorie: 'Électricité', montantMin: 50000, montantMax: 200000, freq: 4 },   // Hebdomadaire
            { categorie: 'Eau', montantMin: 20000, montantMax: 80000, freq: 4 },
            { categorie: 'Transport', montantMin: 30000, montantMax: 150000, freq: 8 },       // Quotidien
            { catégorie: 'Fournitures médicales', montantMin: 100000, montantMax: 600000, freq: 6 },
            { categorie: 'Maintenance', montantMin: 25000, montantMax: 120000, freq: 3 },
            { categorie: 'Communication', montantMin: 15000, montantMax: 60000, freq: 4 },
            { categorie: 'Divers', montantMin: 10000, montantMax: 75000, freq: 10 }
        ];
        
        for (const pharma of this.pharmacies) {
            // Dépenses fixes (une fois par mois)
            for (const dep of depensesFixes) {
                const jourFixe = [5, 10, 15, 25][Math.floor(Math.random() * 4)]; // Dates variées
                
                depenses.push({
                    id: `df_${pharma.id}_${dep.categorie}`,
                    date_depense: `2024-07-${String(jourFixe).padStart(2, '0')}`,
                    pharmacie_id: pharma.id,
                    pharmacie: pharma.nom,
                    categorie: dep.categorie,
                    montant_fc: this.randomAmount(dep.montantMin, dep.montantMax),
                    fournisseur: this.getFournisseur(dep.categorie),
                    observation: `${dep.categorie} - Juillet 2024`,
                    created_at: new Date().toISOString(),
                    source: 'test_data'
                });
            }
            
            // Dépenses variables (plusieurs fois par mois)
            for (const dep of depensesVariables) {
                const nbOccurences = Math.floor(Math.random() * dep.freq) + 1;
                
                for (let i = 0; i < nbOccurences; i++) {
                    depenses.push({
                        id: `dv_${pharma.id}_${dep.categorie}_${i}`,
                        date_depense: this.randomDate(),
                        pharmacie_id: pharma.id,
                        pharmacie: pharma.nom,
                        categorie: dep.categorie,
                        montant_fc: this.randomAmount(dep.montantMin, dep.montantMax),
                        fournisseur: this.getFournisseur(dep.categorie),
                        observation: '',
                        created_at: new Date().toISOString(),
                        source: 'test_data'
                    });
                }
            }
        }
        
        // Insérer dans IndexedDB
        const tx = DB.db.transaction(['depenses'], 'readwrite');
        const store = tx.objectStore('depenses');
        
        for (const d of depenses) {
            store.add(d);
        }
        
        return new Promise((resolve) => {
            tx.oncomplete = () => {
                console.log(`[TestData] ✅ ${depenses.length} dépenses générées`);
                resolve(depenses.length);
            };
        });
    },
    
    // ==========================================
    // GÉNÉRATION DES RAPPORTS JOURNALIERS
    // ==========================================
    
    async generateRapportsJournaliers() {
        console.log('[TestData] Génération des rapports journaliers...');
        
        const rapports = [];
        
        for (const pharma of this.pharmacies) {
            const joursActifs = Math.floor(this.config.joursDansMois * 0.85); // 85% couverture
            
            for (let jour = 1; jour <= this.config.joursDansMois; jour++) {
                // Sauter quelques jours aléatoirement (weekend, fermeture)
                if (Math.random() < 0.15) continue;
                
                const dateStr = `2024-07-${String(jour).padStart(2, '0')}`;
                
                // Ventes du jour (variables)
                const dollars = this.randomAmount(50, 800);
                const francs = dollars * this.config.tauxChange * this.randomAmount(0.8, 1.5);
                
                // Caisse
                const caisseOuverture = this.randomAmount(100000, 500000);
                const caisseFermeture = caisseOuverture + francs - this.randomAmount(50000, 200000);
                
                rapports.push({
                    id: `rj_${pharma.id}_${dateStr}`,
                    date_rapport: dateStr,
                    pharmacie_id: pharma.id,
                    pharmacie: pharma.nom,
                    mois: 7,
                    annee: 2024,
                    dollars: Math.round(dollars * 100) / 100,
                    francs: Math.round(francs),
                    caisse_ouverture: Math.round(caisseOuverture),
                    caisse_fermeture: Math.round(Math.max(caisseFermeture, 0)),
                    observation: this.getRandomObservation('rapport'),
                    created_at: new Date().toISOString(),
                    source: 'test_data'
                });
            }
        }
        
        // Insérer dans IndexedDB
        const tx = DB.db.transaction(['rapports_journaliers'], 'readwrite');
        const store = tx.objectStore('rapports_journaliers');
        
        for (const r of rapports) {
            store.add(r);
        }
        
        return new Promise((resolve) => {
            tx.oncomplete = () => {
                console.log(`[TestData] ✅ ${rapports.length} rapports journaliers générés`);
                resolve(rapports.length);
            };
        });
    },
    
    // ==========================================
    // GÉNÉRATION DES DETTES FOURNISSEURS
    // ==========================================
    
    async generateDettes() {
        console.log('[TestData] Génération des dettes fournisseurs...');
        
        const dettes = [];
        const fournisseurs = [
            { nom: 'PharmaCentrale SA', type: 'Fournisseur médicaments' },
            { nom: 'LaboPlus Kinshasa', type: 'Laboratoire' },
            { nom: 'SNEL', type: 'Électricité' },
            { nom: 'REGIDESO', type: "Eau" },
            { nom: 'Cabinet Medical', type: 'Équipement' }
        ];
        
        for (const pharma of this.pharmacies.slice(0, 5)) { // Seulement 5 pharmacies ont des dettes
            const nbDettes = Math.floor(Math.random() * 3) + 1; // 1-3 dettes par pharmacie
            
            for (let i = 0; i < nbDettes; i++) {
                const fournisseur = fournisseurs[Math.floor(Math.random() * fournisseurs.length)];
                const montant = this.randomAmount(200000, 3000000);
                const echeanceJour = Math.floor(Math.random() * 30) + 1; // Échéance en août
                
                dettes.push({
                    id: `dt_${pharma.id}_${i}`,
                    fournisseur: fournisseur.nom,
                    type_fournisseur: fournisseur.type,
                    pharmacie_id: pharma.id,
                    pharmacie: pharma.nom,
                    montant_initial: montant,
                    montant_restant: montant * this.randomAmount(0.3, 1),
                    date_emission: this.randomDate(),
                    date_echeance: `2024-08-${String(echeanceJour).padStart(2, '0')}`,
                    payee: false,
                    observation: `Dette fournisseur - ${fournisseur.type}`,
                    created_at: new Date().toISOString(),
                    source: 'test_data'
                });
            }
        }
        
        // Insérer dans IndexedDB
        const tx = DB.db.transaction(['dettes_fournisseurs'], 'readwrite');
        const store = tx.objectStore('dettes_fournisseurs');
        
        for (const d of dettes) {
            store.add(d);
        }
        
        return new Promise((resolve) => {
            tx.oncomplete = () => {
                console.log(`[TestData] ✅ ${dettes.length} dettes générées`);
                resolve(dettes.length);
            };
        });
    },
    
    // ==========================================
    // UTILITAIRES
    // ==========================================
    
    getRandomObservation(type) {
        const observations = {
            versement: [
                'Vente quotidienne normale',
                'Bonne journée de ventes',
                'Week-end correct',
                'Journée chargée',
                'Ventes stables',
                ''
            ],
            rapport: [
                'Bonne journée',
                'Journée normale',
                'Affluence importante',
                'Rupture de stock sur certains produits',
                'Livraison reçue ce matin',
                ''
            ]
        };
        
        const list = observations[type] || [''];
        return list[Math.floor(Math.random() * list.length)];
    },
    
    getFournisseur(categorie) {
        const map = {
            'Salaires': 'Personnel',
            'Loyer': 'Immobilier Plus',
            'Électricité': 'SNEL',
            'Eau': 'REGIDESO',
            'Transport': 'TransDev',
            'Fournitures médicales': 'PharmaCentrale',
            'Maintenance': 'TechFix',
            'Communication': 'Vodacom',
            'Taxe et impôts': 'Direction Générale',
            'Assurance': 'Assur RDC',
            'Divers': 'Divers'
        };
        return map[categorie] || 'Fournisseur';
    },
    
    // ==========================================
    # GÉNÉRATION COMPLÈTE
    // ==========================================
    
    async generateAll() {
        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║  🧪 PHARMAFINANCE PRO - Générateur de Données Test          ║');
        console.log('║  Période: Juillet 2024                                     ║');
        console.log('╚════════════════════════════════════════════════════════════╝');
        console.log('');
        
        try {
            if (!DB || !DB.db) {
                throw new Error('Base de données non initialisée. Attendez le chargement complet.');
            }
            
            const results = await Promise.all([
                this.generateVersements(),
                this.generateDepenses(),
                this.generateRapportsJournaliers(),
                this.generateDettes()
            ]);
            
            const total = results.reduce((a, b) => a + b, 0);
            
            console.log('');
            console.log('╔════════════════════════════════════════════════════════════╗');
            console.log(`║  ✅ DONNÉES DE TEST GÉNÉRÉES AVEC SUCCÈS!               ║`);
            console.log(`╠════════════════════════════════════════════════════════════╣`);
            console.log(`║  • Versements:     ${results[0]} enregistrements              ║`);
            console.log(`║  • Dépenses:       ${results[1]} enregistrements              ║`);
            console.log(`║  • Rapports:       ${results[2]} enregistrements              ║`);
            console.log(`║  • Dettes:         ${results[3]} enregistrements              ║`);
            console.log(`╠════════════════════════════════════════════════════════════╣`);
            console.log(`║  Total: ${total} enregistrements créés                   ║`);
            console.log('╚════════════════════════════════════════════════════════════╝');
            console.log('');
            console.log('📊 Vous pouvez maintenant:');
            console.log('   1. Aller sur le Dashboard voir les graphiques');
            console.log('   2. Tester les différents comptes utilisateurs');
            console.log('   3. Générer un rapport PDF');
            console.log('   4. Tester l\'import CSV');
            console.log('');
            
            return {
                success: true,
                total,
                details: {
                    versements: results[0],
                    depenses: results[1],
                    rapports: results[2],
                    dettes: results[3]
                }
            };
            
        } catch (error) {
            console.error('❌ Erreur lors de la génération:', error);
            return { success: false, error: error.message };
        }
    }
};

// Export global
window.TestDataGenerator = TestDataGenerator;

console.log('💡 Module TestDataGenerator chargé. Lancez: await TestDataGenerator.generateAll()');
