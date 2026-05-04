# ADR 025 — "Andura Gândește pentru User" / Graceful Degradation Universal

**Status:** 🟡 **CANDIDATE / STUB** (file create per Vault Hygiene Sprint Faza 3, 2026-05-04 — full spec deferred to dedicated chat strategic NEW post Auth Flow §36.80)
**Date:** 2026-05-04 (stub creation per §36.94 ADR 025 candidate decision + §36.95 ADR Numbering Additive + §36.96 G)
**See also:** [[../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening|HANDOVER_GLOBAL]] §36.94 (ADR 025 candidate decision wording verbatim) + §36.105 (Pivot "More Engine Less LLM Runtime" reconfirmed) + [[../01-vision/SUFLET_ANDURA|SUFLET ANDURA]] §1.1 + F2 + F5 + F6 + R17 (User Agency)

---

## ⚠️ STATUS — CANDIDATE

**Acest ADR articulează RETROACTIV un principiu fondator implicit existent în deciziile bune deja LOCKED.** §36.94 a articulat principiul după Daniel revelație core "Andura gândește pentru user" — pattern detectat retroactiv în:

- ADR 014 Onboarding Profile Typing skip (T0 demographic prior fallback)
- ADR 023 Pain text + Equipment text skip (LLM intent fallback)
- §36.94 B4 RPE Verbal skip (engine assume RIR 2 default)
- §36.94 B2 T&B skip (engine pre-fills default branch)
- §36.94 T0 Onboarding skip (categorical universal display)
- §36.94 T1+ Profile Typing skip (engine continues without forcing)

**Acest stub = placeholder pentru spec full PENDING.** Daniel chat strategic dedicat NEW post Vault Hygiene + Auth Flow §36.80 va formaliza pattern-ul + extension la features V1.5+V2+ permanent.

---

## Decision wording verbatim (per §36.94)

> **"Aplicabilitate: ALL features V1 + V1.5 + V2+ permanent.**
>
> **Mecanism: graceful degradation mandatory + skippable everything + engine-pre-fills-default + user-override-optional.**
>
> **Filtru pre-feature LOCK: 'Dacă user ignoră complet feature, app-ul tot funcționează rezonabil?' DA → eligible LOCKED. NU → REJECTED indiferent tech sophistication."**

---

## Origin story (Daniel revelație 2026-05-03 chat strategic post-audit)

**Excel "câte kg la leg press" 13 zile → app coach AI fitness Bugatti paradigm:**

Daniel a folosit Excel timp de 13 zile pentru a tracker "câte kg la leg press" înainte de a începe Andura. Realizarea: **app-ul trebuie să gândească pentru user**, NU să forțeze user-ul să gândească pentru app. Friction-ul (login, completare profile, RPE selection, T&B branch resolve) = obstacol, NU feature.

Articulare retroactivă a principiului fondator implicit: deciziile bune existente respectă deja acest principiu. Articularea explicită = filtru pentru features V1.5+V2+ viitoare.

---

## Scope summary (stub level)

**Decision domain:** Universal pattern aplicat la TOATE features Andura V1+V1.5+V2+ permanent — graceful degradation mandatory.

**Mecanism core (4 elemente):**

1. **Skippable everything** — every feature has a clear skip path (NU mandatory completion gate, exception SAFETY_TRIPWIRE_GLOBAL Cognitive Q18)
2. **Engine pre-fills default** — when user skips, engine assumes safe default (NU force prompt, NU silent failure)
3. **User override optional** — user can later edit/refine when ready (NU lock-in)
4. **Filtru pre-feature LOCK** — pentru features V1.5+V2+ noi: "Dacă user ignoră complet feature, app-ul tot funcționează rezonabil? DA → eligible LOCKED. NU → REJECTED indiferent tech sophistication."

**Aliniat SUFLET ANDURA principles:**
- F2 "AI-ul informează nu impune" (NU paternalism)
- F5 "Push-back proporțional cu risc" (NU force compliance)
- F6 "Adaptive output no inference" (NU assume what user didn't say)
- R17 User Agency > Paternalism

**Aliniat existing LOCKED V1 decisions (retroactive validation):**
- ADR 014 Onboarding Typing — T0 skip = demographic prior fallback ✅
- ADR 023 LLM Intent — Pain/Equipment text skip = LLM not invoked ✅
- §26 Goal-ca-setting — user picks 5 templates, NO forced progressive disclosure ✅
- §36.99 ADR 026 Offline Coaching Tree — input structurat default-pre-filled, free-text optional ✅
- §36.106 D2 Injury Mapping — proposal "user override Liability Flag silent" aliniat R17 ✅
- §36.107 D3.1 Don't Like Button — preferință stylistic accept silent (NU push-back) ✅

---

## Open Questions (PENDING chat strategic NEW)

1. **Filtru pre-feature LOCK formalizare:** template formal pentru evaluare features noi? Checklist: (a) skip path defined? (b) engine default specified? (c) override mechanism? (d) "ignore-and-app-works" test passed?
2. **Hard contradictions:** ce faci când 2 features bune individual = mutual incompatible în skippability? (ex: T&B branch resolve = critical pentru data integrity, but skipping = data divergent)
3. **Override visibility:** ce UX pattern pentru "user override available" — banner persistent / tooltip on demand / settings-only buried?
4. **Default safety boundary:** când engine default = unsafe (ex: medical contraindication +50% load presumed)? §36.106 D2 NEW pending decision overlap.
5. **Audit trail:** CDL log fiecare skip → re-evaluare? Sau zero log (preserve user privacy + reduce CDL bloat)?
6. **A/B testing:** mandate post-launch quantitative validation pe % users care folosesc skip vs full flow?
7. **Anti-pattern detection:** features-care-nu-respectă acest principiu existing — audit periodic? Quarterly review? Codification în §VAULT_HYGIENE_PASS?
8. **Versioning:** features V2+V3+ vor avea acest principiu ca foundation immutable, sau evoluable cu rationale documented?

---

## Cross-references

- [[../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening|HANDOVER_GLOBAL]] §36.94 (ADR 025 candidate articulation) + §36.95 (ADR Numbering Additive split — file numbering reserved) + §36.105 (Pivot "More Engine Less LLM Runtime" aliniat) + §36.106 D2.5 (User override Liability Flag silent) + §36.107 D3.1 (Buton "Nu vreau" preferință accept silent)
- [[../01-vision/SUFLET_ANDURA|SUFLET ANDURA]] §1.1 (75% replicabil V1 engine deterministic — graceful degradation foundation) + F2 + F5 + F6 + R17 User Agency
- [[014-onboarding-profile-typing]] (T0 skip = retroactive validation example)
- [[023-llm-intent-interpretation]] (Pain/Equipment skip = retroactive validation example)
- [[../04-architecture/COGNITIVE_ARCHITECTURE_SPEC_v1|COGNITIVE_ARCHITECTURE_SPEC]] Q18 SAFETY_TRIPWIRE_GLOBAL (mandated exception to "skippable everything")
- [[026-offline-coaching-decision-tree-exhaustive]] (cross-pattern offline tree has same graceful degradation per branch)

---

🦫 **Stub created Faza 3. Candidate status preserved (NU LOCKED — pending chat strategic dedicat). Full spec PENDING. ZERO fabrication. Articulare retroactivă a principiului fondator implicit în deciziile bune existente. "Andura gândește pentru user" — Bugatti paradigm peak craft.**
