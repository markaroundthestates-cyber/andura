// ══ SETTINGS PRIVACY — Phase 6 task_14 Cont Sub-Screen ═══════════════════
// Data export consent + crash-reporting toggles. Crash reporting (telemetryOptIn)
// is DEFAULT-ON (founder pick 2026-06-12) — always-on PII-scrubbed Sentry crash
// reports; the user opts OUT here. Data export consent default TRUE (user can
// revoke). Both persist + survive reload/PWA-update via settingsStore.

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useSettingsStore } from '../../../stores/settingsStore';
import { gotoPath } from '../../../lib/navigation';
import { SubHeader } from '../../../components/SubHeader';
import { Toggle } from '../../../components/Toggle';
import { t, tArray } from '../../../../i18n/index.js';

// Pass 9 polish — ToggleRow shell wraps shared <Toggle> per mockup parity
// (.sw canonical L2973-2976). Toggle button extracted la components/Toggle.
interface ToggleRowProps {
  testId: string;
  title: string;
  desc: string;
  checked: boolean;
  onToggle: () => void;
}

function ToggleRow({ testId, title, desc, checked, onToggle }: ToggleRowProps): JSX.Element {
  return (
    <div className="flex items-start gap-3 px-4 py-3.5 border-b border-line last:border-b-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink mb-0.5">{title}</p>
        <p className="text-xs text-ink2 leading-snug">{desc}</p>
      </div>
      <Toggle
        checked={checked}
        onToggle={onToggle}
        ariaLabel={title}
        testId={testId}
      />
    </div>
  );
}

// Account-regroup 2026-06-12 — `embedded` strips the SubHeader + full-screen
// root so the "Confidentialitate & termeni" hub can host this body.
export function SettingsPrivacy({ embedded = false }: { embedded?: boolean } = {}): JSX.Element {
  const navigate = useNavigate();
  const dataExport = useSettingsStore((s) => s.dataExportConsent);
  const telemetry = useSettingsStore((s) => s.telemetryOptIn);
  const setDataExportConsent = useSettingsStore((s) => s.setDataExportConsent);
  const setTelemetryOptIn = useSettingsStore((s) => s.setTelemetryOptIn);

  const collectItems = tArray('settings.privacy.policy.collectItems');
  const useItems = tArray('settings.privacy.policy.useItems');
  const rightsItems = tArray('settings.privacy.policy.rightsItems');

  return (
    <section className={embedded ? '' : 'min-h-screen flex flex-col'} data-testid="settings-privacy">
      {!embedded && (
        <SubHeader
          title={t('settings.privacy.title')}
          onBack={() => navigate(gotoPath('cont'))}
          testIdBack="settings-privacy-back"
        />
      )}

      <div className={embedded ? 'p-5' : 'flex-1 overflow-y-auto p-5'}>
        <div className="flex items-center gap-2.5 mb-4">
          <ShieldCheck className="w-5 h-5 text-brick" aria-hidden="true" />
          <p className="text-sm text-ink2 leading-snug">
            {t('settings.privacy.headerSubtitle')}
          </p>
        </div>

        <div className="pulse-card pulse-card-tight overflow-hidden mb-4">
          <ToggleRow
            testId="privacy-data-export-toggle"
            title={t('settings.privacy.exportToggleTitle')}
            desc={t('settings.privacy.exportToggleDesc')}
            checked={dataExport}
            onToggle={() => setDataExportConsent(!dataExport)}
          />
          <ToggleRow
            testId="privacy-telemetry-toggle"
            title={t('settings.privacy.telemetryToggleTitle')}
            desc={t('settings.privacy.telemetryToggleDesc')}
            checked={telemetry}
            onToggle={() => setTelemetryOptIn(!telemetry)}
          />
        </div>

        <p className="text-xs text-ink2 leading-snug">
          {t('settings.privacy.footerNote')}
        </p>

        {/* §A025 audit fix (NC§28-C1) — Privacy Policy live content GDPR. */}
        <article
          data-testid="privacy-policy-content"
          className="mt-6 pt-5 border-t border-line text-sm text-ink leading-relaxed"
        >
          <h2 className="text-base font-semibold mb-3">{t('settings.privacy.policy.title')}</h2>

          <h3 className="text-sm font-semibold mt-3 mb-1.5">{t('settings.privacy.policy.collectHeading')}</h3>
          <ul className="list-disc pl-5 mb-3 space-y-1 text-sm text-ink2">
            {collectItems.map((it, i) => (
              <li key={i}>{it}</li>
            ))}
          </ul>

          <h3 className="text-sm font-semibold mt-3 mb-1.5">{t('settings.privacy.policy.useHeading')}</h3>
          <ul className="list-disc pl-5 mb-3 space-y-1 text-sm text-ink2">
            {useItems.map((it, i) => (
              <li key={i}>{it}</li>
            ))}
          </ul>

          <h3 className="text-sm font-semibold mt-3 mb-1.5">{t('settings.privacy.policy.rightsHeading')}</h3>
          <ul className="list-disc pl-5 mb-3 space-y-1 text-sm text-ink2">
            {rightsItems.map((it, i) => (
              <li key={i}>{it}</li>
            ))}
          </ul>

          <h3 className="text-sm font-semibold mt-3 mb-1.5">{t('settings.privacy.policy.storageHeading')}</h3>
          <p className="text-sm text-ink2 mb-3">
            {/* Render the email as a real mailto anchor (not just an
                interpolation token) so links auto-detect / mailto handoff
                works on touch devices + tests can assert the link exists. */}
            {t('settings.privacy.policy.storageBody', { email: '__EMAIL__' })
              .split('__EMAIL__')
              .flatMap((seg, i, arr) =>
                i < arr.length - 1
                  ? [
                      seg,
                      <a
                        key={`storage-${i}`}
                        href="mailto:privacy@andura.app"
                        className="text-brick underline"
                      >
                        privacy@andura.app
                      </a>,
                    ]
                  : [seg]
              )}
          </p>

          {/* §28-H6 audit fix — Medical data Art. 9 special category boundary. */}
          <h3 className="text-sm font-semibold mt-3 mb-1.5">{t('settings.privacy.policy.sensitiveHeading')}</h3>
          <p className="text-sm text-ink2 mb-3">{t('settings.privacy.policy.sensitiveBody')}</p>

          <h3 className="text-sm font-semibold mt-3 mb-1.5">{t('settings.privacy.policy.subprocessorsHeading')}</h3>
          <p className="text-sm text-ink2 mb-3">{t('settings.privacy.policy.subprocessorsBody')}</p>

          <h3 className="text-sm font-semibold mt-3 mb-1.5">{t('settings.privacy.policy.contactHeading')}</h3>
          <p className="text-sm text-ink2 mb-3">
            {t('settings.privacy.policy.contactBody', { email: '__EMAIL__' })
              .split('__EMAIL__')
              .flatMap((seg, i, arr) =>
                i < arr.length - 1
                  ? [
                      seg,
                      <a
                        key={`contact-${i}`}
                        href="mailto:privacy@andura.app"
                        className="text-brick underline"
                      >
                        privacy@andura.app
                      </a>,
                    ]
                  : [seg]
              )}
          </p>

          <p className="text-xs text-ink2 mt-4">{t('settings.privacy.policy.version')}</p>
        </article>
      </div>
    </section>
  );
}
