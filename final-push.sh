#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  LA DIVINE PHARMAFINANCE PRO - SCRIPT DE PUSH GITHUB
#  Exécutez ce script pour pousser votre projet sur GitHub
# ═══════════════════════════════════════════════════════════════

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║     🚀 LA DIVINE PharmaFinance Pro - Push GitHub      ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

cd /home/z/my-project/pharma-finance-app

echo "📍 Dossier: $(pwd)"
echo ""

# Vérifier si git est initialisé
if [ ! -d ".git" ]; then
    echo "❌ Erreur: Repository Git non trouvé!"
    echo "   Veuillez d'abord exécuter le script push-to-github.sh"
    exit 1
fi

# Vérifier le remote
REMOTE=$(git remote get-url origin 2>/dev/null)
if [ -z "$REMOTE" ]; then
    echo "❌ Erreur: Remote GitHub non configuré!"
    exit 1
fi

echo "🔗 Remote: $REMOTE"
echo ""
echo "📦 Dernier commit:"
git log --oneline -1
echo ""

# Demander confirmation
read -p "✨ Voulez-vous pousser vers GitHub? (o/n): " confirm

if [[ $confirm =~ ^[oOyY]$ ]]; then
    echo ""
    echo "⏳ Push en cours..."
    echo "───────────────────────────────────────────────"
    
    git push -u origin main
    
    EXIT_CODE=$?
    
    if [ $EXIT_CODE -eq 0 ]; then
        echo ""
        echo "╔════════════════════════════════════════════╗"
        echo "║     ✅ SUCCÈS! Projet poussé sur GitHub!    ║"
        echo "╚════════════════════════════════════════════╝"
        echo ""
        echo "🌐 Votre repository: https://github.com/aimedrcongo/FINANCE"
        echo ""
        echo "📊 Fichiers envoyés:"
        git ls-files | wc -l
        echo "   fichiers"
        
    else
        echo ""
        echo "❌ Erreur lors du push (code: $EXIT_CODE)"
        echo ""
        echo "Causes possibles:"
        echo "  • Mauvais identifiants GitHub"
        echo "  • Pas de connexion internet"
        echo "  • Token expiré ou invalide"
        echo ""
        echo "Solution:"
        echo "  1. Créez un token: https://github.com/settings/tokens"
        echo "  2. Réexécutez ce script"
        echo "  3. Entrez: username + token comme password"
    fi
else
    echo "❌ Annulé. Aucun changement effectué."
fi

echo ""
