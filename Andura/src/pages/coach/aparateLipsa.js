// ══ APARATE LIPSA — Permanent missing-equipment picker (Calendar V1 S2) ════
// Port spec: mockup `04-architecture/mockups/andura-clasic.html:§screen-aparate-lipsa`
// (S1.7 LANDED 2026-05-12 commit de761f5). Daniel push-back chat ACASĂ
// 2026-05-12: aparate-lipsa = permanent state distinct semantic vs
// "Aparat ocupat" equipment-swap temporary (preserved orthogonal screen).
//
// Drill destinations (parity mockup):
//   - Cont > General > "Aparate lipsa" entry
//   - Workout-preview > "Nu am aparat" button under exercise list
//
// Persistence + translation handled by scheduleAdapter.js — this file is
// pure UI. Engine integration via ctx.equipment.{available,unavailable}
// already wired in coachContext.js S2.B (commit fce846a).
//
// Pattern: modal overlay (src/ convention, parity equipmentSwap/painButton/
// cevaNuMerge). Mockup full-screen sub-page styling adapted to modal context.

import { state } from '../../state.js';
import {
  VALID_EQUIPMENT_IDS,
  getMissingEquipment,
  toggleMissingEquipment,
  getSkippedExercises,
  toggleSkippedExercise,
} from '../../engine/schedule/scheduleAdapter.js';

const escapeHtmlALP = (s) => String(s || '').replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c]));

// User-facing labels per picker entry — parity mockup S1.7 verbatim.
// Order matches VALID_EQUIPMENT_IDS array order (UI ordering convention).
export const APARATE_LIPSA_LABELS = Object.freeze({
  'banca-inclinata':  'Banca inclinata',
  'banca-plana':      'Banca plana',
  'bara-halterelor':  'Bara halterelor',
  'gantere':          'Gantere',
  'aparat-cablu':     'Aparat cablu / scripete',
  'power-rack':       'Power rack / Smith machine',
  'leg-press':        'Leg press',
  'aparat-extensii':  'Aparat extensii / curls picioare',
  'aparat-tractiuni': 'Aparat tractiuni / bara fixa',
  'banda-elastica':   'Banda elastica',
});

export function showAparateLipsa(onResolve) {
  if (document.getElementById('aparate-lipsa-modal')) return;
  state.currentScreen = 'aparate-lipsa';

  const modal = document.createElement('div');
  modal.id = 'aparate-lipsa-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:8000;display:flex;align-items:flex-end;justify-content:center';

  const initialMissing = getMissingEquipment();
  const initialSkipped = getSkippedExercises();

  const rowsHtml = VALID_EQUIPMENT_IDS.map(id => {
    const checked = initialMissing.includes(id) ? 'checked' : '';
    const label = APARATE_LIPSA_LABELS[id] || id;
    return `
      <label data-equipment-row="${id}" style="display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--card);border:1px solid var(--border);border-radius:var(--rs);cursor:pointer">
        <input type="checkbox" data-equipment="${id}" ${checked} style="width:18px;height:18px;accent-color:#c8412e;flex-shrink:0"/>
        <span style="font-size:13px;font-weight:600;color:var(--text);flex:1">${label}</span>
      </label>`;
  }).join('');

  // Bundle 4 — Grupul 2: Exerciții refuzate permanent (dynamic NEW)
  const exercisesHtml = initialSkipped.length > 0
    ? initialSkipped.map(name => {
        const safeName = escapeHtmlALP(name);
        return `
      <label data-exercise-row="${safeName}" style="display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--card);border:1px solid var(--border);border-radius:var(--rs);cursor:pointer">
        <input type="checkbox" data-exercise="${safeName}" checked style="width:18px;height:18px;accent-color:#c8412e;flex-shrink:0"/>
        <span style="font-size:13px;font-weight:600;color:var(--text);flex:1">${safeName}</span>
      </label>`;
      }).join('')
    : `<div data-exercise-empty="true" style="font-size:11px;color:var(--text3);line-height:1.5;font-style:italic;padding:8px 4px">Nu ai eliminat niciun exercitiu permanent yet. Poti marca din Antrenor &gt; Preview cu &quot;Nu am&quot; sau &quot;Nu vreau&quot; repetat.</div>`;

  modal.innerHTML = `
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:16px 16px 0 0;width:100%;max-width:500px;padding:22px 20px 32px;max-height:85vh;overflow-y:auto">
      <div style="font-size:15px;font-weight:700;margin-bottom:4px">Aparate lipsa</div>
      <div style="font-size:12px;color:var(--text3);margin-bottom:14px;line-height:1.5">Bifeaza aparatele pe care <strong style="color:var(--text)">nu le ai</strong>. Coach-ul va alege exercitii alternative si nu le va propune in viitor.</div>
      <div style="font-size:11px;color:var(--text3);margin-bottom:14px;line-height:1.5;font-style:italic">Poti reveni oricand sa scoti din lista daca ai acum aparatul.</div>

      <div style="font-size:11px;color:var(--text2);text-transform:uppercase;letter-spacing:0.06em;font-weight:600;margin-bottom:8px;margin-top:6px">Aparate</div>
      <div id="aparate-lipsa-stack" style="display:flex;flex-direction:column;gap:8px">
        ${rowsHtml}
      </div>

      <div style="font-size:11px;color:var(--text2);text-transform:uppercase;letter-spacing:0.06em;font-weight:600;margin-bottom:8px;margin-top:18px">Exercitii refuzate permanent</div>
      <div id="exercitii-refuzate-stack" style="display:flex;flex-direction:column;gap:8px">
        ${exercisesHtml}
      </div>

      <p style="font-size:11px;color:var(--text3);margin-top:14px;line-height:1.5;font-style:italic">Coach-ul invata din selectiile tale. Daca lipsesc mai multe aparate, propune sesiuni bodyweight sau cu alternative.</p>
      <button class="aparate-close" style="margin-top:14px;width:100%;padding:12px;background:var(--accent);color:#000;border:none;border-radius:var(--rs);cursor:pointer;font-size:13px;font-weight:600">Gata</button>
    </div>`;

  document.body.appendChild(modal);

  // Wire toggle handlers — delegate to scheduleAdapter for persistence + validation.
  modal.querySelectorAll('input[type="checkbox"][data-equipment]').forEach(cb => {
    cb.addEventListener('change', () => {
      const equipmentId = cb.dataset.equipment;
      toggleMissingEquipment(equipmentId);
      showAparateToast(cb.checked ? 'Adaugat la aparate lipsa' : 'Scos din aparate lipsa');
    });
  });

  // Bundle 4 — Grupul 2 handlers (exerciții refuzate permanent reversibilitate).
  modal.querySelectorAll('input[type="checkbox"][data-exercise]').forEach(cb => {
    cb.addEventListener('change', () => {
      const exerciseName = cb.dataset.exercise;
      toggleSkippedExercise(exerciseName);
      showAparateToast(cb.checked ? 'Adaugat la exercitii refuzate' : 'Scos din exercitii refuzate');
    });
  });

  const closeBtn = modal.querySelector('.aparate-close');
  closeBtn.addEventListener('click', () => {
    closeAparateLipsaModal();
    if (typeof onResolve === 'function') onResolve({ action: 'done', list: getMissingEquipment() });
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeAparateLipsaModal();
      if (typeof onResolve === 'function') onResolve({ action: 'cancel', source: 'backdrop' });
    }
  });
}

export function closeAparateLipsaModal() {
  const modal = document.getElementById('aparate-lipsa-modal');
  if (modal) modal.remove();
  if (state.currentScreen === 'aparate-lipsa') state.currentScreen = 'antrenor';
}

function showAparateToast(message) {
  const existing = document.getElementById('aparate-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'aparate-toast';
  toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:var(--bg2);border:1px solid var(--accent);border-radius:var(--rs);padding:10px 16px;font-size:12px;color:var(--text);z-index:9000;max-width:300px;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,0.4)';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => { if (toast.parentNode) toast.remove(); }, 2000);
}
