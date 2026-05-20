# Findings — `screen-antrenor` (Wave A.3 — main tab Index)

**Mockup ref:** `04-architecture/mockups/andura-clasic.html:731-875`
**Prod ref:** `src/react/routes/screens/antrenor/Antrenor.tsx:1-146`
**Audit date:** 2026-05-20

## Findings

### F-antrenor-01 — Header date+time MISSING ("Joi, 7 mai · 18:30")

- **Severity:** HIGH
- **Category:** Component + Text
- **Mockup:** Top line `Joi, 7 mai · 18:30` (small-text ink-3) — temporal context for user orientation
- **Prod:** ABSENT (Antrenor.tsx jumps straight to h1)
- **Mockup ref:** `andura-clasic.html:733`
- **Prod ref:** `Antrenor.tsx:101`
- **Karpathy fix:** Surgical (`new Date()` formatted Romanian locale "ro-RO" weekday + month + 24h time)
- **Fix effort:** S
- **Beta blocker?** YES — temporal context = product personality. "Acum 18:30 joi" feels intimate vs sterile "Antrenor" alone.

### F-antrenor-02 — Subtitle "Cine te ghideaza in sala." MISSING

- **Severity:** HIGH
- **Category:** Text
- **Mockup:** `<div class="coach-quote">Cine te ghideaza in sala.</div>` (italic Lora-ish tagline)
- **Prod:** ABSENT
- **Mockup ref:** `andura-clasic.html:735`
- **Prod ref:** `Antrenor.tsx:101` (h1 alone)
- **Karpathy fix:** Surgical (add `<p className="italic text-sm text-ink2">` below h1)
- **Beta blocker?** YES — coach tagline framing entire screen ("your guide în the gym") = anti-paternalism positioning per Daniel directive

### F-antrenor-03 — "Obiectiv / Programe" 6-row selector COMPLETELY MISSING

- **Severity:** CRIT
- **Category:** Component
- **Mockup:** Section `📋 Obiectiv` cu 6 program rows (Auto / Forta / Masa musculara / Slabire / Mentenanta / Longevitate · Sanatate) — each `.settings-row.program-row` cu icon Lucide + title + sub-text + ALES badge — **Daniel reglaj post-Gigel-test 2026-05-11 explicit "6 obiective V1 LOCK"**
- **Prod:** ABSENT entirely — no program selector în Antrenor.tsx. Likely deferred to Cont/Settings (settings-profile?) — but mockup INTENT was Antrenor home for one-tap goal swap visibility
- **Mockup ref:** `andura-clasic.html:861-870`
- **Prod ref:** `Antrenor.tsx` (no programs section)
- **Karpathy fix:** Think Before Coding (decide: keep în Antrenor per mockup OR document deviation rationale + Daniel approval); Goal-Driven (6 programs visible drives goal-swap engagement)
- **Fix effort:** M (component build + store wire to coach engine program slot)
- **Beta blocker?** YES — explicit mockup feature, explicit Daniel reglaj. Drift from intent = visible "30% mockup parity" Daniel observation evidence.

### F-antrenor-04 — Coach Deload card variant (3rd state) MISSING

- **Severity:** HIGH
- **Category:** Component
- **Mockup:** 3rd variant `#coach-deload-card` cu cream warm background + leaf icon + "Saptamana asta = recuperare" + Israetel deload rationale (-40% volume) + "OK, inteleg" acknowledgment CTA
- **Prod:** Only 2 variants (CoachTodayCard | CoachRestCard via `schedContext === 'workout'` ternary). Deload variant ABSENT
- **Mockup ref:** `andura-clasic.html:773-778`
- **Prod ref:** `Antrenor.tsx:122-126`
- **Karpathy fix:** Surgical (add CoachDeloadCard component + 3-way switch on schedContext: 'workout' | 'rest' | 'deload')
- **Fix effort:** M (new component + store deload state propagation from mesocycle engine)
- **Beta blocker?** YES — deload week = real periodization signal, dropping it loses user trust during planned recovery weeks (engine plans deload, UI doesn't surface = confusion "why no workout this week?")

### F-antrenor-05 — Coach reflectie post-session block MISSING

- **Severity:** MED
- **Category:** Component
- **Mockup:** Hidden block `<div id="coach-reflectie">` — populated post finishSession cu persona-aware reflection
- **Prod:** ABSENT
- **Mockup ref:** `andura-clasic.html:824-825`
- **Prod ref:** `Antrenor.tsx` (no equivalent)
- **Karpathy fix:** Surgical (read coach reflection from store post-session, render conditionally)
- **Fix effort:** S
- **Beta blocker?** NO (Wave 2 — feedback loop nice but not critical Beta)

### F-antrenor-06 — Title font-size + subtitle missing change scale

- **Severity:** MED
- **Category:** Token
- **Mockup:** Title `font-size:26px; font-weight:700; letter-spacing:-0.02em` (line 734)
- **Prod:** `text-2xl` (= 24px) `font-semibold` (= 600 NOT 700)
- **Mockup ref:** `andura-clasic.html:734`
- **Prod ref:** `Antrenor.tsx:101`
- **Karpathy fix:** Surgical (`text-[26px] font-bold tracking-tight`)
- **Fix effort:** S
- **Beta blocker?** NO (Wave 2)

### F-antrenor-07 — Component stack ORDER + content DIVERGENT (prod adds 6 NEW components NOT în mockup)

- **Severity:** HIGH
- **Category:** Component + Layout
- **Mockup stack (top-to-bottom):**
  1. Date + h1 + subtitle
  2. Coach Today card (3 variants)
  3. (Hidden: Resume + Reactivate + Reflectie)
  4. Calendar week 7-day
  5. **Programe (Obiectiv) 6 rows**
- **Prod stack (top-to-bottom):**
  1. h1 only (no date no subtitle)
  2. ResumeSessionCard (conditional)
  3. ReactivateCard (conditional)
  4. **PatternsBanner (NEW Phase 6)**
  5. **AlertsBanner (NEW Phase 6)**
  6. CoachTodayCard | CoachRestCard (2 variants only — no deload)
  7. Calendar7Day
  8. **StatsGrid 3-cell streak/fatigue/readiness (NEW)**
  9. **ReadinessVerdict (NEW F4)**
  10. **PRNotificationBanner (NEW F11)**
  11. **PRWallRecent (NEW Phase 6)**
  12. "Incepe antrenament" CTA (separate from CoachTodayCard)
- **Mockup ref:** `andura-clasic.html:731-875` full screen
- **Prod ref:** `Antrenor.tsx:95-144`
- **Karpathy fix:** Think Before Coding (6 NEW prod components either: (a) Daniel-approved Phase 6 extensions = OK, document în mockup as future v1.1 OR (b) drift = remove)
- **Fix effort:** L (audit + Daniel decision per component: PatternsBanner, AlertsBanner, StatsGrid, ReadinessVerdict, PRNotificationBanner, PRWallRecent)
- **Beta blocker?** YES — UI surface ≠ mockup intent. Daniel screened mockup vs prod = sees discrepancy ("30% mockup parity")

### F-antrenor-08 — "Incepe sesiunea" CTA label divergence + location

- **Severity:** MED
- **Category:** Text + Layout
- **Mockup:** CTA `Incepe sesiunea →` INSIDE CoachTodayCard (line 752), context = "this workout, start now"
- **Prod:** CTA `Incepe antrenament` SEPARATE bottom-of-page button (line 141), generic
- **Mockup ref:** `andura-clasic.html:752`
- **Prod ref:** `Antrenor.tsx:138-141`
- **Karpathy fix:** Surgical (move CTA inside CoachTodayCard + text swap "sesiunea" + arrow)
- **Fix effort:** S (text) to M (layout move if CoachTodayCard is shared component)
- **Beta blocker?** YES — UX flow integration: CTA în card = "start THIS workout"; separate CTA = ambiguous (which workout?)

### F-antrenor-09 — "Vrei altceva azi?" override link MISSING in main flow

- **Severity:** MED
- **Category:** Component
- **Mockup:** Below CTA: `<a>Vrei altceva azi? →</a>` opens scheduleOverride
- **Prod:** May be în CoachTodayCard component (not visible în main Antrenor.tsx); needs Pass 2 component-level verify
- **Mockup ref:** `andura-clasic.html:754`
- **Prod ref:** `Antrenor.tsx` (delegated to CoachTodayCard component)
- **Karpathy fix:** Verify (Pass 2 CoachTodayCard inspection)
- **Fix effort:** TBD
- **Beta blocker?** TBD pending Pass 2

### F-antrenor-10 — "(REMOVED) Acces rapid + Ceva nu merge" — Daniel reglaj 2026-05-12 LANDED prod-side correctly

- **Severity:** NIT
- **Category:** Process
- **Mockup:** Line 872-873 comment notes "(REMOVED 2026-05-12 Slice 1.7) Acces rapid section + Ceva nu merge button relocated to Cont/Ajutor per Daniel push-back"
- **Prod:** Antrenor.tsx correctly DOES NOT have these — Daniel reglaj honored
- **Mockup ref:** `andura-clasic.html:872-873`
- **Prod ref:** `Antrenor.tsx` (correctly absent)
- **Karpathy fix:** N/A (compliance verified)
- **Beta blocker?** N/A — this is intentional removal, NU finding

### F-antrenor-11 — Phase 6 prod additions distribution: Daniel-approved per D027 OR drift?

- **Severity:** META (cross-cutting)
- **Category:** Process / Scope
- **Mockup:** Stable visual surface per Daniel reglaj 2026-05-11/12
- **Prod:** Added PatternsBanner + AlertsBanner + StatsGrid + ReadinessVerdict + PRNotificationBanner + PRWallRecent în Phase 6 per `DECISIONS.md §D027`. Code comments cite `Phase 6 task_06 Option B Bugatti enrich`
- **Karpathy fix:** Daniel review — keep prod additions (UI engagement value) and amend mockup AS NEW VERSION cu v1.1 spec OR remove prod additions to converge mockup
- **Beta blocker?** YES per Daniel CEO decision — current prod ≠ mockup baseline parity

## Severity totals

| Severity | Count |
|----------|-------|
| CRIT | 1 (F-antrenor-03 Obiectiv/Programe section missing entirely) |
| HIGH | 5 (F-01 date, F-02 subtitle, F-04 deload variant, F-07 component stack divergence, F-08 CTA inside card) |
| MED | 4 (F-05 reflectie, F-06 title font, F-09 override link verify, F-11 Phase 6 additions) |
| LOW | 0 |
| NIT | 1 (F-10 Daniel reglaj LANDED correctly) |

**Total: 11 findings on Antrenor screen.**

## Parity weighted score

- Layout: 50% (component stack ORDER divergent + CTA position divergent + deload variant absent)
- Text: 50% (date + subtitle missing + CTA text + Obiectiv section absent counts as text gap)
- Components: 35% (1 CRIT entire section missing + 6 prod-extra unverified + deload variant missing; ~9/13 mockup components present în some form)
- Tokens: 75% (font/colors mostly OK)
- Behavior: 60% (resume + reactivate flows present, deload missing, 3-way variant absent)

**Antrenor weighted parity:** 0.50 × 0.20 + 0.50 × 0.25 + 0.35 × 0.30 + 0.75 × 0.15 + 0.60 × 0.10
- = 0.10 + 0.125 + 0.105 + 0.1125 + 0.06
- **= 50.25% Antrenor parity** (CRIT Obiectiv/Programe miss heavy contribution)

## Verify pending (Pass 2 component-level)

- `components/Antrenor/CoachTodayCard.tsx` — does it preserve mockup CTA inside-card + override link + ink+brick gradient + duration/exercise chips + WHY italic Lora quote + LAGGING extension?
- `components/Antrenor/CoachRestCard.tsx` — cream background + leaf/moon icon + "Sesiune usoara mobilitate" CTA + "Vreau totusi antrenament" override link?
- `components/Calendar7Day.tsx` — L M M J V S D 7 days + selected state + pencil edit toggle + "Program de antrenament" title centered?
- `components/Antrenor/PatternsBanner.tsx` — STAGNATION + LOW_ADHERENCE — Daniel-approved Phase 6 OR drift?
- `components/Antrenor/AlertsBanner.tsx` — proactive engine wrap — same question
- `components/Antrenor/StatsGrid.tsx` — streak / fatigue / readiness 3-cell — same question
- Similar pentru ReadinessVerdict + PRNotificationBanner + PRWallRecent
