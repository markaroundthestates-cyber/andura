# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/scenarios/session-logs-persist.spec.js >> cleanFakeLogs preserves real multi-set session with numeric session key
- Location: tests/e2e/scenarios/session-logs-persist.spec.js:10:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 6
Received: 4
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
      - text: DATE INSUFICIENTE
      - generic [ref=e11]: Completează 2+ sesiuni pentru fatigue score
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
        - generic [ref=e89]: "3"
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
          - generic [ref=e103]: Overhead Triceps
          - generic [ref=e104]: 23/4/26
        - generic [ref=e105]: 25 kg
        - generic [ref=e106]: ×10
      - generic [ref=e107]:
        - generic [ref=e108]:
          - generic [ref=e109]: Preacher Curl
          - generic [ref=e110]: 23/4/26
        - generic [ref=e111]: 20 kg
        - generic [ref=e112]: ×10
      - generic [ref=e113]:
        - generic [ref=e114]:
          - generic [ref=e115]: Cable Curl
          - generic [ref=e116]: 23/4/26
        - generic [ref=e117]: 30 kg
        - generic [ref=e118]: ×10
  - navigation [ref=e119]:
    - button "Coach" [ref=e120] [cursor=pointer]:
      - img [ref=e121]
      - text: Coach
    - button "Dashboard" [ref=e123] [cursor=pointer]:
      - img [ref=e124]
      - text: Dashboard
    - button "Greutate" [ref=e129] [cursor=pointer]:
      - img [ref=e130]
      - text: Greutate
    - button "Program" [ref=e133] [cursor=pointer]:
      - img [ref=e134]
      - text: Program
    - button "Plan" [ref=e137] [cursor=pointer]:
      - img [ref=e138]
      - text: Plan
  - generic: ✅ Curățat 0 loguri (4 rămase)
  - button "🔥" [ref=e142] [cursor=pointer]:
    - generic [ref=e143]: 🔥
```

# Test source

```ts
  1  | // ══ Session logs persistence — Bug 1 regression ══════════════════════════
  2  | // Verifies that cleanFakeLogs() does NOT delete real multi-set sessions
  3  | // when `session` is stored as a Number (Date.now()) — the string/number
  4  | // mismatch in Set.has() previously wiped all non-baseline logs.
  5  | import { test, expect } from '@playwright/test';
  6  | 
  7  | const BASE_URL = '/salafull/';
  8  | const SESSION_TS = 1745366400000; // numeric — Apr 23 2026
  9  | 
  10 | test('cleanFakeLogs preserves real multi-set session with numeric session key', async ({ page }) => {
  11 |   await page.addInitScript((ts) => {
  12 |     window._suppressFirebaseSync = true;
  13 |     localStorage.setItem('onboarding-done', 'true');
  14 |     const logs = [
  15 |       { date: '2026-04-23', ex: 'Cable Curl',      w: 30, reps: '10', rpe: 7, ts: ts + 1, session: ts },
  16 |       { date: '2026-04-23', ex: 'Cable Curl',      w: 30, reps: '10', rpe: 7, ts: ts + 2, session: ts },
  17 |       { date: '2026-04-23', ex: 'Preacher Curl',   w: 20, reps: '10', rpe: 7, ts: ts + 3, session: ts },
  18 |       { date: '2026-04-23', ex: 'Preacher Curl',   w: 20, reps: '10', rpe: 7, ts: ts + 4, session: ts },
  19 |       { date: '2026-04-23', ex: 'Overhead Triceps',w: 25, reps: '10', rpe: 7, ts: ts + 5, session: ts },
  20 |       // baseline — always preserved
  21 |       { date: '2026-04-17', ex: 'Lat Pulldown', w: 50, reps: '8', baseline: true, ts: 1, session: null },
  22 |     ];
  23 |     localStorage.setItem('logs', JSON.stringify(logs));
  24 |   }, SESSION_TS);
  25 | 
  26 |   await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  27 |   await page.waitForTimeout(800);
  28 | 
  29 |   const { before, after } = await page.evaluate(() => {
  30 |     const before = JSON.parse(localStorage.getItem('logs') || '[]').length;
  31 |     window.cleanFakeLogs();
  32 |     const after = JSON.parse(localStorage.getItem('logs') || '[]').length;
  33 |     return { before, after };
  34 |   });
  35 | 
  36 |   expect(after, 'real multi-set logs must survive cleanFakeLogs').toBe(before);
> 37 |   expect(after).toBe(6); // 5 real sets + 1 baseline
     |                 ^ Error: expect(received).toBe(expected) // Object.is equality
  38 | });
  39 | 
  40 | test('cleanFakeLogs removes singleton sessions (test aborts)', async ({ page }) => {
  41 |   await page.addInitScript((ts) => {
  42 |     window._suppressFirebaseSync = true;
  43 |     localStorage.setItem('onboarding-done', 'true');
  44 |     const logs = [
  45 |       { date: '2026-04-23', ex: 'Cable Curl', w: 30, reps: '5', rpe: 7, ts: ts + 1, session: ts },
  46 |       { date: '2026-04-17', ex: 'Lat Pulldown', w: 50, reps: '8', baseline: true, ts: 1, session: null },
  47 |     ];
  48 |     localStorage.setItem('logs', JSON.stringify(logs));
  49 |   }, SESSION_TS);
  50 | 
  51 |   await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  52 |   await page.waitForTimeout(800);
  53 | 
  54 |   const after = await page.evaluate(() => {
  55 |     window.cleanFakeLogs();
  56 |     return JSON.parse(localStorage.getItem('logs') || '[]').length;
  57 |   });
  58 | 
  59 |   expect(after).toBe(1); // only baseline remains
  60 | });
  61 | 
```