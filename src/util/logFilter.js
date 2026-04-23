// ══ Pure log filter — extracted for unit testing ═════════════
// Used by cleanFakeLogs() in coach.js.
// No DOM, no DB — safe to import anywhere.

export function filterValidLogs(logs) {
  const sessions = {};
  logs.filter(l => !l.baseline).forEach(l => {
    const key = String(l.session);
    if (!sessions[key]) sessions[key] = [];
    sessions[key].push(l);
  });
  const validSessions = new Set(
    Object.entries(sessions)
      .filter(([, sets]) => sets.length >= 2 || sets.some(l => l.earlyStop))
      .map(([sid]) => sid)
  );
  // String(l.session) ensures number keys match the string keys in validSessions
  return logs.filter(l => l.baseline || validSessions.has(String(l.session)));
}
