// ══ SUB HEADER — Pass 3 P1 Shared Sticky Back+Title Component ════════════
// Per MOCKUP-PARITY-chat3.md §4 bonus: SubHeader inconsistency cross 20
// sub-screens (Settings*, Confirms, FinishEarlyConfirm, WeightLogList).
// Each screen previously declared own <header> JSX with identical sticky
// top-0 + back-arrow + title pattern. Extracted to single source of truth
// for visual parity + maintainability.
//
// Mockup ref: andura-clasic.html L2958-2962 .sub-header CSS rule.
// Verbatim mockup contract: flex + gap-3 + p-4 + border-b + sticky.
//
// Props contract:
//   - title: heading text (h1, level 1 preserved for tests asserting `level: 1`)
//   - onBack: back navigation callback (required — no implicit navigate(-1) default
//             to avoid silent route-history surprises; each screen specifies intent
//             explicitly per existing pattern)
//   - testIdBack: data-testid for back button (preserves existing per-screen testid
//                 contract referenced by tests, e.g. "settings-about-back")
//   - danger?: title color variant — text-brick for destructive screens (mockup
//             style="color:#c8412e;" parity, currently DeleteAccountConfirm only)
//   - rightAction?: optional right-side action node (none currently used by any
//                  screen; mockup also has none, but props-future-proof per spec)
//
// Cross-refs:
//   - DECISIONS.md §D-LEGACY-064 Romanian no-diacritics (aria-label "Inapoi")
//   - mockup andura-clasic.html L2958 .sub-header { display:flex; gap:12px; padding:14px 16px 8px }
//   - mockup andura-clasic.html L2960 .back-btn { width:40px; height:40px }

import type { JSX, ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';

interface SubHeaderProps {
  title: string;
  onBack: () => void;
  testIdBack: string;
  danger?: boolean;
  rightAction?: ReactNode;
}

export function SubHeader({
  title,
  onBack,
  testIdBack,
  danger = false,
  rightAction,
}: SubHeaderProps): JSX.Element {
  return (
    <header className="flex items-center gap-3 p-4 border-b border-line bg-paper sticky top-0 z-10">
      <button
        type="button"
        onClick={onBack}
        aria-label="Inapoi"
        data-testid={testIdBack}
        className="p-2 -ml-2 text-ink"
      >
        <ArrowLeft className="w-5 h-5" aria-hidden="true" />
      </button>
      <h1
        className={`text-xl font-semibold ${danger ? 'text-brick' : 'text-ink'}`}
      >
        {title}
      </h1>
      {rightAction !== undefined && (
        <div className="ml-auto">{rightAction}</div>
      )}
    </header>
  );
}
