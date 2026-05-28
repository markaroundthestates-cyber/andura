// ══ ANDURA PULSE — PROGRES · ISTORIC · CONT ════════════════════════════════
const { useState: _tS } = React;

/* ── PROGRES ───────────────────────────────────────────────────────────── */
function ProgresScreen() {
  const D = window.AnduraData; const n = D.nutrition;
  const last = D.weightLog[D.weightLog.length - 1];
  const first = D.weightLog[0];
  const delta = (last.kg - first.kg).toFixed(1);

  return (
    <div className="scroll anim-screen" style={{ height: '100%', padding: '54px 18px 110px' }}>
      <div className="anim-rise">
        <h1 className="display" style={{ fontSize: 30, fontWeight: 700 }}>Progress</h1>
        <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--ink-2)', fontSize: 13.5, marginTop: 1 }}>Body composition · calibrated estimates.</p>
      </div>

      {/* AZI — kcal HERO */}
      <Kicker>{'\u00A0'}</Kicker>
      <div className="zone-h">TODAY</div>
      <div className="card sheen anim-rise d1" style={{ padding: 20, overflow: 'hidden', position: 'relative' }}>
        <div className="coach-glow" style={{ background: 'radial-gradient(circle,color-mix(in oklab,var(--aqua) 22%,transparent),transparent 68%)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Kicker color="var(--aqua)">CALORIES RECOMMENDED TODAY</Kicker>
          <div style={{ textAlign: 'right' }}>
            <Pill color="var(--ember)">PHASE · {n.phase}</Pill>
            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 7 }}>Week 1 · mesocycle</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
          <span className="num" style={{ fontSize: 48, fontWeight: 700 }}><CountUp value={n.kcalTarget} format={(x) => Math.round(x).toLocaleString('en-US')} /></span>
          <span className="display" style={{ fontSize: 18, color: 'var(--ink-2)', fontWeight: 600 }}>kcal</span>
        </div>
        <div style={{ display: 'flex', gap: 20, marginTop: 6, color: 'var(--ink-2)', fontSize: 13 }}>
          <span><b className="num" style={{ color: 'var(--ink)' }}><CountUp value={n.proteinTarget} />g</b> protein</span>
          <span>TDEE <b className="num" style={{ color: 'var(--ink)' }}>{n.tdee}</b></span>
        </div>
        <p style={{ color: 'var(--ink-3)', fontSize: 11.5, marginTop: 10, lineHeight: 1.5 }}>The engine calibrates from real data. The scale is the ground truth.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
        <MiniStat label="Fatigue" value={D.fatigue.score} sub={D.fatigue.label} color="var(--aqua)" cls="anim-rise d2" />
        <MiniStat label="Base calories (BMR)" value={n.bmr.toLocaleString('en-US')} sub="metabolism" color="var(--volt)" cls="anim-rise d2" />
      </div>
      <div className="card card-tight anim-rise d3" style={{ marginTop: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div><div className="label">BODY FAT · ESTIMATE</div><div className="num" style={{ fontSize: 22, fontWeight: 700, marginTop: 3 }}>{n.bodyFat}%</div></div>
        <Pill color="var(--ink-3)">{n.bfMethod}</Pill>
      </div>

      {/* TENDINTA */}
      <div className="zone-h" style={{ marginTop: 24 }}>TREND</div>
      <div className="card sheen anim-rise" style={{ padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div>
            <Kicker color="var(--aqua)">WEIGHT · 8 WEEKS</Kicker>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
              <span className="num" style={{ fontSize: 30, fontWeight: 700 }}>{last.kg}</span><span style={{ color: 'var(--ink-2)' }}>kg</span>
              <Pill color="var(--volt)">{delta} kg</Pill>
            </div>
          </div>
          <Icon name="trending" size={20} stroke="var(--aqua)" />
        </div>
        <Sparkline data={D.weightLog} color="var(--aqua)" />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          {D.weightLog.map((d, i) => <span key={i} className="mono" style={{ fontSize: 9, color: 'var(--ink-3)' }}>{d.day}</span>)}
        </div>
        <div className="proj-line"><Icon name="target" size={15} stroke="var(--volt)" /><span>{n.projection}</span></div>
      </div>

      {/* ACTIONS */}
      <div className="zone-h" style={{ marginTop: 24 }}>ACTIONS</div>
      <button className="btn btn-grad press anim-rise" style={{ width: '100%', justifyContent: 'flex-start', gap: 12, paddingLeft: 18 }}>
        <Icon name="scale" size={20} stroke="var(--on-accent)" /> Log weight today
      </button>
      <div className="card card-tight anim-rise" style={{ padding: '14px 16px', marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="label">LAST WEIGH-IN</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}><span className="num" style={{ fontSize: 22, fontWeight: 700 }}>{last.kg}</span><span style={{ color: 'var(--ink-2)', fontSize: 13 }}>kg</span></div>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>2026-05-28</div>
        </div>
        <Icon name="history" size={20} stroke="var(--ink-3)" />
      </div>
      <button className="prog-row press anim-rise" style={{ marginTop: 10 }}><Icon name="trending" size={18} stroke="var(--aqua)" /> <span style={{ flex: 1, textAlign: 'left' }}>View weight trend</span> <Icon name="chevronRight" size={16} stroke="var(--ink-3)" /></button>
      <button className="prog-row press anim-rise" style={{ marginTop: 10 }}><Icon name="ruler" size={18} stroke="var(--volt)" /> <span style={{ flex: 1, textAlign: 'left' }}>Body measurements</span> <Icon name="chevronRight" size={16} stroke="var(--ink-3)" /></button>

      {/* RECUPERARE */}
      <div className="zone-h" style={{ marginTop: 24 }}>MUSCLE RECOVERY</div>
      <div className="card anim-rise" style={{ padding: 16 }}>
        <div className="recov-grid">
          {D.recovery.map((m, i) => {
            const c = m.pct >= 85 ? 'var(--volt)' : m.pct >= 60 ? 'var(--aqua)' : 'var(--ember)';
            return (
              <div key={m.name} className="recov-cell" style={{ animationDelay: `${i * 0.04}s` }}>
                <Ring size={52} stroke={5} pct={m.pct} color={c} glow={false}><span className="num" style={{ fontSize: 13, fontWeight: 700 }}>{m.pct}</span></Ring>
                <span style={{ fontSize: 10.5, color: 'var(--ink-2)', marginTop: 5 }}>{m.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* OBIECTIV */}
      <div className="zone-h" style={{ marginTop: 24 }}>GOAL</div>
      <GoalPicker />
      <div className="card anim-rise" style={{ padding: 4, marginTop: 12 }}>
        <div className="tgt-row"><span style={{ flex: 1 }}>Target weight</span><span className="num" style={{ fontSize: 17, fontWeight: 700, color: 'var(--accent)' }}>78 kg</span></div>
        <div className="tgt-row" style={{ borderTop: '1px solid var(--line)' }}><span style={{ flex: 1 }}>By</span><span className="mono" style={{ fontSize: 13, color: 'var(--ink-2)' }}>Aug 2026</span></div>
      </div>

      <style>{`
        .zone-h{font-family:var(--font-mono);font-size:11px;letter-spacing:.14em;color:var(--ink-3);text-transform:uppercase;margin:6px 0 11px;}
        .proj-line{display:flex;align-items:center;gap:9px;margin-top:14px;padding-top:14px;border-top:1px solid var(--line);font-size:13px;color:var(--ink-2);line-height:1.4;}
        .recov-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px 6px;}
        .recov-cell{display:flex;flex-direction:column;align-items:center;animation:cardRise .5s both;}
        .prog-row{display:flex;align-items:center;gap:12px;width:100%;padding:15px 16px;border-radius:16px;background:var(--surface);border:1px solid var(--line);font-size:14.5px;font-weight:600;color:var(--ink);}
        .tgt-row{display:flex;align-items:center;gap:12px;padding:15px 14px;font-size:14px;color:var(--ink);}
      `}</style>
    </div>
  );
}
window.ProgresScreen = ProgresScreen;

function MiniStat({ label, value, sub, color, cls }) {
  return (
    <div className={`card card-tight ${cls || ''}`} style={{ padding: '14px 15px', position: 'relative', overflow: 'hidden' }}>
      <span className="tile-wash" style={{ background: `radial-gradient(circle at 100% 0%, color-mix(in oklab, ${color} 16%, transparent), transparent 60%)` }} />
      <div className="label" style={{ position: 'relative' }}>{label}</div>
      <div className="num" style={{ position: 'relative', fontSize: 24, fontWeight: 700, marginTop: 5 }}>{value}</div>
      <div style={{ position: 'relative', fontSize: 11.5, color: 'var(--ink-2)', marginTop: 1 }}>{sub}</div>
    </div>
  );
}

function GoalPicker() {
  const D = window.AnduraData;
  const [g, setG] = _tS('auto');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      {D.goals.map((it) => {
        const on = g === it.id;
        return (
          <button key={it.id} className={`ob-row press ${on ? 'on' : ''}`} onClick={() => setG(it.id)}>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="display" style={{ fontSize: 15, fontWeight: 600 }}>{it.label}</span>
                {it.badge && <Pill color="var(--volt)">{it.badge}</Pill>}
              </div>
              <div style={{ color: 'var(--ink-2)', fontSize: 12, marginTop: 2 }}>{it.sub}</div>
            </div>
            <span className={`ob-check ${on ? 'on' : ''}`}>{on && <Icon name="check" size={14} stroke="var(--on-accent)" sw={2.6} />}</span>
          </button>
        );
      })}
      <style>{`
        .ob-row{display:flex;align-items:center;gap:12px;padding:15px;border-radius:16px;background:var(--surface);border:1.5px solid var(--line);transition:.2s;}
        .ob-row.on{border-color:var(--accent);background:color-mix(in oklab,var(--accent) 9%,var(--surface));}
        .ob-check{width:23px;height:23px;border-radius:50%;border:1.5px solid var(--line-strong);display:grid;place-items:center;flex-shrink:0;transition:.2s;}
        .ob-check.on{background:var(--accent);border-color:var(--accent);}
      `}</style>
    </div>
  );
}

/* ── ISTORIC ───────────────────────────────────────────────────────────── */
function IstoricScreen() {
  const D = window.AnduraData;
  const ratingMap = { easy: { t: 'Easy', c: 'var(--volt)' }, right: { t: 'Right', c: 'var(--aqua)' }, hard: { t: 'Hard', c: 'var(--ember)' } };

  // month calendar
  const now = new Date();
  const year = now.getFullYear(), month = now.getMonth(), todayD = now.getDate();
  const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7; // Mon=0
  const cycle = ['normal', 'rest', 'hard', 'rest', 'easy', 'normal', 'rest', 'recovery', 'normal', 'hard'];
  const stateColor = { hard: 'var(--ember)', normal: 'var(--aqua)', easy: 'var(--volt)', recovery: 'var(--violet)' };
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    let st = 'future';
    if (d < todayD) st = cycle[d % cycle.length];
    else if (d === todayD) st = 'today';
    cells.push({ d, st });
  }
  const legend = [['easy', 'Easy'], ['normal', 'Normal'], ['hard', 'Hard'], ['recovery', 'Recovery'], ['rest', 'Rest']];

  return (
    <div className="scroll anim-screen" style={{ height: '100%', padding: '54px 18px 110px' }}>
      <div className="anim-rise"><h1 className="display" style={{ fontSize: 30, fontWeight: 700 }}>History</h1></div>

      {/* 3 stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, margin: '16px 0' }}>
        <HistStat icon="flame" color="var(--volt)" value="12" label="Day streak" cls="anim-rise d1" anim="flame" />
        <HistStat icon="history" color="var(--aqua)" value="84" label="Sessions" cls="anim-rise d2" />
        <HistStat icon="trophy" color="var(--ember)" value="7" label="Records" cls="anim-rise d3" />
      </div>

      {/* month calendar */}
      <div className="card anim-rise d2" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div className="display" style={{ fontSize: 16, fontWeight: 700 }}>{monthName}</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="cal-nav press"><Icon name="chevronLeft" size={16} stroke="var(--ink-2)" /></button>
            <button className="cal-nav press"><Icon name="chevronRight" size={16} stroke="var(--ink-2)" /></button>
          </div>
        </div>
        <div className="cal-grid cal-head">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i} className="mono cal-wd">{d}</span>)}
        </div>
        <div className="cal-grid" style={{ marginTop: 6 }}>
          {cells.map((c, i) => {
            if (!c) return <span key={i} />;
            const col = stateColor[c.st];
            return (
              <span key={i} className={`cal-day ${c.st === 'today' ? 'is-today' : ''} ${c.st === 'future' ? 'is-future' : ''}`}
                style={{ animationDelay: `${0.18 + i * 0.012}s` }}>
                <span className="cal-num num">{c.d}</span>
                {col && <span className="cal-mark" style={{ background: col, boxShadow: `0 0 8px ${col}` }} />}
              </span>
            );
          })}
        </div>
        <div className="cal-legend">
          {legend.map(([k, lbl]) => (
            <span key={k} className="leg-item">
              <span className="leg-dot" style={{ background: stateColor[k] || 'var(--surface-2)', border: stateColor[k] ? 'none' : '1px solid var(--line-strong)' }} />
              <span className="mono">{lbl}</span>
            </span>
          ))}
        </div>
      </div>

      {/* how sessions felt */}
      <div className="card anim-rise d3" style={{ padding: 18, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Kicker color="var(--aqua)">HOW YOUR SESSIONS FELT</Kicker>
          <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>last 90 days</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 14 }}>
          {[['Easy', 22, 'var(--volt)'], ['Right', 41, 'var(--aqua)'], ['Hard', 13, 'var(--ember)']].map(([lbl, v, c]) => (
            <div key={lbl} style={{ textAlign: 'center' }}>
              <div className="num" style={{ fontSize: 26, fontWeight: 700, color: c }}><CountUp value={v} /></div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 2 }}>{lbl}</div>
              <div className="felt-bar" style={{ marginTop: 8 }}><span style={{ width: `${(v / 41) * 100}%`, background: c }} /></div>
            </div>
          ))}
        </div>
        <p style={{ color: 'var(--ink-3)', fontSize: 11.5, marginTop: 14, lineHeight: 1.5, textAlign: 'center' }}>
          The coach uses your ratings to tune intensity. <b style={{ color: 'var(--ink-2)' }}>76 sessions</b> in the last 90 days.
        </p>
      </div>

      <Kicker>SESSIONS</Kicker>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginTop: 12 }}>
        {D.history.map((s, i) => {
          const rt = ratingMap[s.rating];
          return (
            <div key={i} className="card card-tight press anim-rise" style={{ padding: 16, animationDelay: `${i * 0.05}s` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="display" style={{ fontSize: 15.5, fontWeight: 600 }}>{s.title}</span>
                    {s.prHit && <Icon name="trophy" size={15} stroke="var(--ember)" />}
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 3 }}>{s.date}</div>
                </div>
                <Pill color={rt.c}>{rt.t}</Pill>
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 12, color: 'var(--ink-2)', fontSize: 12 }}>
                <span><b className="num" style={{ color: 'var(--ink)' }}>{s.durationMin}</b> min</span>
                <span><b className="num" style={{ color: 'var(--ink)' }}>{s.sets}</b> sets</span>
                <span><b className="num" style={{ color: 'var(--ink)' }}>{s.volumeKg.toLocaleString('en-US')}</b> kg</span>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .cal-nav{width:30px;height:30px;border-radius:9px;display:grid;place-items:center;background:var(--surface-2);border:1px solid var(--line);}
        .cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;}
        .cal-head{margin-bottom:2px;}
        .cal-wd{text-align:center;font-size:10px;color:var(--aqua);padding:4px 0;}
        .cal-day{position:relative;aspect-ratio:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;border-radius:10px;
          background:var(--surface-2);animation:cardRise .4s both;}
        .cal-num{font-size:12px;color:var(--ink-2);}
        .cal-day.is-future{background:transparent;}
        .cal-day.is-future .cal-num{color:var(--ink-3);opacity:.5;}
        .cal-day.is-today{outline:2px solid var(--accent);outline-offset:-1px;}
        .cal-day.is-today .cal-num{color:var(--accent);font-weight:700;}
        .cal-mark{width:6px;height:6px;border-radius:50%;}
        .cal-legend{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px;padding-top:14px;border-top:1px solid var(--line);}
        .leg-item{display:flex;align-items:center;gap:5px;}
        .leg-dot{width:9px;height:9px;border-radius:3px;}
        .leg-item .mono{font-size:10px;color:var(--ink-2);}
        .felt-bar{height:6px;border-radius:99px;background:var(--surface-2);overflow:hidden;}
        .felt-bar span{display:block;height:100%;border-radius:99px;transform-origin:left;animation:barGrow .9s cubic-bezier(.2,.8,.2,1) both;}
      `}</style>
    </div>
  );
}
window.IstoricScreen = IstoricScreen;

function HistStat({ icon, color, value, label, cls, anim }) {
  return (
    <div className={`card card-tight ${cls || ''}`} style={{ padding: '15px 8px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <span className="tile-wash" style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 0%, color-mix(in oklab, ${color} 16%, transparent), transparent 65%)` }} />
      <Icon name={icon} size={18} stroke={color} className={anim === 'flame' ? 'flame' : ''} style={{ position: 'relative' }} />
      <div className="num" style={{ position: 'relative', fontSize: 24, fontWeight: 700, marginTop: 6 }}>{value}</div>
      <div style={{ position: 'relative', fontSize: 11, color: 'var(--ink-2)', marginTop: 1 }}>{label}</div>
    </div>
  );
}

/* ── CONT ──────────────────────────────────────────────────────────────── */
function ContScreen({ accent, setAccent, theme, setTheme }) {
  const accents = [
    { label: 'Volt', c: '#b6f23a' },
    { label: 'Aqua', c: '#4fd6e8' },
    { label: 'Ember', c: '#ff7d52' },
    { label: 'Violet', c: '#a98bff' },
  ];
  const groups = [
    { h: 'ACCOUNT', rows: [['user', 'Profile', '32 yrs · 82 kg · Auto'], ['bell', 'Notifications', 'On · 18:00'], ['spark', 'Subscription', 'Free Beta']] },
    { h: 'GENERAL', rows: [['dumbbell', 'Missing equipment', '2 flagged'], ['settings', 'Settings', 'Units, sound, language']] },
    { h: 'DATA & PRIVACY', rows: [['shield', 'Privacy policy', 'Local-first · zero ads'], ['layers', 'Terms of service', ''], ['download', 'Download your data', 'JSON export'], ['upload', 'Import history', 'Weight + nutrition']] },
    { h: 'HELP', rows: [['help', 'Support', ''], ['flag', 'Report a problem', ''], ['info', 'About Andura', 'v2.0.0'], ['help', 'FAQ', '']] },
  ];
  return (
    <div className="scroll anim-screen" style={{ height: '100%', padding: '54px 18px 110px' }}>
      <div className="anim-rise"><h1 className="display" style={{ fontSize: 30, fontWeight: 700 }}>Account</h1></div>

      {/* profile header */}
      <div className="card sheen anim-rise d1" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14, marginTop: 14 }}>
        <div className="avatar"><span className="display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--on-accent)' }}>M</span></div>
        <div style={{ flex: 1 }}>
          <div className="display" style={{ fontSize: 18, fontWeight: 700 }}>Marius</div>
          <div className="mono" style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>marius@andura.app</div>
        </div>
        <Pill color="var(--volt)"><Icon name="flame" size={12} stroke="var(--volt)" /> 12 days</Pill>
      </div>

      {/* ASPECT — accent + theme (live) */}
      <div className="zone-h" style={{ marginTop: 22 }}>APPEARANCE</div>
      <div className="card anim-rise" style={{ padding: 16 }}>
        <div className="label" style={{ marginBottom: 11 }}>ACCENT COLOR</div>
        <div style={{ display: 'flex', gap: 12 }}>
          {accents.map((a) => (
            <button key={a.label} className={`acc-sw press ${accent === a.c ? 'on' : ''}`} onClick={() => setAccent(a.c)} aria-label={a.label}
              style={{ '--sw': a.c }}>
              <span className="acc-dot" style={{ background: a.c }}>{accent === a.c && <Icon name="check" size={15} stroke="#0a0c14" sw={2.8} />}</span>
              <span className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', marginTop: 5 }}>{a.label}</span>
            </button>
          ))}
        </div>
        <div style={{ height: 1, background: 'var(--line)', margin: '16px 0' }} />
        <div className="label" style={{ marginBottom: 11 }}>MODE</div>
        <div className="seg">
          {[['dark', 'Dark'], ['light', 'Light']].map(([id, lbl]) => (
            <button key={id} className={`seg-b ${theme === id ? 'on' : ''}`} onClick={() => setTheme(id)}>{lbl}</button>
          ))}
        </div>
      </div>

      {groups.map((g, gi) => (
        <div key={gi}>
          <div className="zone-h" style={{ marginTop: 22 }}>{g.h}</div>
          <div className="card anim-rise" style={{ padding: 4, overflow: 'hidden' }}>
            {g.rows.map((r, i) => (
              <button key={i} className="cont-row press" style={{ borderBottom: i < g.rows.length - 1 ? '1px solid var(--line)' : 'none' }}>
                <span className="cont-ico"><Icon name={r[0]} size={18} stroke="var(--ink-2)" /></span>
                <span style={{ flex: 1, textAlign: 'left' }}>
                  <span style={{ fontSize: 14.5, fontWeight: 600, display: 'block' }}>{r[1]}</span>
                  <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{r[2]}</span>
                </span>
                <Icon name="chevronRight" size={17} stroke="var(--ink-3)" />
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="zone-h" style={{ marginTop: 22 }}>LOGOUT & DELETE</div>
      <button className="cont-danger press"><Icon name="x" size={17} stroke="#ff5d6c" /> Logout & delete</button>

      <p style={{ textAlign: 'center', color: 'var(--ink-3)', fontSize: 11, marginTop: 22 }}>Andura · v2.0.0</p>
      <p style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--ink-3)', fontSize: 12.5, marginTop: 3 }}>Training with brain.</p>

      <style>{`
        .avatar{width:54px;height:54px;border-radius:50%;display:grid;place-items:center;background:var(--grad-pulse);box-shadow:0 0 26px -6px var(--aqua);}
        .acc-sw{display:flex;flex-direction:column;align-items:center;flex:1;}
        .acc-dot{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;border:2px solid transparent;transition:.2s;box-shadow:0 0 0 0 var(--sw);}
        .acc-sw.on .acc-dot{box-shadow:0 0 18px -2px var(--sw);transform:scale(1.06);}
        .seg{display:flex;gap:6px;background:var(--surface-2);border-radius:14px;padding:4px;}
        .seg-b{flex:1;padding:10px;border-radius:11px;font-size:13px;font-weight:600;color:var(--ink-2);transition:.2s;}
        .seg-b.on{background:var(--accent);color:var(--on-accent);}
        .cont-row{display:flex;align-items:center;gap:13px;width:100%;padding:14px 13px;}
        .cont-ico{width:36px;height:36px;border-radius:11px;display:grid;place-items:center;background:var(--surface-2);flex-shrink:0;}
        .cont-danger{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:16px;border-radius:16px;color:#ff5d6c;font-weight:700;font-size:14.5px;background:color-mix(in oklab,#ff5d6c 9%,transparent);border:1px solid color-mix(in oklab,#ff5d6c 25%,transparent);}
      `}</style>
    </div>
  );
}
window.ContScreen = ContScreen;
