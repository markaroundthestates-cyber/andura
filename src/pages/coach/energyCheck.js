// ══ ENERGY CHECK §G — Pre-session energy gauge (3 states + cause drill) ══════
// Port spec: mockup `04-architecture/mockups/andura-clasic.html:§energy-check`
//   - 3 states: Excelent / Normal / Obosit
//   - Excelent + Normal -> proceed workout (readiness 5 / 3)
//   - Obosit -> energy-cause drill (4 cauze: Stres / Somn slab / Durere / Altul)
// Engine integration: maps 3-state UI -> readiness 1-5 scale via saveReadiness.

import { DB, tod } from '../../db.js';
import { saveReadiness } from '../../engine/readiness.js';

export const ENERGY_STATES = {
  EXCELLENT: 'excellent',
  NORMAL: 'normal',
  TIRED: 'tired',
};

// 3-state UI -> 5-state readiness engine scale (anti-paternalism: 3 simple choices,
// engine compatibility preserved via mapping).
const READINESS_FROM_ENERGY = {
  [ENERGY_STATES.EXCELLENT]: 5,
  [ENERGY_STATES.NORMAL]: 3,
  [ENERGY_STATES.TIRED]: 2,
};

export const ENERGY_CAUSES = [
  { key: 'stress',     label: 'Stres' },
  { key: 'poor_sleep', label: 'Somn slab' },
  { key: 'soreness',   label: 'Durere musculara / articulatie' },
  { key: 'other',      label: 'Altul' },
];

export function showEnergyCheck(onProceed) {
  if (document.getElementById('energy-check-modal')) return;
  const modal = document.createElement('div');
  modal.id = 'energy-check-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:8000;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px';
  modal.innerHTML = `
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:28px 24px;width:100%;max-width:400px">
      <div style="font-size:13px;color:var(--accent);text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;text-align:center">INAINTE DE SESIUNE</div>
      <div style="font-size:20px;font-weight:700;margin-bottom:6px;text-align:center">Cum te simti?</div>
      <div style="font-size:12px;color:var(--text3);margin-bottom:20px;text-align:center;line-height:1.5">Coach-ul ajusteaza intensitatea pe baza energiei tale.<br><b>3 stari simple.</b></div>
      <div style="display:flex;flex-direction:column;gap:10px">
        <button class="energy-btn-excellent" data-state="${ENERGY_STATES.EXCELLENT}" style="display:flex;align-items:center;gap:14px;padding:16px 14px;background:var(--card);border:1px solid var(--border);border-radius:var(--rs);cursor:pointer;text-align:left">
          <span style="font-size:32px">🟢</span>
          <span style="display:flex;flex-direction:column;align-items:flex-start"><span style="font-weight:700;font-size:15px;color:var(--text)">Excelent</span><span style="font-size:11px;color:var(--text3);margin-top:2px">Coach urca intensitatea +15%</span></span>
        </button>
        <button class="energy-btn-normal" data-state="${ENERGY_STATES.NORMAL}" style="display:flex;align-items:center;gap:14px;padding:16px 14px;background:var(--card);border:1px solid var(--border);border-radius:var(--rs);cursor:pointer;text-align:left">
          <span style="font-size:32px">🟡</span>
          <span style="display:flex;flex-direction:column;align-items:flex-start"><span style="font-weight:700;font-size:15px;color:var(--text)">Normal · OK</span><span style="font-size:11px;color:var(--text3);margin-top:2px">Sesiune normala — baseline</span></span>
        </button>
        <button class="energy-btn-tired" data-state="${ENERGY_STATES.TIRED}" style="display:flex;align-items:center;gap:14px;padding:16px 14px;background:var(--card);border:1px solid var(--border);border-radius:var(--rs);cursor:pointer;text-align:left">
          <span style="font-size:32px">🔴</span>
          <span style="display:flex;flex-direction:column;align-items:flex-start"><span style="font-weight:700;font-size:15px;color:var(--text)">Obosit / slab</span><span style="font-size:11px;color:var(--text3);margin-top:2px">Coach reduce sesiunea imediat</span></span>
        </button>
      </div>
      <button class="energy-skip" style="margin-top:18px;background:none;border:none;color:var(--text3);font-size:12px;cursor:pointer;padding:8px;width:100%;text-align:center">Sari peste</button>
    </div>`;
  document.body.appendChild(modal);

  modal.querySelectorAll('button[data-state]').forEach(btn => {
    btn.addEventListener('click', () => selectEnergyState(btn.dataset.state, onProceed));
  });
  modal.querySelector('.energy-skip').addEventListener('click', () => {
    modal.remove();
    if (typeof onProceed === 'function') onProceed({ state: null, skipped: true });
  });
}

export function selectEnergyState(state, onProceed) {
  const readiness = READINESS_FROM_ENERGY[state];
  if (readiness != null) saveReadiness(readiness);

  const modal = document.getElementById('energy-check-modal');
  if (modal) modal.remove();

  if (state === ENERGY_STATES.TIRED) {
    showEnergyCause(onProceed);
    return;
  }
  if (typeof onProceed === 'function') onProceed({ state, readiness, skipped: false });
}

export function showEnergyCause(onProceed) {
  if (document.getElementById('energy-cause-modal')) return;
  const modal = document.createElement('div');
  modal.id = 'energy-cause-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:8000;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px';
  modal.innerHTML = `
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:24px 20px;width:100%;max-width:400px">
      <div style="font-size:13px;color:var(--accent);text-transform:uppercase;letter-spacing:2px;margin-bottom:8px">CE E MAI GREU AZI?</div>
      <div style="font-size:12px;color:var(--text3);margin-bottom:16px;line-height:1.5">Alege una. Coach-ul foloseste raspunsul ca sa adapteze sesiunea.</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${ENERGY_CAUSES.map(c =>
          `<button data-cause="${c.key}" style="display:block;width:100%;text-align:left;background:var(--card);border:1px solid var(--border);border-radius:var(--rs);padding:13px 16px;cursor:pointer;font-size:13px;color:var(--text)">${c.label}</button>`
        ).join('')}
      </div>
      <button class="cause-skip" style="margin-top:14px;background:none;border:none;color:var(--text3);font-size:12px;cursor:pointer;width:100%;text-align:center;padding:8px">Sari peste</button>
    </div>`;
  document.body.appendChild(modal);

  modal.querySelectorAll('button[data-cause]').forEach(btn => {
    btn.addEventListener('click', () => selectEnergyCause(btn.dataset.cause, onProceed));
  });
  modal.querySelector('.cause-skip').addEventListener('click', () => {
    modal.remove();
    if (typeof onProceed === 'function') onProceed({ state: ENERGY_STATES.TIRED, readiness: READINESS_FROM_ENERGY[ENERGY_STATES.TIRED], cause: null, skipped: true });
  });
}

export function selectEnergyCause(cause, onProceed) {
  const log = DB.get('energy-cause-log') || [];
  log.unshift({ date: tod(), cause, ts: Date.now() });
  DB.set('energy-cause-log', log.slice(0, 90));

  const modal = document.getElementById('energy-cause-modal');
  if (modal) modal.remove();

  if (typeof onProceed === 'function') onProceed({
    state: ENERGY_STATES.TIRED,
    readiness: READINESS_FROM_ENERGY[ENERGY_STATES.TIRED],
    cause,
    skipped: false,
  });
}
