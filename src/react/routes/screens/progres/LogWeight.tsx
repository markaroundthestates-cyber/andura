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
import { sanitizeNum } from '../../../components/ui/NumberField';
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
      ? t('progres.logWeight.kgError')
      : null;
  const dateError = date === '' ? t('progres.logWeight.dateError') : null;

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
      className="p-6 min-h-screen flex flex-col"
      data-testid="log-weight"
    >
      <header className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={handleCancel}
          aria-label={t('progres.logWeight.backAriaLabel')}
          data-testid="log-weight-back"
          className="p-2 rounded-full text-ink2"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        </button>
        <h1 className="font-display text-2xl font-bold text-ink">{t('progres.logWeight.title')}</h1>
      </header>

      <div className="flex flex-col gap-5 flex-1">
        <div>
          <label
            htmlFor="weight-kg"
            className="text-sm text-ink2 font-medium block mb-2"
          >
            {t('progres.logWeight.kgLabel')}
          </label>
          {/* Pulse hero input — the big display weight value lives in a floating
              pulse-card; the field itself sits on the elevated --surface-2 glass
              with text-ink so it reads on BOTH dark and light (no hardcoded light
              surface). Unit label below as a mono kicker (mockup L116-119). */}
          <div className="pulse-card px-4 py-5 text-center">
            {/* SELECT-ALL-ON-TAP + decimal-safe (2026-06-07, same fix as the
                set-log inputs): type="number" .select() is a no-op so tapping
                never selected-all → first keystroke inserted ("78"→"7895").
                type="text" + inputMode="decimal" keeps the numeric keypad AND
                lets onFocus .select() work; sanitizeNum keeps one decimal
                (78.5). The string `kg` IS the buffer; range validation
                (30-250) stays in `valid` / `kgError`. */}
            <input
              id="weight-kg"
              type="text"
              required
              aria-required="true"
              aria-invalid={kgError ? 'true' : undefined}
              aria-describedby={kgError ? 'weight-kg-error' : undefined}
              value={kg}
              onChange={(e) => setKg(sanitizeNum(e.target.value, true))}
              onFocus={(e) => e.currentTarget.select()}
              placeholder={t('progres.logWeight.kgPlaceholder')}
              inputMode="decimal"
              data-testid="weight-kg-input"
              className="w-full bg-transparent border-none outline-none text-center font-display text-5xl font-bold text-ink placeholder:text-ink3"
            />
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink2 mt-1.5">
              kg
            </div>
          </div>
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
            {t('progres.logWeight.dateLabel')}
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
            // U-15 — max=azi blocheaza logare pe data viitoare.
            max={todayIso()}
            data-testid="weight-date-input"
            className="w-full p-3 rounded-xl border border-line bg-[var(--surface-2)] text-base text-ink"
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
          {t('progres.logWeight.helper')}
        </p>

        <div className="flex-1" />

        <button
          type="button"
          onClick={handleSave}
          disabled={!valid}
          data-testid="weight-save"
          className="btn-primary-lift btn-grad w-full py-4 rounded-full text-base font-semibold disabled:opacity-50"
        >
          {t('progres.logWeight.saveCta')}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          data-testid="weight-cancel"
          className="w-full py-3 text-ink3 text-sm"
        >
          {t('progres.logWeight.cancelCta')}
        </button>
      </div>
    </section>
  );
}
