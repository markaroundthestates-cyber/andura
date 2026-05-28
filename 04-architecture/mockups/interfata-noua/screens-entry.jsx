// ══ ANDURA PULSE — Splash · Auth · Onboarding ══════════════════════════════
const { useState: _eS, useEffect: _eE } = React;

/* ── LOGO mark (pulse) ─────────────────────────────────────────────────── */
function PulseMark({ size = 64 }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'grid', placeItems: 'center' }}>
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--volt)" /><stop offset="100%" stopColor="var(--aqua)" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="29" fill="none" stroke="url(#lg)" strokeWidth="2.5" opacity="0.5" />
        <path d="M8 32 H20 L25 18 L33 46 L39 26 L43 36 H56" fill="none" stroke="url(#lg)"
          strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0 0 6px color-mix(in oklab, var(--aqua) 60%, transparent))' }} />
      </svg>
    </div>
  );
}
window.PulseMark = PulseMark;

/* ── SPLASH ────────────────────────────────────────────────────────────── */
function SplashScreen({ onDone }) {
  _eE(() => {
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="splash" onClick={onDone}>
      <div className="splash-mark anim-pop"><PulseMark size={96} /></div>
      <div className="splash-word display">ANDURA</div>
      <div className="splash-tag mono">YOUR COACH · A LIVING INSTRUMENT</div>
      <div className="splash-dots"><i /><i /><i /></div>
      <style>{`
        .splash{position:absolute;inset:0;z-index:50;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;}
        .splash-mark{animation-delay:.05s;}
        .splash-word{font-size:42px;font-weight:700;letter-spacing:.32em;text-indent:.32em;
          background:var(--grad-pulse);-webkit-background-clip:text;background-clip:text;color:transparent;
          opacity:0;animation:cardRise .8s .35s cubic-bezier(.2,.8,.2,1) both;}
        .splash-tag{font-size:10px;letter-spacing:.3em;color:var(--ink-3);opacity:0;animation:cardRise .7s .6s both;}
        .splash-dots{display:flex;gap:7px;margin-top:24px;opacity:0;animation:fadein .5s 1s both;}
        .splash-dots i{width:7px;height:7px;border-radius:50%;background:var(--accent);animation:floaty 1s infinite;}
        .splash-dots i:nth-child(2){animation-delay:.15s;background:var(--aqua);}
        .splash-dots i:nth-child(3){animation-delay:.3s;background:var(--ember);}
        @keyframes fadein{to{opacity:1}}
      `}</style>
    </div>
  );
}
window.SplashScreen = SplashScreen;

/* ── AUTH ──────────────────────────────────────────────────────────────── */
function AuthScreen({ onEnter }) {
  const [mode, setMode] = _eS('login'); // login | signup
  const [sent, setSent] = _eS(false);
  const [email, setEmail] = _eS('');
  return (
    <div className="scroll anim-screen" style={{ height: '100%', padding: '64px 26px 40px', display: 'flex', flexDirection: 'column' }}>
      <div className="floaty" style={{ alignSelf: 'center' }}><PulseMark size={62} /></div>
      <div className="display gradtext" style={{ textAlign: 'center', fontSize: 30, fontWeight: 700, marginTop: 18 }}>
        {sent ? 'Check your email' : mode === 'login' ? 'Welcome back' : 'Create account'}
      </div>
      <p style={{ textAlign: 'center', color: 'var(--ink-2)', fontSize: 14, marginTop: 8, lineHeight: 1.5 }}>
        {sent ? `We sent a link to ${email || 'your email'}. Open it on this phone.`
          : 'We\u2019ll send you a sign-in link by email. No password.'}
      </p>

      {!sent ? (
        <div style={{ marginTop: 30, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label className="label" style={{ marginBottom: -6 }}>Email (we’ll send a link)</label>
          <input className="field" type="email" placeholder="you@example.com" value={email}
            onChange={(e) => setEmail(e.target.value)} inputMode="email" autoComplete="email" />
          <button className="btn btn-grad" style={{ width: '100%' }} onClick={() => setSent(true)}>
            {mode === 'login' ? 'Send sign-in link' : 'Create account'} <Icon name="arrowRight" size={18} stroke="var(--on-accent)" />
          </button>
          <div className="auth-or"><span>or</span></div>
          <button className="btn btn-ghost" style={{ width: '100%' }} onClick={() => onEnter('onboarding')}>
            <Icon name="google" size={18} /> Continue with Google
          </button>
          <button className="auth-link" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
            {mode === 'login' ? 'No account? Create one' : 'Already have an account? Sign in'}
          </button>
          <button className="auth-skip press" onClick={() => onEnter('onboarding')}>Continue without an account</button>
        </div>
      ) : (
        <div style={{ marginTop: 34, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card sheen" style={{ padding: 18, textAlign: 'center' }}>
            <div className="floaty" style={{ display: 'grid', placeItems: 'center', marginBottom: 10 }}>
              <Icon name="bell" size={30} stroke="var(--aqua)" />
            </div>
            <p style={{ color: 'var(--ink-2)', fontSize: 13.5, lineHeight: 1.5 }}>The link expires in 15 min. Your account is created when you open it.</p>
          </div>
          <button className="btn btn-grad" style={{ width: '100%' }} onClick={() => onEnter('onboarding')}>I opened the link → continue</button>
          <button className="auth-link" onClick={() => setSent(false)}>Change email</button>
        </div>
      )}
      <p style={{ marginTop: 'auto', paddingTop: 26, textAlign: 'center', color: 'var(--ink-3)', fontSize: 11.5, lineHeight: 1.6 }}>
        By continuing you accept the Terms and Privacy Policy.<br />We never use your data for ads.
      </p>
      <style>{`
        .field{width:100%;padding:15px 16px;border-radius:16px;background:var(--surface-2);
          border:1px solid var(--line);color:var(--ink);font-size:15px;outline:none;transition:border .2s,box-shadow .2s;}
        .field:focus{border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in oklab,var(--accent) 20%,transparent);}
        .auth-or{display:flex;align-items:center;gap:12px;color:var(--ink-3);font-size:11px;font-family:var(--font-mono);text-transform:uppercase;letter-spacing:.1em;}
        .auth-or::before,.auth-or::after{content:"";flex:1;height:1px;background:var(--line);}
        .auth-link{color:var(--aqua);font-size:13.5px;font-weight:600;padding:4px;}
        .auth-skip{color:var(--ink-3);font-size:13px;text-decoration:underline;text-underline-offset:3px;padding:6px;}
      `}</style>
    </div>
  );
}
window.AuthScreen = AuthScreen;

/* ── ONBOARDING ────────────────────────────────────────────────────────── */
function OnboardingScreen({ onEnter }) {
  const D = window.AnduraData;
  const [step, setStep] = _eS(0);
  const [ans, setAns] = _eS({ goal: 'auto', sex: 'm', freq: 4, level: 'intermediate', age: 32, kg: 82, cm: 178 });
  const steps = ['goal', 'age', 'sex', 'freq', 'level', 'kg', 'cm', 'summary'];
  const total = steps.length;
  const cur = steps[step];
  const set = (k, v) => setAns((a) => ({ ...a, [k]: v }));
  const next = () => (step < total - 1 ? setStep(step + 1) : onEnter('app'));
  const back = () => (step > 0 ? setStep(step - 1) : onEnter('auth'));

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '54px 24px 26px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
        <button className="press" onClick={back} style={{ color: 'var(--ink-2)' }}><Icon name="chevronLeft" size={24} /></button>
        <div className="ob-bar"><span style={{ width: `${((step + 1) / total) * 100}%` }} /></div>
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{step + 1}/{total}</span>
      </div>

      <div key={cur} className="scroll anim-screen" style={{ flex: 1 }}>
        <Kicker color="var(--aqua)">STEP {step + 1}</Kicker>
        <h1 className="display" style={{ fontSize: 27, fontWeight: 700, margin: '8px 0 6px', lineHeight: 1.12 }}>{OB_TITLES[cur]}</h1>
        <p style={{ color: 'var(--ink-2)', fontSize: 14, marginBottom: 22 }}>{OB_DESC[cur]}</p>

        {cur === 'goal' && <ChoiceList items={D.goals} val={ans.goal} onPick={(v) => set('goal', v)} />}
        {cur === 'level' && <ChoiceList items={D.levels} val={ans.level} onPick={(v) => set('level', v)} />}
        {cur === 'sex' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[{ id: 'm', label: 'Male', sub: 'M' }, { id: 'f', label: 'Female', sub: 'F' }].map((o) => (
              <button key={o.id} className={`ob-tile press ${ans.sex === o.id ? 'on' : ''}`} onClick={() => set('sex', o.id)}>
                <Icon name="user" size={30} stroke={ans.sex === o.id ? 'var(--accent)' : 'var(--ink-2)'} />
                <span className="display" style={{ fontSize: 17, fontWeight: 600, marginTop: 8 }}>{o.label}</span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{o.sub}</span>
              </button>
            ))}
          </div>
        )}
        {cur === 'freq' && <Stepper val={ans.freq} min={2} max={6} unit="days / week" onChange={(v) => set('freq', v)} />}
        {cur === 'age' && <BigNumberInput val={ans.age} unit="yrs" onChange={(v) => set('age', v)} helper="Between 18 and 99" />}
        {cur === 'kg' && <BigNumberInput val={ans.kg} unit="kg" onChange={(v) => set('kg', v)} helper="We compute real volume + tonnage" />}
        {cur === 'cm' && <BigNumberInput val={ans.cm} unit="cm" onChange={(v) => set('cm', v)} helper="Needed for your base calories" />}
        {cur === 'summary' && <OnboardSummary ans={ans} D={D} />}
      </div>

      <button className="btn btn-grad" style={{ width: '100%', marginTop: 16 }} onClick={next}>
        {cur === 'summary' ? 'Let\u2019s begin' : 'Continue'} <Icon name="arrowRight" size={18} stroke="var(--on-accent)" />
      </button>
      <style>{`
        .ob-bar{flex:1;height:6px;border-radius:99px;background:var(--surface-2);overflow:hidden;}
        .ob-bar span{display:block;height:100%;border-radius:99px;background:var(--grad-pulse);transition:width .4s cubic-bezier(.2,.8,.2,1);}
        .ob-tile{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:26px 12px;border-radius:20px;
          background:var(--surface);border:1.5px solid var(--line);transition:border .2s,background .2s,transform .12s;}
        .ob-tile.on{border-color:var(--accent);background:color-mix(in oklab,var(--accent) 10%,var(--surface));}
      `}</style>
    </div>
  );
}
const OB_TITLES = { goal: 'What\u2019s your goal?', age: 'How old are you?', sex: 'Biological sex', freq: 'How often do you train?', level: 'How much experience?', kg: 'How much do you weigh?', cm: 'How tall are you?', summary: 'Check your details' };
const OB_DESC = { goal: 'Pick one. You can change it later.', age: 'Helps us tune intensity and recovery.', sex: 'Affects TDEE estimate and recovery rates.', freq: 'Days per week you can train.', level: 'We calibrate your starting volume and progression.', kg: 'We compute real volume + tonnage.', cm: 'Needed to compute your base calories (BMR).', summary: 'You can come back any time to change these.' };

function ChoiceList({ items, val, onPick }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((it) => {
        const on = val === it.id;
        return (
          <button key={it.id} className={`ob-row press ${on ? 'on' : ''}`} onClick={() => onPick(it.id)}>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="display" style={{ fontSize: 16, fontWeight: 600 }}>{it.label}</span>
                {it.badge && <Pill color="var(--volt)">{it.badge}</Pill>}
              </div>
              <div style={{ color: 'var(--ink-2)', fontSize: 12.5, marginTop: 3 }}>{it.sub}</div>
            </div>
            <span className={`ob-check ${on ? 'on' : ''}`}>{on && <Icon name="check" size={15} stroke="var(--on-accent)" sw={2.6} />}</span>
            <style>{`
              .ob-row{display:flex;align-items:center;gap:12px;padding:16px;border-radius:18px;background:var(--surface);border:1.5px solid var(--line);transition:border .2s,background .2s,transform .12s;}
              .ob-row.on{border-color:var(--accent);background:color-mix(in oklab,var(--accent) 9%,var(--surface));}
              .ob-check{width:24px;height:24px;border-radius:50%;border:1.5px solid var(--line-strong);display:grid;place-items:center;flex-shrink:0;transition:.2s;}
              .ob-check.on{background:var(--accent);border-color:var(--accent);}
            `}</style>
          </button>
        );
      })}
    </div>
  );
}

function BigNumberInput({ val, unit, onChange, helper }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, paddingTop: 18 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <input className="big-num num" type="number" value={val} onChange={(e) => onChange(Number(e.target.value))} inputMode="numeric" />
        <span className="display" style={{ fontSize: 22, color: 'var(--ink-2)', fontWeight: 600 }}>{unit}</span>
      </div>
      <p style={{ color: 'var(--ink-3)', fontSize: 12.5 }}>{helper}</p>
      <style>{`.big-num{width:140px;text-align:center;background:transparent;border:none;border-bottom:2px solid var(--accent);
        color:var(--ink);font-size:58px;font-weight:700;outline:none;padding-bottom:4px;}
        .big-num::-webkit-inner-spin-button{display:none;}`}</style>
    </div>
  );
}

function Stepper({ val, min, max, unit, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, paddingTop: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
        <button className="step-btn press" onClick={() => onChange(Math.max(min, val - 1))}><span style={{ fontSize: 28 }}>−</span></button>
        <div style={{ textAlign: 'center' }}>
          <div className="num" style={{ fontSize: 64, fontWeight: 700, lineHeight: 1 }}>{val}</div>
        </div>
        <button className="step-btn press" onClick={() => onChange(Math.min(max, val + 1))}><Icon name="plus" size={24} stroke="var(--on-accent)" /></button>
      </div>
      <span className="mono" style={{ fontSize: 12, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.1em' }}>{unit}</span>
      <div style={{ display: 'flex', gap: 7, marginTop: 4 }}>
        {Array.from({ length: max - min + 1 }, (_, i) => (
          <span key={i} style={{ width: 10, height: 10, borderRadius: 3, background: i + min <= val ? 'var(--accent)' : 'var(--surface-2)', transition: '.2s' }} />
        ))}
      </div>
      <style>{`.step-btn{width:58px;height:58px;border-radius:50%;display:grid;place-items:center;color:var(--on-accent);background:var(--accent);font-weight:700;}`}</style>
    </div>
  );
}

function OnboardSummary({ ans, D }) {
  const rows = [
    ['Goal', (D.goals.find((g) => g.id === ans.goal) || {}).label],
    ['Age', ans.age + ' yrs'],
    ['Sex', ans.sex === 'm' ? 'Male' : 'Female'],
    ['Frequency', ans.freq + ' days / week'],
    ['Experience', (D.levels.find((l) => l.id === ans.level) || {}).label],
    ['Weight', ans.kg + ' kg'],
    ['Height', ans.cm + ' cm'],
  ];
  return (
    <div className="card sheen anim-rise" style={{ padding: 6 }}>
      {rows.map((r, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: i < rows.length - 1 ? '1px solid var(--line)' : 'none' }}>
          <span className="label">{r[0]}</span>
          <span className="display" style={{ fontSize: 15, fontWeight: 600 }}>{r[1]}</span>
        </div>
      ))}
    </div>
  );
}
window.OnboardingScreen = OnboardingScreen;
