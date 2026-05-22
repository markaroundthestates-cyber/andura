---
title: Feature Flags Strategy — Andura PWA V1
status: ACTIVE_SSOT
created: 2026-05-22
authority: §24-H1 audit-nuclear-2026-05-19 closure
cross_refs:
  - 08-workflows/ENVIRONMENT_STRATEGY.md (§24-H3 single Firebase project)
  - 08-workflows/AB_TEST_STRATEGY.md (§24-H2 V1 solo defer post-Beta)
  - 08-workflows/FORWARD_COMPAT_PRINCIPLES.md §6 (magic numbers + configs documented)
  - src/react/routes/screens/Auth.tsx §7-C1 (mock login DEV gate exemplar)
  - src/firebase.js §4-H4 (VITE_FIREBASE_RTDB_URL build-time flag exemplar)
  - src/util/sentry.js (VITE_SENTRY_DSN + VITE_APP_VERSION build-time flag exemplars)
  - src/global.d.ts (ImportMetaEnv VITE_* declared schema)
  - DECISIONS.md (flag append authority)
---

# Feature Flags Strategy — Andura PWA V1

> **Principiul fundamental:** Andura V1 Beta solo founder = single-user
> deployment. Flag strategy minimalistă; ZERO infrastructure overhead pre-Beta.
> Build-time Vite env vars + `import.meta.env.DEV` gates sunt singurele
> mecanisme active. Runtime flags = post-Beta când multi-user emerges.

---

## §1 Tier 1 — Build-time DEV gate (`import.meta.env.DEV`)

**Pattern:** componente / branch-uri activate DOAR în dev (`npm run dev`),
strip out la `npm run build` (production tree-shake).

**Uz curent (verified filesystem 2026-05-22):**
- `src/react/routes/screens/Auth.tsx` §7-C1 — `showMockLogin = import.meta.env.DEV`
  (mock login button render DOAR dev; production strip per audit fix)
- `src/react/routes/screens/cont/ResetDataConfirm.tsx` — destructive ops gated DEV
- `src/react/routes/screens/cont/DeleteAccountConfirm.tsx` — destructive ops gated DEV

**Când folosești:**
- Dev-only UI helpers (mock login, debug panels, seed data buttons)
- Destructive operations confirmation bypass (Daniel testing convenience)
- Verbose logging branches (`if (import.meta.env.DEV) console.log(...)`)

**Garanție Vite:** `import.meta.env.DEV` = boolean injectat build-time.
Production build (`npm run build`) → `DEV=false` literal → dead-code elimination
prin Rollup tree-shake. ZERO production bundle bloat.

---

## §2 Tier 2 — Build-time `VITE_*` env vars

**Pattern:** valori injectate la build via `VITE_*` env vars (Vite convenție
exposed la client; non-`VITE_` env vars rămân server-side only).

**Uz curent (verified filesystem 2026-05-22 din `src/global.d.ts`):**

| Variable | Default fallback | Consumer | Scop |
|---|---|---|---|
| `VITE_FIREBASE_RTDB_URL` | hardcoded `fittracker-c34e8...europe-west1` | `src/firebase.js` | RTDB endpoint pre-Beta single project; post-Beta staging swap |
| `VITE_FIREBASE_API_KEY` | window injection `__FIREBASE_API_KEY` | `src/firebase.js` | Firebase REST API auth key |
| `VITE_GOOGLE_OAUTH_CLIENT_ID` | empty string → toggle off OAuth UI | `src/react/routes/screens/Auth.tsx` | OAuth Google client (Phase 3 PENDING) |
| `VITE_SENTRY_DSN` | hardcoded DSN | `src/util/sentry.js` | Sentry error monitoring endpoint |
| `VITE_APP_VERSION` | `'2.0.0'` | `src/util/sentry.js` | Sentry release tag |

**Convenție:** toate variabilele expuse client trebuie prefix `VITE_`
(Vite security rule). Schema declarată în `src/global.d.ts` `ImportMetaEnv`
interface — adaugă entry când introduci flag nou (TypeScript narrow type).

**Când folosești:**
- Endpoint URLs (Firebase, Sentry, OAuth)
- API keys publice (Firebase API key OK în client; tokens sensibile NICIODATĂ)
- Build-time configuration (release version, environment label)

**Anti-pattern:**
- Secrets în `VITE_*` (orice `VITE_*` ajunge în bundle client public)
- Conditional logic on env vars la runtime — preferă DEV gate § 1 sau Tier 3 post-Beta

---

## §3 Tier 3 — Runtime flags (TBD post-Beta)

**Status pre-Beta:** NU IMPLEMENTED. ZERO infrastructure pentru runtime
toggle pre-Beta. Solo founder = ZERO multi-cohort need.

**Plan post-Beta (când multi-user emerges):**
- **localStorage `flags.json`** — JSON blob persistat per-device, citit la app
  init via `appStore` slice nou (`flagsSlice`). Daniel personal use: toggle
  feature on/off pe device propriu fără rebuild.
- **Firebase Remote Config** (alternative) — pull JSON config server-side la
  startup, override per-uid sau per-cohort. Mai scump (Firebase quota), dar
  permite live-toggle fără user refresh.

**Decizie pendentă post-Beta:** localStorage vs Firebase Remote Config —
depinde de scale (≤100 useri → localStorage; >1000 → Firebase RC).
DECISIONS.md entry când triggers (NU pre-Beta).

**Anti-overreach pre-Beta:** ZERO build runtime flag infra "pentru viitor".
YAGNI principle (per Karpathy §2 Simplicity First).

---

## §4 Lifecycle: add → rollout → remove

### §4.1 Adăugare flag nou

1. **Verifică tier** (§1 DEV gate vs §2 VITE_* vs §3 runtime post-Beta)
2. **DECISIONS.md entry** — LOCKED V1 cu rationale + reconsideration trigger
   (per FORWARD_COMPAT_PRINCIPLES §1)
3. **Adaugă în `src/global.d.ts`** dacă `VITE_*` (TypeScript narrow type)
4. **Implementează gate** cu comment explicit (`// §<id> audit fix — gated DEV only`)
5. **grep verify** zero alte uzuri inconsistente: `grep -r "FLAG_NAME" src/`

### §4.2 Rollout

- DEV gate (§1) = automat dev-only; ZERO rollout fază (production strip)
- `VITE_*` (§2) = setezi în CI/Vercel env vars; rebuild → live
- Runtime (§3) = post-Beta TBD per implementation choice

### §4.3 Remove flag (cleanup)

**Trigger:** feature full-rolled-out (toți users on) + 30 zile guard period
(rollback safety) elapsed.

1. **Verify usage:** `grep -r "FLAG_NAME" src/` → toate locațiile listate
2. **Remove gate branches** (keep `true` branch, delete `false`)
3. **Remove flag declaration** din `src/global.d.ts` (dacă VITE_*)
4. **DECISIONS.md SUPERSEDE entry** (per D007 supersede rule) — link original
   flag ADR + "rolled out 100% + 30d guard pass + flag removed"
5. **Atomic commit** `chore(flags): remove FLAG_NAME post-rollout 30d guard`

**Anti-pattern:** flag-uri zombie (rolled out 100% dar gate-ul stă în cod).
Tech debt acumulator. Cleanup obligatoriu per audit cadence.

---

## §5 Constrains + invarianti

- **ZERO secrets în VITE_*** — orice `VITE_*` = public bundle
- **ZERO runtime flag infra pre-Beta** — YAGNI (Karpathy §2 Simplicity First)
- **ZERO flag fără DECISIONS.md entry** — anti-undocumented-flag drift
- **ZERO flag în cod fără comment** (`// §<id> reason`) per FORWARD_COMPAT §6
- **ZERO flag-uri layered** (flag care depinde de alt flag) — complexity bomb;
  refactor în single decision tree dacă pattern emerges

---

## §6 Audit cadence

- **Per release candidate**: grep `import.meta.env` + `VITE_` în `src/` → lista
  curentă flag-uri active. Compare against DECISIONS.md → identify zombies.
- **Quarterly review** (per FORWARD_COMPAT §8 pinned deps cadence): re-evaluate
  fiecare flag → still needed? rolled out? remove?
- **Pre-Beta launch gate** (`BETA_ENTRY_CRITERIA.md`): ZERO flag-uri zombie
  în production bundle.

---

🦫 **Feature Flags SSOT** — strategia minimalistă V1 Beta. Build-time gates
(`import.meta.env.DEV` + `VITE_*`) acoperă 100% need-uri pre-Beta. Runtime
flags = post-Beta TBD per scale. §24-H1 closure 2026-05-22.
