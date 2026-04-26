# INSIGHTS BACKLOG

Entries care NU intră în v1 dar trebuie documentate pentru future design.

---

## Engagement drop signal (v1.5/v2 candidate)

**Pattern:** 0 rated sets pe ≥3 sesiuni consecutive = engagement disengagement signal.

**Source:** AA design discussion 2026-04-26.

**Why backlog (NOT v1):**
- Re-engagement intervention requires separate ADR design
- Different from AA detection (auto-aggression) — opposite signal
- Needs UX flow (re-engagement prompt timing, wording)

**Reconsider trigger:** post-launch alpha, after seeing real disengagement patterns la users.

---

## Recommendation engine personalizat (Faza C profile, v1.5/v2)

**Open research:** profile-driven recommendations.

**Starting points (NU spec, ANCORE pentru future design):**
- Sprinter — planuri cu varietate (rotație exerciții, periodization?)
- Marathon — progresie graduală (increment kg mai mic, mai multe maintenance?)
- Yo-yo — TBD (probabil planuri scurte cu deload frecvent)
- Strategic — TBD (probabil maximum customization)

**Source:** AA design discussion 2026-04-26.

**Why backlog:**
- Faza B (post 50-100 useri) = wording personalizat per profile
- Faza C (v1.5/v2) = recommendation engine personalizat
- Ambele depind de validation comportamentală pe user data real

**Reconsider trigger:** post-50+ users behavioral data + Faza B done.
