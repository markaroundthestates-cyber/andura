# Findings — `screen-splash` (Wave A.1)

**Mockup ref:** `04-architecture/mockups/andura-clasic.html:403-419`
**Prod ref:** `src/react/routes/screens/Splash.tsx:1-47`
**Audit date:** 2026-05-20

## Mockup verbatim (lines 403-419)

```html
<div class="screen paper-bg active" id="screen-splash" style="height:100%; flex-direction:column; padding: 48px 28px 32px; align-items:center; justify-content:space-between;">
  <div></div>
  <div style="display:flex; flex-direction:column; align-items:center; gap:24px; text-align:center;">
    <div style="width:72px; height:72px; border-radius:22px; background:var(--ink); color:var(--paper); display:flex; align-items:center; justify-content:center; font-size:32px; font-weight:700; letter-spacing:-0.04em;">A</div>
    <div>
      <div style="font-size:42px; font-weight:700; letter-spacing:-0.03em; color:var(--ink);">Andura</div>
      <div class="coach-quote" style="font-size:18px; color:var(--ink-2); margin-top:8px; max-width:260px;">Antrenorul tau personal,<br/>fara zgomot.</div>
    </div>
  </div>
  <div style="width:100%; display:flex; flex-direction:column; gap:12px;">
    <button class="btn-brick" onclick="goto('auth')">Incepe</button>
    <button class="btn-ghost" onclick="goto('auth')" style="background:transparent; border:none; color:var(--ink-3);">Am deja cont</button>
    <div style="text-align:center; font-size:11px; color:var(--ink-3); margin-top:8px; line-height:1.6;">
      Facut in Romania · Datele tale raman ale tale
    </div>
  </div>
</div>
```

## Prod verbatim (Splash.tsx:9-47)

```tsx
<section className="min-h-screen bg-paper text-ink flex flex-col items-center justify-center p-6 text-center" data-testid="splash">
  <div className="w-20 h-20 rounded-3xl bg-ink text-paper flex items-center justify-center text-4xl font-bold mb-6 tracking-tight">A</div>
  <h1 className="text-3xl font-bold text-ink mb-2 tracking-tight font-serif">Andura</h1>
  <p className="text-sm text-ink2 mb-8 max-w-xs">Antrenament cu cap. Facut in Romania.</p>
  <button type="button" onClick={() => navigate(isAuthenticated ? '/app/antrenor' : '/auth')} data-testid="splash-cta" className="w-full max-w-xs py-4 bg-brick text-paper rounded-xl text-base font-semibold">
    {isAuthenticated ? 'Continua' : 'Incepe'}
  </button>
  {!isAuthenticated && (
    <button type="button" onClick={() => navigate('/auth')} data-testid="splash-secondary" className="mt-3 text-sm text-ink2 underline">
      Am deja cont
    </button>
  )}
</section>
```

## Findings

### F-splash-01 — Subtitle TEXT divergence (high-visibility brand line)

- **Severity:** HIGH
- **Category:** Text
- **Mockup:** `Antrenorul tau personal,\nfara zgomot.` (2 lines, brand tagline emphasis "no noise")
- **Prod:** `Antrenament cu cap. Facut in Romania.` (1 line, generic feature claim + origin)
- **Mockup ref:** `andura-clasic.html:409`
- **Prod ref:** `Splash.tsx:25`
- **Karpathy fix:** Surgical Changes (1-line text edit) + Goal-Driven (brand tagline = first impression Maria 65 Gigel)
- **Fix effort:** S (≤30min)
- **Beta blocker?** YES — Splash este first-load surface, tagline brand identity. Mockup tagline "Antrenorul tau personal, fara zgomot" = anti-paternalism positioning; prod variant loses that positioning.

### F-splash-02 — Title font-size dropped 42→30px (28% smaller)

- **Severity:** HIGH
- **Category:** Token
- **Mockup:** `font-size: 42px; font-weight: 700; letter-spacing: -0.03em;`
- **Prod:** `text-3xl` (= 30px default Tailwind) `font-bold` (700) `tracking-tight` (= -0.025em close enough)
- **Mockup ref:** `andura-clasic.html:408`
- **Prod ref:** `Splash.tsx:22`
- **Karpathy fix:** Surgical Changes (Tailwind class swap text-3xl → text-[42px] or custom utility)
- **Fix effort:** S
- **Beta blocker?** YES — wordmark size = brand identity strength. Prod feels diminished.

### F-splash-03 — Subtitle font-size 18 vs prod text-sm (14px) ~22% smaller

- **Severity:** MED
- **Category:** Token
- **Mockup:** `font-size: 18px;` (= text-lg)
- **Prod:** `text-sm` (= 14px)
- **Mockup ref:** `andura-clasic.html:409`
- **Prod ref:** `Splash.tsx:25`
- **Karpathy fix:** Surgical (class swap text-sm → text-lg)
- **Fix effort:** S
- **Beta blocker?** NO (Wave 2 polish)

### F-splash-04 — Footer line MISSING ("Facut in Romania · Datele tale raman ale tale")

- **Severity:** HIGH
- **Category:** Text
- **Mockup:** `Facut in Romania · Datele tale raman ale tale` (footer line 11px ink-3)
- **Prod:** ABSENT (no equivalent footer; prod moved "Facut in Romania" into subtitle, lost "Datele tale raman ale tale" entirely)
- **Mockup ref:** `andura-clasic.html:416`
- **Prod ref:** `Splash.tsx:23-26` (subtitle only)
- **Karpathy fix:** Surgical Changes (add `<p>` footer element)
- **Fix effort:** S
- **Beta blocker?** YES — data ownership messaging is core trust signal Andura strategic positioning per `ANDURA_PRIMER.md` §1 (privacy-first solo dev). Dropping it weakens first-impression trust narrative.

### F-splash-05 — Logo dimensions divergence (72→80px)

- **Severity:** LOW
- **Category:** Token
- **Mockup:** `width:72px; height:72px; border-radius:22px; font-size:32px;`
- **Prod:** `w-20 h-20` (80px) `rounded-3xl` (24px) `text-4xl` (36px)
- **Mockup ref:** `andura-clasic.html:406`
- **Prod ref:** `Splash.tsx:18-20`
- **Karpathy fix:** Surgical (arbitrary Tailwind values `w-[72px] h-[72px] rounded-[22px] text-[32px]`)
- **Fix effort:** S
- **Beta blocker?** NO (Wave 3 polish — barely perceptible 8px / 4px)

### F-splash-06 — Padding rhythm divergence (48/28/32 mockup vs p-6 prod)

- **Severity:** LOW
- **Category:** Layout
- **Mockup:** `padding: 48px 28px 32px;` (asymmetric — more top, custom horizontal)
- **Prod:** `p-6` (= 24px all sides)
- **Mockup ref:** `andura-clasic.html:403`
- **Prod ref:** `Splash.tsx:15`
- **Karpathy fix:** Surgical (`pt-12 px-7 pb-8` approximation)
- **Fix effort:** S
- **Beta blocker?** NO (Wave 3)

### F-splash-07 — Layout structure space-between vs centered

- **Severity:** MED
- **Category:** Layout
- **Mockup:** `justify-content: space-between` cu 3 sections (top spacer empty, middle brand, bottom CTAs+footer) — anchors CTAs at viewport bottom
- **Prod:** `justify-center` — content vertically centered, CTAs immediately below brand
- **Mockup ref:** `andura-clasic.html:403` (asymmetric spacing intentional)
- **Prod ref:** `Splash.tsx:15` (`min-h-screen ... items-center justify-center`)
- **Karpathy fix:** Think Before Coding (layout pattern change `justify-between` + 3 children empty/brand/cta)
- **Fix effort:** M (need to restructure JSX children to enable space-between distribution)
- **Beta blocker?** YES — mockup CTA anchor at bottom = mobile UX best practice (thumb reach zone); prod center positioning forces user to look-then-reach.

### F-splash-08 — Title font-family `font-serif` în prod NOT în mockup

- **Severity:** MED
- **Category:** Token
- **Mockup:** Inter system font (no explicit serif override) — title uses default Inter weight 700
- **Prod:** `font-serif` class on `<h1>` (line 22) — overrides to serif typeface
- **Mockup ref:** `andura-clasic.html:408` (no serif declaration)
- **Prod ref:** `Splash.tsx:22` (`font-serif` class)
- **Karpathy fix:** Surgical (remove `font-serif` class)
- **Fix effort:** S
- **Beta blocker?** YES — typography brand identity divergence. Mockup Inter sans-serif; prod renders serif. Daniel verify Tailwind config — `font-serif` may map to custom serif font OR default browser serif (Times/Georgia) — either way ≠ mockup intent.

## Severity totals

| Severity | Count |
|----------|-------|
| CRIT | 0 |
| HIGH | 4 (F-splash-01 subtitle text, F-splash-02 title size, F-splash-04 footer missing, F-splash-07 layout space-between) |
| MED | 2 (F-splash-03 subtitle size, F-splash-08 font-serif) |
| LOW | 2 (F-splash-05 logo dims, F-splash-06 padding) |
| NIT | 0 |

**Total: 8 findings on Splash screen.**

## Parity weighted score (per dimension)

- Layout: 70% (1 HIGH div = space-between → centered + padding LOW)
- Text: 50% (2 HIGH text divergences = subtitle TEXT + footer MISSING; verbatim Andura wordmark + Incepe / Am deja cont preserved)
- Components: 90% (logo + title + subtitle + 2 buttons all present; footer text missing as standalone element)
- Tokens: 65% (font-size 42→30 + 18→14 + serif divergence + 4 token-level token drift LOW)
- Behavior: 80% (auth state-aware CTA = bonus prod; mockup static; both serve same goal)

**Splash weighted parity: ~70% (Layout × 0.20 + Text × 0.25 + Components × 0.30 + Tokens × 0.15 + Behavior × 0.10)**
- = 0.70 × 0.20 + 0.50 × 0.25 + 0.90 × 0.30 + 0.65 × 0.15 + 0.80 × 0.10
- = 0.14 + 0.125 + 0.27 + 0.0975 + 0.08
- **= 71.25% Splash parity**
