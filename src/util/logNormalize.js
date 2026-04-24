// ── Log normalizer — canonical schema contract ─────────────────
// Converts any log object (including legacy formats) to the canonical schema.
// Call sites that consume logs from external sources should pass through here.
// Internal writes (logging.js, inject.js, onboarding.js) already produce canonical logs.

export function normalizeLog(log) {
  return {
    date:      log.date,
    ex:        log.ex,
    w:         typeof log.w === 'number' ? log.w : parseFloat(log.w) || 0,
    reps:      typeof log.reps === 'number' ? log.reps : parseInt(log.reps) || 0,
    ts:        log.ts || (log.date ? new Date(log.date).getTime() : Date.now()),
    session:   log.session,
    baseline:  log.baseline ?? false,
    rpe:       log.rpe,
    notes:     log.notes,
    earlyStop: log.earlyStop ?? (log.ex === '__early_stop__'),
  };
}
