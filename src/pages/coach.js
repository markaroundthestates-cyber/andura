// ══ COACH PAGE ══════════════════════════════════════════════
import './coach/state.js';
import { sessionCache, getCachedDirector, setCachedDirector, wakeLockRef, uiToggleFlags } from './coach/state.js';
import { formatSetsReps, getGroupColor, getExGroup, isInCutPhase,
         getDisplayTime, calcAccurateTime, getAdaptiveTime,
         getTodayExercises, beepStart, resetNotes } from './coach/util.js';
export { getGroupColor, getExGroup, getDisplayTime, calcAccurateTime,
         getAdaptiveTime, getTodayExercises, resetNotes } from './coach/util.js';
import { extractAndSavePRs, cleanFakeLogs, renderPRWall, togglePRWall as _togglePRWall } from './coach/pr.js';
export { extractAndSavePRs, cleanFakeLogs, renderPRWall } from './coach/pr.js';
import { getSmartPause, startPause, stopPause, skipPause as _skipPause,
         setupInactivity, teardownInactivity } from './coach/restTimer.js';
export { skipPause } from './coach/restTimer.js';
import { updateExCard, setDone, confirmReps, selectRPE,
         adjSessionReps, renderSessLog, editSessionKg,
         adjSessionKg, confirmSessionKg, confirmEditKg, toggleMute } from './coach/logging.js';
export { updateExCard, setDone, confirmReps, selectRPE,
         adjSessionReps, renderSessLog, editSessionKg,
         adjSessionKg, confirmSessionKg, confirmEditKg, toggleMute } from './coach/logging.js';
import { DB, $, tod, cleanEx } from '../db.js';
import { syncToFirebase } from '../firebase.js';
import { PROG, EX_SETS, COMPOUND_EX, PAUSE_COMPOUND, PAUSE_ISO } from '../constants.js';
import { DP } from '../engine/dp.js';
import { AA } from '../engine/aa.js';
import { SYS } from '../engine/sys.js';
import { toast, beep, beepDone, beepAlert, speak, showCoachFlash, showFlashFeedback, showPauseScreen, hidePauseScreen } from '../ui/ui.js';
import { state } from '../state.js';
import { calculateFatigueScore } from '../engine/fatigue.js';
import { getTodayReadiness, saveReadiness, getReadinessVerdict, getReadinessScore, READINESS_LABELS } from '../engine/readiness.js';
import { getMuscleState, getMuscleBalance, EXERCISE_MUSCLES } from '../engine/muscleMap.js';
import { analyzeAndApplyPatterns } from '../engine/patternLearning.js';
import { coachDirector } from '../engine/coachDirector.js';
import { filterValidLogs } from '../util/logFilter.js';

// ── Feature 2: Auto-Save Session Draft ───────────────────────
function saveDraft() {
  if (!state.sessActive || !state.sessStart) return;
  DB.set('session-draft', {
    date: tod(),
    sessStart: state.sessStart,
    sessLog: [...state.sessLog],
    currentEx: state.currentEx,
    currentSet: state.currentSet,
    timestamp: Date.now()
  });
}
function clearDraft() { localStorage.removeItem('session-draft'); }

// ── Feature 4: Smart Session Memory Card ─────────────────────
function renderLastSessionMemory(dayLabel) {
  const logs = DB.get('logs') || [];
  const burns = DB.get('session-burns') || [];
  const ratings = DB.get('session-ratings') || [];
  const today = tod();
  const sessMap = {};
  logs.filter(l => !l.baseline && l.session).forEach(l => {
    const key = String(l.session);
    if (!sessMap[key]) sessMap[key] = [];
    sessMap[key].push(l);
  });
  const sameDaySessions = Object.entries(sessMap)
    .filter(([, sets]) => {
      const date = sets[0]?.date;
      const burn = burns.find(b => b.date === date);
      return burn && burn.day === dayLabel && date !== today;
    })
    .map(([key, sets]) => ({
      ts: Number(key),
      date: sets[0].date,
      sets: sets.filter(s => s.ex !== '__early_stop__'),
      rating: ratings.find(r => r.session === Number(key))?.rating
    }))
    .sort((a, b) => b.ts - a.ts);
  const last = sameDaySessions[0];
  if (!last || !last.sets.length) return '';
  const exMap = {};
  last.sets.forEach(s => { if (!exMap[s.ex] || s.kg > exMap[s.ex].kg) exMap[s.ex] = s; });
  const top3 = Object.values(exMap).sort((a, b) => b.kg - a.kg).slice(0, 3);
  const validRPE = last.sets.filter(s => s.rpe);
  const avgRPE = validRPE.length ? validRPE.reduce((a, s) => a + s.rpe, 0) / validRPE.length : 0;
  const ratingLbl = { easy: '⚡ Ușoară', normal: '👍 Normală', hard: '💀 Grea' };
  const verdict = last.rating ? ratingLbl[last.rating] : (avgRPE > 8.5 ? '💀 Grea' : avgRPE < 7 ? '⚡ Ușoară' : '👍 Normală');
  const d = new Date(last.date);
  const dateStr = d.toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' });
  return `<div id="session-memory-card" style="margin:0 16px 12px;background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:14px 16px;position:relative">
    <button onclick="document.getElementById('session-memory-card').remove()"
      style="position:absolute;top:8px;right:10px;background:none;border:none;color:var(--text3);font-size:16px;cursor:pointer;line-height:1;padding:2px 6px">✕</button>
    <div style="font-size:10px;color:var(--accent);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px">ULTIMA SESIUNE · ${dayLabel.toUpperCase()}</div>
    <div style="font-size:11px;color:var(--text2);margin-bottom:8px">${dateStr}</div>
    ${top3.map(s => `<div style="font-size:12px;color:var(--text);margin-bottom:3px">· ${s.ex} <span style="font-family:'JetBrains Mono',monospace;color:var(--accent)">${s.kg}kg×${s.reps||'?'}</span></div>`).join('')}
    <div style="margin-top:8px;display:flex;align-items:center;gap:12px">
      ${avgRPE > 0 ? `<span style="font-size:11px;color:var(--text3)">RPE: <span style="color:var(--text2)">${avgRPE.toFixed(1)}</span></span>` : ''}
      <span style="font-size:11px;font-weight:600;color:var(--accent2)">${verdict}</span>
    </div>
  </div>`;
}

export function toggleExList(dayIdx) {
  uiToggleFlags.exListExpanded[dayIdx] = !uiToggleFlags.exListExpanded[dayIdx];
  renderCoachIdle();
}

function renderFatigueScore(elId) {
  const el = $(elId); if (!el) return;
  const f = calculateFatigueScore();
  el.style.display = 'block';
  el.innerHTML = `<span style="color:${f.color};font-size:11px;font-weight:600">${f.icon||''} ${f.label}</span><div style="font-size:10px;color:var(--text3);margin-top:2px">${f.detail}</div>`;
}
// TODO: render alerts into #today-alerts element (coach page)
function renderTodayAlerts() {}
// TODO: update session clock (#sess-clock) and kcal (#sess-kcal) every second
function tickSess() {}


export async function renderCoachIdle(){
  const dayMap=[6,0,1,2,3,4,5];
  const tp=PROG[dayMap[new Date().getDay()]];
  const now=new Date();
  const dateStr=now.toLocaleDateString('ro-RO',{weekday:'long',day:'numeric',month:'long'});
  const today=tod();

  // ── Header ──
  const cmdEl=$('today-cmd'), timeEl=$('today-time'), startBtn=$('btn-start-main');
  if(!cmdEl)return;
  cmdEl.style.transition='color .3s';

  if(tp.t==='off'){
    // OFF day
    cmdEl.textContent='OFF – RECUPERARE';
    cmdEl.style.color='var(--text2)';
    if(timeEl)timeEl.textContent=dateStr;
    if(startBtn)startBtn.style.display='none';

    // Quest steps
    const quest=SYS.getOffDayQuest();
    const qPct=Math.min(100,Math.round((quest.stepsToday||0)/8000*100));
    const _tpl=$('today-preview-list');if(_tpl)_tpl.innerHTML=`
      <div style="margin:0 16px 12px;background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:18px 16px">
        <div style="font-size:11px;color:var(--purple);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px">🚶 OBIECTIVUL DE AZI</div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <div style="font-family:'Bebas Neue',sans-serif;font-size:40px;color:var(--purple);line-height:1">${(quest.stepsToday||0).toLocaleString()}</div>
          <div style="text-align:right">
            <div style="font-size:11px;color:var(--text2)">target: 8.000 pași</div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:13px;color:${qPct>=100?'var(--green)':'var(--text3)'}">${qPct}%</div>
          </div>
        </div>
        <div style="height:6px;background:var(--bg3);border-radius:3px;overflow:hidden;margin-bottom:12px">
          <div style="height:100%;width:${qPct}%;background:var(--purple);border-radius:3px;transition:width .5s"></div>
        </div>
        <div style="display:flex;gap:8px">
          <input type="number" id="steps-quick-input" placeholder="introdu pași" inputmode="numeric"
            style="flex:1;background:var(--bg3);border:1px solid var(--border);border-radius:var(--rs);padding:10px 12px;color:var(--text);font-size:16px;font-family:'DM Sans',sans-serif;outline:none"
            value="${quest.stepsToday||''}"/>
          <button onclick="saveStepsQuick()" style="background:var(--purple);color:#fff;font-weight:700;font-size:13px;padding:10px 16px;border:none;border-radius:var(--rs);cursor:pointer">SAVE</button>
        </div>
        <div style="margin-top:10px;font-size:11px;color:var(--text3);display:flex;gap:16px;font-family:'JetBrains Mono',monospace">
          <span>🔥 Streak: <span style="color:var(--purple)">${quest.streak}</span></span>
          <span>Total: <span style="color:var(--purple)">${quest.totalDays}</span> zile</span>
        </div>
      </div>
      <div style="margin:0 16px 12px;background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:14px 16px;text-align:center">
        <div style="font-size:12px;color:var(--text2)">😴 Recuperare activă · Mobilitate · Stretching</div>
      </div>`;
  } else {
    // WORKOUT day
    const todayR = getTodayReadiness();

    // Construieste sesiunea prin Director — sursă unică de adevăr
    let _dirSession = sessionCache.get();
    if (!_dirSession) {
      try {
        _dirSession = await coachDirector.buildSession(tp.t.toUpperCase());
        sessionCache.set(_dirSession);
      } catch(e) {
        _dirSession = null;
        sessionCache.invalidate();
      }
    }
    setCachedDirector(_dirSession);
    // Zi de odihnă forțată de Director (readiness < 40)
    if (_dirSession?.restDay) {
      cmdEl.textContent = 'ZI DE ODIHNĂ';
      cmdEl.style.color = 'var(--text2)';
      if(startBtn) startBtn.style.display='none';
      const _tplOff=$('today-preview-list');
      if(_tplOff) _tplOff.innerHTML=`<div style="margin:0 16px 12px;background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:18px 16px;text-align:center"><div style="font-size:28px;margin-bottom:8px">🛌</div><div style="font-size:14px;font-weight:600;color:var(--text2)">Zi de odihnă recomandată</div><div style="font-size:12px;color:var(--text3);margin-top:6px">${_dirSession.message}</div></div>`;
      return;
    }

    cmdEl.textContent=tp.lb.toUpperCase();
    cmdEl.style.color='var(--accent)';
    if(timeEl)timeEl.textContent=`${dateStr} · ${getDisplayTime(tp)||''}`;
    if(startBtn){
      startBtn.style.display='flex';
      const totalSets=tp.ex.reduce((a,e)=>{const s=EX_SETS[cleanEx(e.n)];return a+(s||3);},0);
      const estMins=Math.round(totalSets*(COMPOUND_EX.includes(cleanEx(tp.ex[0]?.n||''))?3:2)+tp.ex.length*1.5);
      const capped=tp.tm&&tp.tm.includes('65')?Math.min(estMins,65):tp.tm&&tp.tm.includes('75')?Math.min(estMins,75):estMins;
      $('btn-start-label').textContent=`▶ START ${tp.day.toUpperCase()} · ~${capped} MIN (±10)`;
    }
    // Main lift = first compound
    const mainLift=tp.ex.find(e=>COMPOUND_EX.includes(cleanEx(e.n)));
    const mlEl=$('today-main-lift');
    if(mlEl&&mainLift){
      const mlName=cleanEx(mainLift.n);
      const mlLast=DP.getLogs(mlName,1)[0];
      const mlLastStr=mlLast?` · LAST: ${mlLast.w}kg × ${mlLast.reps||'?'}`:'';
      mlEl.innerHTML=`MAIN LIFT: <strong style="color:var(--accent)">${mlName.toUpperCase()}</strong>${mlLastStr}`;
    } else if(mlEl) mlEl.textContent='';

    // Check muscle lagging alerts
    const laggingAlerts=checkMuscleBalance()||[];

    // Readiness session card — null when not set (no default assumed)
    const readinessScore = (() => {
      if (todayR == null) return null;
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1);
      const yDate = yesterday.toISOString().slice(0,10);
      const kcals = DB.get('kcals')||{}, prots = DB.get('prots')||{};
      return getReadinessScore(todayR, kcals[yDate], prots[yDate], 1800, 180);
    })();
    const _isInCut = isInCutPhase();
    const verdict = readinessScore != null ? getReadinessVerdict(readinessScore, { isInCut: _isInCut }) : null;

    // Exercise list — apply pattern filtering and skip occupied equipment
    const occupiedEquip = DB.get('equipment-occupied-session') || [];
    const unavailEquip = DB.get('unavailable-equipment') || [];
    const _calPatternsOn = _dirSession?.calibrationLevel?.patternsEnabled !== false;
    const patterns = _calPatternsOn ? (DB.get('applied-patterns') || []) : [];
    const skipPattern = patterns.find(p => p.type === 'SKIP_DAY' && p.day === tp.day);
    let rawExList = (tp.ex||[]).filter(e => !unavailEquip.includes(cleanEx(e.n||'')));
    if (skipPattern) {
      const compounds = rawExList.filter(e => COMPOUND_EX.includes(cleanEx(e.n||'')));
      if (compounds.length >= 2) rawExList = compounds;
    }
    const exList = rawExList;
    const todayDayIdx=dayMap[new Date().getDay()];
    const isExpanded=!!uiToggleFlags.exListExpanded[todayDayIdx];
    const SHOW_LIMIT=4;
    const showAll=isExpanded||exList.length<=SHOW_LIMIT;
    const visibleEx=showAll?exList:exList.slice(0,SHOW_LIMIT);
    const hiddenCount=exList.length-SHOW_LIMIT;
    const _prsData = DB.get('pr-records') || [];
    const _tpl=$('today-preview-list');if(_tpl)_tpl.innerHTML=renderLastSessionMemory(tp.day)+`
      ${(()=>{
        const banner=_dirSession?.calibrationBanner;
        const lvl=_dirSession?.calibrationLevel;
        if(!banner||!lvl)return'';
        return`<div style="margin:0 16px 10px;padding:10px 14px;background:rgba(123,44,191,0.08);border-radius:var(--rs);border:1px solid rgba(123,44,191,0.35);display:flex;align-items:flex-start;gap:10px">
          <span style="font-size:18px;flex-shrink:0">🧠</span>
          <div><div style="font-size:12px;font-weight:700;color:#b57bee">${lvl.displayName}</div>
          <div style="font-size:11px;color:var(--text3);margin-top:2px">${banner}</div></div>
        </div>`;
      })()}
      ${skipPattern?`<div style="margin:0 16px 10px;padding:10px 14px;background:rgba(255,149,0,0.06);border-radius:var(--rs);border:1px solid rgba(255,149,0,0.2)">
        <div style="font-size:11px;color:var(--accent2);font-weight:600">📊 Program scurtat la ${exList.length} exerciții esențiale (${skipPattern.skipRate}% skip ${tp.day})</div>
      </div>`:''}
      ${_dirSession?.patternApplied?`<div style="margin:0 16px 10px;padding:10px 14px;background:rgba(160,100,255,0.06);border-radius:var(--rs);border:1px solid rgba(160,100,255,0.2)">
        <div style="font-size:11px;color:var(--purple);font-weight:600">🧠 ${_dirSession.patternApplied.reason}</div>
      </div>`:''}
      ${laggingAlerts.length?`<div style="margin:0 16px 10px;padding:11px 14px;background:rgba(255,107,53,0.07);border-radius:var(--rs);border:1px solid rgba(255,107,53,0.2)">
        ${laggingAlerts.map(a=>`<div style="font-size:12px;color:var(--accent2);font-weight:600;margin-bottom:3px">⚠️ ${a}</div>`).join('')}
      </div>`:''}
      ${(()=>{
        const proAlerts=_dirSession?.context?.proactiveAlerts||[];
        if(!proAlerts.length)return'';
        const top=proAlerts[0];
        const color=top.severity==='warning'?'var(--accent2)':top.severity==='success'?'var(--green)':'var(--accent)';
        const bg=top.severity==='warning'?'rgba(255,107,53,0.07)':top.severity==='success'?'rgba(0,200,100,0.07)':'rgba(100,150,255,0.07)';
        const border=top.severity==='warning'?'rgba(255,107,53,0.2)':top.severity==='success'?'rgba(0,200,100,0.2)':'rgba(100,150,255,0.2)';
        const icon=top.severity==='warning'?'⚠️':top.severity==='success'?'✅':'💡';
        return`<div style="margin:0 16px 10px;padding:11px 14px;background:${bg};border-radius:var(--rs);border:1px solid ${border}">
          <div style="font-size:12px;color:${color};font-weight:600">${icon} ${top.message}</div>
          ${proAlerts.length>1?`<div style="font-size:10px;color:var(--text3);margin-top:4px">+${proAlerts.length-1} alte alerte</div>`:''}
        </div>`;
      })()}
      ${todayR == null ? `<div style="margin:0 16px 10px;padding:14px 16px;background:var(--card);border:1px solid var(--border);border-radius:var(--rs)">
        <div style="font-size:11px;color:var(--text3);margin-bottom:10px;text-transform:uppercase;letter-spacing:1px">Cum te simți azi?</div>
        <div style="display:flex;gap:6px">
          ${[1,2,3,4,5].map(v => `<button onclick="selectReadiness(${v})" style="flex:1;background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:8px 2px;cursor:pointer;transition:border-color .15s">
            <div style="font-size:22px">${READINESS_LABELS[v].emoji}</div>
            <div style="font-size:8px;color:var(--text3);margin-top:4px;line-height:1.2">${READINESS_LABELS[v].label}</div>
          </button>`).join('')}
        </div>
      </div>` : `<div style="margin:0 16px 10px;padding:12px 14px;background:${verdict.color}12;border-radius:var(--rs);border:1px solid ${verdict.color}30;display:flex;align-items:center;gap:10px">
        <div style="font-size:18px">🧠</div>
        <div style="flex:1">
          <div style="font-size:12px;font-weight:700;color:${verdict.color}">${verdict.label}</div>
          <div style="font-size:11px;color:var(--text3);margin-top:1px">Readiness ${readinessScore}/100${verdict.volumeMultiplier < 1 ? ` · volum ${Math.round(verdict.volumeMultiplier*100)}%` : ''}</div>
        </div>
        <button onclick="showReadinessModal()" style="background:none;border:none;color:var(--text3);font-size:10px;cursor:pointer;padding:4px">${READINESS_LABELS[todayR]?.emoji||'✏️'}</button>
      </div>`}
      <div style="background:var(--card);border:1px solid var(--border);border-radius:var(--r);margin:0 16px 12px;overflow:hidden">
        ${visibleEx.map((e,i)=>{
          const cleanName=cleanEx(e.n);
          const isOccupied = occupiedEquip.includes(cleanName);
          const rec=AA.applyTo(DP.recommend(cleanName), cleanName);
          const hasHistory=DP.getLogs(cleanName,1).length>0;
          const isLast=i===visibleEx.length-1&&!(exList.length>SHOW_LIMIT);
          const exPR=_prsData.find(p=>p.ex===cleanName);
          const nearPR=exPR&&rec.kg*(parseInt(rec.repsTarget)||8)>=exPR.kg*(parseInt(exPR.reps)||8)*0.9;
          return `<div style="display:flex;align-items:flex-start;gap:10px;padding:11px 14px;${!isLast?'border-bottom:1px solid var(--border)':''}${isOccupied?';opacity:0.45':''}">
            <div style="width:6px;height:6px;border-radius:50%;background:${getGroupColor(e.g)};flex-shrink:0;margin-top:5px"></div>
            <div style="flex:1;min-width:0">
              <div style="font-size:13px;font-weight:500">${cleanName}${nearPR?' <span style="font-size:9px;color:var(--accent);font-weight:700;background:rgba(200,255,0,0.12);padding:1px 5px;border-radius:4px">🔥 PR!</span>':''}</div>
              <div style="font-size:10px;color:var(--text3);margin-top:1px">${formatSetsReps(e.s||'', cleanEx(e.n||''), _isInCut)}${e.ss?' · <span style="color:var(--accent2)">SS</span>':''}</div>
              <div style="display:flex;gap:4px;margin-top:5px;flex-wrap:wrap">
                <button onclick="markOccupied('${cleanName.replace(/'/g,'\\\'')}')" style="font-size:9px;padding:2px 7px;background:rgba(255,149,0,0.1);border:1px solid rgba(255,149,0,0.3);border-radius:4px;color:var(--accent2);cursor:pointer;font-family:'DM Sans',sans-serif">⚠️ Ocupat</button>
                <button onclick="markEquipmentUnavailable('${cleanName.replace(/'/g,'\\\'')}')" style="font-size:9px;padding:2px 7px;background:rgba(255,68,68,0.07);border:1px solid rgba(255,68,68,0.2);border-radius:4px;color:var(--red);cursor:pointer;font-family:'DM Sans',sans-serif">🚫 Lipsă</button>
                <button onclick="showWhyForExercise('${cleanName.replace(/'/g,'\\\'')}')" style="font-size:9px;padding:2px 7px;background:rgba(100,150,255,0.08);border:1px solid rgba(100,150,255,0.2);border-radius:4px;color:var(--accent);cursor:pointer;font-family:'DM Sans',sans-serif">❓ De ce?</button>
              </div>
            </div>
            <div style="text-align:right;flex-shrink:0">
              <div style="font-family:'Bebas Neue',sans-serif;font-size:20px;color:${hasHistory?rec.statusColor:'var(--text3)'}">${rec.kg}kg</div>
              <div style="font-size:9px;padding:2px 6px;border-radius:10px;background:${hasHistory?rec.statusColor+'22':'rgba(255,255,255,0.07)'};color:${hasHistory?rec.statusColor:'var(--text3)'};margin-top:2px">${hasHistory?(rec.status==='INCREASE'?'🟢 CREȘTI':rec.status==='TOO HEAVY'?'🔴 PREA GREU':rec.status==='STAGNANT +SET'?'🟡 STAGNARE':rec.status==='SCALE BACK'?'⬇️ SCADE':rec.status==='CONSOLIDATE'?'🟡 REPS':'🟢 OK'):'⚡ START'}</div>
            </div>
          </div>`;
        }).join('')}
        ${exList.length>SHOW_LIMIT?`<div onclick="toggleExList(${todayDayIdx})" style="padding:10px 16px;text-align:center;cursor:pointer;color:var(--accent);font-size:12px;border-top:1px solid var(--border)">
          ${isExpanded?'▴ Restrânge':`▾ +${hiddenCount} exerciții`}
        </div>`:''}
      </div>`;
  }

  // Stats row
  const logs=DB.get('logs')||[];
  const uniqueDays=[...new Set(logs.filter(l=>!l.baseline).map(l=>l.date))].sort().reverse();
  let streak=0;
  for(let i=0;i<uniqueDays.length;i++){
    const d=new Date(uniqueDays[i]+' 12:00');
    const exp=new Date(today+' 12:00');exp.setDate(exp.getDate()-i);
    if(d.toDateString()===exp.toDateString())streak++;
    else break;
  }
  const sEl=$('today-streak');if(sEl)sEl.textContent=streak;
  const kEl=$('today-kcal-burn');
  if(kEl)kEl.textContent=tp.t!=='off'?Math.round(SYS.getCurrentKg()*0.09*50):'—';
  const weekAgo=new Date();weekAgo.setDate(weekAgo.getDate()-7);
  const wEl=$('today-sets-done');
  if(wEl)wEl.textContent=logs.filter(l=>!l.baseline&&new Date(l.date)>=weekAgo).length;

  renderTodayAlerts();
  renderFatigueScore('fatigue-score-coach');
  renderPRWall();

  // Pattern learning async
  const allLogsForPattern = DB.get('logs') || [];
  if (allLogsForPattern.length > 20) analyzeAndApplyPatterns(allLogsForPattern);
}

export function startSession(){
  // Feature 2: Check for existing session draft from today
  const draft = DB.get('session-draft');
  if (draft && draft.date === tod() && draft.sessLog && draft.sessLog.length > 0) {
    if (confirm(`Ai ${draft.sessLog.length} seturi nefinalizate din azi. Continui sesiunea anterioară?`)) {
      state.sessActive = true; state.sessStart = draft.sessStart; state.sessLog = [...draft.sessLog];
      state.currentEx = draft.currentEx || ''; state.currentSet = draft.currentSet || 1;
      state.dropSetUsedThisSession = false; state.earlyStopReason = null;
      state.completedExercises = new Set(); state.sessKcalBurn = 0;
      requestWakeLock();
      state.isMuted = DB.get('muted')||false;
      const mb2=$('mute-btn');if(mb2){mb2.textContent=state.isMuted?'🔇':'🔊';mb2.style.color=state.isMuted?'var(--accent2)':'var(--text2)';}
      state.sessionTotalExercises = getTodayExercises().length;
      const ts2=$('today-screen');if(ts2)ts2.style.display='none';
      const su2=$('session-ui');if(su2)su2.style.display='block';
      state.sessTimer = setInterval(tickSess,1000);
      setupInactivity();
      toast('🔄 Sesiune restaurată!','var(--accent)');
      updateExCard(); renderSessLog(); return;
    } else { clearDraft(); }
  }

  state.sessActive = true;state.sessStart = Date.now();state.sessLog = [];state.sessKcalBurn = 0;state.dropSetUsedThisSession = false;state.earlyStopReason = null;
  requestWakeLock();
  state.completedExercises = new Set();
  state.isMuted = DB.get('muted')||false;
  const mb=$('mute-btn');if(mb){mb.textContent=state.isMuted?'🔇':'🔊';mb.style.color=state.isMuted?'var(--accent2)':'var(--text2)';}
  const todayExsForCount=getTodayExercises();
  state.sessionTotalExercises = todayExsForCount.length;
  const ts=$('today-screen');if(ts)ts.style.display='none';
  const su=$('session-ui'); if(su) su.style.display='block';
  state.sessTimer = setInterval(tickSess,1000);
  beepStart();speak('Antrenament pornit.');
  toast('🔥 START!');
  setupInactivity(); // Feature 5: Inactivity auto-pause

  // Auto-select first exercise of today
  const todayExs=getTodayExercises();
  if(todayExs.length>0){
    state.currentEx = todayExs[0];
    state.currentSet = 1;
    updateExCard();
  }
  renderSessLog();
}

export function skipExercise(){
  state.completedExercises.add(state.currentEx); // skip = counts as done
  updateSessionProgress();
  const todayExs=getTodayExercises();
  const idx=todayExs.indexOf(state.currentEx);
  if(idx<todayExs.length-1){
    state.currentEx = todayExs[idx+1];
    state.currentSet = 1;
    updateExCard();
    toast('Exercițiu sărit');
  } else {
    endSession();
  }
}

export function cancelWorkout(){
  if(!confirm('Anulezi antrenamentul? Nicio dată nu va fi salvată.')) return;
  clearInterval(state.sessTimer); state.sessTimer = null;
  stopPause(); state.sessActive = false; state.lastPauseEndedAt = null;
  // Șterge din DB toate logurile din sesiunea curentă (scrise la selectRPE)
  if(state.sessStart) {
    const logs = DB.get('logs') || [];
    const cleaned = logs.filter(l => l.session !== state.sessStart);
    DB.set('logs', cleaned);
  }
  state.sessLog = [];
  if(window.speechSynthesis) window.speechSynthesis.cancel();
  const suEl=$('session-ui'); if(suEl) suEl.style.display='none';
  hidePauseScreen();
  const tsEl=$('today-screen'); if(tsEl) tsEl.style.display='block';
  toast('❌ Antrenament anulat — nicio dată salvată','var(--red)');
  renderCoachIdle();
}

export function endSession(){
  if(!state.sessActive)return;
  clearDraft(); teardownInactivity(); // Feature 2+5
  clearInterval(state.sessTimer);state.sessTimer = null;
  stopPause();state.sessActive = false; state.lastPauseEndedAt = null;
  releaseWakeLock();
  if(window.speechSynthesis) window.speechSynthesis.cancel();

  // Auto-delete test sessions (< 5 minutes), but only if not an early stop
  const hasEarlyStop = state.earlyStopReason !== null;
  if(!hasEarlyStop && Date.now() - state.sessStart < 5 * 60 * 1000){
    const logs = DB.get('logs') || [];
    DB.set('logs', logs.filter(l => l.session !== state.sessStart));
    const suEl2=$('session-ui'); if(suEl2) suEl2.style.display='none';
    const ts=$('today-screen'); if(ts) ts.style.display='block';
    toast('🧹 Sesiune test ștearsă automat','var(--accent2)');
    renderCoachIdle();
    if(window.renderDash) window.renderDash();
    return;
  }

  const mins=Math.round((Date.now()-state.sessStart)/60000);
  const kcal=Math.round(SYS.getCurrentKg()*0.09*mins);
  const burnLog=DB.get('session-burns')||[];
  // Save with day key for adaptive timer
  const _dayMap = [6,0,1,2,3,4,5];
  const dayKey = PROG[_dayMap[new Date().getDay()]]?.day || 'default';
  burnLog.unshift({date:tod(),mins,kcal,sets:state.sessLog.length,day:dayKey});
  DB.set('session-burns',burnLog.slice(0,100));

  // ── Calculează sumar sesiune ──────────────────────────────────────────────
  const totalVolume=state.sessLog.reduce((a,s)=>a+(s.kg*(s.reps||8)),0);
  const totalSets=state.sessLog.length;
  const uniqueEx=[...new Set(state.sessLog.map(s=>s.ex))];
  const avgRPE=state.sessLog.filter(s=>s.rpe).reduce((a,s,_,arr)=>a+s.rpe/arr.length,0);
  const notes=state.sessLog.flatMap(s=>s.notes||[]);
  const feltStrong=notes.filter(n=>n==='strong').length;
  const feltHeavy=notes.filter(n=>n==='form'||n==='fatigue').length;
  const moodLabel=feltStrong>feltHeavy?'💪 Sesiune puternică':feltHeavy>feltStrong?'😓 Sesiune grea':'⚡ Sesiune ok';

  // ── Detectează recorduri ──────────────────────────────────────────────────
  const allLogs=DB.get('logs')||[];
  const prs=[];
  uniqueEx.forEach(ex=>{
    const thisSess=state.sessLog.filter(s=>s.ex===ex);
    const bestKg=Math.max(...thisSess.map(s=>s.kg));
    const bestReps=Math.max(...thisSess.filter(s=>s.kg===bestKg).map(s=>s.reps||8));
    // Compare to historical (exclude today's session)
    const historical=allLogs.filter(l=>l.ex===ex&&l.session!==state.sessStart&&!l.baseline);
    if(!historical.length){
      prs.push({ex,type:'prima',label:`${ex} — Prima sesiune! ${bestKg}kg × ${bestReps}`});
    } else {
      const histBestKg=Math.max(...historical.map(l=>l.w||0));
      const histBestReps=Math.max(...historical.filter(l=>l.w===histBestKg).map(l=>parseInt(l.reps)||8));
      if(bestKg>histBestKg){
        prs.push({ex,type:'kg',label:`${ex}: +${bestKg-histBestKg}kg nou maxim (${bestKg}kg × ${bestReps})`});
      } else if(bestKg===histBestKg&&bestReps>histBestReps){
        prs.push({ex,type:'reps',label:`${ex}: +${bestReps-histBestReps} reps (${bestKg}kg × ${bestReps})`});
      }
    }
  });

  // ── Întreabă cum a fost sesiunea (un singur tap) ─────────────────────────
  showSessionRating({mins,kcal,totalVolume,totalSets,uniqueEx,avgRPE,prs});
}

export function closeSummary(){
  const m=document.getElementById('summary-modal');
  if(m) m.remove();
  const ts=$('today-screen'); if(ts)ts.style.display='block';
  renderCoachIdle();
  if(window.renderDash)window.renderDash();
  // Auto close day if it's evening (22:00–23:59)
  const h = new Date().getHours();
  if(h >= 22 && window.closeDayFromDash) window.closeDayFromDash();
}

function showSessionSummary(data) {
  const modal = document.createElement('div');
  modal.id = 'summary-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:400;display:flex;align-items:center;justify-content:center;padding:20px';
  const prsHtml = data.prs?.length
    ? data.prs.map(pr => `<div style="padding:6px 10px;background:rgba(200,255,0,0.06);border:1px solid rgba(200,255,0,0.15);border-radius:var(--rs);font-size:11px;color:var(--accent);margin-bottom:4px">🏆 ${pr.label}</div>`).join('')
    : '';
  modal.innerHTML = `<div style="background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:28px 24px;width:100%;max-width:360px;text-align:center">
    <div style="font-family:'Bebas Neue',sans-serif;font-size:32px;color:var(--accent);margin-bottom:4px">SESIUNE COMPLETĂ</div>
    <div style="font-size:15px;margin-bottom:16px">${data.moodLabel||''}</div>
    ${data.totalSets ? `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:16px">
      <div style="background:var(--bg3);border-radius:var(--rs);padding:10px 4px"><div style="font-family:'Bebas Neue',sans-serif;font-size:22px;color:var(--accent)">${data.mins||0}</div><div style="font-size:9px;color:var(--text3)">MIN</div></div>
      <div style="background:var(--bg3);border-radius:var(--rs);padding:10px 4px"><div style="font-family:'Bebas Neue',sans-serif;font-size:22px;color:var(--accent)">${data.totalSets}</div><div style="font-size:9px;color:var(--text3)">SETURI</div></div>
      <div style="background:var(--bg3);border-radius:var(--rs);padding:10px 4px"><div style="font-family:'Bebas Neue',sans-serif;font-size:22px;color:var(--accent)">${data.kcal||0}</div><div style="font-size:9px;color:var(--text3)">KCAL</div></div>
    </div>` : ''}
    ${prsHtml ? `<div style="margin-bottom:16px;text-align:left">${prsHtml}</div>` : ''}
    <button onclick="closeSummary()"
      style="width:100%;padding:14px;background:var(--accent);color:#000;font-weight:700;font-size:15px;border:none;border-radius:var(--r);cursor:pointer;font-family:'Bebas Neue',sans-serif">
      ✓ GATA
    </button>
  </div>`;
  document.body.appendChild(modal);
}

function launchConfetti(){
  const canvas=document.createElement('canvas');
  canvas.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:999';
  document.body.appendChild(canvas);
  const ctx=canvas.getContext('2d');
  canvas.width=window.innerWidth; canvas.height=window.innerHeight;
  const pieces=Array.from({length:80},()=>({
    x:Math.random()*canvas.width, y:-10,
    w:Math.random()*8+4, h:Math.random()*12+6,
    r:Math.random()*Math.PI*2,
    vx:(Math.random()-0.5)*4, vy:Math.random()*4+2,
    vr:(Math.random()-0.5)*0.2,
    color:['#c8ff00','#fff','#ff9f0a','#30d158','#ff375f'][Math.floor(Math.random()*5)]
  }));
  let frame=0;
  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    pieces.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy; p.r+=p.vr; p.vy+=0.05;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.r);
      ctx.fillStyle=p.color; ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);
      ctx.restore();
    });
    frame++;
    if(frame<120) requestAnimationFrame(draw);
    else canvas.remove();
  }
  draw();
}

export function showSessionRating(summaryData) {
  $('session-ui').style.display='none';
  hidePauseScreen();

  const prsHtml = summaryData.prs?.length
    ? summaryData.prs.map(pr => `<div style="padding:7px 12px;background:rgba(200,255,0,0.06);border:1px solid rgba(200,255,0,0.2);border-radius:var(--rs);font-size:11px;color:var(--accent);margin-bottom:5px">🏆 ${pr.label}</div>`).join('')
    : '';

  // Store summaryData on window to avoid inline JSON injection issues
  window._pendingRatingSummary = summaryData;

  const modal = document.createElement('div');
  modal.id = 'rating-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:200;overflow-y:auto;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 20px';
  modal.innerHTML = `
    <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:2px;margin-bottom:16px">SESIUNE COMPLETĂ</div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;width:100%;max-width:340px;margin-bottom:16px">
      <div style="text-align:center;background:var(--card);border:1px solid var(--border);border-radius:var(--rs);padding:12px 6px">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:28px;color:var(--accent)">${summaryData.mins}</div>
        <div style="font-size:9px;color:var(--text3)">MIN</div>
      </div>
      <div style="text-align:center;background:var(--card);border:1px solid var(--border);border-radius:var(--rs);padding:12px 6px">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:28px;color:var(--accent)">${summaryData.totalSets}</div>
        <div style="font-size:9px;color:var(--text3)">SETURI</div>
      </div>
      <div style="text-align:center;background:var(--card);border:1px solid var(--border);border-radius:var(--rs);padding:12px 6px">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:28px;color:var(--accent)">${summaryData.kcal}</div>
        <div style="font-size:9px;color:var(--text3)">KCAL</div>
      </div>
    </div>
    ${prsHtml ? `<div style="width:100%;max-width:340px;margin-bottom:14px">${prsHtml}</div>` : ''}
    <div style="font-family:'Bebas Neue',sans-serif;font-size:36px;color:var(--text);margin-bottom:16px;text-align:center">CUM A FOST?</div>
    <div style="display:flex;flex-direction:column;gap:12px;width:100%;max-width:340px">
      <button onclick="rateSession('easy', window._pendingRatingSummary)"
        style="padding:18px;background:rgba(48,209,88,0.1);border:2px solid var(--green);border-radius:var(--rs);color:var(--green);font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:1px;cursor:pointer">
        ⚡ UȘOARĂ — MAI POT
      </button>
      <button onclick="rateSession('normal', window._pendingRatingSummary)"
        style="padding:18px;background:rgba(200,255,0,0.08);border:2px solid var(--accent);border-radius:var(--rs);color:var(--accent);font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:1px;cursor:pointer">
        👍 NORMALĂ — OK
      </button>
      <button onclick="rateSession('hard', window._pendingRatingSummary)"
        style="padding:18px;background:rgba(255,59,48,0.08);border:2px solid var(--red);border-radius:var(--rs);color:var(--red);font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:1px;cursor:pointer">
        💀 GREA — LA LIMITĂ
      </button>
    </div>
  `;
  document.body.appendChild(modal);
}

export function rateSession(rating, summaryData) {
  clearDraft(); // Feature 2: Clear draft when session rated
  // Convertește rating în notes pentru fatigue score
  const noteMap = {
    'easy':   ['strong'],
    'normal': [],
    'hard':   ['fatigue']
  };
  const notes = noteMap[rating] || [];

  // Adaugă notele la ultimele loguri din sesiune (retroactiv)
  if (notes.length) {
    const logs = DB.get('logs') || [];
    // Găsim ultimele 3 seturi din sesiunea curentă și le adăugăm notele
    let count = 0;
    for (let i = 0; i < logs.length && count < 3; i++) {
      if (logs[i].session === state.sessStart) {
        logs[i].notes = [...(logs[i].notes || []), ...notes];
        count++;
      }
    }
    DB.set('logs', logs);
  }

  // Save session rating for AA engine
  const sRatings = DB.get('session-ratings') || [];
  sRatings.unshift({ session: state.sessStart, rating, date: tod() });
  DB.set('session-ratings', sRatings.slice(0, 20));

  // FIX 1 + FIX 6: Extrage PR-uri și apelează cleanFakeLogs DUPĂ ce ratingul a fost salvat
  // (nu înainte, nu la load — doar la confirmarea ratingului)
  extractAndSavePRs();
  cleanFakeLogs();

  // Push immediately — don't rely on 3s debounce since user may close app right after rating
  syncToFirebase().catch(() => {});

  // Șterge modalul și arată summary
  const modal = document.getElementById('rating-modal');
  if (modal) modal.remove();

  const moodLabel = rating === 'easy' ? '⚡ Sesiune ușoară' : rating === 'hard' ? '💀 Sesiune grea' : '👍 Sesiune normală';
  showSessionSummary({...summaryData, moodLabel});
}

export function updateSessionProgress() {
  const done = state.completedExercises.size;
  const total = state.sessionTotalExercises || getTodayExercises().length;
  const pct = total > 0 ? Math.round(done/total*100) : 0;
  const txtEl = $('sess-progress-txt');
  const barEl = $('sess-progress-bar');
  if(txtEl) txtEl.textContent = `${done}/${total}`;
  if(barEl) barEl.style.width = pct + '%';
}

export function checkMuscleBalance(){
  const logs=DB.get('logs')||[];
  const alerts=[];
  // Groups to check: umeri vs piept
  const muscleGroups={
    umeri:['DB Shoulder Press','Lateral Raises','Rear Delt Fly'],
    piept:['Incline DB Press','Flat DB Press','Pec Deck / Cable Fly'],
    spate:['Lat Pulldown','Cable Row','Chest-Supported Row'],
    brate:['Incline DB Curl','Bayesian Curl','Cable Curl','Preacher Curl','Overhead Triceps','Pushdown']
  };

  for(const [grp, exs] of Object.entries(muscleGroups)){
    const grpLogs=logs.filter(l=>exs.includes(l.ex)&&l.rpe&&!l.baseline).slice(0,6);
    if(grpLogs.length<3) continue;
    const avgRPE=grpLogs.reduce((a,b)=>a+b.rpe,0)/grpLogs.length;
    // Check stagnation: same weight 4+ sessions
    const exStagnant=exs.filter(ex=>{
      const exLogs=logs.filter(l=>l.ex===ex&&l.w&&!l.baseline).slice(0,5);
      if(exLogs.length<4) return false;
      const w=exLogs[0].w;
      return exLogs.slice(0,4).every(l=>l.w===w);
    });

    if(avgRPE>=9&&exStagnant.length>0){
      alerts.push(`${grp.toUpperCase()} LAGGING – RPE ${avgRPE.toFixed(1)} · +1 SET recomandat`);
      // Auto-set extra volume flag
      DB.set(`muscle-extra-${grp}`,true);
    }
  }
  return alerts;
}

export function checkWeightReminder() {
  const ws = DB.get('weights') || {};
  const dates = Object.keys(ws).sort().reverse();
  if (!dates.length) return;
  const lastDate = new Date(dates[0]);
  const daysSince = Math.floor((new Date() - lastDate) / 86400000);
  if (daysSince >= 3) {
    // Afișăm un banner non-intruziv pe coach screen
    const existing = $('weight-reminder-banner');
    if (existing) return;
    const banner = document.createElement('div');
    banner.id = 'weight-reminder-banner';
    banner.style.cssText = 'position:fixed;bottom:70px;left:16px;right:16px;background:var(--card);border:1px solid var(--accent2);border-radius:var(--rs);padding:12px 16px;z-index:50;display:flex;align-items:center;justify-content:space-between;gap:12px';
    banner.innerHTML = `
      <div>
        <div style="font-size:13px;font-weight:700;color:var(--accent2)">AI GRIJĂ — ${daysSince} ZILE FĂRĂ GREUTATE</div>
        <div style="font-size:11px;color:var(--text3);margin-top:2px">Verifică greutatea în ultimele zile</div>
      </div>
      <button onclick="sp('weight',document.querySelectorAll('.nb')[2]);document.getElementById('weight-reminder-banner').remove()"
        style="background:var(--accent2);color:#000;font-weight:700;font-size:11px;padding:8px 14px;border:none;border-radius:var(--rs);cursor:pointer;font-family:'DM Sans',sans-serif;white-space:nowrap">LOGHEAZĂ</button>
    `;
    document.body.appendChild(banner);
    setTimeout(() => { if(banner.parentNode) banner.remove(); }, 15000);
  }
}


// ── FIX 2b: Finish Early — funcții ───────────────────────────────────────
export function finishEarly() {
  const reasons = ['Oboseală extremă', 'Am dureri', 'Lipsă timp', 'Alt motiv'];
  document.getElementById('early-stop-modal')?.remove();
  const modal = document.createElement('div');
  modal.id = 'early-stop-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:300;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 20px';
  modal.innerHTML = `
    <div style="width:100%;max-width:340px;background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:24px 20px">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:24px;color:var(--accent2);margin-bottom:6px;text-align:center">STOP DEVREME</div>
      <div style="font-size:12px;color:var(--text3);text-align:center;margin-bottom:20px">De ce oprești antrenamentul?</div>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${reasons.map(r => `<button onclick="confirmEarlyStop('${r}')"
          style="padding:14px 16px;background:rgba(255,149,0,0.07);border:1px solid rgba(255,149,0,0.25);border-radius:var(--rs);color:var(--text);font-size:14px;font-weight:600;cursor:pointer;text-align:left;font-family:'DM Sans',sans-serif">${r}</button>`).join('')}
      </div>
      <button onclick="document.getElementById('early-stop-modal')?.remove()"
        style="margin-top:16px;width:100%;padding:12px;background:transparent;color:var(--text3);font-size:13px;border:none;cursor:pointer;font-family:'DM Sans',sans-serif">Anulează</button>
    </div>
  `;
  document.body.appendChild(modal);
}

export function confirmEarlyStop(reason) {
  // 1. Salvează în state
  state.earlyStopReason = reason;

  // 2. Salvează în log-ul sesiunii
  const setsCompleted = state.sessLog.length;
  const todayExs = getTodayExercises();
  const avgSets = todayExs.length > 0 ? todayExs.reduce((a, ex) => a + (EX_SETS[ex] || 3), 0) / todayExs.length : 3;
  const totalSets = Math.round(state.sessionTotalExercises * avgSets);
  const earlyLog = { date: tod(), earlyStop: { reason, setsCompleted, totalSets }, session: state.sessStart };
  const logs = DB.get('logs') || [];
  logs.unshift({ ...earlyLog, ex: '__early_stop__', w: 0, reps: '0', ts: Date.now(), session: state.sessStart, earlyStop: { reason, setsCompleted, totalSets } });
  DB.set('logs', logs.slice(0, 500));

  // 3. Salvează în 'early-stops' key
  const earlyStops = DB.get('early-stops') || [];
  earlyStops.push({ date: tod(), reason, session: state.sessStart, setsCompleted, totalSets });
  DB.set('early-stops', earlyStops.slice(-50));

  // 4. Ascunde modalul
  document.getElementById('early-stop-modal')?.remove();

  // 5. Flow normal (rating etc.)
  endSession();
}

export function saveStepsQuick(){
  const inp=$('steps-quick-input');
  if(!inp)return;
  const steps=parseInt(inp.value);
  if(isNaN(steps)||steps<0)return;
  DB.set('steps-today',steps);
  const target=8000;
  if(steps>=target){
    const streaks=DB.get('step-streaks')||{count:0,lastDate:'',totalDays:0};
    const today=tod();
    if(streaks.lastDate!==today){
      const yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);
      const yStr=yesterday.toISOString().split('T')[0];
      streaks.count=streaks.lastDate===yStr?streaks.count+1:1;
      streaks.lastDate=today;
      streaks.totalDays=(streaks.totalDays||0)+1;
      DB.set('step-streaks',streaks);
    }
    toast('✅ Quest completat! 🔥','var(--purple)');
  } else {
    toast(`✓ ${steps.toLocaleString()} pași`);
  }
  renderCoachIdle();
}

export function togglePRWall() { _togglePRWall(); }

export function showReadinessModal() {
  if (document.getElementById('readiness-modal')) return;
  const modal = document.createElement('div');
  modal.id = 'readiness-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:8000;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px';
  modal.innerHTML = `
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:28px 24px;width:100%;max-width:400px;text-align:center">
      <div style="font-size:13px;color:var(--accent);text-transform:uppercase;letter-spacing:2px;margin-bottom:8px">ÎNAINTE DE ANTRENAMENT</div>
      <div style="font-size:20px;font-weight:700;margin-bottom:6px">Cum te simți azi?</div>
      <div style="font-size:12px;color:var(--text3);margin-bottom:24px">Răspunsul afectează recomandările de azi</div>
      <div style="display:flex;justify-content:space-between;gap:8px">
        ${[1,2,3,4,5].map(v => `
          <button onclick="selectReadiness(${v})" style="flex:1;background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:14px 4px;cursor:pointer;transition:all .15s">
            <div style="font-size:28px">${READINESS_LABELS[v].emoji}</div>
            <div style="font-size:9px;color:var(--text3);margin-top:6px;line-height:1.3">${READINESS_LABELS[v].label}</div>
          </button>`).join('')}
      </div>
      <button onclick="document.getElementById('readiness-modal').remove()" style="margin-top:20px;background:none;border:none;color:var(--text3);font-size:12px;cursor:pointer;padding:8px">Sari peste</button>
    </div>`;
  document.body.appendChild(modal);
}

export function selectReadiness(value) {
  saveReadiness(value);
  const modal = document.getElementById('readiness-modal');
  if (modal) modal.remove();
  renderCoachIdle();
  toast(`${READINESS_LABELS[value].emoji} ${READINESS_LABELS[value].label}`, 'var(--accent)');
}

export function showSkipModal() {
  const modal = document.createElement('div');
  modal.id = 'skip-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:8000;display:flex;align-items:flex-end;justify-content:center';
  const dayMap=[6,0,1,2,3,4,5];
  const tp = PROG ? PROG[dayMap[new Date().getDay()]] : null;
  modal.innerHTML = `<div style="background:var(--bg2);border:1px solid var(--border);border-radius:16px 16px 0 0;width:100%;max-width:500px;padding:24px 20px 36px">
    <div style="font-size:15px;font-weight:700;margin-bottom:16px">De ce sari azi?</div>
    ${['Obosit / recuperare insuficientă','Lipsă timp','Durere / accidentare','Alt motiv'].map((reason) =>
      `<button onclick="confirmSkip('${reason}')" style="display:block;width:100%;text-align:left;background:var(--card);border:1px solid var(--border);border-radius:var(--rs);padding:13px 16px;margin-bottom:8px;cursor:pointer;font-size:13px;color:var(--text);font-family:'DM Sans',sans-serif">${reason}</button>`
    ).join('')}
    <button onclick="document.getElementById('skip-modal').remove()" style="margin-top:8px;background:none;border:none;color:var(--text3);font-size:12px;cursor:pointer;width:100%;text-align:center;padding:8px">Anulează</button>
  </div>`;
  modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
  document.body.appendChild(modal);
}

export function confirmSkip(reason) {
  const modal = document.getElementById('skip-modal');
  if (modal) modal.remove();
  const days = ['Duminică','Luni','Marți','Miercuri','Joi','Vineri','Sâmbătă'];
  const skips = DB.get('workout-skips') || [];
  skips.push({ date: tod(), dayOfWeek: days[new Date().getDay()], reason, ts: Date.now() });
  DB.set('workout-skips', skips.slice(-100));
  toast('📌 Skip înregistrat', 'var(--text2)');
  renderCoachIdle();
  if (window.renderDash) window.renderDash();
}

export function showAlternativeModal(exerciseName) {
  const existing = document.getElementById('alt-modal');
  if (existing) existing.remove();

  const ALTERNATIVES = {
    'Lat Pulldown': [
      { name: 'Cable Row', reason: 'Similar lat activation, horizontal pull' },
      { name: 'Chest-Supported Row', reason: 'Spate complet, fără cablu' },
    ],
    'Cable Row': [
      { name: 'Chest-Supported Row', reason: 'Identic, pe bancă' },
      { name: 'Lat Pulldown', reason: 'Vertical pull, lat dominant' },
    ],
    'Pec Deck / Cable Fly': [
      { name: 'Incline DB Press', reason: 'Presă + stretch piept' },
      { name: 'Cable Fly', reason: 'Aceeași mișcare pe cablu' },
    ],
    'Leg Press': [
      { name: 'Romanian Deadlift', reason: 'Posterior chain, fără aparat' },
    ],
    'Overhead Triceps': [
      { name: 'Pushdown', reason: 'Triceps lateral+medial, același cablu' },
    ],
    'Pushdown': [
      { name: 'Overhead Triceps', reason: 'Triceps lung, aceeași stivă' },
    ],
    'Bayesian Curl': [
      { name: 'Incline DB Curl', reason: 'Biceps lung, unghi similar' },
      { name: 'Cable Curl', reason: 'Tensiune constantă, cablu' },
    ],
  };

  const alts = ALTERNATIVES[exerciseName] || [];
  const modal = document.createElement('div');
  modal.id = 'alt-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:8000;display:flex;align-items:flex-end;justify-content:center';
  modal.innerHTML = `<div style="background:var(--bg2);border:1px solid var(--border);border-radius:16px 16px 0 0;width:100%;max-width:500px;padding:24px 20px 36px">
    <div style="font-size:15px;font-weight:700;margin-bottom:4px">⚠️ Aparat ocupat</div>
    <div style="font-size:12px;color:var(--text3);margin-bottom:16px">Alege o alternativă pentru <strong style="color:var(--text)">${exerciseName}</strong></div>
    ${alts.length ? alts.map(a => `
      <button onclick="selectAlternative('${exerciseName}','${a.name}')" style="display:block;width:100%;text-align:left;background:var(--card);border:1px solid var(--border);border-radius:var(--rs);padding:13px 16px;margin-bottom:8px;cursor:pointer">
        <div style="font-size:13px;font-weight:600;color:var(--text)">${a.name}</div>
        <div style="font-size:11px;color:var(--text3);margin-top:2px">${a.reason}</div>
      </button>`).join('') : '<div style="font-size:12px;color:var(--text3);padding:12px">Nicio alternativă disponibilă — continuă cu exercițiul următor</div>'}
    <button onclick="markEquipmentUnavailable('${exerciseName}')" style="display:block;width:100%;text-align:left;background:rgba(255,68,68,0.08);border:1px solid rgba(255,68,68,0.2);border-radius:var(--rs);padding:11px 16px;margin-bottom:8px;cursor:pointer;font-size:12px;color:var(--red)">🚫 Nu am acest aparat (elimină permanent)</button>
    <button onclick="document.getElementById('alt-modal').remove()" style="margin-top:4px;background:none;border:none;color:var(--text3);font-size:12px;cursor:pointer;width:100%;text-align:center;padding:8px">Anulează</button>
  </div>`;
  modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
  document.body.appendChild(modal);
}

export function selectAlternative(original, alternative) {
  const modal = document.getElementById('alt-modal');
  if (modal) modal.remove();
  // Store equipment occupied for this session
  const occ = DB.get('equipment-occupied-session') || [];
  if (!occ.includes(original)) occ.push(original);
  DB.set('equipment-occupied-session', occ);
  // Switch current exercise
  state.currentEx = alternative;
  updateExCard();
  toast(`Schimbat → ${alternative}`, 'var(--accent2)');
}

export function markEquipmentUnavailable(exerciseName) {
  const modal = document.getElementById('alt-modal');
  if (modal) modal.remove();
  const unavail = DB.get('unavailable-equipment') || [];
  if (!unavail.includes(exerciseName)) unavail.push(exerciseName);
  DB.set('unavailable-equipment', unavail);
  toast(`🚫 ${exerciseName} eliminat permanent`, 'var(--red)');
  renderCoachIdle();
}

export function showWhyForExercise(exerciseName) {
  // Build explanation using WhyEngine + Director session if available
  import('../engine/whyEngine.js').then(({ explainRecommendation }) => {
    const session = getCachedDirector();
    const exercise = session?.exercises?.find(e => (e.name || '').toLowerCase() === exerciseName.toLowerCase());
    const ctx = {
      readiness: { score: DB.get('readiness') ? (() => {
        try {
          const today = new Date().toISOString().slice(0,10);
          const r = DB.get('readiness');
          return typeof r === 'object' ? (r[today]?.score ?? r[today] ?? null) : null;
        } catch { return null; }
      })() : null },
      isInCut: isInCutPhase(),
      patterns: (() => {
        const lvl = (getCachedDirector() || sessionCache?.get())?.calibrationLevel;
        return (lvl?.patternsEnabled !== false) ? (DB.get('applied-patterns') || []) : [];
      })(),
      user: { phase: DB.get('phase-override') || 'AUTO' },
    };
    const { summary, reasons } = explainRecommendation(exercise || { name: exerciseName }, ctx);
    const lines = reasons.map(r => `[${r.category}] ${r.text}`).join('\n\n');
    alert(`❓ De ce ${exerciseName}?\n\n${summary}\n\n${lines || '(Fără date suficiente pentru explicație detaliată)'}`);
  }).catch(() => {
    alert(`❓ De ce ${exerciseName}?\n\n(WhyEngine indisponibil momentan)`);
  });
}

export function markOccupied(exerciseName) {
  if (state.sessActive) {
    showAlternativeModal(exerciseName);
    return;
  }
  const occ = DB.get('equipment-occupied-session') || [];
  if (!occ.includes(exerciseName)) {
    occ.push(exerciseName);
    DB.set('equipment-occupied-session', occ);
  }
  toast(`⚠️ ${exerciseName} marcat ocupat`, 'var(--accent2)');
  renderCoachIdle();
}

export function releaseWakeLock() {
  try { if(wakeLockRef.current) { wakeLockRef.current.release(); wakeLockRef.current = null; } } catch(e) {}
}

export async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
    }
  } catch(e) { /* Wake Lock not available — silently ignore */ }
}
