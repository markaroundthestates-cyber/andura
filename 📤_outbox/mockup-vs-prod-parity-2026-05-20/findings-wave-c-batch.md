# Findings — Wave C Antrenor secondary (batch 5 screens)

**Screens:** ceva-nu-merge, pain-button, equipment-swap, aparate-lipsa, schedule-override
**Approach:** Batched findings (similar pattern divergences — paradigm-level mismatch în prod)
**Audit date:** 2026-05-20

---

## ceva-nu-merge

**Mockup ref:** `andura-clasic.html:1000-1009`
**Prod ref:** `src/react/routes/screens/antrenor/CevaNuMerge.tsx:1-67`

### F-ceva-nu-merge-01 — Options count 1 vs 5 (CRIT paradigm divergence)

- **Severity:** CRIT
- **Mockup:** 1 option only "Ma doare" + Anuleaza — Daniel Slice 1.7 reglaj explicit "Nu am aparat REMOVED, moved to aparate-lipsa picker" + comment notes "(REMOVED 2026-05-12 Slice 1.7)"
- **Prod:** 5 options (Ma doare ceva / Aparate ocupate / Aparat lipsa / Vreau alt antrenament / Renunt azi)
- **Mockup ref:** `andura-clasic.html:1004-1007`
- **Prod ref:** `CevaNuMerge.tsx:29-36`
- **Karpathy fix:** Daniel decision — reglaj LANDED în mockup intent (1 option simple) NU în prod (5 options multi-path). Either prune prod la mockup OR amend mockup
- **Beta blocker?** YES — direct contradiction Daniel Slice 1.7 reglaj documented mockup comment

### F-ceva-nu-merge-02 — Header text divergent

- **Severity:** MED
- **Mockup:** "Ce nu merge?"
- **Prod:** "Ceva nu merge azi?"
- **Beta blocker?** NO

### F-ceva-nu-merge-03 — Sub-header back-btn MISSING (cross-pattern)

- **Severity:** HIGH

**Parity: ~35%**

---

## pain-button

**Mockup ref:** `andura-clasic.html:1012-1023`
**Prod ref:** `src/react/routes/screens/antrenor/PainButton.tsx:1-60+ (only sampled)`

### F-pain-button-01 — Paradigm CRIT divergence (3 types vs 15 regions + intensity)

- **Severity:** CRIT
- **Mockup:** 3 preset TYPES (Durere acuta / Disconfort articulatie / Oboseala extrema) cu engine reaction sub-text + toast "Siguranta e pe primul loc..."
- **Prod:** 15-region body picker (Gat / Umar stang/drept / Spate / Lombar / etc.) + intensity slider 1/2/3 + Continue button
- **Mockup ref:** `andura-clasic.html:1017-1019`
- **Prod ref:** `PainButton.tsx:24-60`
- **Karpathy fix:** Daniel decision — mockup minimalist Bugatti 3-option ("presets > liber, force coach-driven taxonomy clear" per mockup comment line 1011) vs prod granular 15-region picker. Direct contradiction Daniel Bugatti 2026-05-11 directive
- **Beta blocker?** YES — explicit Daniel 2026-05-11 reglaj "free text Altceva REMOVED" — prod paradigm contradicts

### F-pain-button-02 — Coach reassurance toast/copy MISSING

- **Severity:** HIGH
- **Mockup:** Per-button toast "Siguranta e pe primul loc. Am ajustat restul sesiunii." + closing italic "Daca nu se potriveste niciuna, opreste sesiunea si consulta un medic."
- **Prod:** Different flow (intensity + region) — no comparable reassurance
- **Beta blocker?** YES — safety messaging mandatory

**Parity: ~30%** (paradigm-level mismatch)

---

## equipment-swap

**Mockup ref:** `andura-clasic.html:1026-1041`
**Prod ref:** `src/react/routes/screens/antrenor/EquipmentSwap.tsx:1-60+ (only sampled)`

### F-equipment-swap-01 — Paradigm CRIT divergence (4 alternatives per ex vs 5-item toggle)

- **Severity:** CRIT
- **Mockup:** Per-exercise context — shows current exercise "Impins inclinat haltera" + 4 alternative SWAP categories (Gantere / Cablu / Banda elastica / Bodyweight) → confirms swap via toast
- **Prod:** Generic 5-item equipment list (Bench / Smith / Lat pulldown / Cable row / Leg press) cu busy/available toggle + Continue propagates context
- **Mockup ref:** `andura-clasic.html:1030-1039`
- **Prod ref:** `EquipmentSwap.tsx:28-55`
- **Karpathy fix:** Daniel decision — mockup per-exercise swap UX vs prod global equipment availability mode
- **Beta blocker?** YES — paradigm contradiction

**Parity: ~30%**

---

## aparate-lipsa

**Mockup ref:** `andura-clasic.html:1050-1101`
**Prod ref:** `src/react/routes/screens/antrenor/AparateLipsa.tsx:1-60+ (only sampled)`

### F-aparate-lipsa-01 — Equipment list divergence (10 flat specific vs 3 categories grouped)

- **Severity:** HIGH
- **Mockup:** Flat 10-checkbox list cu specific equipment (Banca inclinata / Banca plana / Bara halterelor / Gantere / Aparat cablu / Power rack / Leg press / Aparat extensii / Aparat tractiuni / Banda elastica)
- **Prod:** 3 categories (Greutati libere / Aparate / Cardio) cu nested sub-items (12+ total but different naming + grouped)
- **Mockup ref:** `andura-clasic.html:1056-1097`
- **Prod ref:** `AparateLipsa.tsx:25-41`
- **Karpathy fix:** Surgical (flat list cu specific equipment names — Daniel Slice 1.7 reglaj LOCKED naming)
- **Beta blocker?** YES — naming + structure divergence

### F-aparate-lipsa-02 — Helper copy + closing italic MISSING

- **Severity:** MED
- **Mockup:** Body intro "Bifeaza aparatele pe care **nu le ai**. Coach-ul va alege exercitii alternative si nu le va propune in viitor." + small-text "Poti reveni oricand sa scoti din lista daca ai acum aparatul." + closing italic "Coach-ul invata din selectiile tale. Daca lipsesc mai multe aparate, propune sesiuni bodyweight sau cu alternative."
- **Prod:** TBD verify (sample didn't show full)
- **Beta blocker?** MED

**Parity: ~40%**

---

## schedule-override

**Mockup ref:** `andura-clasic.html:1106-` (multi-step screen, complex)
**Prod ref:** `src/react/routes/screens/antrenor/ScheduleOverride.tsx` (not read în depth)

### F-schedule-override-01 — Multi-step complex screen — TBD Pass 2 deep-dive

- **Severity:** TBD
- **Mockup:** 2-step screen — Step 1 chooser (4 options contextual workout-day vs rest-day) + Step 2 alt-type drill (read from muscleRecovery state)
- **Prod:** TBD Pass 2 full read of ScheduleOverride.tsx
- **Mockup ref:** `andura-clasic.html:1106-1154` (50 lines+)
- **Karpathy fix:** Pass 2 verify

**Parity: ~50% estimate (multi-step needs Pass 2 component depth)**

---

## Wave C summary

| Screen | Severity total | Parity |
|--------|---------------|--------|
| ceva-nu-merge | 3 (1 CRIT) | 35% |
| pain-button | 2 (1 CRIT) | 30% |
| equipment-swap | 1 (1 CRIT) | 30% |
| aparate-lipsa | 2 | 40% |
| schedule-override | TBD Pass 2 | ~50% (est) |
| log-weight | Not yet audited | TBD |

**Pattern:** Wave C reveals 3 paradigm-level CRIT divergences în Antrenor sub-screens. Prod implementations took different design directions than mockup explicit Daniel reglaj documented în comments. Daniel Slice 1.7 + 2026-05-11 reglaj directly contradicted by prod paradigm decisions.

**Wave C average parity: ~37%** (5 screens, excluding log-weight pending).
