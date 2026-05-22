# Definition of Done — pre-Beta Feature Checklist

> **Authority:** Audit nuclear V3 §50-H1 closure 2026-05-22. Each new feature
> (F1-F15 + future) must satisfy ALL applicable items before merge to main.
> Codifies the Karpathy 4 principii applied + Bugatti craft + Co-CTO pattern.

---

## §1 Code

- [ ] **Karpathy SC (Surgical Changes)** — only lines that solve the request directly. ZERO refactor-while-fixing, ZERO drive-by formatting.
- [ ] **Karpathy SF (Simplicity First)** — minimum care rezolva. ZERO speculative features, NO abstractions for single-use, NO error handling for impossible scenarios.
- [ ] **Karpathy TBC (Think Before Coding)** — for new architecture / non-trivial logic, design considered (PLAN.md sau commit message rationale).
- [ ] **Karpathy GD (Goal-Driven)** — every changed line traces direct to feature requirement; verified via reverse-grep of commit diff vs spec.
- [ ] No `console.log` in src/react/ (only console.warn/error in defensive catch blocks, all stripped production via vite drop_console).
- [ ] No TODO/FIXME/HACK in new src/react/ code (vault wording backlog OK in en.json/observationFilter.js for explicit D024 backlog).
- [ ] Romanian no-diacritics rule (D-LEGACY-064) for UI strings + tests + commit messages.
- [ ] Atomic Bugatti single-concern commit (NU bundle unrelated work).
- [ ] No `--no-verify` bypass (pre-commit hook fail = fix root cause).

## §2 Types + lint

- [ ] `npm run typecheck` → 0 errors.
- [ ] `npm run typecheck:strict-js` → 0 errors for any new src/ JS modules.
- [ ] `npm run lint` → 0 warnings, 0 errors.
- [ ] No `as any` cast without inline justification (§1-M1 rationale comment + ADR ref).
- [ ] No `eslint-disable` without inline reason.

## §3 Tests

- [ ] Unit test added for new logic (Vitest in `src/.../__tests__/*.test.{js,ts,tsx}`).
- [ ] Integration test added if cross-module behavior (existing patterns: workoutStore + engineWrappers).
- [ ] `npm run test:run` → all tests pass (no `--retry` masking flakes).
- [ ] Coverage thresholds maintained (vitest.config.js §2-C2 thresholds).
- [ ] Romanian no-diacritics audit for test text — included in test corpus regex check.
- [ ] No `it.only` / `describe.only` / `xit` / `xdescribe` left in.

## §4 Accessibility (a11y)

- [ ] Form inputs have `<label htmlFor>` OR `aria-label` (§6-M3 LANDED cluster).
- [ ] Radio button groups have `role="radiogroup"` + `aria-labelledby` container (§6-M3).
- [ ] Modals have `role="dialog"` + `aria-modal="true"` + `aria-labelledby` + focus management.
- [ ] Buttons have visible focus indicator (Tailwind default or explicit `focus:ring`).
- [ ] Color is NOT the sole channel for semantic info (paired with text/icon).
- [ ] Tap targets ≥ 44×44 px (Maria 65 thumb anti-misclick).
- [ ] Heading hierarchy h1 → h2 → h3 (no skip levels).
- [ ] Screen reader RO NVDA + TalkBack tested for new flows (defer to nuclear pre-Beta).

## §5 Internationalization

- [ ] RO strings use NO diacritics in UI (D-LEGACY-064).
- [ ] EN bundle `src/i18n/en.json` has TODO_EN marker for any new RO string (Daniel wording session post-Beta).
- [ ] Romanian plural rules via `pluralRo(n, sg, pl)` helper (NU manual `n + ' sesiuni'`).
- [ ] Date formatting via `MONTH_RO_SHORT` constants (NU `Date.toLocaleString`).

## §6 Security

- [ ] No hardcoded secrets in source (VITE_* env vars instead).
- [ ] User input validated at boundary (numeric clamps min/max, regex for email/IDs).
- [ ] Destructive ops require fresh auth (`isAuthFresh()` check §A016).
- [ ] PII never logged to console.log/info/warn/error (Sentry beforeSend §17-M3 strips uid/email defensively).
- [ ] No `dangerouslySetInnerHTML` without explicit XSS justification.
- [ ] Firebase RTDB rules updated if new data path written (`database.rules.json`; Firestore equivalent `firestore.rules`).

## §7 Performance

- [ ] Lazy import `React.lazy` for new routes > 30KB (B007 LANDED pattern).
- [ ] Bundle size verified `npm run build` post-feature (track __outbox bundle-budget).
- [ ] No unnecessary `useEffect` re-fires (deps array reviewed).
- [ ] List rendering 100+ items considers virtualization (`@tanstack/react-virtual` if added).

## §8 Mockup parity (D015 LOCKED V1)

- [ ] Visual diff vs `04-architecture/mockups/andura-clasic.html` DESIGN MASTER.
- [ ] Tailwind classes match mockup tokens (NU custom hex unless var-backed).
- [ ] Dark theme palette respected (`[data-theme="dark"]` overrides).

## §9 Persona Gigel Test (mandatory pre-feature)

- [ ] **Gigel filter:** "Cum reactioneaza Gigel non-tech user mediu RO? Dubios pentru user?" → NOT "tehnic posibil?"
- [ ] **Maria 65:** large tap targets + plain language + low cognitive overhead + gracefully forgiving.
- [ ] **Marius:** numerical precision + advanced features accessible + NU dumbed-down.

## §10 Documentation

- [ ] Inline comments only when WHY non-obvious (hidden constraint, subtle invariant, workaround for specific bug).
- [ ] NO comments explaining WHAT (well-named identifiers do that).
- [ ] DECISIONS.md updated if LOCKED V1 strategic decision triggered.
- [ ] ANDURA_PRIMER.md §5 micro-append if substantial state change (phase landed, milestone).

## §11 Git

- [ ] Atomic single-concern Bugatti commit message.
- [ ] Commit message [SC] / [SF] / [GD] / [TBC] / [DOC] suffix tag.
- [ ] Targeted file paths in `git add` (NEVER `git add -A` at root).
- [ ] Push only on Daniel verbal trigger (D031 invariant).

## §12 Smoke test (post-LANDED)

- [ ] Run `npm run dev` + manual click-through new feature in browser.
- [ ] Console clean (zero new errors).
- [ ] No regression on adjacent features (test golden path + edge cases).
- [ ] Live smoke andura.app post-deploy if production-facing.

---

## §13 Feature-specific DoD addenda

For specific feature types, ADDITIONAL items apply:

**New screen / route:**
- [ ] Registered in `src/react/routes/router.tsx` (lazy import per B007 pattern)
- [ ] `gotoPath()` helper added if path used by other code (`src/react/lib/navigation.ts`)
- [ ] BottomNav state preserved (in-session hide if applicable)

**New Zustand store:**
- [ ] Persist middleware configured (`createJSONStorage` + `partialize` for non-persisted UI state)
- [ ] Store reset action implemented (used by wipeAllLocalData + tests)
- [ ] Hook usage pattern: select specific slice (NU return entire store)

**New engine:**
- [ ] ADR cross-reference added (or new ADR created if novel)
- [ ] Adapter wrapper if joining pipeline (D2 Hook 1 read-only CO convention)
- [ ] Feature flag for staged rollout (`util/featureFlags.js`)
- [ ] Golden-master parity test legacy ↔ orchestrated zero-behavior-change strict

**New Firebase write path:**
- [ ] `database.rules.json` (RTDB) and/or `firestore.rules` (Firestore) updated locking down read/write
- [ ] Deploy rules: `firebase deploy --only database` (RTDB) and/or `firebase deploy --only firestore:rules` (Firestore)
- [ ] Tier 2 retention policy documented (sync 26-M3 backup retention)

---

## §14 Pre-Beta gate (last-mile)

Before opening Beta to 50 testers, run full DoD checklist + additionally:
- [ ] All §1-§50 audit CRITICAL findings resolved (per `📤_outbox/audit-nuclear-2026-05-19/SUMMARY.md`)
- [ ] Daniel manual gates 5/5 (Phase 7 carry-forward smoke production)
- [ ] Privacy Policy + T&C functional verify (§28-C1 + §28-C2 LANDED via SettingsPrivacy + SettingsTerms)
- [ ] Medical Disclaimer + T&C consent flows functional (§9-H2 + §28-H4)
- [ ] GDPR right-to-erasure + portability functional (§28-C3 + §28-M3 LANDED via SettingsDanger + SettingsExport)
- [ ] Data breach response runbook in place (§28-C4 LANDED via `08-workflows/DATA_BREACH_RESPONSE.md`)
- [ ] DSR handler runbook in place (§28-H3 LANDED via `08-workflows/DSR_HANDLER.md`)

---

## §15 References

- `07-meta/karpathy-skills-ref/CLAUDE.md` §1-§4 — Karpathy 4 principii core
- `ANDURA_PRIMER.md` — Bugatti paradigm + persona definitions
- `DECISIONS.md` — SSOT singular live decizii append-only
- `CLAUDE.md` — project instructions Co-CTO mandate
- `08-workflows/BETA_ENTRY_CRITERIA.md` — Beta launch gates
- `08-workflows/HANDOVER_VERIFICATION_CHECKLIST.md` — post-LANDED Bugatti gate
- `📤_outbox/audit-nuclear-2026-05-19/SUMMARY.md` — pre-Beta audit findings
