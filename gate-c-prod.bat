@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul

REM ═══════════════════════════════════════════════════════════════════
REM GATE C — Live Integration Test pentru CDL (TASK #30.4 + #30.5)
REM Validează: proposed write din coachDirector + outcome population din endSession/cancelWorkout
REM Production: https://markaroundthestates-cyber.github.io/salafull/
REM ═══════════════════════════════════════════════════════════════════

set VAULT_DIR=C:\Users\Daniel\Documents\salafull
set AUDIT_DIR=%VAULT_DIR%\07-sessions-log
set PROD_URL=https://markaroundthestates-cyber.github.io/salafull/

REM Datestamp YYYY-MM-DD (works pentru locale RO + EN Windows)
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value ^| find "="') do set DT=%%I
set DATESTAMP=%DT:~0,4%-%DT:~4,2%-%DT:~6,2%

set AUDIT_FILE=%AUDIT_DIR%\gate-c-%DATESTAMP%.json
set CHECKLIST_FILE=%AUDIT_DIR%\gate-c-%DATESTAMP%-checklist.md

cd /d "%VAULT_DIR%"

echo.
echo ═══════════════════════════════════════════════════════════════════
echo GATE C — CDL Live Integration Test (TASK #30.4 + #30.5)
echo ═══════════════════════════════════════════════════════════════════
echo.
echo Vault:        %VAULT_DIR%
echo Audit dir:    %AUDIT_DIR%
echo Audit file:   gate-c-%DATESTAMP%.json
echo Checklist:    gate-c-%DATESTAMP%-checklist.md
echo Production:   %PROD_URL%
echo.
echo Verificări:
echo   [1] Happy path        — full session flow, proposed + outcome populated
echo   [2] Cancel flow       — outcome.executed = false
echo   [3] Idempotency       — refresh ×3 in 4h = 1 active entry
echo   [4] Context change    — readiness delta greater 20 = superseded chain
echo   [5] Schema drift      — actualDurationMins in ADR 011 schema?
echo   [6] 30.4 retroactive  — entries au proposed real (synthetic = false)
echo.
pause

REM ═══════════════════════════════════════════════════════════════════
REM PASUL 1 — Pre-flight: verify deploy live + git status clean
REM ═══════════════════════════════════════════════════════════════════
echo.
echo ═══════════════════════════════════════════════════════════════════
echo [1/8] Pre-flight: git status + last commits
echo ═══════════════════════════════════════════════════════════════════
echo.
git status --short
if errorlevel 1 (
    echo.
    echo EROARE: git status failed. Verifică manual.
    pause
    exit /b 1
)
echo.
echo Last 5 commits:
git log --oneline -5
echo.
echo Verifică: ar trebui să vezi 1b32079 ^(impl 30.5^) si e89f0a4 ^(queue 30.5^).
echo.
pause

REM ═══════════════════════════════════════════════════════════════════
REM PASUL 2 — Tag safety înainte de orice manipulare CDL în production
REM ═══════════════════════════════════════════════════════════════════
echo.
echo ═══════════════════════════════════════════════════════════════════
echo [2/8] Safety tag pre-GATE-C
echo ═══════════════════════════════════════════════════════════════════
echo.
git tag -d pre-gate-c-%DATESTAMP% 2>nul
git tag pre-gate-c-%DATESTAMP%
git push origin pre-gate-c-%DATESTAMP% 2>nul
echo Safety tag creat: pre-gate-c-%DATESTAMP%
echo.
pause

REM ═══════════════════════════════════════════════════════════════════
REM PASUL 3 — Open production în Chrome incognito (clean state)
REM ═══════════════════════════════════════════════════════════════════
echo.
echo ═══════════════════════════════════════════════════════════════════
echo [3/8] Deschid Chrome incognito pe production
echo ═══════════════════════════════════════════════════════════════════
echo.
echo IMPORTANT: incognito = fresh state, fără cache vechi.
echo După ce se deschide:
echo   - Apasă F12 ^(deschide DevTools^)
echo   - Du-te la tab CONSOLE
echo   - Lasă DevTools deschis pentru toate verificările
echo.
start chrome --incognito "%PROD_URL%"
timeout /t 3 /nobreak >nul
echo.
pause

REM ═══════════════════════════════════════════════════════════════════
REM PASUL 4 — Test 1: Happy path
REM ═══════════════════════════════════════════════════════════════════
echo.
echo ═══════════════════════════════════════════════════════════════════
echo [4/8] TEST 1 — Happy path ^(full session flow^)
echo ═══════════════════════════════════════════════════════════════════
echo.
echo Pași în app:
echo   a^) Set readiness ^(orice valoare, ex 75^)
echo   b^) Click "START SESSION"
echo   c^) Marchează 2-3 seturi pe primul exercițiu ^(orice greutate^)
echo   d^) Click "End Session" ^(sau termină exercițiile^)
echo.
echo Apoi în DevTools Console, paste această comandă:
echo.
echo   JSON.parse^(localStorage.getItem^('coach-decisions'^) ^|^| '[]'^).filter^(e =^> e.date === new Date^(^).toISOString^(^).slice^(0,10^)^)
echo.
echo Verifică:
echo   - Există minim 1 entry pentru today
echo   - entry.synthetic === false
echo   - entry.proposed populated ^(sessionType, exercises, rationale^)
echo   - entry.outcome populated ^(executed: true, deviation: false, matchScore: number, completedAt: ts^)
echo   - entry.superseded === false
echo.
echo Dacă OK → continuă. Dacă NOK → notează ce lipsește, apasă orice tastă, raportăm la final.
echo.
pause

REM ═══════════════════════════════════════════════════════════════════
REM PASUL 5 — Test 2: Cancel flow
REM ═══════════════════════════════════════════════════════════════════
echo.
echo ═══════════════════════════════════════════════════════════════════
echo [5/8] TEST 2 — Cancel flow
echo ═══════════════════════════════════════════════════════════════════
echo.
echo NOTE: Today are deja entry cu outcome populated ^(immutable^).
echo Cancel flow va încerca să populate outcome a doua oară pe acelasi entry → 
echo va trigger console.error ^"already populated^" GUARD ^(asta e CORECT, immutability rule^).
echo.
echo Pentru a testa cancel real cu outcome populate, trebuie entry curat. Opțiuni:
echo   A^) Skip Test 2 ^(immutability protejează deja^) → confirmă în Console că vezi error log
echo   B^) Force fresh state: Console → localStorage.clear^(^); location.reload^(^); apoi repetă cu cancel
echo.
echo Recomandare: alegi B pentru test complet.
echo.
echo Dacă alegi B, după reload:
echo   a^) Set readiness ^(orice valoare^)
echo   b^) Click "START SESSION"
echo   c^) Click "Cancel Workout" ^(sau echivalent^)
echo   d^) Confirmă cancel
echo.
echo Apoi în Console:
echo.
echo   JSON.parse^(localStorage.getItem^('coach-decisions'^) ^|^| '[]'^).filter^(e =^> e.date === new Date^(^).toISOString^(^).slice^(0,10^)^)
echo.
echo Verifică:
echo   - entry.outcome.executed === false
echo   - entry.outcome.actualSessionType === null
echo   - entry.outcome.matchScore === null
echo   - entry.outcome.completedAt === number ^(timestamp^)
echo.
pause

REM ═══════════════════════════════════════════════════════════════════
REM PASUL 6 — Test 3: Idempotency
REM ═══════════════════════════════════════════════════════════════════
echo.
echo ═══════════════════════════════════════════════════════════════════
echo [6/8] TEST 3 — Idempotency ^(refresh ×3 în 4h^)
echo ═══════════════════════════════════════════════════════════════════
echo.
echo Pași:
echo   a^) În app: localStorage.clear^(^); location.reload^(^); ^(pentru clean state^)
echo   b^) Set readiness ^(orice valoare, NU schimba după^)
echo   c^) Așteaptă coachDirector să ruleze ^(builddSession automat la idle^)
echo   d^) Refresh ^(F5^) de 3 ori, fără să schimbi readiness
echo.
echo Apoi în Console:
echo.
echo   JSON.parse^(localStorage.getItem^('coach-decisions'^) ^|^| '[]'^).filter^(e =^> !e.superseded ^&^& e.date === new Date^(^).toISOString^(^).slice^(0,10^)^).length
echo.
echo Verifică:
echo   - Rezultat === 1 ^(un singur active entry pentru today^)
echo   - NU 3 sau 4 ^(asta înseamnă idempotency rupt^)
echo.
pause

REM ═══════════════════════════════════════════════════════════════════
REM PASUL 7 — Test 4: Context change → supersede chain
REM ═══════════════════════════════════════════════════════════════════
echo.
echo ═══════════════════════════════════════════════════════════════════
echo [7/8] TEST 4 — Context change ^(readiness delta greater 20^)
echo ═══════════════════════════════════════════════════════════════════
echo.
echo Pași:
echo   a^) NU clear localStorage. Pleacă de la state-ul existent ^(idempotency entry^).
echo   b^) Schimbă readiness cu mai mult de 20 puncte ^(ex: dacă era 75, pune 50 sau 95^)
echo   c^) Trigger rebuild ^(navighează în app sau refresh^)
echo.
echo Apoi în Console:
echo.
echo   const all = JSON.parse^(localStorage.getItem^('coach-decisions'^) ^|^| '[]'^).filter^(e =^> e.date === new Date^(^).toISOString^(^).slice^(0,10^)^);
echo   console.log^('Total entries:', all.length^);
echo   console.log^('Superseded:', all.filter^(e =^> e.superseded^).length^);
echo   console.log^('Active:', all.filter^(e =^> !e.superseded^).length^);
echo   console.log^('Latest active supersedes:', all.find^(e =^> !e.superseded^)?.supersedes^);
echo.
echo Verifică:
echo   - Total entries === 2 ^(sau mai mult, dacă au fost mai multe rebuild-uri^)
echo   - Superseded greater equal 1
echo   - Active === 1
echo   - Latest active are .supersedes apuntând la primul entry id
echo.
pause

REM ═══════════════════════════════════════════════════════════════════
REM PASUL 8 — Dump audit JSON
REM ═══════════════════════════════════════════════════════════════════
echo.
echo ═══════════════════════════════════════════════════════════════════
echo [8/8] Dump audit JSON ^(pentru vault audit trail^)
echo ═══════════════════════════════════════════════════════════════════
echo.
echo În Console, rulează:
echo.
echo   copy^(JSON.stringify^(JSON.parse^(localStorage.getItem^('coach-decisions'^) ^|^| '[]'^), null, 2^)^)
echo.
echo ^(asta copiază JSON formatat în clipboard^)
echo.
echo Apoi paste într-un fișier nou:
echo   %AUDIT_FILE%
echo.
echo Sau alternativ în Console:
echo.
echo   console.log^(JSON.stringify^(JSON.parse^(localStorage.getItem^('coach-decisions'^) ^|^| '[]'^), null, 2^)^);
echo.
echo Și copy manual din Console output.
echo.
pause

REM ═══════════════════════════════════════════════════════════════════
REM Generate checklist file pentru raport
REM ═══════════════════════════════════════════════════════════════════
echo.
echo Generez checklist file...
echo.

(
echo # GATE C — CDL Live Integration Test
echo.
echo **Date:** %DATESTAMP%
echo **Production:** %PROD_URL%
echo **Tasks validated:** TASK #30.4 ^(coachDirector proposed write^) + TASK #30.5 ^(endSession/cancelWorkout outcome population^)
echo **Safety tag:** pre-gate-c-%DATESTAMP%
echo.
echo ## Results
echo.
echo ^| Test ^| Status ^| Notes ^|
echo ^|---^|---^|---^|
echo ^| 1. Happy path ^(full flow^) ^| ⬜ PASS / ⬜ FAIL ^| ^|
echo ^| 2. Cancel flow ^(executed=false^) ^| ⬜ PASS / ⬜ FAIL / ⬜ SKIP ^| ^|
echo ^| 3. Idempotency ^(1 active entry after 3 refreshes^) ^| ⬜ PASS / ⬜ FAIL ^| ^|
echo ^| 4. Context change ^(supersede chain^) ^| ⬜ PASS / ⬜ FAIL ^| ^|
echo ^| 5. Schema drift ^(actualDurationMins^) ^| ⬜ IN ADR / ⬜ DRIFT ^| ^|
echo ^| 6. 30.4 retroactive ^(synthetic=false on real entries^) ^| ⬜ PASS / ⬜ FAIL ^| ^|
echo.
echo ## Audit JSON
echo.
echo See `gate-c-%DATESTAMP%.json` în acest folder.
echo.
echo ## Issues found
echo.
echo - 
echo.
echo ## Decision
echo.
echo - [ ] GATE C PASSED — proceed to TASK #30.6
echo - [ ] GATE C FAILED — fix required, do NOT proceed
echo.
echo ## Notes
echo.
echo - 
) > "%CHECKLIST_FILE%"

echo Checklist generat: %CHECKLIST_FILE%
echo.

REM ═══════════════════════════════════════════════════════════════════
REM Open audit dir + checklist pentru completare
REM ═══════════════════════════════════════════════════════════════════
echo Deschid folder audit + checklist pentru completare...
echo.
start "" explorer "%AUDIT_DIR%"
timeout /t 2 /nobreak >nul
start "" notepad "%CHECKLIST_FILE%"

echo.
echo ═══════════════════════════════════════════════════════════════════
echo GATE C END
echo ═══════════════════════════════════════════════════════════════════
echo.
echo NEXT:
echo   1. Completează checklist file ^(pass/fail per test^)
echo   2. Salvează JSON dump ca gate-c-%DATESTAMP%.json
echo   3. Raport în chat Claude format scurt:
echo.
echo      [GATE C — %DATESTAMP%]
echo      Test 1 happy path: ✅/❌
echo      Test 2 cancel: ✅/❌/SKIP
echo      Test 3 idempotency: ✅/❌
echo      Test 4 context change: ✅/❌
echo      Schema drift actualDurationMins: IN_ADR / DRIFT
echo      Issues: NONE / ^<description^>
echo      Decision: PASS / FAIL
echo.
echo   4. Dacă PASS → mergem la TASK #30.6
echo   5. Dacă FAIL → fix prompt next, NU 30.6
echo.
pause
endlocal
