// ══ ONBOARDING + BASELINE ════════════════════════════════════
import { DB, $ } from './db.js';
import { COMPOUND_EX } from './constants.js';
import { DP } from './engine/dp.js';
import { toast } from './ui/ui.js';
import { renderCoachIdle } from './pages/coach.js';
import { renderDash } from './pages/dashboard.js';

// ══════════════ ONBOARDING GREUTĂȚI INIȚIALE ══════════════
const INIT_EXERCISES = [
  {ex:'Incline DB Press', label:'Incline DB Press (per ganteră)', placeholder:'ex: 30'},
  {ex:'DB Shoulder Press', label:'Shoulder Press DB (per ganteră)', placeholder:'ex: 20'},
  {ex:'Lat Pulldown', label:'Lat Pulldown (greutate totală)', placeholder:'ex: 64'},
  {ex:'Cable Row', label:'Cable Row (greutate totală)', placeholder:'ex: 72'},
  {ex:'Lateral Raises', label:'Lateral Raises (per ganteră)', placeholder:'ex: 10'},
  {ex:'Face Pulls', label:'Face Pulls (cablu, greutate totală)', placeholder:'ex: 41'},
  {ex:'Incline DB Curl', label:'Incline DB Curl (per ganteră)', placeholder:'ex: 10'},
  {ex:'Bayesian Curl', label:'Bayesian Curl (cablu)', placeholder:'ex: 18'},
  {ex:'Overhead Triceps', label:'Overhead Triceps (cablu)', placeholder:'ex: 41'},
  {ex:'Pushdown', label:'Pushdown (cablu)', placeholder:'ex: 41'},
  {ex:'Leg Press', label:'Leg Press (greutate totală)', placeholder:'ex: 150'},
];

export function checkOnboarding() {
  const done = DB.get('onboarding-done');
  if (done) return;
  // Check if any logs exist already
  const logs = DB.get('logs') || [];
  if (logs.length > 0) { DB.set('onboarding-done', true); return; }
  showOnboarding();
}

function showOnboarding() {
  const overlay = document.createElement('div');
  overlay.id = 'onboarding-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:500;overflow-y:auto;padding:0 0 40px';
  overlay.innerHTML = `
    <div style="padding:52px 20px 20px;background:linear-gradient(180deg,var(--bg2) 0%,transparent 100%)">
      <div style="font-size:11px;color:var(--accent);text-transform:uppercase;letter-spacing:2px;margin-bottom:6px">SETUP INIȚIAL</div>
      <div style="font-family:'Bebas Neue',sans-serif;font-size:32px;color:var(--text);line-height:1;margin-bottom:8px">GREUTĂȚILE TALE ACTUALE</div>
      <div style="font-size:13px;color:var(--text2);line-height:1.6">Introdu greutățile cu care lucrezi acum + câte reps faci. Sistemul va ști de unde să înceapă fără să ghicească.</div>
    </div>
    <div style="padding:0 16px">
      ${INIT_EXERCISES.map((e,i) => `
        <div style="background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:14px 16px;margin-bottom:10px">
          <div style="font-size:11px;color:var(--text2);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">${e.label}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <div>
              <div style="font-size:9px;color:var(--text3);margin-bottom:4px">GREUTATE (kg)</div>
              <input type="number" id="ob-kg-${i}" placeholder="${e.placeholder}" step="0.5" inputmode="decimal"
                style="width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:var(--rs);padding:10px 12px;color:var(--text);font-size:18px;font-weight:700;font-family:'JetBrains Mono',monospace;outline:none;text-align:center"/>
            </div>
            <div>
              <div style="font-size:9px;color:var(--text3);margin-bottom:4px">REPS FĂCUȚI</div>
              <input type="number" id="ob-reps-${i}" placeholder="8" inputmode="numeric"
                style="width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:var(--rs);padding:10px 12px;color:var(--text);font-size:18px;font-weight:700;font-family:'JetBrains Mono',monospace;outline:none;text-align:center"/>
            </div>
          </div>
          <div style="margin-top:8px">
            <div style="font-size:9px;color:var(--text3);margin-bottom:4px">RPE (cât de greu a fost?)</div>
            <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px">
              ${[7,8,9,10].map(r => `<button onclick="setObRPE(${i},${r})" id="ob-rpe-${i}-${r}"
                style="padding:8px;background:var(--bg3);border:1px solid var(--border);border-radius:var(--rs);color:var(--text2);font-size:13px;font-weight:700;cursor:pointer;font-family:'JetBrains Mono',monospace;transition:all .15s">${r}</button>`).join('')}
              <button onclick="setObRPE(${i},0)" id="ob-rpe-${i}-0"
                style="padding:8px;background:var(--bg3);border:1px solid var(--border);border-radius:var(--rs);color:var(--text3);font-size:10px;cursor:pointer;font-family:'DM Sans',sans-serif">skip</button>
            </div>
          </div>
        </div>`).join('')}
      <div style="margin-top:4px;margin-bottom:12px;font-size:11px;color:var(--text3);text-align:center">Dacă nu faci un exercițiu, lasă gol și apasă Skip.</div>
      <button onclick="saveOnboarding()" style="width:100%;padding:16px;background:var(--accent);color:#000;font-weight:700;font-size:16px;border:none;border-radius:var(--r);cursor:pointer;font-family:'Bebas Neue',sans-serif;letter-spacing:1px">
        ✓ SALVEAZĂ ȘI ÎNCEPE
      </button>
      <button onclick="skipOnboarding()" style="width:100%;padding:12px;background:transparent;color:var(--text3);font-size:13px;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;margin-top:8px">
        Skip — introduc mai târziu
      </button>
    </div>`;
  document.body.appendChild(overlay);
}

const obRPEs = {};
export function setObRPE(idx, rpe) {
  obRPEs[idx] = rpe;
  [7,8,9,10,0].forEach(r => {
    const btn = document.getElementById(`ob-rpe-${idx}-${r}`);
    if (!btn) return;
    const isSelected = r === rpe;
    btn.style.background = isSelected ? 'rgba(200,255,0,0.15)' : 'var(--bg3)';
    btn.style.color = isSelected ? 'var(--accent)' : (r===0?'var(--text3)':'var(--text2)');
    btn.style.borderColor = isSelected ? 'var(--accent)' : 'var(--border)';
  });
}

export function saveOnboarding() {
  const logs = DB.get('logs') || [];
  const today = new Date().toISOString().split('T')[0];
  let saved = 0;
  INIT_EXERCISES.forEach((e, i) => {
    const kgInput = document.getElementById(`ob-kg-${i}`);
    const repsInput = document.getElementById(`ob-reps-${i}`);
    const kg = parseFloat(kgInput?.value);
    const reps = parseInt(repsInput?.value) || 8;
    const rpe = obRPEs[i] || 8;
    if (!isNaN(kg) && kg > 0) {
      // Save as a historical log entry (3 sets to establish baseline)
      for (let s = 1; s <= 3; s++) {
        logs.unshift({
          date: today, ex: e.ex, w: kg,
          sets: 1, reps: String(reps), rpe,
          ts: Date.now() - (s * 1000),
          session: Date.now(), baseline: true
        });
      }
      saved++;
    }
  });
  DB.set('logs', logs.slice(0, 500));
  DB.set('onboarding-done', true);
  const el = document.getElementById('onboarding-overlay');
  if (el) el.remove();
  toast(`✓ ${saved} exerciții salvate ca baseline`, 'var(--green)');
  renderCoachIdle();
  renderDash();
}

export function skipOnboarding() {
  DB.set('onboarding-done', true);
  const el = document.getElementById('onboarding-overlay');
  if (el) el.remove();
}

