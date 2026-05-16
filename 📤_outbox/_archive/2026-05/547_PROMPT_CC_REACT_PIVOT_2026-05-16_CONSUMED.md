# PROMPT_CC — REACT PIVOT CODIFY + PUSH AUTONOMOUS
# Date: 2026-05-16
# Model: Opus EXCLUSIVELY
# Branch: main (post deploy reconcile session LANDED `975e6711`)
# Working folder: C:\Users\Daniel\Documents\salafull

## CONTEXT

Daniel CEO a luat LOCK strategic majore post-deploy-reconcile session:
> "deci noi nu lansam vanilla la betta... lansam andura clasic pe react. Si fa handover pushed complet MCP ca trebuie sa plec"

Decizia supersedes part of "Port-First-Then-React" Step 1 vanilla port → Step 2 React. Noul plan:
- Vanilla `index.html` 6 taburi paradigma veche = LEGACY, NU port closure
- Mockup `04-architecture/mockups/andura-clasic.html` (4 taburi LOCKED V1 + 50+ screens) = DESIGN MASTER React build direct
- Backend LOCK 1 100% (lib 657, Big 11 8/8, Calendar engine, kcal floor, BATCH 2 Antrenor, auth, tests 3743 PASS) = reusable React migration

Narrative complet în `📥_inbox/HANDOVER_2026-05-16_react-pivot-strat.md`. Citește mai întâi.

## MODEL

**OPUS EXCLUSIVELY** — Bugatti craft non-negotiable, NU Sonnet. Sonnet concediat permanent.

## SCOPE

Codify 2 decizii noi (D015 STRAT PIVOT + D016 PROC) în DECISIONS.md append-only, update PRIMER §3+§5+§6 reflect pivot, archive inbox handover + acest PROMPT, atomic commits Bugatti single-concern, push origin main.

NU implementăm React migration acum — doar codify pivot + push. Implementation planning = next chat.

---

## TASK 0 — Pre-flight

```bash
cd C:\Users\Daniel\Documents\salafull
git status                          # verify clean
git branch --show-current           # verify main
git log --oneline -5                # verify HEAD = 975e6711 archive
npm test:run 2>&1 | tail -10        # verify baseline 3743 PASS preserved (~2 min)
npx tsc --noEmit 2>&1 | tail -5     # verify typecheck clean
```

**Fail-stop:** dacă any tests fail OR tree dirty OR branch != main → ABORT, raport `📤_outbox/LATEST.md` Status=Failed cu cauză, NU continua TASK 1+.

## TASK 1 — Read narrative handover

```
Read: 📥_inbox/HANDOVER_2026-05-16_react-pivot-strat.md
```

Asimilează context complet §1-§7 (cum am ajuns + Daniel verbatim + D015/D016 proposed + LOCK 1 valid + path forward).

## TASK 2 — Backup tag pre-codify (Bugatti zero-regret strategic LOCK milestone)

```bash
git tag pre-react-pivot-codify-2026-05-16 -m "Backup pre D015+D016 codify post Daniel strategic pivot LOCK 2026-05-16. HEAD=975e6711 post deploy main reconcile."
git push origin pre-react-pivot-codify-2026-05-16
```

## TASK 3 — Read DECISIONS.md current state

```
Read: DECISIONS.md head 120 (frontmatter + D013/D014 most recent decisions + format reference)
```

Confirm frontmatter `total: 14` `last_id: D014` post deploy reconcile commit `96f94a3`. Format reference D013+D014 pentru parity D015+D016 styling.

## TASK 4 — Append D015 STRAT PIVOT (atomic single-concern Bugatti)

Append la sfârșit DECISIONS.md (înainte `---` footer dacă există):

```markdown
---

## D015 — STRAT PIVOT — Pre-Beta React Andura Clasic, NU vanilla port

**Date:** 2026-05-16
**Category:** STRAT (strategic CEO-level supersede)
**Status:** LOCKED V1
**Source:** Daniel CEO chat verbatim 2026-05-16: "deci noi nu lansam vanilla la betta... lansam andura clasic pe react"
**Cross-refs:** [[ANDURA_PRIMER.md §3 STRATEGY LOCKED V1]], [[DECISIONS.md §D003 Port-First-Then-React]] (supersede partial)
**Backup tag:** pre-react-pivot-codify-2026-05-16 @ HEAD post deploy reconcile

### Context

Post deploy main reconcile 2026-05-16 (D013 LOCK 1 100% + D014 branch reconcile -X theirs), Daniel browser-check andura.app: medical disclaimer ✅ LANDED, dar 6 taburi prod ≠ 4 taburi mockup LOCKED V1. Investigation revealed Port-First-Then-React Step 1 vanilla port bottom nav layer + screen architecture restructure NU făcut. Mockup `andura-clasic.html` `<div id="bottom-nav">` cu comentariu literal "V1 LOCKED — 4 taburi" (Antrenor/Progres/Istoric/Cont, screen-based `goto()` routing 50+ screens) ≠ prod `index.html` `<nav class="nav">` 6 buttons paradigma veche (Coach/Dashboard/Greutate/Program/Plan/Setari, page-based `sp()`).

Tactical decision presented: port nav now (scope mare atinge majoritatea LOCK 1 features) vs slice mai mic vs defer post-Beta.

### Decizia Daniel

Skip Step 1 vanilla port closure complet. Lansăm Andura Clasic pe React folosind mockup-ul ca DESIGN MASTER direct. Vanilla `index.html` 6 taburi rămâne legacy live andura.app până React migration LANDED.

### Implicații

- **Supersedes part of D003 Port-First-Then-React:** păstrăm Step 2 React, abandonăm Step 1 vanilla port closure
- **Vanilla branch `feature/v2-vanilla-port` status:** archive-quality, NU mai primește vanilla port additions post-D015. Backend/engine code în `src/engine/*` + tests 3743 PASS = reusable React migration
- **LOCK 1 100% complete (D013) preserved:** library 657, Big 11 8/8, Calendar V1 engine `scheduleAdapter.js`, LOCK 8 kcal floor, BATCH 2 Antrenor closure, auth Firebase + IndexedDB per UID — ALL reusable backend layer React build
- **UI layer 6 taburi `index.html` + `src/pages/*.js`:** LEGACY, NU port closure, NU refactor pentru parity mockup 4 taburi
- **Mockup `andura-clasic.html` 4753 LOC:** DESIGN MASTER source-of-truth React migration — 4 taburi + 50+ screens + state machine workout V2 + Calendar V1 + auth flow Big 6 hard T0
- **Pre-Beta LOCK 2 redefined:** React Andura Clasic full build pe mockup spec, Bugatti craft, ZERO timing argumente decizie
- **Daniel Gates + Bugatti audit nuclear pre-launch invariant** păstrate

### Rationale Bugatti

Vanilla port intermediate step = double-work non-Bugatti. Mockup → React direct = peak craft minimal duplicated effort. Backend LOCK 1 = reusable Bugatti infrastructure preserved. NU timing argumente — quality > speed strict orizont 2-3 ani.

---

## D016 — PROC — Bottom nav + screen architecture restructure în React build, NU vanilla port

**Date:** 2026-05-16
**Category:** PROC (procedural implementation)
**Status:** LOCKED V1
**Source:** Implicație directă D015 (acelash chat 2026-05-16)
**Cross-refs:** [[D015]], [[04-architecture/mockups/andura-clasic.html]]

### Context

6 taburi prod `index.html` (Coach/Dashboard/Greutate/Program/Plan/Setari, `sp()`-based) ≠ 4 taburi mockup LOCKED V1 (Antrenor/Progres/Istoric/Cont, `goto()`-based 50+ screens). Semantic mapping nontrivial:
- Antrenor (mockup V1 LOCKED home workout session) ≈ Coach + Program absorbed
- Progres (body comp display + nutritie + alerte) ≈ Dashboard + Plan absorbed
- Istoric (timeline calendar heatmap + 90-day ratings + drill-downs) = NEW screen, NU există prod
- Cont (settings drill 9+ sub-screens) ≈ Setari parity

Plus mockup uses screen-based routing (`goto()` 50+ ecrane: splash, auth, onb-1..7, antrenor, energy-check, energy-cause, workout-preview, ceva-nu-merge, pain-button, equipment-swap, aparate-lipsa, schedule-override, istoric, pr-wall, workout V2 state machine, post-rpe, post-summary, progres, settings, settings-* 8+ sub, confirm-* 6+ destructive, log-weight, sesiuni-recente, loguri-greutate, weight-timeline, auth-reactivate, confirm-program-change, confirm-finish-early).

### Decizia

Restructure 6→4 + screen architecture full migration = se face EXCLUSIV în React build pe spec mockup, NU se mai face în vanilla `index.html` + `src/pages/*.js` legacy. Eliminăm double-work non-Bugatti.

### Implementation path forward (next chat)

1. Strategic React stack discussion: React + Vite (lightweight, mockup currently Tailwind CDN) vs Next.js (heavier, app router benefits SSR for SEO landing) — Daniel preference
2. State management: Zustand (lightweight, parity localStorage patterns mockup) vs React Context + custom hooks vs alternative — Daniel preference
3. Routing: React Router DOM v6+ screen-based mapping `goto()` 50+ screens → routes
4. Backend layer reuse: import direct from `src/engine/*` modules (scheduleAdapter, bayesianNutrition, weaknessDetector, fatigueIndex, prEngine, deviationMemory, coachDirector, etc) — preserve test coverage vitest 3743 PASS
5. UI components migration: extract reusable from mockup HTML+CSS+demo JS → React components + Tailwind classes (current Tailwind CDN config → Tailwind PostCSS build)
6. Test strategy: vitest + jsdom React Testing Library local fast + Playwright E2E live andura.app smoke 4 taburi + Daniel Gates production manual Firebase + PWA + telefon
7. Pre-Beta LOCK 2 React Andura Clasic build scope Bugatti — ZERO timing argumente decizie

### Constraints invariante

- Mockup `andura-clasic.html` 4753 LOC = DESIGN MASTER literal — NO design changes în React build fără Daniel CEO LOCK explicit
- Backend `src/engine/*` test coverage = preserved invariant (3743 PASS local)
- Bugatti craft peak — refactor later NEVER happens, ZERO compromise
- Gigel Test mandatory pre-feature decisions React build (orice paradigm shift verificat mockup spec compliance)
- Daniel Gates production + Bugatti audit nuclear pre-launch invariant

---
```

**Frontmatter update:**
- `total: 14` → `total: 16`
- `last_id: D014` → `last_id: D016`
- `last_updated: 2026-05-16` (sau format actual)

### Verify post-append

- Confirm D015 + D016 sintaxă coerentă format D013+D014 reference
- Confirm cross-refs validate (D003 Port-First-Then-React există în DECISIONS sau citată corect)
- Confirm frontmatter actualizat coerent

## TASK 5 — Atomic commit DECISIONS.md (Bugatti single-concern)

```bash
git add DECISIONS.md
git commit -m "DECISIONS: codify D015 STRAT PIVOT + D016 PROC React Andura Clasic

D015 STRAT PIVOT (CEO-level LOCKED V1): Pre-Beta NU vanilla port, lansăm
Andura Clasic pe React folosind mockup andura-clasic.html ca DESIGN
MASTER direct. Supersedes part of D003 Port-First-Then-React Step 1
vanilla port closure. Backend LOCK 1 100% (lib 657, Big 11 8/8, Calendar
engine, kcal floor, BATCH 2 Antrenor, auth Firebase, tests 3743 PASS) =
reusable React migration.

D016 PROC: Bottom nav 6→4 (Antrenor/Progres/Istoric/Cont) + screen
architecture restructure (50+ screens goto()-based) se face EXCLUSIV
în React build pe spec mockup, NU se mai face în vanilla index.html +
src/pages/*.js legacy. Implementation path next chat.

Source: Daniel CEO chat verbatim 2026-05-16 \"deci noi nu lansam vanilla
la betta... lansam andura clasic pe react. Si fa handover pushed complet
MCP ca trebuie sa plec\". Frontmatter total 14→16, last_id D014→D016.

Backup tag: pre-react-pivot-codify-2026-05-16."
```

## TASK 6 — Update ANDURA_PRIMER.md §3 + §5 + §6 reflect pivot

Read PRIMER current state. Update sections:

### §3 STRATEGY LOCKED V1 ACTIVE

Modify "Port-First-Then-React" entry să reflecte D015 partial supersede:

```markdown
- ~~Port-First-Then-React~~ → **D003 + D015 split:**
  - D003 Step 2 React migration = ACTIVE Pre-Beta LOCK 2
  - D003 Step 1 vanilla port closure = SUPERSEDED by D015 2026-05-16
    (vanilla index.html 6 taburi = LEGACY, NU port closure, mockup → React direct)
```

### §5 Unde am rămas

Append latest entry:

```markdown
**2026-05-16 React pivot strategic LOCKED V1:**
- Pre-Beta LOCK 1 = 100% complete (D013) — backend reusable React
- Deploy main reconcile LANDED `975e6711` (D014)
- D015 STRAT PIVOT: vanilla port skipped, React Andura Clasic direct
- D016 PROC: nav 6→4 + screens 50+ în React build only
- Next chat: React stack tactical (Vite vs Next, state mgmt, routing migration)
```

### §6 Ce e de făcut

Mark Track 1 + Track 2 (vanilla port closure backlog) ca **SUPERSEDED post D015**. Add Track 4 React migration tactical planning:

```markdown
### Track 4 — React Andura Clasic build (NEW post D015 2026-05-16)
- Strategic stack discussion (Vite vs Next.js, state mgmt, routing)
- Backend layer reuse plan (src/engine/* import direct)
- UI components extraction mockup → React + Tailwind PostCSS build
- Test strategy migration vitest React Testing Library + Playwright
- Pre-Beta LOCK 2 = React Andura Clasic full build pe mockup spec
- Daniel Gates + Bugatti audit nuclear pre-launch invariant
```

## TASK 7 — Atomic commit PRIMER update (Bugatti single-concern)

```bash
git add ANDURA_PRIMER.md
git commit -m "PRIMER: update §3+§5+§6 reflect D015 React pivot strategic LOCK

§3 Strategy: D003 Port-First-Then-React Step 1 vanilla port closure
SUPERSEDED by D015 (vanilla legacy, mockup → React direct). Step 2
React migration = ACTIVE Pre-Beta LOCK 2.
§5 Status: append 2026-05-16 React pivot entry.
§6 Backlog: mark Track 1 + Track 2 vanilla port SUPERSEDED post D015,
add Track 4 React Andura Clasic build tactical planning."
```

## TASK 8 — Archive inbox handover + PROMPT_CC consumed

```bash
# Determine next NN counter in 📤_outbox/_archive/2026-05/
# Post LATEST.md archive 975e671 = NN 545. Next available: 546+.

git mv "📥_inbox/HANDOVER_2026-05-16_react-pivot-strat.md" \
       "📤_outbox/_archive/2026-05/546_HANDOVER_2026-05-16_react-pivot-strat_CONSUMED.md"

git mv "📥_inbox/PROMPT_CC_REACT_PIVOT_2026-05-16.md" \
       "📤_outbox/_archive/2026-05/547_PROMPT_CC_REACT_PIVOT_2026-05-16_CONSUMED.md"
```

## TASK 9 — Atomic commit archive (Bugatti single-concern)

```bash
git add -A
git commit -m "Archive: 546+547 React pivot handover + PROMPT_CC CONSUMED

git mv preserves rename detection history. Inbox cleanup final (only
.gitkeep remains). Outbox LATEST.md overwrite în TASK 11."
```

## TASK 10 — Verify tests preserved invariant

```bash
npm test:run 2>&1 | tail -10
```

Confirm 3743 PASS / 187 files preserved post all commits. Vault meta-tooling ZERO src/ touched invariant.

**Fail-stop:** dacă tests fail → ROLLBACK ultimul commit, raport LATEST.md Status=Failed, NU push.

## TASK 11 — Write 📤_outbox/LATEST.md raport finalize

Format §0-§N per memorie:

```markdown
# LATEST CC AUTONOMOUS REPORT — REACT PIVOT CODIFY
**Date:** 2026-05-16
**Task:** D015+D016 codify + PRIMER update + archive + push
**Model:** Opus EXCLUSIVELY
**Status:** Complete | Tests 3743 PASS preserved | Push origin main pending TASK 12

## §0 — Bugatti Verification Checklist Pre-Push
- [✓] Pre-flight verde (3743 PASS / 187 files baseline)
- [✓] Backup tag pre-react-pivot-codify-2026-05-16 pushed origin
- [✓] D015 + D016 appended DECISIONS.md format parity D013/D014
- [✓] PRIMER §3+§5+§6 reflect pivot
- [✓] Cross-refs validate (D003 supersede, mockup path, LOCK 1 D013)
- [✓] Frontmatter total 14→16, last_id D014→D016
- [✓] Atomic commits single-concern Bugatti (3 separate: DECISIONS, PRIMER, archive)
- [✓] git mv rename detection preserved history
- [✓] Tests 3743 PASS preserved invariant post all commits
- [✗] Push origin main pending (TASK 12)

## §1 — Commits sequence
- <SHA1> "DECISIONS: codify D015 STRAT PIVOT + D016 PROC React Andura Clasic"
- <SHA2> "PRIMER: update §3+§5+§6 reflect D015 React pivot strategic LOCK"
- <SHA3> "Archive: 546+547 React pivot handover + PROMPT_CC CONSUMED"

## §2 — Tag pushed
- pre-react-pivot-codify-2026-05-16 @ <SHA pre-codify HEAD>

## §3 — Files modified
- DECISIONS.md (append D015+D016, frontmatter update)
- ANDURA_PRIMER.md (§3+§5+§6 update)
- 📥_inbox/ → 📤_outbox/_archive/2026-05/ (546+547 git mv)
- 📤_outbox/LATEST.md (this raport)

## §4 — Issues / caveats
[None expected. If any → list aici.]

## §5 — Next action
- TASK 12 push origin main
- TASK 13 tag react-pivot-locked-2026-05-16 milestone marker push
- Next chat: React migration tactical planning (Vite vs Next.js, state mgmt, routing, backend reuse)
```

## TASK 12 — Atomic commit LATEST.md + push origin main

```bash
git add "📤_outbox/LATEST.md"
git commit -m "LATEST: React pivot codify raport finalize"

git push origin main
```

## TASK 13 — Milestone tag react-pivot-locked + push

```bash
git tag react-pivot-locked-2026-05-16 -m "Strategic LOCK milestone: D015+D016 codified, vanilla port superseded, React Andura Clasic = Pre-Beta path forward. Daniel CEO LOCK 2026-05-16."
git push origin react-pivot-locked-2026-05-16
```

---

## RAPORTARE FINALĂ

Update LATEST.md §0 checklist mark TASK 12+13 done. Confirm `git ls-remote origin react-pivot-locked-2026-05-16` returns SHA validate push.

## FAIL-STOP RECOVERY

Orice TASK fail → STOP imediat, raport LATEST.md Status=Failed cu task ID + cauză + last successful commit SHA. Daniel review next session, NU rollback automatic decizie strategic-impact.

Backup tag `pre-react-pivot-codify-2026-05-16` = restore point complet dacă necesar rollback ulterior.

---

🦫 **Atomic Bugatti commits. ZERO --no-verify bypass. Tests preserved invariant. Backup tag pushed origin. Push final fail-stop raportat LATEST.md.**
