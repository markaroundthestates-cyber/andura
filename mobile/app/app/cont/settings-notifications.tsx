// ══ SETTINGS NOTIFICATIONS (RN port, W6a) ════════════════════════════════
// RN twin of src/react/routes/screens/cont/SettingsNotifications.tsx. Master
// toggle + permission ladder + frequency + day picker + reminder time + per-
// event domain toggles (Antrenament / Coaching) + quiet-hours info. ALL store
// wires + handlers (handleToggle / toggleEvent / syncNotificationPrefs) kept
// verbatim. Every testID preserved (notif-master-toggle, notif-master-pending,
// notif-permission-warning, notif-no-account-warning, notif-unsupported-warning,
// notif-freq-*, notif-day-picker, notif-day-*, notif-time-input, notif-events-*,
// notif-event-*, notif-quiet-hours). <input checkbox> → shared Toggle.
//
// FLAGS (native-only; web export keeps full web behavior):
//  - PUSH ENABLE/DISABLE: enable/disablePushNotifications lazy-load the FCM web
//    SDK (firebase/messaging) — a WEB-only path. On RN this is the
//    expo-notifications boundary (W-Final, the rest-timer flagship). The handler
//    is kept; on native the dynamic firebase import rejects → graceful 'error'/
//    'unsupported' (no crash). readPermission() returns 'unsupported' on native
//    (no global Notification).
//  - per-event toggles persist through the kv adapter (MMKV on native — ME-02);
//    reminder time persists via the settings store (kv-backed zustand persist).
//  - reminder time: web <input type=time>; RN has no native time input here, so
//    a HH:MM TextInput keeps setNotificationTime live + editable (a native time
//    picker is a design-polish upgrade).

import { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AlertCircle } from 'lucide-react-native';
import { logger } from '../../../../src/util/logger.js';
import { kv } from '../../../../src/storage/kv';
import { useSettingsStore } from '../../../../src/react/stores/settingsStore';
import type { NotificationFrequency } from '../../../../src/react/stores/settingsStore';
import { SubHeader } from '../../../components/SubHeader';
import { Toggle } from '../../../components/Toggle';
import { t } from '../../../../src/i18n/index.js';

// FCM push + RTDB prefs sync are lazy-imported (NOT static) because they pull the
// FCM web SDK (firebase/messaging) — a WEB-only path with no native equivalent
// until the expo-notifications boundary (W-Final). firebase.js + auth.js are
// env-shimmed (no top-level import.meta), so the deferral is about the web FCM SDK,
// not import.meta. The dynamic import resolves on Expo web (full parity) and
// rejects gracefully on native. Behavior + call-sites are unchanged; only the
// import is deferred to call-time.
async function syncNotificationPrefs(): Promise<void> {
  try {
    const m = await import('../../../../src/react/lib/notificationPrefsSync');
    await m.syncNotificationPrefs();
  } catch {
    /* native / no firebase env — W-Final */
  }
}
type PushResult = 'granted' | 'denied' | 'unsupported' | 'no-account' | 'error';
async function enablePushNotifications(): Promise<PushResult> {
  try {
    const m = await import('../../../../src/react/lib/pushNotifications');
    return m.enablePushNotifications();
  } catch {
    return 'error';
  }
}
async function disablePushNotifications(): Promise<void> {
  try {
    const m = await import('../../../../src/react/lib/pushNotifications');
    await m.disablePushNotifications();
  } catch {
    /* native / no firebase env — W-Final */
  }
}
import { goBack } from '../../../lib/nav';
import { dark, accent } from '../../../lib/tokens';

type NotifPermission = 'default' | 'granted' | 'denied' | 'unsupported' | 'no-account';

function readPermission(): NotifPermission {
  // RN native has no global Notification → unsupported (W-Final expo-notifications).
  if (typeof Notification === 'undefined') return 'unsupported';
  return Notification.permission as NotifPermission;
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;
const FREQUENCY_OPTIONS: ReadonlyArray<{ value: NotificationFrequency; labelKey: string }> = [
  { value: 'zilnic', labelKey: 'settings.notifications.frequencyDaily' },
  { value: 'saptamanal', labelKey: 'settings.notifications.frequencyWeekly' },
  { value: 'off', labelKey: 'settings.notifications.frequencyOff' },
];

interface NotifEvent {
  key: string;
  testId: string;
  titleKey: string;
  descKey: string;
  defaultOn: boolean;
}
const NOTIF_EVENTS_ANTRENAMENT: ReadonlyArray<NotifEvent> = [
  { key: 'session-reminder', testId: 'notif-event-session-reminder', titleKey: 'settings.notifications.events.sessionReminderTitle', descKey: 'settings.notifications.events.sessionReminderDesc', defaultOn: true },
  { key: 'rest-timer', testId: 'notif-event-rest-timer', titleKey: 'settings.notifications.events.restTimerTitle', descKey: 'settings.notifications.events.restTimerDesc', defaultOn: true },
  { key: 'session-missed', testId: 'notif-event-session-missed', titleKey: 'settings.notifications.events.sessionMissedTitle', descKey: 'settings.notifications.events.sessionMissedDesc', defaultOn: false },
];
const NOTIF_EVENTS_COACHING: ReadonlyArray<NotifEvent> = [
  { key: 'daily-coach', testId: 'notif-event-daily-coach', titleKey: 'settings.notifications.events.dailyCoachTitle', descKey: 'settings.notifications.events.dailyCoachDesc', defaultOn: true },
  { key: 'weekly-summary', testId: 'notif-event-weekly-summary', titleKey: 'settings.notifications.events.weeklySummaryTitle', descKey: 'settings.notifications.events.weeklySummaryDesc', defaultOn: true },
];

// Per-event prefs persist through the shared kv adapter (web: localStorage;
// native: MMKV) so the Antrenament/Coaching toggles survive on device (ME-02).
// Web identical (kv forwards to localStorage). Reminder time persists via the
// settings store (notificationTime), already kv-backed by zustand persist.
function readNotifEventEnabled(key: string, defaultOn: boolean): boolean {
  try {
    const raw = kv.getItem(`wv2-notif-event-${key}`);
    if (raw === null) return defaultOn;
    return raw === '1';
  } catch {
    return defaultOn;
  }
}

function writeNotifEventEnabled(key: string, value: boolean): void {
  try {
    kv.setItem(`wv2-notif-event-${key}`, value ? '1' : '0');
  } catch {
    /* disabled — silent */
  }
}

const SURFACE_2 = 'rgba(33,39,60,0.78)';

function Heading({ children, id }: { children: string; id?: string }) {
  return (
    <Text nativeID={id} className="font-mono uppercase" style={{ fontSize: 11, letterSpacing: 1.5, fontWeight: '600', color: dark.ink3, marginBottom: 12 }}>
      {children}
    </Text>
  );
}

export default function SettingsNotifications() {
  const enabled = useSettingsStore((s) => s.notificationsEnabled);
  const frequency = useSettingsStore((s) => s.notificationFrequency);
  const days = useSettingsStore((s) => s.notificationDays);
  const time = useSettingsStore((s) => s.notificationTime);
  const toggleNotifications = useSettingsStore((s) => s.toggleNotifications);
  const setNotificationFrequency = useSettingsStore((s) => s.setNotificationFrequency);
  const toggleNotificationDay = useSettingsStore((s) => s.toggleNotificationDay);
  const setNotificationTime = useSettingsStore((s) => s.setNotificationTime);

  const [permission, setPermission] = useState<NotifPermission>(readPermission);
  useEffect(() => {
    setPermission(readPermission());
  }, []);

  const [togglePending, setTogglePending] = useState(false);

  const allEvents = [...NOTIF_EVENTS_ANTRENAMENT, ...NOTIF_EVENTS_COACHING];
  const [eventStates, setEventStates] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const ev of allEvents) {
      init[ev.key] = readNotifEventEnabled(ev.key, ev.defaultOn);
    }
    return init;
  });
  function toggleEvent(key: string): void {
    setEventStates((prev) => {
      const next = !prev[key];
      writeNotifEventEnabled(key, next);
      return { ...prev, [key]: next };
    });
    void syncNotificationPrefs();
  }

  async function handleToggle(): Promise<void> {
    if (togglePending) return;
    if (enabled) {
      toggleNotifications();
      void syncNotificationPrefs();
      setTogglePending(true);
      void disablePushNotifications().finally(() => setTogglePending(false));
      return;
    }
    setTogglePending(true);
    try {
      const result = await enablePushNotifications();
      switch (result) {
        case 'granted':
          setPermission('granted');
          toggleNotifications();
          void syncNotificationPrefs();
          break;
        case 'denied':
          setPermission('denied');
          break;
        case 'unsupported':
          setPermission('unsupported');
          break;
        case 'no-account':
          setPermission('no-account');
          break;
        case 'error':
          logger.warn('[notif] enablePushNotifications error');
          break;
      }
    } finally {
      setTogglePending(false);
    }
  }

  return (
    <View testID="settings-notifications" style={{ flex: 1, backgroundColor: dark.paper }}>
      <SubHeader title={t('settings.notifications.title')} onBack={goBack} testIdBack="settings-notifications-back" />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
        <Text style={{ fontSize: 14, color: dark.ink2, marginBottom: 16 }}>{t('settings.notifications.intro')}</Text>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: dark.paper2,
            borderWidth: 1,
            borderColor: dark.line,
            borderRadius: 14,
            padding: 16,
            marginBottom: 8,
          }}
        >
          <Text style={{ fontSize: 14, color: dark.ink, flexShrink: 1 }}>
            {t('settings.notifications.masterToggleLabel')}
            {togglePending ? (
              <Text testID="notif-master-pending" accessibilityLiveRegion="polite" style={{ fontSize: 12, color: dark.ink2, fontStyle: 'italic' }}>
                {`  ${t('settings.notifications.applyingHint')}`}
              </Text>
            ) : null}
          </Text>
          <Toggle
            checked={enabled}
            onToggle={() => { void handleToggle(); }}
            ariaLabel={t('settings.notifications.masterToggleLabel')}
            testId="notif-master-toggle"
            disabled={togglePending}
          />
        </View>

        {permission === 'denied' && (
          <PermissionNotice testID="notif-permission-warning" text={t('settings.notifications.permissionDenied')} />
        )}
        {permission === 'no-account' && (
          <PermissionNotice testID="notif-no-account-warning" text={t('settings.notifications.permissionNoAccount')} />
        )}
        {permission === 'unsupported' && (
          <Text testID="notif-unsupported-warning" style={{ fontSize: 12, color: dark.ink2, fontStyle: 'italic', marginBottom: 16 }}>
            {t('settings.notifications.permissionUnsupported')}
          </Text>
        )}
        <View style={{ marginBottom: 16 }} />

        {/* FREQUENCY */}
        <Heading>{t('settings.notifications.frequencyHeading')}</Heading>
        <View style={{ backgroundColor: dark.paper2, borderWidth: 1, borderColor: dark.line, borderRadius: 18, overflow: 'hidden', marginBottom: 16 }}>
          {FREQUENCY_OPTIONS.map((opt, idx) => {
            const selected = frequency === opt.value;
            return (
              <Pressable
                key={opt.value}
                testID={`notif-freq-${opt.value}`}
                accessibilityRole="button"
                accessibilityState={{ selected, disabled: !enabled }}
                disabled={!enabled}
                onPress={() => { setNotificationFrequency(opt.value); void syncNotificationPrefs(); }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderBottomWidth: idx < FREQUENCY_OPTIONS.length - 1 ? 1 : 0,
                  borderBottomColor: dark.line,
                  opacity: enabled ? 1 : 0.5,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: selected ? '600' : '400', color: selected ? dark.brick : dark.ink }}>{t(opt.labelKey)}</Text>
                {selected && <Text style={{ color: dark.brick }}>•</Text>}
              </Pressable>
            );
          })}
        </View>

        {/* DAYS */}
        <Heading id="notif-days-label">{t('settings.notifications.daysHeading')}</Heading>
        <View testID="notif-day-picker" accessibilityLabel={t('settings.notifications.daysHeading')} style={{ flexDirection: 'row', gap: 6, marginBottom: 16 }}>
          {DAY_LABELS.map((label, idx) => {
            const on = days[idx];
            return (
              <Pressable
                key={`day-${idx}`}
                testID={`notif-day-${idx}`}
                accessibilityRole="button"
                accessibilityState={{ selected: on, disabled: !enabled }}
                accessibilityLabel={t('settings.notifications.dayAria', { label })}
                disabled={!enabled}
                onPress={() => { toggleNotificationDay(idx); void syncNotificationPrefs(); }}
                style={{ flex: 1, borderRadius: 999, overflow: 'hidden', opacity: enabled ? 1 : 0.5 }}
              >
                {on ? (
                  <LinearGradient colors={[accent.volt, accent.aqua]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingVertical: 8, alignItems: 'center' }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: dark.onAccent }}>{label}</Text>
                  </LinearGradient>
                ) : (
                  <View style={{ paddingVertical: 8, alignItems: 'center', backgroundColor: SURFACE_2, borderWidth: 1, borderColor: dark.line, borderRadius: 999 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: dark.ink2 }}>{label}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* REMINDER TIME */}
        <Heading>{t('settings.notifications.reminderTimeHeading')}</Heading>
        <View style={{ backgroundColor: dark.paper2, borderWidth: 1, borderColor: dark.line, borderRadius: 18, padding: 16, marginBottom: 16 }}>
          <TextInput
            testID="notif-time-input"
            value={time}
            editable={enabled}
            onChangeText={(v) => { setNotificationTime(v || time); void syncNotificationPrefs(); }}
            placeholder="HH:MM"
            placeholderTextColor={dark.ink3}
            accessibilityLabel={t('settings.notifications.reminderTimeAria')}
            className="font-mono"
            style={{
              backgroundColor: SURFACE_2,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: dark.line,
              paddingHorizontal: 12,
              paddingVertical: 8,
              color: dark.ink,
              fontSize: 16,
              opacity: enabled ? 1 : 0.5,
            }}
          />
        </View>

        {/* TRAINING events */}
        <Heading>{t('settings.notifications.trainingHeading')}</Heading>
        <View testID="notif-events-antrenament" style={{ backgroundColor: dark.paper2, borderWidth: 1, borderColor: dark.line, borderRadius: 18, overflow: 'hidden', marginBottom: 16 }}>
          {NOTIF_EVENTS_ANTRENAMENT.map((ev, idx) => (
            <NotifEventRow key={ev.key} event={ev} checked={eventStates[ev.key] ?? ev.defaultOn} onToggle={() => toggleEvent(ev.key)} disabled={!enabled} isLast={idx === NOTIF_EVENTS_ANTRENAMENT.length - 1} />
          ))}
        </View>

        {/* COACHING events */}
        <Heading>{t('settings.notifications.coachingHeading')}</Heading>
        <View testID="notif-events-coaching" style={{ backgroundColor: dark.paper2, borderWidth: 1, borderColor: dark.line, borderRadius: 18, overflow: 'hidden', marginBottom: 16 }}>
          {NOTIF_EVENTS_COACHING.map((ev, idx) => (
            <NotifEventRow key={ev.key} event={ev} checked={eventStates[ev.key] ?? ev.defaultOn} onToggle={() => toggleEvent(ev.key)} disabled={!enabled} isLast={idx === NOTIF_EVENTS_COACHING.length - 1} />
          ))}
        </View>

        {/* QUIET HOURS (read-only info) */}
        <Heading>{t('settings.notifications.quietHoursHeading')}</Heading>
        <View testID="notif-quiet-hours" style={{ backgroundColor: dark.paper2, borderWidth: 1, borderColor: dark.line, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 14, color: dark.ink }}>{t('settings.notifications.doNotDisturb')}</Text>
            <Text className="font-mono" style={{ fontSize: 14, color: dark.ink2 }}>{t('settings.notifications.quietHoursRange')}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function PermissionNotice({ testID, text }: { testID: string; text: string }) {
  return (
    <View
      testID={testID}
      accessibilityRole="text"
      style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: dark.line, backgroundColor: SURFACE_2, marginBottom: 16 }}
    >
      <AlertCircle size={16} color={dark.ink} />
      <Text style={{ flex: 1, fontSize: 12, color: dark.ink2, lineHeight: 18 }}>{text}</Text>
    </View>
  );
}

interface NotifEventRowProps {
  event: NotifEvent;
  checked: boolean;
  disabled: boolean;
  isLast: boolean;
  onToggle: () => void;
}

function NotifEventRow({ event, checked, disabled, isLast, onToggle }: NotifEventRowProps) {
  const title = t(event.titleKey);
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: dark.line,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: dark.ink, marginBottom: 2 }}>{title}</Text>
        <Text style={{ fontSize: 12, color: dark.ink2 }}>{t(event.descKey)}</Text>
      </View>
      <Toggle checked={checked} onToggle={onToggle} ariaLabel={title} testId={event.testId} disabled={disabled} />
    </View>
  );
}
