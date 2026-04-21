// ══ PLAN PAGE ════════════════════════════════════════════════
import { DB, $, tod } from '../db.js';
import { PROG, KCAL_TARGET } from '../constants.js';
import { SYS } from '../engine/sys.js';
import { calculateFatigueScore } from '../engine/fatigue.js';
import { getDisplayTime } from './coach.js';
import { toast } from '../ui/ui.js';
import { renderUnifiedHistory } from './weight.js';

const dayColors = {
  'Marți':   {bg:'rgba(10,132,255,0.06)', border:'rgba(10,132,255,0.2)',  text:'rgba(10,132,255,0.9)'},
  'Miercuri':{bg:'rgba(200,255,0,0.06)',  border:'rgba(200,255,0,0.2)',   text:'rgba(200,255,0,0.9)'},
  'Joi':     {bg:'rgba(255,149,0,0.06)',  border:'rgba(255,149,0,0.2)',   text:'rgba(255,149,0,0.9)'},
  'Vineri':  {bg:'rgba(48,209,88,0.06)',  border:'rgba(48,209,88,0.2)',   text:'rgba(48,209,88,0.9)'},
  'Sâmbătă': {bg:'rgba(191,90,242,0.06)',border:'rgba(191,90,242,0.2)', text:'rgba(191,90,242,0.9)'},

};

export function renderPlan() {
  const bf = SYS.getBF();
  const phase = SYS.getPhase();
  const kg = SYS.getCurrentKg();
  const lbm = SYS.getLBM();
  const tdee = SYS.estimateTDEE();
  const kcal = SYS.getKcalTarget();
  const now = new Date();

  // Date
  $('plan-date').textContent = now.toLocaleDateString('ro-RO', {weekday:'long', day:'numeric', month:'long'});

  // Phase banner
  const phaseConfig = {
    CUT: {color:'var(--accent3)', detail:`BF ${bf}% → obiectiv vară · Deficit caloric activ`},
    BULK: {color:'var(--accent3)', detail:`BF ${bf}% → creștere masă musculară · Surplus controlat`},
    MAINTENANCE: {color:'var(--green)', detail:`BF ${bf}% → menții masa musculară · Sezon vară`},
    STRENGTH: {color:'var(--purple)', detail:`Focus forță · Volum redus, intensitate crescută`}
  };
  const pc = phaseConfig[phase] || phaseConfig.CUT;
  $('phase-banner').style.borderColor = pc.color;
  $('phase-name').style.color = pc.color;
  $('phase-name').textContent = phase;
  $('phase-detail').textContent = pc.detail;

  // Stats — BF% color: verde<15, albastru 15-20, portocaliu 20-25, rosu>25
  const bfColor = bf >= 30 ? 'var(--red)' : bf >= 25 ? 'var(--accent2)' : bf >= 18 ? 'var(--accent3)' : 'var(--green)';
  const bfEl = $('bf-display');
  if(bfEl) { bfEl.textContent = bf.toFixed(1); bfEl.style.color = bfColor; }
  $('kcal-display').textContent = kcal;
  $('tdee-display').textContent = tdee;
  $('lbm-display').textContent = lbm;

  // Protein status in plan - use fresh data each render
  const prots = DB.get('prots') || {};
  const todProt = prots[tod()] || 0;
  // Remove existing prot-plan-box first
  document.querySelectorAll('#prot-plan-box').forEach(el => el.remove());
  $('kcal-display').parentElement.insertAdjacentHTML('afterend', `
    <div style="background:var(--card);border:1px solid ${todProt>=180?'rgba(48,209,88,0.3)':'var(--border)'};border-radius:var(--r);padding:14px;position:relative;overflow:hidden;margin-bottom:0" id="prot-plan-box">
      <div style="position:absolute;top:0;left:0;right:0;height:2px;background:${todProt>=180?'var(--green)':'var(--text3)'}"></div>
      <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Proteină azi</div>
      <div style="font-family:'Bebas Neue',sans-serif;font-size:36px;color:${todProt>=180?'var(--green)':todProt>0?'var(--accent3)':'var(--text3)'}">${todProt||'—'}</div>
      <div style="font-size:10px;color:var(--text2);margin-top:2px">g / target 180g</div>
    </div>`);

  // BF override status
  const bfOvr = DB.get('bf-override');
  $('bf-override-note').textContent = bfOvr
    ? `✅ Override activ: ${bfOvr}% (setat manual)`
    : 'Sistemul estimează automat. Corectează dacă realitatea diferă.';
  if (bfOvr) $('bf-override-input').value = bfOvr;

  // Active phase button
  document.querySelectorAll('.phase-btn').forEach(btn => {
    btn.classList.toggle('active-phase', btn.dataset.phase === (DB.get('phase-override')||''));
  });

  // Checkpoints
  const checkpoints = SYS.getCheckpoints();
  $('checkpoints-list').innerHTML = checkpoints.map(cp => `
    <div class="checkpoint-item ${cp.type}" style="border-left-color:${cp.color}">
      <div class="ci-left">
        <div class="ci-label">${cp.label}</div>
        <div class="ci-sub">${cp.sub || ''} · ${SYS.fmtDate(cp.date)}</div>
      </div>
      <div class="ci-right">
        <div class="ci-weeks" style="color:${cp.color}">${cp.weeks}</div>
        <div class="ci-weeks-lbl">săptămâni</div>
      </div>
    </div>`).join('') || '<div style="color:var(--text3);font-size:12px;padding:8px 0">Toate checkpoints-urile atinse ✅</div>';

  // Timeline
  const timeline = SYS.getTimeline();
  $('season-timeline').innerHTML = `<div style="background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:14px 16px">
    ${timeline.map(t => {
      const colors = {cut:'var(--accent2)', summer:'var(--accent)', bulk:'var(--accent3)'};
      return `<div class="tl-item">
        <div class="tl-dot ${t.status}" style="${t.status==='current'?`background:${colors[t.type]};box-shadow:0 0 8px ${colors[t.type]}44`:''}"></div>
        <div class="tl-content">
          <div class="tl-label" style="color:${t.status==='past'?'var(--text3)':t.status==='current'?colors[t.type]:'var(--text)'}">${t.label}${t.status==='current'?' ← ACUM':''}</div>
          <div class="tl-date">${SYS.fmtDate(t.date)} – ${SYS.fmtDate(t.endDate)}</div>
        </div>
      </div>`;
    }).join('')}
  </div>`;


}

export function renderProg(){
  const pc=$('pc');if(!pc)return;

  // Muscle group emoji map
  const muscleEmoji = {
    'spate': '🔙', 'piept': '💪', 'umeri': '🔝',
    'brate': '💪', 'triceps': '💪', 'picioare': '🦵',
    'core': '⚡', 'umeri+brate': '🔝'
  };

  // Day colors — consistent per day
  const dayColors = {
    'Luni':    {bg:'rgba(80,80,80,0.15)', border:'rgba(120,120,120,0.3)', text:'var(--text3)'},
    'Marți':   {bg:'rgba(0,212,255,0.08)', border:'rgba(0,212,255,0.25)', text:'var(--accent3)'},
    'Miercuri':{bg:'rgba(200,255,0,0.08)', border:'rgba(200,255,0,0.25)', text:'var(--accent)'},
    'Joi':     {bg:'rgba(191,90,242,0.08)', border:'rgba(191,90,242,0.25)', text:'var(--purple)'},
    'Vineri':  {bg:'rgba(255,107,53,0.08)', border:'rgba(255,107,53,0.25)', text:'var(--accent2)'},
    'Sâmbătă': {bg:'rgba(48,209,88,0.08)', border:'rgba(48,209,88,0.25)', text:'var(--green)'},
    'Duminică':{bg:'rgba(80,80,80,0.15)', border:'rgba(120,120,120,0.3)', text:'var(--text3)'},
  };

  pc.innerHTML=PROG.map(day=>{
    const col = dayColors[day.day] || {bg:'var(--card)', border:'var(--border)', text:'var(--text2)'};
    if(day.t==='off') return `
      <div style="margin:0 16px 10px;background:${col.bg};border:1px solid ${col.border};border-radius:var(--r);padding:12px 16px">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:13px;letter-spacing:1.5px;color:${col.text};margin-bottom:4px">😴 ${day.day} — OFF</div>
        <div style="font-size:12px;color:var(--text3)">Recuperare activă · Mobilitate · Stretching</div>
      </div>`;
    // Folosește getDisplayTime (același ca Coach) — afișează timp adaptiv real, nu hardcodat
    const displayTime = getDisplayTime(day);
    return `
      <div style="margin:0 16px 10px">
        <div style="background:${col.bg};border:1px solid ${col.border};border-radius:var(--rs);padding:8px 14px;margin-bottom:6px;display:inline-flex;align-items:center;gap:8px">
          <span style="font-family:'Bebas Neue',sans-serif;font-size:13px;letter-spacing:1.5px;color:${col.text}">${day.day} · ${day.lb}</span>
          ${displayTime?`<span style="font-size:10px;color:var(--text3)">· ${displayTime}</span>`:''}
        </div>
        <div class="el">${day.ex.map(e=>{
          const emoji = muscleEmoji[e.g] || '💪';
          return `<div class="ei"><span style="font-size:14px;margin-right:6px">${emoji}</span><div class="en">${cleanEx(e.n)}</div><div class="es2">${e.s}</div></div>`;
        }).join('')}</div>
      </div>`;
  }).join('');
}

export function setPhaseOverride(phase) {
  DB.set('phase-override', phase);
  // Logăm schimbarea de fază cu data și kcalTarget — pentru culori corecte în istoric
  const today = tod();
  const phaseLogs = DB.get('phase-log') || [];
  // Calculăm kcalTarget temporar (după ce setăm override-ul)
  const tdee = SYS.estimateTDEE();
  const kcalMap = { CUT: Math.round(tdee*0.82), BULK: Math.round(tdee*1.08), MAINTENANCE: tdee, STRENGTH: Math.round(tdee*1.05) };
  const kcalTarget = kcalMap[phase] || 1800;
  // Înlocuim sau adăugăm entry pentru azi
  const filtered = phaseLogs.filter(e => e.date !== today);
  filtered.push({ date: today, phase, kcalTarget });
  DB.set('phase-log', filtered);
  toast(`✓ Fază setată: ${phase} · ${kcalTarget} kcal`);
  renderPlan();
  renderDash();
  renderUnifiedHistory();
}

export function clearPhaseOverride() {
  DB.set('phase-override', null);
  // La revenire pe AUTO, logăm target-ul 1800 (CUT fix până pe 20 iulie)
  const today = tod();
  const phaseLogs = DB.get('phase-log') || [];
  const filtered = phaseLogs.filter(e => e.date !== today);
  filtered.push({ date: today, phase: 'AUTO', kcalTarget: 1800 });
  DB.set('phase-log', filtered);
  toast('✓ Fază setată: AUTO · 1800 kcal');
  renderPlan();
  renderDash();
  renderUnifiedHistory();
}

