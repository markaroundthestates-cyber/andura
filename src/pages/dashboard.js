// ══ DASHBOARD PAGE ═══════════════════════════════════════════
import { DB, $, tod, fmt, cleanEx } from '../db.js';
import { PROG, KCAL_TARGET, PROT_TARGET, SW_KG, TW_KG, TARGET_DATE, START_DATE, DTOT } from '../constants.js';
import { SYS } from '../engine/sys.js';
import { toast } from '../ui/ui.js';
import { getTrend, initW } from './weight.js';
import { calculateFatigueScore } from '../engine/fatigue.js';
import { getRealityCheck } from '../engine/reality.js';
import { getAdherenceScore } from '../engine/adherence.js';
import { getTodayReadiness, saveReadiness, READINESS_LABELS } from '../engine/readiness.js';
import { getAppliedPatterns, dismissPattern } from '../engine/patternLearning.js';

const SW = SW_KG, TW = TW_KG, SD2 = START_DATE, TD2 = TARGET_DATE;
let _dashWeightChart = null;

function renderFatigueScore(elId) {
  const el = $(elId); if (!el) return;
  const f = calculateFatigueScore();
  el.style.display = 'block';
  el.innerHTML = `<span style="color:${f.color};font-size:11px;font-weight:600">${f.icon||''} ${f.label}</span><div style="font-size:10px;color:var(--text3);margin-top:2px">${f.detail}</div>`;
}

function calcProjection(ws, kcals, dates) {
  if (dates.length < 4) {
    const lastW = dates.length ? ws[dates[dates.length-1]] : 100;
    return { gaining: false, rate: 0, kg2w: lastW.toFixed(1), kg4w: lastW.toFixed(1), kg8w: lastW.toFixed(1) };
  }
  const recent = dates.slice(-8).map(d => ws[d]);
  const n = recent.length;
  const sumX = n*(n-1)/2, sumY = recent.reduce((a,b)=>a+b,0);
  const sumXY = recent.reduce((s,v,i)=>s+i*v,0), sumX2 = recent.reduce((s,_,i)=>s+i*i,0);
  const slope = (n*sumXY - sumX*sumY) / (n*sumX2 - sumX*sumX);
  const lastW = ws[dates[dates.length-1]];
  return {
    gaining: slope > 0,
    rate: Math.round(slope * 7 * 100) / 100,
    kg2w: (lastW + slope * 14).toFixed(1),
    kg4w: (lastW + slope * 28).toFixed(1),
    kg8w: (lastW + slope * 56).toFixed(1),
  };
}

function scheduleNotifications() {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SCHEDULE_NOTIF' });
  }
}


export function showRecoveryModal() {
  const existing = document.getElementById('recovery-modal');
  if (existing) { existing.remove(); return; }
  const modal = document.createElement('div');
  modal.id = 'recovery-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9000;display:flex;align-items:flex-end;justify-content:center';
  modal.innerHTML = `<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--r) var(--r) 0 0;width:100%;max-width:500px;padding:20px 20px 32px;max-height:80vh;overflow-y:auto">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
      <div style="font-size:16px;font-weight:700">😴 Ziua de Recuperare</div>
      <button onclick="document.getElementById('recovery-modal').remove()" style="background:none;border:1px solid var(--border);color:var(--text2);padding:4px 10px;border-radius:var(--rs);cursor:pointer;font-size:13px">✕</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:10px">
      ${[
        ['🚶', 'Mers 20-30 min', 'Circulație activă fără stres muscular'],
        ['🧘', 'Stretching / mobilitate', 'Concentrează-te pe grupele lucrate ieri'],
        ['💧', 'Hidratare', 'Minim 2.5L apă — recuperarea depinde de asta'],
        ['😴', 'Somn 7-9h', 'Cel mai important anabolizant natural'],
        ['🥩', 'Proteină', 'Menține minimul de 160g chiar și în zilele OFF'],
      ].map(([emoji, title, desc]) => `
        <div style="background:var(--card);border:1px solid var(--border);border-radius:var(--rs);padding:12px 14px;display:flex;gap:12px;align-items:flex-start">
          <div style="font-size:22px;line-height:1">${emoji}</div>
          <div>
            <div style="font-size:13px;font-weight:700;margin-bottom:2px">${title}</div>
            <div style="font-size:11px;color:var(--text3)">${desc}</div>
          </div>
        </div>`).join('')}
    </div>
  </div>`;
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
}

export function dismissMFPPrompt() {
  DB.set('mfp-prompt-dismissed', Date.now());
  renderDash();
}

export function renderDash(){
  initW();
  const ws=DB.get('weights')||{},dates=Object.keys(ws).sort(),today=tod();
  const todW=ws[today]||null,lastW=dates.length?ws[dates[dates.length-1]]:null,dW=todW||lastW;
  const trend=getTrend();
  const tgt=Math.round((SW-(SW-TW)*Math.min(1,Math.max(0,Math.round((new Date()-SD2)/86400000))/DTOT))*10)/10;
  const now=new Date(),PILOT=new Date('2026-07-20'),pilotActive=now>=PILOT;
  const dayMap=[6,0,1,2,3,4,5],tp=PROG[dayMap[now.getDay()]]||PROG[0];
  const sysKcal=SYS.getKcalTarget(),sysPhase=SYS.getPhase();
  const kcals=DB.get('kcals')||{};
  const todayKcal=kcals[today]!==undefined?kcals[today]:sysKcal;
  const kcalColor=todayKcal>(sysKcal+200)?'var(--accent2)':todayKcal<(sysKcal-200)?'var(--accent3)':'var(--green)';
  const workoutToday=tp.t==='off'?'ODIHNĂ':tp.lb.toUpperCase();
  const statusToday=!dW?'—':dW<=tgt+0.3?'ON TRACK':dW<=tgt+1?'ÎN URMĂ':'OFF TRACK';
  const statusColor=!dW?'var(--text2)':dW<=tgt+0.3?'var(--green)':dW<=tgt+1?'var(--accent2)':'var(--red)';
  const ctaLabel=tp.t==='off'?'ODIHNĂ AZI':!todW?'LOG GREUTATE ▶':'ANTRENAMENT ▶';
  const ctaAction=tp.t==='off'?null:!todW?`sp('weight',document.querySelectorAll('.nb')[2])`:`sp('coach',document.querySelectorAll('.nb')[0])`;
  const dd=$('dd');if(dd)dd.textContent=now.toLocaleDateString('ro-RO',{weekday:'long',day:'numeric',month:'long'});
  // Brutal alerts — uses fresh reads to avoid stale closure values
  const alertProts = DB.get('prots')||{}, alertKcals = DB.get('kcals')||{}, alertWs = DB.get('weights')||{};
  const last3Days = Array.from({length:3},(_,i)=>{const dt=new Date();dt.setDate(dt.getDate()-i-1);return dt.toISOString().slice(0,10);});
  const last7Days = Array.from({length:7},(_,i)=>{const dt=new Date();dt.setDate(dt.getDate()-i-1);return dt.toISOString().slice(0,10);});
  const protBelowCount = last3Days.filter(d=>alertProts[d]!==undefined&&alertProts[d]<160).length;
  const kcalBelowCount = last3Days.filter(d=>alertKcals[d]!==undefined&&alertKcals[d]<1500).length;
  const recentWeightVals = last7Days.map(d=>alertWs[d]).filter(Boolean);
  const weightStagnant = recentWeightVals.length>=5&&(Math.max(...recentWeightVals)-Math.min(...recentWeightVals))<0.3;
  const recentRPEs = (DB.get('logs')||[]).filter(l=>!l.baseline&&l.rpe).slice(0,15).map(l=>l.rpe);
  const avgRecentRPE = recentRPEs.length?recentRPEs.reduce((a,b)=>a+b,0)/recentRPEs.length:0;
  let brutAlerts=[];
  if(protBelowCount>=2) brutAlerts.push({msg:`NU MĂNÂNCI DESTUL PROTEINĂ. PIERZI MASĂ.`,sub:`${protBelowCount}/3 zile sub 160g`,color:'var(--red)'});
  if(kcalBelowCount>=2) brutAlerts.push({msg:`DEFICIT EXTREM. METABOLISMUL ÎNCETINEȘTE.`,sub:`${kcalBelowCount}/3 zile sub 1500 kcal`,color:'var(--red)'});
  if(weightStagnant) brutAlerts.push({msg:`TREND STAGNEAZĂ. VERIFICĂ KCAL ȘI SOMN.`,sub:`7 zile fără schimbare reală`,color:'var(--accent2)'});
  if(avgRecentRPE>8.5) brutAlerts.push({msg:`RPE MEDIU PREA MARE. SCADE GREUTATEA.`,sub:`Medie ${avgRecentRPE.toFixed(1)} — risc supraantrenament`,color:'var(--accent2)'});
  const _alertHtml = brutAlerts.length ? (()=>{const a=brutAlerts[Math.floor(Date.now()/8000)%brutAlerts.length];return `<div style="padding:14px 16px;background:${a.color}18;border-left:4px solid ${a.color};margin-bottom:8px"><div style="font-size:13px;font-weight:700;color:${a.color};letter-spacing:.5px">⚠ ${a.msg}</div><div style="font-size:11px;color:var(--text3);margin-top:2px">${a.sub}</div></div>`;})() : '';

  const dcmd=$('daily-cmd');
  if(dcmd)dcmd.innerHTML=_alertHtml+`<div style="background:var(--card);border:1px solid var(--border);border-radius:var(--r);overflow:hidden">
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;border-bottom:1px solid var(--border)">
      <div style="padding:12px 14px;border-right:1px solid var(--border)">
        <div style="font-size:12px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin-bottom:3px">Kcal azi</div>
        <div style="font-family:'Bebas Neue',sans-serif;font-size:22px;color:${kcalColor}">${todayKcal}</div>
      </div>
      <div style="padding:12px 14px;border-right:1px solid var(--border)">
        <div style="font-size:12px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin-bottom:3px">Antrenament</div>
        <div style="font-family:'Bebas Neue',sans-serif;font-size:14px;line-height:1.2">${workoutToday}</div>
      </div>
      <div style="padding:12px 14px">
        <div style="font-size:12px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin-bottom:3px">Status</div>
        <div style="font-family:'Bebas Neue',sans-serif;font-size:18px;color:${statusColor}">${statusToday}</div>
      </div>
    </div>
    ${ctaAction?`<button onclick="${ctaAction}" style="width:100%;padding:14px;background:var(--accent);border:none;color:#000;font-weight:700;font-size:15px;cursor:pointer;font-family:'DM Sans',sans-serif">${ctaLabel}</button>`:`<button onclick="showRecoveryModal()" style="width:100%;padding:14px;background:transparent;border:none;color:var(--text2);font-weight:600;font-size:13px;cursor:pointer;font-family:'DM Sans',sans-serif">😴 Zi de Recuperare — sfaturi</button>`}
  </div>`;
  // MFP periodic prompt every 3 days
  const mfpEl=$('mfp-prompt-banner');
  if(mfpEl){
    const lastDismiss=DB.get('mfp-prompt-dismissed')||0;
    const show=Date.now()-lastDismiss > 3*86400000;
    if(show){
      mfpEl.style.display='block';
      mfpEl.innerHTML=`<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 14px;background:rgba(200,255,0,0.06);border:1px solid rgba(200,255,0,0.2);border-radius:var(--rs);margin-bottom:8px">
        <div style="font-size:12px;color:var(--text2);flex:1">📲 Importă nutriție din CSV pentru kcal și proteină exacte</div>
        <button onclick="triggerMFPImport()" style="background:var(--accent);color:#000;font-weight:700;font-size:11px;padding:6px 12px;border:none;border-radius:var(--rs);cursor:pointer;white-space:nowrap;font-family:'DM Sans',sans-serif">Import nutriție CSV</button>
        <button onclick="dismissMFPPrompt()" style="background:none;border:1px solid var(--border);color:var(--text3);font-size:11px;padding:6px 10px;border-radius:var(--rs);cursor:pointer;font-family:'DM Sans',sans-serif">✕</button>
      </div>`;
    } else {
      mfpEl.style.display='none';
    }
  }

  const sb=$('dsb');
  if(sb){if(!dW)sb.innerHTML='';else if(dW<=tgt+0.3)sb.innerHTML='<div class="sbadge on">✅ ON TRACK</div>';
  else if(dW<=tgt+1)sb.innerHTML='<div class="sbadge warn">⚠ ÎN URMĂ</div>';
  else sb.innerHTML='<div class="sbadge off">❌ OFF TRACK</div>';}

  // Close day banner in dashboard
  const cdDash=$('close-day-dash-inline');
  if(cdDash){
    const closed=DB.get('closed-days')||{};
    if(!closed[today]){
      cdDash.style.display='flex';
      cdDash.innerHTML=`<button onclick="closeDayFromDash()" style="background:var(--accent);color:#000;font-weight:700;font-size:12px;padding:8px 16px;border:none;border-radius:40px;cursor:pointer;font-family:'DM Sans',sans-serif;white-space:nowrap">🌙 ÎNCHIDE ZIUA</button>`;
    } else {
      cdDash.style.display='none';
    }
  }
  const alerts=getAlerts();
  const dal=$('dal');
  if(dal)dal.innerHTML=alerts.slice(0,4).map(a=>{
    const arrow=a.nav?'<div style="font-size:20px;color:var(--text3);flex-shrink:0;margin-left:8px">›</div>':'';
    const onclick=a.nav?` onclick="goTo('${a.nav}')" style="cursor:pointer"`:'';
    return `<div class="abox ${a.t}"${onclick}><div class="ai2">${a.i}</div><div style="flex:1"><div class="at2">${a.tt}</div><div class="as2">${a.s}</div></div>${arrow}</div>`;
  }).join('');
  const kw=$('kw');if(kw){kw.textContent=dW?dW.toFixed(1):'—';$('kws').textContent=todW?'kg azi':dW?'kg (ultima)':'kg';}
  const kl=$('kl2');if(kl)kl.textContent=dW?(SW-dW).toFixed(1):'—';
  if(trend!==null){
    const kt=$('kt'),kts=$('kts');
    if(kt)kt.textContent=(trend>0?'+':'')+trend.toFixed(2);
    if(kts)kts.textContent=trend<=-0.3&&trend>=-1.2?'kg/7z ✅':trend<-1.2?'kg/7z ⚠ rapid':'kg/7z ⚠ lent';
  } else {
    const need=Math.max(0,4-dates.length);
    const kt=$('kt');if(kt)kt.textContent=need>0?`${need}`:dates.length;
    const kts=$('kts');if(kts)kts.textContent=need>0?'zile până la trend':'zile date';
  }
  const kpib=$('kpi-days-box');
  if(kpib){
    if(pilotActive){$('kpi-days-label').textContent='TDEE Real';$('kd').textContent=SYS.estimateTDEE();$('kpi-days-sub').textContent='kcal mentenanță';}
    else{$('kpi-days-label').textContent='Zile rămase';$('kd').textContent=Math.max(0,Math.round((TD2-now)/86400000));$('kpi-days-sub').textContent='până 20 iulie';}
  }
  const dv=$('dv2'),dr=$('dr2'),dec=$('dec');
  if(dv&&dr&&dec){
    if(trend===null){const n=Math.max(0,4-dates.length);dv.textContent=n>0?`COMPLETEAZĂ ${n} ZILE`:`${sysKcal} KCAL`;dr.textContent=n>0?`${n} zile până la decizie`:'Date insuficiente';dec.style.borderColor='var(--text3)';dv.style.color='var(--text2)';}
    else if(trend<-1.2){
      const kcalDiff=todayKcal-sysKcal;
      if(todayKcal>=sysKcal+100){dv.textContent=`Depășești cu ${kcalDiff} kcal`;dr.textContent=`Azi: ${todayKcal} kcal · Trend prea rapid`;dec.style.borderColor='var(--accent2)';dv.style.color='var(--accent2)';}
      else if(todayKcal>=sysKcal){dv.textContent=`Menții targetul ✓ · ${todayKcal} kcal`;dr.textContent=`Trend: −${Math.abs(trend).toFixed(2)} kg/7z → prea rapid`;dec.style.borderColor='var(--accent3)';dv.style.color='var(--accent3)';}
      else{dv.textContent=`Mărește la ${sysKcal} kcal`;dr.textContent=`Trend: −${Math.abs(trend).toFixed(2)} kg/7z → prea rapid`;dec.style.borderColor='var(--accent3)';dv.style.color='var(--accent3)';}
    }
    else if(trend>-0.3){dv.textContent=`SCADE LA ${sysKcal} KCAL`;dr.textContent=`Trend: −${Math.abs(trend).toFixed(2)} kg/7z → stagnare`;dec.style.borderColor='var(--accent2)';dv.style.color='var(--accent2)';}
    else{dv.textContent=`MENȚINE ${sysKcal} KCAL`;dr.textContent=`Trend: −${Math.abs(trend).toFixed(2)} kg/7z → perfect`;dec.style.borderColor='var(--accent)';dv.style.color='var(--accent)';}
    const _phOvr=DB.get('phase-override');
    const _autoFixed=!pilotActive&&(!_phOvr||_phOvr==='AUTO');
    if(_autoFixed){dr.innerHTML=dr.textContent+'<br><span style="font-size:9px;color:var(--text3);opacity:0.75">Fix până 20 iulie • Schimbă faza manual dacă vrei alt plan</span>';}
  }
  const filled=Math.min(dates.length,8);
  // Weekly workouts counter
  const weekStart=new Date();weekStart.setDate(weekStart.getDate()-weekStart.getDay());
  const allLogs=DB.get('logs')||[];
  const workoutDaysThisWeek=[...new Set(allLogs.filter(l=>!l.baseline&&new Date(l.date)>=weekStart).map(l=>l.date))].length;
  const scheduledDays=5; // Mon OFF, Sun OFF → 5 workout days
  const wwEl=$('weekly-workouts');
  if(wwEl)wwEl.innerHTML=`
    <div style="font-size:12px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin-bottom:3px">Săptămâna asta</div>
    <div style="font-family:'Bebas Neue',sans-serif;font-size:28px;color:var(--accent);line-height:1">${workoutDaysThisWeek}<span style="font-size:16px;color:var(--text3)">/${scheduledDays}</span></div>
    <div style="font-size:12px;color:var(--text3);margin-top:2px">antrenamente</div>`;
  const streakMsgs=['0/8 – începe azi','1/8 – prima zi! Continuă mâine','2/8 – 2 zile, creierul observă','3/8 – încă 5 zile','4/8 – jumătate. NU RATA','5/8 – 3 zile rămase','6/8 – NU RATA. 2 zile','7/8 – O ZI. NU RATA','8/8 – ✅ Trend activ'];
  const cwl=$('cwl');if(cwl)cwl.textContent=streakMsgs[Math.min(filled,8)];
  const cpf=$('cpf');if(cpf)cpf.style.width=(filled/8*100)+'%';
  const cwd=$('cwd');if(cwd)cwd.innerHTML=Array.from({length:8},(_,i)=>`<div class="dot ${i<filled?'ok':''}">${i<filled?'✓':i+1}</div>`).join('');
  const last14=dates.slice(-14).map(d=>ws[d]);
  const mc=$('mc');
  if(mc){if(last14.length>1){const mn=Math.min(...last14)-.3,mx=Math.max(...last14)+.3;mc.innerHTML=last14.map((w,i)=>`<div class="bar ${i===last14.length-1?'t':'f'}" style="height:${Math.round(((w-mn)/(mx-mn))*55+8)}px"></div>`).join('');}
  else mc.innerHTML='<div style="display:flex;flex-direction:column;align-items:center;gap:4px;align-self:center;width:100%"><div style="font-size:20px">📊</div><div style="color:var(--text3);font-size:11px;text-align:center">Completează zilnic greutatea</div></div>';}
  renderFatigueScore('fatigue-score-dash');
  renderRealityCheck();
  renderAdherenceScore();
  renderProjection4w();
  renderWeightChart();
  const dt2=$('dt2');
  if(dt2){const todayProg=tp;
    if(todayProg.t==='off')dt2.innerHTML=`<div class="abox g" style="margin:0 16px 12px"><div class="ai2">😴</div><div><div class="at2">${todayProg.day} – OFF</div><div class="as2">Recuperare: mers, mobilitate</div></div></div>`;
    else dt2.innerHTML=`<div class="db"><div class="dtag ${todayProg.t} td">${todayProg.t==='lim'?'⏰':'✅'} ${todayProg.day} · ${todayProg.tm}</div><div class="el">${todayProg.ex.slice(0,4).map(e=>`<div class="ei${e.ss?' ss':''}"><div class="edot ${e.g}"></div><div class="en">${cleanEx(e.n)}</div><div class="es2">${e.s}</div>${e.ss?'<span class="ssb">SS</span>':''}</div>`).join('')}${todayProg.ex.length>4?`<div style="text-align:center;color:var(--text3);font-size:11px;padding:8px">+${todayProg.ex.length-4} exerciții</div>`:''}</div></div>`;
  }

  // Readiness quick input banner
  const rdBanner = $('readiness-banner');
  if (rdBanner) {
    const todayR = getTodayReadiness();
    const hour = new Date().getHours();
    if (todayR === null && hour >= 6 && tp.t !== 'off') {
      rdBanner.style.display = 'block';
      rdBanner.innerHTML = `<div style="background:var(--card);border:1px solid var(--border);border-radius:var(--rs);padding:12px 16px;margin-bottom:8px;display:flex;align-items:center;gap:12px">
        <div style="font-size:12px;color:var(--text2);flex:1">Cum te simți azi?</div>
        <div style="display:flex;gap:6px">
          ${[1,2,3,4,5].map(v => `<button onclick="dashSaveReadiness(${v})" style="background:none;border:1px solid var(--border);border-radius:8px;padding:4px 8px;cursor:pointer;font-size:18px">${READINESS_LABELS[v].emoji}</button>`).join('')}
        </div>
      </div>`;
    } else {
      rdBanner.style.display = 'none';
    }
  }

  // Auto-recommendations card
  const autoRecEl = $('auto-rec-card');
  if (autoRecEl) {
    const _calLvl = window._directorCache?.get()?.calibrationLevel;
    const _patternsEnabled = _calLvl
      ? _calLvl.patternsEnabled !== false
      : (() => {
          const ls = DB.get('logs') || [];
          const sessionCount = new Set(ls.filter(l => !l.baseline).map(l => l.session ?? l.date).filter(Boolean)).size;
          return sessionCount >= 3;
        })();
    const patterns = _patternsEnabled
      ? getAppliedPatterns().filter(p => Date.now() - p.appliedAt < 14*86400000)
      : [];
    if (patterns.length) {
      autoRecEl.style.display = 'block';
      autoRecEl.innerHTML = `<div style="background:rgba(0,240,255,0.04);border:1px solid rgba(0,240,255,0.15);border-radius:var(--r);padding:14px 16px;margin-bottom:8px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
          <div style="font-size:16px">🤖</div>
          <div style="font-size:13px;font-weight:700">Am ajustat programul automat</div>
        </div>
        ${patterns.slice(0,3).map((p,i) => `<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:6px">
          <div style="font-size:11px;color:var(--text3);flex:1">${p.description}</div>
          <button onclick="dismissAutoPattern(${i})" style="background:none;border:none;color:var(--text3);font-size:10px;cursor:pointer;padding:0 4px;flex-shrink:0">✕</button>
        </div>`).join('')}
      </div>`;
    } else {
      autoRecEl.style.display = 'none';
    }
  }

  // Today's session history
  const sessHistEl = $('today-session-hist');
  if (sessHistEl) {
    const allLogs = DB.get('logs') || [];
    const allBurns = DB.get('session-burns') || [];
    const today2 = tod();
    const todayLogs = allLogs.filter(l => !l.baseline && l.date === today2 && l.ex !== '__early_stop__');
    if (todayLogs.length) {
      const exMap2 = {};
      todayLogs.forEach(l => {
        if (!exMap2[l.ex]) exMap2[l.ex] = [];
        exMap2[l.ex].push(l);
      });
      const burn2 = allBurns.find(b => b.date === today2);
      const totalVol = todayLogs.reduce((s,l) => s + (l.w||0)*(parseInt(l.reps)||0), 0);
      sessHistEl.innerHTML = `<div style="background:var(--card);border:1px solid var(--border);border-radius:var(--r);overflow:hidden;margin-bottom:8px">
        <div style="padding:12px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between">
          <div style="font-size:13px;font-weight:700">Sesiunea de azi</div>
          <div style="font-size:11px;color:var(--text3)">${burn2?.mins ? burn2.mins+' min' : ''} · ${Math.round(totalVol/1000*10)/10}t volum</div>
        </div>
        ${Object.entries(exMap2).map(([ex,sets]) => {
          const bestSet = sets.reduce((best,s) => (s.w||0)>(best.w||0)?s:best, sets[0]);
          return `<div style="display:flex;align-items:center;gap:10px;padding:9px 16px;border-bottom:1px solid var(--border)">
            <div style="flex:1;font-size:12px;font-weight:600">${ex}</div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--accent)">${sets.length}×${bestSet.reps||'?'} @ ${bestSet.w}kg</div>
          </div>`;
        }).join('')}
      </div>`;
    } else if (tp.t !== 'off') {
      sessHistEl.innerHTML = `<div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:24px 20px;text-align:center;margin-bottom:8px">
        <div style="font-size:32px;margin-bottom:10px">💪</div>
        <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:6px">Nicio sesiune azi</div>
        <button onclick="goTo('coach')" style="background:var(--accent);color:#000;font-weight:700;font-size:13px;padding:10px 20px;border:none;border-radius:40px;cursor:pointer;font-family:'DM Sans',sans-serif;margin-top:4px">ÎNCEPE ANTRENAMENTUL</button>
      </div>`;
    } else {
      sessHistEl.innerHTML = '';
    }
  }

  // 7-day calendar
  const calEl = $('week-calendar');
  if (calEl) {
    const allBurns2 = DB.get('session-burns') || [];
    const earlyStops2 = DB.get('early-stops') || [];
    const skips2 = DB.get('workout-skips') || [];
    const days7 = ['L','M','M','J','V','S','D'];
    const today3 = new Date();
    const monday = new Date(today3);
    monday.setDate(today3.getDate() - ((today3.getDay()+6)%7));
    calEl.innerHTML = `<div style="display:flex;gap:4px;justify-content:space-between">
      ${Array.from({length:7},(_,i)=>{
        const d = new Date(monday); d.setDate(monday.getDate()+i);
        const dStr = d.toISOString().slice(0,10);
        const isToday = dStr === tod();
        const isFuture = d > today3 && !isToday;
        const hasBurn = allBurns2.some(b=>b.date===dStr);
        const hasEarly = earlyStops2.some(e=>e.date===dStr);
        const hasSkip = skips2.some(s=>s.date===dStr);
        const dayMap2=[6,0,1,2,3,4,5];
        const PROG_IDX = dayMap2[d.getDay()];
        const PROG_DAYS_DATA = window.__constants?.PROG || [];
        const isOff = PROG_DAYS_DATA[PROG_IDX]?.t === 'off';
        let dotColor = 'var(--bg3)';
        if (isFuture) dotColor = 'var(--bg3)';
        else if (isOff) dotColor = 'rgba(80,120,200,0.5)';
        else if (hasBurn && hasEarly) dotColor = 'var(--accent2)';
        else if (hasBurn) dotColor = 'var(--green)';
        else if (hasSkip) dotColor = 'var(--red)';
        else if (!isFuture) dotColor = 'rgba(255,68,68,0.35)';
        return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:5px;padding:6px 2px;background:${isToday?'var(--bg3)':'transparent'};border-radius:8px">
          <div style="font-size:10px;font-weight:${isToday?'700':'400'};color:${isToday?'var(--accent)':'var(--text3)'}">${days7[i]}</div>
          <div style="width:8px;height:8px;border-radius:50%;background:${dotColor}"></div>
          <div style="font-size:9px;color:var(--text3)">${d.getDate()}</div>
        </div>`;
      }).join('')}
    </div>`;
  }
}

function renderProjection4w() {
  const box = $('projection-box');
  if (!box) return;
  const ws = DB.get('weights') || {};
  const dates = Object.keys(ws).sort();
  if (dates.length < 4) { box.style.display = 'none'; return; }

  const kcals = DB.get('kcals') || {};
  const p = calcProjection(ws, kcals, dates);
  const lastW = ws[dates[dates.length - 1]];
  const pColor = p.gaining ? 'var(--red)' : Math.abs(p.rate) > 1.2 ? 'var(--accent3)' : Math.abs(p.rate) < 0.2 ? 'var(--accent2)' : 'var(--green)';

  // ETA to target
  let etaHtml = '';
  if (!p.gaining && p.rate < -0.1 && parseFloat(p.kg4w) < TW + 0.5) {
    const daysToTarget = Math.round((lastW - TW) / Math.abs(p.rate) * 7);
    if (daysToTarget > 0) etaHtml = `<div style="margin-top:8px;font-size:11px;color:var(--green);text-align:center">🎯 Atingi targetul în ~${daysToTarget} zile</div>`;
  }

  let msg = '';
  if (p.gaining)              msg = '⚠️ <strong style="color:var(--red)">Trendul actual duce la creștere în greutate.</strong> Verifică kcal.';
  else if (Math.abs(p.rate) < 0.2) msg = `⚠️ <strong style="color:var(--accent2)">Scădere prea lentă</strong> (${Math.abs(p.rate).toFixed(2)} kg/7z) — scade 100 kcal.`;
  else if (Math.abs(p.rate) > 1.2) msg = `⚡ <strong style="color:var(--accent3)">Scădere prea rapidă</strong> (${Math.abs(p.rate).toFixed(2)} kg/7z) — adaugă 150 kcal.`;
  else                        msg = `✅ <strong style="color:var(--green)">Ritm perfect</strong> — ${Math.abs(p.rate).toFixed(2)} kg/săpt. Continuă.`;

  box.style.display = 'block';
  $('proj-2w').textContent = p.kg2w + ' kg';
  $('proj-4w').textContent = p.kg4w + ' kg';
  $('proj-8w').textContent = p.kg8w + ' kg';
  $('proj-2w').style.color = pColor;
  $('proj-4w').style.color = pColor;
  $('proj-8w').style.color = pColor;
  const msgEl = $('proj-message'); if (msgEl) msgEl.innerHTML = msg;
  const dtEl  = $('proj-date-target'); if (dtEl) dtEl.innerHTML = etaHtml;
  const basedEl = $('proj-based-on'); if (basedEl) basedEl.textContent = `Bazat pe ultimele ${Math.min(dates.length, 8)} zile`;
  const rateEl  = $('proj-rate'); if (rateEl) rateEl.textContent = `${p.rate > 0 ? '+' : ''}${p.rate.toFixed(2)} kg/7z`;
}

function renderRealityCheck() {
  const el = $('reality-check-alert');
  if (!el) return;
  const rc = getRealityCheck();
  if (!rc) { el.style.display = 'none'; return; }
  el.style.display = 'block';
  el.innerHTML = `<div style="padding:12px 16px;background:${rc.color}18;border-left:4px solid ${rc.color};margin-bottom:8px;border-radius:0 var(--rs) var(--rs) 0">
    <div style="font-size:13px;font-weight:700;color:${rc.color};letter-spacing:.3px">${rc.icon} REALITY CHECK</div>
    <div style="font-size:12px;color:var(--text2);margin-top:3px">${rc.message}</div>
  </div>`;
}

function renderAdherenceScore() {
  const el = $('adherence-score');
  if (!el) return;
  const a = getAdherenceScore();
  el.style.display = 'block';
  el.innerHTML = `<div style="padding:10px 16px;background:var(--card);border:1px solid var(--border);border-radius:var(--rs);display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
    <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:1px">Adherence azi</div>
    <div style="display:flex;align-items:center;gap:8px">
      <div style="font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:700;color:${a.color}">${a.score}%</div>
      <div style="font-size:11px;font-weight:600;color:${a.color};padding:2px 8px;border-radius:10px;background:${a.color}18">${a.label}</div>
    </div>
  </div>`;
}

function renderWeightChart() {
  const canvas = document.getElementById('dash-weight-chart');
  const msgEl = document.getElementById('dash-weight-chart-msg');
  if (!canvas) return;

  const ws = DB.get('weights') || {};
  const allDates = Object.keys(ws).sort();

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const filtered = allDates.filter(d => d >= cutoffStr);
  const dates = filtered.length >= 2 ? filtered : allDates;

  if (dates.length < 2) {
    canvas.style.display = 'none';
    if (msgEl) { msgEl.style.display = 'block'; msgEl.textContent = 'Mai ai nevoie de cel puțin 2 cântăriri pentru grafic.'; }
    return;
  }

  canvas.style.display = 'block';
  if (msgEl) msgEl.style.display = 'none';

  const labels = dates.map(d => { const [, m, day] = d.split('-'); return `${day}.${m}`; });
  const values = dates.map(d => ws[d]);
  const targetLine = dates.map(() => 101.5);

  if (_dashWeightChart) { _dashWeightChart.destroy(); _dashWeightChart = null; }

  if (typeof window.Chart === 'undefined') return;

  _dashWeightChart = new window.Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Greutate',
          data: values,
          borderColor: '#c8ff00',
          backgroundColor: 'rgba(200,255,0,0.07)',
          tension: 0.3,
          fill: true,
          pointRadius: 3,
          pointBackgroundColor: '#c8ff00',
          pointBorderColor: '#c8ff00',
          pointHoverRadius: 5,
        },
        {
          label: 'Target 101.5 kg',
          data: targetLine,
          borderColor: 'rgba(255,59,48,0.55)',
          borderDash: [6, 4],
          borderWidth: 1.5,
          pointRadius: 0,
          fill: false,
          tension: 0,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items) => {
              const d = dates[items[0].dataIndex];
              const [y, m, day] = d.split('-');
              return `${day}.${m}.${y}`;
            },
            label: (item) => item.datasetIndex === 0
              ? `${Number(item.raw).toFixed(1)} kg`
              : `Target: ${item.raw} kg`
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#aaa', font: { size: 10, family: "'JetBrains Mono',monospace" }, maxTicksLimit: 8 }
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#aaa', font: { size: 10, family: "'JetBrains Mono',monospace" }, callback: v => v + ' kg' }
        }
      }
    }
  });
}

export function getAlerts(){
  const alerts=[],ws=DB.get('weights')||{},logs=DB.get('logs')||[],today=tod();
  const dates=Object.keys(ws).sort();
  const now=new Date(),PILOT=new Date('2026-07-20'),pilotActive=now>=PILOT;
  const daysToCheckpoint=Math.round((PILOT-now)/86400000);
  if(!pilotActive&&daysToCheckpoint<=7&&daysToCheckpoint>0)
    alerts.push({t:'y',i:'⏰',tt:`CHECKPOINT ÎN ${daysToCheckpoint} ZILE`,s:'Pe 20 iulie sistemul preia controlul kcal.'});
  if(today==='2026-07-20')
    alerts.push({t:'g',i:'🤖',tt:'PILOT AUTOMAT ACTIV',s:`TDEE: ${SYS.estimateTDEE()} kcal · Fază: ${SYS.getPhase()} · Kcal: ${SYS.getKcalTarget()}`});
  if(pilotActive&&SYS.getPhase()==='MAINTENANCE'&&SYS.getBF()>15&&!DB.get('phase-override'))
    alerts.push({t:'y',i:'⚠️',tt:'BF >15% dar faza e mentenanță',s:'Override la CUT din tab Plan'});
  const wb=DB.get('wellbeing')||{},todWell=wb[today]||{};
  if(todWell.sleep&&todWell.sleep<=2) alerts.push({t:'y',i:'😴',tt:'SOMN PROST AZI',s:'RPE artificial ridicat. Nu crești greutatea azi.'});
  const prots=DB.get('prots')||{},todProt=prots[today];
  if(todProt!==undefined&&todProt<150) alerts.push({t:'r',i:'🥩',tt:`PROTEINĂ: ${todProt}g`,s:`Target 180g · Deficit ${180-todProt}g`});
  else if(!todProt&&dates.length>=2) alerts.push({t:'o',i:'🥩',tt:'PROTEINĂ NELOGATĂ',s:'180g+ esențial · Apasă pentru a loga',nav:'weight'});
  if(dates.length>=3&&!ws[today]) alerts.push({t:'r',i:'🚨',tt:'GREUTATE NELOGATĂ AZI',s:'Dimineața pe nemâncat → tab Greutate.'});
  if(dates.length>=7){const l7=dates.slice(-7).map(d=>ws[d]);if(Math.max(...l7)-Math.min(...l7)<0.5) alerts.push({t:'r',i:'🔴',tt:'STAGNARE 7 ZILE',s:'→ scazi 100 kcal AZI'});}
  const rRPE=logs.slice(-9).filter(l=>l.rpe).map(l=>l.rpe);
  const avgRPE=rRPE.length?rRPE.reduce((a,b)=>a+b,0)/rRPE.length:null;
  if(avgRPE&&avgRPE>=8.5) alerts.push({t:'r',i:'🚨',tt:`DELOAD – RPE ${avgRPE.toFixed(1)}`,s:'Reduce volum 40% săptămâna asta'});
  const tgt=Math.round((SW-(SW-TW)*Math.min(1,Math.max(0,Math.round((new Date()-SD2)/86400000))/DTOT))*10)/10;
  const todW=ws[today];
  if(todW&&todW<=tgt+0.2&&!alerts.find(a=>a.t==='r')) alerts.push({t:'g',i:'✅',tt:'PE TRASEU',s:`${todW.toFixed(1)} kg · Ținta azi: ${tgt.toFixed(1)} kg`});
  return alerts;
}

export function closeDayFromDash(){
  const ws=DB.get('weights')||{}, kcals=DB.get('kcals')||{}, dates=Object.keys(ws).sort();
  const closed=DB.get('closed-days')||{};
  closed[tod()]=true; DB.set('closed-days',closed);
  const p=calcProjection(ws,kcals,dates);
  // Show projection in dashboard
  const cdDash=$('close-day-dash-inline');
  if(cdDash){
    const pColor=p.gaining?'var(--red)':Math.abs(p.rate)<0.2?'var(--accent2)':Math.abs(p.rate)>1.2?'var(--accent3)':'var(--green)';
    cdDash.innerHTML=`<div style="background:rgba(200,255,0,0.05);border:1px solid var(--accent);border-radius:var(--r);padding:14px 16px">
      <div style="font-size:12px;color:var(--accent);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px">✅ ZIUA ÎNCHISĂ · PROIECȚIE</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px">
        <div style="text-align:center;background:var(--bg3);border-radius:var(--rs);padding:10px 4px">
          <div style="font-family:'Bebas Neue',sans-serif;font-size:24px;color:${pColor}">${p.kg2w}kg</div>
          <div style="font-size:12px;color:var(--text3)">2 SĂPTĂMÂNI</div>
        </div>
        <div style="text-align:center;background:var(--bg3);border-radius:var(--rs);padding:10px 4px;border:1px solid ${pColor}44">
          <div style="font-family:'Bebas Neue',sans-serif;font-size:24px;color:${pColor}">${p.kg4w}kg</div>
          <div style="font-size:12px;color:var(--text3)">4 SĂPTĂMÂNI</div>
        </div>
        <div style="text-align:center;background:var(--bg3);border-radius:var(--rs);padding:10px 4px">
          <div style="font-family:'Bebas Neue',sans-serif;font-size:24px;color:${pColor}">${p.kg8w}kg</div>
          <div style="font-size:12px;color:var(--text3)">8 SĂPTĂMÂNI</div>
        </div>
      </div>
      <div id="dash-proj-msg" style="font-size:12px;color:var(--text2);line-height:1.5;padding:10px;background:var(--bg3);border-radius:var(--rs)"></div>
    </div>`;
    // Fill message
    const el=$('dash-proj-msg');
    if(el){
      if(p.gaining) el.innerHTML='⚠️ <strong style="color:var(--red)">Trend de creștere</strong> – verifică kcal';
      else if(Math.abs(p.rate)<0.2) el.innerHTML='⚠️ <strong style="color:var(--accent2)">Scădere prea lentă</strong> – scade 100 kcal';
      else if(Math.abs(p.rate)>1.2) el.innerHTML='⚡ <strong style="color:var(--accent3)">Scădere prea rapidă</strong> – adaugă 150 kcal';
      else el.innerHTML=`✅ <strong style="color:var(--green)">Ritm perfect</strong> – ${Math.abs(p.rate).toFixed(2)} kg/săpt · continui`;
    }
  }
}

export function updateNotifBtn(active) {
  const btn = $('notif-btn');
  if (!btn) return;
  if (active) {
    btn.innerHTML = '🔔 Notificări ACTIVE';
    btn.style.background = 'rgba(48,209,88,0.12)';
    btn.style.borderColor = 'var(--green)';
    btn.style.color = 'var(--green)';
  } else {
    btn.innerHTML = '🔕 Notificări INACTIVE';
    btn.style.background = 'rgba(255,59,48,0.08)';
    btn.style.borderColor = 'var(--red)';
    btn.style.color = 'var(--red)';
  }
}

export async function requestNotifications() {
  if (!('Notification' in window)) { toast('⚠ Browser-ul nu suportă notificări', 'var(--accent2)'); return; }
  
  // Toggle: dacă e activ, dezactivează
  const isEnabled = DB.get('notif-enabled');
  if (Notification.permission === 'granted' && isEnabled) {
    DB.set('notif-enabled', false);
    updateNotifBtn(false);
    toast('🔕 Notificări dezactivate', 'var(--accent2)');
    return;
  }
  
  if (Notification.permission === 'granted') { 
    scheduleNotifications(); DB.set('notif-enabled', true); updateNotifBtn(true); 
    toast('✅ Notificări active', 'var(--green)'); return; 
  }
  const perm = await Notification.requestPermission();
  if (perm === 'granted') { scheduleNotifications(); DB.set('notif-enabled', true); updateNotifBtn(true); toast('✅ Notificări activate!', 'var(--green)'); }
  else { updateNotifBtn(false); toast('⚠ Permisiune refuzată', 'var(--accent2)'); }
}
