// ══ ANDURA PULSE — primitive UI partajate ══════════════════════════════════
const { useState: _uS, useEffect: _uE, useRef: _uR } = React;

/* ── ICONS (line, currentColor, minimale) ──────────────────────────────── */
const ICON_PATHS = {
  flame: 'M12 2c1 3-1 4-1 6a3 3 0 0 0 6 0c0-1 0-2-1-3 2 1 4 4 4 8a8 8 0 1 1-16 0c0-3 2-6 5-7 0 2 1 3 2 3 0-2-2-3 0-7z',
  battery: 'M3 8h14v8H3zM17 11h2v2h-2z',
  spark: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z',
  clock: 'M12 7v5l3 2 M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
  layers: 'M12 3l9 5-9 5-9-5 9-5z M3 13l9 5 9-5',
  arrowRight: 'M5 12h14 M13 6l6 6-6 6',
  check: 'M5 12l5 5 9-11',
  chevronLeft: 'M15 5l-7 7 7 7',
  chevronRight: 'M9 5l7 7-7 7',
  plus: 'M12 5v14 M5 12h14',
  dumbbell: 'M6.5 8v8 M9.5 6.5v11 M14.5 6.5v11 M17.5 8v8 M9.5 12h5',
  trending: 'M3 17l6-6 4 4 8-8 M21 7v5h-5',
  trophy: 'M7 4h10v4a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M9 14h6l-1 4h-4z',
  bell: 'M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6 M10 21a2 2 0 0 0 4 0',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21c0-4 4-6 8-6s8 2 8 6',
  home: 'M4 11l8-7 8 7 M6 10v9h12v-9',
  chart: 'M5 21V9 M12 21V4 M19 21v-7',
  history: 'M3 12a9 9 0 1 0 3-6.7L3 8 M3 4v4h4 M12 8v4l3 2',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.5-2.3 1a7 7 0 0 0-1.7-1L14.5 2h-5l-.4 2.5a7 7 0 0 0-1.7 1l-2.3-1-2 3.5L3 11a7 7 0 0 0 0 2l-2 1.5 2 3.5 2.3-1a7 7 0 0 0 1.7 1L9.5 22h5l.4-2.5a7 7 0 0 0 1.7-1l2.3 1 2-3.5-2-1.5a7 7 0 0 0 .1-1z',
  pause: 'M8 5v14 M16 5v14',
  play: 'M7 5l12 7-12 7z',
  x: 'M6 6l12 12 M18 6L6 18',
  heart: 'M12 20s-7-4.5-9.5-9C1 8 2.5 4.5 6 4.5c2 0 3 1.2 4 2.5 1-1.3 2-2.5 4-2.5 3.5 0 5 3.5 3.5 6.5C19 15.5 12 20 12 20z',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M12 12h.01',
  scale: 'M12 3v3 M5 6h14l2 8a5 5 0 0 1-10 0 M5 6L3 14a5 5 0 0 0 10 0',
  flag: 'M5 21V4 M5 4h11l-2 4 2 4H5',
  zap: 'M13 2L4 14h7l-1 8 9-12h-7z',
  brain: 'M12 5a3 3 0 0 0-5 2 2.5 2.5 0 0 0-1 4.5 2.5 2.5 0 0 0 1.6 4 2.6 2.6 0 0 0 4.4-1V5z M12 5a3 3 0 0 1 5 2 2.5 2.5 0 0 1 1 4.5 2.5 2.5 0 0 1-1.6 4 2.6 2.6 0 0 1-4.4-1',
  pencil: 'M4 20h4L18.5 9.5l-4-4L4 16z M14 6l4 4',
  ruler: 'M4 14l10 10 10-10L14 4z M9 9l2 2 M12 6l2 2 M6 12l2 2',
  download: 'M12 3v12 M8 11l4 4 4-4 M5 20h14',
  upload: 'M12 21V9 M8 13l4-4 4 4 M5 4h14',
  help: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M9.6 9a2.5 2.5 0 0 1 4 1.8c0 1.7-2.4 2-2.4 3.2 M12 17h.01',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 11v5 M12 8h.01',
  shield: 'M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z M9 12l2 2 4-4',
  google: 'M20.6 12.2c0-.6-.05-1.2-.15-1.8H12v3.4h4.8a4.1 4.1 0 0 1-1.8 2.7v2.2h2.9a8.7 8.7 0 0 0 2.7-6.5z M12 21a8.5 8.5 0 0 0 5.9-2.2l-2.9-2.2a5.4 5.4 0 0 1-8-2.8H4v2.3A9 9 0 0 0 12 21z M6.5 12a5.4 5.4 0 0 1 0-3.4V6.3H4a9 9 0 0 0 0 7.7z M12 6.6a4.9 4.9 0 0 1 3.4 1.3l2.6-2.5A8.7 8.7 0 0 0 4 6.3l2.5 2.3A5.4 5.4 0 0 1 12 6.6z',
};
function Icon({ name, size = 22, fill = 'none', stroke = 'currentColor', sw = 1.9, style, className }) {
  const filled = fill !== 'none';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} className={className}
      stroke={filled ? 'none' : stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, ...style }} aria-hidden="true">
      <path d={ICON_PATHS[name] || ''} />
    </svg>
  );
}
window.Icon = Icon;

/* ── COUNT-UP ──────────────────────────────────────────────────────────── */
function useCountUp(target, opts = {}) {
  const { dur = 900, decimals = 0 } = opts;
  const [val, setVal] = _uS(target);
  const prev = _uR(0);
  _uE(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const motion = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--motion')) || 1;
    if (reduce || motion < 0.15) { setVal(target); prev.current = target; return; }
    const from = prev.current; const to = target;
    const start = performance.now(); let raf;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setVal(from + (to - from) * e);
      if (p < 1) raf = requestAnimationFrame(tick); else prev.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return decimals ? val.toFixed(decimals) : Math.round(val);
}
window.useCountUp = useCountUp;

/* leaf wrapper so count-up re-renders only the number, not the whole screen
   (otherwise the 60fps re-render storm keeps restarting entrance animations) */
function CountUp({ value, decimals = 0, format }) {
  const v = useCountUp(value, { decimals });
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return React.createElement(React.Fragment, null, format ? format(n) : v);
}
window.CountUp = CountUp;

/* ── RING (progress circular SVG) ──────────────────────────────────────── */
function Ring({ size = 132, stroke = 10, pct = 0, color = 'var(--accent)', track = 'var(--line)', children, glow = true, gradId }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * Math.min(1, Math.max(0, pct / 100));
  const useGrad = gradId === 'pulse';
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {useGrad && (
          <defs>
            <linearGradient id="ringPulse" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--volt)" /><stop offset="100%" stopColor="var(--aqua)" />
            </linearGradient>
          </defs>
        )}
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={useGrad ? 'url(#ringPulse)' : color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          style={{ transition: 'stroke-dasharray 1.1s cubic-bezier(.2,.8,.2,1)', filter: glow ? `drop-shadow(0 0 6px color-mix(in oklab, ${useGrad ? 'var(--aqua)' : color} 55%, transparent))` : 'none' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>{children}</div>
    </div>
  );
}
window.Ring = Ring;

/* ── READINESS ORB (ring + pulse halo viu) ─────────────────────────────── */
function ReadinessOrb({ score = 80, label = '', canPR = false }) {
  return (
    <div style={{ position: 'relative', display: 'grid', placeItems: 'center', width: 168, height: 168 }}>
      {/* hypnotic layers: breathing core + counter-rotating auras + halo pulses */}
      <span className="orb-core" />
      <span className="orb-aura" />
      <span className="orb-aura2" />
      <span className="orb-pulse" /><span className="orb-pulse p2" />
      <Ring size={150} stroke={11} pct={score} gradId="pulse">
        <div style={{ textAlign: 'center' }}>
          <div className="num" style={{ fontSize: 52, fontWeight: 700, lineHeight: 1 }}><CountUp value={score} /></div>
          <div className="label" style={{ marginTop: 4 }}>readiness</div>
        </div>
      </Ring>
      <style>{`
        .orb-pulse{position:absolute;width:150px;height:150px;border-radius:50%;
          border:1.5px solid color-mix(in oklab,var(--aqua) 50%,transparent);
          animation:pulseRing calc(2.8s / max(var(--motion),.3)) ease-out infinite;}
        .orb-pulse.p2{animation-delay:calc(1.4s / max(var(--motion),.3));border-color:color-mix(in oklab,var(--volt) 45%,transparent);}
      `}</style>
    </div>
  );
}
window.ReadinessOrb = ReadinessOrb;

/* ── SPARKLINE (greutate) ──────────────────────────────────────────────── */
function Sparkline({ data, color = 'var(--aqua)', w = 300, h = 90, fill = true }) {
  const vals = data.map((d) => d.kg);
  const min = Math.min(...vals), max = Math.max(...vals);
  const pad = 8;
  const span = max - min || 1;
  const pts = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = pad + (1 - (d.kg - min) / span) * (h - pad * 2);
    return [x, y];
  });
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)} ${h} L${pts[0][0].toFixed(1)} ${h} Z`;
  const last = pts[pts.length - 1];
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" /><stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill="url(#spark)" className="spark-area" />}
      <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        className="spark-line" style={{ filter: `drop-shadow(0 0 5px color-mix(in oklab, ${color} 55%, transparent))` }} />
      <circle cx={last[0]} cy={last[1]} r="4.5" fill={color} className="breathe" />
      <style>{`
        .spark-line{stroke-dasharray:600;stroke-dashoffset:600;animation:dash 1.4s cubic-bezier(.2,.8,.2,1) forwards;}
        .spark-area{opacity:0;animation:fadein 1s .5s forwards;}
        @keyframes dash{to{stroke-dashoffset:0;}}
        @keyframes fadein{to{opacity:1;}}
      `}</style>
    </svg>
  );
}
window.Sparkline = Sparkline;

/* ── CONFETTI BURST ────────────────────────────────────────────────────── */
function Confetti({ count = 40 }) {
  const colors = ['var(--volt)', 'var(--aqua)', 'var(--ember)', 'var(--violet)', '#fff'];
  const pieces = _uR(null);
  if (!pieces.current) {
    pieces.current = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: 50 + (Math.random() * 60 - 30),
      cx: (Math.random() * 60 - 30) + 'vw',
      cr: (Math.random() * 720 - 360) + 'deg',
      delay: Math.random() * 0.3,
      dur: 1.4 + Math.random() * 1.1,
      color: colors[i % colors.length],
      size: 6 + Math.random() * 7,
      round: Math.random() > 0.5,
    }));
  }
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 40 }} aria-hidden="true">
      {pieces.current.map((p) => (
        <span key={p.id} style={{
          position: 'absolute', top: '-6%', left: p.left + '%',
          width: p.size, height: p.round ? p.size : p.size * 0.5,
          background: p.color, borderRadius: p.round ? '50%' : 2,
          '--cx': p.cx, '--cr': p.cr,
          animation: `confettiFall ${p.dur}s cubic-bezier(.3,.1,.5,1) ${p.delay}s forwards`,
        }} />
      ))}
    </div>
  );
}
window.Confetti = Confetti;

/* ── BOTTOM SHEET ──────────────────────────────────────────────────────── */
function Sheet({ open, onClose, children, title }) {
  if (!open) return null;
  return (
    <div className="sheet-scrim" onClick={onClose}>
      <div className="sheet-panel card sheen" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="sheet-grip" />
        {title && <div className="display" style={{ fontSize: 19, fontWeight: 700, margin: '4px 0 14px' }}>{title}</div>}
        {children}
      </div>
      <style>{`
        .sheet-scrim{position:absolute;inset:0;z-index:60;display:flex;align-items:flex-end;
          background:rgba(4,5,10,.55);backdrop-filter:blur(3px);animation:fadein .2s ease both;}
        @keyframes fadein{from{opacity:0}to{opacity:1}}
        .sheet-panel{width:100%;border-radius:26px 26px 0 0;padding:14px 20px calc(20px + env(safe-area-inset-bottom));
          animation:sheetUp .34s cubic-bezier(.2,.9,.2,1) both;}
        @keyframes sheetUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        .sheet-grip{width:40px;height:4px;border-radius:99px;background:var(--line-strong);margin:0 auto 12px;}
      `}</style>
    </div>
  );
}
window.Sheet = Sheet;

/* ── BOTTOM NAV ────────────────────────────────────────────────────────── */
function BottomNav({ active, onChange }) {
  const tabs = [
    { id: 'antrenor', label: 'Coach', icon: 'home' },
    { id: 'progres', label: 'Progress', icon: 'chart' },
    { id: 'istoric', label: 'History', icon: 'history' },
    { id: 'cont', label: 'Account', icon: 'user' },
  ];
  const idx = tabs.findIndex((tb) => tb.id === active);
  return (
    <nav className="bnav">
      <span className="bnav-top" style={{ transform: `translateX(${idx * 100}%)` }}><i /></span>
      {tabs.map((tb) => {
        const on = active === tb.id;
        return (
          <button key={tb.id} className={`bnav-btn press ${on ? 'on' : ''}`} onClick={() => onChange(tb.id)} aria-label={tb.label} aria-current={on}>
            <span className="bnav-ico"><Icon name={tb.icon} size={22} sw={on ? 2.2 : 1.8} /></span>
            <span className="bnav-lbl">{tb.label}</span>
          </button>
        );
      })}
      <style>{`
        .bnav{position:absolute;left:0;right:0;bottom:0;z-index:30;display:grid;grid-template-columns:repeat(4,1fr);
          padding:10px 12px calc(12px + env(safe-area-inset-bottom));gap:4px;
          background:linear-gradient(180deg,transparent,var(--bg) 38%);}
        .bnav-btn{display:flex;flex-direction:column;align-items:center;gap:5px;padding:8px 0;border-radius:16px;color:var(--ink-3);position:relative;}
        .bnav-btn.on{color:var(--accent);}
        .bnav-ico{position:relative;display:grid;place-items:center;width:46px;height:30px;border-radius:14px;transition:background .25s;}
        .bnav-btn.on .bnav-ico{background:color-mix(in oklab,var(--accent) 16%,transparent);box-shadow:0 0 20px -4px color-mix(in oklab,var(--accent) 55%,transparent);}
        .bnav-lbl{font-family:var(--font-mono);font-size:9px;letter-spacing:.1em;text-transform:uppercase;}
      `}</style>
    </nav>
  );
}
window.BottomNav = BottomNav;

/* ── small helpers ─────────────────────────────────────────────────────── */
function Kicker({ children, color = 'var(--accent)' }) {
  return <div className="label" style={{ color, letterSpacing: '0.18em' }}>{children}</div>;
}
window.Kicker = Kicker;

function Pill({ children, color = 'var(--accent)', solid = false }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 11px', borderRadius: 999,
      fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.06em', textTransform: 'uppercase',
      background: solid ? color : `color-mix(in oklab, ${color} 16%, transparent)`,
      color: solid ? 'var(--on-accent)' : color,
      border: solid ? 'none' : `1px solid color-mix(in oklab, ${color} 40%, transparent)`,
    }}>{children}</span>
  );
}
window.Pill = Pill;
