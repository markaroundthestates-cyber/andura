# PROMPT_CC_SPRINT4X_BATCH_01_ADR_019_CHANNEL_AGNOSTIC

**Model:** Opus
**Order:** 01
**Dependencies:** None (strict disjunct)
**Scope:** §36.59 implementation — ADR 019 GDPR Discord refs → "community channel exposure" channel-agnostic sweep

---

## TASK

Sweep complet "Discord" → "community channel" în ADR 019 GDPR + orice cross-ref care citează ADR 019 secțiunea data exposure. Channel-agnostic per §36.59 LOCKED V1.

### Pre-flight grep

```bash
grep -rn "Discord" 03-decisions/ADR_019*.md
grep -rn "ADR_019\|ADR 019" 06-sessions-log/ 03-decisions/ 01-vision/ 02-architecture/
```

### Replace rules

| Original | Replacement |
|----------|-------------|
| `Discord` | `community channel` |
| `Discord channel` | `public community channel` |
| `Discord community` | `community engagement platform` |
| `Discord exposure` | `community channel exposure` |
| `Discord server` | `public community channel` |

**Edge cases:**
- Dacă "Discord" apare în context istoric/audit (ex: "decizia §36.9 ELIMINATE Discord V1") → preserve as-is (istoric, NU current strategy)
- Dacă "Discord" apare în comentarii cod sursă → SKIP (out of scope batch ăsta, doar vault docs)
- Dacă apare "Telegram" în context care ar trebui channel-agnostic per §36.59 → NU înlocui (Telegram = beta channel LOCKED §36.53, distinct de public marketing channel mix §36.60)

### Append §AMENDMENT inline ADR 019

În ADR 019, secțiunea data exposure (sau echivalentă), append:

```markdown
**§AMENDMENT 2026-05-02 (§36.59 LOCKED V1):** Toate referințele "Discord" înlocuite cu formulare channel-agnostic ("community channel exposure" / "public community channel" / "community engagement platform"). Rationale: ADR long-lived resilient, NU committezi la canal specific când marketing channel mix DEFERRED post-launch V1 (cross-ref §36.60). GDPR data exposure logic identică indiferent platformă.
```

---

## VERIFICATION

```bash
# Zero Discord rezidual în ADR 019 (excepție context istoric)
grep -n "Discord" 03-decisions/ADR_019*.md

# §AMENDMENT prezent
grep -n "§AMENDMENT 2026-05-02.*§36.59" 03-decisions/ADR_019*.md

# Cross-refs consistent
grep -rn "community channel exposure\|public community channel" 03-decisions/ADR_019*.md
```

---

## COMMIT + PUSH

```bash
git add 03-decisions/ADR_019*.md
git commit -m "adr019: channel-agnostic sweep Discord→community channel per §36.59 LOCKED V1"
git push
```

---

## RAPORT — `📤_outbox/LATEST.md`

Move existing LATEST → archive cu next NN cronologic.

**Format raport:**
- Task, Model, Status (Complete/Issue/Failed)
- Pre-flight: grep counts before/after
- Modificări: file paths + linii afectate
- §AMENDMENT location confirmed
- Build + Tests: N/A vault docs
- Commits: hash
- Pushed: Yes/No
- Issues: None / detail
- Next action: BATCH_02 (sequential auto-trigger per VAULT_RULES §BATCH_PROTOCOL)
