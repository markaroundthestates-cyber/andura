# DECISION LOG — SalaFull

## 2026-04-24 — FAZA 1.1 Clarifications (pre-execution GO)

**D1 — ES module cycles:** temporare. Rezolvate la Pas 10 prin import direct din corp funcție. Fallback permanent (late-binding) acceptat doar dacă build aruncă ReferenceError — documentat în raport.

**D2 — renderIdle.js size:** ~400 LOC acceptat pentru 1.1. Copy-paste verbatim. Prag review: 450 LOC. Re-split doar dacă depășește.

**D3 — Bug inventory:** C2 singurul explicit pre-execuție. Alte bug-uri marcate `// BUG(audit):` la execuție, capturate în raport final. PR-uri separate post-split.

**Status:** GO unconditional. Execuție 8-12h.

---

## 2026-04-24 — FAZA 1.2 Multi-tenancy Decouple (DONE)

**Scope:** Elimina Daniel-hardcoded values din codebase.
**Approach:** Scope minim + defaults.js + localStorage override (NU multi-user Firebase — asta vine în FAZA 4).

**Ce s-a făcut (3 tasks, 14 fișiere):**
- Task #4: src/config/user.js creat cu USER_DEFAULTS + getUserConfig/updateUserConfig
- Task #5: sys.js + coachContext.js refactor să folosească getUserConfig()
- Task #6: TARGET/DATE/PATH centralizate în constants.js + firebase.js

**Validare:** Teste baseline menținute. Zero regresii. Deploy live.

**Commits:** 39b9899, b89e3e9, 4d7a4a9
