// ══ WHY ENGINE — Explică recomandările coachului ══════════════════════════
// explainRecommendation(exercise, ctx) returnează categorii de motive
// structurate: performance, phase, readiness, equipment, pattern.

/**
 * @param {object} exercise - { name, recommendation: { kg, status, statusLabel, rir, repsTarget } }
 * @param {object} ctx - CoachContext
 * @returns {{ summary: string, reasons: Array<{ category, text }> }}
 */
export function explainRecommendation(exercise, ctx) {
  const reasons = [];
  const rec = exercise?.recommendation ?? {};
  const name = exercise?.name ?? exercise;

  // ── Category: performance ──────────────────────────────────────────────
  if (rec.status === 'CONSOLIDATE') {
    reasons.push({
      category: 'performance',
      text: `Consolidezi ${rec.kg ?? rec.weight}kg — ai mai mult de 1 rep în rezervă la ultimele seturi.`,
    });
  } else if (rec.status === 'INCREASE') {
    reasons.push({
      category: 'performance',
      text: `Pregătit pentru progres: poți crește greutatea la ${rec.kg ?? rec.weight}kg.`,
    });
  } else if (rec.status === 'SCALE_BACK') {
    reasons.push({
      category: 'performance',
      text: `Greutate redusă: ai ratat reps-urile țintă la ultima sesiune.`,
    });
  } else if (rec.status === 'INIT' || rec.isInitial) {
    reasons.push({
      category: 'performance',
      text: `Exercițiu nou pentru tine. Greutatea ${rec.kg ?? rec.weight}kg e estimată din exerciții similare.`,
    });
  } else if (rec.rationale) {
    reasons.push({ category: 'performance', text: rec.rationale });
  }

  // ── Category: phase ────────────────────────────────────────────────────
  if (ctx?.isInCut) {
    reasons.push({
      category: 'phase',
      text: 'Ești în faza CUT — prioritate pe menținerea masei musculare, nu maximizarea forței.',
    });
  } else if (ctx?.user?.phase === 'BULK') {
    reasons.push({
      category: 'phase',
      text: 'Faza BULK — volum ridicat și progresie agresivă.',
    });
  }

  // ── Category: readiness ────────────────────────────────────────────────
  const score = ctx?.readiness?.score;
  if (score !== null && score !== undefined) {
    if (score >= 85) {
      reasons.push({ category: 'readiness', text: `Readiness excelent (${score}) — poți da totul azi.` });
    } else if (score >= 70) {
      reasons.push({ category: 'readiness', text: `Readiness bun (${score}) — sesiune normală.` });
    } else if (score >= 55) {
      reasons.push({ category: 'readiness', text: `Readiness moderat (${score}) — volum redus cu 15%.` });
    } else {
      reasons.push({ category: 'readiness', text: `Readiness scăzut (${score}) — sesiune ușoară recomandată.` });
    }
  }

  // ── Category: equipment ────────────────────────────────────────────────
  if (exercise?.isAlternative && exercise?.original) {
    reasons.push({
      category: 'equipment',
      text: `"${exercise.original}" e înlocuit cu "${name}" — echipamentul original indisponibil.`,
    });
  }

  // ── Category: pattern ─────────────────────────────────────────────────
  const patterns = ctx?.patterns ?? [];
  if (patterns.length > 0) {
    const relevant = patterns.filter(p => !p.exercise || p.exercise?.toLowerCase() === String(name).toLowerCase());
    for (const p of relevant.slice(0, 2)) {
      reasons.push({
        category: 'pattern',
        text: p.message ?? `Pattern detectat: ${p.type}`,
      });
    }
  }

  // ── RIR annotation ────────────────────────────────────────────────────
  if (rec.rir !== undefined && rec.rir !== null) {
    const rirLabel = rec.rir === 0 ? 'la efort maxim' : `${rec.rir} RIR (reps în rezervă)`;
    reasons.push({ category: 'performance', text: `Intensitate țintă: ${rirLabel}.` });
  }

  const summary = reasons.length > 0
    ? reasons[0].text
    : `${rec.kg ?? rec.weight ?? '?'}kg recomandat pentru ${name}.`;

  return { summary, reasons };
}

/**
 * Shorthand: returnează doar summary string.
 */
export function whySummary(exercise, ctx) {
  return explainRecommendation(exercise, ctx).summary;
}
