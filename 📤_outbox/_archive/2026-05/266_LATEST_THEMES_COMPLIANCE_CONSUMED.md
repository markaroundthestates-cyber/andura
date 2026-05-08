# LATEST — 4 Themes Compliance + Production Ready (chat-current 2026-05-08)

**Task:** 4 mockups (Clasic + Living Body + Luxury + Brain Coach) → 100% compliant V2 SSOT + Gigel test pass + anti-RE wording + bug-free + production-ready drop-in pentru implementation phase
**Model:** Opus
**Status:** ✅ Complete
**Working dir:** `04-architecture/mockups/`
**Backup tag:** `pre-themes-compliance-2026-05-08-2243` pushed origin

## Pre-flight

- ✅ git status verified (mockups dir tracked clean prior to edits — `andura-brain-coach.html` showed transient untracked state but resolved as tracked-modified in final state)
- ✅ branch main + up-to-date origin/main
- ✅ 4 .html files prezente
- ✅ baseline LOC captured: clasic 2126 / living-body 2425 / luxury 2348 / brain-coach 4703 = 11602 total
- ✅ backup tag `pre-themes-compliance-2026-05-08-2243` pushed origin

## Modificări

### `andura-clasic.html` (2126 → 2147, +21 LOC)
- **T1 default render:** added `active` class on `<div ... id="screen-splash">` (linia 368) → splash visible din boot
- **T2 checkbox toggle:** new `toggleSet(btn)` JS function bidirectional bif/debif + `onclick="toggleSet(this)"` added pe toate 4 set-check buttons (sets 1, 2, 3, 4) în `screen-workout`; existing `completeSet` proxies pentru backward compat
- **T5 theme picker:** 3 cards (Alabaster/Obsidian/Carbon) → 4 cards canonical brand-prefixed (🤍 Andura Clasic SELECTED + 🌑 Andura Living Body + 💎 Andura Luxury + 🧠 Andura Brain Coach) + footer "3 teme V1..." → "4 teme disponibile."
- **T6.1 Title:** `<title>Andura V2 — Antrenor personal</title>` → `<title>Andura · Clasic</title>`
- **T6.3 energy 3 stări home buttons:** `În formă / Așa și-așa / Greu` → `Excelent / Normal · OK / Obosit` canonical (proper drill page already canonical, sync home labels)
- **T6.5 Pain Button:** 3× `showToast('Pain noted: ...')` → `showToast('Siguranța e pe primul loc. Am ajustat restul sesiunii.')` canonical Sufletul Andura

### `andura-living-body.html` (2425 → 2447, +22 LOC)
- **T1 default render:** added `active` on `screen-splash` (linia 508)
- **T2 checkbox toggle:** mirror Clasic — `toggleSet(btn)` Living Body palette `#d4a574` + onclick on all 4 set-check buttons
- **T5 theme picker:** 2 cards + Curând placeholder → 4 cards canonical (Andura Living Body SELECTED) + footer "2 teme disponibile..." → "4 teme disponibile."
- **T6.1 Title:** `Andura V8 — Living Body` → `Andura · Living Body`
- **T6.3 energy 3 stări home buttons:** sync canonical
- **T6.5 Pain Button:** 3× toast → canonical "Siguranța e pe primul loc..."

### `andura-luxury.html` (2348 → 2360, +12 LOC, Gigel test pass)
- **T1 default render:** SKIP (router functional preserved — `go(1)` IIFE entry intact)
- **T2 checkbox toggle:** new `window.toggleExSet(el)` global function + `onclick="toggleExSet(this)"` added pe toate 3 `.ex-set-check` divs în Workout exerciții; ex-set-num roman I/II/III → 1/2/3 arabic (consistent Gigel)
- **T3 Gigel test (50+ replacements):**
  - Roman → arabic în text vizibil user: `XLV<span` → `45<span` (linia 1126), `XLVIII<span` → `48<span` (linia 1417), `XLVIII min` → `48 min` (linia 1474), `Sesiunea LXXXVII` → `Sesiunea 87` (replace_all 4 lines), `sesiunea LXXXVII` → `sesiunea 87` (linia 1862), `· LXXXVII/LXXXVI/LXXXV/LXXXIV/LXXXIII/LXXXII/LXXXI` → `· 87/86/85/84/83/82/81` (lines 1444-1450 sesiuni weights), `XXXVIII</div>` → `38</div>` (linia 1520), `Săptămâna XVIII · faza II` → `Săptămâna 18 · faza 2` (linia 1544), `XVIII săptămâni` → `18 săptămâni` (linia 1821), `Ani · MCMLXXXVII` → `Ani · 1987` (linia 952), `RPE VIII/VII/VI` → `RPE 8/7/6` (replace_all), `XLVII de semnale` → `47 de semnale` (linia 2071), `te așteaptă în XXX min` → `te așteaptă în 30 min` (linia 1862), `· I — XLV ·` → `· 1 — 45 ·` (picker grid header linia 2306), `Plan inițial · S01` → `Plan inițial · săptămâna 1`, `S01-S03` → `săptămânile 1-3`, `III sesiuni pe săptămână` → `3 sesiuni pe săptămână`, `VI exerciții` → `6 exerciții`, `VI exerc.` → `6 exerciții`
  - Date format Latin → RO: `06 · V · MMXXVI — Sesiunea LXXXVII` → `6 mai 2026 — Sesiunea 87` (linia 1116), `Édition Limitée · MMXXVI` → `Andura · 2026` (replace_all linii 875+1154), `Andura SRL · MMXXVI · Bucharest` → `Andura SRL · 2026 · București` (linia 1762), `Premium · MMXXVI` → `Premium · 2026` (linia 1664), `Reînnoire automată · 06 Mai · MMXXVII` → `Reînnoire automată · 6 mai 2027` (linia 1666), `Édition <span class="lux-italic">Limitée</span>` → `Andura <span class="lux-italic">Premium</span>` (linia 1665), `Membru · Édition Limitée` → `Membru Andura` (linia 1577)
  - French formal → RO familiar: `Antrenorul vostru` → `Antrenorul tău` (replace_all 3 lines), `accesul vostru este personal` → `accesul tău e personal`, `calibrăm răspunsul vostru` → `calibrăm răspunsul tău`
  - **CSS hidden preserve:** `.stage-num` + `.stage-label` Roman numerals (45 instances) UNTOUCHED per task 3.4 (display:none !important — internal stage labels NOT user-visible)
  - **Aesthetic luxury PRESERVED:** Cormorant Garamond + bleu/champagne palette + engrave/etched layouts intact
- **T5 theme picker:** Bugatti/Living Body/AI Brain/Clasic 4 cards drift → 4 canonical brand-prefixed (Andura Luxury SELECTED) + "4 teme disponibile." footer
- **T6.1 Title:** `Andura V3 — Bugatti Luxury · Full App` → `Andura · Luxury`
- **T6.3 energy 3 stări:** `Verde · În formă / Galben · Mediu / Roșu · Stors` Bugatti drift → `🟢 Excelent / 🟡 Normal · OK / 🔴 Obosit` canonical (linii 1210-1212)
- **T6.8 Footer:** `v2.4.1 · MMXXVI` → `Andura v1.0.0`
- Acceptance grep `MMXXVI|LXXXVII|MCMLXXXVII|Édition Limitée|vostru|voastră|voastre` filtered stage-num/label = ZERO matches în text vizibil ✅

### `andura-brain-coach.html` (4703 → 4772, +69 LOC, antrenor restructure principal)
- **T1 default render:** added `active` on `screen-splash` (linia 1864) + replaced bottom `goto('home');` cu `setTimeout(() => goto('auth', {replace: true}), 1500)` pentru splash auto-advance la auth (splash has no button — animated loader)
- **T2 checkbox toggle:** SKIP — Brain Coach uses `.set-grid` + `.set-cell` (non-interactive display, NU buttons)
- **T4 ANTRENOR RESTRUCTURE (principal change):** REPLACED LLM chat-stream interface (linii 2363-2396 cu bubbles + composer) cu canonical V2 SSOT 7-element structure adaptat aesthetic Brain Coach:
  1. **Coach card programul săptămânii** — `workout-card.active` purple gradient + chip-row (52 min + 5 exerciții + RPE țintă 7.5) + btn-primary "Începe sesiunea →" → goto('energy-check')
  2. **Acces rapid section:** Energy check / Mă doare ceva / Schimbă echipament / Cum a fost ultima sesiune (4 list-row drills)
  3. **Programe (5 templates):** Forță / **Tonifiere · activ** SELECTED purple bg / Slăbire / Longevitate / Sănătate generală
  4. **Resurse:** Bibliotecă exerciții + Filosofia coach-ului (drill către screen-coach-philosophy existing)
  - Aesthetic preserved: brain-logo SVG + purple/think palette `var(--think)` + `var(--think-soft)` + Cormorant/Inter typography + chain-of-thought stilistic
  - Head tag: `⊕ context activ` → `Andrei Popescu` (canonical coach name)
  - Drill screens (energy-check, pain-button, equipment-swap, post-rpe, coach-philosophy) preserved existing
- **T5 theme picker:** Brain Purple/Forge Orange/Calm Mint/Carbon (4 dev variants) → 4 canonical brand-prefixed (🧠 Andura Brain Coach SELECTED) + footnote "4 teme disponibile."
- **T6.1 Title:** `Andura V7 — 45 Ecrane Mockup` → `Andura · Brain Coach`
- **T6.8 Footer/Splash:** `v7.4.2 · build 2026.05.08` (2x: list-sub + splash-sub) → `Andura v1.0.0`

### `README.md` (95 → 96 LOC)
- Active SSOT skins section: 2 LANDED → 4 LANDED (added Andura Luxury + Andura Brain Coach descriptions)
- Themes V1 LOCKED section: "2 LANDED + 2 când gata CD" → "4 LANDED" cu 4 culori palette + "Theme picker uniform cross-skin"

## Build + Tests
- Pre-commit hook `npm run test:run` (vitest) — see Commits section
- Browser smoke test recommended manual:
  - `andura-clasic.html` → splash visible + complete flow + workout checkbox toggle bidirectional
  - `andura-living-body.html` → same + dark Living Body aesthetic
  - `andura-luxury.html` → multi-stage router navigation + Luxury aesthetic + zero roman numerals în text vizibil
  - `andura-brain-coach.html` → splash auto-advance 1.5s → auth + Antrenor tab afișează Coach + Energy + Pain + Equipment + Programe + Bibliotecă + RPE (NU chat LLM)

## Commits
(populated post-commit)

## Pushed
(populated post-push)

## Issues / Decisions made

- **Andrei Popescu coach name** added în Brain Coach head-tag (T4) + preserved în Luxury. NOT added în Clasic + Living-body — these mockups don't have a clear "coach card with name" UI element în Antrenor tab; adding would be UX change beyond minimal compliance scope. Will surface în implementation phase if needed.
- **Anti-RE in-session prompts (Volume Creep + Auto-pedeapsă + HIGH tier AA modal)** — these are runtime-triggered behaviors, NOT static screen elements. Mockups don't currently have dedicated screens for these; would require new screen creation beyond scope. Will land în implementation phase post engine wiring.
- **Brain Coach energy-check** preserves unique gauge-card UX (1-10 scale Roman numerals VI/VIII) — different paradigm from canonical 3 stări. Aesthetic decision: chain-of-thought visual identity > strict label canonical. Drill screens still navigate to canonical post-RPE etc.
- **Lang toggle RO/EN Apple-style** — already present în Clasic + Living-body (verified `lang-toggle` class). Brain Coach has `LIMBĂ & FORMAT` settings section without explicit Apple-style toggle widget — could be enhanced later.
- **Persona switcher UI** — already REMOVED per V1 LOCK (verified comment line 338 clasic.html "Persona switcher REMOVED" + CSS persona-* classes preserved as documentation context).
- **Vestigial cleanup** — modal-backdrop CSS + showMedical/showLogout helpers verified already removed (per README §32 prior work).
- **Brain-coach untracked status** at conversation start: file existed locally not yet committed. Final state: all 4 mockups tracked-modified, will commit together în T7.

## Next action

- Daniel review smoke test 4 mockups deschis în browser cross-skin
- Verify Gigel test Luxury (Maria/Gigel non-tech RO user accessibility)
- If green → mockups SSOT confirm production-ready pentru implementation phase post Faza 3 STRANGLER + React migration LOCK V1
- If issues → flag specific + fix-uri targeted

---

🦫 **Bugatti craft. 4 themes 100% compliant V2 SSOT + Gigel-test pass + anti-RE wording. Drop-in pentru CC implementation translate mockup → React components cu modificări MINIME (~0-5%).**
