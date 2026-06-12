// ══ Wave 1.3 — FOCUS_RULES per-focus pattern-policy table (DATA, UNWIRED) ════════
// Proves the data contract the LATER constraint resolver depends on: the table is
// frozen + deeply immutable, keyed by the EXACT live focus ids (FOCUS_PRESETS), and
// every WeeklyFocusTarget carries the full shape (targetByDays/clusters/tags/
// priority/relaxable) with sane numbers. The table must NOT be wired into compose
// this step — there is no buildSession/compose behavior to assert here.

import { describe, it, expect } from 'vitest';
import { FOCUS_RULES, FOCUS_RULE_IDS } from '../focusPolicy.js';
import { FOCUS_PRESET_IDS } from '../schedule/scheduleAdapter/focus.js';

const VALID_PRIORITIES = ['high', 'medium', 'low'];

describe('FOCUS_RULES — table shape + immutability', () => {
  it('is frozen at every level (table, each rule, nested objects)', () => {
    expect(Object.isFrozen(FOCUS_RULES)).toBe(true);
    for (const id of FOCUS_RULE_IDS) {
      const rule = FOCUS_RULES[id];
      expect(Object.isFrozen(rule)).toBe(true);
      if (rule.sessionCaps) expect(Object.isFrozen(rule.sessionCaps)).toBe(true);
      if (rule.sessionRequirements) expect(Object.isFrozen(rule.sessionRequirements)).toBe(true);
      if (rule.frequencyCap) expect(Object.isFrozen(rule.frequencyCap)).toBe(true);
      if (rule.weeklyMinimums) {
        expect(Object.isFrozen(rule.weeklyMinimums)).toBe(true);
        for (const wm of rule.weeklyMinimums) {
          expect(Object.isFrozen(wm)).toBe(true);
          expect(Object.isFrozen(wm.targetByDays)).toBe(true);
          expect(Object.isFrozen(wm.applicableClusters)).toBe(true);
          expect(Object.isFrozen(wm.matchingTags)).toBe(true);
        }
      }
    }
  });

  it('keys EXACTLY match the live focus preset ids (minus the lose_fat goal)', () => {
    // lose_fat is a GOAL, not a focus preset — FOCUS_PRESETS has no such key, so
    // the policy table mirrors FOCUS_PRESET_IDS one-for-one.
    expect([...FOCUS_RULE_IDS].sort()).toEqual([...FOCUS_PRESET_IDS].sort());
    // The 8 live looks are all present (catches a typo'd / dropped key).
    for (const id of ['balanced', 'v-taper', 'arms', 'chest', 'shoulders', 'back', 'lower', 'upper']) {
      expect(FOCUS_RULES[id]).toBeDefined();
      expect(FOCUS_RULES[id].id).toBe(id);
    }
  });

  it('balanced is minimal: no caps, ONE universal requirement + ONE contract minimum', () => {
    // Daniel focus-sweep review 2026-06-11: a chest-capable day (push/upper/chest)
    // of ANY focus must anchor a chest press — balanced included (the sweep's
    // balanced 4d Upper composed Close-Grip (triceps-primary) + a light fly only).
    // Focus-contracts arc 2026-06-12: balanced also carries ONE `_contract` weekly
    // minimum (a side-delt slot) so the delivered shoulders reach the ≥6/wk balance
    // promise — gated off when dp_focus_contracts_v1 is off (the resolver skips
    // `_contract` minimums). No caps; the resolver stays inert on pull/leg/full days.
    const b = FOCUS_RULES.balanced;
    expect(Object.keys(b.sessionCaps ?? {})).toHaveLength(0);
    expect(Object.keys(b.sessionRequirements ?? {})).toEqual(['minChestPressSlots']);
    expect(b.sessionRequirements.minChestPressSlots).toBe(1);
    expect(b.weeklyMinimums ?? []).toHaveLength(1);
    expect(b.weeklyMinimums[0].key).toBe('side_delt_slots');
    expect(b.weeklyMinimums[0]._contract).toBe(true);
  });
});

describe('FOCUS_RULES — WeeklyFocusTarget shape + sane numbers', () => {
  it('every weekly minimum carries the full shape', () => {
    for (const id of FOCUS_RULE_IDS) {
      for (const wm of FOCUS_RULES[id].weeklyMinimums ?? []) {
        expect(typeof wm.key).toBe('string');
        expect(wm.key.length).toBeGreaterThan(0);
        // targetByDays — three numeric bands, non-negative, non-decreasing
        // (more training days → never fewer required slots).
        for (const band of ['days1to2', 'days3to4', 'days5plus']) {
          expect(typeof wm.targetByDays[band]).toBe('number');
          expect(wm.targetByDays[band]).toBeGreaterThanOrEqual(0);
        }
        expect(wm.targetByDays.days3to4).toBeGreaterThanOrEqual(wm.targetByDays.days1to2);
        expect(wm.targetByDays.days5plus).toBeGreaterThanOrEqual(wm.targetByDays.days3to4);
        // clusters + tags non-empty arrays
        expect(Array.isArray(wm.applicableClusters)).toBe(true);
        expect(wm.applicableClusters.length).toBeGreaterThan(0);
        expect(Array.isArray(wm.matchingTags)).toBe(true);
        expect(wm.matchingTags.length).toBeGreaterThan(0);
        // priority + relaxable
        expect(VALID_PRIORITIES).toContain(wm.priority);
        expect(typeof wm.relaxable).toBe('boolean');
      }
    }
  });

  it('frequencyCap (when present) is non-decreasing across day-bands and positive', () => {
    for (const id of FOCUS_RULE_IDS) {
      const fc = FOCUS_RULES[id].frequencyCap;
      if (!fc) continue;
      for (const band of ['days1to2', 'days3to4', 'days5plus']) {
        expect(fc[band]).toBeGreaterThan(0);
      }
      expect(fc.days3to4).toBeGreaterThanOrEqual(fc.days1to2);
      expect(fc.days5plus).toBeGreaterThanOrEqual(fc.days3to4);
    }
  });

  it('a session cap is >= the comparable per-session requirement (cap cannot bind below the floor)', () => {
    for (const id of FOCUS_RULE_IDS) {
      const caps = FOCUS_RULES[id].sessionCaps ?? {};
      const reqs = FOCUS_RULES[id].sessionRequirements ?? {};
      // vertical-press cap must allow the side/rear-delt floor's sibling press; the
      // only directly-comparable pair is total presses vs vertical press min — none
      // of the focuses set a min-vertical-press, so assert the one real overlap:
      // maxVerticalPulls >= minVerticalPullSlots, maxHorizontalRows >= minHorizontalRowSlots.
      if (caps.maxVerticalPulls != null && reqs.minVerticalPullSlots != null) {
        expect(caps.maxVerticalPulls).toBeGreaterThanOrEqual(reqs.minVerticalPullSlots);
      }
      if (caps.maxHorizontalRows != null && reqs.minHorizontalRowSlots != null) {
        expect(caps.maxHorizontalRows).toBeGreaterThanOrEqual(reqs.minHorizontalRowSlots);
      }
      // all numeric caps + requirements are non-negative integers
      for (const v of [...Object.values(caps), ...Object.values(reqs)]) {
        if (typeof v === 'number') {
          expect(Number.isInteger(v)).toBe(true);
          expect(v).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });
});
