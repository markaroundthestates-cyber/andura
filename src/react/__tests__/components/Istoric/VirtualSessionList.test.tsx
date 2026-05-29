// ══ VIRTUAL SESSION LIST TESTS — §35-M2 windowing ═══════════════════════
// Verifica: liste scurte randeaza tot (sub prag), liste lungi (>30) randeaza
// doar fereastra vizibila + spacer-e care pastreaza inaltimea de scroll,
// navigarea drill-down foloseste originalIdx neschimbat.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VirtualSessionList, type SessionRow } from '../../../components/Istoric/VirtualSessionList';

function makeSessions(n: number): SessionRow[] {
  // ts descrescator (newest first) ca in Istoric sorted.
  return Array.from({ length: n }, (_, i) => ({
    title: `Sesiune ${i}`,
    meta: `${i} seturi`,
    ts: 1_700_000_000_000 - i * 1000,
  }));
}

function renderList(sorted: SessionRow[], onSelect = vi.fn()): { onSelect: typeof onSelect } {
  render(
    <VirtualSessionList
      sorted={sorted}
      sessionsHistory={sorted}
      formatDate={(ts) => String(ts)}
      onSelect={onSelect}
    />
  );
  return { onSelect };
}

describe('VirtualSessionList — short list (no virtualization)', () => {
  it('renders all rows cand sub prag', () => {
    renderList(makeSessions(3));
    expect(screen.getByTestId('istoric-list')).toBeInTheDocument();
    expect(screen.getByTestId('istoric-session-0')).toBeInTheDocument();
    expect(screen.getByTestId('istoric-session-2')).toBeInTheDocument();
    expect(screen.queryByTestId('istoric-list-pad-top')).not.toBeInTheDocument();
    expect(screen.queryByTestId('istoric-list-pad-bottom')).not.toBeInTheDocument();
  });

  it('onSelect primeste originalIdx la tap', () => {
    const { onSelect } = renderList(makeSessions(3));
    fireEvent.click(screen.getByTestId('istoric-session-1'));
    expect(onSelect).toHaveBeenCalledWith(1);
  });
});

describe('VirtualSessionList — long list (windowed)', () => {
  it('randeaza doar fereastra vizibila + spacer jos pentru scroll height', () => {
    renderList(makeSessions(60));
    // Primul rand vizibil (start=0 la scrollY 0).
    expect(screen.getByTestId('istoric-session-0')).toBeInTheDocument();
    // Randuri de la coada NU sunt in DOM (windowed afara viewport jsdom).
    expect(screen.queryByTestId('istoric-session-59')).not.toBeInTheDocument();
    // Spacer jos pastreaza inaltimea totala de scroll.
    expect(screen.getByTestId('istoric-list-pad-bottom')).toBeInTheDocument();
  });

  it('pastreaza originalIdx corect pe randuri vizibile', () => {
    const { onSelect } = renderList(makeSessions(60));
    fireEvent.click(screen.getByTestId('istoric-session-0'));
    expect(onSelect).toHaveBeenCalledWith(0);
  });
});

describe('VirtualSessionList — same-ts collision (stable identity)', () => {
  it('deschide sesiunea corecta cand doua sesiuni au acelasi ts', () => {
    // Doua sesiuni cu ACELASI ts → findIndex(s.ts===ts) returna mereu prima
    // (originalIdx gresit). Sorted = copie [...history].sort(stable) deci
    // pastreaza referintele de obiect; indexOf rezolva fiecare distinct.
    const a: SessionRow = { title: 'Sesiune A', meta: '1 set', ts: 1_700_000_000_000 };
    const b: SessionRow = { title: 'Sesiune B', meta: '2 seturi', ts: 1_700_000_000_000 };
    const history = [a, b];
    const sorted = [...history].sort((x, y) => y.ts - x.ts);
    const onSelect = vi.fn();
    render(
      <VirtualSessionList
        sorted={sorted}
        sessionsHistory={history}
        formatDate={(ts) => String(ts)}
        onSelect={onSelect}
      />
    );
    // Rand 0 = primul din sorted (= a, originalIdx 0).
    fireEvent.click(screen.getByTestId('istoric-session-0'));
    expect(onSelect).toHaveBeenLastCalledWith(0);
    // Rand 1 = al doilea din sorted (= b, originalIdx 1) — NU 0.
    fireEvent.click(screen.getByTestId('istoric-session-1'));
    expect(onSelect).toHaveBeenLastCalledWith(1);
  });
});
