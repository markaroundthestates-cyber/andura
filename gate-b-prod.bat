@echo off
title GATE B — CDL Backfill on PRODUCTION
cd /d C:\Users\Daniel\Documents\salafull

echo ============================================
echo  GATE B — Production GitHub Pages
echo ============================================
echo.

if not exist gate-b-script.js (
    echo EROARE: gate-b-script.js nu exista in folder!
    echo Asigura-te ca ai salvat fisierul gate-b-script.js in C:\Users\Daniel\Documents\salafull\
    pause
    exit /b 1
)

echo [1/2] Copiez scriptul GATE B in clipboard...
type gate-b-script.js | clip
for %%I in (gate-b-script.js) do echo    Script size: %%~zI bytes
echo Done.

echo.
echo [2/2] Deschid Chrome cu DevTools deschise pe PRODUCTION...
start chrome --auto-open-devtools-for-tabs https://markaroundthestates-cyber.github.io/salafull/

echo.
echo ============================================
echo  ACUM IN BROWSER:
echo  1. Asteapta sa se incarce app-ul
echo  2. HARD REFRESH: Ctrl+Shift+R (forta load build nou)
echo  3. Click pe tab "Console" in DevTools
echo  4. Daca vezi erori vechi, da Ctrl+L (clear console)
echo  5. Ctrl+V (paste script) apoi Enter
echo  6. Asteapta sa termine (vezi "GATE B COMPLETE" sau "GATE B FAILED")
echo  7. Right-click in Console → Save as → gate-b-output.log
echo  8. Sau selecteaza tot output-ul (Ctrl+A in Console area) si copy-paste in chat la Claude
echo ============================================
echo.
echo  IMPORTANT: backup-ul logurilor tale este AUTO-saved in primul console.log
echo  Daca ceva nu-ti place dupa real run, restaurezi cu:
echo    localStorage.removeItem('coach-decisions');
echo  (logs-urile originale nu sunt afectate, doar coach-decisions)
echo.
pause
