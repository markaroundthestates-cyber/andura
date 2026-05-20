# Pass 3 — Cross-screen patterns aggregation

**Approach:** Aggregate Pass 1 + Pass 2 findings into cross-cutting patterns. Single fix per pattern closes findings across multiple screens.

---

## Pattern P1: SubHeader back-btn INCONSISTENT adoption

**Occurrence:**
- ✓ HAS pattern: SettingsNotifications (and likely most Cont sub-screens via sticky header convention)
- ✗ LACKS pattern: EnergyCheck, EnergyCause, WorkoutPreview, PostRpe, PostSummary, CevaNuMerge, PainButton, EquipmentSwap, AparateLipsa, ScheduleOverride

**Mockup intent:** Every sub-page (`class="sub-page"` ~35+ screens) has `<sub-header><back-btn /><h2></h2></sub-header>` pattern.

**Fix:** Extract shared `<SubHeader>` component (~30 LOC) + apply to ~15 sub-screens. ~10 LOC change per screen.

**Total findings closed:** ~15 (one per screen using h1 instead of sub-header pattern)

**Beta blocker:** YES — UX consistency expectation

**Karpathy fix attribution:** Surgical Changes (cross-cutting refactor)

---

## Pattern P2: Coach voice italic Lora INCONSISTENT

**Mockup:** Coach quotes use `<div class="coach-quote">` cu Lora serif italic styling — appears on Antrenor (today WHY), PostRpe (intro), PostSummary (felicitare), WorkoutPreview, Progres (plan nutritie quote).

**Occurrence:**
- ✓ HAS: PostSummary (font-serif italic), WorkoutPreview (font-serif italic), CoachTodayCard (font-serif italic), CoachRestCard (font-serif italic)
- ✗ LACKS: Splash subtitle (plain text-sm), Antrenor subtitle "Cine te ghideaza in sala" MISSING entirely, PostRpe intro (plain text)

**Fix:** Tailwind utility `coach-quote` class consistency apply where mockup uses it.

**Total findings closed:** ~6 cumulative coach voice references

**Beta blocker:** MED — product personality positioning

---

## Pattern P3: Emoji traffic-light 🟢🟡🔴 MISSING

**Mockup:** Consistent traffic-light pattern across:
- EnergyCheck (3-state: Excelent/Normal/Obosit)
- PostRpe (3-rating: Usor/Potrivit/Greu)
- SetRatingButtons during workout (Usor/Potrivit/Greu)
- Possibly other rating decisions

**Prod:** ZERO of these have emojis. Plain text-only buttons.

**Fix:** Surgical (add emoji prefix to each option). ~2 LOC per location × 3 locations.

**Total findings closed:** 3 (F-energy-check-02 + F-post-rpe-02 + F-pass2-setrating-01)

**Beta blocker:** YES — visual scan pattern consistency, Daniel positioning explicit

---

## Pattern P4: HARDCODED placeholders în Phase 5 stubs

**Components affected:**
- CoachTodayCard (3 CRIT findings)
- CoachRestCard (2 CRIT findings)
- (Possibly more deferred Pass 2 — verify CoachTodayCard's parent flow Phase 5+ wiring intent)

**Pattern:** Code comments explicit "Phase 3 stub... Phase 5+ va wire". Phase 5 wiring NEVER landed despite Phase 6 markers in parent stack.

**Fix:** Single Phase 5 engine wiring task — pass real props from `getCoachToday` aggregate to both cards.

**Total CRIT closed:** 5 (3 CoachTodayCard + 2 CoachRestCard)

**Beta blocker:** YES — most prominent Antrenor home UI broken regardless of user context

**Karpathy attribution:** Think Before Coding (engine integration) + Goal-Driven (Antrenor home == core UX surface)

---

## Pattern P5: 7 Confirm modals ALL MISSING — UX safety gap

**Mockup:** 7 distinct confirm screens for destructive actions (reset-coach, schimba-faza, redo-onboarding, logout, delete, program-change, finish-early).

**Prod:** ZERO implemented. Only AaFrictionModal (different scope: per-set LOCK 9 safety) + MedicalDisclaimerModal exist as overlay modals.

**Fix:** Build 1 shared `<ConfirmModal>` component cu props (title/body/confirmCta/cancelCta) + wire 7 use sites.

**Total CRIT closed:** 7

**Beta blocker:** YES — UX safety violation for destructive actions

---

## Pattern P6: Phase 6 prod-extras NOT în mockup (drift)

**Antrenor home extras:**
- PatternsBanner (engine-wired ✓)
- AlertsBanner (engine-wired ✓)
- StatsGrid (engine-wired ✓)
- ReadinessVerdict (engine-wired ✓)
- PRNotificationBanner (engine-wired ✓)
- PRWallRecent (engine-wired ✓)

**Progres extras:**
- BodyData ("Masuratori corp" CTA + sub-route — NOT în mockup)

**Status:** ALL engine-wired clean (none HARDCODED). Pattern = Daniel-approved Phase 6 audit-driven additions per D027 task_06.

**Decision needed:** Daniel CEO review — keep prod + amend mockup v1.1 OR remove prod converge mockup baseline.

**Karpathy attribution:** Goal-Driven Execution (Phase 6 added perceived-value features)

---

## Pattern P7: Paradigm divergences în Antrenor secondary

**Affected screens (direct contradictions Daniel reglaj 2026-05-12):**
- CevaNuMerge: 1 vs 5 options (Daniel Slice 1.7 explicit "Nu am aparat REMOVED")
- PainButton: 3 types vs 15 regions (Daniel 2026-05-11 "presets > liber, force coach-driven taxonomy")
- EquipmentSwap: per-exercise swap vs global busy/available toggle
- AparateLipsa: 10 flat checkboxes vs 3 categories grouped

**Status:** Prod implementations took different design directions despite Daniel reglaj documented în mockup comments.

**Decision needed:** Daniel — keep prod (different paradigm but functional) OR re-converge mockup (smaller paradigm closer to Bugatti craft minimalism).

**Karpathy attribution:** Think Before Coding (decision required Daniel pre-Beta)

---

## Pattern P8: Hardcoded data în Cont account card

**Affected:** Cont.tsx avatar + name + email all placeholder ("A" / "Utilizator" / "Profilul tau Andura")

**Fix:** Wire from authStore + profileStore (~5 LOC change)

**Total CRIT closed:** 0 (3 HIGH findings)

**Beta blocker:** YES — first impression Cont tab shows generic placeholder

---

## Pattern aggregation summary

| Pattern | Findings closed | Fix effort | Beta priority |
|---------|----------------|-----------|---------------|
| P1 SubHeader | ~15 | M (shared component + 15 use sites) | Wave 1 |
| P2 Coach voice italic | ~6 | S (Tailwind class) | Wave 2 |
| P3 Emoji traffic-light | 3 | S (per location) | Wave 1 |
| P4 HARDCODED Coach cards | 5 CRIT | M (1 Phase 5 wiring task) | Wave 1 |
| P5 7 Confirm modals | 7 CRIT | L (shared ConfirmModal + 7 sites) | Wave 1 |
| P6 Phase 6 drift | N/A | Daniel decision | Wave 4 |
| P7 Paradigm divergences | 3 CRIT (paradigm) | Daniel decision | Wave 4 |
| P8 Cont account placeholder | 3 HIGH | S (props wire) | Wave 1 |

**Estimate Wave 1 closure via patterns:** ~35 findings + 15 CRIT closed cu 5 pattern fixes.

---

## Audit complete checkpoint

**29 files emitted, ~240+ findings, ~41 CRIT.**

Pass 1 COMPLETE. Pass 2 COMPLETE (20 sub-components + Wave G). Pass 3 COMPLETE (cross-pattern aggregation).

Pass 4-5 deferred — LOW + NIT polish, Playwright screenshots.

**Audit deliverable provides Daniel cu actionable Wave 1-4 fix plan + Beta blocker priority + Karpathy attribution per fix + ground truth ~36% mockup parity per D041 anti-inflation discipline.**
