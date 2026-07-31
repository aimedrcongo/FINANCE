#!/bin/bash
# ============================================
# LA DIVINE PharmaFinance - Script de Lancement
# Pour tester l'application PWA localement
# ============================================

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║     🏥 PHARMACIE LA DIVINE - Test App      ║"
echo "║        Gestion Financière PWA              ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Vérifier si on est dans le bon dossier
if [ ! -f "index.html" ]; then
    echo "❌ Erreur: Lancez ce script depuis le dossier de l'application"
    echo "   cd /chemin/vers/PharmaFinance-Pro && ./start.sh"
    exit 1
fi

# Trouver Python ou Node
PYTHON_CMD=""
NODE_CMD=""

if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
fi

if command -v npx &> /dev/null; then
    NODE_CMD="npx"
elif command -v node &> /dev/null; then
    NODE_CMD="node"
fi

# Choisir le serveur
PORT=8080

echo "📋 Options de lancement:"
echo ""

if [ -n "$PYTHON_CMD" ]; then
    echo "   1) Serveur Python (recommandé)"
fi

if [ -n "$NODE_CMD" ]; then
    echo "   2) Serveur Node.js"
fi

echo "   3) Annuler"
echo ""
read -p "👉 Choisissez une option [1-3]: " choice

case $choice in
    1)
        if [ -z "$PYTHON_CMD" ]; then
            echo "❌ Python non trouvé"
            exit 1
        fi
        echo ""
        echo "✅ Démarrage du serveur Python sur le port $PORT..."
        echo ""
        echo "📍 Ouvrez votre navigateur à: http://localhost:$PORT"
        echo ""
        echo "⌨️  Pour arrêter: Ctrl+C"
        echo ""
        echo "─────────────────────────────────────"
        $PYTHON_CMD -m http.server $PORT
        ;;
        
    2)
        if [ -z "$NODE_CMD" ]; then
            echo "❌ Node.js non trouvé"
            exit 1
        fi
        echo ""
        echo "✅ Démarrage du serveur Node.js sur le port $PORT..."
        echo ""
        echo "📍 Ouvrez votre navigateur à: http://localhost:$PORT"
        echo ""
        echo "⌨️  Pour arrêter: Ctrl+C"
        echo ""
        echo "─────────────────────────────────────"
        if [ "$NODE_CMD" = "npx" ]; then
            npx serve . -l $PORT
        else
            # Fallback simple avec node
            node -e "
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    let filePath = '.' + (req.url === '/' ? '/index.html' : req.url);
    const extname = path.extname(filePath);
    
    const contentTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.ico': 'image/x-icon'
    };
    
    const contentType = contentTypes[extname] || 'application/octet-stream';
    
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen($PORT, () => {
    console.log(\`Server running at http://localhost:\${$PORT}/\`);
});
"
        fi
        ;;
        
    3|*)
        echo ""
        echo "👋 Au revoir !"
        exit 0
        ;;
esac
