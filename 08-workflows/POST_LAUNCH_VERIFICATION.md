---
title: Post-Launch Verification V1 — First-10-Beta Feedback + Verification
status: ACTIVE_SSOT
created: 2026-05-25
authority: §50-M4 audit-nuclear-2026-05-19 closure (cluster-4 forensic triage REAL_OPEN)
cross_refs:
  - 08-workflows/BETA_ENTRY_CRITERIA.md (§12 GO/NO-GO — gate inainte de launch)
  - 08-workflows/PROD_OPS_RUNBOOK.md §1 (severity) + §5.1 (Sentry) + §7 (post-incident)
  - 08-workflows/PERSONA_MENTAL_MODEL_VALIDATION.md (Gigel/Marius/Maria)
  - 08-workflows/WORDING_BACKLOG.md (wording polish post-Beta D024)
  - DECISIONS.md §D042 (zero-bug gate) + §D024 (post-Beta a-z review window)
---

# Post-Launch Verification — Andura PWA V1

> **Scope:** dupa ce Daniel da GO (BETA_ENTRY_CRITERIA §12) si intra primii
> ~10 useri prieteni (invite-only). Acest doc = ce verificam in primele zile
> live + cum capturam feedback. Complement la BETA_ENTRY_CRITERIA (gate
> PRE-launch) — aici incepe verificarea POST-launch cu useri reali.

---

## §1 Verificare T+0 (ziua launch, primul user live)

Imediat dupa primul invite consumat:

- [ ] **Magic Link real** — primul user primeste email ≤30s + login reuseste
- [ ] **Onboarding complet** — Big 6 parcurse fara blocaj (varsta validare 16-99)
- [ ] **Antrenor home render** — coach card afiseaza program real (NU mock/empty)
- [ ] **1 workout cap-la-cap** — energy check → set log → post RPE → post summary
- [ ] **Persist cross-reload** — refresh pagina → date raman (Tier 0/1)
- [ ] **Sentry verde** — ZERO error nou tagged in primele sesiuni (§5.1 runbook)
- [ ] **Mobil real** — device user efectiv (NU doar Daniel S21), PWA install OK

Orice esec aici = P0/P1 per PROD_OPS_RUNBOOK §1 → rollback-first.

---

## §2 Canal feedback (primii 10 useri)

**ZERO in-app feedback channel V1** (PROD_OPS_RUNBOOK §6 confirma — NU implementat
pre-Beta). Capturam feedback prin:

| Canal | Cum | Cine |
|---|---|---|
| **Direct (prieteni)** | Mesaj/call direct — invite-only grup restrans | Daniel |
| **Email** | `maziludanielconstantin90@gmail.com` reply manual | Daniel |
| **Sentry** | Error stream automat (IF user opt-in telemetry; default OFF) | automat |

Centralizare: 1 fisier `📥_inbox/BETA_FEEDBACK_<data>.md` — Daniel scrie verbatim
ce raporteaza fiecare user (NU parafrazat). Co-CTO triaza din acel fisier.

---

## §3 Triaj feedback (cadenta)

Per item raportat, clasificare rapida (re-foloseste severity PROD_OPS_RUNBOOK §1):

| Tip | Exemplu | Actiune |
|---|---|---|
| **Bug P0/P1** | Nu poate finaliza workout, login loop | Fix imediat (runbook §3) |
| **Bug P2** | Engine output gresit, ecran stuck non-critic | Patch next deploy |
| **Confuzie UX (Gigel)** | "Nu inteleg ce face butonul X" | WORDING_BACKLOG / parity fix |
| **Wording** | Text neclar, ton corporativ | WORDING_BACKLOG (D024 a-z review) |
| **Feature request** | "Ar fi misto sa..." | `📥_inbox/` backlog post-MVP, NU urgent |

**Filtru Gigel mandatory:** daca user mediu non-tech se blocheaza/confuzeaza →
NU "user prost", e semnal real UX (PERSONA_MENTAL_MODEL_VALIDATION). Marius
(performant) + Maria 65 (conservativ) = unghiuri complementare.

**Cadenta:** review zilnic primele 3-5 zile (volum mic, 10 useri), apoi
saptamanal. ZERO SLA — best-effort solo founder.

---

## §4 Metrici de urmarit (primele ~2 saptamani)

Fara analytics tooling dedicat (telemetry opt-in OFF) — observatie manuala +
Sentry + Firebase Console:

- **Activare:** din N invite trimise, cati completeaza onboarding + 1 workout
- **Retentie scurta:** revin ziua 2-3? (semnal valoare reala vs novelty)
- **Crash rate:** Sentry error events / sesiuni (target ZERO crash-uri repetate)
- **Drop-off point:** unde abandoneaza in onboarding/workout (raport verbal user)
- **Firebase usage:** RTDB reads/connections sub Spark free tier (runbook §4.1)

NU vanity metrics. Semnal calitativ (feedback verbal 10 prieteni) > cantitativ
la scale asta.

---

## §5 Loop post-launch

```
User feedback (§2) → 📥_inbox/BETA_FEEDBACK_<data>.md
         │
         ▼
Triaj (§3) → P0/P1 fix imediat | P2 next deploy | UX/wording backlog
         │
         ▼
Fix + deploy → verify §1 smoke re-run pe zona atinsa
         │
         ▼
Decizie LANDED → DECISIONS.md (daca structural) + CHAT_STATE.md nota
```

Pattern Bugatti: bug raportat de user real = prioritate peste polish speculativ.
Anti-recurrence — daca acelasi feedback de la 2+ useri → root cause, NU patch
punctual.

---

## §6 Exit criteria Beta (cand consideram Beta "validat")

Indicativ (Daniel CEO decide final, NU prag rigid):

- [ ] ≥7 din primii 10 completeaza onboarding + cel putin 1 workout real
- [ ] ZERO P0/P1 outstanding (per D042 zero-bug discipline)
- [ ] Crash-free ultimele 7 zile (Sentry verde sustained)
- [ ] Feedback UX major triat + fix-uit sau backlog-uit explicit
- [ ] Wording a-z review window deschis (D024) cu date Beta reale

Trecere la next milestone (extindere Beta / pricing) = decizie Daniel separata.

---

🦫 **Post-Launch Verification SSOT** — first-10-Beta feedback + verificare
singular source post-launch. §50-M4 closure 2026-05-25. Complement la
BETA_ENTRY_CRITERIA (PRE-launch gate). Scoped post-Beta per finding.
