// ══ NAVIGATION ══════════════════════════════════════════════
import { renderCoachIdle } from '../pages/coach.js';
import { renderDash } from '../pages/dashboard.js';
import { renderWeight } from '../pages/weight.js';
import { renderProg, renderPlan } from '../pages/plan.js';

export function goTo(page) {
  const current = document.querySelector('.page.active');
  const pg = document.getElementById('page-' + page);
  if (!pg || pg === current) return;

  const doTransition = () => {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nb').forEach(b => b.classList.remove('active'));
    pg.classList.add('active');
    const idx = { coach: 0, dash: 1, weight: 2, prog: 3, plan: 4 }[page] || 0;
    const nb = document.querySelectorAll('.nb')[idx];
    if (nb) nb.classList.add('active');
    const renders = {
      coach: renderCoachIdle,
      dash: renderDash,
      weight: renderWeight,
      prog: renderProg,
      plan: renderPlan,
    };
    if (renders[page]) renders[page]();
  };

  if (current) {
    current.classList.add('page-exit');
    setTimeout(() => {
      current.classList.remove('page-exit');
      doTransition();
    }, 120);
  } else {
    doTransition();
  }
}

// sp = shortcut pentru goTo (folosit în onclick-uri HTML)
export const sp = goTo;
