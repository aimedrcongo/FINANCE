# DivFinance Pro v3.2

**Application de Gestion Financière Professionnelle pour Pharmacies**

🏥 **LA DIVINE Health Care** - Réseau de Pharmacies en RDC

![Version](https://img.shields.io/badge/version-3.2.0-green)
![Electron](https://img.shields.io/badge/Electron-28-blue)
![License](https://img.shields.io/badge/license-MIT-orange)

---

## 📋 Description

DivFinance Pro v3.2 est une application desktop professionnelle de gestion financière complète, spécialement conçue pour le réseau de pharmacies **LA DIVINE Health Care** en République Démocratique du Congo.

L'application permet de gérer :
- ✅ Les ventes journalières (USD + Francs Congolais)
- ✅ Les paiements électroniques (Equity, GGA, TMB, MOKO)
- ✅ Les dépenses (16 catégories)
- ✅ Le livre de comptes complet
- ✅ Les dettes fournisseurs
- ✅ La trésorerie par site
- ✅ Les versements des pharmacies

---

## 👥 Comptes par Défaut

| Rôle | Identifiant | Mot de Passe | Accès |
|------|-------------|--------------|-------|
| **Super Admin Tech** | `fabricefb` | `1234Div@` | Accès total + Création utilisateurs |
| **Super Admin Finance** | `directeur_finance` | `DFinance2026!` | Tous panneaux financiers |

---

## 🏥 Pharmacies du Réseau

1. DE LA REVOLUTION (DE LA)
2. BIAYI
3. HEWA BORA 1
4. HEWA BORA 2
5. KASAI
6. KOLWEZI 1
7. KOLWEZI 2
8. PHARMAFRICA
9. DEPOT (Entrepôt central)

---

## 🚀 Installation

### Prérequis

- **Node.js** v18+ (recommandé v24.18.1)
- **npm** v9+ (recommandé v11.16.0)
- **Windows 10/11** (pour le build .exe)

### Étapes d'Installation

```bash
# 1. Cloner ou télécharger le repository
git clone https://github.com/aimedrcongo/FINANCE.git
cd FINANCE

# 2. Installer les dépendances
npm install

# 3. Lancer en mode développement
npm start

# 4. Build pour production (crée l'installateur .exe)
npm run build-win
```

### Fichiers Générés (dossier `dist/`)

- **DivFinance-Pro-Setup-3.2.0.exe** → Installateur NSIS
- **DivFinance-Pro-Portable-3.2.0.exe** → Version Portable (sans installation)

---

## 📊 Modules de l'Application

### 1. Tableau de Bord
- KPIs financiers en temps réel
- Ventes du jour, Dépenses, Solde caisse
- Résumé mensuel avec bénéfice net
- Alertes et actions requises

### 2. Rapport Journalier
Saisie quotidienne par pharmacie :
- Ventes (USD + FC)
- Paiements E-Money (Equity, GGA, TMB, MOKO)
- Dépenses (Transport, Achats, Carburant, Autres)
- Total Cahier vs Système
- Produits expirés

### 3. Dépenses
16 catégories de dépenses :
- Fournisseurs : MOON, UNIQUE, PROMED
- Transport produits et expédition
- Entretien moto et groupe électrogène
- Demande de fonds
- Transport agents
- Carburant
- Travaux boss
- Tegermo et taxes
- Salaire fermiers
- Loer, Kin Med, Compte Moussa
- Travaux pharmacie et dépôt

### 4. Livre de Comptes
6 onglets professionnels :
- Tableau de bord financier
- Journal des opérations
- Balance par site
- Grand livre des dépenses
- Suivi de trésorerie
- Prévisions budgétaires

### 5. Versement des Pharmacies
Grand livre des versements :
- Par date et pharmacie
- Montants USD + FC
- Totaux automatiques

### 6. Dettes Fournisseurs
- Suivi des dettes Moon, Unique, etc.
- Gestion des échéances
- Alertes de retard

### 7. Balance Mensuelle
- Bilan mensuel complet
- Par site et global

### 8. Exports
- Export CSV/Excel de toutes les données
- Rapports personnalisables

---

## 💱 Gestion des Devises

- **USD** (Dollars américains)
- **FC** (Francs Congolais)
- **Taux de conversion** : 2800 FC/USD (configurable)

---

## 🔐 Rôles et Permissions (RBAC)

| # | Rôle | Description |
|---|------|-------------|
| 1 | Super Admin Tech | Accès complet + Gestion utilisateurs/pharmacies |
| 2 | Super Admin Finance | Tous panneaux financiers |
| 3 | Admin Pharmacie | Gestion de sa pharmacie uniquement |
| 4 | Comptable | Comptabilité et rapports |
| 5 | Caissier | Gestion des caisses |
| 6 | Consultant | Lecture seule |

---

## 🛠️ Stack Technique

- **Frontend** : HTML5, CSS3, JavaScript ES6+
- **Framework UI** : Bootstrap 5.3.2
- **Icônes** : Bootstrap Icons 1.11.1
- **Desktop** : Electron 28
- **Build** : electron-builder 24.13.3
- **Stockage** : localStorage (offline-first)

---

## 📁 Structure du Projet

```
divfinance-v32-preview/
├── index.html          # Page de connexion
├── principal.html      # Application principale (Finance)
├── admin.html          # Administration (Super Admin Tech)
├── pharmacie.html      # Panneau Admin Pharmacie
├── auth.js             # Système d'authentification RBAC
├── app.js              # Logique métier principale
├── style.css           # Styles professionnels
├── main.js             # Processus principal Electron
├── preload.js          # Bridge sécurisé Electron
├── package.json        # Configuration npm/Electron
├── LICENSE             # Licence MIT
└── README.md           # Documentation
```

---

## 🔧 Scripts Disponibles

```bash
# Lancer l'application
npm start

# Build Windows (NSIS + Portable)
npm run build-win

# Build NSIS uniquement
npm run build

# Build Portable uniquement
npm run build-portable
```

---

## 📞 Support

Pour toute question ou assistance technique :
- **Email** : support@ladivine.com
- **GitHub Issues** : https://github.com/aimedrcongo/FINANCE/issues

---

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

**© 2026 LA DIVINE Health Care - Tous droits réservés**
