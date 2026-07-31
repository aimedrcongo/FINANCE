#!/bin/bash

# =====================================================
# LA DIVINE PHARMAFINANCE PRO - RELEASE SCRIPT v3
# Script de création automatique de versions
# =====================================================
#
# Usage:
#   chmod +x release.sh
#   ./release.sh patch    # 3.0.0 → 3.0.1 (corrections bugs)
#   ./release.sh minor    # 3.0.0 → 3.1.0 (nouvelles features)
#   ./release.sh major    # 3.0.0 → 4.0.0 (breaking changes)
#
# Options:
#   --dry-run   : Simuler sans créer le tag
#   --push      : Pousser automatiquement (défaut)
#   --no-push   : Ne pas pousser
#   --help      : Afficher l'aide
#

set -e  # Arrêter en cas d'erreur

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/aimedrcongo/FINANCE"
PACKAGE_FILE="package.json"
CHANGELOG_FILE="CHANGELOG.md"

# Variables
VERSION_TYPE="${1:-patch}"
DRY_RUN=false
AUTO_PUSH=true

# =====================================================
# FONCTIONS
# =====================================================

print_header() {
    echo ""
    echo -e "${BLUE}╔══════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║     LA DIVINE PHARMAFINANCE PRO v3         ║${NC}"
    echo -e "${BLUE}║           Release Automation Tool          ║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════╝${NC}"
    echo ""
}

print_help() {
    print_header
    echo "Usage: ./release.sh [TYPE] [OPTIONS]"
    echo ""
    echo "Types:"
    echo "  patch     Corrections de bugs (3.0.0 → 3.0.1)"
    echo "  minor     Nouvelles fonctionnalités (3.0.0 → 3.1.0)"
    echo "  major     Changements majeurs (3.0.0 → 4.0.0)"
    echo ""
    echo "Options:"
    echo "  --dry-run  Simuler sans créer de tag"
    echo "  --no-push  Ne pas pousser sur GitHub"
    echo "  --help     Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  ./release.sh patch        # Créer v3.0.1"
    echo "  ./release.sh minor        # Créer v3.1.0"
    echo "  ./release.sh major        # Créer v4.0.0"
    echo "  ./release.sh patch --dry-run  # Simulation"
    exit 0
}

check_dependencies() {
    echo -e "${YELLOW}🔍 Vérification des dépendances...${NC}"
    
    if ! command -v git &> /dev/null; then
        echo -e "${RED}❌ Git n'est pas installé${NC}"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js n'est pas installé${NC}"
        exit 1
    fi
    
    if [ ! -f "$PACKAGE_FILE" ]; then
        echo -e "${RED}❌ package.json non trouvé${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Toutes les dépendances sont présentes${NC}"
}

get_current_version() {
    grep '"version"' $PACKAGE_FILE | head -1 | sed 's/.*: "//;s/".*//'
}

increment_version() {
    local version=$1
    local type=$2
    
    IFS='.' read -ra PARTS <<< "$version"
    
    case $type in
        major)
            NEW_VERSION="$((PARTS[0]+1)).0.0"
            ;;
        minor)
            NEW_VERSION="${PARTS[0]}.$((PARTS[1]+1)).0"
            ;;
        patch)
            NEW_VERSION="${PARTS[0]}.${PARTS[1]}.$((PARTS[2]+1))"
            ;;
        *)
            echo -e "${RED}❌ Type de version inconnue: $type${NC}"
            echo "Utilisez: patch, minor, ou major"
            exit 1
            ;;
    esac
}

update_package_json() {
    echo -e "${YELLOW}📝 Mise à jour de package.json...${NC}"
    
    # Utiliser node pour mettre à jour proprement
    node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('$PACKAGE_FILE', 'utf8'));
        pkg.version = '$NEW_VERSION';
        fs.writeFileSync('$PACKAGE_FILE', JSON.stringify(pkg, null, 2) + '\n');
        console.log('Version mise à jour:', pkg.version);
    "
    
    echo -e "${GREEN}✅ package.json mis à jour${NC}"
}

update_index_html() {
    if [ -f "index.html" ]; then
        echo -e "${YELLOW}📝 Mise à jour de index.html...${NC}"
        
        # Remplacer la version dans login-version
        sed -i "s/v[0-9]*\.[0-9]* - Gestion/v$NEW_VERSION - Gestion/" index.html
        
        echo -e "${GREEN}✅ index.html mis à jour${NC}"
    fi
}

create_changelog_entry() {
    local date=$(date +"%Y-%m-%d")
    
    if [ ! -f "$CHANGELOG_FILE" ]; then
        touch "$CHANGELOG_FILE"
    fi
    
    # Ajouter l'entrée au début du fichier
    TEMP_FILE=$(mktemp)
    
    cat > "$TEMP_FILE" << EOF
## [$NEW_VERSION] - $date

### Added
- Version $NEW_VERSION release

### Changed
- Auto-generated changelog entry

### Fixed
- Various improvements

---
EOF
    
    cat "$CHANGELOG_FILE" >> "$TEMP_FILE"
    mv "$TEMP_FILE" "$CHANGELOG_FILE"
    
    echo -e "${GREEN}✅ Changelog mis à jour${NC}"
}

create_git_tag() {
    echo -e "${YELLOW}🏷️  Création du tag git...${NC}"
    
    git add "$PACKAGE_FILE" "index.html" "$CHANGELOG_FILE" 2>/dev/null || true
    git commit -m "🚀 Release v$NEW_VERSION" || echo "(Aucun changement à committer)"
    git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"
    
    echo -e "${GREEN}✅ Tag v$NEW_VERSION créé${NC}"
}

push_to_github() {
    if [ "$AUTO_PUSH" = true ]; then
        echo -e "${YELLOW}📤 Poussage vers GitHub...${NC}"
        
        git push origin main
        git push origin "v$NEW_VERSION"
        
        echo -e "${GREEN}✅ Code et tag poussés sur GitHub${NC}"
        echo ""
        echo -e "${BLUE}🚀 GitHub Actions va maintenant:${NC}"
        echo "   • Build l'application Windows (.exe)"
        echo "   • Créer une nouvelle Release"
        echo "   • Publier les artefacts"
        echo ""
        echo -e "${BLUE}📍 Suivez le progrès ici:${NC}"
        echo "   ${REPO_URL}/actions"
    else
        echo -e "${YELLOW}⏭️  Push désactivé. Pour pousser manuellement:${NC}"
        echo "   git push origin main"
        echo "   git push origin v$NEW_VERSION"
    fi
}

display_summary() {
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║           ✅ RELEASE PRÊTE !               ║${NC}"
    echo -e "${GREEN}╠══════════════════════════════════════════════╣${NC}"
    echo -e "${GREEN}║                                          ║${NC}"
    printf "${GREEN}║  Version : %-30s ║\n" "$CURRENT → $NEW_VERSION"
    printf "${GREEN}║  Type    : %-30s ║\n" "$VERSION_TYPE"
    printf "${GREEN}║  Tag     : %-30s ║\n" "v$NEW_VERSION"
    echo -e "${GREEN}║                                          ║${NC}"
    echo -e "${GREEN}║  Prochaine étape:                        ║${NC}"
    echo -e "${GREEN}║  Attendez ~10 min que GitHub Actions       ║${NC}"
    echo -e "${GREEN}║  build votre .exe                         ║${NC}"
    echo -e "${GREEN}║                                          ║${NC}"
    echo -e "${GREEN}║  Téléchargement:                          ║${NC}"
    printf "${GREEN}║  %-38s ║\n" "$REPO_URL/releases/tag/v$NEW_VERSION"
    echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"
    echo ""
}

# =====================================================
# MAIN
# =====================================================

main() {
    print_header
    
    # Parser les arguments
    for arg in "$@"; do
        case $arg in
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --no-push)
                AUTO_PUSH=false
                shift
                ;;
            --help|-h)
                print_help
                ;;
            *)
                VERSION_TYPE=$arg
                shift
                ;;
        esac
    done
    
    # Vérifications
    check_dependencies
    
    # Récupérer la version actuelle
    CURRENT=$(get_current_version)
    echo -e "${BLUE}📌 Version actuelle: ${CURRENT}${NC}"
    echo -e "${BLUE}📌 Type de release: ${VERSION_TYPE}${NC}"
    echo ""
    
    # Calculer la nouvelle version
    increment_version "$CURRENT" "$VERSION_TYPE"
    
    echo -e "${YELLOW}🆕 Nouvelle version: ${NEW_VERSION}${NC}"
    echo ""
    
    # Confirmation
    if [ "$DRY_RUN" = true ]; then
        echo -e "${YELLOW}⚠️  MODE SIMULATION (aucun changement effectué)${NC}"
        display_summary
        exit 0
    fi
    
    read -p "Confirmer la création de v$NEW_VERSION ? (y/N) " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}❌ Annulé${NC}"
        exit 0
    fi
    
    # Exécuter les étapes
    update_package_json
    update_index_html
    create_changelog_entry
    create_git_tag
    push_to_github
    
    # Résumé final
    display_summary
}

# Lancer
main "$@"
