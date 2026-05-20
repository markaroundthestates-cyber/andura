# HANDOVER 2026-05-13 — Calendar V1 Slices 1.0 → 1.7 + Statusline CC pack

**Source chat:** ACASĂ Claude Desktop + MCP filesystem v0.2.31 + CC Opus terminal `--dangerously-skip-permissions`
**Trigger:** Daniel "handover dupa read... intre timp eu validez mockup" post S1.7 LANDED `de761f5`
**Bandwidth la trigger:** ~25% remaining — handover preventiv pre-iteration next chat
**Pre-handover backup tag:** to be tagged by `/wiki-ingest` autonomous

---

## §0 Scribe flow conversational

Daniel a deschis ACASĂ cu `Salut Acasă` post SUB-BATCH 3 CLOSURE 2026-05-12 (119/119 wiki pages cumulative Karpathy Real Option B 100% coverage). §CC.2 startup confirmed via `wiki/index.md` + `wiki/log.md` last entries — Calendar V1 strategic LOCKED V1 cu 3 clarifications pending Daniel input pre-implementation final (per `wiki/concepts/calendar-feature-v1-spec.md` §"Implementation defer").

Am surfaced 3 strategic Q-uri cu recomandare pe primul. Daniel a răspuns ferm într-un mesaj single: `1. color only 2. zilele trecute raman bifate si se recalibreaza restul 3. ok. si vezi la 2, ca desi coach ii face antrenament pe saptamana, coach vede bigger picture nu doar o saptamana`. Asta a închis cele 3 strategice + a deschis al **patrulea LOCK augmentat** — Coach multi-week bigger picture, Engine #2 Goal Adaptation + Engine #1 Periodization propagate constraint downstream, NU săptămâna izolată. Recalibrare mid-week edit = local adjustment în săptămâna curentă, dar macro periodizare absoarbe impactul.

Decizia ce a urmat: tactical Co-CTO autonomous, 4-slice plan atomic Bugatti. **S1 = mockup design master only; S2 = scheduleAdapter.js engine NEW; S3 = state.js Tier 0 ephemeral; S4 = Antrenor render port + tests 80-120.**

## §1 Slice 1 — mockup design master LANDED `6ec01e8`

Pre-flight sync slip resolved: mockup uploaded Daniel 2026-05-12 verbatim *"ti-am dat eu mockupul. fa replace. e mai nou"* — 325KB ~4400 LOC modified 20:47, current vault. Mockup replace separat atomic commit `52be5f6` (CC autonomous a întrebat partitioning, Daniel "1. atomic single-concern Bugatti — granular rollback safety" + eu confirm via recomandare). Apoi S1 design master sub *"Vrei altceva azi?"* link, deasupra Programe Obiectiv. CC a flag-uit placement-shift (mockup nou are `<div class="settings-section">📋 Obiectiv</div>` NU `<section>OBIECTIV</section>` cum era spec verbatim) — am răspuns **Option 1: între coach-reflectie L825 și Obiectiv settings-section L828**, semantic Antrenor home flow today-recommendation → weekly view → goal selector preserved. CC autonomous LANDED, ZERO src/ touched, tests 2914 PASS preserved.

## §2 Slice 1.5 — fix bundle vizual LANDED `afc74a5`

Daniel preview browser + push-back 4 mods într-un mesaj single: *"in loc de lacat as pune creionasul ala de edit cum e la proteine spre exemplu. As face totul o idee mai mic... gen mi se pare chenatul ala cam mare... In loc de saptamana ta as pune ceva gen Antrenamentul saltamanii... sau ceva similar... lacatul acum nu merge... apas pe el si nu se intampla nimic."*

Am început să scriu artefact cu title "Antrenamentul saptamanii" — Daniel `stai. nu pune fix antrenamentul saptamanii... pune si tu ceva gen Program de antrenament. Si centreaza textul`. Reset artefact instant cu title corectat + centrare absolute (header `position:relative` + title `text-align:center` + pencil `position:absolute right:0`). 4 mods bundled:
- 🔒 emoji → lucide `pencil` parity `.nutri-edit-btn` proteine (28×28, border-radius 8, ink-3 → ink hover, transparent → white)
- Compact (padding 16→12/14, radius 14→12, title 15→13, gap 6→5, cell radius 10→8, save padding 12/16→10/14)
- "Saptamana ta" → "Program de antrenament" CENTRAT cu pencil absolute right (independent)
- Demo JS state machine mockup-only (`toggleCalendarEdit/Day` + `saveCalendarEdit`) pattern parity `editNutri/saveNutri` existing inline `<script>`

## §3 Slice 1.6 — CSS bug fix UX-friction LANDED

Daniel preview: *"cand dau sa editez antrenamentul pe calendar apare calendarul gol, dar dupa primul click se populeaza si restul calendarului"*. Root cause identificat instant: CSS rule `.calendar-week[data-state="edit"]:not([data-state="editing"]) .calendar-day[data-selected="true"]` forțează cells preset (L/Mi/V) la neutru pre-first-tap; primul tap declanșa tranziția JS `edit → editing`, care înlătura regula → populare bruscă retroactivă. UX intent corect: user vrea să vadă starea curentă editabilă imediat la tap pencil (signal "asta e programul, modifică ce vrei"), NU fresh start cu reset complet.

Bugatti minimal fix: **DELETE 1 CSS rule + simplify state machine 4 → 3 states** (LOCKED / EDIT / SAVE; `editing` redundant). JS `toggleCalendarDay()` strip line `if (state === 'edit') setAttribute('data-state', 'editing')`. Spec wiki UX states cumulative drift flagged pentru consolidate handover next.

## §4 Slice 1.7 — UX reframe 5-mod bundle LANDED `de761f5`

Daniel verbatim larger push-back: *"Din tabul de antrenor... rubrica de ceva nu merge trebuie mutata la Cont sub ajutor. Baga o sectiune de Submit bug sau ceva cu text liber, care cand da submit, sa vina pe mailul andura. Sectiunea asta trebuie bagata sub suport, imediat dupa Whatsapp. Partea cu nu am aparat de la ceva nu merge nu e foarte bine pusa acolo. Ar trebuii cand dai click pe coach, dupa ce treci de cele 3 puncte de stare si vezi preview-ul exercitiilor, undeva sub exercitii sa ai un mic buton de nu am aparat. Cand apesi pe el, coach sa se adapteze si sa tina minte in sesiunile viitoare ca nu ai aparatul ala. Acum apare aparat lipsa direct in exercitiu. Butonul ala trebuie scos, ca deserveste acelasi lucru. La cont trebuie o sectiune de aparate lipsa, unde sa apara tot ce ai selectat in trecut ca nu ai, si cu optiunea de edit, sa poti sa si scoti aparatele pe care anterior le-ai selectat ca nu e ai, in cazul in care acum le ai."*

5 mods bundled atomic single-concern interpretat la nivel "user feedback channel + missing equipment lifecycle" (anti-split):
- **A.** Relocate "Ceva nu merge" Antrenor → Cont/Ajutor + DELETE `Acces rapid` section empty + REMOVE "Nu am aparat" option din `screen-ceva-nu-merge` (rămâne "Ma doare" + "Anuleaza")
- **B.** NEW "Trimite-ne un mesaj" section Cont/Suport între Contacteaza-ne și FAQ (textarea + btn-brick Trimite + `submitFeedback()` cu `mailto:contact@andura.app?subject=[Feedback Andura]&body=<encoded>` + empty validation + clear post-send)
- **C.** REMOVE "Aparat lipsa" chip workout sesiune (2 chips rămân: Ocupat + Nu vreau) + strip JS dictionary entries + strip `applyExAction()` lipsa branch
- **D.** NEW `screen-aparate-lipsa` picker 10 echipamente standard (banca-inclinata/banca-plana/bara-halterelor/gantere/aparat-cablu/power-rack/leg-press/aparat-extensii/aparat-tractiuni/banda-elastica) toggle pattern parity `onb-medical` + persist `wv2-missing-equipment` localStorage (`toggleEquipmentMissing()` + `hydrateAparateLipsa()` hooked în `goto()` wrapper post-render, legacy RO string list normalized prin filter `validIds`)
- **E.** Drill entries: Cont/General "Aparate lipsa" între Aspect și Setari + workout-preview "Nu am aparat" btn-ghost full-width între `#preview-exercise-list` și Coach note

Decizii tactice Co-CTO autonomous: email destination `contact@andura.app` (existing mockup pattern reuse, subject `[Feedback Andura]` filter), aparate-lipsa location Cont/General (semantic config-like NU profil identity), pencil parity proteine pattern, equipment-swap existing screen PĂSTRAT (deservește "Aparat ocupat" temporary swap only). Path forward post-port: backend `/api/feedback` endpoint replace mailto: demo + Coach Engine #2 `buildSession()` consume `wv2-missing-equipment` filter parity equipment-swap logic.

+151/-21 LOC, tests 2914 PASS preserved EXACT, ZERO src/ touched, ZERO main branch.

## §5 Interlude — Statusline CC pack

Mid-S1.7 execution Daniel a interpus: *"cat asteptam latest, vreau asta https://code.claude.com/docs/en/statusline"*. Tras docs prin web_fetch + generat artefact bash script Bugatti minimal: 2 linii dense, **L1 identity** (`[Opus]` brick `#c8412e` + `📁 <dir-basename>` + `🌿 <branch> +<staged> ~<modified>`), **L2 state** (10-char █/░ progress bar threshold-colored verde<70% / yellow 70-89% / roșu ≥90% + `<pct>%` + `$<cost>` + `⏱️ <m>m <s>s` + rate-limit `5h: <pct>%` conditional ≥50% only — clutter-free când safe). Settings.json snippet + install steps Windows Git Bash (`~/.claude/statusline.sh` + chmod +x + mock input test). Aligned bandwidth report habit Daniel preferences + Andura signature color preserved. Path forward V2 optional: add Andura test count + backup tag last + current task slice.

## §6 Cumulative wiki spec drift Calendar V1 (CONSOLIDATE acest handover)

`wiki/concepts/calendar-feature-v1-spec.md` NU updated în Slices 1.0-1.7 (raw layer freeze post-Faza 3 invariant). Cumulative drift flagged pentru `/wiki-ingest` distribute acum:
- **§UX states** 4 → **3 simplified** (post-S1.6: LOCKED / EDIT / SAVE — `editing` redundant)
- **§Edit affordance** 🔒 emoji → **lucide pencil** parity `.nutri-edit-btn` proteine (post-S1.5)
- **§Header title** "Saptamana ta" → **"Program de antrenament" CENTRAT** (post-S1.5 Daniel verbatim correction `pune si tu ceva gen Program de antrenament. Si centreaza textul`)
- **§Visual current selection EDIT state** = afișare imediată verde deschis `#d4e6cb` (NU fresh start neutru — post-S1.6 bug fix)
- **§NEW User feedback channel** (post-S1.7) — Cont/Suport "Trimite-ne un mesaj" section + `mailto:contact@andura.app` MVP + backend `/api/feedback` path forward
- **§NEW Missing equipment lifecycle** (post-S1.7) — dedicated `screen-aparate-lipsa` picker 10 echipamente + `wv2-missing-equipment` localStorage persist + drill entries Cont/General și workout-preview + Coach Engine #2 `buildSession()` consume filter S2 path forward
- **§Workout sesiune chips** 3 → **2** (post-S1.7 — "Aparat lipsa" relocated permanent picker; Ocupat + Nu vreau rămân)
- **§"Ceva nu merge" container** 2 options → **1** (post-S1.7 — "Nu am aparat" relocated; "Ma doare" rămâne)

## §7 Mid-flight unresolved + path forward Slice 2

- **Spec wiki cumulative drift** = consolidate prin acest `/wiki-ingest` (acum) + voice preservation §1 4-section preserved (Synthesis + Verbatim quotes Daniel + Bugatti framing + Cross-refs raw layer)
- **Slice 2 production wiring** = chat NEW dedicated post-handover (touch `src/` first time pe Calendar V1):
  1. `src/engine/schedule/scheduleAdapter.js` NEW — bridge Calendar `data-state` ↔ Coach Engine #2 Goal Adaptation `currentTemplate` ↔ Engine #1 Periodization mesocycle phase
  2. Coach Engine #2 `goalAdaptation.recomputeWeekSchedule(selectedDays, currentMesocyclePhase, big6Priorities)` invocation post Save commit
  3. Engine #1 Periodization multi-week constraint propagate (clarification augmentat #4 LOCKED 2026-05-12)
  4. Mid-week edge case preserve trecut invariant + recompute rest J-D
  5. Backend `/api/feedback` endpoint replace mailto: demo
  6. Workout sesiune integration query `wv2-missing-equipment` pre-build + auto-swap parity equipment-swap fără user input
  7. Tests new vitest cluster scheduleAdapter + feedback POST + missing equipment filter (80-120 estimated)

## §8 Strategic locks preserved invariant

- **Port-First-Then-React** activ — vanilla `feature/v2-vanilla-port` branch only, ZERO React/JSX
- **Voice preservation policy §1** mandatory (4 sections per wiki page Karpathy Real)
- **Tier 0 ephemeral state** `wv2-missing-equipment` parity ADR 020 §1.4 active rolling
- **Coach multi-week bigger picture LOCK V1 augmentat 2026-05-12** — Engine #2 + Engine #1 propagate constraint downstream
- **Bugatti single-concern atomic commits** preserved per slice (cu interpretare nivel UX reframe coherent pentru S1.7 5-mod bundle)
- **Daniel-ism `coatch nu e medicul lui si nici partenerul de vacanta`** preserved în clarification 3 ZERO warning extremes (1 zi min ok + 7/7 ok anti-paternalism)

## §9 Tone shifts + scribe meta

Daniel tone: precision push-backs visual/behavioral, ferm și scurt — instant correction "stai. nu pune fix..." când am început greșit naming. Confirm rapid când recomandare aliniat: "1. color only 2. zilele trecute..." într-un mesaj single fără elaborate. Interlude statusline workflow improvement în paralel cu wait CC LANDED — efficient context switching. Handover trigger natural conversational "handover dupa read... intre timp eu validez mockup". ZERO daniel-isme negative chat curent (no "halucinezi", no "stai/caveman" critical) — slice cycle smooth.

Eu (Co-CTO) decizii tactice autonomous fără permission theater: title rename pe S1.5 (corectat instant la Daniel `stai`), placement S1 Option 1 between coach-reflectie și Obiectiv settings-section, S1.7 bundle vs split decision (interpretat single-concern nivel UX reframe coherent), email destination contact@andura.app reuse, picker location Cont/General. Anti-confirmation theater preserved.

## §10 Cross-refs raw layer

- [[04-architecture/mockups/andura-clasic.html]] §calendar-week S1.0→S1.7 cumulative LANDED commits `52be5f6` + `6ec01e8` + `afc74a5` + (S1.6 commit hash în LATEST archive) + `de761f5`
- [[wiki/concepts/calendar-feature-v1-spec.md]] §"Implementation defer" + §"UX states" + §"Wireframe placement" — cumulative drift acest handover consolidate
- [[wiki/entities/engines/engine-coach-director.md]] §Synthesis orchestrator + §buildSession() S2 path forward
- [[wiki/entities/adrs/adr-024-goal-driven-program-templates.md]] §42.10 Engine #2 Goal Adaptation pipeline (S2 wiring trigger)
- [[wiki/entities/adrs/adr-020-storage-tiering-strategy.md]] §1.4 Tier 0 active rolling (`wv2-missing-equipment` parity pattern)
- [[VAULT_RULES.md]] §F3.12 HARD CONSTRAINTS + §F3.13 metoda hibridă LOCKED V1 2026-05-12
- [[08-workflows/HANDOVER_VERIFICATION_CHECKLIST.md]] §0-§11 Bugatti gate (invocation autonomous post /wiki-ingest)
- [[📤_outbox/LATEST.md]] S1.7 raport `de761f5` cumulative slice history

---

🦫 **Handover narrative ~150 LOC, scribe flow conversational preserved Daniel voice verbatim across slices. Bandwidth ~25% remaining la trigger. Distribute via `/wiki-ingest` autonomous → consolidate Calendar V1 spec cumulative drift + voice preservation §1 4-section + cross-refs raw layer min 2-3 + atomic commit single-concern + backup tag pre-handover + tests 2914 PASS preserved invariant. Path forward Slice 2 chat NEW dedicated post-handover.**
