@echo off
title GATE B — CDL Backfill Validation
cd /d C:\Users\Daniel\Documents\salafull

echo ============================================
echo  GATE B — All-in-One Runner
echo ============================================
echo.

echo [1/4] Pornire Vite dev server in fereastra noua...
start "Vite Dev Server" cmd /k "npm run dev"
echo Astept 6 secunde sa porneasca...
timeout /t 6 /nobreak >nul

echo.
echo [2/4] Copiez scriptul GATE B in clipboard...
if not exist gate-b-script.js (
    echo EROARE: gate-b-script.js nu exista in folder!
    echo Asigura-te ca ai salvat fisierul gate-b-script.js in C:\Users\Daniel\Documents\salafull\
    pause
    exit /b 1
)
type gate-b-script.js | clip
echo Script copiat. Lungime:
for %%I in (gate-b-script.js) do echo    %%~zI bytes

echo.
echo [3/4] Deschid Chrome cu DevTools deschise...
start chrome --auto-open-devtools-for-tabs http://localhost:5173/salafull/

echo.
echo ============================================
echo  ACUM IN BROWSER:
echo  1. Asteapta sa se incarce app-ul
echo  2. DevTools deja deschise — click pe tab "Console"
echo  3. Ctrl+V (paste script) apoi Enter
echo  4. Asteapta sa termine (vezi "GATE B COMPLETE" sau "GATE B FAILED")
echo  5. Right-click in Console → Save as → gate-b-output.log
echo     (sau selecteaza tot output-ul cu Ctrl+A si copiaza)
echo  6. Vino aici si apasa orice tasta pentru cleanup
echo ============================================
echo.
pause

echo.
echo [4/4] Cleanup — inchid Vite dev server...
taskkill /FI "WINDOWTITLE eq Vite Dev Server*" /F >nul 2>&1
echo Done!
echo.
echo ============================================
echo  Trimite output-ul (gate-b-output.log sau paste direct) la Claude.
echo ============================================
echo.
pause
