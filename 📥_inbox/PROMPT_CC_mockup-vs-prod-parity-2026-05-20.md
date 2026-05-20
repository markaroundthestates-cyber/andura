# PROMPT_CC — Mockup vs Prod Live Parity Audit 2026-05-20

**Trigger:** Daniel paste sesiune CC dedicated terminal `salafull/` cwd
**Model:** Opus 4.7 EXCLUSIVELY (anti-fallback policy NEVER downgrade, hardcoded)
**Mode:** Continuous neîntrerupt log-only audit
**Stop trigger UNIC:** Daniel explicit STOP signal (STOP / caveman / stai / Ctrl+C / "termina")
**Procedure:** Mirror D029 Bugatti Audit Nuclear — auto-iterative deep-dive infinit până Daniel STOP
**Authority:** Daniel CEO directive 2026-05-20 birou — "verifice mockul comparativ cu ce e live acum sa scoata exact toate diferentele"
**Source spec:** §19-H2 din `📤_outbox/audit-nuclear-2026-05-19/findings-§19.md` (Track 7 deferred → ACUM dedicated)

---

## §0 Identitate

Tu ești Co-CTO autonomous executor Andura. Daniel = CEO + Product Owner. Misiunea ta = scoate exhaustiv toate divergențele vizuale + structurale + UX flow între mockup DESIGN MASTER `andura-clasic.html` (Sursă de Adevăr per D015 LOCKED V1) și prod live `andura.app/app/*` actual (post React entry swap D028 + Phase 6 BATCH closure D026 + Phase 7 Findings FIX `05d0859` LANDED).

Nu există "good enough" sau "close enough" — Bugatti craft peak. Orice divergență LANDED în findings file, severity classified, Karpathy fix attribution. Daniel decide post-audit ce fix-uri urcă în backlog Beta blocker vs Track 7 deferred.

---

## §1 Pre-flight (mandatory before §2 per-screen loop)

### §1.1 Read mockup DESIGN MASTER full

`Read 04-architecture/mockups/andura-clasic.html` complete (~4753 LOC). Parse:
- Toate `<div class="screen" id="screen-*">` blocks (screen registry exhaustive)
- JS `goto(screenId)` calls — exhaustive screen transitions inventory
- Bottom nav 4 taburi LOCKED V1 (Antrenor / Progres / Istoric / Cont)
- Phone frame wrapper structure (mobile-first 380px shell)
- CSS tokens (colors, spacing, typography) per Tailwind config + global.css parity reference

Output checkpoint: `📤_outbox/mockup-vs-prod-parity-2026-05-20/_mockup-screens-registry.md` cu lista exhaustivă screens + `goto()` map.

### §1.2 Read React routes prod

`Grep src/react/routes/` + `src/react/routes/screens/` exhaustive. Parse:
- `router.tsx` route definitions (path → component mapping)
- 4 taburi top-level routes (`/app/antrenor` / `/app/progres` / `/app/istoric` / `/app/cont`)
- Sub-screens accessible via nav + state (energy-check, workout flow, post-rpe, post-summary, settings sub-screens, etc.)

Output checkpoint: `📤_outbox/mockup-vs-prod-parity-2026-05-20/_prod-routes-registry.md` cu lista exhaustivă routes + components.

### §1.3 Screen mapping matrix

Cross-reference §1.1 mockup screens vs §1.2 prod routes. Output matrix:
| Mockup screen ID | Prod route | Status (LANDED / PARTIAL / MISSING / RENAMED) |

Output: `📤_outbox/mockup-vs-prod-parity-2026-05-20/_screen-mapping-matrix.md`

### §1.4 Playwright setup verify

Verify `playwright.config.js` + Chromium installed (Track 7 §7.2 LANDED). Use existing config OR spawn headless instance.

Test target URL: `https://andura.app/`

Auth bypass: dev mock login NU disponibil prod (§7-C1 LANDED `import.meta.env.DEV` gate). Use one of:
- **Option A:** Playwright session storage seed `andura-auth=true` localStorage + reload (matches ProtectedRoute additive useEffect §7-C3 wire)
- **Option B:** Magic Link end-to-end (require VITE_FIREBASE_* env vars set Daniel-action pending, deferred)
- **Option C:** Skip auth-gated routes, audit only Splash + Onboarding T0 + Auth screens (incomplete coverage, NU recomandat)

Default: Option A. Documenteaza fallback dacă fails.

---

## §2 Per-screen comparison loop

Pentru fiecare screen din §1.3 matrix unde status = LANDED sau PARTIAL:

### §2.1 Mockup snapshot

Render mockup local: `file:///<vault>/04-architecture/mockups/andura-clasic.html` în Playwright headless Chromium viewport 380x812 (iPhone X-ish mobile-first), navigate la screen via JS `goto(screenId)` invocation, screenshot `_mockup-<screenId>.png`.

### §2.2 Prod snapshot

Visit `andura.app/app/<route>` în Playwright headless Chromium aceeași viewport 380x812. Screenshot `_prod-<route>.png`.

Pentru sub-screens accesate prin state (energy-check, workout flow, settings sub-screens): trigger interaction via Playwright (click → state transition → screenshot post-transition).

### §2.3 Structural diff

Compare:

**A. Layout structure:**
- Phone frame wrapper present / absent / different
- Header structure (logo + lang toggle + title hierarchy)
- Section ordering top-to-bottom
- Bottom nav 4 taburi visible + active state correctness
- Container max-width / padding / margin

**B. Visible text content (text-by-text):**
- Titles + subtitles
- Card labels (COACH-UL RECOMANDA AZI, FAZA: AUTO, OBOSEALA AZI, etc.)
- Button labels (Incepe sesiunea, Logheaza greutate azi, etc.)
- Italic citations / quotes
- Helper text + descriptions
- Section group labels (OBIECTIV, ALERTE AZI, NUTRITIE · AZI, etc.)
- Footer text (Andura v1.0.0 etc.)
- Romanian no-diacritics compliance LOCK V1 ✓ verify

**C. Components present:**
- Cards (count, type, content)
- Buttons (count, position, style — primary/secondary/ghost)
- Inputs / form elements
- Icons (Lucide identifiers, position, semantic)
- Lists / grids / tables
- Modals / overlays accessible
- Banners / alerts (Pattern Banner F1, Aggressive Loading LOCK 9, Medical Disclaimer LOCK 4)

**D. Visual tokens:**
- Color palette parity (background, accent #c8412e brick, ink hierarchy, success/warn/danger)
- Typography (Inter font + weights + sizes)
- Spacing rhythm 4/8 grid
- Border radius consistency
- Shadow elevations

**E. Behaviors / interactions:**
- Tap targets minimum 44x44 (a11y WCAG 2.5.5)
- Hover states (where applicable)
- Active state visual feedback (pressed buttons)
- Loading skeleton / spinner during async data fetch
- Empty state UX

### §2.4 Findings emission

Per divergență identificată, emit finding entry în `findings-<screenId>.md`:

```
### F-<screenId>-<NN> — <Short title>

**Severity:** CRIT | HIGH | MED | LOW | NIT
**Category:** Layout | Text | Component | Token | Behavior
**Mockup:** <verbatim quote / dimension / element>
**Prod:** <verbatim quote / dimension / element OR "ABSENT" / "EXTRA NOT IN MOCKUP">
**Mockup ref:** `04-architecture/mockups/andura-clasic.html:<line>` (cite line number)
**Prod ref:** `src/react/routes/screens/<file>.tsx:<line>` (cite line number)
**Karpathy fix attribution:** Surgical Changes | Simplicity First | Think Before Coding | Goal-Driven
**Fix effort estimate:** S (≤30min) | M (≤4h) | L (multi-file refactor)
**Beta blocker?** YES (Wave 1) | NO (Track 7 deferred OR Daniel post-Beta decision)
```

### §2.5 Severity rubric

- **CRIT:** Core feature missing OR core UX broken (e.g., entire OBIECTIV section absent Antrenor, calendar heatmap absent Istoric, alert banners 3 absent Progres)
- **HIGH:** Major UX divergence affecting Gigel/Marius/Maria 65 first impression (e.g., user name "Utilizator" generic prod vs "Daniel" email mock, phone frame absent desktop, scale Oboseala 6/10 mock vs 0/100 prod, duplicate buttons)
- **MED:** Secondary element missing OR wrong text/label (e.g., subtitle "Cine te ghideaza in sala" absent, footer "Andura v1.0.0" absent, icon pencil edit săpt absent)
- **LOW:** Polish / spacing / token drift (e.g., padding 16px vs 20px, border-radius 8px vs 12px)
- **NIT:** Cosmetic micro-difference (e.g., italic vs regular weight quote, color shade 1-2% off)

---

## §3 Output structure

```
📤_outbox/mockup-vs-prod-parity-2026-05-20/
├── _mockup-screens-registry.md       # §1.1 exhaustive mockup screens
├── _prod-routes-registry.md          # §1.2 exhaustive prod routes
├── _screen-mapping-matrix.md         # §1.3 cross-reference
├── _progress.md                      # checkpoint resume capable post crash
├── _mockup-<screenId>.png            # per screen mockup snapshot
├── _prod-<route>.png                 # per screen prod snapshot
├── findings-<screenId>.md            # per screen divergence file
├── findings-summary.md               # cross-screen pattern aggregation
└── SUMMARY.md                        # exec digest Daniel + severity matrix aggregate + top blockers + Karpathy distribution + production parity %
```

### §3.1 SUMMARY.md required sections

- §S1 Severity matrix aggregate (table per category × severity)
- §S2 Production parity % weighted score (per dimension: Layout 20% / Text 25% / Components 30% / Tokens 15% / Behavior 10%)
- §S3 Top 20 Beta blockers ordered by Bugatti impact
- §S4 Recommended fix waves (Wave 1 = Beta blocker pre-Launch ~1-3 days / Wave 2 = polish pre-Beta ~3-5 days / Wave 3 = Track 7 deferred)
- §S5 Karpathy 4 principii applied distribution
- §S6 Audit procedure compliance self-verify (§52 mirror D029 §52)
- §S7 Reconciliation with prior estimates — explică explicit de ce parity % măsurat aici diferă de rapoarte anterioare Co-CTO 95-96% post Track 7. Surse confuzie compound documented: (a) Phase N LANDED reports = feature-LOCAL coverage NU mockup-GLOBAL coverage (Phase 1 foundation 100% ≠ 100% mockup parity, Phase 3 Antrenor 8 sub-screens LANDED ≠ all 50+ mockup screens); (b) Track 7 Automated Testing = testing infrastructure (Playwright + Lighthouse + Stagehand + ratchet thresholds) NU feature build, ZERO mockup screens new, fals contabilizat în % readiness; (c) D029 audit 56.5% deja semnalase gap real 698 findings, Phase 7 Findings FIX D031 a închis 58 surgical fixes din 698 dar NU avea count verifiable mockup-vs-live coverage. Asta măsurătoare = ground truth per D041 anti-inflation discipline, NU compound estimate.

---

## §4 Procedure constraints (mirror D029)

### §4.1 Log-only ZERO auto-fix ZERO commit

NO `src/` modifications, NO commits during audit. Daniel decide fix-uri post-audit combined cu Track 7 backlog cluster. Per D031 procedure dacă fix demarat ulterior.

### §4.2 Continuous neîntrerupt

Auto-iterative deep-dive infinit post primary §2 per-screen loop:
- **Pass 1 primary (§2):** Per-screen comparison toate screens din §1.3 matrix
- **Pass 2 secondary:** CRIT + HIGH findings deep-dive (component-level decomposition)
- **Pass 3 tertiary:** MED findings cluster aggregation pattern detection
- **Pass 4 quaternary:** LOW + NIT polish backlog
- **Pass 5 quinary:** Cross-screen consistency patterns (e.g., header structure inconsistency across taburi, spacing token drift app-wide)
- ... until Daniel STOP

### §4.3 Resume capable

`_progress.md` checkpoint după fiecare screen LANDED — pe ce screen ești, pe ce pass ești, ce screens rămase. Post crash sau Daniel Ctrl+C, resume from checkpoint zero rework.

### §4.4 MCP filesystem write_file mandatory

D023 LOCKED V1 — toate vault writes via `filesystem:write_file` + post-write `filesystem:list_directory` verify. NU `create_file` pe Windows emoji paths (silent false success).

### §4.5 Mockup primary-source verification mandatory

D008 — ZERO recall din memorie. Orice claim mockup-side cite `04-architecture/mockups/andura-clasic.html:<line>` verbatim. Anti-halucinare strict.

### §4.6 Anti-inflation discipline

D041 — production parity % = measured score per dimension, NU compound estimate inflation. Format: "Measured: X% @ <screen-N> coverage". Sub-100% coverage scope honest.

---

## §5 Skills mandatory pre-task

- **Sequential Thinking** — root cause + fix recommendation reasoning per finding
- **Karpathy 4 principii** — attribution per finding (Surgical Changes dominant expected pentru text/token fixes; Think Before Coding pentru CRIT structural; Simplicity First pentru cleanup; Goal-Driven pentru Beta blocker prioritization)
- **Context7** — N/A doar dacă library reference (Tailwind class lookup, Lucide icon names)
- **gstack /qa + /review** — pre-finding self-review embedded
- **Impeccable /critique** — secondary pass meta-review aggregate SUMMARY.md
- **GitNexus** — N/A audit log-only

---

## §6 Skipped invariants (mockup DESIGN MASTER absolute per D015)

NU propune fix-uri către mockup. Mockup-ul ESTE Sursa de Adevăr per Daniel CEO directive 2026-05-16. Toate divergențele = prod must converge to mockup, NU invers.

Singura excepție: dacă mockup are bug evident (e.g., text "Andura v1.0.0" hardcoded 1.0.0 vs prod nu reflectă versiunea live), flag în SUMMARY.md §S7 "Mockup follow-up items Daniel review" — Daniel CEO decision.

---

## §7 Start trigger

CC autonomous citește acest prompt + execută §1 pre-flight imediat (mockup read full + routes registry grep + screen mapping matrix + Playwright verify) → §2 per-screen loop → §3 output → §4 continuous neîntrerupt passes 2-5 → STOP Daniel explicit.

ETA estimat:
- §1 pre-flight: ~15-30min
- §2 per-screen loop primary: ~3-5h (depinde de count screens accesibile prod authenticated)
- §3 SUMMARY: ~30min
- §4 secondary→quinary passes: ~5-10h cumulativ

Total primary pass complete: ~4-6h Opus 4.7 MAX thinking budget continuous. Daniel STOP poate veni oricând — checkpoint resume capable.

---

🦫 **Bugatti Audit Mockup vs Prod Parity. D015 mockup SoT. D029 procedure mirror. Log-only. Continuous neîntrerupt Opus MAX. Daniel STOP UNIC.**
