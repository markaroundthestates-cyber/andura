# Mockup screens registry — `andura-clasic.html` (50 screens)

**Source:** `04-architecture/mockups/andura-clasic.html` (4753 LOC)
**Generated:** 2026-05-20 (Pass 1 §1.1 pre-flight audit Mockup vs Prod Parity)
**Authority:** D015 LOCKED V1 — mockup DESIGN MASTER, prod must converge

## Categorical inventory (50 actual + 1 wrapper)

### Pre-app (10 screens — guest / auth / onboarding)

| Screen ID | Line | data-screen-label | Notes |
|-----------|------|-------------------|-------|
| `screen-splash` | 403 | (none) | Landing CTA → auth |
| `screen-auth` | 422 | (none) | Magic Link entry + Google + skip |
| `screen-auth-reactivate` | 2343 | Auth › Reactivate cont | Returning user reactivation |
| `screen-onboard` | 486 | (none) | Onboarding T0 intent |
| `screen-onb-varsta` | 545 | (none) | Age |
| `screen-onb-sex` | 572 | (none) | Sex |
| `screen-onb-inaltime` | 600 | (none) | Height |
| `screen-onb-greutate` | 627 | (none) | Weight |
| `screen-onb-medical` | 654 | (none) | Medical disclaimer + conditions |
| `screen-onb-frecventa` | 692 | (none) | Frequency / weekly cadence |

### Bottom nav 4 taburi (4 screens — main entries)

| Screen ID | Line | data-screen-label | Tab label | data-tab |
|-----------|------|-------------------|-----------|----------|
| `screen-antrenor` | 731 | Antrenor | Antrenor | antrenor |
| `screen-progres` | 1698 | Progres | Progres | progres |
| `screen-istoric` | 1155 | Istoric | Istoric | istoric |
| `screen-settings` | 1839 | Cont | Cont | settings |

Bottom nav source: line 2528-2547 (`<nav class="nav-bottom">` with 4 `<button class="nav-tab">`).

### Antrenor sub-screens (12 — workout flow)

| Screen ID | Line | data-screen-label |
|-----------|------|-------------------|
| `screen-energy-check` | 878 | Antrenor › Energy |
| `screen-energy-cause` | 900 | Antrenor › Cauza |
| `screen-workout-preview` | 914 | Antrenor › Preview sesiune |
| `screen-workout` | 1340 | Antrenor › Sesiune |
| `screen-ceva-nu-merge` | 1000 | Antrenor › Ceva nu merge |
| `screen-pain-button` | 1012 | Antrenor › Pain |
| `screen-equipment-swap` | 1026 | Antrenor › Echipament |
| `screen-aparate-lipsa` | 1050 | Aparate lipsa |
| `screen-schedule-override` | 1106 | Antrenor › Schimbi planul |
| `screen-post-rpe` | 1593 | Antrenor › Post-RPE |
| `screen-post-summary` | 1629 | Antrenor › Rezumat |
| `screen-log-weight` | 2393 | Antrenor › Logheaza greutate |

### Istoric sub-screens (4 — history exploration)

| Screen ID | Line | data-screen-label |
|-----------|------|-------------------|
| `screen-pr-wall` | 1241 | Istoric › Recorduri Personale |
| `screen-sesiuni-recente` | 2156 | Istoric › Sesiuni recente |
| `screen-loguri-greutate` | 2186 | Istoric › Loguri greutate |
| `screen-weight-timeline` | 2204 | Istoric › Greutate & BF |

### Cont/Settings sub-screens (13 — account / settings drill-downs)

| Screen ID | Line | data-screen-label |
|-----------|------|-------------------|
| `screen-settings-profile` | 1898 | Cont › Profil |
| `screen-settings-notifications` | 1942 | Cont › Notificari |
| `screen-settings-subscription` | 1969 | Cont › Abonament |
| `screen-settings-appearance` | 1991 | Cont › Aspect |
| `screen-settings-themes` | 2003 | Cont › Aspect › Teme |
| `screen-settings-prefs` | 2086 | Cont › Setari |
| `screen-settings-privacy` | 2040 | Cont › Confidentialitate |
| `screen-settings-terms` | 2063 | Cont › Termeni |
| `screen-settings-danger` | 2100 | Cont › Deconectare/Stergere |
| `screen-settings-export` | 2415 | Cont › Export date |
| `screen-settings-support` | 2436 | Cont › Suport |
| `screen-settings-about` | 2472 | Cont › Despre |
| `screen-settings-faq` | 2492 | Cont › FAQ |

### Confirm modals (7 — destructive actions confirmations)

| Screen ID | Line | data-screen-label |
|-----------|------|-------------------|
| `screen-confirm-reset-coach` | 2126 | Confirm › Reset coach |
| `screen-confirm-schimba-faza` | 2141 | Confirm › Schimba faza |
| `screen-confirm-redo-onboarding` | 2296 | Confirm › Refacere onboarding |
| `screen-confirm-logout` | 2311 | Confirm › Logout |
| `screen-confirm-delete` | 2326 | Confirm › Stergere |
| `screen-confirm-program-change` | 2363 | Confirm › Schimba program |
| `screen-confirm-finish-early` | 2378 | Confirm › Termina mai devreme |

## Phone frame wrapper structure

- Outermost: `<body>` flex center on neutral background
- Wrapper: `#phone` flex column 380px width × 812px height (mobile-first iPhone X-ish)
- Header: status bar simulation (line ~395)
- Content host: `#screen-container` (line 400) — `position: relative; overflow: hidden`
- Bottom nav: `<nav class="nav-bottom">` (line 2528) — 4 taburi
- Toast / overlays: appended to body level

Screen visibility toggle: `.screen { display: none; }` + `.screen.active { display: flex; }` per CSS rule. `goto(screenId)` JS function (line ~2960+) hides current, shows target, updates active class.

## CSS tokens (snapshot pentru parity reference)

Extracted from `:root` CSS variables block (line ~50-150):
- `--paper: #f6f0df` (cream paper background)
- `--ink: #1a1611` (primary text)
- `--ink-2: #3a3530` (secondary)
- `--ink-3: #7a6f5e` (tertiary helper)
- `--brick: #c8412e` (primary accent / CTA)
- `--line: #e0d8c2` (subtle border)
- `--line-strong: #c8b89a` (visible border)
- Typography: Inter system font, weights 400/500/600/700
- Spacing rhythm: 4/8 grid (4, 8, 12, 16, 20, 24, 32, 48)
- Border radius: 8 (sm), 12 (md), 16/20 (lg), 999 (pill)

## goto() screen transitions inventory (62+ unique calls)

Categorical (per grep §1.1):

**Splash → guest flow:**
- splash → auth (Incepe + Am deja cont)
- auth → splash (back)
- auth → onboard (Google + skip-auth + linkul demo)

**Onboarding linear:**
- onboard → onb-varsta → onb-sex → onb-inaltime → onb-greutate → onb-medical → onb-frecventa → antrenor

**Antrenor main → sub-screens:**
- antrenor → energy-check (Incepe sesiunea)
- antrenor → sesiuni-recente (ultima sesiune card)
- energy-check → workout-preview (3 energy buttons + 4 cause buttons)
- energy-cause → workout-preview (4 sub-causes)
- workout-preview → workout (start) / pain-button / ceva-nu-merge / equipment-swap / schedule-override / aparate-lipsa
- workout → post-rpe (finishWorkoutFlow) / pain-button (menu) / confirm-finish-early (menu)
- post-rpe → post-summary
- post-summary → antrenor

**Progres:**
- progres → log-weight (Logheaza greutate azi CTA)

**Istoric:**
- istoric → sesiuni-recente / pr-wall / loguri-greutate / weight-timeline

**Cont/Settings:**
- settings → 13 sub-screens (profile, notifications, subscription, appearance, prefs, privacy, terms, danger, export, support, about, faq) + aparate-lipsa + ceva-nu-merge
- settings-appearance → settings-themes
- settings-danger → confirm-reset-coach / confirm-redo-onboarding / confirm-schimba-faza / confirm-logout / confirm-delete

**Confirm modals routing back:**
- confirm-redo-onboarding → onboard (Confirma actiunea)
- confirm-* → settings (cancel)
- auth-reactivate → antrenor (Reactiveaza contul)

**Total mockup screens (excluding wrapper): 50**
