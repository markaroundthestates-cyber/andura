# PROMPTS INDEX

**Ultima actualizare:** 24 apr 2026

---

## PROMPTURI SALVATE

### Audit nuclear (completed)
- `AUDIT_PROMPT_v5_DEFINITIVE` — audit general (11 domenii × 14 axe) — completat 23 apr
- `COACH_AUDIT_PROMPT` — audit coach.js dedicat — completat 24 apr

### FAZA 1 execution (current)
- `PROMPT_FAZA_1_0_SPLIT_PLANNING` — Opus Claude Code face planning split coach.js (NOT code)
- `PROMPT_FAZA_1_1_SPLIT_EXECUTION` — [TBD — after 1.0 plan review]

### Viitor FAZA 1.2+
- `PROMPT_FAZA_1_2_MULTI_TENANCY` — decouple Daniel hardcoded
- `PROMPT_FAZA_1_3_LOG_SCHEMA_MIGRATION` — fix logs + one-shot migrate Firebase
- `PROMPT_FAZA_1_4_DEDUPE_FIX`
- `PROMPT_FAZA_1_5_CALIBRATION_LIVE`
- `PROMPT_FAZA_1_6_SESSION_BUILDER_REAL`
- `PROMPT_FAZA_1_7_AA_DECISION`
- `PROMPT_FAZA_1_8_FIREBASE_SECURITY`

---

## PATTERN-URI EFICIENTE

### Pentru audit
- Stop la prima critical finding — nu trece mai departe
- 3-5 citate exacte linie+cod
- Expected vs actual comportament
- PoC sau scenario reproducere

### Pentru execution
- Input/output specific definit
- Test scenarios listate înainte
- Rollback plan dacă fail
- Validare checklist post-deploy

### Pentru planning (doar structură, no code)
- Constrângeri clare (ce NU trebuie schimbat)
- Output format specific (markdown cu secțiuni definite)
- Exit criteria

---

## REGULI CLAUDE CODE

### Command standard
```bash
claude --dangerously-skip-permissions -p "PROMPT AICI"
```

### Shift+Tab = "Yes, enable auto mode" (per sesiune)

### Model switch în sesiune
```
/model opus        # pentru planning/refactor complex
/model sonnet      # pentru execuție clară
```

### Comportament cu stop mid-output
> "Continuă EXACT de unde te-ai oprit, de la ultimul caracter afișat. Nu adăuga text introductiv. Nu recapitula."

---

## VERSION CONTROL PROMPTURI

- Prompturi în `/home/claude/` ephemer
- Prompturi finale în `/mnt/user-data/outputs/` salvate pe disc
- Prompturi importante = copie în acest vault

---

## TEMPLATE PROMPT GENERIC

```markdown
# MISIUNE
[Ce trebuie făcut]

# CONSTRÂNGERI
- [Lista exactă]

# INPUT
[Ce se citește]

# OUTPUT
[Ce se produce]

# VALIDARE
[Cum se verifică]

# ROLLBACK
[Ce se face dacă fail]
```
