// ══ AGGRESSIVE LOADING WARNING MODAL — TIER-AWARE ═══════════════════════════
// Per [[wiki/concepts/aggressive-loading-warning-tier-aware]] LOCK V1 2026-05-14
//
// Pattern: warning observable pre-set cu wording adapt pe tier + override 1-tap
// [Continui cu greutatea introdusa] / [Revin la baseline].
//
// NO forced typing per ADR 013 §AMENDMENT 2026-04-30 invariant preserved.
// Romanian-first no-diacritics LOCK V1 PERMANENT 2026-05-10 — ZERO ș/ț/ă/â/î.
// Pattern identic cu aaFrictionModal.js + painButton.js precedent existing.

// Wording template per tier (Romanian no-diacritics enforced — see tests).
// Placeholders: {actualKg} {recommendedKg} {deviationPct}
const WORDING_BY_TIER = Object.freeze({
  T0: 'Suntem inca in calibrare — recomandarea poate fi conservativa vs realitatea ta. Ai introdus {actualKg} kg. Confirma greutatea cu care te simti pregatit.',
  T1: 'Suntem inca in calibrare — recomandarea poate fi conservativa vs realitatea ta. Ai introdus {actualKg} kg. Confirma greutatea cu care te simti pregatit.',
  T2: 'Ai introdus {actualKg} kg. Recomandarea pentru azi era {recommendedKg} kg (+{deviationPct}%). Confirma daca te simti pregatit sau revino la baseline.',
  T3: 'Ai introdus {actualKg} kg. Recomandarea pentru azi era {recommendedKg} kg (+{deviationPct}%). Confirma daca te simti pregatit sau revino la baseline.',
});

const FALLBACK_WORDING_TIER = 'T2';

/**
 * Build wording string for tier with placeholders substituted.
 * @pure
 */
export function getWordingForTier(tier, { actualKg, recommendedKg, deviationPct }) {
  const template = WORDING_BY_TIER[tier] ?? WORDING_BY_TIER[FALLBACK_WORDING_TIER];
  return template
    .replace('{actualKg}', String(actualKg))
    .replace('{recommendedKg}', String(recommendedKg))
    .replace('{deviationPct}', String(Math.round((deviationPct ?? 0) * 100)));
}

/**
 * Show aggressive loading warning modal pre-set.
 * Returns a Promise that resolves with { action: 'continue' | 'revert', source }.
 * NO forced typing — 1-tap override buttons only.
 *
 * @param {object} opts
 * @param {string} opts.tier - 'T0' | 'T1' | 'T2' | 'T3'
 * @param {number} opts.actualKg
 * @param {number} opts.recommendedKg
 * @param {number} opts.deviationPct - decimal (0.30 = +30%)
 * @param {string} [opts.exerciseName]
 * @returns {Promise<{action: 'continue'|'revert', source: string}>}
 */
export function showAggressiveLoadingModal({ tier, actualKg, recommendedKg, deviationPct, exerciseName }) {
  return new Promise((resolve) => {
    document.getElementById('aggressive-loading-modal')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'aggressive-loading-modal';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-labelledby', 'aggressive-loading-title');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:9000;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 20px';

    const wording = getWordingForTier(tier, { actualKg, recommendedKg, deviationPct });
    const safeName = exerciseName ? String(exerciseName).replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c])) : '';

    overlay.innerHTML = `
      <div style="width:100%;max-width:360px;background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:24px 20px">
        <div id="aggressive-loading-title" style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:2px;margin-bottom:6px">Greutate aleasa</div>
        ${safeName ? `<div style="font-size:13px;color:var(--text2);margin-bottom:14px">${safeName}</div>` : ''}
        <div style="font-size:14px;color:var(--text);line-height:1.5;margin-bottom:22px">${wording}</div>
        <button class="btn-continue" style="width:100%;padding:16px;background:var(--accent);color:#000;font-weight:700;font-size:15px;border:none;border-radius:var(--rs);cursor:pointer;font-family:'DM Sans',sans-serif;margin-bottom:10px">Continui cu greutatea introdusa</button>
        <button class="btn-revert" style="width:100%;padding:14px;background:transparent;color:var(--text);font-size:13px;border:1px solid var(--border);border-radius:var(--rs);cursor:pointer;font-family:'DM Sans',sans-serif">Revin la baseline</button>
      </div>
    `;

    document.body.appendChild(overlay);

    const continueBtn = overlay.querySelector('.btn-continue');
    const revertBtn = overlay.querySelector('.btn-revert');
    let resolved = false;

    function cleanup(result) {
      if (resolved) return;
      resolved = true;
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      resolve(result);
    }

    continueBtn.addEventListener('click', () => cleanup({ action: 'continue', source: 'continue-button' }));
    revertBtn.addEventListener('click', () => cleanup({ action: 'revert', source: 'revert-button' }));
  });
}
