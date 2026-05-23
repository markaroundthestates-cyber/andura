// ══ LOG WEIGHT — Phase 4 task_16 §A Daily Weight Entry Screen ════════════
// Mockup wv2 verbatim (andura-clasic.html#L2393-2411 screen-log-weight):
//   - Title: "Logheaza greutate"
//   - Field: "Greutate (kg)" placeholder "ex. 78.5" min=30 max=250 step=0.1
//   - Field: "Data" date input
//   - Helper: "Inregistrarea este salvata local. Vei vedea evolutia in
//     Greutate si BF."
//   - Button primary: "Salveaza"
//   - Button secondary: "Anuleaza"
//
// Validation: kg range 30-250 per mockup attributes. Empty input blocks save.

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

export function LogWeight(): JSX.Element {
  const navigate = useNavigate();
  const addWeightEntry = useProgresStore((s) => s.addWeightEntry);

  const [kg, setKg] = useState<string>('');
  const [date, setDate] = useState<string>(todayIso());

  const kgNum = Number(kg);
  const valid = kg !== '' && kgNum >= 30 && kgNum <= 250 && date !== '';

  // A11Y HIGH chat5 — surface validation error inline pentru screen reader
  // Maria/Gigel users. Show only daca user typed value out-of-range (NU pe
  // empty initial state, NU pe valid input). WCAG SC 3.3.1 + 3.3.3.
  const kgError =
    kg !== '' && (!Number.isFinite(kgNum) || kgNum < 30 || kgNum > 250)
      ? 'Kg intre 30 si 250.'
      : null;
  const dateError = date === '' ? 'Data necesara.' : null;

  function handleSave(): void {
    if (!valid) return;
    addWeightEntry({ kg: kgNum, date });
    navigate(gotoPath('progres'));
  }

  function handleCancel(): void {
    navigate(gotoPath('progres'));
  }

  return (
    <section
      className="p-6 bg-paper min-h-screen flex flex-col"
      data-testid="log-weight"
    >
      <header className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={handleCancel}
          aria-label="Inapoi"
          data-testid="log-weight-back"
          className="p-2 rounded-full text-ink2"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        </button>
        <h1 className="text-2xl font-semibold text-ink">Logheaza greutate</h1>
      </header>

      <div className="flex flex-col gap-5 flex-1">
        <div>
          <label
            htmlFor="weight-kg"
            className="text-sm text-ink2 font-medium block mb-2"
          >
            Greutate (kg) *
          </label>
          <input
            id="weight-kg"
            type="number"
            required
            aria-required="true"
            aria-invalid={kgError ? 'true' : undefined}
            aria-describedby={kgError ? 'weight-kg-error' : undefined}
            value={kg}
            onChange={(e) => setKg(e.target.value)}
            placeholder="ex. 78.5"
            step="0.1"
            min={30}
            max={250}
            inputMode="decimal"
            data-testid="weight-kg-input"
            className="w-full p-4 border border-lineStrong rounded-[14px] text-2xl font-semibold text-center bg-paper2 text-ink font-mono"
          />
          {kgError && (
            <p
              id="weight-kg-error"
              role="alert"
              data-testid="weight-kg-error"
              className="mt-2 text-sm text-danger"
            >
              {kgError}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="weight-date"
            className="text-sm text-ink2 font-medium block mb-2"
          >
            Data *
          </label>
          <input
            id="weight-date"
            type="date"
            required
            aria-required="true"
            aria-invalid={dateError ? 'true' : undefined}
            aria-describedby={dateError ? 'weight-date-error' : undefined}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            data-testid="weight-date-input"
            className="w-full p-3 border border-lineStrong rounded-xl bg-paper2 text-base text-ink"
          />
          {dateError && (
            <p
              id="weight-date-error"
              role="alert"
              data-testid="weight-date-error"
              className="mt-2 text-sm text-danger"
            >
              {dateError}
            </p>
          )}
        </div>

        <p className="text-sm text-ink2 leading-relaxed">
          Inregistrarea este salvata local. Vei vedea evolutia in Greutate si BF.
        </p>

        <div className="flex-1" />

        <button
          type="button"
          onClick={handleSave}
          disabled={!valid}
          data-testid="weight-save"
          className="w-full py-4 bg-brick text-paper rounded-[14px] text-base font-semibold disabled:opacity-50"
        >
          Salveaza
        </button>
        <button
          type="button"
          onClick={handleCancel}
          data-testid="weight-cancel"
          className="w-full py-3 text-ink2 text-sm"
        >
          Anuleaza
        </button>
      </div>
    </section>
  );
}
