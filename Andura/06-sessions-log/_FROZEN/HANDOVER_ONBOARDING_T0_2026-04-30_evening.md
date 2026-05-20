# HANDOVER GLOBAL — Onboarding T0 (split from 2026-04-30 evening master, 2026-05-05 overnight)

**Provenance:** Section split from `HANDOVER_GLOBAL_2026-04-30_evening.md` per §62.2 thematic split strategy LOCKED V1. Original 7673 LOC > 7000 §VAULT_HYGIENE_PASS STEP 13 FLAG threshold. Split executed 2026-05-05 overnight (CC TASK 5 finalize).
**Theme:** Onboarding T0 + Cognitive architecture clarifications. Sections: §36.101 5 voices CONFIRMED + §36.102 Goal Lifecycle Change Reconfirmed First-Class. Note: T0 Mechanics 75 LOCKED V1 (post-2026-05-05 birou) NU în acest source — captured în CURRENT_STATE / DECISION_LOG separately.
**See also:** [[HANDOVER_GLOBAL_2026-04-30_evening|HANDOVER_GLOBAL master INDEX]] (post-split) + [[../00-index/CURRENT_STATE|CURRENT_STATE]] §RECENT 2026-05-05 birou (T0 Mechanics).

---

## §36.101 5 Voices Cognitive Architecture CONFIRMED (slip clarification)

**Status:** CONFIRMED arhitectura existing LOCKED, NU decizie nouă. Slip Claude-side imprecizie clarificat.

**5 voices arhitectura cognitive v1 (LOCKED):**

1. **HISTORICAL** — voice temporal past (data via Event Anchor R22)
2. **REALTIME** — voice temporal present (since last sleep cycle)
3. **PROJECTION** — voice temporal future (2 instanțe: tactical + strategic)
4. **ARBITRATOR** — meta-voice consensus (consume 3 temporal verdicts → final decision via 5-level Precedence Hierarchy + 27 reguli arbitration)
5. **ACTION** — execution voice (singurul cu mutation rights, build session + persist via Event Sourcing)

**Slip Claude:** răspuns inițial "3 voices" — confuzie între voices temporale (3 produc VoiceVerdict structured) și voices arhitecturale (5 total în 5-engine cognitive segmentation per Daniel vision 2026-04-28 NIGHT).

**Voice 6-th GOAL discutat → REJECTED §26.2:** goal = SETTING parametric pe ACTION layer, NU voice nou. Rationale validă pentru "voice nou rejected" (overengineering detection mismatch real-time silent), DAR statistica "98% NU schimbă goal" era mis-cited ca rationale general — vezi §36.102 clarification.

**Pentru offline coaching tree exhaustive (§36.99):**

- ✅ **5 voices = suficient.** NU lipsesc voices. Architectura cognitive layer ready
- ✅ **Engines noi vorbesc PRIN voices** via Dimension Registry ADR 018 — Periodization Engine contribuie verdict la HISTORICAL (ce periodization ai făcut) + REALTIME (ce e activ săpt asta) + PROJECTION (ce vine next mesocycle)

**Cross-refs:** [[04-architecture/COGNITIVE_ARCHITECTURE_SPEC_v1|COGNITIVE_ARCHITECTURE]] PARTEA 1-3 (27 reguli + VoiceVerdict schema + 5-level Precedence) + §26.2 Goal-ca-setting LOCKED + ADR 018 Dimension Registry plug-in pattern.

---

## §36.102 Goal Lifecycle Change Reconfirmed First-Class Supported (slip clarification)

**Status:** CONFIRMED arhitectura existing LOCKED, NU decizie nouă. Statistica mis-cited de Claude clarificată.

**Slip Claude:** citarea "98% NU schimbă goal post-onboarding" ca rationale general în răspunsul anterior. Statistica corect interpretat **strict** pentru "voice 6-th GOAL nou cu detection mismatch silent real-time" (overengineering rejected §26.2) — NU pentru "useri NU schimbă goal lifecycle".

**Realitatea lifecycle Gigel:**

```
Onboarding: SLĂBIRE (gras, vrea slim)
  ↓ 6-12 luni
MAINTAIN (a slăbit, vrea să țină)
  ↓ 12-24 luni
TONIFIERE/DEFINIRE (vrea aestetic)
sau
FORȚĂ (nivel avansat)
```

**Goal change lifecycle = pattern majoritar la useri serioși long-term, NU edge case 2%.**

**Arhitectura SUPORTĂ deja goal change first-class:**

1. **§36.35 Goal Shift Event Handler LOCKED V1** — user tap "Schimbă obiectiv" în Setări → Engine aplică Modificatori Template (rep ranges, RIR, rest time) + Streak Reset + 2-session calibration window (interval estimat NU single point per SUFLET F1 Triangulation)
2. **§26.5 Re-prompt periodic 4-6 săpt** — modal in-app "Obiectivul tău e încă X? Confirmă sau schimbă" (anti-rigid, anti-spam cooldown 21 zile post-confirm)
3. **Conservare date fizice:** PR records + CDL logs + istoric forță = INTACT post-shift
4. **5 templates V1 ready:** Forță & Dezvoltare / Tonifiere & Definire / Slăbire / Longevitate / Sănătate Generală

**Distincție tehnică critică:**

- **GOAL** = setting strategic user (5 template choice) — schimbat manual via Setări
- **PHASE** = automated CUT/BULK/MAINTAIN (sys.js calculează BF% + sezon) — sub-state per goal
- **MODE** = Estetică ↔ Forță (sub-modificator rep ranges/intensity)

Slăbire → Mentinere = goal switch explicit (template change). CUT → MAINTAIN automated = phase change (sub-state intern, NU template change).

**Cross-refs:** §36.35 Goal Shift Event Handler + §26.2 Goal-ca-setting LOCKED + §26.5 Re-prompt periodic + sys.js phase detection automated + ADR_OUTLIER_FILTER EXT-2 Goal Shift extension.

---

