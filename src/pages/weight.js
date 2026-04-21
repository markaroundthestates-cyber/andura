// ══ WEIGHT PAGE ══════════════════════════════════════════════
import { DB, $, tod, fmt } from '../db.js';
import { KCAL_TARGET, PROT_TARGET } from '../constants.js';
import { SYS } from '../engine/sys.js';
import { toast } from '../ui/ui.js';
import { state } from '../state.js';

export let historyShowAll = false;
export let currentKcal = 1800;
export let currentProt = 180;


export function initW(){
  const ws=DB.get('weights')||{};
  const logDate=getLogDate();
  if(ws[logDate]){curW=ws[logDate];return;}
  // Fall back to last known weight as starting point
  const dates=Object.keys(ws).sort();
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
  renderWeight();renderDash();
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
  syncKcalDisplay();
  if (state.logDateOffset === 0 && kcals[today] !== undefined) lockKcal(); else unlockKcal();
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
    el.innerHTML = '<div style="padding:14px 16px;color:var(--text3);font-size:12px">Nicio înregistrare</div>';
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
  currentProt = prots[getLogDate()] !== undefined ? prots[getLogDate()] : PROT_TARGET;
  syncProtDisplay();
  if (state.logDateOffset === 0 && prots[getLogDate()] !== undefined) lockProt(); else unlockProt();
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
      } else if(file.name.includes('Nutrition')) {
        await importMFPNutritionCSV(await file.text());
      } else if(file.name.includes('Measurement')) {
        await importMFPMeasurementCSV(await file.text());
      } else {
        toast('⚠ Selectează ZIP sau CSV din MFP', 'var(--accent2)');
      }
    } catch(err) {
      console.error(err);
      toast('⚠ Eroare la import', 'var(--accent2)');
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
