// ══ MEDICAL DISCLAIMER MODAL (RN port) — pre-Beta safety gate ═════════════
// RN twin of src/react/components/MedicalDisclaimerModal.tsx. User MUST
// acknowledge before sessions. Same props (open / onAcknowledge / onCancel),
// same testIDs (disclaimer-backdrop / -modal / -title / -acknowledge /
// -cancel), same i18n keys. RN <Modal> traps focus + handles the hardware back
// button (Android) → onRequestClose; when onCancel is absent (the always-mounted
// Layout gate) back is inert (preserves the web's "Escape inert without
// onCancel" contract). The web focus-trap is the Modal's native behavior.

import { Modal, View, Text, Pressable, ScrollView } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { dark } from '../lib/tokens';
import { t } from '../../src/i18n/index.js';

interface MedicalDisclaimerModalProps {
  open: boolean;
  onAcknowledge: () => void;
  onCancel?: () => void;
}

export function MedicalDisclaimerModal({
  open,
  onAcknowledge,
  onCancel,
}: MedicalDisclaimerModalProps) {
  if (!open) return null;
  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <View
        testID="disclaimer-backdrop"
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.7)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <View
          testID="disclaimer-modal"
          accessibilityViewIsModal
          accessibilityLabel={t('medicalDisclaimer.title')}
          className="bg-paper"
          style={{ width: '100%', maxWidth: 448, maxHeight: '80%', borderRadius: 16, padding: 24 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <AlertCircle size={24} color={dark.brick} />
            <Text
              testID="disclaimer-title"
              style={{ fontSize: 16, fontWeight: '700', color: dark.ink, flex: 1 }}
            >
              {t('medicalDisclaimer.title')}
            </Text>
          </View>

          <ScrollView style={{ marginBottom: 24 }}>
            <View style={{ gap: 12 }}>
              <Text style={{ fontSize: 14, color: dark.ink2 }}>{t('medicalDisclaimer.p1')}</Text>
              <Text style={{ fontSize: 14, color: dark.ink2 }}>{t('medicalDisclaimer.p2')}</Text>
              <Text style={{ fontSize: 14, color: dark.ink2 }}>{t('medicalDisclaimer.p3')}</Text>
              <Text style={{ fontSize: 12, fontStyle: 'italic', color: dark.ink2 }}>
                {t('medicalDisclaimer.p4')}
              </Text>
            </View>
          </ScrollView>

          <Pressable
            testID="disclaimer-acknowledge"
            accessibilityRole="button"
            onPress={onAcknowledge}
            className="bg-brick"
            style={{ paddingVertical: 12, borderRadius: 14, alignItems: 'center', marginBottom: 8 }}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: dark.paper }}>
              {t('medicalDisclaimer.acknowledgeCta')}
            </Text>
          </Pressable>
          {onCancel && (
            <Pressable
              testID="disclaimer-cancel"
              accessibilityRole="button"
              onPress={onCancel}
              style={{ paddingVertical: 8, alignItems: 'center' }}
            >
              <Text style={{ fontSize: 14, color: dark.ink2 }}>
                {t('medicalDisclaimer.backCta')}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}
