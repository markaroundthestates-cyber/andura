═══ START PROMPT CC TASK A ═══
Model: Opus
Branch: feature/phase-3-orchestrator-final

§0 PRE-FLIGHT GREP MANDATORY
- Read `00-index/CURRENT_STATE.md` §JUST_DECIDED 2026-05-10 + §NOW
- Read `01-vision/ONBOARDING_SSOT_V1.md` (Big 6 hard T0 cross-skin × 4 spec)
- Read `03-decisions/ADR_MULTI_TENANT_AUTH_v1.md §AMENDMENT 2026-05-05.7` (Big 6 hard T0)
- Grep: `04-architecture/mockups/andura-clasic.html` for `screen-splash` + `screen-onboarding` + default visible state
- Grep: `andura-living-body.html` + `andura-luxury.html` + `andura-brain-coach.html` for same
- Pattern reference: chat noapte Batch 2a default render fix LANDED `screen-splash` active

§1 SCOPE (atomic)
Bug Phase 1 escapat smoke: Andura Clasic NU pornește cu onboarding la deschidere mockup. Default render broken — app intră direct în Today screen sau alt screen, NU onboarding flow.

Fix: ensure default render = onboarding-first cross-skin × 4 (Big 6 hard T0 LOCKED). Splash screen brief OK (200-500ms), apoi auto-redirect screen-onboarding-step-1.

§2 FILES AFFECTED
- `04-architecture/mockups/andura-clasic.html` (Clasic baseline)
- `04-architecture/mockups/andura-living-body.html`
- `04-architecture/mockups/andura-luxury.html`
- `04-architecture/mockups/andura-brain-coach.html`

§3 ACCEPTANCE CRITERIA
- Open mockup file double-click → onboarding-step-1 visible cross-skin × 4 identic (Theme Parity Invariant V1)
- 7 ecrane Big 6 onboarding flow accessible: vârstă + sex + înălțime + greutate + greutate țintă + frecvență antrenament + nivel
- Skip path NU permis pe Big 6 (T0 hard required) — Daniel directive verbatim "trebuie introduse obligatoriu"
- Tests preserved 2731+ PASS
- Build clean ~4s
- Cross-skin × 4 Theme Parity Invariant V1 strict diff verify (palette/typography divergent OK, butoane + UI placement + flow IDENTIC)

§4 BACKUP TAG
git tag pre-task-A-$(date +%Y%m%d_%H%M)

§5 COMMIT
fix(skin): onboarding default render Big 6 hard T0 cross-skin × 4

§6 RAPORT (în `📤_outbox/_archive/2026-05/NN_TASK_A_*.md` + LATEST.md update)
Format invariant:
- Task: A onboarding default render
- Model: Opus
- Status: LANDED / AUDIT / FAILED
- Pre-flight grep: paths citați + ADRs verificați
- Modificări: list concret diff per file
- Build: ✓ / ✗
- Tests: 2731+ PASS preserved
- Commits pushed: hash + branch
- Issues: list (dacă există)
- Next action: continuă Task B
═══ END PROMPT CC TASK A ═══
