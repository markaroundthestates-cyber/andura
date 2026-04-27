# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e\scenarios\calibration-ui.spec.js >> CDL with 5 real entries low adherence shows LOW_ADHERENCE banner
- Location: tests\e2e\scenarios\calibration-ui.spec.js:193:1

# Error details

```
Error: expect(received).toMatch(expected)

Expected pattern: /Adherence scăzută/i
Received string:  "AZI
OFF – RECUPERARE
luni, 27 aprilie
DATE INSUFICIENTE
Completează 2+ sesiuni pentru fatigue score
🚶 OBIECTIVUL DE AZI
0
target: 8.000 pași
0%
SAVE
🔥 Streak: 0
Total: 0 zile
😴 Recuperare activă · Mobilitate · Stretching
0
STREAK
—
KCAL EST.
0
SETURI/SĂPT
Sari ziua
RECORDURI PERSONALE
Bench
10/4/26
60 kg
×8
Coach
Dashboard
Greutate
Program
Plan
🔥"
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]: AZI
      - generic [ref=e6]: OFF – RECUPERARE
      - generic [ref=e7]: luni, 27 aprilie
    - generic [ref=e8]:
      - text: DATE INSUFICIENTE
      - generic [ref=e9]: Completează 2+ sesiuni pentru fatigue score
    - generic [ref=e10]:
      - generic [ref=e11]:
        - generic [ref=e12]: 🚶 OBIECTIVUL DE AZI
        - generic [ref=e13]:
          - generic [ref=e14]: "0"
          - generic [ref=e15]:
            - generic [ref=e16]: "target: 8.000 pași"
            - generic [ref=e17]: 0%
        - generic [ref=e19]:
          - spinbutton [ref=e20]
          - button "SAVE" [ref=e21] [cursor=pointer]
        - generic [ref=e22]:
          - generic [ref=e23]: "🔥 Streak: 0"
          - generic [ref=e24]: "Total: 0 zile"
      - generic [ref=e26]: 😴 Recuperare activă · Mobilitate · Stretching
    - generic [ref=e27]:
      - generic [ref=e28]:
        - generic [ref=e29]: "0"
        - generic [ref=e30]: Streak
      - generic [ref=e31]:
        - generic [ref=e32]: —
        - generic [ref=e33]: Kcal est.
      - generic [ref=e34]:
        - generic [ref=e35]: "0"
        - generic [ref=e36]: Seturi/săpt
    - button "Sari ziua" [ref=e39] [cursor=pointer]
    - generic [ref=e40]: Recorduri personale
    - generic [ref=e43]:
      - generic [ref=e44]:
        - generic [ref=e45]: Bench
        - generic [ref=e46]: 10/4/26
      - generic [ref=e47]: 60 kg
      - generic [ref=e48]: ×8
  - navigation [ref=e49]:
    - button "Coach" [ref=e50] [cursor=pointer]:
      - img [ref=e51]
      - text: Coach
    - button "Dashboard" [ref=e53] [cursor=pointer]:
      - img [ref=e54]
      - text: Dashboard
    - button "Greutate" [ref=e59] [cursor=pointer]:
      - img [ref=e60]
      - text: Greutate
    - button "Program" [ref=e63] [cursor=pointer]:
      - img [ref=e64]
      - text: Program
    - button "Plan" [ref=e67] [cursor=pointer]:
      - img [ref=e68]
      - text: Plan
  - button "🔥" [ref=e72] [cursor=pointer]:
    - generic [ref=e73]: 🔥
```

# Test source

```ts
  111 |   const bodyText = await page.locator('body').innerText({ timeout: 3000 }).catch(() => '');
  112 |   expect(bodyText).not.toMatch(/Am ajustat programul automat/i);
  113 |   expect(bodyText).not.toMatch(/Marți are 88%/i);
  114 | });
  115 | 
  116 | test('clearStalePatternsIfColdStart runs after initFirebaseSync (no false restore)', async ({ page }) => {
  117 |   await page.addInitScript(() => {
  118 |     window._suppressFirebaseSync = true;
  119 |     localStorage.setItem('onboarding-done', 'true');
  120 |     // Single session = cold_start
  121 |     localStorage.setItem('logs', JSON.stringify([
  122 |       { ex: 'Lat Pulldown', w: 50, reps: 8, date: '2026-04-21', session: 'sess-1' }
  123 |     ]));
  124 |     localStorage.setItem('applied-patterns', JSON.stringify([
  125 |       { type: 'SKIP_DAY', day: 'Joi', skipRate: 100 }
  126 |     ]));
  127 |     localStorage.setItem('pattern-learning-cache', '{"stale":true}');
  128 |     localStorage.setItem('detected-patterns', '[]');
  129 |   });
  130 | 
  131 |   await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  132 |   await page.waitForTimeout(800);
  133 | 
  134 |   const applied   = await page.evaluate(() => localStorage.getItem('applied-patterns'));
  135 |   const cache     = await page.evaluate(() => localStorage.getItem('pattern-learning-cache'));
  136 |   const detected  = await page.evaluate(() => localStorage.getItem('detected-patterns'));
  137 | 
  138 |   expect(applied,   'applied-patterns cleared for cold_start').toBeNull();
  139 |   expect(cache,     'pattern-learning-cache cleared for cold_start').toBeNull();
  140 |   expect(detected,  'detected-patterns cleared for cold_start').toBeNull();
  141 | });
  142 | 
  143 | test('Mature user (initial tier) still sees patterns when enabled', async ({ page }) => {
  144 |   // 8 sessions over 14 days = INITIAL tier — patterns enabled at >=0.70 confidence
  145 |   const sessions = Array.from({ length: 8 }, (_, i) => ({
  146 |     ex: 'Lat Pulldown', w: 50, reps: 8, date: `2026-04-${String(i + 1).padStart(2, '0')}`,
  147 |     session: `sess-${i}`
  148 |   }));
  149 | 
  150 |   await page.addInitScript((sessionsData) => {
  151 |     window._suppressFirebaseSync = true;
  152 |     localStorage.setItem('onboarding-done', 'true');
  153 |     localStorage.setItem('logs', JSON.stringify(sessionsData));
  154 |     // Pattern with high confidence (>=0.70) should pass the INITIAL tier filter
  155 |     localStorage.setItem('applied-patterns', JSON.stringify([
  156 |       { type: 'EARLY_END', earlyEndRate: 75, confidence: 0.75, appliedAt: Date.now(), description: '75% sesiuni terminate devreme' }
  157 |     ]));
  158 |   }, sessions);
  159 | 
  160 |   await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  161 |   await page.waitForTimeout(800);
  162 | 
  163 |   // Applied patterns should NOT be cleared (this is initial tier, not cold_start)
  164 |   const appliedPatterns = await page.evaluate(() => localStorage.getItem('applied-patterns'));
  165 |   expect(appliedPatterns, 'Patterns should be preserved for initial tier user').not.toBeNull();
  166 | });
  167 | 
  168 | // ── TASK #30.8 — CDL-sourced banner + suppression ────────────────────────────
  169 | 
  170 | test('CDL synthetic-only history suppresses pattern banner', async ({ page }) => {
  171 |   await page.addInitScript(() => {
  172 |     window._suppressFirebaseSync = true;
  173 |     localStorage.setItem('onboarding-done', 'true');
  174 |     const syntheticEntries = [
  175 |       { id: 's1', date: '2026-04-01', synthetic: true, superseded: false,
  176 |         context: {}, proposed: {}, outcome: { executed: true } },
  177 |       { id: 's2', date: '2026-04-02', synthetic: true, superseded: false,
  178 |         context: {}, proposed: {}, outcome: { executed: true } },
  179 |     ];
  180 |     localStorage.setItem('coach-decisions', JSON.stringify(syntheticEntries));
  181 |     localStorage.setItem('logs', JSON.stringify([
  182 |       { ex: 'Bench', w: 60, reps: 8, date: '2026-04-01', session: 1 }
  183 |     ]));
  184 |   });
  185 |   await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  186 |   await page.waitForTimeout(1500);
  187 |   const bodyText = await page.locator('body').innerText({ timeout: 3000 }).catch(() => '');
  188 |   expect(bodyText).not.toMatch(/Adherence scăzută/i);
  189 |   expect(bodyText).not.toMatch(/Deviation crescut/i);
  190 |   expect(bodyText).not.toMatch(/sesiuni terminate devreme/i);
  191 | });
  192 | 
  193 | test('CDL with 5 real entries low adherence shows LOW_ADHERENCE banner', async ({ page }) => {
  194 |   await page.addInitScript(() => {
  195 |     window._suppressFirebaseSync = true;
  196 |     localStorage.setItem('onboarding-done', 'true');
  197 |     // 5 real entries, 4 skipped, 1 executed → ~20% adherence
  198 |     const realEntries = Array.from({ length: 5 }, (_, i) => ({
  199 |       id: `r${i}`, date: `2026-04-1${i}`, synthetic: false, superseded: false,
  200 |       context: { calibrationLevel: 'INITIAL' }, proposed: { sessionType: 'PUSH' },
  201 |       outcome: { executed: i === 0, deviation: false }
  202 |     }));
  203 |     localStorage.setItem('coach-decisions', JSON.stringify(realEntries));
  204 |     localStorage.setItem('logs', JSON.stringify([
  205 |       { ex: 'Bench', w: 60, reps: 8, date: '2026-04-10', session: 1 }
  206 |     ]));
  207 |   });
  208 |   await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  209 |   await page.waitForTimeout(1500);
  210 |   const bodyText = await page.locator('body').innerText({ timeout: 3000 }).catch(() => '');
> 211 |   expect(bodyText).toMatch(/Adherence scăzută/i);
      |                    ^ Error: expect(received).toMatch(expected)
  212 | });
  213 | 
  214 | test('SKIP_DAY pattern from legacy applied-patterns NOT rendered post-30.8', async ({ page }) => {
  215 |   await page.addInitScript(() => {
  216 |     window._suppressFirebaseSync = true;
  217 |     localStorage.setItem('onboarding-done', 'true');
  218 |     // Legacy applied-patterns with SKIP_DAY — parallel write period, still present
  219 |     localStorage.setItem('applied-patterns', JSON.stringify([
  220 |       { type: 'SKIP_DAY', day: 'Marți', skipRate: 88, confidence: 0.88, appliedAt: Date.now() }
  221 |     ]));
  222 |     // CDL empty → ctx.cdlPatterns = [] → banner suppressed
  223 |     localStorage.setItem('coach-decisions', '[]');
  224 |     localStorage.setItem('logs', '[]');
  225 |   });
  226 |   await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  227 |   await page.waitForTimeout(1500);
  228 |   const bodyText = await page.locator('body').innerText({ timeout: 3000 }).catch(() => '');
  229 |   expect(bodyText).not.toMatch(/Marți are 88%/i);
  230 |   expect(bodyText).not.toMatch(/Program scurtat la/i);
  231 | });
  232 | 
```