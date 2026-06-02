// ══ SETTINGS PRIVACY (RN port, W6b) ══════════════════════════════════════
// RN twin of src/react/routes/screens/cont/SettingsPrivacy.tsx. Data-export
// consent + telemetry opt-in toggles (settingsStore) + the live GDPR Privacy
// Policy article (§A025). Store wires + i18n keys (incl. tArray policy lists) +
// testIDs verbatim; markup → RN, shared Toggle. The inline mailto anchors
// (privacy@andura.app) → inline pressable Text → Linking.openURL.

import { View, Text, ScrollView, Linking } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { useSettingsStore } from '../../../../src/react/stores/settingsStore';
import { t, tArray } from '../../../../src/i18n/index.js';
import { SubHeader } from '../../../components/SubHeader';
import { Toggle } from '../../../components/Toggle';
import { Card } from '../../../components/cont/fields';
import { goto } from '../../../lib/nav';
import { dark } from '../../../lib/tokens';

const PRIVACY_EMAIL = 'privacy@andura.app';

function ToggleRow({
  testID,
  title,
  desc,
  checked,
  onToggle,
  isLast = false,
}: {
  testID: string;
  title: string;
  desc: string;
  checked: boolean;
  onToggle: () => void;
  isLast?: boolean;
}) {
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
      }}
    >
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 14, fontWeight: '500', color: dark.ink, marginBottom: 2 }}>{title}</Text>
        <Text style={{ fontSize: 12, color: dark.ink2, lineHeight: 18 }}>{desc}</Text>
      </View>
      <Toggle checked={checked} onToggle={onToggle} ariaLabel={title} testId={testID} />
    </View>
  );
}

function H3({ children }: { children: string }) {
  return <Text style={{ fontSize: 14, fontWeight: '600', color: dark.ink, marginTop: 12, marginBottom: 6 }}>{children}</Text>;
}

function PolicyList({ items }: { items: string[] }) {
  return (
    <View style={{ gap: 4, marginBottom: 12, paddingLeft: 8 }}>
      {items.map((it, i) => (
        <Text key={i} style={{ fontSize: 14, color: dark.ink2, lineHeight: 21 }}>{`•  ${it}`}</Text>
      ))}
    </View>
  );
}

// Render a policy paragraph that contains a single mailto link token, splitting
// __EMAIL__ into an inline pressable Text (mirrors the web split().flatMap()).
function MailtoPara({ bodyKey }: { bodyKey: string }) {
  const segs = t(bodyKey, { email: '__EMAIL__' }).split('__EMAIL__');
  return (
    <Text style={{ fontSize: 14, color: dark.ink2, lineHeight: 21, marginBottom: 12 }}>
      {segs.flatMap((seg, i, arr) =>
        i < arr.length - 1
          ? [
              seg,
              <Text
                key={`mail-${i}`}
                onPress={() => { void Linking.openURL(`mailto:${PRIVACY_EMAIL}`); }}
                style={{ color: dark.brick, textDecorationLine: 'underline' }}
              >
                {PRIVACY_EMAIL}
              </Text>,
            ]
          : [seg],
      )}
    </Text>
  );
}

export default function SettingsPrivacy() {
  const dataExport = useSettingsStore((s) => s.dataExportConsent);
  const telemetry = useSettingsStore((s) => s.telemetryOptIn);
  const setDataExportConsent = useSettingsStore((s) => s.setDataExportConsent);
  const setTelemetryOptIn = useSettingsStore((s) => s.setTelemetryOptIn);

  const collectItems = tArray('settings.privacy.policy.collectItems');
  const useItems = tArray('settings.privacy.policy.useItems');
  const rightsItems = tArray('settings.privacy.policy.rightsItems');

  return (
    <View testID="settings-privacy" style={{ flex: 1, backgroundColor: dark.paper }}>
      <SubHeader
        title={t('settings.privacy.title')}
        onBack={() => goto('cont')}
        testIdBack="settings-privacy-back"
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <ShieldCheck size={20} color={dark.brick} />
          <Text style={{ flex: 1, fontSize: 14, color: dark.ink2, lineHeight: 20 }}>{t('settings.privacy.headerSubtitle')}</Text>
        </View>

        <Card style={{ marginBottom: 16 }}>
          <ToggleRow
            testID="privacy-data-export-toggle"
            title={t('settings.privacy.exportToggleTitle')}
            desc={t('settings.privacy.exportToggleDesc')}
            checked={dataExport}
            onToggle={() => setDataExportConsent(!dataExport)}
          />
          <ToggleRow
            testID="privacy-telemetry-toggle"
            title={t('settings.privacy.telemetryToggleTitle')}
            desc={t('settings.privacy.telemetryToggleDesc')}
            checked={telemetry}
            onToggle={() => setTelemetryOptIn(!telemetry)}
            isLast
          />
        </Card>

        <Text style={{ fontSize: 12, color: dark.ink2, lineHeight: 18 }}>{t('settings.privacy.footerNote')}</Text>

        {/* §A025 — live GDPR Privacy Policy content. */}
        <View testID="privacy-policy-content" style={{ marginTop: 24, paddingTop: 20, borderTopWidth: 1, borderTopColor: dark.line }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: dark.ink, marginBottom: 12 }}>{t('settings.privacy.policy.title')}</Text>

          <H3>{t('settings.privacy.policy.collectHeading')}</H3>
          <PolicyList items={collectItems} />

          <H3>{t('settings.privacy.policy.useHeading')}</H3>
          <PolicyList items={useItems} />

          <H3>{t('settings.privacy.policy.rightsHeading')}</H3>
          <PolicyList items={rightsItems} />

          <H3>{t('settings.privacy.policy.storageHeading')}</H3>
          <MailtoPara bodyKey="settings.privacy.policy.storageBody" />

          <H3>{t('settings.privacy.policy.sensitiveHeading')}</H3>
          <Text style={{ fontSize: 14, color: dark.ink2, lineHeight: 21, marginBottom: 12 }}>{t('settings.privacy.policy.sensitiveBody')}</Text>

          <H3>{t('settings.privacy.policy.subprocessorsHeading')}</H3>
          <Text style={{ fontSize: 14, color: dark.ink2, lineHeight: 21, marginBottom: 12 }}>{t('settings.privacy.policy.subprocessorsBody')}</Text>

          <H3>{t('settings.privacy.policy.contactHeading')}</H3>
          <MailtoPara bodyKey="settings.privacy.policy.contactBody" />

          <Text style={{ fontSize: 12, color: dark.ink2, marginTop: 16 }}>{t('settings.privacy.policy.version')}</Text>
        </View>
      </ScrollView>
    </View>
  );
}
