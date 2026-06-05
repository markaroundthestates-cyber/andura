// ══ VIRTUAL SESSION LIST TESTS — §35-M2 windowing ═══════════════════════
// Verifica: liste scurte randeaza tot (sub prag), liste lungi (>30) randeaza
// doar fereastra vizibila + spacer-e care pastreaza inaltimea de scroll,
// navigarea drill-down foloseste `ts` stabil (NU array index) — Daniel audit
// 2026-06-05.

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

  it('onSelect primeste ts-ul stabil la tap (NU array index)', () => {
    const sessions = makeSessions(3);
    const { onSelect } = renderList(sessions);
    fireEvent.click(screen.getByTestId('istoric-session-1'));
    // Row 1 = sessions[1] → carries its stable ts, not the index 1.
    expect(onSelect).toHaveBeenCalledWith(sessions[1]!.ts);
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

  it('emite ts-ul corect pe randuri vizibile', () => {
    const sessions = makeSessions(60);
    const { onSelect } = renderList(sessions);
    fireEvent.click(screen.getByTestId('istoric-session-0'));
    expect(onSelect).toHaveBeenCalledWith(sessions[0]!.ts);
  });
});

describe('VirtualSessionList — reorder safety (stable ts, not index)', () => {
  it('emite ts-ul randului, neafectat de pozitia in array (reorder/delete)', () => {
    // Daniel audit 2026-06-05: navigarea pe index deschidea sesiunea gresita
    // dupa un delete/reorder. Acum fiecare rand emite ts-ul propriu, deci
    // resolverul de detail (find s.ts===ts) gaseste mereu sesiunea corecta
    // indiferent de ordinea din array.
    const a: SessionRow = { title: 'Sesiune A', meta: '1 set', ts: 1_700_000_000_000 };
    const b: SessionRow = { title: 'Sesiune B', meta: '2 seturi', ts: 1_700_000_500_000 };
    const sorted = [b, a]; // newest first (b)
    const { onSelect } = renderList(sorted);
    fireEvent.click(screen.getByTestId('istoric-session-0'));
    expect(onSelect).toHaveBeenLastCalledWith(b.ts);
    fireEvent.click(screen.getByTestId('istoric-session-1'));
    expect(onSelect).toHaveBeenLastCalledWith(a.ts);
  });
});
