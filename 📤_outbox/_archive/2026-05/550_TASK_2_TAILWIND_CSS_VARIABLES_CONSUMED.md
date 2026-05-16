---
title: TASK_2_TAILWIND_CSS_VARIABLES.md
type: cc-autonomous-task
model: Opus EXCLUSIVELY
phase: Phase 1 Foundation
task: 2 of 4
depends-on: TASK_1 complete (deps installed, .tsx migration done, typecheck clean)
---

# TASK 2 — Tailwind PostCSS + CSS Variables Verbatim Parity Mockup

## Goal
Configure Tailwind PostCSS build (NU CDN), extract CSS variables din mockup `04-architecture/mockups/andura-clasic.html` verbatim în `src/styles/global.css`, map color tokens identical în `tailwind.config.js` cu theme extension, update `src/App.tsx` smoke test Tailwind classes funcționează end-to-end.

## Steps

### 2.1 — Read mockup full `<style>` block

```bash
# Read mockup style block (typically lines ~50-2000 din mockup 4437 LOC)
head -2000 04-architecture/mockups/andura-clasic.html | grep -n "</style>\|<style>" | head -10
```

Identify start + end style block lines. Read full block content via `filesystem:read_text_file` cu view_range sau cat + sed.

### 2.2 — Extract `:root` CSS variables verbatim

În mockup există minimum:
- `:root` cream warm light theme (paper, paper-2, ink, ink-2, ink-3, line, line-strong, brick)
- Potentially additional theme variants în `.persona-maria`, `.persona-gigica`, `.persona-marius` (text scaling)
- Color tokens hardcoded în inline Tailwind config script (paper, paper2, ink, ink2, line, brick, brickdark, olive, deep, succ, warn, danger)

**Approach:** Copy ALL CSS variables `--*: value;` din `:root` și sub-selectors persona variants în `src/styles/global.css` verbatim. PRESERVE comentariile WCAG (audit context valuable Bugatti documentation).

### 2.3 — Create `src/styles/global.css`

NU overwrite existing `src/styles/main.css` (vanilla legacy preserved). Create NEW file `src/styles/global.css` exclusiv pentru React Andura Clasic:

```css
/* ══ ANDURA CLASIC GLOBAL STYLES — React Build Phase 1 Foundation ═════════
   CSS variables verbatim parity mockup 04-architecture/mockups/andura-clasic.html
   Per DECISIONS.md §D015 + §D016 + LOCKED V1 mockup as DESIGN MASTER.
   Vanilla src/styles/main.css preserved (vanilla legacy live andura.app).
   ══════════════════════════════════════════════════════════════════════════ */

@tailwind base;
@tailwind components;
@tailwind utilities;

/* CSS variables :root cream warm light theme (verbatim mockup) */
:root {
  /* PASTE VERBATIM din mockup andura-clasic.html :root block including WCAG comments */
  /* --paper: #faf7f1; */
  /* --paper-2: #f3ede1; */
  /* --ink: #1a1815; */
  /* --ink-2: #3a342d; */
  /* --ink-3: #6e6862; */
  /* --line: #e7e0d0; */
  /* --line-strong: #9a8770; */
  /* --brick: #c8412e; */
  /* etc. — EXTRACT ALL --* tokens din mockup :root */
}

/* Persona text scaling (verbatim mockup) */
/* .persona-maria, .persona-gigica, .persona-marius blocks */

/* Base resets parity mockup body/html */
html, body {
  margin: 0;
  padding: 0;
  background: var(--paper, #faf7f1);
  font-family: 'Inter', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#root {
  min-height: 100vh;
  color: var(--ink, #1a1815);
}
```

**Important:** Replace toate `/* PASTE VERBATIM */` placeholders cu actual CSS values extrase din mockup. PRESERVE WCAG audit comentariile context original.

### 2.4 — Create `tailwind.config.js`

Color tokens identical cu mockup inline Tailwind config (lines ~17-31):

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './react-test.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        paper: '#faf7f1',
        paper2: '#f3ede1',
        ink: '#1a1815',
        ink2: '#3a342d',
        line: '#e7e0d0',
        brick: '#c8412e',
        brickdark: '#a8351f',
        olive: '#6b7142',
        deep: '#2d4a6b',
        succ: '#3d7a4a',
        warn: '#c89321',
        danger: '#c8412e',
      },
    },
  },
  plugins: [],
};
```

### 2.5 — Create `postcss.config.js`

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### 2.6 — Update `src/App.tsx` cu Tailwind clases smoke

Replace inline `style={{}}` cu Tailwind classes pentru verify Tailwind PostCSS pipeline + color tokens work end-to-end:

```typescript
// ══ REACT APP ROOT — Andura Clasic Build (Phase 1 Foundation) ═════════════
// Per DECISIONS.md §D015 + §D016. Tailwind PostCSS verified parity mockup
// color tokens. Routing + 4 root nav (Antrenor/Progres/Istoric/Cont)
// adăugat Phase 2.

export function App(): JSX.Element {
  return (
    <main className="min-h-screen bg-paper text-ink p-6 font-sans">
      <h1 className="text-2xl font-semibold text-ink mb-3">
        🦫 Andura Clasic
      </h1>
      <p className="text-sm text-ink2 mb-2">
        Phase 1 Foundation LANDED — Vite + React 19 + TypeScript + Zustand + Tailwind PostCSS.
      </p>
      <p className="text-sm text-ink2 mb-2">
        Vanilla legacy preserved exact la <code className="text-brick">/</code>.
      </p>
      <p className="text-sm text-ink2 mt-6">
        Next: Phase 2 React Router skeleton + 50+ screens mockup goto() migration.
      </p>
    </main>
  );
}
```

### 2.7 — Verify Tailwind build pipeline + color tokens funcționează

```bash
npm run build                                     # expect: 0 errors, dist/ generated, Tailwind CSS bundled
```

Verify dist output includes Tailwind CSS:
```bash
ls -la dist/assets/                               # expect: .css file present
grep -l "bg-paper\|text-ink" dist/assets/*.css || echo "Tailwind classes NOT bundled — investigate"
```

Verify color tokens compile correct:
```bash
grep -A 1 "paper:#faf7f1\|paper: #faf7f1" dist/assets/*.css | head -5
```

### 2.8 — Verify typecheck clean (post `JSX.Element` etc.)

```bash
npm run typecheck                                 # expect: 0 errors
```

### 2.9 — Verify Husky pre-commit NU triggered (no commits yet)

```bash
git status --short
# expect: M package.json, M package-lock.json, M react-test.html,
# R src/App.jsx -> src/App.tsx, R src/main.jsx -> src/main.tsx,
# ?? src/styles/global.css, ?? tailwind.config.js, ?? postcss.config.js,
# M src/App.tsx (content), M src/main.tsx (content)
```

NU commit acum — Task 4 atomic single-concern split.

## Success criteria

- `src/styles/global.css` created cu CSS variables verbatim mockup `:root` block ✓
- `tailwind.config.js` created cu color tokens identical mockup inline config ✓
- `postcss.config.js` created standard ESM export ✓
- `src/App.tsx` updated cu Tailwind classes smoke (bg-paper, text-ink, mb-3 etc.) ✓
- `npm run build` 0 errors + Tailwind CSS bundled in dist/assets ✓
- `npm run typecheck` 0 errors ✓
- Vanilla `src/styles/main.css` invariant (NU touched) ✓

## Fail conditions

- CSS variables extract miss (any `--*` din mockup `:root` absent în global.css) → STOP, raport missing tokens
- Tailwind build error (PostCSS config issue) → STOP, raport stderr literal
- `npm run typecheck` errors → STOP, raport TS errors
- Color token mismatch (mockup vs global.css/tailwind.config) → STOP, raport diff

## Output

Console raport scurt: "Task 2 DONE. Tailwind PostCSS configured. CSS variables N tokens extrase verbatim mockup → global.css. tailwind.config.js color tokens parity mockup. App.tsx Tailwind classes smoke verified. Build + typecheck clean. Continue Task 3."

---

🦫 **Bugatti peak craft fidelity — CSS variables VERBATIM mockup (NU aproximare). Tailwind PostCSS production-grade (NU CDN). Vanilla legacy `src/styles/main.css` preserved invariant.**
