# Task C019 — SubHeader shared component build

**Cluster:** C (Think Before Coding)
**Karpathy:** Think Before Coding (new component design) + Surgical Changes (~30 LOC)
**Effort:** S (~30min)
**Beta blocker:** NO Wave 2 polish (but UX consistency P1 closure)
**Source finding(s):**
- `📤_outbox/mockup-vs-prod-parity-2026-05-20/findings-pass3-cross-screen-patterns.md:7-22` (Pattern P1 SubHeader)

**File(s) touched:**
- NEW: `src/react/components/SubHeader.tsx`
- NEW: `tests/react/components/SubHeader.spec.tsx`

**Dependencies:** None (BLOCKS C020-C033 — 15 use-site applications)

---

## §A Pre-flight

```
Read 📤_outbox/mockup-vs-prod-parity-2026-05-20/findings-pass3-cross-screen-patterns.md:7-22 (P1 verbatim)
Read 04-architecture/mockups/andura-clasic.html — search "sub-header" + "back-btn" patterns
Read src/react/routes/screens/cont/SettingsNotifications.tsx (HAS pattern reference)
Read src/react/routes/screens/EnergyCheck.tsx (LACKS pattern — target for application)
```

GitNexus:
```
gitnexus_query({query: "sub-header back button"})
gitnexus_query({query: "BackButton sticky"})
```

Verify no existing shared SubHeader OR similar component exists. If existing similar pattern found, reuse or extend instead of new file (Karpathy SF).

---

## §B Implementation

### Step 1 — Component design

`src/react/components/SubHeader.tsx`:

```tsx
import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export interface SubHeaderProps {
  title: string;
  onBack?: () => void;                      // optional override
  sticky?: boolean;                          // default true
  className?: string;                        // additive
}

export function SubHeader({ title, onBack, sticky = true, className = '' }: SubHeaderProps): JSX.Element {
  const navigate = useNavigate();

  const handleBack = (): void => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const stickyClass = sticky ? 'sticky top-0 z-20 bg-paper/95 backdrop-blur-sm' : '';

  return (
    <header
      className={`flex items-center gap-2 py-3 px-4 border-b border-line ${stickyClass} ${className}`}
      data-testid="sub-header"
    >
      <button
        type="button"
        onClick={handleBack}
        aria-label="Inapoi"
        data-testid="sub-header-back"
        className="p-1 -ml-1 rounded hover:bg-paper2 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
      >
        <ChevronLeft className="w-5 h-5 text-ink2" aria-hidden="true" />
      </button>
      <h2 className="text-lg font-bold tracking-tight text-ink" data-testid="sub-header-title">
        {title}
      </h2>
    </header>
  );
}
```

### Karpathy anti-overengineering check

- ✅ NU add rightSlot prop (no use cases yet — YAGNI per Karpathy SF)
- ✅ NU add icon prop variant (single back-arrow per mockup)
- ✅ NU add animation Framer Motion (sticky CSS sufficient)
- ✅ Tap target 44x44 min per a11y WCAG 2.5.5 (button padding)
- ✅ ARIA label "Inapoi" Romanian no-diacritics

---

## §C Tests

`tests/react/components/SubHeader.spec.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { SubHeader } from '../../../src/react/components/SubHeader';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: vi.fn() };
});

describe('SubHeader', () => {
  it('renders title + back button', () => {
    (useNavigate as any).mockReturnValue(vi.fn());
    render(<MemoryRouter><SubHeader title="Notificari" /></MemoryRouter>);
    expect(screen.getByTestId('sub-header-title')).toHaveTextContent('Notificari');
    expect(screen.getByTestId('sub-header-back')).toHaveAttribute('aria-label', 'Inapoi');
  });

  it('calls navigate(-1) on back click', () => {
    const nav = vi.fn();
    (useNavigate as any).mockReturnValue(nav);
    render(<MemoryRouter><SubHeader title="X" /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('sub-header-back'));
    expect(nav).toHaveBeenCalledWith(-1);
  });

  it('calls custom onBack when provided', () => {
    const customBack = vi.fn();
    (useNavigate as any).mockReturnValue(vi.fn());
    render(<MemoryRouter><SubHeader title="X" onBack={customBack} /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('sub-header-back'));
    expect(customBack).toHaveBeenCalled();
  });

  it('applies sticky class by default', () => {
    (useNavigate as any).mockReturnValue(vi.fn());
    render(<MemoryRouter><SubHeader title="X" /></MemoryRouter>);
    expect(screen.getByTestId('sub-header').className).toMatch(/sticky/);
  });
});
```

Run: `npm run test:run -- SubHeader.spec`

---

## §D Commit

```
feat(C019-subheader-shared): build SubHeader shared component for 15 sub-screens (MP-P1)

Closes mockup vs prod Pattern P1 (15 findings closed via this + 15
use-site applications C020-C033). Pattern: sticky back-btn + h2 title
on every sub-page per mockup convention.

Component:
- ChevronLeft Lucide icon back button (44x44 tap target a11y)
- Customizable onBack callback (default navigate(-1))
- Sticky default true (top-0 z-20 backdrop-blur)
- aria-label="Inapoi" Romanian no-diacritics

Use sites C020-C033 (15 sub-screens) wire în subsequent tasks
within BATCH_C4.

Source-citation: 📤_outbox/mockup-vs-prod-parity-2026-05-20/findings-pass3-cross-screen-patterns.md:7-22
```

---

## §E Verify post-edit

```powershell
gitnexus_detect_changes
npm run test:run -- SubHeader.spec
ls src/react/components/SubHeader.tsx
```

Expected:
- gitnexus: 1 new symbol added (SubHeader), no upstream symbols affected (yet — 15 use sites in subsequent tasks)
- tests: 4 new tests PASS
- file exists

---

🦫 **Task C019 — SubHeader shared component. ~30min Opus. BLOCKS C020-C033 (15 use-site applications). Pattern P1 1-component-15-uses architecture.**
