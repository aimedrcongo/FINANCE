# 💊 PharmaFinance Pro - Gestion Financière

![Version](https://img.shields.io/badge/version-3.0.0-green) ![Status](https://img.shields.io/badge/status-production_ready-brightgreen) ![License](https://img.shields.io/badge/license-Proprietary-red)

**Application Professionnelle de Gestion Financière** pour Pharmacie LA DIVINE Health Care

---

## 📋 Table des Matières

- [✨ Fonctionnalités v3.0](#-fonctionnalités-v30)
- [🚀 Installation Rapide](#-installation-rapide)
- [👤 Utilisateurs de Test](#-utilisateurs-de-test)
- [📊 Génération Données Test](#-génération-données-test)
- [🔧 Configuration](#-configuration)
- [📦 Packaging Electron](#-packaging-electron)
- [❓ Support](#-support)

---

## ✨ Fonctionnalités v3.0

### 🎯 Dashboard Intelligent
- **6 KPIs** en temps réel (Dépenses, Versements FC/USD, Solde, Sites actifs)
- **4 Graphiques Chart.js** interactifs:
  - 📈 Tendance Revenus (7/14/30/90 jours)
  - 🍩 Répartition Dépenses par catégorie
  - 🏥 Performance comparée par site
  - 📅 Évolution mensuelle avec statistiques

### 🏥 Score Santé Financière
Algorithme multi-critères **0-100**:

| Pilier | Poids | Ce qu'il mesure |
|--------|-------|----------------|
| 💹 Rentabilité | 25% | Marge bénéficiaire |
| 💧 Liquidité | 20% | Ratio cash flow |
| 📈 Croissance | 20% | vs mois précédent |
| 📋 Gestion Dettes | 20% | Ratio dettes/revenus |
| 📅 Régularité | 15% | % rapports soumis |

**Interprétation:**
- 🟢 **80-100**: Excellent 💚
- 🔵 **65-79**: Bon 💙  
- 🟠 **45-64**: Moyen 🧡
- 🔴 **0-44**: Critique ❤️‍🩹

### 📥 Import CSV Massif
- ✅ Drag & drop ou sélection fichier
- ✅ Support CSV/TSV auto-détection séparateur
- ✅ Validation intelligente avant import
- ✅ Templates téléchargeables (Versements/Dépenses/Rapports)
- ✅ Progression en temps réel

### 📄 Rapports PDF Professionnels
- **4 types**: Mensuel, Trimestriel, Annuel, Par Site
- Aperçu temps réel avant génération
- Export PDF via impression navigateur
- KPIs + graphiques + score santé intégrés
- Recommandations automatiques personnalisées

### 🔐 Sécurité Multi-utilisateurs
| Rôle | Permissions |
|------|------------|
| 👑 **Admin** | Accès total, gestion utilisateurs, audit |
| 👔 **Manager** | Rapports et dépenses de son site |
| 📊 **Comptable** | Consultation seule, consolidation |
| 👤 **Agent/Sous-agent** | Saisie terrain, données de son site |

### ⚡ Autres Fonctionnalités
- ⚡ **Quick Add Mobile** - Saisie rapide 3 clics
- 🔔 **Alertes Proactives** - Dettes J-7/J-3/J-0, anomalies >30%
- 🌙 **Mode Sombre/Clair** - Toggle automatique système
- 📱 **PWA Offline** - Fonctionne sans internet
- 🔄 **Audit Trail** - Journal complet des actions

---

## 🚀 Installation Rapide

### Méthode 1: Téléchargement Direct (Recommandé)

1. **Téléchargez le ZIP officiel v3.0.0**:
   
   👉 https://github.com/aimedrcongo/FINANCE/archive/refs/tags/v3.0.0.zip

2. **Extraire** l'archive → Renommer en `pharmafinance-v3`

3. **Lancer** `install-windows.bat` (Clic droit → Administrateur)

4. **Attendre** ~10-15 minutes (téléchargement Electron + build .exe)

5. **Installer** l'exécutable généré dans `dist-release/`

### Méthode 2: Git Clone

```bash
git clone -b v3.0.0 https://github.com/aimedrcongo/FINANCE.git pharmafinance-v3
cd pharmafinance-v3
npm install
npm run build:win
```

### Méthode 3: Test Navigateur (sans installation)

```bash
# Ouvrir index.html directement dans Chrome/Firefox
# Ou utiliser un serveur local:
python3 -m http.server 8080
# Puis ouvrir http://localhost:8080
```

---

## 👤 Utilisateurs de Test

| Rôle | Identifiant | Mot de Passe | Site |
|------|-------------|--------------|------|
| 👑 **Administrateur** | `admin` | `admin2024!` | Tous les sites |
| 👔 **Manager BIAYI** | `manager_biayi` | `biayi2024!` | BIAYI |
| 👔 **Manager PHARMAFRICA** | `manager_pharmafrica` | `pharmafrica2024!` | PHARMAFRICA |
| 📊 **Comptable Central** | `comptable_central` | `compta2024!` | Siège Central |
| 👤 **Agent KASAI** | `agent_kasai` | `agent2024!` | KASAI |
| 👤 **Agent KOLWEZI 1** | `agent_kolwezi1` | `agent2024!` | KOLWEZI 1 |
| 👤 **Agent HEWA BORA 1** | `agent_hewabora1` | `agent2024!` | HEWA BORA 1 |

> ⚠️ **Important**: Changez ces mots de passe après première connexion !

---

## 📊 Génération Données Test

Pour tester immédiatement avec des données réalistes de **Juillet 2024**:

1. Ouvrez l'application dans le navigateur
2. Appuyez **F12** pour ouvrir la console développeur
3. Copiez-collez cette commande:

```javascript
await TestDataGenerator.generateAll()
```

**Données générées automatiquement:**
- ✅ ~200 versements quotidiens (8 sites × 25 jours)
- ✅ ~150 dépenses (fixes + variables)
- ✅ ~210 rapports journaliers
- ✅ ~15 dettes fournisseurs

**Total: ~575 enregistrements de test réalistes**

---

## 🔧 Configuration Requise

### Système
- ✅ Windows 10/11 (64-bit) - **Principal**
- ✅ macOS 10.15+
- ✅ Linux Ubuntu 20.04+

### Logiciels (pour packaging .exe uniquement)
- **Node.js** 18+ : https://nodejs.org (version LTS)
- **Git** : https://git-scm.com (optionnel)

### Navigateur (mode web PWA)
- Chrome 90+, Firefox 88+, Edge 90+

---

## 📦 Packaging Electron

### Créer l'installateur Windows (.exe)

```bash
# Depuis le dossier du projet:
npm run build:win
```

**Fichiers générés dans `dist-release/`:**
- `PharmaFinance-Setup-3.0.0.exe` ← Installateur NSIS
- `PharmaFinance-Portable-3.0.0.exe` ← Version portable

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

## 🏥 Pharmacies Gérées (8 Sites)

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
**R:** Oui ! C'est une PWA (Progressive Web App). Après premier chargement, elle fonctionne **complètement sans internet**.

### Q: Les données sont-elles sécurisées ?
**R:** Oui, tout est stocké localement dans IndexedDB (navigateur) ou fichier local (Electron). **Rien ne quitte votre ordinateur.**

### Q: Puis-je ajouter des pharmacies ?
**R:** Oui, via la page "Pharmacies" (Admin uniquement).

### Q: Comment changer un mot de passe ?
**R:** Page "Utilisateurs" → bouton "Réinitialiser".

### Q: Le .exe fonctionne sur quel Windows ?
**R:** Windows 10/11 64-bit (x86_64 ou ARM64).

### Q: Comment tester avec des données ?
**R:** Ouvrez la console (F12) et lancez: `await TestDataGenerator.generateAll()`

---

## 📞 Support

- **Documentation**: Ce fichier README
- **Releases**: https://github.com/aimedrcongo/FINANCE/releases
- **Issues**: https://github.com/aimedrcongo/FINANCE/issues

---

## 📜 Licence

**Propriétaire - Pharmacie LA DIVINE Health Care**

© 2024 Tous droits réservés.
Usage interne uniquement. Reproduction interdite sans autorisation.

---

<div align="center">

**💊 Développé avec précision pour Pharmacie LA DIVINE Health Care**

*Version 3.0.0 - Production Ready*  
*Juillet 2024*

</div>
