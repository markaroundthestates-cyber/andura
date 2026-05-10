═══ START PROMPT CC TASK C ═══
Model: Opus
Branch: feature/phase-3-orchestrator-final

§0 PRE-FLIGHT GREP MANDATORY
- Read `00-index/CURRENT_STATE.md` §JUST_DECIDED 2026-05-10 (Cluster #2 Task 07 "1 buton Ceva nu merge merge" LANDED status — needs verification)
- Grep: `04-architecture/mockups/andura-clasic.html` for `pain-modal` + `pain-button` + textarea + descriere liberă + Mă doare ceva
- Grep: cross-skin × 4 same pattern (LB + Lux + BC)
- Pattern reference: 4 opțiuni preset locked V1 = "Mă doare X / Nu am aparat / Altceva / Anulează" (NO descriere liberă)

§1 SCOPE (atomic)
Bug Phase 1 escapat smoke: Andura Clasic — pain-button "Mă doare ceva" încă afișează textarea descriere liberă în loc de cele 4 opțiuni preset. Task 07 merge incomplete.

Fix: pain-button click → modal cu EXACT 4 butoane preset:
1. "Mă doare X" (X = body part dropdown / select)
2. "Nu am aparat"
3. "Altceva" (FĂRĂ textarea — flag generic engine)
4. "Anulează" (close escape)

ZERO text input. ZERO textarea. ZERO maxlength=500 char counter (deprecated per NEW LOCK Task E).

Click pe "Mă doare X" → submenu body parts (umăr / spate / genunchi / cot / glezna / altă zonă body) → engine flag pe alternative exercise. Click pe "Nu am aparat" → submenu equipment list (echivalent equipment-swap drill) → engine flag. Click "Altceva" → engine flag generic (NO descriere liberă). Click "Anulează" → modal close.

Cross-skin × 4 Theme Parity Invariant V1.

§2 FILES AFFECTED
- `04-architecture/mockups/andura-clasic.html`
- `04-architecture/mockups/andura-living-body.html`
- `04-architecture/mockups/andura-luxury.html`
- `04-architecture/mockups/andura-brain-coach.html`

§3 ACCEPTANCE CRITERIA
- Click "Mă doare ceva" → 4 buttons preset only (NO textarea visible)
- "Mă doare X" → submenu body parts preset (~6-8 opțiuni)
- "Nu am aparat" → submenu equipment preset
- "Altceva" → engine flag generic + close modal (NO text input)
- "Anulează" → modal close instant
- Cross-skin × 4 Theme Parity Invariant V1 strict
- Tests preserved 2731+ PASS
- Build clean

§4 BACKUP TAG
git tag pre-task-C-$(date +%Y%m%d_%H%M)

§5 COMMIT
fix(skin): pain-button merge 4 opțiuni preset cross-skin × 4

§6 RAPORT format invariant per Task A.
═══ END PROMPT CC TASK C ═══
