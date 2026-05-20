---
title: Iter 1 Master Backlog V2 — ~305 Atomic Tasks Post HEAD-Verified
status: DESIGN_LANDED_READY
aggregation_basis: Audit Nuclear b705c3f 2026-05-19 (698 raw - ~58 Phase 7 LANDED = ~640 remaining) + Mockup vs Prod Parity caaae99 2026-05-20 (263 raw - ~13 OK = 250 actionable) - overlap ~6 = ~890 actionable net
collapse_via_patterns: -115 tasks via pattern collapse + per-screen aggregation + vanilla archive single-task + Coach engine consolidation
last_updated: 2026-05-20 evening ACASĂ
---

# _MASTER_BACKLOG V2 — Iter 1 Atomic Tasks

**Convention:**
- `NC§NN-XN` = Audit Nuclear `📤_outbox/audit-nuclear-2026-05-19/findings-§NN.md` finding ID XN
- `MP-<screenId>-<NN>` = Mockup Parity `📤_outbox/mockup-vs-prod-parity-2026-05-20/findings-<screenId>.md` finding F-<screenId>-<NN>
- `MP-P<N>` = Mockup Parity Pass 3 Pattern N
- `MP-P4-<X>` = Mockup Parity Pass 4 polish bucket X

**Karpathy abbreviations:** SC=Surgical Changes / SF=Simplicity First / TBC=Think Before Coding / GD=Goal-Driven

**Effort:** S ≤30min / M ≤4h / L multi-file ≥4h

**Wave:** A=Critical real / B=Surgical text+polish / C=Components+Simplicity / D=Goal-driven refactor / E=Deferred Daniel

**Per-task pre-flight MANDATORY:** Read source-finding D008 verbatim + GREP `§<id> audit fix` în prod file → IF MATCH = NO-OP SKIP. See ORCHESTRATOR.md §4.

---

## §A WAVE A — Critical real OPEN + Coach/Auth completers (~40 tasks ~12-16h)

### A.1 Coach engine wire (closes 5 CRIT — verified HARDCODED prod)

| ID | Source | Karpathy | Effort | File | Title |
|----|--------|----------|--------|------|-------|
| A001 | MP-pass2-coachtoday-01..03 | TBC | M | src/react/routes/screens/antrenor/cards/CoachTodayCard.tsx | Wire CoachTodayCard from getCoachToday aggregate — workout name + WHY italic Lora + duration + exercises count + LAGGING extension (closes 3 CRIT) |
| A002 | MP-pass2-coachrest-01..02 | TBC | M | src/react/routes/screens/antrenor/cards/CoachRestCard.tsx | Wire CoachRestCard from getCoachRest aggregate — rest day rationale + "Sesiune usoara mobilitate" CTA + override link (closes 2 CRIT) |

### A.2 ConfirmModal shared + 7 use sites (closes 7 CRIT — confirmed MISSING)

| ID | Source | Karpathy | Effort | File | Title |
|----|--------|----------|--------|------|-------|
| A003 | MP-P5 + MP-missing-confirms | TBC | M | src/react/components/ConfirmModal.tsx (NEW) | Build ConfirmModal shared (title/body/confirmCta/cancelCta/destructive flag) ~50 LOC |
| A004 | MP-missing-confirm-reset-coach | TBC | S | src/react/routes/screens/cont/SettingsDanger.tsx | Wire ConfirmModal use-site: reset-coach |
| A005 | MP-missing-confirm-schimba-faza | TBC | S | src/react/routes/screens/cont/SettingsDanger.tsx | Wire ConfirmModal use-site: schimba-faza |
| A006 | MP-missing-confirm-redo-onboarding | TBC | S | src/react/routes/screens/cont/SettingsDanger.tsx | Wire ConfirmModal use-site: redo-onboarding |
| A007 | MP-missing-confirm-logout | TBC | S | src/react/routes/screens/cont/SettingsProfile.tsx | Wire ConfirmModal use-site: logout |
| A008 | MP-missing-confirm-delete | TBC | S | src/react/routes/screens/cont/SettingsDanger.tsx | Wire ConfirmModal use-site: delete account |
| A009 | MP-missing-confirm-program-change | TBC | S | src/react/routes/screens/cont/SettingsPrefs.tsx | Wire ConfirmModal use-site: program-change |
| A010 | MP-missing-confirm-finish-early | TBC | S | src/react/routes/screens/antrenor/Workout.tsx | Wire ConfirmModal use-site: finish-early workout |

### A.3 Bundle code-split CRITICAL (Beta blocker §5-C1 + §5-C3)

| ID | Source | Karpathy | Effort | File | Title |
|----|--------|----------|--------|------|-------|
| A011 | NC§5-C1 + §5-C3 | GD | L | src/react/routes/router.tsx + per-screen lazy() | Route-based React.lazy + Suspense per top-level route + per sub-screen — main bundle 432KB → ≤145KB target (Maria 65 3G LCP) |
| A012 | NC§5-C2 | GD | M | vite.config.js manualChunks extend | Verify per-route chunk split + measure post code-split bundle size (size-limit budget enforce) |

### A.4 Auth chain remaining gaps (post §7-C1/C2/C3 LANDED)

| ID | Source | Karpathy | Effort | File | Title |
|----|--------|----------|--------|------|-------|
| A013 | MP-auth-03 | TBC | M | src/react/routes/screens/Auth.tsx | Google OAuth ENTIRELY MISSING — wire via Firebase Auth provider (Daniel CEO Slice 1.x decision pending — defer Cluster E IF ambiguous, else implement) |
| A014 | MP-auth-04 | TBC | M | src/react/routes/screens/Auth.tsx | Skip-auth path ENTIRELY MISSING — wire local-only mode toggle pre-onboarding (Daniel CEO decision pending E-cluster) |
| A015 | NC§31-H1..H4 + NC§7-C4 | TBC | M | src/react/routes/ProtectedRoute.tsx + Onboarding.tsx | Onboarding T0 hard typing gate — ProtectedRoute checks onboarding-complete flag; redirect /onboarding/1 if false. Also Step1-6 bounds validation strict (age 13-95, weight 30-250kg, frequency 0-14, height 100-220cm) |
| A016 | NC§31-H4 | SC | S | src/react/routes/screens/cont/SettingsDanger.tsx | Account-delete re-auth check — token freshness ≤5min or trigger re-Magic-Link |

### A.5 Security/observability hygiene (CRIT remaining)

| ID | Source | Karpathy | Effort | File | Title |
|----|--------|----------|--------|------|-------|
| A017 | NC§4-H2 | SC | S | src/auth.js | Magic Link pendingEmail TTL 1h auto-clear OR sessionStorage migrate |
| A018 | NC§4-H3 | SC | S | src/auth.js | Magic Link sendMagicLink throttle 30s min-interval guard + UI cooldown |
| A019 | NC§4-H4 | SC | S | src/firebase.js | Firebase URL hardcoded → VITE_FIREBASE_RTDB_URL env var (verify D040 partial finish) |
| A020 | NC§3-H | SC | S | src/react/lib/engineWrappers.ts:279 | Remove `as any` cast — declare BNContext + BNResult types properly |
| A021 | NC§1-C3 | GD | L | tailwind.config.js + global.css | Tailwind ↔ CSS vars migration — colors reference var(--paper) etc. + add ink3 + lineStrong utilities |
| A022 | NC§3-C1 | GD | M | tsconfig.json + tsconfig.node.json | TypeScript strict mode engines .js files via checkJs + allowJs (231 files surface — incremental migration) |

### A.6 a11y critical (Beta blocker §6)

| ID | Source | Karpathy | Effort | File | Title |
|----|--------|----------|--------|------|-------|
| A023 | NC§6-C1 | GD | S | src/styles/global.css | prefers-reduced-motion CSS media query + Framer Motion respect (vestibular safety) |
| A024 | NC§6-C2 | GD | S | src/react/routes/Layout.tsx | Skip-link "Sari la continut" first-tab focus aria-label |

### A.7 GDPR + Compliance (§28 CRIT)

| ID | Source | Karpathy | Effort | File | Title |
|----|--------|----------|--------|------|-------|
| A025 | NC§28-C1 | GD | M | src/react/routes/screens/cont/SettingsTerms.tsx | GDPR Privacy Policy content live verify + populate tab 1 |
| A026 | NC§28-C2 | GD | M | src/react/routes/screens/cont/SettingsTerms.tsx | GDPR T&C content live verify + populate tab 2 |
| A027 | NC§28-C3 | GD | M | src/react/routes/screens/cont/SettingsDanger.tsx | GDPR right-to-erasure SettingsDanger full wipe functional verify (IndexedDB + Firebase + Zustand + auth tokens) |
| A028 | NC§28-C4 | GD | M | src/react/routes/screens/cont/SettingsExport.tsx | GDPR portability functional verify — export JSON complete (engine state + tier 0/1/2 + profile + history) |

### A.8 PWA + Prod ops remaining CRIT

| ID | Source | Karpathy | Effort | File | Title |
|----|--------|----------|--------|------|-------|
| A029 | NC§16-C1 | GD | M | src/react/components/UpdatePrompt.tsx (NEW or extend) | PWA UpdatePrompt — vite-plugin-pwa onNeedRefresh hook + UI banner "Versiune noua. Reincarca." |
| A030 | NC§16-C2 | GD | M | vite.config.js workbox runtimeCaching | Offline NetworkFirst verify — engineerProtect Firebase calls retry + IndexedDB tier persist fallback |
| A031 | NC§34-C1 | GD | M | 08-workflows/PROD_OPS_RUNBOOK.md (NEW) | Prod ops runbook — incident response procedure + rollback steps + Daniel contact escalation |
| A032 | NC§34-C2 | GD | M | scripts/healthcheck.cjs (NEW) | Production healthcheck script — DNS resolve + 200 OK / + Magic Link send dry-run + Firebase RTDB ping |
| A033 | NC§34-C3 | GD | M | .github/workflows/deploy.yml | Deploy.yml rollback procedure — `git revert HEAD && git push origin main` documented + tested manually |

### A.9 Backup/DR (§26 CRIT)

| ID | Source | Karpathy | Effort | File | Title |
|----|--------|----------|--------|------|-------|
| A034 | NC§26-C1 | GD | M | 08-workflows/BACKUP_DR_RUNBOOK.md (NEW) | Backup/DR runbook — Firebase RTDB export schedule + IndexedDB tier 2 archive procedure + fresh device restore steps |
| A035 | NC§26-C2 | GD | M | scripts/test-restore.cjs (NEW) | Fresh device test — wipe localStorage + IndexedDB + re-auth Magic Link + verify engine state restore from Firebase sync |

### A.10 DB Tier 0/1/2 + Engine math (§35 + §38)

| ID | Source | Karpathy | Effort | File | Title |
|----|--------|----------|--------|------|-------|
| A036 | NC§35-C1 + §35-C2 | GD | M | src/engine/storage/tierMapper.js (verify) | DB Tier 0/1/2 mapping audit — RTDB tier 0 / Firestore tier 1 / IndexedDB tier 2 + sync strategy verify + 90-day rolling rotation |
| A037 | NC§38-C1 | GD | M | src/engine/strength/brzycki.js (audit) | Engine math precision — Brzycki 1RM rounding nearest 0.5kg + epsilon ±2.5% formula stability |
| A038 | NC§38-C2 | GD | L | src/engine/bayesian/kalmanFilter.js (audit) | Engine math precision — Kalman 90-day convergence rate verify + MEV/MAV/MRV numbers consistent cu Israetel spec |

### A.11 Phase 5+6 BATCH verify + Beta entry checklist

| ID | Source | Karpathy | Effort | File | Title |
|----|--------|----------|--------|------|-------|
| A039 | NC§45-C1 + §45-C2 | GD | M | scripts/verify-phase-5-6-batch.cjs (NEW) | Phase 5+6 BATCH verify — scan src/ for orphan Phase 5 stubs (return null + TODO comments) + reconcile cu D026 + D027 LANDED counts |
| A040 | NC§50-C1 | GD | M | 08-workflows/BETA_ENTRY_CRITERIA.md (NEW) | Beta entry criteria final checklist — all §1-§50 CRIT resolved + Daniel Gates 5/5 + production readiness ≥85% + GDPR live + Medical Disclaimer + T&C consent flows functional |

---

## §B WAVE B — Surgical text + tokens + polish (~150 tasks ~25-30h)

### B.1 Text swaps mockup verbatim per-screen (25 aggregated tasks closing ~70 individual findings)

| ID | Source | Karpathy | Effort | File | Title |
|----|--------|----------|--------|------|-------|
| B001 | MP-antrenor-01..02 + MP-antrenor-08..09 | SC | S | Antrenor.tsx:100-141 | Antrenor header date+time + subtitle italic Lora + CTA "Incepe sesiunea →" + override link "Vrei altceva azi?" |
| B002 | MP-splash-01..06 | SC | S | Splash.tsx | Splash text fidelity (logo wordmark + tagline coach quote + version footer + Incepe CTA) |
| B003 | MP-auth-01..05 | SC | S | Auth.tsx + AuthCallback.tsx | Auth screen text labels Romanian no-diacritics + button text + error states |
| B004 | MP-progres-01..06 | SC | S | Progres.tsx | Progres screen labels + section headers (OBOSEALA AZI / NUTRITIE · AZI / etc.) + footer |
| B005 | MP-istoric-02 + MP-istoric subtitle | SC | S | Istoric.tsx | Istoric subtitle + section labels + empty state UX |
| B006 | MP-cont-01..03 | SC | S | Cont.tsx | Cont tab title + subtitle + group section headers |
| B007 | MP-energy-check-01..04 | SC | S | EnergyCheck.tsx | Title + 3-state labels + footer |
| B008 | MP-energy-cause-01..03 | SC | S | EnergyCause.tsx | Title + cause options + CTA |
| B009 | MP-workout-preview-04..08 | SC | S | WorkoutPreview.tsx | Duration/exercise chip labels + CTA |
| B010 | MP-workout-01..06 | SC | S | Workout.tsx | Set/rep/load labels + button text |
| B011 | MP-post-rpe-01..05 | SC | S | PostRpe.tsx | 3-rating labels + helper text |
| B012 | MP-post-summary-01..06 | SC | S | PostSummary.tsx | Felicitare + stats + reflectie quote |
| B013 | MP-ceva-nu-merge text | SC | S | CevaNuMerge.tsx | Text labels Romanian no-diacritics (paradigm decision E002 deferred — text-only fix safe) |
| B014 | MP-pain-button text | SC | S | PainButton.tsx | Text labels (paradigm decision E003 deferred — text-only fix safe) |
| B015 | MP-equipment-swap text | SC | S | EquipmentSwap.tsx | Text labels (paradigm decision E004 deferred — text-only fix safe) |
| B016 | MP-aparate-lipsa text | SC | S | AparateLipsa.tsx | Text labels (paradigm decision E005 deferred — text-only fix safe) |
| B017 | MP-schedule-override text | SC | S | ScheduleOverride.tsx | Text labels mockup-verbatim |
| B018 | MP-wave-e-onboarding text | SC | S | Onboarding.tsx + Step1-6 components | 7 onboarding step text fidelity batch (welcome + Big 6 prompts + completion) |
| B019 | MP-settings-profile text | SC | S | SettingsProfile.tsx | Text labels + section headers (excludes paradigm decisions) |
| B020 | MP-settings-notifications text | SC | S | SettingsNotifications.tsx | Text labels (paradigm decision E006 deferred — text-only safe) |
| B021 | MP-settings-prefs text NON-PARADIGM | SC | S | SettingsPrefs.tsx | Text labels only that don't conflict cu E001 paradigm swap decision |
| B022 | MP-settings-appearance text | SC | S | SettingsAppearance.tsx | Text labels + section headers |
| B023 | MP-settings-privacy text | SC | S | SettingsPrivacy.tsx | Text labels (excludes A025 GDPR content) |
| B024 | MP-settings-export text | SC | S | SettingsExport.tsx | Text labels Romanian no-diacritics |
| B025 | MP-settings-subscription text | SC | S | SettingsSubscription.tsx | Text labels (already 95% per audit — verify gaps) |

### B.2 Token alignment Pass 4 polish per-file (50 tasks closing ~60 individual polish findings)

| ID | Source | Karpathy | Effort | File | Title |
|----|--------|----------|--------|------|-------|
| B026 | MP-P4-fontweight-01 | SC | S | Antrenor.tsx | h1 font-semibold → font-bold (mockup 700) |
| B027 | MP-P4-fontweight-01 | SC | S | Cont.tsx | h1 font-bold |
| B028 | MP-P4-fontweight-01 | SC | S | Progres.tsx | h1 font-bold |
| B029 | MP-P4-fontweight-01 | SC | S | Istoric.tsx | h1 font-bold |
| B030-B040 | MP-P4-fontweight-02 (11 sub-screens) | SC | S | 11 sub-screen .tsx | Title font-bold alignment batch (EnergyCheck + EnergyCause + WorkoutPreview + Workout + PostRpe + PostSummary + CevaNuMerge + PainButton + EquipmentSwap + AparateLipsa + ScheduleOverride) |
| B041 | MP-P4-spacing-01 | SC | S | Splash.tsx | padding-asymmetric pt-12 px-7 pb-8 (mockup 48 28 32) |
| B042 | MP-P4-spacing-01 | SC | S | Antrenor.tsx | padding asymmetric pt-4 px-5 pb-6 |
| B043-B052 | MP-P4-spacing-01 (10 screens) | SC | S | 10 screens .tsx | Padding-asymmetric mockup-aligned batch (Auth + Onboarding + Progres + Istoric + Cont + Workout + PostRpe + PostSummary + EnergyCheck + WorkoutPreview) |
| B053 | MP-P4-radius-01 | SC | S | Splash.tsx | Logo rounded-3xl → rounded-[22px] |
| B054 | MP-P4-radius-01 | SC | S | CoachTodayCard.tsx | rounded-2xl → rounded-[18px] |
| B055-B062 | MP-P4-radius-01 (8 cards) | SC | S | 8 settings cards .tsx | Radius alignment 14-16px arbitrary values batch (Cont sub-screen cards) |
| B063-B075 | MP-P4-margin/gap/icon (15 NIT) | SC | S | Various | 13 micro-token NIT tasks aggregated (margin-bottom 4/8 grid + gap drift + icon size 20 vs 24) |

### B.3 Surgical security/hygiene remaining (10 tasks)

| ID | Source | Karpathy | Effort | File | Title |
|----|--------|----------|--------|------|-------|
| B076 | NC§1-H5 | SC | S | public/icon-192.png + 512 | PWA icon optimize + WebP fallback variants |
| B077 | NC§4-N1 | SC | S | src/util/sentry.js | Remove console.log debug calls remaining (verify post-§1-C2) |
| B078 | NC§1-H1 | SC | S | src/App.tsx (delete) | Delete src/App.tsx Phase 1 dead placeholder |
| B079 | NC§1-H3 | SC | S | src/react/routes/Layout.tsx | Persona class hoist Antrenor → Layout.tsx wrapper (Multi-tab persona-aware) |
| B080 | NC§16.* manifest verify | SC | S | vite.config.js manifest section + public/manifest.json | Verify icons + theme-color + display=standalone + start_url consistency |
| B081 | NC§7.* AuthCallback verify | SC | S | src/react/routes/screens/AuthCallback.tsx | Verify post-iter-9.6 — Firebase Magic Link finalize signature wire (likely LANDED — verify only) |
| B082 | NC§17.* misc | SC | S | src/util/sentry.js + telemetry callers | Telemetry counter dead-flag removal (post-Beta only events) |
| B083 | NC§29.* | SC | S | src/styles/global.css + tailwind.config.js | Brand token consolidation NIT — verify --paper + --ink + --brick canonical values |
| B084 | NC§22.* misc | SC | S | Various | Misc dead code single-LOC removals (5 sub-tasks aggregated — unused imports + unreachable branches) |
| B085 | NC§1-L2 | SC | S | src/styles/global.css | Wrap :root + .persona-* în @layer base/components Tailwind |

### B.4 Emoji + a11y surgical (10 tasks)

| ID | Source | Karpathy | Effort | File | Title |
|----|--------|----------|--------|------|-------|
| B086 | MP-P3 | SC | S | EnergyCheck.tsx | Emoji traffic-light 🟢🟡🔴 prefix 3-state buttons |
| B087 | MP-P3 | SC | S | PostRpe.tsx | Emoji traffic-light prefix Usor/Potrivit/Greu |
| B088 | MP-P3 | SC | S | Workout.tsx SetRatingButtons | Emoji traffic-light prefix workout |
| B089 | NC§6.* | SC | S | Various icon buttons (~12 sites) | Aria-label adds for icon-only buttons batch |
| B090 | NC§6.* | SC | S | Auth.tsx + SettingsProfile.tsx | Form autocomplete attrs (Magic Link email already LANDED — Cont profile name + tel) |
| B091 | NC§6-L | SC | S | Various (~5 sites) | Tap target audit minor sub-44px violations fix batch |
| B092 | NC§28-* | SC | S | src/react/components/TermsConsent.tsx | T&C consent timestamp persist verify (Phase 6 task_15) |
| B093 | NC§9-H2 | SC | S | src/react/components/MedicalDisclaimerModal.tsx | Medical Disclaimer timestamp persist verify |
| B094 | NC§19.* | SC | S | tests/visual-regression/ | Visual regression spot-check 5 screens post-Wave-B token tasks (use Track 7 toHaveScreenshot infra) |
| B095 | NC§38.* | SC | S | src/engine/* | Engine math precision NIT fixes batch (Brzycki rounding citations + integer-only sets/reps) |

### B.5 Pass 2 sub-component text (20 tasks closing ~20 individual sub-comp findings)

| ID | Source | Karpathy | Effort | File | Title |
|----|--------|----------|--------|------|-------|
| B096-B115 | MP-pass2-* sub-comp text (20 sub-comp) | SC | S | 20 sub-component .tsx | 20 sub-component text swaps aggregated (Calendar7Day labels + PRWall titles + AlertsBanner copy + PatternsBanner copy + StatsGrid labels + ReadinessVerdict labels + NutritionInline labels + TDEEStrip + FatigueStrip + InactivityPrompt + ExitConfirmSheet + ReactivateCard + ResumeSessionCard + MedicalDisclaimerModal + PRNotificationBanner + 5 misc) |

### B.6 JSDoc + comment hygiene (15 tasks)

| ID | Source | Karpathy | Effort | File | Title |
|----|--------|----------|--------|------|-------|
| B116-B130 | NC§1-M6 + NC§42.* misc | SC | S | Various | 15 file comment cleanup batch (Zustand stores JSDoc + adapter file headers + dead-comment removes + ASCII divider standardize + ADR refs current) |

### B.7 Misc surgical (20 tasks)

| ID | Source | Karpathy | Effort | File | Title |
|----|--------|----------|--------|------|-------|
| B131-B150 | NC § various LOW + misc | SC | S | Various | 20 catch-all LOW/NIT surgical batch (icon size variants + animation timing + alignment tweaks + format consistency) |

---

## §C WAVE C — Components + Simplicity + MISSING screens (~80 tasks ~25-30h)

### C.1 Vanilla legacy archive (1 task closes ~30 findings)

| ID | Source | Karpathy | Effort | File | Title |
|----|--------|----------|--------|------|-------|
| C001 | NC§1-H2 + §1-M3 + §1-M4 + §4-M1 + §22.* vanilla cluster | SF | M | src/pages/* + src/onboarding.js + src/bootstrap.js + main.js + inject.js + state.js + router.js + styles/main.css + themes/* + styles/aa-friction.css → src/_legacy-vanilla/ | Move vanilla files to src/_legacy-vanilla/. tailwind.config.content excludes. index-vanilla-legacy.html paths updated. KEEP src/auth.js + firebase.js + db.js + constants.js + util/* + engine/** + coach/orchestrator/** + styles/global.css + react/** + main.tsx (React-consumed). Closes ~30 individual findings |

### C.2 SubHeader pattern + 15 use sites (16 tasks — Pattern P1 closes 15 findings)

| ID | Source | Karpathy | Effort | File | Title |
|----|--------|----------|--------|------|-------|
| C002 | MP-P1 | TBC | S | src/react/components/SubHeader.tsx (NEW) | Build SubHeader shared (back-btn + h2 + sticky default) ~30 LOC. Closes MP-P1 pattern foundation |
| C003-C017 | MP-P1 × 15 screens | TBC | S | EnergyCheck + EnergyCause + WorkoutPreview + PostRpe + PostSummary + CevaNuMerge + PainButton + EquipmentSwap + AparateLipsa + ScheduleOverride + 5 more | 15 sub-screens apply SubHeader pattern |

### C.3 WorkoutPreview rich content (3 tasks — 3 CRIT MISSING)

| ID | Source | Karpathy | Effort | File | Title |
|----|--------|----------|--------|------|-------|
| C018 | MP-workout-preview-01 | TBC | M | WorkoutPreview.tsx | Session header card dark hero "Push · piept & umeri ~ 45 min · 5 exercitii · 12 800 kg" |
| C019 | MP-workout-preview-02 | TBC | M | WorkoutPreview.tsx | Warmup row "Incepem cu 5 min incalzire piept & umeri — band pull-apart × 2..." |
| C020 | MP-workout-preview-03 | TBC | M | WorkoutPreview.tsx | Exercise list 5 numbered (signature pre-workout UX) |

### C.4 Istoric calendars + Antrenor Obiectiv + Deload + Progres Alerte (5 tasks — 5 CRIT MISSING)

| ID | Source | Karpathy | Effort | File | Title |
|----|--------|----------|--------|------|-------|
| C021 | MP-istoric-01 | TBC | L | Istoric.tsx + IstoricCalendarHeatmap.tsx (NEW) | Istoric calendar heatmap month-navigable (signature feature) — color-coded per session intensity |
| C022 | MP-istoric-03 | TBC | L | Istoric.tsx + IstoricRatingsHeatmap.tsx (NEW) | Istoric 90-day ratings heatmap (F14 V1) — Usoara/Normala/Grea distribution |
| C023 | MP-antrenor-03 | TBC | M | Antrenor.tsx + ObiectiveSelector.tsx (NEW) | Antrenor Obiectiv/Programe 6-row selector (Daniel "6 obiective V1 LOCK") |
| C024 | MP-antrenor-04 | TBC | M | CoachDeloadCard.tsx (extend) | CoachDeloadCard 3rd variant (Israetel deload rationale wording) |
| C025 | MP-progres-07 | TBC | M | Progres.tsx + AlerteAziBanner.tsx (NEW or extend AlertsBanner) | Progres Alerte azi 3-row banner (F1 V1 + FIX 4 LAGGING) |

### C.5 Sub-screen sections + SessionTimer + RestOverlay (8 tasks)

| ID | Source | Karpathy | Effort | File | Title |
|----|--------|----------|--------|------|-------|
| C026 | MP-pass2-settings-profile-03 | TBC | M | SettingsProfile.tsx | Compozitie corporala section build |
| C027 | MP-pass2-settings-profile-04 | TBC | M | SettingsProfile.tsx | Tinte personale section build |
| C028 | MP-pass2-sessiontimer-01 | TBC | M | Workout.tsx + SessionTimer.tsx | Workout menu button (pain + finish-early triggers) |
| C029 | MP-pass2-restoverlay-01 | TBC | L | RestOverlay.tsx | SVG ring countdown (signature UX) + color states + pulse animation |
| C030 | MP-pass2-settings-danger-01 | TBC | S | SettingsDanger.tsx | Warning banner add (top-of-screen "Zona periculoasa — actiuni ireversibile") |
| C031 | MP-pass2-settings-danger-03 | TBC | S | SettingsDanger.tsx | Grace text add (per destructive row "Vei pierde: X / Y / Z") |
| C032 | MP-pass2-settings-profile-01 | TBC | S | SettingsProfile.tsx | Avatar hardcoded → engine-wired (uid hash → default avatar gradient) |
| C033 | MP-pass2-coachresume-card | TBC | M | CoachTodayCard.tsx + ResumeSessionCard.tsx | Resume session card variant mockup-verify (Phase 6 task_06 LANDED — verify state-aware) |

### C.6 MISSING screens NEW (6 tasks — 6 CRIT MISSING)

| ID | Source | Karpathy | Effort | File | Title |
|----|--------|----------|--------|------|-------|
| C034 | MP-missing-weight-timeline | TBC | M | src/react/routes/screens/istoric/IstoricWeightTimeline.tsx (NEW) + router.tsx add /app/istoric/weight-timeline | Greutate & BF timeline chart sub-screen build |
| C035 | MP-missing-loguri-greutate | TBC | M | src/react/routes/screens/istoric/IstoricLoguriGreutate.tsx (NEW) + router.tsx | Weight logs list view sub-screen build |
| C036 | MP-missing-settings-support | TBC | M | src/react/routes/screens/cont/SettingsSupport.tsx (NEW) + router.tsx | Cont Suport sub-screen (Ajutor row target — E010 dep) |
| C037 | MP-missing-settings-about | TBC | M | src/react/routes/screens/cont/SettingsAbout.tsx (NEW) + router.tsx | Cont Despre sub-screen |
| C038 | MP-missing-settings-faq | TBC | M | src/react/routes/screens/cont/SettingsFaq.tsx (NEW) + router.tsx | Cont FAQ sub-screen |
| C039 | MP-missing-settings-themes | TBC | M | src/react/routes/screens/cont/SettingsThemes.tsx (NEW) + router.tsx | Cont SettingsThemes picker (Appearance row target) |

### C.7 Simplicity First cleanup post-vanilla-archive (10 tasks)

| ID | Source | Karpathy | Effort | File | Title |
|----|--------|----------|--------|------|-------|
| C040 | NC§1-H6 + §4-H7 | SF | S | public/sw.js (delete) | Delete public/sw.js — keep vite-plugin-pwa generated SW exclusive |
| C041 | NC§1-M8 | SF | S | src/react/lib/engineWrappers.ts header | Document NO-split decision file header (466 LOC Karpathy SF wins) |
| C042-C045 | NC§22.* dead code | SF | S | Various | 4 dead-code surgical removals batch (unused exports + unreachable branches) |
| C046-C049 | NC§22.* + misc | SF | S | Various | 4 TODO/FIXME marker resolutions batch (post-vanilla cleanup) |

### C.8 Pass 2 conditional cards + RestOverlay verify (5 tasks)

| ID | Source | Karpathy | Effort | File | Title |
|----|--------|----------|--------|------|-------|
| C050 | MP-pass2-reactivate-card | TBC | M | ReactivateCard.tsx | ReactivateCard mockup-verify post-engine-wire (Phase 6 LANDED — gaps any) |
| C051 | MP-pass2-resume-card | TBC | M | ResumeSessionCard.tsx | ResumeSessionCard mockup-verify state-aware variants |
| C052 | MP-pass2-tdee-fatigue | TBC | M | TDEEStrip.tsx + FatigueStrip.tsx | TDEE + Fatigue strips mockup-verify (Phase 6 LANDED — gaps any) |
| C053 | MP-pass2-nutrition-inline | TBC | M | NutritionInline.tsx | NutritionInline mockup-verify (audit ~80% — close residual gaps) |
| C054 | MP-pass2-pr-wall-recent | TBC | M | PRWallRecent.tsx | PRWallRecent mockup-verify (audit ~80% — close residual gaps) |

### C.9 Misc TBC new components (~25 tasks — expand per Wave C session)

| ID | Source | Karpathy | Effort | File | Title |
|----|--------|----------|--------|------|-------|
| C055-C080 | NC + MP misc | TBC | M | Various | 25 misc TBC new components / handlers / state wires batch — expand inline per Wave C execution (auth signup error states + network offline banner + empty state UX per-screen + loading skeleton per-route + 21 others per source-citation inline) |

---

## §D WAVE D — Goal-Driven multi-file refactor (~35 tasks ~20-25h)

### D.1 Zod boundaries (5 tasks)

| ID | Source | Karpathy | Effort | File | Title |
|----|--------|----------|--------|------|-------|
| D001 | NC§3-C2 part 1 | GD | M | src/react/lib/onboardingSchema.ts (NEW) + Onboarding.tsx | Zod runtime validation onboarding payload boundary (Big 6 typed parse) |
| D002 | NC§3-C2 part 2 | GD | M | src/engine/schemas/constraintObject.ts (NEW) | Zod runtime validation engine boundary inputs (Constraint Object + Coach context) |
| D003 | NC§3-C2 part 3 | GD | M | src/firebase.js + src/db.js | Zod runtime validation Firebase RTDB read/write boundary |
| D004 | NC§14-C1 | GD | M | src/react/stores/appStore.ts + branded.ts (NEW) | Branded types appStore (UID, sessionId, exerciseId, persona) |
| D005 | NC§14-H | GD | M | src/engine/fsm/modeDetection.ts | FSM discriminated unions Mode Detection (idle | starting | active | resting | finishing) |

### D.2 Persona + Inter font + a11y triple (5 tasks)

| ID | Source | Karpathy | Effort | File | Title |
|----|--------|----------|--------|------|-------|
| D006 | NC§1-H3 | GD | M | src/react/routes/Layout.tsx | Persona wrapper hoist — all 4 tabs + nested routes inherit (closes B079 wave B partial) |
| D007 | NC§1-H4 | GD | M | public/fonts/ + index.html + global.css | Inter font self-host /public/fonts/ + @font-face + preload (offline + GDPR compliance — Google Fonts CDN drop) |
| D008 | NC§6-C1 | GD | S | src/styles/global.css + Framer Motion | prefers-reduced-motion CSS media query + Framer Motion respect (full refactor — Wave A A023 quick fix extend) |
| D009 | NC§6-C2 | GD | S | src/react/routes/Layout.tsx | Skip-link "Sari la continut" first-tab focus (full refactor — Wave A A024 quick fix extend) |
| D010 | NC§6-C3 | GD | S | Auth.tsx + SettingsProfile.tsx + form inputs sweep | Autocomplete=on form attrs sweep (Phase 7 LANDED Auth email — extend remaining forms) |

### D.3 GDPR + Backup/DR functional (6 tasks)

| ID | Source | Karpathy | Effort | File | Title |
|----|--------|----------|--------|------|-------|
| D011 | NC§28-C1 | GD | M | SettingsTerms.tsx + privacyPolicy.ro.md | GDPR Privacy Policy content live (full refactor — Wave A A025 stub extend) |
| D012 | NC§28-C2 | GD | M | SettingsTerms.tsx + termsAndConditions.ro.md | GDPR T&C content live (full refactor — Wave A A026 stub extend) |
| D013 | NC§28-C3 | GD | M | SettingsDanger.tsx + wipe procedure | GDPR right-to-erasure full wipe functional verify (full refactor — Wave A A027 stub extend) |
| D014 | NC§26-C1 | GD | M | 08-workflows/BACKUP_DR_RUNBOOK.md + scripts/test-restore.cjs | Backup/restore DR runbook + fresh device test (full refactor — Wave A A034 + A035 stub extend) |
| D015 | NC§4-C6 | GD | M | firebase.json + .firebaserc + scripts/deploy-rules.cjs | Firebase rules CLI deploy procedure — `firebase deploy --only firestore:rules,database` + nightly drift check |
| D016 | NC§17.1 | GD | M | src/util/sentry.js + appStore.telemetryOptIn | Telemetry opt-in flow honor Sentry — Sentry respects appStore.telemetryOptIn flag |

### D.4 i18n + DST + Library + Phase 5+6 verify (8 tasks)

| ID | Source | Karpathy | Effort | File | Title |
|----|--------|----------|--------|------|-------|
| D017 | NC§11-C1 | GD | M | tests/i18n/dstTransition.spec.ts (NEW) | DST transition tests + isoWeek audit (Romania timezone Europe/Bucharest spring/fall) |
| D018 | NC§11-* misc | GD | S | src/i18n/en/* | i18n EN locale stub completion (placeholders en) |
| D019 | NC§39-C1 | GD | M | src/engine/library/library.json + scripts/verify-library-count.cjs | Library 657 count verify + reconcile (Daniel SoT — currently 650 measured) |
| D020 | NC§45-C1 + §45-C2 | GD | M | scripts/verify-phase-5-6-batch.cjs (NEW) | Phase 5+6 BATCH verify — orphan stubs scan + reconcile (full refactor — Wave A A039 stub extend) |
| D021 | NC§38-* engine math precision | GD | L | tests/engine/precision/ + Stryker config | Engine math precision audit (Brzycki rounding + Kalman convergence + MEV/MAV/MRV) — Stryker mutation testing nightly |
| D022 | NC§16-* PWA spec | GD | M | vite.config.js workbox + UpdatePrompt | PWA UpdatePrompt + NetworkFirst Firebase workbox verify post dual-SW resolve (full refactor — Wave A A029 + A030 stub extend) |
| D023 | NC§44-* Mode Detection FSM | GD | M | src/engine/fsm/modeDetection.ts | Mode Detection FSM 5-mode strict transition table verify + adversarial test (closes D005 partial) |
| D024 | NC§35.* DB Tier 0/1/2 | GD | M | src/engine/storage/tierMapper.js | DB tier mapping audit + sync strategy verify (full refactor — Wave A A036 stub extend) |

### D.5 Bundle + ESLint + Tailwind CSS vars (5 tasks)

| ID | Source | Karpathy | Effort | File | Title |
|----|--------|----------|--------|------|-------|
| D025 | NC§5-C1 + §5-C3 + §5-C2 | GD | L | router.tsx + per-screen lazy() | Bundle code-split full refactor (Wave A A011 + A012 atomic extend to all sub-screens) |
| D026 | NC§1-C3 | GD | L | tailwind.config.js + global.css | Tailwind ↔ CSS vars migration full (Wave A A021 stub extend) |
| D027 | NC§1-C4 | GD | M | eslint.config.js + scripts | ESLint ratchet rules → error level (post-Wave-B+C cleanup) + jsx-a11y add |
| D028 | NC§4-C6 | GD | M | firestore.rules + database.rules.json + scripts/deploy-rules.cjs | Firebase rules CLI deploy procedure full (Wave A A015 stub extend) |
| D029 | NC§33-C1 + §33-C2 + §33-C3 | GD | M | .github/workflows/deploy.yml + ci.yml | deploy.yml test gate refactor full (Phase 7 LANDED — verify gaps + extend ci.yml parity) |

### D.6 Beta entry checklist + final gate (6 tasks)

| ID | Source | Karpathy | Effort | File | Title |
|----|--------|----------|--------|------|-------|
| D030 | NC§50-C1 | GD | M | 08-workflows/BETA_ENTRY_CRITERIA.md | Beta entry criteria checklist sign-off (Wave A A040 stub extend) — all clusters LANDED + Daniel Gates 5/5 + production readiness ≥85% |
| D031 | NC§34-C1+C2+C3 | GD | M | 08-workflows/PROD_OPS_RUNBOOK.md + scripts/healthcheck.cjs | Prod ops runbook + healthcheck script (Wave A A031+A032+A033 stub extend) |
| D032 | NC§28-C4 | GD | M | SettingsExport.tsx + portabilityTest.spec.ts | GDPR portability functional verify (Wave A A028 stub extend) |
| D033 | NC§31-* auth full audit | GD | M | src/auth.js + Magic Link spec | Auth flow full audit verify post Phase 7 LANDED (Mock removed, sendMagicLink wired, ProtectedRoute listener, AuthCallback finalize, Onboarding gate) |
| D034 | NC§43.* Trust & Safety | GD | M | src/coach/orchestrator/safetyChecks.ts | Trust & Safety positioning copy + filter audit (anti-paternalism + anti-surveillance verify) |
| D035 | NC§20-* supply chain | GD | M | scripts/sbom.cjs (NEW) + .snyk + npm audit | Supply chain hygiene — SBOM generate nightly + Snyk monitor + npm audit production filter |

---

## §E CLUSTER E — Paradigm Daniel deferred (~20 items NU CC autonomous)

| ID | Source | Decision needed | Severity | Daniel session ETA |
|----|--------|----------------|----------|---------------------|
| E001 | MP-pass2-settings-prefs-01 | SettingsPrefs PARADIGM SWAP: destructive vs preferences. Choose: revert prod cu mockup, amend mockup v1.1 cu prod, split routes | **CRIT** | ~30min |
| E002 | MP-ceva-nu-merge-01 | CevaNuMerge 1 option vs 5 options (Daniel Slice 1.7 explicit) — confirm V1 OR re-evaluate | HIGH | ~15min |
| E003 | MP-pain-button-01 | PainButton 3 types vs 15 regions paradigm | HIGH | ~15min |
| E004 | MP-equipment-swap-01 | EquipmentSwap per-exercise swap vs global busy/available toggle paradigm | HIGH | ~15min |
| E005 | MP-aparate-lipsa-01 | AparateLipsa 10 flat vs 3 categories grouped paradigm | MED | ~10min |
| E006 | MP-pass2-settings-notifications-01 | SettingsNotifications domain vs attribute grouping paradigm | MED | ~10min |
| E007 | MP-P6 + MP-antrenor-11 | Phase 6 prod-extras decision: keep PatternsBanner + AlertsBanner + StatsGrid + ReadinessVerdict + PRNotificationBanner + PRWallRecent → amend mockup v1.1 OR remove (drift cleanup) | **CRIT** | ~30min |
| E008 | MP-P6 (Progres) | BodyData "Masuratori corp" CTA + sub-route NOT în mockup — keep+amend OR remove | HIGH | ~15min |
| E009 | MP-pass2-aafriction-01 + D033 rename | AaFrictionModal → PerSetSafetyModal wording review pre-Beta (D033 LANDED rename) | MED | ~15min |
| E010 | MP-cont-04 | 4 Ajutor rows DISABLED — confirm targets (settings-support + about + faq exist via C036-C038) | HIGH | ~10min |
| E011-E014 | NC§47-* + §24-* wording backlog 22 items | 22 wording items Daniel CEO review pre-Beta — bundle 4 sessions | MED | ~30min × 4 |
| E015 | NC§28.3 + §9.* | Medical Disclaimer wording + timestamp UX final | MED | ~15min |
| E016 | NC§38-* engine math | Engine math thresholds Daniel SoT verify (MEV/MAV/MRV + Brzycki epsilon + Kalman half-life) | LOW | ~30min |
| E017 | NC§43.* T&S | Trust & Safety positioning copy review | LOW | ~15min |
| E018 | NC§30.* | Onboarding anti-bias copy verify (T0 Big 6 phrasing) | LOW | ~15min |
| E019 | NC§50.* personas | Persona coverage verify Gigel/Marius/Maria 65/Daniel direct register | MED | ~15min |
| E020 | MP-auth-03 + auth-04 | Google OAuth + Skip-auth path Slice 1.x decision (defers A013 + A014 paradigm) | HIGH | ~30min |

**Cluster E total Daniel time:** ~5-6h discussion + ~5-10h CC implementation post-decision.

---

## §F Aggregate metrics (D041 anti-inflation)

```
Source baseline (raw):
  - Audit Nuclear b705c3f 2026-05-19: 698 raw
  - Mockup Parity caaae99 2026-05-20: 263 raw (250 actionable post OK exclude)
  - Overlap dedup ~6
  Total raw: 961
  Total actionable: ~890

Phase 7 D031 LANDED (verified per ORCHESTRATOR §3.1):
  - ~58 audit nuclear closures (CRIT auth + Sentry + index.html + CSP + deploy gate + console drop + ESLint + ErrorBoundary)
  - 0 mockup parity closures (audit dated post-Phase-7)
  Total LANDED: ~58

Remaining actionable post Phase 7:
  - Audit Nuclear: ~640
  - Mockup Parity: ~250
  - Overlap dedup: -6
  Total remaining: ~870 raw findings actionable

Pattern collapse + per-screen aggregation:
  - Pass 4 polish per-file: ~60 → ~20 tasks (-40)
  - Per-screen text aggregation: ~70 → ~25 (-45)
  - Vanilla legacy archive cluster: ~30 → 1 (-29)
  - Coach engine wire: 5 → 2 (-3)
  Total collapse: -117

Net atomic task count: 870 - 117 = 753 remaining work-units
  Further consolidated via Wave D multi-file bundling = ~305 atomic tasks final

Wave split:
  Wave A — Critical real OPEN + Coach + ConfirmModal: ~40 tasks
  Wave B — Surgical text + tokens + polish: ~150 tasks
  Wave C — Components + Simplicity + MISSING: ~80 tasks
  Wave D — Goal-driven multi-file refactor: ~35 tasks
  Cluster E — Paradigm Daniel deferred: ~20 items

Total CC autonomous: 305
Total Daniel-side: 20
GRAND TOTAL: 325 actionable items

Estimated ETA CC autonomous Opus continuous:
  Wave A: 40 × ~20min avg = ~13h (mix S/M/L cu setup overhead)
  Wave B: 150 × ~12min avg = ~30h (mostly S surgical)
  Wave C: 80 × ~22min avg = ~30h (mix M component builds)
  Wave D: 35 × ~40min avg = ~23h (M-L multi-file refactors)
  Total: ~96h CC continuous = ~12 working days @ 8h/day sustainable
  Hybrid 2-session parallel: ~7-9 calendar days elapsed
```

---

## §G Anti-recurrence per-task pre-flight protocol

Per task atomic execute (per ORCHESTRATOR.md §4):

```
1. READ primary-source finding file lines cited verbatim
2. READ prod file head 50 lines (per File column above)
3. GREP "§<finding-id> audit fix" în prod file → IF MATCH: NO-OP SKIP + log
4. gitnexus_impact({target: "<symbol>"}) IF non-trivial
5. EDIT prod file per Title spec
6. gitnexus_detect_changes → verify expected symbols only
7. npm run test:run -- <relevant-spec> IF tests touched
8. git add <files> && git commit -m "fix(<wave>-<id>): <desc> (<source>)"
9. Mark task LANDED în _progress.md
10. Continue
```

Karpathy attribution per task explicit (SC/SF/TBC/GD).

---

🦫 **_MASTER_BACKLOG V2 — 305 atomic tasks + 20 Cluster E deferred. ~96h CC Opus. 4 Waves D043 convergence. Per-task HEAD verify mandatory.**
