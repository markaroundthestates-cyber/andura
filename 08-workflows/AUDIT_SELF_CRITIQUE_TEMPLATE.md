# AUDIT SELF-CRITIQUE TEMPLATE

**Owner:** Daniel (CEO + Product) · Co-CTO Claude chat
**Status:** LIVE template — reusable audit procedure addendum
**Locked:** 2026-05-22 (Iter 1 Mass Fix V2 audit cluster KAPPA §46-H1)
**Cross-ref:** AUDIT_MOCKUP_PROD_PARITY_2026-05-16.md, audit-nuclear §46

---

## §1 Scop

Template self-critique aplicat post-audit pass — intrebarea "ce am ratat?"
in mod sistematic. Pre-Beta audit nuclear quaternary/quinary passes
folosesc acest template. Goal: surface blind-spots inainte de Beta launch.

NU duplicat cu audit-nuclear procedure (§52 super-audit roadmap). Este
addendum-checklist aplicat la final fiecare pass.

---

## §2 Cand aplici

- Post-audit pass nuclear (§30-§50 sectiuni)
- Post-mockup-vs-prod parity audit (Wave A-F + Pass 2)
- Post-cluster fix delivery (Wave 2 KAPPA aici, etc)
- Pre-Beta gate-decision Daniel
- Periodic quarterly review (post-Beta)

---

## §3 Template — 7 self-critique questions

### Q1 — Coverage gap

**"Ce sectiune NU am audit-at deloc?"**

- Lista screens / engines / config files
- Cross-reference cu existing audit ledger
- Identifica white-space: ce nu apare in findings dar exista in cod?
- **Output:** lista screens / files cu zero findings DESPRE care nu am
  raportat nici PASS/PARTIAL/FAIL — semneaza coverage hole.

### Q2 — Persona blind-spot

**"Pentru fiecare persona, ce screen NU am testat din perspectiva ei?"**

- Gigel: ce screen am asumat "tehnic OK" fara comprehensiune <5s check?
- Marius: ce screen lipseste granular control / precision check?
- Maria 65: ce screen am skip pentru "power-user-mode" prematur?
- **Output:** matrix persona × screen cu cell-uri "NU audit-at".

### Q3 — Engineering invariant

**"Ce assumption am facut tacit DESPRE comportamentul codului?"**

- Engine returns X format → assumed UI consume safe, NU verified adapter
- Storage tier expiry → assumed cleanup runs, NU verified cleanup logic
- Auth state → assumed listener fires, NU verified listener present
- **Output:** lista assumption-uri implicit. Cross-check fiecare cu un
  test sau code-read.

### Q4 — Hidden coupling

**"Ce modules am citit izolat, fara a verify cross-module dependency?"**

- Component A foloseste lib B → ce-i de-a lui B daca C schimba?
- Hook X consume store Y → ce daca store Y format changes?
- Aggregate Z combineaza engines 1-8 → ce daca engine 5 schimba shape?
- **Output:** lista cross-coupling pairs. Identify cele unverified.

### Q5 — Edge case enumeration

**"Pentru fiecare flow happy-path, ce edge cases am ratat?"**

- Empty state (no data) — handled?
- Error state (network fail) — handled?
- Concurrent state (2 tabs) — handled?
- Stale state (offline-then-online) — handled?
- Boundary state (0, max, edge values) — handled?
- **Output:** lista happy-paths cu coloane edge × handle status.

### Q6 — Anti-paternalism check

**"Unde am introdus paternalism over-cautious in audit recommendations?"**

- Suggested "add warning" unde Daniel anti-paternalism LOCK?
- Suggested "block action" unde user choice OK?
- Suggested "doctor consult cue" excessive (cluster ETA §43-H3)?
- **Output:** revizuieste fix recommendations; flag any contradicting
  Daniel "Andura gandeste pentru user" D025 LOCKED V1.

### Q7 — Mockup divergence rationalization

**"Pentru fiecare drift mockup-vs-prod ACCEPTAT, am documentat de ce?"**

- Prod has X, mockup nu (e.g., Bara de jos appearance section) — doc?
- Mockup has X, prod nu (e.g., gradient X) — doc?
- Daniel decision pe drift documented in DECISIONS.md sau Co-CTO ADR?
- **Output:** lista drift KEEP cu cross-ref decision-id. Identify cele
  UNDOCUMENTED.

---

## §4 Output format

Dupa raspuns la cele 7 intrebari, produce:

```
## Self-critique pass [audit-name] [date]

### Coverage gaps identified
- [Screen X] zero findings — verify pass needed
- [Engine Y] not in audit ledger — pass needed

### Persona blind-spots
- Gigel @ [Screen X]: comprehensiune <5s not checked
- Marius @ [Screen Y]: precision granular check missing

### Implicit assumptions
- [Module]: assumed [X] without verify
- [Lib]: assumed [Y] format without check

### Cross-coupling unverified
- [A-B] pair impact unverified

### Edge case gaps
- [Flow]: empty / error / concurrent / stale / boundary

### Paternalism flags
- [Recommendation X]: contradicting D025 LOCKED V1

### Drift documentation gaps
- [Drift Y]: KEEP decision UNDOCUMENTED
```

---

## §5 Anti-pattern flags

- **NU folosi self-critique ca infinite-loop** — un singur pass dupa audit,
  apoi commit findings + move on. Quaternary/quinary scheduled separat.
- **NU re-audit acelasi screen din placere** — daca primul pass curat,
  trust + move. Self-critique = identify NEW gaps, NU re-confirm existing.
- **NU paralegal hyper-cautious** — pre-Beta NO lawyer (MEMORY.md
  `feedback_no_pseudo_blockers.md`). Self-critique = engineering
  rigor, NU compliance theater.

---

## §6 Cross-ref

- **§46-H1 audit:** source finding pentru this template.
- **§52 super-audit roadmap:** post-Beta quaternary/quinary cadence.
- **AUDIT_MOCKUP_PROD_PARITY_2026-05-16.md:** anterior parity audit;
  next pass apply this template.
- **MEMORY.md `feedback_no_pseudo_blockers.md`:** anti-paternalism
  reminder.

---

## §7 Audit chain

- Use template post each audit pass → produce self-critique output
  appendix la audit doc
- Pattern emergent (3+ pass-uri identifying same gap-type) → escalate
  to ADR + audit-procedure refactor
