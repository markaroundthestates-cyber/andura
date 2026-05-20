# Findings — Wave D Cont sub-screens (batch 9 LANDED + 4 MISSING)

**Screens:** 9 LANDED settings + 4 MISSING (themes/support/about/faq)
**Audit date:** 2026-05-20
**Strategy:** Batch sampled findings — settings screens follow consistent mockup pattern (sub-header + sections + form/list); prod implementations often have sticky-header + back-btn (PARTIAL cross-screen consistency cu SubHeader pattern — verify per screen)

---

## LANDED screens (9)

### settings-profile

- **Mockup:** Avatar 80x80 cu "D" initial + "Schimba initiala" link + Date personale (Nume/Varsta/Inaltime/Greutate info-rows) + Compozitie corporala (Talie/Gat/BF auto US Navy + manual override checkbox) + Tinte personale (Greutate tinta + Pana in month picker) + Confirma editare CTA
- **Prod:** `SettingsProfile.tsx` Phase 6 task_09 Big 6 edit using onboardingStore (sample only read first 50 LOC)
- **Likely findings:**
  - F-settings-profile-01 — Avatar initial wrong ("D" mockup vs computed user initial — verify Pass 2 deep read)
  - F-settings-profile-02 — Compozitie corporala section (BF auto US Navy) — verify present în prod
  - F-settings-profile-03 — Tinte personale section (greutate tinta + Pana in) — verify present
- **Estimated parity: 65%** (Big 6 edit Pass 6 LANDED suggests core present)

### settings-notifications

- **Mockup:** 3 sections (Antrenament cu 3 toggle rows / Coaching cu 2 toggle rows / Ore de liniste cu Nu deranja info-row) + intro "Alegi cand sa primesti imboldiri. Nimic intruziv."
- **Prod:** `SettingsNotifications.tsx` Phase 6 task_10 LANDED — sticky header back-btn ✓ + intro verbatim ✓ + settingsStore wire — depth TBD Pass 2
- **Likely findings:**
  - F-settings-notifications-01 — Section structure mockup 3 distinct (Antrenament/Coaching/Ore de liniste) vs prod TBD (verify section grouping)
  - F-settings-notifications-02 — Specific toggle labels TBD verify (Reamintire sesiune / Pauza intre seturi / Sarit sedinta / Mesaj zilnic 07:30 / Sumar saptamanal / Nu deranja 22-07)
- **Estimated parity: 60%** (cross-cutting Pattern 1 SubHeader honored ✓)

### settings-subscription

- **Mockup:** Centered empty-state cu sparkles icon 88x88 + h2 "In curand" + body "Lucram la planuri de abonament transparente. Pana atunci, totul e gratuit pentru utilizatorii beta." + Beta gratuit card cu gift icon + "Anunta-ma cand e gata" link
- **Prod:** `SettingsSubscription.tsx` — TBD Pass 2 verify
- **Likely findings:** TBD Pass 2
- **Estimated parity: 50% est**

### settings-appearance

- **Mockup:** Simple — intro + 1 row "Teme" → settings-themes ("Andura Clasic" current label + chevron)
- **Prod:** `SettingsAppearance.tsx` — TBD Pass 2 verify
- **Note:** settings-themes target IS MISSING în prod (per `_screen-mapping-matrix.md`)
- **Estimated parity: 40%** (themes sub-route missing breaks navigation)

### settings-prefs

- **Mockup:** Likely toggles for various preferences — TBD verify mockup body
- **Prod:** `SettingsPrefs.tsx` — TBD Pass 2 verify
- **Estimated parity: 50% est**

### settings-privacy

- **Mockup:** Privacy policy text long-form
- **Prod:** `SettingsPrivacy.tsx` — TBD verify
- **Estimated parity: 60% est** (text-heavy, easier to align)

### settings-terms

- **Mockup:** Terms of service text long-form
- **Prod:** `SettingsTerms.tsx` — TBD verify
- **Estimated parity: 60% est**

### settings-danger

- **Mockup:** Reset coach / Refa onboarding / Schimba faza manual / Iesi din cont / Sterge cont rows cu different colors brick = destructive
- **Prod:** `SettingsDanger.tsx` — TBD verify; confirm modals likely missing entire flow per Wave G analysis
- **Estimated parity: 50% est**

### settings-export

- **Mockup:** Export JSON button + format description
- **Prod:** `SettingsExport.tsx` — TBD verify
- **Estimated parity: 60% est**

---

## MISSING screens (4 — confirmed via _screen-mapping-matrix.md)

### settings-themes (MISSING)

- **Mockup:** Theme picker — Andura Clasic + alternatives (other 3 mockups exist: brain-coach / living-body / luxury)
- **Prod:** ABSENT — `SettingsAppearance.tsx` "Teme" row navigates somewhere but `SettingsThemes.tsx` doesn't exist
- **Severity:** HIGH (broken navigation)
- **Karpathy fix:** Add `SettingsThemes.tsx` + route + simple theme picker (1 theme available pre-Beta = "Andura Clasic" active + 3 others "In curand")
- **Beta blocker?** MED — if appearance has only 1 row leading nowhere, could remove row entirely as Wave 3 polish

### settings-support (MISSING)

- **Mockup:** Support contact + helper text — TBD verify mockup body
- **Prod:** ABSENT — Cont.tsx row has `target: undefined`
- **Severity:** HIGH (broken navigation from Cont)
- **Karpathy fix:** Add `SettingsSupport.tsx` + route + contact form / email link
- **Beta blocker?** YES — entire Ajutor section non-functional până aceste 4 land

### settings-about (MISSING)

- **Mockup:** About app — TBD verify body
- **Prod:** ABSENT
- **Severity:** HIGH
- **Karpathy fix:** Add `SettingsAbout.tsx` + route
- **Beta blocker?** YES per Pattern 7 Ajutor disabled

### settings-faq (MISSING)

- **Mockup:** FAQ list — TBD verify body
- **Prod:** ABSENT
- **Severity:** HIGH
- **Karpathy fix:** Add `SettingsFaq.tsx` + route + accordion list
- **Beta blocker?** YES per Pattern 7 Ajutor disabled

---

## Wave D summary

| Screen | Status | Findings est | Parity est |
|--------|--------|--------------|------------|
| settings-profile | LANDED | 3+ TBD Pass 2 | 65% |
| settings-notifications | LANDED | 2+ TBD | 60% |
| settings-subscription | LANDED | TBD | 50% |
| settings-appearance | LANDED | 1 (themes link broken) | 40% |
| settings-prefs | LANDED | TBD | 50% |
| settings-privacy | LANDED | TBD | 60% |
| settings-terms | LANDED | TBD | 60% |
| settings-danger | LANDED | TBD (confirm modals likely missing) | 50% |
| settings-export | LANDED | TBD | 60% |
| settings-themes | MISSING | 1 (entire route absent) | 0% |
| settings-support | MISSING | 1 | 0% |
| settings-about | MISSING | 1 | 0% |
| settings-faq | MISSING | 1 | 0% |

**Wave D mean parity (13 screens incl 4 MISSING zeros):** ~42%

**Major Wave D issues:**
1. **4 MISSING screens** = 4 broken navigation links from Cont (Pattern 7 F-cont-04 Ajutor disabled rows)
2. **Settings Pass 2 depth needed** — sampled sections look reasonable but per-section verification deferred
3. **Some prod screens HAVE SubHeader pattern** (SettingsNotifications confirmed) — Pattern 1 cross-screen inconsistency adjustment: PARTIAL adoption în Cont sub-screens, MISSING în Antrenor sub-screens
