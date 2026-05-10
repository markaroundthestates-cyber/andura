# TASK 29 — Text Liber Edge Cases Polish · Cross-Skin × 4 (NEED_CONTEXT)

**Model:** Opus
**Velocity:** ~20-30 min CC autonomous (4 mockup files atomic + edge cases polish)
**Cluster:** #9 Text liber re-fix · Atom 1/2
**Authority:** ADR 023 textbox liber preserved sub Task 07 "Ceva nu merge" merge — toggle "Altceva" Marius power user post 3 opțiuni predefined preserved

---

## ⚠️ NEED_CONTEXT_DANIEL inline

**Status: EDGE CASES UNSPECIFIED**

Per CURRENT_STATE Cluster #9 referință vagă "Text liber re-fix". Edge cases concrete possibly include (Co-CTO scope guess based on standard textbox patterns):
- **Char limit** (max length 200/500/1000?)
- **Validation chars** (allow-list vs deny-list special chars / emoji)
- **Persistence** (save draft între sessions / clear on submit / auto-clear)
- **Autocomplete suggestions** (history previous entries Marius repeated patterns)
- **Empty submission** (block / allow / prompt confirm)
- **Multi-line** (textarea height auto-grow)

Daniel completează: Listă concretă edge cases identified chat noapte. Sau Co-CTO scope decide: implement sane defaults + raport explicit decisions per edge case + Daniel decide modificări.

---

## §0 Pre-flight grep MANDATORY

```bash
# Locate text liber / "Altceva" textboxes per skin
for skin in clasic living-body luxury brain-coach; do
  echo "=== $skin Altceva textbox ==="
  grep -niEB 2 -A 2 "Altceva|altceva|text-liber|text liber|textarea|<input type=\"text\"" 04-architecture/mockups/andura-$skin.html | head -25
done

# Verify ADR 023 spec
grep -niE "ADR 023|pain text|equipment text|text drill|toggle Altceva" 03-decisions/023-pain-equipment-text-input-layer.md 2>/dev/null | head -15

# Verify Task 07 "Ceva nu merge" merge wiring
grep -niE "Ceva nu merge|drill.*4 opțiuni|Altceva.*free.*text" 00-index/CURRENT_STATE.md | head -10
```

---

## §1 Scope

Polish text liber edge cases cross-skin × 4 mockup files atomic per ADR 023 textbox liber preserved + Task 07 "Ceva nu merge" merge drill flow.

**Sane defaults Co-CTO scope (Daniel adjust dacă needed):**

1. **Char limit:** `maxlength="500"` (sufficient pentru free description "Mă doare genunchiul stâng după 3 seturi" + buffer Marius power user verbose)
2. **Validation chars:** allow standard text + numbers + punctuation + emoji (NU restrict — Marius creative). Block `<script>` tags via DOM.textContent assignment standard
3. **Persistence:** clear post submit (NU save draft între sessions — privacy + no clutter pattern Andura minimalist)
4. **Empty submission:** block (button disabled until length ≥ 3 chars trim)
5. **Multi-line:** `<textarea>` cu `rows="3"` initial + auto-grow CSS `field-sizing: content` modern (fallback fixed height dacă browser support N/A)
6. **Char counter visual:** `<span class="char-count">0/500</span>` updated onkeyup (small + grey, NU pushy red until 90%+)
7. **Placeholder text:** specific per context drill ("Ce nu funcționează?" pentru "Ceva nu merge" / "Detalii preferință" pentru alte free text fields)

**Acțiuni atomic cross-skin × 4 mockup files:**
1. **Identify** toate textbox-uri liber existing (ADR 023 + Task 07 derived + others)
2. **Apply sane defaults** uniform cross-skin × 4 per spec
3. **Char counter UI** consistent palette per skin (cosmetic only diff)
4. **NU touch** Engine code (`src/`) — UI mockup only

**Theme Parity Invariant V1:** Logic 1:1 strict (validation rules identic, char counter identic, palette/font diferă).

**NU touch:**
- Engine code `src/`
- Pain Button mid-session merge (Task 07 already done)
- Other clusters

---

## §2 Files modify

- `04-architecture/mockups/andura-clasic.html`
- `04-architecture/mockups/andura-living-body.html`
- `04-architecture/mockups/andura-luxury.html`
- `04-architecture/mockups/andura-brain-coach.html`

Atomic single commit cross-skin × 4 themes uniform.

---

## §3 Acceptance criteria

1. ✅ Pre-flight grep textbox liber identified per skin
2. ✅ Char limit `maxlength="500"` applied uniform cross-skin × 4
3. ✅ Char counter UI present `0/500` updated onkeyup
4. ✅ Empty submission block (button disabled length < 3 trim)
5. ✅ Multi-line `<textarea>` cu auto-grow CSS modern
6. ✅ Placeholder context-specific per drill location
7. ✅ Persistence clear post submit (NO draft save)
8. ✅ **Diff parity verify:** logic identical 4/4
9. ✅ Tests 2731 PASS preserved EXACT
10. ✅ Build PASS
11. ✅ Manual smoke 4 themes — textbox edge cases walk-through (limit / counter / disabled / placeholder)

**NEED_CONTEXT_DANIEL flag** dacă raport reveals edge case Daniel wants different.

---

## §4 Backup tag

```bash
git tag pre-task29-textliber-edge-cases-$(date +%Y-%m-%d-%H%M)
git push origin pre-task29-textliber-edge-cases-$(date +%Y-%m-%d-%H%M)
```

---

## §5 Commit message

```
feat(textliber-polish): edge cases polish cross-skin × 4

Per ADR 023 textbox liber preserved sub Task 07 "Ceva nu merge" merge.

Sane defaults applied:
- maxlength="500" + char counter "0/500"
- Empty submission block (length < 3 trim)
- Multi-line textarea + auto-grow CSS modern
- Placeholder context-specific per drill
- Persistence clear post submit (NO draft save)

Cluster #9 Text liber re-fix · Task 29/N Phase 2 orchestrator.
Theme Parity Invariant V1 — 4 mockup files atomic cross-skin uniform.
Tests 2731 PASS preserved EXACT.

Cross-refs:
- ADR 023 pain text + equipment text input layer
- Task 07 "Ceva nu merge" merge drill preserved Altceva textbox
```

---

## §6 Raport format `📤_outbox/LATEST.md`

```
## TASK 29 — Text Liber Edge Cases Polish Cross-Skin × 4

- **Model:** Opus
- **Status:** Complete | Issue: <details>
- **Pre-flight:** <textbox liber instances enumerated per skin>
- **Modificări per-skin:**
  - Clasic: <atomic diff>
  - Living Body: <atomic diff>
  - Luxury: <atomic diff>
  - Brain Coach: <atomic diff>
- **Diff parity 4/4:** Verified identical logic edge cases
- **Tests:** 2731 PASS preserved
- **Build:** PASS
- **Commit:** <SHA>
- **Pushed:** origin/main
- **NEED_CONTEXT_DANIEL flag:** <list edge cases needing Daniel adjust>
- **Issues:** <none | per-skin failures>
- **Next action:** TASK 30 ("Altceva" wiring verify cross-skin × 4 sub Task 07 merge)
```
