@echo off
REM =====================================================
REM LA DIVINE PharmaFinance Pro - Build Script (Windows)
REM Script de construction de l'installateur
REM =====================================================

echo.
echo  ============================================
echo    LA DIVINE PHARMAFINANCE PRO - BUILD SCRIPT
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
echo  Choisissez l'action:
echo  1. Lancer en mode developpement
echo  2. Construire pour Windows (.exe installer)
echo  3. Construire version portable (sans installation)
echo  4. Tout construire (Windows + Portable)
echo  5. Quitter
echo.

set /p choice="Votre choix (1-5): "

if "%choice%"=="1" goto dev
if "%choice%"=="2" goto build_win
if "%choice%"=="3" goto build_portable
if "%choice%"=="4" goto build_all
if "%choice%"=="5" goto end

:dev
echo.
echo  Lancement en mode developpement...
call npm run dev
goto end

:build_win
echo.
echo  Construction de l'installateur Windows...
call npm run build:win
if %ERRORLEVEL% EQU 0 (
    echo.
    echo  ============================================
    echo  SUCCES! L'installateur est dans le dossier:
    echo  dist-release\
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
    echo  SUCCES! La version portable est dans:
    echo  dist-release\
    echo  ============================================
) else (
    echo  [ERREUR] Echec de la construction
)
goto end

:build_all
echo.
echo  Construction complete (Windows + Portable)...
call npm run build:all
if %ERRORLEVEL% EQU 0 (
    echo.
    echo  ============================================
    echo  SUCCES! Tous les fichiers sont dans:
    echo  dist-release\
    echo  ============================================
) else (
    echo  [ERREUR] Echec de la construction
)
goto end

:end
echo.
pause
