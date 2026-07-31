# 🏥 LA DIVINE PharmaFinance Pro v3.0

![Version](https://img.shields.io/badge/version-3.0.0-green) ![Status](https://img.shields.io/badge/status-stable-brightgreen) ![License](https://img.shields.io/badge/license-Proprietary-red)

**Gestion Financière Multi-sites** pour Pharmacie LA DIVINE Health Care

---

## 📋 Table des Matières

- [✨ Nouveautés v3.0](#-nouveautés-v30)
- [🚀 Installation Rapide](#-installation-rapide)
- [🔧 Configuration](#-configuration)
- [👤 Utilisateurs](#-utilisateurs)
- [📊 Fonctionnalités](#-fonctionnalités)
- [📦 Packaging Electron](#-packaging-electron)
- [❓ FAQ](#-faq)

---

## ✨ Nouveautés v3.0

### 🎯 Option C - Innovations Majeures

| Fonctionnalité | Description |
|----------------|-------------|
| **📊 Dashboard Graphique** | 4 graphiques Chart.js interactifs (Tendance, Répartition, Comparaison Sites, Évolution) |
| **🏥 Score Santé Financière** | Algorithme de scoring 0-100 basé sur 5 piliers (Rentabilité, Liquidité, Croissance, Dettes, Régularité) |
| **📥 Import CSV Massive** | Importation par lot avec validation, drag & drop, templates |
| **📄 Rapports PDF Pro** | 4 types de rapports (Mensuel, Trimestriel, Annuel, Par Site) avec export PDF |

### 🎯 Option A - Innovations Précédentes

| Fonctionnalité | Description |
|----------------|-------------|
| **⚡ Quick Add Mobile** | Bouton flottant + saisie rapide 3 clics |
| **🔔 Alertes Proactives** | Rappels dettes J-7/J-3/J-0, anomalies >30% |
| **🌙 Mode Sombre/Clair** | Toggle automatique selon préférence système |

### 🔐 Sécurité v2.0

| Fonctionnalité | Description |
|----------------|-------------|
| **Multi-utilisateurs** | 3 rôles: Admin, Manager, Comptable |
| **Permissions RBAC** | Contrôle d'accès granulaire par module |
| **Audit Trail** | Journal des actions (1000 entrées max) |

---

## 🚀 Installation Rapide

### Méthode 1: Téléchargement Direct (Recommandé)

1. **Téléchargez le ZIP** :
   
   👉 https://github.com/aimedrcongo/FINANCE/archive/refs/tags/v3.0.0.zip

2. **Extraire** l'archive
3. **Lancer** `install-windows.bat` (clic droit → Administrateur)

### Méthode 2: Git Clone

```bash
git clone -b v3.0.0 https://github.com/aimedrcongo/FINANCE.git pharmafinance-v3
cd pharmafinance-v3
npm install
npm run build:win
```

### Méthode 3: Test Rapide (sans installation)

```bash
npm start
```

---

## 🔧 Configuration Requise

### Système
- ✅ Windows 10/11 (64-bit)
- ✅ macOS 10.15+
- ✅ Linux (Ubuntu 20.04+)

### Logiciels
- **Node.js** 18+ : https://nodejs.org (version LTS)
- **Git** (optionnel) : https://git-scm.com

### Navigateur (mode web)
- Chrome 90+, Firefox 88+, Edge 90+

---

## 👤 Utilisateurs Par Défaut

| Rôle | Identifiant | Mot de Passe | Permissions |
|------|-------------|--------------|-------------|
| 👑 **Administrateur** | `admin` | `admin2024!` | Accès total, gestion utilisateurs, audit |
| 👔 **Manager** | `manager_biayi` | `biayi2024!` | Rapports et dépenses de son site |
| 📊 **Comptable** | `comptable_central` | `compta2024!` | Consultation seule, consolidation |

> ⚠️ **Important**: Changez ces mots de passe après première connexion !

---

## 📊 Fonctionnalités Complètes

### 🏠 Dashboard
- **6 KPIs** en temps réel (Dépenses, Versements FC/USD, Solde, Sites, Jours actifs)
- **Graphiques interactifs** Chart.js
- **Score Santé Financière** avec jauge animée
- **Tableau performance par site**

### 💰 Versements
- Saisie quotidienne par pharmacie
- Double devise (FC / USD)
- Historique complet avec filtres
- Export CSV/Excel

### 📤 Dépenses
- Catégorisation (Salaires, Loyer, Électricité, etc.)
- Suivi par site et fournisseur
- Alertes seuils dépassés

### 📝 Rapports Journaliers
- Ventes du jour (Dollars + Francs)
- Caisse ouverture/fermeture
- Calculs automatiques

### 📈 Score Santé Financière

Algorithme multi-critères :

```
Score Global = 
  (Rentabilité × 25%) +
  (Liquidité × 20%) +
  (Croissance × 20%) +
  (Gestion Dettes × 20%) +
  (Régularité × 15%)
```

**Interprétation:**
- 🟢 **80-100** : Excellent 💚
- 🔵 **65-79** : Bon 💙  
- 🟠 **45-64** : Moyen 🧡
- 🔴 **0-44** : Critique ❤️‍🩹

### 📥 Import CSV

Formats supportés:
- `.csv` (virgule ou point-virgule)
- `.tsv` (tabulation)

Types d'import:
- Versements
- Dépenses
- Rapports journaliers

### 📄 Rapports PDF

4 types disponibles:
1. **Mensuel** - Synthèse du mois
2. **Trimestriel** - Tendances 3 mois
3. **Annuel** - Bilan complet
4. **Par Site** - Focus pharmacie

Contenu:
- KPIs avec graphiques
- Score santé intégré
- Tableaux détaillés
- Recommandations automatiques

---

## 📦 Packaging Electron

### Créer l'installateur Windows (.exe)

```bash
# Installateur NSIS (recommandé)
npm run build:win

# Version Portable (sans installation)
npm run build:win -- --portable
```

**Fichiers générés dans `dist-release/`:**
- `LA DIVINE PharmaFinance Pro-Setup-3.0.0.exe`
- `LA DIVINE PharmaFinance Pro-Portable-3.0.0.exe`

### Autres plateformes

```bash
# macOS (.dmg)
npm run build:mac

# Linux (.AppImage, .deb)
npm run build:linux

# Toutes plateformes
npm run build:all
```

---

## 🏥 Pharmacies Gérées

| Code | Nom | Ville |
|------|-----|-------|
| BIAYI | Pharmacie Biayi | Kinshasa |
| PHARMAFRICA | Pharmafrica | Kinshasa |
| DE_LA_REVOLUTION | De la Revolution | Kinshasa |
| KASAI | Kasai | Kasa-Vubu |
| HEWA_BORA_1 | Hewa Bora 1 | Kinshasa |
| HEWA_BORA_2 | Hewa Bora 2 | Kinshasa |
| KOLWEZI_1 | Kolwezi 1 | Kolwezi |
| KOLWEZI_2 | Kolwezi 2 | Kolwezi |

---

## 🔄 Mises à Jour

Pour mettre à jour vers une nouvelle version:

```bash
cd pharmafinance-v3
git pull origin main
npm run build:win
```

Ou téléchargez la dernière release depuis:
https://github.com/aimedrcongo/FINANCE/releases

---

## ❓ FAQ

### Q: L'application fonctionne-t-elle hors-ligne ?
**R:** Oui ! C'est une PWA (Progressive Web App). Après premier chargement, elle fonctionne sans internet.

### Q: Les données sont-elles sécurisées ?
**R:** Oui, tout est stocké localement dans IndexedDB (navigateur) ou fichier local (Electron). Rien ne quitte votre ordinateur.

### Q: Puis-je ajouter des pharmacies ?
**R:** Oui, via la page "Pharmacies" (Admin uniquement).

### Q: Comment changer un mot de passe ?
**R:** Page "Utilisateurs" → bouton "Réinitialiser".

### Q: Le .exe fonctionne sur quel Windows ?
**R:** Windows 10/11 64-bit (x86_64 ou ARM64).

---

## 📞 Support

- **Documentation**: Ce fichier README
- **Mises à jour**: https://github.com/aimedrcongo/FINANCE/releases
- **Issues**: https://github.com/aimedrcongo/FINANCE/issues

---

## 📜 Licence

**Propriétaire - Pharmacie LA DIVINE Health Care**

© 2024 Tous droits réservés.

Usage interne uniquement. Reproduction interdite sans autorisation.

---

<div align="center">

**Développé avec ❤️ pour Pharmacie LA DIVINE Health Care**

*Version 3.0.0 - Juillet 2024*

</div>
