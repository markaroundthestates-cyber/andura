# TRACK 7 — Automated Testing MASTER SPEC + Decision Engine Mocks V1

**Date:** 2026-05-19 (research drum birou→acasă Daniel claude rc)
**Authority:** Daniel directive verbatim — *"facem totul automat ca smokeul meu final sa fie clean. Si faci si mockuri de date sa verificam outputul decision engine"*
**Scope:** complete test stack 3-tier defense (in-repo pre-deploy + synthetic prod + exploration nightly) + decision engine deterministic verification persona-driven
**Goal:** Daniel smoke manual pre-Beta = ZERO surprize. Audit-vs-UX gap close (75% audit + 20% UX percepție → ≥90% real).
**Source research:** WebTestBench arXiv 2603.25226 / Playwright best-practices 2026 / Checkly Playwright Check Suites / Stagehand Browserbase / fast-check / @langwatch/scenario / Lighthouse CI 12+ / Vitest 2026.

---

## §0 Strategic frame — 3-tier defense

Audit Nuclear FULL V3 a măsurat infrastructure (code + security + observability + architecture). **UX functional completeness blind spot** = Antrenor bulk/cut + Istoric gol + Cont greyed te-au scăpat. Single smoke manual Daniel pe telefon = unic gate insufficient pre-Beta.

3-tier defense in-depth = redundancy automatic cap-coadă:

| Tier | Run when | Scope | Tools |
|------|----------|-------|-------|
| **1** in-repo pre-deploy | every PR + push main | unit + integration + E2E + visual + perf + a11y + engine math + mutation + bundle + a11y + deps + license | Vitest + Playwright + fast-check + @langwatch/scenario + Lighthouse CI + Stryker + size-limit + axe-core + Snyk + depcheck/madge/jscpd/license-checker |
| **2** synthetic prod | every 5min 20+ locations | same Playwright tests reused împotriva `andura.app` live + alert Slack | Checkly Playwright Check Suites + Rocky AI auto-triage |
| **3** exploration nightly | scheduled scope monitoring | natural language anomaly hunt → ticket queue Daniel review morning | Stagehand (Browserbase) OR browser-use, scope **NU gating** per WebTestBench 2026 |

---

## §1 TIER 1 — In-repo pre-deploy stack complete

### §1.1 Vitest unit + integration (baseline 4519 PASS)

**Setup augment Phase 7 §2 LANDED:**
- `vitest.extend()` builder pattern persona fixtures cu type inference automatic (vezi §3 decision engine mocks)
- Browser Mode pentru component tests pe browser real (Chromium + Firefox + WebKit) — supplement JSDOM
- Coverage thresholds Phase 7 §2 ratchet roadmap (60/55/50/60 floor → 80+ target post Track 7)
- Snapshot `toMatchSnapshot()` pentru golden master engine outputs

### §1.2 Playwright E2E React 4-tab (scrie NEW Track 7)

**Install:**
```bash
npm i -D @nearform/playwright-firebase @axe-core/playwright
```

**Auth strategy** (best practice 2026 — auth UI 1x dedicated, restul tests reuse `storageState`):
- `tests/auth.setup.ts` = `@nearform/playwright-firebase` plugin cu Firebase Admin service account env var (`GOOGLE_APPLICATION_CREDENTIALS` SA JSON) + UID fixture inject → `storageState: 'playwright/.auth/user.json'`
- `tests/magic-link.spec.ts` = auth UI flow 1x verify Magic Link `andura.app` real (smoke prod gate)

**Core suite `tests/smoke-react.spec.ts`:**
- Login (storageState) → home Antrenor tab
- Antrenor: sub-screens 14/14 click-through smoke (ManageWeek + DailyView + StartWorkout + Workout + EndWorkout + AaFrictionModal LOCK 9 + LockExercises LOCK 4 + PainButton + bulk/cut energy section + ...)
- Progres tab: LogWeight + BodyData + Nutrition LOCK 11 + chart render
- Istoric tab: list + detail navigation
- Cont tab: SettingsProfile + SettingsExport + SettingsTerms + SettingsDanger + Aparate filter (greyed-out logic verify) + ...
- PWA offline: `context.setOffline(true)` → reload → verify SW cache + offline indicator
- Mobile emulation built-in: iPhone 14 + Galaxy S20 (touch + viewport-fit=cover safe-area)

**Multi-browser config:** Chromium + Firefox + WebKit + Mobile Chrome + Mobile Safari (Phase 7 §02 deja webServer env-gated baseURL ready).

### §1.3 Visual regression (Playwright built-in)

**Zero plugin** — Playwright `toHaveScreenshot()` native multi-browser:
```typescript
test('Antrenor visual', async ({ page }) => {
  await page.goto('/antrenor');
  await expect(page).toHaveScreenshot('antrenor-home.png', {
    fullPage: true,
    mask: [page.locator('[data-testid="timestamp"]')], // dynamic content masked
    maxDiffPixelRatio: 0.02,
  });
});
```

**Stability:** disable animations + fixed viewport + timezone Europe/Bucharest + locale `ro-RO` + dark mode disabled + mock network responses. Baselines committed în same PR ca cod change → reviewer vede ambele diffs.

**Updates:** `npx playwright test --update-snapshots --grep @visual` doar când intenționat UI change.

### §1.4 Lighthouse CI perf + a11y + best-practices + SEO

**Install:**
```bash
npm i -D @lhci/cli
```

**Config `lighthouserc.js`** (Lighthouse 12+ scos PWA category):
```javascript
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:4173/'],
      startServerCommand: 'npm run preview',
      numberOfRuns: 3,
      settings: { preset: 'mobile', throttlingMethod: 'devtools' },
    },
    assert: {
      preset: 'lighthouse:no-pwa',
      assertions: {
        'categories:performance': ['error', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.90 }],
        'categories:seo': ['warn', { minScore: 0.90 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
        'installable-manifest': ['warn', { minScore: 1 }],
        'service-worker': ['warn', { minScore: 1 }],
      },
    },
    upload: { target: 'temporary-public-storage' },
  },
};
```

**GitHub Action:** `treosh/lighthouse-ci-action@v12` invoked în `deploy.yml` pre-deploy + post-deploy împotriva live URL pentru regression tracking.

### §1.5 fast-check property-based engine invariants

**Install:**
```bash
npm i -D fast-check
```

**Engine invariants per ADR 030 D1-D5 8/8 adapters** — examples:

```typescript
import fc from 'fast-check';
import { brzycki1RM, kalmanFilter, kcalTarget } from '@/engine';

test('Brzycki 1RM bounds positive + monotonic reps<10', () => {
  fc.assert(fc.property(
    fc.float({ min: 20, max: 300, noNaN: true }), // weight
    fc.integer({ min: 1, max: 9 }),                // reps
    (weight, reps) => {
      const oneRM = brzycki1RM(weight, reps);
      return oneRM >= weight && oneRM <= weight * 1.5; // bounded
    }
  ));
});

test('Kalman BF posterior non-negative + variance shrinks', () => {
  fc.assert(fc.property(
    fc.array(fc.float({ min: 5, max: 50 }), { minLength: 10, maxLength: 90 }),
    (observations) => {
      const result = kalmanFilter(observations);
      return result.mu >= 0 && result.sigma <= observations[0]; // monotone convergence
    }
  ));
});

test('Bayesian nutrition kcal floor LOCK 8 absolute lower bound 1200', () => {
  fc.assert(fc.property(
    fc.record({
      goal: fc.constantFrom('cut', 'maintain', 'bulk'),
      weight: fc.float({ min: 40, max: 200 }),
      bf: fc.float({ min: 5, max: 50 }),
      deficit: fc.float({ min: 0, max: 1000 }),
    }),
    (profile) => {
      const target = kcalTarget(profile);
      return target >= 1200; // LOCK 8 inviolabil
    }
  ));
});
```

**Pattern:** 10,000 iterations per invariant. Counterexamples auto-shrinked → reproducible.

### §1.6 @langwatch/scenario agentic coach voice validation

**Install:**
```bash
npm i -D @langwatch/scenario
```

**Setup pentru Andura coach voice + anti-paternalism + persona-aware:**
```typescript
import scenario, { AgentAdapter, AgentRole } from '@langwatch/scenario';
import { describe, it } from 'vitest';

const coachAgent: AgentAdapter = {
  role: AgentRole.AGENT,
  call: async (input) => callAnduraCoach(input), // wraps coach orchestrator
};

describe('Coach voice multi-turn', () => {
  it('anti-paternalism preserved when user skips workout 3 days', async () => {
    const result = await scenario.run({
      agent: coachAgent,
      userSimulator: {
        persona: 'Gigel skipped 3 workouts',
        goal: 'check what coach says',
      },
      judges: [{
        criteria: [
          'NO guilt-tripping language',
          'NO "you should" lecture',
          'NO catastrophizing',
          'silent calibration adapts plan',
          'tone warm not paternalistic',
          'language Romanian no diacritics',
        ],
      }],
      maxTurns: 5,
    });
    expect(result.verdict).toBe('PASS');
  });
});
```

**Scenarios target:** Gigel skipped workouts + Marius PR break attempt + Maria 65 joint pain mention + bulk→cut transition + injury recovery + deload week + per-set safety RIR 0 trigger AaFriction.

### §1.7 Stryker mutation testing (test suite robustness)

**Install:**
```bash
npm i -D @stryker-mutator/core @stryker-mutator/vitest-runner
```

**Quick mode** rulează nightly (mutation score gate ≥75% pentru engine math + adapters):
```bash
npx stryker run --files "src/engine/**/*.{ts,js}" --testRunner vitest --mutate "src/engine/**/*.{ts,js}"
```

### §1.8 axe-core a11y (WCAG 2.1 AA)

**Install** (deja `@axe-core/playwright` in §1.2):
```typescript
import AxeBuilder from '@axe-core/playwright';

test('Antrenor a11y zero violations critical/serious', async ({ page }) => {
  await page.goto('/antrenor');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2aa', 'wcag21aa'])
    .analyze();
  expect(results.violations.filter(v => 
    v.impact === 'critical' || v.impact === 'serious'
  )).toEqual([]);
});
```

### §1.9 Bundle budget + code health

**Install:**
```bash
npm i -D size-limit @size-limit/preset-app depcheck madge jscpd license-checker
```

**`.size-limit.json`:**
```json
[
  { "name": "main", "path": "dist/assets/index-*.js", "limit": "100 KB", "gzip": true },
  { "name": "vendor", "path": "dist/assets/vendor-*.js", "limit": "150 KB", "gzip": true }
]
```

**Per-PR checks:**
- `npm run size` (size-limit gate)
- `npx depcheck` (unused deps)
- `npx madge --circular src/` (circular imports detect)
- `npx jscpd src/ --min-lines 30 --threshold 5` (duplication)
- `npx license-checker --production --summary` (license compliance)
- `npm audit --production --audit-level=moderate` (security)
- Snyk action `snyk/actions/node` în CI (vulnerability DB)

---

## §2 TIER 2 — Synthetic monitoring prod (Checkly)

**Install:**
```bash
npm create checkly@latest
```

**Config `checkly.config.ts`:**
```typescript
import { defineConfig } from 'checkly';

export default defineConfig({
  projectName: 'Andura PWA',
  logicalId: 'andura-pwa',
  checks: {
    frequency: 5, // minutes
    locations: ['eu-west-1', 'eu-central-1'], // CDN regions Romania
    runtimeId: '2024.02',
    playwrightConfig: { use: { baseURL: 'https://andura.app' } },
  },
});
```

**Suite `__checks__/critical-paths.spec.ts`:**
- Magic Link login → home (full auth flow live every 5min)
- Antrenor home render + 4-tab nav
- AaFriction LOCK 9 trigger
- LockExercises LOCK 4 disclaimer
- Engine API roundtrip (Firestore read latency budget)
- PWA installability + SW registration

**Alert routing:** Slack `#andura-alerts` + Sentry incident linking + Rocky AI auto-triage (early 2026 feature) pentru root cause classification.

**Free Hobby tier:** 1,500 browser checks/lună = ~50/zi distributed = solo dev acoperit. Upgrade $40/mo când 24/7 monitoring scaling.

---

## §3 TIER 3 — Exploration nightly (Stagehand monitoring scope)

**Install:**
```bash
npm i -D @browserbase/stagehand
```

**Setup `scripts/nightly-exploration.ts`:**
```typescript
import { Stagehand } from '@browserbase/stagehand';

const personas = [
  { name: 'Gigel', goal: 'completeaza un workout simplu', tier: 'T0' },
  { name: 'Marius', goal: 'verifica progres + PR-uri', tier: 'T2' },
  { name: 'Maria 65', goal: 'logheaza greutate + analizeaza nutritie', tier: 'T3' },
];

for (const persona of personas) {
  const stagehand = new Stagehand({ env: 'BROWSERBASE', modelName: 'claude-opus-4.7' });
  await stagehand.page.goto('https://andura.app');
  await stagehand.act(`Login ca ${persona.name} ${persona.tier}`);
  
  const observations = await stagehand.extract({
    instruction: `Ca ${persona.name}, completeaza goal: ${persona.goal}. Logheaza orice anomalie UX (buton broken, gol, slow >3s, eroare modal nedismiss, layout broken, text in alta limba, etc.)`,
    schema: anomalySchema,
  });
  
  if (observations.anomalies.length > 0) {
    await logToTicketQueue(persona, observations); // GitHub Issues auto-create
  }
}
```

**Scope mandatory per WebTestBench arXiv 2603.25226:** **MONITORING NU release-gating**. Run nightly cron `0 3 * * *` → ticket queue Daniel review morning. NU wire în PR checks.

---

## §4 Decision Engine Mocks comprehensive

### §4.1 Persona fixtures (Vitest builder pattern)

**`tests/fixtures/personas.ts`:**
```typescript
import { test as baseTest } from 'vitest';

export const test = baseTest
  .extend('personaGigelT0', () => ({
    uid: 'gigel-t0-fresh',
    profile: { age: 32, gender: 'M', weight: 88, height: 178, experience: 'novice' },
    history: [], // cold start, no logs
    tier: 0,
    onboardingDone: false,
  }))
  .extend('personaMariusT2', () => ({
    uid: 'marius-t2-mature',
    profile: { age: 28, gender: 'M', weight: 82, height: 182, experience: 'intermediate' },
    history: generate30DaysLogs({ adherence: 0.85, prGrowth: 0.02 }),
    tier: 2,
    onboardingDone: true,
    vitality: { mood: 'high', soreness: 'low', sleep: 7.5 },
  }))
  .extend('personaMaria65T3', () => ({
    uid: 'maria-65-conservative',
    profile: { age: 67, gender: 'F', weight: 64, height: 162, experience: 'beginner', joints: ['knee-left'] },
    history: generate90DaysLogs({ adherence: 0.70, prGrowth: 0.005, joints: true }),
    tier: 3,
    onboardingDone: true,
    behavioralReal: true,
  }))
  .extend('edgeCases', () => ({
    deloadWeek: generate90DaysLogs({ pattern: 'deload-week-4' }),
    bulkToCutTransition: generate30DaysLogs({ pattern: 'bulk-then-cut-day-15' }),
    postInjuryRecovery: generate14DaysLogs({ pattern: 'injury-skip-then-resume' }),
    perfectAdherence: generate90DaysLogs({ adherence: 1.0 }),
    zeroAdherence: generate30DaysLogs({ adherence: 0 }),
  }));
```

### §4.2 Engine targets ADR 030 D1-D5 (8 adapters) — golden master snapshots

```typescript
import { test } from './fixtures/personas';
import { runEnginePipeline } from '@/engine';

test('bayesianNutrition kcal convergence 90 days Maria 65', ({ personaMaria65T3 }) => {
  const outputs = personaMaria65T3.history.map((day, i) => 
    runEnginePipeline(personaMaria65T3, day).kcalTarget
  );
  expect(outputs).toMatchSnapshot('maria-65-kcal-convergence-90d');
  expect(outputs.every(k => k >= 1200)).toBe(true); // LOCK 8 floor
});

test('goalAdaptation cut→maintain transition bulk→cut Day 15', ({ edgeCases }) => {
  const states = edgeCases.bulkToCutTransition.map((day, i) =>
    runEnginePipeline({ ...personaMariusT2, history: edgeCases.bulkToCutTransition.slice(0, i+1) }, day).goalState
  );
  expect(states).toMatchSnapshot('bulk-to-cut-day-15-trajectory');
});

test('AaFriction LOCK 9 per-set RIR 0 trigger', ({ personaGigelT0 }) => {
  const result = runEnginePipeline(personaGigelT0, {
    setNumber: 5,
    rir: 0,
    weight: 100,
    reps: 8,
    feedback: 'cu efort maxim',
  });
  expect(result.aaFrictionTrigger).toBe(true);
  expect(result.aaFrictionType).toBe('per-set-safety');
});

test('Calendar V1 spacing chest 48h minim', ({ personaMariusT2 }) => {
  const week = runEnginePipeline(personaMariusT2, { weekPlan: 'request' }).calendar;
  const chestDays = week.filter(d => d.muscles.includes('chest')).map(d => d.dayIndex);
  for (let i = 1; i < chestDays.length; i++) {
    expect(chestDays[i] - chestDays[i-1]).toBeGreaterThanOrEqual(2); // 48h
  }
});

test('Library 657 count invariant', () => {
  const lib = loadExerciseLibrary();
  expect(lib.length).toBe(657); // LOCK 2 mandatory
});

test('Big 6 strength curve bounds age 13-95', () => {
  fc.assert(fc.property(
    fc.integer({ min: 13, max: 95 }),
    fc.constantFrom('M', 'F'),
    (age, gender) => {
      const curve = big6StrengthCurve({ age, gender });
      return curve.bench > 0 && curve.squat > 0 && curve.deadlift > 0;
    }
  ));
});
```

### §4.3 Persona 10-day simulated end-to-end

```typescript
test('Gigel T0 → T1 transition Day 7 onboarding complete', ({ personaGigelT0 }) => {
  let state = personaGigelT0;
  const trajectory = [];
  for (let day = 1; day <= 10; day++) {
    const log = simulateRealisticLog(state, day);
    state = applyLog(state, log);
    const outputs = runEnginePipeline(state, log);
    trajectory.push({ day, tier: state.tier, outputs });
  }
  expect(trajectory).toMatchSnapshot('gigel-t0-to-t1-10day-trajectory');
  expect(trajectory[6].tier).toBeGreaterThanOrEqual(1); // tier upgrade by day 7
});
```

### §4.4 Characterization tests (golden master pre-refactor protection)

Per Michael Feathers pattern (Wikipedia + chicio/Golden-Master-Testing-Characterization-Test): snapshot ALL engine outputs current behavior pre any future refactor. Any deviation post-refactor = explicit review + intent confirmation.

```typescript
test.each(personas)('characterization $name', (persona) => {
  const outputs = runFullEnginePipeline(persona);
  expect(outputs).toMatchSnapshot(`characterization-${persona.uid}`);
});
```

---

## §5 CI pipeline `.github/workflows/deploy.yml` augmented

```yaml
name: CI + Deploy

on: [push, pull_request]

jobs:
  test-tier-1:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22.19', cache: 'npm' }
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run test:unit                    # Vitest + fast-check + snapshot
      - run: npm run test:engine                  # persona scenario simulations + characterization
      - run: npx playwright install --with-deps
      - run: npm run test:e2e                     # Playwright + visual regression + axe-core
      - run: npx lhci autorun                     # Lighthouse CI
      - run: npm run size                         # size-limit
      - run: npx depcheck
      - run: npx madge --circular src/
      - run: npx license-checker --production --summary
      - run: npm audit --production --audit-level=moderate
      - uses: snyk/actions/node@master
        env: { SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }} }

  test-mutation-nightly:
    if: github.event_name == 'schedule'
    runs-on: ubuntu-latest
    steps:
      - run: npx stryker run --files "src/engine/**/*.{ts,js}"
      - run: # alert if mutation score < 75%

  deploy:
    needs: test-tier-1
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - run: npm run build
      - run: # firebase deploy / vercel deploy

  post-deploy-monitor:
    needs: deploy
    runs-on: ubuntu-latest
    steps:
      - run: npx checkly deploy           # synthetic monitor refresh
      - run: npx lhci autorun --collect.url=https://andura.app   # live URL

  nightly-exploration:
    if: github.event_name == 'schedule'  # cron 0 3 * * *
    runs-on: ubuntu-latest
    steps:
      - run: npm run test:exploration    # Stagehand → GitHub Issues queue
```

---

## §6 Skills mandatory per Track 7 implementation (Phase 7 §3 preserved)

- **Karpathy 4 principii** — pre-task tactical filter universal
- **Sequential Thinking** — root cause analysis pre-fix engine math
- **Context7** — library/framework reference latest (Playwright + Vitest + fast-check + Lighthouse + Checkly + Stagehand + Firebase Admin)
- **WebSearch** — best practice verification 2026 patterns (NU Tavily missing local)
- **Impeccable `/critique`** — post-fix self-review pre-commit Bugatti gate
- **gstack `/qa` + `/review`** — pre-commit verification suite
- **GitNexus** — `npx gitnexus@latest analyze` per Track 7 milestone

---

## §7 Acceptance criteria — smoke Daniel manual pre-Beta clean

Pre-Beta launch gate Daniel single comprehensive cap-coadă review = clean dacă:

1. **Tier 1 CI** 100% green:
   - Vitest ≥4519 + new tests Track 7 ≥200 (target ~4719+)
   - Playwright E2E ≥30 critical paths green (4-tab + Magic Link + AaFriction + PWA offline + mobile)
   - Visual regression baselines committed + zero unexplained diff
   - Lighthouse CI ≥85 perf / ≥95 a11y / ≥90 best-practices / ≥90 SEO
   - fast-check property-based 100% engine invariants pass
   - @langwatch/scenario coach voice persona scenarios 100% verdict PASS
   - Stryker mutation score ≥75% engine
   - axe-core zero critical/serious
   - size-limit main ≤100 KB gzip
   - depcheck/madge/jscpd/license-checker/Snyk/npm audit clean
2. **Tier 2 Checkly** synthetic prod 100% green pe `andura.app` ultima 24h zero failure
3. **Tier 3 Stagehand** exploration nightly ticket queue Daniel review = zero anomaly P0/P1
4. **Production readiness Lighthouse** live URL ≥85
5. **Engine outputs persona-driven** golden master snapshots 100% stable post-changes

Audit-vs-UX gap close: 75% audit + 20% UX → ≥90% real (3-tier defense compound).

---

## §8 Implementation order Track 7 (Daniel acasă, CC autonomous batch)

1. **Phase 7.1 — Vitest persona fixtures + engine golden master** (foundation testing-side, NU UI changes)
   - `tests/fixtures/personas.ts` + `simulateRealisticLog` + `generate*DaysLogs`
   - `tests/engine/` snapshots ALL 8 adapters × 3 personas × edge cases
   - fast-check property-based invariants per formula
2. **Phase 7.2 — Playwright E2E React 4-tab + auth fixture**
   - `@nearform/playwright-firebase` install + Firebase Admin SA setup
   - `tests/auth.setup.ts` + `tests/magic-link.spec.ts` + `tests/smoke-react.spec.ts`
3. **Phase 7.3 — Visual regression + Lighthouse CI + axe-core**
   - Baselines initial commit + lighthouserc.js + AxeBuilder integration
4. **Phase 7.4 — Bundle + code health gates**
   - size-limit + depcheck + madge + jscpd + license-checker + Snyk
5. **Phase 7.5 — @langwatch/scenario coach voice**
   - Coach orchestrator adapter wrap + persona scenarios + judge criteria
6. **Phase 7.6 — Stryker mutation nightly + deploy.yml augment**
   - CI workflow update + GitHub secrets (Firebase SA + Snyk token + Checkly token)
7. **Phase 7.7 — Checkly synthetic prod**
   - `npm create checkly@latest` + `__checks__/` + Slack alert routing
8. **Phase 7.8 — Stagehand exploration nightly**
   - Browserbase account + persona script + GitHub Issues queue
9. **Phase 7.9 — Vanilla legacy E2E delete** (cleanup 48 obsolete tests)
10. **Phase 7.10 — Production readiness Lighthouse live verify + Daniel manual smoke single comprehensive cap-coadă**

Total ETA: ~5-8 zile lucrătoare CC autonomous Opus exclusively per § atomic commit, push manual final SAU Daniel trigger explicit.

---

## §9 Anti-recurrence + Daniel-action pending

- **§9-C1 F5 AaFrictionModal vs LOCK 9 PerSetSafetyModal disambiguation** = CEO decision pending. Recommend rename `PerSetSafetyModal.tsx` + DECISIONS.md disambiguation entry IF LOCK 9 path confirmed. Affects @langwatch/scenario AaFriction test scenarios.
- **Real Firebase API key** = env var `VITE_FIREBASE_API_KEY` deploy pipeline OR commit direct (Firebase docs zice public-safe — recommend commit + Firebase Console auth domain restrict `andura.app` only).
- **GitHub branch protection `main`** = require Track 7 CI status checks + linear history + no force-push.
- **Firebase Console manual** = Authorized domains `andura.app` + localhost + Firestore rules publish parity.
- **Service Worker cache stale mobile** = SW versioning `vite-plugin-pwa` auto-update on deploy verify; Daniel hard reload pre-smoke acasă mobile.

---

🦫 **TRACK 7 Automated Testing MASTER SPEC V1. Bugatti craft peak. 3-tier defense in-depth + persona-driven engine deterministic verification. Smoke Daniel manual pre-Beta = ZERO surprize. Audit-vs-UX gap close 75%→≥90%. Mirror D029/D031 procedure CC autonomous continuous neîntrerupt Opus exclusively per § atomic commit. Stop trigger UNIC Daniel STOP explicit.**
