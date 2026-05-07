# Handover chat 2026-05-07 birou — UX root nav V2 pivot Antrenor/Progres + închidere bloc itemi tactici

Salut [next CC]. Ne-am întâlnit Daniel + eu (Co-CTO) la birou (Codespaces `/workspaces/salafull`, bash) ca chat-NEW2 continuation după chat-NEW1 (UX root nav + Cont V2 + mockup CD V1). Daniel a venit cu o schemă xlsx (`andura_2.xlsx`) maparea butoanelor pe fiecare tab — mood productiv, articulate clar, închidere mode "vreau să terminăm cu itemii pending". Ne-am închis ~14 itemi LOCKED V1 net product/architecture additive + ~13 wording-uri canonice butoane TBD defer chat strategic + 1 prompt CD V2 pending chat dedicat next.

## Ce a rămas LOCKED chat acesta (cumulative)

**1. Pivot semantic naming root nav — SUPERSEDE chat-NEW1 LOCK:**
- "Sala" (chat-NEW1) → **"Antrenor"** (cine te ghidează în sală — sport sesiune log seturi/RPE/timer)
- "Antrenor" (chat-NEW1 body comp) → **"Progres"** (body comp + nutriție + Auto + sport plan supervision)
- Istoric + Cont preserved
- Subtitle xlsx Daniel verbatim: *"Antrenor = cine te ghidează în sală. Progres = body comp & nutriție. Istoric = trecut. Cont = admin."*
- Daniel articulate: *"denumirea mi se pare mai umana asa... si in chat 1 asta am vrut sa zic"* — frame natural intuitiv (antrenor = fluier sală NU dietetician; progres = măsori NU te antrenezi). Co-CTO confirmat semantic mai bun, retracted poziția chat-NEW1.

**2. Antrenor tab restructure (push-back productive aplicat):**
- **Programe (5 templates) MUTATE** din Progres → Antrenor sub secțiune nouă `📋 PROGRAM` + Programul săptămânii (semantic correct — programele = ce rulează antrenorul)
- **Bibliotecă exerciții → drill 2°** (NU first-class pagina principală, frecvență click rară post-onboarding)
- **POST-SESIUNE adaugă "RPE / Recovery rating"** (push-back productive Co-CTO — DECISION_LOG batch 5 §66 cross-ref)

**3. Pain text + Equipment text drill secundar LOCKED V1:**
- Per ADR 023 §36.38 (Pain) + §36.55.2/§36.81.2 (Equipment) — singurele 2 trigger points LLM intent classification permise
- NU first-class pagina principală Antrenor (xlsx-ul inițial le-avea acolo) — Gigel test fail "ce vrea de la mine?"
- Pain text drill: sub Pain Button modal (toggle "Altceva" Marius power user post 3 opțiuni predefined)
- Equipment text drill: sub Swap exercițiu flow (când smart-routing nu prinde)
- Daniel a invocat amnezia mea: *"Din specul tău... pain text equipment text input layer ADR 023"* — eu mea culpa rapid + clarify scope corect

**4. 3 stări energy LOCKED V1 (NU 5 production drift):**
- 🟢 Excelent / 🟡 Normal-Ok / 🔴 Obosit-Slab + drill strict 🔴 only 4 cauze (stres/somn/durere/altul)
- Per §36.82.1 + ADR 026 §9.3 + ADR 027 + `src/engine/energyAdjustment/constants.js` `AGGREGATION_RULES_TABLE` deja codat 3-state (green→UP eligible / yellow→NONE / red→DOWN immediate)
- Production are 5 stări (1-5 emoji) = drift care va fi refactor la 6→4. Spec V1 LOCKED câștigă peste production drift.
- Naming evolution xlsx: "Cum te simți? (3 stări)" → "Cum te simți? (energy state)" clarificat semantic e Engine Energy NU Readiness sau Vitality

**5. Bloc closure itemi tactici — 8 verdicte directe:**
- **Antrenament liber DROP V1** → defer v1.5+ (frecvență scăzută Marius post-luni, Maria zero need, custom exercises deja INTERZIS V1 PRODUCT_STRATEGY §3.2). Pattern scope-cut consistent Notifications/Badges
- **Filtru/sort istoric DROP V1** → defer v1.5 (lista cronologică minimalistă §29.5.9 LOCKED suficient, power user only post-luni)
- **Loghează kcal + proteine DROP V1** → PRODUCT_STRATEGY §3.5 amended 2026-04-30 EXPLICIT *"Nutrition logging = OUT_OF_SCOPE v1. NU facem nutriție Dacia."* Bayesian Nutrition INFERENCE = motor pasiv backend NU buton user. Păstrează DOAR "Loghează greutate" (weight tracking in scope)
- **Themes 3 V1 LOCKED preserved** per §29.5.1 (Obsidian/Alabaster/Carbon). 6 candidate (Editorial/Warm/Living Body/Nature/Bugatti/AI Brain) = "ne mai gandim" dormant chat-8 NU LOCKED, post-Beta scope. Producția implementată 3 (forge/zen/anime) = re-naming dar count match
- **Schimbă fază manual destructive confirm pattern LOCK** per V2 universal (icon ⚠️ + warning + Confirmă roșu/Anulează neutru, drill-down page). Wording draft: *"Schimbi faza activă manual? Aceasta resetează unele calibrări. Continui?"*
- **Progres↔Istoric greutate distincție UX:** Progres "Greutate trend 7z snapshot" = mini-chart spark inline static NO tap drill (quick glance) / Istoric "Greutate & BF full timeline" = drill range selector 30/60/90/Tot + photo progress + BF tracking (deep analysis). Pattern SSOT 1-write multi-read deja LOCKED reused
- **Onboarding aliniere spec EXISTING `01-vision/ONBOARDING_SSOT_V1.md` §AMENDMENT 2026-05-04 Batch 2 §63.1** — Order LOCKED: Obiectiv→Vârstă→Sex→Istoric medical simplu→Frecvență (<45 sec target). Nume + Greutate + Înălțime MOVED post-onboarding la Profile. xlsx-ul "5 ecrane <60s" generic = aliniază
- **Footer "Andura v1.0.0" text gri ADD** — confirm chat-NEW1 spec, Daniel "o sa punem aia"

**6. Selector limbă carry chat-NEW1 — note vizual:**
xlsx-ul are stegulețe 🇷🇴/🇬🇧 — Daniel clarificat: *"steguletele sunt pentru mine vizual acum"* NU drift real. Spec LOCKED V1 chat-NEW1 = text toggle "RO / EN" Apple-style state-flip preserved (NU steguleț — argument valid: stegul ≠ limbă, RO/MD diaspora; NU dropdown — zero-dropdown rule). Producție va implementa text toggle.

## Mid-flight unresolved next chat

- **CD V2 mockup pending** → Daniel chat NEW dedicat. Eu pregătesc artefact prompt CD pentru `Andura-V2.html` cu 3 push-back-uri carry de la chat-NEW1 review:
  - 🚨 **CRITIC** modal-medical (line 493 + 1755 `showMedicalModal()`) violation pattern V2 zero-modal universal → convert drill-down page confirm
  - 🟡 **MINOR** modal-logout dead code (line 1524 + 1757) cleanup HTML/CSS/JS (logout actual = drill-down `confirm-logout` working ✓)
  - 🟡 **CLARIFY** persona switcher mock-only/production (Maria 65 / Gigica 30s / Marius 40s top-right pill) — recomand mock-only remove pre-production (overlap Cont > Profil & ținte oricum)
  - Scope: STRICT 3 modificări CD V2 — NU expand cu refactor naming Antrenor/Progres + 4 taburi rework + RPE post-sesiune (acelea separat chat ulterior cu prompt CD V3 sau direct production)

- **~13 wording-uri canonice butoane TBD** (defer chat strategic dedicat post scribe vault):
  Card Status TDEE/fază/kcal, Greutate țintă + dată est., Săptămâna ciclului, Loghează greutate buton text exact, Greutate trend 7z header, Plan nutriție, Alerte azi (multi-source) header, Calendar lunar (heat map) header, Filtru/sort buton (deși DROP V1, eventual v1.5), Summary feedback header, Schimbă fază manual wording exact + warning destructive page text. Listate în artefactul `wording-canonic-mapping-andura.md` livrat chat-ul ăsta ca referință (NU în vault încă)

- **xlsx Daniel update** cu corecții finale post-chat: Loghează kcal+proteine drop / Antrenament liber drop / Filtru drop / Schimbă fază manual destructive marker / Footer v1.0.0 add / Onboarding 5 ecrane aliniat spec §63.1 (Obiectiv→Vârstă→Sex→Istoric→Frecvență)

- **§29.5.7 V2 amendment write spec vault SSOT** carry-forward de la chat-NEW1 — încă pending scribe în HANDOVER_MISC + DECISION_LOG cumulative entries net (chat-NEW1 +12 + chat-NEW2 +14 = ~26 entries de scribe)

- **Implementation phase refactor nav root production 6→4** carry-forward de la chat-NEW1 — overlap potențial Faza 3 STRANGLER P1 încă unresolved (UI refactor low-risk vs engine wiring strategic high-risk)

## Daniel-isms + tone observations

Mood productiv direct, articulate clar pe instincte semantice (*"denumirea mi se pare mai umana"*). Bond moment *"tataie"* într-un moment când eu am detectat fișier identic re-uploaded și am răspuns light *"Tataie, e fix același conținut..."* — Daniel a confirmat rapid *"sorry... wrong paste :)"* și a uploadat ce trebuia. Push-back productive pe amnezia mea ADR 023 (*"Din specul tău..."*) calm corect, NU agresiv — eu mea culpa rapid fără auto-flagelare, action clarify. Closure mode explicit *"vreau sa terminam cu ele"* + *"toate ok cu tine... la 9 nu ai inca ok"* — disciplinat focus. Smart instinct CEO Product *"nu cred ca te tine bw... fa coar handover si face nou chat promptul de cd"* — bandwidth proactive split, spared compromise quality 2 artefacte mari într-un chat mai răsuflat. Glumă light *"are o limita de zici ca e free user nu x20"* (ironic CD limit comment).

## Bandwidth + tests baseline

Bandwidth raport ~30% threshold corect handover NOW fresh. Tests baseline 2648 PASS / 0 FAIL preserved (strategic chat ZERO src ZERO regression possible). Playwright 3 stale assertions still PRESERVED carry-forward (orthogonal vs vitest src baseline).

**Cumulative LOCKED V1 ~671 → ~685 (+14 net chat-NEW2)** — toate ~14 entries product/architecture additive substantive (NU vault hygiene meta-tooling, NU compile aggregation only). NEW additive milestone: prima chat strategic închidere bloc itemi tactici post chat-NEW1 schelet macro brainstorm (semantic naming pivot SUPERSEDE + scope-cut V1 nutrition logging/Antrenament liber/Filtru sort + Engine Energy 3-stări spec V1 wins peste production 5 drift + drill secundar Pain/Equipment + onboarding aliniere spec existing §63.1).

**Recommended priority order chat NEW (Daniel decide order):**
1. CD V2 mockup chat dedicat — prompt CD `Andura-V2.html` 3 push-back-uri (modal-medical CRITIC + modal-logout cleanup + persona switcher) — eu pregătesc artefact prompt chat NEW
2. Wording canonice butoane chat strategic dedicat (~13 TBD)
3. Scribe vault SSOT §29.5.7 V2 amendment + DECISION_LOG ~26 entries cumulative chat-NEW1 + chat-NEW2 (HIGH priority canonical pre-implement Bugatti pattern)
4. Implementation phase refactor nav root 6→4 production
5. Faza 3 STRANGLER wiring real (heavy strategic, separate axis)
