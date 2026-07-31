@echo off
chcp 65001 >nul
title LA DIVINE PharmaFinance Pro v3.0 - Installateur Windows
color 0A

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║     🏥 LA DIVINE PHARMAFINANCE PRO v3.0                  ║
echo ║     Installateur Automatique Windows                     ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

:: Vérifier admin
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ ERREUR: Veuillez exécuter ce script en ADMINISTRATEUR
    echo    → Clic droit sur ce fichier → Exécuter en tant qu'administrateur
    pause
    exit /b 1
)
echo ✅ Administration: OK
echo.

:: Vérifier Node.js
where node >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ Node.js n'est PAS installé!
    echo.
    echo 🔧 Installation requise:
    echo    1. Ouvrez: https://nodejs.org
    echo    2. Téléchargez la version LTS (bouton vert)
    echo    3. Installez puis RELANCEZ ce script
    echo.
    start https://nodejs.org
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
echo ✅ Node.js: %NODE_VER%
echo.

:: Vérifier npm
where npm >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ npm non trouvé
    pause
    exit /b 1
)

:: Autoriser PowerShell scripts
echo ⏳ Configuration de PowerShell...
powershell -Command "Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force" >nul 2>&1
echo ✅ PowerShell configuré
echo.

:: Dossier du script
cd /d "%~dp0"
echo 📂 Dossier courant: %CD%
echo.

:: Installation des dépendances
echo ══════════════════════════════════════════════════════
echo 📦 INSTALLATION DES DÉPENDANCES
echo ══════════════════════════════════════════════════════
echo.
echo ⏳ Cela peut prendre 3-5 minutes...
echo    (téléchargement d'Electron ~100MB)
echo.

call npm install

if %errorLevel% neq 0 (
    echo.
    echo ❌ Erreur lors de npm install
    pause
    exit /b 1
)

echo.
echo ✅ Dépendances installées!
echo.

:: Build du .exe
echo ══════════════════════════════════════════════════════
echo 🚀 CRÉATION DE L'INSTALLATEUR (.exe)
echo ══════════════════════════════════════════════════════
echo.
echo ⏳ Construction en cours...
echo    Patience: 5-10 minutes selon votre PC
echo.

call npm run build:win

if %errorLevel% neq 0 (
    echo.
    echo ⚠️  Erreur de build, tentative alternative...
    call npx electron-builder --win
)

echo.
echo ══════════════════════════════════════════════════════
if exist "dist-release\LA DIVINE PharmaFinance Pro-Setup-3.0.0.exe" (
    echo ✅✅✅ SUCCÈS! L'installateur a été créé! ✅✅✅
    echo ══════════════════════════════════════════════════════
    echo.
    echo 📁 Fichier généré:
    echo    dist-release\LA DIVINE PharmaFinance Pro-Setup-3.0.0.exe
    echo.
    echo 🚀 Ouverture du dossier...
    explorer dist-release
) else (
    echo ⚠️  Le fichier .exe n'a pas été trouvé dans dist-release/
    echo.
    echo 🔧 Alternatives:
    echo    1. Lancez: npm start   (pour tester sans installer)
    echo    2. Vérifiez les erreurs ci-dessus
)

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  IDENTIFIANTS DE CONNEXION                                ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║  Admin:        admin / admin2024!                       ║
echo ║  Manager:      manager_biayi / biayi2024!               ║
echo ║  Comptable:   comptable_central / compta2024!          ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
pause
