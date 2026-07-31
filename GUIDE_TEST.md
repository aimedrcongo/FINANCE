# 🚀 GUIDE DE TEST - Application LA DIVINE PharmaFinance

## 📋 PRÉ-REQUIS

### Option A : Test Local Rapide (Recommandé)

1. **Navigateur requis** : Google Chrome ou Microsoft Edge (version récente)
2. **Télécharger** le dossier `PharmaFinance-Pro`
3. **Aucune installation** nécessaire - fonctionne directement !

---

## 🔧 MÉTHODE 1 : Test avec Serveur Local (Recommandé)

### Étape 1 : Ouvrir un terminal

**Windows** :
```cmd
cd Téléchargements\PharmaFinance-Pro
```

**Mac/Linux** :
```bash
cd ~/Downloads/PharmaFinance-Pro
```

### Étape 2 : Lancer le serveur local

#### Avec Python (le plus simple) :

**Windows (Python 3)** :
```cmd
python -m http.server 8080
```

**Mac/Linux** :
```bash
python3 -m http.server 8080
```

#### Avec Node.js (alternative) :
```bash
npx serve .
```

### Étape 3 : Ouvrir l'application

Ouvrez votre navigateur et allez à :

```
http://localhost:8080
```

---

## 🌐 MÉTHODE 2 : Test Direct (Sans Serveur)

### Chrome/Edge :

1. Ouvrez le fichier `index.html` **directement** dans Chrome
2. Cliquez sur l'icône 🔒 dans la barre d'adresse
3. Les fonctionnalités offline peuvent être limitées sans serveur

### Pour tester le mode PWA complet, utilisez la Méthode 1.

---

## ✅ CHECKLIST DE TEST

### 🎨 Interface & Design

- [ ] Le logo LA DIVINE s'affiche dans la sidebar
- [ ] La couleur verte du logo est utilisée pour l'interface
- [ ] Le titre affiche "LA DIVINE PharmaFinance"
- [ ] Responsive sur mobile (redimensionnez la fenêtre)

### 💰 Fonctionnalités Core

- [ ] **Tableau de Bord** : KPIs s'affichent correctement
- [ ] **Versements** : Cliquer "+ Nouveau Versement" ouvre le formulaire
- [ ] **Dépenses** : Catégories disponibles (MOON, UNIQUE, etc.)
- [ ] **Rapport Journalier** : Calculs automatiques fonctionnent
- [ ] **Dettes** : Statuts auto (Payé/En retard/Urgent)
- [ ] **Pharmacies** : CRUD fonctionne (ajouter/modifier/supprimer)
- [ ] **Balance Mensuelle** : Synthèse par site s'affiche

### 🆕 Innovations Implémentées

#### Quick Add (Bouton Flottant) :
- [ ] Bouton **+ vert** visible en bas à droite
- [ ] Cliquez → menu avec 💰📤📝🏦
- [ ] Chaque option ouvre le bon formulaire
- [ ] Animation fluide du bouton

#### Dark Mode :
- [ ] Toggle ☀️/🌙 dans la sidebar (bas)
- [ ] Cliquez → thème sombre s'applique
- [ ] Préférence sauvegardée (rafraîchir = même thème)

#### Alertes Intelligentes :
- [ ] Icône 🔔 dans le header (à côté des sélecteurs)
- [ ] Cliquez → panneau d'alertes s'ouvre
- [ ] Alertes dettes proches échéance
- [ ] Alertes sites sans versements
- [ ] Badge avec nombre d'alertes

#### Raccourcis Clavier :
- [ ] `Ctrl+N` : Nouveau versement rapide
- [ ] `Ctrl+E` : Exporter vue courante
- [ ] `Ctrl+D` : Changer thème
- [ ] `?` : Afficher l'aide
- [ ] `Échap` : Fermer modales

### 📱 Test Mobile (Responsive)

1. **Ouvrir les DevTools** : F12 (ou Ctrl+Shift+I)
2. **Cliquer sur l'icône téléphone** (Toggle Device Toolbar) : Ctrl+Shift+M
3. **Choisir un appareil** : iPhone 12 / Pixel 5 / Galaxy S20
4. **Vérifier** :
   - [ ] Sidebar se transforme en menu hamburger
   - [ ] Tableaux scrollent horizontalement
   - [ ] Bouton FAB accessible
   - [ ] Formulaires utilisables au doigt

### 📥 Tests Export

- [ ] **Exporter** (bouton en haut à droite) génère un fichier
- [ ] **CSV** s'ouvre dans Excel
- [ ] **Backup JSON** sauvegarde toutes les données

---

## 📲 INSTALLATION PWA (Mode App)

### Étape 1 : Depuis Chrome Desktop

1. Allez sur `http://localhost:8080`
2. Attendez quelques secondes
3. **Icône d'installation** apparaît dans la barre d'adresse (⊕) ou à droite
4. **Cliquez "Installer"**
5. L'app s'installe comme une application native

### Étape 2 : Vérification Installation

- [ ] Icone LA DIVINE sur le bureau / dans le menu
- [ ] Ouvre dans une fenêtre **sans barre d'adresse**
- [ ] Fonctionne **même sans internet** après installation

### Étape 3 : Test Offline

1. **Installez** l'application PWA
2. **Utilisez-la** normalement (saisissez des données)
3. **Déconnectez internet** (mode avion)
4. **Vérifiez** :
   - [ ] L'application s'ouvre toujours
   - [ ] Données accessibles
   - [ ] Formulaires fonctionnent
   - [ ] Sauvegarde locale fonctionne

---

## 🧪 SCÉNARIOS DE TEST AVANCÉS

### Scénario 1 : Flux Versement Complet

```
1. Dashboard → Voir KPIs vides (normal, pas encore de données)
2. Pharmacies → Vérifier les 8 sites pré-configurés
3. Versements → "+" → Sélectionner BIAYI → Entrer 1000 USD + 500000 FC
4. Vérifier : Total mis à jour automatiquement
5. Dashboard → Vérifier KPIs mis à jour
6. Exporter → Fichier CSV téléchargé
```

### Scénario 2 : Gestion Dette

```
1. Dettes → "+" → Fournisseur "PHARMAFRICA SARL"
2. Montant : 5000000 FC | Échéance : dans 7 jours
3. Vérifier : Statut = "Urgent (7j)"
4. Vérifier : Alerte 🔔 affiche cette dette
5. Paiement partiel : 2000000 FC
6. Vérifier : Solde restant = 3000000 FC
```

### Scénario 3 : Dark Mode + Raccourcis

```
1. Toggle 🌙 dans la sidebar → Theme sombre
2. Ctrl+N → Formulaire versement s'ouvre
3. Remplir + Enregistrer
4. Ctrl+E → Export CSV généré
5. Ctrl+D → Retour au theme clair
6. ? → Aide raccourcis affichée
```

---

## 🐛 DÉBOGAGE

### Console Navigateur (F12)

Ouvrez la console pour voir les logs :

```
[App] Initialisation de LA DIVINE PharmaFinance...
[DB] Base de données initialisée avec succès
[Innovations] Quick Add initialisé
[Innovations] Système d'alertes initialisé
[Innovations] Thème initialisé: light
[Innovations] ✅ Tous les modules innovants sont prêts!
[App] ✅ Application LA DIVINE initialisée avec succès
```

### Problèmes Courants

| Problème | Solution |
|----------|----------|
| **Page blanche** | Vérifier console (F12) pour erreurs JS |
| **Données non sauvegardées** | Utiliser http:// pas file:// |
| **PWA ne s'installe pas** | Nécessite HTTPS ou localhost |
| **Icônes manquantes** | Vérifier dossier /icons/ présent |
| **Service Worker erreur** | Rafraîchir avec Ctrl+F5 |

---

## 📊 Performance Attendue

| Métrique | Valeur Cible |
|----------|--------------|
| Chargement initial | < 2 secondes |
| Navigation entre pages | < 300ms |
| Sauvegarde donnée | < 100ms |
| Export CSV | < 1 seconde |
| Taille totale app | ~500 Ko |

---

## ✨ TESTS VALIDATION FINALE

Cochez une fois testé avec succès :

### Fonctionnalité
- [ ] Ajout de pharmacie
- [ ] Saisie versement USD + FC
- [ ] Saisie dépense avec catégorie
- [ ] Création rapport journalier avec calculs auto
- [ ] Gestion dette avec statut auto
- [ ] Consultation balance mensuelle
- [ ] Export CSV/Excel
- [ ] Backup/Restore JSON

### UX / UI
- [ ] Navigation fluide entre pages
- [ ] Formulaires validés correctement
- [ ] Messages d'erreur clairs
- [ ] Toast notifications visibles
- [ ] Responsive mobile OK
- [ ] Dark Mode fonctionnel
- [ ] Quick Add accessible
- [ ] Alertes pertinentes

### Technique
- [ ] Pas d'erreur console
- [ ] Données persistantes (rafraîchir page)
- [ ] Offline fonctionne (après install PWA)
- [ ] Icône LA DIVINE visible
- [ ] Couleurs brand cohérentes

---

## 🎉 SUCCÈS !

Si tous les tests passent ✓, votre application est prête pour :

1. **Déploiement interne** (partager le dossier)
2. **Installation équipe** (chacun installe le PWA)
3. **Formation utilisateurs** (guide ci-dessus)
4. **Collecte feedback** (améliorations futures)

---

**Questions ? Problèmes ?** Contactez le développeur ou vérifiez la console navigateur ! 🚀
