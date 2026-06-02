// ══ CONT — shared CONFIRM drill-down scaffold (RN port, W6b) ═════════════════
// RN twin of the universal D047 confirm-screen pattern (mockup §11 LOCKED V1)
// shared by every cont confirm screen (LogoutConfirm / DeleteAccountConfirm /
// RedoOnboardingConfirm / ResetCoachConfirm / ResetDataConfirm). Each web file
// repeated the SAME markup — SubHeader + centered glass card + icon disc +
// heading + two body paragraphs + accept/cancel buttons — differing only by
// icon, copy, button accent, and the danger flag. This factors that out ONCE so
// the leaf screens stay tiny (logic + handlers only).
//
// The accept button has two looks, mirroring the web `.btn-grad` (volt→aqua
// gradient — for non-destructive / "go" actions like Redo onboarding & Schimba
// faza) vs `bg-danger text-white` (the warm danger fill — for Logout / Delete /
// Reset). Cancel is always the neutral hairline pill.

import type { ReactNode } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SubHeader } from '../SubHeader';
import { Card } from './fields';
import { dark, accent, withAlpha } from '../../lib/tokens';

// global.css [data-theme="dark"] L216 --danger (Pulse ember-red, 7.85:1 AA).
const DANGER = '#ff7d6a';

export type ConfirmAccentVariant = 'gradient' | 'danger';

interface ConfirmScreenProps {
  /** data-testid on the section root (web parity). */
  testID: string;
  /** SubHeader title (i18n string). */
  title: string;
  /** SubHeader back testID + cancel handler. */
  backTestID: string;
  onCancel: () => void;
  /** Header danger flag → brick-red title (Delete only). */
  dangerHeader?: boolean;
  /** Icon node (lucide-react-native glyph) rendered in the disc. */
  icon: ReactNode;
  /** Danger disc → brick-tinted pebble; otherwise neutral glass. */
  dangerDisc?: boolean;
  heading: string;
  /** Optional extra content between the body paragraphs and the buttons
   *  (e.g. SchimbaFaza phase selector). */
  children?: ReactNode;
  /** Body paragraphs (already translated). */
  body: string[];
  acceptLabel: string;
  acceptTestID: string;
  acceptVariant: ConfirmAccentVariant;
  onAccept: () => void;
  cancelLabel: string;
  cancelTestID: string;
}

export function ConfirmScreen({
  testID,
  title,
  backTestID,
  onCancel,
  dangerHeader = false,
  icon,
  dangerDisc = false,
  heading,
  children,
  body,
  acceptLabel,
  acceptTestID,
  acceptVariant,
  onAccept,
  cancelLabel,
  cancelTestID,
}: ConfirmScreenProps) {
  return (
    <View testID={testID} style={{ flex: 1, backgroundColor: dark.paper }}>
      <SubHeader title={title} onBack={onCancel} testIdBack={backTestID} danger={dangerHeader} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 8, paddingHorizontal: 24, paddingBottom: 24, alignItems: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={{ width: '100%', maxWidth: 384, marginTop: 8, padding: 24, alignItems: 'center' }}>
          {/* Icon disc — neutral glass pebble, or a brick-tinted danger pebble. */}
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              backgroundColor: dangerDisc ? withAlpha(DANGER, 0.14) : dark.paper2,
              borderWidth: dangerDisc ? 1 : 0,
              borderColor: dangerDisc ? withAlpha(DANGER, 0.3) : 'transparent',
            }}
          >
            {icon}
          </View>

          <Text
            className="font-display"
            style={{ fontSize: 24, fontWeight: '600', color: dark.ink, marginBottom: 12, textAlign: 'center' }}
          >
            {heading}
          </Text>

          {body.map((para, i) => (
            <Text
              key={i}
              style={{ fontSize: 14, color: dark.ink2, lineHeight: 21, marginBottom: 8, textAlign: 'center' }}
            >
              {para}
            </Text>
          ))}

          {children}

          <View style={{ width: '100%', marginTop: 32, gap: 12 }}>
            <Pressable
              testID={acceptTestID}
              accessibilityRole="button"
              onPress={onAccept}
              style={{ borderRadius: 999, overflow: 'hidden' }}
            >
              {acceptVariant === 'gradient' ? (
                <LinearGradient
                  colors={[accent.volt, accent.aqua]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ paddingVertical: 16, alignItems: 'center' }}
                >
                  <Text style={{ fontSize: 16, fontWeight: '600', color: dark.onAccent }}>{acceptLabel}</Text>
                </LinearGradient>
              ) : (
                <View style={{ paddingVertical: 16, alignItems: 'center', backgroundColor: DANGER }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#ffffff' }}>{acceptLabel}</Text>
                </View>
              )}
            </Pressable>

            <Pressable
              testID={cancelTestID}
              accessibilityRole="button"
              onPress={onCancel}
              style={{
                paddingVertical: 16,
                alignItems: 'center',
                borderRadius: 999,
                borderWidth: 1,
                borderColor: dark.line,
                backgroundColor: dark.paper2,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '500', color: dark.ink }}>{cancelLabel}</Text>
            </Pressable>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
