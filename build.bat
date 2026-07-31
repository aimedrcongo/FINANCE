@echo off
REM =====================================================
REM LA DIVINE PharmaFinance Pro v3 - Build Script (Windows)
REM Script de construction de l'installateur
REM Version: 3.0.0 - Juillet 2026
REM =====================================================

echo.
echo  ============================================
echo    LA DIVINE PHARMAFINANCE PRO v3 - BUILD
echo  ============================================
echo.

REM Vérifier si Node.js est installé
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo  [ERREUR] Node.js n'est pas installe!
    echo  Veuillez installer Node.js depuis: https://nodejs.org
    pause
    exit /b 1
)

echo  [OK] Node.js trouve: 
node --version

REM Vérifier si npm est disponible
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo  [ERREUR] npm n'est pas trouve!
    pause
    exit /b 1
)

echo  [OK] npm trouve:
npm --version
echo.

REM Installer les dependances si necessaire
if not exist "node_modules" (
    echo  Installation des dependances...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo  [ERREUR] Echec installation des dependances
        pause
        exit /b 1
    )
)

echo.
echo  ============================================
echo     PHARMAFINANCE PRO v3 - MENU BUILD
echo  ============================================
echo.
echo  Choisissez l'action:
echo.
echo  [1] Lancer en mode developpement
echo  [2] Construire pour Windows (.exe installer)
echo  [3] Construire version portable (sans installation)
echo  [4] Tout construire (Windows + Portable)
echo  [5] Nettoyer et rebuild complet
echo  [6] Verifier la version actuelle
echo  [7] Creer une nouvelle release (git tag)
echo  [8] Quitter
echo.

set /p choice="Votre choix (1-8): "

if "%choice%"=="1" goto dev
if "%choice%"=="2" goto build_win
if "%choice%"=="3" goto build_portable
if "%choice%"=="4" goto build_all
if "%choice%"=="5" goto clean_build
if "%choice%"=="6" goto check_version
if "%choice%"=="7" goto create_release
if "%choice%"=="8" goto end

:dev
echo.
echo  Lancement en mode developpement...
call npm start
goto end

:build_win
echo.
echo  Construction de l'installateur Windows...
call npm run build:win
if %ERRORLEVEL% EQU 0 (
    echo.
    echo  ============================================
    echo   SUCCES! L'installateur est dans:
    echo   dist-release\
    echo.
    echo   Fichiers generes:
    dir /b dist-release\*.exe 2>nul
    echo  ============================================
) else (
    echo  [ERREUR] Echec de la construction
)
goto end

:build_portable
echo.
echo  Construction de la version portable...
call npm run build:portable
if %ERRORLEVEL% EQU 0 (
    echo.
    echo  ============================================
    echo   SUCCES! La version portable est dans:
    echo   dist-release\
    echo  ============================================
) else (
    echo  [ERREUR] Echec de la construction
)
goto end

:build_all
echo.
echo  Construction complete (Windows + Portable)...
call npm run build:win
if %ERRORLEVEL% EQU 0 (
    call npm run build:portable
)
if %ERRORLEVEL% EQU 0 (
    echo.
    echo  ============================================
    echo   SUCCES! Tous les fichiers sont dans:
    echo   dist-release\
    echo.
    echo   Contenu du dossier:
    dir /b dist-release\
    echo  ============================================
) else (
    echo  [ERREUR] Echec de la construction
)
goto end

:clean_build
echo.
echo  Nettoyage complet...
if exist "node_modules" rmdir /s /q node_modules
if exist "dist-release" rmdir /s /q dist-release
if exist "package-lock.json" del package-lock.json
echo  [OK] Dossiers nettoyes
echo.
echo  Reinstallation des dependances...
call npm install
echo.
echo  Relancez ce script et choisissez [2], [3] ou [4]
goto end

:check_version
echo.
echo  ============================================
echo      INFORMATION VERSION
echo  ============================================
echo.
for /f "tokens=*" %%i in ('node -p "require('./package.json').version"') do set VER=%%i
echo  Version package.json: %VER%
echo.
for /f %%i in ('node -p "require('./package.json').name"') do set NAME=%%i
echo  Nom du projet: %NAME%
echo.
for /f %%i in ('node -p "require('./package.json').description"') do set DESC=%%i
echo  Description: %DESC%
echo.
echo  Fichier exe genere:
echo  %NAME%-Setup-v%VER%.exe
echo  ============================================
goto end

:create_release
echo.
echo  ============================================
echo      CREATION DE RELEASE
echo  ============================================
echo.
echo  Cette option va:
echo  1. Incrementer le numero de version
echo  2. Committer les changements
echo  3. Creer un tag git
echo  4. Pousser sur GitHub (declenche CI/CD)
echo.
set /p release_type="Type de release (patch/minor/major): 
if "%release_type%"=="" set release_type=patch
echo.
echo  Creation d'une release %release_type%...
echo.
REM Appeler le script release.sh si disponible, sinon instructions manuelles
if exist "release.sh" (
    echo  Utilisation du script release.sh...
    call release.sh %release_type%
) else (
    echo  Script release.sh non trouve.
    echo.
    echo  Instructions manuelles:
    echo  1. Editez package.json et incrementez la version
    echo  2. git add .
    echo  3. git commit -m "Release vNOUVELLE_VERSION"
    echo  4. git tag vNOUVELLE_VERSION
    echo  5. git push origin main --tags
)
goto end

:end
echo.
pause
