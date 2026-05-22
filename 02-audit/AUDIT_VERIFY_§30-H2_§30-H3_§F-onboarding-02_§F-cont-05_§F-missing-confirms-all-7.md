# Audit verify-only — §30-H2 Step 7 tone + §30-H3 resume policy + §F-onboarding-02 step order + §F-cont-05 Aparate lipsa wire + §F-missing-confirms-all-7 modals registered

**Status:** AUDIT-COMPLETE
**Date:** 2026-05-23
**Authority:** §30.8 + §30.11 + §F-onboarding-02 + §F-cont-05 + §F-missing-confirms-all-7 audit-nuclear-2026-05-19 + mockup-vs-prod-parity Wave A-F closure
**Scope:** Five verify-only HIGH items consolidated — fresh attack chat 5 (W4-HIGH-FRESH). Verify codebase claims match documented expectations OR surface paradigm divergences for Daniel CEO. Pure audit doc; ZERO code change.

---

## §1 — §30-H2 Onboarding completion celebration UX (Step 7 summary tone)

**Question:** Verify Step 7 tone warm Daniel-direct vs corporate "Felicitari!" wording.

**Evidence:** `src/react/routes/screens/Onboarding.tsx:299-314`

```tsx
function Step7({ data }: { data: OnboardingData }): JSX.Element {
  return (
    <>
      <h1 className="text-2xl font-semibold text-ink mb-2">Verifica datele</h1>
      <p className="text-sm text-ink2 mb-6">Poti reveni oricand sa schimbi.</p>
      <div className="bg-paper2 border border-line rounded-xl p-4 space-y-2" data-testid="onb-summary">
        ... { age / sex / goal / frequency / experience / weight summary rows } ...
      </div>
    </>
  );
}
```

**Tone analysis (Daniel anti-paternalism lens):**
- H1 `Verifica datele` — neutral, factual, user-empowering imperative. NOT corporate "Felicitari pentru completare!" / NOT paternalistic.
- Subtitle `Poti reveni oricand sa schimbi` — Daniel-direct reassurance: NO lock-in fear. Warmth without saccharine.
- ZERO emoji, ZERO confetti, ZERO "Bravo!" / "Asa te vreau!" / "Esti grozav!" patterns (D024 LOCKED V1 anti-paternalism wording compose).
- Summary surface = data review affordance (Maria 65 friendly — verify-before-commit).

**Persona test:**
- Gigel (non-tech mediu): instantly understands "Verifica datele" = "uite ce ai introdus, e ok?". Pass.
- Marius (perf): no patronizing pat-on-back; clean data review. Pass.
- Maria 65 (conservativ): "Poti reveni oricand" reduces commit anxiety. Pass.

**Verdict §30-H2:** VERIFIED PASS. Step 7 tone matches D024 LOCKED V1 anti-paternalism Daniel-direct wording compose. NO corporate "Felicitari!" — instead empowering data review framing. NO drift detected from mockup intent (mockup line 1075-1100 also shows summary table sans celebration emoji).

**Cross-ref:** D024 LOCKED V1 wording autonomous compose + ANDURA_PRIMER §1-§5 anti-paternalism brand positioning + RECON_HIGH §30-H2 spec "verify warm Daniel-direct vs corporate Felicitari".

---

## §2 — §30-H3 Resume incomplete onboarding policy

**Question:** Verify onboardingStore persist middleware retains data on close mid-flow; on reopen does Onboarding.tsx read `data` field and navigate to last step OR restart at step 1?

**Evidence:** `src/react/stores/onboardingStore.ts:152-216`

```ts
export const useOnboardingStore = create<OnboardingState & OnboardingActions>()(
  persist(
    (set) => ({
      data: { ...EMPTY },
      completed: false,
      completedAt: null,
      setField: (key, value) => { ... },
      finalize: () => { ... },
      reset: () => set({ data: { ...EMPTY }, completed: false, completedAt: null }),
    }),
    {
      name: 'wv2-onboarding-store',
      storage: createJSONStorage(() => localStorage),
      version: 2,
      partialize: (state) => ({
        data: state.data,
        completed: state.completed,
        completedAt: state.completedAt,
      }),
      migrate: (...) => { ... },
    },
  ),
);
```

**Routing decision:** `src/react/routes/ProtectedRoute.tsx:68-70`

```tsx
if (!onboardingCompleted) {
  return <Navigate to="/onboarding/1" replace />;
}
```

**Resume policy (current LOCKED V1 implicit):**

| User action | Behavior on reopen |
|-------------|-------------------|
| Started onboarding, closed mid-flow at step 3, completed=false | Returns to `/onboarding/1` (always step 1) BUT inputs pre-filled (data persists per partialize) |
| Completed full 7 steps (`completed: true` set by `finalize`) | Bypasses onboarding redirect, lands on `/app/antrenor` |
| Never started (data EMPTY + completed=false) | Lands on `/onboarding/1` blank |
| Tap "Reset onboarding" cont menu (`reset()`) | Wipes data + completed; behaves like never-started |

**Rationale (Bugatti craft + Gigel filter):**
- "Always restart at step 1 with prefilled data" = simpler mental model. User sees full progress dots, scrolls through their answers, can correct any.
- Avoids step-resume edge cases (e.g., user pre-filled step 3 then quit; do we trust step-3 data was valid? what if they edited via DevTools?).
- ProtectedRoute gate is binary: completed OR not. Step-resume would need new `lastStepIndex` field + step validity invariants — overengineered pre-Beta.
- Maria 65: comfortable seeing her values, no "magic last step" surprise.

**Edge case caught:** if user opens `/onboarding/5` URL directly while completed=false but no data, `stepNum=5` rendered (URL param respected). UX safe: Step 5 renders empty Frecventa picker; Continua gate blocks without selection (no engine corruption). Acceptable behavior pre-Beta.

**Verdict §30-H3:** VERIFIED PASS. Resume policy is "data persists per zustand partialize → user starts at step 1 with all prior values prefilled → can navigate forward". NO step-resume to last visited step. Policy documented here pre-Beta; no code change needed.

**Cross-ref:** §B007/D-3 audit fix + §30-C1 Big 6 bounds enforcement + D047 RIP-OUT drill-down screens.

---

## §3 — §F-onboarding-02 Step 1 mockup vs prod paradigm divergence

**Question:** Verify Onboarding Step 1 verbatim copy vs mockup andura-clasic.html.

**Evidence — Step ORDER divergence (CRITICAL paradigm flag):**

| Step | Mockup (andura-clasic.html L485-728) | Prod (Onboarding.tsx) |
|------|--------------------------------------|------------------------|
| 1 | **Obiectiv** + medical disclaimer integrat | **Varsta** (`Ce varsta ai?`) |
| 2 | Varsta (`Cati ani ai?`) | Sex (`Cum te identifici?`) |
| 3 | Sex (`Sex biologic`) | Obiectiv (`Ce vrei sa obtii?`) |
| 4 | **Inaltime** (`Inaltime`) | Frecventa (`De cate ori pe saptamana?`) |
| 5 | Greutate | Experienta (`Cat de avansat esti?`) |
| 6 | Frecventa | Greutate (`Care e greutatea ta acum?`) |
| 7 | Experienta | Summary (`Verifica datele`) |

**Paradigm divergences:**
1. **Step order INVERTED:** Mockup leads with Obiectiv (psychological commitment first); prod leads with Varsta (demographic-prior-first).
2. **Mockup has `Inaltime` field at Step 4** — prod `OnboardingData` interface has NO `height` field. Mifflin-St Jeor BMR/TDEE engine consumers (BMRStrip §F-pass2-fatiguestrip-02) currently use a fallback estimate from age+sex+weight; with `inaltime`, would yield precise TDEE.
3. **Medical disclaimer integrated at Step 1 mockup** vs MedicalDisclaimerModal trigger downstream (Pain Button path) in prod.

**Why NOT trivial swap:**
- Adding `inaltime` field breaks `OnboardingData` interface contract → cascades to engine adapters (BMR, TDEE, weaknessDetector) + persistence migration (onboardingStore version 3) + tests across `src/react/__tests__/stores/onboardingStore.test.ts`.
- Step reorder breaks D047 Big 6 hard typing test suite + Phase 5 task_14 LANDED contract.
- D046 §28-H5 GDPR Romania consent gate at age 16 currently enforced via Step 1 (age first); moving age to Step 2 means consent gate moves too.

**Verdict §F-onboarding-02:** PARADIGM DIVERGENCE FLAGGED — NOT a verbatim copy fix. Surfaces Daniel CEO strategic decision:
- **Option A** (mockup parity): refactor to mockup 7-step order + add `inaltime` field. Cost: ~M-L (interface change + engine adapter wires + test migration). Benefit: better TDEE precision + emotional commitment lead.
- **Option B** (prod path-of-least-resistance): keep prod Step 1=Varsta + amend mockup to match prod. Cost: S (mockup edit). Benefit: zero refactor risk pre-Beta.
- **Option C** (additive): keep prod order + add `inaltime` as optional Step-2.5 or Profile-edit-post-onboarding field. Cost: ~M. Benefit: TDEE precision without disrupting Big 6 hard typing flow.

**Recommendation pre-Beta:** Option B (amend mockup to prod) — Bugatti craft Quality > Speed argues against pre-Beta paradigm churn on LANDED Phase 5 task_14 contract. Inaltime additive (Option C) defer post-Beta if TDEE precision proves limiting.

**Cross-ref:** mockup andura-clasic.html L485-728 + ADR_MULTI_TENANT_AUTH §AMENDMENT 2026-05-05.7 (Mifflin-St Jeor BMR/TDEE inaltime requirement) + D046 §28-H5 GDPR consent gate + DECISIONS.md D031 push policy (do NOT push paradigm pivot pre Daniel approve).

---

## §4 — §F-cont-05 "Aparate lipsa" row General section target wired

**Question:** Verify Cont.tsx row `Aparate lipsa` navigates to `aparate-lipsa` route (mockup says `goto('aparate-lipsa')`; RECON claimed prod had `target: undefined` so row disabled).

**Evidence:** `src/react/routes/screens/cont/Cont.tsx:55-61`

```tsx
{
  title: 'General',
  rows: [
    { id: 'appearance', label: 'Aspect', Icon: Palette, target: 'settings-appearance' },
    { id: 'aparate-lipsa', label: 'Aparate lipsa', Icon: XOctagon, target: 'aparate-lipsa' },
    { id: 'prefs', label: 'Setari', Icon: SlidersHorizontal, target: 'settings-prefs' },
  ],
},
```

**Route registered:** `src/react/routes/router.tsx:37 + 137` — `AparateLipsa` lazy + `path: 'aparate-lipsa'` under `/app/antrenor/aparate-lipsa`.

**Wire:** `handleRowClick(target: GotoScreen | undefined)` → `navigate(gotoPath(target))`. Target `aparate-lipsa` resolves to `/app/antrenor/aparate-lipsa` via `gotoPath()` mapping.

**Verdict §F-cont-05:** VERIFIED PASS. Row wired with `target: 'aparate-lipsa'` (NOT undefined). Click navigates to `/app/antrenor/aparate-lipsa` lazy-loaded AparateLipsa screen. NO disabled-row state.

**Cross-ref:** §F-aparate-lipsa-01 mockup naming + checkbox UI LANDED commit `499ac859` (HIGH-GAMMA fix wave 3-B) — sub-screen surface complete.

---

## §5 — §F-missing-confirms-all-7 verify all 7 confirm modals registered + routed

**Question:** Verify 7 destructive-flow Confirm modals registered + functional per mockup full-screen pattern.

**Evidence — router.tsx registration:**

| # | Modal | router.tsx line | Path |
|---|-------|----------------|------|
| 1 | `LogoutConfirm` | 76 + 184 | `/app/cont/logout-confirm` |
| 2 | `DeleteAccountConfirm` | 77 + 185 | `/app/cont/delete-account-confirm` |
| 3 | `ResetDataConfirm` | 78 + 186 | `/app/cont/reset-data-confirm` |
| 4 | `RedoOnboardingConfirm` | 80 + 188 | `/app/cont/redo-onboarding-confirm` |
| 5 | `SchimbaFazaConfirm` | 81 + 189 | `/app/cont/schimba-faza-confirm` |
| 6 | `ResetCoachConfirm` | 82 + 190 | `/app/cont/reset-coach-confirm` |
| 7 | `FinishEarlyConfirm` | 42 + 139 | `/app/antrenor/finish-early-confirm` |
| **bonus** | `ProgramChangeConfirm` (PAR-003 parity) | 44 + (antrenor sub) | `/app/antrenor/program-change-confirm` |

**Implementation pattern (sample LogoutConfirm.tsx):**
- Full-screen `<section>` cu `min-h-screen bg-paper text-ink`.
- Warning copy + destructive description.
- 2 CTAs: Confirma (brick) + Anuleaza (paper2 outlined).
- Cancel returns to prior route via `navigate(-1)`.

**Tests coverage:**
- `src/react/__tests__/screens/cont/LogoutConfirm.test.tsx`
- `src/react/__tests__/screens/cont/DeleteAccountConfirm.test.tsx`
- `src/react/__tests__/screens/cont/ResetDataConfirm.test.tsx`
- Plus rescue test commit `0b65bbc7` (W3-B) — work-on-disk surfaced post a9cd6f4b ghost-meta.

**Verdict §F-missing-confirms-all-7:** VERIFIED PASS. All 7 mandatory confirm modals exist + registered + routed + lazy-loaded. Bonus ProgramChangeConfirm landed via PARITY-CONFIRM-MODALS Wave 2f (commit `26f03c1e`). RECON §F-missing-confirms-all-7 spec satisfied.

**Cross-ref:** D047 RIP-OUT drill-down screens (Stage 1-3) + PARITY-CONFIRM-MODALS Wave 2f + RECON_HIGH_OPEN §F-missing-confirms-all-7 closure expectation.

---

## Cross-cluster summary

| Finding | Cluster | Verdict | Action |
|---------|---------|---------|--------|
| §30-H2 | HIGH-ALFA | VERIFIED PASS | Ledger flip `open → fixed` (verify-only) |
| §30-H3 | HIGH-ZETA leftover | VERIFIED PASS (policy documented) | Ledger flip `open → fixed` |
| §F-onboarding-02 | HIGH-ALFA | PARADIGM FLAG | Daniel decision A/B/C; defer code change |
| §F-cont-05 | HIGH-BETA | VERIFIED PASS | Ledger flip (already wired) |
| §F-missing-confirms-all-7 | HIGH-ZETA | VERIFIED PASS | Ledger flip (all 7 routes registered) |

**ZERO code mutation.** Pure audit doc consolidation per Bugatti craft Quality > Speed pre-Beta verification gate.

**Daniel CEO action item:** §F-onboarding-02 surface Option A/B/C decision when bandwidth permits (post-substrate/MED/parity in-flight work).
