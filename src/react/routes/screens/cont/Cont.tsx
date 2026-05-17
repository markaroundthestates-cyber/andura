// ══ CONT — Tab 4 of 4 Phase 5 task_13 Landing ════════════════════════════
// Phase 5 task_13 MVP scope: sections list mockup wv2 parity (Cont / General
// / Date & confidentialitate / Deconectare/Stergere / Ajutor). Sub-screens
// Phase 6+ implementation (task_13 §3 hint Karpathy §4 simplicity).
// Mockup verbatim copy preserved (andura-clasic.html#L1839+).

import type { JSX } from 'react';
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
      { id: 'profile', label: 'Profil & tinte', Icon: User },
      { id: 'notifications', label: 'Notificari', Icon: Bell },
      { id: 'subscription', label: 'Abonament', Icon: Sparkles },
    ],
  },
  {
    title: 'General',
    rows: [
      { id: 'appearance', label: 'Aspect', Icon: Palette },
      { id: 'aparate-lipsa', label: 'Aparate lipsa', Icon: XOctagon },
      { id: 'prefs', label: 'Setari', Icon: SlidersHorizontal },
    ],
  },
  {
    title: 'Date & confidentialitate',
    rows: [
      { id: 'privacy', label: 'Politica de confidentialitate', Icon: ShieldCheck },
      { id: 'terms', label: 'Termeni si conditii', Icon: FileText },
      { id: 'export', label: 'Descarca datele tale (JSON)', Icon: Download },
    ],
  },
  {
    title: 'Deconectare/Stergere',
    danger: true,
    rows: [{ id: 'danger', label: 'Deconectare/Stergere', Icon: AlertTriangle, danger: true }],
  },
  {
    title: 'Ajutor',
    rows: [
      { id: 'support', label: 'Suport', Icon: LifeBuoy },
      { id: 'ceva-nu-merge', label: 'Ceva nu merge', Icon: AlertOctagon },
      { id: 'about', label: 'Despre Andura', Icon: Info },
      { id: 'faq', label: 'FAQ', Icon: HelpCircle },
    ],
  },
];

export function Cont(): JSX.Element {
  return (
    <section className="p-6 bg-paper min-h-screen" data-testid="cont-home">
      <h1 className="text-2xl font-semibold text-ink mb-4">Cont</h1>

      {/* Account card (header) — Phase 6+ wires user profile data real */}
      <div
        className="bg-paper2 border border-line rounded-2xl p-4 mb-4 flex items-center gap-3"
        data-testid="cont-account-card"
      >
        <div className="w-12 h-12 rounded-full bg-brick text-paper flex items-center justify-center text-xl font-semibold">
          A
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-ink">Utilizator</p>
          <p className="text-sm text-ink2 truncate">Profilul tau Andura</p>
        </div>
      </div>

      {SECTIONS.map((section) => (
        <div key={section.title} className="mb-4" data-testid={`cont-section-${section.title.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '')}`}>
          <p
            className={`text-xs uppercase tracking-wide font-semibold mb-2 ${section.danger ? 'text-brick' : 'text-ink2'}`}
          >
            {section.title}
          </p>
          <div className="bg-paper2 border border-line rounded-xl overflow-hidden">
            {section.rows.map((row, idx) => {
              const Icon = row.Icon;
              const isLast = idx === section.rows.length - 1;
              return (
                <button
                  key={row.id}
                  type="button"
                  data-testid={`cont-row-${row.id}`}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left ${!isLast ? 'border-b border-line' : ''} ${row.danger ? 'text-brick' : 'text-ink'}`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                  <span className="flex-1 text-sm">{row.label}</span>
                  <ChevronRight className="w-4 h-4 flex-shrink-0 text-ink2" aria-hidden="true" />
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
