/**
 * DivFinance Pro v3.2 - Authentication System
 * Complete RBAC (Role-Based Access Control) for LA DIVINE Health Care Pharmacy Network
 */

class DivFinanceAuth {
    constructor() {
        this.STORAGE_PREFIX = 'divfinance_';
        this.STORAGE_KEYS = {
            USERS: `${this.STORAGE_PREFIX}users`,
            CURRENT_USER: `${this.STORAGE_PREFIX}current_user`,
            PHARMACIES: `${this.STORAGE_PREFIX}pharmacies`,
            SESSION_TIME: `${this.STORAGE_PREFIX}session_time`
        };
        
        // Default Super Admins
        this.DEFAULT_ADMINS = [
            {
                id: 'admin_tech_001',
                username: 'fabricefb',
                password: '1234Div@',
                fullName: 'Fabrice FB',
                role: 'super_admin_tech',
                email: 'fabrice@divfinance.com',
                pharmacyId: null,
                canCreateUsers: true,
                canManagePharmacies: true,
                canAccessAllPanels: true,
                createdAt: new Date().toISOString(),
                isActive: true,
                isDefault: true
            },
            {
                id: 'admin_finance_001',
                username: 'directeur_finance',
                password: 'DFinance2026!',
                fullName: 'Directeur Finance',
                role: 'super_admin_finance',
                email: 'directeur@divfinance.com',
                pharmacyId: null,
                canCreateUsers: false,
                canManagePharmacies: false,
                canAccessAllPanels: true,
                createdAt: new Date().toISOString(),
                isActive: true,
                isDefault: true
            }
        ];
        
        // User Roles with Permissions
        this.USER_ROLES = {
            super_admin_tech: {
                name: 'Super Admin Tech',
                level: 1,
                description: 'Accès complet + Gestion utilisateurs et pharmacies',
                permissions: {
                    dashboard: true,
                    pharmacies: true,
                    rapport_journalier: true,
                    depenses: true,
                    livre_comptes: true,
                    dettes_fournisseurs: true,
                    balance_mensuelle: true,
                    exports: true,
                    parametres: true,
                    user_management: true,
                    pharmacy_management: true,
                    system_settings: true,
                    create_users: true,
                    delete_users: true,
                    all_pharmacies_data: true
                },
                redirectPage: 'principal.html'
            },
            super_admin_finance: {
                name: 'Super Admin Finance',
                level: 2,
                description: 'Tous les panneaux financiers, ne peut pas créer d\'utilisateurs',
                permissions: {
                    dashboard: true,
                    pharmacies: true,
                    rapport_journalier: true,
                    depenses: true,
                    livre_comptes: true,
                    dettes_fournisseurs: true,
                    balance_mensuelle: true,
                    exports: true,
                    parametres: true,
                    user_management: false,
                    pharmacy_management: false,
                    system_settings: false,
                    create_users: false,
                    delete_users: false,
                    all_pharmacies_data: true
                },
                redirectPage: 'principal.html'
            },
            admin_pharmacie: {
                name: 'Admin Pharmacie',
                level: 3,
                description: 'Panneau de sa propre pharmacie uniquement',
                permissions: {
                    dashboard: true,
                    pharmacies: false,
                    rapport_journalier: true,
                    depenses: true,
                    livre_comptes: true,
                    dettes_fournisseurs: false,
                    balance_mensuelle: true,
                    exports: true,
                    parametres: false,
                    user_management: false,
                    pharmacy_management: false,
                    system_settings: false,
                    create_users: false,
                    delete_users: false,
                    all_pharmacies_data: false
                },
                redirectPage: 'pharmacie.html'
            },
            comptable: {
                name: 'Comptable',
                level: 4,
                description: 'Écritures comptables et rapports',
                permissions: {
                    dashboard: true,
                    pharmacies: true,
                    rapport_journalier: true,
                    depenses: true,
                    livre_comptes: true,
                    dettes_fournisseurs: true,
                    balance_mensuelle: true,
                    exports: true,
                    parametres: false,
                    user_management: false,
                    pharmacy_management: false,
                    system_settings: false,
                    create_users: false,
                    delete_users: false,
                    all_pharmacies_data: true
                },
                redirectPage: 'principal.html'
            },
            caissier: {
                name: 'Caissier',
                level: 5,
                description: 'Gestion caisse et entrées quotidiennes',
                permissions: {
                    dashboard: true,
                    pharmacies: false,
                    rapport_journalier: true,
                    depenses: true,
                    livre_comptes: false,
                    dettes_fournisseurs: false,
                    balance_mensuelle: false,
                    exports: false,
                    parametres: false,
                    user_management: false,
                    pharmacy_management: false,
                    system_settings: false,
                    create_users: false,
                    delete_users: false,
                    all_pharmacies_data: false
                },
                redirectPage: 'pharmacie.html'
            },
            consultant: {
                name: 'Consultant',
                level: 6,
                description: 'Accès lecture seule aux rapports',
                permissions: {
                    dashboard: true,
                    pharmacies: true,
                    rapport_journalier: true,
                    depenses: true,
                    livre_comptes: true,
                    dettes_fournisseurs: true,
                    balance_mensuelle: true,
                    exports: true,
                    parametres: false,
                    user_management: false,
                    pharmacy_management: false,
                    system_settings: false,
                    create_users: false,
                    delete_users: false,
                    all_pharmacies_data: true,
                    read_only: true
                },
                redirectPage: 'principal.html'
            }
        };
        
        // Initialize default data
        this.initializeDefaults();
    }

    /**
     * Initialize default users and pharmacies in localStorage
     */
    initializeDefaults() {
        // Check if users exist, if not create defaults
        let users = this.getUsers();
        if (!users || users.length === 0) {
            localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(this.DEFAULT_ADMINS));
        } else {
            // Ensure default admins exist
            const existingUsernames = users.map(u => u.username);
            for (const admin of this.DEFAULT_ADMINS) {
                if (!existingUsernames.includes(admin.username)) {
                    users.push(admin);
                }
            }
            localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));
        }

        // Initialize default pharmacies if not exists
        let pharmacies = this.getPharmacies();
        if (!pharmacies || pharmacies.length === 0) {
            const defaultPharmacies = [
                { id: 'pha_revolution', name: 'DE LA REVOLUTION', shortName: 'DE LA', code: 'DLR', address: 'Kinshasa', phone: '+243 XXX XXX XXX', isActive: true, createdAt: new Date().toISOString() },
                { id: 'pha_biayi', name: 'BIAYI', shortName: 'BIAYI', code: 'BYI', address: 'Kinshasa', phone: '+243 XXX XXX XXX', isActive: true, createdAt: new Date().toISOString() },
                { id: 'pha_hewa1', name: 'HEWA BORA 1', shortName: 'HEWA BORA 1', code: 'HB1', address: 'Kinshasa', phone: '+243 XXX XXX XXX', isActive: true, createdAt: new Date().toISOString() },
                { id: 'pha_hewa2', name: 'HEWA BORA 2', shortName: 'HEWA BORA 2', code: 'HB2', address: 'Kinshasa', phone: '+243 XXX XXX XXX', isActive: true, createdAt: new Date().toISOString() },
                { id: 'pha_kasai', name: 'KASAI', shortName: 'KASAI', code: 'KAS', address: 'Kasaï', phone: '+243 XXX XXX XXX', isActive: true, createdAt: new Date().toISOString() },
                { id: 'pha_kolwezi1', name: 'KOLWEZI 1', shortName: 'KOLWEZI 1', code: 'KW1', address: 'Kolwezi', phone: '+243 XXX XXX XXX', isActive: true, createdAt: new Date().toISOString() },
                { id: 'pha_kolwezi2', name: 'KOLWEZI 2', shortName: 'KOLWEZI 2', code: 'KW2', address: 'Kolwezi', phone: '+243 XXX XXX XXX', isActive: true, createdAt: new Date().toISOString() },
                { id: 'pha_pharmafrica', name: 'PHARMAFRICA', shortName: 'PHARMAFRICA', code: 'PFA', address: 'Lubumbashi', phone: '+243 XXX XXX XXX', isActive: true, createdAt: new Date().toISOString() },
                { id: 'pha_depot', name: 'DEPOT', shortName: 'DEPOT', code: 'DPT', address: 'Central Warehouse', phone: '+243 XXX XXX XXX', isActive: true, createdAt: new Date().toISOString(), isDepot: true }
            ];
            localStorage.setItem(this.STORAGE_KEYS.PHARMACIES, JSON.stringify(defaultPharmacies));
        }
    }

    /**
     * Get all users from storage
     */
    getUsers() {
        const data = localStorage.getItem(this.STORAGE_KEYS.USERS);
        return data ? JSON.parse(data) : [];
    }

    /**
     * Get all pharmacies from storage
     */
    getPharmacies() {
        const data = localStorage.getItem(this.STORAGE_KEYS.PHARMACIES);
        return data ? JSON.parse(data) : [];
    }

    /**
     * Get current logged-in user
     */
    getCurrentUser() {
        const data = localStorage.getItem(this.STORAGE_KEYS.CURRENT_USER);
        return data ? JSON.parse(data) : null;
    }

    /**
     * Login method - validates credentials and returns user with role info
     */
    login(username, password) {
        const users = this.getUsers();
        const user = users.find(u => u.username === username && u.password === password && u.isActive);
        
        if (user) {
            const roleInfo = this.USER_ROLES[user.role];
            
            // Create session object
            const sessionUser = {
                ...user,
                roleName: roleInfo.name,
                roleLevel: roleInfo.level,
                permissions: roleInfo.permissions,
                loginTime: new Date().toISOString()
            };

            // Store session
            localStorage.setItem(this.STORAGE_KEYS.CURRENT_USER, JSON.stringify(sessionUser));
            localStorage.setItem(this.STORAGE_KEYS.SESSION_TIME, new Date().getTime().toString());

            return {
                success: true,
                user: sessionUser,
                redirectUrl: roleInfo.redirectPage,
                message: `Bienvenue ${user.fullName}!`
            };
        }

        return {
            success: false,
            error: 'Identifiants incorrects ou compte désactivé.',
            redirectUrl: null
        };
    }

    /**
     * Logout method - clears session
     */
    logout() {
        localStorage.removeItem(this.STORAGE_KEYS.CURRENT_USER);
        localStorage.removeItem(this.STORAGE_KEYS.SESSION_TIME);
        window.location.href = 'index.html';
    }

    /**
     * Check if user is logged in
     */
    isLoggedIn() {
        return this.getCurrentUser() !== null;
    }

    /**
     * Check session validity (8 hour timeout)
     */
    checkSession() {
        const sessionTime = localStorage.getItem(this.STORAGE_KEYS.SESSION_TIME);
        if (!sessionTime) return false;

        const elapsed = new Date().getTime() - parseInt(sessionTime);
        const maxSession = 8 * 60 * 60 * 1000; // 8 hours

        if (elapsed > maxSession) {
            this.logout();
            return false;
        }

        // Update session time
        localStorage.setItem(this.STORAGE_KEYS.SESSION_TIME, new Date().getTime().toString());
        return true;
    }

    /**
     * Require authentication - redirects to login if not authenticated
     */
    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'index.html';
            return false;
        }
        
        if (!this.checkSession()) {
            return false;
        }

        return true;
    }

    /**
     * Check if current user has specific permission
     */
    hasPermission(permission) {
        const user = this.getCurrentUser();
        if (!user) return false;
        return user.permissions[permission] === true;
    }

    /**
     * Check if user can create other users
     */
    canCreateUsers() {
        const user = this.getCurrentUser();
        return user && user.canCreateUsers === true;
    }

    /**
     * Create a new user (only Super Admin Tech)
     */
    createUser(userData) {
        if (!this.canCreateUsers()) {
            return { success: false, error: 'Permission refusée. Seul Super Admin Tech peut créer des utilisateurs.' };
        }

        const users = this.getUsers();

        // Check if username already exists
        if (users.find(u => u.username === userData.username)) {
            return { success: false, error: 'Ce nom d\'utilisateur existe déjà.' };
        }

        // Validate required fields
        if (!userData.username || !userData.password || !userData.fullName || !userData.role) {
            return { success: false, error: 'Tous les champs obligatoires doivent être remplis.' };
        }

        // Validate role exists
        if (!this.USER_ROLES[userData.role]) {
            return { success: false, error: 'Rôle invalide.' };
        }

        const newUser = {
            id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            username: userData.username,
            password: userData.password,
            fullName: userData.fullName,
            email: userData.email || '',
            role: userData.role,
            pharmacyId: userData.pharmacyId || null,
            canCreateUsers: false,
            canManagePharmacies: false,
            canAccessAllPanels: this.USER_ROLES[userData.role].permissions.all_pharmacies_data,
            createdAt: new Date().toISOString(),
            isActive: userData.isActive !== false,
            isDefault: false
        };

        users.push(newUser);
        localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));

        return { 
            success: true, 
            message: `Utilisateur ${userData.fullName} créé avec succès.`,
            user: newUser
        };
    }

    /**
     * Update an existing user
     */
    updateUser(userId, updateData) {
        if (!this.canCreateUsers()) {
            return { success: false, error: 'Permission refusée.' };
        }

        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            return { success: false, error: 'Utilisateur non trouvé.' };
        }

        const user = users[userIndex];

        // Prevent modification of default admins' core properties
        if (user.isDefault) {
            if (updateData.username && updateData.username !== user.username) {
                return { success: false, error: 'Impossible de modifier le nom d\'utilisateur d\'un administrateur par défaut.' };
            }
            if (updateData.role && updateData.role !== user.role) {
                return { success: false, error: 'Impossible de modifier le rôle d\'un administrateur par défaut.' };
            }
        }

        // Apply updates
        users[userIndex] = {
            ...user,
            ...updateData,
            id: user.id, // Preserve ID
            isDefault: user.isDefault, // Preserve default flag
            updatedAt: new Date().toISOString()
        };

        localStorage.setItem(this.STORE_KEYS.USERS, JSON.stringify(users));

        return { 
            success: true, 
            message: `Utilisateur mis à jour avec succès.`,
            user: users[userIndex]
        };
    }

    /**
     * Delete a user (cannot delete default admins)
     */
    deleteUser(userId) {
        if (!this.canCreateUsers()) {
            return { success: false, error: 'Permission refusée.' };
        }

        const users = this.getUsers();
        const user = users.find(u => u.id === userId);

        if (!user) {
            return { success: false, error: 'Utilisateur non trouvé.' };
        }

        if (user.isDefault) {
            return { success: false, error: 'Impossible de supprimer un administrateur par défaut.' };
        }

        const filteredUsers = users.filter(u => u.id !== userId);
        localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(filteredUsers));

        return { 
            success: true, 
            message: `Utilisateur supprimé avec succès.`
        };
    }

    /**
     * Get role information by role key
     */
    getRoleInfo(roleKey) {
        return this.USER_ROLES[roleKey] || null;
    }

    /**
     * Get all available roles
     */
    getAllRoles() {
        return Object.entries(this.USER_ROLES).map(([key, value]) => ({
            key,
            name: value.name,
            level: value.level,
            description: value.description
        }));
    }

    /**
     * Get pharmacies accessible to current user
     */
    getAccessiblePharmacies() {
        const user = this.getCurrentUser();
        const allPharmacies = this.getPharmacies();

        if (!user) return [];

        // Super admins and roles with all_pharmacies_data permission see all
        if (user.permissions.all_pharmacies_data) {
            return allPharmacies.filter(p => p.isActive);
        }

        // Pharmacy-specific roles see only their pharmacy
        if (user.pharmacyId) {
            return allPharmacies.filter(p => p.id === user.pharmacyId && p.isActive);
        }

        return [];
    }

    /**
     * Change password for current user
     */
    changePassword(currentPassword, newPassword) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            return { success: false, error: 'Non connecté.' };
        }

        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.id === currentUser.id);

        if (userIndex === -1) {
            return { success: false, error: 'Utilisateur non trouvé.' };
        }

        if (users[userIndex].password !== currentPassword) {
            return { success: false, error: 'Mot de passe actuel incorrect.' };
        }

        users[userIndex].password = newPassword;
        users[userIndex].updatedAt = new Date().toISOString();
        localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));

        // Update current session
        currentUser.password = newPassword;
        localStorage.setItem(this.STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));

        return { success: true, message: 'Mot de passe modifié avec succès.' };
    }

    /**
     * Format date to French locale
     */
    formatDate(date) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(date).toLocaleDateString('fr-FR', options);
    }

    /**
     * Format number with thousand separators
     */
    formatNumber(num) {
        return new Intl.NumberFormat('fr-FR').format(num);
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'success') {
        const toastContainer = document.getElementById('toastContainer') || this.createToastContainer();
        
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="bi ${type === 'success' ? 'bi-check-circle-fill' : type === 'error' ? 'bi-exclamation-circle-fill' : 'bi-info-circle-fill'}"></i>
            </div>
            <div class="toast-message">${message}</div>
        `;
        
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    /**
     * Create toast container if not exists
     */
    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    }
}

// Global instance
const divFinanceAuth = new DivFinanceAuth();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DivFinanceAuth;
}
