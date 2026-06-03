// ══ CALENDAR HEATMAP (RN port) — F-istoric-01 signature feature ══════════
// RN twin of src/react/components/Istoric/CalendarHeatmap.tsx. Month-navigable
// 7-col grid with chevron prev/next (year wrap), Monday-first offset, per-day
// session-state glowing dot (easy=volt / normal=aqua / hard=ember) + a hollow
// aqua ring for aerobic-class days, today highlight + future-muted state, and a
// legend row. The store-backed hooks (useSessionsByDate / useAerobicDatesByMonth)
// + deriveSessionRating are imported UNCHANGED from the web lib — identical truth
// source. testIDs preserved 1:1 (calendar-heatmap / cal-prev / cal-next /
// cal-month-label / cal-grid / cal-cell-N / cal-dot-N / cal-aerobic-N /
// cal-legend / cal-month-announce).
//
// FIDELITY FLAGS:
//  - Web cell dots carry a CSS box-shadow glow + hover scale lift; RN has no
//    box-shadow blur or hover, so dots approximate the glow with shadowColor /
//    elevation and the hover-lift is dropped (no pointer on native).
//  - Web uses an ARIA role=grid/row/gridcell semantics layer (display:contents);
//    RN flattens to View rows — each cell keeps its accessibilityLabel so
//    screen readers still announce date + rating, matching the web aria-label.

import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import {
  useSessionsByDate,
  useAerobicDatesByMonth,
  localKey,
} from '../../../src/react/lib/useSessionsByDate';
import { deriveSessionRating } from '../../../src/react/lib/sessionRating';
import type { SessionRating } from '../../../src/react/lib/sessionRating';
import { dark, accent } from '../../lib/tokens';
import { t } from '../../../src/i18n/index.js';

// Wave E3 i18n parity — month + day labels + cell semantics flow through t().
function monthFull(monthIdx: number): string {
  return t(`months.full.${monthIdx}`);
}
function monthGenitive(monthIdx: number): string {
  return t(`months.fullGenitive.${monthIdx}`);
}
function dayLabel(idx: number): string {
  return t(`calendar.heatmap.dayLabels.${idx}`);
}

function ratingWord(rating: SessionRating | null, hasSession: boolean): string {
  if (!hasSession) return t('calendar.heatmap.cell.rest');
  if (rating === 'usor') return t('calendar.heatmap.cell.sessionLight');
  if (rating === 'greu') return t('calendar.heatmap.cell.sessionHard');
  if (rating === 'potrivit') return t('calendar.heatmap.cell.sessionFair');
  return t('calendar.heatmap.cell.sessionPresent');
}

// Null (legacy session no rating) → l2 normal fallback per spec §2.2.
function ratingToTierClass(rating: SessionRating | null): string {
  if (rating === 'usor') return 'l1';
  if (rating === 'greu') return 'l3';
  return 'l2';
}

// Multi-session same-day aggregator — severity-first tiebreak.
function aggregateDayRating(ratings: Array<SessionRating | null>): SessionRating | null {
  if (ratings.some((r) => r === 'greu')) return 'greu';
  if (ratings.some((r) => r === 'potrivit')) return 'potrivit';
  if (ratings.some((r) => r === 'usor')) return 'usor';
  return null;
}

// Tier → Pulse dot color (volt/aqua/ember). null = zi libera (no mark).
function tierDotColor(tier: string): string | null {
  if (tier === 'l1') return accent.volt;
  if (tier === 'l2') return accent.aqua;
  if (tier === 'l3') return accent.ember;
  return null;
}

// Glowing dot — RN shadow approximates the web box-shadow halo.
function glowDot(color: string, hollow = false) {
  return {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: hollow ? 'transparent' : color,
    borderWidth: hollow ? 1.5 : 0,
    borderColor: hollow ? accent.aqua : 'transparent',
    shadowColor: hollow ? accent.aqua : color,
    shadowOpacity: 0.8,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  } as const;
}

export function CalendarHeatmap() {
  const today = new Date();
  const [calY, setCalY] = useState(today.getFullYear());
  const [calM, setCalM] = useState(today.getMonth());
  const sessionsByDate = useSessionsByDate(calY, calM);
  const aerobicDates = useAerobicDatesByMonth(calY, calM);
  const todayKey = localKey(today.getTime());

  const navMonth = (delta: -1 | 1): void => {
    let m = calM + delta;
    let y = calY;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setCalY(y);
    setCalM(m);
  };

  // Monday-first offset: (getDay()+6)%7 → 0=Mon..6=Sun.
  const firstOfMonth = new Date(calY, calM, 1);
  const monOffset = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(calY, calM + 1, 0).getDate();

  const cells: Array<{ day: number | null; rating: SessionRating | null; key: string | null }> = [];
  for (let i = 0; i < monOffset; i++) {
    cells.push({ day: null, rating: null, key: null });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${calY}-${String(calM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const sessions = sessionsByDate.get(key);
    const rating = sessions
      ? aggregateDayRating(sessions.map((s) => deriveSessionRating(s)))
      : null;
    cells.push({ day: d, rating: sessions ? rating : null, key });
  }

  // Chunk into weeks of 7 (each week = a row View).
  const weeks: Array<typeof cells> = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  const monthLabel = monthFull(calM);

  return (
    <View
      testID="calendar-heatmap"
      accessibilityLabel={t('calendar.heatmap.ariaLabel')}
      className="pulse-card"
      style={{
        backgroundColor: dark.paper2,
        borderWidth: 1,
        borderColor: dark.line,
        borderRadius: 22,
        padding: 16,
        marginBottom: 16,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <Text
          testID="cal-month-label"
          className="font-display"
          style={{ color: dark.ink, fontSize: 16, fontWeight: '600' }}
        >
          {monthLabel} {calY}
        </Text>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <Pressable
            testID="cal-prev"
            accessibilityRole="button"
            accessibilityLabel={t('calendar.heatmap.prevMonth')}
            onPress={() => navMonth(-1)}
            style={({ pressed }) => ({
              width: 30,
              height: 30,
              borderRadius: 9,
              borderWidth: 1,
              borderColor: dark.line,
              backgroundColor: pressed ? dark.paper2 : dark.paper,
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ scale: pressed ? 0.92 : 1 }],
            })}
          >
            <ChevronLeft size={14} color={dark.ink} />
          </Pressable>
          <Pressable
            testID="cal-next"
            accessibilityRole="button"
            accessibilityLabel={t('calendar.heatmap.nextMonth')}
            onPress={() => navMonth(1)}
            style={({ pressed }) => ({
              width: 30,
              height: 30,
              borderRadius: 9,
              borderWidth: 1,
              borderColor: dark.line,
              backgroundColor: pressed ? dark.paper2 : dark.paper,
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ scale: pressed ? 0.92 : 1 }],
            })}
          >
            <ChevronRight size={14} color={dark.ink} />
          </Pressable>
        </View>
      </View>

      {/* Day-of-week header row */}
      <View style={{ flexDirection: 'row', marginBottom: 6 }}>
        {[0, 1, 2, 3, 4, 5, 6].map((idx) => (
          <Text
            key={idx}
            className="font-mono"
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: 10,
              fontWeight: '600',
              letterSpacing: 1,
              color: accent.aqua,
              paddingVertical: 4,
            }}
          >
            {dayLabel(idx)}
          </Text>
        ))}
      </View>

      {/* Grid of weeks */}
      <View testID="cal-grid" style={{ marginBottom: 10 }}>
        {weeks.map((week, weekIdx) => (
          <View key={`week-${weekIdx}`} style={{ flexDirection: 'row' }}>
            {week.map((cell, cellIdx) => {
              const idx = weekIdx * 7 + cellIdx;
              if (cell.day === null) {
                return (
                  <View
                    key={`empty-${idx}`}
                    testID={`cal-cell-empty-${idx}`}
                    accessibilityElementsHidden
                    style={{ flex: 1, aspectRatio: 1, margin: 2 }}
                  />
                );
              }
              const hasSession = sessionsByDate.has(cell.key ?? '');
              const hasAerobic = cell.key !== null && aerobicDates.has(cell.key);
              const tier = hasSession ? ratingToTierClass(cell.rating) : 'zi-libera';
              const dotColor = tierDotColor(tier);
              const isToday = cell.key === todayKey;
              const isFuture = cell.key !== null && cell.key > todayKey;
              const numColor = isFuture
                ? dark.ink3
                : isToday
                  ? dark.brick
                  : dark.ink2;
              const labelSuffix = isToday
                ? t('calendar.heatmap.cell.todaySuffix')
                : isFuture
                  ? t('calendar.heatmap.cell.futureSuffix')
                  : '';
              const aerobicWord = hasAerobic ? `, ${t('calendar.heatmap.cell.aerobic')}` : '';
              const ariaLabel = `${cell.day} ${monthGenitive(calM)} ${calY}, ${ratingWord(cell.rating, hasSession)}${aerobicWord}${labelSuffix}`;
              return (
                <View
                  key={`day-${cell.day}`}
                  testID={`cal-cell-${cell.day}`}
                  accessibilityLabel={ariaLabel}
                  style={{
                    flex: 1,
                    aspectRatio: 1,
                    margin: 2,
                    borderRadius: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isFuture ? 'transparent' : dark.paper,
                    borderWidth: isToday ? 2 : 0,
                    borderColor: isToday ? dark.brick : 'transparent',
                  }}
                >
                  <Text
                    className="font-mono"
                    style={{
                      fontSize: 12,
                      lineHeight: 12,
                      color: numColor,
                      opacity: isFuture ? 0.5 : 1,
                      fontWeight: isToday ? '700' : '400',
                    }}
                  >
                    {cell.day}
                  </Text>
                  {(dotColor || hasAerobic) && (
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 }}
                      accessibilityElementsHidden
                    >
                      {dotColor && (
                        <View testID={`cal-dot-${cell.day}`} style={glowDot(dotColor)} />
                      )}
                      {hasAerobic && (
                        <View testID={`cal-aerobic-${cell.day}`} style={glowDot(accent.aqua, true)} />
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>

      {/* Live region — RN announces via accessibilityLiveRegion on the text. */}
      <Text
        testID="cal-month-announce"
        accessibilityLiveRegion="polite"
        style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0 }}
      >
        {t('calendar.heatmap.monthAnnounce', { month: monthLabel, year: calY })}
      </Text>

      {/* Legend */}
      <View
        testID="cal-legend"
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 14,
          paddingTop: 14,
          marginTop: 14,
          borderTopWidth: 1,
          borderTopColor: dark.line,
        }}
      >
        <LegendItem testID="cal-legend-gym" color={accent.volt} label={t('calendar.heatmap.legend.gym')} round />
        <LegendItem testID="cal-legend-aerobic" color={accent.aqua} label={t('calendar.heatmap.legend.aerobic')} round hollow />
        <LegendItem color={accent.volt} label={t('calendar.heatmap.legend.easy')} />
        <LegendItem color={accent.aqua} label={t('calendar.heatmap.legend.normal')} />
        <LegendItem color={accent.ember} label={t('calendar.heatmap.legend.hard')} />
        <LegendItem color={accent.violet} label={t('calendar.heatmap.legend.recovery')} />
        <LegendItem color={dark.paper2} label={t('calendar.heatmap.legend.rest')} borderColor={dark.lineStrong} />
      </View>
    </View>
  );
}

function LegendItem({
  color,
  label,
  testID,
  round = false,
  hollow = false,
  borderColor,
}: {
  color: string;
  label: string;
  testID?: string;
  round?: boolean;
  hollow?: boolean;
  borderColor?: string;
}) {
  return (
    <View testID={testID} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: round ? 5 : 3,
          backgroundColor: hollow ? 'transparent' : color,
          borderWidth: hollow ? 1.5 : borderColor ? 1 : 0,
          borderColor: hollow ? accent.aqua : borderColor ?? 'transparent',
          shadowColor: color,
          shadowOpacity: borderColor ? 0 : 0.6,
          shadowRadius: 3,
          shadowOffset: { width: 0, height: 0 },
        }}
      />
      <Text className="font-mono" style={{ fontSize: 10, color: dark.ink2 }}>
        {label}
      </Text>
    </View>
  );
}
