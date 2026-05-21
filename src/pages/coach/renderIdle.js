import { DB, $, tod, todDate, cleanEx } from '../../db.js';
import { PROG, EX_SETS, COMPOUND_EX, KCAL_TARGET, PROT_TARGET } from '../../constants.js';
import { DP } from '../../engine/dp.js';
import { AA } from '../../engine/aa.js';
import { SYS } from '../../engine/sys.js';
import { toast } from '../../ui/ui.js';
import { calculateFatigueScore } from '../../engine/fatigue.js';
import { getTodayReadiness, getReadinessVerdict, getReadinessScore, READINESS_LABELS } from '../../engine/readiness.js';
import { coachDirector } from '../../engine/coachDirector.js';
import { sessionCache, setCachedDirector, uiToggleFlags } from './state.js';
import { formatSetsReps, getGroupColor, getDisplayTime, isInCutPhase } from './util.js';
import { renderPRWall } from './pr.js';
import { showAAFrictionModal, isAAFrictionDismissedToday } from './aaFrictionModal.js';
import { modalManager } from '../../components/modalManager.js';

const PATTERN_BANNER_STRINGS = {
  LOW_ADHERENCE: (p) => `📊 Adherence scazuta ultimele 30 zile: ${p.adherenceRate}%. Reducem volum si verificam contextul.`,
  HIGH_DEVIATION: (p) => `📊 Deviation crescut: ${p.deviationRate}% sesiuni diferite de propunere. Coach-ul ajusteaza propunerile.`,
  EARLY_END: (p) => `📊 ${p.earlyEndRate}% sesiuni terminate devreme — program scurtat 20%`,
  STAGNATION: (p) => `📊 ${p.exercises?.length || 0} exercitii stagnate 3+ saptamani`,
  PEAK_HOURS: (p) => `📊 Peak hours detectat: ${p.hours || 'analiza activa'}`,
};

export function shouldShowPatternBanner(ctx) {
  if (!ctx) return false;
  if (ctx.patternsSuppressed === true) return false;
  if (!Array.isArray(ctx.patterns)) return false;
  return ctx.patterns.length > 0;
}

export function formatPatternMessage(pattern) {
  if (!pattern || !pattern.type) return null;
  if (pattern.type === 'SKIP_DAY') {
    throw new Error('SKIP_DAY pattern is deprecated — should not appear in ctx.patterns');
  }
  const formatter = PATTERN_BANNER_STRINGS[pattern.type];
  if (!formatter) {
    if (typeof console !== 'undefined') {
      console.warn('[renderIdle] Unknown pattern type:', pattern.type);
    }
    return null;
  }
  return formatter(pattern);
}

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
  // Log entries persist weight under `w`; some legacy paths used `kg`. Coalesce.
  const setKg = (s) => s?.w ?? s?.kg ?? null;
  const exMap = {};
  last.sets.forEach(s => {
    const cur = exMap[s.ex];
    if (!cur || (setKg(s) ?? -Infinity) > (setKg(cur) ?? -Infinity)) exMap[s.ex] = s;
  });
  const top3 = Object.values(exMap).sort((a, b) => (setKg(b) ?? -Infinity) - (setKg(a) ?? -Infinity)).slice(0, 3);
  const validRPE = last.sets.filter(s => s.rpe);
  const avgRPE = validRPE.length ? validRPE.reduce((a, s) => a + s.rpe, 0) / validRPE.length : 0;
  const ratingLbl = { easy: '⚡ Usoara', normal: '👍 Normala', hard: '💀 Grea' };
  const verdict = last.rating ? ratingLbl[last.rating] : (avgRPE > 8.5 ? '💀 Grea' : avgRPE < 7 ? '⚡ Usoara' : '👍 Normala');
  const d = new Date(last.date);
  const dateStr = d.toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' });
  return `<div id="session-memory-card" style="margin:0 16px 12px;background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:14px 16px;position:relative">
    <button onclick="document.getElementById('session-memory-card').remove()"
      style="position:absolute;top:8px;right:10px;background:none;border:none;color:var(--text3);font-size:16px;cursor:pointer;line-height:1;padding:2px 6px">✕</button>
    <div style="font-size:10px;color:var(--accent);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px">ULTIMA SESIUNE · ${dayLabel.toUpperCase()}</div>
    <div style="font-size:11px;color:var(--text2);margin-bottom:8px">${dateStr}</div>
    ${top3.map(s => `<div style="font-size:12px;color:var(--text);margin-bottom:3px">· ${s.ex} <span style="font-family:'JetBrains Mono',monospace;color:var(--accent)">${setKg(s) ?? '?'}kg×${s.reps||'?'}</span></div>`).join('')}
    <div style="margin-top:8px;display:flex;align-items:center;gap:12px">
      ${avgRPE > 0 ? `<span style="font-size:11px;color:var(--text3)">RPE: <span style="color:var(--text2)">${avgRPE.toFixed(1)}</span></span>` : ''}
      <span style="font-size:11px;font-weight:600;color:var(--accent2)">${verdict}</span>
    </div>
  </div>`;
}

function renderFatigueScore(elId) {
  const el = $(elId); if (!el) return;
  const f = calculateFatigueScore();
  el.style.display = 'block';
  el.innerHTML = `<span style="color:${f.color};font-size:11px;font-weight:600">${f.icon||''} ${f.label}</span><div style="font-size:10px;color:var(--text3);margin-top:2px">${f.detail}</div>`;
}

// TODO: render alerts into #today-alerts element (coach page)
function renderTodayAlerts() {}

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
            <div style="font-size:11px;color:var(--text2)">target: 8.000 pasi</div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:13px;color:${qPct>=100?'var(--green)':'var(--text3)'}">${qPct}%</div>
          </div>
        </div>
        <div style="height:6px;background:var(--bg3);border-radius:3px;overflow:hidden;margin-bottom:12px">
          <div style="height:100%;width:${qPct}%;background:var(--purple);border-radius:3px;transition:width .5s"></div>
        </div>
        <div style="display:flex;gap:8px">
          <input type="number" id="steps-quick-input" placeholder="introdu pasi" inputmode="numeric"
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
        <div style="font-size:12px;color:var(--text2)">😴 Recuperare activa · Mobilitate · Stretching</div>
      </div>`;
  } else {
    // WORKOUT day
    const todayR = getTodayReadiness();

    // Construieste sesiunea prin Director — sursa unica de adevar
    let _dirSession = sessionCache.get();
    if (!_dirSession) {
      try {
        _dirSession = await coachDirector.buildSession(tp.t.toUpperCase());
        sessionCache.set(_dirSession);
      } catch {
        _dirSession = null;
        sessionCache.invalidate();
      }
    }
    setCachedDirector(_dirSession);

    // Zi de odihna fortata de Director (readiness < 40)
    if (_dirSession?.restDay) {
      cmdEl.textContent = 'ZI DE ODIHNA';
      cmdEl.style.color = 'var(--text2)';
      if(startBtn) startBtn.style.display='none';
      const _tplOff=$('today-preview-list');
      if(_tplOff) _tplOff.innerHTML=`<div style="margin:0 16px 12px;background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:18px 16px;text-align:center"><div style="font-size:28px;margin-bottom:8px">🛌</div><div style="font-size:14px;font-weight:600;color:var(--text2)">Zi de odihna recomandata</div><div style="font-size:12px;color:var(--text3);margin-top:6px">${_dirSession.message}</div></div>`;
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
      const yDate = todDate(yesterday);
      const kcals = DB.get('kcals')||{}, prots = DB.get('prots')||{};
      return getReadinessScore(todayR, kcals[yDate], prots[yDate], KCAL_TARGET, PROT_TARGET);
    })();
    const _isInCut = isInCutPhase();
    const verdict = readinessScore != null ? getReadinessVerdict(readinessScore, { isInCut: _isInCut }) : null;

    // Exercise list — skip occupied/unavailable equipment
    const occupiedEquip = DB.get('equipment-occupied-session') || [];
    const unavailEquip = DB.get('unavailable-equipment') || [];
    let rawExList = (tp.ex||[]).filter(e => !unavailEquip.includes(cleanEx(e.n||'')));
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
      ${(()=>{
        if (!shouldShowPatternBanner(_dirSession?.context)) return '';
        const ctx = _dirSession.context;
        const messages = ctx.patterns
          .map(formatPatternMessage)
          .filter(m => m !== null);
        if (messages.length === 0) return '';
        return `<div style="margin:0 16px 10px;padding:10px 14px;background:rgba(255,149,0,0.06);border-radius:var(--rs);border:1px solid rgba(255,149,0,0.2)">
          ${messages.map(m => `<div style="font-size:11px;color:var(--accent2);font-weight:600">${m}</div>`).join('')}
        </div>`;
      })()}
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
        <div style="font-size:11px;color:var(--text3);margin-bottom:10px;text-transform:uppercase;letter-spacing:1px">Cum te simti azi?</div>
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
                <button onclick="markEquipmentUnavailable('${cleanName.replace(/'/g,'\\\'')}')" style="font-size:9px;padding:2px 7px;background:rgba(255,68,68,0.07);border:1px solid rgba(255,68,68,0.2);border-radius:4px;color:var(--red);cursor:pointer;font-family:'DM Sans',sans-serif">🚫 Lipsa</button>
                <button onclick="showWhyForExercise('${cleanName.replace(/'/g,'\\\'')}')" style="font-size:9px;padding:2px 7px;background:rgba(100,150,255,0.08);border:1px solid rgba(100,150,255,0.2);border-radius:4px;color:var(--accent);cursor:pointer;font-family:'DM Sans',sans-serif">❓ De ce?</button>
              </div>
            </div>
            <div style="text-align:right;flex-shrink:0">
              <div style="font-family:'Bebas Neue',sans-serif;font-size:20px;color:${hasHistory?rec.statusColor:'var(--text3)'}">${rec.kg}kg</div>
              <div style="font-size:9px;padding:2px 6px;border-radius:10px;background:${hasHistory?rec.statusColor+'22':'rgba(255,255,255,0.07)'};color:${hasHistory?rec.statusColor:'var(--text3)'};margin-top:2px">${hasHistory?(rec.status==='INCREASE'?'🟢 Crestem':rec.status==='TOO HEAVY'?'🔴 E prea greu':rec.status==='STAGNANT +SET'?'🟡 Plus un set':rec.status==='SCALE BACK'?'🟡 Scadem un pas':rec.status==='CONSOLIDATE'?'🟡 Consolidam':'🟢 In tinta'):'🟡 Pornim'}</div>
            </div>
          </div>`;
        }).join('')}
        ${exList.length>SHOW_LIMIT?`<div onclick="toggleExList(${todayDayIdx})" style="padding:10px 16px;text-align:center;cursor:pointer;color:var(--accent);font-size:12px;border-top:1px solid var(--border)">
          ${isExpanded?'▴ Restrange':`▾ +${hiddenCount} exercitii`}
        </div>`:''}
      </div>`;

    // AA friction modal — fires after DOM is flushed, non-blocking (ADR 013 §6 §7).
    // MUST live inside this `else` block — _dirSession is scoped to the WORKOUT branch.
    // DOM is already rendered with the reduced plan; modal appears on top ~100ms later.
    // If user overrides, session is updated and re-rendered. If user dismisses 3×
    // consecutively (backdrop/swipe), modalManager.isSuppressed() silences it.
    if (
      _dirSession?.aaBlocked?.requiresFrictionConfirmation
      && !modalManager.isSuppressed('aa-friction')
      && !isAAFrictionDismissedToday()
    ) {
      setTimeout(() => {
        modalManager.show({
          id: 'aa-friction',
          category: 'coaching',
          present: () => showAAFrictionModal(_dirSession, _dirSession.context),
          onComplete: (result) => {
            // Mark handled so subsequent renders don't re-trigger.
            if (_dirSession?.aaBlocked) _dirSession.aaBlocked.requiresFrictionConfirmation = false;
            if (result?.action === 'override') {
              _dirSession.exercises = _dirSession.exercises.map(e => ({
                ...e,
                sets: e.aaOriginalSets ?? e.sets,
                aaReduced: false,
                aaOverridden: true,
              }));
              _dirSession.aaOverride = { rationale: result.overrideRationale ?? 'override-button', timestamp: Date.now() };
              sessionCache.set(_dirSession);
              renderCoachIdle();
            } else {
              sessionCache.set(_dirSession);
            }
          },
        });
      }, 100);
    }
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

}

export function toggleExList(dayIdx) {
  uiToggleFlags.exListExpanded[dayIdx] = !uiToggleFlags.exListExpanded[dayIdx];
  renderCoachIdle();
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
    // Afisam un banner non-intruziv pe coach screen
    const existing = $('weight-reminder-banner');
    if (existing) return;
    const banner = document.createElement('div');
    banner.id = 'weight-reminder-banner';
    banner.style.cssText = 'position:fixed;bottom:70px;left:16px;right:16px;background:var(--card);border:1px solid var(--accent2);border-radius:var(--rs);padding:12px 16px;z-index:50;display:flex;align-items:center;justify-content:space-between;gap:12px';
    banner.innerHTML = `
      <div>
        <div style="font-size:13px;font-weight:700;color:var(--accent2)">AI GRIJA — ${daysSince} ZILE FARA GREUTATE</div>
        <div style="font-size:11px;color:var(--text3);margin-top:2px">Verifica greutatea in ultimele zile</div>
      </div>
      <button onclick="sp('weight',document.querySelectorAll('.nb')[2]);document.getElementById('weight-reminder-banner').remove()"
        style="background:var(--accent2);color:#000;font-weight:700;font-size:11px;padding:8px 14px;border:none;border-radius:var(--rs);cursor:pointer;font-family:'DM Sans',sans-serif;white-space:nowrap">LOGHEAZA</button>
    `;
    document.body.appendChild(banner);
    setTimeout(() => { if(banner.parentNode) banner.remove(); }, 15000);
  }
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
      const yStr=todDate(yesterday);
      streaks.count=streaks.lastDate===yStr?streaks.count+1:1;
      streaks.lastDate=today;
      streaks.totalDays=(streaks.totalDays||0)+1;
      DB.set('step-streaks',streaks);
    }
    toast('✅ Quest completat! 🔥','var(--purple)');
  } else {
    toast(`✓ ${steps.toLocaleString()} pasi`);
  }
  renderCoachIdle();
}
