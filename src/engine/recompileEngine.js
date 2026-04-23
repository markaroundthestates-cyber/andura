// ══ RECOMPILE ENGINE — Restructurare săptămână pe skip/absență/drop readiness ══
// Când o sesiune e sărită sau readiness-ul scade brusc, motorul recalculează
// planul săptămânal pentru a distribui volumul rămas.

/**
 * Calculează zilele rămase în săptămâna curentă (Mon-Sun).
 * @param {Date} now
 * @returns {number[]} - indici zile săptămână (0=Sun, 1=Mon, ...)
 */
function remainingDaysThisWeek(now = new Date()) {
  const dow = now.getDay();
  // Days 1-7 (Mon=1 → Sun=0, but treated as Sun=0..Sat=6)
  const remaining = [];
  for (let d = dow + 1; d <= 6; d++) remaining.push(d);
  if (dow !== 0) remaining.push(0); // Include Sunday if today isn't Sunday
  return remaining;
}

/**
 * Distribuie seturile rămase pe zilele disponibile, evitând supraîncărcarea.
 * @param {number} totalSetsLeft - seturi rămase de făcut
 * @param {number} daysLeft - zile rămase în săptămână
 * @param {number} maxSetsPerDay - limita maximă per sesiune (default 20)
 * @returns {number[]} - câte seturi în fiecare zi rămasă
 */
export function distributeSets(totalSetsLeft, daysLeft, maxSetsPerDay = 20) {
  if (daysLeft <= 0 || totalSetsLeft <= 0) return [];
  const perDay = Math.min(maxSetsPerDay, Math.ceil(totalSetsLeft / daysLeft));
  const distribution = [];
  let remaining = totalSetsLeft;
  for (let i = 0; i < daysLeft; i++) {
    const today = Math.min(perDay, remaining);
    distribution.push(today);
    remaining -= today;
    if (remaining <= 0) break;
  }
  return distribution;
}

/**
 * Calculează câte seturi au fost completate săptămâna curentă.
 * @param {Array} logs
 * @param {number} targetSetsPerWeek
 * @returns {{ completedSets: number, targetSets: number, deficit: number }}
 */
export function weeklySetDeficit(logs, targetSetsPerWeek = 45) {
  const now = new Date();
  const startOfWeek = new Date(now);
  // Monday as start of week
  const dow = now.getDay();
  const daysSinceMon = dow === 0 ? 6 : dow - 1;
  startOfWeek.setDate(now.getDate() - daysSinceMon);
  startOfWeek.setHours(0, 0, 0, 0);

  const completedSets = logs.filter(l => {
    const ts = l.ts ?? (l.date ? new Date(l.date).getTime() : null);
    return ts && ts >= startOfWeek.getTime();
  }).length;

  return {
    completedSets,
    targetSets: targetSetsPerWeek,
    deficit: Math.max(0, targetSetsPerWeek - completedSets),
  };
}

/**
 * Recompilează planul săptămânal după un skip sau drop de readiness.
 * @param {object} params
 * @param {Array} params.logs - loguri complete
 * @param {number} params.readinessScore - readiness azi
 * @param {number} params.targetSetsPerWeek
 * @param {Date}   params.now
 * @returns {{ recommendation: string, distributedSets: number[], daysLeft: number, deficit: number }}
 */
export function recompileWeek({ logs = [], readinessScore = 70, targetSetsPerWeek = 45, now = new Date() } = {}) {
  const { deficit, completedSets } = weeklySetDeficit(logs, targetSetsPerWeek);
  const remaining = remainingDaysThisWeek(now);
  const daysLeft = remaining.length;

  if (deficit === 0) {
    return {
      recommendation: 'Săptămâna pe track. Nicio restructurare necesară.',
      distributedSets: [],
      daysLeft,
      deficit: 0,
      completedSets,
    };
  }

  // Reduce deficit if readiness is low — can't make up all volume in one day
  const adjustedDeficit = readinessScore < 60
    ? Math.floor(deficit * 0.6)
    : deficit;

  const distribution = distributeSets(adjustedDeficit, daysLeft);

  const recommendation = daysLeft === 0
    ? `${deficit} seturi nefinalizate această săptămână. Volumul nu poate fi recuperat.`
    : `${deficit} seturi rămase, distribuit pe ${daysLeft} zi${daysLeft === 1 ? '' : 'le'}: ${distribution.join(', ')} seturi.`;

  return {
    recommendation,
    distributedSets: distribution,
    daysLeft,
    deficit: adjustedDeficit,
    completedSets,
  };
}
