# i18n Readiness Audit — 2026-04-26 NIGHT

**Scope:** `src/pages/` + `src/ui/` + `src/engine/` — hardcoded user-facing strings  
**Context:** App is currently Romanian-only (single-user personal tool). This audit establishes baseline for future i18n if needed.

---

## Architecture Assessment

### Current State: 100% Romanian, 0% i18n infrastructure

The app uses no i18n library, no translation keys, no locale abstraction. All user-facing strings are hardcoded inline in their usage context.

**Intentional design:** This is a personal fitness tool built for one Romanian-speaking user. i18n was not an ADR decision — not a gap, just scope.

---

## String Distribution by Layer

### Engine layer — coaching messages and labels

**High string density in engine:**

| Module | String category | Count |
|---|---|---|
| `proactiveEngine.js` | User-facing coaching alerts (10 checks) | ~10 messages |
| `readiness.js` | Score labels (Epuizat, Obosit, Normal, Bine, Excelent) | 5 labels + 5 sublabels |
| `readiness.js` | Verdict labels (Sesiune solidă, normală, moderată, ușoară, zi de rest) | 8 labels |
| `whyEngine.js` | Rationale explanations | 6+ text strings |
| `coachDirector.js` | Session messages | 2 messages |
| `reality.js` | Reality check messages | 3 messages |

**All strings are in Romanian.**

---

### Pages layer — UI labels and templates

`src/pages/` contains 468 lines with HTML/DOM string templates. All labels, buttons, section headers, and messages are Romanian inline strings in template literals.

Examples from pages:
- `weight.js`: Form labels like "Greutate", "Kcal", "Proteină"
- `coach/session.js`: Session UI labels
- `coach/renderIdle.js`: Dashboard text

**No i18n keys used anywhere.**

---

## Strings Categorization

### Category 1: Domain-specific coaching messages (HIGHEST density)

These are algorithmically generated and contextual:
```js
// proactiveEngine.js
message: `Readiness la ${todayScore} — zi bună pentru un PR. Nu ai mai setat niciun PR în 14 zile.`
message: `Grupe musculare neantronate 5+ zile: ${undertrained.join(', ')}.`
message: `Kcal medii ultimele ${values.length} zile: ${Math.round(avgKcal)}. Sub ${KCAL_TARGET} kcal — risc de masă musculară.`
```

**i18n effort:** HIGH — 10+ dynamic message templates with interpolation.

---

### Category 2: UI labels and navigation (MEDIUM density)

Static labels for form fields, section headers, buttons. All in `pages/`.

**i18n effort:** MEDIUM — many strings but mostly static.

---

### Category 3: Readiness scoring labels (LOW density, HIGH impact)

```js
READINESS_LABELS = {
  1: { emoji: '😴', label: 'Epuizat', sub: 'Somn prost, energie zero' },
  ...
}
```

These drive the readiness modal UI. Already extracted as `READINESS_LABELS` constant.

**i18n effort:** LOW — already a single object, easy to swap.

---

## i18n Readiness Score

| Dimension | Score | Notes |
|---|---|---|
| String externalization | 0% | No keys, no translation files |
| Dynamic interpolation | Inline template literals | Not compatible with standard i18n formats |
| Locale-aware formatting | None | Dates use hardcoded Romanian format |
| RTL support | N/A | Romanian is LTR |
| Plural handling | None | Hardcoded Romanian plurals |
| String isolation | Low | Strings mixed with logic |

**Overall i18n readiness: 0%** — not a regression since it was never a goal.

---

## Cost-to-Internationalize Estimate

If i18n were ever needed (e.g., adding English for sharing/scaling):

| Layer | Effort |
|---|---|
| Engine messages (proactiveEngine, whyEngine, reality) | HIGH — template literals with logic |
| Readiness labels | LOW — already in a constant object |
| Page templates | HIGH — 468+ lines of DOM template strings |
| Coaching rationale strings | MEDIUM |
| **Total** | **2-3 sprints minimum** |

---

## Recommendations (if i18n needed in FAZA 3+)

1. Extract all user-facing strings to `src/i18n/ro.js` (single locale map)
2. Use tagged template literals or a minimal `t(key, vars)` function
3. Start with proactiveEngine messages (most impact on user experience)
4. readiness.js is the easiest conversion (already in object form)

**Current recommendation:** No action. App is intentionally single-language. Logging findings for future reference only.

---

## Notable String Mixing Issue (OBSERVATION)

`src/engine/proactiveEngine.js:60` uses English:
```js
sub: 'Ready to crush it'
```

All other strings are Romanian. This one English phrase is in the `READINESS_LABELS` object (label 5: Excellent). Minor inconsistency.

---

*Generated: 2026-04-27 NIGHT AUTONOMOUS RUN*
