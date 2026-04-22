// ══ COACH PAGE ══════════════════════════════════════════════
import { DB, $, tod, cleanEx } from '../db.js';
import { syncToFirebase } from '../firebase.js';
import { PROG, EX_SETS, COMPOUND_EX, PAUSE_COMPOUND, PAUSE_ISO } from '../constants.js';
import { DP } from '../engine/dp.js';
import { AA } from '../engine/aa.js';
import { SYS } from '../engine/sys.js';
import { toast, beep, beepDone, beepAlert, speak, showCoachFlash, showFlashFeedback, showPauseScreen, hidePauseScreen } from '../ui/ui.js';
import { state } from '../state.js';
import { calculateFatigueScore } from '../engine/fatigue.js';

const muscleEmoji = { spate:'🔵', piept:'🟡', umeri:'🟠', brate:'🟤', picioare:'🟢', triceps:'⚪' };

let wakeLock = null;

export function resetNotes() { state.activeNotes.clear(); }

export function toggleMute() {
  state.isMuted = !state.isMuted;
  DB.set('muted', state.isMuted);
  const btn = $('mute-btn');
  if (btn) btn.textContent = state.isMuted ? '🔇' : '🔊';
}

export function skipPause() {
  stopPause();
  hidePauseScreen();
  updateExCard();
}

export function getGroupColor(g) {
  const c = {spate:'#4fc3f7',piept:'#ffd54f',umeri:'#ffb74d',brate:'#a1887f',picioare:'#81c784',triceps:'#e0e0e0'};
  return c[g] || 'var(--text3)';
}
function renderFatigueScore(elId) {
  const el = $(elId); if (!el) return;
  const f = calculateFatigueScore();
  el.innerHTML = `<span style="color:${f.color};font-size:11px;font-weight:600">${f.icon||''} ${f.label}</span><div style="font-size:10px;color:var(--text3);margin-top:2px">${f.detail}</div>`;
}
function renderTodayAlerts() {}
function tickSess() {}
function beepStart() { if (typeof beep === 'function') beep(660, 0.1); }
const dayColors = {
  'Marți':   {bg:'rgba(10,132,255,0.06)', border:'rgba(10,132,255,0.2)',  text:'rgba(10,132,255,0.9)'},
  'Miercuri':{bg:'rgba(200,255,0,0.06)',  border:'rgba(200,255,0,0.2)',   text:'rgba(200,255,0,0.9)'},
  'Joi':     {bg:'rgba(255,149,0,0.06)',  border:'rgba(255,149,0,0.2)',   text:'rgba(255,149,0,0.9)'},
  'Vineri':  {bg:'rgba(48,209,88,0.06)',  border:'rgba(48,209,88,0.2)',   text:'rgba(48,209,88,0.9)'},
  'Sâmbătă': {bg:'rgba(191,90,242,0.06)',border:'rgba(191,90,242,0.2)', text:'rgba(191,90,242,0.9)'},
};


export function renderCoachIdle(){
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

    // Exercise preview with weights + lagging badges
    const exList=tp.ex||[];
    const _tpl=$('today-preview-list');if(_tpl)_tpl.innerHTML=`
      ${laggingAlerts.length?`<div style="margin:0 16px 10px;padding:11px 14px;background:rgba(255,107,53,0.07);border-radius:var(--rs);border:1px solid rgba(255,107,53,0.2)">
        ${laggingAlerts.map(a=>`<div style="font-size:12px;color:var(--accent2);font-weight:600;margin-bottom:3px">⚠️ ${a}</div>`).join('')}
      </div>`:''}
      <div style="background:var(--card);border:1px solid var(--border);border-radius:var(--r);margin:0 16px 12px;overflow:hidden">
        ${exList.map((e,i)=>{
          const cleanName=cleanEx(e.n);
          const rec=AA.applyTo(DP.recommend(cleanName), cleanName);
          const hasHistory=DP.getLogs(cleanName,1).length>0;
          const isLagging=laggingAlerts.some(a=>a.includes(getExGroup(cleanName)));
          return `<div style="display:flex;align-items:center;gap:10px;padding:11px 14px;${i<exList.length-1?'border-bottom:1px solid var(--border)':''}">
            <div style="width:6px;height:6px;border-radius:50%;background:${getGroupColor(e.g)};flex-shrink:0"></div>
            <div style="flex:1">
              <div style="font-size:13px;font-weight:500">${cleanName}</div>
              <div style="font-size:10px;color:var(--text3);margin-top:1px">${e.s||''}${e.ss?' · <span style="color:var(--accent2)">SS</span>':''}</div>
            </div>
            ${hasHistory?`<div style="text-align:right">
              <div style="font-family:'Bebas Neue',sans-serif;font-size:20px;color:${rec.statusColor}">${rec.kg}kg</div>
              <div style="font-size:9px;padding:2px 6px;border-radius:10px;background:${rec.statusColor}22;color:${rec.statusColor};margin-top:2px">${rec.status==='INCREASE'?'🟢 CREȘTI':rec.status==='TOO HEAVY'?'🔴 PREA GREU':rec.status==='STAGNANT +SET'?'🟡 STAGNARE':rec.status==='CONSOLIDATE'?'🟡 REPS':'🟢 OK'}</div>
            </div>`:`<div style="font-size:10px;color:var(--text3);font-family:'JetBrains Mono',monospace">NOU</div>`}
          </div>`;
        }).join('')}
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
}

export function startSession(){
  state.sessActive = true;state.sessStart = Date.now();state.sessLog = [];state.sessKcalBurn = 0;state.dropSetUsedThisSession = false;
  requestWakeLock();
  state.completedExercises = new Set();
  state.isMuted = DB.get('muted')||false;
  const mb=$('mute-btn');if(mb){mb.textContent=state.isMuted?'🔇':'🔊';mb.style.color=state.isMuted?'var(--accent2)':'var(--text2)';}
  const todayExsForCount=getTodayExercises();
  state.sessionTotalExercises = todayExsForCount.length;
  const ts=$('today-screen');if(ts)ts.style.display='none';
  $('session-ui').style.display='block';
  state.sessTimer = setInterval(tickSess,1000);
  beepStart();speak('Antrenament pornit.');
  toast('🔥 START!');

  // Auto-select first exercise of today
  const todayExs=getTodayExercises();
  if(todayExs.length>0){
    state.currentEx = todayExs[0];
    state.currentSet = 1;
    updateExCard();
  }
  renderSessLog();
}

export function updateExCard(){
  if(!state.currentEx)return;
  const rec=AA.applyTo(DP.recommend(state.currentEx), state.currentEx);
  const totalSets=EX_SETS[state.currentEx]||3;
  const tempo=SYS.getTempo(state.currentEx);
  const techniques=SYS.getTechniques(state.currentEx,state.currentSet,totalSets);

  // Exercise info
  const grp=getExGroup(state.currentEx);
  $('ex-group-label').textContent=grp;
  $('ex-name-display').textContent=state.currentEx;

  // Progression badge
  const pb=$('progression-badge');
  pb.textContent=rec.statusLabel;
  pb.style.background=rec.statusColor+'22';
  pb.style.color=rec.statusColor;
  pb.style.border=`1px solid ${rec.statusColor}44`;

  // Main numbers
  $('rec-kg-big').textContent=rec.kg;
  $('rec-kg-big').style.color=rec.status==='TOO HEAVY'?'var(--red)':rec.status==='INCREASE'?'var(--green)':'var(--accent)';
  $('rec-reps-big').textContent=rec.repsTarget;
  $('rec-rir').textContent=`RIR ${tempo.rir}`;
  $('rec-set-big').textContent=state.currentSet;
  $('rec-set-total').textContent=`din ${totalSets}`;

  // Last performance
  const lastLog=DP.getLogs(state.currentEx,1)[0];
  if(lastLog){
    $('last-perf').textContent=`Last: ${lastLog.w}kg × ${lastLog.reps||'?'} reps · RPE ${lastLog.rpe||'?'}`;
  } else {
    $('last-perf').textContent='Prima sesiune la acest exercițiu';
  }

  // Tempo + technique
  let tempoTxt=`Tempo: ${tempo.tempo} · ${tempo.note}`;
  if(techniques.length) tempoTxt+=` · ${techniques[0].icon} ${techniques[0].label}`;
  if(rec.technique) tempoTxt=`⚡ ${rec.technique} · ${tempoTxt}`;
  $('tempo-row').textContent=tempoTxt;

  // Coach message — show auto-adjust OR progression note
  const msg=$('coach-msg-box');
  if(rec.autoAdjusted){
    msg.style.display='block';
    msg.textContent=rec.autoAdjustMsg.includes('scad')?`⚙️ AUTO: TOO HEAVY → −${DP.getIncrement(state.currentEx)}kg`:`⚙️ AUTO: TOO EASY → +${DP.getIncrement(state.currentEx)}kg`;
    msg.style.background=rec.autoAdjustColor+'15';
    msg.style.color=rec.autoAdjustColor;
    msg.style.border=`2px solid ${rec.autoAdjustColor}44`;
  } else if(rec.progressionStage>=2){
    msg.style.display='block';
    msg.textContent=rec.progressionNote;
    msg.style.background=rec.statusColor+'15';
    msg.style.color=rec.statusColor;
    msg.style.border=`2px solid ${rec.statusColor}44`;
  } else {
    msg.style.display='none';
  }

  // Sets dots
  $('sets-dots').innerHTML=Array.from({length:totalSets},(_,i)=>`
    <div style="flex:1;height:6px;border-radius:3px;background:${i<state.currentSet-1?'var(--accent)':i===state.currentSet-1?'rgba(200,255,0,0.4)':'var(--bg3)'};transition:background .3s"></div>
  `).join('');

  // Reset reps input to target
  state.sessRepsInput = rec.repsTarget;
  $('session-reps').textContent=state.sessRepsInput;

  // Always show action buttons, hide input screens
  $('set-actions').style.display='flex';
  $('rpe-inline').style.display='none';
  $('rpe-screen').style.display='none';

  speak(`Set ${state.currentSet}. ${state.currentEx}. Metti ${rec.kg} chili. ${rec.repsTarget} repetizioni.`);
}

export function setDone(){
  if(!state.currentEx){toast('⚠ Selectează exercițiu','var(--accent2)');return;}
  beepDone();
  $('set-actions').style.display='none';
  $('rpe-inline').style.display='block';
}

export function confirmReps(){
  $('rpe-inline').style.display='none';

  const rec=AA.applyTo(DP.recommend(state.currentEx), state.currentEx);
  const totalSets=EX_SETS[state.currentEx]||3;

  // Save log with neutral RPE — session rating at the end adjusts notes
  const logs=DB.get('logs')||[];
  const noteArr=[...state.activeNotes]; resetNotes();
  const logKg = state.sessionKgOverride !== null ? state.sessionKgOverride : rec.kg;
  state.sessionKgOverride = null;
  logs.unshift({date:tod(),ex:state.currentEx,w:logKg,sets:1,reps:String(state.sessRepsInput),rpe:8,notes:noteArr,ts:Date.now(),session:state.sessStart});
  DB.set('logs',logs.slice(0,500));
  state.sessLog.push({ex:state.currentEx,kg:logKg,rpe:8,set:state.currentSet,reps:state.sessRepsInput});
  const ssc=$('sess-progress-txt');if(ssc)ssc.textContent=`${state.completedExercises.size}/${state.sessionTotalExercises||getTodayExercises().length}`;

  // Advance to next set or next exercise
  if(state.currentSet>=totalSets){
    state.completedExercises.add(state.currentEx);
    updateSessionProgress();
    const todayExs=getTodayExercises();
    const idx=todayExs.indexOf(state.currentEx);
    if(idx<todayExs.length-1){
      const nextEx=todayExs[idx+1];
      const pauseSec=COMPOUND_EX.includes(state.currentEx)?PAUSE_COMPOUND:PAUSE_ISO;
      state.currentEx=nextEx; state.currentSet=1;
      startPause(pauseSec, nextEx);
    } else {
      speak('Antrenament complet! Excelent!');
      toast('✅ Toate exercițiile completate!','var(--green)');
      endSession();
    }
  } else {
    state.currentSet++;
    startPause(COMPOUND_EX.includes(state.currentEx)?PAUSE_COMPOUND:PAUSE_ISO, state.currentEx);
  }
  renderSessLog();
}

export function selectRPE(rpe){ /* no-op — RPE collected only at end-of-session via rateSession */ }

export function startPause(sec, nextEx=''){
  stopPause();
  state.pauseTotal = sec;state.pauseLeft = sec;
  $('ps-timer').textContent=sec;
  $('ps-progress').style.width='100%';
  const recNext=nextEx?DP.recommend(nextEx):{};
  $('ps-next').textContent=nextEx?`URMEAZĂ: ${nextEx}`:'';
  $('ps-rec-kg').textContent=recNext.kg?`${recNext.kg} kg`:'';
  $('ps-rec-reps').textContent=recNext.repsTarget?`${recNext.repsTarget} reps · RIR ${SYS.getTempo(nextEx||'').rir||2}`:'';
  showPauseScreen();
  speak(`Pauza de ${sec} secunde.`);

  state.pauseTimer = setInterval(()=>{
    state.pauseLeft--;
    $('ps-timer').textContent=state.pauseLeft;
    $('ps-progress').style.width=(state.pauseLeft/state.pauseTotal*100)+'%';
    if(state.pauseLeft ===10){beep(660,.1);speak('10 secunde.');}
    if(state.pauseLeft<=3&&state.pauseLeft>0) beep(880,.08);
    if(state.pauseLeft<=0){
      stopPause(); hidePauseScreen();
      beepAlert();
      speak(`${nextEx||state.currentEx}. Gata!`);
      updateExCard();
    }
  },1000);
}

export function stopPause(){clearInterval(state.pauseTimer);state.pauseTimer = null;}

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
  stopPause(); state.sessActive = false;
  // Șterge din DB toate logurile din sesiunea curentă (scrise la selectRPE)
  if(state.sessStart) {
    const logs = DB.get('logs') || [];
    const cleaned = logs.filter(l => l.session !== state.sessStart);
    DB.set('logs', cleaned);
  }
  state.sessLog = [];
  if(window.speechSynthesis) window.speechSynthesis.cancel();
  $('session-ui').style.display='none';
  hidePauseScreen();
  $('today-screen').style.display='block';
  toast('❌ Antrenament anulat — nicio dată salvată','var(--red)');
  renderCoachIdle();
}

export function endSession(){
  if(!state.sessActive)return;
  clearInterval(state.sessTimer);state.sessTimer = null;
  stopPause();state.sessActive = false;
  releaseWakeLock();
  if(window.speechSynthesis) window.speechSynthesis.cancel();

  // Auto-delete test sessions (< 5 minutes)
  if(Date.now() - state.sessStart < 5 * 60 * 1000){
    const logs = DB.get('logs') || [];
    DB.set('logs', logs.filter(l => l.session !== state.sessStart));
    $('session-ui').style.display='none';
    const ts=$('today-screen'); if(ts)ts.style.display='block';
    toast('🧹 Sesiune test ștearsă automat','var(--accent2)');
    renderCoachIdle();
    if(window.renderDash) window.renderDash();
    return;
  }

  const mins=Math.round((Date.now()-state.sessStart)/60000);
  const kcal=Math.round(SYS.getCurrentKg()*0.09*mins);
  const burnLog=DB.get('session-burns')||[];
  // Save with day key for adaptive timer
  const dayKey = PROG[new Date().getDay()===0?6:new Date().getDay()-1]?.day || 'default';
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

  const sdJson = JSON.stringify(summaryData).replace(/"/g,'&quot;');

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
      <button onclick="rateSession('easy', ${sdJson})"
        style="padding:18px;background:rgba(48,209,88,0.1);border:2px solid var(--green);border-radius:var(--rs);color:var(--green);font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:1px;cursor:pointer">
        ⚡ UȘOARĂ — MAI POT
      </button>
      <button onclick="rateSession('normal', ${sdJson})"
        style="padding:18px;background:rgba(200,255,0,0.08);border:2px solid var(--accent);border-radius:var(--rs);color:var(--accent);font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:1px;cursor:pointer">
        👍 NORMALĂ — OK
      </button>
      <button onclick="rateSession('hard', ${sdJson})"
        style="padding:18px;background:rgba(255,59,48,0.08);border:2px solid var(--red);border-radius:var(--rs);color:var(--red);font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:1px;cursor:pointer">
        💀 GREA — LA LIMITĂ
      </button>
    </div>
  `;
  document.body.appendChild(modal);
}

export function rateSession(rating, summaryData) {
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

  // Push immediately — don't rely on 3s debounce since user may close app right after rating
  syncToFirebase().catch(() => {});

  // Șterge modalul și arată summary
  const modal = document.getElementById('rating-modal');
  if (modal) modal.remove();

  const moodLabel = rating === 'easy' ? '⚡ Sesiune ușoară' : rating === 'hard' ? '💀 Sesiune grea' : '👍 Sesiune normală';
  showSessionSummary({...summaryData, moodLabel});
}

export function editSessionKg() {
  const rec = AA.applyTo(DP.recommend(state.currentEx), state.currentEx);
  const startKg = state.sessionKgOverride !== null ? state.sessionKgOverride : (rec.kg || 20);
  const step = DP.getIncrement(state.currentEx);
  window._kgOvVal = startKg;

  document.getElementById('kg-edit-overlay')?.remove();
  const overlay = document.createElement('div');
  overlay.id = 'kg-edit-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:300;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px';
  overlay.innerHTML = `
    <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:2px;margin-bottom:6px">GREUTATE · SET ${state.currentSet}</div>
    <div style="font-size:13px;color:var(--text2);margin-bottom:24px">${state.currentEx}</div>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
      <button onclick="adjSessionKg(-${step*2})" style="width:58px;height:58px;background:var(--bg3);border:1px solid var(--border);border-radius:var(--rs);color:var(--text);font-size:13px;font-weight:700;cursor:pointer;font-family:'JetBrains Mono',monospace">−${step*2}</button>
      <button onclick="adjSessionKg(-${step})" style="width:58px;height:58px;background:var(--bg3);border:1px solid var(--border);border-radius:var(--rs);color:var(--text);font-size:18px;font-weight:700;cursor:pointer;font-family:'JetBrains Mono',monospace">−${step}</button>
      <div id="kg-ov-val" style="font-family:'Bebas Neue',sans-serif;font-size:72px;color:var(--accent);min-width:120px;text-align:center;line-height:1">${startKg}</div>
      <button onclick="adjSessionKg(${step})" style="width:58px;height:58px;background:var(--bg3);border:1px solid var(--border);border-radius:var(--rs);color:var(--text);font-size:18px;font-weight:700;cursor:pointer;font-family:'JetBrains Mono',monospace">+${step}</button>
      <button onclick="adjSessionKg(${step*2})" style="width:58px;height:58px;background:var(--bg3);border:1px solid var(--border);border-radius:var(--rs);color:var(--text);font-size:13px;font-weight:700;cursor:pointer;font-family:'JetBrains Mono',monospace">+${step*2}</button>
    </div>
    <div style="font-size:11px;color:var(--text3);margin-bottom:28px">Recomandat: ${rec.kg} kg</div>
    <button onclick="confirmSessionKg()" style="width:100%;max-width:320px;padding:18px;background:var(--accent);color:#000;font-weight:700;font-size:20px;border:none;border-radius:var(--r);cursor:pointer;font-family:'Bebas Neue',sans-serif;letter-spacing:1px">✓ CONFIRMĂ</button>
    <button onclick="document.getElementById('kg-edit-overlay')?.remove()" style="margin-top:12px;padding:12px;background:transparent;color:var(--text3);font-size:13px;border:none;cursor:pointer;font-family:'DM Sans',sans-serif">Anulează</button>
  `;
  document.body.appendChild(overlay);
}

export function adjSessionKg(delta) {
  window._kgOvVal = Math.round((window._kgOvVal + delta) * 10) / 10;
  const el = document.getElementById('kg-ov-val');
  if (el) el.textContent = window._kgOvVal;
}

export function confirmSessionKg() {
  const kg = window._kgOvVal;
  if (!kg || kg <= 0) return;
  state.sessionKgOverride = DP.roundToStep(kg, state.currentEx);
  const big = $('rec-kg-big');
  if (big) { big.textContent = state.sessionKgOverride; big.style.color = 'var(--accent2)'; }
  document.getElementById('kg-edit-overlay')?.remove();
  toast(`${state.sessionKgOverride} kg ✓`, 'var(--accent)');
}

export function confirmEditKg() { confirmSessionKg(); }

export function renderSessLog(){
  const sl=$('sess-log');
  if(!state.sessLog.length){sl.innerHTML='<div style="padding:16px;text-align:center;color:var(--text3);font-size:12px">Niciun set</div>';return;}
  sl.innerHTML=[...state.sessLog].reverse().map(s=>{
    const nc=s.rpe>=9?'var(--red)':s.rpe<=6.5?'var(--accent3)':'var(--green)';
    const nx=s.rpe>=9?'SCADE':s.rpe<=6.5?'CREȘTE':'MENȚINE';
    return `<div style="padding:10px 14px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-size:12px;font-weight:500">${s.ex}</div>
        <div style="font-size:10px;color:var(--text2);margin-top:1px">Set ${s.set} · ${s.kg}kg · ${s.reps||'?'} reps${s.notes&&s.notes.length?' · <span style="color:var(--accent2)">'+ s.notes.join(', ') +'</span>':''}</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-family:'Bebas Neue',sans-serif;font-size:24px;color:${nc}">${s.rpe}</span>
        <span style="font-size:9px;font-weight:700;padding:2px 6px;border-radius:4px;background:${nc}22;color:${nc}">${nx}</span>
      </div>
    </div>`;
  }).join('');
}

export function getTodayExercises() {
  const dayMap=[6,0,1,2,3,4,5];
  const tp=PROG[dayMap[new Date().getDay()]];
  if(!tp||tp.t==='off'||!tp.ex) return [];
  return tp.ex.map(e => cleanEx(e.n||''));
}

export function getExGroup(ex){
  const g={
    spate:['Lat Pulldown','Cable Row','Chest-Supported Row','Face Pulls'],
    piept:['Incline DB Press','Flat DB Press','Pec Deck / Cable Fly'],
    umeri:['DB Shoulder Press','Lateral Raises','Rear Delt Fly'],
    brate:['Incline DB Curl','Bayesian Curl','Cable Curl','Preacher Curl'],
    triceps:['Overhead Triceps','Pushdown'],
    picioare:['Romanian Deadlift','Leg Press','Leg Curl','Leg Extension','Calf Raises']
  };
  for(const[grp,exs]of Object.entries(g)){if(exs.some(e=>ex.includes(e)))return grp.toUpperCase();}
  return 'EXERCIȚIU';
}

export function adjSessionReps(d){
  state.sessRepsInput = Math.max(1,Math.min(30,state.sessRepsInput+d));
  $('session-reps').textContent=state.sessRepsInput;
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

export function getDisplayTime(prog) {
  if (!prog) return null;
  
  // After 3+ sessions: use adaptive average
  const adaptive = getAdaptiveTime(prog.day);
  if (adaptive) return `~${adaptive} min`;
  
  // Calculate accurately from program structure  
  const accurate = calcAccurateTime(prog);
  if (accurate) return `~${accurate} min`;
  
  // Fallback to stored tm
  if (prog.tm) return prog.tm.includes('min') ? prog.tm : `~${prog.tm}`;
  return null;
}

export function calcAccurateTime(prog) {
  if(!prog || !prog.ex || prog.ex.length === 0) return null;
  
  const COMPOUND_EX_LIST = ['Lat Pulldown','Cable Row','Incline DB Press',
    'DB Shoulder Press','Flat DB Press','Chest-Supported Row','Romanian Deadlift',
    'Leg Press','RDL'];
  
  let totalSeconds = 0;
  
  prog.ex.forEach(ex => {
    const isCompound = COMPOUND_EX_LIST.some(c => ex.n && ex.n.includes(c.split(' ')[0]));
    
    // Parse sets from string like "4×8-12" or "3×15-20"
    const setsMatch = ex.s ? ex.s.match(/^(\d+)/) : null;
    const sets = setsMatch ? parseInt(setsMatch[1]) : 3;
    
    // Time per set (seconds)
    const setTime = isCompound ? 45 : 30;
    
    // Rest time (seconds)  
    const restTime = isCompound ? 180 : 90;
    
    // Total per exercise: sets × set_time + (sets-1) × rest + transition
    const exTime = sets * setTime + (sets - 1) * restTime + 30; // 30s transition
    totalSeconds += exTime;
  });
  
  // Add: warmup (5min) + final cooldown (3min) + between-exercise transitions
  totalSeconds += 8 * 60;
  
  return Math.round(totalSeconds / 60); // return minutes
}

export function getAdaptiveTime(dayLabel) {
  const burns = DB.get('session-burns') || [];
  const dayBurns = burns.filter(b => b.day === dayLabel && b.mins > 10).slice(0, 5);
  if (dayBurns.length < 3) return null; // not enough data yet
  const avg = Math.round(dayBurns.reduce((a,b) => a + b.mins, 0) / dayBurns.length);
  return avg;
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

export function cleanFakeLogs() {
  const logs = DB.get('logs') || [];
  const before = logs.length;

  const sessions = {};
  logs.filter(l => !l.baseline).forEach(l => {
    if (!sessions[l.session]) sessions[l.session] = [];
    sessions[l.session].push(l);
  });

  // O sesiune e INVALIDĂ doar dacă are exact 1 set total (testing rapid)
  // Sesiunile cu 2+ seturi total sunt păstrate
  const validSessions = new Set(
    Object.entries(sessions)
      .filter(([, sets]) => sets.length >= 2)
      .map(([sid]) => sid)
  );

  const cleaned = logs.filter(l => l.baseline || validSessions.has(l.session));
  DB.set('logs', cleaned);
  const removed = before - cleaned.length;
  toast(`✅ Curățat ${removed} loguri (${cleaned.length} rămase)`, 'var(--green)');
  renderCoachIdle();
  if(window.renderDash)window.renderDash();
  console.log(`cleanFakeLogs: ${before} → ${cleaned.length} (removed ${removed})`);
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

export function renderPRWall() {
  const el = $('pr-wall-list');
  if (!el) return;
  const logs = DB.get('logs') || [];
  const nonBaseline = logs.filter(l => !l.baseline && l.w);

  // Per exercise: find the record (max kg), store date + reps
  const prMap = {};
  nonBaseline.forEach(l => {
    const ex = l.ex;
    const kg = parseFloat(l.w) || 0;
    const reps = parseInt(l.reps) || 0;
    if (!prMap[ex] || kg > prMap[ex].kg || (kg === prMap[ex].kg && reps > prMap[ex].reps)) {
      prMap[ex] = { kg, reps, date: l.date, ts: l.ts || 0 };
    }
  });

  const entries = Object.entries(prMap)
    .map(([ex, data]) => ({ ex, ...data }))
    .sort((a, b) => b.ts - a.ts || b.date.localeCompare(a.date));

  if (!entries.length) {
    el.innerHTML = '<div style="padding:14px 16px;color:var(--text3);font-size:12px">Niciun record încă. Completează sesiuni pentru a vedea PR-uri.</div>';
    return;
  }

  el.innerHTML = entries.map((e, i) => {
    const d = new Date(e.date);
    const dateStr = `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear().toString().slice(2)}`;
    return `<div style="display:flex;align-items:center;gap:12px;padding:10px 16px;${i < entries.length-1 ? 'border-bottom:1px solid var(--border)' : ''}">
      <div style="flex:1">
        <div style="font-size:13px;font-weight:700">${e.ex}</div>
        <div style="font-size:11px;color:var(--text3)">${dateStr}</div>
      </div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:16px;font-weight:700;color:var(--accent)">${e.kg} kg</div>
      <div style="font-size:11px;color:var(--text3);min-width:40px;text-align:right">×${e.reps||'—'}</div>
    </div>`;
  }).join('');
}

export function releaseWakeLock() {
  try { if(wakeLock) { wakeLock.release(); wakeLock = null; } } catch(e) {}
}

export async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen');
      console.log('✓ Wake Lock activ');
    }
  } catch(e) { console.log('Wake Lock:', e.message); }
}
