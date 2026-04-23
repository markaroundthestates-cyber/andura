// ══ WEIGHT PAGE ══════════════════════════════════════════════
import { DB, $, tod, fmt } from '../db.js';
import { KCAL_TARGET, PROT_TARGET } from '../constants.js';
import { SYS } from '../engine/sys.js';
import { toast } from '../ui/ui.js';
import { state } from '../state.js';

export let historyShowAll = false;
export let currentKcal = 1800;
export let currentProt = 180;
export let curW = 0;


export function initW(){
  const ws=DB.get('weights')||{};
  const logDate=getLogDate();
  if(ws[logDate]){curW=ws[logDate];return;}
  // Fall back to last known weight as starting point
  const dates=Object.keys(ws).sort((a,b) => a.localeCompare(b));
  if(dates.length) curW=ws[dates[dates.length-1]];
}

export function renderWeight(){
  syncLogDateUI();
  initW();initKcal();initProt();initWater();initSuppl();syncW();
  // Check if weight already saved today
  const ws=DB.get('weights')||{},dates=Object.keys(ws).sort(),trend=getTrend();
  const todayW=ws[getLogDate()];
  if(todayW&&state.logDateOffset ===0){lockWeight(todayW);}
  else{unlockWeight();}
  const tr=$('wtr2');
  if(tr){
    if(trend===null){tr.className='wtr nt';tr.textContent='— completează câteva zile';}
    else if(trend<-1.2){tr.className='wtr ft';tr.innerHTML=`↓ ${Math.abs(trend).toFixed(2)} kg/7z · Scade rapid → +150 kcal`;}
    else if(trend>0){tr.className='wtr sl';tr.innerHTML=`↑ ${trend.toFixed(2)} kg/7z · Probabil retenție apă — trendul pe 7 zile contează, nu ziua de azi`;}
    else if(trend>-0.3){tr.className='wtr sl';tr.innerHTML=`→ ${Math.abs(trend).toFixed(2)} kg/7z · Prea lent → −100 kcal`;}
    else{tr.className='wtr gd';tr.innerHTML=`↓ ${Math.abs(trend).toFixed(2)} kg/7z · ✅ Pe traseu`;}
  }
  renderUnifiedHistory();
  renderSessionHistory();
  renderDailyDropdown();
  renderSessionsDropdown();
  renderPhotos();
  renderSleepEnergy();
  checkSleepEnergyAlert();
  renderChart();
  renderSuppl();
  checkClosedDay();
}

export function saveW(){
  const ws=DB.get('weights')||{};
  ws[getLogDate()]=curW;DB.set('weights',ws);
  const label=state.logDateOffset ===0?'azi':getLogDateLabel();
  toast(`✓ Greutate salvată (${label})`,'var(--green)');
  if(state.logDateOffset ===0) lockWeight(curW);
  renderWeight();if(window.renderDash)window.renderDash();
}

export function lockWeight(kg){
  const saved=$('weight-saved-state'), edit=$('weight-edit-state');
  const val=$('weight-saved-val');
  if(saved){saved.style.display='flex';}
  if(edit){edit.style.display='none';}
  if(val){val.textContent=kg.toFixed(1)+' kg';}
}

export function unlockWeight(){
  const saved=$('weight-saved-state'), edit=$('weight-edit-state');
  if(saved){saved.style.display='none';}
  if(edit){edit.style.display='block';}
}

export function initKcal() {
  const kcals = DB.get('kcals') || {};
  const today = getLogDate();
  const pilotActive = new Date() >= new Date('2026-07-20');
  const sysTarget = pilotActive ? SYS.getKcalTarget() : KCAL_TARGET;
  currentKcal = kcals[today] !== undefined ? kcals[today] : sysTarget;
  // Don't auto-save default to storage — write only when user explicitly saves.
  // Auto-saving 1800 contaminates history and prevents adminPrefill from showing real data.
  syncKcalDisplay();
  if (state.logDateOffset === 0) lockKcal(); else unlockKcal();
  const noteEl = $('kcal-save-note');
  if (noteEl) {
    if (!pilotActive) {
      const daysLeft = Math.max(0, Math.round((new Date('2026-07-20') - new Date()) / 86400000));
      noteEl.textContent = `Target fix: 1800 kcal până pe 20 iulie (${daysLeft} zile)`;
    } else {
      noteEl.textContent = `🤖 Pilot activ · TDEE real: ${SYS.estimateTDEE()} kcal · ${SYS.getPhase()}`;
      noteEl.style.color = 'var(--accent)';
    }
  }
}

export function syncKcalDisplay() {
  const el = $('kcal-today-display'); if(!el) return;
  el.textContent = currentKcal;
  const diff = currentKcal - KCAL_TARGET;
  const dEl = $('kcal-diff-display');
  if(dEl) {
    if(diff === 0) { dEl.textContent = '= target'; dEl.style.color = 'var(--green)'; }
    else if(diff > 0) { dEl.textContent = `+${diff} kcal`; dEl.style.color = 'var(--accent2)'; }
    else { dEl.textContent = `${diff} kcal`; dEl.style.color = 'var(--accent3)'; }
  }
  el.style.color = diff > 200 ? 'var(--accent2)' : diff < -200 ? 'var(--accent3)' : 'var(--accent)';
}

export function adjKcal(delta) {
  currentKcal = Math.max(800, Math.min(5000, currentKcal + delta));
  syncKcalDisplay();
}

export function setKcalDirect() {
  const v = parseInt($('kcal-direct-input')?.value);
  if (!isNaN(v) && v > 500 && v < 6000) { currentKcal = v; syncKcalDisplay(); }
}

export function saveKcal() {
  const kcals = DB.get('kcals') || {};
  kcals[getLogDate()] = currentKcal;
  DB.set('kcals', kcals);
  if(state.logDateOffset ===0) DB.set('current-kcal', currentKcal);
  const diff = currentKcal - KCAL_TARGET;
  toast(diff === 0 ? '✓ 1800 kcal salvat' : diff > 0 ? `✓ Salvat (+${diff} față de target)` : `✓ Salvat (${diff} față de target)`,
    diff > 200 ? 'var(--accent2)' : 'var(--accent)');
  renderWeight();
  if (state.logDateOffset === 0) lockKcal();
}

export function lockKcal() {
  const btn=$('save-kcal-btn'), saved=$('kcal-saved-state');
  if(btn) btn.style.display='none';
  if(saved) saved.style.display='flex';
}

export function unlockKcal() {
  const btn=$('save-kcal-btn'), saved=$('kcal-saved-state');
  if(btn) btn.style.display='block';
  if(saved) saved.style.display='none';
}

export function renderKcalHistory() { renderUnifiedHistory(); }

export function renderUnifiedHistory() {
  const el = $('unified-history'); if(!el) return;
  const kcals = DB.get('kcals') || {};
  const prots = DB.get('prots') || {};
  const ws = DB.get('weights') || {};

  // Toate datele cu orice dată logată
  const allDates = [...new Set([
    ...Object.keys(kcals),
    ...Object.keys(prots),
    ...Object.keys(ws)
  ])].sort().reverse();

  if (!allDates.length) {
    el.innerHTML = `<div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:24px 20px;text-align:center;margin:4px 0">
      <div style="font-size:32px;margin-bottom:10px">📋</div>
      <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:6px">Nicio înregistrare</div>
      <div style="font-size:12px;color:var(--text3);line-height:1.5">Loghează greutatea, kcal sau proteina pentru a vedea istoricul</div>
    </div>`;
    return;
  }

  const showDates = historyShowAll ? allDates : allDates.slice(0, 7);

  // Header row
  const header = `<div style="display:grid;grid-template-columns:70px 1fr 60px 60px 60px;gap:0 10px;padding:7px 16px;border-bottom:1px solid var(--border);background:var(--bg3)">
    <span style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:1px">DATA</span>
    <span style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:1px">GREUTATE</span>
    <span style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;text-align:right">KCAL</span>
    <span style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;text-align:right">PROT</span>
    <span style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;text-align:right">DIFF</span>
  </div>`;

  const rows = showDates.map((d, i) => {
    const isToday = d === tod();
    const k = kcals[d];
    const p = prots[d];
    const w = ws[d];

    // Greutate cu diff față de ziua anterioară
    const prevDate = allDates[i + 1];
    const prevW = prevDate ? ws[prevDate] : null;
    const wDiff = (w && prevW) ? Math.round((w - prevW) * 10) / 10 : null;
    const wDiffStr = wDiff === null ? '' : (wDiff > 0 ? `+${wDiff.toFixed(1)}` : wDiff.toFixed(1));
    const wDiffColor = wDiff === null ? '' : wDiff < 0 ? 'var(--green)' : wDiff > 0 ? 'var(--red)' : 'var(--text3)';

    // Kcal color bazat pe target-ul din data respectivă
    const kcalTarget = getKcalTargetForDate(d);
    const kdiff = k !== undefined ? k - kcalTarget : null;
    const kc = kdiff === null ? 'var(--text3)' : kdiff > 200 ? 'var(--accent2)' : kdiff < -200 ? 'var(--accent3)' : 'var(--green)';

    // Prot color
    const pc = p !== undefined ? (p >= PROT_TARGET ? 'var(--green)' : 'var(--accent2)') : 'var(--text3)';

    const bg = isToday ? 'background:rgba(200,255,0,0.03);' : '';

    return `<div style="display:grid;grid-template-columns:70px 1fr 60px 60px 60px;align-items:center;gap:0 10px;padding:9px 16px;border-bottom:1px solid var(--border);${bg}">
      <span style="font-size:11px;color:${isToday?'var(--accent)':'var(--text2)'};font-weight:${isToday?'600':'400'}">${isToday?'AZI':fmt(d)}</span>
      <span style="font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:700;color:var(--text)">${w ? w.toFixed(1)+' kg' : '<span style="color:var(--text3)">—</span>'}</span>
      <span style="font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:700;color:${kc};text-align:right">${k !== undefined ? k : '<span style="color:var(--text3)">—</span>'}</span>
      <span style="font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:700;color:${pc};text-align:right">${p !== undefined ? p+'g' : '<span style="color:var(--text3)">—</span>'}</span>
      <span style="font-size:11px;color:${wDiffColor};text-align:right;font-family:'JetBrains Mono',monospace">${wDiffStr}</span>
    </div>`;
  }).join('');

  const footer = !historyShowAll && allDates.length > 7
    ? `<div style="padding:10px 16px;text-align:center;color:var(--text3);font-size:11px">+${allDates.length - 7} zile mai vechi — apasă TOATE</div>`
    : '';

  el.innerHTML = header + rows + footer;
}

export function toggleHistoryAll() {
  historyShowAll = !historyShowAll;
  const btn = $('hist-expand-btn');
  if (btn) btn.textContent = historyShowAll ? 'RESTRÂNGE ▴' : 'TOATE ▾';
  renderUnifiedHistory();
}

export function getKcalTargetForDate(dateStr) {
  // Citește phase-log pentru a ști ce target era activ în data respectivă
  const phaseLogs = DB.get('phase-log') || []; // [{date, phase, kcalTarget}]
  // Sortate desc — găsim primul log cu data <= dateStr
  const sorted = [...phaseLogs].sort((a,b) => b.date.localeCompare(a.date));
  const entry = sorted.find(e => e.date <= dateStr);
  return entry ? entry.kcalTarget : 1800; // default CUT 1800
}

export function initProt() {
  const prots = DB.get('prots') || {};
  const today = getLogDate();
  currentProt = prots[today] !== undefined ? prots[today] : PROT_TARGET;
  // Don't auto-save default to storage — same reason as initKcal.
  syncProtDisplay();
  if (state.logDateOffset === 0) lockProt(); else unlockProt();
}

export function syncProtDisplay() {
  const el = $('prot-display'); if(!el) return;
  const pct = Math.min(100, Math.round(currentProt / PROT_TARGET * 100));
  el.textContent = currentProt;
  const bar = $('prot-bar'); if(bar) { bar.style.width = pct + '%'; bar.style.background = pct >= 100 ? 'var(--green)' : pct >= 80 ? 'var(--accent)' : 'var(--accent2)'; }
  el.style.color = pct >= 100 ? 'var(--green)' : pct >= 80 ? 'var(--accent)' : 'var(--accent2)';
  const dEl = $('prot-diff-display');
  if(dEl) { const diff = currentProt - PROT_TARGET; if(diff >= 0) { dEl.textContent = `✅ ${pct}%`; dEl.style.color = 'var(--green)'; } else { dEl.textContent = `${diff}g față de target`; dEl.style.color = 'var(--accent2)'; } }
}

export function adjProt(d) { currentProt = Math.max(0, Math.min(500, currentProt + d)); syncProtDisplay(); }

export function setProtDirect() {
  const v = parseInt($('prot-input')?.value);
  if (!isNaN(v) && v >= 0 && v < 600) { currentProt = v; syncProtDisplay(); }
}

export function saveProt() {
  const prots = DB.get('prots') || {};
  prots[getLogDate()] = currentProt; DB.set('prots', prots);
  const ok = currentProt >= PROT_TARGET;
  toast(ok ? `✓ ${currentProt}g ✅` : `✓ ${currentProt}g — mai ai ${PROT_TARGET - currentProt}g`, ok ? 'var(--green)' : 'var(--accent2)');
  renderKcalHistory();
  if (state.logDateOffset === 0) lockProt();
}

export function lockProt() {
  const btn=$('save-prot-btn'), saved=$('prot-saved-state');
  if(btn) btn.style.display='none';
  if(saved) saved.style.display='flex';
}

export function unlockProt() {
  const btn=$('save-prot-btn'), saved=$('prot-saved-state');
  if(btn) btn.style.display='block';
  if(saved) saved.style.display='none';
}

export function exportCSV() {
  const ws = DB.get('weights') || {}, kcals = DB.get('kcals') || {}, prots = DB.get('prots') || {}, logs = DB.get('logs') || [];
  const allDates = [...new Set([...Object.keys(ws), ...Object.keys(kcals), ...Object.keys(prots)])].sort();
  let csv = 'DATA,GREUTATE(kg),KCAL,PROTEINA(g)\n';
  allDates.forEach(d => { csv += `${d},${ws[d]||''},${kcals[d]||''},${prots[d]||''}\n`; });
  csv += '\n\nDATA,EXERCITIU,GREUTATE(kg),REPS,RPE\n';
  logs.forEach(l => { csv += `${l.date},"${l.ex}",${l.w||''},${l.reps||''},${l.rpe||''}\n`; });
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `salafull-${tod()}.csv`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  toast('✓ CSV exportat');
}

export function exportJSON() {
  const keys = ['logs','weights','kcals','prots','waters','wellbeing',
    'suppl-list','suppl-taken-v2','step-streaks','steps-today','closed-days',
    'photos','onboarding-done','muted','bf-override','phase-override',
    'current-kcal','aa-cooldown','phase-log'];
  const data = {version: 'salafull-v11', exported: new Date().toISOString()};
  const allKeys = [];
  for(let i=0; i<localStorage.length; i++) allKeys.push(localStorage.key(i));
  allKeys.forEach(k => {
    try { data[k] = JSON.parse(localStorage.getItem(k)); } catch(e) { data[k] = localStorage.getItem(k); }
  });
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `salafull-backup-${tod()}.json`;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
  toast('✓ Backup exportat — trimite fișierul pe telefon', 'var(--green)');
}

export function importJSON() {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = '.json';
  input.onchange = e => {
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        if(!data.version || !data.version.includes('salafull')) {
          toast('⚠ Fișier invalid', 'var(--red)'); return;
        }
        const skip = ['version','exported'];
        let count = 0;
        Object.keys(data).forEach(k => {
          if(skip.includes(k)) return;
          localStorage.setItem(k, JSON.stringify(data[k]));
          count++;
        });
        toast(`✓ ${count} chei importate · Reîncarcă pagina`, 'var(--green)');
        setTimeout(() => location.reload(), 1500);
      } catch(err) {
        toast('⚠ Eroare import: ' + err.message, 'var(--red)');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

async function importMFPNutritionCSV(text) {
  // MFP Nutrition CSV format: Date,Calories,Carbohydrates,Fat,Protein,...
  const lines = text.split('\n').filter(l => l.trim());
  if (!lines.length) { toast('⚠ CSV gol', 'var(--accent2)'); return; }
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g,'').toLowerCase());
  const dateIdx = headers.findIndex(h => h.includes('date'));
  const kcalIdx = headers.findIndex(h => h.includes('calori') || h.includes('kcal'));
  const protIdx = headers.findIndex(h => h.includes('protein'));
  if (dateIdx === -1) { toast('⚠ Nu am găsit coloana Date', 'var(--accent2)'); return; }

  const kcals = DB.get('kcals') || {};
  const prots = DB.get('prots') || {};
  let countK = 0, countP = 0;

  lines.slice(1).forEach(line => {
    const parts = line.split(',').map(p => p.trim().replace(/"/g,''));
    const rawDate = parts[dateIdx];
    if (!rawDate) return;
    // Parse date — MFP uses MM/DD/YYYY or YYYY-MM-DD
    let dateStr = '';
    if (rawDate.includes('/')) {
      const [m,d,y] = rawDate.split('/');
      dateStr = `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
    } else {
      dateStr = rawDate.slice(0,10);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return;
    if (kcalIdx !== -1) {
      const v = parseInt(parts[kcalIdx]);
      if (!isNaN(v) && v > 0) { kcals[dateStr] = v; countK++; }
    }
    if (protIdx !== -1) {
      const v = parseInt(parts[protIdx]);
      if (!isNaN(v) && v >= 0) { prots[dateStr] = v; countP++; }
    }
  });

  if (kcalIdx !== -1) DB.set('kcals', kcals);
  if (protIdx !== -1) DB.set('prots', prots);
  toast(`✓ Import nutriție: ${countK} kcal + ${countP} prot`, 'var(--green)');
  renderWeight();
  if (window.renderDash) window.renderDash();
}

async function importMFPMeasurementCSV(text) {
  // MFP Measurement CSV format: Date,Value,Units
  const lines = text.split('\n').filter(l => l.trim());
  if (!lines.length) { toast('⚠ CSV gol', 'var(--accent2)'); return; }
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g,'').toLowerCase());
  const dateIdx = headers.findIndex(h => h.includes('date'));
  const valIdx = headers.findIndex(h => h.includes('value') || h.includes('weight'));
  if (dateIdx === -1 || valIdx === -1) { toast('⚠ Format CSV invalid', 'var(--accent2)'); return; }

  const ws = DB.get('weights') || {};
  let count = 0;
  lines.slice(1).forEach(line => {
    const parts = line.split(',').map(p => p.trim().replace(/"/g,''));
    const rawDate = parts[dateIdx];
    const rawVal = parts[valIdx];
    if (!rawDate || !rawVal) return;
    let dateStr = '';
    if (rawDate.includes('/')) {
      const [m,d,y] = rawDate.split('/');
      dateStr = `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
    } else {
      dateStr = rawDate.slice(0,10);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return;
    const v = parseFloat(rawVal);
    if (!isNaN(v) && v > 30 && v < 300) { ws[dateStr] = v; count++; }
  });

  DB.set('weights', ws);
  toast(`✓ Import greutăți: ${count} înregistrări`, 'var(--green)');
  renderWeight();
  if (window.renderDash) window.renderDash();
}

async function importMFPZip(file) {
  // ZIP import requires JSZip — not available, show informative message
  toast('⚠ Import ZIP: folosește CSV individual din MFP Export', 'var(--accent2)');
}

export function triggerMFPImport(){
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.zip,.csv';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if(!file) return;
    toast('⏳ Se procesează...', 'var(--accent)');
    try {
      if(file.name.endsWith('.zip')) {
        await importMFPZip(file);
      } else if(file.name.toLowerCase().includes('nutrition')) {
        await importMFPNutritionCSV(await file.text());
      } else if(file.name.toLowerCase().includes('measurement')) {
        await importMFPMeasurementCSV(await file.text());
      } else {
        // Try as nutrition CSV generically
        await importMFPNutritionCSV(await file.text());
      }
    } catch(err) {
      toast('⚠ Eroare la import: ' + err.message, 'var(--accent2)');
    }
  };
  input.click();
}

export function shiftLogDate(delta) {
  const newOffset = state.logDateOffset + delta;
  if (newOffset > 0) return; // can't log future
  if (newOffset < -30) return; // max 30 days back
  state.logDateOffset = newOffset;
  syncLogDateUI();
  renderWeight();
}

export function syncLogDateUI() {
  const lbl = $('log-date-display');
  const fwdBtn = $('log-date-fwd');
  if (lbl) {
    lbl.textContent = getLogDateLabel();
    lbl.style.color = state.logDateOffset === 0 ? 'var(--accent)' : 'var(--accent2)';
  }
  if (fwdBtn) {
    fwdBtn.style.opacity = state.logDateOffset === 0 ? '0.3' : '1';
    fwdBtn.style.pointerEvents = state.logDateOffset === 0 ? 'none' : 'auto';
  }
}

export function getLogDate() {
  const d = new Date();
  d.setDate(d.getDate() + state.logDateOffset);
  return d.toISOString().split('T')[0];
}

export function getLogDateLabel() {
  if (state.logDateOffset === 0) return 'AZI 📅';
  if (state.logDateOffset === -1) return 'IERI 📅';
  const d = new Date();
  d.setDate(d.getDate() + state.logDateOffset);
  return `${d.getDate()}/${d.getMonth()+1}`;
}

export function toggleDatePicker() {
  const wrap = $('date-picker-wrap');
  if (!wrap) return;
  const isVisible = wrap.style.display !== 'none';
  wrap.style.display = isVisible ? 'none' : 'block';
  if (!isVisible) {
    // Set current date in picker
    const input = $('date-picker-input');
    if (input) {
      input.value = getLogDate();
      input.max = tod(); // can't select future
      const minDate = new Date();
      minDate.setDate(minDate.getDate() - 30);
      input.min = minDate.toISOString().split('T')[0];
    }
  }
}

export function onDI(v){const n=parseFloat(v);if(!isNaN(n)&&n>50&&n<250){curW=n;const d=$('wds');if(d)d.textContent=n.toFixed(1);}}

export function adj(delta) {
  curW = Math.round((curW + delta) * 10) / 10;
  const d = $('wds');
  if (d) d.textContent = curW.toFixed(1);
}

export function getTrend() {
  const ws = DB.get('weights') || {};
  const dates = Object.keys(ws).sort().slice(-8);
  if (dates.length < 4) return null;
  const vals = dates.map(d => ws[d]);
  const n = vals.length;
  const sumX = n*(n-1)/2;
  const sumY = vals.reduce((a,b)=>a+b,0);
  const sumXY = vals.reduce((s,v,i)=>s+i*v,0);
  const sumX2 = vals.reduce((s,_,i)=>s+i*i,0);
  const slope = (n*sumXY - sumX*sumY) / (n*sumX2 - sumX*sumX);
  return Math.round(slope * 7 * 100) / 100;
}

export function selectDateFromPicker(val) {
  const today = new Date();
  const selected = new Date(val + 'T00:00:00');
  const diff = Math.round((selected - today) / 86400000);
  if (diff <= 0 && diff >= -30) {
    state.logDateOffset = diff;
    toggleDatePicker();
    renderWeight();
  }
}

let chartRange = 30;

export function setChartRange(days, btn) {
  chartRange = days;
  document.querySelectorAll('.chart-range-btn').forEach(b => { b.style.background='transparent'; b.style.color='var(--text3)'; b.style.borderColor='var(--border)'; });
  if (btn) { btn.style.background='rgba(200,255,0,0.12)'; btn.style.color='var(--accent)'; btn.style.borderColor='var(--accent)'; }
  renderChart();
}

export function savePhoto(input) {
  const file = input.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const photos = DB.get('photos') || [];
    photos.unshift({ date: tod(), src: e.target.result });
    DB.set('photos', photos.slice(0, 20));
    toast('✓ Poză salvată', 'var(--green)');
  };
  reader.readAsDataURL(file);
}

export function setBFOverride() {
  const v = parseFloat(document.getElementById('bf-override-input')?.value);
  if (!isNaN(v) && v > 3 && v < 50) {
    DB.set('bf-override', v);
    window.dispatchEvent(new StorageEvent('storage', { key: 'bf-override', newValue: String(v) }));
    toast('✓ BF% setat: ' + v + '%', 'var(--green)');
  }
}

export function clearBFOverride() {
  localStorage.removeItem('bf-override');
  window.dispatchEvent(new StorageEvent('storage', { key: 'bf-override', newValue: null }));
  toast('✓ BF override șters', 'var(--accent)');
}

// TODO: implement water tracking (currently not shown in UI)
function initWater() {}
// TODO: implement supplement tracking (currently not shown in UI)
function initSuppl() {}
function syncW() {
  // Populate weight input and display with current value if known
  if (curW > 0) {
    const wdEl = $('wds');
    const wdi = $('wdi');
    if (wdEl) wdEl.textContent = curW.toFixed(1);
    if (wdi) wdi.value = curW.toFixed(1);
  }
}
// TODO: render photo grid from 'photos' DB key into #photo-grid
function renderPhotos() {}
// TODO: show visual indicator if day is already closed
function checkClosedDay() {}
// TODO: render sleep/energy wellbeing inputs
function renderSleepEnergy() {}
// TODO: alert if sleep/energy below threshold
function checkSleepEnergyAlert() {}
function renderChart() {
  const canvas = $('weight-chart');
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.offsetWidth || 320;
  const H = 180;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const ws = DB.get('weights') || {};
  let dates = Object.keys(ws).sort();
  if (chartRange > 0) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - chartRange);
    const cutStr = cutoff.toISOString().split('T')[0];
    dates = dates.filter(d => d >= cutStr);
  }
  if (dates.length < 2) {
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.font = '12px DM Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Adaugă cel puțin 2 zile de greutate', W / 2, H / 2);
    return;
  }

  const vals = dates.map(d => ws[d]);
  const minV = Math.min(...vals) - 0.5;
  const maxV = Math.max(...vals) + 0.5;
  const range = maxV - minV || 1;

  const pad = { top: 16, bottom: 24, left: 4, right: 4 };
  const cw = W - pad.left - pad.right;
  const ch = H - pad.top - pad.bottom;

  const toX = i => pad.left + (i / (dates.length - 1)) * cw;
  const toY = v => pad.top + (1 - (v - minV) / range) * ch;

  // gradient fill
  const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + ch);
  grad.addColorStop(0, 'rgba(200,255,0,0.18)');
  grad.addColorStop(1, 'rgba(200,255,0,0)');
  ctx.beginPath();
  ctx.moveTo(toX(0), toY(vals[0]));
  for (let i = 1; i < vals.length; i++) ctx.lineTo(toX(i), toY(vals[i]));
  ctx.lineTo(toX(vals.length - 1), H - pad.bottom);
  ctx.lineTo(toX(0), H - pad.bottom);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // line
  ctx.beginPath();
  ctx.moveTo(toX(0), toY(vals[0]));
  for (let i = 1; i < vals.length; i++) ctx.lineTo(toX(i), toY(vals[i]));
  ctx.strokeStyle = 'rgba(200,255,0,0.85)';
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.stroke();

  // dots at first and last
  [0, vals.length - 1].forEach(i => {
    ctx.beginPath();
    ctx.arc(toX(i), toY(vals[i]), 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgb(200,255,0)';
    ctx.fill();
  });

  // x-axis labels (first and last date)
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '10px JetBrains Mono, monospace';
  ctx.textAlign = 'left';
  const d0 = new Date(dates[0]);
  ctx.fillText(`${d0.getDate()}/${d0.getMonth() + 1}`, pad.left, H - 6);
  const dN = new Date(dates[dates.length - 1]);
  ctx.textAlign = 'right';
  ctx.fillText(`${dN.getDate()}/${dN.getMonth() + 1}`, W - pad.right, H - 6);

  // stats bar
  const statsEl = $('chart-stats');
  if (statsEl) {
    const diff = vals[vals.length - 1] - vals[0];
    const sign = diff > 0 ? '+' : '';
    const col = diff > 0 ? 'var(--accent3)' : 'var(--green)';
    statsEl.innerHTML = `
      <span>${dates.length} zile</span>
      <span style="color:${col};font-weight:700">${sign}${diff.toFixed(1)} kg</span>
      <span>min: ${Math.min(...vals).toFixed(1)} kg</span>
      <span>max: ${Math.max(...vals).toFixed(1)} kg</span>`;
  }
}
// ── FEATURE 4: Dropdown Istoric Zilnic ──────────────────────

export function renderDailyDropdown() {
  const el = $('daily-dropdown-wrap');
  if (!el) return;

  const kcals = DB.get('kcals') || {};
  const prots = DB.get('prots') || {};
  const ws = DB.get('weights') || {};

  const allDates = [...new Set([
    ...Object.keys(ws),
    ...Object.keys(kcals),
    ...Object.keys(prots)
  ])].sort().reverse().slice(0, 30);

  if (!allDates.length) {
    el.innerHTML = '<div style="padding:14px 16px;color:var(--text3);font-size:12px">Nicio înregistrare în ultimele 30 de zile.</div>';
    return;
  }

  el.innerHTML = `<div style="padding:8px 16px 12px">
    <div style="font-size:10px;color:var(--text2);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Selectează ziua</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px">
      ${allDates.map(d => {
        const [, m, day] = d.split('-');
        const isToday = d === tod();
        return `<button onclick="showDayDetail('${d}')"
          style="padding:6px 10px;border-radius:var(--rs);border:1px solid ${isToday ? 'var(--accent)' : 'var(--border)'};
                 background:${isToday ? 'rgba(200,255,0,0.1)' : 'var(--bg3)'};
                 color:${isToday ? 'var(--accent)' : 'var(--text2)'};
                 font-size:11px;font-family:'JetBrains Mono',monospace;cursor:pointer">
          ${day}.${m}${isToday ? ' ★' : ''}
        </button>`;
      }).join('')}
    </div>
  </div>
  <div id="day-detail-panel" style="display:none"></div>`;
}

export function showDayDetail(date) {
  const panel = $('day-detail-panel');
  if (!panel) return;

  const ws = DB.get('weights') || {};
  const kcals = DB.get('kcals') || {};
  const prots = DB.get('prots') || {};
  const wb = DB.get('wellbeing') || {};

  const w = ws[date];
  const k = kcals[date];
  const p = prots[date];
  const well = wb[date] || {};

  const d = new Date(date + 'T12:00:00');
  const dateLabel = d.toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' });

  const kcalTarget = 1800;
  const kc = k !== undefined ? (k > kcalTarget + 200 ? 'var(--accent2)' : k < kcalTarget - 200 ? 'var(--accent3)' : 'var(--green)') : 'var(--text3)';
  const pc = p !== undefined ? (p >= 150 ? 'var(--green)' : 'var(--accent2)') : 'var(--text3)';

  const hasSleep = well.sleep != null && well.sleep > 0;
  const hasEnergy = well.energy != null && well.energy > 0;
  const hasWellbeing = hasSleep || hasEnergy;
  const sleepEmoji = hasSleep ? (['', '😴', '😐', '😊', '⚡', '🔥'][well.sleep] || '—') : '—';
  const energyEmoji = hasEnergy ? (['', '😩', '😐', '🙂', '💪', '🔥'][well.energy] || '—') : '—';

  panel.style.display = 'block';
  panel.innerHTML = `<div style="margin:0 0 0;border-top:1px solid var(--border);padding:16px">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
      <div style="font-size:13px;font-weight:700;color:var(--accent)">${dateLabel}</div>
      <button onclick="closeDayDetail()" style="background:none;border:1px solid var(--border);color:var(--text3);font-size:11px;padding:5px 10px;border-radius:var(--rs);cursor:pointer;font-family:'DM Sans',sans-serif">✕ Închide</button>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div style="background:var(--bg3);border-radius:var(--rs);padding:12px">
        <div style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Greutate</div>
        <div style="font-family:'JetBrains Mono',monospace;font-size:22px;font-weight:700;color:var(--text)">${w !== undefined ? w.toFixed(1) + ' kg' : '—'}</div>
      </div>
      <div style="background:var(--bg3);border-radius:var(--rs);padding:12px">
        <div style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Kcal</div>
        <div style="font-family:'JetBrains Mono',monospace;font-size:22px;font-weight:700;color:${kc}">${k !== undefined ? k : '—'}</div>
      </div>
      <div style="background:var(--bg3);border-radius:var(--rs);padding:12px">
        <div style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Proteină</div>
        <div style="font-family:'JetBrains Mono',monospace;font-size:22px;font-weight:700;color:${pc}">${p !== undefined ? p + 'g' : '—'}</div>
      </div>
      ${hasWellbeing ? `<div style="background:var(--bg3);border-radius:var(--rs);padding:12px">
        <div style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Wellbeing</div>
        <div style="font-size:18px">${sleepEmoji} ${energyEmoji}</div>
        <div style="font-size:10px;color:var(--text3);margin-top:2px">somn · energie</div>
      </div>` : ''}
    </div>
  </div>`;
}

export function closeDayDetail() {
  const panel = $('day-detail-panel');
  if (panel) panel.style.display = 'none';
}

// ── FEATURE 5: Dropdown Sesiuni Recente ─────────────────────

export function renderSessionsDropdown() {
  const el = $('sessions-dropdown-wrap');
  if (!el) return;

  const logs = DB.get('logs') || [];
  const burns = DB.get('session-burns') || [];

  const sessMap = {};
  logs.filter(l => !l.baseline).forEach(l => {
    const key = l.session != null ? String(l.session) : ('date:' + l.date);
    if (!sessMap[key]) sessMap[key] = [];
    sessMap[key].push(l);
  });

  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 14);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const PUSH_EX = ['bench press', 'overhead press', 'incline press', 'chest', 'tricep', 'shoulder', 'dip', 'pec'];
  const PULL_EX = ['row', 'pull-up', 'pulldown', 'lat', 'bicep', 'curl', 'deadlift', 'back'];
  const LEG_EX  = ['squat', 'leg press', 'lunge', 'calf', 'hamstring', 'quad', 'glute', 'rdl', 'hip'];

  function detectWorkoutType(exList) {
    const lower = exList.filter(Boolean).map(e => e.toLowerCase());
    let push = 0, pull = 0, leg = 0;
    lower.forEach(e => {
      if (PUSH_EX.some(k => e.includes(k))) push++;
      if (PULL_EX.some(k => e.includes(k))) pull++;
      if (LEG_EX.some(k => e.includes(k))) leg++;
    });
    if (leg >= push && leg >= pull && leg > 0) return 'LEG';
    if (push > pull) return 'PUSH';
    if (pull > push) return 'PULL';
    if (push > 0 || pull > 0) return 'PPL';
    return null;
  }

  const sessions = Object.entries(sessMap)
    .filter(([, sets]) => sets.length >= 1 || sets.some(l => l.earlyStop))
    .map(([key, sets]) => {
      const isDateKey = key.startsWith('date:');
      const ts = isDateKey ? new Date(sets[0].date).getTime() : Number(key);
      const date = sets[0].date;
      const realSets = sets.filter(s => s.ex !== '__early_stop__');
      const exNames = [...new Set(realSets.map(s => s.ex || s.exercise).filter(Boolean))];
      const exCount = exNames.length;
      const hasEarlyStop = sets.some(l => l.earlyStop);
      const burn = burns.find(b => b.date === date);
      const wType = detectWorkoutType(exNames);
      return { key, ts, date, sets: realSets.length, exCount, mins: burn?.mins ?? null, earlyStop: hasEarlyStop, wType, day: burn?.day ?? null };
    })
    .filter(s => s.date >= cutoffStr)
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 14);

  if (!sessions.length) {
    el.innerHTML = `<div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:24px 20px;text-align:center;margin:4px 0">
      <div style="font-size:32px;margin-bottom:10px">🏋️</div>
      <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:6px">Nicio sesiune în ultimele 14 zile</div>
      <div style="font-size:12px;color:var(--text3);line-height:1.5">Completează primul antrenament pentru a vedea istoricul</div>
    </div>`;
    return;
  }

  const typeColor = { PUSH: 'var(--accent)', PULL: 'var(--accent2)', LEG: 'var(--green)', PPL: 'var(--purple)' };
  const listHtml = sessions.map((s, i) => {
    const d = new Date(s.date);
    const dateStr = `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear().toString().slice(2)}`;
    const minsStr = s.mins !== null ? ` · ${s.mins} min` : '';
    const typeTag = s.wType ? `<span style="font-size:9px;font-weight:700;color:${typeColor[s.wType]||'var(--text3)'};background:${typeColor[s.wType]||'var(--text3)'}18;padding:1px 5px;border-radius:3px;margin-left:4px">${s.wType}</span>` : '';
    const dayTag = s.day ? `<span style="font-size:9px;color:var(--text3);margin-left:4px">${s.day}</span>` : '';
    return `<button onclick="showSessionDetail(${s.ts})"
      style="display:flex;align-items:center;gap:12px;width:100%;padding:11px 16px;
             ${i < sessions.length-1 ? 'border-bottom:1px solid var(--border)' : ''};
             background:transparent;border:none;cursor:pointer;text-align:left">
      <div style="font-size:13px;color:var(--text3);font-family:'JetBrains Mono',monospace;min-width:52px">${dateStr}</div>
      <div style="flex:1">
        <div style="font-size:12px;font-weight:600;color:var(--text);display:flex;align-items:center;flex-wrap:wrap;gap:2px">${s.exCount} ex · ${s.sets} sets${minsStr}${s.earlyStop ? ' · <span style="color:var(--accent2)">stop</span>' : ''}${typeTag}${dayTag}</div>
      </div>
      <div style="font-size:16px;color:var(--text3)">›</div>
    </button>`;
  }).join('');

  el.innerHTML = `<div id="sessions-list-view">${listHtml}</div><div id="session-detail-view" style="display:none"></div>`;
}

export function showSessionDetail(sessionTs) {
  const listView = $('sessions-list-view');
  const detailView = $('session-detail-view');
  if (!listView || !detailView) return;

  const logs = DB.get('logs') || [];
  const tsNum = Number(sessionTs);

  // Match by session timestamp or by date if old logs
  let sessionLogs = logs.filter(l => !l.baseline && (
    l.session === tsNum || String(l.session) === String(tsNum)
  ));

  // If no match by session, try matching date for old logs (dateKey sessions)
  if (!sessionLogs.length) {
    // sessionTs might be a date-based timestamp — find date-keyed entries
    const dateObj = new Date(tsNum);
    const dateStr = dateObj.toISOString().split('T')[0];
    sessionLogs = logs.filter(l => !l.baseline && l.date === dateStr && l.session == null);
  }

  if (!sessionLogs.length) {
    detailView.innerHTML = '<div style="padding:14px 16px;color:var(--text3);font-size:12px">Nicio dată pentru această sesiune.</div>';
  } else {
    const date = sessionLogs[0].date;
    const d = new Date(date);
    const dateLabel = d.toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' });
    const exGroups = {};
    sessionLogs.forEach(l => {
      if (!exGroups[l.ex]) exGroups[l.ex] = [];
      exGroups[l.ex].push(l);
    });

    const rowsHtml = Object.entries(exGroups).map(([ex, sets]) =>
      sets.map((s, i) => {
        const rpeColor = s.rpe >= 9 ? 'var(--red)' : s.rpe <= 6 ? 'var(--accent3)' : 'var(--green)';
        return `<div style="display:flex;align-items:center;gap:12px;padding:9px 16px;border-bottom:1px solid var(--border)">
          <div style="flex:1">
            <div style="font-size:12px;font-weight:${i===0?'700':'400'};color:${i===0?'var(--text)':'var(--text2)'}">${i===0?ex:'↳'}</div>
            <div style="font-size:11px;color:var(--text3);font-family:'JetBrains Mono',monospace">Set ${i+1}</div>
          </div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:700;color:var(--accent)">${s.w||'—'} kg</div>
          <div style="font-size:12px;color:var(--text2);min-width:36px;text-align:right">×${s.reps||'—'}</div>
          ${s.rpe ? `<div style="font-size:11px;font-weight:700;color:${rpeColor};min-width:32px;text-align:right">RPE ${s.rpe}</div>` : ''}
        </div>`;
      }).join('')
    ).join('');

    detailView.innerHTML = `<div>
      <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid var(--border)">
        <button onclick="hideSessionDetail()" style="background:none;border:1px solid var(--border);color:var(--text2);padding:6px 12px;border-radius:var(--rs);cursor:pointer;font-size:12px;font-family:'DM Sans',sans-serif">← Înapoi</button>
        <div style="font-size:13px;font-weight:700;color:var(--accent)">${dateLabel}</div>
      </div>
      ${rowsHtml}
    </div>`;
  }

  listView.style.display = 'none';
  detailView.style.display = 'block';
}

export function hideSessionDetail() {
  const listView = $('sessions-list-view');
  const detailView = $('session-detail-view');
  if (listView) listView.style.display = 'block';
  if (detailView) detailView.style.display = 'none';
}

// TODO: render supplement checklist from 'suppl-list' DB key
function renderSuppl() {}

function renderSessionHistory() {
  const el = $('session-history'); if (!el) return;
  const logs = DB.get('logs') || [];
  const burns = DB.get('session-burns') || [];
  const ratings = DB.get('session-ratings') || [];

  // Group logs by session timestamp; fall back to date for old logs without session field
  const sessMap = {};
  logs.filter(l => !l.baseline).forEach(l => {
    const key = l.session != null ? String(l.session) : ('date:' + l.date);
    if (!sessMap[key]) sessMap[key] = [];
    sessMap[key].push(l);
  });

  const sessions = Object.entries(sessMap)
    .map(([key, sets]) => {
      const isDateKey = key.startsWith('date:');
      const ts = isDateKey ? new Date(sets[0].date).getTime() : Number(key);
      const date = sets[0].date;
      const realSets = sets.filter(s => s.ex !== '__early_stop__');
      // Group by exercise name for distinct exercise count + per-exercise details
      const byExercise = {};
      for (const log of realSets) {
        const name = log.exercise || log.ex;
        if (!name) continue;
        if (!byExercise[name]) byExercise[name] = [];
        byExercise[name].push(log);
      }
      const exCount = Object.keys(byExercise).length;
      const setCount = realSets.length;
      const burn = burns.find(b => b.date === date);
      const rating = isDateKey ? null : ratings.find(r => r.session === Number(key));
      return { ts, date, sets: setCount, exCount, byExercise,
        mins: burn?.mins ?? null,
        day: burn?.day ?? null,
        rating: rating?.rating ?? null };
    })
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 5);

  if (!sessions.length) {
    el.innerHTML = `<div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:24px 20px;text-align:center;margin:4px 0">
      <div style="font-size:32px;margin-bottom:10px">💪</div>
      <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:6px">Nicio sesiune înregistrată</div>
      <div style="font-size:12px;color:var(--text3);line-height:1.5">Antrenamentele tale vor apărea aici după primul workout</div>
    </div>`;
    return;
  }

  const ratingLabel = { easy: '⚡ Ușoară', normal: '👍 Normală', hard: '💀 Grea' };
  const ratingColor = { easy: 'var(--green)', normal: 'var(--accent)', hard: 'var(--red)' };

  el.innerHTML = sessions.map(s => {
    const d = new Date(s.date);
    const dateStr = d.toLocaleDateString('ro-RO', { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' });
    const minsStr = s.mins !== null ? `${s.mins} min` : null;
    const rl = s.rating ? ratingLabel[s.rating] : null;
    const rc = s.rating ? ratingColor[s.rating] : 'var(--text3)';
    const typePart = s.day ? ` · ${s.day}` : '';
    const ratePart = rl ? ` · <span style="color:${rc};font-weight:700">${rl}</span>` : '';
    const summary = `${dateStr}${typePart} · ${s.exCount} ex · ${s.sets} seturi${minsStr ? ' · ' + minsStr : ''}${ratePart}`;

    const exDetails = Object.entries(s.byExercise).map(([name, exSets]) => {
      const best = exSets.reduce((best, cur) => (cur.w || cur.kg || 0) > (best.w || best.kg || 0) ? cur : best, exSets[0]);
      const kg = best.w || best.kg || '?';
      const reps = best.reps || best.r || '?';
      return `<div style="display:flex;justify-content:space-between;font-size:11px;padding:3px 0;border-bottom:1px solid var(--border)">
        <span style="color:var(--text2)">${name}</span>
        <span style="font-family:'JetBrains Mono',monospace;color:var(--accent)">${kg}kg×${reps} <span style="color:var(--text3)">(${exSets.length} set${exSets.length>1?'uri':''})</span></span>
      </div>`;
    }).join('');

    return `<details style="border-bottom:1px solid var(--border)">
      <summary style="display:flex;align-items:center;padding:11px 16px;cursor:pointer;list-style:none;gap:8px">
        <span style="flex:1;font-size:12px;color:var(--text)">${summary}</span>
        <span style="font-size:14px;color:var(--text3)">›</span>
      </summary>
      <div style="padding:8px 16px 12px;background:var(--bg2)">${exDetails || '<div style="font-size:11px;color:var(--text3)">Nicio exerciție înregistrată</div>'}</div>
    </details>`;
  }).join('');
}
