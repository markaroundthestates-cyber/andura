# §7 — UX Flows End-to-End Audit

**Scope:** Onboarding T0 Big 6 + workout flow + energy/pain/equipment + Calendar V1 7-day + 9 Cont sub-screens + edge cases + 5 moduri + PWA install + persona + recovery + pause/resume + 3-tab smoke + funnel + empty/error states + multi-device + logout + account deletion + critical journeys + progressive disclosure + tooltips + cognitive + settings change + back nav + deep linking + cross-device + equipment + aparate + pain
**Method:** Sample Splash + Auth + Onboarding + Antrenor + ProtectedRoute + router structure + 9 Cont screens; verify advertised features functional

## Severity matrix §7

| Severity | Count |
|----------|-------|
| CRITICAL | 4 |
| HIGH | 6 |
| MED | 6 |
| LOW | 3 |
| NIT | 2 |
| **Total** | **21** |

---

## CRITICAL findings

### §7-C1 — **Auth.tsx production ships "Mock login (Phase 5 dev)" BYPASS button to live users**
**Severity:** CRITICAL (Beta blocker + security exposure)
**Evidence:** `src/react/routes/screens/Auth.tsx:93-100`:
```tsx
<button
  type="button"
  onClick={handleMockLogin}
  data-testid="auth-mock"
  className="w-full mt-3 py-2 text-ink2 text-xs underline"
>
  Mock login (Phase 5 dev)
</button>
```
`handleMockLogin()` line 30-33: `setAuthenticated(true); navigate('/onboarding/1');`. No env gate. SHIPS to production at andura.app/auth.
**Karpathy:** Surgical Changes — env gate.
**Reasoning:**
- Any production user sees a "Mock login" button → click bypasses ALL auth → enters onboarding as authenticated-but-no-real-user-record state.
- Daniel-direct register breaks: "Mock login" English jargon visible to user-facing prod = anti-brand voice. Maria 65 confused.
- Security: enables anyone to circumvent Magic Link, then create local-only profile that doesn't sync. Pollutes Firebase if onboarding writes occur w/o real UID.
**Fix log:** Either:
- (a) DELETE entirely from Auth.tsx — per D028 production live.
- (b) Gate by `{import.meta.env.DEV && (<button>...)}` so dev-mode only.
- (c) Gate by `?dev=1` URL param for QA bypass needs.
Choose (b) immediately.

### §7-C2 — **Auth.tsx `handleSend()` DOES NOT call real `sendMagicLink()` — production shows "Link trimis" with NO email sent**
**Severity:** CRITICAL (Beta blocker — auth flow broken)
**Evidence:** `src/react/routes/screens/Auth.tsx:23-28`:
```tsx
function handleSend(): void {
  if (!isValidEmail(email)) return;
  // Phase 6+ real wire: import sendMagicLink from '../../auth/sendMagicLink.js'.
  // Phase 5 task_16 React-side flow scaffolded — confirmation message shown.
  setSent(true);
}
```
Comment acknowledges "Phase 6+ real wire" — UNRESOLVED. Production users at andura.app/auth click "Trimite link" → see "Link trimis" toast → wait for email → NOTHING. Phase 6 BATCH 24-task LANDED 2026-05-19 — but auth wiring NOT included.
**Karpathy:** Goal-Driven Execution — auth is the entry point.
**Reasoning:**
- Real `sendMagicLink()` exists in `src/auth.js:49` (vanilla) — tested + retries + email validation.
- React Auth.tsx never imports it.
- "Mock login" workaround (§7-C1) is dev shortcut → real users have NO PATH FORWARD.
- Beta launch with 50 testers: each opens andura.app, clicks Mock or waits forever for non-existent email → either way, user data not auth-bound → Firebase per-UID rules block sync silently → user thinks "broken app" → churn.
**Fix log:**
- `Auth.tsx`: import `sendMagicLink` from `'../../auth.js'` (or migrated TS version).
- `handleSend` → `const result = await sendMagicLink(email)` → if `result.ok`, `setSent(true)`; else show error toast.
- Wire Auth callback page (`/auth/callback` or post-magic-link landing).
- Resolve §4-C2 PLACEHOLDER_WEB_API_KEY simultaneously.

### §7-C3 — ProtectedRoute is **Phase 2 stub** — no real Firebase auth listener wired
**Severity:** CRITICAL (Beta blocker)
**Evidence:** `src/react/routes/ProtectedRoute.tsx:2-4` comment: "Phase 2 stub: redirect la /auth dacă !isAuthenticated. Phase 3+ wire real Firebase Magic Link state + onboarding gate (T0 Big 6 hard typing)."
- isAuthenticated state lives ONLY in Zustand `appStore` — set via `setAuthenticated(true)` (manual call, e.g., Mock login §7-C1).
- NO `onAuthStateChanged` Firebase Auth listener subscribing to real auth state.
- NO onboarding-completion gate (per spec, after onboarding T0 Big 6, user enters /app; before, should be /onboarding).
**Karpathy:** Goal-Driven — chain breaks at first contact w/ real auth.
**Reasoning:**
- A returning authenticated user opening andura.app: Splash sees `isAuthenticated = false` (default Zustand state on page load), CTA shows "Incepe", clicks → /auth → must mock or wait. The persisted localStorage `firebase-id-token` (vanilla auth wrote it) is NEVER read by React's appStore.
- Cross-device auth (§7.18, §7.28) impossible without real auth listener.
- Beta tester loop indefinite.
**Fix log:** Wire `appStore`:
```ts
import { onAuthStateChanged } from 'firebase/...'; // or src/auth.js getAuthState() + interval
useEffect(() => {
  // subscribe to auth state changes
  // setAuthenticated(true/false) reactively
}, []);
```
Add onboarding completion gate: ProtectedRoute checks `onboardingStore.completed === true`, else redirects /onboarding/1.

### §7-C4 — Onboarding T0 Big 6 bounds validation: NOT VERIFIED enforced at input level
**Severity:** CRITICAL (§30.6 — age 13-95, weight 30-250kg, frequency 0-14, height 100-220cm)
**Evidence:** `Onboarding.tsx:58-63` renders Step1-Step6 components passing `value/onChange` props. Step component internals NOT inspected here (deferred). Per §30.6 bounds validation strict — if not enforced at input level, engines may receive `age=8` or `weight=999` → demographic prior fails to map → engine outputs NaN.
**Karpathy:** Goal-Driven — engine math correctness depends on input bounds.
**Fix log:** Read each Step1-Step6 component (defer secondary pass); verify `min/max/step` attribute + JS validation on change. Add bounds at onboardingStore.setField if not.

---

## HIGH findings

### §7-H1 — Splash.tsx wordmark text "Antrenament cu cap. Facut in Romania." OK + Daniel-direct register
**Severity:** HIGH — positive finding
**Evidence:** `Splash.tsx:25` tagline accurate, no diacritics ✓, anti-jargon, warm RO.
**Resolution:** OK.

### §7-H2 — Persona detection NOT visible from sampled screens — Antrenor.tsx uses `coachStore.persona` but unclear where persona is set
**Severity:** HIGH (§7.10 + §30.5)
**Evidence:** `Antrenor.tsx:59` reads `persona = useCoachStore((s) => s.persona)`. Where is persona set? Likely post-Onboarding finalize → engine `profileTyping.js` runs → coachStore.setPersona. NOT verified end-to-end.
**Fix log:** Trace: onboardingStore.finalize → engine.profileTyping → coachStore.setPersona. Sample audit secondary pass.

### §7-H3 — Workout flow start → energy-check → workout-preview → workout → post-rpe → post-summary nested route chain (10+ screens)
**Severity:** HIGH (§7.2 + complexity)
**Evidence:** router.tsx Phase 3 Antrenor sub-screens: energy-check, energy-cause, workout-preview, workout, ceva-nu-merge, pain-button, equipment-swap, aparate-lipsa, schedule-override, post-rpe, post-summary = **11 sub-screens** per workout. Deep linking via /app/antrenor/<screen> works ✓ but state persistence between screens depends on Zustand stores.
**Karpathy:** Goal-Driven Execution — multi-step workout = high abandon risk.
**Reasoning:**
- 11-step funnel pre-completion. Each step user can abandon (close tab, lock phone, switch app). pausedSnapshot mechanism in workoutStore (§14) must capture state at every screen transition.
- Back navigation: browser back vs in-app back inconsistency potential (§7.26).
**Fix log:** Manual test workout flow on real phone (Maria 65 simulator):
- Start workout → close app at PainButton → reopen → expects pausedSnapshot restore.
- Tab navigation (BottomNav) mid-workout → SessionPill should show ongoing session.
Verify state continuity. Add E2E test scenario.

### §7-H4 — 9 Cont sub-screens routes exist + Phase 6 task_11-17 LANDED but functional end-to-end NOT verified
**Severity:** HIGH (§7.5)
**Evidence:** `router.tsx:88-100` registers 9 sub-screens. Components exist per `ls src/react/routes/screens/cont/`. Per D026 Phase 6 BATCH LANDED. Sample audit pending each:
- SettingsProfile — Big 6 edit form
- SettingsNotifications — toggle + frequency + days + time
- SettingsSubscription — Beta gratuit info
- SettingsAppearance — theme + nav style
- SettingsPrefs — units + week start + locale
- SettingsPrivacy — export + telemetry opt-in
- SettingsTerms — T&C + Medical Disclaimer 2-tab
- SettingsExport — local JSON download
- SettingsDanger — logout + reset + delete confirm
**Fix log:** Sample audit each screen sub-flow secondary pass. Verify §7.20 account deletion irreversible modal + GDPR wipe complete.

### §7-H5 — PWA install prompt UX (`beforeinstallprompt`) — NOT verified wired
**Severity:** HIGH (§7.8 + §16.5)
**Evidence:** No handler for `beforeinstallprompt` event found in src/react/ on initial scan. Vite-plugin-pwa handles registration; install prompt is browser-driven for installable PWAs — but explicit "Instalează pe ecran" CTA absent.
**Fix log:** Add install prompt component + handler that captures `beforeinstallprompt` event and triggers via user gesture. Add to Antrenor/Splash strategic placement.

### §7-H6 — Edge cases: empty state / error state / offline state per tab — VARIED coverage
**Severity:** HIGH (§7.6 + §13.5)
**Evidence:** Antrenor.tsx sample: ResumeSessionCard conditional, ReactivateCard conditional, but FALLBACK if `coach` aggregate returns baseline (no data) — UI renders default tiles regardless. Empty-state-specific copy ("Inca nu ai sesiuni — Hai sa incepem!") NOT verified.
**Fix log:** Sample each tab's empty state (0 sessions Gigel first-time-user). Add empty-state copy + illustration where missing.

---

## MED findings

### §7-M1 — Onboarding "Inapoi" / "Continua" / "Gata" CTA labels OK
**Severity:** MED — positive (§7.14 funnel optimization)
**Resolution:** OK Daniel-direct register, no diacritics, anti-paternalism preserved.

### §7-M2 — Progress dots Onboarding Step indicator ✓ visual
**Severity:** MED — positive (§7.14)
**Evidence:** `Onboarding.tsx:43-52` dots colored brick if `i+1 <= stepNum`. data-testid for testing. OK UX.

### §7-M3 — Back navigation w/ Zustand persist: data preserved ✓ probable
**Severity:** MED (§7.26 + §30.10)
**Evidence:** `Onboarding.tsx:34-36` back() navigates step-1. Data lives in onboardingStore (assumed persist middleware). User can back-fill prior steps. Verify persist middleware in store implementation.

### §7-M4 — Pain Button flow ACUT/USOARA → workout adapt vs continue (§7.31)
**Severity:** MED (§43.3 + §7.31)
**Evidence:** PainButton.tsx exists at src/react/routes/screens/antrenor/PainButton.tsx. Logic flow NOT inspected here. Defer secondary.

### §7-M5 — Equipment swap mid-session UX (Bowflex disconnect → fallback exercise)
**Severity:** MED (§7.29)
**Evidence:** EquipmentSwap.tsx + AparateLipsa.tsx exist. Logic NOT inspected.
**Fix log:** Secondary pass.

### §7-M6 — Account deletion data wipe IRREVERSIBLE modal — §7.20 + §28.10 critical safety
**Severity:** MED (priority for §28)
**Evidence:** SettingsDanger.tsx exists w/ wipe handler that calls console.warn (§1-C2). Irreversibility confirmation modal NOT inspected.
**Fix log:** Secondary pass — verify 2-step confirm modal + final irreversibility text.

---

## LOW findings

### §7-L1 — Splash auth-branching ✓
**Severity:** LOW positive

### §7-L2 — 4-tab nav LOCK V1 preserved ✓
**Severity:** LOW positive (§9.6 + §10.5)
**Evidence:** BottomNav.tsx 4 tabs (Antrenor/Progres/Istoric/Cont). No 6-tab vanilla creep.

### §7-L3 — Deep linking nested routes via URL ✓ via createBrowserRouter
**Severity:** LOW positive (§7.27)

---

## NIT findings

### §7-N1 — Onboarding "Gata" cta final step — could be "Aplica" or "Salveaza" — UX wording polish
**Resolution:** Daniel post-Beta wording review window per D024.

### §7-N2 — Splash CTA "Incepe" vs "Continua" branching ✓ clear
**Resolution:** OK.

---

## Coverage map §7.x sub-checklist

| Sub | Title | Status | Severity |
|-----|-------|--------|----------|
| 7.1 | Onboarding T0 Big 6 full journey | §7-C4 bounds + §7-C1+§7-C2 auth chain | CRITICAL |
| 7.2 | Workout flow start → completion | §7-H3 — 11-step chain, state persistence depends Zustand | HIGH |
| 7.3 | Energy/Pain/Equipment swap sub-flows | §7-M4 + §7-M5 deferred | MED |
| 7.4 | Schedule override + Calendar V1 wiring | covered §40 | covered §40 |
| 7.5 | 9 Cont sub-screens | §7-H4 deferred sample | HIGH |
| 7.6 | Empty/error/offline state per tab | §7-H6 — varied | HIGH |
| 7.7 | 5 moduri Mode Detection event listeners | covered §44 | covered §44 |
| 7.8 | PWA install prompt | §7-H5 — verify wired | HIGH |
| 7.9 | First-time vs returning user | OK Splash branching | LOW positive |
| 7.10 | Persona Gigel/Marius/Maria path | §7-H2 — not verified end-to-end | HIGH |
| 7.11 | Recovery flows post-error | covered §13 | covered §13 |
| 7.12 | Pause/resume pausedSnapshot integrity | covered §14 | covered §14 |
| 7.13 | 3-tab smoke (Antrenor+Progres+Istoric) | §2-C1 E2E live; §7-H3 manual test req | HIGH |
| 7.14 | Onboarding funnel conversion | progress dots ✓ | MED |
| 7.15 | Empty states per tab | §7-H6 | HIGH |
| 7.16 | Error retry states UX | covered §13 | covered §13 |
| 7.17 | Permission denied states | NOT VERIFIED — push notif blocked path | MED secondary |
| 7.18 | Multi-device auth simultaneous | §7-C3 ProtectedRoute stub blocks | CRITICAL §7-C3 |
| 7.19 | Logout flow complete | covered §31 | covered §31 |
| 7.20 | Account deletion data wipe verify | §7-M6 + §28.10 | MED secondary |
| 7.21 | Critical user journeys | §7-H3 manual test req | HIGH |
| 7.22 | Progressive disclosure (NU info overload Gigel) | sample OK Antrenor not over-dense | MED |
| 7.23 | Tooltip vs inline help | NOT obvious; defer | MED |
| 7.24 | Cognitive load Gigel per screen | covered §50.6 | covered §50 |
| 7.25 | Settings change → behavior observable | §7-H4 secondary | HIGH |
| 7.26 | Back navigation consistency | OK browser back via router; in-app back varies | MED |
| 7.27 | Deep linking URL share resume | OK createBrowserRouter | LOW positive |
| 7.28 | Session continuity cross-device | §7-C3 ProtectedRoute stub blocks | CRITICAL §7-C3 |
| 7.29 | Equipment swap mid-session | §7-M5 | MED |
| 7.30 | Aparate lipsa flow | AparateLipsa.tsx exists; defer audit | MED |
| 7.31 | Pain button flow | §7-M4 | MED |

## Karpathy 4 principii distribution §7

- Think Before Coding: 2 (C3, H6)
- Simplicity First: 2 (C1, M3)
- Surgical Changes: 3 (C1, H5, M6)
- Goal-Driven Execution: 5 (C2, C3, C4, H2, H3)
