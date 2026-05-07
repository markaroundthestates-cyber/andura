# Andura UI Mockups — Design References

**Owner:** Daniel (CEO + Product) + Claude Co-CTO + Claude Design (CD chat)  
**Purpose:** Visual design references SSOT pre-implementation phase. CC translate mockup → production code. NU production code direct, NU executable app.

---

## Current SSOT (active)

- **`andura-v2-2026-05-07.html`** — V2 post chat-NEW2 birou UX pivot SUPERSEDE chat-NEW1 + bloc closure 8 itemi tactici LOCKED. Spec V1 ~685 cumulative coverage ~99%. **Current design reference active for implementation phase.**

### Coverage scope V2

- Root nav 4 taburi V2 LOCK: Antrenor / Progres / Istoric / Cont (SUPERSEDE chat-NEW1 Sala/Antrenor/Istoric/Cont)
- Antrenor restructure: Programe MUTATE Progres→Antrenor + Bibliotecă drill 2° + RPE post-sesiune drill
- Pain Button + Equipment swap drill 2° (3 predefined + Altceva text input ADR 023)
- 3 stări energy SUPERSEDE 5 production drift: 🟢 Excelent / 🟡 Normal-OK / 🔴 Obosit + drill 4 cauze
- Onboarding §63.1 5 ecrane order: Obiectiv → Vârstă → Sex → Istoric medical → Frecvență (<45 sec target)
- Cont V2 inventar complet: Profil&ținte / Notificări / Abonament / Aspect Themes 3 V1 / Setări destructive confirms / Date&Confidențialitate / Zonă Sensibilă / Footer v1.0.0
- 3 themes V1 LOCKED: Obsidian / Alabaster / Carbon (NU 6, NU 4)
- Selector limbă RO/EN text toggle Apple-style state-flip (NU steguleț, NU dropdown)
- Patterns universal: zero-modal / zero-dropdown / drill-down universal physical pages / destructive confirm pattern
- Persona switcher mock-only REMOVED pre-production
- Vestigial cleanup: modal-backdrop CSS + showMedical/Logout helpers REMOVED

### Naming corrections post-CD

- "Pilot Automat" → **"Auto"** (simplified naming chat-NEW1 LOCK) — applied manual Daniel post-CD livrare

---

## Deprecated (historical reference)

- **V1** (chat-NEW1 review baseline) — superseded by V2 post 2026-05-07 chat-NEW2 naming pivot Antrenor/Progres + restructure. NU mai e canonical. NU stocat în acest folder (was scaffold visual pre-LOCK, conținut înlocuit V2).

---

## Mapping → production phase (NEXT)

Mockup V2 = design reference SSOT. Implementation phase tactical multi-batch CC va translate:

1. Refactor UI production current → V2 design tokens + flow per flow (post Faza 3 STRANGLER engines wiring real)
2. Engine wiring orchestrator → UI components state hydration (state.js + IndexedDB + Firebase sync preserved)
3. Coach narrative dynamic engine-generated (replace mockup hardcoded text)
4. 3 themes V1 implementare via CSS variables (paleta Obsidian/Alabaster/Carbon switch)
5. Onboarding persist actual user data (replace mockup `goto()` only navigation)
6. Service Worker + PWA manifest + auth Phase 2 LANDED preserved

**Realist mockup → live andura.app:** 3-6 săpt CC continuous post Faza 3 + React migration LOCK + tactical implementation.

---

## Cross-refs vault SSOT

- [[../../00-index/CURRENT_STATE]] §NOW chat-NEW2 birou UX pivot Antrenor/Progres + bloc closure
- [[../../📥_inbox/handover-chat-2026-05-07-birou-ux-pivot-naming-blocclosure]] handover chat-NEW2
- [[../../01-vision/ONBOARDING_SSOT_V1]] §63.1 Onboarding flow 5 ecrane
- [[../../03-decisions/023-llm-intent-interpretation]] Pain text + Equipment text drill ADR 023
- [[../../03-decisions/026-offline-coaching-decision-tree-exhaustive]] §9.3 (3 stări energy) + §9.X (8 engines V1)
- [[../../03-decisions/030-adapter-design-pattern]] Faza 3 STRANGLER pre-wiring foundation

---

🦫 **Bugatti craft. Quality > Speed. Design SSOT before code.**
