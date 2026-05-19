---
name: 03_HANDOVER_ALIGNMENT_QUESTIONS
description: 30 adversarial alignment questions pentru chat nou — verifică Claude Chat-ul prinde corect handover SSOT + ADR-uri active + memory state post sesiune 30 apr evening
type: outbox-report
---

# Outbox Report 03 — Handover Alignment Questions (chat nou)

**Status:** Întrebări only. NU răspunsuri. Răspunsurile = referință §X handover sau ADR Y.
**Use:** paste într-un chat nou Claude → cere răspuns la fiecare → verify aliniere cu SSOT.
**Pass criteria:** chat răspunde corect ≥27/30 cu referință explicită. <27 = handover ingest fail, re-paste.

---

## Vision & Distribution

1. Care e exact one-liner-ul vision SalaFull (citat literal Daniel 2026-04-29 seară)? — ref `HANDOVER §1.1`
2. Cine e ICP beachhead v1 (first 100-500 users)? Pe ce 4 canale? — ref `HANDOVER §1.2`
3. Timeline pre-launch beta realist post velocity recalibration? Vs estimate developer tradițional inițial? — ref `HANDOVER §1.2 + §4.1`

## Positioning

4. Care e positioning one-liner SalaFull pe Android? — ref `HANDOVER §2.1`
5. De ce SensAI NU e competiție pe Android (un singur fapt cheie)? — ref `HANDOVER §2.1`
6. Cât % Android market share global / Europe / Romania? — ref `HANDOVER §2.1`
7. Care competitori Android există + pricing fiecare (Fitbod, JuggernautAI, Hevy, Arvo)? — ref `HANDOVER §2.1`

## 7 features distinctive (MOAT)

8. Listează cele 5 signals AA Detection. — ref `HANDOVER §2.2 #1`
9. Care sunt cele 3 layere Reality Engine validation? — ref `HANDOVER §2.2 #2`
10. Anti-RE strategy: ce vede user? Ce e ascuns engine internal? — ref `HANDOVER §2.2 #3`
11. Câte layere are Fiber Type Inference per-exercise? Numește-le. — ref `HANDOVER §2.2 #4`
12. Bayesian Nutrition Inference: câte input-uri user direct? Care sunt 5+ semnalele pasive? — ref `HANDOVER §2.2 #5`
13. Cele 5 engines în cognitive architecture (5-engine)? — ref `HANDOVER §2.2 #7`

## Pricing locked

14. Care e pricing Pro standard v1+ (lună/an)? Vs SensAI pentru parity? — ref `HANDOVER §3`
15. Care e pricing + cap users Founding Members? Lifetime sau recurring? — ref `HANDOVER §3`
16. % schimbare vs Q-0507 inițial (€___ → €___)? — ref `HANDOVER §3`
17. Math revenue: câți users × €65/an = €1M/an target? — ref `HANDOVER §3`

## ADR-uri active

18. ADR 009 amendment §AMENDMENT 2026-04-30: care sunt cele 2 axe ortogonale? Domeniul fiecăreia? — ref `03-decisions/009-calibration-tiers.md §AMENDMENT 2026-04-30`
19. ADR 019: care sunt cele 5 quasi-identifiers SSOT? — ref `03-decisions/019-gdpr-k-anonymity-validation.md`
20. ADR 019: de ce k=5 minim (vs k=3 sau k=10)? — ref `03-decisions/019-gdpr-k-anonymity-validation.md`
21. Câte ADR-uri active total? Range numerotat? Plus exceptions named? — ref `VAULT_RULES.md §2 + INDEX_MASTER §ADR-uri active`

## Velocity calibration

22. Velocity factor empirical Opus autonomous comprehensive? Cum s-a calculat? — ref `HANDOVER §9`
23. Estimate rule: developer hours ÷ ___ = Opus comprehensive realist? — ref `HANDOVER §9`

## Sprint 4 / Wave 6 scope

24. Listează cele 4 SensAI features ADĂUGATE Sprint 4. — ref `HANDOVER §6.2`
25. Listează cele 4 JuggernautAI ideas ADĂUGATE Sprint 4. — ref `HANDOVER §6.3`
26. Total effort pre-launch v1 ADĂUGAT (tradițional + velocity recalibrated)? — ref `HANDOVER §6.7`

## Chalkboard

27. LLM provider Chalkboard v1 (recommended + backup)? De ce free tier NU Sonnet/Opus? — ref `HANDOVER §11.2`
28. Free tier vs Pro tier limits Chalkboard (q/zi, q/lună, $/lună)? — ref `HANDOVER §11.4` ⚠️ vezi nota raport 04

## Feedback System

29. Care sunt cele 3 components Feedback System v1? — ref `HANDOVER §12`

## Vault hygiene system + memory

30. Câte memory entries active sunt now? Care e principle-ul memory cross-context vs handover? + Numele celor 2 fișiere root system (VAULT_RULES + ___)? — ref `HANDOVER §8.1 + §8.2 + §7.2`

---

## Chat-nou validation flow

```
1. Paste content acest fișier în chat Claude nou
2. Cere chat-ul răspundă FIECARE întrebare cu citation §X handover sau ADR Y
3. Score răspunsuri:
   - 27-30 corecte cu citation = ALIGNED, proceed
   - 22-26 corecte = partial, re-read sections flagged
   - <22 corecte = INGEST FAIL, paste handover din nou + re-test
4. Întrebări care diverg de la SSOT → flag în chat că handover-ul e authoritative
```

---

🦫 **30 questions. Adversarial. Citation required. Pass = SSOT aligned.**
