# PERSONA MENTAL MODEL VALIDATION

**Owner:** Daniel (CEO + Product) · Co-CTO Claude chat
**Status:** LIVE doc — applies pre-Beta launch and ongoing post-Beta
**Locked:** 2026-05-22 (Iter 1 Mass Fix V2 audit cluster KAPPA §50-H2/H3/H4)
**Cross-ref:** PROJECT.md personas, DECISIONS.md §D025 "Andura gandeste pentru user", `99-archive/wiki-pre-2026-05-15/` deep persona docs

---

## §1 Scop

Validare cognitiva per screen pentru cele 3 persone Andura. Filter aplicat
pre-feature (Gigel test mandatory) si pre-Beta launch (audit nuclear).
Cross-check vizual cu mockup `andura-clasic.html` DESIGN MASTER.

**Regula:** daca un singur persona pica testul → screen-ul nu intra in Beta
fara fix sau decizie LOCKED V1 acceptand drift.

---

## §2 Persona Gigel — user mediu non-tech RO

### §2.1 Profil

- Limba materna RO, nivel digital B1 (mediu)
- Smartphone Android mid-range, conexiune 4G fluctuanta
- ZERO experienta cu apps fitness; eventual MyFitnessPal expus
- Mental model: "ar trebui sa fie clar din prima"

### §2.2 Criterii validare per screen

1. **Comprehensiune <5s** — utilizatorul intelege scopul screen-ului in mai
   putin de 5 secunde din momentul deschiderii.
2. **Limba B1** — vocabular accesibil non-tech. Cuvinte cu nuanta tehnica
   (jargon) flagged.
3. **CTA primar clar** — un singur buton primar dominant. Secondary actions
   nu compete vizual.
4. **Nimic ambiguu** — fara ghicit ce face un buton sau ce inseamna un icon
   izolat fara label.
5. **Erori in limbaj uman** — "Email gresit" da, "validation_error" nu.

### §2.3 Lista verbatim jargon flagged pentru Gigel

- "Mock login" (DEV-only — gated cu `import.meta.env.DEV`, OK pre-Beta)
- "FSM transition" (intern, nu vizibil user)
- "Aggregate signal" (intern engine, UI vede label final)
- "Adapter fallback" (intern engine, UI vede valori finale)

### §2.4 Screens validate Gigel (status check 2026-05-22)

| Screen | Comprehensiune <5s | B1 limbaj | CTA primar | Status |
|--------|-------------------|-----------|------------|--------|
| Splash | PASS — wordmark + tagline + 2 CTAs | PASS | PASS "Incepe" | PASS |
| Auth | PASS — email + Magic Link + Google | PASS | PASS Magic Link OR Google | PASS |
| Onboarding step 1 (Obiectiv) | PASS — 4 obiective vizuale | PASS | PASS pill select | PASS |
| Onboarding step 7 (Sumar) | VERIFY — tone Daniel-direct (cluster HIGH-ALFA §30-H2) | VERIFY | VERIFY | PARTIAL |
| Antrenor (home) | PASS — "Incepe sesiunea" dominant | PASS | PASS | PASS |
| Workout (in-session) | PASS — exercitiul curent + Log set | PASS | PASS | PASS |
| Progres | PARTIAL — strip-uri tehnice (Fatigue 6/10 OK, BMR doc-only) | PASS | NA | PARTIAL |
| Cont | PASS — avatar + sectiuni navigatie | PASS | NA | PASS |
| SettingsDanger | PASS — warning banner + dest actiuni | PASS | PASS destructive | PASS |
| EnergyCause | PASS — 4-6 cauze cu iconite | PASS | PASS pill select | PASS |
| PainButton | PASS — buton mare per durere | PASS | PASS destructive safe | PASS |

---

## §3 Persona Marius — performant la sala

### §3.1 Profil

- Limba materna RO, nivel digital B2 (avansat)
- Smartphone high-end iOS / Android
- Background fitness 3+ ani, foloseste apps similare (Strong, Hevy)
- Mental model: "vreau date precise si control"

### §3.2 Criterii validare per screen

1. **Precizie numerica** — afisaj numere cu zecimale unde conteaza (kg, %),
   nu rotunjit agresiv.
2. **Advanced features accesibile** — RPE/RIR, mesociclu, faza, override
   manual disponibile fara ascundere ostentativa.
3. **NU dumbed-down** — explicatii nu paternalize. Marius stie ce e
   "1RM" sau "deload week".
4. **Granular control** — set log permit override target, edit post-log.
5. **Date trend vizibile** — Progres tab arata serie temporala, NU snapshot
   isolated.

### §3.3 Screens validate Marius (status check 2026-05-22)

| Screen | Precizie numerica | Advanced feats | Granular control | Status |
|--------|-------------------|---------------|------------------|--------|
| Workout SetLogInput | PASS — kg cu zecimal, reps integer | PASS — RIR/RPE picker | PASS — edit post-log | PASS |
| Progres FatigueStrip | PARTIAL — 6/10 vs 100-scale (cluster HIGH-EPSILON §F-pass2-fatiguestrip-01) | PASS | NA | PARTIAL |
| Progres TDEEStrip | PARTIAL — Faza badge + sapt mesociclu (cluster HIGH-EPSILON §F-pass2-tdeestrip-01) | PARTIAL | PASS | PARTIAL |
| Progres HeatMap | PARTIAL — weight delta + drill link (cluster HIGH-EPSILON §F-pass2-heatmap-02) | PARTIAL | PASS | PARTIAL |
| Antrenor CoachToday | PARTIAL — lagging signal (cluster HIGH-EPSILON §F-pass2-coachtoday-04) + override link (cluster §F-pass2-coachtoday-06) | PARTIAL | PARTIAL | PARTIAL |
| SettingsProfile Antrenament | PASS — KEEP obiectiv + frecventa expuse (Co-CTO decision §F-pass2-settings-profile-05) | PASS | PASS | PASS |
| EnergyCause | PASS — 6 cauze granulare prod KEEP (engine finer signal) | PASS | PASS | PASS |

---

## §4 Persona Maria 65 — conservativ varstnic

### §4.1 Profil

- Limba materna RO, nivel digital A2 (incepator)
- Smartphone mid-range Android, font OS marit
- ZERO experienta apps fitness; foloseste WhatsApp, FB, mail
- Mental model: "sa nu stric ceva, sa nu apas gresit"

### §4.2 Criterii validare per screen

1. **Tap targets >=44px** — buttons minimum 44px touch area per Apple HIG.
2. **Limba plain** — A2 simplu, propozitii scurte, NU verbe compuse.
3. **Cognitive load mic** — un singur task vizibil per screen. NU 5
   sectiuni concomitent.
4. **Forgiving UX** — Confirm modals pe actiuni destructive, undo cand
   posibil, "Inapoi" button vizibil.
5. **Persona-class only Antrenor** — Maria 65 in Beta primary on Antrenor
   tab; alte taburi (Progres tehnic, Istoric dens) considerate
   power-user-mode pentru ea (cross-ref §6-H5 in audit).

### §4.3 Screens validate Maria 65 (status check 2026-05-22)

| Screen | Tap targets | Limba A2 | Cognitive load | Forgiving | Status |
|--------|-------------|----------|----------------|-----------|--------|
| Splash | PASS — 2 CTAs mari | PASS — wordmark + tagline scurta | PASS | NA (entry) | PASS |
| Auth | PASS — buton Magic Link mare | PASS — "Trimite link pe email" simplu | PASS | PASS — back button | PASS |
| Antrenor home | PASS — "Incepe sesiunea" mare dominant | PASS — verb imperativ simplu | PARTIAL — cards multiple dar primary clear | PASS | PARTIAL |
| Workout | PASS — Log set buton mare | PASS — Tinta 10 reps simpla (post cluster HIGH-DELTA §F-pass2-setloginput-01/02) | PARTIAL — multi-element screen | PARTIAL — finish-early confirm wired | PARTIAL |
| Cont | PASS — sectiuni cu icoane + nume | PASS — Profil, Notificari, etc. | PASS | PASS — back button | PASS |
| SettingsDanger | PASS — warning cream banner (post cluster HIGH-BETA §F-pass2-settings-danger-01) | PASS — "Sterge contul" plain | PASS | PASS — confirm modal | PASS |
| PainButton | PASS — buton mare per durere | PASS — "ACUTA / USOARA / NICIO" plain | PASS | PASS — toast + closing italic | PASS |
| Progres | DEFER — power-user mode considerat | DEFER | DEFER | DEFER | DEFER (cross-ref §6-H5) |
| Istoric | DEFER — power-user mode considerat | DEFER | DEFER | DEFER | DEFER (cross-ref §6-H5) |

---

## §5 Cross-screen review template

Cand un screen nou intra pentru audit Beta-gate:

1. Deschide screen-ul pe mobil real (Pixel 4 / iPhone SE simulator OK
   pentru baseline; physical device pre-Beta).
2. Cronometru: 5 secunde de la load → ce a inteles Gigel?
3. Citeste fiecare label cu voce tare: e cuvant B1 (Gigel) / A2 (Maria)?
4. Tap targets: deschide DevTools, masoara fiecare buton. >=44px = PASS.
5. Comprehensiune Marius: vede precizie numerica? Are control granular?
6. Erori state: forteaza eroare (offline, server fail). Mesaj plain RO?
7. Confirm destructive: orice "Sterge" / "Reseteaza" are confirm modal?
8. Back navigation: orice screen non-tab are back affordance vizibila?

Note results in row format (Status: PASS/PARTIAL/FAIL/DEFER) si link to
finding ID in `00-INTEL/findings-ledger.json` daca FAIL.

---

## §6 Beta-gate posture

- Toate PASS = screen ready Beta
- PARTIAL = screen ships Beta dar cu finding open pe backlog
- FAIL = screen blocheaza Beta-gate; fix mandatory inainte launch
- DEFER = persona-class only; screen ships dar persona X considerata
  power-user-mode (documented decision Daniel)

**Iter 1 Mass Fix V2 status:** majoritatea screens PARTIAL — finding-uri
in clustere HIGH-ALFA, HIGH-BETA, HIGH-DELTA, HIGH-EPSILON. Zero FAIL.
Beta-gate ready dupa Wave 2 finalizare.
