# HANDOVER 2026-05-16 — React Pivot Strategic LOCK

**Topic:** Pre-Beta scope strategic pivot — abandonăm vanilla port, lansăm Andura Clasic pe React
**Session origin:** "Salut Acasă" §CC.2 startup → Pre-Beta cap-coadă verify → deploy main reconcile → 6 taburi prod investigation → Daniel pivot decision
**Bandwidth final:** ~25-30%, Daniel "trebuie sa plec"

---

## §1 — Cum am ajuns aici (scribe flow)

Am pornit cu §CC.2 startup audit pe Pre-Beta cap-coadă. Track 1 (D007+D008+D009 codify) era deja codificat în DECISIONS.md, dar PRIMER §6 mai purta stale flag. Track 2 (3 buguri prod mockup ports) toate verificate LANDED: import nutritie wired (`e82edb5`), MFP prompt periodic 3 zile (`dashboard.js:128-145` threshold + `index.html:392` slot), LOCK 8 kcal floor informative toast (`weight.js:6-7 + body`).

Concluzia mea Pre-Beta LOCK 1 = 100% complete (library 657/657 + Big 11 8/8 + Calendar engine `scheduleAdapter.js` + cap-coadă closed). Daniel autorizat deploy autonomous CC via MCP — nu poate deploy manual, nu poate smoke (app pe andura.app vanilla branch, nu prod live), busy ziua.

Primul deploy attempt (`PROMPT_CC_DEPLOY_MAIN_2026-05-16.md`) — pre-flight verde (3743 PASS / 187 files), backup tag `pre-deploy-main-2026-05-16 @ e45b736` push origin, dar TASK B merge feature→main conflict 4 fișiere UU (CURRENT_STATE, mockup, DIFF_FLAGS, LATEST). CC abort clean cu `git merge --abort`.

Investigation read-only CC analysis (`INVESTIGATION_2026-05-16_main_vs_feature.md`) — merge-base `71e6445`. Main avea 16 commits not in feature (10 plumbing + 6 substantive: mockup 6 fixes, v2 mockup replace, prod bugs reconcile, ADR 023 SUPERSEDED, audit 22 engines). Feature avea 239 commits not in main (D001-D012 codify, ANDURA_PRIMER, radical archive wiki→99-archive/, Calendar V1 mockup S1-S3, BATCH 2 Antrenor closure, LOCK 8). Divergence 4.4× additive (1929 ins / 441 del) — NU cross-purpose rewrite. CC recommendation Option A merge feature→main `-X theirs`. Daniel "da" autonomous.

Al doilea deploy attempt (`PROMPT_CC_DEPLOY_MAIN_RECONCILE_2026-05-16.md`) — TASK 1 verify 3 possibly-orphan items main toate ABSORBED (P1-FLAG-PROD-BUGS umbrella `05ba372`, ADR 023 SUPERSEDED frozen + D-LEGACY-088/083/084, F13 drop V1 D-LEGACY-068 + PRIMER §4). TASK 3 merge `fb454efe` -X theirs, 4 conflicts auto-resolved feature-preferred, working tree clean. TASK 4 npm test:run 3743 PASS preserved. TASK 5 deploy.yml fired, gh-pages SHA `1ead85d → 3cc0c46`. TASK 6 post-deploy tests preserved. TASK 7 commit `a999cda` PRIMER §6 cleanup. TASK 8 commit `96f94a3` DECISIONS D013+D014 (LOCK 1 100% + branch reconcile strategy). TASK 9 archive `975e6711`. Push origin main complete.

Daniel browser-check andura.app post-deploy: medical disclaimer ✅ confirmă LOCK 4 LANDED prod. DAR observat: "tot cu 6 taburi e jos".

Investigation: prod `index.html` `<nav class="nav">` are 6 buttons paradigma veche (Coach/Dashboard/Greutate/Program/Plan/Setari, page-based `sp()`). Mockup `andura-clasic.html` `<div id="bottom-nav">` are 4 nav-tab buttons cu comentariu literal **"V1 LOCKED — 4 taburi"** (Antrenor/Progres/Istoric/Cont, screen-based `goto()` 50+ screens). Plus JS comment "Screen routing (V1 LOCKED — 4 taburi: Antrenor/Progres/Istoric/Cont)". Root cause: Port-First-Then-React Step 1 vanilla port bottom nav layer NU făcut — semantic mapping nontrivial (Antrenor absorbă Coach+Program, Progres absorbă Dashboard+Plan, Istoric e screen NOU, Cont≈Setari).

Prezentat tactical decision Daniel: port nav now (scope mare — atinge majoritatea features LOCKED V1) vs slice mai mic vs defer post-Beta.

## §2 — Daniel LOCK strategic verbatim

> "deci noi nu lansam vanilla la betta... lansam andura clasic pe react. Si fa handover pushed complet MCP ca trebuie sa plec"

**Decizie supersedes "Port-First-Then-React" strategy LOCKED V1.** Noul plan: mockup `andura-clasic.html` (DESIGN MASTER 4 taburi V1 LOCKED + 50+ screens) → React migration direct, SKIP vanilla port intermediar la Beta. Vanilla `index.html` 6 taburi current = legacy, NU primește port complet.

## §3 — Implicații tactical (D015 + D016 codify path)

**D015 STRAT PIVOT (proposed):** Pre-Beta NU lansăm vanilla port (`feature/v2-vanilla-port` → main 6 taburi paradigma veche). Lansăm Andura Clasic pe React, folosind mockup-ul `04-architecture/mockups/andura-clasic.html` ca DESIGN MASTER cu 4 taburi LOCKED V1 (Antrenor/Progres/Istoric/Cont) + 50+ screens routing (`goto()`-based). Supersedes part of "Port-First-Then-React" Step 1 — păstrăm Step 2 React build, dar SKIP Step 1 vanilla port closure. Vanilla `index.html` 6 taburi rămâne legacy live andura.app până React migration LANDED.

**D016 PROC (proposed):** Bottom nav port 6→4 + screen architecture restructure (Antrenor absorbă Coach+Program, Progres absorbă Dashboard+Plan, Istoric e NEW screen cu timeline+heatmap, Cont≈Setari parity) = se face direct în React build, NU mai facem dublă-muncă vanilla port intermediar. Backend/engine layer (lib 657 Big 11 8/8 Calendar engine LOCK 8 kcal floor BATCH 2 Antrenor closure all of LOCK 1 100%) = reusable infrastructure portabil React.

## §4 — Ce rămâne valid din LOCK 1

Backend/engine/data layer = peak craft Bugatti, reusable React migration:
- Library 657 ex (Big 11 8/8 LOCK 2 ACHIEVED 2026-05-15)
- Calendar V1 Slice 1-3 engine `src/engine/schedule/scheduleAdapter.js` (ADR 030 D2)
- LOCK 8 KCAL_FLOOR informative toast logic
- BATCH 2 Antrenor closure SUB-BATCH 1+2
- Tier-based personalization T0→T1+ + Demographic Prior Database synthetic
- Auth flow Firebase + IndexedDB per UID
- 3743 tests vitest baseline (engine + integration coverage)

UI layer 6 taburi `index.html` + `src/pages/coach.js + dash.js + weight.js + prog.js + plan.js + settings.js` = LEGACY, NU primește port closure. React rebuild folosește mockup-ul 4 taburi ca source-of-truth.

## §5 — Pre-Beta path forward (next chat)

1. Strategic discussion React stack choice (React + Vite? Next.js? Tailwind?) — mockup currently Tailwind CDN, port to build pipeline
2. State management strategy (Zustand? React Context? Daniel preference?)
3. Routing migration screen-based mockup `goto()` → React Router 50+ screens
4. Backend layer reuse plan (engine modules import direct from `src/engine/*`)
5. Test strategy migration (vitest jsdom local + Playwright E2E live andura.app)
6. Timeline Pre-Beta LOCK 2 React Andura Clasic build (Bugatti craft, ZERO timing argumente decizie)
7. Daniel Gates smoke + Bugatti audit nuclear pre-launch invariant

## §6 — Ce trebuie să facă CC autonomous acum (PROMPT_CC separat)

- Read this narrative
- Append D015 + D016 la DECISIONS.md (atomic commit single-concern fiecare, Bugatti)
- Update PRIMER §3 STRATEGY LOCKED V1 reflect pivot (mark "Port-First-Then-React" SUPERSEDED partial via D015)
- Update PRIMER §5 status "Unde am rămas" + §6 "Ce e de făcut" reflect React pivot
- Archive `📥_inbox/HANDOVER_2026-05-16_react-pivot-strat.md` → `📤_outbox/_archive/2026-05/NNN_CONSUMED.md`
- Atomic commits + push origin main
- Write `📤_outbox/LATEST.md` raport finalize

## §7 — Bandwidth + slip-uri scribe

Bandwidth report-uri în chat — slip-uri:
- 2026-05-16 turn ~6: nu raportat proactiv, Daniel "bw?" trigger trezit → reported ~50-55%. Per memorie protocol §CC eu trebuia să raportez la fiecare 5-7 mesaje grele FĂRĂ trigger. Mea culpa.
- Turn final ~13: am raportat ~30-35% post 2 read-uri grele index.html + mockup tail. Corect timing.

Tone: warmth + tehnic + decisive. Daniel-ism "trebuie sa plec" = signal fast execution autonomous, NU întreb verify. "Pushed complet MCP" = fire-and-forget batch, CC handles all.

---

🦫 **Strategic pivot LOCKED V1. Vanilla port DEFERRED/legacy. React Andura Clasic = Pre-Beta path. Backend LOCK 1 100% reusable. New chat needed pentru React migration tactical planning.**
