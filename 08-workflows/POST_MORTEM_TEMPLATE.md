---
title: Post-Mortem Template V1 — Andura PWA Incident Documentation
status: ACTIVE_SSOT
created: 2026-05-22
authority: HIGH-THETA Wave 2a chat 4 closure (recon HIGH-THETA spec)
cross_refs:
  - 08-workflows/PROD_OPS_RUNBOOK.md (§2 incident decision tree + §7 post-incident protocol)
  - 08-workflows/BACKUP_DR_RUNBOOK.md (§8 DR scenarios)
  - 06-sessions-log/ (INCIDENT_<date>.md files reference)
---

# Post-Mortem Template — Andura PWA V1

> **Solo-founder model:** ZERO blame-game. Single accountability = Daniel CEO.
> Goal = anti-recurrence + runbook anti-fragility, NU finger-pointing.
> Cross-ref PROD_OPS_RUNBOOK §7 (no blame post-mortem protocol).

Each P0/P1 production incident gets ONE post-mortem entry. Lower severity (P2/P3) =
1-line note în CHAT_STATE.md sau LATEST.md suffices.

---

## Template structure

Copy this template pentru new post-mortem. Save as `06-sessions-log/INCIDENT_YYYY-MM-DD_<topic>.md`.

```markdown
---
incident_id: INC-YYYY-MM-DD-<seq>
severity: P0|P1
detected_at: <ISO-8601>
resolved_at: <ISO-8601>
duration_minutes: <number>
status: RESOLVED
---

# Incident <topic> — YYYY-MM-DD

## §1 Summary (TL;DR — 2-3 lines)

What broke. Impact scope. Resolution.

## §2 Timeline (UTC)

| Time | Event |
|------|-------|
| HH:MM | Detection — <how Daniel/Sentry caught it> |
| HH:MM | Triage — severity classified, decision tree §2 PROD_OPS |
| HH:MM | Action — rollback OR hotfix path chosen (PROD_OPS §3 or §8) |
| HH:MM | Verify — §5.3 healthcheck + manual smoke |
| HH:MM | Resolved — error rate dropped, services nominal |

## §3 Impact

- **Users affected:** <count or "Daniel only / Beta cohort N"> 
- **Surface broken:** <screens / flows: Auth, Workout, Cont, etc.>
- **Duration:** <total minutes from detection to resolved>
- **Data loss:** YES (<scope>) | NO
- **Trust damage:** <subjective Daniel CEO assessment for Beta users>

## §4 Root cause

Concrete technical cause. Cite file + line if applicable. ZERO vague guidance.

Example:
> Magic Link auth failed for all users because `src/auth.js:127` `verifyMagicLink()`
> rejected tokens where `oobCode` query param contained URL-encoded `+` character.
> Decode step missing pre `parseMagicLinkUrl()`.

## §5 Detection signal

- **Who detected:** Daniel manual / Sentry alert / Beta user report
- **Lag:** <time between bug-deployed-to-prod and detection>
- **Signal:** <Sentry event fingerprint OR user message OR Daniel observation>

## §6 Resolution

What was done to restore service. Cite git commits + commands.

- **Path chosen:** Rollback (PROD_OPS §3.1) | Hot-fix (PROD_OPS §8.1) | Emergency manual (PROD_OPS §3.3)
- **Commits:** <SHA list>
- **Verify:** <healthcheck output + manual smoke result>

## §7 Anti-recurrence — what changes to prevent

Each post-mortem MUST produce ≥1 of:

- [ ] **New test** added covering exact failure mode (regression guard)
- [ ] **Runbook update** — `PROD_OPS_RUNBOOK.md` §4 common scenarios append OR `BACKUP_DR_RUNBOOK.md` §8 scenario added
- [ ] **Code invariant** added (assertion, type guard, validation) at failure boundary
- [ ] **Decision (ADR)** if architectural shift required — append `DECISIONS.md` LOCKED V1 entry
- [ ] **Monitoring** — Sentry alert rule sau Checkly synthetic check added

Concrete tasks listed below cu owner + ETA:

| # | Task | Owner | ETA | Status |
|---|------|-------|-----|--------|
| 1 | <task> | Daniel/CC | YYYY-MM-DD | PENDING/LANDED |

## §8 What worked well

Brief — keep momentum honest. NU all bad.

## §9 What slowed us

Brief — gaps în runbook OR tooling OR knowledge to fix.

## §10 References

- Sentry incident: <URL>
- GitHub Actions run: <URL>
- Commits: <SHA list>
- CHAT_STATE.md § live entries: <date range>
- Cross-link related ADR if any: DECISIONS.md §D<NNN>
```

---

## Authoring guidance

### When to write a post-mortem

| Trigger | Action |
|---------|--------|
| P0 incident (site down) | MANDATORY full post-mortem |
| P1 incident (auth broken) | MANDATORY full post-mortem |
| P2 feature degraded | OPTIONAL — single paragraph în CHAT_STATE.md sufficient unless pattern recurs |
| P3 cosmetic | SKIP — backlog item suffices |

### Speed vs depth tradeoff (solo-founder pragmatism)

- **Detection-to-publish target:** within 48h post-resolution while context fresh
- **Length:** 1-2 pages max — depth în §4 root cause + §7 anti-recurrence is what matters
- **No padding:** if §8 + §9 = "N/A, normal incident" → write "N/A" — NU invent reflection

### Honest root cause discipline

- **NU "user error"** — UX surface should have prevented OR explained
- **NU "Sentry didn't catch it"** — write Sentry alert rule into §7 anti-recurrence
- **NU "we'll be more careful"** — vague intent; codify în test/runbook
- **DO cite file + line** — specific failure point, NU "Auth code"

### Anti-recurrence loop

If similar incident type recurs ≥2 times → flag pattern în §7 of newer post-mortem +
cross-link prior INC files + escalate severity of fix (ADR-level architectural change).

---

## Cross-references

- `08-workflows/PROD_OPS_RUNBOOK.md` §7 — post-incident protocol invariants
- `08-workflows/COMMUNICATION_TEMPLATE.md` — Beta user notification template
- `08-workflows/BACKUP_DR_RUNBOOK.md` §8 — DR scenario response (when applicable)
- `06-sessions-log/` — incident files archived per ISO date naming
- `DECISIONS.md` — if root cause triggers ADR, append LOCKED V1 entry

---

🦫 **Post-Mortem Template SSOT V1** — solo-founder no-blame anti-recurrence loop.
HIGH-THETA Wave 2a chat 4 closure 2026-05-22.
