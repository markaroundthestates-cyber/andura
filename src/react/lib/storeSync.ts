// ══ STORE SYNC — wv2 Zustand stores ↔ Firebase RTDB (08.050/051) ════════════
// CRITICAL data-loss fix. Pre-fix only the flat Tier-0 SYNC_KEYS (firebase.js)
// reached Firebase; the entire wv2-* Zustand layer (weight history, session
// history, onboarding profile, goals, nutrition) was localStorage-only → a
// logged-in user lost everything on reinstall / cache-clear / new device.
//
// This module wires each user-DATA store both ways, WITHOUT touching the flat
// SYNC_KEYS path (Tier-0 contract unchanged — it still runs via DB.set hook):
//
//   PUSH    — debounced subscription per store → PATCH RTDB at
//             `users/{uid}/wv2/<store>` with `{ data, updatedAt }`.
//   HYDRATE — on login + cold boot, GET the remote node → MERGE into local
//             via the pure no-clobber rules in storeMerge.ts (never lose data,
//             ANDURA never-delete invariant). Local entries absent from remote
//             are NEVER dropped; remote-only entries are always pulled down.
//
// Only user DATA syncs — NOT ephemeral UI / coach-stub state (wv2-coach-store
// schedContext/persona, wv2-app-store isSkipAuth). settingsStore preferences
// sync via last-write-wins (losing theme/notification prefs on a new device is
// a real, if lesser, loss).
//
// Cross-refs:
//   - firebase.js fbGetUserChild / fbPatchUserChild (auth-aware GET/PATCH)
//   - reactBoot.ts runPostAuthSync (calls hydrateStoresFromCloud on login/boot)

import { fbGetUserChild, fbPatchUserChild } from '../../firebase.js';
import {
  mergeArrayUnion,
  mergeMaxScalar,
  mergeMaxIsoDate,
  mergeLastWriteWins,
  mergeObjectUnion,
} from './storeMerge';
import { useWorkoutStore } from '../stores/workoutStore';
import { useProgresStore } from '../stores/progresStore';
import { useOnboardingStore } from '../stores/onboardingStore';
import { useNutritionStore } from '../stores/nutritionStore';
import { useScheduleStore } from '../stores/scheduleStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useAerobicStore } from '../stores/aerobicStore';

// Debounce window for the push subscription. Matches firebase.js DB.set 3s
// coalesce so a burst of edits (logging a workout set-by-set) produces one PATCH.
const PUSH_DEBOUNCE_MS = 3000;

interface RemoteEnvelope {
  data?: unknown;
  updatedAt?: number;
}

/**
 * A synced store descriptor. `select` extracts the persisted data slice from
 * the store state; `apply` merges a remote envelope into local and returns the
 * partial state to write back (or null when nothing changes). `node` is the
 * child path under `users/{uid}/wv2/`.
 */
interface SyncedStore {
  node: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  store: { getState: () => any; setState: (partial: any) => void; subscribe: (fn: (s: any) => void) => () => void };
  select: (state: unknown) => unknown;
  apply: (remote: RemoteEnvelope) => void;
}

// ── Per-store registry (data only — no ephemeral UI/coach state) ─────────────

const SYNCED: SyncedStore[] = [
  // ── workoutStore: sessionsHistory (array, id=ts), streak (max), lastStreakDate
  //    (max ISO), lastSession (LWW by ts). pausedSnapshot NOT synced (in-flight
  //    device-local resume state — see workoutStore live-set fix 08.063).
  {
    node: 'workout',
    store: useWorkoutStore as unknown as SyncedStore['store'],
    select: (s) => {
      const st = s as ReturnType<typeof useWorkoutStore.getState>;
      return {
        sessionsHistory: st.sessionsHistory,
        streak: st.streak,
        lastStreakDate: st.lastStreakDate,
        lastSession: st.lastSession,
        deletedSessionTs: st.deletedSessionTs,
      };
    },
    apply: (remote) => {
      const d = (remote?.data ?? {}) as Partial<ReturnType<typeof useWorkoutStore.getState>>;
      if (d == null || typeof d !== 'object') return;
      const local = useWorkoutStore.getState();
      // Tombstones union both sides (a deletion on EITHER device must win — never
      // resurrect a session the user removed elsewhere). Applied to the merged
      // history below so a deleted session stays gone post-hydrate.
      const localDeleted = Array.isArray(local.deletedSessionTs) ? local.deletedSessionTs : [];
      const remoteDeleted = Array.isArray(d.deletedSessionTs) ? d.deletedSessionTs : [];
      const deletedSessionTs = Array.from(new Set([...localDeleted, ...remoteDeleted]));
      const deletedSet = new Set(deletedSessionTs);
      // Coerce ts non-finit (record cloud malformat / schema veche / cross-device)
      // la 0 INAINTE de merge: pastreaza inregistrarea (zero pierdere date) dar
      // evita NaN sa otraveasca sortarea reverse-chrono din Istoric (b.ts - a.ts)
      // + UI formatDate degradeaza la em-dash in loc de cheia i18n literala.
      const mergedSessions = mergeArrayUnion(local.sessionsHistory, d.sessionsHistory, 'ts')
        .filter((s) => !deletedSet.has(s?.ts));
      const sessionsHistory = mergedSessions.map((s) =>
        Number.isFinite(s?.ts) ? s : { ...s, ts: 0 },
      );
      const streak = mergeMaxScalar(local.streak, d.streak);
      const lastStreakDate = mergeMaxIsoDate(local.lastStreakDate, d.lastStreakDate);
      // lastSession LWW by its own ts (the finish timestamp) — but never restore a
      // tombstoned session as the post-summary surface.
      const mergedLastSession = mergeLastWriteWins(
        local.lastSession,
        d.lastSession,
        local.lastSession?.ts,
        d.lastSession?.ts,
      );
      const lastSession =
        mergedLastSession && deletedSet.has(mergedLastSession.ts) ? null : mergedLastSession;
      useWorkoutStore.setState({ sessionsHistory, streak, lastStreakDate, lastSession, deletedSessionTs });
    },
  },
  // ── progresStore: weightLog (array, id=date/ts), bodyData (array, id=ts),
  //    targetObiectiv (goals — LWW by the store's updatedAt envelope).
  {
    node: 'progres',
    store: useProgresStore as unknown as SyncedStore['store'],
    select: (s) => {
      const st = s as ReturnType<typeof useProgresStore.getState>;
      return {
        weightLog: st.weightLog,
        bodyData: st.bodyData,
        targetObiectiv: st.targetObiectiv,
      };
    },
    apply: (remote) => {
      const d = (remote?.data ?? {}) as Partial<ReturnType<typeof useProgresStore.getState>>;
      if (d == null || typeof d !== 'object') return;
      const local = useProgresStore.getState();
      // weightLog dedupes by date (one canonical entry per calendar day — the
      // store's own addWeightEntry upserts by date). bodyData appends multiple
      // distinct measurements so keys on ts.
      const weightLog = mergeArrayUnion(local.weightLog, d.weightLog, 'date');
      const bodyData = mergeArrayUnion(local.bodyData, d.bodyData, 'ts');
      // Goals = last-write-wins by the envelope updatedAt. A local non-empty
      // target is preserved over a missing/older remote (never clobber a goal
      // the user set on this device with an undated remote).
      const localHasTarget = local.targetObiectiv?.weightKg != null || local.targetObiectiv?.month != null;
      const targetObiectiv = mergeLastWriteWins(
        local.targetObiectiv,
        d.targetObiectiv,
        localHasTarget ? Date.now() - 1 : 0, // local treated as recent only if set
        remote?.updatedAt,
      );
      useProgresStore.setState({ weightLog, bodyData, targetObiectiv });
    },
  },
  // ── onboardingStore: profile data + completed flag (LWW by envelope updatedAt).
  //    A new device with an empty profile must accept the remote profile; a
  //    device that already completed onboarding must NOT be reset by an older
  //    remote. completed is sticky-true (once true never flips false on restore).
  {
    node: 'onboarding',
    store: useOnboardingStore as unknown as SyncedStore['store'],
    select: (s) => {
      const st = s as ReturnType<typeof useOnboardingStore.getState>;
      return { data: st.data, completed: st.completed, completedAt: st.completedAt };
    },
    apply: (remote) => {
      const d = (remote?.data ?? {}) as Partial<ReturnType<typeof useOnboardingStore.getState>>;
      if (d == null || typeof d !== 'object') return;
      const local = useOnboardingStore.getState();
      // Local "has profile" when it has already completed onboarding. If local is
      // NOT completed but remote IS, take the remote profile wholesale (new-device
      // recovery). Otherwise LWW by completedAt (newer profile edit wins).
      const localAt = local.completed ? (local.completedAt ?? Date.now()) : 0;
      const remoteAt = d.completed ? (d.completedAt ?? remote?.updatedAt ?? 0) : 0;
      const data = mergeLastWriteWins(local.data, d.data, localAt, remoteAt);
      // completed is monotonic — true wins (never un-complete a user on restore).
      const completed = local.completed || d.completed === true;
      const completedAt = completed
        ? (remoteAt > localAt ? (d.completedAt ?? local.completedAt) : (local.completedAt ?? d.completedAt ?? null))
        : null;
      useOnboardingStore.setState({ data, completed, completedAt: completedAt ?? null });
    },
  },
  // ── nutritionStore: dailyLog (array, id=dateISO).
  {
    node: 'nutrition',
    store: useNutritionStore as unknown as SyncedStore['store'],
    select: (s) => {
      const st = s as ReturnType<typeof useNutritionStore.getState>;
      return { dailyLog: st.dailyLog };
    },
    apply: (remote) => {
      const d = (remote?.data ?? {}) as Partial<ReturnType<typeof useNutritionStore.getState>>;
      if (d == null || typeof d !== 'object') return;
      const local = useNutritionStore.getState();
      const dailyLog = mergeArrayUnion(local.dailyLog, d.dailyLog, 'dateISO');
      useNutritionStore.setState({ dailyLog });
    },
  },
  // ── aerobicStore: sessions (array, id=ts — never drop a logged class),
  //    lastDuration (scalar, LWW by envelope updatedAt), subjectiveByDate (keyed
  //    object-map per local-ISO date, object-union LWW by envelope updatedAt).
  //    Aerobic-only users (the explicit persona) lost ALL data on reinstall
  //    before this — same wv2 data-loss the sync layer was built to prevent.
  {
    node: 'aerobic',
    store: useAerobicStore as unknown as SyncedStore['store'],
    select: (s) => {
      const st = s as ReturnType<typeof useAerobicStore.getState>;
      return {
        sessions: st.sessions,
        lastDuration: st.lastDuration,
        subjectiveByDate: st.subjectiveByDate,
        deletedTs: st.deletedTs,
      };
    },
    apply: (remote) => {
      const d = (remote?.data ?? {}) as Partial<ReturnType<typeof useAerobicStore.getState>>;
      if (d == null || typeof d !== 'object') return;
      const local = useAerobicStore.getState();
      // Tombstones union both sides (a deletion on EITHER device must win — never
      // resurrect a class the user removed on another device). Filter the merged
      // sessions through it so a deleted class stays gone post-hydrate.
      const localDeleted = Array.isArray(local.deletedTs) ? local.deletedTs : [];
      const remoteDeleted = Array.isArray(d.deletedTs) ? d.deletedTs : [];
      const deletedTs = Array.from(new Set([...localDeleted, ...remoteDeleted]));
      const deletedSet = new Set(deletedTs);
      // sessions union by ts — every logged class kept (no double-count drop) —
      // then tombstoned ts removed.
      const sessions = mergeArrayUnion(local.sessions, d.sessions, 'ts').filter(
        (sess) => !deletedSet.has(sess?.ts),
      );
      // lastDuration LWW by the envelope updatedAt (a single pre-fill scalar).
      const lastDuration = mergeLastWriteWins(
        local.lastDuration,
        d.lastDuration,
        Date.now() - 1, // local treated as recent; remote wins only when newer
        remote?.updatedAt,
      );
      // subjectiveByDate is a keyed map (date → readiness) — object-union keeps
      // every day's self-report from both devices, collisions LWW by envelope.
      const subjectiveByDate = mergeObjectUnion(
        local.subjectiveByDate,
        d.subjectiveByDate,
        Date.now() - 1,
        remote?.updatedAt,
      );
      useAerobicStore.setState({ sessions, lastDuration, subjectiveByDate, deletedTs });
    },
  },
  // ── scheduleStore: current-week training/rest days (LWW by envelope updatedAt;
  //    the days array is a fixed 7-tuple, not a history — newest edit wins).
  {
    node: 'schedule',
    store: useScheduleStore as unknown as SyncedStore['store'],
    select: (s) => {
      const st = s as ReturnType<typeof useScheduleStore.getState>;
      return { weekStartISO: st.weekStartISO, days: st.days };
    },
    apply: (remote) => {
      const d = (remote?.data ?? {}) as Partial<ReturnType<typeof useScheduleStore.getState>>;
      if (d == null || typeof d !== 'object' || !Array.isArray(d.days)) return;
      const local = useScheduleStore.getState();
      // Only adopt remote week-config when it is for the SAME week start (a stale
      // remote week must not overwrite the current local week's plan).
      if (d.weekStartISO && d.weekStartISO === local.weekStartISO) {
        useScheduleStore.setState({ days: d.days });
      } else if (d.weekStartISO && d.weekStartISO > local.weekStartISO) {
        // Remote is a later week → adopt it wholesale (newer planning horizon).
        useScheduleStore.setState({ weekStartISO: d.weekStartISO, days: d.days });
      }
    },
  },
  // ── settingsStore: user preferences (LWW by envelope updatedAt — losing
  //    theme/notification prefs on a new device is a real, lesser loss).
  {
    node: 'settings',
    store: useSettingsStore as unknown as SyncedStore['store'],
    select: (s) => {
      // Persist the full preferences slice (mirror the store partialize).
      const st = s as ReturnType<typeof useSettingsStore.getState>;
      const {
        // strip actions — only data fields
        setTheme: _a, setAccent: _b, toggleNotifications: _c, setNotificationFrequency: _d,
        toggleNotificationDay: _e, setNotificationTime: _f, setUnitSystem: _g, setWeekStart: _h,
        setTelemetryOptIn: _i, setDataExportConsent: _j, setBottomNavStyle: _k, acceptDisclaimer: _l,
        reset: _m, ...data
      } = st;
      return data;
    },
    apply: (remote) => {
      const d = (remote?.data ?? null) as Record<string, unknown> | null;
      if (d == null || typeof d !== 'object') return;
      // LWW: only adopt remote prefs when the remote envelope is strictly newer
      // than this device's last local write. Without a local updatedAt we treat
      // local as "now" (a fresh device with default prefs has updatedAt 0 in
      // remote terms → remote wins only if it carries a real envelope).
      const localAt = _localPrefsUpdatedAt;
      if (typeof remote?.updatedAt === 'number' && remote.updatedAt > localAt) {
        useSettingsStore.setState(d);
      }
    },
  },
];

// Canonical list of the wv2 child nodes under `users/{uid}/wv2/` — the single
// source of truth for which store-sync subtrees exist. Derived from the SYNCED
// registry so a new synced store automatically flows into every consumer (e.g.
// the RESET cloud-clear path in dataReset.js, which DELETEs each wv2 node so a
// logged-in reset truly clears cloud state and `hydrateStoresFromCloud` cannot
// resurrect it on the next boot). Kept as `wv2/<node>` relative paths to match
// the PATCH/GET callers above + clearFirebaseKeys' `users/{uid}/<key>` contract.
export const SYNCED_WV2_NODES: readonly string[] = SYNCED.map((s) => `wv2/${s.node}`);

// settingsStore has no per-field updatedAt; track the last local write time so
// hydrate can LWW. 0 on cold boot (default prefs) → remote envelope wins.
let _localPrefsUpdatedAt = 0;

// ── Hydrate (login + cold boot) ──────────────────────────────────────────────

/**
 * Pull every synced store's remote node and MERGE into local (no clobber). Runs
 * each store independently — one failed GET never aborts the others. Safe to
 * call repeatedly (merge is idempotent: union/max/LWW converge). No-op when
 * unauthenticated (fbGetUserChild returns null for a null user path).
 */
export async function hydrateStoresFromCloud(): Promise<void> {
  await Promise.allSettled(
    SYNCED.map(async (s) => {
      try {
        const remote = await fbGetUserChild(`wv2/${s.node}`);
        if (remote == null || typeof remote !== 'object') return;
        s.apply(remote as RemoteEnvelope);
      } catch {
        // Per-store graceful — a transient GET failure leaves local untouched.
      }
    }),
  );
}

// ── Push (debounced subscription per store) ──────────────────────────────────

let _unsubscribers: Array<() => void> = [];
const _timers = new Map<string, ReturnType<typeof setTimeout>>();

function _schedulePush(s: SyncedStore): void {
  const existing = _timers.get(s.node);
  if (existing) clearTimeout(existing);
  _timers.set(
    s.node,
    setTimeout(() => {
      _timers.delete(s.node);
      const data = s.select(s.store.getState());
      const updatedAt = Date.now();
      if (s.node === 'settings') _localPrefsUpdatedAt = updatedAt;
      // PATCH child node only — never clobbers SYNC_KEYS / sibling nodes.
      void fbPatchUserChild(`wv2/${s.node}`, { data, updatedAt });
    }, PUSH_DEBOUNCE_MS),
  );
}

/**
 * Subscribe each synced store → debounced PATCH on change. Idempotent: a second
 * call tears down the prior subscriptions first (e.g. account switch). Returns a
 * teardown fn. The subscriptions only PATCH when authenticated (fbPatchUserChild
 * short-circuits on a null user path), so it is safe to start at boot even before
 * login — anonymous edits simply no-op the network call.
 */
export function startStoreSyncSubscriptions(): () => void {
  stopStoreSyncSubscriptions();
  _unsubscribers = SYNCED.map((s) => s.store.subscribe(() => _schedulePush(s)));
  return stopStoreSyncSubscriptions;
}

/** Tear down all push subscriptions + pending debounce timers (test cleanup +
 *  account switch). */
export function stopStoreSyncSubscriptions(): void {
  for (const unsub of _unsubscribers) {
    try { unsub(); } catch { /* ignore */ }
  }
  _unsubscribers = [];
  for (const t of _timers.values()) clearTimeout(t);
  _timers.clear();
}

/** Test-only reset of module state. */
export function __resetStoreSyncForTest(): void {
  stopStoreSyncSubscriptions();
  _localPrefsUpdatedAt = 0;
}
