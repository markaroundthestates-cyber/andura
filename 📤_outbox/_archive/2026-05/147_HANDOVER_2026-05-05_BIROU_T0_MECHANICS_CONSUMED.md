# HANDOVER — 2026-05-05 birou (chat strategic T0 mechanics + auth-required pivot)

**Scope:** Chat strategic biroul Daniel (Codespaces). Pivot major auth strategy + spec complete T0 mechanics 75 decizii LOCKED V1 cumulative 4 batches + amendment Big 5 → Big 6.

---

## Cum a început

Daniel a deschis cu îngrijorare strategică spontană: *"nu stiu cat e de ok ca gigel sa aibe access la aplicatie fara sa se logheze clar..."*. Pattern actual era auth-banner-soft (Anonymous preserve indefinit, auth optional post-T0). Eu am clarificat status §56 LOCKED + Phase 1 LANDED commit `0880641`, apoi am întrebat ce-l roade specific (privacy/data loss/cross-device sync/trust signal/abuse/engagement).

Daniel a răspuns precis: **"cum se adapteaza engine la el pe 1-2-3 deviceuri daca nu are date trecute... iar cu login... avem oare cum sa facem optiunea de login with google?"**. 

Două puncte legitime: (1) Anonymous = device-locked mecanic (per ADR 021 reconciliation, sync presupune UID), (2) Google OAuth deja LANDED în `src/auth.js` (`signInWithGoogleIdToken` + `buildGoogleSignInUrl`), doar Phase 2 wiring UI lipsește. I-am explicat ambele.

Apoi Daniel pivotul critic: **"in beta cat si dupa, noi ca sa imbunatatim tot, avem nevoie de datele alea nu?"**. ASTA a fost argumentul cel mai puternic — fără auth, ZERO Firestore writes, ZERO cohort ML, engine învață în vid. Pattern actual auth-banner-soft sacrifică tocmai feedback loop-ul Bugatti improvement.

## Decizia LOCKED majoră

Daniel: "auth req". Scurt și final.

**Auth-required post-T0 LOCKED V1.** Anonymous = doar T0 trial 3-5 min (demonstrare valoare), DUPĂ T0 auth obligatoriu (Google primary + Magic Link fallback). Banner-soft REJECTED, hard wall accepted.

Apoi Daniel: "peste ceva timp, facem un site web pt aplicatie, si undeva in meniul siteului sa existe un buton care sa te duca la aplicatie". Asta NU schimbă auth pattern — întărește. Site web v1.5+ = lead magnet, click "Încearcă" → app deep link → T0 trial → auth post-T0 → install PWA. Funnel SaaS clasic Notion/Figma/Linear.

**Future Compatibility Note** §56: auth flow trebuie să suporte deep link entry din landing site marketing v1.5+, NU degradează T0 trial UX.

**Domain architecture** (subdomain split vs path split) = decizie strategic separată, defer la momentul site lansare.

## Implicații imediate identificate

- Phase 2 Auth Flow upgrade prioritate: era "deferred ~16-22h Daniel decide", devine **P1 ABSOLUT** (fără UI auth complet, app neoperational post-Beta când Anonymous-permanent dispare)
- §56.9.1 Sunset Anonymous mode revisit — actual zicea "post-Beta v1.5 + 30 zile grace", acum Anonymous = doar T0 trial, sunset clause moot
- Vault amendments needed: §56.1 + §56.3 + ADR_MULTI_TENANT_AUTH §AMENDMENT 2026-05-05 nou + Privacy Policy update + DECISION_LOG entry + DIFF_FLAGS update

## Pivot la decizii (Daniel "sunt la birou")

Daniel a cerut decizii NU prompts CC ("ma pot concentra la ele"). Sequential decision pe scope T0 mechanics — pentru că auth-required ridică miza T0 (= ULTIMA șansă demo valoare pre-auth wall).

Eu am generat **batch 1 = 19 întrebări categorizate 7 axe** (Hook/Întrebări/Demo/Skip/Auth Wall/Edge/Post-Auth+Telemetry). Daniel a folosit Gemini ca pre-filter — i-a dat batch, Gemini a răspuns la toate, a verificat concordanța cu mine și a făcut manual review DOAR pe delta-uri.

**Workflow 3-instance recunoscut Bugatti-grade:** Gemini logic first pass → eu Bugatti tone + edge cases challenge → Daniel reality lock infra/business. Reduce bandwidth lui din N decizii → DOAR push-back zone real review. Pattern elegant ADHD-friendly.

## Push-backs productive (selecție flow)

**Eu pe Gemini round 1:**
- Q1: anthropomorphic "Salut Andura" Replika-style → action-first "Care e obiectivul tău?"
- Q7: animații per-întrebare → single preview Q4-5 (cognitive overload + fluff risk)
- Q17: tour 30 sec SaaS plictisitor → action-first direct primul antrenament
- Q11: loss aversion "ai investit 3 min" → reframe pozitiv Bugatti "programul tău e gata, salvează ca să-l ai pe toate device-urile"
- Q1 batch 2: emoji preset 🔥 Slăbire → label clean (TikTok influencer tone vs bionic brain serios)
- Q13 batch 3: -20% blanket → tier-aware (Beginner -20%, Intermediate -10%, Advanced 0%)
- Q14 batch 3: A naked RPE/RIR → A + tooltips education (first-time confused = garbage data)
- Q17 batch 3: impact-tier Settings → Imutabile (Sex/Vârstă/Înălțime) + Editabile (Greutate/Obiectiv/Frecvență)

**Daniel pe consensus AI (batch 1) — 2 wins majore:**
- Q18: 24h Magic Link expiry "fantasy" — Firebase native = 1h, 6h sau 24h presupun SMTP custom 1-2 săpt build pentru valoare marginală. Pattern corect: 1h native + retry button prominent. Eu și Gemini am gândit user-side fără infra check. Daniel: "1h V1 înseamnă să activăm ACUM workaround-ul SMTP custom... infrastructură invizibilă care nu aduce valoare".
- Q2: free text "Altceva" → 5 preset clean. Daniel: "câmp de free text în T0 este o invitație la zgomot. Gigel ar putea scrie 'vreau să fiu ca Batman', LLM intent-mapper adaugă latență și risc de eroare în cel mai critic punct al funnel-ului".

**Gemini brilliant catch (batch 4 Q10):** "Auth este post-T0, NU avem email-ul utilizatorului până la finalizarea întrebărilor. Recuperarea se bazează pe reluarea silențioasă din localStorage". Identificat mecanic ce eu ratasem în întrebare design — invalidează abandon recovery email options.

## Big 5 → Big 6 amendment (CRITICAL)

Batch 1 Q10 LOCKED Big 5 (Obiectiv + Frecvență + Sex + Vârstă + Greutate). Batch 2 Q7 push-back: înălțime hard required T0 = conflict direct cu Big 5 lock. Daniel decisive: **"Extindem oficial Big 5 → Big 6. Înălțimea devine Hard Required în T0. Pentru a onora promisiunea de Cognitive AI, nu putem lucra cu aproximări masive. Formula Mifflin-St Jeor (pentru BMR/TDEE) necesită înălțimea pentru a genera un plan nutrițional valid"**.

CC update mandatory în CURRENT_STATE + amendments downstream.

## 75 decizii LOCKED V1 cumulative

Batch 1 (19) Hook + Întrebări + Demo + Skip + Auth Wall + Edge + Post-Auth/Telemetry. Batch 2 (19) Wording exact + Validation + Profile Type + Engine Seed + Anonymous Lifecycle + Error Flows + Day 25. Batch 3 (19) Privacy/GDPR + Onboarding telemetry + First Session + Settings Big 6 + T0 Retake. Batch 4 (18) PWA Install + Push Notif + Email Transactional + Tutorial + Beta Launch.

**Decizii cumulative high-impact:**
- Auth-required post-T0 + Future Compat Note site web v1.5+
- Hook action-first (NU anthropomorphic Replika)
- Big 6 hard required (skip vizibil DOAR pe optionale)
- 5 preset obiectiv text clean (NU emoji, NU free text V1)
- Single preview Q4-5 personalizare verbatim Bugatti SUFLET L3
- Reframe pozitiv auth wording, preview blurred teaser onest, hard wall refuz
- Magic Link Firebase native 1h + retry button prominent
- Engine seed mid-T0 silent backend, Profile Type post-3-sesiuni soft notify Bugatti L5
- Anonymous→Auth merge auto-write + summary 3 sec
- Day 25 reminder 3 trigger context-aware + dynamic preview embedded
- Abandon recovery threshold <3 zile silent / >3 zile prompt soft
- T0 abandon recovery email = imposibil mecanic (NO email collected pre-auth)
- Privacy hibrid (footer permanent + checkbox auth explicit)
- Privacy wording Bugatti polish: "Nu vindem datele terțelor părți" (NU "nu vindem nimic" absolut)
- 3 milestones telemetry separate (T0_questions / T0_preview / T0_auth done)
- KPI primar: T0→Auth conversion (auth wall = chokepoint principal)
- First session tier-aware adjustment (Beginner -20%, Intermediate -10%, Advanced 0%)
- RPE/RIR education = A + inline tooltips ("RPE 1 ușor, 10 max effort")
- Settings Big 6 lifecycle: Imutabile (Sex/Vârstă auto-increment/Înălțime) | Editabile (Greutate/Obiectiv cu modal/Frecvență)
- T0 retake hibrid (free 7 zile calibration era, apoi support-only)
- PWA install post-first-session (value demonstrated)
- Push notif two-step modal Bugatti + native, max 3/săpt cap
- Welcome email + valoare + structure echo
- Beta cohort invite-only first 50-100 (Bugatti control quality)
- Beta success criteria multi-metric dashboard (45/35/30 hibrid per CURRENT_STATE §66 LOCKED)
- Beta rollback hibrid in-place minor / hard rollback major (>30% miss criteria)

## Tone & framing

- **Bugatti filter aplicat consistent** anti-anthropomorphic Replika-style + anti-fluff + anti-SaaS-default
- **Gigel test invocat** la wording decisions (emoji RO 35-50 demographic, "nu mă mai doară spatele" edge case → Sănătate template adaptive)
- **3-instance workflow validated** (Gemini logic + Claude Bugatti challenge + Daniel reality lock)
- Daniel-isms ":))" multiple banter mode, jucăuș + decisive

## Mid-flight unresolved

ZERO. Toate 75 decizii LOCKED V1 + 1 amendment Big 5→6. CC poate proceda cu vault amendments comprehensive.

## Next P1 candidates post-handover

1. **Auth UI Phase 2 acceleration** — P1 ABSOLUT URGENT (era deferred ~16-22h, auth-required LOCKED ridică prioritatea, blocks Beta launch dacă UI incomplet)
2. ADR 026 compile draft full (Priority 3 architectural foundation)
3. Engine seed algorithm spec (separate engine spec session, mai tehnic)
4. P1-FLAG-SCENARIOS-COVERAGE branch enumeration cluster A (~5-15 chat-uri Priority 2 Beta blocker)

## Bandwidth la handover

~30% remaining (handover preventive § §CC.5 fast workflow, NU saturat critic). Decision logging silent active permanent în chat — capture full decisions + framings + push-backs.

---

**Action Daniel:** drag acest artefact în `📥_inbox/` + commandă către CC Opus: **"Update CURRENT_STATE per inbox handover"**. CC ~5-10 min: APPEND-only `## JUST DECIDED` + move-then-replace `## NOW` precedent → `## RECENT` + APPEND DECISION_LOG entry + amend §56 + ADR_MULTI_TENANT_AUTH §AMENDMENT 2026-05-05 nou + amend Big 5 → Big 6 toate referințe + DIFF_FLAGS update + commit + push. Backup tag: `pre-handover-2026-05-05-birou`.
