# Pass 2 — Final Workout sub-components + Wave G modalManager verify

## ExitConfirmSheet (`src/react/components/Workout/ExitConfirmSheet.tsx` — 76 LOC)

### Verdict: HIGH FIDELITY ✓

- 3 buttons present (Continui sesiunea / Salveaza si reia mai tarziu / Renunt la sesiune)
- Bottom sheet pattern cu backdrop + role="dialog" + aria-label
- Dynamic progress copy "Ai facut {exIdx}/{total} exercitii"
- Brick color for destructive option
- Compliance: Daniel reglaj 2026-05-12 pattern preserved

**ExitConfirmSheet parity: 80%** (minor token + label tweaks possibly Pass 3)

---

## InactivityPrompt (`src/react/components/Workout/InactivityPrompt.tsx` — 50+ LOC)

### Verdict: HIGH FIDELITY ✓

- Mockup wv2 verbatim copy explicit (per code comment) — "Esti acolo?" + 7 min body + Continui + Salveaza si iesi
- Threshold matches mockup wv2 constants (7 min)
- Soft prompt overlay NU blocking — matches mockup intent
- Compliance: Daniel reglaj wv2 verbatim

**InactivityPrompt parity: 85%** (highest fidelity Workout component sampled)

---

## Wave G — 7 Confirm modals modalManager verify

### Prod modal inventory

**Modal-named components în prod:**
- `src/react/components/AaFrictionModal.tsx` (107 LOC) — LOCK 9 Aggressive Loading sub-flow
- `src/react/components/MedicalDisclaimerModal.tsx` — Medical disclaimer T&C

**ZERO confirm modals matching mockup's 7 confirm screens:**
- `confirm-reset-coach` — NOT FOUND
- `confirm-schimba-faza` — NOT FOUND
- `confirm-redo-onboarding` — NOT FOUND
- `confirm-logout` — NOT FOUND
- `confirm-delete` — NOT FOUND
- `confirm-program-change` — NOT FOUND
- `confirm-finish-early` — NOT FOUND

### F-pass2-confirms-all-7-MISSING (CRIT)

- **Severity:** CRIT (×7)
- **Category:** Component + Behavior + Safety
- **Mockup:** 7 distinct confirm screens cu warning copy + destructive CTA + cancel
- **Prod:** ZERO implemented — none exist as components, routes, OR inline modals (sampled component dir + grep no match)
- **Mockup ref:** `andura-clasic.html:2126, 2141, 2296, 2311, 2326, 2363, 2378`
- **Prod ref:** ABSENT from `src/react/components/`
- **Karpathy fix:** Build 7 confirm modals (likely shared `<ConfirmModal>` component cu props: title + body + confirmCta + cancelCta + onConfirm + onCancel)
- **Fix effort:** L (1 shared modal + 7 usage sites în target screens: settings-danger / workout menu / antrenor program change / onboarding redo)
- **Beta blocker?** YES (all 7) — destructive actions WITHOUT confirmation = UX safety violation. Settings-danger row "Reset coach" / "Sterge cont" / "Logout" without confirm = catastrophic accidental loss

### Specific Beta-blocker confirms

1. **confirm-delete** (delete account) — CRIT data-loss risk
2. **confirm-logout** — HIGH (typically expected confirmation)
3. **confirm-reset-coach** — CRIT engine state loss
4. **confirm-redo-onboarding** — CRIT profile data loss
5. **confirm-finish-early** — HIGH (mid-workout session loss)
6. **confirm-schimba-faza** — HIGH (periodization context loss)
7. **confirm-program-change** — MED (program adjustment confirmation)

**Wave G verdict: 7/7 CRIT-or-HIGH Beta blockers — implementing safety confirms is Wave 1 must-have.**

---

## Pass 2 cumulative final (13 sub-components + Wave G)

| Component | Parity | CRIT |
|-----------|--------|------|
| SessionTimer | 45% | 1 (menu) |
| RestOverlay | 30% | 1 (SVG ring) |
| CoachTodayCard | 30% | 3 (HARDCODED) |
| Calendar7Day | 70% | 0 |
| TDEEStrip | 55% | 0 |
| FatigueStrip | 45% | 0 |
| HeatMapWeekly | 30% | 1 (paradigm) |
| NutritionInline | 80% | 0 |
| SetLogInput | 35% | 0 |
| SetRatingButtons | 50% | 0 |
| ExitConfirmSheet | 80% | 0 |
| InactivityPrompt | 85% | 0 |
| 7 Confirms (Wave G) | 0% | 7 (ALL MISSING) |

**Pass 2 sample mean (13 components, excluding 7 missing confirms): 52% parity**
**Including 7 missing confirms in average: 28% (drops sharply with 7 zeros)**

**Pass 2 CRIT total: 13 (6 Pass 2 components + 7 missing confirms)**

**Pattern observation:** Workout sub-components show BIFURCATION:
- ✓ HIGH fidelity: ExitConfirmSheet (80%) + InactivityPrompt (85%) + NutritionInline (80%) + Calendar7Day (70%) — explicitly mockup-verbatim or engine-wired clean
- ⚠️ LOW fidelity: CoachTodayCard (30% hardcoded) + RestOverlay (30% no SVG) + HeatMapWeekly (30% paradigm) — TBD wire OR paradigm decisions

**Strategic Pass 2 insight:** Some components LANDED Bugatti craft (verbatim mockup honor), others LANDED PLACEHOLDER (TBD-wire deferred indefinitely). The mix explains overall ~50% parity — it's not uniform "everything 50% done", it's "half components 80%, half components 30%" cu spread.
