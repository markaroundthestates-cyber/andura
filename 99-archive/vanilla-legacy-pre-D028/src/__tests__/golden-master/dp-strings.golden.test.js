// Golden Master — dp.js + fatigue.js + calibration.js + reality.js + sys.js
// Snapshot toate user-facing strings post §36.58 LOCKED V1 wording integration.
// Guard-rail pre Sprint UI Integration silent drift detection.

import { describe, it } from 'vitest';
import { captureSnapshot } from './setup.js';
import { DP, getInitialRecommendation } from '../../engine/dp.js';
import { calculateFatigueScore } from '../../engine/fatigue.js';
import { CALIBRATION_LEVELS } from '../../engine/calibration.js';
import { SYS } from '../../engine/sys.js';
import {
  rirToIntensity, RIR_MATRIX,
} from '../../engine/suflet-andura/index.js';

// Mock localStorage for engines that read DB.get(...)
beforeEach(() => {
  globalThis.localStorage = globalThis.localStorage || {
    _data: {},
    getItem(k) { return this._data[k] ?? null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; },
    clear() { this._data = {}; },
  };
  globalThis.localStorage.clear();
});

describe('Golden Master — dp.js intensity labels (§36.58 LOCKED V1)', () => {
  it('intensity labels — 4 RIR-tier wording', () => {
    [0, 1, 2, 3, 4].forEach(rir => {
      captureSnapshot(`dp_intensityLabel_rir_${rir}`, DP.getIntensityLabel(rir));
    });
  });

  it('rep ranges per exercise (catalog snapshot)', () => {
    Object.keys(DP.REP_RANGES).slice(0, 5).forEach(ex => {
      captureSnapshot(`dp_repRange_${ex}`, DP.REP_RANGES[ex]);
    });
  });
});

describe('Golden Master — dp.js getInitialRecommendation verdicte', () => {
  it('FALLBACK (no recentLogs) → "🟡 Pornim conservator"', () => {
    const r = getInitialRecommendation('Lat Pulldown', { recentLogs: [] });
    captureSnapshot('dp_initial_fallback', { statusLabel: r.statusLabel, rationale: r.rationale });
  });

  it('EXACT_MATCH → "🟡 Continuam"', () => {
    const r = getInitialRecommendation('Cable Row', {
      recentLogs: [{ logs: [{ ex: 'Cable Row', w: 60, reps: 10 }] }],
    });
    captureSnapshot('dp_initial_exact_match', { statusLabel: r.statusLabel, rationale: r.rationale });
  });
});

describe('Golden Master — fatigue.js verdicte (§36.58 LOCKED V1)', () => {
  it('insufficient sessions → DATE INSUFICIENTE', () => {
    const r = calculateFatigueScore();
    captureSnapshot('fatigue_insufficient', { label: r.label, detail: r.detail });
  });
});

describe('Golden Master — calibration.js banner texts (§36.58 LOCKED V1)', () => {
  it('COLD_START / INITIAL / DEVELOPING / PERSONALIZING bannerText', () => {
    ['COLD_START', 'INITIAL', 'DEVELOPING', 'PERSONALIZING'].forEach(tier => {
      captureSnapshot(`calib_banner_${tier}`, CALIBRATION_LEVELS[tier].bannerText);
    });
  });

  it('PERSONALIZED + OPTIMIZED bannerText null (transparent UI)', () => {
    captureSnapshot('calib_banner_PERSONALIZED', CALIBRATION_LEVELS.PERSONALIZED.bannerText);
    captureSnapshot('calib_banner_OPTIMIZED', CALIBRATION_LEVELS.OPTIMIZED.bannerText);
  });
});

describe('Golden Master — sys.js timeline + tempo (§36.58 LOCKED V1)', () => {
  it('phase timeline labels RO native', () => {
    const tl = SYS.getTimeline();
    tl.forEach(item => {
      captureSnapshot(`sys_timeline_${item.type}`, item.label);
    });
  });

  it('tempo notes per phase + isCompound', () => {
    [
      ['DB Shoulder Press'],
      ['Lateral Raises'],
    ].forEach(([ex]) => {
      const tempo = SYS.getTempo(ex);
      captureSnapshot(`sys_tempo_${ex}`, tempo);
    });
  });
});

describe('Golden Master — Suflet Andura RIR Matrix (§36.58 + ADR EXT)', () => {
  it('RIR_MATRIX 4-tier labels', () => {
    Object.keys(RIR_MATRIX).forEach(key => {
      captureSnapshot(`rir_matrix_${key}`, RIR_MATRIX[key].label);
    });
  });

  it('rirToIntensity mapper — 5 boundary values', () => {
    [0, 1.5, 2.5, 3.5, 5].forEach(rir => {
      captureSnapshot(`rir_to_intensity_${rir}`, rirToIntensity(rir).key);
    });
  });
});
