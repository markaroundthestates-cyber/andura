Implementează TASK #31.7 — fix CI broken pe Node 22 (--no-webstorage incompatible).

CONTEXT: Commit 32825d4 a adăugat `execArgv: ['--no-webstorage']` în vitest.config.js anticipând Node 25 + Vitest 4. Realitate: CI rulează Node 22.22.2 (per .github/workflows), Vitest e 3.2.4. Flag-ul `--no-webstorage` e necunoscut pe Node 22 → CI fail "bad option" pe ultimele 26 commit-uri.

FIX: Eliminăm flag-ul. Vitest 3.2.4 + jsdom default funcționează corect fără el pe Node 18+. Local pe Node 25 funcționează identic fără flag.

═══════════════════════════════════════════════════════════════════
CITEȘTE ÎNTÂI
═══════════════════════════════════════════════════════════════════

cat vitest.config.js
cat package.json | grep -A 2 "no-webstorage"

Notează:
- Linia exactă unde apare execArgv: ['--no-webstorage'] (probabil 2 locuri — unit + integration projects)
- Comentariul din package.json care explica flag-ul

═══════════════════════════════════════════════════════════════════
PRE-FLIGHT
═══════════════════════════════════════════════════════════════════

git status # confirm working tree clean
git log -1 --oneline # confirm pe ultimul commit (30.6 done)

═══════════════════════════════════════════════════════════════════
MODIFICARE 1 — vitest.config.js
═══════════════════════════════════════════════════════════════════

Elimină din vitest.config.js TOATE liniile `execArgv: ['--no-webstorage']` (probabil 2 ocurențe, una per project în config).

Elimină și comentariul de deasupra (probabil ceva tip "// --no-webstorage disables...") dacă există — devine irelevant.

Restul config rămâne neatins.

═══════════════════════════════════════════════════════════════════
MODIFICARE 2 — package.json
═══════════════════════════════════════════════════════════════════

Dacă există în package.json comentariu sau script care referențiază --no-webstorage, elimină-l. Verifică:

grep -n "no-webstorage" package.json

Dacă apare doar în comentariu (între // sau /* */), elimină comentariul. Dacă apare într-un script (gen "test": "vitest --no-webstorage"), elimină flag-ul din script.

═══════════════════════════════════════════════════════════════════
TESTS — verifică că tests trec FĂRĂ flag
═══════════════════════════════════════════════════════════════════

npm run test:run

Expected:
- Build verde
- 384/384 tests pass (baseline post-30.6, zero regresii)
- Zero erori de localStorage / jsdom mock

GATE: Dacă orice test eșuează cu "localStorage is not defined" sau similar — STOP, raportează exact care test și mesaj. Atunci flag-ul ERA necesar și trebuie alt fix (upgrade Node CI la 24).

═══════════════════════════════════════════════════════════════════
COMMIT + PUSH
═══════════════════════════════════════════════════════════════════

git add vitest.config.js package.json
git commit -m "fix(test): remove --no-webstorage execArgv (incompatible with Node 22 CI)

- Flag was added in 32825d4 anticipating Node 25 + Vitest 4
- Reality: CI runs Node 22.22.2, Vitest 3.2.4
- Node 22 throws 'bad option: --no-webstorage' → CI fail on last 26 commits
- Vitest 3.2.4 + jsdom default works correctly without flag on Node 18+
- Tests still pass: 384/384 local
- Restores CI green (was silent fail since 32825d4)"
git push

═══════════════════════════════════════════════════════════════════
VERIFICARE POST-PUSH (Daniel manual, NU Sonnet)
═══════════════════════════════════════════════════════════════════

Daniel verifică pe https://github.com/markaroundthestates-cyber/salafull/actions:
- Ultimul CI run (cel triggered de commit-ul ăsta) trebuie să fie ✅ verde
- Dacă e ❌ — paste log-ul în chat, alt fix necesar

═══════════════════════════════════════════════════════════════════
NU FACE
═══════════════════════════════════════════════════════════════════

- NU upgrade Node version în .github/workflows (păstrăm 22, e default GitHub Actions)
- NU upgrade Vitest la 4 (out of scope, alt task)
- NU modifica testele existente
- NU adăuga teste noi
- NU începe automat alt task. STOP după push.

═══════════════════════════════════════════════════════════════════
RAPORT FINAL în chat
═══════════════════════════════════════════════════════════════════

[PROMPT 6 — TASK #31.7 — model: sonnet]
Pre-flight:
- Locuri găsite cu --no-webstorage: <list>
Build: ✅/❌
Tests: 384/384 pass (zero regresii) / XXX/YYY pass cu Z erori
Commit: <hash>
Issues: NONE / <description>

STOP după push. Daniel verifică CI green pe GitHub Actions.
