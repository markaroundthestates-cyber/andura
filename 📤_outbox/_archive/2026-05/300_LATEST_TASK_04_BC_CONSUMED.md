# TASK 04 — Big 6 Hard T0 Brain Coach Mockup (STRUCTURAL_DRIFT_RESOLVED)

- **Status:** ✅ Complete + Cluster #1 cross-skin × 4 CLOSURE
- **Backup tag:** `pre-task04-big6-braincoach-2026-05-10-0949` (pushed origin)
- **Commit:** `21f9360` pushed origin/main

## STRUCTURAL_DRIFT_RESOLVED auto-aligned per fallback rule

BC had 5 ecrane Welcome+Vârstă+Sex+Medical+Frecvență — **MISSING Obiectiv entirely** (significant gap vs Clasic/LB baseline). Plus mixed Roman/Arabic step-counter "I/V","2/5","III/V","IV/V","V/V" inconsistent.

**Auto-resolved:**
- DROP Welcome stage (replaced cu Obiectiv ecran)
- ADD Obiectiv ecran NEW cu BC styling (thinking-card "Asta îmi spune" + 4 templates choice-grid + disclaimer integrat footnote checkbox)
- INSERT Înălțime + Greutate ecrane (BC styling: picker-card + thinking-card cu BMR/TDEE estimat)
- ADD Sex Altul option (M/F/Altul + "Model neutru, recalibrare adaptivă" sub-text)
- Vârstă input added hidden required min=16 max=99
- step-counter universal arabic "X/7" cross-ecran (was mixed Roman/Arabic)
- step-dots 5→7 cross-ecran
- Final order: Obiectiv → Vârstă → Sex → Înălțime → Greutate → Medical → Frecvență

## Cluster #1 Auth wiring CLOSURE (Tasks 01-04 cross-skin × 4 ✅ COMPLETE)

| Skin | Commit | Notes |
|------|--------|-------|
| Clasic | `c6b1204` | 5→7 ecrane |
| Living Body | `5bd66c2` | 5→7 ecrane |
| Luxury | `8862827` | 6→7 (drop Welcome+Echipament + reorder Obiectiv-first) |
| Brain Coach | `21f9360` | 5→7 (drop Welcome + ADD Obiectiv + add Înălțime+Greutate) |

**Theme Parity Invariant V1 ACHIEVED 4/4** — 7 ecrane Obiectiv→Vârstă→Sex→Înălțime→Greutate→Medical→Frecvență cross-skin uniform (visual character per skin preserved).

## Tests

✅ 2731 PASS preserved EXACT.

## Next action

**TASK 05** ONBOARDING_SSOT_V1.md §1 ECRANE doc sync (5-10 min, small) — closure Cluster #1.
