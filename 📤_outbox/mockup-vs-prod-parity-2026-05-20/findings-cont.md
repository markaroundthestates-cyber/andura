# Findings — `screen-settings` (Cont) (Wave A.6)

**Mockup ref:** `04-architecture/mockups/andura-clasic.html:1839-1895`
**Prod ref:** `src/react/routes/screens/cont/Cont.tsx:1-141`
**Audit date:** 2026-05-20

## Findings

### F-cont-01 — Account avatar initial wrong ("A" generic vs "D" user initial)

- **Severity:** HIGH
- **Category:** Component + Behavior
- **Mockup:** Avatar shows `D` (user's first letter — Daniel example)
- **Prod:** Avatar hardcoded `A` (literal letter A, NOT computed from user name)
- **Mockup ref:** `andura-clasic.html:1845`
- **Prod ref:** `Cont.tsx:99-101`
- **Karpathy fix:** Surgical (read user name from authStore/profileStore, take `[0]`)
- **Fix effort:** S
- **Beta blocker?** YES — first-look immediately wrong; user "Daniel" sees "A" în profile = broken trust

### F-cont-02 — Account name "Utilizator" generic vs real user name

- **Severity:** HIGH
- **Category:** Text + Behavior
- **Mockup:** `Daniel` (actual user name displayed)
- **Prod:** `Utilizator` (generic Romanian placeholder)
- **Mockup ref:** `andura-clasic.html:1847`
- **Prod ref:** `Cont.tsx:103`
- **Karpathy fix:** Surgical (read from authStore/profileStore user name)
- **Fix effort:** S
- **Beta blocker?** YES — same as F-cont-01

### F-cont-03 — Account email placeholder "Profilul tau Andura" vs real email

- **Severity:** HIGH
- **Category:** Text + Behavior
- **Mockup:** Real user email displayed (truncate ellipsis if long)
- **Prod:** `Profilul tau Andura` (descriptive placeholder, NOT email)
- **Mockup ref:** `andura-clasic.html:1848`
- **Prod ref:** `Cont.tsx:104`
- **Karpathy fix:** Surgical (read from authStore email, format truncate)
- **Fix effort:** S
- **Beta blocker?** YES

### F-cont-04 — 4 "Ajutor" section rows DISABLED (no navigation target)

- **Severity:** CRIT
- **Category:** Behavior + Component
- **Mockup:** All 4 Ajutor rows clickable: `Suport / Ceva nu merge / Despre Andura / FAQ` navigate to respective screens
- **Prod:** All 4 rows have `target: undefined` (`Cont.tsx:76-82`) — `handleRowClick` does nothing if target undefined + button disabled styling (`disabled:opacity-50 disabled:cursor-not-allowed` line 126)
- **Mockup ref:** `andura-clasic.html:1883-1889`
- **Prod ref:** `Cont.tsx:76-82, 124-126`
- **Karpathy fix:** Goal-Driven (4 sub-screens missing) — need to ADD `settings-support` + `settings-about` + `settings-faq` components + routes + targets în SECTIONS array; `ceva-nu-merge` exists as Antrenor sub-route — wire target to it
- **Fix effort:** L (3 new components + routes + wire)
- **Beta blocker?** YES — entire Ajutor section non-functional; broken navigation lasts impression

### F-cont-05 — "Aparate lipsa" row în General section DISABLED (no target)

- **Severity:** HIGH
- **Category:** Behavior
- **Mockup:** `Aparate lipsa` clickable → goto('aparate-lipsa') (sub-screen exists at `/app/antrenor/aparate-lipsa`)
- **Prod:** Row has `target: undefined` (line 57) — disabled
- **Mockup ref:** `andura-clasic.html:1864`
- **Prod ref:** `Cont.tsx:57`
- **Karpathy fix:** Surgical (`target: 'aparate-lipsa'` to navigate via gotoPath — assumes navigation map has this; otherwise crosspath `/app/antrenor/aparate-lipsa`)
- **Fix effort:** S
- **Beta blocker?** YES — settings drift; user expects this to work

### F-cont-06 — Section heading style divergence (uppercase + tracking)

- **Severity:** LOW
- **Category:** Token
- **Mockup:** `.settings-section` class — typically uppercase semibold cu letter-spacing (CSS-defined)
- **Prod:** `text-xs uppercase tracking-wide font-semibold mb-2` (matches but danger color uses brick instead of mockup style)
- **Mockup ref:** `andura-clasic.html:1853, 1861, 1869, 1877, 1883`
- **Prod ref:** `Cont.tsx:111`
- **Karpathy fix:** Verify token alignment (mostly OK)
- **Beta blocker?** NO (Wave 3)

### F-cont-07 — Account card avatar dimensions divergence (52→48px)

- **Severity:** LOW
- **Category:** Token
- **Mockup:** Avatar 52x52 rounded-50% font-size 22
- **Prod:** `w-12 h-12` (48px) rounded-full text-xl (20px)
- **Mockup ref:** `andura-clasic.html:1845`
- **Prod ref:** `Cont.tsx:99`
- **Karpathy fix:** Surgical (w-[52px] h-[52px] text-[22px])
- **Beta blocker?** NO (Wave 3 — barely 4px difference)

### F-cont-08 — Title font-size divergence (24→24px close OK but font-weight)

- **Severity:** LOW
- **Category:** Token
- **Mockup:** `font-size:24px; font-weight:700;` (line 1841)
- **Prod:** `text-2xl` (24px) `font-semibold` (600 NOT 700)
- **Mockup ref:** `andura-clasic.html:1841`
- **Prod ref:** `Cont.tsx:92`
- **Karpathy fix:** Surgical (`font-bold` not `font-semibold`)
- **Beta blocker?** NO (Wave 3)

### F-cont-09 — Section structure 100% LANDED ✓

- **Severity:** OK (positive finding)
- **Mockup:** 5 sections (Cont / General / Date & confidentialitate / Deconectare/Stergere / Ajutor) cu row labels exact
- **Prod:** `Cont.tsx:44-83` SECTIONS array verbatim copy from mockup per comment "Mockup verbatim copy andura-clasic.html#L1839-1888"
- **Mockup ref:** `andura-clasic.html:1853-1888`
- **Prod ref:** `Cont.tsx:43-83`
- **Karpathy attribution:** Surgical Changes done well (mockup verbatim preservation)
- **Beta blocker?** N/A — compliance positive

### F-cont-10 — Footer "Andura v1.0.0" LANDED ✓

- **Severity:** OK (positive finding)
- **Mockup:** `Andura v1.0.0` footer small-text centered
- **Prod:** `Andura v1.0.0` text-xs text-ink2 centered ✓
- **Mockup ref:** `andura-clasic.html:1891-1893`
- **Prod ref:** `Cont.tsx:138`
- **Karpathy:** Surgical preserved
- **Beta blocker?** N/A — compliance positive

## Severity totals

| Severity | Count |
|----------|-------|
| CRIT | 1 (F-04 Ajutor 4-rows disabled) |
| HIGH | 4 (F-01 avatar initial, F-02 user name, F-03 email, F-05 Aparate lipsa target) |
| MED | 0 |
| LOW | 3 (F-06 section heading, F-07 avatar size, F-08 title weight) |
| NIT | 0 |
| OK | 2 (F-09 section structure, F-10 footer) |

**Total: 8 findings (excluding OK positives).**

## Parity weighted score

- Layout: 90% (5 sections + account card + footer all present)
- Text: 75% (verbatim mockup copy for sections + footer OK; account card text wrong = -25%)
- Components: 70% (5 sections + account card + footer ALL present; but 5 row targets undefined disabled = behavior gap reflected în Behavior dimension)
- Tokens: 80% (size/weight minor drift)
- Behavior: 40% (5 rows disabled out of ~13 actionable rows = 40% navigation broken; account card placeholders)

**Cont weighted parity:** 0.90 × 0.20 + 0.75 × 0.25 + 0.70 × 0.30 + 0.80 × 0.15 + 0.40 × 0.10
- = 0.18 + 0.1875 + 0.21 + 0.12 + 0.04
- **= 73.75% Cont parity** (highest Wave A so far — sections structure preserved well)
