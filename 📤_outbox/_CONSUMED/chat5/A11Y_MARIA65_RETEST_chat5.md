# A11Y Maria 65 Persona Retest — chat 5

**Date:** 2026-05-23 (ACASA chat 5 deep-dive a11y persona pass)
**Mode:** READ-ONLY investigation (zero source edits)
**Manager:** main Claude chat (Co-CTO autonomous)
**Persona under test:** Maria 65 (conservativ varstnic — low vision + reduced motor + cognitive load minimization)
**Baseline:** D056 LOCKED V1 WCAG keyboard + screen reader fixes (focus-visible global + ExitConfirmSheet focus trap + forms aria-describedby/invalid/required)

---

## §1 Executive summary

**Verdict: READY-WITH-CAUTION.** Foundation strong (D056 WCAG 2.1 AA baseline solid: global focus-visible outline 2px brick + 3 modals cu focus trap + forms aria wired + skip-link + persona text scaling). 6 categorical gaps remaining nu blocheaza Beta tehnic (D056 + Track 7 axe-core continua iterate pre-launch) DAR Maria 65 friction palpabil pe 3 zone specifice.

**Critical findings:**
1. **Tap target <44px on ~15 interactive elements** — SubHeader back btn (~36px), Toast dismiss (~24px), Calendar7Day edit-toggle (~28px), UpdatePrompt CTA (~24px), Splash secondary link (~20px), SettingsProfile inputs/selects (~28px). Maria 65 motor friction sustained.
2. **Modal focus trap missing on 2 of 5 dialogs** — `InactivityPrompt.tsx` + `RestOverlay.tsx` ambele `role="dialog"` fara `previousFocusRef` + Tab cycle trap + Escape handler (AaFrictionModal + MedicalDisclaimerModal + ExitConfirmSheet au pattern, dar Inactivity + Rest NU). Maria 65 keyboard user pierde context inside fixed-position dialog.
3. **Text-ink3 AA-only (5.13:1) on 31 usages** — passes AA dar fail AAA 7:1 baseline pe persona 65+ low-vision. SC 1.4.6 AAA enhanced contrast NU obligatoriu Beta dar Bugatti craft gap.
4. **CoachTodayCard "Incepe sesiunea" CTA at ~40px** — primary persona Maria 65 home tap target pe primary action `py-2.5 font-semibold` line-height 1.5 = ~40px total. Sub-threshold pe key conversion.
5. **`focus:` Tailwind variants ZERO usage cross codebase** — exclusiv :focus-visible global. Solid fundamental DAR ZERO opportunity per-component focus refinement (mai bright pe primary CTAs, accessible name pe inputs cu state). Beta-acceptable, polish opportunity post.

---

## §2 Methodology

**Inputs:**
- Grep audit patterns: `p-1`, `p-1.5`, `p-2`, `py-1.5`, `py-2`, `py-2.5`, `h-6`, `h-8`, `w-4`, `w-5`, `min-h-[44`, `min-w-[44` (tap target sizing)
- `focus:`, `outline-none`, `:focus-visible` (focus indicator coverage)
- `aria-label`, `aria-labelledby`, `aria-hidden`, `aria-live`, `aria-modal`, `role="dialog"`, `role="alert"`, `role="status"` (screen reader semantics)
- `text-ink3`, `text-ink2`, `text-coach-meta` (color contrast — tokens defined `src/styles/global.css` §41-43)
- `previousFocusRef`, `tabIndex`, `onKeyDown` (focus management + keyboard handlers)

**Mockup parity check:** `04-architecture/mockups/andura-clasic.html`. Mockup uses `min-height:28px` pe `.rpe-pill` + `.set-edit-btn` + calendar header (sub-44px standard mockup-side). 44px tap target din audit `04-architecture/mockups/andura-clasic.html#L2878 .set-row grid template `32px 1fr 1fr 44px`` only on table column. Mockup is NOT a strict 44px-everywhere reference — prod has independent obligation pentru persona Maria 65.

**Flow walk:** Login (Auth.tsx) → Antrenor home (Antrenor.tsx + CoachTodayCard) → Workout session (SetLogInput + SetRatingButtons + RestOverlay) → PostRpe (3 rating buttons) → Settings danger zone (SettingsDanger → LogoutConfirm + DeleteAccountConfirm drill-down).

**Audit reference:** D056 LOCKED V1 baseline (3 atomic commits `3e42c164` + `953d4c06` + `0b6fddff`) + B036 SettingsPrivacy toggle expand 68×44px audit-resolved + Pass 9 Toggle shared component LANDED.

---

## §3 Tap target violations (<44px)

WCAG SC 2.5.5 Target Size (AAA) baseline 44×44 CSS px for pointer inputs (excluding equivalent inline/contextual). Maria 65 motor friction critical:

| # | File | Line | Element | Current size | Recommended |
|---|------|------|---------|--------------|-------------|
| 1 | `src/react/components/SubHeader.tsx` | 56 | Back arrow button | `p-2` + w-5 h-5 = ~36×36 | `p-3` or `min-w-[44px] min-h-[44px]` |
| 2 | `src/react/components/Toast.tsx` | 81 | Dismiss button | `p-1` + w-4 h-4 = ~24×24 | `min-w-[44px] min-h-[44px] flex items-center justify-center` |
| 3 | `src/react/components/Calendar7Day.tsx` | 78 | Edit-toggle pencil | `p-1.5` + w-4 h-4 = ~28×28 | `min-w-[44px] min-h-[44px]` |
| 4 | `src/react/components/Calendar7Day.tsx` | 100 | Day toggle buttons | `py-2 text-xs` = ~28 tall | `min-h-[44px] py-2` |
| 5 | `src/react/components/UpdatePrompt.tsx` | 73 | "Actualizeaza" CTA | `px-3 py-1.5 text-xs` = ~24 tall | `px-4 py-2.5 text-sm` (~40px) or `min-h-[44px]` |
| 6 | `src/react/components/InstallPrompt.tsx` | 80 | "Instaleaza" CTA | `px-3 py-2 text-xs` = ~28 tall | `min-h-[44px]` |
| 7 | `src/react/components/InstallPrompt.tsx` | 89 | Dismiss X | `p-2` + w-4 h-4 = ~32×32 | `min-w-[44px] min-h-[44px]` |
| 8 | `src/react/routes/screens/Splash.tsx` | 73 | "Am deja cont" secondary link | `text-sm underline` no padding ~20px | wrap în button `py-2 px-3` or convert to button |
| 9 | `src/react/routes/screens/Auth.tsx` | 98 | "Inapoi" back-splash | `p-2` + w-5 h-5 = ~36×36 | `min-w-[44px] min-h-[44px]` |
| 10 | `src/react/routes/screens/Auth.tsx` | 157 | "Schimba emailul" secondary | `text-sm underline` ~20px | wrap în button cu padding |
| 11 | `src/react/routes/screens/Auth.tsx` | 264 | Mock login dev (DEV only) | `py-2 text-xs` = ~24 tall | non-Beta — skip |
| 12 | `src/react/routes/screens/cont/SettingsProfile.tsx` | 106, 120, 129, 153, 168, 182 | All inputs/selects | `px-2.5 py-1.5 text-sm` = ~28 tall | `py-2.5 text-base` (~40px) sau `min-h-[44px]` |
| 13 | `src/react/components/Antrenor/CoachTodayCard.tsx` | 185 | "Incepe sesiunea" primary CTA | `py-2.5 font-semibold` ~40 tall | `py-3` (~48) or `min-h-[44px]` |
| 14 | `src/react/components/Antrenor/CoachRestCard.tsx` | 94 | "Sesiune usoara" CTA | `py-2.5 font-medium` ~40 tall | `py-3` or `min-h-[44px]` |
| 15 | `src/react/components/Antrenor/CoachRestCard.tsx` | 102 | "Vreau totusi" link | text-only underline ~20px | wrap în button padding |
| 16 | `src/react/components/Antrenor/ReactivateCard.tsx` | 47, 54 | "Incep usor"/"Mai tarziu" CTAs | `px-3 py-2.5 text-sm` ~36 tall | `py-3` or `min-h-[44px]` |
| 17 | `src/react/components/Antrenor/ResumeSessionCard.tsx` | 58, 68 | "Reia"/"Renunta" CTAs | `px-3 py-2 text-sm` ~28 tall | `min-h-[44px]` |
| 18 | `src/react/components/Workout/InactivityPrompt.tsx` | 57, 65 | "Continui"/"Salveaza si iesi" | `py-2.5 text-sm` ~36 tall | `py-3` or `min-h-[44px]` |
| 19 | `src/react/routes/screens/progres/LogWeight.tsx` | 68 | Back button | `p-2` + w-5 h-5 = ~36×36 | `min-w-[44px] min-h-[44px]` |

**Total:** ~19 distinct files / ~24 violations. Most clustered SubHeader (sub-screens 20+) + secondary card CTAs + inputs.

**Compliant baseline (good examples)** for reference:
- `Toggle.tsx` §B036 LANDED — `before:-inset-2.5` invisible hit area expand 68×44 (Pass 9 shared component used pe SettingsPrivacy + SettingsNotifications)
- `SetLogInput.tsx` `tinta` mode "Logheaza setul" — `min-h-[44px]` explicit
- `SetLogInput.tsx` `post-log` pencil edit — `min-w-[44px] min-h-[44px]`
- `SessionTimer.tsx` pause/menu buttons — `min-w-[44px] min-h-[44px]`
- `ObiectivSelector.tsx` rows — `px-4 py-3 min-h-[44px]` (per docstring §22 explicit Maria 65 WCAG 2.5.5)
- `PostRpe.tsx` 3 rating buttons — `p-4` flex-col = ~80+ tall safe
- `Onboarding.tsx` Step2/3/4 buttons — `p-4` ~52 tall safe
- `Auth.tsx` "Trimite link de intrare" + Google + Skip — `py-4` ~56 safe

---

## §4 Low-contrast text — text-ink3 / text-ink2 audit

**Color token definitions** (`src/styles/global.css` §32-46):
- `--ink` = `#1a1815` → 17.94:1 vs paper #faf7f1 — AAA
- `--ink-2` = `#3a342d` → 11.57:1 — AAA
- `--ink-3` = `#6e6862` → 5.13:1 — AA pass (NU AAA 7:1 enhanced)
- `--line-strong` = `#9a8770` → 3.23:1 — SC 1.4.11 non-text 3:1 pass (interactive boundaries)

**`text-ink3` usage count:** 31 sites cross `src/react/`.

**`text-ink2` usage count:** 301 sites cross `src/react/`.

**Risk assessment Maria 65:**
- `text-ink3` AA-only — vulnerabil pentru 65+ low-vision users la rapid scanning context (sub-meta text, helper hints, footer fine-print). Specific high-frequency sites:
  - `Auth.tsx#256` skip-risk-note `text-xs text-ink3` — important consimtamint informat block; cumul fine-print + low-contrast Maria-friction.
  - `Auth.tsx#279` terms footer — legal compliance text-ink3, sub-AAA.
  - `SettingsDanger.tsx#85` "30 zile gratie pentru recuperare" — destructive action grace period info-cue critical pentru Maria 65 confort decizie.
  - `Splash.tsx#79` trust footer "Facut in Romania" — brand anchor text-ink3, low-priority.
  - `CalendarHeatmap.tsx#144` weekday letters `text-[10px] text-ink3` — calendar legibility key Istoric tab Maria 65 scan.
  - `Istoric/PrWall.tsx#84` empty-state w-12 h-12 text-ink3 icon decoration only — OK.

- `text-ink2` AAA pass — safe, NU concern.

**Recommendation:** dezi-prioritize text-ink3 → text-ink2 swap pentru substantive/decision-affecting copy (Auth risk-note + SettingsDanger grace period + skip-risk explainers). Decorative/footer text-ink3 acceptabil.

---

## §5 Focus ring gaps

**Outline removal audit grep `outline-none|outline:none`:**
- ZERO `outline-none` Tailwind class in `src/react/` (NO violations introduced).
- 2 legacy CSS files with `outline:none` (legacy vanilla src/styles/main.css §73 + §190 .ex-pick select + .wdi widget) — both retired vanilla; NU React production path.

**Focus indicator strategy:**
- D056 baseline `src/styles/global.css#152-156` `:focus-visible { outline: 2px solid var(--brick); outline-offset: 2px; border-radius: inherit; }` global @layer base. Brick swap automat dark theme via `[data-theme=dark]` block.
- Skip-link `Layout.tsx#46-49` custom focus styling `focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:bg-brick focus:text-paper` — only `focus:` variant used cross codebase.
- `focus:` Tailwind variants in components/routes: **0 usage**. No per-component focus refinement → uniform brick outline 2px everywhere.

**Findings:**
1. **Beta-acceptable foundation** — D056 covers WCAG SC 2.4.7 Focus Visible (Level AA mandatory). Global rule means EVERY interactive `<button>`, `<input>`, `<a>`, `<select>` gets visible focus.
2. **Polish opportunity (post-Beta)** — Primary CTAs (brick background "Incepe sesiunea", "Trimite link") get brick-on-brick outline (same color stack). Outline-offset 2px helps separate, dar contrast outline-vs-bg = ~1:1 visible only via offset. Maria 65 sub-optimal pe primary CTAs specific.
3. **No critical gap pre-Beta.** Polish ticket: per-CTA `focus-visible:outline-paper` swap pentru brick-background buttons → outline visible on brick.

---

## §6 Flow walk findings — 5 critical Maria 65 paths

### Flow A — Login (Magic Link auth) — `src/react/routes/screens/Auth.tsx`

**State:** SOLID. WCAG 2.1 AA compliant largely (D056 forms aria fix).

**Concerns:**
- `Auth.tsx#98` back arrow `p-2` ~36×36 tap target (violation §3#9).
- `Auth.tsx#157` "Schimba emailul" text-only link ~20 height (violation §3#10).
- `Auth.tsx#256` skip-risk-note `text-ink3` cumulative AA-only low-vision friction (§4).
- `Auth.tsx#226` Google CTA `py-3 text-sm` = ~40 tall sub-44px on the secondary OAuth path.
- `Auth.tsx#243` Skip-auth "Incearca fara cont" `py-3 text-sm` similar ~40 tall.

**Positive:** input `p-4 text-base` = ~52px tall AAA. Primary "Trimite link de intrare" `py-4 text-base` = ~56 AAA. aria-describedby + aria-invalid + aria-required wired D056. autoComplete="email" Maria typing-relief. inputMode="email" mobile keyboard hint.

### Flow B — Antrenor home tab — `src/react/routes/screens/antrenor/Antrenor.tsx`

**State:** PARTIAL. Cards dense (8-9 stacked elements per persona context) — cognitive load moderate.

**Concerns:**
- `CoachTodayCard#185` primary "Incepe sesiunea" CTA `py-2.5` ~40px sub-44px (violation §3#13) — **THIS IS THE KEY MARIA 65 CONVERSION TAP**.
- `CoachTodayCard#190` "Vrei altceva azi?" override `text-sm underline` ~20px (violation §3#15 sister).
- `CoachRestCard#94` "Sesiune usoara mobilitate" CTA `py-2.5` ~40px sub-44px.
- `CoachRestCard#102` "Vreau totusi antrenament" text-only ~20px.
- `Calendar7Day#78` edit-toggle pencil ~28px (violation §3#3).
- `Calendar7Day#100` day toggle buttons `py-2 text-xs` ~28px (violation §3#4) — 7 day rotation Maria scan + tap.
- `Antrenor#200` final "Incepe antrenament" fallback CTA `py-3 font-semibold` ~48px OK.

**Positive:** SkipToContent link first-tab focus reach BottomNav skip pattern. AlertsBanner role=alert + aria-live=assertive for urgent (Maria 65 safety signal). PatternsBanner role=status polite. CoachTodayCard role=region + aria-label.

### Flow C — Workout session — `src/react/routes/screens/antrenor/Workout.tsx` + `SetLogInput.tsx` + `SetRatingButtons.tsx` + `RestOverlay.tsx`

**State:** SOLID. Mid-session safety paramount. D056 ExitConfirmSheet focus trap LANDED.

**Concerns:**
- `RestOverlay.tsx#43` `role="dialog"` aria-label="Pauza activa" DAR **NO focus trap, NO Escape handler, NO previousFocusRef restore**. Maria 65 keyboard user during rest: Tab cycles into BottomNav (hidden in-session) or stuck inside SVG ring.
- `InactivityPrompt.tsx#36` `role="dialog"` similar gap — no aria-modal, no focus trap, no Escape handler. Mid-session "Esti acolo?" dialog Maria 65 keyboard user nu poate Tab-trap.
- `InactivityPrompt.tsx#57,65` button pairs `py-2.5 text-sm` ~36 sub-44px (violation §3#18).

**Positive:** SetLogInput tinta mode "Logheaza setul" `min-h-[44px]` explicit AAA. SetLogInput post-log pencil `min-w-[44px] min-h-[44px]` AAA. SetRatingButtons 3-button `py-3` + flex-col 2-line = ~56px tall safe. ExitConfirmSheet full focus trap + Escape + previousFocusRef LANDED D056 (commit `953d4c06`). SessionTimer pause/menu buttons `min-w-[44px] min-h-[44px]` AAA.

### Flow D — PostRpe — `src/react/routes/screens/antrenor/PostRpe.tsx`

**State:** EXEMPLARY. Best-in-class persona-friendly screen.

**Concerns:** NONE substantive.

**Positive:**
- 3 rating buttons `p-4 flex items-center gap-4` two-line label + description = ~80px tall AAA tap.
- Emoji `text-3xl` (~30px font-size) high-visibility, aria-hidden decorative — preserve accessible name "Usoara"/"Normala"/"Grea" screen reader.
- Coach quote intro `text-base italic` warm + persona voice (D-LEGACY-052 Andura Suflet brand) "Raspunsul tau calibreaza sesiunea de maine".
- Footer gratitude "Multumim" persona voice consistent.
- role="list" aria-list on container — screen reader announces "list, 3 items".

### Flow E — Settings danger zone — `SettingsDanger.tsx` + `LogoutConfirm.tsx` + `DeleteAccountConfirm.tsx`

**State:** SOLID per D047 RIP-OUT drill-down paradigm.

**Concerns:**
- SubHeader back button (SubHeader.tsx#56) `p-2` ~36px tap target — 20+ screens cumulative (violation §3#1).
- SettingsDanger row buttons `px-4 py-3.5` ~52px AAA OK.
- Romanian language clear simple:
  - LogoutConfirm "Datele tale raman salvate pe email. La urmatoarea intrare cu acelasi email le vei regasi exact unde le-ai lasat." — clear cause-effect, NU jargon.
  - DeleteAccountConfirm "Aceasta actiune **nu poate fi anulata**" + "Toate datele tale (locale + remote) vor fi sterse imediat" — irreversibility communicated.
  - SettingsDanger row sub-text "30 zile gratie pentru recuperare" — Maria 65 grace period comfort (BUT text-ink3 §4 contrast concern).
- D047 drill-down paradigm = NO modal stacking depth (eliminated). Maria 65 cognitive load minimal — Back arrow returns SettingsDanger, Confirm or Cancel returns to /auth or settings-danger.

**Positive:** D047 paradigm = uniform drill-down ZERO modal stacking. authSignOut() pre-navigate clears Firebase tokens (§A007). isAuthFresh() reauth gate (§A016). GDPR Art. 17 Tier 1 + Tier 2 wipe (§B039).

---

## §7 Cognitive load gaps

**Modal stacking depth audit:**
- 5 modals total: AaFrictionModal + MedicalDisclaimerModal + ExitConfirmSheet + InactivityPrompt + RestOverlay + workout menu sheet (SessionTimer#177).
- **No nested modal stacking found** — only 1 modal active at a time per route (post-D047 RIP-OUT eliminating ConfirmModal stacking with parent screen).
- Workout session: ExitConfirmSheet exclusive (workout menu opens its own dialog) — no concurrent.

**Voice consistency (Andura Suflet D-LEGACY-052):**
- PostRpe + CoachTodayCard + CoachRestCard: warm coach voice ("Raspunsul tau calibreaza", "Pectoralii recupereaza", "Hai sa o facem curat") — consistent.
- LogoutConfirm + DeleteAccountConfirm: clear factual + warm reassurance ("Datele raman salvate pe email") — voice match.
- Toast/InstallPrompt/UpdatePrompt: terse system voice ("Actualizeaza", "Instaleaza") — NEUTRAL, NOT warm-coach voice. Acceptable system-level register.
- ReactivateCard "N-am vorbit de N zile. Fara presiune - reluam usor" — voice exemplar warmth + no paternalism.
- Romanian no-diacritics compliance UI per D-LEGACY-064 — verified spot-check (varsta, iesi, sterge, salveaza, anuleaza — all sans-diacritice).

**Surprise auto-navigation audit:**
- PostRpe.tsx#157 auto-navigate('/app/antrenor/post-summary') after handleSubmit — user-triggered (3 rating buttons), NU surprise.
- SettingsDanger drill-down buttons → user-triggered navigate per click. NU surprise.
- ExitConfirmSheet onChoose('continue') backdrop tap = continue semantic (NOT close+exit) — anti-surprise prevention.
- RestOverlay onSkip user-triggered.
- **One potential surprise:** PostRpe.tsx#97 error toast + `navigate(gotoPath('antrenor'))` ON ERROR (datele lipsesc) — auto-navigates BACK without explicit user dismissal. Maria 65 might be confused — toast surfaces only briefly + redirect. NU blocker (recovery path) DAR Bugatti polish ticket.

**Progressive disclosure check:**
- Settings sub-screens (Profile, Preferences, etc.) drill-down 1-level — Maria 65 cognitive depth acceptable.
- D047 drill-down paradigm = NO surprise modals on destructive actions (logout/reset/delete). Confirm flow is 2-tap minimum (Settings → Danger → drill-down → Confirm).

---

## §8 Recommendations (prioritized)

### HIGH priority (Pre-Beta blocker-adjacent / Maria 65 friction primary)

1. **SubHeader back button tap expand `p-2` → `min-w-[44px] min-h-[44px]`** — cumul 20+ screens. Single-file edit `src/react/components/SubHeader.tsx#56-63`. Cost ~5 min, impact cross-app.
2. **CoachTodayCard "Incepe sesiunea" `py-2.5` → `min-h-[44px]` or `py-3`** — primary Maria 65 conversion. Sister CoachRestCard "Sesiune usoara". Cost ~5 min.
3. **Add focus trap + Escape + previousFocusRef to InactivityPrompt + RestOverlay** — replicate ExitConfirmSheet pattern (D056 commit `953d4c06`). Both mid-session safety dialogs Maria 65 keyboard user blocker. Cost ~30-45 min combined + extend tests.
4. **Auth.tsx "Schimba emailul" + Splash "Am deja cont" secondary text-only links → wrap în button cu padding** — convert text-only underline to proper button `py-2 px-3` for tap target. Cost ~5 min.

### MED priority (Polish saturation pre-Beta acceptable)

5. **SettingsProfile inputs/selects `py-1.5 text-sm` → `py-2.5 text-base` or `min-h-[44px]`** — 6 fields one screen. Single edit. Cost ~10 min.
6. **Toast dismiss + InstallPrompt dismiss + Calendar7Day edit-toggle small icon-buttons → expand `min-w-[44px] min-h-[44px]`** — 3 sites + Calendar day buttons `py-2 text-xs` → `min-h-[44px]`. Cost ~15 min.
7. **UpdatePrompt + InstallPrompt CTAs `px-3 py-1.5 text-xs` → `px-4 py-2.5 text-sm` or `min-h-[44px]`** — banner notifications Maria 65 actionability. Cost ~5 min.
8. **ReactivateCard + ResumeSessionCard + InactivityPrompt button pairs `py-2.5 text-sm` → `py-3 text-base` or `min-h-[44px]`** — 6 buttons cumul. Cost ~10 min.

### LOW priority (Bugatti craft post-Beta polish)

9. **text-ink3 → text-ink2 swap pentru substantive Auth.tsx skip-risk-note + SettingsDanger grace period + risk explainers** — AA → AAA enhanced contrast Maria 65 low-vision. Cost ~10 min.
10. **CalendarHeatmap weekday letters `text-[10px] text-ink3` → `text-[11px] text-ink2`** — Istoric Maria 65 scan clarity. Cost ~3 min.
11. **Per-CTA `focus-visible:outline-paper` swap pentru brick-background primary CTAs** — outline-on-brick contrast polish. ~10 sites. Cost ~30 min.
12. **PostRpe error-path redirect → swap auto-navigate for explicit user-dismiss toast + action button "Inapoi la antrenor"** — anti-surprise hardening. Cost ~10 min.

**Estimated total HIGH priority effort:** ~50-60 min (4 atomic commits Bugatti single-concern).
**Estimated total MED priority effort:** ~40 min (4 atomic commits).
**Estimated total LOW priority effort:** ~55 min (4 atomic commits).
**Cumulative ~2.5h dev time** to close all 12 recommendation items.

---

## §9 Cross-refs

- **DECISIONS.md §D056** — A11y CRIT + HIGH Beta-blockers baseline LOCKED V1 (2026-05-23). 3 atomic commits `3e42c164` (focus-visible) + `953d4c06` (ExitConfirmSheet aria-modal + focus trap + Escape + restore) + `0b6fddff` (forms aria-describedby + aria-invalid + aria-required).
- **DECISIONS.md §D047** — ConfirmModal A003 RIP-OUT + uniform drill-down paradigm Bugatti consistency. SettingsDanger flow LogoutConfirm + DeleteAccountConfirm tested §5.
- **DECISIONS.md §D-LEGACY-052** — Andura Suflet brand soul Gigel-friendly anti-surveillance Romanian-first. Voice consistency verified §7.
- **DECISIONS.md §D-LEGACY-064** — Romanian no-diacritics LOCK V1 PERMANENT. UI strings compliance verified spot-check.
- **ITER_2_PLAN.md §B036** — SettingsPrivacy toggle h-11 (44px) sau invisible hit area expand Maria 65. LANDED Pass 9 Toggle shared component `before:-inset-2.5` invisible hit expand 68×44px.
- **WCAG 2.1 references:**
  - SC 1.4.3 Contrast Minimum AA (4.5:1) — text-ink, text-ink-2, text-ink-3 all pass.
  - SC 1.4.6 Contrast Enhanced AAA (7:1) — text-ink-3 (5.13:1) AA-only, AAA fail.
  - SC 1.4.11 Non-text Contrast (3:1) — line-strong 3.23:1 pass.
  - SC 2.1.1 Keyboard — full keyboard reachable post D056.
  - SC 2.1.2 No Keyboard Trap — ExitConfirmSheet LANDED, InactivityPrompt + RestOverlay GAP.
  - SC 2.4.1 Bypass Blocks — Skip-link "Sari la continut" Layout.tsx#44-49 LANDED.
  - SC 2.4.7 Focus Visible — D056 global :focus-visible LANDED.
  - SC 2.5.5 Target Size AAA (44×44) — ~19 violations §3 outstanding.
  - SC 3.3.1 Error Identification + SC 3.3.3 Error Suggestion — forms aria-describedby D056 LANDED.
  - SC 4.1.2 Name Role Value — aria-label / aria-labelledby coverage strong (58 aria-label + 62 aria-hidden sites).
- **Audit reports cross-ref:**
  - `📤_outbox/PRE_BETA_WALKTHROUGH_PREP_chat5.md` §3 Persona flow walkthrough.
  - `📤_outbox/audit-nuclear-2026-05-19/` (findings-§01/05/06/07/50 Maria 65 spot-checks).
  - `📤_outbox/mockup-vs-prod-parity-2026-05-20/findings-splash.md` Splash mockup parity.
  - This file `📤_outbox/A11Y_MARIA65_RETEST_chat5.md` — deep-dive persona retest.

---

## §10 Verdict

**READY-WITH-CAUTION pre-Beta:**
- D056 LOCKED V1 baseline = WCAG 2.1 AA solid foundation (keyboard nav + focus visible + screen reader forms + skip-link + persona text scaling).
- ~19 tap target <44px violations = SC 2.5.5 AAA gap. Beta-acceptable AA baseline (44px AAA not legally mandatory EU pre-Beta).
- 2 modal focus trap gaps (InactivityPrompt + RestOverlay) = SC 2.1.2 partial — keyboard user mid-session friction.
- text-ink3 AA-only on 31 sites = SC 1.4.6 AAA gap — Maria 65 low-vision low-priority friction.
- Modal stacking ZERO (post-D047) + voice consistency strong + surprise navigation negligible — Maria 65 cognitive load minimal.
- Romanian no-diacritics + clear copy + warm coach voice + reassuring destructive action messaging — persona language fit excellent.

**Maria 65 production readiness:** Beta launch survivable. Polish HIGH 4 items pre-Beta recommended (~50-60 min dev) closes substantive friction. MED + LOW polish saturation post-Beta acceptable per Bugatti "Refactor later NEVER happens" warning DAR D056 baseline + post-D047 drill-down + persona text scaling Maria 65 = pillar foundations solid.

**Audit confidence:** HIGH (grep + flow walk + mockup parity + cross-ref D056/D047/D-LEGACY-052/D-LEGACY-064 + LATEST + walkthrough prep reports cumulative).
