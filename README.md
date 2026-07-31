# 🏥 LA DIVINE PharmaFinance Pro v3

<p align="center">
  <img src="icons/icon-512x512.png" alt="LA DIVINE Logo" width="150" height="150">
</p>

<h1 align="center">🏥 LA DIVINE PharmaFinance Pro</h1>
<p align="center">
  <strong>Gestion Financière Multi-sites pour Pharmacie</strong><br>
  <em>Application Desktop Electron • Auto-Update Intégré • Windows</em>
</p>

---

## 📋 Table des Matières

- [✨ Fonctionnalités](#-fonctionnalités)
- [🚀 Installation Rapide](#-installation-rapide)
- [📦 Build & Distribution](#-build--distribution)
- [🔄 Mises à Jour Automatiques](#-mises-à-jour-automatiques)
- [🛠️ Développement](#-développement)
- [📁 Structure du Projet](#-structure-du-projet)
- [🔧 Configuration](#-configuration)
- [❓ FAQ](#-faq)
- [📄 Licence](#-licence)

---

## ✨ Fonctionnalités

### 💰 Gestion Financière
- **Journal des dépenses** : Suivi détaillé de toutes les transactions
- **Balance mensuelle** : Vue d'ensemble des finances par mois
- **Dettes fournisseurs** : Gestion des créances et dettes
- **Rapports journaliers** : Export automatique des activités
- **Calculs automatiques** : TVA, marges, bénéfices

### 🏪 Multi-sites (8 Pharmacies)
- Gestion simultanée de plusieurs points de vente
- Consolidation des données en temps réel
- Vue globale ou par pharmacie individuelle

### 🎨 Interface Utilisateur
- **Mode sombre/clair** : Thème adaptable
- **Design responsive** : Optimisé pour toutes tailles d'écran
- **Alertes intelligentes** : Notifications pour les échéances importantes
- **Ajout rapide** : Saisie express des transactions

### 📤 Export & Import
- **Export PDF** : Rapports professionnels formatés
- **Export CSV/Excel** : Analyse dans Excel/Google Sheets
- **Export JSON** : Backup complet des données
- **Import backup** : Restauration facile

### 🔐 Sécurité
- Authentification utilisateur sécurisée
- Données stockées localement (IndexedDB + localStorage)
- Chiffrement des informations sensibles
- Mode hors-ligne complet (PWA)

### 🔄 Auto-Update (Nouveau v3!)
- Mises à jour automatiques via GitHub Releases
- Téléchargement en arrière-plan avec progression
- Notification élégante avant installation
- Redémarrage en un clic

---

## 🚀 Installation Rapide

### Prérequis

| Outil | Version | Lien |
|-------|---------|------|
| **Node.js** | ≥ 18.x (LTS) | https://nodejs.org |
| **npm** | ≥ 9.x | Inclus avec Node.js |
| **Git** | Dernière version | https://git-scm.com |
| **Windows** | 10/11 (64-bit) | - |

### Installation

```bash
# Cloner le repository
git clone https://github.com/aimedrcongo/FINANCE.git pharmafinance-v3
cd pharmafinance-v3

# Installer les dépendances
npm install

# Lancer l'application
npm start
```

### Installateur Windows (.exe)

Téléchargez la dernière version depuis :
```
https://github.com/aimedrcongo/FINANCE/releases/latest
```

Fichiers disponibles :
- `LA DIVINE PharmaFinance Pro-Setup-v3.x.x.exe` - Installateur complet
- `LA DIVINE PharmaFinance Pro-Portable-v3.x.x.exe` - Version portable

---

## 📦 Build & Distribution

### Build Local (PowerShell)

```powershell
# Ouvrir PowerShell en Administrateur
cd pharmafinance-v3

# Installer dépendances
npm install

# Build installateur NSIS (.exe)
npm run build:win

# Build version portable
npm run build:portable

# Résultat dans: dist-release/
```

### Script de Build Automatisé

Double-cliquez sur `build.bat` (Windows) et choisissez :

| Option | Description |
|--------|-------------|
| 1 | Mode développement |
| 2 | Build Windows (.exe installer) |
| 3 | Version portable |
| 4 | Tout construire |

---

## 🔄 Mises à Jour Automatiques

### Comment ça marche ?

```
┌─────────────────────────────────────────────┐
│  DÉVELOPPEUR                                │
│     │                                       │
│     ├─ git tag v3.0.1                       │
│     ├─ git push origin v3.0.1               │
│     │                                       │
│     ▼                                       │
│  GITHUB ACTIONS (Automatique)               │
│     │                                       │
│     ├─ ✅ Validation                        │
│     ├─ 🪟 Build .exe                       │
│     ├─ 🚀 Release GitHub                   │
│     └─ 📤 Publication                      │
│                                             │
│     ▼                                       │
│  UTILISATEURS                               │
│     │                                       │
│     ├─ App détecte la mise à jour           │
│     ├─ Notification "v3.0.1 disponible"    │
│     ├─ Téléchargement avec barre           │
│     └─ Installation au redémarrage         │
└─────────────────────────────────────────────┘
```

### Créer une Nouvelle Release

```bash
# Méthode 1: Git Tag (Recommandé)
git tag v3.0.1
git push origin v3.0.1

# Méthode 2: Script automatisé
./release.sh patch   # 3.0.0 → 3.0.1
./release.sh minor   # 3.0.0 → 3.1.0
./release.sh major   # 3.0.0 → 4.0.0
```

Voir [GUIDE_GITHUB_ACTIONS.md](GUIDE_GITHUB_ACTIONS.md) pour plus de détails.

---

## 🛠️ Développement

### Structure Technique

| Technologie | Usage |
|-------------|-------|
| **Electron 28** | Application desktop |
| **HTML5/CSS3** | Interface utilisateur |
| **JavaScript ES6+** | Logique métier |
| **IndexedDB** | Stockage local |
| **electron-updater** | Mises à jour auto |
| **NSIS** | Installateur Windows |
| **Service Worker** | Support PWA/hors-ligne |

### Commandes Disponibles

```bash
# Développement
npm start          # Lance Electron en mode dev
npm run dev        # Alias pour npm start

# Build
npm run build      # Build tous les targets
npm run build:win  # Build Windows uniquement
npm run build:portable # Version portable
npm run pack       # Pack sans créer installer

# Test
npm test           # Tests unitaires (à venir)
```

### Personnalisation

#### Configuration de l'Auto-Update

Éditer `js/auto-update.js` :

```javascript
const AutoUpdater = {
    config: {
        repo: 'aimedrcongo/FINANCE',  // Votre repo GitHub
        owner: 'aimedrcongo',
        checkInterval: 3600000,       // Vérification toutes les heures
        enabled: true
    }
};
```

#### Thèmes & Couleurs

Les couleurs sont définies dans `css/style.css` :

```css
:root {
    --primary-color: #0A6E32;    /* Vert LA DIVINE */
    --accent-color: #28a745;     /* Vert clair */
    --bg-dark: #1a1a2e;         /* Fond sombre */
    --text-light: #ffffff;       /* Texte clair */
}
```

---

## 📁 Structure du Projet

```
pharmafinance-pro/
├── .github/
│   └── workflows/
│       └── build-release.yml    # CI/CD GitHub Actions
├── electron/
│   ├── main.js                 # Processus principal Electron
│   └── preload.js              # Bridge sécurisé main↔renderer
├── css/
│   ├── style.css               # Styles principaux
│   ├── dark-mode.css           # Thème sombre
│   ├── innovations.css         # Composants innovants
│   ├── quick-add.css           # Formulaire rapide
│   └── smart-alerts.css        # Alertes
├── js/
│   ├── app.js                  # Logique principale
│   ├── auth.js                 # Authentification
│   ├── db.js                   # Base de données IndexedDB
│   ├── calculations.js         # Calculs financiers
│   ├── export.js               # Export PDF/CSV/Excel
│   ├── utils.js                # Utilitaires
│   ├── dark-mode.js            # Gestion thème
│   ├── innovations.js          # Fonctionnalités innovantes
│   ├── quick-add.js            # Ajout rapide
│   ├── smart-alerts.js         # Alertes intelligentes
│   └── auto-update.js          # Module auto-update (v3!)
├── icons/
│   ├── icon-512x512.png         # Icône principale
│   ├── icon-256x256.png         # Icône Windows
│   └── ...                     # Autres tailles
├── build/
│   └── installer.nsh           # Script NSIS personnalisé
├── index.html                  # Page principale
├── manifest.json               # Manifest PWA
├── sw.js                       # Service Worker
├── package.json                # Config npm/Electron
├── build.bat                   # Script build Windows
├── release.sh                  # Script création release
├── README.md                   # Ce fichier
└── GUIDE_GITHUB_ACTIONS.md     # Guide CI/CD
```

---

## 🔧 Configuration

### Variables d'Environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `NODE_ENV` | Environnement | `production` |
| `ELECTRON_ENABLE_LOGGING` | Logs détaillés | `false` |
| `ELECTRON_NO_UPDATE` | Désactiver auto-update | `false` |

### Fichier de Configuration

Les paramètres utilisateurs sont stockés dans le localStorage du navigateur :

```javascript
// Accès aux paramètres
const settings = JSON.parse(localStorage.getItem('pharmafinance-settings') || '{}');

// Paramètres disponibles
settings.defaultPharmacy;    // Pharmacie par défaut
settings.theme;             // 'light' ou 'dark'
settings.currency;           // 'EUR', 'USD', etc.
settings.language;          // 'fr', 'en'
```

---

## ❓ FAQ

### Q: L'application fonctionne-t-elle sans internet ?
**Oui !** Toutes les données sont stockées localement. Internet n'est requis que pour les mises à jour automatiques.

### Q: Combien de pharmacies puis-je gérer ?
Jusqu'à **8 pharmacies** simultanément, avec possibilité d'extension.

### Q: Mes données sont-elles sécurisées ?
**Oui !** Les données sont stockées sur votre machine en local. Aucun envoi vers des serveurs externes.

### Q: Comment sauvegarder mes données ?
Utilisez **Fichier → Exporter les données** pour créer un backup JSON complet.

### Q: Puis-je personnaliser l'interface ?
Oui ! Le code est entièrement personnalisable. Voir la section [Développement](#-développement).

### Q: Comment signaler un bug ?
Créez une issue sur GitHub : https://github.com/aimedrcongo/FINANCE/issues

---

## 📊 Statistiques du Projet

| Métrique | Valeur |
|----------|--------|
| **Version** | 3.0.0 |
| **Langages** | HTML, CSS, JavaScript |
| **Framework** | Electron 28 |
| **Taille (source)** | ~800 Ko |
| **Taille (.exe)** | ~100 Mo |
| **Plateformes** | Windows 10/11 64-bit |
| **Licence** | Propriétaire |

---

## 🤝 Contribution

Nous n'acceptons pas actuellement de contributions externes, mais vous pouvez :

- ⭐ **Star** le repository si vous aimez le projet
- 🐛 **Signaler** les bugs via Issues
- 💡 **Suggérer** des fonctionnalités
- 📢 **Partager** le projet autour de vous

---

## 📄 Licence

Copyright © 2024-2026 **Pharmacie LA DIVINE Health Care**

Tous droits réservés.

Ce logiciel est la propriété exclusive de Pharmacie LA DIVINE Health Care.
Toute reproduction, modification ou distribution non autorisée est strictement interdite.

Pour toute licence commerciale, contactez : contact@ladivine-pharma.com

---

## 📞 Support & Contact

| Type | Contact |
|------|---------|
| **Email** | contact@ladivine-pharma.com |
| **Documentation** | [GUIDE_GITHUB_ACTIONS.md](GUIDE_GITHUB_ACTIONS.md) |
| **Issues** | [GitHub Issues](https://github.com/aimedrcongo/FINANCE/issues) |
| **Releases** | [GitHub Releases](https://github.com/aimedrcongo/FINANCE/releases) |

---

<div align="center">

**Made with ❤️ by [Pharmacie LA DIVINE Health Care](https://ladivine-pharma.com)**

[⭐ Star] | [🐛 Issue] | [📥 Release]

*Version 3.0.0 - Juillet 2026*

</div>
