# Handover chat 2026-05-07 — Brainstorm UX root nav + Cont V2 + mockup CD V1

Salut [next CC]. Ne-am întâlnit Daniel + eu (Co-CTO) în chat-ul ăsta și-am rescris fundația UX a Andura — root nav primary, naming RO pur, scheletul tab-ului Cont, plus review primul mockup vizual de la Claude Design. Daniel era la birou (Codespaces `/workspaces/salafull`, bash) cu chef de design productiv. A zis "motor de camion sub capotă Bugatti = catastrofă, definim scheletul ÎNAINTE de design vizual" și am procedat cu asta. Hyperfocus mood, articulate clar pe framework Bugatti separation of concerns.

## Ce a rămas LOCKED chat acesta (cumulative)

**Root nav primary V2 LOCKED 4 taburi distincte non-overlapping:**
- **Sala** (sport sesiunea — acțiune fizică, log seturi/RPE/timer pauze)
- **Antrenor** (body comp + nutriție + Auto + sport plan supervision — antrenor personal IRL holistic, NOT fitness instructor narrow)
- **Istoric** (timeline trecut — calendar heat map + sesiuni cronologic + drill-downs Greutate&BF/Nutriție/PR-uri/Programe arhivă)
- **Cont** (administrativ pur)

Asta înlocuiește spec V1 §29.5.7 trio Azi/Istoric/Profil → amendment §29.5.7 V2 LOCKED. Drift production 6→4 taburi de implementat (ștergere Dashboard/Greutate/Program/Plan ca taburi separate, absorbție logică sub root tabs).

**Naming evolutions LOCKED:**
- "Coach" → **"Antrenor"** (RO pure)
- "Pilot Automat" → **"Auto"** simplified
- Tab body comp = **"Antrenor"** (Daniel argument valid post push-back: antrenor personal IRL holistic, nu doar gym instructor). Eu retracted swap-ul inițial.
- Tab sport sesiune = **"Sala"** (Co-CTO vot, Daniel acceptat implicit prin mockup CD V1 — verdict explicit pending)

**Cont V2 inventar LOCKED complet** (artefacte vault generate: `prompt-claude-design-andura-v2.md` + `inventar-tab-cont-spec-v2.md`):
- Header: avatar inițial literă + nume + email vizibil sub (NU "Magic link" label)
- CONT: Profil & ținte / Notificări / Abonament (placeholder "În curând")
- GENERAL: Aspect → Themes drill-down (4 themes, labels TBD post-design) / Setări → Resetează coach + Refă onboarding (cu pagini confirm warning)
- DATE & CONFIDENȚIALITATE: Politica / Termeni / Descarcă datele (JSON)
- ZONĂ SENSIBILĂ: drill-down separate (buton single din pagina principală Cont) → Logout + Delete (30 zile grație)
- Footer: Suport + Despre Andura + FAQ + versiune Andura v1.0.0 text gri

**Architectural patterns LOCKED V1:**
- **Drill-down universal physical pages, ZERO dropdowns/modals/accordion**. Back button PWA history real (navStack implementat în mockup).
- **Pattern destructive**: pagini confirm warning cu icon + text avertizare + 2 butoane (Confirmă roșu / Anulează neutru).
- **SSOT data layer**: 1 write entry point per metric (greutate/kcal/proteine logged în Antrenor; sesiuni în Sala), multi-read views (apar și în Istoric automat sincronizat). NU duplicate input.
- **§29.5 V2 amendment**: bilingv RO+EN launch (NU mai e RO pure lock V1). EN strings TBD pre-Beta — gata în beta dacă ready, altfel toggle visible cu placeholder "EN curând" tap.
- **Selector limbă**: text toggle "**RO** / EN" inline top global header Apple-style state-flip (NU steguleț — argument valid: stegul ≠ limbă, RO/MD diaspora; NU dropdown — zero-dropdown rule). Vizibil pe toate taburi root, NU ascuns în Cont (accessibility cross-cutting "nu trebuie ascuns prin meniuri inutil").

## Mockup CD (Andura-V1.html) review — Bugatti excellent overall

Daniel a uploadat HTML mockup la final chat. **Cont V2 implementat faithfully** (toate secțiunile + drill-downs + footer cu Andura v1.0.0), 4 taburi root match (Sala/Antrenor/Istoric/Cont — internal `data-tab="settings"` legacy ID dar label-ul user-facing = Cont ✓), pattern destructive perfect (4 confirm pages drill-down: reset-coach / redo-onboarding / logout / delete), navigation back-stack real (`navStack`), lang toggle visual-only correct (linia 1738 "EN preview — UI rămâne RO în mockup"), paleta warm paper #faf7f1 + brick #c8412e + olive + deep blue, Lora serif coach quotes = Bugatti artistic touch, persona-aware text scaling (CSS vars body/small/display).

**3 modificări push-back productive flag-ate pentru CD next iteration:**
1. 🚨 **CRITIC** — `modal-medical` onboarding (line 493 + 1755 `showMedicalModal()`) = VIOLATION pattern V2 zero-modal universal. Convert în drill-down page confirm.
2. 🟡 **MINOR** — `modal-logout` dead code (line 1524 + 1757) — definit dar nefolosit (logout actual = drill-down `confirm-logout` ✓). Cleanup HTML/CSS/JS.
3. 🟡 **CLARIFY** — Persona switcher mock-only sau production? (Maria 65 / Gigica 30s / Marius 40s top-right pill). Suggest mock-only — remove pre-production (overlap cu Cont > Profil & ținte oricum).

## Mid-flight unresolved next chat

- **Theme labels finale** (Theme 1/2/3/4 placeholder → TBD post-mockup vizual feedback Daniel)
- **Pre-flight grep `src/pages/settings.js`** production actual să confirm că nu lipsește feature legitim deja folosit pre-deprecate Setări actual (ex. buton feedback, link Discord, etc.)
- **§29.5 V2 amendment** write în vault (`HANDOVER_MISC §29.5.7` extension) + propagate `index.html` + `src/ui/nav.js` post implementation
- **Implementation phase**: refactor nav root production 6→4 taburi (overlap potențial cu Faza 3 STRANGLER wiring? — verifică prioritizare cu Faza 3 P1)
- **Daniel verdict explicit** Sala naming (implicit accepted prin mockup CD, dar confirm formal merită)
- **CD next iteration** după Daniel paste-uiește cele 3 modificări

## Daniel-isms + mood chat

Daniel mood productiv "am chef de design", warm bond moments natural ("tataie" folosit, glumă self-aware "ce m-aș face fără voi... vă chinuiți să mă scoateți din poverty :))"), articulate clar pe framework Bugatti separation of concerns ("fiecare tab serves un scop", "tree cu branches sub el"). Push-back productive activ pe ambele direcții — Daniel instinct correct pe Dashboard vs Coach overlap (eu am sărit greșit la "dizolvă în Coach idle", el corectat că NU = scope distinct), eu push-back productive pe Antrenor swap inițial (concedat după Daniel argument valid IRL holistic personal trainer), eu push-back accepted pe steguleț, "Start Antrenament" prea lung. Bandwidth raport ~25% threshold corect handover NOW fresh.

## Next concrete priority order

1. **Daniel verdict final** pe modificări CD aplicat (modal-medical fix critical).
2. **Update vault SSOT**: §29.5.7 V2 amendment write + DECISION_LOG cumulative LOCKED += ~12 entries chat (4 taburi root, naming evolutions, Cont V2 complet, patterns universal, bilingv amendment).
3. **Pre-flight grep `src/pages/settings.js`** production state pre handoff design final.
4. **Decide Implementation phase**: refactor nav root 6→4 prioritization vs Faza 3 STRANGLER wiring (verifică `CURRENT_STATE §NEXT` pentru P1 ordering).
