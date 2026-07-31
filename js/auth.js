/**
 * =====================================================
 * PHARMA FINANCE PRO - SYSTÈME D'AUTHENTIFICATION
 * Multi-utilisateurs : Admin / Manager / Comptable
 * =====================================================
 */

class AuthSystem {
    constructor() {
        this.STORAGE_KEY = 'pharma_auth';
        this.USERS_KEY = 'pharma_users';
        this.currentUser = null;
        this.users = this.loadUsers();
    }

    // ============================================
    // DÉFINITION DES RÔLES ET PERMISSIONS
    // ============================================
    
    get ROLES() {
        return {
            ADMIN: {
                id: 'admin',
                name: 'Administrateur',
                description: 'Installation, supervision et résolution de problèmes',
                color: '#C62828',
                icon: '🛡️',
                permissions: {
                    // Accès aux vues
                    dashboard: { view: true, create: false, edit: false, delete: false },
                    versements: { view: true, create: false, edit: false, delete: false },
                    rapports: { view: true, create: false, edit: false, delete: false },
                    depenses: { view: true, create: false, edit: false, delete: false },
                    livreComptes: { view: true, create: false, edit: false, delete: false },
                    dettes: { view: true, create: false, edit: false, delete: false },
                    balance: { view: true, create: false, edit: false, delete: false },
                    pharmacies: { view: true, create: true, edit: true, delete: true },
                    parametres: { view: true, create: true, edit: true, delete: true },
                    utilisateurs: { view: true, create: true, edit: true, delete: true },
                    export: { view: true, create: true, edit: false, delete: false },
                    auditLog: { view: true, create: false, edit: false, delete: true },
                    // Actions spéciales
                    canInstallApp: true,
                    canResetData: true,
                    canManageUsers: true,
                    canAccessAllPharmacies: true,
                    canViewOtherUsersData: true,
                    canExportAll: true,
                    canDebugTechnical: true
                }
            },
            MANAGER: {
                id: 'manager',
                name: 'Manager de Pharmacie',
                description: 'Responsable de pharmacie - Rapports et dépenses quotidiens',
                color: '#0A6E32',
                icon: '👔',
                permissions: {
                    dashboard: { view: true, create: false, edit: false, delete: false },
                    versements: { view: true, create: true, edit: true, delete: false },
                    rapports: { view: true, create: true, edit: true, delete: false },
                    depenses: { view: true, create: true, edit: true, delete: false },
                    livreComptes: { view: true, create: false, edit: false, delete: false },
                    dettes: { view: true, create: true, edit: true, delete: false },
                    balance: { view: true, create: false, edit: false, delete: false },
                    pharmacies: { view: false, create: false, edit: false, delete: false },
                    parametres: { view: false, create: false, edit: false, delete: false },
                    utilisateurs: { view: false, create: false, edit: false, delete: false },
                    export: { view: true, create: true, edit: false, delete: false },
                    auditLog: { view: false, create: false, edit: false, delete: false },
                    // Actions spéciales
                    canInstallApp: false,
                    canResetData: false,
                    canManageUsers: false,
                    canAccessAllPharmacies: false,  // Seulement sa pharmacie assignée
                    canViewOtherUsersData: false,
                    canExportAll: false,  // Exporte seulement ses données
                    canDebugTechnical: false
                }
            },
            COMPTABLE: {
                id: 'comptable',
                name: 'Comptable',
                description: 'Consolidation comptable et vérification des données',
                color: '#1565C0',
                icon: '📊',
                permissions: {
                    dashboard: { view: true, create: false, edit: false, delete: false },
                    versements: { view: true, create: false, edit: false, delete: false },
                    rapports: { view: true, create: false, edit: false, delete: false },
                    depenses: { view: true, create: false, edit: false, delete: false },
                    livreComptes: { view: true, create: false, edit: false, delete: false },
                    dettes: { view: true, create: false, edit: true, delete: false },  // Peut mettre à jour les statuts
                    balance: { view: true, create: true, edit: true, delete: false },
                    pharmacies: { view: true, create: false, edit: false, delete: false },
                    parametres: { view: true, create: false, edit: false, delete: false },
                    utilisateurs: { view: false, create: false, edit: false, delete: false },
                    export: { view: true, create: true, edit: false, delete: false },
                    auditLog: { view: true, create: false, edit: false, delete: false },
                    // Actions spéciales
                    canInstallApp: false,
                    canResetData: false,
                    canManageUsers: false,
                    canAccessAllPharmacies: true,  // Voit toutes les pharmacies pour consolidation
                    canViewOtherUsersData: true,   // Voit les données de tous les managers
                    canExportAll: true,
                    canDebugTechnical: false
                }
            }
        };
    }

    // ============================================
    // GESTION DES UTILISATEURS
    // ============================================

    /**
     * Utilisateurs par défaut au première lancement
     */
    getDefaultUsers() {
        return [
            {
                id: 'usr_001',
                username: 'admin',
                password: 'admin2024!',  // Devra être changé à la première connexion
                fullName: 'Administrateur Système',
                role: 'admin',
                pharmacyId: 'all',  // Admin accède à tout
                pharmacyName: 'Toutes les pharmacies',
                active: true,
                createdAt: new Date().toISOString(),
                lastLogin: null,
                passwordChanged: false,
                notes: 'Compte administrateur principal - Ne partagez pas ce mot de passe'
            },
            {
                id: 'usr_002',
                username: 'manager_biayi',
                password: 'biayi2024!',
                fullName: 'Manager BIAYI',
                role: 'manager',
                pharmacyId: 'pharma_1',
                pharmacyName: 'BIAYI',
                active: true,
                createdAt: new Date().toISOString(),
                lastLogin: null,
                passwordChanged: false,
                notes: 'Responsable pharmacie BIAYI'
            },
            {
                id: 'usr_003',
                username: 'manager_pharmafrica',
                password: 'pharmafrica2024!',
                fullName: 'Manager PHARMAFRICA',
                role: 'manager',
                pharmacyId: 'pharma_2',
                pharmacyName: 'PHARMAFRICA',
                active: true,
                createdAt: new Date().toISOString(),
                lastLogin: null,
                passwordChanged: false,
                notes: 'Responsable pharmacie PHARMAFRICA'
            },
            {
                id: 'usr_004',
                username: 'comptable_central',
                password: 'compta2024!',
                fullName: 'Comptable Central',
                role: 'comptable',
                pharmacyId: 'all',
                pharmacyName: 'Siège Central',
                active: true,
                createdAt: new Date().toISOString(),
                lastLogin: null,
                passwordChanged: false,
                notes: 'Comptable principal pour consolidation'
            }
        ];
    }

    loadUsers() {
        try {
            const stored = localStorage.getItem(this.USERS_KEY);
            if (stored) {
                return JSON.parse(stored);
            } else {
                // Premier lancement - créer les utilisateurs par défaut
                const defaultUsers = this.getDefaultUsers();
                localStorage.setItem(this.USERS_KEY, JSON.stringify(defaultUsers));
                return defaultUsers;
            }
        } catch (e) {
            console.error('Erreur chargement utilisateurs:', e);
            return this.getDefaultUsers();
        }
    }

    saveUsers() {
        localStorage.setItem(this.USERS_KEY, JSON.stringify(this.users));
    }

    // ============================================
    // AUTHENTIFICATION
    // ============================================

    login(username, password) {
        const user = this.users.find(u => 
            u.username.toLowerCase() === username.toLowerCase() && 
            u.password === password &&
            u.active === true
        );

        if (user) {
            // Mettre à jour dernière connexion
            user.lastLogin = new Date().toISOString();
            this.saveUsers();

            // Créer session
            this.currentUser = {
                id: user.id,
                username: user.username,
                fullName: user.fullName,
                role: user.role,
                roleName: this.ROLES[user.role.toUpperCase()].name,
                pharmacyId: user.pharmacyId,
                pharmacyName: user.pharmacyName,
                loginTime: new Date().toISOString(),
                permissions: this.ROLES[user.role.toUpperCase()].permissions
            };

            // Sauvegarder session
            sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.currentUser));

            // Logger l'action
            this.logAction('LOGIN', `Connexion de ${user.fullName}`);

            return { success: true, user: this.currentUser };
        }

        this.logAction('LOGIN_FAILED', `Tentative échouée: ${username}`);
        return { success: false, error: 'Identifiants incorrects ou compte désactivé' };
    }

    logout() {
        if (this.currentUser) {
            this.logAction('LOGOUT', `Déconnexion de ${this.currentUser.fullName}`);
        }
        this.currentUser = null;
        sessionStorage.removeItem(this.STORAGE_KEY);
        
        // Rediriger vers login
        window.location.hash = '#login';
        this.showLoginScreen();
    }

    checkSession() {
        const stored = sessionStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            this.currentUser = JSON.parse(stored);
            return true;
        }
        return false;
    }

    // ============================================
    // VÉRIFICATION DES PERMISSIONS
    // ============================================

    can(resource, action = 'view') {
        if (!this.currentUser) return false;
        
        const perms = this.currentUser.permissions;
        if (perms && perms[resource]) {
            return perms[resource][action] || false;
        }
        return false;
    }

    canDo(action) {
        if (!this.currentUser) return false;
        return this.currentUser.permissions[action] || false;
    }

    getCurrentUserRole() {
        if (!this.currentUser) return null;
        return this.ROLES[this.currentUser.role.toUpperCase()];
    }

    getAccessiblePharmacies() {
        if (!this.currentUser) return [];
        
        if (this.currentUser.pharmacyId === 'all') {
            // Admin et Comptable voient toutes les pharmacies
            return JSON.parse(localStorage.getItem('pharmacies') || '[]');
        } else {
            // Manager voit seulement sa pharmacie
            return [{
                id: this.currentUser.pharmacyId,
                name: this.currentUser.pharmacyName
            }];
        }
    }

    // ============================================
    // GESTION DES UTILISATEURS (ADMIN ONLY)
    // ============================================

    createUser(userData) {
        if (!this.canDo('canManageUsers')) {
            return { success: false, error: 'Permission refusée' };
        }

        // Vérifier si le username existe déjà
        if (this.users.some(u => u.username.toLowerCase() === userData.username.toLowerCase())) {
            return { success: false, error: 'Nom d\'utilisateur déjà existant' };
        }

        const newUser = {
            id: 'usr_' + Date.now(),
            username: userData.username.toLowerCase(),
            password: userData.password,
            fullName: userData.fullName,
            role: userData.role,
            pharmacyId: userData.pharmacyId || 'all',
            pharmacyName: userData.pharmacyName || 'Toutes',
            active: true,
            createdAt: new Date().toISOString(),
            lastLogin: null,
            passwordChanged: false,
            notes: userData.notes || ''
        };

        this.users.push(newUser);
        this.saveUsers();

        this.logAction('USER_CREATE', `Création utilisateur: ${userData.fullName} (${userData.role})`);
        return { success: true, user: newUser };
    }

    updateUser(userId, updates) {
        if (!this.canDo('canManageUsers')) {
            return { success: false, error: 'Permission refusée' };
        }

        const index = this.users.findIndex(u => u.id === userId);
        if (index === -1) {
            return { success: false, error: 'Utilisateur non trouvé' };
        }

        // Empêcher la modification du role si pas admin
        if (updates.role && !this.canDo('canManageUsers')) {
            delete updates.role;
        }

        this.users[index] = { ...this.users[index], ...updates };
        this.saveUsers();

        this.logAction('USER_UPDATE', `Mise à jour utilisateur: ${this.users[index].fullName}`);
        return { success: true, user: this.users[index] };
    }

    deleteUser(userId) {
        if (!this.canDo('canManageUsers')) {
            return { success: false, error: 'Permission refusée' };
        }

        // Empêcher la suppression de son propre compte
        if (userId === this.currentUser?.id) {
            return { success: false, error: 'Vous ne pouvez pas supprimer votre propre compte' };
        }

        const index = this.users.findIndex(u => u.id === userId);
        if (index === -1) {
            return { success: false, error: 'Utilisateur non trouvé' };
        }

        const deletedUser = this.users.splice(index, 1)[0];
        this.saveUsers();

        this.logAction('USER_DELETE', `Suppression utilisateur: ${deletedUser.fullName}`);
        return { success: true };
    }

    resetPassword(userId, newPassword) {
        if (!this.canDo('canManageUsers')) {
            return { success: false, error: 'Permission refusée' };
        }

        const user = this.users.find(u => u.id === userId);
        if (!user) {
            return { success: false, error: 'Utilisateur non trouvé' };
        }

        user.password = newPassword;
        user.passwordChanged = true;
        this.saveUsers();

        this.logAction('PASSWORD_RESET', `Réinitialisation mot de passe pour: ${user.fullName}`);
        return { success: true };
    }

    getAllUsers() {
        if (!this.canDo('canManageUsers')) {
            // Les managers/comptables peuvent voir seulement leur propre profil
            if (this.currentUser) {
                return this.users.filter(u => u.id === this.currentUser.id);
            }
            return [];
        }
        return this.users.map(u => ({
            id: u.id,
            username: u.username,
            fullName: u.fullName,
            role: u.role,
            roleName: this.ROLES[u.role.toUpperCase()].name,
            pharmacyName: u.pharmacyName,
            active: u.active,
            lastLogin: u.lastLogin,
            createdAt: u.createdAt
        }));
    }

    // ============================================
    // JOURNAL D'AUDIT (TRAÇABILITÉ)
    // ============================================

    logAction(action, details) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            userId: this.currentUser?.id || 'system',
            userName: this.currentUser?.fullName || 'Système',
            userRole: this.currentUser?.role || 'system',
            action: action,
            details: details,
            pharmacyId: this.currentUser?.pharmacyId || 'all'
        };

        // Récupérer les logs existants
        let logs = [];
        try {
            const stored = localStorage.getItem('pharma_audit_log');
            logs = stored ? JSON.parse(stored) : [];
        } catch (e) {
            logs = [];
        }

        // Ajouter le nouveau log (max 1000 entrées pour éviter la saturation)
        logs.unshift(logEntry);
        if (logs.length > 1000) {
            logs = logs.slice(0, 1000);
        }

        localStorage.setItem('pharma_audit_log', JSON.stringify(logs));
    }

    getAuditLogs(filters = {}) {
        let logs = [];
        try {
            const stored = localStorage.getItem('pharma_audit_log');
            logs = stored ? JSON.parse(stored) : [];
        } catch (e) {
            logs = [];
        }

        // Appliquer les filtres
        if (filters.userId) {
            logs = logs.filter(l => l.userId === filters.userId);
        }
        if (filters.action) {
            logs = logs.filter(l => l.action === filters.action);
        }
        if (filters.dateFrom) {
            logs = logs.filter(l => l.timestamp >= filters.dateFrom);
        }
        if (filters.dateTo) {
            logs = logs.filter(l => l.timestamp <= filters.dateTo);
        }
        if (filters.pharmacyId && filters.pharmacyId !== 'all') {
            logs = logs.filter(l => l.pharmacyId === filters.pharmacyId);
        }

        return logs;
    }

    clearAuditLogs() {
        if (!this.canDo('canDebugTechnical')) {
            return { success: false, error: 'Permission refusée' };
        }
        localStorage.removeItem('pharma_audit_log');
        this.logAction('LOG_CLEAR', 'Journal d\'audit vidé par administrateur');
        return { success: true };
    }

    // ============================================
    // INTERFACE UTILISATEUR
    // ============================================

    showLoginScreen() {
        // Cacher l'application principale
        const mainApp = document.getElementById('main-app');
        const loginScreen = document.getElementById('login-screen');

        if (mainApp) mainApp.style.display = 'none';
        if (loginScreen) {
            loginScreen.style.display = 'flex';
            this.bindLoginEvents();
        }
    }

    hideLoginScreen() {
        const mainApp = document.getElementById('main-app');
        const loginScreen = document.getElementById('login-screen');

        if (loginScreen) loginScreen.style.display = 'none';
        if (mainApp) mainApp.style.display = 'block';

        // Mettre à jour l'UI selon le rôle
        this.updateUIForRole();
    }

    bindLoginEvents() {
        const loginForm = document.getElementById('login-form');
        const loginBtn = document.getElementById('login-btn');
        const errorMsg = document.getElementById('login-error');

        if (loginBtn) {
            loginBtn.onclick = () => this.handleLogin();
        }

        if (loginForm) {
            loginForm.onsubmit = (e) => {
                e.preventDefault();
                this.handleLogin();
            };
        }

        // Entrée sur le champ password
        const passwordInput = document.getElementById('login-password');
        if (passwordInput) {
            passwordInput.onkeypress = (e) => {
                if (e.key === 'Enter') this.handleLogin();
            };
        }
    }

    handleLogin() {
        const usernameInput = document.getElementById('login-username');
        const passwordInput = document.getElementById('login-password');
        const errorMsg = document.getElementById('login-error');
        const loginBtn = document.getElementById('login-btn');

        const username = usernameInput?.value.trim();
        const password = passwordInput?.value;

        if (!username || !password) {
            if (errorMsg) {
                errorMsg.textContent = 'Veuillez remplir tous les champs';
                errorMsg.style.display = 'block';
            }
            return;
        }

        // Désactiver le bouton pendant le traitement
        if (loginBtn) {
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<span class="spinner"></span> Connexion...';
        }

        // Simuler un léger délai pour l'effet UX
        setTimeout(() => {
            const result = this.login(username, password);

            if (result.success) {
                if (errorMsg) errorMsg.style.display = 'none';
                this.hideLoginScreen();
                
                // Naviguer vers le dashboard
                if (typeof navigateTo === 'function') {
                    navigateTo('dashboard');
                }
            } else {
                if (errorMsg) {
                    errorMsg.textContent = result.error;
                    errorMsg.style.display = 'block';
                    errorMsg.classList.add('shake');
                    setTimeout(() => errorMsg.classList.remove('shake'), 500);
                }
                
                if (loginBtn) {
                    loginBtn.disabled = false;
                    loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Se connecter';
                }
            }
        }, 500);
    }

    updateUIForRole() {
        if (!this.currentUser) return;

        const role = this.getCurrentUserRole();
        
        // Mettre à jour les infos utilisateur dans la topbar
        const userInfoEl = document.getElementById('user-info');
        if (userInfoEl) {
            userInfoEl.innerHTML = `
                <div class="user-avatar" style="background-color: ${role.color}" title="${role.name}">
                    ${role.icon}
                </div>
                <div class="user-details">
                    <span class="user-name">${this.currentUser.fullName}</span>
                    <span class="user-role">${role.name} - ${this.currentUser.pharmacyName}</span>
                </div>
                <button onclick="authSystem.logout()" class="btn-logout" title="Déconnexion">
                    <i class="fas fa-sign-out-alt"></i>
                </button>
            `;
        }

        // Cacher/Montrer les éléments du menu selon les permissions
        this.updateMenuVisibility();

        // Appliquer les restrictions sur les formulaires
        this.applyFormRestrictions();
    }

    updateMenuVisibility() {
        const menuItems = {
            'menu-dashboard': 'dashboard',
            'menu-versements': 'versements', 
            'menu-rapports': 'rapports',
            'menu-depenses': 'depenses',
            'menu-livre': 'livreComptes',
            'menu-dettes': 'dettes',
            'menu-balance': 'balance',
            'menu-pharmacies': 'pharmacies',
            'menu-parametres': 'parametres',
            'menu-users': 'utilisateurs',
            'menu-audit': 'auditLog'
        };

        Object.entries(menuItems).forEach(([menuId, resource]) => {
            const menuItem = document.getElementById(menuId);
            if (menuItem) {
                if (this.can(resource)) {
                    menuItem.style.display = '';
                } else {
                    menuItem.style.display = 'none';
                }
            }
        });
    }

    applyFormRestrictions() {
        // Pour les managers : désactiver les champs s'ils n'ont pas le droit
        if (this.currentUser.role === 'manager') {
            // Le manager peut seulement voir/modifier sa pharmacie
            const pharmacySelects = document.querySelectorAll('select[name="pharmacyId"], #pharmacy-select');
            pharmacySelects.forEach(select => {
                select.value = this.currentUser.pharmacyId;
                select.disabled = true;
                select.title = 'Pharmacie assignée automatiquement';
            });
        }

        // Pour le comptable : mode lecture seule sur certains formulaires
        if (this.currentUser.role === 'comptable') {
            // Le comptable peut consulter mais pas créer de rapports/dépenses
            const readOnlyForms = ['rapport-form', 'depense-form'];
            readOnlyForms.forEach(formId => {
                const form = document.getElementById(formId);
                if (form) {
                    const inputs = form.querySelectorAll('input, select, textarea');
                    inputs.forEach(input => {
                        if (input.type !== 'hidden') {
                            input.readOnly = true;
                            input.title = 'Lecture seule - Role Comptable';
                        }
                    });
                    
                    // Cacher ou désactiver les boutons de soumission
                    const submitBtn = form.querySelector('button[type="submit"]');
                    if (submitBtn) {
                        submitBtn.style.display = 'none';
                    }
                    
                    // Ajouter un message info
                    let msg = form.querySelector('.readonly-notice');
                    if (!msg) {
                        msg = document.createElement('div');
                        msg.className = 'readonly-notice';
                        msg.innerHTML = '<i class="fas fa-lock"></i> Mode consultation - Role Comptable';
                        form.insertBefore(msg, form.firstChild);
                    }
                }
            });
        }
    }

    // ============================================
    // CHANGEMENT DE MOT DE PASSE (PREMIÈRE CONNEXION)
    // ============================================

    requirePasswordChange() {
        if (!this.currentUser) return;

        const user = this.users.find(u => u.id === this.currentUser.id);
        if (user && !user.passwordChanged && this.currentUser.role !== 'admin') {
            // Afficher le modal de changement de mot de passe
            this.showPasswordChangeModal();
        }
    }

    showPasswordChangeModal() {
        const modal = document.getElementById('password-change-modal');
        if (modal) {
            modal.classList.add('active');
            
            const form = modal.querySelector('#password-change-form');
            const btn = modal.querySelector('#change-password-btn');
            
            const handleChange = () => {
                const currentPass = document.getElementById('current-password').value;
                const newPass = document.getElementById('new-password').value;
                const confirmPass = document.getElementById('confirm-password').value;
                const errorEl = document.getElementById('password-error');

                // Validation
                if (newPass.length < 6) {
                    errorEl.textContent = 'Le mot de passe doit contenir au moins 6 caractères';
                    errorEl.style.display = 'block';
                    return;
                }

                if (newPass !== confirmPass) {
                    errorEl.textContent = 'Les mots de passe ne correspondent pas';
                    errorEl.style.display = 'block';
                    return;
                }

                // Vérifier le mot de passe actuel
                const user = this.users.find(u => u.id === this.currentUser.id);
                if (user.password !== currentPass) {
                    errorEl.textContent = 'Mot de passe actuel incorrect';
                    errorEl.style.display = 'block';
                    return;
                }

                // Changer le mot de passe
                user.password = newPass;
                user.passwordChanged = true;
                this.saveUsers();

                this.logAction('PASSWORD_CHANGE', 'Mot de passe changé à la première connexion');
                
                modal.classList.remove('active');
                alert('Mot de passe modifié avec succès !');
            };

            if (btn) btn.onclick = handleChange;
            if (form) form.onsubmit = (e) => { e.preventDefault(); handleChange(); };
        }
    }

    // ============================================
    // INITIALISATION
    // ============================================

    init() {
        // Vérifier si une session existe
        if (this.checkSession()) {
            this.hideLoginScreen();
            
            // Vérifier si changement de mot de passe requis
            setTimeout(() => this.requirePasswordChange(), 1000);
        } else {
            this.showLoginScreen();
        }
    }
}

// Instance globale du système d'auth
const authSystem = new AuthSystem();

// Auto-initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
    authSystem.init();
});
