## Task: Settings UI UX Polish — Findings UX-1 + UX-2
**Model:** Opus
**Status:** Complete

### Pre-flight
- Backup tag: `pre-settings-ui-ux-polish-2026-05-06-1015` ✅ pushed pre-execution
- Clean tree pre-execution: yes
- Hooks: normal — full `npm run test:run` PASS

**Pre-flight grep results:**
- Settings render în `src/pages/settings.js` cu 4 sections (email change + recovery + delete + logout)
- 4 button click handlers each open modal overlay appended la `doc.body` cu class `.andura-modal-overlay`
- Modals NU stack-block (overlays just append, no backdrop click trap) → mutual exclusivity nu enforcement implicit
- `signOut()` import din `../auth.js`; `goTo()` import din `../ui/nav.js` (lazy-import în settings.js per UX-2)
- Test pattern: vitest jsdom existing în `src/pages/__tests__/settings.test.js`

**Files touched plan:**
- `src/pages/settings.js` — add helper + wrap handlers + scheduler/onSignedOut opts
- `src/pages/__tests__/settings.test.js` — extend cu 10 NEW tests (UX-1 mutual exclusivity + UX-2 redirect)

### Modificări

**`src/pages/settings.js` (extended +57 LOC, no removals):**
- NEW exported helper `_closeAllSettingsModals(doc)` — removes all `.andura-modal-overlay` din doc.body. Defensive null/undefined doc handling.
- NEW const `SPLASH_VISIBLE_MS = 1500` — splash visibility window pre redirect home.
- NEW `renderSettingsPage` opts: `onSignedOut?: () => void` (default: lazy-import nav.js + `goTo('coach')`), `scheduler?: (fn, ms) => unknown` (default `setTimeout`, test injection).
- All 4 button handlers (email/recovery/delete/logout) call `_closeAllSettingsModals(doc)` la click start (UX-1).
- Logout + Delete account flows post-splash render: `scheduler(_onSignedOut, SPLASH_VISIBLE_MS)` (UX-2 redirect home).
- ZERO removals din existing logic — strict additive (low-risk regression).

**`src/pages/__tests__/settings.test.js` (extended +169 LOC, 10 NEW tests):**
- `describe('UX-1 mutual exclusivity — _closeAllSettingsModals helper')` × 4 tests: removes single overlay, removes all multiple overlays, no-op when none, null doc no-throw
- `describe('UX-1 mutual exclusivity — Settings buttons close prev modal first')` × 3 tests: email→recovery, email→delete, recovery→logout sequence chains assert single active overlay
- `describe('UX-2 post-logout redirect home — onSignedOut callback')` × 3 tests: full logout flow scheduler invoke + onSignedOut fire on cb call, delete account flow scheduler invoke + onSignedOut fire, logout cancelled NU invokes scheduler

### Build + Tests
- `npx vitest run src/pages/__tests__/settings.test.js` → 17 tests / 1 file PASS (~101ms)
- Full suite: **1391 → 1401 PASS** (+10 NEW), ZERO regression
- Build clean: vite 5.4.21 build 3.09s, 380 modules, 399.17 kB main bundle (+0.55 kB delta vs pre-fix pentru helper + opts)

### Commits
- `d4d28f7` feat(settings-ux): UX-1 mutual exclusivity modals + UX-2 post-logout redirect home

### Pushed
- origin/main: yes ✅

### Issues
- None blocking. Helper exported underscore-prefixed (`_closeAllSettingsModals`) per JS convention pentru "internal but tested" pattern. Could be made fully internal post-test stabilization (currently exported pentru direct unit test access).
- Promise leak acknowledgment: when `_closeAllSettingsModals` removes an overlay mid-flight, the Promise from `openModal()` remains unresolved (open-modal pattern relies on internal click → resolve). Acceptable trade-off pentru UX sanity vs Promise leak (microtask GC). Documented în JSDoc helper.

### Next action

**Daniel manual smoke localhost (post-fix verify):**
1. Open Settings (6th nav tab "Setări" ⚙️)
2. Click "Schimbă adresa" → email change form modal apare
3. Click "Șterge cont definitiv" → **email change modal dispare**, delete confirm modal apare singur (UX-1 verify)
4. Click "Mi-am pierdut accesul la email" → **delete modal dispare**, recovery modal apare singur
5. Close recovery modal (Înțeleg) → click "Deconectare" → step 1 (checkbox OFF default), Continuă → step 2, Da deconectează-mă → splash "Te-ai deconectat. Revino oricând." vizibil ~1.5s → **redirect automat Coach home** (UX-2 verify)
6. NU click final destructive butoane (cont real Daniel UID `2GsDvxqXc4bvQGSm8B1Zft5S05i2`)

**Handover entry recommendation (Daniel decide când):** post-smoke verify, append handover entry "Settings UI UX-1 + UX-2 fix LANDED" cu commit hash + Daniel verify confirmation.

**Pre-Beta P1 priority preserved:** SMTP custom Magic Link last mile (SendGrid Verify + Firebase SMTP config + Inbox test) — independent fix UX-1 + UX-2 NU dependent.
