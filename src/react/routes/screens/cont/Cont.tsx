// ══ CONT — Tab 4 of 4 Phase 5 task_13 Landing ════════════════════════════
// Phase 5 task_13 MVP scope: sections list mockup wv2 parity (Cont / General
// / Date si confidentialitate / Deconectare si Stergere / Ajutor). Sub-screens
// Phase 6+ implementation (task_13 §3 hint Karpathy §4 simplicity).
// Mockup verbatim copy preserved (andura-clasic.html#L1839+).

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { gotoPath } from '../../../lib/navigation';
import type { GotoScreen } from '../../../lib/navigation';
import { getUserProfileDisplay } from './userProfile';
import {
  User,
  Bell,
  Sparkles,
  Palette,
  XOctagon,
  SlidersHorizontal,
  ShieldCheck,
  FileText,
  Download,
  AlertTriangle,
  LifeBuoy,
  AlertOctagon,
  Info,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';

interface ContRow {
  id: string;
  label: string;
  Icon: typeof User;
  danger?: boolean;
  target?: GotoScreen;
}

interface ContSection {
  title: string;
  rows: ContRow[];
  danger?: boolean;
}

// Mockup verbatim copy andura-clasic.html#L1839-1888
const SECTIONS: readonly ContSection[] = [
  {
    title: 'Cont',
    rows: [
      { id: 'profile', label: 'Profil si tinte', Icon: User, target: 'settings-profile' },
      { id: 'notifications', label: 'Notificari', Icon: Bell, target: 'settings-notifications' },
      { id: 'subscription', label: 'Abonament', Icon: Sparkles, target: 'settings-subscription' },
    ],
  },
  {
    title: 'General',
    rows: [
      { id: 'appearance', label: 'Aspect', Icon: Palette, target: 'settings-appearance' },
      { id: 'aparate-lipsa', label: 'Aparate lipsa', Icon: XOctagon, target: 'aparate-lipsa' },
      { id: 'prefs', label: 'Setari', Icon: SlidersHorizontal, target: 'settings-prefs' },
    ],
  },
  {
    title: 'Date si confidentialitate',
    rows: [
      { id: 'privacy', label: 'Politica de confidentialitate', Icon: ShieldCheck, target: 'settings-privacy' },
      { id: 'terms', label: 'Termeni si conditii', Icon: FileText, target: 'settings-terms' },
      { id: 'export', label: 'Descarca datele tale (JSON)', Icon: Download, target: 'settings-export' },
    ],
  },
  {
    title: 'Deconectare si Stergere',
    danger: true,
    rows: [{ id: 'danger', label: 'Deconectare si Stergere', Icon: AlertTriangle, danger: true, target: 'settings-danger' }],
  },
  {
    title: 'Ajutor',
    rows: [
      { id: 'support', label: 'Suport', Icon: LifeBuoy, target: 'settings-support' },
      { id: 'ceva-nu-merge', label: 'Ceva nu merge', Icon: AlertOctagon, target: 'ceva-nu-merge' },
      { id: 'about', label: 'Despre Andura', Icon: Info, target: 'settings-about' },
      { id: 'faq', label: 'FAQ', Icon: HelpCircle, target: 'settings-faq' },
    ],
  },
];

export function Cont(): JSX.Element {
  const navigate = useNavigate();
  const handleRowClick = (target: GotoScreen | undefined): void => {
    if (target) navigate(gotoPath(target));
  };
  // §F-cont-01/02/03 user-wire fix (HIGH-BETA chat 4) — read avatar initial +
  // name + email from id_token JWT claims (single source of truth post Magic
  // Link verify). Unauthenticated fallback preserves generic placeholders.
  const profile = getUserProfileDisplay();
  const displayName = profile.name || 'Utilizator';
  const displayEmail = profile.email || 'Profilul tau Andura';
  return (
    <section className="p-6 bg-paper min-h-screen" data-testid="cont-home">
      {/* §F-cont-08 (LOW chat5) — title font-weight 600 → 700 mockup
          andura-clasic.html#L1841 (font-weight:700). */}
      <h1 className="text-2xl font-bold text-ink mb-4">Cont</h1>

      {/* Account card (header) — Phase 6+ wires user profile data real */}
      <div
        className="bg-paper2 border border-line rounded-2xl p-4 mb-4 flex items-center gap-3"
        data-testid="cont-account-card"
      >
        {/* §F-cont-07 (LOW chat5) — avatar dimensions 48x48 → 52x52 +
            text 20px → 22px mockup andura-clasic.html#L1845 (font-size:22). */}
        <div
          className="w-[52px] h-[52px] rounded-full bg-brick text-paper flex items-center justify-center text-[22px] font-semibold"
          data-testid="cont-account-initial"
        >
          {profile.initial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-ink" data-testid="cont-account-name">{displayName}</p>
          <p className="text-sm text-ink2 truncate" data-testid="cont-account-email">{displayEmail}</p>
        </div>
      </div>

      {SECTIONS.map((section) => (
        <div key={section.title} className="mb-4" data-testid={`cont-section-${section.title.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '')}`}>
          {/* §F-cont-06 (LOW chat5 Wave 15) — section heading tokens align
              mockup .settings-section andura-clasic.html:2870 verbatim:
              font-size 11px + letter-spacing 0.08em + color var(--ink-3).
              Prior: text-xs (12px) + tracking-wide (0.025em) + text-ink2.
              Danger sections keep text-brick highlight invariant. */}
          <p
            className={`text-[11px] uppercase tracking-[0.08em] font-semibold mb-2 ${section.danger ? 'text-brick' : 'text-ink3'}`}
          >
            {section.title}
          </p>
          <div className="bg-paper2 border border-line rounded-[14px] overflow-hidden">
            {section.rows.map((row, idx) => {
              const Icon = row.Icon;
              const isLast = idx === section.rows.length - 1;
              return (
                <button
                  key={row.id}
                  type="button"
                  data-testid={`cont-row-${row.id}`}
                  onClick={() => handleRowClick(row.target)}
                  disabled={!row.target}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left disabled:opacity-50 disabled:cursor-not-allowed ${!isLast ? 'border-b border-line' : ''} ${row.danger ? 'text-brick' : 'text-ink'}`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                  <span className="flex-1 text-sm">{row.label}</span>
                  <ChevronRight className="w-5 h-5 flex-shrink-0 text-ink2" strokeWidth={1.6} aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <p className="text-xs text-ink2 text-center mt-6">Andura v1.0.0</p>
    </section>
  );
}
