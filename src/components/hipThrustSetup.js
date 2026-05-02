// ══ HIP THRUST SETUP — Foundation 4A (§29.2.5 + §29.2.6) ════════════════
// Setup component pentru Hip Thrust pe aparat. Per §1.5 Imagini Claude
// Design — pilot NOT YET done, so ROM/foot-positioning visuals are
// placeholder text (NU image src) until Daniel runs the imagine pilot.
//
// Wording 4-elemente fix LOCKED per §1.5.2 — verbatim, no paraphrase.
//
// Cross-refs:
//   - HANDOVER §29.2.5 Forță & Dezvoltare V1
//   - §29.2.6 Slăbire Majoră (Hip Thrust pe aparat)
//   - §1.5 Imagini Claude Design — pilot pending

// LOCKED wording (4 elemente fix per §1.5.2). Do NOT paraphrase.
export const HIP_THRUST_FORM_GUIDE = 'Pornești așezat pe sol, cu spatele sprijinit de o bancă, bara peste șolduri și picioarele depărtate la lățimea umerilor. Ridici bazinul împingând puternic în călcâie, până când coapsele și trunchiul formează o linie dreaptă. Cobori controlat la poziția de start. Atenție: nu hiperextinde lombarii la vârf — oprește când șoldurile sunt paralele cu solul.';

const PLACEHOLDER_NOTE = 'Imagine în lucru.';

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
  rom.textContent = `Range of motion: șold paralel cu solul → extensie completă (${PLACEHOLDER_NOTE})`;
  root.appendChild(rom);

  // Foot positioning placeholder (image pending)
  const foot = document.createElement('div');
  foot.className = 'hip-thrust-setup__foot';
  foot.setAttribute('data-slot', 'foot');
  foot.setAttribute('aria-label', 'Foot positioning');
  foot.textContent = `Picioare: lățimea umerilor, vârfuri ușor în afară (${PLACEHOLDER_NOTE})`;
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
