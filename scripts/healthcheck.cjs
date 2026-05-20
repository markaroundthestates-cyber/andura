#!/usr/bin/env node
// ══ HEALTHCHECK — Production smoke verify ════════════════════════════════
// §A032 audit fix (NC§34-C2) — run post-deploy + daily morning.
//
// Checks:
//   1. DNS resolve andura.app
//   2. HTTPS 200 OK la /
//   3. Firebase RTDB reachable (anonymous ping, NU auth)
//   4. Sentry DSN responsive (HEAD request — NO event sent)
//
// Exit code: 0 = all green, 1 = at least one fail.
// Usage: `node scripts/healthcheck.cjs` or `npm run healthcheck`.

const https = require('https');
const dns = require('dns').promises;

const TARGET = process.env.ANDURA_TARGET_HOST || 'andura.app';
const FIREBASE_RTDB_URL = process.env.VITE_FIREBASE_RTDB_URL
  || 'https://andura-default-rtdb.europe-west1.firebasedatabase.app';
const SENTRY_DSN = process.env.VITE_SENTRY_DSN
  || 'https://dcbb183e8d98e95c6cd8b2c3c49b2427@o4511269200068608.ingest.de.sentry.io/4511269203869776';
const TIMEOUT_MS = 10_000;

const checks = [];

function record(name, ok, details) {
  checks.push({ name, ok, details });
  const icon = ok ? '[OK]' : '[FAIL]';
  console.log(`${icon} ${name}${details ? ' — ' + details : ''}`);
}

async function checkDns() {
  try {
    const addresses = await dns.resolve4(TARGET);
    record('DNS resolve', addresses.length > 0, addresses.join(', '));
  } catch (err) {
    record('DNS resolve', false, err.message);
  }
}

function httpGet(urlString, method = 'GET') {
  return new Promise((resolve) => {
    let url;
    try {
      url = new URL(urlString);
    } catch (e) {
      resolve({ ok: false, error: 'invalid_url' });
      return;
    }
    const req = https.request(
      {
        method,
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        timeout: TIMEOUT_MS,
      },
      (res) => {
        res.resume();
        resolve({ ok: res.statusCode >= 200 && res.statusCode < 400, status: res.statusCode });
      },
    );
    req.on('error', (err) => resolve({ ok: false, error: err.message }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, error: 'timeout' });
    });
    req.end();
  });
}

async function checkHttps() {
  const result = await httpGet(`https://${TARGET}/`);
  record('HTTPS 200 OK', result.ok, result.status ? `status ${result.status}` : result.error);
}

async function checkFirebaseRtdb() {
  // Anonymous ping — read RTDB root URL. Will return 401 if rules deny anonymous,
  // which still means RTDB is reachable (Firebase up).
  const result = await httpGet(`${FIREBASE_RTDB_URL}/.json?shallow=true`);
  const reachable = result.status === 200 || result.status === 401 || result.status === 403;
  record(
    'Firebase RTDB reachable',
    reachable,
    result.status ? `status ${result.status}` : result.error,
  );
}

async function checkSentry() {
  // Sentry DSN parse — extract host from format
  // https://<key>@<host>/<project_id>
  try {
    const url = new URL(SENTRY_DSN);
    const result = await httpGet(`https://${url.hostname}/api/0/`, 'HEAD');
    // Sentry API root typically returns 401 for unauthenticated HEAD — still proves reachable.
    const reachable = result.status === 200 || result.status === 401;
    record(
      'Sentry DSN responsive',
      reachable,
      result.status ? `status ${result.status}` : result.error,
    );
  } catch (err) {
    record('Sentry DSN responsive', false, err.message);
  }
}

(async () => {
  console.log(`Healthcheck target: https://${TARGET}/`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('---');
  await checkDns();
  await checkHttps();
  await checkFirebaseRtdb();
  await checkSentry();
  console.log('---');
  const failed = checks.filter((c) => !c.ok);
  if (failed.length === 0) {
    console.log(`All ${checks.length} checks passed.`);
    process.exit(0);
  } else {
    console.error(`${failed.length}/${checks.length} checks failed.`);
    process.exit(1);
  }
})();
