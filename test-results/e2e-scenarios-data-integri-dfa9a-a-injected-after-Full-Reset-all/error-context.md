# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/scenarios/data-integrity.spec.js >> Data integrity after reset >> No fake data injected after Full Reset
- Location: tests/e2e/scenarios/data-integrity.spec.js:10:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 0
Received: 45
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]: AZI
      - generic [ref=e6]: UPPER PUMP + PICIOARE
      - generic [ref=e7]:
        - text: "MAIN LIFT:"
        - strong [ref=e8]: LEG PRESS
      - generic [ref=e9]: vineri, 24 aprilie · ~81 min
    - generic [ref=e10]:
      - text: 🟢 PROGRESEAZĂ NORMAL
      - generic [ref=e11]: Scor 13/100 · Totul în limite normale
    - generic [ref=e12]:
      - generic [ref=e13]:
        - generic [ref=e14]: Cum te simți azi?
        - generic [ref=e15]:
          - button "😴 Epuizat" [ref=e16] [cursor=pointer]:
            - generic [ref=e17]: 😴
            - generic [ref=e18]: Epuizat
          - button "😕 Obosit" [ref=e19] [cursor=pointer]:
            - generic [ref=e20]: 😕
            - generic [ref=e21]: Obosit
          - button "😐 Normal" [ref=e22] [cursor=pointer]:
            - generic [ref=e23]: 😐
            - generic [ref=e24]: Normal
          - button "😊 Bine" [ref=e25] [cursor=pointer]:
            - generic [ref=e26]: 😊
            - generic [ref=e27]: Bine
          - button "🔥 Excelent" [ref=e28] [cursor=pointer]:
            - generic [ref=e29]: 🔥
            - generic [ref=e30]: Excelent
      - generic [ref=e31]:
        - generic [ref=e32]:
          - generic [ref=e34]:
            - generic [ref=e35]: Incline DB Press pump
            - generic [ref=e36]: 3×10
            - generic [ref=e37]:
              - button "⚠️ Ocupat" [ref=e38] [cursor=pointer]
              - button "🚫 Lipsă" [ref=e39] [cursor=pointer]
              - button "❓ De ce?" [ref=e40] [cursor=pointer]
          - generic [ref=e41]:
            - generic [ref=e42]: 10kg
            - generic [ref=e43]: ⚡ START
        - generic [ref=e44]:
          - generic [ref=e46]:
            - generic [ref=e47]: Cable Fly
            - generic [ref=e48]: 2×10
            - generic [ref=e49]:
              - button "⚠️ Ocupat" [ref=e50] [cursor=pointer]
              - button "🚫 Lipsă" [ref=e51] [cursor=pointer]
              - button "❓ De ce?" [ref=e52] [cursor=pointer]
          - generic [ref=e53]:
            - generic [ref=e54]: 9kg
            - generic [ref=e55]: ⚡ START
        - generic [ref=e56]:
          - generic [ref=e58]:
            - generic [ref=e59]: Lateral Raises
            - generic [ref=e60]: 4×15–20
            - generic [ref=e61]:
              - button "⚠️ Ocupat" [ref=e62] [cursor=pointer]
              - button "🚫 Lipsă" [ref=e63] [cursor=pointer]
              - button "❓ De ce?" [ref=e64] [cursor=pointer]
          - generic [ref=e65]:
            - generic [ref=e66]: 10kg
            - generic [ref=e67]: ⚡ START
        - generic [ref=e68]:
          - generic [ref=e70]:
            - generic [ref=e71]: Rear Delt Cable
            - generic [ref=e72]: 2×15–20
            - generic [ref=e73]:
              - button "⚠️ Ocupat" [ref=e74] [cursor=pointer]
              - button "🚫 Lipsă" [ref=e75] [cursor=pointer]
              - button "❓ De ce?" [ref=e76] [cursor=pointer]
          - generic [ref=e77]:
            - generic [ref=e78]: 9kg
            - generic [ref=e79]: ⚡ START
        - generic [ref=e80] [cursor=pointer]: ▾ +5 exerciții
    - generic [ref=e81]:
      - generic [ref=e82]:
        - generic [ref=e83]: "0"
        - generic [ref=e84]: Streak
      - generic [ref=e85]:
        - generic [ref=e86]: "501"
        - generic [ref=e87]: Kcal est.
      - generic [ref=e88]:
        - generic [ref=e89]: "45"
        - generic [ref=e90]: Seturi/săpt
    - generic [ref=e91]:
      - button "▶ START VINERI · ~72 MIN (±10)" [ref=e92] [cursor=pointer]:
        - img [ref=e93]
        - generic [ref=e95]: ▶ START VINERI · ~72 MIN (±10)
      - button "Sari ziua" [ref=e97] [cursor=pointer]
    - generic [ref=e98]: Recorduri personale
    - generic [ref=e100]:
      - generic [ref=e101]:
        - generic [ref=e102]:
          - generic [ref=e103]: Face Pulls
          - generic [ref=e104]: 18/4/26
        - generic [ref=e105]: 80 kg
        - generic [ref=e106]: ×8
      - generic [ref=e107]:
        - generic [ref=e108]:
          - generic [ref=e109]: Bayesian Curl
          - generic [ref=e110]: 18/4/26
        - generic [ref=e111]: 75 kg
        - generic [ref=e112]: ×8
      - generic [ref=e113]:
        - generic [ref=e114]:
          - generic [ref=e115]: Chest-Supported Row
          - generic [ref=e116]: 18/4/26
        - generic [ref=e117]: 70 kg
        - generic [ref=e118]: ×8
      - generic [ref=e119] [cursor=pointer]: ▾ Vezi toate (5)
  - navigation [ref=e120]:
    - button "Coach" [ref=e121] [cursor=pointer]:
      - img [ref=e122]
      - text: Coach
    - button "Dashboard" [ref=e124] [cursor=pointer]:
      - img [ref=e125]
      - text: Dashboard
    - button "Greutate" [ref=e130] [cursor=pointer]:
      - img [ref=e131]
      - text: Greutate
    - button "Program" [ref=e134] [cursor=pointer]:
      - img [ref=e135]
      - text: Program
    - button "Plan" [ref=e138] [cursor=pointer]:
      - img [ref=e139]
      - text: Plan
  - button "🔥" [ref=e143] [cursor=pointer]:
    - generic [ref=e144]: 🔥
```

# Test source

```ts
  1   | // ══ Data Integrity Tests — no fake data injected after reset ══════════════════
  2   | import { test, expect } from '@playwright/test';
  3   | import { setupUser } from '../helpers/setup.js';
  4   | import { EMPTY, CONTAMINATED, WITH_HISTORY } from '../fixtures/users.js';
  5   | 
  6   | const BASE_URL = '/salafull/';
  7   | 
  8   | test.describe('Data integrity after reset', () => {
  9   | 
  10  |   test('No fake data injected after Full Reset', async ({ page }) => {
  11  |     await setupUser(page, CONTAMINATED);
  12  |     await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  13  |     await page.waitForLoadState('networkidle', { timeout: 20000 });
  14  | 
  15  |     // Simulate full reset: clear localStorage and reload
  16  |     await page.evaluate(() => {
  17  |       localStorage.clear();
  18  |       window._suppressFirebaseSync = true;
  19  |     });
  20  |     await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
  21  |     await page.waitForLoadState('networkidle', { timeout: 20000 });
  22  |     await page.waitForTimeout(1000);
  23  | 
  24  |     const logs = await page.evaluate(() => {
  25  |       const raw = localStorage.getItem('logs');
  26  |       return raw ? JSON.parse(raw) : [];
  27  |     });
  28  | 
> 29  |     expect(logs.length).toBe(0);
      |                         ^ Error: expect(received).toBe(expected) // Object.is equality
  30  | 
  31  |     const body = await page.locator('body').innerText({ timeout: 5000 }).catch(() => '');
  32  |     expect(body).not.toContain('Pattern detectat');
  33  |     expect(body).not.toContain('Program scurtat');
  34  |     expect(body).not.toContain('skip rate');
  35  |   });
  36  | 
  37  |   test('No [inject] console messages for clean user', async ({ page }) => {
  38  |     const consoleMessages = [];
  39  |     page.on('console', msg => {
  40  |       if (msg.type() === 'log') consoleMessages.push(msg.text());
  41  |     });
  42  | 
  43  |     await setupUser(page, EMPTY);
  44  |     await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  45  |     await page.waitForLoadState('networkidle', { timeout: 20000 });
  46  |     await page.waitForTimeout(1000);
  47  | 
  48  |     const injectMessages = consoleMessages.filter(m => m.includes('[inject]'));
  49  |     expect(injectMessages).toHaveLength(0);
  50  |   });
  51  | 
  52  |   test('Empty state shows no fake data', async ({ page }) => {
  53  |     await setupUser(page, EMPTY);
  54  |     await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  55  |     await page.waitForLoadState('networkidle', { timeout: 20000 });
  56  |     await page.waitForTimeout(1000);
  57  | 
  58  |     const body = await page.locator('body').innerText({ timeout: 5000 }).catch(() => '');
  59  |     expect(body).not.toMatch(/Apr 21|Apr 22|21\/4|22\/4/);
  60  |   });
  61  | 
  62  |   test('Soft Reset preserves real logs', async ({ page }) => {
  63  |     // Suppress Firebase sync before page load to avoid remote data contaminating test
  64  |     await setupUser(page, EMPTY);
  65  |     await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  66  |     await page.waitForLoadState('networkidle', { timeout: 20000 });
  67  | 
  68  |     await page.evaluate(() => {
  69  |       window._suppressFirebaseSync = true;
  70  |       localStorage.setItem('logs', JSON.stringify([
  71  |         { exercise: 'Lat Pulldown', weight: 64, reps: 8, date: '2026-04-21' },
  72  |         { exercise: 'Cable Row', weight: 72, reps: 8, date: '2026-04-21' }
  73  |       ]));
  74  |       localStorage.setItem('weights', JSON.stringify({ '2026-04-21': 110.4 }));
  75  |       localStorage.setItem('auto-recommendations', JSON.stringify([{ type: 'test' }]));
  76  |       localStorage.setItem('applied-patterns', JSON.stringify([{ test: true }]));
  77  |     });
  78  | 
  79  |     // Execute soft reset — use window.resetButKeepRealLogs if deployed, else simulate inline
  80  |     await page.evaluate(async () => {
  81  |       window._suppressFirebaseSync = true;
  82  |       if (typeof window.resetButKeepRealLogs === 'function') {
  83  |         await window.resetButKeepRealLogs({ reload: false });
  84  |       } else {
  85  |         // Inline simulation of soft reset logic for pre-deploy runs
  86  |         const KEEP_KEYS = [
  87  |           'logs', 'weights', 'kcals', 'prots', 'waters', 'pr-records',
  88  |           'phase-log', 'phase-change-date', 'bf-override', 'readiness',
  89  |           'session-burns', 'closed-days', 'wellbeing', 'suppl-list',
  90  |           'active-theme', 'device-id', 'notif-enabled', 'muted', 'workout-skips',
  91  |           'current-kcal', 'phase-override', 'onboarding-done'
  92  |         ];
  93  |         const preserved = {};
  94  |         KEEP_KEYS.forEach(k => {
  95  |           const v = localStorage.getItem(k);
  96  |           if (v !== null) preserved[k] = v;
  97  |         });
  98  |         localStorage.clear();
  99  |         Object.entries(preserved).forEach(([k, v]) => localStorage.setItem(k, v));
  100 |       }
  101 |     });
  102 |     await page.waitForTimeout(500);
  103 | 
  104 |     const logsAfter = await page.evaluate(() => localStorage.getItem('logs'));
  105 |     const weightsAfter = await page.evaluate(() => localStorage.getItem('weights'));
  106 |     expect(logsAfter).toBeTruthy();
  107 |     expect(JSON.parse(logsAfter).length).toBe(2);
  108 |     expect(weightsAfter).toBeTruthy();
  109 | 
  110 |     const autoRecs = await page.evaluate(() => localStorage.getItem('auto-recommendations'));
  111 |     const applied = await page.evaluate(() => localStorage.getItem('applied-patterns'));
  112 |     expect(autoRecs).toBeNull();
  113 |     expect(applied).toBeNull();
  114 |   });
  115 | 
  116 |   test('Full Reset clears onboarding-done', async ({ page }) => {
  117 |     await page.addInitScript(() => { window._suppressFirebaseSync = true; });
  118 |     await page.goto('/salafull/', { waitUntil: 'domcontentloaded' });
  119 |     await page.evaluate(() => {
  120 |       localStorage.setItem('onboarding-done', 'true');
  121 |       localStorage.setItem('logs', '[{"ex":"test","w":20}]');
  122 |     });
  123 |     await page.evaluate(() => {
  124 |       const TEST_RESIDUE_KEYS = ['auto-recommendations','applied-patterns','applied-recommendations','early-stops','session-draft','peak-hours','step-streaks','session-start-hours','session-ratings','dev-mode','unavailable-equipment','pattern-detection-cache','adherence-overrides'];
  125 |       const USER_DATA_KEYS = ['weights','kcals','prots','logs','readiness','phase-override','phase-log','phase-change-date','bf-override','pr-records','current-kcal','suppl-list','active-theme','waters','workout-skips','device-id','session-burns','wellbeing','notif-enabled','closed-days','muted','onboarding-done','onboarding-completed'];
  126 |       const ALL_KEYS = [...TEST_RESIDUE_KEYS, ...USER_DATA_KEYS];
  127 |       ALL_KEYS.forEach(k => localStorage.removeItem(k));
  128 |     });
  129 |     const result = await page.evaluate(() => localStorage.getItem('onboarding-done'));
```