// dp_read_memo_v1 (founder 2026-10-10: "verifica andura pe unde gandeste... cache, dar
// cu refresh ca sa nu arate date eronate"). The name resolution, the logged-names list
// and the temperament view are memoized — and must follow every change at once.
import { describe, it, expect, beforeEach } from 'vitest';
import { canonicalLoggedName, loggedExerciseNames, matchedLogs } from '../logIdentity.js';
import { temperamentBias } from '../temperament.js';

const gym = (equivalents) => localStorage.setItem('dp-gyms', JSON.stringify({
  activeId: 'g', gyms: { g: { id: 'g', name: 'MyGym Domnesti', stacks: {}, equivalents } },
}));

describe('read memo follows every change', () => {
  beforeEach(() => localStorage.clear());

  it('a new gym equivalence is seen at once', () => {
    gym({});
    expect(canonicalLoggedName('Converging Chest Press')).toBe('Converging Chest Press');
    gym({ 'Converging Chest Press': 'Flat Chest Press Machine' });
    expect(canonicalLoggedName('Converging Chest Press')).toBe('Flat Chest Press Machine');
  });

  it('a newly logged lift joins the names and its rows at once', () => {
    localStorage.setItem('logs', JSON.stringify([{ ex: 'Lat Pulldown', w: 52, reps: 8, ts: 2 }]));
    expect(loggedExerciseNames()).toEqual(['Lat Pulldown']);
    localStorage.setItem('logs', JSON.stringify([{ ex: 'Chest-Supported Row', w: 50, reps: 8, ts: 3 }, { ex: 'Lat Pulldown', w: 52, reps: 8, ts: 2 }]));
    expect(loggedExerciseNames()).toEqual(['Chest-Supported Row', 'Lat Pulldown']);
    expect(matchedLogs('Chest-Supported Row')?.length).toBe(1);
  });

  it('a callers copy of the names cannot change the memo', () => {
    localStorage.setItem('logs', JSON.stringify([{ ex: 'Lat Pulldown', w: 52, reps: 8, ts: 2 }]));
    loggedExerciseNames()?.push('junk');
    expect(loggedExerciseNames()).toEqual(['Lat Pulldown']);
  });

  it('a learned temperament update is read at once', () => {
    localStorage.setItem('dp-temperament', JSON.stringify({ 'Cable Row': { bias: 1, n: 20 } }));
    expect(temperamentBias('Cable Row')).toBe(1);
    localStorage.setItem('dp-temperament', JSON.stringify({ 'Cable Row': { bias: -0.5, n: 21 } }));
    expect(temperamentBias('Cable Row')).toBe(-0.5);
  });

  it('nothing stored locally → null, the caller reads through DB as before', () => {
    expect(loggedExerciseNames()).toBeNull();
    expect(matchedLogs('Lat Pulldown')).toBeNull();
  });
});
