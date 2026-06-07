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

  it('onSelect primeste ts-ul stabil la "Vezi tot" (NU array index)', () => {
    const sessions = makeSessions(3);
    const { onSelect } = renderList(sessions);
    // Founder UX 2026-06-06 — randul e colapsat: tap pe rand il expandeaza,
    // navigarea trece pe link-ul "Vezi tot" din panoul expandat.
    fireEvent.click(screen.getByTestId('istoric-session-1'));
    fireEvent.click(screen.getByTestId('istoric-session-1-details'));
    // Row 1 = sessions[1] → carries its stable ts, not the index 1.
    expect(onSelect).toHaveBeenCalledWith(sessions[1]!.ts);
  });
});

describe('VirtualSessionList — collapse-by-default (accordion)', () => {
  it('randurile sunt colapsate implicit (fara detail in DOM)', () => {
    renderList(makeSessions(3));
    expect(screen.getByTestId('istoric-session-0')).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByTestId('istoric-session-0-detail')).not.toBeInTheDocument();
  });

  it('tap pe un rand expandeaza DOAR acel rand (single-open)', () => {
    renderList(makeSessions(3));
    fireEvent.click(screen.getByTestId('istoric-session-0'));
    expect(screen.getByTestId('istoric-session-0')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('istoric-session-0-detail')).toBeInTheDocument();
    // Celelalte raman colapsate.
    expect(screen.queryByTestId('istoric-session-1-detail')).not.toBeInTheDocument();
  });

  it('tap pe randul deschis il colapseaza la loc', () => {
    renderList(makeSessions(3));
    const row = screen.getByTestId('istoric-session-0');
    fireEvent.click(row);
    expect(screen.getByTestId('istoric-session-0-detail')).toBeInTheDocument();
    fireEvent.click(row);
    expect(screen.queryByTestId('istoric-session-0-detail')).not.toBeInTheDocument();
    expect(row).toHaveAttribute('aria-expanded', 'false');
  });

  it('deschiderea altui rand inchide pe primul (single-open accordion)', () => {
    renderList(makeSessions(3));
    fireEvent.click(screen.getByTestId('istoric-session-0'));
    fireEvent.click(screen.getByTestId('istoric-session-1'));
    expect(screen.queryByTestId('istoric-session-0-detail')).not.toBeInTheDocument();
    expect(screen.getByTestId('istoric-session-1-detail')).toBeInTheDocument();
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
    fireEvent.click(screen.getByTestId('istoric-session-0-details'));
    expect(onSelect).toHaveBeenCalledWith(sessions[0]!.ts);
  });
});

describe('VirtualSessionList — preview/expand (Founder UX 2026-06-07)', () => {
  function renderPreview(sorted: SessionRow[]): void {
    render(
      <VirtualSessionList
        sorted={sorted}
        formatDate={(ts) => String(ts)}
        onSelect={vi.fn()}
        previewCount={3}
      />
    );
  }

  it('shows only the first previewCount rows + a toggle when the list is longer', () => {
    renderPreview(makeSessions(10));
    expect(screen.getByTestId('istoric-session-0')).toBeInTheDocument();
    expect(screen.getByTestId('istoric-session-2')).toBeInTheDocument();
    // Beyond the preview window → not rendered until expanded.
    expect(screen.queryByTestId('istoric-session-3')).not.toBeInTheDocument();
    expect(screen.getByTestId('istoric-sessions-toggle')).toHaveAttribute('aria-expanded', 'false');
  });

  it('expands to the full list on toggle, then collapses back', () => {
    renderPreview(makeSessions(10));
    const toggle = screen.getByTestId('istoric-sessions-toggle');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('istoric-session-9')).toBeInTheDocument();
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByTestId('istoric-session-9')).not.toBeInTheDocument();
  });

  it('no toggle when the list is within the preview count', () => {
    renderPreview(makeSessions(3));
    expect(screen.queryByTestId('istoric-sessions-toggle')).not.toBeInTheDocument();
    expect(screen.getByTestId('istoric-session-2')).toBeInTheDocument();
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
    fireEvent.click(screen.getByTestId('istoric-session-0-details'));
    expect(onSelect).toHaveBeenLastCalledWith(b.ts);
    fireEvent.click(screen.getByTestId('istoric-session-1'));
    fireEvent.click(screen.getByTestId('istoric-session-1-details'));
    expect(onSelect).toHaveBeenLastCalledWith(a.ts);
  });
});
