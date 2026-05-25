/**
 * Profile Typing — pure functions module.
 *
 * 4 profiles: Sprinter, Marathon, Yo-yo, Strategic.
 *
 * Hybrid approach (per ADR 013):
 *   - Self-report from onboarding (Q1-Q5 scoring)
 *   - Behavioral inference from CDL (4-6 weeks observation)
 *   - Reconciliation (silent or prompt) when self-report ≠ behavioral
 *
 * No side effects. Caller (onboarding UI / reconciliation prompt) decides actions.
 *
 * Reference: ADR 013 §Profile typing
 *            HANDOVER 2026-04-26-evening §Profile Typing Design COMPLET
 *            ADR 014 (when published — schema profile-history + reconciliation prompts UI)
 */

/**
 * @typedef {Object} PtCdlEntry
 * @property {string} [date]
 * @property {number} [ts]
 * @property {boolean} [synthetic]
 * @property {string} [type]
 * @property {Record<string, any>} [outcome]
 * @property {Record<string, any>} [context]
 */

/** @typedef {{ daysWithHyperfocus?: number, hoursInApp7d?: number } | null | undefined} PtHyperfocusData */

// ── ISO week (same algorithm as autoAggressionDetection.js — independent, NOT imported) ──

/** @param {string | number | Date} date */
function _isoWeekLocal(date) {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  const thursday = new Date(d);
  thursday.setDate(d.getDate() - ((d.getDay() + 6) % 7) + 3);
  const jan4 = new Date(thursday.getFullYear(), 0, 4);
  const startOfWeek1 = new Date(jan4);
  startOfWeek1.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7));
  const week = Math.floor((thursday.getTime() - startOfWeek1.getTime()) / (7 * 86400000)) + 1;
  return `${thursday.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

// ── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Compute confidence from signature marker count + counter-marker count.
 * HIGH: ≥3 signature markers AND zero counter-markers
 * MEDIUM: 2 signature markers AND ≤1 counter-marker
 * LOW: <2 signature markers OR ≥2 counter-markers
 */
/**
 * @param {number | Array<any>} signatureMarkers
 * @param {number | Array<any>} counterMarkers
 */
export function _computeConfidence(signatureMarkers, counterMarkers) {
  const sig = typeof signatureMarkers === 'number' ? signatureMarkers : (signatureMarkers?.length ?? 0);
  const ctr = typeof counterMarkers === 'number' ? counterMarkers : (counterMarkers?.length ?? 0);

  if (ctr >= 2) return 'low';
  if (sig >= 3 && ctr === 0) return 'high';
  if (sig >= 2 && ctr <= 1) return 'medium';
  return 'low';
}

/**
 * Check if CDL entries provide sufficient behavioral data.
 * <12 sessions → insufficient_data; 0 sessions → stale_self_report.
 * Returns { insufficient, stale, sessionCount }.
 */
/** @param {Array<PtCdlEntry> | null | undefined} cdlEntries */
export function _hasInsufficientData(cdlEntries) {
  const entries = cdlEntries ?? [];
  const sessionCount = entries.filter(
    (e) => e.outcome?.executed === true || e.outcome?.executed === 'partial'
  ).length;

  if (sessionCount === 0) return { insufficient: true, stale: true, sessionCount: 0 };
  if (sessionCount < 12) return { insufficient: true, stale: false, sessionCount };  // <12 sessions threshold (ADR 013)
  return { insufficient: false, stale: false, sessionCount };
}

// ── Reusable micro-helpers ────────────────────────────────────────────────────

/** @param {Array<PtCdlEntry>} entries */
function _volumeCreepEntries(entries) {
  return entries.filter(
    (e) => (e.outcome?.executed === true || e.outcome?.executed === 'partial') &&
         e.outcome?.deviation === true &&
         (e.outcome?.actualSets ?? 0) > (e.outcome?.proposedSets ?? 0)
  );
}

/** @param {Array<PtCdlEntry>} workouts */
function _hasFrustrationPattern(workouts) {
  for (let i = 0; i < workouts.length; i++) {
    const cur = workouts[i];
    if (!cur?.date) continue;
    const rating = cur.outcome?.rating;
    if (!(typeof rating === 'number' && rating <= 2)) continue;
    const windowEnd = new Date(cur.date);
    windowEnd.setDate(windowEnd.getDate() + 14);  // 14-day frustration window (ADR 013 signal #3)
    for (let j = i; j < workouts.length; j++) {
      const e = workouts[j];
      if (!e?.date) continue;
      if (new Date(e.date) > windowEnd) break;
      if (e.outcome?.deviation === true &&
          (e.outcome?.actualSets ?? 0) > (e.outcome?.proposedSets ?? 0)) {
        return true;
      }
    }
  }
  return false;
}

/** @param {Array<PtCdlEntry>} entries */
function _hasRecoveryDebt(entries) {
  /** @type {Record<string, number>} */
  const byWeek = {};
  for (const entry of entries) {
    if (!entry.date) continue;
    const week = _isoWeekLocal(entry.date);
    if (!byWeek[week]) byWeek[week] = 0;
    if (entry.outcome?.executed === false && entry.outcome?.rest_marked === true) byWeek[week] = (byWeek[week] ?? 0) + 1;
  }
  const sortedWeeks = Object.keys(byWeek).sort();
  let streak = 0;
  for (const week of sortedWeeks) {
    if ((byWeek[week] ?? 0) < 2) {  // <2 rest days threshold (ADR 013 §5)
      streak++;
      if (streak >= 3) return true;
    } else {
      streak = 0;
    }
  }
  return false;
}

/** @param {Array<PtCdlEntry>} entries */
function _hasCalorieAcceleration(entries) {
  const withKcal = entries
    .filter((e) => typeof e.context?.kcal_target === 'number')
    .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));
  for (let i = 0; i < withKcal.length; i++) {
    const anchorEntry = withKcal[i];
    if (!anchorEntry?.date) continue;
    const anchor = new Date(anchorEntry.date);
    const cutoff = new Date(anchor);
    cutoff.setDate(anchor.getDate() + 7);  // 7-day rolling window (ADR 013 signal #2)
    const win = withKcal.filter((e) => { if (!e.date) return false; const d = new Date(e.date); return d >= anchor && d <= cutoff; });
    if (win.length < 2) continue;
    const kcals = win.map((e) => e.context?.kcal_target).filter((v) => typeof v === 'number');
    if (kcals.length < 2) continue;
    if (Math.max(...kcals) - Math.min(...kcals) > 300) return true;  // >300 kcal threshold
  }
  return false;
}

// ── Signature matchers ────────────────────────────────────────────────────────

/**
 * Sprinter signature: volume creep ≥2 sessions, frustration pattern, hyperfocus,
 * recovery debt 3+ weeks, calorie acceleration.
 * Returns count of matched signature markers (0–5).
 */
/**
 * @param {Array<PtCdlEntry> | null | undefined} cdlEntries
 * @param {PtHyperfocusData} [hyperfocusData]
 */
export function _matchSprinterSignature(cdlEntries, hyperfocusData) {
  const entries = cdlEntries ?? [];
  const workouts = entries
    .filter((e) => e.outcome?.executed === true || e.outcome?.executed === 'partial')
    .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));

  let count = 0;

  // Marker 1: volume creep ≥2 instances (starting threshold: 2 sessions sever, ADR 013 table)
  if (_volumeCreepEntries(entries).length >= 2) count++;

  // Marker 2: frustration markers present (low rating → volume push)
  if (_hasFrustrationPattern(workouts)) count++;

  // Marker 3: hyperfocus ≥4 days/week (ADR 013 amplifier threshold)
  if ((hyperfocusData?.daysWithHyperfocus ?? 0) >= 4) count++;

  // Marker 4: recovery debt (3+ consecutive ISO weeks <2 rest_marked)
  if (_hasRecoveryDebt(entries)) count++;

  // Marker 5: calorie acceleration (>300 kcal drop in 7-day window)
  if (_hasCalorieAcceleration(entries)) count++;

  return count;
}

/**
 * Marathon signature: consistency ≥80%, volume creep zero/rare, rest days planned,
 * rating stable (no low ratings).
 * Returns count of matched signature markers (0–4).
 */
/** @param {Array<PtCdlEntry> | null | undefined} cdlEntries */
export function _matchMarathonSignature(cdlEntries) {
  const entries = cdlEntries ?? [];
  const executed = entries.filter((e) => e.outcome?.executed === true || e.outcome?.executed === 'partial');
  if (executed.length === 0) return 0;
  const nonRest = entries.filter((e) => e.outcome?.rest_marked !== true);

  let count = 0;

  // Marker 1: consistency ≥80% (executed / non-rest entries — starting threshold 80%, ADR 013)
  if (nonRest.length > 0 && executed.length / nonRest.length >= 0.8) count++;

  // Marker 2: volume creep ≤1 (rare/zero)
  if (_volumeCreepEntries(entries).length <= 1) count++;

  // Marker 3: rest days planned (≥2 rest_marked=true — low recovery debt indicator)
  const restDays = entries.filter((e) => e.outcome?.executed === false && e.outcome?.rest_marked === true).length;
  if (restDays >= 2) count++;

  // Marker 4: rating stable (no frustration spikes ≤2)
  const hasLowRating = executed.some((e) => typeof e.outcome?.rating === 'number' && e.outcome.rating <= 2);
  if (!hasLowRating) count++;

  return count;
}

/**
 * Yo-yo signature (pre-drop): aggressive volume in first 2 weeks, calorie acceleration,
 * zero rest_marked, frustration ABSENT (high-commitment phase), hyperfocus intense.
 * Returns count of matched signature markers (0–5).
 */
/**
 * @param {Array<PtCdlEntry> | null | undefined} cdlEntries
 * @param {PtHyperfocusData} [hyperfocusData]
 */
export function _matchYoyoSignature(cdlEntries, hyperfocusData) {
  const entries = cdlEntries ?? [];
  const executed = entries.filter((e) => e.outcome?.executed === true || e.outcome?.executed === 'partial');
  if (executed.length === 0) return 0;
  const sorted = [...entries].sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));
  const firstEntry = sorted[0];
  const firstDate = firstEntry?.date ? new Date(firstEntry.date) : null;

  let count = 0;

  // Marker 1: aggressive volume start — ≥2 deviation entries in first 2 weeks (starting threshold)
  if (firstDate) {
    const twoWeekCutoff = new Date(firstDate);
    twoWeekCutoff.setDate(firstDate.getDate() + 14);
    const earlyDeviations = sorted.filter((e) => {
      if (!e.date) return false;
      const d = new Date(e.date);
      return d <= twoWeekCutoff &&
             (e.outcome?.executed === true || e.outcome?.executed === 'partial') &&
             e.outcome?.deviation === true &&
             (e.outcome?.actualSets ?? 0) > (e.outcome?.proposedSets ?? 0);
    });
    if (earlyDeviations.length >= 2) count++;
  }

  // Marker 2: calorie acceleration rapid (same 7-day, >300 kcal window)
  if (_hasCalorieAcceleration(entries)) count++;

  // Marker 3: ZERO rest_marked=true (pure all-in, no recovery acknowledgment)
  const restDays = entries.filter((e) => e.outcome?.executed === false && e.outcome?.rest_marked === true).length;
  if (restDays === 0) count++;

  // Marker 4: frustration ABSENT — no low ratings (high-commitment phase, no frustration yet)
  const hasLowRating = executed.some((e) => typeof e.outcome?.rating === 'number' && e.outcome.rating <= 2);
  if (!hasLowRating) count++;

  // Marker 5: hyperfocus INTENSE (≥4 days/week threshold)
  if ((hyperfocusData?.daysWithHyperfocus ?? 0) >= 4) count++;

  return count;
}

/**
 * Strategic signature: conscious deviations with reason logged, reasoned early-stops,
 * low impulsivity (≤1 unreasoned creep), stable ratings.
 * Returns count of matched signature markers (0–4).
 */
/** @param {Array<PtCdlEntry> | null | undefined} cdlEntries */
export function _matchStrategicSignature(cdlEntries) {
  const entries = cdlEntries ?? [];
  const executed = entries.filter((e) => e.outcome?.executed === true || e.outcome?.executed === 'partial');
  if (executed.length === 0) return 0;

  let count = 0;

  // Marker 1: conscious deviations — deviation=true WITH deviationReason logged
  const consciousDeviations = executed.filter(
    (e) => e.outcome?.deviation === true &&
         e.outcome?.deviationReason != null &&
         e.outcome?.deviationReason !== ''
  );
  if (consciousDeviations.length >= 1) count++;

  // Marker 2: reasoned early-stops — earlyStop=true WITH earlyStopReason logged
  const reasonedStops = executed.filter(
    (e) => e.outcome?.earlyStop === true &&
         e.outcome?.earlyStopReason != null &&
         e.outcome?.earlyStopReason !== ''
  );
  if (reasonedStops.length >= 1) count++;

  // Marker 3: low impulsivity — ≤1 impulsive (no-reason) volume creep
  const impulsiveCreep = executed.filter(
    (e) => e.outcome?.deviation === true &&
         (e.outcome?.actualSets ?? 0) > (e.outcome?.proposedSets ?? 0) &&
         (e.outcome?.deviationReason == null || e.outcome?.deviationReason === '')
  );
  if (impulsiveCreep.length <= 1) count++;

  // Marker 4: stable ratings (no frustration spikes ≤2)
  const hasLowRating = executed.some((e) => typeof e.outcome?.rating === 'number' && e.outcome.rating <= 2);
  if (!hasLowRating) count++;

  return count;
}

// ── Counter-marker checkers ───────────────────────────────────────────────────

/**
 * Counter-markers for Sprinter profile.
 * Counter: high consistency WITH planned rest (contradicts Sprinter's burst/no-rest pattern).
 */
/** @param {Array<PtCdlEntry> | null | undefined} cdlEntries */
export function _counterMarkersSprinter(cdlEntries) {
  const entries = cdlEntries ?? [];
  const executed = entries.filter((e) => e.outcome?.executed === true || e.outcome?.executed === 'partial');
  const nonRest = entries.filter((e) => e.outcome?.rest_marked !== true);
  const restDays = entries.filter((e) => e.outcome?.executed === false && e.outcome?.rest_marked === true).length;

  const markers = [];
  if (nonRest.length > 0 &&
      executed.length / nonRest.length >= 0.8 &&
      restDays >= 2) {
    markers.push('high_consistency_with_planned_rest');
  }
  return markers;
}

/**
 * Counter-markers for Marathon profile.
 * Counter: frequent volume creep (contradicts Marathon's low-deviation steady pattern).
 */
/** @param {Array<PtCdlEntry> | null | undefined} cdlEntries */
export function _counterMarkersMarathon(cdlEntries) {
  const entries = cdlEntries ?? [];
  const markers = [];

  if (_volumeCreepEntries(entries).length >= 2) {  // ≥2 = "frequent" threshold
    markers.push('volume_creep_frequent');
  }
  return markers;
}

/**
 * Counter-markers for Yo-yo profile.
 * Counter: sustained intensity with rhythm (contradicts all-in/drop pattern).
 */
/** @param {Array<PtCdlEntry> | null | undefined} cdlEntries */
export function _counterMarkersYoyo(cdlEntries) {
  const entries = cdlEntries ?? [];
  const executed = entries.filter((e) => e.outcome?.executed === true || e.outcome?.executed === 'partial');
  const restDays = entries.filter((e) => e.outcome?.executed === false && e.outcome?.rest_marked === true).length;

  const markers = [];
  if (restDays >= 2 && executed.length >= 6) {  // sustained rhythm = rest present + enough sessions
    markers.push('sustained_intensity_with_rhythm');
  }
  return markers;
}

/**
 * Counter-markers for Strategic profile.
 * Counter: impulsive volume creep without reason logged (contradicts Strategic's conscious deviation).
 */
/** @param {Array<PtCdlEntry> | null | undefined} cdlEntries */
export function _counterMarkersStrategic(cdlEntries) {
  const entries = cdlEntries ?? [];
  const executed = entries.filter((e) => e.outcome?.executed === true || e.outcome?.executed === 'partial');

  const impulsiveCreep = executed.filter(
    (e) => e.outcome?.deviation === true &&
         (e.outcome?.actualSets ?? 0) > (e.outcome?.proposedSets ?? 0) &&
         (e.outcome?.deviationReason == null || e.outcome?.deviationReason === '')
  );

  const markers = [];
  if (impulsiveCreep.length >= 2) {  // ≥2 unreasoned creeps = impulsive pattern
    markers.push('impulsive_volume_creep_no_reason');
  }
  return markers;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Compute counter-markers per profile.
 * Used in confidence calculation + "Detalii" drill-down in reconciliation prompt.
 *
 * @param {string} profile - 'Sprinter' | 'Marathon' | 'Yo-yo' | 'Strategic'
 * @param {Array<PtCdlEntry>} cdlEntries
 * @returns {string[]} - list of counter-marker descriptions matched
 */
export function computeCounterMarkers(profile, cdlEntries) {
  switch (profile) {
    case 'Sprinter':  return _counterMarkersSprinter(cdlEntries);
    case 'Marathon':  return _counterMarkersMarathon(cdlEntries);
    case 'Yo-yo':     return _counterMarkersYoyo(cdlEntries);
    case 'Strategic': return _counterMarkersStrategic(cdlEntries);
    default:          return [];
  }
}

/**
 * Detect YO-YO_RISK preventive: 3-4 weeks all-in (volume aggressive + zero rest_marked + zero frustration).
 * Triggers BEFORE drop pattern manifests — preventive intervention (ADR 013 §YO-YO_RISK).
 *
 * @param {Array<PtCdlEntry> | null | undefined} cdlEntries
 * @returns {boolean}
 */
export function detectYoyoRisk(cdlEntries) {
  const entries = cdlEntries ?? [];
  const executed = entries.filter((e) => e.outcome?.executed === true || e.outcome?.executed === 'partial');

  // Condition 1: zero rest_marked=true days (all-in, no recovery acknowledgment)
  const restDays = entries.filter((e) => e.outcome?.executed === false && e.outcome?.rest_marked === true).length;
  if (restDays > 0) return false;

  // Condition 2: volume aggressive (≥2 deviation entries with actual > proposed)
  if (_volumeCreepEntries(entries).length < 2) return false;

  // Condition 3: zero frustration (no low ratings ≤2 — high-commitment phase still present)
  const hasLowRating = executed.some((e) => typeof e.outcome?.rating === 'number' && e.outcome.rating <= 2);
  if (hasLowRating) return false;

  // Condition 4: spans ≥3 ISO weeks (sustained all-in, not a one-week spike)
  /** @type {Record<string, boolean>} */
  const byWeek = {};
  for (const e of executed) {
    if (e.date) byWeek[_isoWeekLocal(e.date)] = true;
  }
  if (Object.keys(byWeek).length < 3) return false;  // minimum 3 weeks of activity (ADR 013)

  return true;
}

/**
 * Behavioral inference from CDL only (no self-report).
 * Used when source='behavioral' or for reconciliation comparison.
 *
 * @param {Array<PtCdlEntry> | null | undefined} cdlEntries - last 4-6 weeks (caller filters window)
 * @param {PtHyperfocusData} [hyperfocusData]
 * @returns {{ primary: string | null, confidence: string, signature: Record<string, number>, dataPoints: string[], sessionCount: number }}
 */
export function inferBehavioralProfile(cdlEntries, hyperfocusData) {
  const entries = cdlEntries ?? [];
  const { sessionCount } = _hasInsufficientData(entries);

  const sprinterCount  = _matchSprinterSignature(entries, hyperfocusData);
  const marathonCount  = _matchMarathonSignature(entries);
  const yoyoCount      = _matchYoyoSignature(entries, hyperfocusData);
  const strategicCount = _matchStrategicSignature(entries);

  const signature = {
    Sprinter:  sprinterCount,
    Marathon:  marathonCount,
    Yoyo:      yoyoCount,
    Strategic: strategicCount,
  };

  const ranked = [
    { profile: 'Sprinter',  score: sprinterCount },
    { profile: 'Marathon',  score: marathonCount },
    { profile: 'Yo-yo',     score: yoyoCount },
    { profile: 'Strategic', score: strategicCount },
  ].sort((a, b) => b.score - a.score);

  // Tie at top → null (insufficient discrimination)
  const top = ranked[0];
  const second = ranked[1];
  const primary = top && top.score > 0 && (!second || top.score > second.score)
    ? top.profile
    : null;

  const counterMarkers = primary ? computeCounterMarkers(primary, entries) : [];
  const primarySigCount = primary && top ? top.score : 0;
  const confidence = primary ? _computeConfidence(primarySigCount, counterMarkers.length) : 'low';

  // Build human-readable data points for reconciliation prompt
  /** @type {string[]} */
  const dataPoints = [];
  const creepCount = _volumeCreepEntries(entries).length;
  if (creepCount > 0) dataPoints.push(`Volume creep: ${creepCount} sesiuni`);
  const restCount = entries.filter((e) => e.outcome?.executed === false && e.outcome?.rest_marked === true).length;
  if (restCount > 0) dataPoints.push(`Rest days: ${restCount}`);
  if (hyperfocusData && (hyperfocusData.daysWithHyperfocus ?? 0) >= 4) {
    dataPoints.push(`Hyperfocus: ${hyperfocusData.daysWithHyperfocus} zile/sapt`);
  }

  return { primary, confidence, signature, dataPoints, sessionCount };
}

/**
 * Determine reconciliation action based on self-report vs behavioral.
 *
 * @param {{primary?: string, secondary?: string, confidence?: string} | null | undefined} selfReport - { primary, secondary, confidence, ... }
 * @param {ReturnType<typeof inferBehavioralProfile> | null | undefined} behavioral - return value of inferBehavioralProfile
 * @param {Array<any>} [previousReconciliations] - past reconciliation events (from profile-history, caller-provided)
 * @returns {'match_silent'|'match_first_prompt'|'mismatch_high'|'mismatch_lowmed'|'insufficient'|'stale'}
 */
export function reconciliationAction(selfReport, behavioral, previousReconciliations = []) {
  if (!behavioral || behavioral.sessionCount === 0) return 'stale';
  if (behavioral.sessionCount < 12) return 'insufficient';  // <12 sessions threshold (ADR 013)
  if (!selfReport) return 'insufficient';

  const isMatch = selfReport.primary === behavioral.primary;
  const behConf = behavioral.confidence;

  if (isMatch) {
    // First-ever reconciliation with HIGH confidence → prompt to close loop (ADR 013 §Reconciliation)
    if (behConf === 'high' && previousReconciliations.length === 0) return 'match_first_prompt';
    return 'match_silent';
  }

  if (behConf === 'high') return 'mismatch_high';
  return 'mismatch_lowmed';
}

/**
 * Main entry — analyze profile from self-report + behavioral data.
 *
 * @param {{ selfReport: {primary?: string, secondary?: string, confidence?: string} | null, cdlEntries: Array<PtCdlEntry>, hyperfocusData?: PtHyperfocusData, previousReconciliations?: Array<any> }} opts
 * @returns {{ primary: string | null, secondary: string | null, confidence: string, source: string, selfReport: any, behavioral: any, reconciliation: any, riskFlags: string[], reasoning: string }}
 */
export function analyzeProfile({ selfReport, cdlEntries, hyperfocusData, previousReconciliations: _previousReconciliations = [] }) {
  const entries = cdlEntries ?? [];

  const behavioral = entries.length > 0
    ? inferBehavioralProfile(entries, hyperfocusData)
    : null;

  const riskFlags = detectYoyoRisk(entries) ? ['YO-YO_RISK'] : [];

  // No usable data at all
  if (!selfReport && !behavioral?.primary) {
    return {
      primary: null,
      secondary: null,
      confidence: 'low',
      source: 'self-report',
      selfReport: null,
      behavioral: behavioral ?? null,
      reconciliation: null,
      riskFlags,
      reasoning: 'No data available for profile inference.',
    };
  }

  // Behavioral only (no self-report)
  if (!selfReport && behavioral) {
    return {
      primary: behavioral.primary,
      secondary: null,
      confidence: behavioral.confidence,
      source: 'behavioral',
      selfReport: null,
      behavioral,
      reconciliation: null,
      riskFlags,
      reasoning: `Behavioral inference: ${behavioral.primary} (confidence: ${behavioral.confidence}).`,
    };
  }

  // Self-report only (no behavioral or insufficient behavioral data)
  if (selfReport && (!behavioral || !behavioral.primary || behavioral.sessionCount < 12)) {
    return {
      primary: selfReport.primary ?? null,
      secondary: selfReport.secondary ?? null,
      confidence: selfReport.confidence ?? 'low',
      source: 'self-report',
      selfReport,
      behavioral: behavioral ?? null,
      reconciliation: null,
      riskFlags,
      reasoning: 'Behavioral data insufficient — using self-report.',
    };
  }

  // Both available — reconcile (selfReport + behavioral both truthy at this point)
  if (!selfReport || !behavioral) {
    return {
      primary: null,
      secondary: null,
      confidence: 'low',
      source: 'self-report',
      selfReport: null,
      behavioral: null,
      reconciliation: null,
      riskFlags,
      reasoning: 'No data available for profile inference.',
    };
  }
  const isMatch = selfReport.primary === behavioral.primary;

  return {
    primary: (isMatch ? selfReport.primary : behavioral.primary) ?? null,
    secondary: (isMatch ? null : selfReport.primary) ?? null,
    confidence: behavioral.confidence,
    source: 'reconciled',
    selfReport,
    behavioral,
    reconciliation: isMatch ? 'match' : 'mismatch',
    riskFlags,
    reasoning: isMatch
      ? `Pattern observat se aliniaza cu ${selfReport.primary} (self-report confirmat). Confidence: ${behavioral.confidence}.`
      : `Pattern observat te apropie de ${behavioral.primary} (confidence: ${behavioral.confidence}). Self-report: ${selfReport.primary}. Mismatch — reconciliation prompt recommended.`,
  };
}
