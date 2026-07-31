# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère à [Semantic Versioning](https://semver.org/langs/fr/).

## [3.0.0] - 2026-07-31

### 🎉 Ajouté
- **GitHub Actions CI/CD** : Build automatique des releases Windows
- **Auto-Update intégré** : Mises à jour automatiques via electron-updater
- **Script de release** : `release.sh` pour créer des versions en une commande
- **Documentation complète** : README.md et GUIDE_GITHUB_ACTIONS.md mis à jour
- **Preload script** : API sécurisée pour communication Electron main↔renderer
- **Module auto-update UI** : Notifications élégantes avec barre de progression

### 🔧 Changé
- Refonte complète de `package.json` (correction encodage BOM)
- Simplification configuration (Windows-only)
- Mise à jour Electron vers 28.3.3
- Mise à jour electron-builder vers 24.13.3
- Configuration GitHub publish vers repo `aimedrcongo/FINANCE`
- Version affichée : v2.0 → v3.0

### 🐛 Corrigé
- Erreur `AppImage` (propriété invalide dans package.json)
- Problème d'encodage BOM causant l'échec du build
- Configuration NSIS corrigée pour installateur Windows propre

### 📝 Notes
- Cette version nécessite Node.js ≥ 18.x
- Les builds sont maintenant générés automatiquement via GitHub Actions
- L'auto-update vérifie les nouvelles versions toutes les heures

---

## [2.0.0] - Version Initiale

### 🎉 Ajouté
- Application Electron desktop complète
- Gestion financière multi-sites (8 pharmacies)
- Journal des dépenses détaillé
- Balance mensuelle automatisée
- Gestion des dettes fournisseurs
- Rapports journaliers exportables
- Mode sombre/clair
- Export PDF, CSV, Excel, JSON
- Authentification utilisateur sécurisée
- Stockage local IndexedDB
- Support PWA hors-ligne
- Alertes intelligentes
- Formulaire d'ajout rapide
- Interface responsive moderne

### 📝 Notes
- Version initiale du projet
- Base de toutes les fonctionnalités actuelles

---

## Format du Changelog

Les entrées sont classées par type :

### 🎉 Ajouté (Added)
Nouvelles fonctionnalités

### 🔧 Changé (Changed)
Modifications existantes

### 🐛 Corrigé (Fixed)
Bugs résolus

### 🗑️ Supprimé (Removed)
Fonctionnalités retirées

### ⚠️ Sécurité (Security)
Corrections de vulnérabilités

---

*Pour plus de détails sur chaque version, consultez les [Releases GitHub](https://github.com/aimedrcongo/FINANCE/releases)*
