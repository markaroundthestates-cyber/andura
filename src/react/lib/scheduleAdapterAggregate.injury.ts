// ══ SCHEDULE ADAPTER AGGREGATE — injury-signal concern ════════════════════
// Hygiene split (barrel re-export, zero behavior change): the Pain CDL → injury
// safety signal derivation lives here. deriveInjurySignal is re-exported by
// scheduleAdapterAggregate.ts — the public API is unchanged. INJURY_LOOKBACK_DAYS
// / PAIN_CDL_KEY / PainCdlEntryRead are consumed cross-module by the builder
// concern (export added for the sibling import; NOT part of the barrel surface).

import { MS_PER_DAY } from '../../constants.js';
import { PAIN_REGION_GROUP_MAP } from '../../engine/muscleRecoveryConstants.js';

// ── Injury safety signal wire (SAFETY-adjacent — oracle-concern #2) ────────
// A known injury did NOTHING in the live path: buildUserStateForPipeline passed
// `meta:{}`, so the pipeline injury gates ran INERT —
//   - specialization activationGating Gate 4 (detectInjuryAutoDisable) reads
//     `ctx.meta.painButtonActive` + `ctx.meta.painAffectedGroups`
//     (src/engine/specialization/index.js:211-212 + activationGating.js:77-117)
//   - goalAdaptation push-back (computeRiskScore) reads
//     `ctx.recentSessions[*].injury === true` + `.daysAgo <= injuryWindowDays`
//     (src/engine/goalAdaptation/pushBackTiers.js:76-86)
// Neither input was ever fed. The honest live source is the append-only Pain
// CDL the PainButton screen persists (DB('pain-cdl'), src/.../PainButton.tsx:97
// + 112-121) — region + intensity + ts per report. deriveInjurySignal reads
// that channel and maps regions → Big 11 muscle groups via the canonical
// PAIN_REGION_GROUP_MAP (muscleRecoveryConstants.js:109 — same map the recovery
// engine already consumes; NU reinventa). Pure: `now` injected, DB read happens
// at the buildUserStateForPipeline boundary, NOT here.

// Lookback window for a Pain CDL report to count as a "recent" injury. Matches
// the goalAdaptation push-back injuryWindowDays (6 sapt = 42 zile,
// goalAdaptation/constants.js PUSHBACK_RISK_THRESHOLDS.injuryWindowDays) so the
// specialization gate + push-back agree on what "recent" means.
export const INJURY_LOOKBACK_DAYS = 42;

// Pain CDL storage key + entry shape — local mirror of PainButton.tsx
// PAIN_CDL_KEY/PainCdlEntry (same lib-redeclare precedent as engineWrappers.ts
// readPainCdl, avoids a lib → React-screen import edge).
export const PAIN_CDL_KEY = 'pain-cdl';

export interface PainCdlEntryRead {
  type?: string;
  region?: string;
  intensity?: 1 | 2 | 3;
  ts?: number;
}

export interface InjurySignal {
  /** True when >=1 Pain CDL report falls within the lookback window. */
  active: boolean;
  /** Big 11 muscle groups loaded by the reported pain regions (deduped). */
  affectedGroups: string[];
}

/**
 * Derive the live injury safety signal from the append-only Pain CDL log.
 * Only reports within INJURY_LOOKBACK_DAYS count (a 3-month-old tweak is not a
 * current contraindication). Regions map to muscle groups via the canonical
 * PAIN_REGION_GROUP_MAP. Pure — `now` injectable for deterministic tests.
 *
 * @param painCdl raw DB('pain-cdl') entries (newest-first per PainButton write)
 * @param now epoch ms reference for the window
 */
export function deriveInjurySignal(
  painCdl: ReadonlyArray<PainCdlEntryRead> | null | undefined,
  now: number = Date.now(),
): InjurySignal {
  const entries = Array.isArray(painCdl) ? painCdl : [];
  const groups = new Set<string>();
  let active = false;
  const regionMap = PAIN_REGION_GROUP_MAP as Record<string, string[] | undefined>;
  for (const e of entries) {
    if (!e || e.type !== 'pain' || typeof e.region !== 'string') continue;
    const ts = Number(e.ts);
    if (!Number.isFinite(ts)) continue;
    const daysAgo = Math.floor((now - ts) / MS_PER_DAY);
    if (daysAgo < 0 || daysAgo > INJURY_LOOKBACK_DAYS) continue;
    active = true;
    for (const g of regionMap[e.region] ?? []) groups.add(g);
  }
  return { active, affectedGroups: [...groups] };
}
