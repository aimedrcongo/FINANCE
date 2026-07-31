/**
 * =====================================================
 * LA DIVINE PHARMAFINANCE PRO v3.0 - INNOVATIONS AVANCÉES
 * Module 1: QUICK ADD MOBILE
 * 
 * Fonctionnalités:
 * - Bouton flottant FAB (+) visible partout
 * - Saisie ultra-rapide en 3 clics
 * - Mémorisation dernier site utilisé
 * - Accès rapide: Versements / Dépenses / Rapports
 * =====================================================
 */

const QuickAdd = {
    // État du module
    state: {
        isOpen: false,
        lastPharmacyId: null,
        lastActionType: null,
        isExpanded: false
    },

    // ==========================================
    // INITIALISATION
    // ==========================================

    async init() {
        console.log('[QuickAdd] Initialisation du module Quick Add Mobile...');
        
        // Créer le bouton FAB
        this.createFAB();
        
        // Charger les préférences sauvegardées
        this.loadPreferences();
        
        // Écouteurs d'événements
        this.setupEventListeners();
        
        console.log('[QuickAdd] ✅ Module prêt');
    },

    loadPreferences() {
        try {
            const saved = localStorage.getItem('pharma_quickadd_prefs');
            if (saved) {
                const prefs = JSON.parse(saved);
                this.state.lastPharmacyId = prefs.lastPharmacyId;
                this.state.lastActionType = prefs.lastActionType;
            }
        } catch (e) {
            console.warn('[QuickAdd] Erreur chargement préférences:', e);
        }
    },

    savePreferences() {
        const prefs = {
            lastPharmacyId: this.state.lastPharmacyId,
            lastActionType: this.state.lastActionType
        };
        localStorage.setItem('pharma_quickadd_prefs', JSON.stringify(prefs));
    },

    // ==========================================
    // CRÉATION DU BOUTON FAB (FLOATING ACTION BUTTON)
    // ==========================================

    createFAB() {
        // Vérifier si déjà créé
        if (document.getElementById('quick-add-fab')) return;

        // Container principal FAB
        const fabContainer = document.createElement('div');
        fabContainer.id = 'quick-add-fab';
        fabContainer.className = 'fab-container';
        fabContainer.innerHTML = `
            <!-- Menu rapide (caché par défaut) -->
            <div class="fab-menu" id="fab-menu">
                <div class="fab-item" data-action="versement" onclick="QuickAdd.openForm('versement')">
                    <span class="fab-icon">💰</span>
                    <span class="fab-label">Versement</span>
                </div>
                <div class="fab-item" data-action="depense" onclick="QuickAdd.openForm('depense')">
                    <span class="fab-icon">📤</span>
                    <span class="fab-label">Dépense</span>
                </div>
                <div class="fab-item" data-action="rapport" onclick="QuickAdd.openForm('rapport')">
                    <span class="fab-icon">📝</span>
                    <span class="fab-label">Rapport</span>
                </div>
            </div>

            <!-- Bouton principal -->
            <button class="fab-main" id="fab-main" onclick="QuickAdd.toggle()" title="Ajout rapide (3 clics)">
                <span class="fab-plus">+</span>
            </button>

            <!-- Badge indicateur -->
            <div class="fab-badge" id="fab-badge" style="display: none;">3</div>
        `;

        document.body.appendChild(fabContainer);

        // Animation d'entrée
        setTimeout(() => {
            fabContainer.classList.add('visible');
        }, 100);
    },

    // ==========================================
    // TOGGLE DU MENU FAB
    // ==========================================

    toggle() {
        const fabContainer = document.getElementById('quick-add-fab');
        const fabMain = document.getElementById('fab-main');
        const fabMenu = document.getElementById('fab-menu');

        this.state.isExpanded = !this.state.isExpanded;

        if (this.state.isExpanded) {
            fabContainer.classList.add('expanded');
            fabMain.classList.add('rotated');
            
            // Animer les items du menu
            const items = fabMenu.querySelectorAll('.fab-item');
            items.forEach((item, index) => {
                setTimeout(() => {
                    item.classList.add('show');
                }, index * 50);
            });
        } else {
            fabContainer.classList.remove('expanded');
            fabMain.classList.remove('rotated');
            
            const items = fabMenu.querySelectorAll('.fab-item');
            items.forEach(item => item.classList.remove('show'));
        }

        // Haptique (si supporté)
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    },

    close() {
        if (this.state.isExpanded) {
            this.toggle();
        }
    },

    // ==========================================
    // OUVERTURE DES FORMULAIRES RAPIDES
    // ==========================================

    openForm(type) {
        this.close();

        // Sauvegarder le type d'action
        this.state.lastActionType = type;
        this.savePreferences();

        // Créer et afficher le modal rapide
        this.showQuickForm(type);
    },

    async showQuickForm(type) {
        // Récupérer les pharmacies disponibles
        let pharmacies = [];
        try {
            pharmacies = await DB.pharmacies.getAll();
        } catch (e) {
            console.error('[QuickAdd] Erreur chargement pharmacies:', e);
        }

        // Utiliser la dernière pharmacie ou la première
        const defaultPharmacy = this.state.lastPharmacyId || (pharmacies[0]?.id || '');

        // Configuration selon le type
        const config = {
            versement: {
                title: '💰 Nouveau Versement Rapide',
                icon: '💰',
                color: 'success',
                fields: [
                    { name: 'pharmacy', label: 'Pharmacie', type: 'select', options: pharmacies },
                    { name: 'montant_fc', label: 'Montant (FC)', type: 'number', placeholder: '0' },
                    { name: 'montant_usd', label: 'Montant ($)', type: 'number', placeholder: '0.00', optional: true },
                    { name: 'description', label: 'Description', type: 'text', placeholder: 'Détail du versement...', optional: true }
                ],
                submitLabel: '✅ Enregistrer Versement'
            },
            depense: {
                title: '📤 Nouvelle Dépense Rapide',
                icon: '📤',
                color: 'warning',
                fields: [
                    { name: 'pharmacy', label: 'Pharmacie', type: 'select', options: pharmacies },
                    { name: 'categorie', label: 'Catégorie', type: 'select', options: this.getDepenseCategories() },
                    { name: 'montant', label: 'Montant (FC)', type: 'number', placeholder: '0' },
                    { name: 'description', label: 'Description *', type: 'textarea', placeholder: 'Pourquoi? Pour qui? Quand?' }
                ],
                submitLabel: '✅ Enregistrer Dépense'
            },
            rapport: {
                title: '📝 Rapport Journalier Rapide',
                icon: '📝',
                color: 'info',
                fields: [
                    { name: 'pharmacy', label: 'Pharmacie', type: 'select', options: pharmacies },
                    { name: 'cahier_dollars', label: 'Cahier ($)', type: 'number', placeholder: '0' },
                    { name: 'cahier_francs', label: 'Cahier (FC)', type: 'number', placeholder: '0' },
                    { name: 'taux', label: 'Taux de change', type: 'number', placeholder: '2800', value: '2800' }
                ],
                submitLabel: '✅ Enregistrer Rapport'
            }
        };

        const formConfig = config[type];
        if (!formConfig) return;

        // Créer le modal
        const modal = document.createElement('div');
        modal.className = 'modal-overlay quick-add-modal';
        modal.id = 'quick-add-form-modal';
        modal.innerHTML = `
            <div class="modal-content quick-add-content">
                <div class="modal-header quick-add-header" style="background: var(--${formConfig.color}-light);">
                    <h3>${formConfig.title}</h3>
                    <button class="modal-close" onclick="QuickAdd.closeModal()">×</button>
                </div>
                
                <form id="quick-add-form" class="quick-add-form">
                    <input type="hidden" name="action_type" value="${type}">
                    
                    <div class="quick-fields">
                        ${formConfig.fields.map(field => this.renderField(field, defaultPharmacy)).join('')}
                    </div>

                    <div class="quick-actions">
                        <button type="button" class="btn btn-secondary quick-btn-secondary" onclick="QuickAdd.closeModal()">
                            Annuler
                        </button>
                        <button type="submit" class="btn btn-${formConfig.color} quick-btn-primary">
                            ${formConfig.submitLabel}
                        </button>
                    </div>

                    <div class="quick-shortcut">
                        <small>⌨️ Entrée = Valider • Échap = Annuler</small>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Animation d'entrée
        requestAnimationFrame(() => {
            modal.classList.add('active');
        });

        // Focus sur le premier champ
        setTimeout(() => {
            const firstInput = modal.querySelector('input:not([type="hidden"]), select');
            if (firstInput) firstInput.focus();
        }, 200);

        // Écouteurs
        modal.querySelector('#quick-add-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitQuickForm(type, e.target);
        });

        // Fermeture avec Escape
        document.addEventListener('keydown', this.handleEscape);
    },

    renderField(field, defaultValue) {
        const required = !field.optional ? 'required' : '';
        const value = field.value || (field.name === 'pharmacy' ? defaultValue : '');
        
        let inputHtml = '';

        switch (field.type) {
            case 'select':
                const options = field.options.map(opt => 
                    typeof opt === 'object' 
                        ? `<option value="${opt.id}" ${opt.id === defaultValue ? 'selected' : ''}>${opt.name}</option>`
                        : `<option value="${opt}">${opt}</option>`
                ).join('');
                
                inputHtml = `
                    <select name="${field.name}" class="form-input quick-input" ${required}>
                        <option value="">-- Sélectionner --</option>
                        ${options}
                    </select>
                `;
                break;

            case 'textarea':
                inputHtml = `
                    <textarea name="${field.name}" class="form-input quick-input" 
                              placeholder="${field.placeholder || ''}" ${required}
                              rows="2"></textarea>
                `;
                break;

            default: // text, number
                inputHtml = `
                    <input type="${field.type}" name="${field.name}" 
                           class="form-input quick-input" 
                           placeholder="${field.placeholder || ''}"
                           value="${value}"
                           ${required}
                           ${field.type === 'number' ? 'step="any"' : ''}>
                `;
        }

        return `
            <div class="quick-field-group">
                <label class="quick-label">
                    ${field.label}
                    ${field.optional ? '<span class="optional">(optionnel)</span>' : '<span class="required">*</span>'}
                </label>
                ${inputHtml}
            </div>
        `;
    },

    getDepenseCategories() {
        return [
            { id: 'MOON', name: '🌙 MOON' },
            { id: 'UNIQUE', name: '🔑 UNIQUE' },
            { id: 'DIVERS', name: '📦 DIVERS' },
            { id: 'TRANSPORT_PRODUITS', name: '🚛 TRANSPORT PRODUITS' },
            { id: 'ENTRETIEN', name: '🔧 ENTRETIEN' },
            { id: 'MANUTENTION', name: '📦 MANUTENTION' },
            { id: 'DEMANDE_FONDS', name: '💰 DEMANDE DE FONDS' },
            { id: 'TRANSPORT_AGENTS', name: '🚌 TRANSPORT AGENTS' },
            { id: 'CARBURANT', name: '⛽ CARBURANT' },
            { id: 'TRAVAUX_BOSS', name: '👷 TRAVAUX BOSS' },
            { id: 'TEGHERMO_TAXES', name: '📋 TEGHERMO/TAXES' },
            { id: 'SALAIRE_FERMIERS', name: '👨‍🌾 SALAIRE FERMIERS' },
            { id: 'PROMED', name: '💊 PROMED' },
            { id: 'LOER', name: '🏠 LOYER' },
            { id: 'KIN_MED', name: '🏥 KIN MED' },
            { id: 'COMPTE_MOUSSA', name: '🏦 COMPTE MOUSSA' },
            { id: 'TRAVAUX_PHARMACIE', name: '🏗️ TRAVAUX PHARMACIE / DÉPÔT' }
        ];
    },

    // ==========================================
    // SOUMISSION DU FORMULAIRE RAPIDE
    // ==========================================

    async submitQuickForm(type, form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Validation rapide
        if (!data.pharmacy && type !== 'versement') {
            this.showError('Veuillez sélectionner une pharmacie');
            return;
        }

        // Sauvegarder la pharmacie utilisée
        this.state.lastPharmacyId = data.pharmacy;
        this.savePreferences();

        // Préparer les données selon le type
        let recordData = {};
        let storeName = '';

        switch (type) {
            case 'versement':
                recordData = {
                    pharmacy_id: data.pharmacy || this.state.lastPharmacyId,
                    date: new Date().toISOString(),
                    montant_fc: parseFloat(data.montant_fc) || 0,
                    montant_usd: parseFloat(data.montant_usd) || 0,
                    description: data.description || '',
                    created_at: new Date().toISOString()
                };
                storeName = 'versements';
                break;

            case 'depense':
                recordData = {
                    pharmacy_id: data.pharmacy || this.state.lastPharmacyId,
                    date: new Date().toISOString(),
                    categorie: data.categorie,
                    montant: parseFloat(data.montant) || 0,
                    description: data.description || '',
                    created_at: new Date().toISOString()
                };
                storeName = 'depenses';
                break;

            case 'rapport':
                const taux = parseFloat(data.taux) || 2800;
                const dollars = parseFloat(data.cahier_dollars) || 0;
                const francs = parseFloat(data.cahier_francs) || 0;
                
                recordData = {
                    pharmacy_id: data.pharmacy || this.state.lastPharmacyId,
                    date: new Date().toISOString(),
                    cahier_dollars: dollars,
                    cahier_francs: francs,
                    taux_change: taux,
                    total_cahier: (dollars * taux) + francs,
                    created_at: new Date().toISOString()
                };
                storeName = 'rapports_journaliers';
                break;
        }

        try {
            // Sauvegarder dans IndexedDB
            await DB[storeName].add(recordData);

            // Logger l'action
            if (typeof authSystem !== 'undefined') {
                authSystem.logAction(
                    `QUICK_ADD_${type.toUpperCase()}`,
                    `Ajout rapide via Quick Add: ${recordData.description || recordData.categorie || 'Versement'}`
                );
            }

            // Feedback visuel
            this.showSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} enregistré avec succès!`);

            // Fermer le modal
            this.closeModal();

            // Mettre à jour la page courante si nécessaire
            if (typeof App !== 'undefined' && App.loadPageData) {
                App.loadPageData(App.state.currentPage);
            }

            // Incrémenter le badge (notifications)
            this.incrementBadge();

        } catch (error) {
            console.error('[QuickAdd] Erreur sauvegarde:', error);
            this.showError('Erreur lors de l\'enregistrement: ' + error.message);
        }
    },

    // ==========================================
    // GESTION DU MODAL
    // ==========================================

    closeModal() {
        const modal = document.getElementById('quick-add-form-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
        document.removeEventListener('keydown', this.handleEscape);
    },

    handleEscape(e) {
        if (e.key === 'Escape') {
            QuickAdd.closeModal();
        }
    },

    // ==========================================
    // FEEDBACK UTILISATEUR
    // ==========================================

    showSuccess(message) {
        // Toast de succès
        const toast = document.createElement('div');
        toast.className = 'toast toast-success quick-toast';
        toast.innerHTML = `✅ ${message}`;
        document.body.appendChild(toast);

        // Animation
        requestAnimationFrame(() => toast.classList.add('show'));

        // Auto-suppression
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2500);

        // Haptique
        if (navigator.vibrate) {
            navigator.vibrate([50, 50, 50]);
        }
    },

    showError(message) {
        const toast = document.createElement('div');
        toast.className = 'toast toast-error quick-toast';
        toast.innerHTML = `❌ ${message}`;
        document.body.appendChild(toast);

        requestAnimationFrame(() => toast.classList.add('show'));

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    incrementBadge() {
        const badge = document.getElementById('fab-badge');
        if (badge) {
            const current = parseInt(badge.textContent) || 0;
            badge.textContent = current + 1;
            badge.style.display = 'flex';
            
            // Animation pulse
            badge.style.transform = 'scale(1.3)';
            setTimeout(() => badge.style.transform = 'scale(1)', 200);
        }
    },

    // ==========================================
    // ÉCOUTEURS D'ÉVÉNEMENTS
    // ==========================================

    setupEventListeners() {
        // Fermer le menu FAB quand on clique ailleurs
        document.addEventListener('click', (e) => {
            const fab = document.getElementById('quick-add-fab');
            if (fab && this.state.isExpanded && !fab.contains(e.target)) {
                this.close();
            }
        });

        // Raccourci clavier global (Ctrl+Shift+A pour Quick Add)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                this.toggle();
            }
        });
    }
};

// Export global
window.QuickAdd = QuickAdd;
