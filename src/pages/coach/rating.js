import { DB, tod, $ } from '../../db.js';
import { syncToFirebase } from '../../firebase.js';
import { extractAndSavePRs, cleanFakeLogs } from './pr.js';
import { hidePauseScreen } from '../../ui/ui.js';
import { state } from '../../state.js';

export function showSessionRating(summaryData) {
  $('session-ui').style.display = 'none';
  hidePauseScreen();

  const prsHtml = summaryData.prs?.length
    ? summaryData.prs.map(pr => `<div style="padding:7px 12px;background:rgba(200,255,0,0.06);border:1px solid rgba(200,255,0,0.2);border-radius:var(--rs);font-size:11px;color:var(--accent);margin-bottom:5px">🏆 ${pr.label}</div>`).join('')
    : '';

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
  // CICLU (temporar): clearDraft din session.js nu e extras încă
  window.clearDraft?.();
  const noteMap = { 'easy': ['strong'], 'normal': [], 'hard': ['fatigue'] };
  const notes = noteMap[rating] || [];

  if (notes.length) {
    const logs = DB.get('logs') || [];
    let count = 0;
    for (let i = 0; i < logs.length && count < 3; i++) {
      if (logs[i].session === state.sessStart) {
        logs[i].notes = [...(logs[i].notes || []), ...notes];
        count++;
      }
    }
    DB.set('logs', logs);
  }

  const sRatings = DB.get('session-ratings') || [];
  sRatings.unshift({ session: state.sessStart, rating, date: tod() });
  DB.set('session-ratings', sRatings.slice(0, 20));

  extractAndSavePRs();
  cleanFakeLogs();

  syncToFirebase().catch(() => {});

  const modal = document.getElementById('rating-modal');
  if (modal) modal.remove();

  const moodLabel = rating === 'easy' ? '⚡ Sesiune ușoară' : rating === 'hard' ? '💀 Sesiune grea' : '👍 Sesiune normală';
  showSessionSummary({ ...summaryData, moodLabel });
}

export function showSessionSummary(data) {
  const modal = document.createElement('div');
  modal.id = 'summary-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:400;display:flex;align-items:center;justify-content:center;padding:20px';
  const prsHtml = data.prs?.length
    ? data.prs.map(pr => `<div style="padding:6px 10px;background:rgba(200,255,0,0.06);border:1px solid rgba(200,255,0,0.15);border-radius:var(--rs);font-size:11px;color:var(--accent);margin-bottom:4px">🏆 ${pr.label}</div>`).join('')
    : '';
  modal.innerHTML = `<div style="background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:28px 24px;width:100%;max-width:360px;text-align:center">
    <div style="font-family:'Bebas Neue',sans-serif;font-size:32px;color:var(--accent);margin-bottom:4px">SESIUNE COMPLETĂ</div>
    <div style="font-size:15px;margin-bottom:16px">${data.moodLabel || ''}</div>
    ${data.totalSets ? `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:16px">
      <div style="background:var(--bg3);border-radius:var(--rs);padding:10px 4px"><div style="font-family:'Bebas Neue',sans-serif;font-size:22px;color:var(--accent)">${data.mins || 0}</div><div style="font-size:9px;color:var(--text3)">MIN</div></div>
      <div style="background:var(--bg3);border-radius:var(--rs);padding:10px 4px"><div style="font-family:'Bebas Neue',sans-serif;font-size:22px;color:var(--accent)">${data.totalSets}</div><div style="font-size:9px;color:var(--text3)">SETURI</div></div>
      <div style="background:var(--bg3);border-radius:var(--rs);padding:10px 4px"><div style="font-family:'Bebas Neue',sans-serif;font-size:22px;color:var(--accent)">${data.kcal || 0}</div><div style="font-size:9px;color:var(--text3)">KCAL</div></div>
    </div>` : ''}
    ${prsHtml ? `<div style="margin-bottom:16px;text-align:left">${prsHtml}</div>` : ''}
    <button onclick="closeSummary()"
      style="width:100%;padding:14px;background:var(--accent);color:#000;font-weight:700;font-size:15px;border:none;border-radius:var(--r);cursor:pointer;font-family:'Bebas Neue',sans-serif">
      ✓ GATA
    </button>
  </div>`;
  document.body.appendChild(modal);
  launchConfetti();
}

function launchConfetti() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:999';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  const pieces = Array.from({ length: 80 }, () => ({
    x: Math.random() * canvas.width, y: -10,
    w: Math.random() * 8 + 4, h: Math.random() * 12 + 6,
    r: Math.random() * Math.PI * 2,
    vx: (Math.random() - 0.5) * 4, vy: Math.random() * 4 + 2,
    vr: (Math.random() - 0.5) * 0.2,
    color: ['#c8ff00', '#fff', '#ff9f0a', '#30d158', '#ff375f'][Math.floor(Math.random() * 5)]
  }));
  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.r += p.vr; p.vy += 0.05;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
      ctx.fillStyle = p.color; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    frame++;
    if (frame < 120) requestAnimationFrame(draw);
    else canvas.remove();
  }
  draw();
}
