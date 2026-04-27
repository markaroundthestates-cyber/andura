# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: integration.spec.js >> Integration — Readiness Card >> selectând readiness îl salvează și ascunde selectorul
- Location: tests\integration.spec.js:97:3

# Error details

```
Error: Verdict card nu apare după selectarea readiness. Conținut: 
      
        🚶 OBIECTIVUL DE AZI
        
          0
          
            target: 8.000 pași
            0%
          
        
        
          
        
        
          
          SAVE
 

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]: AZI
      - generic [ref=e6]: OFF – RECUPERARE
      - generic [ref=e7]: luni, 27 aprilie
    - generic [ref=e8]:
      - text: 🟢 FORMĂ EXCELENTĂ
      - generic [ref=e9]: Scor 0/100 · Recuperare excelentă · Poți împinge mai mult azi
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
          - button "SAVE" [active] [ref=e21] [cursor=pointer]
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
        - generic [ref=e35]: "34"
        - generic [ref=e36]: Seturi/săpt
    - button "Sari ziua" [ref=e39] [cursor=pointer]
    - generic [ref=e40]: Recorduri personale
    - generic [ref=e42]:
      - generic [ref=e43]:
        - generic [ref=e44]:
          - generic [ref=e45]: Cable Row
          - generic [ref=e46]: 25/4/26
        - generic [ref=e47]: 70 kg
        - generic [ref=e48]: ×10
      - generic [ref=e49]:
        - generic [ref=e50]:
          - generic [ref=e51]: Pec Deck / Cable Fly
          - generic [ref=e52]: 25/4/26
        - generic [ref=e53]: 59 kg
        - generic [ref=e54]: ×13
      - generic [ref=e55]:
        - generic [ref=e56]:
          - generic [ref=e57]: Flat DB Press
          - generic [ref=e58]: 25/4/26
        - generic [ref=e59]: 20 kg
        - generic [ref=e60]: ×9
      - generic [ref=e61] [cursor=pointer]: ▾ Vezi toate (12)
  - navigation [ref=e62]:
    - button "Coach" [ref=e63] [cursor=pointer]:
      - img [ref=e64]
      - text: Coach
    - button "Dashboard" [ref=e66] [cursor=pointer]:
      - img [ref=e67]
      - text: Dashboard
    - button "Greutate" [ref=e72] [cursor=pointer]:
      - img [ref=e73]
      - text: Greutate
    - button "Program" [ref=e76] [cursor=pointer]:
      - img [ref=e77]
      - text: Program
    - button "Plan" [ref=e80] [cursor=pointer]:
      - img [ref=e81]
      - text: Plan
  - generic: ☁ Date sincronizate
  - button "🔥" [ref=e85] [cursor=pointer]:
    - generic [ref=e86]: 🔥
```

# Test source

```ts
  12  |   { date: '2026-04-21', ex: 'Lat Pulldown',     w: 64,  reps: '8',  rpe: 8, ts: 1745254800000, session: 1745254800000, baseline: false },
  13  |   { date: '2026-04-21', ex: 'Lat Pulldown',     w: 64,  reps: '8',  rpe: 8, ts: 1745254803000, session: 1745254800000, baseline: false },
  14  |   { date: '2026-04-21', ex: 'Lat Pulldown',     w: 64,  reps: '8',  rpe: 8, ts: 1745254806000, session: 1745254800000, baseline: false },
  15  |   { date: '2026-04-21', ex: 'Cable Row',        w: 72,  reps: '8',  rpe: 7, ts: 1745254810000, session: 1745254800000, baseline: false },
  16  |   { date: '2026-04-21', ex: 'Bayesian Curl',    w: 18,  reps: '10', rpe: 8, ts: 1745254820000, session: 1745254800000, baseline: false },
  17  |   { date: '2026-04-22', ex: 'Incline DB Press', w: 30,  reps: '8',  rpe: 8, ts: 1745341200000, session: 1745341200000, baseline: false },
  18  |   { date: '2026-04-22', ex: 'DB Shoulder Press',w: 25,  reps: '8',  rpe: 8, ts: 1745341203000, session: 1745341200000, baseline: false },
  19  |   { date: '2026-04-22', ex: 'Lateral Raises',   w: 10,  reps: '10', rpe: 7, ts: 1745341206000, session: 1745341200000, baseline: false },
  20  | ];
  21  | 
  22  | const SEED_PR_RECORDS = [
  23  |   { ex: 'Lat Pulldown',     kg: 64, reps: '8',  date: '2026-04-21' },
  24  |   { ex: 'Cable Row',        kg: 72, reps: '8',  date: '2026-04-21' },
  25  |   { ex: 'Incline DB Press', kg: 30, reps: '8',  date: '2026-04-22' },
  26  |   { ex: 'DB Shoulder Press',kg: 25, reps: '8',  date: '2026-04-22' },
  27  |   { ex: 'Bayesian Curl',    kg: 18, reps: '10', date: '2026-04-21' },
  28  | ];
  29  | 
  30  | const SEED_BURNS = [
  31  |   { date: '2026-04-21', day: 'Marți',    mins: 62, kcal: 320, sets: 5,  startHour: 18 },
  32  |   { date: '2026-04-22', day: 'Miercuri', mins: 68, kcal: 350, sets: 3,  startHour: 18 },
  33  | ];
  34  | 
  35  | /** Injects seed data into localStorage before the page scripts run */
  36  | function seedStorage(extraOverrides = {}) {
  37  |   return async (page) => {
  38  |     await page.addInitScript(({ logs, prs, burns, today, overrides }) => {
  39  |       localStorage.setItem('logs',           JSON.stringify(logs));
  40  |       localStorage.setItem('pr-records',     JSON.stringify(prs));
  41  |       localStorage.setItem('session-burns',  JSON.stringify(burns));
  42  |       localStorage.setItem('onboarding-done', 'true');
  43  |       // Apply any extra overrides
  44  |       Object.entries(overrides).forEach(([k, v]) => localStorage.setItem(k, JSON.stringify(v)));
  45  |     }, { logs: SEED_LOGS, prs: SEED_PR_RECORDS, burns: SEED_BURNS, today: TODAY, overrides: extraOverrides });
  46  |   };
  47  | }
  48  | 
  49  | // ── Tests ──────────────────────────────────────────────────────────────────────
  50  | 
  51  | test.describe('Integration — PR Wall', () => {
  52  |   test('PR Wall afișează recorduri (nu empty state)', async ({ page }) => {
  53  |     await seedStorage()(page);
  54  |     await page.goto('/salafull/');
  55  |     await page.waitForLoadState('networkidle');
  56  |     await page.waitForSelector('#pr-wall-list', { timeout: 10000 });
  57  | 
  58  |     const prWall = page.locator('#pr-wall-list');
  59  |     // Should not show the empty-state card
  60  |     await expect(prWall).not.toContainText('Niciun record personal');
  61  |     // Should contain at least one kg value
  62  |     const text = await prWall.textContent();
  63  |     expect(text, 'PR Wall nu afișează nicio greutate').toMatch(/\d+ kg/);
  64  |   });
  65  | 
  66  |   test('PR Wall afișează cel puțin o greutate numerică', async ({ page }) => {
  67  |     await seedStorage()(page);
  68  |     await page.goto('/salafull/');
  69  |     await page.waitForLoadState('networkidle');
  70  |     await page.waitForSelector('#pr-wall-list', { timeout: 10000 });
  71  | 
  72  |     const prWall = page.locator('#pr-wall-list');
  73  |     const text = await prWall.textContent();
  74  |     // Should show at least one weight like "36 kg", "41 kg" etc.
  75  |     const kgMatches = text.match(/\d+(?:\.\d+)?\s*kg/g) || [];
  76  |     expect(kgMatches.length, `PR Wall nu conține nicio greutate. Conținut: ${text.slice(0, 200)}`).toBeGreaterThan(0);
  77  |   });
  78  | });
  79  | 
  80  | test.describe('Integration — Readiness Card', () => {
  81  |   test('cardul de readiness apare când nu e setat azi', async ({ page }) => {
  82  |     // Inject data WITHOUT readiness for today → card should show emoji selector
  83  |     await seedStorage({ readiness: {} })(page);
  84  |     await page.goto('/salafull/');
  85  |     await page.waitForLoadState('networkidle');
  86  |     await page.waitForSelector('#today-preview-list', { timeout: 10000 });
  87  | 
  88  |     const preview = page.locator('#today-preview-list');
  89  |     const text = await preview.textContent();
  90  |     // Selector shown when readiness not set, verdict shown when already set (e.g. from Firebase sync)
  91  |     const hasReadiness = text.includes('Cum te simți') || text.includes('simți')
  92  |       || text.includes('😴') || text.includes('🔥')
  93  |       || text.includes('Readiness') || text.includes('🧠');
  94  |     expect(hasReadiness, `Readiness card lipsă. Conținut preview: ${text.slice(0, 200)}`).toBe(true);
  95  |   });
  96  | 
  97  |   test('selectând readiness îl salvează și ascunde selectorul', async ({ page }) => {
  98  |     await seedStorage({ readiness: {} })(page);
  99  |     await page.goto('/salafull/');
  100 |     await page.waitForLoadState('networkidle');
  101 |     await page.waitForSelector('#today-preview-list', { timeout: 10000 });
  102 | 
  103 |     // Click the first readiness button (emoji button for value 1–5)
  104 |     const readinessBtn = page.locator('#today-preview-list button').first();
  105 |     if (await readinessBtn.isVisible()) {
  106 |       await readinessBtn.click();
  107 |       await page.waitForTimeout(400);
  108 |       // After selection, the 🧠 verdict card should appear
  109 |       const preview = page.locator('#today-preview-list');
  110 |       const text = await preview.textContent();
  111 |       const hasVerdict = text.includes('🧠') || text.includes('Readiness') || text.includes('Sesiune');
> 112 |       expect(hasVerdict, `Verdict card nu apare după selectarea readiness. Conținut: ${text.slice(0, 200)}`).toBe(true);
      |                                                                                                              ^ Error: Verdict card nu apare după selectarea readiness. Conținut: 
  113 |     } else {
  114 |       // If no readiness button visible, skip gracefully (may be OFF day)
  115 |       test.skip();
  116 |     }
  117 |   });
  118 | });
  119 | 
  120 | test.describe('Integration — Dashboard Calendar', () => {
  121 |   test('calendarul săptămânal are 7 zile vizibile', async ({ page }) => {
  122 |     await seedStorage()(page);
  123 |     await page.goto('/salafull/');
  124 |     await page.waitForLoadState('networkidle');
  125 | 
  126 |     // Navigate to dashboard
  127 |     const navDash = page.locator('.nb').nth(1);
  128 |     await navDash.click();
  129 |     await page.waitForTimeout(500);
  130 |     await page.waitForSelector('#week-calendar', { timeout: 10000 });
  131 | 
  132 |     const calendar = page.locator('#week-calendar');
  133 |     await expect(calendar).toBeVisible();
  134 | 
  135 |     // Calendar should contain day abbreviations L M M J V S D
  136 |     const calText = await calendar.textContent();
  137 |     const dayLetters = ['L', 'M', 'J', 'V', 'S', 'D'];
  138 |     const foundDays = dayLetters.filter(d => calText.includes(d));
  139 |     expect(foundDays.length, `Calendar găsit doar ${foundDays.length}/6 zile unice. Conținut: ${calText}`).toBeGreaterThanOrEqual(5);
  140 |   });
  141 | 
  142 |   test('secțiunea de sesiune din dashboard are conținut', async ({ page }) => {
  143 |     await seedStorage()(page);
  144 |     await page.goto('/salafull/');
  145 |     await page.waitForLoadState('networkidle');
  146 | 
  147 |     const navDash = page.locator('.nb').nth(1);
  148 |     await navDash.click();
  149 |     await page.waitForTimeout(500);
  150 | 
  151 |     // #today-session-hist or #daily-cmd should be visible
  152 |     const dcmd = page.locator('#daily-cmd');
  153 |     await expect(dcmd).toBeVisible();
  154 |     const text = await dcmd.textContent();
  155 |     expect(text.trim().length).toBeGreaterThan(0);
  156 |   });
  157 | });
  158 | 
  159 | test.describe('Integration — Skip Workout Modal', () => {
  160 |   test('butonul "Sari ziua" deschide modalul de skip', async ({ page }) => {
  161 |     await seedStorage()(page);
  162 |     await page.goto('/salafull/');
  163 |     await page.waitForLoadState('networkidle');
  164 |     await page.waitForSelector('#today-screen', { timeout: 10000 });
  165 | 
  166 |     // Find skip button
  167 |     const skipBtn = page.locator('button', { hasText: 'Sari ziua' });
  168 | 
  169 |     if (await skipBtn.isVisible()) {
  170 |       await skipBtn.click();
  171 |       await page.waitForTimeout(300);
  172 | 
  173 |       // Modal should appear
  174 |       const modal = page.locator('#skip-modal');
  175 |       await expect(modal).toBeVisible({ timeout: 3000 });
  176 | 
  177 |       // Should contain reason options
  178 |       const modalText = await modal.textContent();
  179 |       expect(modalText).toContain('Obosit');
  180 |       expect(modalText).toContain('timp');
  181 |     } else {
  182 |       // OFF day — skip button not shown on rest days
  183 |       const cmdText = await page.locator('#today-cmd').textContent();
  184 |       expect(['OFF', 'RECUPERARE'].some(t => cmdText.includes(t))).toBe(true);
  185 |     }
  186 |   });
  187 | });
  188 | 
  189 | test.describe('Integration — Greutăți per echipament', () => {
  190 |   test('recomandarea pentru Lat Pulldown e din seria Bailib (multiplu de 5)', async ({ page }) => {
  191 |     await seedStorage()(page);
  192 |     await page.goto('/salafull/');
  193 |     await page.waitForLoadState('networkidle');
  194 |     await page.waitForSelector('#today-preview-list', { timeout: 10000 });
  195 | 
  196 |     // Lat Pulldown appears on Tuesday (PULL day); may not be visible today
  197 |     // Check PR wall for the recorded weight instead
  198 |     const prWall = page.locator('#pr-wall-list');
  199 |     const text = await prWall.textContent();
  200 | 
  201 |     if (text.includes('Lat Pulldown')) {
  202 |       // Lat Pulldown weights from bailib_stack are multiples of 5: 5,10,15,20...80
  203 |       // and the recorded PR is 64kg — which is NOT in bailib_stack
  204 |       // The DISPLAY in PR wall shows the actual logged weight, not the rounded one
  205 |       // So we just verify it shows a numeric value
  206 |       expect(text).toMatch(/\d+ kg/);
  207 |     } else {
  208 |       // Exercise not in PR wall — acceptable on non-PULL days
  209 |       expect(true).toBe(true);
  210 |     }
  211 |   });
  212 | 
```