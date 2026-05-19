// Track 7 §7.8 — Stagehand persona exploration nightly template per master spec §3.
//
// READY-TO-ACTIVATE skeleton. Activates when Daniel completes setup per
// 📥_inbox/SETUP_DANIEL_TRACK_7.md §A.2:
//   1. Sign up Browserbase (paid product, pricing TBD)
//   2. Obtain BROWSERBASE_API_KEY + BROWSERBASE_PROJECT_ID
//   3. Obtain ANTHROPIC_API_KEY (for Claude 4.7 Stagehand model)
//   4. npm i -D @browserbasehq/stagehand zod (framework + schema)
//   5. Upload secrets la GitHub repo Settings → Actions secrets
//   6. Scheduled cron 03:00 UTC daily în .github/workflows/track-7-nightly.yml
//
// Scope per WebTestBench arXiv 2603.25226: **MONITORING NU release-gating**.
// Anomalies → GitHub Issues queue (`exploration-anomaly` label) → Daniel review
// morning. NU wire în PR checks per master spec §3 verbatim.
//
// Runtime: Node 22+ ESM (.mjs extension — no transpile needed). Stagehand is
// optional peer dep activated only when ANTHROPIC + BROWSERBASE env present.

// === ACTIVATION GUARD ===
// Skip silently when env not set — keeps cron job non-failing without secrets.
if (!process.env.ANTHROPIC_API_KEY || !process.env.BROWSERBASE_API_KEY) {
  console.log(
    '[nightly-exploration] SKIP — ANTHROPIC_API_KEY + BROWSERBASE_API_KEY env required. See 📥_inbox/SETUP_DANIEL_TRACK_7.md §A.2+§A.3',
  );
  process.exit(0);
}

// Dynamic imports — only loaded when env activated, avoids hard dep failure
// when @browserbasehq/stagehand not installed yet.
let Stagehand;
let z;
try {
  ({ Stagehand } = await import('@browserbasehq/stagehand'));
  ({ z } = await import('zod'));
} catch (err) {
  console.error(
    '[nightly-exploration] @browserbasehq/stagehand + zod NOT installed. Run: npm i -D @browserbasehq/stagehand zod',
  );
  process.exit(1);
}

// === PERSONA DEFINITIONS ===
// Mirrors tests/fixtures/personas.ts §7.1 canonical personas for cross-tier coverage.
const personas = [
  {
    name: 'Gigel',
    tier: 'T0',
    goal: 'completeaza un workout simplu — login + verifica primul ecran Antrenor + apasa Start',
    profile: { age: 32, sex: 'M', experience: 'novice', joints: [] },
  },
  {
    name: 'Marius',
    tier: 'T2',
    goal: 'verifica progres + PR-uri — tab Progres + Istoric',
    profile: { age: 28, sex: 'M', experience: 'intermediate', joints: [] },
  },
  {
    name: 'Maria 65',
    tier: 'T3',
    goal: 'logheaza greutate + analizeaza nutritie — tab Progres LogWeight + Nutrition',
    profile: { age: 67, sex: 'F', experience: 'beginner', joints: ['knee-left'] },
  },
];

// === ANOMALY SCHEMA ===
// Strict shape — Stagehand LLM extracts observations matching this contract.
const anomalySchema = z.object({
  anomalies: z.array(
    z.object({
      type: z.enum([
        'broken_button',
        'empty_state',
        'slow_response',
        'error_modal',
        'layout_broken',
        'language_mixed',
        'text_truncated',
        'image_missing',
        'navigation_dead_end',
        'other',
      ]),
      severity: z.enum(['P0', 'P1', 'P2', 'P3']),
      location: z.string().describe('Route/screen unde anomalia detectata'),
      description: z.string().describe('Concise observation 1-2 sentences'),
      screenshot_hint: z.string().optional().describe('Element selector daca relevant'),
    }),
  ),
  notes: z.string().optional().describe('Overall persona experience summary'),
});

// === GITHUB ISSUES QUEUE ===
async function logAnomalyToGitHubIssues(persona, observations) {
  const githubToken = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPOSITORY || 'markaroundthestates-cyber/andura';
  if (!githubToken) {
    console.warn('[nightly-exploration] GITHUB_TOKEN absent — skip Issues queue');
    return;
  }
  const [owner, repoName] = repo.split('/');

  for (const anomaly of observations.anomalies) {
    const title = `[Exploration ${persona.name} ${persona.tier}] ${anomaly.severity} ${anomaly.type}: ${anomaly.description.slice(0, 60)}`;
    const body = [
      `**Persona:** ${persona.name} (${persona.tier}) — ${persona.profile.experience}`,
      `**Goal:** ${persona.goal}`,
      `**Anomaly type:** ${anomaly.type} (severity ${anomaly.severity})`,
      `**Location:** ${anomaly.location}`,
      `**Description:** ${anomaly.description}`,
      anomaly.screenshot_hint ? `**Screenshot hint:** \`${anomaly.screenshot_hint}\`` : '',
      observations.notes ? `\n**Run notes:** ${observations.notes}` : '',
      `\n_Detected automatically by Track 7 §7.8 Stagehand nightly exploration._`,
      `_Date: ${new Date().toISOString()}_`,
    ]
      .filter(Boolean)
      .join('\n\n');

    const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}/issues`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({
        title,
        body,
        labels: ['exploration-anomaly', `severity-${anomaly.severity.toLowerCase()}`, 'nightly-stagehand'],
      }),
    });
    if (!response.ok) {
      console.error(
        `[nightly-exploration] GitHub Issues POST failed ${response.status}:`,
        await response.text(),
      );
    }
  }
}

// === MAIN LOOP ===
const startTs = Date.now();
let totalAnomalies = 0;

for (const persona of personas) {
  const stagehand = new Stagehand({
    env: 'BROWSERBASE',
    modelName: 'claude-opus-4-7',
    apiKey: process.env.ANTHROPIC_API_KEY,
    browserbaseAPIKey: process.env.BROWSERBASE_API_KEY,
    browserbaseProjectId: process.env.BROWSERBASE_PROJECT_ID,
    verbose: 1,
  });

  try {
    await stagehand.init();
    await stagehand.page.goto('https://andura.app');

    // Scenario 1: act as persona doing goal task
    await stagehand.act(
      `Ești ${persona.name}, ${persona.profile.age} ani, ${persona.profile.experience}. ${persona.goal}. Apasa butoane natural, NU rigid — comporta-te ca un utilizator real. Daca apare modal disclaimer, accepta. Daca este nevoie de login, foloseste email playwright-${persona.name.toLowerCase()}-${persona.tier.toLowerCase()}@andura.app si magic link.`,
    );

    // Scenario 2: extract observations across journey
    const observations = await stagehand.extract({
      instruction: `Ca ${persona.name} ${persona.tier}, ai incercat sa completezi: "${persona.goal}". Logheaza orice anomalie UX intalnita (buton broken, text gol, slow >3s, eroare modal nedismiss, layout broken, text in alta limba ne-romana, image lipsa, navigation dead-end). Foloseste schema anomalySchema. Daca NU sunt anomalii, returneaza array gol + notes summary experience.`,
      schema: anomalySchema,
    });

    console.log(
      `[${persona.name} ${persona.tier}] ${observations.anomalies.length} anomalies detected`,
    );
    totalAnomalies += observations.anomalies.length;

    if (observations.anomalies.length > 0) {
      await logAnomalyToGitHubIssues(persona, observations);
    }
  } catch (err) {
    console.error(`[${persona.name} ${persona.tier}] exploration failed:`, err);
  } finally {
    await stagehand.close();
  }
}

const elapsedSec = ((Date.now() - startTs) / 1000).toFixed(1);
console.log(
  `[nightly-exploration] DONE — ${personas.length} personas explored în ${elapsedSec}s, ${totalAnomalies} anomalies → GitHub Issues queue`,
);
