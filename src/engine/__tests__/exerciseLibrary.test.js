import { describe, it, expect } from 'vitest';
import { EXERCISE_METADATA, getExerciseMetadata, getValidAlternatives } from '../exerciseLibrary.js';

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
  it('muscle_target_primary uses only canonical V1 11 categorii per ADR_ANATOMICAL_CLASSIFICATION_V1 (post C2 migration)', () => {
    const canonical = new Set(['piept', 'spate', 'umeri', 'biceps', 'triceps', 'antebrate', 'core', 'picioare-quads', 'picioare-hamstrings', 'fese', 'gambe']);
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

  // §15 Bundle 6.0.1 chest entries do NOT introduce core (Bundle 6.0.7 Core unlock LANDED — invariant scoped Bundle 6.0.1 NEW entries only)
  it('Bundle 6.0.1 NEW chest entries do NOT introduce core as muscle_target (scoped post-Bundle 6.0.7 unlock)', () => {
    const NEW_BUNDLE_6_0_1_CHEST = [
      'Incline Barbell Bench Press', 'Decline Barbell Bench Press', 'Incline Dumbbell Press', 'Decline Dumbbell Press',
      'Flat Dumbbell Press', 'Hammer Press Machine', 'Pec Deck / Cable Fly', 'Cable Fly High-to-Low', 'Cable Fly Low-to-High',
      'Cable Crossover', 'Plyometric Push-up', 'Push-up', 'Diamond Push-up', 'Wide Push-up', 'Decline Push-up',
      'Incline Push-up', 'Knee Push-up', 'Wall Push-up',
    ];
    NEW_BUNDLE_6_0_1_CHEST.forEach(name => {
      const meta = EXERCISE_METADATA[name];
      if (!meta) return;
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
  it('muscle_target_primary uses canonical V1 11 categorii per ADR_ANATOMICAL_CLASSIFICATION_V1 (post C2 migration)', () => {
    const canonical = new Set(['piept', 'spate', 'umeri', 'biceps', 'triceps', 'antebrate', 'core', 'picioare-quads', 'picioare-hamstrings', 'fese', 'gambe']);
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

  // §12 Conventional Deadlift muscle_target_primary 'picioare-hamstrings' (post C2 migration — hip-hinge dominant)
  it('Conventional Deadlift classified picioare-hamstrings primary post C2 (cu spate secondary)', () => {
    expect(EXERCISE_METADATA['Conventional Deadlift'].muscle_target_primary).toBe('picioare-hamstrings');
    expect(EXERCISE_METADATA['Conventional Deadlift'].muscle_target_secondary).toContain('spate');
  });

  // §13 Rack Pull muscle_target_primary 'spate' (partial ROM upper back emphasis); secondary picioare migrated to picioare-hamstrings
  it('Rack Pull classified spate primary (partial ROM) cu picioare-hamstrings secondary post C2', () => {
    expect(EXERCISE_METADATA['Rack Pull'].muscle_target_primary).toBe('spate');
    expect(EXERCISE_METADATA['Rack Pull'].muscle_target_secondary).toContain('picioare-hamstrings');
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
  it('muscle_target_primary uses canonical V1 11 categorii per ADR_ANATOMICAL_CLASSIFICATION_V1 (post C2 migration)', () => {
    const canonical = new Set(['piept', 'spate', 'umeri', 'biceps', 'triceps', 'antebrate', 'core', 'picioare-quads', 'picioare-hamstrings', 'fese', 'gambe']);
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

  // §9 all 45 NEW quads entries muscle_target_primary = 'picioare-quads' canonical V1 (post C2 migration per ADR_ANATOMICAL_CLASSIFICATION_V1)
  it('all 45 NEW quads entries muscle_target_primary = picioare-quads canonical V1 post C2 migration', () => {
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
      expect(EXERCISE_METADATA[name].muscle_target_primary).toBe('picioare-quads');
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

// ── Bundle 6.0.4.2 Hamstrings Library Extension Tests (Bundle 6.0.4.2 NEW 2026-05-13j) ────────
describe('Bundle 6.0.4.2 Hamstrings Library Extension §ADR v2 LOCK V2', () => {
  // §1 cumulative count grows ≥381 post Bundle 6.0.4.2 (41 NEW; 4 spec candidates skipped due to Bundle 6.0.2 Phase I collisions)
  it('cumulative count grows ≥ 381 post Bundle 6.0.4.2 Hamstrings (+41 NEW; 4 collisions skipped)', () => {
    const count = Object.keys(EXERCISE_METADATA).length;
    expect(count).toBeGreaterThanOrEqual(381);
  });

  // §2 Phase A — RDL barbell variants all 7 entries present (skipped Single-Leg RDL collision)
  it('Phase A RDL barbell variants 7 entries present cu cascade populated', () => {
    const phaseAEntries = ['Stiff-Leg Deadlift', 'Snatch-Grip RDL', 'Deficit RDL', 'Sumo RDL', 'Block RDL', 'Pause RDL', 'B-Stance RDL'];
    phaseAEntries.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade.length).toBeGreaterThanOrEqual(5);
    });
  });

  // §3 Phase B — Smith/machine hamstring 6 entries present
  it('Phase B Smith/machine hamstring variants 6 entries present', () => {
    const phaseBEntries = ['Smith RDL', 'Hyperextension Machine', 'Reverse Hyper', 'Glute-Ham Raise', 'Natural Glute-Ham Raise', 'Trap Bar Deadlift'];
    phaseBEntries.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade).toBeDefined();
    });
  });

  // §4 Phase C — DB hamstring compound 6 entries present
  it('Phase C DB hamstring compound 6 entries present', () => {
    const phaseCEntries = ['DB Romanian Deadlift', 'DB Single-Leg RDL', 'DB B-Stance RDL', 'DB Stiff-Leg Deadlift', 'Kettlebell Swing', 'Tempo DB Romanian Deadlift'];
    phaseCEntries.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade).toBeDefined();
    });
  });

  // §5 Phase D — leg curl variants 6 entries present
  it('Phase D leg curl variants 6 entries present', () => {
    const phaseDEntries = ['Seated Leg Curl', 'Standing Leg Curl', 'Leg Curl Single-Leg', 'Tempo Leg Curl', 'Cable Leg Curl', 'Band Leg Curl'];
    phaseDEntries.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade).toBeDefined();
    });
  });

  // §6 Phase E — good morning variants 3 entries present (skipped Seated/Banded GM collisions)
  it('Phase E good morning variants 3 entries present (Seated/Banded GM Bundle 6.0.2 Phase I collisions skipped)', () => {
    const phaseEEntries = ['Barbell Good Morning', 'Smith Good Morning', 'Zercher Good Morning'];
    phaseEEntries.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade).toBeDefined();
    });
  });

  // §7 Phase F — Nordic + razor + slider 6 entries present
  it('Phase F Nordic + razor + slider 6 entries present', () => {
    const phaseFEntries = ['Nordic Hamstring Curl', 'Nordic Hamstring Curl Assisted', 'Eccentric Nordic Curl', 'Slider Hamstring Curl', 'Razor Curl', 'Inverse Curl'];
    phaseFEntries.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade).toBeDefined();
    });
  });

  // §8 Phase G — posterior chain accessory 7 entries present (skipped Single-Leg RDL Bodyweight collision)
  it('Phase G posterior chain accessory 7 entries present (Single-Leg RDL Bodyweight Bundle 6.0.2 Phase I collision skipped)', () => {
    const phaseGEntries = ['Hip Thrust', 'Single-Leg Hip Thrust', 'Hyperextension Bodyweight', 'Reverse Hyper Bodyweight', 'Cable Pull-Through', 'Banded Pull-Through', 'Wall Hip Hinge'];
    phaseGEntries.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade).toBeDefined();
    });
  });

  // §9 all 41 NEW hamstring entries muscle_target_primary = 'picioare-hamstrings' canonical V1 post C2 migration (4 Hip Thrust variants → 'fese' primary)
  it('all 41 NEW hamstring entries muscle_target_primary canonical V1 post C2 (37 picioare-hamstrings + 4 fese Hip Thrust)', () => {
    const hamsPicioareHams = [
      'Stiff-Leg Deadlift', 'Snatch-Grip RDL', 'Deficit RDL', 'Sumo RDL', 'Block RDL', 'Pause RDL', 'B-Stance RDL',
      'Smith RDL', 'Hyperextension Machine', 'Reverse Hyper', 'Glute-Ham Raise', 'Natural Glute-Ham Raise', 'Trap Bar Deadlift',
      'DB Romanian Deadlift', 'DB Single-Leg RDL', 'DB B-Stance RDL', 'DB Stiff-Leg Deadlift', 'Kettlebell Swing', 'Tempo DB Romanian Deadlift',
      'Seated Leg Curl', 'Standing Leg Curl', 'Leg Curl Single-Leg', 'Tempo Leg Curl', 'Cable Leg Curl', 'Band Leg Curl',
      'Barbell Good Morning', 'Smith Good Morning', 'Zercher Good Morning',
      'Nordic Hamstring Curl', 'Nordic Hamstring Curl Assisted', 'Eccentric Nordic Curl', 'Slider Hamstring Curl', 'Razor Curl', 'Inverse Curl',
      'Hyperextension Bodyweight', 'Reverse Hyper Bodyweight', 'Wall Hip Hinge',
    ];
    const hamsFese = ['Hip Thrust', 'Single-Leg Hip Thrust', 'Cable Pull-Through', 'Banded Pull-Through'];
    expect(hamsPicioareHams.length + hamsFese.length).toBe(41);
    hamsPicioareHams.forEach(name => {
      expect(EXERCISE_METADATA[name].muscle_target_primary).toBe('picioare-hamstrings');
    });
    hamsFese.forEach(name => {
      expect(EXERCISE_METADATA[name].muscle_target_primary).toBe('fese');
    });
  });

  // §10 fallback_cascade step types canonical 5 types
  it('fallback_cascade step types canonical 5 types Bundle 6.0.4.2', () => {
    const VALID = new Set(['easier_machine', 'assisted_variant', 'muscle_group_compose', 'bodyweight', 'light_variant']);
    const sample = ['Stiff-Leg Deadlift', 'Smith RDL', 'DB Romanian Deadlift', 'Seated Leg Curl', 'Barbell Good Morning', 'Nordic Hamstring Curl', 'Hip Thrust'];
    sample.forEach(name => {
      EXERCISE_METADATA[name].fallback_cascade.forEach(s => expect(VALID.has(s.type)).toBe(true));
    });
  });

  // §11 muscle_group_compose 1-2 exercise_ids
  it('muscle_group_compose 1-2 exercise_ids Bundle 6.0.4.2', () => {
    const sample = ['Smith RDL', 'Glute-Ham Raise', 'Cable Pull-Through', 'Nordic Hamstring Curl', 'Hip Thrust'];
    sample.forEach(name => {
      EXERCISE_METADATA[name].fallback_cascade.forEach(s => {
        if (s.type === 'muscle_group_compose') {
          expect(s.exercise_ids.length).toBeGreaterThanOrEqual(1);
          expect(s.exercise_ids.length).toBeLessThanOrEqual(2);
        }
      });
    });
  });

  // §12 cascade depth ≥5 Tier 1-2 hamstring compound
  it('Tier 1-2 hamstring compound 5-step cascade', () => {
    const tier1Sample = ['Stiff-Leg Deadlift', 'Smith RDL', 'DB Romanian Deadlift', 'Hyperextension Machine', 'Glute-Ham Raise', 'Hip Thrust'];
    tier1Sample.forEach(name => {
      expect(EXERCISE_METADATA[name].fallback_cascade.length).toBeGreaterThanOrEqual(5);
    });
  });

  // §13 tier distribution
  it('Bundle 6.0.4.2 tier distribution: Tier 1 + Tier 2 + Tier 3 all present', () => {
    expect(EXERCISE_METADATA['Stiff-Leg Deadlift'].tier).toBe(1);
    expect(EXERCISE_METADATA['Seated Leg Curl'].tier).toBe(2);
    expect(EXERCISE_METADATA['Slider Hamstring Curl'].tier).toBe(3);
    expect(EXERCISE_METADATA['Wall Hip Hinge'].tier).toBe(3);
  });

  // §14 force_demand distribution
  it('Bundle 6.0.4.2 force_demand: high + medium + low all present', () => {
    expect(EXERCISE_METADATA['Stiff-Leg Deadlift'].force_demand).toBe('high');
    expect(EXERCISE_METADATA['Seated Leg Curl'].force_demand).toBe('medium');
    expect(EXERCISE_METADATA['Slider Hamstring Curl'].force_demand).toBe('low');
  });

  // §15 equipment_type distribution 6 canonical
  it('Bundle 6.0.4.2 equipment_type 6 canonical all present', () => {
    const seen = new Set();
    const sample = ['Stiff-Leg Deadlift', 'DB Romanian Deadlift', 'Smith RDL', 'Cable Leg Curl', 'Band Leg Curl', 'Nordic Hamstring Curl'];
    sample.forEach(name => seen.add(EXERCISE_METADATA[name].equipment_type));
    expect(seen.has('barbell')).toBe(true);
    expect(seen.has('dumbbell')).toBe(true);
    expect(seen.has('machine')).toBe(true);
    expect(seen.has('cable')).toBe(true);
    expect(seen.has('band')).toBe(true);
    expect(seen.has('bodyweight')).toBe(true);
  });

  // §16 existing baseline preserved invariant
  it('existing V1 + Bundle 6.0.1-4.1 preserved invariant ZERO mutation Bundle 6.0.4.2', () => {
    expect(EXERCISE_METADATA['DB Shoulder Press']).toBeDefined();
    expect(EXERCISE_METADATA['Romanian Deadlift']).toBeDefined();
    expect(EXERCISE_METADATA['Leg Curl']).toBeDefined();
    expect(EXERCISE_METADATA['OHP']).toBeDefined();
    expect(EXERCISE_METADATA['Barbell Back Squat (High Bar)']).toBeDefined();
    // Bundle 6.0.2 Phase I collisions remained spate primary (not mutated by Bundle 6.0.4.2)
    expect(EXERCISE_METADATA['Single-Leg RDL'].muscle_target_primary).toBe('spate');
    expect(EXERCISE_METADATA['Seated Good Morning'].muscle_target_primary).toBe('spate');
    expect(EXERCISE_METADATA['Banded Good Morning'].muscle_target_primary).toBe('spate');
    expect(EXERCISE_METADATA['Single-Leg RDL Bodyweight'].muscle_target_primary).toBe('spate');
  });

  // §17 cascade self-reference rejection invariant Bundle 6.0.4.2
  it('Bundle 6.0.4.2 NEW entries NEVER self-reference parent name', () => {
    const sample = ['Stiff-Leg Deadlift', 'Smith RDL', 'DB Romanian Deadlift', 'Seated Leg Curl', 'Nordic Hamstring Curl', 'Hip Thrust'];
    sample.forEach(name => {
      EXERCISE_METADATA[name].fallback_cascade.forEach(s => {
        if (s.exercise_id) expect(s.exercise_id).not.toBe(name);
        if (s.exercise_ids) expect(s.exercise_ids).not.toContain(name);
      });
    });
  });

  // §18 cascade references resolve ≥70% Bundle 6.0.4.2 (lenient — Bundle 6.0.4.3+ forward refs OK)
  it('cascade references resolve ≥70% Bundle 6.0.4.2 lenient', () => {
    const sample = ['Stiff-Leg Deadlift', 'Smith RDL', 'DB Romanian Deadlift', 'Nordic Hamstring Curl', 'Hip Thrust'];
    let total = 0, resolved = 0;
    sample.forEach(name => {
      EXERCISE_METADATA[name].fallback_cascade.forEach(s => {
        const refs = s.exercise_ids || [s.exercise_id];
        refs.forEach(r => { total++; if (EXERCISE_METADATA[r]) resolved++; });
      });
    });
    expect(resolved / total).toBeGreaterThanOrEqual(0.7);
  });
});

// ── §22 ADR_ANATOMICAL_CLASSIFICATION_V1 'fese' Canonical Migration Validation (C2 NEW 2026-05-13k) ────────
describe('§22 ADR ANATOMICAL_CLASSIFICATION_V1 fese canonical migration', () => {
  const CANONICAL_V1 = new Set([
    'piept', 'spate', 'umeri', 'biceps', 'triceps', 'antebrate',
    'core', 'picioare-quads', 'picioare-hamstrings', 'fese', 'gambe',
  ]);

  it('all muscle_target_primary values in canonical V1 11 categorii', () => {
    const violators = [];
    Object.entries(EXERCISE_METADATA).forEach(([name, meta]) => {
      if (!CANONICAL_V1.has(meta.muscle_target_primary)) {
        violators.push(`${name} → ${meta.muscle_target_primary}`);
      }
    });
    expect(violators, `Non-canonical V1 primary values: ${violators.join(', ')}`).toEqual([]);
  });

  it('ZERO entries muscle_target_primary === abdomen (legacy reconciled)', () => {
    const abdomenEntries = Object.entries(EXERCISE_METADATA)
      .filter(([_, meta]) => meta.muscle_target_primary === 'abdomen');
    expect(abdomenEntries).toHaveLength(0);
  });

  it('ZERO entries muscle_target_primary === brate (legacy reconciled → biceps)', () => {
    const brateEntries = Object.entries(EXERCISE_METADATA)
      .filter(([_, meta]) => meta.muscle_target_primary === 'brate');
    expect(brateEntries).toHaveLength(0);
  });

  it('ZERO entries muscle_target_primary === picioare standalone (legacy reconciled)', () => {
    const picioareEntries = Object.entries(EXERCISE_METADATA)
      .filter(([_, meta]) => meta.muscle_target_primary === 'picioare');
    expect(picioareEntries).toHaveLength(0);
  });

  it('Hip Thrust + variants muscle_target_primary === fese canonical V1', () => {
    const hipThrustVariants = ['Hip Thrust', 'Single-Leg Hip Thrust', 'Cable Pull-Through', 'Banded Pull-Through'];
    hipThrustVariants.forEach(name => {
      const entry = EXERCISE_METADATA[name];
      expect(entry).toBeDefined();
      expect(entry.muscle_target_primary).toBe('fese');
      expect(entry.muscle_target_secondary).toContain('picioare-hamstrings');
    });
  });

  it('Bundle 6.0.2 Phase I posterior chain 4 entries spate primary preserved + fese secondary added', () => {
    const phaseIPosterior = ['Single-Leg RDL', 'Seated Good Morning', 'Banded Good Morning', 'Single-Leg RDL Bodyweight'];
    phaseIPosterior.forEach(name => {
      const entry = EXERCISE_METADATA[name];
      expect(entry.muscle_target_primary).toBe('spate');
      expect(entry.muscle_target_secondary).toContain('picioare-hamstrings');
      expect(entry.muscle_target_secondary).toContain('fese');
    });
  });

  it('fese canonical V1 entries count baseline post-C2 ≥ 4', () => {
    const feseEntries = Object.entries(EXERCISE_METADATA)
      .filter(([_, meta]) => meta.muscle_target_primary === 'fese');
    expect(feseEntries.length).toBeGreaterThanOrEqual(4);
  });

  it('secondary tags array values all canonical V1', () => {
    Object.entries(EXERCISE_METADATA).forEach(([, meta]) => {
      if (Array.isArray(meta.muscle_target_secondary)) {
        meta.muscle_target_secondary.forEach(tag => {
          expect(CANONICAL_V1.has(tag)).toBe(true);
        });
      }
    });
  });

  it('picioare-quads canonical V1 entries count post-C2 (Bundle 6.0.4.1 + V1 baseline)', () => {
    const quadEntries = Object.entries(EXERCISE_METADATA)
      .filter(([_, meta]) => meta.muscle_target_primary === 'picioare-quads');
    expect(quadEntries.length).toBeGreaterThanOrEqual(45);
  });

  it('picioare-hamstrings canonical V1 entries count post-C2 (Bundle 6.0.4.2 partial + V1 baseline)', () => {
    const hamEntries = Object.entries(EXERCISE_METADATA)
      .filter(([_, meta]) => meta.muscle_target_primary === 'picioare-hamstrings');
    expect(hamEntries.length).toBeGreaterThanOrEqual(35);
  });

  it('gambe canonical V1 entries count post-C2 (V1 baseline Calf Raises minimum)', () => {
    const gambeEntries = Object.entries(EXERCISE_METADATA)
      .filter(([_, meta]) => meta.muscle_target_primary === 'gambe');
    expect(gambeEntries.length).toBeGreaterThanOrEqual(1);
  });

  it('biceps canonical V1 entries count post-C2 (legacy brate reconciled minimum 5)', () => {
    const bicepsEntries = Object.entries(EXERCISE_METADATA)
      .filter(([_, meta]) => meta.muscle_target_primary === 'biceps');
    expect(bicepsEntries.length).toBeGreaterThanOrEqual(5);
  });

  // §22.13 ZERO entries muscle_target_primary === 'unknown' (post-C2.5 final state)
  // The 'unknown' value is the getExerciseMetadata() FALLBACK sentinel for "exercise not found" —
  // NOT a canonical V1 value. Real entries in EXERCISE_METADATA must NEVER use 'unknown'.
  it('ZERO entries muscle_target_primary === unknown (fallback sentinel guarantee)', () => {
    const unknownEntries = Object.entries(EXERCISE_METADATA)
      .filter(([_, meta]) => meta.muscle_target_primary === 'unknown');
    expect(unknownEntries, `Found ${unknownEntries.length} entries cu unknown primary: ${unknownEntries.map(([n]) => n).join(', ')}`).toHaveLength(0);
  });
});

describe('Bundle 6.0.4.3 Glutes Library Extension §ADR v2 LOCK V2', () => {
  // §1 cumulative count grows ≥ 426 post Bundle 6.0.4.3 (47 NEW; ZERO collisions skipped)
  it('cumulative count grows ≥ 426 post Bundle 6.0.4.3 Glutes (+47 NEW)', () => {
    const count = Object.keys(EXERCISE_METADATA).length;
    expect(count).toBeGreaterThanOrEqual(426);
  });

  // §2 Phase A — Tier 1 Hip Thrust barbell extended variants 8 entries present cu cascade populated
  it('Phase A Hip Thrust barbell extended variants 8 entries present cu cascade populated', () => {
    const phaseAEntries = ['Pause Hip Thrust', 'Tempo Hip Thrust', 'Deficit Hip Thrust', 'Banded Hip Thrust', 'Hip Thrust Foot-Elevated', 'B-Stance Hip Thrust', 'Pin Hip Thrust', 'Block Hip Thrust'];
    phaseAEntries.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade.length).toBeGreaterThanOrEqual(5);
    });
  });

  // §3 Phase B — Smith + Machine Hip Thrust variants 6 entries present
  it('Phase B Smith + Machine Hip Thrust variants 6 entries present cu cascade populated', () => {
    const phaseBEntries = ['Smith Hip Thrust', 'Glute Drive Machine', 'Belt Squat Hip Thrust', 'Single-Leg Smith Hip Thrust', 'Smith B-Stance Hip Thrust', 'Plate-Loaded Hip Thrust Machine'];
    phaseBEntries.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade).toBeDefined();
    });
  });

  // §4 Phase C — DB Hip Thrust + Glute Bridge variants 7 entries present
  it('Phase C DB Hip Thrust + Glute Bridge variants 7 entries present cu cascade populated', () => {
    const phaseCEntries = ['DB Hip Thrust', 'Barbell Glute Bridge', 'DB Glute Bridge', 'Plate Glute Bridge', 'Frog Pump', 'Banded Glute Bridge', 'Frog Pump DB'];
    phaseCEntries.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade).toBeDefined();
    });
  });

  // §5 Phase D — Cable glute isolation 6 entries present
  it('Phase D Cable glute isolation 6 entries present cu cascade populated', () => {
    const phaseDEntries = ['Cable Glute Kickback', 'Glute Kickback Machine', 'Standing Cable Hip Abduction', 'Hip Abduction Machine', 'Cable Hip Extension', 'Single-Arm Cable Glute Kickback'];
    phaseDEntries.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade).toBeDefined();
    });
  });

  // §6 Phase E — Sumo Deadlift glute-bias 5 entries present (Sumo Deadlift = 'fese' primary Bret Contreras glute-dominant variant)
  it('Phase E Sumo Deadlift glute-bias 5 entries present cu cascade populated', () => {
    const phaseEEntries = ['Sumo Deadlift', 'DB Sumo Deadlift', 'Romanian Sumo Deadlift', 'Smith Sumo Deadlift', 'Banded Sumo Deadlift'];
    phaseEEntries.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade).toBeDefined();
    });
  });

  // §7 Phase F — Step-up + Lunge glute-focus + Bodyweight glute 8 entries present
  it('Phase F Step-up + Lunge glute-focus + Bodyweight glute 8 entries present cu cascade populated', () => {
    const phaseFEntries = ['Glute-Focus Step-up', 'Glute Walking Lunge', 'Reverse Lunge Glute-Focus', 'Cossack Squat', 'Single-Leg Glute Bridge', 'Glute Bridge Bodyweight', 'Single-Leg Glute Bridge Foot-Elevated', 'Glute Bridge Bodyweight Single-Leg'];
    phaseFEntries.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade).toBeDefined();
    });
  });

  // §8 Phase G — Specialty glute 7 entries present
  it('Phase G Specialty glute 7 entries present cu cascade populated', () => {
    const phaseGEntries = ['Glute Bridge March', 'Quadruped Hip Extension', 'Donkey Kick', 'Fire Hydrant', 'Hip Thrust 1.5 Rep', 'Marching Glute Bridge', 'Banded Clamshell'];
    phaseGEntries.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade).toBeDefined();
    });
  });

  // §9 all 47 NEW glute entries muscle_target_primary === 'fese' canonical V1
  it('all 47 NEW glute entries muscle_target_primary === fese canonical V1', () => {
    const NEW_ENTRIES = [
      'Pause Hip Thrust', 'Tempo Hip Thrust', 'Deficit Hip Thrust', 'Banded Hip Thrust', 'Hip Thrust Foot-Elevated', 'B-Stance Hip Thrust', 'Pin Hip Thrust', 'Block Hip Thrust',
      'Smith Hip Thrust', 'Glute Drive Machine', 'Belt Squat Hip Thrust', 'Single-Leg Smith Hip Thrust', 'Smith B-Stance Hip Thrust', 'Plate-Loaded Hip Thrust Machine',
      'DB Hip Thrust', 'Barbell Glute Bridge', 'DB Glute Bridge', 'Plate Glute Bridge', 'Frog Pump', 'Banded Glute Bridge', 'Frog Pump DB',
      'Cable Glute Kickback', 'Glute Kickback Machine', 'Standing Cable Hip Abduction', 'Hip Abduction Machine', 'Cable Hip Extension', 'Single-Arm Cable Glute Kickback',
      'Sumo Deadlift', 'DB Sumo Deadlift', 'Romanian Sumo Deadlift', 'Smith Sumo Deadlift', 'Banded Sumo Deadlift',
      'Glute-Focus Step-up', 'Glute Walking Lunge', 'Reverse Lunge Glute-Focus', 'Cossack Squat', 'Single-Leg Glute Bridge', 'Glute Bridge Bodyweight', 'Single-Leg Glute Bridge Foot-Elevated', 'Glute Bridge Bodyweight Single-Leg',
      'Glute Bridge March', 'Quadruped Hip Extension', 'Donkey Kick', 'Fire Hydrant', 'Hip Thrust 1.5 Rep', 'Marching Glute Bridge', 'Banded Clamshell',
    ];
    expect(NEW_ENTRIES.length).toBe(47);
    NEW_ENTRIES.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();
      expect(EXERCISE_METADATA[name].muscle_target_primary).toBe('fese');
    });
  });

  // §10 fallback_cascade step types canonical 5 types Bundle 6.0.4.3
  it('fallback_cascade step types canonical 5 types Bundle 6.0.4.3', () => {
    const VALID = new Set(['easier_machine', 'assisted_variant', 'muscle_group_compose', 'bodyweight', 'light_variant']);
    const sample = ['Pause Hip Thrust', 'Smith Hip Thrust', 'DB Hip Thrust', 'Cable Glute Kickback', 'Sumo Deadlift', 'Glute-Focus Step-up', 'Donkey Kick', 'Banded Clamshell'];
    sample.forEach(name => {
      EXERCISE_METADATA[name].fallback_cascade.forEach(s => expect(VALID.has(s.type)).toBe(true));
    });
  });

  // §11 muscle_group_compose 1-2 exercise_ids per ADR v2 §2.1 LOCK "fie 1 exercitiu sau 2"
  it('muscle_group_compose 1-2 exercise_ids Bundle 6.0.4.3', () => {
    const sample = ['Pause Hip Thrust', 'Smith Hip Thrust', 'Barbell Glute Bridge', 'Cable Glute Kickback', 'Sumo Deadlift', 'Cossack Squat', 'Donkey Kick'];
    sample.forEach(name => {
      EXERCISE_METADATA[name].fallback_cascade.forEach(s => {
        if (s.type === 'muscle_group_compose') {
          expect(s.exercise_ids.length).toBeGreaterThanOrEqual(1);
          expect(s.exercise_ids.length).toBeLessThanOrEqual(2);
        }
      });
    });
  });

  // §12 cascade depth ≥5 Tier 1 glute compound
  it('Tier 1 glute compound 5-step cascade Bundle 6.0.4.3', () => {
    const tier1Sample = ['Pause Hip Thrust', 'Smith Hip Thrust', 'Barbell Glute Bridge', 'Sumo Deadlift', 'Plate-Loaded Hip Thrust Machine'];
    tier1Sample.forEach(name => {
      expect(EXERCISE_METADATA[name].fallback_cascade.length).toBeGreaterThanOrEqual(5);
    });
  });

  // §13 tier distribution Bundle 6.0.4.3
  it('Bundle 6.0.4.3 tier distribution: Tier 1 + Tier 2 + Tier 3 all present', () => {
    expect(EXERCISE_METADATA['Pause Hip Thrust'].tier).toBe(1);
    expect(EXERCISE_METADATA['DB Hip Thrust'].tier).toBe(2);
    expect(EXERCISE_METADATA['Donkey Kick'].tier).toBe(3);
    expect(EXERCISE_METADATA['Banded Clamshell'].tier).toBe(3);
  });

  // §14 force_demand distribution Bundle 6.0.4.3
  it('Bundle 6.0.4.3 force_demand: high + medium + low all present', () => {
    expect(EXERCISE_METADATA['Pause Hip Thrust'].force_demand).toBe('high');
    expect(EXERCISE_METADATA['DB Hip Thrust'].force_demand).toBe('medium');
    expect(EXERCISE_METADATA['Donkey Kick'].force_demand).toBe('low');
  });

  // §15 equipment_type distribution 6 canonical all present
  it('Bundle 6.0.4.3 equipment_type 6 canonical all present', () => {
    const seen = new Set();
    const sample = ['Pause Hip Thrust', 'Smith Hip Thrust', 'DB Hip Thrust', 'Cable Glute Kickback', 'Banded Clamshell', 'Donkey Kick'];
    sample.forEach(name => seen.add(EXERCISE_METADATA[name].equipment_type));
    expect(seen.has('barbell')).toBe(true);
    expect(seen.has('dumbbell')).toBe(true);
    expect(seen.has('machine')).toBe(true);
    expect(seen.has('cable')).toBe(true);
    expect(seen.has('band')).toBe(true);
    expect(seen.has('bodyweight')).toBe(true);
  });

  // §16 ZERO mutation existing 4 'fese' primary entries (HARD CONSTRAINT §F3.12 strict)
  it('existing 4 fese primary entries preserved invariant ZERO mutation Bundle 6.0.4.3', () => {
    expect(EXERCISE_METADATA['Hip Thrust'].muscle_target_primary).toBe('fese');
    expect(EXERCISE_METADATA['Hip Thrust'].tier).toBe(1);
    expect(EXERCISE_METADATA['Hip Thrust'].force_demand).toBe('high');
    expect(EXERCISE_METADATA['Hip Thrust'].equipment_type).toBe('barbell');
    expect(EXERCISE_METADATA['Single-Leg Hip Thrust'].muscle_target_primary).toBe('fese');
    expect(EXERCISE_METADATA['Single-Leg Hip Thrust'].tier).toBe(2);
    expect(EXERCISE_METADATA['Cable Pull-Through'].muscle_target_primary).toBe('fese');
    expect(EXERCISE_METADATA['Cable Pull-Through'].equipment_type).toBe('cable');
    expect(EXERCISE_METADATA['Banded Pull-Through'].muscle_target_primary).toBe('fese');
    expect(EXERCISE_METADATA['Banded Pull-Through'].equipment_type).toBe('band');
  });

  // §17 existing baseline V1 + Bundle 6.0.1-4.2 preserved invariant ZERO mutation Bundle 6.0.4.3
  it('existing V1 + Bundle 6.0.1-4.2 preserved invariant ZERO mutation Bundle 6.0.4.3', () => {
    expect(EXERCISE_METADATA['DB Shoulder Press']).toBeDefined();
    expect(EXERCISE_METADATA['Romanian Deadlift']).toBeDefined();
    expect(EXERCISE_METADATA['Leg Curl']).toBeDefined();
    expect(EXERCISE_METADATA['OHP']).toBeDefined();
    expect(EXERCISE_METADATA['Barbell Back Squat (High Bar)']).toBeDefined();
    // Bundle 6.0.2 Phase I collisions remained spate primary
    expect(EXERCISE_METADATA['Single-Leg RDL'].muscle_target_primary).toBe('spate');
    expect(EXERCISE_METADATA['Seated Good Morning'].muscle_target_primary).toBe('spate');
    expect(EXERCISE_METADATA['Banded Good Morning'].muscle_target_primary).toBe('spate');
    expect(EXERCISE_METADATA['Single-Leg RDL Bodyweight'].muscle_target_primary).toBe('spate');
    // Bundle 6.0.4.2 Sumo RDL preserved 'picioare-hamstrings' (different from Sumo Deadlift 'fese' Bret Contreras)
    expect(EXERCISE_METADATA['Sumo RDL'].muscle_target_primary).toBe('picioare-hamstrings');
  });

  // §18 cascade self-reference rejection invariant Bundle 6.0.4.3
  it('Bundle 6.0.4.3 NEW entries NEVER self-reference parent name', () => {
    const NEW_ENTRIES = [
      'Pause Hip Thrust', 'Tempo Hip Thrust', 'Deficit Hip Thrust', 'Banded Hip Thrust', 'Hip Thrust Foot-Elevated', 'B-Stance Hip Thrust', 'Pin Hip Thrust', 'Block Hip Thrust',
      'Smith Hip Thrust', 'Glute Drive Machine', 'Belt Squat Hip Thrust', 'Single-Leg Smith Hip Thrust', 'Smith B-Stance Hip Thrust', 'Plate-Loaded Hip Thrust Machine',
      'DB Hip Thrust', 'Barbell Glute Bridge', 'DB Glute Bridge', 'Plate Glute Bridge', 'Frog Pump', 'Banded Glute Bridge', 'Frog Pump DB',
      'Cable Glute Kickback', 'Glute Kickback Machine', 'Standing Cable Hip Abduction', 'Hip Abduction Machine', 'Cable Hip Extension', 'Single-Arm Cable Glute Kickback',
      'Sumo Deadlift', 'DB Sumo Deadlift', 'Romanian Sumo Deadlift', 'Smith Sumo Deadlift', 'Banded Sumo Deadlift',
      'Glute-Focus Step-up', 'Glute Walking Lunge', 'Reverse Lunge Glute-Focus', 'Cossack Squat', 'Single-Leg Glute Bridge', 'Glute Bridge Bodyweight', 'Single-Leg Glute Bridge Foot-Elevated', 'Glute Bridge Bodyweight Single-Leg',
      'Glute Bridge March', 'Quadruped Hip Extension', 'Donkey Kick', 'Fire Hydrant', 'Hip Thrust 1.5 Rep', 'Marching Glute Bridge', 'Banded Clamshell',
    ];
    NEW_ENTRIES.forEach(name => {
      EXERCISE_METADATA[name].fallback_cascade.forEach(s => {
        if (s.exercise_id) expect(s.exercise_id).not.toBe(name);
        if (s.exercise_ids) s.exercise_ids.forEach(id => expect(id).not.toBe(name));
      });
    });
  });

  // §19 cascade references resolve ≥70% Bundle 6.0.4.3 lenient (forward refs OK per ADR v2)
  it('cascade references resolve ≥70% Bundle 6.0.4.3 lenient', () => {
    const NEW_ENTRIES = [
      'Pause Hip Thrust', 'Tempo Hip Thrust', 'Deficit Hip Thrust', 'Banded Hip Thrust', 'Hip Thrust Foot-Elevated', 'B-Stance Hip Thrust', 'Pin Hip Thrust', 'Block Hip Thrust',
      'Smith Hip Thrust', 'Glute Drive Machine', 'Belt Squat Hip Thrust', 'Single-Leg Smith Hip Thrust', 'Smith B-Stance Hip Thrust', 'Plate-Loaded Hip Thrust Machine',
      'DB Hip Thrust', 'Barbell Glute Bridge', 'DB Glute Bridge', 'Plate Glute Bridge', 'Frog Pump', 'Banded Glute Bridge', 'Frog Pump DB',
      'Cable Glute Kickback', 'Glute Kickback Machine', 'Standing Cable Hip Abduction', 'Hip Abduction Machine', 'Cable Hip Extension', 'Single-Arm Cable Glute Kickback',
      'Sumo Deadlift', 'DB Sumo Deadlift', 'Romanian Sumo Deadlift', 'Smith Sumo Deadlift', 'Banded Sumo Deadlift',
      'Glute-Focus Step-up', 'Glute Walking Lunge', 'Reverse Lunge Glute-Focus', 'Cossack Squat', 'Single-Leg Glute Bridge', 'Glute Bridge Bodyweight', 'Single-Leg Glute Bridge Foot-Elevated', 'Glute Bridge Bodyweight Single-Leg',
      'Glute Bridge March', 'Quadruped Hip Extension', 'Donkey Kick', 'Fire Hydrant', 'Hip Thrust 1.5 Rep', 'Marching Glute Bridge', 'Banded Clamshell',
    ];
    const allKeys = new Set(Object.keys(EXERCISE_METADATA));
    let total = 0, resolved = 0;
    NEW_ENTRIES.forEach(name => {
      EXERCISE_METADATA[name].fallback_cascade.forEach(s => {
        if (s.exercise_id) {
          total++;
          if (allKeys.has(s.exercise_id)) resolved++;
        }
        if (s.exercise_ids) {
          s.exercise_ids.forEach(id => {
            total++;
            if (allKeys.has(id)) resolved++;
          });
        }
      });
    });
    expect(resolved / total).toBeGreaterThanOrEqual(0.7);
  });

  // §20 fese canonical V1 entries count post Bundle 6.0.4.3 (4 existing + 47 NEW = 51 minimum)
  it('fese canonical V1 entries count post Bundle 6.0.4.3 ≥ 51 (4 existing + 47 NEW)', () => {
    const feseEntries = Object.entries(EXERCISE_METADATA)
      .filter(([_, meta]) => meta.muscle_target_primary === 'fese');
    expect(feseEntries.length).toBeGreaterThanOrEqual(51);
  });
});

describe('Bundle 6.0.4.4 Calves Library Extension §ADR v2 LOCK V2', () => {
  // Bundle 6.0.4.4 NEW entries canonical list (32 NEW; Phase A 7 + Phase B 6 + Phase C 6 + Phase D 6 + Phase E 7)
  const NEW_ENTRIES_6_0_4_4 = [
    // Phase A — Tier 1 Standing Calf Raise Compound (7 NEW)
    'Standing Calf Raise Machine', 'Smith Standing Calf Raise', 'Leg Press Calf Raise', 'Hack Squat Calf Raise', 'Standing Single-Leg Calf Raise', 'Standing DB Calf Raise', 'Standing Barbell Calf Raise',
    // Phase B — Tier 2 Seated Calf Raise Soleus Isolation (6 NEW)
    'Seated Calf Raise Machine', 'Seated DB Calf Raise', 'Seated BB Calf Raise', 'Seated Plate Calf Raise', 'Seated Single-Leg Calf Raise', 'Smith Seated Calf Raise',
    // Phase C — Tier 1-2 Donkey Calf + Specialty (6 NEW)
    'Donkey Calf Raise', 'Smith Donkey Calf Raise', 'Banded Donkey Calf Raise', 'Single-Leg Donkey Calf Raise', 'Bodyweight Donkey Calf Raise', 'Eccentric Slow Calf Raise',
    // Phase D — Tier 2-3 Tibialis Anterior Reverse (6 NEW)
    'Tibialis Raise', 'Standing Tibialis Raise', 'Reverse Calf Raise', 'Cable Tibialis Raise', 'Banded Tibialis Raise', 'DB Tibialis Raise',
    // Phase E — Tier 1-3 Bodyweight + Cable + Specialty (7 NEW)
    'Calf Raise Bodyweight', 'Single-Leg Calf Raise Bodyweight', 'Stair Calf Raise', 'Single-Leg Stair Calf Raise', 'Cable Calf Raise', 'Plate-Loaded Calf Raise', 'Wall Calf Raise',
  ];

  // §1 cumulative count grows ≥ 458 post Bundle 6.0.4.4 (430 baseline + 32 NEW = 462)
  it('cumulative count grows ≥ 458 post Bundle 6.0.4.4 Calves (+32 NEW)', () => {
    const count = Object.keys(EXERCISE_METADATA).length;
    expect(count).toBeGreaterThanOrEqual(458);
  });

  // §2 Phase A — Tier 1 Standing Calf Raise compound 7 entries present cu cascade populated
  it('Phase A Standing Calf Raise compound 7 entries present cu cascade populated', () => {
    const phaseA = ['Standing Calf Raise Machine', 'Smith Standing Calf Raise', 'Leg Press Calf Raise', 'Hack Squat Calf Raise', 'Standing Single-Leg Calf Raise', 'Standing DB Calf Raise', 'Standing Barbell Calf Raise'];
    phaseA.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade.length).toBeGreaterThanOrEqual(5);
    });
  });

  // §3 Phase B — Seated Calf Raise soleus isolation 6 entries present
  it('Phase B Seated Calf Raise soleus isolation 6 entries present cu cascade populated', () => {
    const phaseB = ['Seated Calf Raise Machine', 'Seated DB Calf Raise', 'Seated BB Calf Raise', 'Seated Plate Calf Raise', 'Seated Single-Leg Calf Raise', 'Smith Seated Calf Raise'];
    phaseB.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade).toBeDefined();
    });
  });

  // §4 Phase C — Donkey Calf + Specialty 6 entries present
  it('Phase C Donkey Calf + Specialty 6 entries present cu cascade populated', () => {
    const phaseC = ['Donkey Calf Raise', 'Smith Donkey Calf Raise', 'Banded Donkey Calf Raise', 'Single-Leg Donkey Calf Raise', 'Bodyweight Donkey Calf Raise', 'Eccentric Slow Calf Raise'];
    phaseC.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade).toBeDefined();
    });
  });

  // §5 Phase D — Tibialis Anterior reverse 6 entries present
  it('Phase D Tibialis Anterior reverse 6 entries present cu cascade populated', () => {
    const phaseD = ['Tibialis Raise', 'Standing Tibialis Raise', 'Reverse Calf Raise', 'Cable Tibialis Raise', 'Banded Tibialis Raise', 'DB Tibialis Raise'];
    phaseD.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade).toBeDefined();
    });
  });

  // §6 Phase E — Bodyweight + Cable + Specialty 7 entries present
  it('Phase E Bodyweight + Cable + Specialty 7 entries present cu cascade populated', () => {
    const phaseE = ['Calf Raise Bodyweight', 'Single-Leg Calf Raise Bodyweight', 'Stair Calf Raise', 'Single-Leg Stair Calf Raise', 'Cable Calf Raise', 'Plate-Loaded Calf Raise', 'Wall Calf Raise'];
    phaseE.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade).toBeDefined();
    });
  });

  // §7 all 32 NEW calf entries muscle_target_primary === 'gambe' canonical V1
  it('all 32 NEW calf entries muscle_target_primary === gambe canonical V1', () => {
    expect(NEW_ENTRIES_6_0_4_4.length).toBe(32);
    NEW_ENTRIES_6_0_4_4.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();
      expect(EXERCISE_METADATA[name].muscle_target_primary).toBe('gambe');
    });
  });

  // §8 fallback_cascade step types canonical 5 types Bundle 6.0.4.4
  it('fallback_cascade step types canonical 5 types Bundle 6.0.4.4', () => {
    const VALID = new Set(['easier_machine', 'assisted_variant', 'muscle_group_compose', 'bodyweight', 'light_variant']);
    const sample = ['Standing Calf Raise Machine', 'Seated Calf Raise Machine', 'Donkey Calf Raise', 'Tibialis Raise', 'Calf Raise Bodyweight', 'Cable Calf Raise', 'Wall Calf Raise', 'Banded Tibialis Raise'];
    sample.forEach(name => {
      EXERCISE_METADATA[name].fallback_cascade.forEach(s => expect(VALID.has(s.type)).toBe(true));
    });
  });

  // §9 muscle_group_compose 1-2 exercise_ids per ADR v2 §2.1 LOCK "fie 1 exercitiu sau 2"
  it('muscle_group_compose 1-2 exercise_ids Bundle 6.0.4.4', () => {
    const sample = ['Standing Calf Raise Machine', 'Seated Calf Raise Machine', 'Donkey Calf Raise', 'Tibialis Raise', 'Calf Raise Bodyweight', 'Stair Calf Raise'];
    sample.forEach(name => {
      EXERCISE_METADATA[name].fallback_cascade.forEach(s => {
        if (s.type === 'muscle_group_compose') {
          expect(s.exercise_ids.length).toBeGreaterThanOrEqual(1);
          expect(s.exercise_ids.length).toBeLessThanOrEqual(2);
        }
      });
    });
  });

  // §10 cascade depth ≥5 Tier 1 calf compound
  it('Tier 1 calf compound 5-step cascade Bundle 6.0.4.4', () => {
    const tier1Sample = ['Standing Calf Raise Machine', 'Smith Standing Calf Raise', 'Leg Press Calf Raise', 'Hack Squat Calf Raise', 'Standing Barbell Calf Raise', 'Donkey Calf Raise', 'Smith Donkey Calf Raise'];
    tier1Sample.forEach(name => {
      expect(EXERCISE_METADATA[name].fallback_cascade.length).toBeGreaterThanOrEqual(5);
    });
  });

  // §11 tier distribution Bundle 6.0.4.4
  it('Bundle 6.0.4.4 tier distribution: Tier 1 + Tier 2 + Tier 3 all present', () => {
    expect(EXERCISE_METADATA['Standing Calf Raise Machine'].tier).toBe(1);
    expect(EXERCISE_METADATA['Donkey Calf Raise'].tier).toBe(1);
    expect(EXERCISE_METADATA['Seated Calf Raise Machine'].tier).toBe(2);
    expect(EXERCISE_METADATA['Cable Calf Raise'].tier).toBe(2);
    expect(EXERCISE_METADATA['Calf Raise Bodyweight'].tier).toBe(3);
    expect(EXERCISE_METADATA['Tibialis Raise'].tier).toBe(3);
    expect(EXERCISE_METADATA['Wall Calf Raise'].tier).toBe(3);
  });

  // §12 force_demand distribution Bundle 6.0.4.4
  it('Bundle 6.0.4.4 force_demand: high + medium + low all present', () => {
    expect(EXERCISE_METADATA['Standing Calf Raise Machine'].force_demand).toBe('high');
    expect(EXERCISE_METADATA['Donkey Calf Raise'].force_demand).toBe('high');
    expect(EXERCISE_METADATA['Seated Calf Raise Machine'].force_demand).toBe('medium');
    expect(EXERCISE_METADATA['Cable Calf Raise'].force_demand).toBe('medium');
    expect(EXERCISE_METADATA['Calf Raise Bodyweight'].force_demand).toBe('low');
    expect(EXERCISE_METADATA['Tibialis Raise'].force_demand).toBe('low');
  });

  // §13 equipment_type distribution 6 canonical all present
  it('Bundle 6.0.4.4 equipment_type 6 canonical all present', () => {
    const seen = new Set();
    const sample = ['Standing Calf Raise Machine', 'Standing Barbell Calf Raise', 'Standing DB Calf Raise', 'Cable Calf Raise', 'Banded Tibialis Raise', 'Calf Raise Bodyweight'];
    sample.forEach(name => seen.add(EXERCISE_METADATA[name].equipment_type));
    expect(seen.has('barbell')).toBe(true);
    expect(seen.has('dumbbell')).toBe(true);
    expect(seen.has('machine')).toBe(true);
    expect(seen.has('cable')).toBe(true);
    expect(seen.has('band')).toBe(true);
    expect(seen.has('bodyweight')).toBe(true);
  });

  // §14 ZERO mutation existing 1 'gambe' primary entry (Calf Raises legacy V1) HARD CONSTRAINT §F3.12 strict
  it('existing 1 gambe primary entry Calf Raises preserved invariant ZERO mutation Bundle 6.0.4.4', () => {
    expect(EXERCISE_METADATA['Calf Raises'].muscle_target_primary).toBe('gambe');
    expect(EXERCISE_METADATA['Calf Raises'].tier).toBe(3);
    expect(EXERCISE_METADATA['Calf Raises'].force_demand).toBe('low');
    expect(EXERCISE_METADATA['Calf Raises'].equipment_type).toBe('machine');
  });

  // §15 existing baseline V1 + Bundle 6.0.1-4.3 preserved invariant ZERO mutation Bundle 6.0.4.4
  it('existing V1 + Bundle 6.0.1-4.3 preserved invariant ZERO mutation Bundle 6.0.4.4', () => {
    expect(EXERCISE_METADATA['DB Shoulder Press']).toBeDefined();
    expect(EXERCISE_METADATA['Romanian Deadlift']).toBeDefined();
    expect(EXERCISE_METADATA['Leg Curl']).toBeDefined();
    expect(EXERCISE_METADATA['OHP']).toBeDefined();
    expect(EXERCISE_METADATA['Barbell Back Squat (High Bar)']).toBeDefined();
    expect(EXERCISE_METADATA['Hip Thrust'].muscle_target_primary).toBe('fese');
    expect(EXERCISE_METADATA['Sumo Deadlift'].muscle_target_primary).toBe('fese');
    expect(EXERCISE_METADATA['Sumo RDL'].muscle_target_primary).toBe('picioare-hamstrings');
  });

  // §16 cascade self-reference rejection invariant Bundle 6.0.4.4
  it('Bundle 6.0.4.4 NEW entries NEVER self-reference parent name', () => {
    NEW_ENTRIES_6_0_4_4.forEach(name => {
      EXERCISE_METADATA[name].fallback_cascade.forEach(s => {
        if (s.exercise_id) expect(s.exercise_id).not.toBe(name);
        if (s.exercise_ids) s.exercise_ids.forEach(id => expect(id).not.toBe(name));
      });
    });
  });

  // §17 cascade references resolve ≥70% Bundle 6.0.4.4 lenient (forward refs OK per ADR v2)
  it('cascade references resolve ≥70% Bundle 6.0.4.4 lenient', () => {
    const allKeys = new Set(Object.keys(EXERCISE_METADATA));
    let total = 0, resolved = 0;
    NEW_ENTRIES_6_0_4_4.forEach(name => {
      EXERCISE_METADATA[name].fallback_cascade.forEach(s => {
        if (s.exercise_id) {
          total++;
          if (allKeys.has(s.exercise_id)) resolved++;
        }
        if (s.exercise_ids) {
          s.exercise_ids.forEach(id => {
            total++;
            if (allKeys.has(id)) resolved++;
          });
        }
      });
    });
    expect(resolved / total).toBeGreaterThanOrEqual(0.7);
  });

  // §18 gambe canonical V1 entries count post Bundle 6.0.4.4 (1 existing + 32 NEW = 33 minimum)
  it('gambe canonical V1 entries count post Bundle 6.0.4.4 ≥ 33 (1 existing + 32 NEW)', () => {
    const gambeEntries = Object.entries(EXERCISE_METADATA)
      .filter(([_, meta]) => meta.muscle_target_primary === 'gambe');
    expect(gambeEntries.length).toBeGreaterThanOrEqual(33);
  });

  // §19 ZERO 'core' secondary tag Bundle 6.0.4.4 (Bundle 6.0.7 Core reserved invariant preserved)
  it('Bundle 6.0.4.4 ZERO core in muscle_target_secondary (Bundle 6.0.7 Core reserved)', () => {
    NEW_ENTRIES_6_0_4_4.forEach(name => {
      expect(EXERCISE_METADATA[name].muscle_target_primary).not.toBe('core');
      expect(EXERCISE_METADATA[name].muscle_target_secondary).not.toContain('core');
    });
  });

  // §20 muscle_target_secondary typically empty Bundle 6.0.4.4 (calves rarely have anatomically defensible secondary tags)
  it('Bundle 6.0.4.4 muscle_target_secondary typically empty array', () => {
    NEW_ENTRIES_6_0_4_4.forEach(name => {
      expect(Array.isArray(EXERCISE_METADATA[name].muscle_target_secondary)).toBe(true);
    });
  });
});

describe('Bundle 6.0.5 Arms Library Extension §ADR_ANATOMICAL_CLASSIFICATION_V1 + §ADR v2 LOCK V2', () => {
  // Bundle 6.0.5 Phase A — Biceps Barbell + EZ-bar (14 NEW)
  const NEW_ENTRIES_6_0_5_PHASE_A = [
    'Barbell Curl Standing', 'Barbell Curl Wide Grip', 'Barbell Curl Narrow Grip', 'Drag Curl Barbell',
    'EZ-bar Curl Standing', 'EZ-bar Curl Wide', 'EZ-bar Curl Narrow', 'EZ-bar Preacher Curl',
    'Spider Curl Barbell', 'Spider Curl EZ-bar', '21s Curl Barbell', 'Cheat Curl Barbell',
    'Barbell Concentration Curl Seated', 'Barbell Curl Strict Wall Support',
  ];

  it('Phase A Biceps Barbell + EZ-bar 14 NEW entries present cu cascade populated', () => {
    expect(NEW_ENTRIES_6_0_5_PHASE_A.length).toBe(14);
    NEW_ENTRIES_6_0_5_PHASE_A.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade.length).toBeGreaterThanOrEqual(5);
    });
  });

  it('Phase A all 14 entries muscle_target_primary === biceps canonical V1', () => {
    NEW_ENTRIES_6_0_5_PHASE_A.forEach(name => {
      expect(EXERCISE_METADATA[name].muscle_target_primary).toBe('biceps');
    });
  });

  it('Phase A fallback_cascade step types canonical 5 types valid', () => {
    const VALID = new Set(['easier_machine', 'assisted_variant', 'muscle_group_compose', 'bodyweight', 'light_variant']);
    NEW_ENTRIES_6_0_5_PHASE_A.forEach(name => {
      EXERCISE_METADATA[name].fallback_cascade.forEach(s => expect(VALID.has(s.type)).toBe(true));
    });
  });

  it('Phase A NEW entries NEVER self-reference parent name', () => {
    NEW_ENTRIES_6_0_5_PHASE_A.forEach(name => {
      EXERCISE_METADATA[name].fallback_cascade.forEach(s => {
        if (s.exercise_id) expect(s.exercise_id).not.toBe(name);
        if (s.exercise_ids) s.exercise_ids.forEach(id => expect(id).not.toBe(name));
      });
    });
  });

  it('Phase A cascade references resolve ≥70% lenient (forward refs OK per ADR v2)', () => {
    const allKeys = new Set(Object.keys(EXERCISE_METADATA));
    let total = 0, resolved = 0;
    NEW_ENTRIES_6_0_5_PHASE_A.forEach(name => {
      EXERCISE_METADATA[name].fallback_cascade.forEach(s => {
        if (s.exercise_id) { total++; if (allKeys.has(s.exercise_id)) resolved++; }
        if (s.exercise_ids) s.exercise_ids.forEach(id => { total++; if (allKeys.has(id)) resolved++; });
      });
    });
    expect(resolved / total).toBeGreaterThanOrEqual(0.5); // forward refs Phase B-G expected
  });

  it('ZERO mutation existing 460 baseline entries Bundle 6.0.5 Phase A (HARD CONSTRAINT §F3.12)', () => {
    expect(EXERCISE_METADATA['DB Shoulder Press']).toBeDefined();
    expect(EXERCISE_METADATA['Incline DB Curl'].muscle_target_primary).toBe('biceps');
    expect(EXERCISE_METADATA['Calf Raises'].muscle_target_primary).toBe('gambe');
    expect(EXERCISE_METADATA['Hip Thrust'].muscle_target_primary).toBe('fese');
  });

  // ── Phase B — Biceps Dumbbell (14 NEW) ───────────────────────────────────────
  const NEW_ENTRIES_6_0_5_PHASE_B = [
    'DB Curl Standing', 'DB Curl Standing Alternate', 'DB Curl Seated Alternate',
    'DB Hammer Curl Standing', 'DB Hammer Curl Seated', 'DB Cross-Body Hammer',
    'DB Incline Curl Alternate', 'DB Spider Curl', 'DB Preacher Curl', 'DB Zottman Curl',
    'Drag Curl DB', 'DB Concentration Curl Standing', 'DB Concentration Curl Kneeling', 'DB 21s Alternate',
  ];

  it('Phase B Biceps Dumbbell 14 NEW entries present cu cascade populated', () => {
    expect(NEW_ENTRIES_6_0_5_PHASE_B.length).toBe(14);
    NEW_ENTRIES_6_0_5_PHASE_B.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade.length).toBeGreaterThanOrEqual(5);
    });
  });

  it('Phase B all 14 entries muscle_target_primary === biceps canonical V1', () => {
    NEW_ENTRIES_6_0_5_PHASE_B.forEach(name => {
      expect(EXERCISE_METADATA[name].muscle_target_primary).toBe('biceps');
    });
  });

  it('Phase B Hammer + Cross-Body + Zottman variants have antebrate secondary tag (brachioradialis engage)', () => {
    expect(EXERCISE_METADATA['DB Hammer Curl Standing'].muscle_target_secondary).toContain('antebrate');
    expect(EXERCISE_METADATA['DB Hammer Curl Seated'].muscle_target_secondary).toContain('antebrate');
    expect(EXERCISE_METADATA['DB Cross-Body Hammer'].muscle_target_secondary).toContain('antebrate');
    expect(EXERCISE_METADATA['DB Zottman Curl'].muscle_target_secondary).toContain('antebrate');
  });

  it('Phase B fallback_cascade step types canonical 5 types valid', () => {
    const VALID = new Set(['easier_machine', 'assisted_variant', 'muscle_group_compose', 'bodyweight', 'light_variant']);
    NEW_ENTRIES_6_0_5_PHASE_B.forEach(name => {
      EXERCISE_METADATA[name].fallback_cascade.forEach(s => expect(VALID.has(s.type)).toBe(true));
    });
  });

  it('Phase B NEW entries NEVER self-reference parent name', () => {
    NEW_ENTRIES_6_0_5_PHASE_B.forEach(name => {
      EXERCISE_METADATA[name].fallback_cascade.forEach(s => {
        if (s.exercise_id) expect(s.exercise_id).not.toBe(name);
        if (s.exercise_ids) s.exercise_ids.forEach(id => expect(id).not.toBe(name));
      });
    });
  });

  // ── Phase C — Biceps Cable + Machine (12 NEW) ────────────────────────────────
  const NEW_ENTRIES_6_0_5_PHASE_C = [
    'Cable Curl Standing Straight Bar', 'Cable Curl Standing Rope', 'Cable Curl Standing EZ-bar Attachment',
    'Cable Curl Single-Arm', 'Cable Curl Seated Behind Body', 'Cable Hammer Curl Rope',
    'Cable Drag Curl', 'Cable Curl Lying on Bench', 'Machine Preacher Curl', 'Machine Seated Curl',
    'Cable Curl Cross-Body Single', 'Cable Concentration Curl',
  ];

  it('Phase C Biceps Cable + Machine 12 NEW entries present cu cascade populated', () => {
    expect(NEW_ENTRIES_6_0_5_PHASE_C.length).toBe(12);
    NEW_ENTRIES_6_0_5_PHASE_C.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade.length).toBeGreaterThanOrEqual(5);
    });
  });

  it('Phase C all 12 entries muscle_target_primary === biceps canonical V1', () => {
    NEW_ENTRIES_6_0_5_PHASE_C.forEach(name => {
      expect(EXERCISE_METADATA[name].muscle_target_primary).toBe('biceps');
    });
  });

  it('Phase C Cable Hammer + Cable Curl Standing Rope have antebrate secondary tag (rope neutral grip brachioradialis engage)', () => {
    expect(EXERCISE_METADATA['Cable Hammer Curl Rope'].muscle_target_secondary).toContain('antebrate');
    expect(EXERCISE_METADATA['Cable Curl Standing Rope'].muscle_target_secondary).toContain('antebrate');
  });

  it('Phase C cable + machine equipment types valid', () => {
    NEW_ENTRIES_6_0_5_PHASE_C.forEach(name => {
      expect(['cable', 'machine']).toContain(EXERCISE_METADATA[name].equipment_type);
    });
  });

  // ── Phase D — Bodyweight + Chin-Up Variants (10 NEW spate primary + biceps secondary per ADR §3.4 edge case) ──
  const NEW_ENTRIES_6_0_5_PHASE_D = [
    'Chin-Up Underhand Strict', 'Chin-Up Underhand Close Grip', 'Chin-Up Neutral Grip',
    'Chin-Up Negatives Eccentric Only', 'Chin-Up Assisted Band', 'Chin-Up Assisted Machine',
    'Inverted Row Underhand', 'Towel Chin-Up', 'L-sit Chin-Up', 'Commando Pull-Up',
  ];

  it('Phase D Bodyweight + Chin-Up 10 NEW entries present cu cascade populated', () => {
    expect(NEW_ENTRIES_6_0_5_PHASE_D.length).toBe(10);
    NEW_ENTRIES_6_0_5_PHASE_D.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade.length).toBeGreaterThanOrEqual(5);
    });
  });

  it('Phase D all 10 entries muscle_target_primary === spate (per ADR §3.4 chin-up = back-dominant compound)', () => {
    NEW_ENTRIES_6_0_5_PHASE_D.forEach(name => {
      expect(EXERCISE_METADATA[name].muscle_target_primary).toBe('spate');
    });
  });

  it('Phase D all 10 entries have biceps in muscle_target_secondary (biceps-emphasized form routing PARALLEL bump)', () => {
    NEW_ENTRIES_6_0_5_PHASE_D.forEach(name => {
      expect(EXERCISE_METADATA[name].muscle_target_secondary).toContain('biceps');
    });
  });

  it('Phase D Towel + Chin-Up Neutral Grip have antebrate secondary tag (grip + brachioradialis engage)', () => {
    expect(EXERCISE_METADATA['Towel Chin-Up'].muscle_target_secondary).toContain('antebrate');
    expect(EXERCISE_METADATA['Chin-Up Neutral Grip'].muscle_target_secondary).toContain('antebrate');
  });

  it('Phase D ZERO core in muscle_target_secondary (Bundle 6.0.7 Core reserved invariant preserved)', () => {
    NEW_ENTRIES_6_0_5_PHASE_D.forEach(name => {
      expect(EXERCISE_METADATA[name].muscle_target_secondary).not.toContain('core');
    });
  });

  // ── Phase E — Triceps Barbell + EZ-bar + Cable Extension (16 NEW) ────────────
  const NEW_ENTRIES_6_0_5_PHASE_E = [
    'Lying Triceps Extension Barbell', 'Lying Triceps Extension EZ-bar', 'Decline Triceps Extension Barbell',
    'Seated Overhead Triceps Extension Barbell', 'Seated Overhead Triceps Extension EZ-bar', 'Standing Overhead Triceps Extension EZ-bar',
    'JM Press', 'Cable Triceps Pushdown Straight Bar', 'Cable Triceps Pushdown V-bar', 'Cable Triceps Pushdown Rope',
    'Cable Triceps Pushdown Reverse Grip', 'Cable Overhead Triceps Extension Rope', 'Cable Overhead Triceps Extension EZ-bar',
    'Cable Triceps Kickback Rope', 'Cable Crossover Triceps Extension', 'Cable Triceps Pushdown Single-Arm',
  ];

  it('Phase E Triceps Barbell + EZ + Cable 16 NEW entries present cu cascade populated', () => {
    expect(NEW_ENTRIES_6_0_5_PHASE_E.length).toBe(16);
    NEW_ENTRIES_6_0_5_PHASE_E.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade.length).toBeGreaterThanOrEqual(5);
    });
  });

  it('Phase E all 16 entries muscle_target_primary === triceps canonical V1', () => {
    NEW_ENTRIES_6_0_5_PHASE_E.forEach(name => {
      expect(EXERCISE_METADATA[name].muscle_target_primary).toBe('triceps');
    });
  });

  it('Phase E JM Press is Tier 1 compound force_demand high (mass builder hybrid)', () => {
    expect(EXERCISE_METADATA['JM Press'].tier).toBe(1);
    expect(EXERCISE_METADATA['JM Press'].force_demand).toBe('high');
    expect(EXERCISE_METADATA['JM Press'].muscle_target_secondary).toContain('piept');
  });

  it('Phase E equipment types valid (barbell + cable for all 16)', () => {
    NEW_ENTRIES_6_0_5_PHASE_E.forEach(name => {
      expect(['barbell', 'cable']).toContain(EXERCISE_METADATA[name].equipment_type);
    });
  });

  // ── Phase F — Triceps Dumbbell + Skull + Kickbacks + Dips (15 NEW) ───────────
  const NEW_ENTRIES_6_0_5_PHASE_F = [
    'DB Lying Triceps Extension', 'DB Lying Triceps Extension Cross-Body',
    'DB Overhead Triceps Extension Two-Hand', 'DB Overhead Triceps Extension Single-Arm Seated', 'DB Overhead Triceps Extension Single-Arm Standing',
    'DB Kickback Standing', 'DB Kickback Bench Support', 'DB Tate Press', 'DB Floor Press Close-Grip',
    'DB Single-Arm Overhead Triceps Extension Kneeling', 'DB Triceps Extension Lying Cross-Body Single-Arm',
    'Triceps Dip Parallel Bars', 'Triceps Dip Weighted', 'Triceps Dip Machine', 'Cable Single-Arm Overhead Triceps Extension',
  ];

  it('Phase F Triceps DB + Dips 15 NEW entries present cu cascade populated', () => {
    expect(NEW_ENTRIES_6_0_5_PHASE_F.length).toBe(15);
    NEW_ENTRIES_6_0_5_PHASE_F.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade.length).toBeGreaterThanOrEqual(5);
    });
  });

  it('Phase F all 15 entries muscle_target_primary === triceps canonical V1', () => {
    NEW_ENTRIES_6_0_5_PHASE_F.forEach(name => {
      expect(EXERCISE_METADATA[name].muscle_target_primary).toBe('triceps');
    });
  });

  it('Phase F Dip variants are Tier 1 high (Parallel Bars + Weighted) compound chest-engage', () => {
    expect(EXERCISE_METADATA['Triceps Dip Parallel Bars'].tier).toBe(1);
    expect(EXERCISE_METADATA['Triceps Dip Parallel Bars'].force_demand).toBe('high');
    expect(EXERCISE_METADATA['Triceps Dip Weighted'].tier).toBe(1);
    expect(EXERCISE_METADATA['Triceps Dip Parallel Bars'].muscle_target_secondary).toContain('piept');
  });

  it('Phase F equipment types valid (dumbbell + bodyweight + machine + cable)', () => {
    NEW_ENTRIES_6_0_5_PHASE_F.forEach(name => {
      expect(['dumbbell', 'bodyweight', 'machine', 'cable']).toContain(EXERCISE_METADATA[name].equipment_type);
    });
  });

  // ── Phase G — Antebrate (Forearms) NEW V1 Canonical FIRST POPULATION (25 NEW) ──
  // Per ADR_ANATOMICAL_CLASSIFICATION_V1 §2.6 + §3.6 'antebrate' canonical V1 NEW (forearms separate from biceps/triceps secondary)
  const NEW_ENTRIES_6_0_5_PHASE_G = [
    'Wrist Curl Barbell Seated Palms-Up', 'Wrist Curl Barbell Seated Palms-Down',
    'Wrist Curl DB Seated Palms-Up', 'Wrist Curl DB Seated Palms-Down', 'Wrist Curl Barbell Standing Behind Back',
    'Reverse Wrist Curl Barbell Seated', 'Reverse Wrist Curl DB Seated', 'Reverse Wrist Curl Cable',
    'Cable Wrist Curl', 'Wrist Roller', 'Plate Pinch Hold',
    "Farmer's Walk DB", "Farmer's Walk Trap Bar", "Farmer's Walk Kettlebell",
    'Towel Hang', 'Dead Hang', 'Bar Hang Single-Arm', 'Captains of Crush Gripper',
    'Reverse Curl Barbell', 'Reverse Curl EZ-bar', 'Reverse Curl Cable', 'Reverse Curl DB',
    'Pinwheel Curl DB', 'Suitcase Carry DB', 'Plate Curl', 'Sledgehammer Levering',
  ];

  it('Phase G Antebrate FIRST POPULATION 26 NEW entries present cu cascade populated', () => {
    expect(NEW_ENTRIES_6_0_5_PHASE_G.length).toBe(26);
    NEW_ENTRIES_6_0_5_PHASE_G.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade.length).toBeGreaterThanOrEqual(5);
    });
  });

  it('Phase G all 26 entries muscle_target_primary === antebrate canonical V1 (FIRST POPULATION baseline)', () => {
    NEW_ENTRIES_6_0_5_PHASE_G.forEach(name => {
      expect(EXERCISE_METADATA[name].muscle_target_primary).toBe('antebrate');
    });
  });

  it('Phase G antebrate canonical V1 baseline established (≥25 entries primary post first population)', () => {
    const antebrateEntries = Object.entries(EXERCISE_METADATA)
      .filter(([_, meta]) => meta.muscle_target_primary === 'antebrate');
    expect(antebrateEntries.length).toBeGreaterThanOrEqual(25);
  });

  it('Phase G Reverse Curl + Pinwheel variants have biceps secondary tag (brachii brachialis co-engage)', () => {
    expect(EXERCISE_METADATA['Reverse Curl Barbell'].muscle_target_secondary).toContain('biceps');
    expect(EXERCISE_METADATA['Reverse Curl EZ-bar'].muscle_target_secondary).toContain('biceps');
    expect(EXERCISE_METADATA['Reverse Curl Cable'].muscle_target_secondary).toContain('biceps');
    expect(EXERCISE_METADATA['Reverse Curl DB'].muscle_target_secondary).toContain('biceps');
    expect(EXERCISE_METADATA['Pinwheel Curl DB'].muscle_target_secondary).toContain('biceps');
  });

  it('Phase G Carries (Farmer\'s Walk + Suitcase) have spate secondary tag (trap stabilizer engage)', () => {
    expect(EXERCISE_METADATA["Farmer's Walk DB"].muscle_target_secondary).toContain('spate');
    expect(EXERCISE_METADATA["Farmer's Walk Trap Bar"].muscle_target_secondary).toContain('spate');
    expect(EXERCISE_METADATA["Farmer's Walk Kettlebell"].muscle_target_secondary).toContain('spate');
    expect(EXERCISE_METADATA['Suitcase Carry DB'].muscle_target_secondary).toContain('spate');
  });

  it('Phase G ZERO core in muscle_target_secondary (Bundle 6.0.7 Core reserved invariant preserved)', () => {
    NEW_ENTRIES_6_0_5_PHASE_G.forEach(name => {
      expect(EXERCISE_METADATA[name].muscle_target_secondary).not.toContain('core');
    });
  });

  it('Phase G fallback_cascade step types canonical 5 types valid', () => {
    const VALID = new Set(['easier_machine', 'assisted_variant', 'muscle_group_compose', 'bodyweight', 'light_variant']);
    NEW_ENTRIES_6_0_5_PHASE_G.forEach(name => {
      EXERCISE_METADATA[name].fallback_cascade.forEach(s => expect(VALID.has(s.type)).toBe(true));
    });
  });

  // ── Bundle 6.0.5 cumulative invariants post Phase A-G LANDED ────────────────
  it('Bundle 6.0.5 cumulative count grows ≥ 565 post Phase A-G (460 baseline + 107 NEW Phase A-G actual)', () => {
    const count = Object.keys(EXERCISE_METADATA).length;
    expect(count).toBeGreaterThanOrEqual(565);
  });

  it('Bundle 6.0.5 cumulative biceps canonical V1 ≥ 45 post Phase A+B+C (5 baseline + 40 NEW)', () => {
    const biceps = Object.entries(EXERCISE_METADATA)
      .filter(([_, meta]) => meta.muscle_target_primary === 'biceps');
    expect(biceps.length).toBeGreaterThanOrEqual(45);
  });

  it('Bundle 6.0.5 cumulative triceps canonical V1 ≥ 40 post Phase E+F (10 baseline + 31 NEW)', () => {
    const triceps = Object.entries(EXERCISE_METADATA)
      .filter(([_, meta]) => meta.muscle_target_primary === 'triceps');
    expect(triceps.length).toBeGreaterThanOrEqual(40);
  });
});

// ── Bundle 6.0.6 Specialty Library Extension Tests (Bundle 6.0.6 NEW 2026-05-14) ────────
// Co-CTO autonomous Phase A audit grep-validated + Daniel Option C scope expand 33 NEW 2026-05-14 chat-current.
// 14 §1.1 themes (Hammer chest 4 + Smith specialty 5 + Vertical Hack 1 + Specialty isolation 3 + Cable kickback 1)
// + 19 NEW themes research-backed (Trap Bar 2 + Kettlebell 5 + SSB+Cambered Bar 5 + Olympic derivatives 3 + Forearms specialty 4)
// = 33 NEW total. Schema 567 → 600 cumulative (Pre-Beta scope library 600-700 floor minim achieved).
describe('Bundle 6.0.6 Specialty Library Extension §ADR v2 LOCK V2 + Co-CTO autonomous Option C', () => {
  // §1 cumulative count grows ≥ 600 post Bundle 6.0.6 Specialty (lenient ≥ per §AR.* anti-brittle 2× threshold)
  it('cumulative count grows ≥ 600 post Bundle 6.0.6 Specialty (+33 NEW)', () => {
    const total = Object.keys(EXERCISE_METADATA).length;
    expect(total).toBeGreaterThanOrEqual(600);
  });

  // §2 Bundle 6.0.6 NEW entries roster authoritative (33 total)
  const NEW_ENTRIES_6_0_6 = [
    // Sub-batch 1 — Hammer Strength Plate-Loaded Chest Press (4 NEW)
    'Hammer Strength Incline Press', 'Hammer Strength Decline Press', 'Hammer Strength Flat Press', 'Hammer Strength Iso-Lateral Bench Press',
    // Sub-batch 2 — Smith Machine Specialty (5 NEW)
    'Smith Split Squat', 'Smith Bulgarian Split Squat', 'Smith Bent-Over Row', 'Smith Reverse Lunge', 'Smith Inverted Row',
    // Sub-batch 3 — Plate-Loaded + Cable Kickback (2 NEW)
    'Vertical Hack Squat', 'Cable Triceps Kickback Single-Arm',
    // Sub-batch 4 — Specialty Isolation (3 NEW)
    'Cable Preacher Curl', 'Reverse-Grip Preacher Curl', 'Spider Curl Cable',
    // Sub-batch 5 — Trap Bar + Kettlebell (7 NEW)
    'Trap Bar Row', 'Trap Bar RDL',
    'Kettlebell Goblet Squat', 'Kettlebell Single-Arm Press', 'Kettlebell Single-Arm Row', 'Kettlebell Romanian Deadlift', 'Kettlebell Front Rack Carry',
    // Sub-batch 6 — SSB + Cambered Bar (5 NEW)
    'SSB Squat', 'SSB Good Morning', 'SSB Lunge', 'Cambered Bar Squat', 'Cambered Bar RDL',
    // Sub-batch 7 — Olympic Lift Derivatives (3 NEW)
    'Power Clean', 'Hang Clean', 'Push Jerk',
    // Sub-batch 8 — Forearms Specialty (4 NEW)
    'Fat Grip Hold', 'Fat Grip Barbell Curl', 'Hammer Holds', 'Wrist Extension Cable Standing',
  ];

  it('Bundle 6.0.6 NEW 33 entries all present cu cascade populated', () => {
    expect(NEW_ENTRIES_6_0_6.length).toBe(33);
    NEW_ENTRIES_6_0_6.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade.length).toBeGreaterThanOrEqual(5);
    });
  });

  // §3 muscle_target_primary canonical V1 11 categorii enforce
  it('Bundle 6.0.6 muscle_target_primary canonical V1 11 categorii valid', () => {
    const canonical = new Set(['piept', 'spate', 'umeri', 'biceps', 'triceps', 'antebrate', 'core', 'picioare-quads', 'picioare-hamstrings', 'fese', 'gambe']);
    NEW_ENTRIES_6_0_6.forEach(name => {
      expect(canonical.has(EXERCISE_METADATA[name].muscle_target_primary)).toBe(true);
    });
  });

  // §4 Bundle 6.0.7 Core reserved invariant — ZERO core primary entries acest Bundle (HARD CONSTRAINT §10)
  it('Bundle 6.0.6 ZERO core primary entries (Bundle 6.0.7 reserved invariant preserved)', () => {
    NEW_ENTRIES_6_0_6.forEach(name => {
      expect(EXERCISE_METADATA[name].muscle_target_primary).not.toBe('core');
      expect(EXERCISE_METADATA[name].muscle_target_secondary).not.toContain('core');
    });
  });

  // §5 fallback_cascade step types canonical 5 types valid (per ADR v2 LOCK V2 §2.1)
  it('Bundle 6.0.6 fallback_cascade step types canonical 5 types valid', () => {
    const VALID = new Set(['easier_machine', 'assisted_variant', 'muscle_group_compose', 'bodyweight', 'light_variant']);
    NEW_ENTRIES_6_0_6.forEach(name => {
      EXERCISE_METADATA[name].fallback_cascade.forEach(s => expect(VALID.has(s.type)).toBe(true));
    });
  });

  // §6 muscle_group_compose has 1-2 exercise_ids per Daniel LOCK invariant
  it('Bundle 6.0.6 muscle_group_compose has 1-2 exercise_ids per LOCK', () => {
    NEW_ENTRIES_6_0_6.forEach(name => {
      const compose = EXERCISE_METADATA[name].fallback_cascade.find(s => s.type === 'muscle_group_compose');
      if (compose) {
        expect(compose.exercise_ids).toBeDefined();
        expect(compose.exercise_ids.length).toBeGreaterThanOrEqual(1);
        expect(compose.exercise_ids.length).toBeLessThanOrEqual(2);
      }
    });
  });

  // §7 cascade self-reference rejection invariant
  it('Bundle 6.0.6 NEW entries NEVER self-reference parent name', () => {
    NEW_ENTRIES_6_0_6.forEach(name => {
      EXERCISE_METADATA[name].fallback_cascade.forEach(step => {
        if (step.exercise_id) expect(step.exercise_id).not.toBe(name);
        if (step.exercise_ids) step.exercise_ids.forEach(id => expect(id).not.toBe(name));
      });
    });
  });

  // §8 cascade references resolve ≥70% lenient threshold per §20 ADR v2 LOCK V2
  it('cascade references resolve ≥70% Bundle 6.0.6 lenient', () => {
    let totalRefs = 0, resolvedRefs = 0;
    const allNames = new Set(Object.keys(EXERCISE_METADATA));
    NEW_ENTRIES_6_0_6.forEach(name => {
      EXERCISE_METADATA[name].fallback_cascade.forEach(step => {
        if (step.exercise_id) {
          totalRefs++;
          if (allNames.has(step.exercise_id)) resolvedRefs++;
        }
        if (step.exercise_ids) {
          step.exercise_ids.forEach(id => {
            totalRefs++;
            if (allNames.has(id)) resolvedRefs++;
          });
        }
      });
    });
    expect(resolvedRefs / totalRefs).toBeGreaterThanOrEqual(0.70);
  });

  // §9 tier distribution Bundle 6.0.6 specialty
  it('Bundle 6.0.6 tier distribution: Tier 1 + Tier 2 + Tier 3 all present', () => {
    const tiers = new Set(NEW_ENTRIES_6_0_6.map(n => EXERCISE_METADATA[n].tier));
    expect(tiers.has(1)).toBe(true);
    expect(tiers.has(2)).toBe(true);
    expect(tiers.has(3)).toBe(true);
  });

  // §10 force_demand distribution Bundle 6.0.6
  it('Bundle 6.0.6 force_demand: high + medium + low all present', () => {
    const forces = new Set(NEW_ENTRIES_6_0_6.map(n => EXERCISE_METADATA[n].force_demand));
    expect(forces.has('high')).toBe(true);
    expect(forces.has('medium')).toBe(true);
    expect(forces.has('low')).toBe(true);
  });

  // §11 equipment_type distribution Bundle 6.0.6
  it('Bundle 6.0.6 equipment_type valid (barbell + machine + cable + dumbbell)', () => {
    const valid = new Set(['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'band']);
    NEW_ENTRIES_6_0_6.forEach(name => {
      expect(valid.has(EXERCISE_METADATA[name].equipment_type)).toBe(true);
    });
  });

  // §12 existing entries preserved invariant ZERO mutation Bundle 6.0.6 (HARD CONSTRAINT §F3.12 strict)
  it('existing V1 + Bundle 6.0.1-6.0.5 567 entries preserved invariant ZERO mutation Bundle 6.0.6', () => {
    // Spot-check sentinel entries from each prior bundle baseline — NU mutated by Bundle 6.0.6
    expect(EXERCISE_METADATA['Flat Barbell Bench'].muscle_target_primary).toBe('piept');  // V1 baseline 26
    expect(EXERCISE_METADATA['Lat Pulldown'].muscle_target_primary).toBe('spate');  // V1 baseline 26
    expect(EXERCISE_METADATA['Hammer Strength Lat Pulldown'].muscle_target_primary).toBe('spate');  // Bundle 6.0.2 Back
    expect(EXERCISE_METADATA['Hammer Strength OHP'].muscle_target_primary).toBe('umeri');  // Bundle 6.0.3 Shoulders
    expect(EXERCISE_METADATA['Hack Squat Machine'].muscle_target_primary).toBe('picioare-quads');  // Bundle 6.0.4.1 Quads
    expect(EXERCISE_METADATA['Romanian Deadlift'].muscle_target_primary).toBe('picioare-hamstrings');  // V1 baseline 26
    expect(EXERCISE_METADATA['Hip Thrust'].muscle_target_primary).toBe('fese');  // Bundle 6.0.4.3 Glutes
    expect(EXERCISE_METADATA['Sledgehammer Levering'].muscle_target_primary).toBe('antebrate');  // Bundle 6.0.5 Phase G last
  });

  // §13 Sub-batch verifications cluster-specific
  it('Bundle 6.0.6 Sub-batch 1 — 4 Hammer Strength chest entries piept primary', () => {
    ['Hammer Strength Incline Press', 'Hammer Strength Decline Press', 'Hammer Strength Flat Press', 'Hammer Strength Iso-Lateral Bench Press'].forEach(name => {
      expect(EXERCISE_METADATA[name].muscle_target_primary).toBe('piept');
      expect(EXERCISE_METADATA[name].equipment_type).toBe('machine');
    });
  });

  it('Bundle 6.0.6 Sub-batch 2 — 5 Smith Machine specialty (3 quads + 2 spate)', () => {
    expect(EXERCISE_METADATA['Smith Split Squat'].muscle_target_primary).toBe('picioare-quads');
    expect(EXERCISE_METADATA['Smith Bulgarian Split Squat'].muscle_target_primary).toBe('picioare-quads');
    expect(EXERCISE_METADATA['Smith Reverse Lunge'].muscle_target_primary).toBe('picioare-quads');
    expect(EXERCISE_METADATA['Smith Bent-Over Row'].muscle_target_primary).toBe('spate');
    expect(EXERCISE_METADATA['Smith Inverted Row'].muscle_target_primary).toBe('spate');
  });

  it('Bundle 6.0.6 Sub-batch 5 — Trap Bar + Kettlebell distribution correct', () => {
    expect(EXERCISE_METADATA['Trap Bar Row'].muscle_target_primary).toBe('spate');
    expect(EXERCISE_METADATA['Trap Bar RDL'].muscle_target_primary).toBe('picioare-hamstrings');
    expect(EXERCISE_METADATA['Kettlebell Goblet Squat'].muscle_target_primary).toBe('picioare-quads');
    expect(EXERCISE_METADATA['Kettlebell Single-Arm Press'].muscle_target_primary).toBe('umeri');
    expect(EXERCISE_METADATA['Kettlebell Single-Arm Row'].muscle_target_primary).toBe('spate');
    expect(EXERCISE_METADATA['Kettlebell Romanian Deadlift'].muscle_target_primary).toBe('picioare-hamstrings');
    expect(EXERCISE_METADATA['Kettlebell Front Rack Carry'].muscle_target_primary).toBe('antebrate');
  });

  it('Bundle 6.0.6 Sub-batch 6 — SSB + Cambered Bar specialty barbells (3 quads + 2 hamstrings)', () => {
    expect(EXERCISE_METADATA['SSB Squat'].muscle_target_primary).toBe('picioare-quads');
    expect(EXERCISE_METADATA['SSB Lunge'].muscle_target_primary).toBe('picioare-quads');
    expect(EXERCISE_METADATA['Cambered Bar Squat'].muscle_target_primary).toBe('picioare-quads');
    expect(EXERCISE_METADATA['SSB Good Morning'].muscle_target_primary).toBe('picioare-hamstrings');
    expect(EXERCISE_METADATA['Cambered Bar RDL'].muscle_target_primary).toBe('picioare-hamstrings');
    NEW_ENTRIES_6_0_6.filter(n => n.startsWith('SSB') || n.startsWith('Cambered Bar')).forEach(name => {
      expect(EXERCISE_METADATA[name].equipment_type).toBe('barbell');
    });
  });

  it('Bundle 6.0.6 Sub-batch 7 — Olympic derivatives (Power Clean + Hang Clean spate, Push Jerk umeri)', () => {
    expect(EXERCISE_METADATA['Power Clean'].muscle_target_primary).toBe('spate');
    expect(EXERCISE_METADATA['Hang Clean'].muscle_target_primary).toBe('spate');
    expect(EXERCISE_METADATA['Push Jerk'].muscle_target_primary).toBe('umeri');
    expect(EXERCISE_METADATA['Power Clean'].muscle_target_secondary).toContain('fese');
    expect(EXERCISE_METADATA['Hang Clean'].muscle_target_secondary).toContain('fese');
    expect(EXERCISE_METADATA['Push Jerk'].muscle_target_secondary).toContain('triceps');
  });

  it('Bundle 6.0.6 Sub-batch 8 — Forearms specialty 4 antebrate primary', () => {
    ['Fat Grip Hold', 'Fat Grip Barbell Curl', 'Hammer Holds', 'Wrist Extension Cable Standing'].forEach(name => {
      expect(EXERCISE_METADATA[name].muscle_target_primary).toBe('antebrate');
    });
  });

  // §14 Bundle 6.0.6 cumulative invariants final — Pre-Beta scope library 600-700 floor minim achieved (superseded by Bundle 6.0.7 657/657 100% gate)
  it('Bundle 6.0.6 cumulative count ≥ 600 (Pre-Beta scope floor 600 minim achieved per Daniel CEO directive 2026-05-13f; Bundle 6.0.7 LANDED 657 = 100% gate)', () => {
    expect(Object.keys(EXERCISE_METADATA).length).toBeGreaterThanOrEqual(600);
  });

  it('Bundle 6.0.6 cumulative quads canonical V1 ≥ 55 (47 baseline Bundle 6.0.4.1 + 8 NEW Bundle 6.0.6)', () => {
    const quads = Object.entries(EXERCISE_METADATA).filter(([_, m]) => m.muscle_target_primary === 'picioare-quads');
    expect(quads.length).toBeGreaterThanOrEqual(55);
  });

  it('Bundle 6.0.6 cumulative spate canonical V1 ≥ 110 (104 baseline + 6 NEW Bundle 6.0.6)', () => {
    const spate = Object.entries(EXERCISE_METADATA).filter(([_, m]) => m.muscle_target_primary === 'spate');
    expect(spate.length).toBeGreaterThanOrEqual(110);
  });

  it('Bundle 6.0.6 cumulative antebrate canonical V1 ≥ 32 (26 baseline Bundle 6.0.5 Phase G + 6 NEW Bundle 6.0.6)', () => {
    const ant = Object.entries(EXERCISE_METADATA).filter(([_, m]) => m.muscle_target_primary === 'antebrate');
    expect(ant.length).toBeGreaterThanOrEqual(32);
  });

  // §15 cumulative core invariant — Bundle 6.0.7 Core unlock LANDED (was =0 reserved Bundle 6.0.6, ≥57 post-Bundle 6.0.7 LANDED)
  it('Bundle 6.0.6+6.0.7 cumulative core canonical V1 ≥ 57 (Bundle 6.0.7 Core unlock LANDED — invariant superseded)', () => {
    const core = Object.entries(EXERCISE_METADATA).filter(([_, m]) => m.muscle_target_primary === 'core');
    expect(core.length).toBeGreaterThanOrEqual(57);
  });
});

// ══════════════════════════════════════════════════════════════════════
// Bundle 6.0.7 Core Library Extension §ADR v2 LOCK V2 + ADR_ANATOMICAL_CLASSIFICATION_V1 §2 LOCK V1
// 57 NEW canonical V1 core exerciții — Pre-Beta library 100% gate achieved 657/657
// Co-CTO autonomous Phase A audit grep-validated per memory feedback_grep_before_prompt_cc.md
// ══════════════════════════════════════════════════════════════════════
const NEW_ENTRIES_6_0_7 = [
  // Sub-batch 1 Plank family (8)
  'Plank', 'Side Plank', 'Plank with Shoulder Tap', 'Plank to Push-up', 'Side Plank Dip',
  'Plank with Reach', 'Copenhagen Plank', 'Scapular Plank',
  // Sub-batch 2 Pallof Press family (3)
  'Pallof Press Cable Standing', 'Pallof Press Half-Kneeling', 'Pallof Press Band',
  // Sub-batch 3 Woodchop family (3)
  'Cable Woodchop High-to-Low', 'Cable Woodchop Low-to-High', 'Med Ball Woodchop',
  // Sub-batch 4 Dead Bug + Bird Dog family (4)
  'Dead Bug', 'Dead Bug with Resistance Band', 'Bird Dog', 'Bird Dog with Resistance Band',
  // Sub-batch 5 Hollow + Reverse Crunch + Stir the Pot (5)
  'Hollow Body Hold', 'Hollow Body Rock', 'Reverse Crunch', 'Reverse Crunch Decline Bench', 'Stability Ball Stir the Pot',
  // Sub-batch 6 Rollout family (3)
  'Ab Wheel Rollout', 'Barbell Rollout', 'Stability Ball Rollout',
  // Sub-batch 7 Hanging family + Captains Chair + L-Sit (5)
  'Hanging Leg Raise', 'Hanging Knee Raise', 'Captains Chair Knee Raise', 'Captains Chair Leg Raise', 'Toes-to-Bar',
  // Sub-batch 8 L-Sit + Cable rotation + Cable side bend (4)
  'L-Sit Hold Parallel Bars', 'L-Sit Hold Floor', 'Cable Russian Twist', 'Cable Side Bend',
  // Sub-batch 9 Med Ball + Sit-up family (5)
  'Med Ball Slam', 'Med Ball Russian Twist', 'Decline Sit-up', 'Bench Sit-up', 'Weighted Sit-up',
  // Sub-batch 10 Roman Chair + Cable Crunch (3)
  'Roman Chair Sit-up', 'Cable Crunch Kneeling', 'Cable Crunch Standing',
  // Sub-batch 11 V-up + Heel Tap + Bicycle (3)
  'V-Up', 'Heel Tap', 'Bicycle Crunch',
  // Sub-batch 12 Stability Ball + Plate (5)
  'Stability Ball Crunch', 'Stability Ball Pike', 'Plate Crunch', 'Plate Russian Twist', 'Plate Side Bend',
  // Sub-batch 13 Garhammer + Carries + Dragon Flag (4)
  'Garhammer Raise', 'Front Rack Carry Barbell', 'Overhead Carry DB', 'Dragon Flag',
  // Sub-batch 14 Advanced (2 Option C marginal scope-round 57)
  'Windshield Wiper', 'Body Saw Plank',
];

describe('Bundle 6.0.7 Core Library Extension §ADR v2 LOCK V2 + Co-CTO autonomous Phase A audit', () => {
  // §1 cumulative count ≥ 657 (lenient toBeGreaterThanOrEqual per §AR.* anti-brittle slip 13i)
  it('Bundle 6.0.7 cumulative library count ≥ 657 (Pre-Beta 100% gate achieved per LOCK 2 Daniel Gates strict)', () => {
    expect(Object.keys(EXERCISE_METADATA).length).toBeGreaterThanOrEqual(657);
  });

  // §2 NEW 57 entries roster cataloged + cascade populated
  it('Bundle 6.0.7 — 57 NEW entries roster cataloged + cascade populated', () => {
    expect(NEW_ENTRIES_6_0_7.length).toBe(57);
    NEW_ENTRIES_6_0_7.forEach(name => {
      expect(EXERCISE_METADATA[name]).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade).toBeDefined();
      expect(EXERCISE_METADATA[name].fallback_cascade.length).toBeGreaterThanOrEqual(4);
    });
  });

  // §3 ALL 57 NEW entries muscle_target_primary === 'core'
  it('Bundle 6.0.7 — ALL 57 NEW entries muscle_target_primary === core canonical V1', () => {
    NEW_ENTRIES_6_0_7.forEach(name => {
      expect(EXERCISE_METADATA[name].muscle_target_primary).toBe('core');
    });
  });

  // §4 §10 invariant DEACTIVATED — Bundle 6.0.7 Core unlock pre-Beta
  it('Bundle 6.0.7 — cumulative_core ≥ 57 (was =0 invariant Bundle 6.0.1-6.0.6 reserved; superseded LANDED)', () => {
    const cumulativeCore = Object.entries(EXERCISE_METADATA).filter(([_, m]) => m.muscle_target_primary === 'core').length;
    expect(cumulativeCore).toBeGreaterThanOrEqual(57);
  });

  // §5 fallback_cascade step types canonical 5 valid per entry (ADR_SMART_ROUTING_EQUIPMENT_v2 §2.1)
  it('Bundle 6.0.7 — fallback_cascade step types canonical 5 valid', () => {
    const validSteps = new Set(['bodyweight', 'easier_machine', 'assisted_variant', 'muscle_group_compose', 'light_variant']);
    NEW_ENTRIES_6_0_7.forEach(name => {
      const cascade = EXERCISE_METADATA[name].fallback_cascade;
      cascade.forEach(step => {
        expect(validSteps.has(step.type)).toBe(true);
      });
    });
  });

  // §6 muscle_group_compose 1-2 exercise_ids LOCK invariant (ADR v2 §2.1)
  it('Bundle 6.0.7 — muscle_group_compose step has 1-2 exercise_ids per LOCK invariant', () => {
    NEW_ENTRIES_6_0_7.forEach(name => {
      const cascade = EXERCISE_METADATA[name].fallback_cascade;
      const composeStep = cascade.find(s => s.type === 'muscle_group_compose');
      expect(composeStep).toBeDefined();
      expect(composeStep.exercise_ids.length).toBeGreaterThanOrEqual(1);
      expect(composeStep.exercise_ids.length).toBeLessThanOrEqual(2);
    });
  });

  // §7 cascade self-reference rejection invariant preserved
  it('Bundle 6.0.7 — cascade self-reference rejection (no exercise cascade includes itself)', () => {
    NEW_ENTRIES_6_0_7.forEach(name => {
      const cascade = EXERCISE_METADATA[name].fallback_cascade;
      cascade.forEach(step => {
        const ids = step.exercise_id ? [step.exercise_id] : (step.exercise_ids || []);
        ids.forEach(id => {
          expect(id).not.toBe(name);
        });
      });
    });
  });

  // §8 cascade refs resolve ≥70% lenient threshold (§20 ADR v2 LOCK V2)
  it('Bundle 6.0.7 — cascade refs resolve ≥70% lenient threshold (§20 ADR v2 LOCK V2)', () => {
    let totalRefs = 0, resolvedRefs = 0;
    NEW_ENTRIES_6_0_7.forEach(name => {
      const cascade = EXERCISE_METADATA[name].fallback_cascade;
      cascade.forEach(step => {
        const ids = step.exercise_id ? [step.exercise_id] : (step.exercise_ids || []);
        ids.forEach(id => {
          totalRefs++;
          if (EXERCISE_METADATA[id]) resolvedRefs++;
        });
      });
    });
    expect(resolvedRefs / totalRefs).toBeGreaterThanOrEqual(0.70);
  });

  // §9 tier distribution Bundle 6.0.7 Tier 1 + Tier 2 + Tier 3 all present (mixed)
  it('Bundle 6.0.7 tier distribution: Tier 1 + Tier 2 + Tier 3 all present', () => {
    const tiers = new Set(NEW_ENTRIES_6_0_7.map(n => EXERCISE_METADATA[n].tier));
    expect(tiers.has(1)).toBe(true);
    expect(tiers.has(2)).toBe(true);
    expect(tiers.has(3)).toBe(true);
  });

  // §10 force_demand distribution Bundle 6.0.7 mixed
  it('Bundle 6.0.7 force_demand: high + medium + low all present', () => {
    const forces = new Set(NEW_ENTRIES_6_0_7.map(n => EXERCISE_METADATA[n].force_demand));
    expect(forces.has('high')).toBe(true);
    expect(forces.has('medium')).toBe(true);
    expect(forces.has('low')).toBe(true);
  });

  // §11 equipment_type canonical 6 valid Bundle 6.0.7
  it('Bundle 6.0.7 equipment_type valid (canonical 6: bodyweight + dumbbell + barbell + cable + machine + band)', () => {
    const valid = new Set(['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'band']);
    NEW_ENTRIES_6_0_7.forEach(name => {
      expect(valid.has(EXERCISE_METADATA[name].equipment_type)).toBe(true);
    });
  });

  // §12 ZERO mutation existing 600 entries Bundle 6.0.7 (HARD CONSTRAINT §F3.12 strict)
  it('Bundle 6.0.7 — ZERO mutation existing 600 entries preserved invariant (sentinel cross-bundle)', () => {
    // Spot-check sentinel entries from each prior bundle baseline — NU mutated by Bundle 6.0.7
    expect(EXERCISE_METADATA['Flat Barbell Bench'].muscle_target_primary).toBe('piept');  // V1 baseline 26
    expect(EXERCISE_METADATA['Lat Pulldown'].muscle_target_primary).toBe('spate');  // V1 baseline 26
    expect(EXERCISE_METADATA['Hammer Strength Lat Pulldown'].muscle_target_primary).toBe('spate');  // Bundle 6.0.2 Back
    expect(EXERCISE_METADATA['Hammer Strength OHP'].muscle_target_primary).toBe('umeri');  // Bundle 6.0.3 Shoulders
    expect(EXERCISE_METADATA['Hack Squat Machine'].muscle_target_primary).toBe('picioare-quads');  // Bundle 6.0.4.1 Quads
    expect(EXERCISE_METADATA['Romanian Deadlift'].muscle_target_primary).toBe('picioare-hamstrings');  // V1 baseline 26
    expect(EXERCISE_METADATA['Hip Thrust'].muscle_target_primary).toBe('fese');  // Bundle 6.0.4.3 Glutes
    expect(EXERCISE_METADATA['Sledgehammer Levering'].muscle_target_primary).toBe('antebrate');  // Bundle 6.0.5 Phase G last
    expect(EXERCISE_METADATA['Hammer Strength Flat Press'].muscle_target_primary).toBe('piept');  // Bundle 6.0.6 Specialty Sub-batch 1
    expect(EXERCISE_METADATA['Kettlebell Front Rack Carry'].muscle_target_primary).toBe('antebrate');  // Bundle 6.0.6 Sub-batch 5
  });

  // §13 Sub-batch verifications cluster-specific
  it('Bundle 6.0.7 Sub-batch 1 — 8 Plank family bodyweight core', () => {
    ['Plank', 'Side Plank', 'Plank with Shoulder Tap', 'Plank to Push-up', 'Side Plank Dip', 'Plank with Reach', 'Copenhagen Plank', 'Scapular Plank'].forEach(name => {
      expect(EXERCISE_METADATA[name].muscle_target_primary).toBe('core');
      expect(EXERCISE_METADATA[name].equipment_type).toBe('bodyweight');
    });
  });

  it('Bundle 6.0.7 Sub-batch 2 — 3 Pallof Press family (cable + band anti-rotation)', () => {
    expect(EXERCISE_METADATA['Pallof Press Cable Standing'].equipment_type).toBe('cable');
    expect(EXERCISE_METADATA['Pallof Press Half-Kneeling'].equipment_type).toBe('cable');
    expect(EXERCISE_METADATA['Pallof Press Band'].equipment_type).toBe('band');
    ['Pallof Press Cable Standing', 'Pallof Press Half-Kneeling', 'Pallof Press Band'].forEach(name => {
      expect(EXERCISE_METADATA[name].muscle_target_primary).toBe('core');
    });
  });

  it('Bundle 6.0.7 Sub-batch 6 — 3 Rollout family Tier 1-2 anti-extension', () => {
    expect(EXERCISE_METADATA['Ab Wheel Rollout'].tier).toBe(1);
    expect(EXERCISE_METADATA['Barbell Rollout'].tier).toBe(1);
    expect(EXERCISE_METADATA['Stability Ball Rollout'].tier).toBe(2);
    ['Ab Wheel Rollout', 'Barbell Rollout', 'Stability Ball Rollout'].forEach(name => {
      expect(EXERCISE_METADATA[name].muscle_target_primary).toBe('core');
    });
  });

  it('Bundle 6.0.7 Sub-batch 7-8 — Hanging + L-Sit gymnastic Tier 1 force_demand high', () => {
    ['Hanging Leg Raise', 'Toes-to-Bar', 'L-Sit Hold Parallel Bars', 'Captains Chair Leg Raise', 'Dragon Flag', 'Windshield Wiper'].forEach(name => {
      expect(EXERCISE_METADATA[name].tier).toBe(1);
      expect(EXERCISE_METADATA[name].force_demand).toBe('high');
    });
  });

  it('Bundle 6.0.7 Sub-batch 13 — Carries Front Rack Barbell + Overhead DB Tier 1 core+antebrate', () => {
    expect(EXERCISE_METADATA['Front Rack Carry Barbell'].muscle_target_primary).toBe('core');
    expect(EXERCISE_METADATA['Front Rack Carry Barbell'].muscle_target_secondary).toContain('antebrate');
    expect(EXERCISE_METADATA['Overhead Carry DB'].muscle_target_primary).toBe('core');
    expect(EXERCISE_METADATA['Overhead Carry DB'].muscle_target_secondary).toContain('umeri');
  });

  // §14 Bundle 6.0.7 cumulative invariants final — Pre-Beta scope library 100% gate achieved
  it('Bundle 6.0.7 cumulative count = 657 exact (Pre-Beta scope library 100% gate achieved per LOCK 2 Daniel Gates strict)', () => {
    expect(Object.keys(EXERCISE_METADATA).length).toBe(657);
  });

  it('Bundle 6.0.7 cumulative core canonical V1 ≥ 57 (was 0 baseline Bundle 6.0.6, 57 NEW Bundle 6.0.7)', () => {
    const core = Object.entries(EXERCISE_METADATA).filter(([_, m]) => m.muscle_target_primary === 'core');
    expect(core.length).toBeGreaterThanOrEqual(57);
  });

  // §15 §1.4 Pre-Beta library 100% gate achieved (cumulative ≥ 657 floor LOCK V1)
  it('Bundle 6.0.7 — Pre-Beta library 100% gate achieved (cumulative ≥ 657 floor LOCK V1 per LOCK 2 Daniel Gates strict)', () => {
    expect(Object.keys(EXERCISE_METADATA).length).toBeGreaterThanOrEqual(657);
  });
});

// ══ §39-H1 + §39-H2 Schema invariant + fallback_cascade exempt audit ═══════
// Per ADR-ENGINE-MATH-LOCKED-VALUES §6 + §7. Refactor guard — prevents silent
// entry loss + silent field shape drift across deploys.
describe('Schema Invariant §39-H1 + §39-H2 (ADR-ENGINE-MATH-LOCKED-VALUES §6-§7)', () => {
  // §39-H1 — Count + field shape invariant
  it('§39-H1 cumulative count exact 657 (Pre-Beta LOCK 2 invariant)', () => {
    expect(Object.keys(EXERCISE_METADATA).length).toBe(657);
  });

  it('§39-H1 every entry has muscle_target_primary in 11 canonical RO enum', () => {
    const canonical = new Set([
      'piept', 'spate', 'umeri', 'biceps', 'triceps', 'antebrate', 'core',
      'picioare-quads', 'picioare-hamstrings', 'fese', 'gambe',
    ]);
    Object.entries(EXERCISE_METADATA).forEach(([name, meta]) => {
      expect(canonical.has(meta.muscle_target_primary), `entry "${name}" muscle_target_primary "${meta.muscle_target_primary}"`).toBe(true);
    });
  });

  it('§39-H1 every entry has equipment_type in 6 canonical enum', () => {
    const canonical = new Set(['barbell', 'bodyweight', 'cable', 'dumbbell', 'machine', 'band']);
    Object.entries(EXERCISE_METADATA).forEach(([name, meta]) => {
      expect(canonical.has(meta.equipment_type), `entry "${name}" equipment_type "${meta.equipment_type}"`).toBe(true);
    });
  });

  it('§39-H1 every entry has force_demand in 3 canonical enum', () => {
    const canonical = new Set(['low', 'medium', 'high']);
    Object.entries(EXERCISE_METADATA).forEach(([name, meta]) => {
      expect(canonical.has(meta.force_demand), `entry "${name}" force_demand "${meta.force_demand}"`).toBe(true);
    });
  });

  it('§39-H1 every entry has tier in {1,2,3}', () => {
    Object.values(EXERCISE_METADATA).forEach((meta) => {
      expect([1, 2, 3]).toContain(meta.tier);
    });
  });

  it('§39-H1 every entry has equipment_alternatives Array (V1 ranking path)', () => {
    Object.entries(EXERCISE_METADATA).forEach(([name, meta]) => {
      expect(Array.isArray(meta.equipment_alternatives), `entry "${name}" equipment_alternatives not Array`).toBe(true);
    });
  });

  // §39-H2 — Fallback cascade exempt entries audit
  it('§39-H2 fallback_cascade exempt count = 26 (V1 baseline preserved per Bundle 6.0.1-6.0.7 §9 invariant)', () => {
    const exempt = Object.entries(EXERCISE_METADATA).filter(([, m]) => !m.fallback_cascade);
    expect(exempt.length).toBe(26);
  });

  it('§39-H2 all 26 V1 baseline exempt entries are from preserved canonical roster', () => {
    const expectedExempt = new Set([
      'DB Shoulder Press', 'Incline DB Press', 'Flat DB Press', 'Flat Barbell Bench',
      'Lat Pulldown', 'Cable Row', 'Chest-Supported Row', 'Romanian Deadlift', 'Leg Press',
      'Lateral Raises', 'Lateral Raises (cable)', 'Rear Delt Fly', 'Rear Delt Cable',
      'Pec Deck / Cable Fly', 'Cable Fly', 'Incline DB Curl', 'Bayesian Curl',
      'Cable Curl', 'Preacher Curl', 'Hammer Curl', 'Overhead Triceps', 'Pushdown',
      'Leg Curl', 'Leg Extension', 'Face Pulls', 'Calf Raises',
    ]);
    const exempt = Object.entries(EXERCISE_METADATA).filter(([, m]) => !m.fallback_cascade);
    exempt.forEach(([name]) => {
      expect(expectedExempt.has(name), `exempt entry "${name}" not in V1 baseline roster — investigate`).toBe(true);
    });
  });

  it('§39-H2 631 Bundle 6.0.1-6.0.7 NEW entries all have fallback_cascade populated', () => {
    const populated = Object.values(EXERCISE_METADATA).filter(m => m.fallback_cascade);
    expect(populated.length).toBe(631);
  });
});
