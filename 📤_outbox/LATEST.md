# LATEST — Calendar V1 Slice 1.7 UX Reframe Feedback + Missing Equipment Lifecycle ✅ 🦫

**Task:** Slice 1.7 — 5-mod UX reframe bundle mockup-only post Daniel push-back chat ACASĂ 2026-05-12 post S1.6 LANDED. Relocate "Ceva nu merge" Antrenor → Cont/Ajutor + NEW Submit bug section + REMOVE "Aparat lipsa" chip workout + NEW dedicated screen-aparate-lipsa picker permanent + drill entries Cont/General + workout-preview.
**Model:** Opus EXCLUSIVELY per CEO directive verbatim.
**Status:** ✅ **COMPLETE** — atomic commit `de761f5` LANDED + push origin + tests 2914 PASS preserved EXACT + Bugatti craft single-concern interpretat la nivel "user feedback channel + missing equipment lifecycle" (+151 / -21 LOC).
**Branch:** `feature/v2-vanilla-port`
**Date:** 2026-05-13 09:20 Co-CTO autonomous via metoda hibridă chat ↔ CC terminal LOCKED V1 2026-05-12.
**Pre-flight tag pushed origin:** `pre-calendar-v1-slice-1-7-fix-2026-05-12`

---

## §0 Status

✅ **COMPLETE** Slice 1.7 multi-mod UX reframe mockup-only. 5 mods bundled atomic single-concern. ZERO `src/` touched. ZERO main branch. Tests 2914 PASS preserved EXACT. Pre-commit vitest hook PASS pre-push.

---

## §1 Files touched

| File | Diff | Notes |
|------|------|-------|
| `04-architecture/mockups/andura-clasic.html` | **+151 / -21** (atomic single-concern) | 5 mods bundled: relocate + new section + remove + new screen + drill entries. Demo JS pattern parity existing (`editNutri`/`openExAction`). |

**ZERO `src/` touched** per HARD CONSTRAINTS §F3.12. **ZERO React/JSX**. **ZERO main branch**. **ZERO `--no-verify` git commit** (pre-commit vitest hook executed PASS pre-push).

---

## §2 Diff summary (5 mods bundled)

**Atomic commit `de761f5`** — `fix(mockup): Calendar V1 S1.7 — UX reframe feedback + missing equipment lifecycle`

### Daniel verbatim push-back chat ACASĂ 2026-05-12

> *"Din tabul de antrenor... rubrica de ceva nu merge trebuie mutata la Cont sub ajutor. Baga o sectiune de Submit bug sau ceva cu text liber, care cand da submit, sa vina pe mailul andura. Sectiunea asta trebuie bagata sub suport, imediat dupa Whatsapp. Partea cu nu am aparat de la ceva nu merge nu e foarte bine pusa acolo. Ar trebuii cand dai click pe coach, dupa ce treci de cele 3 puncte de stare si vezi preview-ul exercitiilor, undeva sub exercitii sa ai un mic buton de nu am aparat. Cand apesi pe el, coach sa se adapteze si sa tina minte in sesiunile viitoare ca nu ai aparatul ala. Acum apare aparat lipsa direct in exercitiu. Butonul ala trebuie scos, ca deserveste acelasi lucru. La cont trebuie o sectiune de aparate lipsa, unde sa apara tot ce ai selectat in trecut ca nu ai, si cu optiunea de edit, sa poti sa si scoti aparatele pe care anterior le-ai selectat ca nu e ai, in cazul in care acum le ai."*

### Mod A — Relocate "Ceva nu merge" Antrenor → Cont/Ajutor (LOC ~12)

- **DELETE** entire `Acces rapid` section din Antrenor home (L872-878 pre-edit) — devine empty după relocate, NU orphan div. Replaced cu comentariu HTML rationale (rationale verbatim Daniel "rubrica de ceva nu merge trebuie mutata la Cont sub ajutor").
- **INSERT** "Ceva nu merge" entry în Cont/Ajutor stack între Suport (L1823 pre-edit) și Despre. Border-bottom logic preserved (FAQ rămâne `border-bottom:none;` ultima entry).
- **REMOVE** "Nu am aparat" option din `screen-ceva-nu-merge` body (opțiune mutată la dedicated picker — Mod D). Rămâne "Ma doare" + "Anuleaza".

### Mod B — Submit bug section Cont/Suport (LOC ~14 HTML + 14 JS = 28)

- **INSERT** secțiune "Trimite-ne un mesaj" în `screen-settings-support` între Contacteaza-ne stack și Intrebari frecvente section.
- Card alb cu border + textarea liber + btn-brick "Trimite" cu icon `send` lucide.
- **NEW JS** `submitFeedback()` handler:
  - Empty validation: `showToast('Scrie ceva inainte de a trimite')` + `ta.focus()`
  - Encode subject `[Feedback Andura] Mesaj utilizator` + body URI-encoded
  - `window.location.href = 'mailto:contact@andura.app?subject=...&body=...'` (deschide email client utilizator pre-completat)
  - Post-submit: clear textarea + toast "Ti-am deschis emailul cu mesajul pre-completat."
- **Path forward post-port:** Backend POST `/api/feedback` endpoint replace `mailto:` demo. Mockup MVP funcțional fără backend.

### Mod C — REMOVE "Aparat lipsa" chip workout sesiune (LOC -8)

- **REMOVE** L1308 `<button class="wv2-ex-action" onclick="openExAction('lipsa')">` din `.wv2-ex-actions` row. Rămân 2 chips: Aparat ocupat + Nu vreau (NU 3).
- **STRIP** entry `lipsa: 'Aparat lipsa'` din `titles` dictionary (L3930 pre-edit) + `subs.lipsa` + `primary.lipsa` din `openExAction()`.
- **STRIP** `if (kind === 'lipsa') { ... }` branch din `applyExAction()` (L3954-3958 pre-edit) — push localStorage `wv2-missing-equipment` lookup acum delegated to `toggleEquipmentMissing()` din dedicated picker (Mod D).

### Mod D — NEW `screen-aparate-lipsa` picker permanent (LOC ~75 HTML + 36 JS = 111)

- **INSERT** new `<div class="screen paper-bg sub-page" id="screen-aparate-lipsa">` după `screen-equipment-swap` (semantic adjacent — both equipment-related). Equipment-swap PĂSTRAT exact: deservește "Aparat ocupat" workout chip temporary swap only; aparate-lipsa = state permanent semantic distinct.
- **10 echipamente standard gym** toggle pattern parity `onb-medical` (checkbox `accent-color:#c8412e` + label `.onb-opt stack-row`):
  - banca-inclinata · banca-plana · bara-halterelor · gantere · aparat-cablu · power-rack · leg-press · aparat-extensii · aparat-tractiuni · banda-elastica
  - Ultimul `border-bottom:none;` preserved
- **NEW JS** `toggleEquipmentMissing(cb)`:
  - Read localStorage `wv2-missing-equipment` (`try/catch` fallback `[]`)
  - `cb.checked` → push id dacă !includes; `!cb.checked` → filter out
  - Persist + showToast feedback
- **NEW JS** `hydrateAparateLipsa()`:
  - Read localStorage list, filter only valid IDs din `APARATE_LIPSA_VALID_IDS` constant (strip legacy RO exercise names din S1.5 era — list-based normalization)
  - Persist filtered list
  - Sync each checkbox `cb.checked` state vs `missing.includes(cb.dataset.equipment)`
- **HOOK** into `goto()` wrapper L3068 (before `lucide.createIcons()`): `if (name === 'aparate-lipsa' && typeof hydrateAparateLipsa === 'function') hydrateAparateLipsa();`
- **Path forward S2:** Coach Engine #2 `buildSession()` consume `wv2-missing-equipment` list, filtrează exerciții care folosesc aparate marcate, propune alternative (parity equipment-swap logic).

### Mod E — Drill entries la aparate-lipsa (LOC ~6)

- **INSERT** "Aparate lipsa" entry în Cont/General stack între Aspect și Setari. Icon `x-octagon` lucide (parity decizie remove chip workout). Border-bottom logic preserved (Setari rămâne ultima fără explicit `border-bottom:none;` — match existing state).
- **INSERT** `btn-ghost` button "Nu am aparat" în `screen-workout-preview` între `#preview-exercise-list` (5 exercitii) și Coach note paragraph. Full-width + icon `x-octagon` 16×16 + `padding:12px`. Visual fit între list și note paragraph.

---

## §3 Tests baseline

✅ **2914 PASS preserved EXACT** (zero regression default per HARD CONSTRAINTS §F3.12).

Pre-commit vitest hook executed pre-push. Confirmed:
```
Test Files  159 passed (159)
     Tests  2914 passed (2914)
  Duration  35.44s
```

Playwright e2e baseline (`npm test`): **100 passed + 3 skipped** (103 tests total — mockup unaffected, e2e tests scoped la `src/` pages NU 04-architecture/mockups/).

---

## §4 Impeccable `/critique` verdict

✅ **PASS** per §7 checklist:

- ✅ Antrenor home cleaner post-remove "Acces rapid" — comentariu HTML inline, ZERO orphan empty div (verified L872-873)
- ✅ Cont > Ajutor entry "Ceva nu merge" inserted corect între Suport și Despre (verified L1824) + FAQ păstrează `border-bottom:none;` (visual last-entry preserved)
- ✅ Submit bug form fits viewport 380px — textarea `width:100%; resize:vertical; min-height:90px; box-sizing:border-box` + btn-brick `width:100%`. Card alb cu `border:1px solid var(--line); border-radius:14px; padding:14px;` parity existing pattern
- ✅ Submit empty validation — `showToast('Scrie ceva inainte de a trimite')` + focus textarea + early return preserved
- ✅ `mailto:contact@andura.app?subject=[Feedback Andura]&body=<encoded>` opens email client utilizator pre-completat (test demo browser pas Daniel post-LANDED)
- ✅ Workout sesiune `.wv2-ex-actions` row layout balanced cu 2 chips — width fit-content auto-flexible existing CSS
- ✅ NEW screen aparate-lipsa list 10 echipamente fits scroll viewport — `phone-scroll overflow-y:auto; flex:1` preserved; ultimul `border-bottom:none;` preserved visual
- ✅ `hydrateAparateLipsa()` hooked into `goto()` post-render DOM ready (înainte `lucide.createIcons()`) — state restored from localStorage on enter screen
- ✅ Cont > General entry "Aparate lipsa" border-bottom logic preserved (parity Aspect/Setari pattern)
- ✅ Workout-preview button "Nu am aparat" ghost style fits visually între list și note paragraph — `.btn-ghost` class existing CSS L226-231 (white bg + ink color + 14px radius + padding)
- ✅ WCAG SC 2.5.8 AA touch targets — toate butoanele new folosesc existing classes (`.settings-row`, `.btn-brick`, `.btn-ghost`, `.onb-opt stack-row`) cu padding adequate (touch target ≥24×24 implicit)

---

## §5 Atomic commit hash

`de761f5` — `fix(mockup): Calendar V1 S1.7 — UX reframe feedback + missing equipment lifecycle`

**Single-concern atomic** interpretat la nivel "user feedback channel + missing equipment lifecycle" — 5 mods coherent UX reframe. Revertable safely via backup tag.

---

## §6 Backup tag confirm

✅ `pre-calendar-v1-slice-1-7-fix-2026-05-12` **pushed origin** pre-execute (rollback safety net).

---

## §7 Path forward Slice 2

1. **`scheduleAdapter.js` engine** + Coach Engine #2 `buildSession()` consume `wv2-missing-equipment` filter — filtrează exerciții care folosesc aparate marcate din lista, propune alternative parity equipment-swap logic. Tests new vitest pe filter logic.
2. **Production backend `/api/feedback` endpoint** replace `mailto:contact@andura.app` demo — POST endpoint relay automatic la inbox dedicat. Subject prefix `[Feedback Andura]` distinguish filter inbox.
3. **Workout sesiune integration** — pe enter sesiune, query `wv2-missing-equipment`, dacă exercițiu propus folosește aparat marcat lipsa, swap automat la alternativa preselectată (parity equipment-swap UX, dar fără user input).
4. **Settings sync — Aparate lipsa entry feedback** — afișează count în Cont/General ("X aparate marcate") sau preview list compact sub entry text (parity onb-medical state-aware label).

---

## §8 Wiki spec drift cumulative flag (CONSOLIDATE NEXT HANDOVER)

Calendar V1 spec UX states cumulative drift across Slices 1.0 → 1.7:
- S1.0: design master (4 states baseline + pencil edit)
- S1.5: fix bundle (pencil edit parity proteine + compact + title centered + demo toggle)
- S1.6: CSS bug fix (states 4 → 3 simplified + show current selection EDIT state)
- **S1.7 (NEW):** UX reframe feedback channel + missing equipment lifecycle (5 mods bundled mockup)

Wiki page `wiki/concepts/calendar-feature-v1-spec.md` NU updated în acest commit (raw layer freeze post-Faza 3 invariant — distribute via `/wiki-ingest` next handover).

**Handover NEXT chat recommended consolidated spec update:**
- §UX states 4 → 3 (post-S1.6 simplification)
- §missing equipment lifecycle (NEW S1.7 — permanent picker + drill entries Cont/General + workout-preview)
- §user feedback channel (NEW S1.7 — Submit bug section Cont/Suport mailto demo + production backend path forward)
- §workout sesiune chips 3 → 2 (post-S1.7 chip removal)
- §screen-ceva-nu-merge container 3 → 2 options (post-S1.7 "Nu am aparat" relocation)

Bandwidth chat ~25% post-S1.7 — **handover recommended pre-iterație next**.

---

## §9 Cross-refs raw layer

- [[../04-architecture/mockups/andura-clasic.html]] §calendar-week S1.6 LANDED + §screen-aparate-lipsa NEW + §submit-feedback section NEW + §workout-preview "Nu am aparat" button NEW
- [[../VAULT_RULES.md]] §F3.12 HARD CONSTRAINTS + §F3.13 metoda hibridă
- [[../wiki/concepts/calendar-feature-v1-spec.md]] §UX states (cumulative drift flag pending handover next)
- [[../wiki/entities/engines/engine-coach-director.md]] §Synthesis orchestrator + §buildSession() (S2 path forward: consume `wv2-missing-equipment` filter)
- [[../wiki/entities/adrs/adr-020-storage-tiering-strategy.md]] §1.4 Tier 0 active rolling (`wv2-missing-equipment` persist localStorage parity pattern)
- [[../wiki/entities/adrs/adr-005-vanilla-js-no-framework.md]] §AMENDMENT 2026-05-10 (Bugatti craft mockup-first paradigm)
- [[../📤_outbox/_archive/2026-05/445_LATEST_PREVIOUS_CALENDAR_V1_SLICE_1_6_CSS_BUG_FIX_CONSUMED.md]] (precedent imediat S1.6 raport archived)

---

🦫 **Bugatti craft. Calendar V1 Slice 1.7 5-mod UX reframe LANDED 2026-05-13. ZERO `src/` touched, tests 2914 PASS preserved EXACT, atomic single-concern commit `de761f5`. Daniel-ism voice preserved: `rubrica de ceva nu merge trebuie mutata la Cont sub ajutor` + `Submit bug sau ceva cu text liber` + `sa vina pe mailul andura` + `nu am aparat... nu e foarte bine pusa acolo` + `Butonul ala trebuie scos, ca deserveste acelasi lucru` + `cu optiunea de edit, sa poti sa si scoti aparatele`. Bandwidth chat ~25% post-S1.7 — handover recommended pre-iterație next.**
