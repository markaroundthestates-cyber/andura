---
name: HANDOVER_INPUT_2026-05-02_pre-launch-final
description: Sesiune chat strategic 2026-05-02 — F-NEW-1/2/3/4 LOCKED + MMI hibrid LOCKED + Storage Full UX LOCKED (toate OBLIGATORIU V1) + 3 Optimizări UX Friction LOCKED (Onboarding 4 ecrane + Autofocus iOS + Next-Up Gaze) + 3 blockers Sprint 4.x identificate (T&B Faza 2 + Firebase Rules RTDB + 5→6 tiers refactor) + decizia GC tombstones defer 6 luni evaluare 1 iul 2027. ~35 decizii LOCKED + ~6 push-back-uri productive Claude.
type: handover-input
date: 2026-05-02
---

# §1 F-NEW-1 i18n EXERCIȚII RO LOCKED V1

## §1.1 Decizie inversare regulă (Gigel Test Validated)

UI Default = RO primary universal. Toggle Settings "Afișează denumiri internaționale (EN)" implicit OFF.

**Rationale:** Beachhead RO = r/Romania storytelling-first + FB grupuri 40/50+ + mămici active. Maria 65 ani + Gigica 35 ani non-tech = zero vocabular EN fitness. Prioritate clarity utilizator non-tehnic > recognition lifter advanced.

## §1.2 Lista finală traduceri UI Default (Toggle OFF) — LOCKED

| Original EN | Wording UI RO Default |
|-------------|----------------------|
| Romanian Deadlift | Îndreptări cu picioarele aproape drepte (RDL) |
| Lat Pulldown | Tracțiuni la helcometru |
| Bulgarian Split Squat | Genuflexiuni pe un picior, cu sprijin pe bancă (Bulgarian Split Squat) |
| Cable Row | Ramat la cablu |
| Hip Thrust | Ridicări de bazin (Hip Thrust) |
| Face Pull | Tracțiuni spre față (Face Pull) |

**Pattern reusable pentru exerciții viitoare:**
- Tipare mari mișcare tradiționale → RO complet (Genuflexiuni, Îndreptări, Împins, Ramat, Tracțiuni)
- Variații moderne/specifice cu termen industrie consacrat → RO descriptiv mecanism + EN paranteză (Hip Thrust, Bulgarian Split Squat, Face Pull, RDL)
- Termenii sală RO consacrați → RO pur fără EN paranteză (helcometru, ramat la cablu)

## §1.3 Toggle Settings EN (advanced users)

User activează → UI switch la denumiri internaționale (Lat Pulldown, Bulgarian Split Squat, Hip Thrust, etc.). DB internal indexează ambele variante pentru search cross-language.

**Status:** OBLIGATORIU V1 (Beachhead RO trust + brand consistency).

---

# §2 F-NEW-2 PROGRESSION SCALING TIER-AWARE LOCKED V1

## §2.1 Matrice 3 Tiers + Sprinter Cap Modifier

**Frecvență progresie per Tier (sesiuni finalizate):**

| Tier | Status | Frecvență Progresie |
|------|--------|---------------------|
| Beginner | 0-10 sesiuni | La fiecare sesiune (RPE corect toate seturile) |
| Intermediate | 11-50 sesiuni | O dată la 2-3 sesiuni (acumulare volum) |
| Advanced | 51+ sesiuni | O dată la 4-6 sesiuni (micro-periodizare) |

**Incremente greutate (Micro-loading universal default):**
- Compound (BBS, BBP, RDL, Trap Bar): +1 kg până la +2.5 kg
- Izolare (Curls, Lateral Raises): +0.5 kg sau +1 rep înainte de urcare greutate

## §2.2 Sprinter Cap Modifier (Profile Type Safety Override)

**Trigger:** `Profile Type == Sprinter` (volume creep risk + hyperfocus correlation).

**Plafonare:**
- Max Compound Increment: **1.0 kg** (în loc de 2.5 kg)
- Max Isolation Increment: **+1 rep** (în loc de +0.5 kg)

**Rationale:** Sprinter Advanced (51+ sesiuni) cu pattern volume creep + hyperfocus 8h/zi care primește +2.5kg compound = alimentezi auto-aggression. Marathon/Strategic Advanced same tier beneficiază de progresie agresivă pentru că NU are pattern risc.

**Cross-ref:** ADR Q-0231 Profile Typing influences thresholds.

## §2.3 Edge Case: User Advanced sare Deload Săpt 5

**Decizie:** Banner Soft Warning (Bugatti tone, autonomy preserved).

**Wording LOCKED (anti-paternalism, NU medical-flavored):**
> "Săptămâna de deload a trecut neutilizată. Sesiunea de azi merge mai bine la RPE 6-7 — corpul recuperează în mișcare, nu doar în repaus."

**Behavior:** banner soft warning, user păstrează agency 100%, NU force-deload retroactiv.

**Status:** OBLIGATORIU V1 (motorul de bază al aplicației).

---

# §3 F-NEW-3 HYPERREACTIVE COACH COOLDOWN LOCKED V1

## §3.1 Equipment Unavailable Rate-Limiting

**Threshold:** 3+ înlocuiri echipament în fereastră rolling 7 zile → engine învață silent.

**Behavior:**
- Sticky Last Swap activ (engine afișează direct alternativa pe sesiunea următoare)
- 4-Swaps Rule kicks in background (validate permanentizare)
- ZERO banner / notificare afișată user
- Decision background, NU blocking

**Cross-ref:** §29.5.10 Sticky Swap Engine + §29.5.11 Clean Slate Reset Engine.

## §3.2 Phase Change Rate-Limiting

**Threshold:** 2 schimbări manuale fază (Cut → Maintain → Cut) în <24h → a 2-a absorbită silent.

**Behavior:**
- Backend update setări transparent
- Confirmare discretă: "Obiectiv actualizat."
- ZERO modal full-screen sau ecran confirmare extensiv

## §3.3 Edge Case "User Pierdut" Cooldown Override

**Trigger condition compus (eliminare false positives):**
1. Aderență scade <25% pe fereastră 14 zile rolling **AND**
2. 7 zile consecutive zero login app

Doar AMBELE condiții = override cooldown 21 zile + activare ecran User Pierdut.

**Wording User Pierdut LOCKED (preserved §28.2):**
> "N-ai mai trecut de ceva timp pe aici. Nu-ți face griji pentru pauză: programul de azi e configurat să te repună în mișcare fără grabă."

**Rationale:** elimină alarme false din boală/concediu temporar (user 60% aderență + boală 7 zile = 22% artificial NU = pierdut real).

**Status:** OBLIGATORIU V1 (previne erori spam vizual UI).

---

# §4 F-NEW-4 PLAN AJUSTAT BANNER WORDING LOCKED V1

## §4.1 Wording Banner

**Eliminăm complet procentaje user-facing.** Anti-RE strict.

**Banner LOCKED:**
> "Plan ajustat astăzi pentru recovery."

NU "Plan redus 30%", NU "Adherence scăzută: 0%", NU "Deviation crescut: 100%".

## §4.2 Buton Override

**Replacement "Override (înțeleg riscurile)" force-typing eliminat:**

**Buton LOCKED:**
> "Folosesc varianta mea"

Agency explicit user, sound mature, Bugatti tone. Zero force-typing, zero medical disclaimer style.

**Status:** OBLIGATORIU V1 (anti-RE breach prod fix + protecție legală implicită).

---

# §5 MUSCLE MEMORY INDEX (MMI) LOCKED V1

## §5.1 Algorithm Hibrid (Lookup + Boost)

**Formula:**
```
Greutate Pornire = Peak Pre-Pauză × Multiplicator Lookup
```

**Tabel multiplicatori + boost progresie:**

| Durată Pauză | Multiplicator Pornire | Boost Progresie (primele 3 săpt) |
|--------------|----------------------|-----------------------------------|
| 6-12 luni | 0.80× | 1.25× |
| 12-24 luni | 0.70× | 1.10× |
| 24+ luni | 0.60× | 1.00× (start proaspăt) |

**Rationale:** păstrăm peak_pre_pause ca anchor (engine știe unde a ajuns user) + lookup table pentru durată reală pauză. Boost progresie primele 3 săpt accelerează re-calibrarea (corpul își amintește pattern-uri neuromusculare).

## §5.2 Threshold Trigger — User-Controlled

**6+ luni pauză → prompt user prima deschidere app:**

> "Vrei să reîncepem treptat, de unde ai rămas, sau preferi să o luăm de la zero?"

**Rationale:** anti-paternalism + agency 100%. NU hardcoded 6 luni rule, NU pre-pause-aware automatic. User decide.

## §5.3 UI Wording Re-engagement

**Wording LOCKED (Bugatti Tone):**
> "Pauza face parte din drum. Începem treptat — corpul tău își amintește."

**Comportament:**
- Opțional refusable
- User refuză → engine încarcă greutățile maxime istorice
- Banner discret avertizare risc accidentare la refuse (NU modal blocant)

**Status:** OBLIGATORIU V1 (~3-4h Sonnet implementare). Justified V1 inclusion: Maria post-operație șold revine după 8 luni = primii useri ajung iulie 2027, gap v1.5 risk reputational.

---

# §6 STORAGE FULL UX ALERT LOCKED V1

## §6.1 Threshold 80% Capacitate (~80MB)

**Banner discret săptămânal (NU blocant):**
> "Spațiul aplicației se umple. Vrei să păstrezi istoricul vechi în cloud sau să-l exporți pe dispozitiv?"

**Buttons disponibile:**
- Exportă datele (JSON local download)
- Află mai multe despre Cloud (Pro upgrade info)
- Închide

**Frecvență afișare:** 1× pe săptămână până user acționează sau atinge 95%.

## §6.2 Threshold 95% Capacitate (~95MB) — Modal Blocant

**Modal blocant (NU se închide fără acțiune directă):**

User trebuie să aleagă explicit una din 3:
- [ ] Descarcă istoricul (Export JSON local)
- [ ] Activează modul Cloud (Upgrade Pro)
- [ ] Șterge automat datele mai vechi de 180 zile (Alegere definitivă)

**Rationale:** ZERO data loss silent. User informat explicit ce se întâmplă, alegerea = consimțământ documentat. Industry standard (Apple/Google Photos, Dropbox) — niciodată data loss fără confirm.

## §6.3 Edge Case Free User 95% Refuză Toate

**Soluție:** Cap Pro upgrade prompt 1×/săpt + auto-rotate >180 zile DOAR DACĂ user a ales explicit "Șterge automat" în modal blocant 95%.

**Status:** OBLIGATORIU V1 (~4-6h Sonnet). Justified V1 inclusion: primii power users ating 80MB ~6-12 luni post-launch, gap v1.5 risk crash silent prod.

---

# §7 OPTIMIZĂRI UX FRICTION LOCKED V1

## §7.1 Onboarding 5 → 4 Ecrane (Disclaimer Integrat)

**Modificare:** disclaimer medical mutat din ecran dedicat în ecran 4 (Obiectiv).

**Arhitectură ecran 4 final:**
- Heading: "Care e obiectivul tău principal?"
- 3 opțiuni mari obiective (Forță / Slăbire / Longevitate / etc.)
- Sub opțiuni: checkbox cu wording §29.7.1 LOCKED:
  > "Înțeleg că Andura este o aplicație de wellness și nu înlocuiește sfatul medicului. Mă antrenez pe propria răspundere."
- Buton "Generează programul" disabled până checkbox bifat

**Impact:** Onboarding total <45 sec (vs <60 sec anterior). Economie 1 ecran întreg.

## §7.2 Autofocus Tastatură Numerică (iOS Workaround)

**Implementation:**
- `<input type="number" inputmode="numeric">` pe câmpuri Vârstă/Greutate/Înălțime
- Workaround iOS Safari: focus programatic via `setTimeout 50ms` la mount component (`useEffect` / `onMount`)

**Rationale:** iOS Safari blochează `autofocus` standard post-page-load anti-spam. setTimeout 50ms = pattern industry tested.

**Impact:** zero tap suplimentar pe ecrane numerice.

## §7.3 The Next-Up Gaze (Preview vizual în timpul pauzei)

**Behavior:** la pornire rest timer (auto-start §29.5.5 deja LIVE), ecran scoate în evidență discret cartonașul setului următor.

**Visual treatment:**
- Soft highlight / puls vizual pe cartonaș next set
- Folosește deja `ps-rec-kg` / `ps-rec-reps` existent în `restTimer.js`
- CSS animation + border glow subtle (NU flashy)

**Rationale:** user își trage sufletul → știe exact ce încarcă pe bară la secunda 0 a setului următor. Zero scroll, zero scanare vizuală.

**Status:** ~1-2h Sonnet (extension §29.5.5 existing).

## §7.4 Friction Map V1 Final LOCKED

| Touchpoint | Nivel V1 |
|------------|----------|
| Onboarding | 🟢 Ultra-Low (4 ecrane <45s + disclaimer integrat) |
| Input măsurători | 🟢 Ultra-Low (autofocus + iOS workaround) |
| Pauze între seturi | 🟢 Zero (auto-start §29.5.5 LIVE + Next-Up Gaze) |
| Editare istoric | 🟡 Medium justified (3 niveluri, integritate progresie) |
| Storage Full 95% | 🔴 High justified (zero data loss silent) |
| Disclaimer medical | 🟡 Medium justified (legal coverage) |
| MMI prompt 6+ luni | 🟡 Medium justified (1× per viața app, agency) |

---

# §8 BLOCKERS SPRINT 4.x PRE-LAUNCH IDENTIFICATE

## §8.1 Blocker 1: T&B Pattern Faza 2 — Memory Paradox Bug

**Status:** HARD BLOCKER pentru V1.

**Context:** ADR 011 amendment + ADR 021 Faza 1 LIVE doar algorithm core. Faza 2 persistence integration NEIMPLEMENTAT. Memory paradox observat 2× testing: user delete entry → reload → entry RE-APARE prin Firebase pull.

**Cum se rezolvă:** task CC Opus dedicat Sprint 4.x — implementare integrare persistență Tombstone & Branching (T&B). Tombstones marcaj logic ștergeri preserved (NU delete fizic). Branching = când 2 devices scriu simultan același parentId → preservare ambele branch-uri + UI prompt "varianta A sau B?" pentru user resolve.

**Effort estimate:** 50-80h trad / ~3-5h Opus comprehensive.

**Cross-refs:** ADR 011 amendment §Firebase sync + ADR 021 §Implementation phasing Faza 2 + COGNITIVE_ARCHITECTURE_SPEC §Q9 + 04-architecture/TOMBSTONE_BRANCHING_IMPLEMENTATION_SPEC.md.

## §8.2 Blocker 2: Firebase Rules RTDB Lock

**Status:** HARD BLOCKER pentru V1.

**Context:** Firebase rules currently OPEN (`allow read, write: if true`) per ADR 007 dev. Production launch cu rules open = oricine scrie `users/{anyUid}/coach-decisions` = data theft + mass corruption.

**Cum se rezolvă:** Daniel rulează prompt CC Opus dedicat pentru generare `database.rules.json` (RTDB syntax, NU Firestore — stack actual NU folosește Firestore + NU folosește Firebase Storage).

**Sintaxa corectă LOCKED:**
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth !== null && auth.uid === $uid",
        ".write": "auth !== null && auth.uid === $uid"
      }
    }
  }
}
```

**Workflow:** Daniel testează local cu Firebase emulator → publică manual în consolă Firebase. Sub 1h total.

**Cross-refs:** ADR 007 + Q-0352 + Q-0362 (RTDB NU Firestore).

## §8.3 Blocker 3: D1 DEVELOPING Refactor 5→6 Tiers

**Status:** HARD BLOCKER pentru V1.

**Context:** ADR 009 amendment 2026-04-30 evening = SSOT 6 nivele (DEVELOPING ID 2 inserted). Cod actual `src/engine/calibration.js` rulează încă 5 nivele (CALIBRATION_LEVELS 0-4). ADR 021 Faza 1 reconciliation pre-declares 6 nivele forward-compat, DAR consumer integration blocked până refactor cod.

**Cum se rezolvă:** task CC Opus dedicat Sprint 4.x — generare completă cod + teste + script migrare schema (existing users tier numeric → mapping nou cu DEVELOPING ID 2 inserted). Daniel intervine doar la final pentru review + rulare suite Golden Master.

**Effort estimate:** ~8-12h trad / ~2-3h Opus comprehensive.

**Scope refactor:**
- `CALIBRATION_LEVELS` enum 0-4 → 0-5 cu ID renumber
- Schema migration runner pentru users existenți pre-migration
- Update toate testele care reference levels (~30+ test cases)
- Engine consumers care folosesc tier comparisons (`>=`, `<` operators)
- Anti-regression Golden Master Suite

**Cross-refs:** §29.7.3 D1 DEVELOPING Refactor LOCKED V1 + ADR 009 amendment.

---

# §9 DECIZIE TOMBSTONES GC DEFER 6 LUNI POST-LAUNCH

## §9.1 Decizie LOCKED

**Cloud Functions Tombstone GC = AMÂNAT primele 6 luni post-launch.**

**Borna evaluare officială:** **1 iulie 2027** (exact 6 luni post Soft Launch 1 ian 2027).

## §9.2 Rationale (Bugatti Grade Buget Zero)

- **Zero efort dezvoltare:** Daniel NU pierde timp scriind/testând script GC (risc ștergere date valide accidental)
- **Fără costuri suplimentare:** Cloud Functions necesită upgrade Firebase Blaze plan. Rămânem pe planul gratuit Spark = risc financiar zero
- **Spațiu suficient cu margin:** RTDB free tier Spark = 1GB storage + 10GB/lună download. Tombstone ~50-100 bytes JSON × 50 deletes/user/lună × 1000 useri × 6 luni = ~30MB total = ~3% din 1GB
- **Focus retention:** Daniel conservă energie pentru retention metrics + stabilitate + UX, NU manual ops lunare

## §9.3 La 1 Iulie 2027

Daniel verifică volume real Firebase consolă + decide între:
- **A:** Implementare automată Cloud Functions GC (upgrade Blaze plan, ~€0-25/lună post-launch)
- **B:** Continuare manual cleanup script Daniel 1×/lună (cost zero)
- **C:** Mai amână GC dacă volume rămâne sub 5% capacitate

**Cross-refs:** ADR 011 amendment §Firebase sync (90 zile retention) + §31 Investiții (Firebase Blaze condition).

---

# §10 INVESTIȚII CONFIRMATE — ZERO BUGET NOU

## §10.1 Total Confirmed Primul An

Sesiunea 2026-05-02 NU a adăugat investiții noi. Buget rămâne identic cu §31 LOCKED:

| Item | Cost | Status |
|------|------|--------|
| Consultanță legală tech RO/EU | €300-500 one-time | Decembrie 2026 (1 lună înainte launch) |
| Domeniu andura.app | €10-15/an | ACUM (paralel rebrand sweep) |
| Firebase Blaze plan | €0-25/lună | Post-launch DOAR dacă >1000 useri activi |
| **Total realist primele 6 luni** | **~€310-515** | Firebase free tier suficient cf §9 GC defer |
| **Total worst-case primul an (1000 useri)** | **~€500-700** | Per §31 LOCKED |

## §10.2 Cheltuieli ZERO Sesiunea 2026-05-02

Toate optimizările sesiunii (F-NEW + MMI + Storage Full + UX Friction + 3 Blockers) = **CC Opus task time** (zero $) + Daniel review free.

**Cross-refs:** §31 LOCKED Investiții preserved.

---

# §11 STATUS V1 + NEXT STEPS POST-2026-05-02

## §11.1 Status V1 Final

**Templates:** 8/8 LOCKED design-wise (100%) — preserved.

**UX Colateral:** 16 sub-secțiuni V1 LOCKED preserved + 3 update minor (§29.5.5 extension Next-Up Gaze + §29.5.14 Onboarding 5→4 ecrane + autofocus).

**F-NEW:** 1/2/3/4 toate OBLIGATORIU V1 LOCKED.

**MMI + Storage Full UX:** OBLIGATORIU V1 LOCKED (~8-10h Sonnet total).

**Distribution V1 + Pre-Launch V1 + Rebrand + Investiții:** preserved §29.6/§29.7/§30/§31.

**3 Blockers Sprint 4.x identificate:** T&B Faza 2 + Firebase Rules RTDB + 5→6 tiers refactor.

**GC Tombstones:** defer 6 luni evaluare 1 iul 2027.

**Sesiuni chat strategic rămase pre-launch v1:** **0 (zero).** Toate decizii LOCKED.

## §11.2 Next Steps Imediat (Priority Order)

1. **Rebrand sweep CC Opus dedicat** (paralel altă muncă) — SalaFull → Andura (~5h Opus). Vault docs + cod + commits config + repo rename + GitHub Pages URL + email signature.

2. **CC Opus ADR 022 V2 draft** consolidare totul: §29.2.5 Forță + §29.2.6 Longevitate complet + §29.2.7 + §29.5 (toate 16 sub-secțiuni + Next-Up Gaze + Onboarding 4 ecrane) + §29.6 Distribution + §29.7 Pre-Launch + §29.8 NEW (sesiune asta) + §30 Rebrand + §31 Investiții.

3. **Sprint 4.x implementation cluster** (priority order):
   - **Blocker 2 Firebase Rules RTDB lock** (~30 min Daniel + CC Opus prompt)
   - **Blocker 3 D1 DEVELOPING refactor 5→6 tiers** (~2-3h Opus + Daniel review Golden Master)
   - **Blocker 1 T&B Faza 2 persistence** (~3-5h Opus comprehensive)
   - PR Engine Forță + Linear Block 4+1 + Safety Banner + Hip Thrust UI + Age guardrail + Mastery Milestone
   - Sticky Swap Engine + Clean Slate Reset + Wording Reset
   - Onboarding 4 ecrane + Autofocus iOS workaround + Editare Istoric + Notificări
   - F-NEW-1 i18n exerciții RO bulk batch + Toggle EN Settings
   - F-NEW-2 Tier-aware progression + Sprinter Cap modifier
   - F-NEW-3 Cooldown logic 14-day rolling + 7-day zero login dual condition
   - F-NEW-4 Banner wording + "Folosesc varianta mea"
   - MMI hibrid lookup + boost progresie + user-controlled prompt
   - Storage Full UX 80% banner + 95% modal blocant
   - Next-Up Gaze visual highlight (~1-2h Sonnet extension §29.5.5)

4. **Wording Phase B remaining (~37 strings) + Phase C (~78 strings)** bulk batch CC Sonnet

5. **PARAMETRIC_PROGRAMS_DESIGN.md refactor** focusModifier → goal field nou

6. **Exercise library extension** ~50-150 exerciții mobility + cardio low-impact + Forță accessory + Longevitate pool

7. **Beta sept-dec 2026** (50 testeri segmentat 4 săpt)

8. **Audit legal dec 2026** (~€300-500 RO/EU)

9. **Soft Launch 1 ianuarie 2027** 🚀

10. **1 iulie 2027 — Borna GC Tombstones** evaluare volume + decide automation/manual/defer

---

# §12 BACKUP TAG ORIGIN PRE-INGEST

Daniel rulează ÎNAINTE de comanda CC Opus ingest:

```bash
git tag pre-handover-ingest-2026-05-02-pre-launch-final
git push origin pre-handover-ingest-2026-05-02-pre-launch-final
```

Rollback safe disponibil în caz de necesitate.

---

🦫 **Sesiune chat strategic 2026-05-02 LOCK. Pre-launch V1 closing scope. F-NEW + MMI + Storage Full + UX Friction + 3 Blockers + GC defer + Investiții confirmate. Zero open items. Zero sesiuni chat strategic rămase pre-launch. Next: rebrand sweep + ADR 022 V2 + Sprint 4.x cluster + Beta + audit + Soft Launch 1 ian 2027.**
