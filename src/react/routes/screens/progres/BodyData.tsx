// ══ BODY DATA — Phase 4 task_16 §B Body Measurements Entry Screen ════════
// Mockup wv2 NU has dedicated screen-body-data section (Phase 4 NEW screen
// din spec §B — measurements list standard fitness app pattern).
//
// WORDING DISCIPLINE: Mockup verbatim absent pentru per-field labels.
// Romanian terms used (talie / piept / sold / biceps / coapsa) standard
// fitness vocabulary. Daniel CEO review pre-Beta wording confirm via §6
// backlog. Anti-paternalism preserved — labels minimal, NU motivational.
//
// Validation: partial entries OK (NU all fields required per spec §B
// "partial entry valid").

import type { JSX } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useProgresStore } from '../../../stores/progresStore';
import { gotoPath } from '../../../lib/navigation';

function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

interface MeasureField {
  key: 'waistCm' | 'chestCm' | 'hipsCm' | 'bicepsCm' | 'thighCm';
  label: string;
}

// PLACEHOLDER mockup absent: 5-field standard fitness measurements taxonomy.
// Daniel CEO review pre-Beta wording confirm + final list (e.g. add neck/
// forearm/calf?) per §6 backlog flag.
const MEASURE_FIELDS: readonly MeasureField[] = [
  { key: 'waistCm', label: 'Talie' },
  { key: 'chestCm', label: 'Piept' },
  { key: 'hipsCm', label: 'Sold' },
  { key: 'bicepsCm', label: 'Biceps' },
  { key: 'thighCm', label: 'Coapsa' },
];

type FieldKey = MeasureField['key'];

export function BodyData(): JSX.Element {
  const navigate = useNavigate();
  const addBodyDataEntry = useProgresStore((s) => s.addBodyDataEntry);

  const [values, setValues] = useState<Record<FieldKey, string>>({
    waistCm: '',
    chestCm: '',
    hipsCm: '',
    bicepsCm: '',
    thighCm: '',
  });
  const [date, setDate] = useState<string>(todayIso());

  function setField(key: FieldKey, val: string): void {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  // Partial entry OK — save passes only filled numeric fields.
  const hasAnyValue = Object.values(values).some((v) => v !== '' && Number(v) > 0);

  function handleSave(): void {
    if (!hasAnyValue) return;
    const entry: { date: string; [k: string]: number | string | undefined } = { date };
    (Object.keys(values) as FieldKey[]).forEach((k) => {
      const n = Number(values[k]);
      if (values[k] !== '' && n > 0) {
        entry[k] = n;
      }
    });
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
          aria-label="Inapoi"
          data-testid="body-data-back"
          className="p-2 rounded-full text-ink2"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        </button>
        <h1 className="text-2xl font-semibold text-ink">Masuratori corp</h1>
      </header>

      <div className="flex flex-col gap-4 flex-1">
        {MEASURE_FIELDS.map((field) => (
          <div key={field.key}>
            <label
              htmlFor={`bd-${field.key}`}
              className="text-sm text-ink2 font-medium block mb-1"
            >
              {field.label} (cm)
            </label>
            <input
              id={`bd-${field.key}`}
              type="number"
              value={values[field.key]}
              onChange={(e) => setField(field.key, e.target.value)}
              step="0.1"
              min={20}
              max={250}
              inputMode="decimal"
              data-testid={`bd-${field.key}`}
              className="w-full p-3 border border-[var(--line-strong)] rounded-xl bg-paper2 text-base text-ink"
            />
          </div>
        ))}

        <div>
          <label
            htmlFor="bd-date"
            className="text-sm text-ink2 font-medium block mb-1"
          >
            Data
          </label>
          <input
            id="bd-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            data-testid="bd-date-input"
            className="w-full p-3 border border-[var(--line-strong)] rounded-xl bg-paper2 text-base text-ink"
          />
        </div>

        <div className="flex-1" />

        <button
          type="button"
          onClick={handleSave}
          disabled={!hasAnyValue}
          data-testid="body-data-save"
          className="w-full py-4 bg-brick text-paper rounded-xl text-base font-semibold disabled:opacity-50"
        >
          Salveaza
        </button>
        <button
          type="button"
          onClick={handleCancel}
          data-testid="body-data-cancel"
          className="w-full py-3 text-ink2 text-sm"
        >
          Anuleaza
        </button>
      </div>
    </section>
  );
}
