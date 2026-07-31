#!/bin/bash
# =====================================================
# LA DIVINE PharmaFinance Pro - Test Script
# Vérification rapide de l'application
# =====================================================

echo ""
echo " ╔════════════════════════════════════════════╗"
echo " ║  LA DIVINE PHARMAFINANCE PRO - TEST SCRIPT  ║"
echo " ╚════════════════════════════════════════════╝"
echo ""

# Couleurs pour output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
    else
        echo -e "${RED}✗${NC} $1 (MANQUANT)"
        ((ERRORS++))
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1/"
    else
        echo -e "${RED}✗${NC} $1/ (MANQUANT)"
        ((ERRORS++))
    fi
}

echo "📋 Vérification des fichiers principaux..."
echo "───────────────────────────────────────────────"
check_file "index.html"
check_file "manifest.json"
check_file "sw.js"
check_file "package.json"
check_file "README.md"

echo ""
echo "📁 Vérification des dossiers..."
echo "───────────────────────────────────────────────"
check_dir "css"
check_dir "js"
check_dir "icons"
check_dir "electron"
check_dir "build"

echo ""
echo "🎨 Vérification des fichiers CSS..."
echo "───────────────────────────────────────────────"
check_file "css/style.css"
check_file "css/innovations.css"

echo ""
echo "⚙️ Vérification des fichiers JavaScript..."
echo "───────────────────────────────────────────────"
check_file "js/db.js"
check_file "js/auth.js"
check_file "js/calculations.js"
check_file "js/export.js"
check_file "js/app.js"
check_file "js/utils.js"
check_file "js/innovations.js"

echo ""
echo "🖼️ Vérification des icônes..."
echo "───────────────────────────────────────────────"
check_file "icons/icon-72x72.png"
check_file "icons/icon-96x96.png"
check_file "icons/icon-128x128.png"
check_file "icons/icon-144x144.png"
check_file "icons/icon-152x152.png"
check_file "icons/icon-192x192.png"
check_file "icons/icon-384x384.png"
check_file "icons/icon-512x512.png"
check_file "icons/favicon.ico"

echo ""
echo "🔧 Vérification des fichiers Electron..."
echo "───────────────────────────────────────────────"
check_file "electron/main.js"
check_file "build/installer.nsh"
check_file "build.bat"
check_file "build.sh"

echo ""
echo "🔍 Analyse du HTML principal..."
echo "───────────────────────────────────────────────"

# Vérifier si login-screen existe dans index.html
if grep -q 'login-screen' index.html; then
    echo -e "${GREEN}✓${NC} Écran de connexion présent"
else
    echo -e "${RED}✗${NC} Écran de connexion manquant"
    ((ERRORS++))
fi

# Vérifier si auth.js est inclus
if grep -q 'auth.js' index.html; then
    echo -e "${GREEN}✓${NC} Système d'auth inclus"
else
    echo -e "${RED}✗${NC} Système d'auth non inclus"
    ((ERRORS++))
fi

# Vérifier si les pages utilisateurs existent
if grep -q 'page-utilisateurs' index.html; then
    echo -e "${GREEN}✓${NC} Page gestion utilisateurs présente"
else
    echo -e "${RED}✗${NC} Page gestion utilisateurs manquante"
    ((ERRORS++))
fi

if grep -q 'page-audit-log' index.html; then
    echo -e "${GREEN}✓${NC} Page journal d'audit présente"
else
    echo -e "${RED}✗${NC} Page journal d'audit manquante"
    ((ERRORS++))
fi

echo ""
echo "📊 RÉSUMÉ DU TEST"
echo "═════════════════════════════════════════════"

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║     ✅ TOUS LES TESTS RÉUSSIS!       ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo "🚀 L'application est prête à être utilisée!"
    echo ""
    echo "Pour tester l'application:"
    echo "  1. Ouvrez index.html dans un navigateur"
    echo "  OU"
    echo "  2. Lancez: python3 -m http.server 8080"
    echo "     Puis ouvrez: http://localhost:8080"
    echo ""
    echo "Identifiants de test:"
    echo "  Admin:   admin / admin2024!"
    echo "  Manager: manager_biayi / biayi2024!"
    echo "  Comptable: comptable_central / compta2024!"
    
else
    echo -e "${RED}╔════════════════════════════════════════╗${NC}"
    echo -e "${RED}║     ❌ ERREURS DÉTECTÉES: $ERRORS       ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo "Veuillez vérifier les fichiers manquants ci-dessus."
fi

echo ""
echo "═════════════════════════════════════════════"
echo ""

exit $ERRORS
