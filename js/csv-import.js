/**
 * ============================================
 * LA DIVINE PharmaFinance Pro v3.0
 * Module CSVImport - Importation Massive
 * ============================================
 * 
 * Supporte:
 * - Fichiers CSV (séparateur: virgule, point-virgule ou tabulation)
 * - Détection automatique du type de données
 * - Validation avant import
 * - Import par lot (batch) avec progression
 * - Templates téléchargeables
 */

const CSVImport = {
    // État du module
    state: {
        file: null,
        data: [],
        validatedData: [],
        errors: [],
        warnings: [],
        selectedType: null,
        isImporting: false,
        importProgress: 0,
        importResult: null
    },
    
    // Configuration des types d'import supportés
    TYPES_IMPORT: {
        versements: {
            id: 'versements',
            nom: 'Versements',
            icon: '💰',
            description: 'Importer les versements quotidiens des pharmacies',
            table: 'versements',
            champsRequis: ['date', 'pharmacie', 'montant_fc'],
            champsOptionnels: ['montant_usd', 'observation'],
            mapping: {
                'date': 'date_versement',
                'date_versement': 'date_versement',
                'pharmacie': 'pharmacie',
                'nom_pharmacie': 'pharmacie',
                'site': 'pharmacie',
                'montant_fc': 'montant_fc',
                'montantfc': 'montant_fc',
                'montant': 'montant_fc',
                'montant_usd': 'montant_usd',
                'usd': 'montant_usd',
                'observation': 'observation',
                'obs': 'observation',
                'note': 'observation'
            }
        },
        depenses: {
            id: 'depenses',
            nom: 'Dépenses',
            icon: '📤',
            description: 'Importer les dépenses par catégorie',
            table: 'depenses',
            champsRequis: ['date', 'categorie', 'montant'],
            champsOptionnels: ['pharmacie', 'fournisseur', 'observation'],
            mapping: {
                'date': 'date_depense',
                'date_depense': 'date_depense',
                'categorie': 'categorie',
                'type': 'categorie',
                'type_depense': 'categorie',
                'montant': 'montant_fc',
                'montant_fc': 'montant_fc',
                'montant': 'montant_fc',
                'pharmacie': 'pharmacie',
                'site': 'pharmacie',
                'fournisseur': 'fournisseur',
                'observation': 'observation',
                'note': 'observation'
            }
        },
        rapports: {
            id: 'rapports',
            nom: 'Rapports Journaliers',
            icon: '📝',
            description: 'Importer les rapports de ventes journaliers complets',
            table: 'rapports_journaliers',
            champsRequis: ['date', 'pharmacie', 'vente_dollars', 'vente_francs'],
            champsOptionnels: ['caisse_ouverture', 'caisse_fermeture', 'observation'],
            mapping: {
                'date': 'date_rapport',
                'date_rapport': 'date_rapport',
                'pharmacie': 'pharmacie',
                'site': 'pharmacie',
                'vente_dollars': 'dollars',
                'dollars': 'dollars',
                '$': 'dollars',
                'usd': 'dollars',
                'vente_francs': 'francs',
                'francs': 'francs',
                'fc': 'francs',
                'cdf': 'francs',
                'caisse_ouverture': 'caisse_ouverture',
                'ouverture': 'caisse_ouverture',
                'caisse_fermeture': 'caisse_fermeture',
                'fermeture': 'caisse_fermeture',
                'observation': 'observation',
                'note': 'observation'
            }
        }
    },

    // ==========================================
    // INITIALISATION
    // ==========================================

    async init() {
        console.log('[CSVImport] Initialisation module import v3.0...');
        this.setupEventListeners();
    },

    setupEventListeners() {
        // Dropzone events
        const dropzone = document.getElementById('csv-dropzone');
        const input = document.getElementById('csv-file-input');
        
        if (dropzone && input) {
            // Click to browse
            dropzone.addEventListener('click', () => input.click());
            
            // File select
            input.addEventListener('change', (e) => this.handleFileSelect(e));
            
            // Drag & drop
            dropzone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropzone.classList.add('dragover');
            });
            
            dropzone.addEventListener('dragleave', () => {
                dropzone.classList.remove('dragover');
            });
            
            dropzone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropzone.classList.remove('dragover');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.processFile(files[0]);
                }
            });
        }
        
        // Type selection
        document.querySelectorAll('.option-card').forEach(card => {
            card.addEventListener('click', () => this.selectType(card.dataset.type));
        });
        
        // Action buttons
        const btnImport = document.getElementById('btn-import-csv');
        if (btnImport) {
            btnImport.addEventListener('click', () => this.startImport());
        }
        
        const btnReset = document.getElementById('btn-reset-import');
        if (btnReset) {
            btnReset.addEventListener('click', () => this.reset());
        }
        
        const btnTemplate = document.getElementById('btn-download-template');
        if (btnTemplate) {
            btnTemplate.addEventListener('click', () => this.downloadTemplate());
        }
    },

    // ==========================================
    // GESTION DES FICHIERS
    // ==========================================

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.processFile(file);
        }
    },

    async processFile(file) {
        console.log('[CSVImport] Traitement du fichier:', file.name);
        
        // Validation du format
        const extensionsValides = ['.csv', '.tsv', '.txt', '.xlsx', '.xls'];
        const extension = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!extensionsValides.includes(extension)) {
            this.showError(`Format non supporté: ${extension}. Utilisez un fichier CSV.`);
            return;
        }
        
        // Taille max 10MB
        if (file.size > 10 * 1024 * 1024) {
            this.showError('Fichier trop volumineux (max 10MB).');
            return;
        }
        
        this.state.file = file;
        
        try {
            let content;
            
            if (['.xlsx', '.xls'].includes(extension)) {
                // Pour Excel, on utiliserait une librairie comme SheetJS
                // Ici on demande à l'utilisateur de convertir en CSV
                this.showInfo('Pour les fichiers Excel (.xlsx), veuillez dabord les exporter en format CSV.');
                return;
            } else {
                content = await this.readFileContent(file);
            }
            
            // Parser le CSV
            const parsed = this.parseCSV(content);
            
            if (parsed.length === 0) {
                this.showError('Le fichier est vide ou le format est invalide.');
                return;
            }
            
            this.state.data = parsed;
            
            // Mettre à jour UI
            this.showFileInfo(file, parsed.length);
            this.showPreview(parsed);
            this.detectImportType(parsed[0]);
            
            // Valider si un type est sélectionné
            if (this.state.selectedType) {
                this.validateData();
            }
            
        } catch (error) {
            console.error('[CSVImport] Erreur:', error);
            this.showError('Erreur lors de la lecture du fichier: ' + error.message);
        }
    },

    readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Erreur de lecture'));
            reader.readAsText(file, 'UTF-8');
        });
    },

    // ==========================================
    // PARSING CSV
    // ==========================================

    parseCSV(content) {
        const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
        
        if (lines.length < 2) {
            throw new Error('Le fichier doit contenir au moins une ligne den-tête et une ligne de données.');
        }
        
        // Détecter le séparateur
        const firstLine = lines[0];
        const separator = this.detectSeparator(firstLine);
        
        // Parser len-tête
        const headers = this.parseLine(firstLine, separator).map(h => 
            h.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_')
        );
        
        // Parser les données
        const data = [];
        for (let i = 1; i < lines.length; i++) {
            const values = this.parseLine(lines[i], separator);
            if (values.length === headers.length || values.length > 0) {
                const row = {};
                headers.forEach((header, idx) => {
                    row[header] = values[idx] ? values[idx].trim() : '';
                });
                
                // Ajouter les colonnes en trop si présentes
                if (values.length > headers.length) {
                    for (let j = headers.length; j < values.length; j++) {
                        row[`colonne_${j}`] = values[j] ? values[j].trim() : '';
                    }
                }
                
                data.push(row);
            }
        }
        
        console.log('[CSVImport] Parsing terminé:', data.length, 'lignes,', headers.length, 'colonnes');
        return { headers, rows: data };
    },

    detectSeparator(line) {
        const separators = [',', ';', '\t'];
        let counts = {};
        
        separators.forEach(sep => {
            counts[sep] = (line.match(new RegExp(this.escapeRegex(sep), 'g')) || []).length;
        });
        
        // Retourner le séparateur avec le plus doccurrences
        return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    },

    parseLine(line, separator) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === separator && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current); // Dernier élément
        return result;
    },

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    // ==========================================
    // DÉTECTION DU TYPE D'IMPORT
    // ==========================================

    detectImportType(headers) {
        const headerKeys = Object.keys(headers).map(k => k.toLowerCase());
        
        let bestMatch = null;
        let bestScore = 0;
        
        Object.values(this.TYPES_IMPORT).forEach(type => {
            let score = 0;
            type.champsRequis.forEach(champ => {
                if (headerKeys.some(k => k.includes(champ.toLowerCase()) || champ.toLowerCase().includes(k))) {
                    score += 10;
                }
            });
            
            if (score > bestScore) {
                bestScore = score;
                bestMatch = type.id;
            }
        });
        
        if (bestMatch && bestScore >= 20) {
            this.selectType(bestMatch);
        }
    },

    selectType(typeId) {
        this.state.selectedType = typeId;
        
        // Mise à jour UI
        document.querySelectorAll('.option-card').forEach(card => {
            card.classList.toggle('selected', card.dataset.type === typeId);
        });
        
        // Revalider si données présentes
        if (this.state.data.rows && this.state.data.rows.length > 0) {
            this.validateData();
        }
    },

    // ==========================================
    // VALIDATION DES DONNÉES
    // ==========================================

    validateData() {
        if (!this.state.selectedType || !this.state.data.rows) return;
        
        const typeConfig = this.TYPES_IMPORT[this.state.selectedType];
        const rows = this.state.data.rows;
        
        this.state.errors = [];
        this.state.warnings = [];
        this.state.validatedData = [];
        
        const pharmacies = []; // Sera rempli depuis DB
        
        // Récupérer la liste des pharmacies pour validation
        DB.getAll('pharmacies').then(pharmas => {
            pharmacies.push(...pharmas.map(p => p.nom.toLowerCase()));
            
            rows.forEach((row, index) => {
                const rowNum = index + 2; // +2 car ligne 1 = en-tête
                const validatedRow = { ...row, _valid: true, _errors: [], _warnings: [] };
                
                // Validation des champs requis
                typeConfig.champsRequis.forEach(champ => {
                    const value = this.findMappedValue(row, champ, typeConfig.mapping);
                    
                    if (!value || value.toString().trim() === '') {
                        const error = `Champ requis manquant: ${champ}`;
                        this.state.errors.push({ row: rowNum, field: champ, message: error });
                        validatedRow._errors.push(error);
                        validatedRow._valid = false;
                    }
                });
                
                // Validation spécifique par type
                switch (this.state.selectedType) {
                    case 'versements':
                        this.validateVersement(validatedRow, rowNum, pharmacies);
                        break;
                    case 'depenses':
                        this.validateDepense(validatedRow, rowNum, pharmacies);
                        break;
                    case 'rapports':
                        this.validateRapport(validatedRow, rowNum, pharmacies);
                        break;
                }
                
                this.state.validatedData.push(validatedRow);
            });
            
            // Afficher résultats
            this.displayValidationResults();
            this.updatePreviewWithValidation();
            this.updateImportButton();
        });
    },

    validateVersement(row, rowNum, pharmacies) {
        // Date valide?
        const dateVal = this.findMappedValue(row, 'date', this.TYPES_IMPORT.versements.mapping);
        if (dateVal && !this.isValidDate(dateVal)) {
            const error = `Date invalide: ${dateVal}`;
            this.state.errors.push({ row: rowNum, field: 'date', message: error });
            row._errors.push(error);
            row._valid = false;
        }
        
        // Montant FC numérique?
        const montantFC = this.findMappedValue(row, 'montant_fc', this.TYPES_IMPORT.versements.mapping);
        if (montantFC && isNaN(parseFloat(montantFC.replace(',', '.')))) {
            const error = `Montant FC non numérique: ${montantFC}`;
            this.state.errors.push({ row: rowNum, field: 'montant_fc', message: error });
            row._errors.push(error);
            row._valid = false;
        }
        
        // Pharmacie connue?
        const pharmacie = this.findMappedValue(row, 'pharmacie', this.TYPES_IMPORT.versements.mapping);
        if (pharmacie && pharmacies.length > 0 && !pharmacies.some(p => p.includes(pharmacie.toLowerCase()))) {
            const warning = `Pharmacie inconnue: ${pharmacie}`;
            this.state.warnings.push({ row: rowNum, message: warning });
            row._warnings.push(warning);
        }
    },

    validateDepense(row, rowNum, pharmacies) {
        const dateVal = this.findMappedValue(row, 'date', this.TYPES_IMPORT.depenses.mapping);
        if (dateVal && !this.isValidDate(dateVal)) {
            const error = `Date invalide: ${dateVal}`;
            this.state.errors.push({ row: rowNum, field: 'date', message: error });
            row._errors.push(error);
            row._valid = false;
        }
        
        const montant = this.findMappedValue(row, 'montant', this.TYPES_IMPORT.depenses.mapping);
        if (montant && isNaN(parseFloat(montant.replace(',', '.')))) {
            const error = `Montant non numérique: ${montant}`;
            this.state.errors.push({ row: rowNum, field: 'montant', message: error });
            row._errors.push(error);
            row._valid = false;
        }
    },

    validateRapport(row, rowNum, pharmacies) {
        const dateVal = this.findMappedValue(row, 'date', this.TYPES_IMPORT.rapports.mapping);
        if (dateVal && !this.isValidDate(dateVal)) {
            const error = `Date invalide: ${dateVal}`;
            this.state.errors.push({ row: rowNum, field: 'date', message: error });
            row._errors.push(error);
            row._valid = false;
        }
        
        ['vente_dollars', 'vente_francs'].forEach(champ => {
            const val = this.findMappedValue(row, champ, this.TYPES_IMPORT.rapports.mapping);
            if (val && isNaN(parseFloat(val.replace(',', '.')))) {
                const error = `${champ} non numérique: ${val}`;
                this.state.errors.push({ row: rowNum, field: champ, message: error });
                row._errors.push(error);
                row._valid = false;
            }
        });
    },

    findMappedValue(row, originalField, mapping) {
        // Chercher directement
        if (row[originalField]) return row[originalField];
        
        // Chercher via mapping
        for (const [source, target] of Object.entries(mapping)) {
            if (target === originalField && row[source]) {
                return row[source];
            }
        }
        
        // Chercher partiellement
        for (const key of Object.keys(row)) {
            if (key.includes(originalField.toLowerCase()) || originalField.toLowerCase().includes(key)) {
                return row[key];
            }
        }
        
        return null;
    },

    isValidDate(dateStr) {
        // Essayer différents formats
        const formats = [
            /^\d{4}-\d{2}-\d{2}$/,           // YYYY-MM-DD
            /^\d{2}\/\d{2}\/\d{4}$/,          // DD/MM/YYYY
            /^\d{2}-\d{2}-\d{4}$/             // DD-MM-YYYY
        ];
        
        const date = new Date(dateStr);
        return !isNaN(date.getTime()) || formats.some(f => f.test(dateStr));
    },

    // ==========================================
    // AFFICHAGE UI
    // ==========================================

    showFileInfo(file, rowCount) {
        const infoEl = document.getElementById('file-info');
        if (!infoEl) return;
        
        const size = this.formatFileSize(file.size);
        infoEl.querySelector('.file-info-name').textContent = file.name;
        infoEl.querySelector('.file-info-meta').textContent = `${size} • ${rowCount} lignes de données`;
        infoEl.classList.add('visible');
        
        document.getElementById('csv-dropzone')?.classList.add('has-file');
    },

    showPreview(data) {
        const wrapper = document.getElementById('preview-table-wrapper');
        const section = document.getElementById('preview-section');
        if (!wrapper || !section) return;
        
        section.style.display = 'block';
        
        const headers = data.headers;
        const rows = data.rows.slice(0, 100); // Limiter à 100 lignes pour aperçu
        
        let html = '<table class="preview-table"><thead><tr>';
        headers.forEach(h => {
            html += `<th>${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        
        rows.forEach(row => {
            html += '<tr>';
            headers.forEach(h => {
                const val = row[h] !== undefined ? row[h] : '';
                html += `<td>${this.escapeHtml(val)}</td>`;
            });
            html += '</tr>';
        });
        
        html += '</tbody></table>';
        wrapper.innerHTML = html;
        
        // Stats
        document.getElementById('preview-total').textContent = data.rows.length;
        document.getElementById('preview-columns').textContent = headers.length;
        document.getElementById('preview-showing').textContent = Math.min(rows.length, data.rows.length);
    },

    updatePreviewWithValidation() {
        const tbody = document.querySelector('#preview-table-wrapper tbody');
        if (!tbody || !this.state.validatedData.length) return;
        
        const rows = tbody.querySelectorAll('tr');
        rows.forEach((row, idx) => {
            if (idx < this.state.validatedData.length) {
                const vd = this.state.validatedData[idx];
                
                if (vd._errors.length > 0) {
                    row.className = 'error-row';
                } else if (vd._warnings.length > 0) {
                    row.className = 'warning-row';
                } else {
                    row.className = 'success-row';
                }
            }
        });
    },

    displayValidationResults() {
        const errorsEl = document.getElementById('validation-errors');
        const errorsList = document.getElementById('errors-list');
        const errorsCount = document.getElementById('errors-count');
        
        if (!errorsEl) return;
        
        if (this.state.errors.length > 0) {
            errorsEl.classList.add('visible');
            errorsCount.textContent = this.state.errors.length;
            
            errorsList.innerHTML = this.state.errors.slice(0, 20).map(err => `
                <div class="error-item">
                    <span class="error-line">Ligne ${err.row}</span>
                    <span class="error-message">${err.message}</span>
                </div>
            `).join('');
            
            if (this.state.errors.length > 20) {
                errorsList.innerHTML += `<div class="error-item">...et ${this.state.errors.length - 20} autres erreurs</div>`;
            }
        } else {
            errorsEl.classList.remove('visible');
        }
    },

    updateImportButton() {
        const btn = document.getElementById('btn-import-csv');
        if (!btn) return;
        
        const hasErrors = this.state.errors.length > 0;
        const hasData = this.state.validatedData.length > 0;
        const hasType = !!this.state.selectedType;
        
        btn.disabled = !hasData || !hasType;
        
        if (hasErrors) {
            btn.innerHTML = `<span>⚠️</span> Importer (${this.state.validatedData.filter(v => v._valid).length} valides)`;
        } else {
            btn.innerHTML = `<span>✓</span> Importer ${this.state.validatedData.length} enregistrements`;
        }
    },

    // ==========================================
    // IMPORTATION
    // ==========================================

    async startImport() {
        if (this.state.isImporting) return;
        
        const validRows = this.state.validatedData.filter(v => v._valid);
        if (validRows.length === 0) {
            this.showError('Aucune donnée valide à importer.');
            return;
        }
        
        this.state.isImporting = true;
        this.state.importProgress = 0;
        
        // Montrer progression
        document.getElementById('import-progress').classList.add('visible');
        document.getElementById('import-actions').style.display = 'none';
        
        const typeConfig = this.TYPES_IMPORT[this.state.selectedType];
        let imported = 0;
        let failed = 0;
        
        for (let i = 0; i < validRows.length; i++) {
            const row = validRows[i];
            
            try {
                const record = this.mapRowToRecord(row, typeConfig);
                await DB.add(typeConfig.table, record);
                imported++;
            } catch (error) {
                console.error(`[CSVImport] Erreur ligne ${i + 2}:`, error);
                failed++;
            }
            
            // Mise à jour progression
            this.state.importProgress = Math.round(((i + 1) / validRows.length) * 100);
            document.getElementById('progress-bar-fill').style.width = `${this.state.importProgress}%`;
            document.getElementById('progress-text').innerHTML = 
                `Import en cours... <strong>${i + 1}/${validRows.length}</strong> (<strong>${imported}</strong> réussis)`;
            
            // Petit délai pour UI responsive
            if (i % 50 === 0) await new Promise(r => setTimeout(r, 10));
        }
        
        // Résultat final
        this.state.isImporting = false;
        this.state.importResult = { imported, failed, total: validRows.length };
        
        // Afficher résultat
        this.showImportResult();
        
        // Rafraîchir dashboard si disponible
        if (typeof App !== 'undefined' && App.loadDashboard) {
            await App.loadDashboard();
        }
    },

    mapRowToRecord(row, typeConfig) {
        const record = {
            date_creation: new Date().toISOString(),
            imported: true,
            source: 'csv_import'
        };
        
        // Mapper chaque champ
        for (const [sourceField, targetField] of Object.entries(typeConfig.mapping)) {
            if (row[sourceField] !== undefined && row[sourceField] !== '') {
                let value = row[sourceField];
                
                // Conversion numérique pour les montants
                if (targetField.includes('montant') || ['dollars', 'francs', 'usd'].includes(targetField)) {
                    value = parseFloat(value.replace(',', '.')) || 0;
                }
                
                record[targetField] = value;
            }
        }
        
        // ID unique
        record.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
        
        return record;
    },

    showImportResult() {
        document.getElementById('import-progress').style.display = 'none';
        document.getElementById('import-result').classList.add('visible');
        
        const r = this.state.importResult;
        document.getElementById('result-imported').textContent = r.imported;
        document.getElementById('result-failed').textContent = r.failed;
        document.getElementById('result-total').textContent = r.total;
    },

    // ==========================================
    // UTILITAIRES
    // ==========================================

    reset() {
        this.state = {
            file: null,
            data: [],
            validatedData: [],
            errors: [],
            warnings: [],
            selectedType: null,
            isImporting: false,
            importProgress: 0,
            importResult: null
        };
        
        // Reset UI
        document.getElementById('file-info')?.classList.remove('visible');
        document.getElementById('csv-dropzone')?.classList.remove('has-file');
        document.getElementById('preview-section').style.display = 'none';
        document.getElementById('validation-errors')?.classList.remove('visible');
        document.getElementById('import-progress')?.classList.remove('visible');
        document.getElementById('import-result')?.classList.remove('visible');
        document.getElementById('import-actions').style.display = 'flex';
        document.getElementById('csv-file-input').value = '';
        
        document.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
        
        const btn = document.getElementById('btn-import-csv');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `<span>↑</span> Importer`;
        }
    },

    downloadTemplate() {
        const type = this.state.selectedType || 'versements';
        const config = this.TYPES_IMPORT[type];
        
        let content = '';
        
        switch (type) {
            case 'versements':
                content = 'date_versement,pharmacie,montant_fc,montant_usd,observation\n';
                content += '2024-01-15,BIAYI,1500000,750,Vente quotidienne\n';
                content += '2024-01-15,PHARMAFRICA,2300000,1150,\n';
                content += '2024-01-16,BIAYI,1800000,900,Week-end\n';
                break;
            case 'depenses':
                content = 'date_depense,categorie,montant_fc,pharmacie,fournisseur,observation\n';
                content += '2024-01-15,Salaires,5000000,BIAYI,,Janvier\n';
                content += '2024-01-16,Loyer,800000,PHARMAFRICA,Immo Plus,\n';
                content += '2024-01-17,Électricité,150000,KOLWEZI 1,SNEL,\n';
                break;
            case 'rapports':
                content = 'date_rapport,pharmacie,dollars,francs,caisse_ouverture,caisse_fermeture,observation\n';
                content += '2024-01-15,BIAYI,250,1250000,100000,1350000,Bonne journée\n';
                content += '2024-01-15,PHARMAFRICA,380,1900000,200000,2280000,\n';
                break;
        }
        
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `template_${type}_ladivine.csv`;
        link.click();
    },

    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    showError(message) {
        alert(message); // Simple pour l'instant, pourrait être amélioré avec un toast
    },

    showInfo(message) {
        alert(message);
    }
};
