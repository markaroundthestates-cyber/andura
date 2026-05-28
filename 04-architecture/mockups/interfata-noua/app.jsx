// ══ ANDURA PULSE — app root: rama telefon + state machine + tweaks ═════════
const { useState: _AS, useEffect: _AE } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "motion": 10,
  "accent": "#b6f23a",
  "lightMode": false
}/*EDITMODE-END*/;

function applyTheme(t) {
  const root = document.documentElement;
  root.setAttribute('data-theme', t.lightMode ? 'light' : 'dark');
  root.style.setProperty('--motion', String(Math.max(0, t.motion) / 10));
  root.setAttribute('data-calm', t.motion <= 0 ? '1' : '0');
  root.style.setProperty('--accent', t.accent);
  root.style.setProperty('--accent-deep', `color-mix(in oklab, ${t.accent} 80%, #000)`);
}

function PhoneFrame({ children }) {
  const [scale, setScale] = _AS(1);
  _AE(() => {
    const fit = () => {
      const h = window.innerHeight, w = window.innerWidth;
      setScale(Math.min((h - 24) / 868, (w - 24) / 414, 1.15));
    };
    fit(); window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  return (
    <div className="stage">
      <div className="device" style={{ transform: `scale(${scale})` }}>
        <div className="bezel">
          <div className="screen">
            <div className="notch"><span className="nspk" /><span className="ncam" /></div>
            {children}
          </div>
        </div>
      </div>
      <style>{`
        .stage{position:fixed;inset:0;display:grid;place-items:center;background:radial-gradient(140% 120% at 50% 0%, #14182a 0%, #05060a 60%);overflow:hidden;}
        .device{width:402px;height:856px;transform-origin:center;}
        .bezel{width:100%;height:100%;border-radius:52px;padding:11px;background:linear-gradient(160deg,#23262f,#0a0b10 60%);
          box-shadow:0 0 0 2px #000, 0 40px 90px -30px rgba(0,0,0,.9), inset 0 1px 1px rgba(255,255,255,.12);}
        .screen{position:relative;width:100%;height:100%;border-radius:42px;overflow:hidden;background:var(--bg);}
        .notch{position:absolute;top:11px;left:50%;transform:translateX(-50%);z-index:70;width:120px;height:30px;border-radius:18px;background:#000;display:flex;align-items:center;justify-content:center;gap:30px;}
        .nspk{width:38px;height:5px;border-radius:99px;background:#1b1d24;}
        .ncam{width:9px;height:9px;border-radius:50%;background:#1b1d24;box-shadow:inset 0 0 2px #3a4a6a;}
      `}</style>
    </div>
  );
}

function StatusBar() {
  const [time, setTime] = _AS('');
  _AE(() => {
    const upd = () => { const d = new Date(); setTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`); };
    upd(); const id = setInterval(upd, 10000); return () => clearInterval(id);
  }, []);
  return (
    <div className="statusbar">
      <span className="mono">{time}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="4.5" y="5" width="3" height="7" rx="1"/><rect x="9" y="2.5" width="3" height="9.5" rx="1"/><rect x="13.5" y="0" width="3" height="12" rx="1"/></svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><path d="M8 2.5c2.2 0 4.2.9 5.6 2.3l1.4-1.4A10 10 0 0 0 8 .5 10 10 0 0 0 1 3.4l1.4 1.4A7.9 7.9 0 0 1 8 2.5z" opacity="1"/><path d="M8 6c1.1 0 2.1.45 2.8 1.2l1.4-1.4A6 6 0 0 0 8 4a6 6 0 0 0-4.2 1.8l1.4 1.4A4 4 0 0 1 8 6z"/><circle cx="8" cy="10" r="1.6"/></svg>
        <svg width="24" height="12" viewBox="0 0 24 12" fill="none"><rect x="1" y="1" width="20" height="10" rx="3" stroke="currentColor" strokeOpacity=".5"/><rect x="3" y="3" width="14" height="6" rx="1.5" fill="currentColor"/><rect x="22" y="4" width="1.5" height="4" rx="1" fill="currentColor" fillOpacity=".5"/></svg>
      </span>
      <style>{`.statusbar{position:absolute;top:0;left:0;right:0;z-index:65;display:flex;align-items:center;justify-content:space-between;
        padding:14px 28px 0;height:46px;color:var(--ink);font-size:13px;font-weight:600;pointer-events:none;}
        .statusbar .mono{font-size:13px;letter-spacing:.02em;}`}</style>
    </div>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [stage, setStage] = _AS('splash'); // splash | auth | onboarding | app
  const [tab, setTab] = _AS('antrenor');
  const [workout, setWorkout] = _AS(false);

  _AE(() => { applyTheme(t); }, [t]);

  const accent = t.accent;
  const setAccent = (c) => setTweak('accent', c);
  const setTheme = (mode) => setTweak('lightMode', mode === 'light');

  let body;
  if (stage === 'splash') body = <SplashScreen onDone={() => setStage('auth')} />;
  else if (stage === 'auth') body = <AuthScreen onEnter={setStage} />;
  else if (stage === 'onboarding') body = <OnboardingScreen onEnter={setStage} />;
  else if (workout) body = <WorkoutFlow onExit={() => setWorkout(false)} onComplete={() => { setWorkout(false); setTab('antrenor'); }} />;
  else {
    const screen = tab === 'antrenor' ? <AntrenorScreen onStart={() => setWorkout(true)} />
      : tab === 'progres' ? <ProgresScreen />
      : tab === 'istoric' ? <IstoricScreen />
      : <ContScreen accent={accent} setAccent={setAccent} theme={t.lightMode ? 'light' : 'dark'} setTheme={setTheme} />;
    body = (
      <>
        <div key={tab} style={{ position: 'absolute', inset: 0 }}>{screen}</div>
        <BottomNav active={tab} onChange={setTab} />
      </>
    );
  }

  const showStatus = stage !== 'splash';

  return (
    <PhoneFrame>
      <AuroraBackground />
      {showStatus && <StatusBar />}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>{body}</div>

      <TweaksPanel>
        <TweakSection label="Motion" />
        <TweakSlider label="Animation intensity" value={t.motion} min={0} max={10} step={1}
          onChange={(v) => setTweak('motion', v)} />
        <TweakSection label="Appearance" />
        <TweakColor label="Accent" value={t.accent}
          options={['#b6f23a', '#4fd6e8', '#ff7d52', '#a98bff']}
          onChange={(v) => setTweak('accent', v)} />
        <TweakToggle label="Light mode" value={t.lightMode} onChange={(v) => setTweak('lightMode', v)} />
        <TweakSection label="Quick navigation" />
        <TweakButton label="View splash + onboarding" onClick={() => { setStage('splash'); setWorkout(false); }} />
        <TweakButton label="Jump into the app" onClick={() => { setStage('app'); setWorkout(false); }} />
      </TweaksPanel>
    </PhoneFrame>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
