// ══ ISTORIC DETAIL (RN port) — session detail by id ════════════════════════
// RN twin of src/react/routes/screens/istoric/IstoricDetail.tsx. Dynamic route
// `/app/istoric/<sessionId>` where sessionId is the ORIGINAL index into
// sessionsHistory (the list passes originalIdx). Renders: session header (date +
// title + meta) + sets/duration/volume stat trio + per-exercise breakdown table
// (when persisted) or a legacy fallback line + a two-tap inline delete confirm.
// Store reads/writes (useWorkoutStore / deleteSession) + pluralRo are imported
// UNCHANGED from the web lib. Param read via expo-router useLocalSearchParams
// (web used useParams). testIDs preserved 1:1.
//
// §F-istoric-08 — Romanian no-diacritics weekday/month via the i18n bundle,
// cross-screen consistency with the Istoric list.

import { useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, History, Trash2 } from 'lucide-react-native';
import { useWorkoutStore } from '../../../../src/react/stores/workoutStore';
import { pluralRo } from '../../../../src/react/lib/pluralRo';
import { Kicker } from '../../../components/pulse/Kicker';
import { dark, accent } from '../../../lib/tokens';
import { t, getCurrentLocale } from '../../../../src/i18n/index.js';

function formatDate(ts: number): string {
  if (!Number.isFinite(ts)) return '—';
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return '—';
  const weekday = t(`weekdays.relativeShort.${d.getDay()}`);
  const day = d.getDate();
  const month = t(`months.short.${d.getMonth()}`);
  return `${weekday} · ${day} ${month}`;
}

function formatSetsLabel(n: number): string {
  if (getCurrentLocale() === 'ro') return pluralRo(n, 'set', 'seturi');
  return n === 1
    ? t('istoric.detail.exerciseSets_one', { n })
    : t('istoric.detail.exerciseSets_other', { n });
}

function ratingLabel(rating: string): string {
  if (rating === 'usor' || rating === 'potrivit' || rating === 'greu') {
    return t(`istoric.detail.ratingLabels.${rating}`);
  }
  return rating;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

// RO thousands separator (space) — mirror PostSummary formatKg.
function formatKg(kg: number): string {
  return kg.toLocaleString('ro-RO').replace(/\./g, ' ').replace(/,/g, '.');
}

export default function IstoricDetail() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const sessionsHistory = useWorkoutStore((s) => s.sessionsHistory);
  const deleteSession = useWorkoutStore((s) => s.deleteSession);

  const [confirmDelete, setConfirmDelete] = useState(false);

  const idx = sessionId !== undefined ? Number(sessionId) : -1;
  const session =
    Number.isFinite(idx) && idx >= 0 && idx < sessionsHistory.length
      ? sessionsHistory[idx]
      : null;

  function handleBack(): void {
    router.replace('/app/istoric');
  }

  function handleDelete(): void {
    if (session) deleteSession(session.ts);
    router.replace('/app/istoric');
  }

  if (!session) {
    return (
      <View
        testID="istoric-detail-missing"
        style={{ flex: 1, backgroundColor: dark.paper, padding: 24, alignItems: 'center', justifyContent: 'center' }}
      >
        <Text style={{ fontSize: 16, color: dark.ink2, marginBottom: 16, textAlign: 'center' }}>
          {t('istoric.detail.missing')}
        </Text>
        <Pressable
          testID="istoric-detail-back-missing"
          accessibilityRole="button"
          onPress={handleBack}
          style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: dark.brick, borderRadius: 14 }}
        >
          <Text style={{ fontSize: 14, fontWeight: '600', color: dark.onAccent }}>
            {t('istoric.detail.backToHistory')}
          </Text>
        </Pressable>
      </View>
    );
  }

  const hasStats =
    session.sets !== undefined || session.durationMin !== undefined || session.volumeKg !== undefined;

  return (
    <ScrollView
      testID="istoric-detail"
      style={{ flex: 1, backgroundColor: dark.paper }}
      contentContainerStyle={{ padding: 24 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Pressable
          testID="istoric-detail-back"
          accessibilityRole="button"
          accessibilityLabel={t('istoric.detail.backAria')}
          onPress={handleBack}
          style={{ padding: 8, marginLeft: -8 }}
        >
          <ArrowLeft size={20} color={dark.ink2} />
        </Pressable>
        <Text className="font-display" style={{ fontSize: 24, fontWeight: '700', color: dark.ink, flexShrink: 1 }}>
          {session.title}
        </Text>
      </View>

      <Animated.View
        entering={FadeInUp.duration(440)}
        style={{
          backgroundColor: dark.paper2,
          borderWidth: 1,
          borderColor: dark.line,
          borderRadius: 22,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <History size={16} color={accent.aqua} />
          <Kicker color={accent.aqua}>{t('istoric.detail.sessionKicker')}</Kicker>
        </View>
        <Text testID="istoric-detail-date" style={{ fontSize: 16, color: dark.ink }}>
          {formatDate(session.ts)} · {formatTime(session.ts)}
        </Text>
        <Text testID="istoric-detail-meta" style={{ fontSize: 14, color: dark.ink2, marginTop: 8 }}>
          {session.meta}
        </Text>
      </Animated.View>

      {hasStats && (
        <Animated.View entering={FadeInUp.duration(440).delay(80)} testID="istoric-detail-stats-grid" style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          {session.sets !== undefined && (
            <DetailStat testId="detail-sets" label={t('istoric.detail.stats.sets')} value={String(session.sets)} />
          )}
          {session.durationMin !== undefined && (
            <DetailStat testId="detail-duration" label={t('istoric.detail.stats.minutes')} value={String(session.durationMin)} />
          )}
          {session.volumeKg !== undefined && (
            <DetailStat testId="detail-volume" label={t('istoric.detail.stats.tonnage')} value={formatKg(session.volumeKg)} />
          )}
        </Animated.View>
      )}

      {session.exercises && session.exercises.length > 0 ? (
        <View testID="istoric-detail-breakdown">
          <View style={{ marginBottom: 10 }}>
            <Kicker>{t('istoric.detail.exercisesHeading')}</Kicker>
          </View>
          {session.exercises.map((ex) => (
            <View
              key={ex.exerciseId}
              testID={`detail-ex-${ex.exerciseId}`}
              style={{
                backgroundColor: dark.paper2,
                borderWidth: 1,
                borderColor: dark.line,
                borderRadius: 22,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: dark.ink, flexShrink: 1 }}>{ex.exerciseName}</Text>
                <Text testID="detail-ex-1rm" className="font-mono" style={{ fontSize: 12, color: dark.ink2 }}>
                  {t('istoric.detail.exerciseOneRm', { kg: formatKg(ex.peakOneRM) })}
                </Text>
              </View>
              <Text testID="detail-ex-volume" style={{ fontSize: 12, color: dark.ink2, marginBottom: 8 }}>
                {t('istoric.detail.exerciseVolumeSets', {
                  kg: formatKg(ex.totalVolume),
                  setsLabel: formatSetsLabel(ex.sets.length),
                })}
              </Text>
              {/* Sets table — header row + one row per set. */}
              <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: dark.line, paddingBottom: 4 }}>
                <Text style={tableHead}>{t('istoric.detail.table.set')}</Text>
                <Text style={tableHead}>{t('istoric.detail.table.kg')}</Text>
                <Text style={tableHead}>{t('istoric.detail.table.reps')}</Text>
                <Text style={tableHead}>{t('istoric.detail.table.rating')}</Text>
              </View>
              {ex.sets.map((s, setIdx) => (
                <View
                  key={setIdx}
                  testID={`detail-set-${ex.exerciseId}-${setIdx}`}
                  style={{ flexDirection: 'row', paddingVertical: 4 }}
                >
                  <Text style={[tableCell, s.isPR ? prCell : { color: dark.ink }]}>
                    {setIdx + 1}{s.isPR ? ' PR' : ''}
                  </Text>
                  <Text style={[tableCell, s.isPR ? prCell : { color: dark.ink }]}>{s.kg}</Text>
                  <Text style={[tableCell, s.isPR ? prCell : { color: dark.ink }]}>{s.reps}</Text>
                  <Text style={[tableCell, s.isPR ? prCell : { color: dark.ink }]}>{ratingLabel(s.rating)}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      ) : (
        <Text testID="istoric-detail-legacy" style={{ fontSize: 12, color: dark.ink2, fontStyle: 'italic', textAlign: 'center' }}>
          {t('istoric.detail.legacyFallback')}
        </Text>
      )}

      {/* Delete — two-tap inline confirm. */}
      <View testID="istoric-detail-delete" style={{ marginTop: 32 }}>
        {confirmDelete ? (
          <View
            style={{
              backgroundColor: dark.paper2,
              borderWidth: 1,
              borderColor: dark.line,
              borderRadius: 22,
              padding: 16,
              gap: 12,
            }}
          >
            <Text testID="istoric-detail-delete-question" style={{ fontSize: 14, color: dark.ink, textAlign: 'center' }}>
              {t('istoric.detail.deleteConfirmQuestion')}
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                testID="istoric-detail-delete-cancel"
                accessibilityRole="button"
                onPress={() => setConfirmDelete(false)}
                style={{
                  flex: 1,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  backgroundColor: dark.paper2,
                  borderWidth: 1,
                  borderColor: dark.lineStrong,
                  borderRadius: 12,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: dark.ink }}>
                  {t('istoric.detail.deleteConfirmNo')}
                </Text>
              </Pressable>
              <Pressable
                testID="istoric-detail-delete-accept"
                accessibilityRole="button"
                onPress={handleDelete}
                style={({ pressed }) => ({
                  flex: 1,
                  flexDirection: 'row',
                  gap: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  backgroundColor: dark.brick,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.85 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                })}
              >
                <Trash2 size={16} color={dark.onAccent} />
                <Text style={{ fontSize: 14, fontWeight: '600', color: dark.onAccent }}>
                  {t('istoric.detail.deleteConfirmYes')}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            testID="istoric-detail-delete-cta"
            accessibilityRole="button"
            onPress={() => setConfirmDelete(true)}
            style={({ pressed }) => ({ flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}
          >
            <Trash2 size={16} color={dark.brickDark} />
            <Text style={{ fontSize: 14, fontWeight: '600', color: dark.brickDark }}>
              {t('istoric.detail.deleteCta')}
            </Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

function DetailStat({ value, label, testId }: { value: string; label: string; testId: string }) {
  return (
    <View
      testID={testId}
      style={{
        flex: 1,
        backgroundColor: dark.paper2,
        borderWidth: 1,
        borderColor: dark.line,
        borderRadius: 22,
        padding: 12,
        alignItems: 'center',
      }}
    >
      <Text className="font-mono" style={{ fontSize: 10, letterSpacing: 1, color: dark.ink3, textTransform: 'uppercase' }}>
        {label}
      </Text>
      <Text className="font-display" style={{ fontSize: 20, fontWeight: '700', color: dark.ink, marginTop: 4 }}>
        {value}
      </Text>
    </View>
  );
}

const tableHead = { flex: 1, fontSize: 12, color: dark.ink2 } as const;
const tableCell = { flex: 1, fontSize: 14 } as const;
const prCell = { color: accent.volt, fontWeight: '600' } as const;
