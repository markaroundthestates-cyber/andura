// ══ WORKOUT PREVIEW — pre-session "Ce urmeaza azi" screen (Bundle 4) ═══════
// Port spec: mockup `04-architecture/mockups/andura-clasic.html:§screen-workout-preview`
// L913-997. Daniel verbatim chat-current 2026-05-13 "Tu esti Gigel..." —
// anti-paternalism cascade in-place per-exercise instead of forcing rigid session.
//
// Per-exercise row 2 inline buttons:
//   - "Nu am" (lucide package-x) → resolve equipment target via EXERCISE_METADATA.equipment_type
//     single-mapping {dumbbell, band, cable} → toggleMissingEquipment(equipmentId) global
//     ambiguous {machine, barbell, bodyweight} → toggleSkippedExercise(exerciseName) global
//     cascade: pickNextAlternative replace row in-place + state.previewRefusalsByExercise track
//   - "Nu vreau" (lucide hand) → cascade replace row + incrementRefusal cross-session counter
//     counter >= REFUSAL_COUNTER_THRESHOLD → showRefusalCounterModal "permanent?"
//
// Engine integration orthogonal per ADR 026 §9 — pure findAlternatives() consumption,
// ZERO mutation. Storage edges via scheduleAdapter.js Tier 0 (parity Bundle 3A precedent).

import { state } from '../../state.js';
import { navigate } from '../../router.js';
import { findAlternatives } from '../../engine/smart-routing/alternative-finder.js';
import { getExerciseMetadata } from '../../schema/exerciseMetadata.js';
import {
  toggleMissingEquipment,
  toggleSkippedExercise,
  incrementRefusal,
  REFUSAL_COUNTER_THRESHOLD,
} from '../../engine/schedule/scheduleAdapter.js';
import { showRefusalCounterModal } from './refusalCounterModal.js';

const escapeHtml = (s) => String(s || '').replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c]));

// Co-CTO bias Bundle 4 §0.3 — single-mapping equipment_type → global VALID_EQUIPMENT_IDS entry.
// Ambiguous types ('machine'/'barbell'/'bodyweight') fallback to exercise-specific skipped list
// to preserve specificity (avoid broad equipment block confusion).
const EQUIPMENT_TYPE_SINGLE_MAPPING = Object.freeze({
  'dumbbell': 'gantere',
  'band':     'banda-elastica',
  'cable':    'aparat-cablu',
});

// Bundle 4 default 5-exercise Push session — used as mockup parity placeholder when
// caller doesn't pass opts.exercises. All names exist in EXERCISE_METADATA so cascade
// works deterministically. Bundle 4.1 will wire to actual session schedule.
const DEFAULT_PREVIEW_EXERCISES = Object.freeze([
  'Incline DB Press',
  'DB Shoulder Press',
  'Lat Pulldown',
  'Cable Curl',
  'Lateral Raises',
]);

/**
 * Resolve where to add a missing-equipment refusal: global equipment list OR
 * exercise-specific skipped list. Single-mapping equipment_type → global.
 * Multi/ambiguous → exercise-specific fallback.
 *
 * @param {string} exerciseName
 * @returns {{type: 'equipment'|'exercise', value: string}}
 */
export function resolveMissingEquipmentTarget(exerciseName) {
  if (typeof exerciseName !== 'string' || !exerciseName) return { type: 'exercise', value: '' };
  const meta = getExerciseMetadata(exerciseName);
  const mapped = EQUIPMENT_TYPE_SINGLE_MAPPING[meta.equipment_type];
  if (mapped) return { type: 'equipment', value: mapped };
  return { type: 'exercise', value: exerciseName };
}

/**
 * Pick next valid alternative excluding already-refused this session.
 * Returns null when alternatives exhausted.
 *
 * @param {string} exerciseName
 * @param {string[]} [excludeList=[]] — already-refused alternative names this session
 * @returns {string|null}
 */
export function pickNextAlternative(exerciseName, excludeList = []) {
  if (typeof exerciseName !== 'string' || !exerciseName) return null;
  const { alternatives, shouldSkip } = findAlternatives(exerciseName);
  if (shouldSkip || !alternatives.length) return null;
  const excludeSet = new Set(Array.isArray(excludeList) ? excludeList : []);
  for (const alt of alternatives) {
    if (!excludeSet.has(alt.name)) return alt.name;
  }
  return null;
}

function buildRowHtml(exerciseName, index) {
  const safeName = escapeHtml(exerciseName);
  return `
    <div class="preview-ex-row" data-exercise="${safeName}" data-origin-exercise="${safeName}" data-index="${index}" style="display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--card);border:1px solid var(--border);border-radius:var(--rs)">
      <div style="width:28px;height:28px;border-radius:50%;background:var(--bg3);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:var(--text2);flex-shrink:0">${index + 1}</div>
      <div style="flex:1;min-width:0">
        <div class="preview-ex-name" style="font-size:13px;font-weight:600;color:var(--text)">${safeName}</div>
        <div class="preview-ex-meta" style="font-size:11px;color:var(--text3);font-family:'JetBrains Mono',monospace;margin-top:2px">3 seturi</div>
      </div>
      <button class="preview-ex-missing" aria-label="Nu am aparat" title="Nu am aparat" style="background:transparent;border:none;padding:6px;cursor:pointer;color:#c8412e;display:flex;align-items:center;justify-content:center">
        <i data-lucide="package-x" style="width:16px;height:16px"></i>
      </button>
      <button class="preview-ex-dontwant" aria-label="Nu vreau" title="Nu vreau" style="background:transparent;border:none;padding:6px;cursor:pointer;color:var(--text3);display:flex;align-items:center;justify-content:center">
        <i data-lucide="hand" style="width:16px;height:16px"></i>
      </button>
    </div>`;
}

function markRowExhausted(rowEl, exerciseName) {
  if (!rowEl) return;
  rowEl.dataset.exhausted = 'true';
  rowEl.style.opacity = '0.5';
  const nameEl = rowEl.querySelector('.preview-ex-name');
  if (nameEl) nameEl.style.textDecoration = 'line-through';
  const metaEl = rowEl.querySelector('.preview-ex-meta');
  if (metaEl) metaEl.textContent = 'Nu mai am alternative pentru această sesiune';
  const missBtn = rowEl.querySelector('.preview-ex-missing');
  if (missBtn) missBtn.disabled = true;
  const dwBtn = rowEl.querySelector('.preview-ex-dontwant');
  if (dwBtn) dwBtn.disabled = true;
}

function updateRowExercise(rowEl, newExerciseName) {
  if (!rowEl || typeof newExerciseName !== 'string' || !newExerciseName) return;
  rowEl.dataset.exercise = newExerciseName;
  const nameEl = rowEl.querySelector('.preview-ex-name');
  if (nameEl) nameEl.textContent = newExerciseName;
}

function getTrackedRefusals(exerciseName) {
  if (!state.previewRefusalsByExercise) state.previewRefusalsByExercise = {};
  if (!state.previewRefusalsByExercise[exerciseName]) {
    state.previewRefusalsByExercise[exerciseName] = [];
  }
  return state.previewRefusalsByExercise[exerciseName];
}

function cascadeReplaceRow(rowEl, originExerciseName) {
  // Cascade always rooted at the row's ORIGINAL exercise (data-origin-exercise),
  // never the currently-visible name. Refusals accumulate against origin so
  // exhaustion is well-defined.
  const refusals = getTrackedRefusals(originExerciseName);
  const currentVisible = rowEl ? rowEl.dataset.exercise : originExerciseName;
  if (currentVisible && !refusals.includes(currentVisible)) {
    refusals.push(currentVisible);
  }
  const allRefused = refusals.includes(originExerciseName)
    ? refusals
    : [originExerciseName, ...refusals];
  const next = pickNextAlternative(originExerciseName, allRefused);
  if (next) {
    updateRowExercise(rowEl, next);
  } else {
    markRowExhausted(rowEl, originExerciseName);
  }
}

function onMissingEquipClick(rowEl) {
  if (!rowEl || rowEl.dataset.exhausted === 'true') return;
  // Refusal action targets the CURRENTLY VISIBLE exercise (what user sees + refuses),
  // but cascade is rooted at the ORIGIN exercise for exhaustion tracking.
  const currentName = rowEl.dataset.exercise;
  const originName = rowEl.dataset.originExercise || currentName;
  if (!currentName) return;
  const target = resolveMissingEquipmentTarget(currentName);
  if (target.type === 'equipment' && target.value) {
    toggleMissingEquipment(target.value);
  } else if (target.type === 'exercise' && target.value) {
    toggleSkippedExercise(target.value);
  }
  cascadeReplaceRow(rowEl, originName);
}

function onDontWantClick(rowEl) {
  if (!rowEl || rowEl.dataset.exhausted === 'true') return;
  const currentName = rowEl.dataset.exercise;
  const originName = rowEl.dataset.originExercise || currentName;
  if (!currentName) return;
  const count = incrementRefusal(currentName);
  cascadeReplaceRow(rowEl, originName);
  if (count >= REFUSAL_COUNTER_THRESHOLD) {
    showRefusalCounterModal(currentName, count);
  }
}

export function showWorkoutPreview(opts = {}) {
  if (document.getElementById('workout-preview-screen')) return;
  state.currentScreen = 'workout-preview';
  state.previewRefusalsByExercise = {};

  const exercises = (Array.isArray(opts.exercises) && opts.exercises.length > 0)
    ? opts.exercises.filter(e => typeof e === 'string' && e.length > 0)
    : [...DEFAULT_PREVIEW_EXERCISES];

  const energyMod = opts.energyMod || 'normal';
  const intensityMsg = energyMod === 'plus' ? 'Coach urca intensitatea +15%.'
    : energyMod === 'minus' ? 'Coach reduce sesiunea — recovery focus.'
    : 'Sesiune normala — baseline.';

  const overlay = document.createElement('div');
  overlay.id = 'workout-preview-screen';
  overlay.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:7400;display:flex;flex-direction:column;overflow-y:auto';

  const rowsHtml = exercises.map((ex, idx) => buildRowHtml(ex, idx)).join('');

  overlay.innerHTML = `
    <div class="preview-top-bar" style="display:flex;align-items:center;padding:14px 20px;border-bottom:1px solid var(--border)">
      <button class="preview-back" aria-label="Inapoi" style="background:none;border:none;padding:6px;cursor:pointer;color:var(--text);font-size:18px">←</button>
      <h2 style="flex:1;margin:0;text-align:center;font-size:15px;font-weight:600;color:var(--text)">Ce urmeaza azi</h2>
      <div style="width:30px"></div>
    </div>

    <div style="padding:14px 20px 24px;overflow-y:auto;flex:1">
      <div id="preview-intensity-banner" style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--rs);padding:10px 14px;margin-bottom:14px">
        <div id="preview-intensity-msg" style="font-size:12px;color:var(--text2);line-height:1.5">${escapeHtml(intensityMsg)}</div>
      </div>

      <div style="background:var(--ink, #1a1815);color:var(--paper, #fff);border-radius:14px;padding:16px;margin-bottom:14px">
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.06em;opacity:0.7">Sesiunea de azi</div>
        <h2 style="font-size:18px;font-weight:700;margin:4px 0 6px">Push · piept &amp; umeri</h2>
        <div id="preview-summary" style="font-family:'JetBrains Mono',monospace;font-size:11px;opacity:0.8">~ 45 min · ${exercises.length} exercitii · 12 800 kg</div>
      </div>

      <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:0.06em;font-weight:600;margin-bottom:8px">Exercitii</div>
      <div id="preview-exercise-list" style="display:flex;flex-direction:column;gap:8px">
        ${rowsHtml}
      </div>

      <p style="font-size:11px;color:var(--text3);margin-top:14px;line-height:1.5;font-style:italic">Coach-ul ajusteaza in timpul sesiunii daca apare ceva: durere, oboseala, set greu. Nu trebuie sa stii dinainte tot.</p>

      <button class="preview-confirm" style="width:100%;margin-top:18px;padding:14px;background:var(--accent);color:#000;border:none;border-radius:var(--rs);cursor:pointer;font-size:14px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:8px">
        <i data-lucide="check" style="width:16px;height:16px"></i>
        <span>Confirma, incep</span>
      </button>
    </div>`;

  document.body.appendChild(overlay);

  // Event delegation on the exercise list — efficient handler wiring for dynamic rows.
  const listEl = overlay.querySelector('#preview-exercise-list');
  if (listEl) {
    listEl.addEventListener('click', (e) => {
      const target = e.target instanceof Element ? e.target : null;
      if (!target) return;
      const missBtn = target.closest('.preview-ex-missing');
      const dwBtn = target.closest('.preview-ex-dontwant');
      const rowEl = target.closest('.preview-ex-row');
      if (!rowEl) return;
      if (missBtn) {
        onMissingEquipClick(rowEl);
      } else if (dwBtn) {
        onDontWantClick(rowEl);
      }
    });
  }

  const backBtn = overlay.querySelector('.preview-back');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      closeWorkoutPreview();
      navigate('antrenor');
    });
  }

  const confirmBtn = overlay.querySelector('.preview-confirm');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      closeWorkoutPreview();
      navigate('workout');
      if (typeof opts.onConfirm === 'function') opts.onConfirm({ exercises });
    });
  }
}

export function closeWorkoutPreview() {
  const overlay = document.getElementById('workout-preview-screen');
  if (overlay) overlay.remove();
  if (state.currentScreen === 'workout-preview') state.currentScreen = 'antrenor';
}

// Debug-friendly export for callers wiring smoke tests if needed.
export function getWorkoutPreviewMountState() {
  return {
    mounted: !!document.getElementById('workout-preview-screen'),
    currentScreen: state.currentScreen,
    refusals: { ...state.previewRefusalsByExercise },
  };
}
