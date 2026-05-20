# Audit progress checkpoint — Mockup vs Prod Parity 2026-05-20

**Started:** 2026-05-20 birou (post commit `32a848d`)
**Status:** ✅ **AUDIT FINAL COMPLETE** — Pass 1 + Pass 2 (29) + Pass 3 (8 patterns) + Pass 4 (polish) + Pass 5 (54 PNG) LANDED
**Stop trigger:** Daniel STOP UNIC

## ✅ COMPLETE — Pass 1 (50/50 mockup screens documented)

| Wave | Coverage |
|------|----------|
| A | 6 main entries deep ✅ |
| B | 6 Antrenor critical path deep ✅ |
| C | 5/6 Antrenor secondary batch ✅ |
| D | 13 Cont sub-screens batch (9 LANDED + 4 MISSING) ✅ |
| E | 7 onboarding collapsed ✅ |
| F | 15 MISSING surfaces documented ✅ |
| G | 7 confirm modals ALL MISSING verified ✅ |

## ✅ COMPLETE — Pass 2 (29 components/sub-screens deep-dived)

| # | Component/Sub-screen | Parity | CRIT |
|---|----------------------|--------|------|
| 1 | SessionTimer | 45% | 1 |
| 2 | RestOverlay | 30% | 1 |
| 3 | CoachTodayCard | 30% | 3 (HARDCODED) |
| 4 | Calendar7Day | 70% | 0 |
| 5 | TDEEStrip | 55% | 0 |
| 6 | FatigueStrip | 45% | 0 |
| 7 | HeatMapWeekly | 30% | 1 (paradigm) |
| 8 | NutritionInline | 80% | 0 |
| 9 | SetLogInput | 35% | 0 |
| 10 | SetRatingButtons | 50% | 0 |
| 11 | ExitConfirmSheet | 80% | 0 |
| 12 | InactivityPrompt | 85% | 0 |
| 13 | StatsGrid (Ph6 extra) | 80% | 0 |
| 14 | ReadinessVerdict (Ph6 extra) | 75% | 0 |
| 15 | CoachRestCard | 35% | 2 (HARDCODED) |
| 16 | PRWallRecent (Ph6 extra) | 80% | 0 |
| 17 | PatternsBanner+AlertsBanner | 80% | 0 |
| 18 | ReactivateCard | 70% | 0 |
| 19 | ResumeSessionCard | 75% | 0 |
| 20 | AaFrictionModal | 75% | 0 (wording flag) |
| 21 | SettingsProfile | 30% | 2 (sections missing) |
| 22 | SettingsNotifications | 40% | 0 |
| 23 | SettingsSubscription | 95% | 0 (BUGATTI VERBATIM) |
| 24 | SettingsAppearance | 55% | 0 |
| 25 | SettingsPrefs | 10% | 1 (PARADIGM SWAP) |
| 26 | SettingsPrivacy | 50% | 0 |
| 27 | SettingsTerms | 70% | 0 |
| 28 | SettingsExport | 80% | 0 |
| 29 | SettingsDanger | 55% | 0 |

**Pass 2 mean parity: 56.6% (29 components).**
**Pass 2 CRIT total: 11 (sub-comp) + 7 Wave G missing confirms = 18 CRIT.**

## ✅ COMPLETE — Pass 3 (8 cross-screen patterns aggregated)

1. P1 SubHeader back-btn INCONSISTENT — 15+ screens affected
2. P2 Coach voice Lora italic INCONSISTENT — 6 screens
3. P3 Emoji traffic-light 🟢🟡🔴 MISSING — 3 locations
4. P4 HARDCODED placeholders CoachTodayCard + CoachRestCard — 5 CRIT (single Phase 5 wire task)
5. P5 7 Confirm modals ALL MISSING — UX safety gap
6. P6 Phase 6 prod-extras DRIFT — Daniel decision needed
7. P7 Paradigm divergences Antrenor secondary — Daniel reglaj 2026-05-12 contradicted
8. P8 Cont account card hardcoded — wire from authStore + profileStore

## ✅ COMPLETE — Pass 4 (LOW + NIT polish backlog)

~22 polish findings across 8 categories:
- Spacing micro-divergences (asymmetric padding)
- Border-radius drift (12 vs 14 vs 16 vs 18 vs 22)
- Font weight subtle (700 mockup vs 600 prod)
- Color shade micro-drift (verify token mapping)
- Icon size minor (14px vs 16px defaults)
- Text alignment subtle
- Animation timing (deferred)
- Other (compliance positives)

**Wave 3 polish effort estimate: ~4-6h Surgical Tailwind class adjustments.**

## ✅ COMPLETE — Pass 5 (Playwright screenshots, 54 PNG)

**Executed 2026-05-20 per PROMPT_CC_mockup-vs-prod-parity-PASS5.** Playwright 1.59.1 + Chromium 1217 (viewport 380x812 mobile-first).

**Output:** `screenshots/` subdir — 54 PNG (26 mockup + 14 prod + 14 local dev).

| Surface | Count | Method |
|---------|-------|--------|
| MOCKUP | 26 | `file:///andura-clasic.html` + `goto(<screenId>)` via Playwright `evaluate` |
| PROD (auth-gated) | 14 | `https://andura.app/<route>` + localStorage seed + history.replaceState patch (URL stays but React Router internal state still routes /auth → Auth renders) |
| LOCAL DEV (functional) | 14 | `http://localhost:5173/<route>` + mock-login `[data-testid="auth-mock"]` (DEV-only) + in-app pushState/popstate navigation |

**Local dev = canonical functional proof.** Prod /app/* screenshots show auth-gate behavior; not divergence proof. See `SUMMARY.md` §S9.6 honest limitations.

**Capture script:** `scripts/pass5-screenshots.cjs` (re-runnable via `node scripts/pass5-screenshots.cjs`, supports `--mockup-only` / `--prod-only` / `--local-only` flags).

**Visual proof spot-check confirmations:**
- F-pass2-settings-prefs-01 PARADIGM SWAP (destructive vs preferences) — VISUALLY CONFIRMED via mockup+localdev pair
- F-pass2-coachtoday-01/02/03 HARDCODED placeholder — VISUALLY CONFIRMED (identical demo text mockup ↔ localdev)
- F-workout-preview-01/02/03 (3 missing sections — Session header + Warmup + Exercise list) — VISUALLY CONFIRMED

## Audit final summary

- **31 markdown files** in `📤_outbox/mockup-vs-prod-parity-2026-05-20/`
- **54 PNG visual proof artifacts** in `screenshots/` subdir (26 mockup + 14 prod + 14 local dev)
- **~263 findings cumulative**
- **~42 CRIT Beta blockers**
- **~36% measured mockup parity** (D041 anti-inflation honored)
- **Aligns Daniel "30% mockup parity" observation @ birou 2026-05-20**
- **Pass 5 visual proof CONFIRMS 3 highest-impact findings** (settings-prefs paradigm swap + coachtoday hardcoded + workout-preview 3 missing sections)

## Most critical strategic findings

1. **CoachTodayCard + CoachRestCard HARDCODED** — single Phase 5 wire closes 5 CRIT (Antrenor home core UX restored)
2. **7 confirm modals ALL MISSING** — 1 shared ConfirmModal + 7 sites closes 7 CRIT (UX safety mandatory)
3. **SettingsPrefs CRITICAL PARADIGM SWAP** — destructive actions in mockup vs system preferences in prod (most severe content mismatch)
4. **15 MISSING screens** — 5 priority Wave 1 (weight-timeline/loguri-greutate/support/about/faq)
5. **Auth Google + Skip-auth + Antrenor Obiectiv + Istoric calendars + WorkoutPreview rich content** explicit Daniel reglaj contradictions
6. **Cross-pattern fixes** (SubHeader/emoji/coach voice) close ~35 findings via 3-4 surgical patterns

## Daniel decision points (post-audit)

1. **Tier 1 quick-win wave** (~1-2 days) closes 12 CRIT — recommend immediate
2. **Tier 2 build new components** (~5-7 days) closes ~15 CRIT
3. **Tier 3 paradigm decisions** (~discussion sessions) — Daniel CEO review needed pre-Beta
4. **Phase 8 nuclear audit** (per D029 next iteration) pre-Launch — measure post-fix readiness
5. **Pass 5 screenshots** invocation when Daniel wants visual proof for specific findings

Daniel STOP = checkpoint preserved; resume cu fresh context anytime.
