# Findings — `screen-auth` (Wave A.2)

**Mockup ref:** `04-architecture/mockups/andura-clasic.html:422-482`
**Prod ref:** `src/react/routes/screens/Auth.tsx:1-133`
**Audit date:** 2026-05-20

## Findings

### F-auth-01 — Title TEXT divergence

- **Severity:** HIGH
- **Category:** Text
- **Mockup:** `Intra in cont` (h1 28px bold)
- **Prod:** `Autentificare` (h1 text-2xl semibold) — formal Romanian vs warm direct mockup
- **Mockup ref:** `andura-clasic.html:427`
- **Prod ref:** `Auth.tsx:53-55`
- **Karpathy fix:** Surgical Changes (text swap)
- **Fix effort:** S
- **Beta blocker?** YES — copy tone divergence (warm "Intra in cont" vs formal "Autentificare")

### F-auth-02 — Subtitle TEXT divergence

- **Severity:** HIGH
- **Category:** Text
- **Mockup:** `Un tap cu Google. Fara parola, fara link pe email.` (positioning: anti-friction)
- **Prod:** `Iti trimitem un link pe email. Tap-il sa intri în cont.` (literal description)
- **Mockup ref:** `andura-clasic.html:428`
- **Prod ref:** `Auth.tsx:56-58`
- **Karpathy fix:** Surgical (but requires Google OAuth integration first — see F-auth-03)
- **Fix effort:** S
- **Beta blocker?** YES — mockup positions Google as primary path; prod copy assumes Magic Link only

### F-auth-03 — Google OAuth button COMPLETELY MISSING

- **Severity:** CRIT
- **Category:** Component
- **Mockup:** Primary CTA "Continua cu Google" cu Google SVG icon, brick background — PRIMARY auth path per Daniel directive 2026-05-11 §10
- **Prod:** ABSENT — only Magic Link email form present
- **Mockup ref:** `andura-clasic.html:433-437`
- **Prod ref:** `Auth.tsx:60-128` (no Google button anywhere)
- **Karpathy fix:** Think Before Coding (Google OAuth integration via Firebase Auth) + Goal-Driven (Beta blocker per Daniel directive)
- **Fix effort:** L — backend integration (`src/auth.js` `signInWithIdp` Google OAuth helper exists per code I saw earlier at line 142 region BUT no React wiring); requires Firebase Console Google OAuth Client ID config Daniel-action + frontend button + callback handler
- **Beta blocker?** YES — Daniel directive 2026-05-11 §10 explicit "Google primary (brick, one-tap). Email secondary."

### F-auth-04 — Skip-auth ("Continua fara cont") MISSING

- **Severity:** CRIT
- **Category:** Component
- **Mockup:** Tertiary CTA `Continua fara cont` ghost button + risk note `Datele se salveaza doar pe acest dispozitiv. Risti sa le pierzi (telefon resetat, browser cache sters, app reinstalat).`
- **Prod:** ABSENT — no skip-auth path
- **Mockup ref:** `andura-clasic.html:458-464`
- **Prod ref:** `Auth.tsx` (no skip option)
- **Karpathy fix:** Think Before Coding (anonymous user flow requires localStorage-only data path + warning UX)
- **Fix effort:** M (frontend only — store has anon flag concept already per detectAnonymousLocalData helper)
- **Beta blocker?** YES per Daniel directive 2026-05-11 §10 — skip-auth path explicit în mockup as risk-noted option

### F-auth-05 — Back button MISSING

- **Severity:** HIGH
- **Category:** Component
- **Mockup:** Back button (arrow-left + "Inapoi") at top, navigates back to splash
- **Prod:** ABSENT — no back navigation from /auth
- **Mockup ref:** `andura-clasic.html:423-425`
- **Prod ref:** `Auth.tsx:48-52` (no back button)
- **Karpathy fix:** Surgical (add `<button onClick={() => navigate(-1)}>` w/ arrow-left Lucide)
- **Fix effort:** S
- **Beta blocker?** YES — UX dead-end. User landing /auth can't go back to /splash without browser back.

### F-auth-06 — "sau" separator dividers MISSING

- **Severity:** MED
- **Category:** Component
- **Mockup:** 2× `<div>` rows cu `sau` separator (line dividers between Google / Email / Skip) — visual rhythm
- **Prod:** ABSENT (only single Email path, no need pentru separators)
- **Mockup ref:** `andura-clasic.html:439-443, 452-456`
- **Prod ref:** `Auth.tsx` (none)
- **Karpathy fix:** Adds with F-auth-03 + F-auth-04
- **Fix effort:** S (with above)
- **Beta blocker?** Depends on F-auth-03 + F-auth-04 LANDING — if added, separators appear

### F-auth-07 — Terms acceptance footer MISSING

- **Severity:** HIGH
- **Category:** Text + Component
- **Mockup:** Footer `Continuand accepti <u>Termenii</u> si <u>Confidentialitatea</u>. Nu folosim datele tale pentru reclame.` (legal compliance + privacy positioning)
- **Prod:** ABSENT
- **Mockup ref:** `andura-clasic.html:478-481`
- **Prod ref:** `Auth.tsx` (no footer)
- **Karpathy fix:** Surgical (add `<p>` footer w/ links to /app/cont/settings-terms + /app/cont/settings-privacy)
- **Fix effort:** S
- **Beta blocker?** YES — legal compliance Romanian consent + privacy positioning required pre-Beta launch

### F-auth-08 — Email input field structure divergence

- **Severity:** MED
- **Category:** Component
- **Mockup:** `<label>` cu nested `<span>` label "Email (primesti un link)" + `<input>` placeholder "numele.tau@email.ro" + default value pre-filled "daniel@andura.ro" (mock demo)
- **Prod:** Separate `<label htmlFor>` + `<input>` (semantic OK) BUT label = "Email" (drops "primesti un link" hint), placeholder "numele@email.com" (drops .ro localization), no default value (OK pentru prod, mockup default = demo only)
- **Mockup ref:** `andura-clasic.html:445-449`
- **Prod ref:** `Auth.tsx:81-99`
- **Karpathy fix:** Surgical (label text + placeholder localization)
- **Fix effort:** S
- **Beta blocker?** NO (Wave 2 — but localization .ro hint nice-to-have Romanian users)

### F-auth-09 — Send button TEXT slightly off

- **Severity:** LOW
- **Category:** Text
- **Mockup:** `Trimite link de intrare` (ghost button after email input)
- **Prod:** `Trimite link` / `Se trimite…` (loading)
- **Mockup ref:** `andura-clasic.html:450`
- **Prod ref:** `Auth.tsx:107`
- **Karpathy fix:** Surgical (text swap)
- **Fix effort:** S
- **Beta blocker?** NO (Wave 3 polish — concept same, wording shorter prod)

### F-auth-10 — Magic Link confirmation UI different

- **Severity:** MED
- **Category:** Component + Text
- **Mockup:** `auth-pending` block: 64px circle paper-2 background + mail icon brick + "Verifica emailul" + "Ti-am trimis linkul pe <b>email</b>. Deschide-l de pe acest telefon." + ghost "Folosesc linkul (demo)" CTA
- **Prod:** Mail icon w-10 h-10 brick + "Link trimis" + "Verifica casuta {email}. Linkul expira in 15 min." + "Schimba emailul" back button
- **Mockup ref:** `andura-clasic.html:467-476`
- **Prod ref:** `Auth.tsx:60-78`
- **Karpathy fix:** Surgical (text + icon size align)
- **Fix effort:** S
- **Beta blocker?** YES — copy nuances ("Verifica emailul" warm vs "Link trimis" terse) + missing "Deschide-l de pe acest telefon" hint (Magic Link UX requirement — link must open în same browser session)

### F-auth-11 — Mock login dev-only button (prod-extra NOT în mockup)

- **Severity:** NIT
- **Category:** Component
- **Mockup:** ABSENT (no mock login)
- **Prod:** "Mock login (dev only)" button (gated `import.meta.env.DEV`) — prod won't show this
- **Mockup ref:** N/A
- **Prod ref:** `Auth.tsx:118-127` (DEV-only)
- **Karpathy fix:** N/A — intentional dev affordance, gated correctly
- **Fix effort:** N/A
- **Beta blocker?** NO — won't ship în prod build

## Severity totals

| Severity | Count |
|----------|-------|
| CRIT | 2 (F-auth-03 Google OAuth missing, F-auth-04 skip-auth missing) |
| HIGH | 4 (F-auth-01 title text, F-auth-02 subtitle text, F-auth-05 back missing, F-auth-07 terms footer missing) |
| MED | 3 (F-auth-06 separators, F-auth-08 input structure, F-auth-10 confirmation UI) |
| LOW | 1 (F-auth-09 send button text) |
| NIT | 1 (F-auth-11 mock dev button) |

**Total: 11 findings on Auth screen.**

## Parity weighted score

- Layout: 70% (back button absent, footer absent)
- Text: 40% (title + subtitle + footer divergences strong)
- Components: 35% (Google + skip + back + terms footer absent = 4 components / 9 missing, 5/9 present)
- Tokens: 80% (button styles/colors OK)
- Behavior: 50% (Magic Link works but no Google, no skip, no back)

**Auth weighted parity:** 0.70 × 0.20 + 0.40 × 0.25 + 0.35 × 0.30 + 0.80 × 0.15 + 0.50 × 0.10
- = 0.14 + 0.10 + 0.105 + 0.12 + 0.05
- **= 51.5% Auth parity** (lower than Splash due to 2 CRIT entire-component-missing findings)
