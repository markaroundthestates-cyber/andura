# CLAUDE.md — Andura project Claude rules

Project-level Claude rules pentru chat strategic + CC autonomous prompts. Authority: VAULT_RULES.md §HANDOVER_PROTOCOL + Daniel preferences accumulated across vault sessions.

---

## OUTPUT STYLE — Post-task brevity

**Authority:** Daniel preference + VAULT_RULES.md §10.8 raport schema canonical

- Post-task CC terminal output: **max 2 linii**: "Task complete. Report: 📤_outbox/LATEST.md"
- ZERO duplicate raport în terminal stdout — LATEST.md e SSOT canonical (Task + model + status / Pre-flight / Modificări / Build+Tests / Commits / Pushed / Issues / Next action)
- NU "Summary:" walk-through în terminal. NU enumerate fișiere modificate. NU recap commit hash. Toate în LATEST.md.
- Mid-task tool calls + reasoning + thinking blocks = OK normal (visibility execution). Restricție DOAR final post task complete.
- Exception: dacă Status=Failed → terminal output OK extended cu ce a eșuat (debug aid imediat fără open LATEST.md).
