// Andura RN/Expo Wave 0 — PROOF SCREEN.
//
// Sole purpose: prove the crown-jewel Andura engine (`src/engine/**`, plain JS,
// framework-agnostic) imports + runs UNCHANGED inside a React Native + Expo
// bundle. Zero churn to the web app; the engine is consumed via a relative
// cross-dir import resolved by Metro (see metro.config.js watchFolders).
//
// If this screen shows a real v-taper split + a real session with exercises,
// the core thesis of the port (D103) is de-risked.

import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// THE import under test — straight into the framework-agnostic engine, one dir up.
import {
  frequencyToSplit,
  getDailyWorkout,
} from '../src/engine/schedule/scheduleAdapter.js';

// Realistic fixture — shape copied from
// src/engine/schedule/__tests__/scheduleAdapter.focus.test.js `buildUserState`,
// plus focusPreset 'v-taper' so the focus-aware split reshapes the week.
function buildUserState() {
  return {
    user: {
      age: 30,
      goal: 'hipertrofie',
      persona: 'marius',
      frequency: '4',
      focusPreset: 'v-taper',
    },
    recentSessions: [],
    weights: {},
    profileTier: 'T2',
    flags: {},
    meta: { weeksElapsed: 0 },
  };
}

type ExerciseLike = { name?: string; sets?: number };
type DailyWorkout = {
  sessionType?: string;
  exercises?: ExerciseLike[];
} | null;

export default function App() {
  const [split, setSplit] = useState<string[] | null>(null);
  const [workout, setWorkout] = useState<DailyWorkout>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Sync engine call — v-taper split for a 4-day week.
      const s = frequencyToSplit(4, 'v-taper');
      setSplit(s);
    } catch (e: any) {
      setError(`frequencyToSplit: ${String(e?.message || e)}`);
    }

    // Async engine call — a real daily workout for a fixed date.
    (async () => {
      try {
        const state = buildUserState();
        const w = (await getDailyWorkout(state, new Date(2026, 4, 18))) as DailyWorkout;
        setWorkout(w);
      } catch (e: any) {
        setError(`getDailyWorkout: ${String(e?.message || e)}`);
      }
    })();
  }, []);

  const exercises = (workout?.exercises || []).slice(0, 5);

  return (
    <View style={{ flex: 1, backgroundColor: '#0b0f14' }}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: 64, gap: 8 }}
      >
        <Text style={{ color: '#7CFFB2', fontSize: 22, fontWeight: '700' }}>
          Andura engine in RN — Wave 0
        </Text>
        <Text style={{ color: '#9fb0c0', fontSize: 13, marginBottom: 12 }}>
          Daca vezi split-ul + sesiunea de mai jos, engine-ul ruleaza neschimbat
          in React Native.
        </Text>

        {error ? (
          <Text style={{ color: '#ff8080', fontSize: 14 }}>EROARE: {error}</Text>
        ) : null}

        <Text style={{ color: '#e6edf3', fontSize: 16, fontWeight: '600', marginTop: 8 }}>
          frequencyToSplit(4, &apos;v-taper&apos;):
        </Text>
        <Text style={{ color: '#cdd9e5', fontSize: 15 }}>
          {split ? JSON.stringify(split) : '...'}
        </Text>

        <Text style={{ color: '#e6edf3', fontSize: 16, fontWeight: '600', marginTop: 16 }}>
          getDailyWorkout(state, 2026-05-18):
        </Text>
        <Text style={{ color: '#cdd9e5', fontSize: 15 }}>
          sessionType: {workout?.sessionType ?? '...'}
        </Text>

        <Text style={{ color: '#e6edf3', fontSize: 16, fontWeight: '600', marginTop: 16 }}>
          Primele {exercises.length} exercitii:
        </Text>
        {exercises.length === 0 ? (
          <Text style={{ color: '#cdd9e5', fontSize: 15 }}>...</Text>
        ) : (
          exercises.map((ex, i) => (
            <Text key={i} style={{ color: '#cdd9e5', fontSize: 15 }}>
              {i + 1}. {ex.name ?? '(fara nume)'} — {ex.sets ?? '?'} seturi
            </Text>
          ))
        )}
      </ScrollView>
    </View>
  );
}
