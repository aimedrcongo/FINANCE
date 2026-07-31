#!/bin/bash
# =====================================================
# LA DIVINE PharmaFinance Pro - Build Script (Linux/Mac)
# Script de construction de l'installateur
# =====================================================

echo ""
echo " ============================================ "
echo "   LA DIVINE PHARMAFINANCE PRO - BUILD SCRIPT"
echo " ============================================ "
echo ""

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo " [ERREUR] Node.js n'est pas installé!"
    echo " Veuillez installer Node.js depuis: https://nodejs.org"
    exit 1
fi

echo " [OK] Node.js trouvé:"
node --version

# Vérifier si npm est disponible
if ! command -v npm &> /dev/null then
    echo " [ERREUR] npm n'est pas trouvé!"
    exit 1
fi

echo " [OK] npm trouvé:"
npm --version
echo ""

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo " Installation des dépendances..."
    npm install
    if [ $? -ne 0 ]; then
        echo " [ERREUR] Échec installation des dépendances"
        exit 1
    fi
fi

echo ""
echo " Choisissez l'action:"
echo " 1. Lancer en mode développement"
echo " 2. Construire pour Linux (.AppImage/.deb)"
echo " 3. Construire pour macOS (.dmg)"
echo " 4. Tout construire (Linux + Mac)"
echo " 5. Quitter"
echo ""

read -p " Votre choix (1-5): " choice

case $choice in
    1)
        echo ""
        echo " Lancement en mode développement..."
        npm run dev
        ;;
    2)
        echo ""
        echo " Construction pour Linux..."
        npm run build:linux
        if [ $? -eq 0 ]; then
            echo ""
            echo " ============================================ "
            echo " SUCCES! Les fichiers sont dans le dossier:"
            echo " dist-release/ "
            echo " ============================================ "
        else
            echo " [ERREUR] Échec de la construction"
        fi
        ;;
    3)
        echo ""
        echo " Construction pour macOS..."
        npm run build:mac
        if [ $? -eq 0 ]; then
            echo ""
            echo " ============================================ "
            echo " SUCCES! Le fichier .dmg est dans:"
            echo " dist-release/ "
            echo " ============================================ "
        else
            echo " [ERREUR] Échec de la construction"
        fi
        ;;
    4)
        echo ""
        echo " Construction complète..."
        npm run build:all
        if [ $? -eq 0 ]; then
            echo ""
            echo " ============================================ "
            echo " SUCCES! Tous les fichiers sont dans:"
            echo " dist-release/ "
            echo " ============================================ "
        else
            echo " [ERREUR] Échec de la construction"
        fi
        ;;
    5)
        echo " Au revoir!"
        exit 0
        ;;
    *)
        echo " Choix invalide"
        exit 1
        ;;
esac

echo ""
