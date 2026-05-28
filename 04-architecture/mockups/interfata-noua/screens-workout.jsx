// ══ ANDURA PULSE — WORKOUT FLOW ════════════════════════════════════════════
// energy → preview → live (set machine + rest + PR) → postrpe → summary
const { useState: _wS, useEffect: _wE, useRef: _wR } = React;

function WorkoutFlow({ onExit, onComplete }) {
  const [phase, setPhase] = _wS('energy');
  const [energy, setEnergy] = _wS('bine');
  const [result, setResult] = _wS(null);

  if (phase === 'energy') return <EnergyCheckScreen onBack={onExit} onPick={(lvl) => { setEnergy(lvl); setPhase('preview'); }} />;
  if (phase === 'preview') return <PreviewScreen energy={energy} onBack={() => setPhase('energy')} onStart={() => setPhase('live')} />;
  if (phase === 'live') return <LiveWorkout onExit={onExit} onFinish={(res) => { setResult(res); setPhase('postrpe'); }} />;
  if (phase === 'postrpe') return <PostRpeScreen onSubmit={() => setPhase('summary')} />;
  if (phase === 'summary') return <SummaryScreen result={result} onDone={onComplete} />;
  return null;
}
window.WorkoutFlow = WorkoutFlow;

/* ── sub-header ────────────────────────────────────────────────────────── */
function SubHeader({ title, onBack, right }) {
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 5, display: 'flex', alignItems: 'center', gap: 12, padding: '52px 18px 14px',
      background: 'linear-gradient(180deg, var(--bg) 60%, transparent)' }}>
      <button className="press" onClick={onBack} style={{ color: 'var(--ink-2)' }}><Icon name="chevronLeft" size={24} /></button>
      <div className="display" style={{ fontSize: 17, fontWeight: 600, flex: 1 }}>{title}</div>
      {right}
    </div>
  );
}

/* ── ENERGY CHECK ──────────────────────────────────────────────────────── */
function EnergyCheckScreen({ onBack, onPick }) {
  const D = window.AnduraData;
  return (
    <div className="anim-screen" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <SubHeader title="How do you feel?" onBack={onBack} />
      <div className="scroll" style={{ flex: 1, padding: '6px 24px 30px' }}>
        <h1 className="display" style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>How are you feeling today?</h1>
        <p style={{ color: 'var(--ink-2)', fontSize: 14, marginBottom: 24 }}>Coach tunes the intensity based on your energy.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {D.energy.map((o, i) => (
            <button key={o.level} className="energy-row press anim-rise" style={{ animationDelay: `${i * 0.05}s` }} onClick={() => onPick(o.level)}>
              <span className="energy-dot" style={{ background: o.color, boxShadow: `0 0 16px ${o.color}` }} />
              <span style={{ flex: 1, textAlign: 'left' }}>
                <span className="display" style={{ fontSize: 16.5, fontWeight: 600, display: 'block' }}>{o.label}</span>
                <span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>{o.hint}</span>
              </span>
              <Icon name="chevronRight" size={18} stroke="var(--ink-3)" />
            </button>
          ))}
        </div>
      </div>
      <style>{`
        .energy-row{display:flex;align-items:center;gap:16px;padding:16px 18px;border-radius:18px;
          background:var(--surface);border:1px solid var(--line);transition:border .2s,transform .12s;}
        .energy-row:hover{border-color:var(--line-strong);}
        .energy-dot{width:16px;height:16px;border-radius:50%;flex-shrink:0;}
      `}</style>
    </div>
  );
}

/* ── PREVIEW ───────────────────────────────────────────────────────────── */
function PreviewScreen({ energy, onBack, onStart }) {
  const D = window.AnduraData; const w = D.plannedWorkout;
  const intens = energy === 'excelent' || energy === 'bine' ? 'plus' : (energy === 'obosit' || energy === 'slabit' ? 'minus' : 'normal');
  const banner = {
    plus: { c: 'var(--volt)', t: 'Coach raises intensity +15%. Heavier by one plate, 1 extra rep.' },
    minus: { c: 'var(--ember)', t: 'Coach lowers intensity -20%. Lighter today, focus on form.' },
    normal: { c: 'var(--aqua)', t: 'Normal session — baseline. Coach adjusts mid-session if anything comes up.' },
  }[intens];
  return (
    <div className="anim-screen" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <SubHeader title="Your workout" onBack={onBack} />
      <div className="scroll" style={{ flex: 1, padding: '6px 18px 30px' }}>
        <Kicker color="var(--volt)">TODAY’S SESSION</Kicker>
        <h1 className="display" style={{ fontSize: 25, fontWeight: 700, margin: '6px 0 4px', lineHeight: 1.15 }}>{w.workoutTitle}</h1>
        <div style={{ display: 'flex', gap: 16, color: 'var(--ink-2)', fontSize: 13, marginBottom: 16 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="clock" size={15} /> ~{w.estimatedDuration} min</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="layers" size={15} /> {w.exerciseCount} exercitii</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="dumbbell" size={15} /> ~{w.volumeKg} kg</span>
        </div>
        <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start', padding: '14px 16px', borderRadius: 16, marginBottom: 18,
          background: `color-mix(in oklab, ${banner.c} 12%, var(--surface))`, border: `1px solid color-mix(in oklab, ${banner.c} 35%, transparent)` }}>
          <Icon name="zap" size={18} stroke={banner.c} fill={banner.c} style={{ marginTop: 1 }} />
          <p style={{ fontSize: 13, lineHeight: 1.45 }}>{banner.t}</p>
        </div>

        <Kicker>WARM-UP ~{w.warmupMin} MIN</Kicker>
        <div style={{ height: 10 }} />
        <Kicker>EXERCISES</Kicker>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 10 }}>
          {w.exercises.map((ex, i) => (
            <div key={ex.id} className="card card-tight anim-rise" style={{ padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 13, animationDelay: `${i * 0.05}s` }}>
              <span className="ex-num num">{i + 1}</span>
              <div style={{ flex: 1 }}>
                <div className="display" style={{ fontSize: 15, fontWeight: 600 }}>{ex.name}</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{ex.sets} sets · {ex.targetReps} reps · {ex.targetKg} kg</div>
              </div>
              <Pill color="var(--aqua)">{ex.muscle}</Pill>
            </div>
          ))}
        </div>
        <p style={{ color: 'var(--ink-3)', fontSize: 12, lineHeight: 1.5, marginTop: 16, textAlign: 'center' }}>
          Coach adjusts mid-session if anything comes up: pain, fatigue, a heavy set. You don’t have to know everything upfront.
        </p>
      </div>
      <div style={{ padding: '8px 18px calc(20px + env(safe-area-inset-bottom))', background: 'linear-gradient(0deg, var(--bg) 60%, transparent)' }}>
        <button className="btn btn-grad press" style={{ width: '100%' }} onClick={onStart}>Confirm, let’s go <Icon name="arrowRight" size={18} stroke="var(--on-accent)" /></button>
      </div>
      <style>{`.ex-num{width:30px;height:30px;border-radius:10px;display:grid;place-items:center;flex-shrink:0;font-size:14px;font-weight:700;
        background:color-mix(in oklab,var(--accent) 16%,transparent);color:var(--accent);}`}</style>
    </div>
  );
}

/* ── LIVE WORKOUT (set machine) ────────────────────────────────────────── */
function LiveWorkout({ onExit, onFinish }) {
  const D = window.AnduraData; const exs = D.plannedWorkout.exercises;
  const [exIdx, setExIdx] = _wS(0);
  const [setIdx, setSetIdx] = _wS(0);
  const [mode, setMode] = _wS('logging'); // logging | rest | transition
  const [exitOpen, setExitOpen] = _wS(false);
  const [whyOpen, setWhyOpen] = _wS(false);
  const [pr, setPr] = _wS(null);
  const [coachLine, setCoachLine] = _wS(null);
  const [volume, setVolume] = _wS(0);
  const [busyOpen, setBusyOpen] = _wS(false);
  const [painOpen, setPainOpen] = _wS(false);
  const [cueOpen, setCueOpen] = _wS(false);
  const [swapName, setSwapName] = _wS(null);
  const hardRef = _wR(0); const easyRef = _wR(0);
  const ex = exs[exIdx];
  const exName = swapName || ex.name;
  const [kg, setKg] = _wS(ex.targetKg);
  const [reps, setReps] = _wS(ex.targetReps);

  const totalSets = exs.reduce((s, e) => s + e.sets, 0);
  const doneSets = exs.slice(0, exIdx).reduce((s, e) => s + e.sets, 0) + setIdx;

  _wE(() => {
    setKg(ex.targetKg); setReps(ex.targetReps);
    setSwapName(null); setCoachLine(null); setCueOpen(false);
    hardRef.current = 0; easyRef.current = 0;
  }, [exIdx]);

  function confirmSet() {
    if (navigator.vibrate) navigator.vibrate(14);
    setVolume((v) => v + kg * reps);
    setMode('feel');
  }

  function handleFeel(rating) {
    if (navigator.vibrate) navigator.vibrate(8);
    let line = null;
    if (rating === 'hard') {
      hardRef.current++; easyRef.current = 0;
      if (hardRef.current >= 2) { const nk = Math.max(0, Math.round(kg * 0.95 * 2) / 2); line = `Two heavy sets in a row — easing the next one to ${nk} kg.`; setKg(nk); hardRef.current = 0; }
    } else if (rating === 'easy') {
      easyRef.current++; hardRef.current = 0;
      if (easyRef.current >= 2) { const nk = +(kg + 2.5).toFixed(1); line = `Two easy sets — nudging the next one up to ${nk} kg.`; setKg(nk); easyRef.current = 0; }
    } else { hardRef.current = 0; easyRef.current = 0; }
    // Overperformance reward — coach NOTICES you beat the plan (positive,
    // logged after the lift, never a pre-lift warning). Message takes priority.
    const beat = +(kg - ex.targetKg).toFixed(1);
    if (beat >= 5) line = `${kg} kg — that's +${beat} over plan. Banked. Coach starts you heavier next time. 💪`;
    setCoachLine(line);
    proceedAfterSet();
  }

  function proceedAfterSet() {
    const isPr = ex.id === 'bench' && setIdx === ex.sets - 1 && kg >= ex.targetKg;
    const lastSetOfEx = setIdx >= ex.sets - 1;
    const lastEx = exIdx >= exs.length - 1;
    if (isPr) setPr({ exercise: exName, kg, reps });
    if (lastSetOfEx && lastEx) {
      setMode('logging');
      setTimeout(() => onFinish({ volumeKg: D.plannedWorkout.volumeKg, sets: totalSets, durationMin: 51, prHit: true }), isPr ? 1700 : 250);
      return;
    }
    if (lastSetOfEx) {
      setMode('transition');
      setTimeout(() => { setExIdx((i) => i + 1); setSetIdx(0); setMode('logging'); }, 1600);
    } else {
      setMode('rest');
    }
  }
  function afterRest() { setSetIdx((i) => i + 1); setMode('logging'); }

  function skipExercise() {
    const lastEx = exIdx >= exs.length - 1;
    if (lastEx) { onFinish({ volumeKg: D.plannedWorkout.volumeKg, sets: totalSets, durationMin: 51, prHit: true }); return; }
    setMode('transition');
    setTimeout(() => { setExIdx((i) => i + 1); setSetIdx(0); setMode('logging'); }, 1600);
  }
  function doBusySwap() { setSwapName(ex.alt); setBusyOpen(false); setCoachLine(`Swapped to ${ex.alt} — same muscle, no progress lost.`); }
  function doPain(area) { setPainOpen(false); const nk = Math.max(0, Math.round(kg * 0.85 * 2) / 2); setKg(nk); setCoachLine(`Easing the load to ${nk} kg and watching your ${area}. Stop if it sharpens.`); }

  if (mode === 'transition') {
    const nx = exs[exIdx + 1];
    return (
      <div className="anim-screen" style={{ height: '100%', display: 'grid', placeItems: 'center', padding: 30, textAlign: 'center' }}>
        <div className="floaty">
          <Kicker color="var(--aqua)">NEXT EXERCISE</Kicker>
          <div className="display" style={{ fontSize: 28, fontWeight: 700, margin: '12px 0 8px', lineHeight: 1.15 }}>{nx.name}</div>
          <Pill color="var(--aqua)">{nx.muscle}</Pill>
          <div style={{ marginTop: 26 }}><span className="dot-load"><i /><i /><i /></span></div>
        </div>
        <style>{`.dot-load{display:inline-flex;gap:8px}.dot-load i{width:9px;height:9px;border-radius:50%;background:var(--accent);animation:floaty .8s infinite}.dot-load i:nth-child(2){animation-delay:.15s}.dot-load i:nth-child(3){animation-delay:.3s}`}</style>
      </div>
    );
  }

  return (
    <div className="anim-screen" style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* header progress */}
      <div style={{ padding: '50px 18px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="press" onClick={() => setExitOpen(true)} style={{ color: 'var(--ink-2)' }}><Icon name="x" size={22} /></button>
          <div style={{ flex: 1 }}>
            <div className="prog-track"><span style={{ width: `${(doneSets / totalSets) * 100}%` }} /></div>
          </div>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', textAlign: 'right', minWidth: 78 }}>
            {doneSets}/{totalSets} sets<br />
            <span className="num" style={{ color: 'var(--aqua)', fontSize: 11.5 }}><CountUp value={Math.round(volume)} format={(x) => x.toLocaleString('en-US')} /> kg</span>
          </span>
        </div>
      </div>

      <div className="scroll" style={{ flex: 1, padding: '6px 18px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Kicker color="var(--aqua)">EXERCISE {exIdx + 1} OF {exs.length}</Kicker>
          <button className="why-btn" onClick={() => setWhyOpen(true)}>Why? 💡</button>
        </div>
        <h1 className="display" style={{ fontSize: 25, fontWeight: 700, margin: '7px 0 3px', lineHeight: 1.12 }}>{exName}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Pill color="var(--aqua)">{ex.muscle}</Pill>
          {swapName && <Pill color="var(--ember)">swapped</Pill>}
        </div>

        {/* exercise media placeholder + form cue */}
        <div className="ex-media" style={{ marginTop: 14 }}>
          <Icon name="play" size={24} stroke="var(--ink-3)" fill="var(--ink-3)" />
          <span className="mono">exercise demo</span>
          <span className="ex-soon">Coming soon</span>
        </div>
        <button className="cue-line press" onClick={() => setCueOpen((o) => !o)}>
          <span>💡 Form cue</span>
          <Icon name={cueOpen ? 'chevronLeft' : 'chevronRight'} size={15} stroke="var(--ink-3)" style={{ transform: cueOpen ? 'rotate(90deg)' : 'rotate(90deg)' }} />
        </button>
        {cueOpen && <p className="cue-text anim-rise">{ex.cue}</p>}

        {/* set chips */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          {Array.from({ length: ex.sets }, (_, i) => (
            <div key={i} className={`set-chip ${i < setIdx ? 'done' : i === setIdx ? 'active' : ''}`}>
              {i < setIdx ? <Icon name="check" size={14} stroke="var(--on-accent)" sw={2.6} /> : <span className="num">{i + 1}</span>}
            </div>
          ))}
        </div>

        {/* live coach adjustment line */}
        {coachLine && (
          <div className="coach-line anim-rise" key={coachLine}>
            <Icon name="brain" size={16} stroke="var(--volt)" />
            <span>{coachLine}</span>
          </div>
        )}

        {/* logger OR per-set feel */}
        {mode === 'feel' ? (
          <div className="card sheen anim-rise" style={{ marginTop: 16, padding: '18px' }}>
            <div style={{ textAlign: 'center' }}><span className="label">HOW DID SET {setIdx + 1} FEEL?</span></div>
            {kg > ex.targetKg && (
              <div className="beat-pill anim-pop"><Icon name="zap" size={13} fill="var(--volt)" stroke="none" /> {kg} kg · +{+(kg - ex.targetKg).toFixed(1)} over plan</div>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              {[['easy', 'Easy', 'var(--volt)'], ['right', 'Right', 'var(--aqua)'], ['hard', 'Hard', 'var(--ember)']].map(([id, lbl, c]) => (
                <button key={id} className="feel-b press" style={{ '--fc': c }} onClick={() => handleFeel(id)}>
                  <span className="display" style={{ fontSize: 16, fontWeight: 700, color: c }}>{lbl}</span>
                </button>
              ))}
            </div>
            <p style={{ color: 'var(--ink-3)', fontSize: 11.5, marginTop: 12, textAlign: 'center', lineHeight: 1.4 }}>One tap — the coach calibrates your next set.</p>
          </div>
        ) : (
          <div className="card sheen" style={{ marginTop: 16, padding: '18px 18px 20px' }}>
            <div style={{ textAlign: 'center', marginBottom: 4 }}>
              <span className="label">SET {setIdx + 1} / {ex.sets} · TARGET {ex.targetKg} KG × {ex.targetReps}</span>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
              <NumDial label="Weight" unit="kg" val={kg} step={2.5} onChange={setKg} />
              <NumDial label="Reps" unit="reps" val={reps} step={1} onChange={setReps} />
            </div>
            <button className="btn btn-primary press confirm-btn" style={{ width: '100%', marginTop: 16 }} onClick={confirmSet}>
              <Icon name="check" size={19} stroke="var(--on-accent)" sw={2.4} /> Confirm set
            </button>
          </div>
        )}

        {/* in-session actions */}
        <div style={{ display: 'flex', gap: 9, marginTop: 14 }}>
          <button className="act-chip press" onClick={() => setPainOpen(true)}><Icon name="heart" size={16} stroke="var(--ink-2)" /> Pain</button>
          <button className="act-chip press" onClick={() => setBusyOpen(true)}><Icon name="dumbbell" size={16} stroke="var(--ink-2)" /> Busy</button>
          <button className="act-chip press" onClick={skipExercise}><Icon name="arrowRight" size={16} stroke="var(--ink-2)" /> Skip</button>
        </div>
      </div>

      {/* REST overlay */}
      {mode === 'rest' && <RestOverlay seconds={ex.restSec} nextSet={setIdx + 2} exName={exName} onDone={afterRest} onSkip={afterRest} />}

      {/* PR celebration */}
      {pr && <PrFlash pr={pr} onClose={() => setPr(null)} />}

      {/* exit sheet */}
      <Sheet open={exitOpen} onClose={() => setExitOpen(false)} title="Leave session?">
        <p style={{ color: 'var(--ink-2)', fontSize: 13.5, marginBottom: 16 }}>Choose how you want to handle your progress so far.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button className="btn btn-ghost" onClick={() => setExitOpen(false)}>Continue</button>
          <button className="btn btn-ghost" onClick={onExit}>Pause (resume later)</button>
          <button className="exit-danger" onClick={onExit}>Discard progress</button>
        </div>
      </Sheet>

      {/* why sheet */}
      <Sheet open={whyOpen} onClose={() => setWhyOpen(false)} title={`Why ${exName}?`}>
        <p style={{ color: 'var(--ink-2)', fontSize: 14, lineHeight: 1.55, marginBottom: 16 }}>{ex.why}</p>
        <button className="btn btn-ghost" style={{ width: '100%' }} onClick={() => setWhyOpen(false)}>Got it</button>
      </Sheet>

      {/* busy swap sheet */}
      <Sheet open={busyOpen} onClose={() => setBusyOpen(false)} title="Machine taken?">
        <p style={{ color: 'var(--ink-2)', fontSize: 13.5, marginBottom: 16, lineHeight: 1.5 }}>No problem. Here is a swap that hits the same muscle — your numbers carry over.</p>
        <div className="card card-tight" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div className="pr-ico" style={{ background: 'color-mix(in oklab,var(--aqua) 14%,transparent)', borderColor: 'color-mix(in oklab,var(--aqua) 30%,transparent)' }}><Icon name="dumbbell" size={18} stroke="var(--aqua)" /></div>
          <div style={{ flex: 1 }}>
            <div className="display" style={{ fontSize: 15, fontWeight: 600 }}>{ex.alt}</div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>same muscle · {ex.muscle}</div>
          </div>
        </div>
        <button className="btn btn-grad press" style={{ width: '100%' }} onClick={doBusySwap}>Switch to {ex.alt}</button>
        <button className="btn btn-ghost press" style={{ width: '100%', marginTop: 10 }} onClick={() => setBusyOpen(false)}>I'll wait for it</button>
      </Sheet>

      {/* pain sheet */}
      <Sheet open={painOpen} onClose={() => setPainOpen(false)} title="Where does it hurt?">
        <p style={{ color: 'var(--ink-2)', fontSize: 13.5, marginBottom: 16, lineHeight: 1.5 }}>The coach lightens the load and keeps an eye on it. Stop entirely if the pain is sharp.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {['Shoulder', 'Lower back', 'Knee', 'Elbow', 'Wrist', 'Other'].map((a) => (
            <button key={a} className="pain-chip press" onClick={() => doPain(a.toLowerCase())}>{a}</button>
          ))}
        </div>
      </Sheet>

      <style>{`
        .prog-track{height:6px;border-radius:99px;background:var(--surface-2);overflow:hidden;}
        .prog-track span{display:block;height:100%;border-radius:99px;background:var(--grad-pulse);transition:width .5s cubic-bezier(.2,.8,.2,1);box-shadow:0 0 12px var(--aqua);}
        .why-btn{font-size:12px;color:var(--aqua);font-weight:600;}
        .set-chip{width:36px;height:36px;border-radius:11px;display:grid;place-items:center;font-size:14px;font-weight:700;
          background:var(--surface-2);border:1px solid var(--line);color:var(--ink-3);transition:.25s;}
        .set-chip.active{border-color:var(--accent);color:var(--accent);box-shadow:0 0 16px -4px color-mix(in oklab,var(--accent) 60%,transparent);}
        .set-chip.done{background:var(--accent);border-color:var(--accent);color:var(--on-accent);}
        .confirm-btn{font-size:16px;}
        .act-chip{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:11px 4px;border-radius:14px;
          font-size:12.5px;color:var(--ink-2);background:var(--surface);border:1px solid var(--line);}
        .exit-danger{padding:14px;border-radius:999px;color:#ff5d6c;font-weight:700;background:color-mix(in oklab,#ff5d6c 10%,transparent);}
        .ex-media{height:104px;border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;
          border:1px solid var(--line);background:
            repeating-linear-gradient(135deg,var(--surface) 0 11px,var(--surface-2) 11px 22px);}
        .ex-media .mono{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3);}
        .ex-soon{font-family:var(--font-mono);font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--accent);margin-top:2px;padding:3px 10px;border-radius:99px;background:color-mix(in oklab,var(--accent) 12%,transparent);border:1px solid color-mix(in oklab,var(--accent) 32%,transparent);}
        .cue-line{display:flex;align-items:center;justify-content:space-between;width:100%;margin-top:10px;padding:11px 14px;border-radius:13px;
          background:var(--surface);border:1px solid var(--line);font-size:13px;font-weight:600;color:var(--ink);}
        .cue-text{color:var(--ink-2);font-size:13px;line-height:1.5;margin-top:8px;padding:0 4px;}
        .coach-line{display:flex;align-items:flex-start;gap:9px;margin-top:14px;padding:12px 14px;border-radius:14px;
          background:color-mix(in oklab,var(--volt) 11%,var(--surface));border:1px solid color-mix(in oklab,var(--volt) 32%,transparent);
          font-family:var(--font-display);font-style:italic;font-size:13px;line-height:1.45;color:var(--ink);}
        .feel-b{flex:1;padding:18px 4px;border-radius:16px;background:var(--surface-2);border:1.5px solid var(--line);transition:.15s;}
        .beat-pill{display:flex;align-items:center;justify-content:center;gap:6px;margin:10px auto 0;width:fit-content;padding:6px 12px;border-radius:999px;
          font-family:var(--font-mono);font-size:10.5px;letter-spacing:.04em;text-transform:uppercase;color:var(--volt);
          background:color-mix(in oklab,var(--volt) 14%,transparent);border:1px solid color-mix(in oklab,var(--volt) 38%,transparent);}
        .feel-b:active{transform:scale(.94);border-color:var(--fc);box-shadow:0 0 22px -6px var(--fc);}
        .pain-chip{padding:15px;border-radius:14px;background:var(--surface-2);border:1px solid var(--line);font-size:14px;font-weight:600;color:var(--ink);}
        .pain-chip:active{transform:scale(.96);}
      `}</style>
    </div>
  );
}

function NumDial({ label, unit, val, step, onChange }) {
  return (
    <div style={{ flex: 1, textAlign: 'center', background: 'var(--surface-2)', borderRadius: 16, padding: '12px 8px', border: '1px solid var(--line)' }}>
      <div className="label">{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
        <button className="dial-b press" onClick={() => onChange(Math.max(0, +(val - step).toFixed(1)))}>−</button>
        <div><span className="num" style={{ fontSize: 28, fontWeight: 700 }}>{val}</span></div>
        <button className="dial-b press" onClick={() => onChange(+(val + step).toFixed(1))}>+</button>
      </div>
      <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2 }}>{unit}</div>
      <style>{`.dial-b{width:34px;height:34px;border-radius:10px;font-size:20px;font-weight:700;color:var(--ink);background:var(--surface);border:1px solid var(--line);}`}</style>
    </div>
  );
}

/* ── REST OVERLAY (countdown ring) ─────────────────────────────────────── */
function RestOverlay({ seconds, nextSet, exName, onDone, onSkip }) {
  const [left, setLeft] = _wS(seconds);
  _wE(() => {
    if (left <= 0) { onDone(); return; }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  const pct = (left / seconds) * 100;
  const mm = Math.floor(left / 60), ss = String(left % 60).padStart(2, '0');
  return (
    <div className="rest-ov">
      <Kicker color="var(--aqua)">REST · {exName} RECOVERING</Kicker>
      <div className="breathe" style={{ marginTop: 22 }}>
        <Ring size={210} stroke={12} pct={pct} gradId="pulse" glow>
          <div style={{ textAlign: 'center' }}>
            <div className="num" style={{ fontSize: 52, fontWeight: 700 }}>{mm}:{ss}</div>
            <div className="label" style={{ marginTop: 4 }}>until set {nextSet}</div>
          </div>
        </Ring>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 30 }}>
        <button className="btn btn-ghost press" onClick={() => setLeft((l) => l + 20)}>+20 sec</button>
        <button className="btn btn-grad press" onClick={onSkip}>Skip rest <Icon name="arrowRight" size={17} stroke="var(--on-accent)" /></button>
      </div>
      <style>{`.rest-ov{position:absolute;inset:0;z-index:45;display:flex;flex-direction:column;align-items:center;justify-content:center;
        padding:30px;background:radial-gradient(120% 90% at 50% 30%, color-mix(in oklab,var(--aqua) 10%,var(--bg)) 0%, var(--bg) 70%);
        animation:fadein .3s ease both;}@keyframes fadein{from{opacity:0}to{opacity:1}}`}</style>
    </div>
  );
}

/* ── PR FLASH ──────────────────────────────────────────────────────────── */
function PrFlash({ pr, onClose }) {
  _wE(() => { if (navigator.vibrate) navigator.vibrate([20, 40, 30]); const t = setTimeout(onClose, 2600); return () => clearTimeout(t); }, []);
  return (
    <div className="pr-flash" onClick={onClose}>
      <Confetti count={56} />
      <div className="anim-pop" style={{ textAlign: 'center', zIndex: 50 }}>
        <div className="pr-badge floaty"><Icon name="trophy" size={48} stroke="var(--ember)" /></div>
        <div className="display" style={{ fontSize: 32, fontWeight: 700, marginTop: 16, color: 'var(--ember)' }}>NEW RECORD!</div>
        <p style={{ color: 'var(--ink)', fontSize: 16, marginTop: 6 }}>{pr.exercise}</p>
        <div className="num" style={{ fontSize: 40, fontWeight: 700, marginTop: 8 }}>{pr.kg} kg × {pr.reps}</div>
      </div>
      <style>{`.pr-flash{position:absolute;inset:0;z-index:48;display:grid;place-items:center;padding:30px;
        background:radial-gradient(120% 90% at 50% 40%, color-mix(in oklab,var(--ember) 18%,var(--bg)) 0%, rgba(5,6,10,.92) 75%);animation:fadein .25s both;}
        @keyframes fadein{from{opacity:0}to{opacity:1}}
        .pr-badge{width:96px;height:96px;border-radius:50%;display:grid;place-items:center;margin:0 auto;
          background:color-mix(in oklab,var(--ember) 16%,transparent);border:2px solid color-mix(in oklab,var(--ember) 45%,transparent);
          box-shadow:0 0 50px -6px var(--ember);}`}</style>
    </div>
  );
}

/* ── POST RPE ──────────────────────────────────────────────────────────── */
function PostRpeScreen({ onSubmit }) {
  const [pick, setPick] = _wS(null);
  const opts = [
    { id: 'easy', label: 'Easy', sub: 'Had more in the tank', c: 'var(--volt)' },
    { id: 'right', label: 'Right', sub: 'Solid, balanced', c: 'var(--aqua)' },
    { id: 'hard', label: 'Hard', sub: 'Went to the limit', c: 'var(--ember)' },
  ];
  return (
    <div className="anim-screen" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '70px 24px 30px' }}>
      <Kicker color="var(--aqua)">ONE QUESTION</Kicker>
      <h1 className="display" style={{ fontSize: 28, fontWeight: 700, margin: '8px 0 6px', lineHeight: 1.15 }}>How was the session?</h1>
      <p style={{ color: 'var(--ink-2)', fontSize: 14, marginBottom: 28 }}>Your answer calibrates tomorrow’s session.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        {opts.map((o) => (
          <button key={o.id} className={`rpe-row press ${pick === o.id ? 'on' : ''}`} style={{ '--rc': o.c }} onClick={() => setPick(o.id)}>
            <span style={{ flex: 1, textAlign: 'left' }}>
              <span className="display" style={{ fontSize: 18, fontWeight: 700, display: 'block', color: pick === o.id ? o.c : 'var(--ink)' }}>{o.label}</span>
              <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{o.sub}</span>
            </span>
            <span className={`rpe-check ${pick === o.id ? 'on' : ''}`} style={{ '--rc': o.c }}>{pick === o.id && <Icon name="check" size={16} stroke="var(--on-accent)" sw={2.6} />}</span>
          </button>
        ))}
      </div>
      <button className="btn btn-grad press" style={{ width: '100%', opacity: pick ? 1 : 0.45, pointerEvents: pick ? 'auto' : 'none' }} onClick={onSubmit}>Save</button>
      <style>{`
        .rpe-row{display:flex;align-items:center;gap:14px;padding:20px;border-radius:20px;background:var(--surface);border:1.5px solid var(--line);transition:.2s;}
        .rpe-row.on{border-color:var(--rc);background:color-mix(in oklab,var(--rc) 9%,var(--surface));box-shadow:0 0 28px -8px color-mix(in oklab,var(--rc) 60%,transparent);}
        .rpe-check{width:28px;height:28px;border-radius:50%;border:1.5px solid var(--line-strong);display:grid;place-items:center;flex-shrink:0;transition:.2s;}
        .rpe-check.on{background:var(--rc);border-color:var(--rc);}
      `}</style>
    </div>
  );
}

/* ── SUMMARY ───────────────────────────────────────────────────────────── */
function SummaryScreen({ result, onDone }) {
  const D = window.AnduraData;
  const res = result || { volumeKg: 4820, sets: 16, durationMin: 51, prHit: true };
  return (
    <div className="scroll anim-screen" style={{ height: '100%', padding: '64px 22px 36px', position: 'relative' }}>
      {res.prHit && <Confetti count={44} />}
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <div className="floaty" style={{ display: 'grid', placeItems: 'center', marginBottom: 8 }}><Icon name="check" size={0} /><div className="sum-badge"><Icon name="check" size={34} stroke="var(--on-accent)" sw={2.6} /></div></div>
        <Kicker color="var(--volt)">SESSION COMPLETE</Kicker>
        <h1 className="display" style={{ fontSize: 30, fontWeight: 700, margin: '6px 0 4px' }}>Good session.</h1>
        <p style={{ color: 'var(--ink-2)', fontSize: 14 }}>Here is the recap.</p>
      </div>

      {res.prHit && (
        <div className="pr-banner anim-pop" style={{ marginTop: 20 }}>
          <Icon name="trophy" size={22} stroke="var(--ember)" />
          <span style={{ fontWeight: 700 }}>+5 kg on Bench Press — new record!</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 18 }}>
        <SumStat label="Duration" value={<CountUp value={res.durationMin} />} unit="min" />
        <SumStat label="Sets" value={<CountUp value={res.sets} />} unit="logged" />
        <SumStat label="Volume" value={<CountUp value={res.volumeKg} format={(x) => Math.round(x).toLocaleString('en-US')} />} unit="kg" />
      </div>

      <div style={{ marginTop: 20 }}>
        <Kicker>MUSCLE GROUPS</Kicker>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
          {D.sessionMuscles.map((m, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 70, fontSize: 13, color: 'var(--ink-2)' }}>{m.label}</span>
              <div className="mg-track"><span style={{ width: `${Math.min(100, m.sets * 14)}%`, animationDelay: `${i * 0.1}s` }} /></div>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', width: 44, textAlign: 'right' }}>{m.sets} sets</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card sheen" style={{ marginTop: 20, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Icon name="flame" size={24} stroke="var(--volt)" className="flame" />
        <div>
          <div className="display" style={{ fontSize: 16, fontWeight: 700 }}>13-day streak</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>Keep the rhythm — you are on a roll.</div>
        </div>
      </div>

      <button className="btn btn-grad press" style={{ width: '100%', marginTop: 24 }} onClick={onDone}>Done</button>
      <style>{`
        .sum-badge{width:72px;height:72px;border-radius:50%;display:grid;place-items:center;background:var(--volt);box-shadow:0 0 44px -6px var(--volt);}
        .pr-banner{display:flex;align-items:center;gap:10px;justify-content:center;padding:14px;border-radius:16px;
          background:color-mix(in oklab,var(--ember) 13%,var(--surface));border:1px solid color-mix(in oklab,var(--ember) 38%,transparent);color:var(--ember);font-size:14px;}
        .mg-track{flex:1;height:9px;border-radius:99px;background:var(--surface-2);overflow:hidden;}
        .mg-track span{display:block;height:100%;border-radius:99px;background:var(--grad-pulse);transform-origin:left;animation:barGrow .9s cubic-bezier(.2,.8,.2,1) both;}
      `}</style>
    </div>
  );
}
function SumStat({ label, value, unit }) {
  return (
    <div className="card card-tight anim-rise" style={{ padding: '14px 8px', textAlign: 'center' }}>
      <div className="num" style={{ fontSize: 26, fontWeight: 700 }}>{value}</div>
      <div className="label" style={{ marginTop: 3 }}>{label}</div>
      <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{unit}</div>
    </div>
  );
}
