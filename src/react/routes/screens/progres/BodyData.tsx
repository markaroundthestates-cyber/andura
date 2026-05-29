// ══ BODY DATA — Phase 4 task_16 §B Body Measurements Entry Screen ════════
// Mockup wv2 NU has dedicated screen-body-data section (Phase 4 NEW screen
// din spec §B — measurements list standard fitness app pattern).
//
// WORDING DISCIPLINE: Mockup verbatim absent pentru per-field labels.
// Romanian terms used (talie / gat / piept / sold / biceps / coapsa)
// standard fitness vocabulary.
//
// Validation: partial entries OK (NU all fields required per spec §B
// "partial entry valid"). Per-field bounds realiste (smoke 2026-05-28: app
// accepta 250cm biceps absurd) — fiecare camp are min/max fiziologic + JS
// clamp pe save + eroare RO la out-of-range.

import type { JSX } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useProgresStore } from '../../../stores/progresStore';
import { gotoPath } from '../../../lib/navigation';
import { t } from '../../../../i18n/index.js';

function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

type FieldKey = 'waistCm' | 'neckCm' | 'chestCm' | 'hipsCm' | 'bicepsCm' | 'thighCm';

interface MeasureField {
  key: FieldKey;
  /** i18n key suffix under `progres.bodyData.fields.*` for the field label. */
  labelKey: 'waist' | 'neck' | 'chest' | 'hips' | 'biceps' | 'thigh';
  // Bounds fiziologic realist (smoke 2026-05-28). Banda larga acopera
  // populatia adulta normala + bodybuilder + supraponderal, dar respinge
  // valori absurde (biceps 250cm = unit confusion, biceps 5cm = NU adult).
  min: number;
  max: number;
}

// Bounds per camp — fiecare are banda fiziologic plauzibila pentru adult.
// Smoke 2026-05-28: limita comuna 20-250 cm accepta biceps 250cm absurd
// (record mondial documentat biceps ~63cm). Banda stransa per camp respinge.
const MEASURE_FIELDS: readonly MeasureField[] = [
  { key: 'waistCm', labelKey: 'waist', min: 50, max: 200 },
  { key: 'neckCm', labelKey: 'neck', min: 25, max: 60 },
  { key: 'chestCm', labelKey: 'chest', min: 60, max: 150 },
  { key: 'hipsCm', labelKey: 'hips', min: 60, max: 200 },
  { key: 'bicepsCm', labelKey: 'biceps', min: 20, max: 60 },
  { key: 'thighCm', labelKey: 'thigh', min: 30, max: 90 },
];

export function BodyData(): JSX.Element {
  const navigate = useNavigate();
  const addBodyDataEntry = useProgresStore((s) => s.addBodyDataEntry);

  const [values, setValues] = useState<Record<FieldKey, string>>({
    waistCm: '',
    neckCm: '',
    chestCm: '',
    hipsCm: '',
    bicepsCm: '',
    thighCm: '',
  });
  const [date, setDate] = useState<string>(todayIso());

  function setField(key: FieldKey, val: string): void {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  // A11Y HIGH chat5 — surface range validation error per field pentru screen
  // reader Maria/Gigel. Partial entry OK (NU all required), deci error doar
  // cand user typed value out-of-range. Bounds per camp (smoke 2026-05-28).
  // WCAG SC 3.3.1 + 3.3.3.
  function fieldError(field: MeasureField): string | null {
    const v = values[field.key];
    if (v === '') return null;
    const n = Number(v);
    if (!Number.isFinite(n) || n < field.min || n > field.max) {
      return t('progres.bodyData.rangeError', { min: field.min, max: field.max });
    }
    return null;
  }

  // Partial entry OK — save passes only filled numeric fields in-bounds.
  // Out-of-range field face save un no-op (alaturi de display-ul de eroare).
  const hasAnyValidValue = MEASURE_FIELDS.some((f) => {
    const v = values[f.key];
    if (v === '') return false;
    const n = Number(v);
    return Number.isFinite(n) && n >= f.min && n <= f.max;
  });
  const hasAnyError = MEASURE_FIELDS.some((f) => fieldError(f) !== null);

  function handleSave(): void {
    if (!hasAnyValidValue) return;
    if (hasAnyError) return; // smoke 2026-05-28: NU salva out-of-range
    const entry: { date: string; [k: string]: number | string | undefined } = { date };
    for (const f of MEASURE_FIELDS) {
      const raw = values[f.key];
      if (raw === '') continue;
      const n = Number(raw);
      if (Number.isFinite(n) && n >= f.min && n <= f.max) {
        entry[f.key] = n;
      }
    }
    addBodyDataEntry(entry as Parameters<typeof addBodyDataEntry>[0]);
    navigate(gotoPath('progres'));
  }

  function handleCancel(): void {
    navigate(gotoPath('progres'));
  }

  return (
    <section
      className="p-6 bg-paper min-h-screen flex flex-col"
      data-testid="body-data"
    >
      <header className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={handleCancel}
          aria-label={t('progres.bodyData.backAriaLabel')}
          data-testid="body-data-back"
          className="p-2 rounded-full text-ink2"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        </button>
        <h1 className="text-2xl font-bold text-ink">{t('progres.bodyData.title')}</h1>
      </header>

      <div className="flex flex-col gap-4 flex-1">
        {MEASURE_FIELDS.map((field) => {
          const err = fieldError(field);
          return (
            <div key={field.key}>
              <label
                htmlFor={`bd-${field.key}`}
                className="text-sm text-ink2 font-medium block mb-1"
              >
                {t('progres.bodyData.fieldLabel', {
                  field: t(`progres.bodyData.fields.${field.labelKey}`),
                })}
              </label>
              <input
                id={`bd-${field.key}`}
                type="number"
                aria-invalid={err ? 'true' : undefined}
                aria-describedby={err ? `bd-${field.key}-error` : undefined}
                value={values[field.key]}
                onChange={(e) => setField(field.key, e.target.value)}
                step="0.1"
                min={field.min}
                max={field.max}
                inputMode="decimal"
                data-testid={`bd-${field.key}`}
                className="w-full p-3 border border-lineStrong rounded-xl bg-paper2 text-base text-ink"
              />
              {err && (
                <p
                  id={`bd-${field.key}-error`}
                  role="alert"
                  data-testid={`bd-${field.key}-error`}
                  className="mt-2 text-sm text-danger"
                >
                  {err}
                </p>
              )}
            </div>
          );
        })}

        <div>
          <label
            htmlFor="bd-date"
            className="text-sm text-ink2 font-medium block mb-1"
          >
            {t('progres.bodyData.dateLabel')}
          </label>
          <input
            id="bd-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            // U-15 — max=azi blocheaza logare pe data viitoare.
            max={todayIso()}
            data-testid="bd-date-input"
            className="w-full p-3 border border-lineStrong rounded-xl bg-paper2 text-base text-ink"
          />
        </div>

        <div className="flex-1" />

        <button
          type="button"
          onClick={handleSave}
          disabled={!hasAnyValidValue || hasAnyError}
          data-testid="body-data-save"
          className="w-full py-4 bg-brick text-paper rounded-[14px] text-base font-semibold disabled:opacity-50"
        >
          {t('progres.bodyData.saveCta')}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          data-testid="body-data-cancel"
          className="w-full py-3 text-ink2 text-sm"
        >
          {t('progres.bodyData.cancelCta')}
        </button>
      </div>
    </section>
  );
}
