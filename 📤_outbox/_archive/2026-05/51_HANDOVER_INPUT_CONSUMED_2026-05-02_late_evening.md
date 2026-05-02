---
name: HANDOVER_INPUT_2026-05-02_late_evening
description: Sesiune chat strategic 2026-05-02 late evening — recovery halucinație handover chat anterior + 12 decizii LOCKED Gemini cross-check extracted + Batch A Sprint 4.x autonomous run COMPLETE (PartialComplete status) + Batch B autonomous run ÎN CURS așteaptă LATEST.md raport.
type: handover-input
date: 2026-05-02 late evening
status: WAITING_FOR_BATCH_B_LATEST
---

# §0 STATUS CHAT NOU — INSTRUCȚIUNE PRIMA

**ATENȚIE CHAT NOU:** Această sesiune se închide cu **Batch B autonomous run în curs**. Tu (chat nou) **AȘTEPȚI** ca Daniel să dragă `📤_outbox/LATEST.md` (raport Batch B) ca **PRIMUL artefact post-ingest handover**.

**Workflow chat nou:**
1. Daniel paste handover input + ALIGNMENT_QUESTIONS — tu răspunzi cu citation §X / ADR Y
2. Daniel drag `LATEST.md` Batch B în chat
3. Tu faci review paranoid pe raport (verificat fapte, NU credit raport orbește):
   - Extrage status fiecare task (Tier 1 + Tier 2)
   - Verifică claims technical via grep / view dacă posibil
   - Identifică findings critice + recommendations
   - Flag inconsistențe sau red flags
4. Tu generezi handover input nou pentru CC Opus ingest sesiune Batch B (decizii noi + amendments SSOT + cross-refs)
5. Tu propui Batch C scope (T&B Faza 1+2 full sau alternativ)

**NU pre-judeci raport Batch B până nu îl vezi.** Velocity Batch A = 4-5h muncă în 20 min wall-clock. Batch B poate fi similar.

---

# §1 RECOVERY HALUCINAȚIE CHAT ANTERIOR

## §1.1 Context

Chat anterior (numit "Acasă") a halucinat handover artefact la bandwidth ~15-20% real (raportat fals 30-35%). Daniel a prins comportamentul + a salvat conversația via paste integral în această sesiune.

**Decizii LOCKED chat anterior preserved (NU pierdute):** vezi §2 mai jos.

**Lessons learned aplicate sesiunea curentă:**
- Bandwidth raportat de Claude = unreliable când aproape saturare. Daniel verifică cu "ce real ai?".
- Handover artefact lung (400+ linii markdown) la bandwidth scăzut = halucinație garantată.
- Solution: chat nou fresh când bandwidth <30%, NU "mai întind".

## §1.2 Sesiune curentă wall-clock

- Start: ~12:35 AM 2026-05-02 (chat anterior "Acasă")
- Crash halucinație: ~01:11 AM
- Recovery sesiune nouă: ~01:15 AM
- End sesiune handover: TBD (acum)
- Wall-clock total: ~3-4h

---

# §2 12 DECIZII LOCKED EXTRACTED DIN GEMINI 3 CROSS-CHECK

**Source:** Daniel a rulat cross-check Gemini 3 cu specs Andura completă (7 dimensiuni). Output ~40% valid push-back, ~40% deja addressed în SSOT, ~20% halucinație/wrong context.

**Sesiunea de pe 2026-05-02 evening (chat anterior "Acasă") a tratat 4 puncte impact real + 5 product cleanup carry-over → 12 decizii LOCKED.**

## §2.1 TWA Google Play V1 LOCKED

**Decizie:** Distribuție V1 = Google Play Store via TWA (Trusted Web Activity) wrapper, NU pure PWA Chrome install banner.

**Rationale:** Maria 65 + Gigica 35 instinct merge la Play Store, NU "Add to Home Screen" Chrome menu (80% abandonment friction). Trust signal Play Store = critic Beachhead RO.

**Cost:** €25 one-time Google Play developer account + ~1 zi setup CC Opus (Bubblewrap CLI generate AAB + listing Play Console + Digital Asset Links verification).

**Bonus avantaje:** reviews + rating social proof + updates frontend instant fără re-submit Play Store + listing SEO Google search "fitness app Romania" + crash reporting Google Play Console gratuit + Open Testing track Beta 50 invite-only sept 2026 direct Play Store internal testing.

## §2.2 Android-only PWA Confirmed LOCKED

"SensAI for Android" positioning preserved (§29.6.3). Zero competiție directă cu SensAI iOS-only. iOS Safari ITP eviction IndexedDB problem = irelevantă (cancel finding Gemini #3).

## §2.3 Buget Legal Stage 1+2 LOCKED

**Stage 1 ACUM (€0-50):** Templates ToS + Privacy Policy free din avocatnet.ro / termene.ro adaptate manual cu Claude Opus pentru date sănătate Articolul 9 GDPR. Checkbox consimțământ separat onboarding (NU "accept toate").

**Stage 2 dec 2026 pre-launch (€200-400):** Review 1h cu avocat tech RO via Lawyrup.ro / Iuris.ro / Avocatoo.ro. NU full audit, doar review documente existente Stage 1.

**Total realist:** €200-450 (vs €300-500 §31 anterior). Sub bugetul existent.

**REVISION 2026-05-02 late evening:** Daniel propune **barter avocat prieten** schimb Pro lifetime free pentru review legal real. NU obligatoriu plătit. Caut activ în beta period.

## §2.4 NPS Feedback System UX LOCKED

NPS passive în Settings + 1× banner discret la 30 zile. NU push notification proactiv (friction Maria 65). User accesează Settings → tab Feedback → tap NPS rating 1-5 + comment opțional. Engine afișează 1× banner discret la deschidere app la 30 zile post-onboarding ("Ne ajuți cu un feedback?") — dismiss easy. Dismiss = next prompt 60 zile.

**Tactical fix implementare:** §12 Feedback System spec zice "Storage: Firestore" — stack actual e RTDB NU Firestore (cf §34.2 + Q-0352/Q-0362). CC Opus la implementation va folosi RTDB.

## §2.5 Indicator Mișcare Monocromatic Theme-Aware LOCKED V1

(Q-0434 amendment) — Eliminăm orice culoare stridentă (săgeată verde/albastră contrastantă tip tutorial YouTube = friction Bugatti). Trecem la indicator monocromatic minimalist adaptat temei active.

**Mecanică vizuală:**
- Săgeată discretă, linii fine (Thin Stroke), integrată paleta theme activ
- Tema Obsidian (Dark Mode): săgeată albă semitransparentă (60% opacitate)
- Tema Alabaster (Light Mode): săgeată charcoal semitransparentă
- Subtle motion blur effect între poziția START și END (pur vizual elegant, NU săgeată didactică)

## §2.6 Wording 4 Elemente Fix Exerciții LOCKED V1

**Format standardizat 4 elemente:**
1. **Pornești** (poziționarea inițială corp + echipament)
2. **Coborâre / Tracțiune** (faza excentrică sau concentrică)
3. **Revenire** (întoarcere poziție start)
4. **Atenție critică** (siguranță articulară pentru prevenire accidentări)

**Exemplu Bulgarian Split Squat:**
> "Pornești stând în picioare, un picior sprijinit în spate pe o bancă, la o distanță de aproximativ un pas mare. Cobori încet îndoind genunchiul din față, păstrând spatele drept. Te ridici împingând puternic în călcâiul piciorului din față. Atenție: genunchiul din față NU trebuie să treacă peste vârful degetelor de la picior."

**Rationale:** Maria 65 fără antrenor = omiterea unui cue tehnic critic = potențial accidentare = liability real.

## §2.7 §33.2 Storage Full 95% Suprimare în Sesiune LOCKED V1

**Mecanică:**
- Modal blocant 95% suprimat dacă `session.status === 'active'`
- 4h inactivity → engine consideră sesiune abandonată + auto-save silent state curent → modal afișat la următoarea interacțiune user
- Flag `suppressStorageAlert` exclusiv in-memory state pe durata sesiunii active (NU localStorage). Crash recovery via câmp dedicat schema IndexedDB sesiune activă

**3 triggers comportamentale modal amânat:**
1. End of Session (tap "Termină sesiunea")
2. Fresh Open (`onResume` / pornire proaspătă cu storage 95% AND zero sesiune activă)
3. Abandoned Session (prima interacțiune user post-4h inactivitate)

ZERO cod în spec (comportamental only).

## §2.8 Pricing V2 Amânat Post-Beta Data dec 2026 LOCKED

NU eliminare, defer. Decidem pe baza conversion data beta sept-dec 2026. Pre-launch lock arbitrary = risc churn la trecere paid.

## §2.9 Founding Members €60 Lifetime + Discord ELIMINATE V1 LOCKED

Doar Free permanent + V2 Pro €65/an post-launch. Simplificare scope V1 + zero Discord moderation overhead solo bootstrap. Sweep §29.6.3 + §1.4 PRODUCT_STRATEGY_SPEC pentru references removal. ADR Q-0533 Discord Premium Perk gated post-500 users = DEPRECATED.

## §2.10 Chalkboard Educational Chatbot V1.1 (defer) LOCKED

V1 user vrea execuție rapidă, NU chatbot education. V1.1 (~feb-mar 2027) = expansion play, justifică Pro €65/an upgrade reason. §11 status update "LOCKED Sprint 4" → "LOCKED V1.1 (~feb-mar 2027 expansion play)". Spec preserved 1:1 (NU rescriere), doar timing shift.

## §2.11 Wording Phase A/B/C Strategy LOCKED

Toate string-urile Phase A/B/C = procesate cu **Claude Opus dedicat** (NU Sonnet bulk batch).

**Phase B engine fatigue/reality/dp/proactive ~37 strings** = anti-RE absolut critical → mini-sesiune chat strategic ad-hoc 30-45 min Daniel-validated când CC ajunge implementation point.

**Pauză siguranță:** În momentul în care dezvoltarea ajunge la codul sensibil din Phase B engine, generarea bulk se OPREȘTE. Daniel deschide chat Claude nou dedicat (fresh bandwidth obligatoriu) → Claude pull SSOT (§25 + §27 batch 1-4 deja LOCKED ca pattern reference + §22 F-NEW-4 anti-RE wording lock + §23 Engine 12 variations LOCKED) → Daniel + Claude review fiecare text 30-45 min total → Filter Bugatti aplicat: zero formulare paternalistă + zero numerice vizibile + reframing pozitiv + voice persoana I plural → Wording locked → handover input mini → next CC Opus implementation Phase B.

## §2.12 Exercise Library Extension HARD BLOCKER V1 LOCKED (NU defer V1.1)

**Rationale Dependency Trap:** 8/8 templates LOCKED design-wise menționează exerciții care NU există încă în library actual. Library NU are aceste exerciții V1 → templates Longevitate + Tonifiere + Slăbire majoră NU funcționează → Maria 65 deschide app, primește template Longevitate, vede "Sit-to-Stand" → exercițiu inexistent → engine fallback la BBS (eliminat) → catastrofă safety.

**4 Piloni:**
- **Pilonul Longevitate & Mobilitate (Maria 65):** Sit-to-Stand, Lateral Step-ups, Wall Push-ups, Bird-Dog, Modified Plank
- **Pilonul Core & Antrenament Funcțional:** Pallof Press, Suitcase Carry, Bird-Dog
- **Pilonul Slăbire Majoră (Low-impact / Gigica 35):** Cable Pull-throughs, haltere/gantere pe suprafețe stabile
- **Pilonul Forță & Hipertrofie (Marius 25):** Trap Bar Deadlift, Hack Squat, Hip Thrust pe aparat, Face Pulls

**3 PB-uri tactice LOCKED:**
- **PB1:** Pool exhaustiv mișcări care acoperă 100% nevoile execuție 8 templates parametrice §29.2.4-§29.2.7. Numărul final = output mapping templates → exerciții, NU input arbitrary.
- **PB2:** NU blocăm structura JSON exercițiilor în spec strategic (prevenire data regression risk). Opus citește schema existentă src/exercises/ → extinde respectând schema → propune amendment doar dacă necesar.
- **PB3:** Pilot 1 exercițiu × 3-5 style variants Claude Design ÎNAINTE scale set complet (= număr exerciții × 2 poziții, output mapping).

---

# §3 BATCH A SPRINT 4.x AUTONOMOUS RUN — COMPLETE (PartialComplete status)

## §3.1 Setup

- **Working dir:** `C:\Users\Daniel\Documents\salafull` (Git Bash POSIX, NU PowerShell)
- **Backup tag:** `pre-batch-A-blockers-foundation-2026-05-02` ✅ pushed origin
- **Wall-clock duration:** ~20 min (vs target 8h — Opus terminat early)
- **Model:** Claude Opus 4.7 autonomous (`--dangerously-skip-permissions`)

## §3.2 Status Tasks

| Task | Status | Notes |
|------|--------|-------|
| Pre-flight (git clean, hook, baseline 888/888, backup tag) | ✅ | All gates passed |
| Blocker 2 Firebase Rules RTDB Lock | ⚠️ Partial | Schema landed + ADR 007 amendment, NU activate (gating Auth migration) |
| Blocker 3 D1 5→6 tiers + F-NEW-2 matrix | ✅ Complete | DEVELOPING tier + idempotent migration + Sprinter Cap helper + 41 tests |
| Blocker 1 T&B Faza 2 persistence | ⏸️ Deferred | Finding B critic: Faza 1 NU în cod (zero appendEvent/reduceEvents/tombstone matches) |
| Foundation 1 PR Engine | ⏸️ Deferred | Out of scope remaining session budget |
| Foundation 2 Linear Block 4+1 | ⏸️ Deferred | Logic partial encoded în F-NEW-2 deload-skip warning |
| Foundation 3 Safety Banner | ✅ Complete | Vanilla-JS module, 3 severities, 22 tests |
| Foundation 4 Hip Thrust + Mastery | ⏸️ Skipped | Explicit "if time permits" — not reached |

## §3.3 Net Output

- **Tests:** 888 → 955 (+67 net), zero baseline regressions
- **Commits:** 4 (pending push la finish raport)
- **Lines added:** +402 source / +599 tests

## §3.4 Findings Critice (Batch A)

### Finding A — Firebase Auth lipsește (MAJOR, deferred not skipped)
`src/firebase.js:7` hardcodes `USER_PATH = 'users/daniel'` literal, zero Auth integration. Per-uid rules block all `auth.uid === $uid` reads/writes for unauth client → app reads return null → empty UI → silent data corruption.
**Recommendation:** Auth migration prerequisite ÎNAINTE de Firebase Rules activate.

### Finding B — T&B Faza 1 NU în cod (CRITICAL)
SSOT §34.1 zice "Faza 1 LIVE doar algorithm core" → fals. `grep -rn "appendEvent|reduceEvents|tombstone" src/` returns ZERO matches. Faza 1 NU implementată actual.
**Implication:** Blocker 1 NU 3-5h, e 10-15h Opus combined Faza 1+2 dedicat. SAU hotfix minimal localStorage tombstone soft-delete (1-2h) pentru Memory Paradox specific.

### Finding C — cdlBackfill ladder semantics changed (LOW, intentional)
Aligned cu `detectCalibrationLevel`. Tests updated.

### Finding D — Inactivity decay 6-tier (LOW, positive)
ADR 012 decay softer cu 6 tiers (more granularity înainte hit INITIAL floor).

### Finding E — Vite static-vs-dynamic warnings (INFORMATIONAL, pre-existing)
Pre-existing warnings firebase.js, dp.js, tieringEngine.js — flag pentru Tier 2 cleanup batch viitor.

---

# §4 BATCH B AUTONOMOUS RUN — ÎN CURS (await LATEST.md)

## §4.1 Setup

- **Backup tag:** `pre-batch-B-auth-foundation-2026-05-02` (Opus va crea la pre-flight)
- **Target:** 8h Opus comprehensive cu **HARD FLOOR 7h** (NU stop early — lessons learned Batch A)
- **Hard cap:** 12h
- **Tier 1:** 9 tasks obligatoriu + **Tier 2:** 4 backup tasks dacă Tier 1 < 7h

## §4.2 Tier 1 Tasks (Obligatoriu)

1. **Auth Migration ADR_MULTI_TENANT_AUTH_v1** (~3-4h) — Email Magic Link primary + Google OAuth secondary + path migration `users/daniel` → `users/<uid>` + Auth threading prin fbGet/fbSet/fbRemove
2. **Memory Paradox Hotfix Minimal** (~1-2h) — localStorage soft-delete tombstone (NU full T&B Faza 1+2 — defer batch C dedicat)
3. **Foundation 1 PR Engine Forță** (~1h)
4. **Foundation 2 Linear Block 4+1** (~1h)
5. **Foundation 4A Hip Thrust UI Setup** (~30 min)
6. **Foundation 4B Mastery Milestone** (~30 min)
7. **Safety Banner Wiring 1 F-NEW-4 plan-ajustat** (~30 min)
8. **Safety Banner Wiring 2 F-NEW-2 deload skip** (~30 min)
9. **Safety Banner Wiring 3 Plateau §27 two-layer** (~30 min)

## §4.3 Tier 2 Backup Tasks (dacă Tier 1 < 7h)

10. **Findings Tracker Sync** — `05-findings-tracker/FINDINGS_MASTER.md` update cu Findings A+B+C+D+E Batch A + flag-uri noi Batch B (~30 min)
11. **SSOT §34.1 Correction** — amendment "Faza 1 LIVE" → "Faza 1 NEIMPLEMENTAT" + cross-ref Memory Paradox hotfix (~30 min)
12. **Wording Phase A bulk Opus** ~20 strings remaining + Onboarding ~9 (~1-1.5h)
13. **Build Optimization Findings** — Vite static-vs-dynamic warnings investigate + fix sau document (~1h)

## §4.4 Daniel Action Pending

- **Push commits Batch A** (raport zice pending) — `git push origin main` manual ÎNAINTE Batch B run sau Opus va face singur la pre-flight Batch B
- **Drag LATEST.md Batch B** când Opus termină → chat nou (acesta) review + handover Batch C

---

# §5 STRATEGY POST-BATCH B — BETA-LAUNCH ASAP

## §5.1 Decision LOCKED 2026-05-02 late evening

**Strategy:** Beta-launch full pentru prieteni/rude/network, NU 1 ian 2027 fix.

**Rationale:**
- Beta prieteni = trust real, NU strangers care depun plângeri ANSPDCP
- Audit legal proper post-beta, nu pre-beta (audit pre-beta prieteni = useless)
- Caut activ avocat printre prieteni → barter Pro lifetime free pentru review legal real
- General public launch = când Daniel decide ready, NU calendar fix

## §5.2 Realist Calendar

**Beta full launch ready: ~7-10 zile calendar** dacă Daniel alergă serios cu reviews + decisions între batches.

**Ce mai e de făcut major (excluding Batch B în curs):**
- **Batch C** T&B Faza 1+2 full (~10-15h Opus dedicat, 1-2h wall-clock)
- **Batch D** Library Extension + Imagini Pilot (~6-10h Opus + bottleneck Daniel review pilot 1-2h)
- **Batch E** Features V1 (F-NEW-1/2/3/4 + MMI + Storage Full UX + Onboarding 4 ecrane + Editare Istoric + Notificări + Next-Up Gaze + NPS Feedback) (~8-12h Opus)
- **Batch F** TWA Google Play setup + Bubblewrap + listing (~1 zi Opus + 3h Daniel manual)
- **Batch Legal Templates** Privacy Policy + ToS basic (~1h Opus, NU avocat)
- **Rebrand sweep SalaFull → Andura** (~5h Opus)
- **ADR 022 V2 consolidation** (~1 batch Opus)
- **Wording Phase A/C bulk** + **Phase B mini-sesiune chat ad-hoc**

**Total Opus wall-clock:** ~5-8h spread peste batches.
**Total Daniel-time:** ~10-15h (reviews + decisions + listing Play Console + pilot imagini approve).

## §5.3 Bottleneck Real

NU codul. **Daniel** + reviews bandwidth + pilot imagini approve + listing Google Play Console manual + caut avocat prieten în network.

---

# §6 LESSONS LEARNED

## §6.1 Bandwidth Self-Reporting Unreliable

Claude bandwidth raportat = unreliable când aproape saturare. Daniel verifică cu "ce real ai?". Pattern: bandwidth real e ~50% din ce raportez când mă apropii de threshold.

**Solution:** chat nou fresh când raport bandwidth <30%, NU "mai întind". Handover artefact lung la <20% = halucinație garantată.

## §6.2 Shell Detection Pre-Prompt

**Lessons Batch A:** Daniel acasă ≠ automat PowerShell. Verifică shell type ÎNAINTE scriu prompt cu sintaxă specifică.

**Solution:** întreb explicit "PowerShell sau bash?" la START de prompt CC nou.

## §6.3 Hard Floor Time Run Opus

**Lessons Batch A:** Opus terminat în 20 min cu "PartialComplete" status când Daniel a vrut 8h utilization full.

**Solution:** prompt explicit "HARD FLOOR Xh — NU stop early, dacă scope principal termină rapid continuă cu Tier 2 backup tasks".

## §6.4 SSOT Claims Verify Pre-Implementation

**Lessons Batch A Finding B:** SSOT zicea "Faza 1 LIVE algorithm core" → grep verify în src/ = ZERO matches. Spec out of sync cu cod.

**Solution:** prompt CC instruit să grep cod ÎNAINTE de implementare on critical claims, flag finding dacă mismatch.

## §6.5 Findings Tracker Mandatory

**Lessons Batch A:** raport conține findings dar findings tracker dedicat NU updated automat.

**Solution:** prompt CC future include explicit "update `05-findings-tracker/FINDINGS_MASTER.md` ca parte din raport".

---

# §7 NEXT STEPS POST-LATEST.MD BATCH B

**Tu (chat nou):**
1. Review paranoid LATEST.md Batch B (verifică claims, NU credit orbește)
2. Generează handover input artefact pentru CC Opus ingest sesiune Batch B (decizii + amendments SSOT + cross-refs noi)
3. Propui Batch C scope:
   - **Recomandat:** T&B Faza 1+2 full dedicat (~10-15h Opus, 1-2h wall-clock)
   - **Alternativ:** Library Extension + Imagini Pilot (bottleneck Daniel review 1-2h)
   - **Alternativ:** Features V1 cluster (F-NEW + MMI + Storage + Onboarding)
4. Aliniază cu Daniel Beta-launch ASAP strategy (§5)

**Daniel:**
1. Push commits Batch A dacă nu pushed automat de Opus
2. Drag LATEST.md Batch B când termină
3. Caut avocat printre prieteni în paralel (network activ)

---

🦫 **Sesiune chat strategic 2026-05-02 late evening LOCK. 12 decizii LOCKED preserved + Batch A complete + Batch B în curs await LATEST. Next chat fresh review + handover Batch C scope. Pre-launch V1 strategy reframed: Beta-launch ASAP prieteni, audit legal post-beta cu avocat prieten barter.**
