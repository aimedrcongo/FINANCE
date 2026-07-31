#!/bin/bash
# Script pour pousser le projet PharmaFinance sur GitHub

cd /home/z/my-project/pharma-finance-app

echo "📍 Dossier courant: $(pwd)"
echo ""

# 1. Initialiser Git
echo "📦 Initialisation du repository Git..."
git init

# 2. Créer .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
package-lock.json

# Build outputs
dist-release/
dist/
out/

# Logs
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db
desktop.ini

# IDE
.idea/
.vscode/
*.swp
*.swo

# Env files
.env
.env.local
.env.*.local

# Temporary files
*.tmp
*.temp
.cache/

# Electron
release/
EOF

# 3. Ajouter tous les fichiers
echo "📁 Ajout des fichiers..."
git add .

# 4. Commit
echo "💾 Création du commit..."
git commit -m "🚀 LA DIVINE PharmaFinance Pro v2.0 - Release complète

✅ Nouvelles fonctionnalités:
- Système d'authentification multi-rôles (Admin/Manager/Comptable)
- Gestion des utilisateurs avec permissions granulaires
- Journal d'audit complet (traçabilité)
- Écran de connexion professionnel avec logo LA DIVINE
- Packaging Electron (.exe/.dmg/.AppImage) prêt

📦 Modules inclus:
- Dashboard KPIs en temps réel
- Versements (FC + USD)
- Rapport Journalier avec auto-calculs
- Dépenses (17 catégories)
- Livre de Comptes
- Dettes Fournisseurs
- Balance Mensuelle
- Gestion 8 Pharmacies
- Export CSV/Excel/PDF/JSON

🎨 Design:
- Charte graphique LA DIVINE officielle
- Responsive mobile-first
- Mode offline PWA complet
- Dark mode préparé

👥 Utilisateurs par défaut:
- admin / admin2024! (Administrateur)
- manager_biayi / biayi2024! (Manager BIAYI)
- comptable_central / compta2024! (Comptable)

© 2024 Pharmacie LA DIVINE Health Care"

# 5. Ajouter le remote GitHub
echo "🔗 Configuration du remote GitHub..."
git remote add origin https://github.com/aimedrcongo/FINANCE.git

# 6. Renommer la branche en main
git branch -M main

echo ""
echo "═════════════════════════════════════════════"
echo " ✅ PRÊT À POUSSER!"
echo "═════════════════════════════════════════════"
echo ""
echo " Repository: https://github.com/aimedrcongo/FINANCE.git"
echo " Branch: main"
echo ""
echo " Pour pousser, exécutez:"
echo "   git push -u origin main"
echo ""
