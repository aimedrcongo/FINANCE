; LA DIVINE PharmaFinance Pro v3 - NSIS Installer Script
; Custom installer with branding - Version 3.0.0

!include "MUI2.nsh"

; General settings
Name "LA DIVINE PharmaFinance Pro v3"
OutFile "..\dist-release\LA-DIVINE-PharmaFinance-Setup.exe"
InstallDir "$PROGRAMFILES\LA DIVINE\PharmaFinance Pro"
InstallDirRegKey HKCU "Software\LA DIVINE\PharmaFinance Pro" ""
RequestExecutionLevel admin

; NOTE: VIProductVersion is auto-added by electron-builder
; Do NOT define it here to avoid "already defined" error!

; Version keys (without VIProductVersion)
VIAddVersionKey "ProductName" "LA DIVINE PharmaFinance Pro"
VIAddVersionKey "CompanyName" "Pharmacie LA DIVINE Health Care"
VIAddVersionKey "LegalCopyright" "© 2024-2026 Pharmacie LA DIVINE Health Care"
VIAddVersionKey "FileDescription" "Gestion Financière Multi-sites v3"
VIAddVersionKey "FileVersion" "3.0.0.0"

; Interface settings
!define MUI_ICON "..\icons\icon-256x256.png"
!define MUI_UNICON "..\icons\icon-256x256.png"

; Pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "..\LICENSE"
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

; Language
!insertmacro MUI_LANGUAGE "French"

; Installer sections
Section "Installation Principale" SecMain
    SetOutPath $INSTDIR
    
    ; Copy application files
    File /r "..\app\*.*"
    
    ; Create shortcuts
    CreateDirectory "$SMPROGRAMS\LA DIVINE"
    CreateShortCut "$SMPROGRAMS\LA DIVINE\PharmaFinance Pro.lnk" "$INSTDIR\LA DIVINE PharmaFinance Pro.exe" "" "$INSTDIR\resources\app\icons\icon-256x256.png" 0
    CreateShortCut "$DESKTOP\LA DIVINE PharmaFinance Pro.lnk" "$INSTDIR\LA DIVINE PharmaFinance Pro.exe" "" "$INSTDIR\resources\app\icons\icon-256x256.png" 0
    
    ; Write uninstaller
    WriteUninstaller "$INSTDIR\Uninstall.exe"
    
    ; Registry entries for Add/Remove Programs
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\PharmaFinancePro" \
                     "DisplayName" "LA DIVINE PharmaFinance Pro v3"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\PharmaFinancePro" \
                     "UninstallString" "$\"$INSTDIR\Uninstall.exe$""
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\PharmaFinancePro" \
                     "DisplayIcon" "$INSTDIR\resources\app\icons\icon-256x256.png"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\PharmaFinancePro" \
                     "Publisher" "Pharmacie LA DIVINE Health Care"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\PharmaFinancePro" \
                     "DisplayVersion" "3.0.0"
    WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\PharmaFinancePro" \
                      "NoModify" 1
    WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\PharmaFinancePro" \
                      "NoRepair" 1
SectionEnd

; Uninstaller section
Section "Uninstall"
    ; Remove files and folders
    RMDir /r $INSTDIR
    
    ; Remove shortcuts
    Delete "$SMPROGRAMS\LA DIVINE\PharmaFinance Pro.lnk"
    Delete "$DESKTOP\LA DIVINE PharmaFinance Pro.lnk"
    RMDir "$SMPROGRAMS\LA DIVINE"
    
    ; Remove registry keys
    DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\PharmaFinancePro"
    DeleteRegKey HKCU "Software\LA DIVINE\PharmaFinance Pro"
SectionEnd
