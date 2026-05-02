# ALIGNMENT QUESTIONS — Sprint UI + Daniel Solo Gate + Beta Path

**Generat:** 2026-05-02 — replacement file per Daniel directive ("rateuri la aliniere")
**Scope sursă:** ultimele 3 ingests (Cluster 10-Batch + Sprint UI Sequencing §36.72 + ALIGNMENT_QUESTIONS responses Q1-Q10)
**Status final după acest chat:** 61 LOCKED V1 cumulative, 8 ADR drafts ALL LOCKED, 0 DRAFT pending, Sprint UI gate Daniel solo în progres
**Format:** 15 Q-uri sharp, actionable, fiecare cu cele 2-3 căi (NU long sub-Q-uri)

---

## §1 SPRINT UI EXECUTION — sequencing + scope (Q1-Q8)

### Q1 — Sprint UI gate Daniel solo: strict sequential sau parallel?

**§36.72 LOCKED:** order strict (Daniel solo → strategic chat → CC Opus). Dar gate items Daniel = 4 (Firebase Auth + DB rules + GDPR + Avocat). Firebase + DB rules sunt **technical critical** pentru Sprint UI integration (auth wiring + database schema). GDPR + Avocat sunt **launch-blocking pentru Beta**, NU technical pentru Sprint UI cod.

→ **A) Strict toate 4** — Sprint UI start după ~2-4h (toate 4 done)
→ **B) Critical-only gate** — Sprint UI start după Firebase + DB rules (~1-2h), GDPR + Avocat parallel post-Sprint
→ **C) Parallel Avocat** — outreach (asincron, response delayed) starts now, Sprint UI gate = Firebase + DB rules + GDPR

---

### Q2 — Strategic chat UX scope: single sau split?

**6 topice:** 3 Card buttons + Goal Shift + DOMS expand + Founding counter + Telegram CTA + PROMPT_PROFILE_VALIDATION trigger.

→ **A) Single chat ~1-2h** — toate 6 într-o sesiune (bandwidth Daniel risc dacă lung)
→ **B) Split 2 chats** — chat 1 engine UI (Card buttons + Goal Shift + DOMS) / chat 2 commerce-admin (Founding + Telegram + PROMPT_VALIDATION)
→ **C) Split 3 chats** — Daniel CEO bandwidth optim, chat scurt focus 2 topice fiecare

---

### Q3 — CC Opus execution: single batch sau mini-cluster?

Empirical: §BATCH_PROTOCOL scalable la 10+ batches confirmed cluster 10-batch zero errors. Sprint UI ~6-10h estimate (sau ~1-2h actual factor 5-7x).

→ **A) Single Opus batch** — simpler orchestration, dar long-running risc context loss
→ **B) Mini-cluster 5 batches** — BATCH_UI_01 Card buttons / 02 Goal Shift / 03 Founding counter / 04 Telegram CTA / 05 PROMPT_VALIDATION (per §BATCH_PROTOCOL pattern)
→ **C) Mini-cluster 7 batches** — split mai granular cu disjuncte clean (e.g., DOMS expand separat, telemetry separate)

**Recommendation:** **B) 5 batches** — pattern empirical validated, intermediate gating per batch report.

---

### Q4 — DOMS expand wording final (ADR_PAIN EXT-1)

ADR_PAIN EXT-1 LOCKED V1: 2 options PRIMARY visible default ("Mișcarea mă deranjează" + "Simt o tensiune ciudată") + 1 SECONDARY behind expand "Mai multe opțiuni" ("DOMS sever" → "Durere musculară severă post-antrenament (DOMS)" în UI).

→ **A) Wording final ca-i** — copy/paste din ADR EXT-1, NU re-design
→ **B) Re-validate Maria 65** — testați wording cu user real / Gigel persona before lock UI
→ **C) Alt wording propus** — Daniel are alternativă specifică (indică)?

---

### Q5 — Founding cap counter visibility

§36.50-§36.52: Founding €39 capped 50 users. Atomic counter implemented (BATCH_05 Sprint 4.x). UI integration pending.

→ **A) Public counter "47/50 founding spots remaining"** — FOMO/urgency marketing classical
→ **B) Hidden counter** — avoid scarcity manipulation perception, Bugatti integrity over conversion
→ **C) Tier-aware** — public DOAR pe pricing page, hidden post-conversion (avoid post-purchase regret signal)

---

### Q6 — 3 Card buttons grouping logic

3 features: Aparat ocupat/lipsă (smart-routing §36.37) + Pain Discomfort (§36.38) + ?Disconfort (alt third button per §29.5).

→ **A) Single Card 3 separate buttons** — visual grouping "Probleme acum?" cu 3 sub-actions (compact, low real estate)
→ **B) 3 distinct Cards independent** — fiecare problem type = separate visual entity (mai clar dar takes space)
→ **C) Contextual single Card** — appears DOAR mid-session pre-set, hidden la idle / dashboard

---

### Q7 — Goal Shift card position

§36.35 + §36.58 GOAL_SHIFT_CALIBRATION_PLACEHOLDER LOCKED V1 wording. Card afișează "Recalibrăm pe noul obiectiv" + counter "Sesiunea ${current}/2".

→ **A) Top dashboard** — high visibility primele 2 sesiuni post-shift, dispare după
→ **B) In-flow per session** — appears DOAR la session start, dismissable
→ **C) Setări only** — confirmation discrete în Setări → Profil & Date, NU intrusive

---

### Q8 — Telegram CTA placement

§36.53 + §36.54 LOCKED: Telegram = sole pre-launch community channel.

→ **A) Onboarding screen 4** — early hook înainte first session (high install moment)
→ **B) Setări → Comunitate** — discoverable, NU push (respect attention)
→ **C) Post-session prompt 1×/săpt** — earned moment after success, soft suggestion

---

## §2 DANIEL SOLO GATE — readiness check (Q9-Q11)

### Q9 — Firebase Auth Console readiness

Multi-tenant migration ADR LOCKED. Daniel has docs/access?

→ **A) Self-serve clean** — Daniel are Firebase Console + docs internal, gate <1h
→ **B) Need walk-through** — solicită Claude/CC ghid step-by-step pre-execution
→ **C) Blocking dependency** — paid plan upgrade needed sau team admin necessary (indică)

---

### Q10 — DB rules deployment process

§34.2 Blocker 2: `database.rules.json` syntax LOCKED. Publish-only sau re-validate post cluster modifications (e.g., founding_cap_counter atomic transaction)?

→ **A) Publish-only** — sub-1h Daniel via Firebase Console manual paste
→ **B) Re-validate emulator** — pricing schema BATCH_05 Sprint 4.x adds founding_cap_counter, may need rules update + emulator test
→ **C) Need CC verification** — Claude verifică rules cover noile schema fields pre-publish

---

### Q11 — GDPR + Avocat criticality pentru Sprint UI

GDPR tutorial (§36.55) + Avocat barter outreach.

→ **A) Both blocking** — toate 4 gate items strict (per §36.72 LOCKED)
→ **B) GDPR blocking, Avocat parallel** — GDPR tutorial needed pentru screenshot integration UI, Avocat outreach asincron
→ **C) Both NOT blocking Sprint UI** — DOAR pre-Beta launch blocking (Sprint UI codes generic GDPR placeholder)

---

## §3 EMPIRICAL CALIBRATION + FUTURE (Q12-Q13)

### Q12 — Future Opus estimates: reduce sau preserve buffer?

Cluster 10-batch ~70min actual vs 6-8h estimate = factor 5-7x. Sprint 4.x cluster identical pattern.

→ **A) Reduce proportional** — Sprint UI estimate ~6-10h → reality ~1-2h actual; planning realistic
→ **B) Preserve estimate** — buffer pentru edge cases / debugging time, predictable plan
→ **C) Hybrid** — communicate ambele (estimate "headline" 6-10h cu "reality factor 5-7x = 1-2h actual likely")

---

### Q13 — Daniel-time estimate calibration

§36.72 spune "~2-4h Daniel solo". Realistic per past Daniel solo tasks (Firebase, DB)?

→ **A) Realistic** — Daniel a făcut similar setup pre, ~2-4h reasonable
→ **B) Optimistic** — Daniel solo de obicei ~5-8h (realistic include context-switching, dependencies, reading docs)
→ **C) Pessimistic actual** — Daniel mai eficient, ~1-2h actual

---

## §4 BETA PATH + V1.1 (Q14-Q15)

### Q14 — Beta cohorts 3-tier 50 users ratio

§36.47: 50 users beta. Pricing tiers Founding €39 / Standard €59 / Elite €79.

→ **A) Founding-heavy** — 40 Founding + 8 Standard + 2 Elite (cap 50 founding atinge; revenue €1860)
→ **B) Mixed proportional** — 25 Founding + 20 Standard + 5 Elite (€2540, more diverse signal)
→ **C) Founding-only** — 50 Founding (€1950, pure founding cohort signal — but cap reached pre-launch public)

---

### Q15 — Marketing Channel Mix V1.1 timing

§36.60 LOCKED: marketing channel mix DEFERRED V1.1 ~Februarie 2027.

→ **A) Strict V1.1** — NU discuții pre-Beta, focus 100% Sprint UI + launch
→ **B) Pre-Beta soft prep** — decide channel platforms (TikTok? IG? FB? Discord?) NOT execution timing — content prep paralel
→ **C) Pre-Beta V1.0 hint** — Telegram channel deja LOCKED, can extend la 1 secondary channel pre-Beta dacă bandwidth Daniel permits

---

## §5 RESUMĂ — STATUS POST CHAT

**Decizii cumulative:** 61 LOCKED V1 (post §36.72)
**Tests:** 1203 PASS / 75 files
**Coverage baseline:** 60.33% lines / 78.38% branches
**Build baseline:** 4.026s / 921 KB raw / 283 KB gzipped / ~3.0s on 3G
**ADR drafts:** 8 ALL LOCKED V1, 0 DRAFT pending
**Sprint UI gate:** 4 Daniel solo items
**Strategic chat NEW Sprint UI:** ~1-2h, 6 UX topice
**CC Opus Sprint UI execution:** ~6-10h estimate (~1-2h actual posibil)

---

**Total întrebări aliniere:** **15** sharp, actionable, 2-3 căi per Q.

**Path forward post Daniel review:**
- **Q1-Q8** Sprint UI scope + sequencing → strategic chat NEW unblocked
- **Q9-Q11** Daniel solo gate clarifications → Sprint UI start timing locked
- **Q12-Q13** empirical calibration → estimate convention pentru future clusters
- **Q14-Q15** Beta path + V1.1 → roadmap clarity post Sprint UI

---

*Generat 2026-05-02 replacement file per Daniel directive. Scope: ultimele 3 ingests (Cluster 10-Batch + Sprint UI Sequencing §36.72 + ALIGNMENT_QUESTIONS Q1-Q10 cluster batches integrate). 15 Q-uri sharp în loc de 10 verbose. Cumulative 61 LOCKED V1.*
