// ══ TDEE STRIP (RN port) — "Target Today" combined hero ══════════════════
// RN twin of src/react/components/Progres/TDEEStrip.tsx. The full engine wiring
// (getNutritionTargetTodayReal async, readBayesianNutritionContext, guardDisplay
// Target, resolveActivePhase, aerobic info, current-vs-target comparison) +
// editable kcal/protein day-log handlers are KEPT verbatim. Two web-only bits
// adapt:
//   1. The phase badge read localStorage('phase-override') via JSON.parse; that
//      key now lives behind the kv-backed DB shim. We read it via DB.get (RN-safe,
//      same value the web wrote) instead of touching localStorage directly.
//   2. The recompute-on-return used window 'focus' + document 'visibilitychange'
//      (DOM-only). RN replaces both with expo-router's useFocusEffect → bumps the
//      same recomputeNonce when the screen regains focus.
// Markup → View/Text/Pressable/TextInput + Pencil/Check/AlertCircle icons. Same
// testIDs + i18n keys + the editable-chip save semantics.

import { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { AlertCircle, Pencil, Check } from 'lucide-react-native';
import { Pill } from '../pulse/Pill';
import { Kicker } from '../pulse/Kicker';
import { getNutritionTargetTodayReal } from '../../../src/react/lib/bayesianNutritionAggregate';
import type { NutritionTarget } from '../../../src/react/lib/bayesianNutritionAggregate';
import { readBayesianNutritionContext } from '../../../src/react/lib/nutritionObservations';
import { guardDisplayTarget } from '../../../src/react/lib/displayTargetGuard';
import { resolveActivePhase } from '../../../src/react/lib/engineWrappers';
import { readUserMaintenanceTDEE } from '../../../src/react/lib/userTdee';
import { useProgresStore } from '../../../src/react/stores/progresStore';
import { useWorkoutStore } from '../../../src/react/stores/workoutStore';
import { useNutritionStore } from '../../../src/react/stores/nutritionStore';
import { useAerobicStore, aerobicKcalForDate } from '../../../src/react/stores/aerobicStore';
import { DB } from '../../../src/db.js';
import { dark } from '../../lib/tokens';
import { t } from '../../../src/i18n/index.js';

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function sourceLabel(source: NutritionTarget['source']): string {
  if (source === 'manual') return t('progres.tdee.sources.manual');
  if (source === 'engine-bn') return t('progres.tdee.sources.engineBn');
  return t('progres.tdee.sources.baseline');
}

const PHASE_KEY_MAP = {
  AUTO: 'progres.tdee.phases.auto',
  CUT: 'progres.tdee.phases.cut',
  BULK: 'progres.tdee.phases.bulk',
  MAINTENANCE: 'progres.tdee.phases.maintenance',
  STRENGTH: 'progres.tdee.phases.strength',
} as const;

const MESOCYCLE_WEEKS = 4;

function fmtNum(n: number): string {
  return n.toLocaleString('ro-RO').replace(/,/g, ' ');
}

// RESOLVED phase label for the badge. Reads the RAW phase-override (via the
// kv-backed DB shim — same value the web wrote to localStorage); an AUTO/absent
// pick short-circuits to Auto; only an explicit non-AUTO pick falls through to
// resolveActivePhase.
function getCurrentPhaseLabel(): string {
  try {
    const stored = DB.get('phase-override');
    const rawOverride = (typeof stored === 'string' ? stored : null) as string | null;
    if (!rawOverride || rawOverride === 'AUTO') return t(PHASE_KEY_MAP.AUTO);
    const phase = resolveActivePhase();
    if (!phase) return t(PHASE_KEY_MAP.AUTO);
    const key = (PHASE_KEY_MAP as Record<string, string>)[phase];
    return key ? t(key) : t(PHASE_KEY_MAP.AUTO);
  } catch {
    return t(PHASE_KEY_MAP.AUTO);
  }
}

function computeWeekInMesocycle(sessionsCount: number, freqPerWeek: number): number {
  if (sessionsCount <= 0 || freqPerWeek <= 0) return 1;
  const weeksElapsed = Math.floor(sessionsCount / freqPerWeek);
  return (weeksElapsed % MESOCYCLE_WEEKS) + 1;
}

export function TDEEStrip(): React.JSX.Element {
  const dateISO = todayIso();
  const [target, setTarget] = useState<NutritionTarget | null>(null);
  const sessionsHistory = useWorkoutStore((s) => s.sessionsHistory);
  const entry = useNutritionStore((s) => s.getDaily(dateISO));
  const setDailyKcal = useNutritionStore((s) => s.setDailyKcal);
  const setDailyProtein = useNutritionStore((s) => s.setDailyProtein);
  const loggedKcal = entry?.kcal ?? null;

  const targetObiectiv = useProgresStore((s) => s.targetObiectiv);
  const weightLog = useProgresStore((s) => s.weightLog);
  const phaseLabel = getCurrentPhaseLabel();
  const weekInMeso = useMemo(
    () => computeWeekInMesocycle(sessionsHistory.length, 3),
    [sessionsHistory.length],
  );

  // ── Edit state (kcal + protein, current day only) ──────────────────────
  const [kcalEdit, setKcalEdit] = useState(false);
  const [proteinEdit, setProteinEdit] = useState(false);
  const [kcalDraft, setKcalDraft] = useState('');
  const [proteinDraft, setProteinDraft] = useState('');

  // Recompute trigger for the kv-backed off-screen inputs (phase-override,
  // bf-override) the target depends on. The web bumped on window focus +
  // visibilitychange; RN bumps on screen focus via useFocusEffect.
  const [recomputeNonce, setRecomputeNonce] = useState(0);
  useFocusEffect(
    useCallback(() => {
      setRecomputeNonce((n) => n + 1);
    }, []),
  );

  useEffect(() => {
    let cancelled = false;
    const ctx = readBayesianNutritionContext();
    getNutritionTargetTodayReal(dateISO, ctx).then((tg) => {
      if (!cancelled) setTarget(tg);
    });
    return () => {
      cancelled = true;
    };
  }, [
    dateISO,
    entry?.kcal,
    entry?.protein,
    targetObiectiv.weightKg,
    targetObiectiv.month,
    weightLog,
    recomputeNonce,
  ]);

  // ── STABLE hero = the goal-based recommended intake (floored). ──────────
  const maintenanceKcal = readUserMaintenanceTDEE();
  const baseAutoKcal = target?.kcalTarget ?? null;
  const displayAutoKcal =
    target && baseAutoKcal != null
      ? guardDisplayTarget(baseAutoKcal, baseAutoKcal, maintenanceKcal).kcal
      : null;

  // ── Aerobic-class kcal → today's activity INFO line ──────────────────────
  const aerobicSessions = useAerobicStore((s) => s.sessions);
  const aerobicKcalToday = aerobicKcalForDate(aerobicSessions, dateISO);
  const aerobicInfo =
    target != null && target.source !== 'manual' && aerobicKcalToday > 0 ? aerobicKcalToday : 0;

  // Current-vs-target comparison.
  const comparisonBase = displayAutoKcal;
  const showComparison =
    loggedKcal != null && target != null && target.source !== 'manual' && comparisonBase != null;
  const kcalDelta = showComparison ? (loggedKcal as number) - (comparisonBase as number) : 0;
  const deltaLabel = kcalDelta >= 0 ? `+${fmtNum(kcalDelta)}` : `-${fmtNum(Math.abs(kcalDelta))}`;

  const displayKcalChip = loggedKcal ?? displayAutoKcal ?? null;
  const displayProteinChip = entry?.protein ?? target?.proteinTarget ?? null;
  const kcalIsManual = entry?.kcal != null;
  const proteinIsManual = entry?.protein != null;
  const hasLoggedToday = kcalIsManual || proteinIsManual;

  function startKcalEdit(): void {
    setKcalDraft(displayKcalChip != null ? String(displayKcalChip) : '');
    setKcalEdit(true);
  }
  function startProteinEdit(): void {
    setProteinDraft(displayProteinChip != null ? String(displayProteinChip) : '');
    setProteinEdit(true);
  }
  function saveKcal(): void {
    const n = Number(kcalDraft);
    if (Number.isFinite(n) && n >= 0 && n <= 9999) setDailyKcal(dateISO, n);
    setKcalEdit(false);
  }
  function saveProtein(): void {
    const n = Number(proteinDraft);
    if (Number.isFinite(n) && n >= 0 && n <= 500) setDailyProtein(dateISO, n);
    setProteinEdit(false);
  }
  function saveBoth(): void {
    if (kcalEdit) saveKcal();
    if (proteinEdit) saveProtein();
  }
  const anyEdit = kcalEdit || proteinEdit;

  return (
    <View
      testID="tdee-strip"
      className="bg-paper-2 border border-line p-5 mb-4"
      style={{ borderRadius: 22, overflow: 'hidden' }}
      accessibilityLabel={t('progres.tdee.ariaLabel')}
    >
      <View
        testID="tdee-faza-row"
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}
      >
        <View testID="tdee-faza-badge">
          <Pill color={dark.emberInk}>{t('progres.tdee.phaseLabel', { phase: phaseLabel })}</Pill>
        </View>
        <Text testID="tdee-mesocycle-week" className="text-ink2" style={{ fontSize: 12 }}>
          {t('progres.tdee.weekInMeso', { n: weekInMeso })}
        </Text>
      </View>

      {/* Full-width HERO target (stable goal-based recommended intake). */}
      <View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Kicker color={dark.aquaInk}>
            {showComparison ? t('progres.tdee.todayVsTarget') : t('progres.tdee.targetToday')}
          </Kicker>
          <Pressable
            onPress={startKcalEdit}
            accessibilityRole="button"
            accessibilityLabel={t('progres.tdee.editKcalAriaLabel')}
            testID="nutri-kcal-edit"
            disabled={kcalEdit}
            style={{ padding: 4 }}
          >
            <Pencil size={14} color={dark.ink2} />
          </Pressable>
        </View>

        {kcalEdit ? (
          <TextInput
            value={kcalDraft}
            onChangeText={setKcalDraft}
            keyboardType="numeric"
            accessibilityLabel={t('progres.tdee.kcalInputAriaLabel')}
            testID="nutri-kcal-input"
            className="font-mono text-ink"
            style={{
              padding: 8,
              borderWidth: 1,
              borderColor: dark.lineStrong,
              borderRadius: 14,
              fontSize: 24,
              color: dark.ink,
            }}
          />
        ) : showComparison ? (
          <View testID="tdee-current-vs-target">
            <Text testID="nutri-kcal-val" className="font-bold text-ink font-mono" style={{ fontSize: 54, lineHeight: 56 }}>
              {fmtNum(loggedKcal ?? 0)}
              <Text className="font-semibold text-ink2" style={{ fontSize: 18 }}> kcal</Text>
            </Text>
            <Text className="text-ink2" style={{ fontSize: 14, marginTop: 6 }}>
              {t('progres.tdee.withTarget', { kcal: fmtNum(comparisonBase as number), delta: deltaLabel })}
            </Text>
          </View>
        ) : (
          <Text testID="nutri-kcal-val" className="font-bold text-ink font-mono" style={{ fontSize: 54, lineHeight: 56 }}>
            {displayKcalChip != null ? fmtNum(displayKcalChip) : '—'}
            <Text className="font-semibold text-ink2" style={{ fontSize: 18 }}> kcal</Text>
          </Text>
        )}

        {/* Protein — editable, quiet secondary context. */}
        <View
          testID="nutri-protein-chip"
          style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginTop: 12 }}
        >
          {proteinEdit ? (
            <TextInput
              value={proteinDraft}
              onChangeText={setProteinDraft}
              keyboardType="numeric"
              accessibilityLabel={t('progres.tdee.proteinInputAriaLabel')}
              testID="nutri-protein-input"
              className="font-mono text-ink"
              style={{
                width: 96,
                padding: 6,
                borderWidth: 1,
                borderColor: dark.lineStrong,
                borderRadius: 8,
                fontSize: 14,
                color: dark.ink,
              }}
            />
          ) : (
            <Text testID="nutri-protein-val" className="font-semibold text-ink" style={{ fontSize: 14 }}>
              {displayProteinChip != null
                ? t('progres.tdee.withProtein', { g: fmtNum(displayProteinChip) })
                : `· ${t('progres.tdee.proteinLabel')}`}
            </Text>
          )}
          <Pressable
            onPress={startProteinEdit}
            accessibilityRole="button"
            accessibilityLabel={t('progres.tdee.editProteinAriaLabel')}
            testID="nutri-protein-edit"
            disabled={proteinEdit}
            style={{ padding: 4 }}
          >
            <Pencil size={12} color={dark.ink2} />
          </Pressable>
          {target && (
            <Text testID="tdee-source" className="text-ink3" style={{ fontSize: 12 }}>
              {kcalIsManual ? sourceLabel('manual') : sourceLabel(target.source)}
            </Text>
          )}
        </View>

        {anyEdit && (
          <Pressable
            onPress={saveBoth}
            testID="nutri-save"
            className="bg-brick"
            style={({ pressed }) => ({
              marginTop: 12,
              minHeight: 44,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              alignSelf: 'flex-start',
              opacity: pressed ? 0.85 : 1,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            })}
          >
            <Check size={16} color={dark.onAccent} />
            <Text className="font-semibold" style={{ fontSize: 14, color: dark.onAccent }}>
              {t('progres.tdee.saveCta')}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Explainer under the hero. */}
      <Text testID="tdee-explainer" className="text-ink3" style={{ fontSize: 12, marginTop: 12, lineHeight: 16 }}>
        {t('progres.tdee.explainer')}
      </Text>

      {aerobicInfo > 0 && (
        <Text testID="tdee-aerobic-info" style={{ fontSize: 12, marginTop: 8, lineHeight: 16, color: dark.aquaInk }}>
          {t('progres.tdee.aerobicInfo', { kcal: fmtNum(aerobicInfo) })}
        </Text>
      )}

      {!hasLoggedToday && (
        <Text testID="tdee-log-cta" style={{ fontSize: 12, marginTop: 12, lineHeight: 16, color: dark.aquaInk }}>
          {t('progres.tdee.logCta')}
        </Text>
      )}

      {hasLoggedToday && (
        <Text testID="tdee-logged-note" style={{ fontSize: 12, marginTop: 12, lineHeight: 16, color: dark.aquaInk }}>
          {t('progres.tdee.loggedNote')}
        </Text>
      )}

      {target?.healthyFloorClamped && (
        <View
          testID="tdee-healthy-floor-msg"
          accessibilityRole="text"
          style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 10 }}
        >
          <AlertCircle size={14} color={dark.brick} style={{ marginTop: 2 }} />
          <Text className="text-brick" style={{ fontSize: 12, lineHeight: 16, flex: 1 }}>
            {t('tdeeStrip.healthyFloorMsg')}
          </Text>
        </View>
      )}

      {!kcalIsManual && target?.safetyLimited && (
        <Text testID="tdee-safety-limit-note" className="text-ink2" style={{ fontSize: 12, marginTop: 8, lineHeight: 16 }}>
          {target.safetyLimited === 'floored'
            ? t('progres.tdee.safetyFloorNote')
            : t('progres.tdee.safetyCapNote')}
        </Text>
      )}
    </View>
  );
}
