// ══ ANDURA PULSE — fundal viu: aurora mesh + grain fin + vignette ══════════
const { useEffect: _bgUseEffect } = React;

function AuroraBackground() {
  return (
    <div className="aurora-wrap" aria-hidden="true">
      <div className="aurora-blob b1" />
      <div className="aurora-blob b2" />
      <div className="aurora-blob b3" />
      <div className="depth" />
      <div className="grain" />
      <div className="vignette" />
      <style>{`
        .aurora-wrap{position:absolute;inset:0;overflow:hidden;pointer-events:none;background:var(--bg-grad);z-index:0;}
        .aurora-blob{position:absolute;border-radius:50%;filter:blur(64px);will-change:transform;mix-blend-mode:screen;}
        [data-theme="light"] .aurora-blob{mix-blend-mode:multiply;filter:blur(80px);}
        .aurora-blob.b1{top:-14%;left:-16%;width:75%;height:55%;
          background:radial-gradient(circle,color-mix(in oklab,var(--volt) 60%,transparent),transparent 68%);
          opacity:.30;animation:aurora1 calc(34s / max(var(--motion),.25)) ease-in-out infinite;}
        .aurora-blob.b2{bottom:-18%;right:-18%;width:80%;height:60%;
          background:radial-gradient(circle,color-mix(in oklab,var(--aqua) 60%,transparent),transparent 68%);
          opacity:.28;animation:aurora2 calc(42s / max(var(--motion),.25)) ease-in-out infinite;}
        .aurora-blob.b3{top:28%;left:30%;width:55%;height:50%;
          background:radial-gradient(circle,color-mix(in oklab,var(--ember) 55%,transparent),transparent 70%);
          opacity:.18;animation:aurora3 calc(38s / max(var(--motion),.25)) ease-in-out infinite;}
        [data-theme="light"] .aurora-blob.b1{opacity:.22;}
        [data-theme="light"] .aurora-blob.b2{opacity:.20;}
        [data-theme="light"] .aurora-blob.b3{opacity:.14;}
        .grain{position:absolute;inset:0;opacity:var(--grain-opacity);pointer-events:none;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");}
        .depth{position:absolute;top:50%;left:50%;width:170%;height:170%;transform:translate(-50%,-50%);pointer-events:none;mix-blend-mode:screen;
          background:conic-gradient(from 0deg,transparent,color-mix(in oklab,var(--aqua) 9%,transparent),transparent 38%,color-mix(in oklab,var(--volt) 8%,transparent),transparent 72%);
          animation:bgConic calc(64s / max(var(--motion),.3)) linear infinite;opacity:.6;}
        [data-theme="light"] .depth{mix-blend-mode:normal;opacity:.4;}
        [data-calm="1"] .depth{animation:none;}
        .vignette{position:absolute;inset:0;pointer-events:none;
          background:radial-gradient(120% 90% at 50% 35%,transparent 55%,rgba(0,0,0,.45) 100%);}
        [data-theme="light"] .vignette{background:radial-gradient(120% 90% at 50% 35%,transparent 60%,rgba(40,50,90,.10) 100%);}
      `}</style>
    </div>
  );
}
window.AuroraBackground = AuroraBackground;
