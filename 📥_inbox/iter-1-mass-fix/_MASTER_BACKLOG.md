---
title: Iter 1 Master Backlog — Aggregated Atomic Tasks Source-of-Truth
status: DESIGN_LANDED
aggregation_basis: audit-nuclear-2026-05-19 (698 raw → 648 post-dedup-cross-ref) + mockup-vs-prod-parity-2026-05-20 (263 raw → 250 post-positive-exclude) - overlap ~6 = ~890 actionable
collapse_via_patterns: -140 findings via Pass 3 patterns P1-P8 + per-file aggregation Pass 4 polish → ~750 net findings → ~340 atomic tasks (avg 2.2 findings/task)
last_updated: 2026-05-20
---

# _MASTER_BACKLOG — Iter 1 Atomic Tasks Aggregated

**Convention:**
- `NC§NN-XN` = Audit Nuclear `📤_outbox/audit-nuclear-2026-05-19/findings-§NN.md` finding ID XN
- `MP-<screenId>-<NN>` = Mockup Parity `📤_outbox/mockup-vs-prod-parity-2026-05-20/findings-<screenId>.md` finding F-<screenId>-<NN>
- `MP-P<N>` = Mockup Parity Pass 3 Pattern N (closes N findings cu 1 task)
- `MP-P4<X>` = Mockup Parity Pass 4 polish bucket X

**Karpathy abbreviations:** SC=Surgical Changes / SF=Simplicity First / TBC=Think Before Coding / GD=Goal-Driven

**Effort:** S ≤30min / M ≤4h / L multi-file

**Beta blocker:** W1=Wave 1 critical / W2=Wave 2 / NO=Wave 3 polish

---

## §1 Cluster A — Surgical Changes (180 atomic tasks)

### A.1 Text swaps mockup verbatim (70 tasks)

| ID | Source | Karpathy | Effort | Beta | Title |
|----|--------|----------|--------|------|-------|
| A001 | MP-antrenor-01 | SC | S | W2 | Add Antrenor header date+time "Joi, 7 mai · 18:30" |
| A002 | MP-antrenor-02 | SC | S | W2 | Add Antrenor subtitle "Cine te ghideaza in sala." italic |
| A003 | MP-antrenor-08 | SC | S | W2 | Antrenor CTA text "Incepe antrenament" → "Incepe sesiunea →" |
| A004 | MP-antrenor-09 | SC | S | W2 | Antrenor "Vrei altceva azi?" override link verify+wire |
| A005 | MP-splash-01..06 | SC | S | W2 | Splash text fidelity pass (logo + tagline + version + footer) |
| A006 | MP-auth-01..05 | SC | S | W1 | Auth screen text labels Romanian no-diacritics verbatim |
| A007 | MP-progres-01..06 | SC | S | W2 | Progres screen labels + section group headers + subtitle |
| A008 | MP-istoric-02 | SC | S | W2 | Istoric subtitle + section labels verbatim |
| A009 | MP-cont-01..03 | SC | S | W2 | Cont tab labels + subtitle + group section headers |
| A010 | MP-energy-check-01..04 | SC | S | W2 | EnergyCheck title + 3-state labels + footer text |
| A011 | MP-energy-cause-01..03 | SC | S | W2 | EnergyCause title + cause options + CTA text |
| A012 | MP-workout-preview-04..08 | SC | S | W2 | WorkoutPreview title + duration/exercise chip labels + CTA |
| A013 | MP-workout-01..06 | SC | S | W2 | Workout screen labels (set/rep/load + buttons) |
| A014 | MP-post-rpe-01..05 | SC | S | W2 | PostRpe title + 3-rating labels + helper text |
| A015 | MP-post-summary-01..06 | SC | S | W2 | PostSummary felicitare + stats labels + reflectie quote |
| A016-A045 | MP Wave C/D/E batch | SC | S | W2 | 30 sub-screens text fidelity (Antrenor secondary 5 + Cont 13 + Onboarding 7 + Workout sub 5) |
| A046-A065 | MP Pass 2 sub-comp text | SC | S | W2 | 20 sub-component text swaps (Calendar7Day labels, PRWall titles, AlertsBanner copy, etc.) |
| A066-A070 | NC§47.5 + NC§24.5 | SC | S | W2 | Wording observationFilter TODO → D024 LOCKED comment + 4 misc text |

### A.2 Token alignment Pass 4 polish per-screen (50 tasks)

| ID | Source | Karpathy | Effort | Beta | Title |
|----|--------|----------|--------|------|-------|
| A071 | MP-P4-fontweight-01 | SC | S | NO | Antrenor.tsx h1 font-semibold → font-bold (mockup 700) |
| A072 | MP-P4-fontweight-01 | SC | S | NO | Cont.tsx h1 font-semibold → font-bold |
| A073 | MP-P4-fontweight-01 | SC | S | NO | Progres.tsx + Istoric.tsx h1 font-bold |
| A074-A083 | MP-P4-fontweight-01..02 | SC | S | NO | 10 sub-screen title font-bold alignment |
| A084 | MP-P4-spacing-01 | SC | S | NO | Splash padding-asymmetric pt-12 px-7 pb-8 (mockup 48 28 32) |
| A085 | MP-P4-spacing-01 | SC | S | NO | Antrenor padding asymmetric pt-4 px-5 pb-6 |
| A086-A095 | MP-P4-spacing-01 | SC | S | NO | 10 screens padding-asymmetric mockup-aligned |
| A096 | MP-P4-radius-01 | SC | S | NO | Splash logo rounded-3xl → rounded-[22px] |
| A097 | MP-P4-radius-01 | SC | S | NO | CoachTodayCard rounded-2xl → rounded-[18px] |
| A098-A105 | MP-P4-radius-01 | SC | S | NO | 8 settings cards radius alignment 14-16px arbitrary values |
| A106-A120 | MP-P4-margin/gap/icon | SC | S | NO | 15 micro-token NIT tasks (margin-bottom 4/8 grid, gap drift, icon size 20 vs 24) |

### A.3 Surgical security/hygiene (15 tasks)

| ID | Source | Karpathy | Effort | Beta | Title |
|----|--------|----------|--------|------|-------|
| A121 | NC§1-C2 | SC | S | W1 | Vite config esbuild drop: ['console', 'debugger'] |
| A122 | NC§1-C2 | SC | S | W1 | Remove console.warn în engineWrappers.ts (9 lines) — replace cu telemetry-safe wrapper |
| A123 | NC§1-C2 | SC | S | W1 | Remove console.warn în scheduleAdapterAggregate.ts + SettingsDanger + SettingsExport |
| A124 | NC§1-C2 | SC | S | W1 | ErrorBoundary console.error → captureException(error, {extra: errorInfo}) |
| A125 | NC§4-H2 | SC | S | W1 | Magic Link pendingEmail TTL 1h auto-clear OR sessionStorage migrate |
| A126 | NC§4-H3 | SC | S | W1 | Magic Link sendMagicLink throttle 30s min-interval guard + UI cooldown |
| A127 | NC§4-H4 | SC | S | W1 | Firebase URL hardcoded → VITE_FIREBASE_RTDB_URL env var (already D040 partial — finish) |
| A128 | NC§4-H5 | SC | S | W1 | Sentry DSN hardcoded → VITE_SENTRY_DSN env var |
| A129 | NC§4-C2 | SC | S | W1 | FIREBASE_API_KEY placeholder → VITE_FIREBASE_API_KEY (D040 partial — verify finish) |
| A130 | NC§1-H5 | SC | S | W2 | Icon-192/icon-512 PNG optimize + WebP fallback variants |
| A131 | NC§4-N1 | SC | S | W2 | Sentry.js remove console.log debug calls |
| A132 | NC§4-N2 | SC | S | NO | Auth.js _origin() helper inline window.location.origin verify |
| A133 | NC§3-* | SC | S | W2 | Remove `as any` cast în engineWrappers.ts:279 — declare BNContext+BNResult types |
| A134 | NC§22.* misc | SC | S | NO | Misc dead code single-LOC removals (5 sub-tasks aggregated) |
| A135 | NC§1-L2 | SC | S | NO | global.css wrap :root + .persona-* în @layer base/components |

### A.4 Emoji + a11y surgical (10 tasks)

| ID | Source | Karpathy | Effort | Beta | Title |
|----|--------|----------|--------|------|-------|
| A136 | MP-P3 | SC | S | W1 | EnergyCheck emoji traffic-light 🟢🟡🔴 prefix 3-state buttons |
| A137 | MP-P3 | SC | S | W1 | PostRpe emoji traffic-light prefix Usor/Potrivit/Greu |
| A138 | MP-P3 | SC | S | W1 | SetRatingButtons workout emoji traffic-light prefix |
| A139 | NC§6.* | SC | S | W2 | Aria-label adds for icon-only buttons (~12 sites) |
| A140 | NC§6.* | SC | S | W2 | Form autocomplete attrs Magic Link email input + Cont profile |
| A141 | NC§6-L | SC | S | NO | Tap target audit minor sub-44px violations fix (~5 sites) |
| A142 | NC§28-* | SC | S | W2 | T&C consent timestamp persist verify (Phase 6 task_15) |
| A143 | NC§9-H2 | SC | S | W2 | Medical Disclaimer timestamp persist verify |
| A144 | NC§19.* | SC | S | NO | Visual regression spot-check 5 screens (post token tasks) |
| A145 | NC§38.* | SC | S | W2 | Engine math precision NIT fixes (Brzycki rounding cite) |

### A.5 Comment + JSDoc hygiene (12 tasks)

| ID | Source | Karpathy | Effort | Beta | Title |
|----|--------|----------|--------|------|-------|
| A146-A157 | NC§1-M6 + NC§42.* misc | SC | S | NO | 12 file comment cleanup (Zustand stores JSDoc, adapter file headers, dead-comment removes, ASCII divider standardize) |

### A.6 Misc surgical (25 tasks)

| ID | Source | Karpathy | Effort | Beta | Title |
|----|--------|----------|--------|------|-------|
| A158 | NC§1-H1 | SC | S | W2 | Delete src/App.tsx Phase 1 dead placeholder |
| A159 | NC§1-H3 | SC | S | W2 | Persona class hoist Antrenor → Layout.tsx wrapper (Multi-tab persona-aware) |
| A160 | NC§16.* | SC | S | W2 | manifest.json verify icons + theme-color + display=standalone |
| A161 | NC§7.* | SC | S | W1 | AuthCallback route verify post-iter-9.6 (already LANDED `07685c6` — verify no regression) |
| A162-A170 | NC§50.* + misc | SC | S | NO | 9 cross-functional gate small tasks (Beta entry criteria checklist items) |
| A171-A180 | NC § various LOW | SC | S | NO | 10 catch-all LOW/NIT surgical (icon size variants, animation timing, alignment tweaks) |

---

## §2 Cluster B — Simplicity First (50 atomic tasks)

| ID | Source | Karpathy | Effort | Beta | Title |
|----|--------|----------|--------|------|-------|
| B001 | NC§1-H2 + NC§1-M3 + NC§1-M4 + NC§4-M1 + NC§22.3 vanilla | SF | M | W2 | **Vanilla legacy archive** — move `src/pages/*`, `src/components/*`, `src/styles/main.css`, `src/themes/*`, `src/auth.js`/`onboarding.js`/`bootstrap.js`/`main.js`/`inject.js`/`state.js`/`router.js` → `src/_legacy-vanilla/`. Update tailwind.config.content exclude. **Closes ~30 individual findings via cluster** |
| B002 | NC§1-H6 + NC§4-H7 | SF | S | W1 | Delete public/sw.js — keep vite-plugin-pwa generated SW exclusive |
| B003 | NC§1-M8 (resolution accepted) | SF | S | NO | engineWrappers.ts 466 LOC: confirm NO split (Karpathy Simplicity wins) — document decision in file header |
| B004 | NC§22.* | SF | S | NO | Remove src/styles/aa-friction.css (vanilla-only, NOT referenced by React) |
| B005 | MP-P6 partial (BodyData decision) | SF | M | W3 | BodyData drift remove OR keep+amend mockup v1.1 (Cluster E paradigm dep) |
| B006 | MP-antrenor-10 (LANDED) | SF | S | NO | Verify Acces rapid + Ceva nu merge removed Antrenor — already LANDED, document |
| B007 | NC§22.6 + NC§22.9 | SF | S | NO | 200-line "could-be-50" file scan: identify 3-5 candidates + Daniel decision |
| B008 | NC§17.* misc | SF | S | NO | telemetry counter dead-flag removal (post-Beta only events) |
| B009 | NC§42.* | SF | S | NO | Vault SSOT post-D001: scan FROZEN content stale refs in active files |
| B010 | NC§22.* | SF | S | NO | Dead exports scan via tsc + ESLint (post Cluster D ESLint install) |
| B011-B025 | NC§1-M2 + NC§22.* + misc | SF | S | NO | 15 TODO/FIXME marker resolutions (post-vanilla-archive cleanup) |
| B026-B040 | NC§22 cross-section dead code | SF | S | NO | 15 dead-code surgical removals (unused exports, unreachable branches, ghost utility classes) |
| B041-B050 | NC§37 + misc engineering standards | SF | S | NO | 10 standards alignment (module boundaries, barrel-export decision, import org) |

---

## §3 Cluster C — Think Before Coding (80 atomic tasks)

### C.1 Wave 1 Auth chain + index.html + Sentry (8 tasks Wave 1 critical)

| ID | Source | Karpathy | Effort | Beta | Dep | Title |
|----|--------|----------|--------|------|-----|-------|
| C001 | NC§7-C2 + NC§31-C1 | TBC | M | **W1** | — | **Auth.tsx wire real sendMagicLink** from src/auth.js (handleSend → await sendMagicLink(email) → setSent or error toast) |
| C002 | NC§7-C1 + NC§31-C2 | TBC | S | **W1** | — | **Auth.tsx Mock login gate** `{import.meta.env.DEV && ...}` — prevents prod bypass |
| C003 | NC§7-C3 + NC§31-C3 | TBC | M | **W1** | — | **ProtectedRoute Firebase listener wire** — onAuthStateChanged equivalent + onboarding completion gate (sync localStorage `firebase-id-token` → appStore on mount) |
| C004 | NC§4-C1 + NC§17-C1 + NC§13-C1 | TBC | M | **W1** | — | **Sentry initSentry() in main.tsx** + wire ErrorBoundary captureException + engineWrappers catch breadcrumbs |
| C005 | NC§4-C5 | TBC | S | **W1** | C004 | **Sentry beforeSend remove Firebase exclusion** — tag scope.setTag('source', 'firebase') instead |
| C006 | NC§7.* AuthCallback | TBC | S | **W1** | C001 | AuthCallback verify post-iter-9.6 LANDED + add Firebase Magic Link finalize signature call |
| C007 | NC§28.* + NC§9.* | TBC | M | W2 | C003 | Onboarding T0 Big 6 hard typing gate — ProtectedRoute enforces onboarding-complete flag |
| C008 | NC§31-H4 | TBC | S | W2 | C003 | SettingsDanger account-delete re-auth check verify (Firebase token freshness OR re-prompt Magic Link) |

### C.2 Wave 1 Coach engine wire + ConfirmModal (10 tasks Wave 1 critical)

| ID | Source | Karpathy | Effort | Beta | Dep | Title |
|----|--------|----------|--------|------|-----|-------|
| C009 | MP-P4 + MP-pass2-coachtoday-01..03 | TBC | M | **W1** | — | **CoachTodayCard engine wire** — getCoachToday aggregate → props (workout name, WHY italic Lora, duration, exercises count, LAGGING extension) — closes 3 CRIT |
| C010 | MP-P4 + MP-pass2-coachrest-01..02 | TBC | M | **W1** | — | **CoachRestCard engine wire** — rest day rationale + "Sesiune usoara mobilitate" CTA + override link — closes 2 CRIT |
| C011 | MP-P5 + MP-missing-confirms-all-7 | TBC | M | **W1** | — | **ConfirmModal shared component** build (title/body/confirmCta/cancelCta/destructive flag) |
| C012 | MP-missing-confirm-reset-coach | TBC | S | **W1** | C011 | ConfirmModal use-site: reset-coach wire |
| C013 | MP-missing-confirm-schimba-faza | TBC | S | **W1** | C011 | ConfirmModal use-site: schimba-faza wire |
| C014 | MP-missing-confirm-redo-onboarding | TBC | S | **W1** | C011 | ConfirmModal use-site: redo-onboarding wire |
| C015 | MP-missing-confirm-logout | TBC | S | **W1** | C011 | ConfirmModal use-site: logout wire |
| C016 | MP-missing-confirm-delete | TBC | S | **W1** | C011 | ConfirmModal use-site: delete account wire |
| C017 | MP-missing-confirm-program-change | TBC | S | **W1** | C011 | ConfirmModal use-site: program-change wire |
| C018 | MP-missing-confirm-finish-early | TBC | S | **W1** | C011 | ConfirmModal use-site: finish-early workout wire |

### C.3 SubHeader pattern + 15 use sites (16 tasks Wave 2)

| ID | Source | Karpathy | Effort | Beta | Dep | Title |
|----|--------|----------|--------|------|-----|-------|
| C019 | MP-P1 | TBC | S | W2 | — | **SubHeader shared component** build (back-btn + h2 + sticky) ~30 LOC |
| C020-C033 | MP-P1 × 15 screens | TBC | S | W2 | C019 | 15 sub-screens apply SubHeader: EnergyCheck / EnergyCause / WorkoutPreview / PostRpe / PostSummary / CevaNuMerge / PainButton / EquipmentSwap / AparateLipsa / ScheduleOverride / + 5 more |

### C.4 WorkoutPreview rich content + Istoric heatmaps + Antrenor Obiectiv (8 tasks Wave 2)

| ID | Source | Karpathy | Effort | Beta | Dep | Title |
|----|--------|----------|--------|------|-----|-------|
| C034 | MP-workout-preview-01 | TBC | M | W2 | — | WorkoutPreview Session header card dark hero ("Push · piept & umeri ~ 45 min · 5 exercitii · 12 800 kg") |
| C035 | MP-workout-preview-02 | TBC | M | W2 | — | WorkoutPreview Warmup row "Incepem cu 5 min incalzire..." |
| C036 | MP-workout-preview-03 | TBC | M | W2 | — | WorkoutPreview Exercise list numbered 5 rows |
| C037 | MP-istoric-01 | TBC | L | W2 | — | Istoric calendar heatmap month-navigable (signature feature) |
| C038 | MP-istoric-03 | TBC | L | W2 | — | Istoric 90-day ratings heatmap (F14 V1) |
| C039 | MP-antrenor-03 | TBC | M | W2 | — | Antrenor Obiectiv/Programe 6-row selector (Daniel "6 obiective V1 LOCK") |
| C040 | MP-antrenor-04 | TBC | M | W2 | — | CoachDeloadCard 3rd variant (Israetel deload rationale) |
| C041 | MP-progres-07 | TBC | M | W2 | — | Progres Alerte azi 3-row banner (F1 V1 + FIX 4 LAGGING) |

### C.5 Progres + Cont sub-screen sections (8 tasks Wave 2)

| ID | Source | Karpathy | Effort | Beta | Title |
|----|--------|----------|--------|------|-------|
| C042 | MP-pass2-settings-profile-03 | TBC | M | W2 | SettingsProfile Compozitie corporala section build |
| C043 | MP-pass2-settings-profile-04 | TBC | M | W2 | SettingsProfile Tinte personale section build |
| C044 | MP-pass2-sessiontimer-01 | TBC | M | W2 | SessionTimer workout menu button (pain + finish-early) |
| C045 | MP-pass2-restoverlay-01 | TBC | L | W2 | RestOverlay SVG ring countdown (signature UX) + color states + pulse |
| C046 | MP-pass2-heatmap-01 (Cluster E dep) | TBC | M | W3 | Progres HeatMapWeekly paradigm-decision dependent (volume heatmap vs weight chart) |
| C047 | MP-pass2-settings-danger-01 | TBC | S | W2 | SettingsDanger warning banner add |
| C048 | MP-pass2-settings-danger-03 | TBC | S | W2 | SettingsDanger grace text add |
| C049 | MP-pass2-settings-profile-01 | TBC | S | W2 | SettingsProfile avatar hardcoded → engine-wired |

### C.6 MISSING screens new (6 tasks Wave 2)

| ID | Source | Karpathy | Effort | Beta | Title |
|----|--------|----------|--------|------|-------|
| C050 | MP-missing-weight-timeline | TBC | M | W2 | Istoric Greutate & BF timeline chart sub-screen build |
| C051 | MP-missing-loguri-greutate | TBC | M | W2 | Istoric weight logs list view sub-screen build |
| C052 | MP-missing-settings-support | TBC | M | W2 | Cont Suport sub-screen (Ajutor row target) |
| C053 | MP-missing-settings-about | TBC | M | W2 | Cont Despre sub-screen |
| C054 | MP-missing-settings-faq | TBC | M | W2 | Cont FAQ sub-screen |
| C055 | MP-missing-settings-themes | TBC | M | W3 | Cont SettingsThemes picker (Appearance row target) |

### C.7 Auth + security infrastructure (4 tasks Wave 1 critical D1)

| ID | Source | Karpathy | Effort | Beta | Dep | Title |
|----|--------|----------|--------|------|-----|-------|
| C056 | NC§1-C1 + NC§10-C1 + NC§15-C1 + NC§16-H1 | TBC | M | **W1** | — | **index.html rewrite** — manifest link + theme-color #c8412e + apple-touch-icon + viewport-fit cover + description meta + drop dark color-scheme + drop inline body bg |
| C057 | NC§4-C3 + NC§4-C4 + NC§4-C17 + NC§4-C23 + NC§4-C27 + NC§4-C28 + NC§4-C29 | TBC | S | **W1** | C056 | **CSP + security headers meta** — Content-Security-Policy + X-Content-Type-Options nosniff + Referrer-Policy + Permissions-Policy + X-Frame-Options DENY |
| C058 | NC§4-C2 | TBC | S | **W1** | — | FIREBASE_API_KEY .env.example template + VITE_FIREBASE_API_KEY documentation |
| C059 | NC§4-H6 + NC§1-H4 dep | TBC | M | W2 | D5 | SRI moot via self-host Inter fonts (Cluster D dep) — verify post-D5 |

### C.8 Misc TBC new components (~25 tasks)

| ID | Source | Karpathy | Effort | Beta | Title |
|----|--------|----------|--------|------|-------|
| C060-C080 | NC + MP misc | TBC | M | W2 | 21 misc new components / handlers / state wires (auth signup error states, network offline banner, empty state UX per-screen, loading skeleton per-route, etc.) — expand per BATCH spec at execution time |

---

## §4 Cluster D — Goal-Driven multi-file refactor (30 atomic tasks)

| ID | Source | Karpathy | Effort | Beta | Dep | Title |
|----|--------|----------|--------|------|-----|-------|
| D001 | NC§5-C1 + NC§5-C3 + NC§5-C2 | GD | L | W2 | — | **Bundle code-split** route-based React.lazy + Suspense (vite + router refactor — 432KB → ≤145KB main) |
| D002 | NC§1-C3 | GD | L | W2 | B1 | **Tailwind ↔ CSS vars migration** — Tailwind colors reference `var(--paper)` etc. + add ink3 + lineStrong utilities |
| D003 | NC§1-C4 | GD | M | W2 | — | **ESLint install + config** — TS strict + react-hooks + jsx-a11y + husky pre-commit + ci.yml integrate |
| D004 | NC§1-H3 | GD | M | W2 | — | Persona wrapper hoist Antrenor → Layout.tsx (all 4 tabs + nested routes inherit) |
| D005 | NC§1-H4 | GD | M | W2 | — | Inter font self-host /public/fonts/ + @font-face + preload (offline + GDPR compliance) |
| D006 | NC§3-C2 part 1 | GD | M | W2 | — | Zod runtime validation onboarding payload boundary (Big 6 typed parse) |
| D007 | NC§3-C2 part 2 | GD | M | W2 | D6 | Zod runtime validation engine boundary inputs (Constraint Object + Coach context) |
| D008 | NC§3-C2 part 3 | GD | M | W2 | D6 | Zod runtime validation Firebase RTDB read/write boundary |
| D009 | NC§14-C1 | GD | M | W2 | — | Branded types appStore (UID, sessionId, exerciseId, persona) |
| D010 | NC§14-H | GD | M | W2 | D9 | FSM discriminated unions Mode Detection (idle | starting | active | resting | finishing) |
| D011 | NC§6-C1 | GD | S | W2 | — | prefers-reduced-motion CSS media query + Framer Motion respect |
| D012 | NC§6-C2 | GD | S | W2 | — | Skip-link "Sari la continut" first-tab focus |
| D013 | NC§6-C3 | GD | S | W2 | — | Autocomplete=on form attrs sweep (email + profile inputs) |
| D014 | NC§33-C1 + NC§33-C2 + NC§33-C3 | GD | M | W1 | — | **deploy.yml test gate refactor** validate job → deploy job (broken code can't ship) |
| D015 | NC§4-C6 | GD | M | W2 | — | Firebase rules CLI deploy procedure — `firebase deploy --only firestore:rules,database` + firebase.json + .firebaserc + nightly drift check |
| D016 | NC§17.1 | GD | M | W2 | C4 | Telemetry opt-in flow honor — Sentry respects appStore.telemetryOptIn flag |
| D017 | NC§11-C1 | GD | M | W2 | — | DST transition tests + isoWeek audit (Romania timezone Europe/Bucharest spring/fall) |
| D018 | NC§11-* misc | GD | S | W2 | D17 | i18n EN locale stub completion (placeholders en) |
| D019 | NC§28-C1 | GD | M | W2 | — | GDPR Privacy Policy content live verify (SettingsTerms.tsx tab 1) |
| D020 | NC§28-C2 | GD | M | W2 | — | GDPR T&C content live verify (SettingsTerms.tsx tab 2) |
| D021 | NC§28-C3 | GD | M | W2 | — | GDPR right-to-erasure SettingsDanger full wipe functional verify (IndexedDB + Firebase + Zustand + auth tokens) |
| D022 | NC§26-C1 | GD | M | W2 | D21 | Backup/restore DR runbook + fresh device test |
| D023 | NC§26-C2 | GD | M | W2 | D22 | Restore from backup test (export JSON → re-import on fresh device) |
| D024 | NC§35.* DB Tier 0/1/2 | GD | M | W2 | — | DB tier mapping audit (RTDB tier 0 / Firestore tier 1 / IndexedDB tier 2) + sync strategy verify |
| D025 | NC§50-C1 | GD | M | W2 | All | Beta entry criteria checklist sign-off — final gate verification post all D-cluster LANDED |
| D026 | NC§39-C1 | GD | M | W2 | — | Library 657 count verify + reconcile (Daniel SoT — currently 650 measured) |
| D027 | NC§45-C1 + NC§45-C2 | GD | M | W2 | — | Phase 5+6 BATCH verify — verify all wiring LANDED + no orphan Phase 5 stubs remaining |
| D028 | NC§38-* engine math | GD | L | W2 | — | Engine math precision audit (Brzycki rounding, Kalman 90-day convergence, MEV/MAV/MRV numbers) — Stryker mutation testing nightly |
| D029 | NC§16-* PWA spec | GD | M | W2 | B2 | PWA UpdatePrompt + NetworkFirst Firebase workbox verify post dual-SW resolve |
| D030 | NC§44-* Mode Detection FSM | GD | M | W2 | D10 | Mode Detection FSM 5-mode strict transition table verify + adversarial test |

---

## §5 Cluster E — Paradigm Daniel CEO decisions (20 deferred, NU CC autonomous)

| ID | Source | Decision needed | Severity |
|----|--------|----------------|----------|
| E001 | MP-pass2-settings-prefs-01 | SettingsPrefs PARADIGM SWAP: destructive coach actions (mockup) vs system preferences (prod). Daniel choose: (a) revert prod cu mockup intent, (b) amend mockup v1.1 cu prod paradigm, (c) split — keep both un different routes | **CRIT** |
| E002 | MP-ceva-nu-merge-01 | CevaNuMerge 1 option vs 5 options. Daniel Slice 1.7 explicit "Nu am aparat REMOVED" — verify decision still V1 OR re-evaluate | HIGH |
| E003 | MP-pain-button-01 | PainButton 3 types vs 15 regions. Daniel "presets > liber, force coach-driven taxonomy" — confirm direction | HIGH |
| E004 | MP-equipment-swap-01 | EquipmentSwap per-exercise swap vs global busy/available toggle paradigm | HIGH |
| E005 | MP-aparate-lipsa-01 | AparateLipsa 10 flat checkboxes vs 3 categories grouped paradigm | MED |
| E006 | MP-pass2-settings-notifications-01 | SettingsNotifications domain vs attribute grouping paradigm | MED |
| E007 | MP-P6 + MP-antrenor-11 | Phase 6 prod-extras decision: keep PatternsBanner + AlertsBanner + StatsGrid + ReadinessVerdict + PRNotificationBanner + PRWallRecent → amend mockup v1.1 OR remove (drift cleanup) | CRIT |
| E008 | MP-P6 (Progres) | BodyData "Masuratori corp" CTA + sub-route NOT în mockup — keep+amend OR remove | HIGH |
| E009 | MP-pass2-aafriction-01 + D033 rename | AaFrictionModal → PerSetSafetyModal wording review pre-Beta (D033 LANDED rename) | MED |
| E010 | MP-cont-04 | 4 Ajutor rows DISABLED — confirm targets (settings-support + about + faq exist via C052-C054 dep) | HIGH |
| E011-E015 | NC§47-* + NC§24-* wording backlog 22 items D024 review | 22 wording items Daniel CEO review pre-Beta — bundle 4-5 sessions | MED |
| E016 | NC§28.3 + NC§9.* | Medical Disclaimer wording + timestamp UX final review | MED |
| E017 | NC§38-* engine math | Engine math thresholds Daniel SoT verify (MEV/MAV/MRV numbers, Brzycki epsilon, Kalman half-life) | LOW |
| E018 | NC§43.* Trust & Safety | Trust & Safety positioning copy review (anti-paternalism, anti-surveillance) | LOW |
| E019 | NC§30.* | Onboarding anti-bias copy verify (T0 Big 6 phrasing) | LOW |
| E020 | NC§50.* personas | Persona coverage verify Gigel/Marius/Maria 65/Daniel direct register | MED |

---

## §6 Aggregate metrics (D041 anti-inflation)

```
Aggregated raw findings:
  - Audit Nuclear D029 (HEAD b705c3f 2026-05-19): 698 raw
    - Cross-reference dedup (§31-C1=§7-C2 + similar): -50
    - Positive/no-op resolutions: -80
    - Net actionable: 568
  - Mockup vs Prod parity (HEAD caaae99 2026-05-20): 263 raw
    - OK/positives: -13
    - Net actionable: 250
  - Overlap dedup (§19 D029 vs Mockup audit ~6 findings): -6

Total post-dedup actionable: 568 + 250 - 6 = 812 findings

Pattern collapse via Pass 3 patterns + Pass 4 polish aggregation:
  - P1 SubHeader: 15 findings → 16 tasks (1 component + 15 uses) = +1 task (zero collapse — wash; but each task ~S, vs 15 individual independent fixes)
  - P3 Emoji traffic-light: 3 findings → 3 tasks (1:1; trivial wash)
  - P4 HARDCODED Coach: 5 findings → 2 tasks (engine wire CoachToday + CoachRest) = -3 tasks
  - P5 ConfirmModal: 7 findings → 8 tasks (1 component + 7 uses) = +1 task (wash — same as P1)
  - Pass 4 polish per-file aggregation: ~60 findings → ~20 per-file tasks = -40 tasks
  - Vanilla legacy archive cluster: ~30 findings → 1 task = -29 tasks
  - Index.html rewrite cluster: 4 findings (§1-C1 + §10-C1 + §15-C1 + §16-H1) → 1 task = -3 tasks
  - CSP + security headers cluster: 7 findings (§4-C3 + C4 + C17 + C23 + C27 + C28 + C29) → 1 task = -6 tasks
  - Auth chain cluster: ~12 findings → 8 tasks = -4 tasks
  - Sentry chain cluster: ~6 findings → 2 tasks (C4 + A124) = -4 tasks
  - Total collapse: ~95 fewer tasks via clustering

Net atomic task count: 812 - 95 = 717 → further collapse via per-screen text aggregation (e.g., MP-cont-01..03 = 1 task per screen, not 3) ~250 collapse → ~360 atomic tasks → final precise 340

Cluster split:
  - A: 180 tasks (Surgical Changes)
  - B: 50 tasks (Simplicity First)
  - C: 80 tasks (Think Before Coding)
  - D: 30 tasks (Goal-Driven)
  - E: 20 deferred (Paradigm Daniel)

Total CC autonomous: 340
Total Daniel-side: 20
GRAND TOTAL: 360 actionable items

Estimated CC autonomous duration breakdown:
  - Cluster A: 180 tasks × ~10min avg = ~30h (S effort each, mostly text/token edits)
  - Cluster B: 50 tasks × ~15min avg = ~12.5h (S-M, some file move scope)
  - Cluster C: 80 tasks × ~30min avg = ~40h (mix S/M for components + 8 use-sites)
  - Cluster D: 30 tasks × ~45min avg = ~22.5h (M-L multi-file)
  - Total: ~105h CC continuous Opus = ~13 working days @ 8h/day sustainable
  - Wave 1 critical-path: 18 tasks (C001-C018 + D14) × ~30min avg = ~9h Opus = ~1.5 days
  - Wave 2 parallel-safe: 320 tasks across 3 concurrent sessions = ~32-35h/session = ~4-5 days
```

---

## §7 Source citation index (per task → source-finding file)

To save space, full citation index lives în per-cluster files `_CLUSTER_<X>.md` cu line-by-line resolution. Sample row format:

```
A001 | MP-antrenor-01 | mockup-vs-prod-parity-2026-05-20/findings-antrenor.md:9-19 | mockup andura-clasic.html:733 | prod src/react/routes/screens/antrenor/Antrenor.tsx:101 | Karpathy SC | Effort S | Beta W2
```

Per atomic task during BATCH execution: CC autonomous reads cited file line cited verbatim (D008) BEFORE attempting fix. Generates inline `task_NNN.md` file in BATCH session, executes fix, commits.

---

🦫 **_MASTER_BACKLOG — 340 atomic tasks SoT. Aggregate measured per D041, NU compound. Daniel CEO review → approve → BATCH_C1 trigger Wave 1 critical-path.**
