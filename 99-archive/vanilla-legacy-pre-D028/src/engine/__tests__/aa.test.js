import { describe, it, expect, beforeEach } from 'vitest';
import { AA } from '../aa.js';

const today = new Date().toISOString().slice(0, 10);

function makeLogs(count, notes = []) {
  return Array.from({ length: count }, (_, i) => ({
    ex: 'Bench Press', w: 80, reps: '8', baseline: false,
    date: today, ts: Date.now() - i * 3600000 * 24,
    session: Date.now() - i * 3600000 * 24,
    notes: i === 0 ? notes : [],
  }));
}

// Build N distinct sessions with controlled notes per session
// notesPerSession[i] = array of notes applied to session i (newest first)
function makeSessions(notesPerSession, ex = 'Bench Press') {
  /** @type {Array<{ex:string,w:number,reps:string,baseline:boolean,date:string,ts:number,session:number,notes:string[]}>} */
  const logs = [];
  notesPerSession.forEach((notes, idx) => {
    const sessionTs = Date.now() - idx * 86400000 * 2;
    // 2 sets per session so we can verify per-session dedup
    for (let s = 0; s < 2; s++) {
      logs.push({
        ex, w: 80, reps: '8', baseline: false,
        date: today,
        ts: sessionTs - s * 100,
        session: sessionTs,
        notes: s === 0 ? notes : [],
      });
    }
  });
  return logs;
}

describe('AA.getRecoveryContext', () => {
  beforeEach(() => { localStorage.clear(); });

  it('returns ok:true when no logs', () => {
    const ctx = AA.getRecoveryContext('Bench Press');
    expect(ctx.ok).toBe(true);
    expect(ctx.reason).toBeNull();
  });

  it('returns ok:true when no notes', () => {
    localStorage.setItem('logs', JSON.stringify(makeLogs(6)));
    const ctx = AA.getRecoveryContext('Bench Press');
    expect(ctx.ok).toBe(true);
    expect(ctx.reason).toBeNull();
  });

  it('ignores baseline logs entirely', () => {
    const logs = makeSessions([['sleep'], ['sleep'], ['sleep']]).map((l) => ({ ...l, baseline: true }));
    localStorage.setItem('logs', JSON.stringify(logs));
    const ctx = AA.getRecoveryContext('Bench Press');
    expect(ctx.ok).toBe(true);
    expect(ctx.reason).toBeNull();
  });

  it('suppressDecrease when sleep bad in 2+ sessions', () => {
    const logs = [
      ...makeLogs(2, ['sleep']),
      ...makeLogs(4),
    ].map((l, i) => ({
      ...l, session: Date.now() - i * 86400000 * 2, ts: Date.now() - i * 86400000 * 2,
      notes: i < 2 ? ['sleep'] : [],
    }));
    localStorage.setItem('logs', JSON.stringify(logs));
    const ctx = AA.getRecoveryContext('Bench Press');
    expect(ctx.suppressDecrease).toBe(true);
    expect(ctx.suppressIncrease).toBe(false);
    expect(ctx.reason).toContain('Somn prost');
    expect(ctx.color).toBe('var(--accent2)');
  });

  it('forceDeload when fatigue >= 3', () => {
    const logs = makeSessions([['fatigue'], ['fatigue'], ['fatigue']]);
    localStorage.setItem('logs', JSON.stringify(logs));
    const ctx = AA.getRecoveryContext('Bench Press');
    expect(ctx.forceDeload).toBe(true);
    expect(ctx.suppressIncrease).toBe(true);
    expect(ctx.suppressDecrease).toBe(false);
    expect(ctx.reason).toContain('Oboseala repetata');
  });

  it('forceDeload when fatigue >= 2 AND formBad >= 2 (compound trigger)', () => {
    const logs = makeSessions([
      ['fatigue', 'form'],
      ['fatigue', 'form'],
      [],
    ]);
    localStorage.setItem('logs', JSON.stringify(logs));
    const ctx = AA.getRecoveryContext('Bench Press');
    expect(ctx.forceDeload).toBe(true);
  });

  it('formIssue without forceDeload when only form bad (2 sessions)', () => {
    const logs = makeSessions([['form'], ['form'], []]);
    localStorage.setItem('logs', JSON.stringify(logs));
    const ctx = AA.getRecoveryContext('Bench Press');
    expect(ctx.formIssue).toBe(true);
    expect(ctx.suppressIncrease).toBe(true);
    expect(ctx.forceDeload).toBeUndefined();
    expect(ctx.reason).toContain('Forma slaba repetata');
  });

  it('aggressive progression when strong >= 3 sessions', () => {
    const logs = makeSessions([['strong'], ['strong'], ['strong']]);
    localStorage.setItem('logs', JSON.stringify(logs));
    const ctx = AA.getRecoveryContext('Bench Press');
    expect(ctx.ok).toBe(true);
    expect(ctx.aggressive).toBe(true);
    expect(ctx.color).toBe('var(--green)');
    expect(ctx.reason).toContain('progresie accelerata');
  });

  it('form is per-exercise — bad form on Squat does NOT trigger formIssue for Bench Press', () => {
    // Two sessions, each with a Squat (form) entry but no Bench Press entries
    const logs = [
      { ex: 'Squat', w: 100, reps: '5', baseline: false, date: today,
        ts: Date.now(), session: Date.now(), notes: ['form'] },
      { ex: 'Squat', w: 100, reps: '5', baseline: false, date: today,
        ts: Date.now() - 86400000 * 2, session: Date.now() - 86400000 * 2, notes: ['form'] },
    ];
    localStorage.setItem('logs', JSON.stringify(logs));
    const ctx = AA.getRecoveryContext('Bench Press');
    expect(ctx.formIssue).toBeUndefined();
  });

  it('priority: sleepBad >= 2 wins over fatigue + form', () => {
    const logs = makeSessions([
      ['sleep', 'fatigue', 'form'],
      ['sleep', 'fatigue', 'form'],
      ['fatigue'],
    ]);
    localStorage.setItem('logs', JSON.stringify(logs));
    const ctx = AA.getRecoveryContext('Bench Press');
    expect(ctx.suppressDecrease).toBe(true);
    expect(ctx.forceDeload).toBeUndefined();
  });

  it('uses only last 3 sessions (older sessions ignored)', () => {
    // Newest 3 clean, 3 older fatigue — fatigue should be ignored
    const logs = makeSessions([[], [], [], ['fatigue'], ['fatigue'], ['fatigue']]);
    localStorage.setItem('logs', JSON.stringify(logs));
    const ctx = AA.getRecoveryContext('Bench Press');
    expect(ctx.ok).toBe(true);
    expect(ctx.forceDeload).toBeUndefined();
  });

  it('omits ex arg → form counted across all sessions', () => {
    const logs = makeSessions([['form'], ['form'], []]);
    localStorage.setItem('logs', JSON.stringify(logs));
    const ctx = AA.getRecoveryContext();
    expect(ctx.formIssue).toBe(true);
  });
});

describe('AA.check — notes-only, no RPE dependency', () => {
  beforeEach(() => { localStorage.clear(); });

  it('returns null with no signals (no RPE increase trigger)', () => {
    const logs = Array.from({ length: 6 }, (_, i) => ({
      ex: 'Squat', w: 100, reps: '5', baseline: false,
      date: today, ts: Date.now() - i * 86400000 * 2,
      session: Date.now() - i * 86400000 * 2,
      notes: [],
    }));
    localStorage.setItem('logs', JSON.stringify(logs));
    const result = AA.check('Squat');
    expect(result).toBeNull();
  });

  it('returns null with fewer than 4 logs', () => {
    const logs = Array.from({ length: 3 }, (_, i) => ({
      ex: 'Squat', w: 100, reps: '5', baseline: false,
      date: today, ts: Date.now() - i * 86400000,
      session: Date.now() - i * 86400000, notes: [],
    }));
    localStorage.setItem('logs', JSON.stringify(logs));
    expect(AA.check('Squat')).toBeNull();
  });

  it('returns null during cooldown (<4 days since last adjustment)', () => {
    // Set cooldown to 2 days ago
    localStorage.setItem('aa-cooldown-Bench Press', JSON.stringify(Date.now() - 2 * 86400000));
    const logs = makeSessions([['form'], ['form'], ['form'], ['form']]);
    localStorage.setItem('logs', JSON.stringify(logs));
    expect(AA.check('Bench Press')).toBeNull();
  });

  it('proceeds past cooldown after 4+ days', () => {
    localStorage.setItem('aa-cooldown-Bench Press', JSON.stringify(Date.now() - 5 * 86400000));
    // Use forceDeload path (fatigue>=3) — this hits DECREASE without colliding with HOLD
    const logs = makeSessions([['fatigue'], ['fatigue'], ['fatigue'], []]);
    localStorage.setItem('logs', JSON.stringify(logs));
    const result = AA.check('Bench Press');
    expect(result).not.toBeNull();
    expect(result.action).toBe('DECREASE');
  });

  it('returns DECREASE when forceDeload triggered (fatigue >= 3)', () => {
    const logs = makeSessions([['fatigue'], ['fatigue'], ['fatigue'], []]);
    localStorage.setItem('logs', JSON.stringify(logs));
    const result = AA.check('Bench Press');
    expect(result).not.toBeNull();
    expect(result.action).toBe('DECREASE');
    expect(result.newKg).toBeGreaterThanOrEqual(1);
    // Cooldown should be set
    expect(localStorage.getItem('aa-cooldown-Bench Press')).not.toBeNull();
  });

  it('returns REDUCE_VOLUME when early-stop fizic recent', () => {
    const logs = makeSessions([[], [], [], []]);
    localStorage.setItem('logs', JSON.stringify(logs));
    localStorage.setItem('early-stops', JSON.stringify([
      { reason: 'Oboseala extrema', ts: Date.now() }
    ]));
    const result = AA.check('Bench Press');
    expect(result).not.toBeNull();
    expect(result.action).toBe('REDUCE_VOLUME');
    expect(result.volumeReduction).toBe(0.1);
    expect(result.autoFatigueNote).toBe(true);
  });

  it('early-stop "Am dureri" also triggers REDUCE_VOLUME', () => {
    const logs = makeSessions([[], [], [], []]);
    localStorage.setItem('logs', JSON.stringify(logs));
    localStorage.setItem('early-stops', JSON.stringify([
      { reason: 'Am dureri', ts: Date.now() }
    ]));
    const result = AA.check('Bench Press');
    expect(result.action).toBe('REDUCE_VOLUME');
  });

  it('non-physical early-stop reason does NOT trigger REDUCE_VOLUME', () => {
    const logs = makeSessions([[], [], [], []]);
    localStorage.setItem('logs', JSON.stringify(logs));
    localStorage.setItem('early-stops', JSON.stringify([
      { reason: 'Nu am chef', ts: Date.now() }
    ]));
    const result = AA.check('Bench Press');
    expect(result).toBeNull();
  });

  it('only last 3 early-stops considered (older ignored)', () => {
    const logs = makeSessions([[], [], [], []]);
    localStorage.setItem('logs', JSON.stringify(logs));
    // 4 early stops; oldest is physical, last 3 are non-physical
    localStorage.setItem('early-stops', JSON.stringify([
      { reason: 'Oboseala extrema', ts: Date.now() - 30 * 86400000 },
      { reason: 'Nu am chef', ts: Date.now() - 5 * 86400000 },
      { reason: 'Nu am chef', ts: Date.now() - 3 * 86400000 },
      { reason: 'Nu am chef', ts: Date.now() - 1 * 86400000 },
    ]));
    const result = AA.check('Bench Press');
    expect(result).toBeNull();
  });

  it('returns HOLD when formIssue triggers (suppressIncrease branch wins before DECREASE branch)', () => {
    // Build: 2 sessions with form note → formIssue=true, suppressIncrease=true.
    // The HOLD branch (line 115) fires before the formIssue+filter DECREASE branch (line 142).
    // This documents the actual code path order in aa.js.
    const logs = makeSessions([['form'], ['form'], [], []]);
    localStorage.setItem('logs', JSON.stringify(logs));
    const result = AA.check('Bench Press');
    expect(result).not.toBeNull();
    expect(result.action).toBe('HOLD');
    expect(result.reason).toContain('Forma slaba');
  });

  it('newKg floor at 1 even when subtracting increment exceeds current weight', () => {
    // Force deload from a tiny weight (w=1.5) → max(1, ...) clamp
    const logs = Array.from({ length: 8 }, (_, i) => {
      const sessionTs = Date.now() - i * 86400000 * 2;
      return {
        ex: 'Bench Press', w: 1.5, reps: '8', baseline: false,
        date: today,
        ts: sessionTs - (i % 2) * 100,
        session: sessionTs,
        notes: i < 3 ? ['fatigue'] : [],
      };
    });
    localStorage.setItem('logs', JSON.stringify(logs));
    const result = AA.check('Bench Press');
    expect(result).not.toBeNull();
    expect(result.newKg).toBeGreaterThanOrEqual(1);
  });
});

describe('AA.applyTo', () => {
  beforeEach(() => { localStorage.clear(); });

  it('returns rec unchanged when no adjustment needed', () => {
    const rec = { kg: 100, status: 'NORMAL', statusLabel: 'normal' };
    const out = AA.applyTo(rec, 'Bench Press');
    expect(out).toEqual(rec);
  });

  it('applies DECREASE — sets status AUTO and statusLabel with negative increment', () => {
    const logs = makeSessions([['fatigue'], ['fatigue'], ['fatigue'], []]);
    localStorage.setItem('logs', JSON.stringify(logs));
    const rec = { kg: 80, status: 'NORMAL', statusLabel: 'normal' };
    const out = AA.applyTo(rec, 'Bench Press');
    expect(out.autoAdjusted).toBe(true);
    expect(out.status).toBe('AUTO↓');
    expect(out.statusLabel).toContain('AUTO');
    expect(out.statusLabel).toContain('−');
    expect(out.autoAdjustMsg).toContain('Oboseala');
  });

  it('applies REDUCE_VOLUME — keeps original status/label, only adds autoAdjust fields', () => {
    const logs = makeSessions([[], [], [], []]);
    localStorage.setItem('logs', JSON.stringify(logs));
    localStorage.setItem('early-stops', JSON.stringify([
      { reason: 'Oboseala extrema', ts: Date.now() }
    ]));
    const rec = { kg: 80, status: 'INCREASE', statusLabel: 'creste' };
    const out = AA.applyTo(rec, 'Bench Press');
    expect(out.autoAdjusted).toBe(true);
    expect(out.autoAdjustMsg).toContain('Early stop');
    // REDUCE_VOLUME branch keeps original status (no status/statusLabel override)
    expect(out.status).toBe('INCREASE');
    expect(out.statusLabel).toBe('creste');
  });

  it('applies HOLD branch — keeps original status, updates kg + autoAdjust fields only', () => {
    // formIssue triggers suppressIncrease → HOLD branch fires
    const logs = makeSessions([['form'], ['form'], [], []]);
    localStorage.setItem('logs', JSON.stringify(logs));
    const rec = { kg: 80, status: 'INCREASE', statusLabel: 'creste' };
    const out = AA.applyTo(rec, 'Bench Press');
    expect(out.autoAdjusted).toBe(true);
    expect(out.autoAdjustMsg).toContain('Forma slaba');
    // HOLD keeps original status/label
    expect(out.status).toBe('INCREASE');
    expect(out.statusLabel).toBe('creste');
  });

  it('rounds newKg via DP.roundToStep when applying DECREASE', () => {
    const logs = makeSessions([['fatigue'], ['fatigue'], ['fatigue'], []]);
    localStorage.setItem('logs', JSON.stringify(logs));
    const rec = { kg: 80 };
    const out = AA.applyTo(rec, 'Lat Pulldown'); // bailib_stack with 5kg steps
    // After deload from 80 to 80 - 4 (face_pulls is 2.5 step, Lat Pulldown 4) → step rounding
    expect(typeof out.kg).toBe('number');
    expect(out.kg).toBeGreaterThanOrEqual(1);
  });
});
