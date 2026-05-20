# TASK 7 — Wording inventory extract pentru Daniel CEO review batch

**Track:** Wording backlog post-smoke (per `ANDURA_PRIMER.md` §6 Track 3 + `DECISIONS.md §D-LEGACY-067`).
**Category:** PROC / extract-only (ZERO autonomous edit user-facing wording).
**Atomic commit type:** `docs(wording-review):` artefact dedicat în vault.

## Intent

Per `DECISIONS.md §D009` CEO scope strict UI wording autonomous compose = SLIP DEFAULT surface options.

Triple LANDED 2026-05-15 introduce wording user-facing NEW (LOCK 9 + LOCK 10 + LOOP CLOSE). Plus alte zone existing care merită review. CC NU autonomous edit — extract toate wording user-facing relevant într-un document Daniel-ready pentru CEO review batch ulterior.

**Output = document curat, formatted clear, NU patches. Daniel decide singur ce schimbă post-extract.**

## Discovery scope

### 1. Triple LANDED 2026-05-15 cluster wording

```bash
# LOCK 9 Aggressive Loading user-facing strings
git diff e44137f^..e44137f -- "*.js" "*.html" | grep -E "^\+.*['\"][A-ZĂÂÎȘȚa-zăâîșț]"

# LOCK 9 LOOP CLOSE
git diff 892ebca^..892ebca -- "*.js" "*.html" | grep -E "^\+.*['\"][A-ZĂÂÎȘȚa-zăâîșț]"

# LOCK 10 MMI Engine #9
git diff e6fd974^..e6fd974 -- "*.js" "*.html" | grep -E "^\+.*['\"][A-ZĂÂÎȘȚa-zăâîșț]"
```

### 2. Specific zone flagged PRIMER §6 Track 3 + D-LEGACY-067

- LOCK 10 MMI buttons: "Reincep treptat (recomandat)" / "De la zero"
- LOCK 10 MMI refuse banner wording
- LOCK 10 diacritics strip decision (cross-ref TASK 6 ambiguity flags)
- LOCK 9 aaFrictionModal wording potential review (deferred V1 F5 modal, dar component code exists src/)

### 3. TASK 3 wording marked TODO(CEO-review)

```bash
grep -rn "TODO(CEO-review)" src/ | head -20
```

Include în inventory wording-uri marcate explicit during TASK 3 KCAL_FLOOR toast implementation.

### 4. TASK 6 ambiguity flags

Wording-uri unde strip diacritice cauzează ambiguity (rare). Include în inventory cu sugestie alternative phrasing pentru Daniel decide.

## Output format

Scrie inventory la:
`08-workflows/WORDING_REVIEW_BATCH_2026-05-16.md`

Format:
```markdown
# Wording Review Batch — 2026-05-16

CEO review pending per DECISIONS.md §D009. Toate wording-uri user-facing din triple LANDED 2026-05-15 + TASK 3 TODO + TASK 6 ambiguity.

## §1 LOCK 10 MMI Engine #9 wording

### 1.1 Buttons "Reincep treptat" / "De la zero"

**Locație:** `src/coach/mmi.js` (sau path real CC discovery) line <N>.
**Current verbatim:**
> "Reincep treptat (recomandat)"
> "De la zero"

**Context:** După hiatus user 14+ zile, MMI offer two paths return — gradual ramp vs full reset.

**Daniel review questions:**
- Wording clear pentru Gigel? "Reincep treptat" → coloquial OK?
- "(recomandat)" parantheză = stiluri brand voice? Sau drop parantheză?
- "De la zero" → tonul corect pentru reset hard? Alternativ: "Pornesc proaspat" / "Resetez tot" / etc.?

**Alternative draft options (NU autonomous applied):**
- (A) Verbatim current
- (B) "Continui usor" / "Iau de la inceput"
- (C) "Reincep ritmul vechi" / "Schimbam total"

### 1.2 Refuse banner wording

[similar structure]

### 1.3 Other LOCK 10 strings

[list verbatim cu locații]

## §2 LOCK 9 Aggressive Loading wording

[similar structure]

## §3 LOCK 9 LOOP CLOSE wording

[similar structure]

## §4 TASK 3 TODO(CEO-review) — KCAL_FLOOR toast

**Locație:** `src/import/...` (sau path real).
**Draft current:**
> "Am observat N zile cu < 1200 kcal. Coach-ul exclude acele zile din calibrare (poate fi underreport). Datele rămân salvate."

**Context:** Anti-paternalism informative toast (NU block), surfaces engine-side LOCK 8 filter to user transparency.

**Daniel review:**
- "underreport" → tech jargon? Gigel-friendly alternativ: "raportate gresit" / "incomplete"?
- Lungime acceptabilă? Sau prea verbose pentru toast (~5 sec read)?
- Tonul anti-paternalism preserved? "Datele rămân salvate" reassurance gentle?

## §5 TASK 6 diacritics ambiguity flags

[list cazuri specific unde strip diacritice cauzează ambiguity, cu suggestion alternative]

## §6 LOCK 9 aaFrictionModal (deferred V1, cod existing)

[scopul curent component, wording existing, flag pentru review chiar dacă defer prevent surprise post-Beta]

---

🦫 **Wording inventory complete. Daniel CEO review batch ulterior post Bugatti Audit Nuclear. ZERO autonomous edit applied (D009 invariant).**
```

## Reguli invariante

- **ZERO autonomous edit wording user-facing.**
- Extract verbatim current (NU paraphrase).
- Suggest alternatives draft (CEO scope), NU apply.
- Daniel decide post-extract ce schimbă (TASK 7 entry point pentru CEO review session dedicată).
- Context per wording — Gigel test mental aplicat (NU autonomous decision, ci surface pentru Daniel aplicat manual).

## Acceptance criteria

- [x] Inventory file scris la `08-workflows/WORDING_REVIEW_BATCH_2026-05-16.md`.
- [x] Toate triple LANDED 2026-05-15 strings user-facing acoperite.
- [x] TASK 3 TODO(CEO-review) inclus.
- [x] TASK 6 ambiguity flags inclus.
- [x] LOCK 9 + LOCK 10 specific zone PRIMER §6 Track 3 acoperite verbatim.
- [x] ZERO src/ edited.
- [x] Alternative drafts suggested (cu marker explicit "NU autonomous applied").
- [x] Commit `docs(wording-review): wording inventory batch 2026-05-16 pentru Daniel CEO review`.

## Raport per task

```
TASK 7 ✓/✗ — <commit hash>
- Inventory file: 08-workflows/WORDING_REVIEW_BATCH_2026-05-16.md
- Wording entries: <count>
- Coverage: LOCK 9 ✓ | LOCK 10 ✓ | TASK 3 TODO ✓ | TASK 6 ambiguity ✓ | aaFrictionModal ✓
- Daniel next action: CEO review session dedicată post Bugatti Audit Nuclear
```
