// ══ SETTINGS FAQ — Intrebari frecvente ════════════════════════════════════
// Per mockup andura-clasic.html#screen-settings-faq. Static FAQ sections
// with placeholder questions. Each question expands to short answer (V1
// pre-Beta: chevron right + accordion expand pattern, content seeded
// minimal). Post-Beta: dedicated answer subpages or markdown rendered.

import { useState, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, ChevronRight, ChevronDown } from 'lucide-react';
import { gotoPath } from '../../../lib/navigation';
import { SubHeader } from '../../../components/SubHeader';

interface FaqItem {
  q: string;
  a: string;
}

interface FaqSection {
  title: string;
  items: FaqItem[];
}

const FAQ: ReadonlyArray<FaqSection> = [
  {
    title: 'Antrenament',
    items: [
      {
        q: 'Cum schimb programul?',
        a: 'Mergi la Antrenor > tap pe pencil pe cardul Saptamana > selecteaza zile training si rest > Salveaza. Coach-ul recalibreaza automatic.',
      },
      {
        q: 'Pot sa sar peste o sesiune?',
        a: 'Da. Tap pe X in timpul sesiunii > Renunt la sesiune. Coach-ul nu te penalizeaza si ajusteaza recomandarile saptamanal pe baza adherentei reale.',
      },
      {
        q: 'Cum se calculeaza progresul?',
        a: 'Coach-ul foloseste seturi logate (kg + reps + RPE) + greutate corp + readiness score. Pattern recognition local pe telefon, fara cloud upload obligatoriu.',
      },
    ],
  },
  {
    title: 'Cont si date',
    items: [
      {
        q: 'Cum recuperez parola?',
        a: 'Andura foloseste Magic Link (fara parola). Pe ecranul Autentificare introdu email-ul > primesti link unic in inbox > tap-il pe acelasi telefon.',
      },
      {
        q: 'Pot folosi pe mai multe telefoane?',
        a: 'Da, daca esti autentificat cu cont (Magic Link sau Google). Backup automat in Firebase eu-central-1. Modul test drive (fara cont) ramane Tier 0 local pe telefonul curent.',
      },
      {
        q: 'Unde sunt salvate datele mele?',
        a: 'Local-first pe telefon (localStorage Tier 0 + IndexedDB Tier 1). Backup optional Firebase RTDB criptat in transit. Nici un identificator personal in metrici telemetrie.',
      },
    ],
  },
  {
    title: 'Notificari',
    items: [
      {
        q: 'De ce nu primesc notificari?',
        a: 'Verifica Cont > Notificari > toggle activ + zile selectate + ora reminder. PWA notifications cer permisiune browser/OS — accepta la prompt initial. Daca ai refuzat, reseteaza din setarile telefonului.',
      },
    ],
  },
];

export function SettingsFaq(): JSX.Element {
  const navigate = useNavigate();
  const [openId, setOpenId] = useState<string | null>(null);

  function toggle(id: string): void {
    setOpenId((curr) => (curr === id ? null : id));
  }

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="settings-faq">
      <SubHeader
        title="FAQ"
        onBack={() => navigate(gotoPath('cont'))}
        testIdBack="settings-faq-back"
      />

      <div className="flex-1 overflow-y-auto p-5">
        <p className="text-sm text-ink2 mb-4 leading-relaxed">
          Raspunsuri scurte la intrebarile pe care le primim cel mai des.
        </p>

        {FAQ.map((section) => (
          <div key={section.title} className="mb-4">
            <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-2">
              {section.title}
            </p>
            <div className="bg-paper2 border border-line rounded-[14px] overflow-hidden">
              {section.items.map((item, idx) => {
                const id = `${section.title}-${idx}`;
                const open = openId === id;
                return (
                  <div key={id} className={idx < section.items.length - 1 ? 'border-b border-line' : ''}>
                    <button
                      type="button"
                      onClick={() => toggle(id)}
                      data-testid={`faq-q-${id}`}
                      aria-expanded={open}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-ink"
                    >
                      <HelpCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                      <span className="flex-1 text-sm font-medium">{item.q}</span>
                      {open ? (
                        <ChevronDown className="w-5 h-5 flex-shrink-0 text-ink2" strokeWidth={1.6} aria-hidden="true" />
                      ) : (
                        <ChevronRight className="w-5 h-5 flex-shrink-0 text-ink2" strokeWidth={1.6} aria-hidden="true" />
                      )}
                    </button>
                    {open && (
                      <div className="px-4 pb-3 -mt-1">
                        <p className="text-sm text-ink2 leading-relaxed">{item.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <p className="text-xs text-ink3 text-center mt-6 leading-relaxed">
          Nu gasesti raspuns? Scrie-ne din{' '}
          <button
            type="button"
            onClick={() => navigate(gotoPath('settings-support'))}
            className="text-brick font-medium underline underline-offset-2"
          >
            Suport
          </button>
          .
        </p>
      </div>
    </section>
  );
}
