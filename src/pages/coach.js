// ══ COACH PAGE ══════════════════════════════════════════════
import { DB, $, tod, cleanEx } from '../db.js';
import { PROG, EX_SETS, COMPOUND_EX, PAUSE_COMPOUND, PAUSE_ISO } from '../constants.js';
import { DP } from '../engine/dp.js';
import { AA } from '../engine/aa.js';
import { SYS } from '../engine/sys.js';
import { toast, beep, beepDone, beepAlert, speak, showCoachFlash, showFlashFeedback, showPauseScreen, hidePauseScreen } from '../ui/ui.js';
import { state } from '../state.js';

const muscleEmoji = { spate:'🔵', piept:'🟡', umeri:'🟠', brate:'🟤', picioare:'🟢', triceps:'⚪' };
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

  speak(`Set ${state.currentSet}. ${state.currentEx}. Metti ${rec.kg} chili. ${rec.repsTarget} repetizioni.`);
}

export function setDone(){
  if(!state.currentEx){toast('⚠ Selectează exercițiu','var(--accent2)');return;}
  beepDone();
  $('set-actions').style.display='none';
  $('rpe-inline').style.display='block'; // step 1: reps
  $('rpe-screen').style.display='none';
  state.awaitingRPE = false; // not yet — waiting for reps confirm first
}

export function confirmReps(){
  // User confirmed reps — now show RPE picker
  $('rpe-inline').style.display='none';
  $('rpe-screen').style.display='block';
  const sumEl = $('rpe-reps-summary');
  if(sumEl) sumEl.textContent = `${state.sessRepsInput} reps · ${state.currentEx}`;
  state.awaitingRPE = true;
}

export function selectRPE(rpe){
  if(!state.awaitingRPE)return;
  state.awaitingRPE = false;
  $('rpe-screen').style.display='none';
  $('set-actions').style.display='flex';

  const rec=AA.applyTo(DP.recommend(state.currentEx), state.currentEx);
  const totalSets=EX_SETS[state.currentEx]||3;
  const isComp=COMPOUND_EX.includes(state.currentEx);
  const inc=DP.getIncrement(state.currentEx);

  // Save log
  const logs=DB.get('logs')||[];
  const noteArr=[...state.activeNotes]; resetNotes();
  const logKg = state.sessionKgOverride !== null ? state.sessionKgOverride : rec.kg;
  state.sessionKgOverride = null; // reset după fiecare set
  logs.unshift({date:tod(),ex:state.currentEx,w:logKg,sets:1,reps:String(state.sessRepsInput),rpe,notes:noteArr,ts:Date.now(),session:state.sessStart});
  DB.set('logs',logs.slice(0,500));
  state.sessLog.push({ex:state.currentEx,kg:logKg,rpe,set:state.currentSet,reps:state.sessRepsInput});
  const ssc=$('sess-progress-txt');if(ssc)ssc.textContent=`${state.completedExercises.size}/${state.sessionTotalExercises||getTodayExercises().length}`;

  // In-session RPE 10 × 2 → immediate adjust
  const thisExSessLogs=state.sessLog.filter(s=>s.ex===state.currentEx);
  const thisExSessRPEs=thisExSessLogs.map(s=>s.rpe);
  const thisExSessReps=thisExSessLogs.map(s=>s.reps||0);
  const inSessAdj=DP.checkInSessionAdjust(state.currentEx,thisExSessRPEs,thisExSessReps);
  if(inSessAdj.adjust){
    if(inSessAdj.dir==='down'){
      showCoachFlash('dn',`SCADE AZI LA ${inSessAdj.newKg} KG`,`2× RPE 10 — prea greu`);
      speak(`Prea greu. Scade la ${inSessAdj.newKg} kilograme.`);
    } else {
      showCoachFlash('up',`CREȘTE AZI LA ${inSessAdj.newKg} KG`,`2× RPE 6 — prea ușor`);
      speak(`Ușor. Crește la ${inSessAdj.newKg} kilograme.`);
    }
    // Forțează greutatea pentru setul următor
    state.sessionKgOverride = inSessAdj.newKg;
    // Actualizează afișajul imediat
    const kgEl = $('rec-kg-big');
    if(kgEl) { kgEl.textContent = inSessAdj.newKg; kgEl.style.color = inSessAdj.dir==='down'?'var(--red)':'var(--green)'; }
  } else {
    showFlashFeedback(rpe, logKg, state.currentEx, DP);
  }

  // Advance
  if(state.currentSet>=totalSets){
    // Exercise done — move to next
    state.completedExercises.add(state.currentEx);
    updateSessionProgress();
    const todayExs=getTodayExercises();
    const idx=todayExs.indexOf(state.currentEx);
    if(idx<todayExs.length-1){
      const nextEx=todayExs[idx+1];
      const isCompound=COMPOUND_EX.includes(state.currentEx);
      const pauseSec=isCompound?PAUSE_COMPOUND:PAUSE_ISO;
      state.currentEx = nextEx; state.currentSet = 1;
      startPause(pauseSec, nextEx);
    } else {
      speak('Antrenament complet! Excelent!');
      toast('✅ Toate exercițiile completate!','var(--green)');
      endSession();
    }
  } else {
    state.currentSet++;
    const isComp2=COMPOUND_EX.includes(state.currentEx);
    startPause(isComp2?PAUSE_COMPOUND:PAUSE_ISO, state.currentEx);
  }
  renderSessLog();
}

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

function closeSummary(){
  const m=document.getElementById('summary-modal');
  if(m) m.remove();
  const ts=$('today-screen'); if(ts)ts.style.display='block';
  renderCoachIdle();
  renderDash();
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

  const modal = document.createElement('div');
  modal.id = 'rating-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:200;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px';
  modal.innerHTML = `
    <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:2px;margin-bottom:12px">SESIUNE COMPLETĂ</div>
    <div style="font-family:'Bebas Neue',sans-serif;font-size:42px;color:var(--text);margin-bottom:8px;text-align:center">CUM A FOST?</div>
    <div style="font-size:13px;color:var(--text3);margin-bottom:40px">${summaryData.totalSets} seturi · ${summaryData.mins} min</div>
    <div style="display:flex;flex-direction:column;gap:12px;width:100%;max-width:340px">
      <button onclick="rateSession('easy', ${JSON.stringify(summaryData).replace(/"/g,'&quot;')})"
        style="padding:20px;background:rgba(48,209,88,0.1);border:2px solid var(--green);border-radius:var(--rs);color:var(--green);font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:1px;cursor:pointer">
        ⚡ UȘOARĂ — MAI POT
      </button>
      <button onclick="rateSession('normal', ${JSON.stringify(summaryData).replace(/"/g,'&quot;')})"
        style="padding:20px;background:rgba(200,255,0,0.08);border:2px solid var(--accent);border-radius:var(--rs);color:var(--accent);font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:1px;cursor:pointer">
        👍 NORMALĂ — OK
      </button>
      <button onclick="rateSession('hard', ${JSON.stringify(summaryData).replace(/"/g,'&quot;')})"
        style="padding:20px;background:rgba(255,59,48,0.08);border:2px solid var(--red);border-radius:var(--rs);color:var(--red);font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:1px;cursor:pointer">
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
    'hard':   ['fatigue', 'sleep']
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

  // Șterge modalul și arată summary
  const modal = document.getElementById('rating-modal');
  if (modal) modal.remove();

  const moodLabel = rating === 'easy' ? '⚡ Sesiune ușoară' : rating === 'hard' ? '💀 Sesiune grea' : '👍 Sesiune normală';
  showSessionSummary({...summaryData, moodLabel});
}

export function editSessionKg() {
  const big = $('rec-kg-big');
  const wrap = $('kg-edit-input-wrap');
  const inp = $('kg-edit-input');
  if (!big || !wrap || !inp) return;
  inp.value = big.textContent;
  big.style.display = 'none';
  wrap.style.display = 'block';
  inp.focus();
  inp.select();
}

export function confirmEditKg() {
  const big = $('rec-kg-big');
  const wrap = $('kg-edit-input-wrap');
  const inp = $('kg-edit-input');
  if (!big || !wrap || !inp) return;

  const val = parseFloat(inp.value);
  if (!isNaN(val) && val > 0 && val < 500) {
    const rec = AA.applyTo(DP.recommend(state.currentEx), state.currentEx);
    const diff = Math.abs(val - rec.kg);
    const pct = diff / rec.kg;

    state.sessionKgOverride = DP.roundToStep(val, state.currentEx);
    big.textContent = state.sessionKgOverride;

    // Dacă diferă >30% — resetează baseline pentru exercițiu
    if (pct > 0.3) {
      toast(`GREUTATE CORECTATĂ: ${rec.kg}→${state.sessionKgOverride}kg — BASELINE ACTUALIZAT`, 'var(--accent2)');
      // Marchează logurile baseline ca depășite
      const logs = DB.get('logs') || [];
      logs.filter(l => l.ex === state.currentEx && l.baseline).forEach(l => { l.baselineReset = true; });
      DB.set('logs', logs);
    } else {
      toast(`${state.sessionKgOverride}kg ✓`, 'var(--accent)');
    }
  }

  big.style.display = 'block';
  wrap.style.display = 'none';
}

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

export function calculateFatigueScore() {
  const logs = DB.get('logs') || [];
  const wb = DB.get('wellbeing') || {};

  // Grupează ultimele 4 sesiuni
  const sessions = {};
  logs.filter(l => !l.baseline && l.session).forEach(l => {
    if (!sessions[l.session]) sessions[l.session] = [];
    sessions[l.session].push(l);
  });
  const last4 = Object.values(sessions)
    .sort((a,b) => b[0].ts - a[0].ts)
    .slice(0, 4);

  if (last4.length < 2) {
    return { score: 0, label: 'DATE INSUFICIENTE', color: 'var(--text3)',
      detail: 'Completează 2+ sesiuni pentru fatigue score', recommend: 'none' };
  }

  // ── Semnale ──────────────────────────────────────────────────────────────
  const allNotes = last4.flatMap(s => s.flatMap(l => l.notes || []));
  const sleepBad  = allNotes.filter(n => n === 'sleep').length;
  const fatigue   = allNotes.filter(n => n === 'fatigue').length;
  const formBad   = allNotes.filter(n => n === 'form').length;
  const strong    = allNotes.filter(n => n === 'strong').length;

  // RPE mediu din ultimele 4 sesiuni (top sets)
  const sessionRPEs = last4.map(s => {
    const rpes = s.filter(l=>l.rpe).map(l=>l.rpe).sort((a,b)=>b-a).slice(0,2);
    return rpes.length ? rpes.reduce((a,b)=>a+b,0)/rpes.length : 7;
  });
  const avgRPE = sessionRPEs.reduce((a,b)=>a+b,0) / sessionRPEs.length;
  const rpeRising = sessionRPEs.length >= 3 &&
    sessionRPEs[0] > sessionRPEs[sessionRPEs.length-1] + 0.6;

  // Somn din wellbeing (ultimele 4 zile)
  const recentDates = Object.keys(wb).sort().reverse().slice(0, 4);
  const avgSleep = recentDates.length
    ? recentDates.reduce((a,d) => a + (wb[d]?.sleep || 3), 0) / recentDates.length
    : 3;

  // ── Calculează scor (0-100, mai mare = mai obosit) ─────────────────────
  let score = 0;
  score += sleepBad  * 13;
  score += fatigue   * 11;
  score += formBad   * 7;
  score -= strong    * 9;
  score += Math.max(0, (avgRPE - 7.5) * 11);
  score += rpeRising ? 12 : 0;
  score += (avgSleep <= 2.5) ? 18 : (avgSleep <= 3.5) ? 7 : 0;
  score = Math.max(0, Math.min(100, Math.round(score)));

  // ── Verdict ──────────────────────────────────────────────────────────────
  let label, color, recommend, detail, icon;

  if (score >= 65 || fatigue >= 4 || sleepBad >= 3) {
    label = 'DELOAD RECOMANDAT';
    icon = '🔴';
    color = 'var(--red)';
    recommend = 'deload';
    detail = `Scor ${score}/100 · ${fatigue}× oboseală + ${sleepBad}× somn prost · Redu volumul 30–40% săptămâna asta`;
  } else if (score >= 40 || (avgRPE >= 8.7 && rpeRising)) {
    label = 'RECUPERARE ACTIVĂ';
    icon = '🟠';
    color = 'var(--accent2)';
    recommend = 'reduce';
    detail = `Scor ${score}/100 · RPE ${avgRPE.toFixed(1)} ${rpeRising?'↑ în creștere':''} · Nu crești greutățile, focus tehnică`;
  } else if (score <= 15 && strong >= 2) {
    label = 'FORMĂ EXCELENTĂ';
    icon = '🟢';
    color = 'var(--green)';
    recommend = 'push';
    detail = `Scor ${score}/100 · Recuperare excelentă · Poți împinge mai mult azi`;
  } else {
    label = 'PROGRESEAZĂ NORMAL';
    icon = '🟢';
    color = 'var(--green)';
    recommend = 'normal';
    detail = `Scor ${score}/100 · Totul în limite normale`;
  }

  return { score, label, icon, color, recommend, detail, avgRPE, sleepBad, fatigue, strong };
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
  renderDash();
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
