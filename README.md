> 🛑 **STOP. Read [[DECISIONS.md]] instead pentru decisions context. README.md = public project intro doar.**
>
> Current SSOT (post 2026-05-15 reglaj) = `DECISIONS.md` root §D001. Wiki/ + 03-decisions/ + 06-sessions-log/ = FROZEN historical reference only. Karpathy 4 principii: [[07-meta/karpathy-skills-ref/CLAUDE.md]] §1-§4.

---

# Andura — Personal AI Coach

A personal AI coach with real contextual reasoning, persistent memory, and adaptive decisions. Production: **[andura.app](https://andura.app)** (live since 2026-05-19, D028).

---

## Stack

React 19 + Vite 5 + TypeScript + Tailwind 3 + Vitest 3 + RTL + React Router DOM 6.28 + Zustand + Firebase REST (per ADR 002) + IndexedDB Dexie + PWA. ZERO Firebase SDK — REST per `firebase.js`. Local-first invariant: data lives on device first; backup optional.

---

## Architecture

### Engine pipeline (ADR 030)

The 8-engine + MMI compose pipeline runs each session:

```
coachDirector.buildSession(ctx)
├── Phase Auto-Detection (goalAdaptation/phaseAutoDetection)
├── Tempo + Periodization (tempo + periodization)
├── Volume Landmarks (bayesianNutrition/volumeLandmarks)
├── Readiness + Fatigue (readiness + fatigue)
├── Pattern Learning (CDL-backed analyzeFromCDL)
├── Plateau Interventions (plateauInterventions)
├── DP Recommend → AA Apply → Accelerated Learning Upgrade
├── Decision Cluster (consensus 4-module voting)
└── MMI Engine #9 (last-pass identity coherence gate)
```

### Coach Decision Log (CDL) — ADR 011

Append-only persistent log of session-level coach decisions. Tier 0 localStorage (180d) → Tier 1 IndexedDB (1y) → Tier 2 archive monthly aggregates.

- `coachDecisionLog.js` — write/read/populate primitives + supersede chain
- `cdlBackfill.js` — synthetic entries from historical logs
- Primary source for `patternLearning.analyzeFromCDL`, `adherence`, accelerated learning

### Storage

- **Tier 0**: `localStorage` (wv2-* prefix Zustand stores + Big 6 onboarding + CDL recent 180d)
- **Tier 1**: `IndexedDB` (Dexie per-uid `andura_<uid>`) for CDL >180d + logs >180d
- **Tier 2**: Aggregate monthly rollups (archive)
- **Sync** (optional): Firebase RTDB `users/<uid>` per ADR 002, encrypted in transit HTTPS

---

## Build + test

```bash
npm install
npm run dev          # Vite dev server :5173
npm run test:run     # Vitest run-mode (full suite)
npm run typecheck    # tsc --noEmit
npm run typecheck:strict-js  # checkJs on src/ JS modules
npm run lint         # ESLint
npm run build        # Production bundle + PWA service worker
```

**Test baseline:** 4616 PASS / 7 todo / 0 FAIL across 263 test files (~55s). TypeScript strict mode 0 errors. ESLint 0 warnings.

---

## Recent ADRs

| ADR | Decision |
|---|---|
| 001 | Local-first storage |
| 002 | Firebase REST not SDK |
| 011 | Coach Decision Log (CDL) primitive |
| 020 | Dexie.js for IndexedDB |
| 024 | Phase auto-detection (NU user pick at onboarding) |
| 026 | Bayesian Nutrition Engine §9.2 |
| 030 | 8-engine compose pipeline |
| 033 | MMI Engine #9 |

Plus D001-D048 LOCKED V1 in [DECISIONS.md](./DECISIONS.md) for ongoing decisions catalog.

---

## Vault

- [DECISIONS.md](./DECISIONS.md) — SSOT singular decisions log
- [ANDURA_PRIMER.md](./ANDURA_PRIMER.md) — onboarding briefing for fresh sessions
- [07-meta/karpathy-skills-ref/CLAUDE.md](./07-meta/karpathy-skills-ref/CLAUDE.md) — 4 core principii
- [99-archive/wiki-pre-2026-05-15/](./99-archive/wiki-pre-2026-05-15/) — FROZEN deep-substance reference
