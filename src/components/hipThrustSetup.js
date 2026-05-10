// ══ HIP THRUST SETUP — Foundation 4A (§29.2.5 + §29.2.6) ════════════════
// Setup component pentru Hip Thrust pe aparat. Per §1.5 Imagini Claude
// Design — pilot NOT YET done, so ROM/foot-positioning visuals are
// placeholder text (NU image src) until Daniel runs the imagine pilot.
//
// Wording 4-elemente fix LOCKED per §1.5.2 — verbatim, no paraphrase.
//
// Cross-refs:
//   - HANDOVER §29.2.5 Forta & Dezvoltare V1
//   - §29.2.6 Slabire Majora (Hip Thrust pe aparat)
//   - §1.5 Imagini Claude Design — pilot pending

// LOCKED wording (4 elemente fix per §1.5.2). Do NOT paraphrase.
export const HIP_THRUST_FORM_GUIDE = 'Pornesti asezat pe sol, cu spatele sprijinit de o banca, bara peste solduri si picioarele departate la latimea umerilor. Ridici bazinul impingand puternic in calcaie, pana cand coapsele si trunchiul formeaza o linie dreapta. Cobori controlat la pozitia de start. Atentie: nu hiperextinde lombarii la varf — opreste cand soldurile sunt paralele cu solul.';

const PLACEHOLDER_NOTE = 'Imagine in lucru.';

/**
 * Build the Hip Thrust setup card. Caller appends `element` to a
 * container (e.g., the exercise selection modal).
 *
 * @param {{ initialKg?: number, onChange?: Function }} [opts]
 * @returns {{ element: HTMLElement, getKg: Function, setKg: Function, dispose: Function }}
 */
export function createHipThrustSetup(opts = {}) {
  const root = document.createElement('div');
  root.className = 'hip-thrust-setup';
  root.setAttribute('data-component', 'hipThrustSetup');

  // Title
  const title = document.createElement('h3');
  title.className = 'hip-thrust-setup__title';
  title.textContent = 'Hip Thrust pe aparat';
  root.appendChild(title);

  // ROM placeholder (range of motion visual — pending image pilot)
  const rom = document.createElement('div');
  rom.className = 'hip-thrust-setup__rom';
  rom.setAttribute('data-slot', 'rom');
  rom.setAttribute('aria-label', 'Range of motion');
  rom.textContent = `Range of motion: sold paralel cu solul → extensie completa (${PLACEHOLDER_NOTE})`;
  root.appendChild(rom);

  // Foot positioning placeholder (image pending)
  const foot = document.createElement('div');
  foot.className = 'hip-thrust-setup__foot';
  foot.setAttribute('data-slot', 'foot');
  foot.setAttribute('aria-label', 'Foot positioning');
  foot.textContent = `Picioare: latimea umerilor, varfuri usor in afara (${PLACEHOLDER_NOTE})`;
  root.appendChild(foot);

  // Form guide (LOCKED wording)
  const guide = document.createElement('p');
  guide.className = 'hip-thrust-setup__guide';
  guide.textContent = HIP_THRUST_FORM_GUIDE;
  root.appendChild(guide);

  // Weight selector
  const wWrap = document.createElement('label');
  wWrap.className = 'hip-thrust-setup__weight';
  wWrap.textContent = 'Greutate (kg)';

  const input = document.createElement('input');
  input.type = 'number';
  input.min = '0';
  input.step = '2.5';
  input.value = String(_validKg(opts.initialKg) ? opts.initialKg : 0);
  input.className = 'hip-thrust-setup__kg-input';
  input.setAttribute('aria-label', 'Greutate kg');
  wWrap.appendChild(input);
  root.appendChild(wWrap);

  const cleanups = [];
  if (typeof opts.onChange === 'function') {
    const handler = () => {
      const kg = Number(input.value);
      opts.onChange(_validKg(kg) ? kg : 0);
    };
    input.addEventListener('input', handler);
    cleanups.push(() => input.removeEventListener('input', handler));
  }

  return {
    element: root,
    getKg: () => {
      const kg = Number(input.value);
      return _validKg(kg) ? kg : 0;
    },
    setKg: (kg) => {
      input.value = String(_validKg(kg) ? kg : 0);
    },
    dispose: () => cleanups.forEach(fn => { try { fn(); } catch {} }),
  };
}

function _validKg(v) {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 && n < 1000;
}
