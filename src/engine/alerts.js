// ══ ALERTS ══════════════════════════════════════════════════
import { DB, tod } from '../db.js';
import { PROG, KCAL_TARGET, PROT_TARGET, SW_KG, TW_KG, TARGET_DATE, START_DATE, DTOT } from '../constants.js';
import { SYS } from './sys.js';
import { calculateFatigueScore } from './fatigue.js';

const SW = SW_KG, TW = TW_KG, SD2 = START_DATE, TD2 = TARGET_DATE;


function getAlerts(){
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
  const waters=DB.get('waters')||{};
  // hidratare alert eliminat
  const prots=DB.get('prots')||{},todProt=prots[today];
  if(todProt!==undefined&&todProt<150) alerts.push({t:'r',i:'🥩',tt:`PROTEINĂ: ${todProt}g`,s:`Target 180g · Deficit ${180-todProt}g`});
  else if(!todProt&&dates.length>=2) alerts.push({t:'o',i:'🥩',tt:'PROTEINĂ NELOGATĂ',s:'180g+ esențial · Apasă pentru a loga',nav:'weight'});
  if(dates.length>=3&&!ws[today]) alerts.push({t:'r',i:'🚨',tt:'GREUTATE NELOGATĂ AZI',s:'Dimineața pe nemâncat → tab Greutate.'});
  if(dates.length>=7){const l7=dates.slice(-7).map(d=>ws[d]);if(Math.max(...l7)-Math.min(...l7)<0.5) alerts.push({t:'r',i:'🔴',tt:'STAGNARE 7 ZILE',s:'→ scazi 100 kcal AZI'});}
  const rRPE=logs.slice(-9).filter(l=>l.rpe).map(l=>l.rpe);
  const avgRPE=rRPE.length?rRPE.reduce((a,b)=>a+b,0)/rRPE.length:null;
  if(avgRPE&&avgRPE>=8.5) alerts.push({t:'r',i:'🚨',tt:`DELOAD – RPE ${avgRPE.toFixed(1)}`,s:'Reduce volum 40% săptămâna asta'});
  // Early stop alert
  const earlyStops=DB.get('early-stops')||[];
  if(earlyStops.length>=2){
    const last2=earlyStops.slice(-2);
    const bothPhysical=last2.every(s=>s.reason!=='Lipsă timp'&&s.reason!=='Alt motiv');
    if(bothPhysical) alerts.push({t:'r',i:'⚠️',tt:'2 SESIUNI OPRITE DEVREME',s:'Consideră un deload această săptămână'});
  }
  const daysElapsed=Math.min(DTOT,Math.max(0,Math.round((new Date()-SD2)/86400000)));
  const tgt=Math.round((SW-(SW-TW)*daysElapsed/DTOT)*10)/10;
  const todW=ws[today];
  if(todW&&todW<=tgt+0.2&&!alerts.find(a=>a.t==='r')) alerts.push({t:'g',i:'✅',tt:'PE TRASEU',s:`${todW.toFixed(1)} kg · Ținta azi: ${tgt.toFixed(1)} kg`});
  return alerts;
}
