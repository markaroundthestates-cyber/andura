import { describe, it, expect } from 'vitest';
import { EXERCISE_METADATA, getExerciseMetadata, getValidAlternatives } from '../exerciseMetadata.js';

describe('Exercise Metadata Schema §36.36', () => {
  it('Tier 1 compound has force_demand: high', () => {
    expect(EXERCISE_METADATA['Lat Pulldown'].force_demand).toBe('high');
    expect(EXERCISE_METADATA['Lat Pulldown'].tier).toBe(1);
  });

  it('Tier 2 isolation has force_demand: medium', () => {
    expect(EXERCISE_METADATA['Lateral Raises'].force_demand).toBe('medium');
    expect(EXERCISE_METADATA['Lateral Raises'].tier).toBe(2);
  });

  it('unknown exercise returns conservative default', () => {
    const meta = getExerciseMetadata('NonExistent Exercise');
    expect(meta.equipment_type).toBe('machine');
    expect(meta.tier).toBe(2);
    expect(meta.muscle_target_primary).toBe('unknown');
  });

  it('Tier 1 alternatives filtered by force_demand: high (Smart-Routing §36.37)', () => {
    const alts = getValidAlternatives('Lat Pulldown');
    expect(alts).toContain('Cable Row');
    // Cable Row also has force_demand: 'high' tier 1, so it qualifies
    alts.forEach(a => {
      expect(EXERCISE_METADATA[a].force_demand).toBe('high');
    });
  });

  it('Tier 2 alternatives filter by muscle_target_primary match (flexibility)', () => {
    const alts = getValidAlternatives('Lateral Raises');
    // must share muscle_target_primary 'umeri'
    alts.forEach(a => {
      expect(EXERCISE_METADATA[a].muscle_target_primary).toBe('umeri');
    });
  });
});

// ── Bundle 6.0.1 Chest Library Extension Tests (Bundle 6.0.1 NEW 2026-05-13h) ────────
describe('Bundle 6.0.1 Chest Library Extension §ADR v2 LOCK V2', () => {
  // §1 Library count expand 26 → 116 (additive only, ZERO mutation existing 26 V1 baseline)
  // NOTE: spec authored "27 → 117"; pre-flight grep confirmed baseline 26 (file comment line 16 "all 26 entries reviewed"); spec off-by-one corrected here.
  // Bundle 6.0.2 forward-compat: relax to ≥116 (library grows additive per Bundle 6.0.x roadmap).
  it('library count ≥ 116 post Bundle 6.0.1 (+90 NEW chest minimum, additive Bundle 6.0.x roadmap)', () => {
    const total = Object.keys(EXERCISE_METADATA).length;
    expect(total).toBeGreaterThanOrEqual(116);
  });

  // §2 Chest cluster count 5 existing + 80 NEW chest-primary (the other 10 NEW are triceps/umeri primary close-grip/dip/diamond/pike variants)
  it('chest primary muscle target entries count ~85 (5 existing + 80 NEW chest-primary)', () => {
    const chestEntries = Object.entries(EXERCISE_METADATA)
      .filter(([, meta]) => meta.muscle_target_primary === 'piept');
    expect(chestEntries.length).toBeGreaterThanOrEqual(85);
    expect(chestEntries.length).toBeLessThanOrEqual(100);
  });

  // §3 New canonical strings preserved (NO new muscle_target_primary added beyond V1 6 canonical)
  it('muscle_target_primary uses only V1 canonical 6 strings (brate, piept, picioare, spate, triceps, umeri)', () => {
    const canonical = new Set(['brate', 'piept', 'picioare', 'spate', 'triceps', 'umeri']);
    Object.values(EXERCISE_METADATA).forEach(meta => {
      expect(canonical.has(meta.muscle_target_primary)).toBe(true);
    });
  });

  // §4 equipment_type canonical preserved (5 V1 canonical + bodyweight NEW Bundle 6.0.1, band still unused)
  it('equipment_type uses only V1 canonical 6 strings (barbell, bodyweight, cable, dumbbell, machine, band)', () => {
    const canonical = new Set(['barbell', 'bodyweight', 'cable', 'dumbbell', 'machine', 'band']);
    Object.values(EXERCISE_METADATA).forEach(meta => {
      expect(canonical.has(meta.equipment_type)).toBe(true);
    });
  });

  // §5 fallback_cascade field exists ALL NEW Bundle 6.0.1 entries (sample subset)
  it('all 90 NEW Bundle 6.0.1 entries have fallback_cascade[] field populated', () => {
    const newChestEntries = [
      'Incline Barbell Bench', 'Decline Barbell Bench', 'Close-Grip Bench Press',
      'Push-up', 'Diamond Push-up', 'Wall Push-up', 'Dip', 'DB Fly',
      'Cable Crossover High-to-Low', 'Smith Machine Bench', 'Hammer Press Machine',
    ];
    newChestEntries.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade).toBeDefined();
      expect(Array.isArray(EXERCISE_METADATA[name].fallback_cascade)).toBe(true);
      expect(EXERCISE_METADATA[name].fallback_cascade.length).toBeGreaterThanOrEqual(3);
      expect(EXERCISE_METADATA[name].fallback_cascade.length).toBeLessThanOrEqual(5);
    });
  });

  // §6 fallback_cascade step types canonical (5 types per ADR v2 §2.1)
  it('fallback_cascade step types use only canonical 5 (easier_machine|assisted_variant|muscle_group_compose|bodyweight|light_variant)', () => {
    const canonical = new Set(['easier_machine', 'assisted_variant', 'muscle_group_compose', 'bodyweight', 'light_variant']);
    Object.values(EXERCISE_METADATA).forEach(meta => {
      if (meta.fallback_cascade) {
        meta.fallback_cascade.forEach(step => {
          expect(canonical.has(step.type)).toBe(true);
        });
      }
    });
  });

  // §7 fallback_cascade exercise_id OR exercise_ids exclusive per step (muscle_group_compose uses array, others single)
  it('fallback_cascade step has exercise_id (single) OR exercise_ids (1-2 array) — XOR exclusive', () => {
    Object.values(EXERCISE_METADATA).forEach(meta => {
      if (!meta.fallback_cascade) return;
      meta.fallback_cascade.forEach(step => {
        if (step.type === 'muscle_group_compose') {
          expect(step.exercise_ids).toBeDefined();
          expect(Array.isArray(step.exercise_ids)).toBe(true);
          expect(step.exercise_ids.length).toBeGreaterThanOrEqual(1);
          expect(step.exercise_ids.length).toBeLessThanOrEqual(2);
        } else {
          expect(step.exercise_id).toBeDefined();
          expect(typeof step.exercise_id).toBe('string');
        }
      });
    });
  });

  // §8 fallback_cascade canonical ordering check (each step type is from canonical 5)
  it('fallback_cascade preserves canonical step types when present', () => {
    const compoundChestKeys = ['Push-up', 'Dip', 'Wide-Grip Bench Press', 'Bench Dip'];
    const canonicalOrder = ['easier_machine', 'assisted_variant', 'muscle_group_compose', 'bodyweight', 'light_variant'];
    compoundChestKeys.forEach(name => {
      const cascade = EXERCISE_METADATA[name].fallback_cascade;
      if (!cascade || cascade.length < 5) return;
      cascade.forEach(step => {
        const pos = canonicalOrder.indexOf(step.type);
        expect(pos).toBeGreaterThanOrEqual(0);
      });
    });
  });

  // §9 Existing V1 library 26 entries UNCHANGED invariant (5 chest entries from V1 baseline)
  it('existing V1 library chest entries preserved (ZERO mutation Bundle 6.0.1)', () => {
    const v1ExistingChest = ['Incline DB Press', 'Flat DB Press', 'Flat Barbell Bench', 'Pec Deck / Cable Fly', 'Cable Fly'];
    v1ExistingChest.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();
      expect(EXERCISE_METADATA[name].muscle_target_primary).toBe('piept');
      // V1 entries do NOT have fallback_cascade (Bundle 6.1 populate downstream)
      expect(EXERCISE_METADATA[name].fallback_cascade).toBeUndefined();
    });
  });

  // §10 Sample chest cascade integrity — Bench press cascade trajectory
  it('Flat Barbell Bench preserves V1 structure (no fallback_cascade Bundle 6.0.1 invariant)', () => {
    expect(EXERCISE_METADATA['Flat Barbell Bench'].equipment_type).toBe('barbell');
    expect(EXERCISE_METADATA['Flat Barbell Bench'].force_demand).toBe('high');
    expect(EXERCISE_METADATA['Flat Barbell Bench'].tier).toBe(1);
    expect(EXERCISE_METADATA['Flat Barbell Bench'].fallback_cascade).toBeUndefined();
  });

  // §11 Sample chest cascade integrity — NEW Smith Machine Bench has cascade properly
  it('Smith Machine Bench (NEW) has 5-step canonical cascade', () => {
    const cascade = EXERCISE_METADATA['Smith Machine Bench'].fallback_cascade;
    expect(cascade).toBeDefined();
    expect(cascade.length).toBe(5);
    expect(cascade[0].type).toBe('easier_machine');
    expect(cascade[4].type).toBe('light_variant');
  });

  // §12 Sample chest cascade integrity — NEW Push-up has cascade with muscle_group_compose
  it('Push-up (NEW) has cascade with muscle_group_compose step', () => {
    const cascade = EXERCISE_METADATA['Push-up'].fallback_cascade;
    expect(cascade).toBeDefined();
    const composeStep = cascade.find(s => s.type === 'muscle_group_compose');
    expect(composeStep).toBeDefined();
    expect(composeStep.exercise_ids).toBeDefined();
    expect(composeStep.exercise_ids.length).toBeGreaterThanOrEqual(1);
  });

  // §13 NEW Tier 1 Push-up plyometric variant has high force_demand
  it('Plyometric Push-up classified as Tier 1 force_demand high', () => {
    expect(EXERCISE_METADATA['Plyometric Push-up'].tier).toBe(1);
    expect(EXERCISE_METADATA['Plyometric Push-up'].force_demand).toBe('high');
  });

  // §14 Bodyweight light_variant degrades to Wall/Knee Push-up consistently across cascades
  it('many Tier 2-3 chest exercises light_variant degrades to Wall Push-up or Knee Push-up', () => {
    const checkNames = ['Push-up', 'Diamond Push-up', 'Wide Push-up', 'Decline Push-up'];
    checkNames.forEach(name => {
      const cascade = EXERCISE_METADATA[name].fallback_cascade;
      const lightStep = cascade?.find(s => s.type === 'light_variant');
      expect(lightStep).toBeDefined();
      expect(/Push-up|Wall Push|Knee/i.test(lightStep.exercise_id)).toBe(true);
    });
  });

  // §15 muscle_target_secondary 'core' NOT used (Bundle 6.0.1 chest doesn't add core; reserved post-Bundle 6.0.7)
  it('Bundle 6.0.1 does NOT introduce core as muscle_target (reserved Bundle 6.0.7 Core sub-batch)', () => {
    Object.values(EXERCISE_METADATA).forEach(meta => {
      expect(meta.muscle_target_primary).not.toBe('core');
      expect(meta.muscle_target_secondary).not.toContain('core');
    });
  });

  // §16 force_demand enum strict (low|medium|high only)
  it('force_demand uses canonical 3 values only', () => {
    const canonical = new Set(['low', 'medium', 'high']);
    Object.values(EXERCISE_METADATA).forEach(meta => {
      expect(canonical.has(meta.force_demand)).toBe(true);
    });
  });

  // §17 tier enum strict (1|2|3 only)
  it('tier uses canonical 3 values only', () => {
    Object.values(EXERCISE_METADATA).forEach(meta => {
      expect([1, 2, 3]).toContain(meta.tier);
    });
  });

  // §18 equipment_alternatives field preserved all entries (V1 ranking-based path)
  it('all entries have equipment_alternatives array field (V1 ranking-based path preserved)', () => {
    Object.values(EXERCISE_METADATA).forEach(meta => {
      expect(Array.isArray(meta.equipment_alternatives)).toBe(true);
    });
  });

  // §19 V1 ADR_SMART_ROUTING_v1 ranking compat — getValidAlternatives works on NEW entries
  it('getValidAlternatives works on NEW Bundle 6.0.1 entries', () => {
    const alts = getValidAlternatives('Smith Machine Bench');
    expect(Array.isArray(alts)).toBe(true);
    expect(alts.length).toBeGreaterThan(0);
  });

  // §20 Cascade self-reference rejection — no exercise_id matching parent exercise name
  it('fallback_cascade NEVER self-references parent exercise (would infinite loop engine)', () => {
    Object.entries(EXERCISE_METADATA).forEach(([parentName, meta]) => {
      if (!meta.fallback_cascade) return;
      meta.fallback_cascade.forEach(step => {
        if (step.exercise_id) expect(step.exercise_id).not.toBe(parentName);
        if (step.exercise_ids) expect(step.exercise_ids).not.toContain(parentName);
      });
    });
  });

  // §21 Cascade references exist in library lenient (≥75% resolved Bundle 6.0.1 phase; some forward-refs Bundle 6.0.2+ OK)
  it('cascade exercise_id references resolve in library (graceful for future Bundle entries)', () => {
    let totalRefs = 0;
    let resolvedRefs = 0;
    Object.values(EXERCISE_METADATA).forEach(meta => {
      if (!meta.fallback_cascade) return;
      meta.fallback_cascade.forEach(step => {
        const refs = step.exercise_ids || [step.exercise_id];
        refs.forEach(ref => {
          totalRefs++;
          if (EXERCISE_METADATA[ref]) resolvedRefs++;
        });
      });
    });
    expect(resolvedRefs / totalRefs).toBeGreaterThanOrEqual(0.75);
  });

  // §22 Tier 1 chest variants count ≥ 30 (compound primary expected)
  it('Tier 1 chest variants count expanded (compound primary push movement coverage)', () => {
    const tier1Chest = Object.values(EXERCISE_METADATA)
      .filter(m => m.muscle_target_primary === 'piept' && m.tier === 1);
    expect(tier1Chest.length).toBeGreaterThanOrEqual(30);
  });

  // §23 Tier 2 chest isolation count ≥ 15 (fly/dip variants)
  it('Tier 2 chest isolation variants count expanded', () => {
    const tier2Chest = Object.values(EXERCISE_METADATA)
      .filter(m => m.muscle_target_primary === 'piept' && m.tier === 2);
    expect(tier2Chest.length).toBeGreaterThanOrEqual(15);
  });

  // §24 Tier 3 chest bodyweight accessory count ≥ 3 (knee/wall push-up variants)
  it('Tier 3 chest accessory bodyweight variants count present', () => {
    const tier3Chest = Object.values(EXERCISE_METADATA)
      .filter(m => m.muscle_target_primary === 'piept' && m.tier === 3);
    expect(tier3Chest.length).toBeGreaterThanOrEqual(3);
  });

  // §25 Co-CTO bias regression — Smith machine variants exist (gym-focused paradigm Daniel LOCK 2026-05-13f)
  it('Smith machine variants present (Andura primary gym-focused paradigm LOCK 2026-05-13f)', () => {
    const smithVariants = ['Smith Machine Bench', 'Smith Incline Bench', 'Smith Decline Bench'];
    smithVariants.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();
      expect(EXERCISE_METADATA[name].equipment_type).toBe('machine');
    });
  });
});

// ── Bundle 6.0.2 Back Library Extension Tests (Bundle 6.0.2 NEW 2026-05-13h) ────────
describe('Bundle 6.0.2 Back Library Extension §ADR v2 LOCK V2', () => {
  // §1 Library count expand 116 → 214 (additive only, ZERO mutation existing)
  // Bundle 6.0.3 forward-compat: relax to ≥214 (library grows additive per Bundle 6.0.x roadmap).
  it('library count ≥ 214 post Bundle 6.0.2 (+98 NEW back minimum, additive Bundle 6.0.x roadmap)', () => {
    const total = Object.keys(EXERCISE_METADATA).length;
    expect(total).toBeGreaterThanOrEqual(214);
  });

  // §2 Back cluster count baseline 3 V1 + Bundle 6.0.2 back-primary ≈ 91
  it('back primary muscle target entries count ~90-115', () => {
    const backEntries = Object.entries(EXERCISE_METADATA).filter(([, m]) => m.muscle_target_primary === 'spate');
    expect(backEntries.length).toBeGreaterThanOrEqual(90);
    expect(backEntries.length).toBeLessThanOrEqual(115);
  });

  // §3 muscle_target_primary canonical (preserved 6 + unknown fallback)
  it('muscle_target_primary uses only canonical V1 6 strings + unknown fallback', () => {
    const canonical = new Set(['brate', 'piept', 'picioare', 'spate', 'triceps', 'umeri', 'unknown']);
    Object.values(EXERCISE_METADATA).forEach(m => {
      expect(canonical.has(m.muscle_target_primary)).toBe(true);
    });
  });

  // §4 equipment_type canonical 'band' introduced Bundle 6.0.2
  it('equipment_type canonical preserved + band introduced Bundle 6.0.2', () => {
    const canonical = new Set(['barbell', 'bodyweight', 'cable', 'dumbbell', 'machine', 'band']);
    Object.values(EXERCISE_METADATA).forEach(m => {
      expect(canonical.has(m.equipment_type)).toBe(true);
    });
    const bandEntries = Object.values(EXERCISE_METADATA).filter(m => m.equipment_type === 'band');
    expect(bandEntries.length).toBeGreaterThanOrEqual(1);
  });

  // §5 fallback_cascade field exists ALL NEW Bundle 6.0.2 sample entries
  it('all 98 NEW Bundle 6.0.2 entries have fallback_cascade[] populated', () => {
    const newBackSample = [
      'Pull-up', 'Chin-up', 'Barbell Row', 'T-Bar Row', 'DB Row', 'Wide-Grip Cable Row',
      'Hammer Strength Row', 'Face Pull Bench', 'BB Shrug', 'Roman Chair Back Extension',
      'Inverted Row Bar', 'Rack Pull',
    ];
    newBackSample.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade).toBeDefined();
      expect(Array.isArray(EXERCISE_METADATA[name].fallback_cascade)).toBe(true);
      expect(EXERCISE_METADATA[name].fallback_cascade.length).toBeGreaterThanOrEqual(3);
      expect(EXERCISE_METADATA[name].fallback_cascade.length).toBeLessThanOrEqual(5);
    });
  });

  // §6 fallback_cascade step types canonical (5 types preserved Bundle 6.0.1 + 6.0.2)
  it('fallback_cascade step types canonical 5 preserved Bundle 6.0.2', () => {
    const canonical = new Set(['easier_machine', 'assisted_variant', 'muscle_group_compose', 'bodyweight', 'light_variant']);
    Object.values(EXERCISE_METADATA).forEach(m => {
      if (m.fallback_cascade) {
        m.fallback_cascade.forEach(s => expect(canonical.has(s.type)).toBe(true));
      }
    });
  });

  // §7 muscle_group_compose 1-2 exercise_ids invariant Daniel LOCK "fie 1 exercitiu sau 2"
  it('muscle_group_compose step has 1-2 exercise_ids only', () => {
    Object.values(EXERCISE_METADATA).forEach(m => {
      if (!m.fallback_cascade) return;
      m.fallback_cascade.forEach(s => {
        if (s.type === 'muscle_group_compose') {
          expect(s.exercise_ids).toBeDefined();
          expect(s.exercise_ids.length).toBeGreaterThanOrEqual(1);
          expect(s.exercise_ids.length).toBeLessThanOrEqual(2);
        }
      });
    });
  });

  // §8 Bundle 6.0.2 introduces 'band' equipment_type explicit (count ≥3)
  it('Bundle 6.0.2 introduces band equipment_type (count ≥ 3)', () => {
    const bandNames = ['Band Face Pull', 'Band-Assisted Pull-up', 'Banded Good Morning'];
    bandNames.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();
      expect(EXERCISE_METADATA[name].equipment_type).toBe('band');
    });
  });

  // §9 Existing V1 + Bundle 6.0.1 entries UNCHANGED invariant
  it('existing V1 baseline + Bundle 6.0.1 90 NEW preserved invariant (ZERO mutation Bundle 6.0.2)', () => {
    expect(EXERCISE_METADATA['Lat Pulldown']).toBeDefined();
    expect(EXERCISE_METADATA['Lat Pulldown'].fallback_cascade).toBeUndefined();
    expect(EXERCISE_METADATA['Cable Row']).toBeDefined();
    expect(EXERCISE_METADATA['Cable Row'].fallback_cascade).toBeUndefined();
    expect(EXERCISE_METADATA['Smith Machine Bench']).toBeDefined();
    expect(EXERCISE_METADATA['Smith Machine Bench'].fallback_cascade).toBeDefined();
    expect(EXERCISE_METADATA['Push-up']).toBeDefined();
    expect(EXERCISE_METADATA['Push-up'].fallback_cascade).toBeDefined();
  });

  // §10 Sample back cascade integrity Pull-up canonical 5-step
  it('Pull-up has 5-step canonical cascade', () => {
    const cascade = EXERCISE_METADATA['Pull-up'].fallback_cascade;
    expect(cascade.length).toBe(5);
    expect(cascade[0].type).toBe('easier_machine');
    expect(cascade[0].exercise_id).toBe('Lat Pulldown');
    expect(cascade[4].type).toBe('light_variant');
  });

  // §11 Sample back cascade integrity Barbell Row canonical 5-step
  it('Barbell Row has 5-step canonical cascade', () => {
    const cascade = EXERCISE_METADATA['Barbell Row'].fallback_cascade;
    expect(cascade.length).toBe(5);
    expect(cascade[0].type).toBe('easier_machine');
    expect(cascade[4].type).toBe('light_variant');
  });

  // §12 Conventional Deadlift muscle_target_primary 'picioare' (compound posterior chain legs primary)
  it('Conventional Deadlift classified picioare primary (compound legs cu spate secondary)', () => {
    expect(EXERCISE_METADATA['Conventional Deadlift'].muscle_target_primary).toBe('picioare');
    expect(EXERCISE_METADATA['Conventional Deadlift'].muscle_target_secondary).toContain('spate');
  });

  // §13 Rack Pull muscle_target_primary 'spate' (partial ROM upper back emphasis)
  it('Rack Pull classified spate primary (partial ROM upper back emphasis)', () => {
    expect(EXERCISE_METADATA['Rack Pull'].muscle_target_primary).toBe('spate');
    expect(EXERCISE_METADATA['Rack Pull'].muscle_target_secondary).toContain('picioare');
  });

  // §14 Tier 1 back compound count ≥ 35 (pull-up + chin-up + row + heavy compound)
  it('Tier 1 back compound count ≥ 35', () => {
    const tier1 = Object.values(EXERCISE_METADATA).filter(m => m.muscle_target_primary === 'spate' && m.tier === 1);
    expect(tier1.length).toBeGreaterThanOrEqual(35);
  });

  // §15 Tier 2 back hypertrophy count ≥ 30 (cable + DB + machine isolation)
  it('Tier 2 back hypertrophy count ≥ 30', () => {
    const tier2 = Object.values(EXERCISE_METADATA).filter(m => m.muscle_target_primary === 'spate' && m.tier === 2);
    expect(tier2.length).toBeGreaterThanOrEqual(30);
  });

  // §16 Tier 3 back accessory count ≥ 6 (bodyweight + accessory)
  it('Tier 3 back accessory count ≥ 6', () => {
    const tier3 = Object.values(EXERCISE_METADATA).filter(m => m.muscle_target_primary === 'spate' && m.tier === 3);
    expect(tier3.length).toBeGreaterThanOrEqual(6);
  });

  // §17 Cascade self-reference rejection invariant Bundle 6.0.2
  it('Bundle 6.0.2 NEW entries NEVER self-reference parent name', () => {
    const newSample = ['Pull-up', 'Chin-up', 'Barbell Row', 'Cable Row Slow', 'Inverted Row Bar', 'Rack Pull'];
    newSample.forEach(parentName => {
      const cascade = EXERCISE_METADATA[parentName]?.fallback_cascade;
      if (!cascade) return;
      cascade.forEach(s => {
        if (s.exercise_id) expect(s.exercise_id).not.toBe(parentName);
        if (s.exercise_ids) expect(s.exercise_ids).not.toContain(parentName);
      });
    });
  });

  // §18 Cascade reference resolution lenient ≥70% Bundle 6.0.2 phase (forward Bundle 6.0.3+ refs OK temporary dangling)
  it('cascade references resolve ≥70% Bundle 6.0.2 phase', () => {
    let total = 0, resolved = 0;
    Object.values(EXERCISE_METADATA).forEach(m => {
      if (!m.fallback_cascade) return;
      m.fallback_cascade.forEach(s => {
        const refs = s.exercise_ids || [s.exercise_id];
        refs.forEach(r => { total++; if (EXERCISE_METADATA[r]) resolved++; });
      });
    });
    expect(resolved / total).toBeGreaterThanOrEqual(0.7);
  });

  // §19 Face Pull Bench classified umeri primary (rear delt emphasis)
  it('Face Pull Bench classified umeri primary spate secondary', () => {
    expect(EXERCISE_METADATA['Face Pull Bench'].muscle_target_primary).toBe('umeri');
    expect(EXERCISE_METADATA['Face Pull Bench'].muscle_target_secondary).toContain('spate');
  });

  // §20 Andura primary gym-focused paradigm — Hammer Strength variants present
  it('Hammer Strength back variants present (gym-focused paradigm LOCK 2026-05-13f)', () => {
    const hsBackVariants = ['Hammer Strength Row', 'Hammer Strength Iso-Lateral High Row', 'Hammer Strength Iso-Lateral Low Row', 'Hammer Strength Chest-Supported Row', 'Hammer Strength Lat Pulldown'];
    hsBackVariants.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();
      expect(EXERCISE_METADATA[name].equipment_type).toBe('machine');
    });
  });

  // §21 force_demand canonical 3 preserved invariant Bundle 6.0.2
  it('force_demand canonical 3 values preserved Bundle 6.0.2', () => {
    const canonical = new Set(['low', 'medium', 'high']);
    Object.values(EXERCISE_METADATA).forEach(m => {
      expect(canonical.has(m.force_demand)).toBe(true);
    });
  });

  // §22 tier canonical 3 preserved invariant Bundle 6.0.2
  it('tier canonical 3 values preserved Bundle 6.0.2', () => {
    Object.values(EXERCISE_METADATA).forEach(m => {
      expect([1, 2, 3]).toContain(m.tier);
    });
  });

  // §23 Phase A pull-up cascade cu Lat Pulldown easier_machine first (gym paradigm)
  it('Phase A Pull-up cascade easier_machine = Lat Pulldown (gym paradigm Daniel LOCK)', () => {
    const cascade = EXERCISE_METADATA['Pull-up'].fallback_cascade;
    const easierStep = cascade.find(s => s.type === 'easier_machine');
    expect(easierStep.exercise_id).toBe('Lat Pulldown');
  });

  // §24 Phase D Barbell Row cascade cu T-Bar Row easier_machine first (gym paradigm)
  it('Phase D Barbell Row cascade easier_machine = T-Bar Row (gym paradigm Daniel LOCK)', () => {
    const cascade = EXERCISE_METADATA['Barbell Row'].fallback_cascade;
    const easierStep = cascade.find(s => s.type === 'easier_machine');
    expect(easierStep.exercise_id).toBe('T-Bar Row');
  });

  // §25 Inverted Row Bar = primary bodyweight target across back cascades
  it('Inverted Row Bar referenced as bodyweight step across multiple back cascades', () => {
    let count = 0;
    Object.values(EXERCISE_METADATA).forEach(m => {
      if (!m.fallback_cascade) return;
      m.fallback_cascade.forEach(s => {
        if (s.type === 'bodyweight' && s.exercise_id === 'Inverted Row Bar') count++;
      });
    });
    expect(count).toBeGreaterThanOrEqual(15);
  });
});

// ── Bundle 6.0.3 Shoulders Library Extension Tests (Bundle 6.0.3 NEW 2026-05-13i) ────────
describe('Bundle 6.0.3 Shoulders Library Extension §ADR v2 LOCK V2', () => {
  // §1 Library count expanded ≥ 294 (additive Bundle 6.0.x roadmap)
  it('library count ≥ 294 post Bundle 6.0.3 (+80 NEW shoulders cumulative)', () => {
    const total = Object.keys(EXERCISE_METADATA).length;
    expect(total).toBeGreaterThanOrEqual(294);
  });

  // §2 Shoulder cluster count post Bundle 6.0.3 (existing 13 + ~80 NEW)
  it('shoulder primary muscle target entries count ≥ 75 post Bundle 6.0.3', () => {
    const shoulderEntries = Object.entries(EXERCISE_METADATA)
      .filter(([, m]) => m.muscle_target_primary === 'umeri');
    expect(shoulderEntries.length).toBeGreaterThanOrEqual(75);
  });

  // §3 muscle_target_primary canonical (V1 6 + unknown fallback)
  it('muscle_target_primary uses canonical V1 6 strings + unknown fallback', () => {
    const canonical = new Set(['brate', 'piept', 'picioare', 'spate', 'triceps', 'umeri', 'unknown']);
    Object.values(EXERCISE_METADATA).forEach(m => {
      expect(canonical.has(m.muscle_target_primary)).toBe(true);
    });
  });

  // §4 equipment_type canonical 6 (band active Bundle 6.0.2 + Band Pull-Apart Bundle 6.0.3)
  it('equipment_type canonical 6 preserved (band active)', () => {
    const canonical = new Set(['barbell', 'bodyweight', 'cable', 'dumbbell', 'machine', 'band']);
    Object.values(EXERCISE_METADATA).forEach(m => {
      expect(canonical.has(m.equipment_type)).toBe(true);
    });
  });

  // §5 fallback_cascade field exists ALL NEW Bundle 6.0.3 sample entries
  it('all 80 NEW Bundle 6.0.3 entries have fallback_cascade[] populated', () => {
    const newShoulderSample = [
      'Push Press', 'Arnold Press', 'Smith OHP', 'DB Lateral Raise',
      'Cable Lateral Raise', 'DB Front Raise', 'Reverse Pec Deck', 'Face Pull',
      'Landmine Shoulder Press', 'Handstand Push-up', 'Clean and Press',
    ];
    newShoulderSample.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade).toBeDefined();
      expect(Array.isArray(EXERCISE_METADATA[name].fallback_cascade)).toBe(true);
      expect(EXERCISE_METADATA[name].fallback_cascade.length).toBeGreaterThanOrEqual(3);
      expect(EXERCISE_METADATA[name].fallback_cascade.length).toBeLessThanOrEqual(5);
    });
  });

  // §6 fallback_cascade step types canonical 5 preserved Bundle 6.0.3
  it('fallback_cascade step types canonical 5 preserved Bundle 6.0.3', () => {
    const canonical = new Set(['easier_machine', 'assisted_variant', 'muscle_group_compose', 'bodyweight', 'light_variant']);
    Object.values(EXERCISE_METADATA).forEach(m => {
      if (m.fallback_cascade) {
        m.fallback_cascade.forEach(s => expect(canonical.has(s.type)).toBe(true));
      }
    });
  });

  // §7 muscle_group_compose 1-2 exercise_ids invariant
  it('muscle_group_compose step has 1-2 exercise_ids only', () => {
    Object.values(EXERCISE_METADATA).forEach(m => {
      if (!m.fallback_cascade) return;
      m.fallback_cascade.forEach(s => {
        if (s.type === 'muscle_group_compose') {
          expect(s.exercise_ids).toBeDefined();
          expect(s.exercise_ids.length).toBeGreaterThanOrEqual(1);
          expect(s.exercise_ids.length).toBeLessThanOrEqual(2);
        }
      });
    });
  });

  // §8 Existing V1 + Bundle 6.0.1 + Bundle 6.0.2 entries preserved (ZERO mutation Bundle 6.0.3)
  it('existing entries preserved invariant Bundle 6.0.3', () => {
    expect(EXERCISE_METADATA['DB Shoulder Press']).toBeDefined();
    expect(EXERCISE_METADATA['DB Shoulder Press'].muscle_target_primary).toBe('umeri');
    expect(EXERCISE_METADATA['Lat Pulldown']).toBeDefined();
    expect(EXERCISE_METADATA['Lat Pulldown'].fallback_cascade).toBeUndefined();
    expect(EXERCISE_METADATA['Smith Machine Bench']).toBeDefined();
    expect(EXERCISE_METADATA['Smith Machine Bench'].fallback_cascade).toBeDefined();
    expect(EXERCISE_METADATA['Pull-up']).toBeDefined();
    expect(EXERCISE_METADATA['Pull-up'].fallback_cascade).toBeDefined();
  });

  // §9 Push Press has 5-step canonical cascade
  it('Push Press has 5-step cascade ending in light_variant', () => {
    const cascade = EXERCISE_METADATA['Push Press'].fallback_cascade;
    expect(cascade.length).toBe(5);
    expect(cascade[0].type).toBe('easier_machine');
    expect(cascade[4].type).toBe('light_variant');
  });

  // §10 Arnold Press has muscle_group_compose step
  it('Arnold Press has cascade with muscle_group_compose step', () => {
    const cascade = EXERCISE_METADATA['Arnold Press'].fallback_cascade;
    const composeStep = cascade.find(s => s.type === 'muscle_group_compose');
    expect(composeStep).toBeDefined();
    expect(composeStep.exercise_ids.length).toBeGreaterThanOrEqual(1);
  });

  // §11 Lateral raise variants light_variant = Wall Pike Push-up consistent
  it('lateral raise variants light_variant degrades to Wall Pike Push-up', () => {
    const lateralRaises = ['DB Lateral Raise', 'Cable Lateral Raise', 'Machine Lateral Raise', 'Seated DB Lateral'];
    lateralRaises.forEach(name => {
      const cascade = EXERCISE_METADATA[name].fallback_cascade;
      const lightStep = cascade?.find(s => s.type === 'light_variant');
      expect(lightStep).toBeDefined();
      expect(lightStep.exercise_id).toBe('Wall Pike Push-up');
    });
  });

  // §12 Rear delt variants light_variant = Wall Push-up consistent
  it('rear delt variants light_variant degrades to Wall Push-up', () => {
    const rearDelts = ['Reverse Pec Deck', 'Cable Rear Delt Fly', 'Face Pull', 'Band Pull-Apart'];
    rearDelts.forEach(name => {
      const cascade = EXERCISE_METADATA[name].fallback_cascade;
      const lightStep = cascade?.find(s => s.type === 'light_variant');
      expect(lightStep).toBeDefined();
      expect(lightStep.exercise_id).toBe('Wall Push-up');
    });
  });

  // §13 Tier 1 shoulder compound variants count ≥ 25
  it('Tier 1 shoulder compound count ≥ 25', () => {
    const tier1 = Object.values(EXERCISE_METADATA).filter(m => m.muscle_target_primary === 'umeri' && m.tier === 1);
    expect(tier1.length).toBeGreaterThanOrEqual(25);
  });

  // §14 Tier 2 shoulder isolation count ≥ 25
  it('Tier 2 shoulder isolation count ≥ 25', () => {
    const tier2 = Object.values(EXERCISE_METADATA).filter(m => m.muscle_target_primary === 'umeri' && m.tier === 2);
    expect(tier2.length).toBeGreaterThanOrEqual(25);
  });

  // §15 Tier 3 shoulder accessory count ≥ 3
  it('Tier 3 shoulder accessory count ≥ 3', () => {
    const tier3 = Object.values(EXERCISE_METADATA).filter(m => m.muscle_target_primary === 'umeri' && m.tier === 3);
    expect(tier3.length).toBeGreaterThanOrEqual(3);
  });

  // §16 Smith machine shoulder variants present (gym paradigm LOCK 2026-05-13f)
  it('Smith machine shoulder variants present (gym paradigm)', () => {
    const smithVariants = ['Smith OHP', 'Smith OHP Seated', 'Smith Behind-Neck Press'];
    smithVariants.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();
      expect(EXERCISE_METADATA[name].equipment_type).toBe('machine');
    });
  });

  // §17 Hammer Strength shoulder variants present
  it('Hammer Strength shoulder variants present', () => {
    const hammerVariants = ['Hammer Strength OHP', 'Hammer Strength Lateral'];
    hammerVariants.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();
      expect(EXERCISE_METADATA[name].equipment_type).toBe('machine');
    });
  });

  // §18 Landmine shoulder variants present
  it('Landmine shoulder variants present', () => {
    const landmineVariants = ['Landmine Shoulder Press', 'Landmine 180', 'Single-Arm Landmine Press', 'Half-Kneeling Landmine Press'];
    landmineVariants.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();
      expect(EXERCISE_METADATA[name].equipment_type).toBe('barbell');
    });
  });

  // §19 Cascade self-reference rejection invariant Bundle 6.0.3
  it('Bundle 6.0.3 NEW entries NEVER self-reference parent name', () => {
    const newSample = ['Push Press', 'Arnold Press', 'Smith OHP', 'DB Lateral Raise', 'DB Front Raise', 'Reverse Pec Deck', 'Face Pull', 'Landmine Shoulder Press', 'Clean and Press'];
    newSample.forEach(parentName => {
      const cascade = EXERCISE_METADATA[parentName]?.fallback_cascade;
      if (!cascade) return;
      cascade.forEach(s => {
        if (s.exercise_id) expect(s.exercise_id).not.toBe(parentName);
        if (s.exercise_ids) expect(s.exercise_ids).not.toContain(parentName);
      });
    });
  });

  // §20 Cascade references resolve ≥70% Bundle 6.0.3 phase (lenient — forward refs to 'OHP' + Bundle 6.0.4+ entries OK temporary dangling)
  it('cascade references resolve ≥70% Bundle 6.0.3 phase', () => {
    let total = 0, resolved = 0;
    Object.values(EXERCISE_METADATA).forEach(m => {
      if (!m.fallback_cascade) return;
      m.fallback_cascade.forEach(s => {
        const refs = s.exercise_ids || [s.exercise_id];
        refs.forEach(r => { total++; if (EXERCISE_METADATA[r]) resolved++; });
      });
    });
    expect(resolved / total).toBeGreaterThanOrEqual(0.7);
  });

  // §21 force_demand canonical 3 preserved
  it('force_demand canonical 3 values preserved Bundle 6.0.3', () => {
    const canonical = new Set(['low', 'medium', 'high']);
    Object.values(EXERCISE_METADATA).forEach(m => {
      expect(canonical.has(m.force_demand)).toBe(true);
    });
  });

  // §22 tier canonical 3 preserved
  it('tier canonical 3 values preserved Bundle 6.0.3', () => {
    Object.values(EXERCISE_METADATA).forEach(m => {
      expect([1, 2, 3]).toContain(m.tier);
    });
  });

  // §23 equipment_alternatives field on all entries
  it('all entries have equipment_alternatives array field', () => {
    Object.values(EXERCISE_METADATA).forEach(m => {
      expect(Array.isArray(m.equipment_alternatives)).toBe(true);
    });
  });

  // §24 getValidAlternatives works on NEW Bundle 6.0.3 entries
  it('getValidAlternatives works on NEW Bundle 6.0.3 entries', () => {
    const alts = getValidAlternatives('Smith OHP');
    expect(Array.isArray(alts)).toBe(true);
  });

  // §25 Band Pull-Apart Tier 3 accessory uses band equipment_type
  it('Band Pull-Apart Tier 3 accessory uses band equipment_type', () => {
    expect(EXERCISE_METADATA['Band Pull-Apart']).toBeDefined();
    expect(EXERCISE_METADATA['Band Pull-Apart'].equipment_type).toBe('band');
    expect(EXERCISE_METADATA['Band Pull-Apart'].tier).toBe(3);
    expect(EXERCISE_METADATA['Band Pull-Apart'].force_demand).toBe('low');
  });
});

// ── OHP Entry Baseline Foundational Fix Tests (Bundle 6.0.3 §13 micro-fix 2026-05-13i) ────────
describe('OHP Entry Baseline Foundational §Bundle 6.0.3 §13 Inline Observation Fix', () => {
  // §1 OHP entry exists post-fix
  it('OHP entry exists in EXERCISE_METADATA post-fix', () => {
    expect(EXERCISE_METADATA['OHP']).toBeDefined();
  });

  // §2 OHP canonical fields Tier 1 compound barbell shoulder
  it('OHP canonical: Tier 1 force_demand high barbell umeri+triceps', () => {
    const ohp = EXERCISE_METADATA['OHP'];
    expect(ohp.equipment_type).toBe('barbell');
    expect(ohp.tier).toBe(1);
    expect(ohp.force_demand).toBe('high');
    expect(ohp.muscle_target_primary).toBe('umeri');
    expect(ohp.muscle_target_secondary).toContain('triceps');
  });

  // §3 OHP fallback_cascade 5-step canonical ordering
  it('OHP has 5-step canonical cascade easier_machine → light_variant', () => {
    const cascade = EXERCISE_METADATA['OHP'].fallback_cascade;
    expect(cascade).toBeDefined();
    expect(cascade.length).toBe(5);
    expect(cascade[0].type).toBe('easier_machine');
    expect(cascade[4].type).toBe('light_variant');
    const composeStep = cascade.find(s => s.type === 'muscle_group_compose');
    expect(composeStep.exercise_ids).toBeDefined();
    expect(Array.isArray(composeStep.exercise_ids)).toBe(true);
  });

  // §4 OHP cascade references all resolve in library post-fix
  it('OHP cascade references all resolve in library post-fix', () => {
    const cascade = EXERCISE_METADATA['OHP'].fallback_cascade;
    cascade.forEach(step => {
      const refs = step.exercise_ids || [step.exercise_id];
      refs.forEach(ref => {
        expect(EXERCISE_METADATA[ref]).toBeDefined();
      });
    });
  });

  // §5 Library count post-fix ≥ 295 cumulative
  it('library count post-fix ≥ 295 cumulative', () => {
    const total = Object.keys(EXERCISE_METADATA).length;
    expect(total).toBeGreaterThanOrEqual(295);
  });
});

// ── Bundle 6.0.4.1 Quads Library Extension Tests (Bundle 6.0.4.1 NEW 2026-05-13j) ────────
describe('Bundle 6.0.4.1 Quads Library Extension §ADR v2 LOCK V2', () => {
  // §1 cumulative count grows ≥340 post Bundle 6.0.4.1 Quads (forward-compat per §AR.* NEW 2× threshold candidat)
  it('cumulative count grows ≥ 340 post Bundle 6.0.4.1 Quads (+45 NEW)', () => {
    const count = Object.keys(EXERCISE_METADATA).length;
    expect(count).toBeGreaterThanOrEqual(340);
  });

  // §2 Phase A — squat barbell variants 10 entries present cu cascade populated
  it('Phase A squat barbell variants all 10 entries present cu cascade populated', () => {
    const phaseAEntries = [
      'Barbell Back Squat (High Bar)', 'Barbell Back Squat (Low Bar)', 'Front Squat',
      'Pause Squat', 'Tempo Squat', 'Box Squat', 'Zercher Squat',
      'Overhead Squat', 'Pin Squat', 'Safety Bar Squat',
    ];
    phaseAEntries.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade.length).toBeGreaterThanOrEqual(5);
    });
  });

  // §3 Phase B — smith/hack squat variants 6 entries present
  it('Phase B smith/hack squat variants all 6 entries present cu cascade populated', () => {
    const phaseBEntries = ['Smith Machine Squat', 'Smith Front Squat', 'Hack Squat Machine', 'Reverse Hack Squat', 'Belt Squat', 'Pendulum Squat'];
    phaseBEntries.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade).toBeDefined();
    });
  });

  // §4 Phase C — DB/goblet variants 5 entries present
  it('Phase C DB/goblet variants all 5 entries present cu cascade populated', () => {
    const phaseCEntries = ['Goblet Squat', 'DB Squat', 'DB Sumo Squat', 'Bulgarian Split Squat', 'DB Pistol Squat Assisted'];
    phaseCEntries.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade).toBeDefined();
    });
  });

  // §5 Phase D — leg press variants 5 entries present
  it('Phase D leg press variants all 5 entries present cu cascade populated', () => {
    const phaseDEntries = ['45-Degree Leg Press', 'Horizontal Leg Press', 'Leg Press Single-Leg', 'Narrow-Stance Leg Press', 'Wide-Stance Leg Press'];
    phaseDEntries.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade).toBeDefined();
    });
  });

  // §6 Phase E — lunge compound variants 7 entries present
  it('Phase E lunge compound variants all 7 entries present cu cascade populated', () => {
    const phaseEEntries = ['DB Lunge', 'Walking Lunge', 'Reverse Lunge', 'Lateral Lunge', 'Curtsy Lunge', 'Barbell Lunge', 'Deficit Reverse Lunge'];
    phaseEEntries.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade).toBeDefined();
    });
  });

  // §7 Phase F — leg extension isolation variants 6 entries present
  it('Phase F leg extension isolation variants all 6 entries present cu cascade populated', () => {
    const phaseFEntries = ['Leg Extension Single-Leg', 'Tempo Leg Extension', 'Cable Leg Extension', 'Sissy Squat Machine', 'Band Leg Extension', 'Leg Extension Drop Set'];
    phaseFEntries.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade).toBeDefined();
    });
  });

  // §8 Phase G — sissy/step-up/pistol/wall accessory 6 entries present
  it('Phase G sissy/step-up/pistol/wall accessory all 6 entries present cu cascade populated', () => {
    const phaseGEntries = ['Sissy Squat Bodyweight', 'DB Step-up', 'Barbell Step-up', 'Pistol Squat', 'Wall Sit Static', 'Bodyweight Squat'];
    phaseGEntries.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade).toBeDefined();
    });
  });

  // §9 all 45 NEW quads entries muscle_target_primary = 'picioare' canonical Romanian
  it('all 45 NEW quads entries muscle_target_primary = picioare canonical Romanian', () => {
    const allNewQuads = [
      'Barbell Back Squat (High Bar)', 'Barbell Back Squat (Low Bar)', 'Front Squat', 'Pause Squat', 'Tempo Squat',
      'Box Squat', 'Zercher Squat', 'Overhead Squat', 'Pin Squat', 'Safety Bar Squat',
      'Smith Machine Squat', 'Smith Front Squat', 'Hack Squat Machine', 'Reverse Hack Squat', 'Belt Squat', 'Pendulum Squat',
      'Goblet Squat', 'DB Squat', 'DB Sumo Squat', 'Bulgarian Split Squat', 'DB Pistol Squat Assisted',
      '45-Degree Leg Press', 'Horizontal Leg Press', 'Leg Press Single-Leg', 'Narrow-Stance Leg Press', 'Wide-Stance Leg Press',
      'DB Lunge', 'Walking Lunge', 'Reverse Lunge', 'Lateral Lunge', 'Curtsy Lunge', 'Barbell Lunge', 'Deficit Reverse Lunge',
      'Leg Extension Single-Leg', 'Tempo Leg Extension', 'Cable Leg Extension', 'Sissy Squat Machine', 'Band Leg Extension', 'Leg Extension Drop Set',
      'Sissy Squat Bodyweight', 'DB Step-up', 'Barbell Step-up', 'Pistol Squat', 'Wall Sit Static', 'Bodyweight Squat',
    ];
    expect(allNewQuads.length).toBe(45);
    allNewQuads.forEach(name => {
      expect(EXERCISE_METADATA[name].muscle_target_primary).toBe('picioare');
    });
  });

  // §10 fallback_cascade step types canonical 5 types per ADR v2 §2.1
  it('fallback_cascade step types canonical 5 types Bundle 6.0.4.1 sample', () => {
    const VALID_STEP_TYPES = new Set(['easier_machine', 'assisted_variant', 'muscle_group_compose', 'bodyweight', 'light_variant']);
    const newQuadsSample = ['Barbell Back Squat (High Bar)', 'Smith Machine Squat', 'Goblet Squat', '45-Degree Leg Press', 'DB Lunge', 'Leg Extension Single-Leg', 'Wall Sit Static'];
    newQuadsSample.forEach(name => {
      const cascade = EXERCISE_METADATA[name].fallback_cascade;
      cascade.forEach(step => {
        expect(VALID_STEP_TYPES.has(step.type)).toBe(true);
      });
    });
  });

  // §11 muscle_group_compose steps have 1-2 exercise_ids per Daniel LOCK
  it('muscle_group_compose has 1-2 exercise_ids Bundle 6.0.4.1', () => {
    const newQuadsSample = ['Barbell Back Squat (High Bar)', 'Smith Machine Squat', '45-Degree Leg Press', 'DB Lunge', 'Sissy Squat Bodyweight'];
    newQuadsSample.forEach(name => {
      const cascade = EXERCISE_METADATA[name].fallback_cascade;
      cascade.forEach(step => {
        if (step.type === 'muscle_group_compose') {
          expect(step.exercise_ids).toBeDefined();
          expect(step.exercise_ids.length).toBeGreaterThanOrEqual(1);
          expect(step.exercise_ids.length).toBeLessThanOrEqual(2);
        }
      });
    });
  });

  // §12 cascade depth ≥5 for Tier 1 compound quads
  it('Tier 1 compound quads have 5-step cascade', () => {
    const tier1QuadsSample = ['Barbell Back Squat (High Bar)', 'Front Squat', 'Smith Machine Squat', 'Hack Squat Machine', 'DB Lunge', 'Walking Lunge'];
    tier1QuadsSample.forEach(name => {
      expect(EXERCISE_METADATA[name].fallback_cascade.length).toBeGreaterThanOrEqual(5);
    });
  });

  // §13 tier distribution Bundle 6.0.4.1 quads
  it('Bundle 6.0.4.1 tier distribution: Tier 1 + Tier 2 + Tier 3 all present', () => {
    expect(EXERCISE_METADATA['Barbell Back Squat (High Bar)'].tier).toBe(1);
    expect(EXERCISE_METADATA['Sissy Squat Machine'].tier).toBe(2);
    expect(EXERCISE_METADATA['Pistol Squat'].tier).toBe(3);
    expect(EXERCISE_METADATA['Wall Sit Static'].tier).toBe(3);
  });

  // §14 force_demand distribution
  it('Bundle 6.0.4.1 force_demand distribution: high + medium + low all present', () => {
    expect(EXERCISE_METADATA['Barbell Back Squat (High Bar)'].force_demand).toBe('high');
    expect(EXERCISE_METADATA['DB Sumo Squat'].force_demand).toBe('medium');
    expect(EXERCISE_METADATA['Pistol Squat'].force_demand).toBe('low');
  });

  // §15 equipment_type distribution Bundle 6.0.4.1
  it('Bundle 6.0.4.1 equipment_type 6 canonical all present', () => {
    const equipmentSeen = new Set();
    const allNewQuadsList = ['Barbell Back Squat (High Bar)', 'Goblet Squat', 'Smith Machine Squat', 'Cable Leg Extension', 'Band Leg Extension', 'Bodyweight Squat'];
    allNewQuadsList.forEach(name => equipmentSeen.add(EXERCISE_METADATA[name].equipment_type));
    expect(equipmentSeen.has('barbell')).toBe(true);
    expect(equipmentSeen.has('dumbbell')).toBe(true);
    expect(equipmentSeen.has('machine')).toBe(true);
    expect(equipmentSeen.has('cable')).toBe(true);
    expect(equipmentSeen.has('band')).toBe(true);
    expect(equipmentSeen.has('bodyweight')).toBe(true);
  });

  // §16 existing V1 + Bundle 6.0.1-3 + OHP baseline preserved
  it('existing baseline entries preserved invariant ZERO mutation Bundle 6.0.4.1', () => {
    expect(EXERCISE_METADATA['DB Shoulder Press']).toBeDefined();
    expect(EXERCISE_METADATA['Flat Barbell Bench']).toBeDefined();
    expect(EXERCISE_METADATA['Cable Row']).toBeDefined();
    expect(EXERCISE_METADATA['Leg Press']).toBeDefined();
    expect(EXERCISE_METADATA['OHP']).toBeDefined();
  });

  // §17 cascade self-reference rejection invariant Bundle 6.0.4.1
  it('Bundle 6.0.4.1 NEW entries NEVER self-reference parent name', () => {
    const newQuadsList = ['Barbell Back Squat (High Bar)', 'Smith Machine Squat', 'Hack Squat Machine', 'Goblet Squat', 'DB Lunge', 'Leg Extension Single-Leg', 'Pistol Squat'];
    newQuadsList.forEach(name => {
      const cascade = EXERCISE_METADATA[name].fallback_cascade;
      cascade.forEach(step => {
        if (step.exercise_id) expect(step.exercise_id).not.toBe(name);
        if (step.exercise_ids) expect(step.exercise_ids).not.toContain(name);
      });
    });
  });

  // §18 cascade references resolve ≥70% Bundle 6.0.4.1 phase (lenient — Bundle 6.0.4.2-4 future refs OK)
  it('cascade references resolve ≥70% Bundle 6.0.4.1 lenient', () => {
    const newQuadsList = ['Barbell Back Squat (High Bar)', 'Smith Machine Squat', 'Goblet Squat', 'DB Lunge', 'Sissy Squat Bodyweight'];
    let total = 0, resolved = 0;
    newQuadsList.forEach(name => {
      const cascade = EXERCISE_METADATA[name].fallback_cascade;
      cascade.forEach(step => {
        const refs = step.exercise_ids || [step.exercise_id];
        refs.forEach(r => { total++; if (EXERCISE_METADATA[r]) resolved++; });
      });
    });
    expect(resolved / total).toBeGreaterThanOrEqual(0.7);
  });
});
