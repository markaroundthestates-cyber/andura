---
title: HANDOVER 2026-06-01 — overnight arc (domenii + email + design regression)
date: 2026-06-01 05:00 EEST
author: Claude chat (Co-CTO) → next CC
status: handover complet pentru preluare
---

# HANDOVER — noaptea 2026-05-31 → 2026-06-01

Daniel a mers până la 5 dimineața. Arc lung: pornit 2 domenii live + reparat email magic-link + reparat o regresie vizuală mare pe app. Vrea să doarmă; preia alt CC autonom. Mai jos = tot ce contează, verificat cu git/teste, nu din memorie.

## §0 STATUS INSTANT (verde)
- **main == origin/main** la `f84ee4a2`, **0 ahead**, tree curat pe src.
- **5754 teste PASS local + tsc clean** (HEAD actual). NOTĂ: CI GitHub #682 era roșu pe un commit ANTERIOR — HEAD-ul de acum e verde local; verifică următorul run CI după push-ul de noaptea asta.
- Deploy GitHub Pages declanșat automat de push (~2-3 min) → fix-ul vizual ajunge live pe andura.app.

## §1 CE S-A LIVRAT (toate pe origin/main, PUSHED)

### Domenii + site
- **andura.org + www.andura.org LIVE cu HTTPS** — site cinematic (repo SEPARAT `markaroundthestates-cyber/andura-site`, clonat local `C:\Users\Daniel\Documents\andura-site`). Host = **Cloudflare Pages** (plan Free $0). DNS mutat la Cloudflare (nameservere owen+paislee), domeniul rămâne înregistrat Namecheap. Verificat live (HTTPS, 9 video, 0 console errors).
- Site = `index.html` (fost Andura-Film.html) + media. 3 placeholdere rămase: Google Play link (`#` până e app pe store), social links footer, form beta = mailto support@. SEO de optimizat ulterior (Daniel a zis).

### Email magic-link (REPARAT — era stricat)
- **Cauza reală:** API key SendGrid din parola SMTP Firebase = EXPIRAT/REVOCAT → 535 auth fail → mailul murea înainte de SendGrid (Activity gol). NU era typo/sender/DNS.
- **Fix (Daniel + extensia Chrome):** API key SendGrid nou → pus în Firebase → Auth → Templates → SMTP password (user rămâne `apikey`). **MERGE acum.**
- Stack documentat în memory `reference_andura_email_stack.md`. Sender = `support@andura.app` (2P), Domain Auth SendGrid pe `em4980.andura.app`, forwarding Namecheap support@+suport@ → maziludanielconstantin90@gmail.com.

### App fixes pushed (origin/main)
- `b777e288` coach skill-gate — începătorul NU mai primește flotări 1-mână / variante avansate (schema `skill_level` + 55 ex taguite advanced + filtru sessionBuilder).
- `20eadcf6` coach BUG1 rating "grea" → ține greutatea (NU mai forțează progresia) + typo `suport@`→`support@` aliniat.
- `226786bf` aurora scrim slăbit pe dark.
- `596ce9ee` bandă goală deasupra bottom-nav (bridge-fade global.css).
- `f84ee4a2` **REGRESIA VIZUALĂ — cauza-mamă:** `bg-paper` opac pe rădăcina `<section>` a celor 4 taburi (Antrenor/Progres/Istoric/Cont) picta negru peste AuroraBackground (z-0, ecranele-s în `<main z-10>`). Rezultat: aurora Turbo invizibilă + bandă moartă pe TOATE taburile. Fix = scos `bg-paper` de pe cele 4 rădăcini (shell-ul Layout.tsx are deja bg-paper bază). Diagnosticat independent de claude-design + grep in-repo. `bg-paper` intern (chips/toggles) lăsat intact.

### Earlier overnight (deja pushed sesiunea trecută, pe origin)
Nutriție goal-driven + podea 1000F/1200M (D097), streak+fatigue scoase de pe Coach, Google login (verificat end-to-end live), onboarding-restore `cfe7447b`, FCM config real, Privacy+T&C GDPR + PIA draft (`4b6a5ba6`).

## §2 BUG-URI DESCHISE (reale, nereparate — pentru next CC)
1. **Onboarding la re-login NU e complet reparat.** Daniel a reprodus LIVE: Google login → sesiune → logout → Google login → **onboarding apare iar** (pre-populat cu datele vechi, dar tot te bagă prin el). Fix-ul `cfe7447b` repară jumate (datele revin din cloud) dar nu BARIERA (`completed` nu se ridică înainte de rutare = race). Auditul de date (vezi §3) a numit asta Gap C: restore-ul nu e AWAIT-uit înainte de navigate (`AuthCallback.tsx:48,79`). **De atacat: gate-ul de onboarding să aștepte restore-ul cloud înainte să decidă.**
2. **Coach 10×60** — wire-ul rating→greutate e în `20eadcf6` dar NEVERIFICAT live că ține efectiv. De smoke-uit.
3. **CI #682 roșu** pe commit anterior — HEAD verde local, dar verifică următorul run CI real.
4. **Daniel bănuiește** că "ceva s-a buguit la limita de context + reluare" (3:30am) — onboarding + regresia vizuală au apărut în aceeași fereastră. Regresia vizuală = REZOLVATĂ (bg-paper). Onboarding = încă deschis. Merită verificat dacă commit-urile de după-limită (`b777e288`, `20eadcf6` — bundle cules manual din WIP necommis) au lăsat altceva.

## §3 GAP DATE (audit read-only, doar 1 real)
Auditul logout→re-login→restore: **datele importante NU se pierd** (sesiuni, greutate, profil, nutriție, PR-uri = toate cloud-backed + restaurate). UN gol real: **coach-decisions >30 zile** (arhivate doar în IndexedDB Tier-1, NU în cloud backup) se pierd la logout (`dataReset.js:89` șterge IDB namespace, `firebase.js` n-are sync IDB). Valoare mică (date derivate de motor, nu loguri user), dar real. Fix = include Tier-1 IDB în backup cloud SAU skip IDB delete la logout.

## §4 GATE-URI DANIEL-SIDE (în coadă)
- Play Console: verificare identitate în curs (câteva zile), owner email maziludaniel (schimbabil după).
- Rotit cheia API Anthropic (zicea "revert mâine").
- SEO andura.org de optimizat.
- Spec-uri design noi "variantă agresivă" — Daniel le face, le aplic eu după.

## §5 CROSS-REFS
- Memory: `reference_andura_email_stack.md`, `feedback_always_present_delegate.md`, `feedback_no_fabricated_agent_reports.md`, `feedback_no_denied_bash_with_mcp.md`
- `📥_inbox/PRIVACY-PIA-andura-2026-05-31.md` (DPIA draft)
- CHAT_STATE.md + PRIMER §5 (de actualizat de next CC dacă preia)

---
🦦 **Push complet, app fix vizual aterizat, email reparat, 2 domenii live. Daniel doarme. Dimineață: verifică deploy live = aurora vizibilă pe taburi + atacă bug-ul onboarding re-login (race restore→gate).**
