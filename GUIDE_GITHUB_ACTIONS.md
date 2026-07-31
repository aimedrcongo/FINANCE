# 🚀 GUIDE COMPLET - GITHUB ACTIONS AUTO-UPDATE v3

> **Version**: 3.0.0 | **Dernière mise à jour**: Juillet 2026

---

## 📋 Table des Matières

1. [Introduction](#-introduction)
2. [Configuration Initiale](#-configuration-initiale)
3. [Structure du Workflow](#-structure-du-workflow)
4. [Comment ça Marche](#-comment-ça-marche)
5. [Déclencher une Release](#-déclencher-une-release)
6. [Auto-Update dans l'Application](#-auto-update-dans-lapplication)
7. [Dépannage](#-dépannage)
8. [Bonnes Pratiques](#-bonnes-pratiques)

---

## 🎯 Introduction

Ce guide explique comment configurer et utiliser **GitHub Actions** pour :

✅ Build automatique de votre application Electron Windows  
✅ Création de releases GitHub avec les fichiers .exe  
✅ Mises à jour automatiques pour les utilisateurs finaux  
✅ Déploiement continu à chaque nouveau tag version  

### Prérequis

| Élément | Requis |
|---------|--------|
| Repository GitHub | ✅ Créé (public ou privé) |
| Code poussé | ✅ Sur branche `main` |
| GitHub Actions | ✅ Activé (par défaut) |

---

## 🎯 Configuration Initiale

### 1. Créer le Repository GitHub

```bash
# Sur https://github.com/new
# Nom du repo: FINANCE
# Visibility: Private (recommandé) ou Public
# NE PAS cocher "Add README", "Add .gitignore"
```

### 2. Permissions du Workflow

Aller dans : **Settings → Actions → General**

Activer ces options :
- ☑️ **Allow all actions and reusable workflows**
- ☑️ **Read and write permissions** (Workflow permissions)
- ☑️ **Allow GitHub Actions to create pull requests**

### 3. Pousser le Code Initial

```bash
# Cloner (si vous avez forké)
git clone https://github.com/aimedrcongo/FINANCE.git
cd FINANCE

# Ou si vous partez de zéro
git init
git remote add origin https://github.com/aimedrcongo/FINANCE.git

# Ajouter tous les fichiers
git add .
git commit -m "🎉 Initial release - PharmaFinance Pro v3.0.0"

# Pousser vers main
git push -u origin main
```

---

## 📁 Structure du Workflow

Le fichier `.github/workflows/build-release.yml` contient **4 jobs** :

```
┌─────────────────────────────────────────────────────────────┐
│                    WORKFLOW TRIGGER                          │
│  • Push sur main/develop                                     │
│  • Tag v* (ex: v3.0.1)                                      │
│  • Manuel (workflow_dispatch)                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────┐    ┌─────────────────┐
        │   🔍 TEST       │───▶│ 🪟 BUILD WIN    │───┐
        │                 │    │                 │   │
        │ • Validation    │    • electron-builder│   │
        │ • Stats         │    • NSIS + Portable │   │
        └─────────────────┘    └─────────────────┘   │
                                                      ▼
                                              ┌──────────────┐
                                              │ 🚀 RELEASE   │◄── Tag v*
                                              │              │
                                              │ • GitHub     │
                                              │ • Upload .exe│
                                              └──────┬───────┘
                                                     │
                                                     ▼
                                             ┌──────────────┐
                                             │ 📬 NOTIFY     │
                                             │              │
                                             │ • Rapport     │
                                             └──────────────┘
```

### Détail des Jobs

#### Job 1: 🔍 Test & Validation
- Vérifie la syntaxe des fichiers HTML/CSS/JS
- Génère des statistiques du build
- S'exécute sur `ubuntu-latest`

#### Job 2: 🪟 Build Windows
- Compile l'application avec `electron-builder`
- Génère 2 artefacts :
  - **NSIS Installer** (`*-Setup-v*.exe`)
  - **Portable** (`*-Portable-v*.exe`)
- S'exécute sur `windows-latest`
- Upload les artefacts pour 30 jours

#### Job 3: 🚀 Release GitHub
- Crée une **GitHub Release** automatiquement
- Génère un changelog
- Attache les fichiers .exe
- Uniquement déclenché par un **tag v*** ou manuellement

#### Job 4: 📬 Notification
- Envoie un résumé du build
- Indique le statut final (succès/échec)

---

## ⚙️ Comment ça Marche

### Cycle de Vie Complet d'une Mise à Jour

```
DÉVELOPPEUR                    GITHUB ACTIONS                    UTILISATEUR
    │                              │                                 │
    ├─ git tag v3.0.1             │                                 │
    ├─ git push origin v3.0.1     │                                 │
    │                              ▼                                 │
    │                    ┌─────────────────┐                        │
    │                    │  🔍 Validation   │                        │
    │                    │  (30 secondes)  │                        │
    │                    └────────┬────────┘                        │
    │                             ▼                                 │
    │                    ┌─────────────────┐                        │
    │                    │  🪟 Build .exe   │                        │
    │                    │  (~5 minutes)   │                        │
    │                    └────────┬────────┘                        │
    │                             ▼                                 │
    │                    ┌─────────────────┐                        │
    │                    │  🚀 Release      │                        │
    │                    │  GitHub + Upload │                        │
    │                    └────────┬────────┘                        │
    │                             │                                 │
    │                             ▼                                 │
    │                    ┌─────────────────┐                        │
    │                    │  latest.yml ◄───┼──── App vérifie au démarrage
    │                    │  (auto-update)  │                         │
    │                    └─────────────────┘                        │
    │                                                              │
    │                    ┌─────────────────┐                        │
    ◄───────────────────│  📥 Download     │◄──────────────────────┤
                         │  + Install      │   User accepte la MAJ
                         └─────────────────┘                        │
```

### Fichiers Générés

Après chaque release, vous trouverez dans **Releases** :

```
v3.0.1/
├── LA DIVINE PharmaFinance Pro-Setup-v3.0.1.exe    # Installateur
├── LA DIVINE PharmaFinance Pro-Portable-v3.0.1.exe # Portable
└── latest.yml                                       # Métadonnées auto-update
```

---

## 🏷️ Déclencher une Release

### Méthode 1 : Git Tag (Recommandé)

C'est la méthode la plus simple et fiable.

```bash
# Se placer sur la branche main
git checkout main
git pull origin main

# Version PATCH (corrections de bugs)
# Ex: 3.0.0 → 3.0.1
git tag v3.0.1
git push origin v3.0.1

# Version MINOR (nouvelles fonctionnalités)
# Ex: 3.0.0 → 3.1.0
git tag v3.1.0
git push origin v3.1.0

# Version MAJOR (changements majeurs)
# Ex: 3.0.0 → 4.0.0
git tag v4.0.0
git push origin v4.0.0
```

### Méthode 2 : Script Automatisé

Utilisez le script `release.sh` inclus :

```bash
# Rendre exécutable
chmod +x release.sh

# Utilisation
./release.sh patch    # 3.0.0 → 3.0.1 (corrections bugs)
./release.sh minor    # 3.0.0 → 3.1.0 (nouvelles features)
./release.sh major    # 3.0.0 → 4.0.0 (breaking changes)
```

### Méthode 3 : Manuelle via GitHub UI

1. Allez sur **Actions** tab du repository
2. Cliquez sur **"PharmaFinance Pro CI/CD"**
3. Cliquez sur **"Run workflow"**
4. Sélectionnez :
   - **Branch**: `main`
   - **Release type**: `patch`, `minor` ou `major`
5. Cliquez sur **"Run workflow"**

### Méthode 4 : Interface GitHub Releases

1. Allez sur **Code → Releases**
2. Cliquez sur **"New release"**
3. Choisissez le tag (ex: `v3.0.1`)
4. Ajoutez un titre et description
5. Uploadez les fichiers .exe manuellement (si pas de CI/CD)

---

## 🔄 Auto-Update dans l'Application

### Configuration

Le module auto-update est configuré dans `js/auto-update.js` :

```javascript
const AutoUpdater = {
    config: {
        repo: 'aimedrcongo/FINANCE',    // Repository GitHub
        owner: 'aimedrcongo',            // Propriétaire
        checkInterval: 3600000,          // Toutes les heures (ms)
        enabled: true                    // Activé par défaut
    }
};
```

### Comportement

| Moment | Action |
|--------|--------|
| **Au démarrage** | Vérification après 5 secondes |
| **Toutes les heures** | Re-vérification silencieuse |
| **Au réveil PC** | Vérification après sortie de veille |
| **Manuel** | Menu Aide → "Vérifier mises à jour" |

### Flux Utilisateur

```
1. Démarrage Application
       ↓
2. Vérification silencieuse (5 sec)
       ↓
   ┌───┴───┐
   │       │
   ↓       ↓
[À jour]  [Nouvelle version!]
   │           ↓
   │    Notification popup
   │    "v3.0.1 disponible!"
   │           ↓
   │    ┌──────┴──────┐
   │    ↓             ↓
   │  [Télécharger] [Plus tard]
   │       ↓
   │  Barre de progression 0% → 100%
   │       ↓
   │  "Prêt ! Redémarrer?"
   │       ↓
   │  Installation au redémarrage
   ↓
Application mise à jour ✓
```

### Personnaliser les Notifications

Éditer `js/auto-update.js` pour modifier :

- Textes des notifications
- Couleurs et styles CSS
- Comportement (auto-download ou non)

---

## 🛠️ Dépannage

### Erreurs Courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| **404 Not Found** | Mauvais nom de repo | Vérifiez `publish.repo` dans package.json |
| **Permission denied** | Token invalide | Vérifiez les permissions du repo |
| **Build failed** | Erreur Node.js | Vérifiez logs onglet "Actions" |
| **No update available** | Version identique | Incrémentez le numéro de version |
| **BOM error** | Encodage fichier | Recréer package.json sans BOM |

### Debug Mode

Pour activer les logs détaillés :

```powershell
# Lancer avec logging
.\LA-DIVINE-PharmaFinance-Pro.exe --enable-logging

# Les logs sont dans :
# %APPDATA%\LA DIVINE\PharmaFinance Pro\logs\
```

### Forcer une Mise à Jour

Si l'auto-update ne fonctionne pas :

1. Télécharger manuellement depuis :
   ```
   https://github.com/aimedrcongo/FINANCE/releases/latest
   ```

2. Exécuter le `.exe` par-dessus l'ancienne version

3. Ou désinstaller/réinstaller complètement

### Réinitialiser l'Auto-Update

Si des problèmes persistent :

```bash
# Supprimer les données de mise à jour
rm -rf "$APPDATA/LA DIVINE/PharmaFinance Pro/update-info"

# Relancer l'application
```

---

## 📊 Monitoring

### Où Voir les Builds

| Ressource | URL |
|-----------|-----|
| **Workflow Runs** | `https://github.com/aimedrcongo/FINANCE/actions` |
| **Releases** | `https://github.com/aimedrcongo/FINANCE/releases` |
| **Artifacts** | Disponibles 30 jours dans chaque run |

### Statistiques Incluses

Chaque build génère un résumé avec :

- Nombre de fichiers HTML/CSS/JS compilés
- Taille des artefacts (.exe)
- Version générée
- Durée du build
- Status final (✅ succès / ❌ échec)

---

## ✅ Bonnes Pratiques

### À Faire (DO)

- ✅ Tester localement avec `npm run pack` avant de taguer
- ✅ Utiliser des tags sémantiques (`vMAJOR.MINOR.PATCH`)
- ✅ Vérifier les logs après chaque release
- ✅ Garder le `CHANGELOG.md` à jour
- ✅ Faire des backups réguliers des données utilisateur
- ✅ Tester la mise à jour sur une machine vierge

### À Ne Pas Faire (DON'T)

- ❌ Committer `node_modules/`
- ❌ Committer `dist-release/`
- ❌ Inclure des secrets/mots de passe dans le code
- ❌ Sauter des numéros de version
- ❌ Modifier le package.json à la main (utiliser release.sh)
- ❌ Pousser directement sur `main` sans tester

### Versioning Sémantique

Utilisez [SemVer](https://semver.org/langs/fr/) :

| Type | Quand | Exemple |
|------|-------|---------|
| **PATCH** | Corrections de bugs | 3.0.0 → 3.0.1 |
| **MINOR** | Nouvelles fonctionnalités (compatible) | 3.0.0 → 3.1.0 |
| **MAJOR** | Changements cassants | 3.0.0 → 4.0.0 |

---

## 📞 Support

En cas de problème avec GitHub Actions :

1. **Vérifier les logs** : Onglet Actions → Cliquer sur le run failed
2. **Consulter ce guide** : Sections Dépannage
3. **Ouvrir une issue** : https://github.com/aimedrcongo/FINANCE/issues
4. **Documentation officielle** : 
   - [electron-builder](https://www.electron.build/)
   - [GitHub Actions](https://docs.github.com/en/actions)

---

## 📝 Changelog des Versions

### v3.0.0 (Juillet 2026)
- ✨ Refonte complète du système de build
- ✨ Intégration GitHub Actions CI/CD
- ✨ Auto-update via electron-updater
- ✨ Script de release automatisé
- 🔧 Correction bugs package.json (encodage BOM)
- 🔧 Simplification configuration Windows-only
- 📝 Documentation complète mise à jour

### v2.0.0 (Version précédente)
- Version initiale Electron
- Gestion multi-sites
- Export PDF/CSV/Excel
- Mode sombre/clair

---

*Dernière mise à jour : Juillet 2026*  
*Version du guide : 3.0*  
*Maintenu par : Pharmacie LA DIVINE Health Care*
