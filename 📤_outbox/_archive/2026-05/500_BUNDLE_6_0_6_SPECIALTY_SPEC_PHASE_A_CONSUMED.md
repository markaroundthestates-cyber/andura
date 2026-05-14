# BUNDLE 6.0.6 SPECIALTY — PHASE A SPEC DISCOVERY (Co-CTO Audit + HALT)

**Model:** Opus 4.7 autonomous
**Date:** 2026-05-14 chat-current
**Authority:** PROMPT_CC 3 §1.2 Co-CTO autonomous decision lock count
**Status:** 🔴 **HALT pre-Phase B execute** — material scope discrepancy detected; Daniel decision required

---

## §0 Pre-flight evidence inline (§AR.20 + §AR.21)

```
Schema baseline: 567 entries (Object.keys.length authority)
Big 11 distribution (sums to 567):
  spate=104, umeri=94, piept=86, fese=51, picioare-quads=47, biceps=45,
  triceps=41, picioare-hamstrings=40, gambe=33, antebrate=26, core=0 (reserved Bundle 6.0.7) ✓
Cascade ADR refs: 13 (≥3 expected) ✓
Branch: feature/v2-vanilla-port — synced origin + clean working tree
Backup tag pushed: pre-bundle-6-0-6-specialty-2026-05-14
```

---

## §1 AUDIT — PROMPT_CC §1.1 proposed sub-batches vs schema reality

### Sub-batch A: Hammer Strength specialty (~10-15 NEW proposed) → **mostly EXIST**

| Proposed cluster | Schema reality | NEW slots |
|---|---|---|
| Plate-loaded chest press incline/decline/flat | NU EXISTĂ — only `Hammer Press Machine` + `Pec Deck Plate-Loaded` (fly NU press) | **~4 NEW** |
| Plate-loaded shoulder press OHP/lateral | EXISTĂ — `Hammer Strength OHP` + `Hammer Strength Lateral` | 0 NEW |
| Plate-loaded iso row high/mid/low | EXISTĂ — `Hammer Strength Iso-Lateral High/Mid/Low Row` | 0 NEW |
| Plate-loaded pulldown | EXISTĂ — `Hammer Strength Lat Pulldown` | 0 NEW |

**Sub-batch A real gaps: ~4 NEW** (not 10-15).

### Sub-batch B: Cable specialty (~8-12 NEW proposed) → **HARD-BLOCKED + duplicates**

| Proposed cluster | Schema reality | NEW slots |
|---|---|---|
| Cable woodchop high-to-low / low-to-high | NU EXISTĂ but `core` primary → 🔴 BLOCKED §10 Bundle 6.0.7 reserved invariant | **0 NEW** |
| Pallof press standing/kneeling | NU EXISTĂ but `core` primary → 🔴 BLOCKED §10 | **0 NEW** |
| Cable face pull high/mid | EXISTĂ — 7 variants (Face Pulls, Face Pull Bench, Kneeling, Band, Rope, Single-Arm, Face Pull) | 0 NEW |
| Cable woodchop rotational | `core` primary → 🔴 BLOCKED §10 | **0 NEW** |
| Cable kickback single-arm/bilateral triceps | EXISTĂ — `Cable Triceps Kickback Rope` + `Cable Glute Kickback` + variants | ~1-2 potential NEW (single-arm bilateral triceps) |

**Sub-batch B real gaps: ~1-2 NEW** (not 8-12). Most proposed entries violate §10 core reserved invariant.

### Sub-batch C: Smith Machine specialty (~6-8 NEW proposed) → **GENUINE GAPS**

| Proposed | Schema reality | NEW slots |
|---|---|---|
| Smith Split Squat | NU EXISTĂ ✓ | **1 NEW** |
| Smith Bulgarian Split Squat | NU EXISTĂ ✓ | **1 NEW** |
| Smith Bent-Over Row | NU EXISTĂ ✓ (existing `Smith Machine Row` is upright/seated context) | **1 NEW** |
| Smith Reverse Lunge | NU EXISTĂ ✓ | **1 NEW** |
| Smith Inverted Row | NU EXISTĂ ✓ | **1 NEW** |
| Smith Hip Thrust | EXISTĂ — `Smith Hip Thrust` + `Single-Leg Smith Hip Thrust` + `Smith B-Stance Hip Thrust` | 0 NEW |

**Sub-batch C real gaps: ~5 NEW** ✓ alignment cu prompt estimate.

### Sub-batch D: Plate-loaded Hack/T-bar/chest-supported (~5-8 NEW proposed) → **mostly EXIST**

| Proposed | Schema reality | NEW slots |
|---|---|---|
| Hack Squat 45° + vertical | EXISTĂ — `Hack Squat Machine` + `Reverse Hack Squat` (45° = standard, vertical = NEW potential) | **~1 NEW** (Vertical Hack Squat distinct movement pattern) |
| T-bar Row Machine | EXISTĂ — `T-Bar Row` + `Landmine T-Bar Row` + `T-Bar Row Machine` | 0 NEW |
| Chest-supported Row Machine | EXISTĂ — `Chest-Supported Row` + `Chest-Supported DB Row` + `Hammer Strength Chest-Supported Row` + `Chest-Supported Row Wide` | 0 NEW |
| Belt Squat plate-loaded | EXISTĂ — `Belt Squat` + `Belt Squat Hip Thrust` | 0 NEW |
| Pendulum Squat | EXISTĂ — `Pendulum Squat` | 0 NEW |

**Sub-batch D real gaps: ~1 NEW** (not 5-8).

### Sub-batch E: Specialty isolation preacher/spider/concentration (~6-8 NEW proposed) → **mostly EXIST**

| Proposed | Schema reality | NEW slots |
|---|---|---|
| Preacher curl variants EZ/DB/cable | EXISTĂ — `Preacher Curl` + `EZ-bar Preacher Curl` + `DB Preacher Curl` + `Machine Preacher Curl` (cable preacher missing) | **~1 NEW** (Cable Preacher Curl) |
| Spider curl | EXISTĂ — `Spider Curl Barbell` + `Spider Curl EZ-bar` + `DB Spider Curl` | 0 NEW |
| Concentration curl | EXISTĂ — 4 variants | 0 NEW |
| Cable hammer curl (rope) | EXISTĂ — `Cable Hammer Curl Rope` | 0 NEW |
| Reverse preacher curl | NU EXISTĂ ✓ | **~1 NEW** (Reverse-Grip Preacher Curl forearms primary) |
| Single-Arm Cable Curl | NU EXISTĂ ✓ | **~1 NEW** |

**Sub-batch E real gaps: ~3 NEW** (not 6-8).

---

## §2 SUMMARY — TRUE NEW GAPS COUNT

| Sub-batch | PROMPT_CC estimate | Real gaps post-grep | Delta |
|---|---|---|---|
| A — Hammer Strength | 10-15 NEW | **4 NEW** | -6 to -11 |
| B — Cable | 8-12 NEW | **1-2 NEW** (rest §10 BLOCKED core) | -7 to -10 |
| C — Smith Machine | 6-8 NEW | **5 NEW** | aligned |
| D — Plate-loaded | 5-8 NEW | **1 NEW** | -4 to -7 |
| E — Specialty isolation | 6-8 NEW | **3 NEW** | -3 to -5 |
| **TOTAL** | **35-50 NEW** | **~14-15 NEW genuine** | **-20 to -36** |

**Cumulative proiect:**
- Schema actual 567 + 14-15 genuine NEW = **~581-582 cumulative**
- Pre-Beta scope 600 floor minim = **NU achieved acest Bundle** (-18 to -19 short)
- Pre-Beta progress 86.3% → ~88-88.5% (+1.7-2.2pp single sub-batch)

---

## §3 ROOT CAUSE — PROMPT_CC §1.1 likely authored on stale schema state

PROMPT_CC §1.1 estimate ~35-50 NEW assumed limited specialty coverage. **Reality:** Bundles 6.0.1 (chest +90) + 6.0.2 (back +98) + 6.0.3 (shoulders +80) + 6.0.4.x (legs +131) + 6.0.5 (arms +107) ALREADY include:
- 8× Hammer Strength variants
- 25× Smith Machine variants
- 17× Hip Thrust variants
- 11× Lat Pulldown variants
- 9× Inverted Row variants
- 4× Preacher Curl variants
- 3× Spider Curl variants
- 4× Concentration Curl variants
- 17× Triceps Extension variants
- 6× Cable Triceps Pushdown variants
- 7× Face Pull variants
- 5× Tibialis Raise variants

**Slip pattern aligned cu memory `feedback_grep_before_prompt_cc.md`:** PROMPT CC authored cu paths/sources/tooling references stale → grep filesystem verify ÎNAINTE construct = anti-recurrence rule. Recidivă slip 3rd cumulative chat-2 + chat-3 + Bundle 6.0.6 spec authoring.

---

## §4 HARD CONSTRAINTS evaluate

- §F3.12 strict ZERO mutation existing 567 entries → **violated dacă duplicate** Pallof/Woodchop/Hammer Strength Row variants padded
- §10 Bundle 6.0.7 Core reserved invariant ZERO `core` primary → **blocked** ~6-10 prompt-proposed cable entries (Pallof + Woodchop categorial core)
- HARD CONSTRAINT scope library 600-700 floor minim → **NU achieved Bundle 6.0.6 alone** dacă strict NEW-only

---

## §5 OPTIONS Daniel decision

**A) STRICT GREP-VALIDATED ~14-15 NEW Co-CTO autonomous (RECOMMEND)**
- Add only true gaps post-audit: 4 Hammer Strength chest press + 5 Smith Machine + 1 Vertical Hack Squat + 3 isolation + 1-2 cable kickback
- Schema 567 → ~581-582 (+14-15)
- Pre-Beta floor 600 NU achieved Bundle 6.0.6 — requires Bundle 6.0.7 Core (~60 reserved) + potential Bundle 6.0.8 to close gap
- ZERO duplicate risk + ZERO §10 violation + Bugatti craft preserved
- Sub-batch split: Phase B (Hammer chest +4) → Phase C (Smith +5) → Phase D (Hack +1) → Phase E (isolation +3) → Phase F (cable kickback +1-2)

**B) HALT Bundle 6.0.6 EXEC — re-author PROMPT_CC**
- Daniel/chat strategic re-authors PROMPT post fresh grep audit
- Different specialty themes proposed (e.g., Bands extensive, Kettlebell, Trap Bar variants, Specialty barbells SSB/Cambered, Olympic lifts derivatives, etc.)
- Backup tag preserved rollback safety net
- Consume next CC session

**C) EXPAND scope tactical Co-CTO autonomous past §1.1 — research-backed legitimate ~30-40 NEW**
- Add 14-15 true gaps + add additional research-backed legitimate variants NU în PROMPT_CC §1.1 specialty themes
- Examples: Trap Bar variants (Trap Bar Deadlift exists; missing Trap Bar Carry, Trap Bar Row, Trap Bar Shrug); Kettlebell variants (KB Swing missing? KB Goblet variants); SSB Squat (Safety Squat Bar — specialty barbell); Cambered Bar variants
- Schema 567 → ~597-607 (closer to 600 floor)
- Risk: scope creep + non-prompt-authorized specialty themes
- Co-CTO §AR.26 authority explicit but material deviation from PROMPT scope

---

## §6 RECOMMENDATION Co-CTO

**Option A** — strict grep-validated ~14-15 NEW genuine gaps. Bugatti craft anti-duplicate primary. 600 floor accepted as multi-bundle target (B6.0.6 + B6.0.7 Core +60 = ~641-642 cumulative, hits floor + buffer). NU pad cu duplicates risk §F3.12 violation.

Daniel A/B/C decision required ÎNAINTE Phase B-F execute.

---

🦫 **Bugatti craft. Phase A audit-first peste blind-execute. Grep-before-PROMPT discipline §AR.20 + §AR.21 + memory `feedback_grep_before_prompt_cc.md` invariant preserved. ZERO mutation existing 567 entries pre-Bundle. Backup tag rollback ready.**
