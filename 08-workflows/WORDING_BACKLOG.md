# WORDING BACKLOG

**Owner:** Daniel (CEO + Product) · Co-CTO Claude chat
**Status:** DEFERRED post-Beta a-z review per D024
**Locked:** 2026-05-22 (Iter 1 Mass Fix V2 audit cluster KAPPA §47-H1)
**Cross-ref:** DECISIONS.md §D024 LOCKED V1 PERMANENT pre-Beta autonomous
compose

---

## §1 Scop

Backlog wording items deferred pre-Beta per D024 LOCKED V1 PERMANENT —
Co-CTO autonomous wording compose pre-Beta. Pre-Beta NO lawyer, NO copy
review. Daniel final a-z review pre-Launch nuclear.

Acest file capture items pe care le-am identificat ca "wording question"
in audit dar le-am pus pe DEFER pentru un singur batch review pre-Launch
in loc de per-item interrupts.

---

## §2 Items deferred (last 30 days)

### W-01 — MMI button labels (10 buttons)

- **File:** `src/react/components/MMI/*.tsx`
- **Question:** Are button labels MMI Engine clear pentru Gigel? Examples:
  - "Boost azi" — clear?
  - "Easy day" — Romglish OK sau "Zi usoara"?
  - "Cu tempo" — Marius understand, Gigel ?
- **Defer reason:** mass review during a-z polish pass post-Beta-gate, NU
  per-item interrupt now.

### W-02 — Refuse banner copy

- **File:** `src/react/components/RefuseBanner.tsx` (or similar)
- **Question:** Refuse banner when engine refuses to adapt — current copy
  technical sounding. Examples: "Adapter fallback active" — TRANSLATE pentru
  user.
- **Defer reason:** depends on §13-C1 Sentry wire si §48-H1 adapter integrity.

### W-03 — Diacritics strip consistency

- **Files:** UI strings throughout (LEGACY-064 NO-DIACRITICS rule)
- **Question:** Audit any leftover diacritics in UI tests / commit messages.
  Vault docs OK with diacritice. Code-side strict no-diacritics.
- **Defer reason:** lint-stage diacritics-check tooling post-Beta; manual
  verify pre-Launch nuclear.

### W-04 — Onboarding step 7 "Felicitări" tone

- **File:** `src/react/routes/screens/Onboarding.tsx` (Step 7 render)
- **Question:** corporate "Felicitări!" vs Daniel-direct warm "Gata, hai
  la treaba"? Cluster HIGH-ALFA §30-H2 flagged.
- **Defer reason:** Co-CTO autonomous compose per D024; sample current copy
  + propose Daniel-direct alternative in mass review.

### W-05 — Toast critical variant copy

- **File:** `src/react/components/Toast.tsx`
- **Question:** Audit §32-H3 critical variant non-dismissable safety notif —
  current copy patterns: "Atentie", "Important", "Risc". Standardize?
- **Defer reason:** safety-critical wording → Daniel personal review pre-Launch
  mandatory.

### W-06 — Error messages "validation_error" → user-friendly

- **Files:** error handling throughout
- **Question:** Validation errors (email format, password length absent
  pentru Magic Link, etc.) — currently mixed technical + plain.
- **Defer reason:** mass review with Gigel persona filter pre-Launch.

### W-07 — Empty state copy

- **Files:** Antrenor, Progres, Istoric empty states
- **Question:** "No data yet" copy variations — first session empty,
  cleared data empty, offline-no-sync empty. Distinct copy per case.
- **Defer reason:** post-Beta sample real-user friction signals before
  finalize.

### W-08 — Privacy + Terms text body

- **Files:** `src/react/routes/screens/cont/SettingsTerms.tsx`,
  `src/react/routes/screens/cont/SettingsPrivacy.tsx`
- **Question:** Current placeholder vs final GDPR-compliant text.
- **Defer reason:** Daniel legal review pre-Launch (CEO confirm),
  NOT lawyer per pre-Beta no-lawyer rule.

### W-09 — CTA variants Onboarding

- **Files:** `src/react/routes/screens/Onboarding.tsx` step transitions
- **Question:** "Continua" vs "Mai departe" vs "Inainte" — choose
  consistent + Daniel-direct.
- **Defer reason:** mass review.

### W-10 — Workout post-summary close-out variant

- **File:** `src/react/routes/screens/antrenor/PostSummary.tsx`
- **Question:** "Sesiune terminata" + close phrase variant. Cluster
  HIGH-GAMMA §F-post-summary-01.
- **Defer reason:** mass review.

---

## §3 Pre-Launch review process (post-Beta gate)

1. **Aggregate full UI strings** — script that extracts all visible-user
   text from src/react/ + UI tests + error messages.
2. **Apply persona filter** — for each string, mark Gigel/Marius/Maria
   verdict (PASS/FAIL/AMBIGUOUS).
3. **Compose Daniel-direct rewrite** per D024 LOCKED V1 — warm + direct +
   anti-paternalism + concise.
4. **Daniel single-pass approve** — CEO review batch (one sitting).
5. **Lock V1 final** — DECISIONS.md entry "Pre-Launch wording locked".
6. **Reset this file** — archive current backlog, start fresh post-Launch
   pentru ongoing copy polishing.

---

## §4 Anti-pattern flags

- **NU per-item interrupt Daniel pre-Beta** — per D024 LOCKED V1 PERMANENT
  Co-CTO autonomous compose. Daniel CEO + Product NU developer review
  pre-Beta.
- **NU lawyer pre-Beta** — MEMORY.md `feedback_no_pseudo_blockers.md`.
  Privacy/Terms text legal review = pre-Launch Daniel CEO + (optional
  subagent gsd-* legal review).
- **NU forced jokes** — Daniel humor light, genuine reaction > scripted.
  CLAUDE.md tone section.

---

## §5 Cross-ref

- **D024 LOCKED V1 PERMANENT:** Co-CTO autonomous wording compose pre-Beta
- **§47-H1 audit:** source finding pentru this backlog
- **D-LEGACY-064:** Romanian no-diacritics rule
- **MEMORY.md `feedback_no_pseudo_blockers.md`:** no lawyer pre-Beta
- **PERSONA_MENTAL_MODEL_VALIDATION.md §2.3:** Gigel jargon list

---

## §6 Audit chain

- New wording question identified in audit → append §2 entry
- Daniel pre-Launch review batch → process all items → DECISIONS.md
  LOCKED V1 entry + archive this file
- Post-Launch ongoing copy polish → reset cycle
