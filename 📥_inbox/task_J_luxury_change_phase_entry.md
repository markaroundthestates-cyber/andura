═══ START PROMPT CC TASK J ═══
Model: Opus
Branch: feature/phase-3-orchestrator-final

§0 PRE-FLIGHT GREP MANDATORY
- Read `00-index/CURRENT_STATE.md` Cluster #5 Luxury Schimbă fază deferred
- Grep: `04-architecture/mockups/andura-luxury.html` for Schimbă fază entry point (existing or missing)
- Cross-ref: `andura-clasic.html` + `andura-living-body.html` + `andura-brain-coach.html` for Schimbă fază pattern (find canonical entry)
- Pattern reference: Schimbă fază = phase override entry (BULK / CUT / MAINTAIN / DELOAD typically) per `setPhaseOverride` + `clearPhaseOverride` în `src/pages/plan.js`

§1 SCOPE (atomic)
Cluster #5 deferred: Andura Luxury mockup lipsă entry point "Schimbă fază" (prezent în Clasic + LB + BC). Theme Parity Invariant V1 strict cere identic.

Fix: add Schimbă fază entry point în Luxury mockup (location pattern identic cu Clasic/LB/BC) → click → modal phase override (BULK / CUT / MAINTAIN / DELOAD selection) → setPhaseOverride invocation.

§2 FILES AFFECTED
- `04-architecture/mockups/andura-luxury.html` (primary)
- (Verify: alte 3 themes deja have it — NU touch dacă LANDED)

§3 ACCEPTANCE CRITERIA
- Schimbă fază entry visible în Luxury mockup în location identic cu Clasic/LB/BC
- Click → modal phase override 4 opțiuni (BULK / CUT / MAINTAIN / DELOAD)
- Selection → setPhaseOverride flag visual + persist
- Cross-skin × 4 Theme Parity Invariant V1 strict (identic placement + butoane + flow, palette divergent OK)
- Tests preserved 2731+ PASS
- Build clean

§4 BACKUP TAG
git tag pre-task-J-$(date +%Y%m%d_%H%M)

§5 COMMIT
feat(skin/luxury): add Schimbă fază entry parity Theme Parity Invariant V1

§6 RAPORT format invariant per Task A.
═══ END PROMPT CC TASK J ═══
