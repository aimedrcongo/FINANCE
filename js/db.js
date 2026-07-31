/**
 * ============================================
 * PharmaFinance Pro - Base de données IndexedDB
 * Schema complet pour gestion financière pharmacies
 * ============================================
 */

const DB_NAME = 'PharmaFinanceDB';
const DB_VERSION = 1;

// Référence à la base de données
let db = null;

/**
 * Initialisation de la base de données
 */
async function initDatabase() {
    return new Promise((resolve, reject) => {
        // Si la DB est déjà ouverte
        if (db) {
            resolve(db);
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('[DB] Erreur d\'ouverture:', request.error);
            reject(request.error);
        };

        request.onsuccess = () => {
            db = request.result;
            console.log('[DB] Base de données initialisée avec succès');
            
            // Écouter les événements de fermeture
            db.onclose = () => {
                db = null;
                console.log('[DB] Connexion fermée');
            };
            
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = event.target.result;
            console.log('[DB] Création/Mise à jour du schema...');
            
            // ==========================================
            // 1. TABLE PHARMACIES
            // ==========================================
            if (!database.objectStoreNames.contains('pharmacies')) {
                const pharmacyStore = database.createObjectStore('pharmacies', { 
                    keyPath: 'id',
                    autoIncrement: true 
                });
                
                pharmacyStore.createIndex('nom', 'nom', { unique: false });
                pharmacyStore.createIndex('code', 'code', { unique: true });
                pharmacyStore.createIndex('ville', 'ville', { unique: false });
                pharmacyStore.createIndex('statut', 'statut', { unique: false });
                
                console.log('[DB] Table "pharmacies" créée');
            }

            // ==========================================
            // 2. TABLE RAPPORTS JOURNALIERS
            // ==========================================
            if (!database.objectStoreNames.contains('rapports_journaliers')) {
                const rapportStore = database.createObjectStore('rapports_journaliers', { 
                    keyPath: 'id',
                    autoIncrement: true 
                });
                
                rapportStore.createIndex('pharmacie_id', 'pharmacie_id', { unique: false });
                rapportStore.createIndex('date', 'date', { unique: false });
                rapportStore.createIndex('mois', 'mois', { unique: false });
                rapportStore.createIndex('annee', 'annee', { unique: false });
                rapportStore.createIndex('pharmacie_date', ['pharmacie_id', 'date'], { unique: true });
                
                console.log('[DB] Table "rapports_journaliers" créée');
            }

            // ==========================================
            // 3. TABLE VERSEMENTS (NOUVEAU MODULE)
            // ==========================================
            if (!database.objectStoreNames.contains('versements')) {
                const versementStore = database.createObjectStore('versements', { 
                    keyPath: 'id',
                    autoIncrement: true 
                });
                
                versementStore.createIndex('date', 'date', { unique: false });
                versementStore.createIndex('pharmacie_id', 'pharmacie_id', { unique: false });
                versementStore.createIndex('mois', 'mois', { unique: false });
                versementStore.createIndex('annee', 'annee', { unique: false });
                versementStore.createIndex('pharmacie_date', ['pharmacie_id', 'date'], { unique: false });
                
                console.log('[DB] Table "versements" créée');
            }

            // ==========================================
            // 4. TABLE DEPENSES
            // ==========================================
            if (!database.objectStoreNames.contains('depenses')) {
                const depenseStore = database.createObjectStore('depenses', { 
                    keyPath: 'id',
                    autoIncrement: true 
                });
                
                depenseStore.createIndex('pharmacie_id', 'pharmacie_id', { unique: false });
                depenseStore.createIndex('date', 'date', { unique: false });
                depenseStore.createIndex('categorie', 'categorie', { unique: false });
                depenseStore.createIndex('sous_categorie', 'sous_categorie', { unique: false });
                depenseStore.createIndex('mois', 'mois', { unique: false });
                depenseStore.createIndex('annee', 'annee', { unique: false });
                
                console.log('[DB] Table "depenses" créée');
            }

            // ==========================================
            // 5. TABLE LIVRE DE COMPTES (JOURNAL)
            // ==========================================
            if (!database.objectStoreNames.contains('livre_comptes')) {
                const livreStore = database.createObjectStore('livre_comptes', { 
                    keyPath: 'id',
                    autoIncrement: true 
                });
                
                livreStore.createIndex('date', 'date', { unique: false });
                livreStore.createIndex('pharmacie_id', 'pharmacie_id', { unique: false });
                livreStore.createIndex('type_operation', 'type_operation', { unique: false });
                livreStore.createIndex('mois', 'mois', { unique: false });
                livreStore.createIndex('annee', 'annee', { unique: false });
                
                console.log('[DB] Table "livre_comptes" créée');
            }

            // ==========================================
            // 6. TABLE DETTES FOURNISSEURS
            // ==========================================
            if (!database.objectStoreNames.contains('dettes_fournisseurs')) {
                const detteStore = database.createObjectStore('dettes_fournisseurs', { 
                    keyPath: 'id',
                    autoIncrement: true 
                });
                
                detteStore.createIndex('fournisseur', 'fournisseur', { unique: false });
                detteStore.createIndex('pharmacie_id', 'pharmacie_id', { unique: false });
                detteStore.createIndex('date_echeance', 'date_echeance', { unique: false });
                detteStore.createIndex('statut', 'statut', { unique: false });
                
                console.log('[DB] Table "dettes_fournisseurs" créée');
            }

            // ==========================================
            // 7. TABLE BALANCE MENSUELLE
            // ==========================================
            if (!database.objectStoreNames.contains('balance_mensuelle')) {
                const balanceStore = database.createObjectStore('balance_mensuelle', { 
                    keyPath: 'id',
                    autoIncrement: true 
                });
                
                balanceStore.createIndex('pharmacie_id', 'pharmacie_id', { unique: false });
                balanceStore.createIndex('mois', 'mois', { unique: false });
                balanceStore.createIndex('annee', 'annee', { unique: false });
                balanceStore.createIndex('pharmacie_periode', ['pharmacie_id', 'mois', 'annee'], { unique: true });
                
                console.log('[DB] Table "balance_mensuelle" créée');
            }

            // ==========================================
            // 8. TABLE PARAMETRES
            // ==========================================
            if (!database.objectStoreNames.contains('parametres')) {
                const paramStore = database.createObjectStore('parametres', { 
                    keyPath: 'cle' 
                });
                
                console.log('[DB] Table "parametres" créée');
            }

            // ==========================================
            // Insertion des données initiales
            // ==========================================
            insertInitialData(database);
        };
    });
}

/**
 * Données initiales (Pharmacies par défaut + Paramètres)
 */
function insertInitialData(db) {
    // Pharmacies par défaut basées sur vos fichiers Excel
    const pharmaciesParDefaut = [
        { nom: 'BIAYI', code: 'BIAYI', ville: 'Kinshasa', responsable: '', taux_change: 2800, statut: 'actif' },
        { nom: 'PHARMAFRICA', code: 'PHARMAFRICA', ville: 'Kinshasa', responsable: '', taux_change: 2800, statut: 'actif' },
        { nom: 'DE LA REVOLUTION', code: 'DLR', ville: 'Kinshasa', responsable: '', taux_change: 2800, statut: 'actif' },
        { nom: 'KASAI', code: 'KASAI', ville: 'Kinshasa', responsable: '', taux_change: 2800, statut: 'actif' },
        { nom: 'HEWA BORA 1', code: 'HB1', ville: 'Kinshasa', responsable: '', taux_change: 2800, statut: 'actif' },
        { nom: 'HEWA BORA 2', code: 'HB2', ville: 'Kinshasa', responsable: '', taux_change: 2800, statut: 'actif' },
        { nom: 'KOLWEZI 1', code: 'KWZ1', ville: 'Kolwezi', responsable: '', taux_change: 2800, statut: 'actif' },
        { nom: 'KOLWEZI 2', code: 'KWZ2', ville: 'Kolwezi', responsable: '', taux_change: 2800, statut: 'actif' }
    ];

    // Vérifier si les pharmacies existent déjà
    const pharmacyStore = db.transaction('pharmacies', 'readonly').objectStore('pharmacies');
    const countRequest = pharmacyStore.count();

    countRequest.onsuccess = () => {
        if (countRequest.result === 0) {
            // Insérer les pharmacies par défaut
            const tx = db.transaction('pharmacies', 'readwrite');
            pharmaciesParDefaut.forEach(pharma => {
                tx.objectStore('pharmacies').add({
                    ...pharma,
                    solde_ouverture_fc: 0,
                    solde_ouverture_usd: 0,
                    created_at: new Date().toISOString()
                });
            });
            tx.oncomplete = () => console.log('[DB] Pharmacies par défaut insérées');
        }
    };

    // Paramètres par défaut
    const parametresParDefaut = [
        { cle: 'devise_principale', valeur: 'FC' },
        { cle: 'devise_secondaire', valeur: 'USD' },
        { cle: 'taux_change_defaut', valeur: '2800' },
        { cle: 'mois_courant', valeur: new Date().getMonth() + 1 },
        { cle: 'annee_courante', valeur: new Date().getFullYear() },
        { cle: 'nom_entreprise', valeur: 'LA DIVINE HEALTHCARE' },
        { cle: 'periode_debut', valeur: '2026-08' },
        { cle: 'periode_fin', valeur: '2026-12' }
    ];

    const paramStore = db.transaction('parametres', 'readonly').objectStore('parametres');
    const paramCountRequest = paramStore.count();

    paramCountRequest.onsuccess = () => {
        if (paramCountRequest.result === 0) {
            const tx = db.transaction('parametres', 'readwrite');
            parametresParDefaut.forEach(param => {
                tx.objectStore('parametres').put(param);
            });
            tx.oncomplete = () => console.log('[DB] Paramètres par défaut insérés');
        }
    };
}

// ==========================================
// FONCTIONS GÉNÉRIQUES CRUD
// ==========================================

/**
 * Récupérer tous les enregistrements d'un store
 */
async function getAll(storeName) {
    const database = await initDatabase();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Récupérer un enregistrement par ID
 */
async function getById(storeName, id) {
    const database = await initDatabase();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(id);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Ajouter un nouvel enregistrement
 */
async function addRecord(storeName, data) {
    const database = await initDatabase();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        
        // Ajouter timestamp et metadata
        const record = {
            ...data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        const request = store.add(record);
        
        request.onsuccess = () => {
            console.log(`[DB] Enregistrement ajouté dans ${storeName}:`, request.result);
            resolve({ id: request.result, ...record });
        };
        request.onerror = () => reject(request.error);
    });
}

/**
 * Mettre à jour un enregistrement
 */
async function updateRecord(storeName, id, data) {
    const database = await initDatabase();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        
        // Récupérer l'enregistrement existant
        const getRequest = store.get(id);
        
        getRequest.onsuccess = () => {
            const existing = getRequest.result;
            if (!existing) {
                reject(new Error('Enregistrement non trouvé'));
                return;
            }
            
            // Fusionner avec les nouvelles données
            const updated = {
                ...existing,
                ...data,
                id: id, // Préserver l'ID original
                updated_at: new Date().toISOString()
            };
            
            const putRequest = store.put(updated);
            putRequest.onsuccess = () => resolve(updated);
            putRequest.onerror = () => reject(putRequest.error);
        };
        
        getRequest.onerror = () => reject(getRequest.error);
    });
}

/**
 * Supprimer un enregistrement
 */
async function deleteRecord(storeName, id) {
    const database = await initDatabase();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(id);
        
        request.onsuccess = () => {
            console.log(`[DB] Enregistrement supprimé de ${storeName}:`, id);
            resolve(true);
        };
        request.onerror = () => reject(request.error);
    });
}

/**
 * Rechercher par index
 */
async function getByIndex(storeName, indexName, value) {
    const database = await initDatabase();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const index = store.index(indexName);
        const request = index.getAll(value);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Compter les enregistrements
 */
async function countRecords(storeName) {
    const database = await initDatabase();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.count();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Vider complètement un store
 */
async function clearStore(storeName) {
    const database = await initDatabase();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        
        request.onsuccess = () => {
            console.log(`[DB] Store ${storeName} vidé`);
            resolve(true);
        };
        request.onerror = () => reject(request.error);
    });
}

// ==========================================
// FONCTIONS SPÉCIFIQUES PAR MODULE
// ==========================================

/** ===== PHARMACIES ===== */

async function getPharmacies() {
    return getAll('pharmacies');
}

async function getPharmacyById(id) {
    return getById('pharmacies', id);
}

async function addPharmacy(data) {
    return addRecord('pharmacies', data);
}

async function updatePharmacy(id, data) {
    return updateRecord('pharmacies', id, data);
}

async function deletePharmacy(id) {
    return deleteRecord('pharmacies', id);
}

/** ===== RAPPORTS JOURNALIERS ===== */

async function getRapportsJournaliers(filters = {}) {
    let rapports = await getAll('rapports_journaliers');
    
    if (filters.pharmacie_id) {
        rapports = rapports.filter(r => r.pharmacie_id == filters.pharmacie_id);
    }
    if (filters.mois) {
        rapports = rapports.filter(r => r.mois == filters.mois);
    }
    if (filters.annee) {
        rapports = rapports.filter(r => r.annee == filters.annee);
    }
    if (filters.date_debut && filters.date_fin) {
        rapports = rapports.filter(r => r.date >= filters.date_debut && r.date <= filters.date_fin);
    }
    
    // Trier par date décroissante
    rapports.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return rapports;
}

async function getRapportByDate(pharmacieId, date) {
    return getByIndex('rapports_journaliers', 'pharmacie_date', [pharmacieId, date]);
}

async function addRapportJournalier(data) {
    return addRecord('rapports_journaliers', data);
}

async function updateRapportJournalier(id, data) {
    return updateRecord('rapports_journaliers', id, data);
}

/** ===== VERSEMENTS ===== */

async function getVersements(filters = {}) {
    let versements = await getAll('versements');
    
    if (filters.pharmacie_id) {
        versements = versements.filter(v => v.pharmacie_id == filters.pharmacie_id);
    }
    if (filters.mois) {
        versements = versements.filter(v => v.mois == filters.mois);
    }
    if (filters.annee) {
        versements = versements.filter(v => v.annee == filters.annee);
    }
    if (filters.date_debut && filters.date_fin) {
        versements = versements.filter(v => v.date >= filters.date_debut && v.date <= filters.date_fin);
    }
    
    // Trier par date décroissante
    versements.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return versements;
}

async function addVersement(data) {
    return addRecord('versements', data);
}

async function updateVersement(id, data) {
    return updateRecord('versements', id, data);
}

async function deleteVersement(id) {
    return deleteRecord('versements', id);
}

/** ===== DÉPENSES ===== */

async function getDepenses(filters = {}) {
    let depenses = await getAll('depenses');
    
    if (filters.pharmacie_id) {
        depenses = depenses.filter(d => d.pharmacie_id == filters.pharmacie_id);
    }
    if (filters.categorie) {
        depenses = depenses.filter(d => d.categorie === filters.categorie);
    }
    if (filters.mois) {
        depenses = depenses.filter(d => d.mois == filters.mois);
    }
    if (filters.annee) {
        depenses = depenses.filter(d => d.annee == filters.annee);
    }
    if (filters.date_debut && filters.date_fin) {
        depenses = depenses.filter(d => d.date >= filters.date_debut && d.date <= filters.date_fin);
    }
    
    // Trier par date décroissante
    depenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return depenses;
}

async function addDepense(data) {
    return addRecord('depenses', data);
}

async function updateDepense(id, data) {
    return updateRecord('depenses', id, data);
}

async function deleteDepense(id) {
    return deleteRecord('depenses', id);
}

/** ===== LIVRE DE COMPTES ===== */

async function getLivreComptes(filters = {}) {
    let operations = await getAll('livre_comptes');
    
    if (filters.pharmacie_id) {
        operations = operations.filter(o => o.pharmacie_id == filters.pharmacie_id);
    }
    if (filters.type_operation) {
        operations = operations.filter(o => o.type_operation === filters.type_operation);
    }
    if (filters.mois) {
        operations = operations.filter(o => o.mois == filters.mois);
    }
    if (filters.annee) {
        operations = operations.filter(o => o.annee == filters.annee);
    }
    
    // Trier par date croissante pour le calcul du solde cumulé
    operations.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return operations;
}

async function addOperationLivre(data) {
    return addRecord('livre_comptes', data);
}

async function updateOperationLivre(id, data) {
    return updateRecord('livre_comptes', id, data);
}

async function deleteOperationLivre(id) {
    return deleteRecord('livre_comptes', id);
}

/** ===== DETTES FOURNISSEURS ===== */

async function getDettesFournisseurs(filters = {}) {
    let dettes = await getAll('dettes_fournisseurs');
    
    if (filters.pharmacie_id) {
        dettes = dettes.filter(d => d.pharmacie_id == filters.pharmacie_id);
    }
    if (filters.statut) {
        dettes = dettes.filter(d => d.statut === filters.statut);
    }
    
    // Trier par échéance
    dettes.sort((a, b) => new Date(a.date_echeance) - new Date(b.date_echeance));
    
    return dettes;
}

async function addDetteFournisseur(data) {
    return addRecord('dettes_fournisseurs', data);
}

async function updateDetteFournisseur(id, data) {
    return updateRecord('dettes_fournisseurs', id, data);
}

async function deleteDetteFournisseur(id) {
    return deleteRecord('dettes_fournisseurs', id);
}

/** ===== BALANCE MENSUELLE ===== */

async function getBalanceMensuelle(filters = {}) {
    let balances = await getAll('balance_mensuelle');
    
    if (filters.pharmacie_id) {
        balances = balances.filter(b => b.pharmacie_id == filters.pharmacie_id);
    }
    if (filters.mois) {
        balances = balances.filter(b => b.mois == filters.mois);
    }
    if (filters.annee) {
        balances = balances.filter(b => b.annee == filters.annee);
    }
    
    return balances;
}

async function getBalanceByPeriode(pharmacieId, mois, annee) {
    return getByIndex('balance_mensuelle', 'pharmacie_periode', [pharmacieId, mois, annee]);
}

async function addBalanceMensuelle(data) {
    return addRecord('balance_mensuelle', data);
}

async function updateBalanceMensuelle(id, data) {
    return updateRecord('balance_mensuelle', id, data);
}

/** ===== PARAMÈTRES ===== */

async function getParametre(cle) {
    const database = await initDatabase();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction('parametres', 'readonly');
        const store = transaction.objectStore('parametres');
        const request = store.get(cle);
        
        request.onsuccess = () => resolve(request.result ? request.result.valeur : null);
        request.onerror = () => reject(request.error);
    });
}

async function setParametre(cle, valeur) {
    const database = await initDatabase();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction('parametres', 'readwrite');
        const store = transaction.objectStore('parametres');
        const request = store.put({ cle, valeur, updated_at: new Date().toISOString() });
        
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
    });
}

async function getAllParametres() {
    const params = await getAll('parametres');
    const result = {};
    params.forEach(p => result[p.cle] = p.valeur);
    return result;
}

// ==========================================
// STATISTIQUES ET AGRÉGATIONS
// ==========================================

/**
 * Calculer les statistiques du tableau de bord
 */
async function getDashboardStats(mois, annee) {
    const [pharmacies, versements, depenses, rapports] = await Promise.all([
        getPharmacies(),
        getVersements({ mois, annee }),
        getDepenses({ mois, annee }),
        getRapportsJournaliers({ mois, annee })
    ]);
    
    // Total des versements par pharmacie
    const totalVersementsFC = versements.reduce((sum, v) => sum + (parseFloat(v.montant_fc) || 0), 0);
    const totalVersementsUSD = versements.reduce((sum, v) => sum + (parseFloat(v.montant_usd) || 0), 0);
    
    // Total des dépenses
    const totalDepenses = depenses.reduce((sum, d) => sum + (parseFloat(d.montant) || 0), 0);
    
    // Stats par site
    const statsParSite = pharmacies.map(p => {
        const versementsSite = versements.filter(v => v.pharmacie_id === p.id);
        const depensesSite = depenses.filter(d => d.pharmacie_id === p.id);
        
        return {
            pharmacie: p.nom,
            pharmacie_id: p.id,
            versements_fc: versementsSite.reduce((sum, v) => sum + (parseFloat(v.montant_fc) || 0), 0),
            versements_usd: versementsSite.reduce((sum, v) => sum + (parseFloat(v.montant_usd) || 0), 0),
            depenses: depensesSite.reduce((sum, d) => sum + (parseFloat(d.montant) || 0), 0),
            nombre_versements: versementsSite.length,
            nombre_depenses: depensesSite.length
        };
    });
    
    return {
        periode: { mois, annee },
        nombre_sites: pharmacies.length,
        total_versements_fc: totalVersementsFC,
        total_versements_usd: totalVersementsUSD,
        total_depenses: totalDepenses,
        solde_net: totalVersementsFC - totalDepenses,
        stats_par_site: statsParSite
    };
}

/**
 * Exporter toutes les données (backup)
 */
async function exportAllData() {
    const [pharmacies, rapports, versements, depenses, livre, dettes, balances, params] = await Promise.all([
        getPharmacies(),
        getAll('rapports_journaliers'),
        getAll('versements'),
        getDepenses(),
        getAll('livre_comptes'),
        getDettesFournisseurs(),
        getAll('balance_mensuelle'),
        getAllParametres()
    ]);
    
    return {
        version: DB_VERSION,
        export_date: new Date().toISOString(),
        pharmacies,
        rapports_journaliers: rapports,
        versements,
        depenses,
        livre_comptes: livre,
        dettes_fournisseurs: dettes,
        balance_mensuelle: balances,
        parametres: params
    };
}

/**
 * Importer des données (restore)
 */
async function importAllData(data) {
    const database = await initDatabase();
    
    const stores = [
        'pharmacies',
        'rapports_journaliers',
        'versements',
        'depenses',
        'livre_comptes',
        'dettes_fournisseurs',
        'balance_mensuelle'
    ];
    
    // Vider et réimporter chaque store
    for (const storeName of stores) {
        const tx = database.transaction(storeName, 'readwrite');
        tx.objectStore(storeName).clear();
        
        if (data[storeName] && Array.isArray(data[storeName])) {
            data[storeName].forEach(record => {
                tx.objectStore(storeName).add(record);
            });
        }
    }
    
    // Importer les paramètres
    if (data.parametres) {
        const tx = database.transaction('parametres', 'readwrite');
        Object.entries(data.parametres).forEach(([cle, valeur]) => {
            tx.objectStore('parametres').put({ cle, valeur });
        });
    }
    
    return true;
}

// Export pour utilisation globale
window.DB = {
    init: initDatabase,
    getAll,
    getById,
    addRecord,
    updateRecord,
    deleteRecord,
    getByIndex,
    countRecords,
    clearStore,
    // Pharmacies
    pharmacies: {
        getAll: getPharmacies,
        getById: getPharmacyById,
        add: addPharmacy,
        update: updatePharmacy,
        delete: deletePharmacy
    },
    // Rapports
    rapports: {
        getAll: getRapportsJournaliers,
        getByDate: getRapportByDate,
        add: addRapportJournalier,
        update: updateRapportJournalier
    },
    // Versements
    versements: {
        getAll: getVersements,
        add: addVersement,
        update: updateVersement,
        delete: deleteVersement
    },
    // Dépenses
    depenses: {
        getAll: getDepenses,
        add: addDepense,
        update: updateDepense,
        delete: deleteDepense
    },
    // Livre de comptes
    livre: {
        getAll: getLivreComptes,
        add: addOperationLivre,
        update: updateOperationLivre,
        delete: deleteOperationLivre
    },
    // Dettes
    dettes: {
        getAll: getDettesFournisseurs,
        add: addDetteFournisseur,
        update: updateDetteFournisseur,
        delete: deleteDetteFournisseur
    },
    // Balance
    balance: {
        getAll: getBalanceMensuelle,
        getByPeriode: getBalanceByPeriode,
        add: addBalanceMensuelle,
        update: updateBalanceMensuelle
    },
    // Paramètres
    params: {
        get: getParametre,
        set: setParametre,
        getAll: getAllParametres
    },
    // Utilitaires
    dashboard: getDashboardStats,
    exportAll: exportAllData,
    importAll: importAllData
};

console.log('[DB] Module chargé - API disponible via window.DB');
