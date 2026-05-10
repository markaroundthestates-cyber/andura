═══ START PROMPT CC TASK W ═══
Model: Opus
Branch: feature/phase-3-orchestrator-final

§0 PRE-FLIGHT GREP MANDATORY
- Read mockup cross-skin × 4: Suport / FAQ section + întrebări frecvente list + click handler per FAQ item
- Daniel verbatim: *"La suport la intrebari frecvente nu cred ca sunt ok sa fie deja mapate... nu se intampla nimic cand apas pe ele, adica la faq apare detalii in curs de scriere"*
- Verify: FAQ items click handler missing OR placeholder "în curs de scriere" OR mapeaza la content nul

§1 SCOPE (atomic)
Bug UX/scope: FAQ/Suport section "în curs de scriere" placeholder. Daniel zice NU OK să fie deja mapate (premature LANDED status).

Fix opțional A (rapid): FAQ items click handler → toast/inline message "Conținut în curs de pregătire — disponibil curând" (clean placeholder UX, NU broken silence)
Fix opțional B (substantial): NEED_CONTEXT_DANIEL — content FAQ să fie scris (cine furnizează? dev iteration deferred backlog?)

**Recomand opțiunea A pentru moment** — toast feedback clean (NU broken silence) + FAQ content backlog Phase 4+ pentru content writing.

Cross-skin × 4 Theme Parity Invariant V1 strict.

§2 FILES AFFECTED
- `04-architecture/mockups/andura-clasic.html`
- `04-architecture/mockups/andura-living-body.html`
- `04-architecture/mockups/andura-luxury.html`
- `04-architecture/mockups/andura-brain-coach.html`

§3 ACCEPTANCE CRITERIA
- Click FAQ item → toast/inline "Conținut în curs de pregătire — disponibil curând"
- NU broken silence (zero feedback)
- Cross-skin × 4 Theme Parity Invariant V1 strict
- Tests preserved 2731+ PASS
- NEED_CONTEXT_DANIEL flag inline: FAQ content writing scope (Phase 4+ backlog)

§4 BACKUP TAG
git tag pre-task-W-$(date +%Y%m%d_%H%M)

§5 COMMIT
fix(skin): FAQ placeholder feedback + NEED_CONTEXT content writing cross-skin × 4

§6 RAPORT format invariant + flag NEED_CONTEXT_DANIEL FAQ content writing scope decision.
═══ END PROMPT CC TASK W ═══
