# Andura UI Mockups — Design References

**Owner:** Daniel (CEO + Product) + Claude Co-CTO + Claude Design (CD chat)  
**Purpose:** Visual design references SSOT pre-implementation phase. CC translate mockup → production code. NU production code direct, NU executable app.

---

## Naming convention LOCK V1 (skin-themed brand-prefixed)

**Convention:** `andura-<skin>.html` kebab-case lowercase cross-platform path safety (NU spațiu fragil CLI/URL escape).

**LOCKED 2026-05-08 chat-current:** shift de la version+date naming (`andura-v2-2026-05-07.html` deprecated) la skin-themed brand-prefixed. Pattern uniform across mockups pentru consistency naming + scalable downstream skins.

---

## Active SSOT skins

- **`andura-clasic.html`** — **Andura Clasic** (skin 1, V2 SSOT cremos baseline). Spec V1 ~685 cumulative coverage ~99% post chat-NEW2 birou UX pivot SUPERSEDE chat-NEW1 + bloc closure 8 itemi tactici LOCKED. Current design reference active for implementation phase.
- **`andura-living-body.html`** — **Andura Living Body** (skin 2, V8 dark navy + auriu cald, compliance fixe LANDED 2026-05-08 chat-current). Theme alternative SSOT post side-quest theme V8 compliance fixe (HRV/BPM scope creep eliminat per ADR 026 §9.3.2 Cluster 2 Q4=A+Q5=A defer biometrics v1.5+ + theme picker swatch reconcile 4 modificări mecanice).

### Coverage scope V2 (Andura Clasic baseline)

- Root nav 4 taburi V2 LOCK: Antrenor / Progres / Istoric / Cont (SUPERSEDE chat-NEW1 Sala/Antrenor/Istoric/Cont)
- Antrenor restructure: Programe MUTATE Progres→Antrenor + Bibliotecă drill 2° + RPE post-sesiune drill
- Pain Button + Equipment swap drill 2° (3 predefined + Altceva text input ADR 023)
- 3 stări energy SUPERSEDE 5 production drift: 🟢 Excelent / 🟡 Normal-OK / 🔴 Obosit + drill 4 cauze
- Onboarding §63.1 5 ecrane order: Obiectiv → Vârstă → Sex → Istoric medical → Frecvență (<45 sec target)
- Cont V2 inventar complet: Profil&ținte / Notificări / Abonament / Aspect Themes 3 V1 / Setări destructive confirms / Date&Confidențialitate / Zonă Sensibilă / Footer v1.0.0
- Selector limbă RO/EN text toggle Apple-style state-flip (NU steguleț, NU dropdown)
- Patterns universal: zero-modal / zero-dropdown / drill-down universal physical pages / destructive confirm pattern
- Persona switcher mock-only REMOVED pre-production
- Vestigial cleanup: modal-backdrop CSS + showMedical/Logout helpers REMOVED

### Coverage scope V8 (Andura Living Body skin 2)

- Theme alternative cu paleta dark navy `#07090f` + auriu cald `#d4a574` (vs Andura Clasic cremos `#faf7f1` + `#c8412e`)
- Anatomy stage "Living Body" living visual layer în screen-antrenor (replace static dashboard cu dynamic body representation)
- Compliance fixe post side-quest 2026-05-08:
  - HRV/BPM `lb-hrv` block scos complet din `screen-antrenor` — scope creep biometric V1 vs ADR 026 §9.3.2 Cluster 2 LOCKED V1 (Q4=A+Q5=A defer auto-detection biometrics v1.5+)
  - CSS dead code `.lb-hrv` styles scos
  - Theme picker compliance: Alabaster swatch corect cremos `#faf7f1 + #c8412e` per V2 SSOT + Obsidian rename "Living Body" cu swatch real V8 `#07090f + #d4a574` + Carbon → "⋯ Curând" placeholder disabled (`opacity:0.5; cursor:not-allowed`) + footer wording "3 teme V1" → "2 teme disponibile. Următoarele vin pe parcurs."
  - Breadcrumb settings row "Teme | Cremos" → "Teme | Living Body" consistent skin activ
- Output post compliance fixe: 2456 → 2425 LOC (-31 LOC scope creep eliminat)

### Naming corrections post-CD (Andura Clasic V2)

- "Pilot Automat" → **"Auto"** (simplified naming chat-NEW1 LOCK) — applied manual Daniel post-CD livrare
- Settings breadcrumb "Cremos" → **"Andura Clasic"** (consistency naming uniform brand-prefixed across mockups, applied chat-current 2026-05-08 §CC.5 fast ingest commit 2)

---

## Themes V1 LOCKED (per PRE_LAUNCH_CHECKLIST_V1 §Daniel updates 2026-05-08)

**Plan revizuit V2 default + 3 themes "când gata CD":**
- Andura Clasic = skin 1 LANDED ✅ (baseline V2 SSOT)
- Andura Living Body = skin 2 LANDED ✅ (V8 compliance fixe)
- 2 remaining themes "când gata CD" PENDING — theme picker afișează "⋯ Curând" placeholder pentru cele 2 până ready
- ⚠️ SUPERSEDED chat-8 carry-forward "6 themes a11y WCAG AA pre-Beta candidate" — NU mai canonical, plan revizuit Daniel updates 2026-05-08 chat NEW PRE_LAUNCH_CHECKLIST_V1 §DROPPED

---

## Deprecated (historical reference)

- **`andura-v2-2026-05-07.html`** (DELETED 2026-05-08 chat-current) — superseded by skin-themed naming convention LOCK V1. Content preserved în `andura-clasic.html` cu breadcrumb consistency rename "Cremos" → "Andura Clasic".
- **V1** (chat-NEW1 review baseline) — superseded by V2 post 2026-05-07 chat-NEW2 naming pivot Antrenor/Progres + restructure. NU mai e canonical. NU stocat în acest folder (was scaffold visual pre-LOCK, conținut înlocuit V2).

---

## Mapping → production phase (NEXT)

Mockups skin-themed = design references SSOT. Implementation phase tactical multi-batch CC va translate:

1. Refactor UI production current → V2 SSOT design tokens + flow per flow (post Faza 3 STRANGLER engines wiring real)
2. Engine wiring orchestrator → UI components state hydration (state.js + IndexedDB + Firebase sync preserved)
3. Coach narrative dynamic engine-generated (replace mockup hardcoded text)
4. Themes V1 implementare via CSS variables (paleta Andura Clasic + Andura Living Body switch + 2 remaining "când gata CD")
5. Onboarding persist actual user data (replace mockup `goto()` only navigation)
6. Service Worker + PWA manifest + auth Phase 2 LANDED preserved

**Realist mockup → live andura.app:** 3-6 săpt CC continuous post Faza 3 STRANGLER 8/8 batches LANDED + React migration LOCK + tactical implementation.

---

## Cross-refs vault SSOT

- [[../../00-index/CURRENT_STATE]] §NOW chat-current §CC.5 fast ingest Faza 3 batch 3 + skin naming LOCK V1
- [[../../03-decisions/DECISION_LOG]] entry 2026-05-08 Faza 3 batch 3 + skin naming convention LOCK V1
- [[../../08-workflows/PRE_LAUNCH_CHECKLIST_V1]] §Daniel updates 2026-05-08 themes plan revizuit (V2 default + 3 themes "când gata CD" + theme picker "work in progress" placeholder)
- [[../../01-vision/ONBOARDING_SSOT_V1]] §63.1 Onboarding flow 5 ecrane
- [[../../03-decisions/023-llm-intent-interpretation]] Pain text + Equipment text drill ADR 023
- [[../../03-decisions/026-offline-coaching-decision-tree-exhaustive]] §9.3 (3 stări energy + Cluster 2 biometrics defer) + §9.X (8 engines V1)
- [[../../03-decisions/030-adapter-design-pattern]] Faza 3 STRANGLER pre-wiring foundation

---

🦫 **Bugatti craft. Quality > Speed. Design SSOT skin-themed brand-prefixed before code. Naming convention LOCK V1 2026-05-08.**
