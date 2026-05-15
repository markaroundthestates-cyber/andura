// ══ MUSCLE MEMORY PROMPT — Re-resume Welcome Modal ═════════════════════════
// Per [[03-decisions/_FROZEN/033-muscle-memory-index]] §32.2-§32.3 SPEC LOCKED V1
// 2026-05-02 + LOCK 10 pre-Beta promote 2026-05-15.
//
// Pattern: pre-onboarding gate modal + 2-tap override (anti-RE force-typing
// ELIMINATED PERMANENT ADR 013 §AMENDMENT 2026-04-30 invariant preserved).
// Identic cu aggressiveLoadingModal precedent. Romanian-first no-diacritics
// LOCK V1 PERMANENT 2026-05-10 — ADR 033 source has legacy diacritics, UI
// strings strip them per invariant.
//
// Refuse path (§32.3): banner discret post-confirm warning risk accidentare
// la setul de pornire — NU modal blocant.

const COPY = Object.freeze({
  title: 'Bine ai revenit',
  body: 'Pauza face parte din drum. Incepem treptat — corpul tau isi aminteste.',
  question: 'Vrei sa reincepem treptat, de unde ai ramas, sau preferi sa o luam de la zero?',
  buttonAccept: 'Reincep treptat (recomandat)',
  buttonRefuse: 'De la zero',
  refuseBannerText: 'Atentie — incarci direct greutatile maxime. Risc accidentare la setul de pornire. Recomandare: incepi cu 70% si urci.',
});

function _escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c]));
}

/**
 * Show MMI re-resume welcome modal. Returns a Promise resolving with the
 * user's choice. NO forced typing — 2 buttons only.
 *
 * @param {Object} opts
 * @param {number} opts.pauseMonths
 * @param {Array<{ex: string, kg: number}>} [opts.peakSummary] - optional top-N peaks for body context
 * @returns {Promise<{action: 'accepted'|'refused', source: string}>}
 */
export function showMuscleMemoryPrompt({ pauseMonths, peakSummary } = {}) {
  return new Promise((resolve) => {
    document.getElementById('mmi-prompt-modal')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'mmi-prompt-modal';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-labelledby', 'mmi-prompt-title');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:9000;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 20px';

    const months = typeof pauseMonths === 'number' && Number.isFinite(pauseMonths) ? Math.round(pauseMonths) : null;
    const subtitle = months != null ? `Ai luat o pauza de aproximativ ${months} luni.` : '';

    const peakList = Array.isArray(peakSummary) && peakSummary.length > 0
      ? `<div style="margin-top:14px;padding:12px;background:var(--bg2);border:1px solid var(--border);border-radius:var(--rs);font-size:12px;color:var(--text2)">
          <div style="font-weight:600;color:var(--text);margin-bottom:6px">Cele mai mari greutati ale tale</div>
          ${peakSummary.slice(0, 5).map(p => `<div>${_escapeHtml(p.ex)} — <strong style="color:var(--text)">${_escapeHtml(p.kg)} kg</strong></div>`).join('')}
        </div>`
      : '';

    overlay.innerHTML = `
      <div style="width:100%;max-width:380px;background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:24px 20px">
        <div id="mmi-prompt-title" style="font-size:18px;font-weight:700;color:var(--text);margin-bottom:8px">${_escapeHtml(COPY.title)}</div>
        ${subtitle ? `<div style="font-size:12px;color:var(--text3);margin-bottom:14px">${_escapeHtml(subtitle)}</div>` : ''}
        <div style="font-size:14px;color:var(--text);line-height:1.5;margin-bottom:14px">${_escapeHtml(COPY.body)}</div>
        <div style="font-size:14px;color:var(--text);line-height:1.5;margin-bottom:18px">${_escapeHtml(COPY.question)}</div>
        ${peakList}
        <button class="btn-mmi-accept" style="width:100%;padding:16px;background:var(--accent);color:#000;font-weight:700;font-size:15px;border:none;border-radius:var(--rs);cursor:pointer;font-family:'DM Sans',sans-serif;margin-top:14px;margin-bottom:10px">${_escapeHtml(COPY.buttonAccept)}</button>
        <button class="btn-mmi-refuse" style="width:100%;padding:14px;background:transparent;color:var(--text);font-size:13px;border:1px solid var(--border);border-radius:var(--rs);cursor:pointer;font-family:'DM Sans',sans-serif">${_escapeHtml(COPY.buttonRefuse)}</button>
      </div>
    `;

    document.body.appendChild(overlay);

    const acceptBtn = overlay.querySelector('.btn-mmi-accept');
    const refuseBtn = overlay.querySelector('.btn-mmi-refuse');
    let resolved = false;

    function cleanup(result) {
      if (resolved) return;
      resolved = true;
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      resolve(result);
    }

    acceptBtn.addEventListener('click', () => cleanup({ action: 'accepted', source: 'accept-button' }));
    refuseBtn.addEventListener('click', () => {
      // Show non-blocking banner per §32.3 then resolve refused.
      _showRefuseBanner();
      cleanup({ action: 'refused', source: 'refuse-button' });
    });
  });
}

/**
 * Non-blocking risk banner shown post-refuse per §32.3.
 * Auto-dismisses after a short window; user can dismiss earlier.
 */
function _showRefuseBanner() {
  document.getElementById('mmi-refuse-banner')?.remove();
  const banner = document.createElement('div');
  banner.id = 'mmi-refuse-banner';
  banner.setAttribute('role', 'status');
  banner.style.cssText = 'position:fixed;left:50%;bottom:88px;transform:translateX(-50%);background:var(--bg2);border:1px solid var(--accent2);border-radius:var(--rs);padding:12px 16px;font-size:13px;color:var(--text);z-index:8500;max-width:360px;box-shadow:0 8px 24px rgba(0,0,0,0.4)';
  banner.textContent = COPY.refuseBannerText;
  document.body.appendChild(banner);
  setTimeout(() => { if (banner.parentNode) banner.remove(); }, 8000);
}

// Exported for test introspection only — copy is the SSOT for wording assertions.
export const _MMI_PROMPT_COPY = COPY;
