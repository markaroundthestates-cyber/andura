// ══ COACH REST CARD TESTS — Bugatti Truth Invariant ══════════════════════
// MED-FIX chat5 (2026-05-23) sibling to HIGH-3 CoachTodayCard 74650a5f.
//
// Locks in: fallback null path (T0 fresh / no qualifying data) MUST NOT
// render hardcoded muscle-group claim ('Pectoralii si picioarele') NOR
// fake readiness numeric ('32/100'). Coach truth invariant — engine-
// driven specific claims OR generic non-claim fallback only.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CoachRestCard } from '../../../components/Antrenor/CoachRestCard';
import type { CoachRestReason } from '../../../lib/engineWrappers';

describe('CoachRestCard — Bugatti truth fallback', () => {
  it('renders generic non-claim line cand restReason=null (T0 fresh) — EN default', () => {
    render(
      <CoachRestCard
        onLightSession={() => {}}
        onOverride={() => {}}
        restReason={null}
      />,
    );
    // Generic fallback — non-claim, no muscle group, no fake readiness.
    // Wave C2 i18n: EN default → "Today is a recovery day".
    expect(
      screen.getByText(/Today is a recovery day/i),
    ).toBeInTheDocument();
  });

  it('NU render hardcoded muscle-group claim cand restReason=null', () => {
    const { container } = render(
      <CoachRestCard
        onLightSession={() => {}}
        onOverride={() => {}}
        restReason={null}
      />,
    );
    // Bugatti truth: zero hardcoded muscle claim in fallback path.
    expect(container.textContent).not.toMatch(/Pectoralii si picioarele/i);
    expect(container.textContent).not.toMatch(/readiness\s+32\/100/i);
  });

  it('NU render hardcoded muscle-group claim cand restReason undefined', () => {
    const { container } = render(
      <CoachRestCard
        onLightSession={() => {}}
        onOverride={() => {}}
      />,
    );
    expect(container.textContent).not.toMatch(/Pectoralii si picioarele/i);
    expect(container.textContent).not.toMatch(/readiness\s+32\/100/i);
  });

  it('renders engine-driven fatigued groups + readiness cand restReason provided — EN default', () => {
    const restReason: CoachRestReason = {
      fatiguedGroups: ['Pieptul', 'Quadricepsul'],
      readinessScore: 48,
    };
    render(
      <CoachRestCard
        onLightSession={() => {}}
        onOverride={() => {}}
        restReason={restReason}
      />,
    );
    // Wave C2 i18n: EN default uses " and " joiner + "still recovering".
    expect(
      screen.getByText(/Pieptul and Quadricepsul still recovering/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/readiness 48\/100/i)).toBeInTheDocument();
  });

  it('renders generic "Muscles are still recovering" cand fatiguedGroups=[] + readiness null — EN default', () => {
    const restReason: CoachRestReason = {
      fatiguedGroups: [],
      readinessScore: null,
    };
    render(
      <CoachRestCard
        onLightSession={() => {}}
        onOverride={() => {}}
        restReason={restReason}
      />,
    );
    expect(screen.getByText(/Muscles are still recovering/i)).toBeInTheDocument();
  });

  it('renders dynamic durationMinutes prop', () => {
    render(
      <CoachRestCard
        onLightSession={() => {}}
        onOverride={() => {}}
        durationMinutes={20}
      />,
    );
    expect(screen.getByTestId('coach-rest-duration')).toHaveTextContent('20');
  });

  it('default duration 15 cand omis', () => {
    render(
      <CoachRestCard
        onLightSession={() => {}}
        onOverride={() => {}}
      />,
    );
    expect(screen.getByTestId('coach-rest-duration')).toHaveTextContent('15');
  });
});

describe('CoachRestCard — CTA wiring (override routes to calendar, 2026-06-13)', () => {
  it('light-session CTA fires onLightSession (active recovery start preserved)', () => {
    const onLightSession = vi.fn();
    const onOverride = vi.fn();
    render(
      <CoachRestCard onLightSession={onLightSession} onOverride={onOverride} restReason={null} />,
    );
    // EN default → "Light mobility session".
    fireEvent.click(screen.getByRole('button', { name: /Light mobility session/i }));
    expect(onLightSession).toHaveBeenCalledTimes(1);
    expect(onOverride).not.toHaveBeenCalled();
  });

  it('override CTA fires onOverride only (NOT a session start) + EN copy routes to calendar', () => {
    const onLightSession = vi.fn();
    const onOverride = vi.fn();
    render(
      <CoachRestCard onLightSession={onLightSession} onOverride={onOverride} restReason={null} />,
    );
    // EN default copy reflects calendar-routing intent, not "I still want to train".
    const overrideBtn = screen.getByRole('button', { name: /pick the day in the calendar/i });
    expect(overrideBtn).toBeInTheDocument();
    fireEvent.click(overrideBtn);
    expect(onOverride).toHaveBeenCalledTimes(1);
    expect(onLightSession).not.toHaveBeenCalled();
  });
});
