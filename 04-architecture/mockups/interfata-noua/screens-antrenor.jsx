// ══ ANDURA PULSE — ANTRENOR (hero dashboard) ═══════════════════════════════
const { useState: _aS } = React;

function AntrenorScreen({ onStart }) {
  const D = window.AnduraData;
  const r = D.readiness, w = D.plannedWorkout;

  return (
    <div className="scroll anim-screen" style={{ height: '100%', padding: '54px 18px 110px' }}>
      {/* header */}
      <div className="anim-rise" style={{ marginBottom: 18 }}>
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '.08em' }}>{D.todayHeader()}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
          <h1 className="display" style={{ fontSize: 30, fontWeight: 700 }}>Coach</h1>
          <span className="floaty"><PulseMark size={34} /></span>
        </div>
        <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--ink-2)', fontSize: 14, marginTop: 1 }}>
          Your guide in the gym.
        </p>
      </div>

      {/* HERO readiness */}
      <div className="card sheen anim-rise d1" style={{ padding: '20px 18px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 16, overflow: 'hidden' }}>
        <ReadinessOrb score={r.score} canPR={r.canPR} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Kicker color="var(--aqua)">TODAY’S VERDICT</Kicker>
          <div className="display" style={{ fontSize: 22, fontWeight: 700, marginTop: 5, color: 'var(--aqua)' }}>{r.label}</div>
          <p style={{ color: 'var(--ink-2)', fontSize: 13, lineHeight: 1.45, marginTop: 6 }}>
            You are dialed in. Your body is ready for heavy loading today.
          </p>
          {r.canPR && <div style={{ marginTop: 10 }}><Pill color="var(--volt)" solid><Icon name="zap" size={12} fill="var(--on-accent)" /> PRIMED FOR A PR</Pill></div>}
        </div>
      </div>

      {/* coach card */}
      {/* COACH TODAY CARD */}
      <div className="coach-card anim-rise d4" style={{ marginTop: 6 }}>
        <div className="coach-glow" />
        <Kicker color="var(--volt)">COACH RECOMMENDS TODAY</Kicker>
        <div className="display" style={{ fontSize: 21, fontWeight: 700, marginTop: 6, lineHeight: 1.15 }}>{w.workoutTitle}</div>
        <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--volt)', fontSize: 14, marginTop: 9, lineHeight: 1.5 }}>
          &bdquo;{w.coachQuote}&rdquo;
        </p>
        <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--ember)', fontSize: 12.5, marginTop: 8, paddingTop: 8, borderTop: '1px dashed color-mix(in oklab, var(--ember) 35%, transparent)', lineHeight: 1.5 }}>
          &bdquo;{w.laggingSignal}&rdquo;
        </p>
        <div style={{ display: 'flex', gap: 18, marginTop: 14, color: 'var(--ink-2)', fontSize: 13 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="clock" size={15} /> ~ {w.estimatedDuration} min</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="layers" size={15} /> {w.exerciseCount} exercises</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="dumbbell" size={15} /> +15%</span>
        </div>
        <button className="btn btn-grad press" style={{ width: '100%', marginTop: 16 }} onClick={onStart}>
          Start session <Icon name="arrowRight" size={18} stroke="var(--on-accent)" />
        </button>
        <button className="coach-override" onClick={onStart}>Want something else today? →</button>
      </div>

      {/* TRAINING SCHEDULE (editable) */}
      <TrainingSchedule />

      <ScreenStyles />
    </div>
  );
}
window.AntrenorScreen = AntrenorScreen;

function TrainingSchedule() {
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayIdx = (new Date().getDay() + 6) % 7; // Mon=0
  const [days, setDays] = _aS([true, false, true, false, true, true, false]);
  const [edit, setEdit] = _aS(false);
  const toggle = (i) => { if (navigator.vibrate) navigator.vibrate(8); setDays((d) => d.map((v, j) => (j === i ? !v : v))); };
  const count = days.filter(Boolean).length;
  return (
    <div className="anim-rise d5" style={{ marginTop: 18 }}>
      <div className="card" style={{ padding: '16px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div className="display" style={{ fontSize: 16, fontWeight: 700 }}>Training schedule</div>
          <button className="press sched-edit" onClick={() => setEdit((e) => !e)} aria-label="Edit schedule"
            style={{ color: edit ? 'var(--accent)' : 'var(--ink-3)' }}>
            <Icon name={edit ? 'check' : 'pencil'} size={17} stroke={edit ? 'var(--accent)' : 'var(--ink-3)'} sw={edit ? 2.4 : 1.9} />
          </button>
        </div>
        <div className="sched-row">
          {labels.map((l, i) => (
            <button key={i} className={`sched-pill ${days[i] ? 'on' : ''} ${i === todayIdx ? 'today' : ''}`} onClick={() => toggle(i)}>
              {l}
            </button>
          ))}
        </div>
        <p style={{ color: 'var(--ink-3)', fontSize: 11.5, marginTop: 13, textAlign: 'center', lineHeight: 1.4 }}>
          {edit ? 'Tap a day to add or remove it from your week. Coach replans around it.'
            : `${count} training days a week · tap a day or the pencil to change`}
        </p>
      </div>
      <style>{`
        .sched-edit{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;background:var(--surface-2);border:1px solid var(--line);}
        .sched-row{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;}
        .sched-pill{padding:13px 0;border-radius:13px;font-size:12.5px;font-weight:700;font-family:var(--font-body);
          background:var(--surface-2);border:1px solid var(--line);color:var(--ink-3);transition:background .18s,color .18s,box-shadow .18s,transform .1s;}
        .sched-pill.on{background:var(--accent);color:var(--on-accent);border-color:var(--accent);box-shadow:0 0 18px -5px color-mix(in oklab,var(--accent) 75%,transparent);}
        .sched-pill.today{outline:2px solid color-mix(in oklab,var(--aqua) 75%,transparent);outline-offset:2px;}
        .sched-pill:active{transform:scale(.92);}
      `}</style>
    </div>
  );
}
window.TrainingSchedule = TrainingSchedule;

function ScreenStyles() {
  return (
    <style>{`
      .coach-card{position:relative;overflow:hidden;border-radius:var(--radius);padding:20px;
        background:linear-gradient(165deg,var(--surface-solid),color-mix(in oklab,var(--bg-2) 80%,#000));
        border:1px solid var(--line-strong);box-shadow:var(--shadow-card);}
      .coach-glow{position:absolute;top:-50px;right:-50px;width:180px;height:180px;border-radius:50%;pointer-events:none;
        background:radial-gradient(circle,color-mix(in oklab,var(--volt) 26%,transparent),transparent 68%);}
      .coach-override{display:block;width:100%;text-align:center;margin-top:12px;color:var(--ink-3);font-size:13px;text-decoration:underline;text-underline-offset:3px;}
    `}</style>
  );
}
