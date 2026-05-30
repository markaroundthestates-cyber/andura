// ══ UI — Toast ══════════════════════════════════════════════
import { $ } from '../db.js';

/**
 * @param {string} msg
 * @param {string} [color]
 */
export function toast(msg, color = 'var(--accent)') {
  const t = $('toast'); if (!t) return;
  t.textContent = msg;
  t.style.background = color;
  t.style.color = (color === 'var(--accent)' || color === 'var(--green)') ? '#000' : '#fff';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}
