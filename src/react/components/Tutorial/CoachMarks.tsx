// ══ COACH-MARKS — lightweight guided-bubble overlay engine ════════════════
// Spotlights a real UI element (by data-testid) and floats a short bubble over
// it, walking a declared list of steps. Built for the first-session tutorial
// (founder pick 2026-06-12) but generic: pass any `steps` array.
//
// Geometry: the target rect is MEASURED at runtime (getBoundingClientRect) and
// re-measured on resize/scroll + a ResizeObserver on the anchor. The overlay
// renders through a portal at <body> level — the SAME tier as the in-session
// log-dock — so its `position: fixed` boxes resolve against the true viewport.
// CRITICAL golden rule: NO transform/filter is applied to any app ancestor (a
// transform establishes a containing block that breaks fixed positioning); the
// spotlight is a fixed box with a large box-shadow "cutout", never a clip-path
// on the page.
//
// Anchor-absent / anchorless steps degrade to a CENTERED bubble with no
// spotlight (the mockup's `spot:null` fallback) — the teaching moment survives
// even when that surface is not on the current screen yet.
//
// A11y: the dim layer captures ALL pointer events, so the spotlighted element
// is NOT interactable while the overlay is up (no mis-taps — Maria 65). The
// bubble is role="dialog" + focusable and is focused on each step; step text
// lives in an aria-live="polite" region; Escape = skip; controls are real
// buttons (keyboard-reachable). Under prefers-reduced-motion the spotlight
// pulse animation is suppressed (vestibular safety).

import type { JSX } from 'react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { t } from '../../../i18n/index.js';
import type { TutorialStep } from './steps';

interface CoachMarksProps {
  /** Ordered steps to walk. */
  steps: readonly TutorialStep[];
  /** User finished the last step ("Gata"). */
  onComplete: () => void;
  /** User bailed (Escape / "Sari peste"). */
  onSkip: () => void;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

// Padding around the spotlighted element (px) so the cutout breathes.
const SPOT_PAD = 8;
// Bubble sizing + gap from the anchor (px). Width is clamped to the viewport.
const BUBBLE_W = 280;
const BUBBLE_GAP = 12;
const EDGE = 12; // min margin from any viewport edge.

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function measure(testid: string | null): Rect | null {
  if (!testid || typeof document === 'undefined') return null;
  const el = document.querySelector<HTMLElement>(`[data-testid="${testid}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  // A zero-area box (display:none / not laid out) is treated as absent so the
  // step falls back to the centered bubble rather than spotlighting nothing.
  if (r.width <= 0 || r.height <= 0) return null;
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

export function CoachMarks({ steps, onComplete, onSkip }: CoachMarksProps): JSX.Element | null {
  const [idx, setIdx] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const bubbleRef = useRef<HTMLDivElement | null>(null);

  const total = steps.length;
  const step = steps[idx];
  const isLast = idx === total - 1;
  const anchor = step?.anchor ?? null;

  // Re-measure the current anchor on step change + on resize/scroll + when the
  // anchor element itself resizes. useLayoutEffect so the first paint already
  // has geometry (no spotlight flash at the wrong spot).
  useLayoutEffect(() => {
    if (!step) return;
    const update = (): void => setRect(measure(anchor));
    update();

    if (!anchor || typeof window === 'undefined') return;

    window.addEventListener('resize', update);
    // Capture-phase scroll so nested scroll containers also trigger a re-measure.
    window.addEventListener('scroll', update, true);

    let ro: ResizeObserver | undefined;
    const el = document.querySelector<HTMLElement>(`[data-testid="${anchor}"]`);
    if (el && typeof ResizeObserver === 'function') {
      ro = new ResizeObserver(update);
      ro.observe(el);
    }
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
      ro?.disconnect();
    };
  }, [anchor, step]);

  // Move focus to the bubble on each step so keyboard + screen-reader users
  // land on the new copy (announced via the aria-live region below).
  useEffect(() => {
    bubbleRef.current?.focus();
  }, [idx]);

  // Escape = skip (anywhere on the overlay).
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onSkip();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onSkip]);

  if (!step || typeof document === 'undefined') return null;

  const next = (): void => {
    if (isLast) onComplete();
    else setIdx((i) => i + 1);
  };

  const reduced = prefersReducedMotion();
  const vw = typeof window !== 'undefined' ? window.innerWidth : 360;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 640;
  const bubbleW = Math.min(BUBBLE_W, vw - EDGE * 2);

  // ── Spotlight box (only when the anchor was measured) ──────────────────────
  const spot: Rect | null = rect
    ? {
        top: rect.top - SPOT_PAD,
        left: rect.left - SPOT_PAD,
        width: rect.width + SPOT_PAD * 2,
        height: rect.height + SPOT_PAD * 2,
      }
    : null;

  // ── Bubble position ────────────────────────────────────────────────────────
  // With a spotlight: place below or above the anchor per the placement hint,
  // flipping if it would clip; clamp horizontally to stay on screen. Without a
  // spotlight (absent/anchorless): center the bubble.
  let bubbleStyle: { top: number; left: number };
  if (spot) {
    const wantTop = step.placement === 'top';
    const belowTop = spot.top + spot.height + BUBBLE_GAP;
    const aboveBottom = spot.top - BUBBLE_GAP;
    // Estimate bubble height generously for the flip decision; real height is
    // content-driven but bounded — a clamp after keeps it on screen regardless.
    const estH = 150;
    const fitsBelow = belowTop + estH <= vh - EDGE;
    const fitsAbove = aboveBottom - estH >= EDGE;
    const placeBelow = wantTop ? !fitsAbove && fitsBelow : fitsBelow || !fitsAbove;
    let top = placeBelow ? belowTop : aboveBottom - estH;
    top = Math.max(EDGE, Math.min(top, vh - EDGE - estH));
    // Horizontally align the bubble's center to the anchor's center, clamped.
    const anchorCx = spot.left + spot.width / 2;
    let left = anchorCx - bubbleW / 2;
    left = Math.max(EDGE, Math.min(left, vw - EDGE - bubbleW));
    bubbleStyle = { top, left };
  } else {
    bubbleStyle = {
      top: Math.round(vh / 2 - 90),
      left: Math.round(vw / 2 - bubbleW / 2),
    };
  }

  const title = t(`${step.key}.title`);
  const body = t(`${step.key}.body`);
  const stepLabel = t('tutorial.stepCounter', { current: idx + 1, total });

  return createPortal(
    <div
      data-testid="tutorial-overlay"
      aria-hidden={false}
      style={{ position: 'fixed', inset: 0, zIndex: 80 }}
    >
      {/* Dim layer — captures ALL pointer events so the page underneath (incl.
          the spotlighted element) cannot be tapped while the tutorial is up.
          Clicking the dim does nothing (no accidental dismiss — explicit skip
          only), but it absorbs the tap so it never reaches the real UI. */}
      <div
        data-testid="tutorial-dim"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(5,6,10,0.74)',
          // No spotlight → the dim itself is the backdrop. With a spotlight the
          // cutout is drawn by the spot box's box-shadow, so keep this dim
          // transparent there to avoid double-darkening.
          opacity: spot ? 0 : 1,
        }}
      />

      {/* Spotlight — a fixed box at the measured rect with a huge box-shadow
          that darkens everything EXCEPT the cutout. pointer-events:none so it
          neither blocks nor leaks taps (the dim already owns pointer capture).
          The volt ring marks the target; pulse only when motion is allowed. */}
      {spot && (
        <div
          data-testid="tutorial-spotlight"
          className={reduced ? undefined : 'tutorial-spot-pulse'}
          style={{
            position: 'absolute',
            top: spot.top,
            left: spot.left,
            width: spot.width,
            height: spot.height,
            borderRadius: 16,
            boxShadow: '0 0 0 3px var(--volt), 0 0 0 9999px rgba(5,6,10,0.74)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Bubble */}
      <div
        ref={bubbleRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        data-testid="tutorial-bubble"
        tabIndex={-1}
        style={{
          position: 'absolute',
          top: bubbleStyle.top,
          left: bubbleStyle.left,
          width: bubbleW,
          background: 'var(--paper-2)',
          border: '1px solid color-mix(in oklab, var(--volt) 35%, transparent)',
          borderRadius: 14,
          padding: '14px 15px',
          boxShadow: '0 16px 40px -14px rgba(0,0,0,0.7)',
          outline: 'none',
        }}
      >
        <p
          className="font-mono"
          data-testid="tutorial-step-counter"
          style={{
            fontSize: 9,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--brick)',
          }}
        >
          {stepLabel}
        </p>
        {/* aria-live region — announces the new step's title + body politely as
            the user advances (focus already on the bubble). */}
        <div aria-live="polite" data-testid="tutorial-step-text">
          <p
            className="font-display"
            data-testid="tutorial-title"
            style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginTop: 4, lineHeight: 1.3 }}
          >
            {title}
          </p>
          <p
            className="text-ink2"
            data-testid="tutorial-body"
            style={{ fontSize: 13, marginTop: 6, lineHeight: 1.45 }}
          >
            {body}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 13 }}>
          {/* Step dots */}
          <div style={{ display: 'flex', gap: 4 }} aria-hidden="true">
            {steps.map((s, i) => (
              <span
                key={s.id}
                style={{
                  width: i === idx ? 14 : 5,
                  height: 5,
                  borderRadius: i === idx ? 3 : 999,
                  background: i === idx ? 'var(--volt)' : 'var(--ink-3)',
                  transition: reduced ? undefined : 'width 160ms ease',
                }}
              />
            ))}
          </div>
          <button
            type="button"
            data-testid="tutorial-next"
            onClick={next}
            className="font-mono press-feedback"
            style={{
              fontSize: 11,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--on-accent)',
              background: 'var(--volt)',
              padding: '6px 13px',
              borderRadius: 999,
              border: 'none',
              fontWeight: 700,
            }}
          >
            {isLast ? t('tutorial.controls.done') : t('tutorial.controls.next')}
          </button>
        </div>

        {/* Skip — always visible until the last step (mirrors the mockup). */}
        {!isLast && (
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <button
              type="button"
              data-testid="tutorial-skip"
              onClick={onSkip}
              className="text-ink3"
              style={{ fontSize: 11, background: 'none', border: 'none', textDecoration: 'underline', textUnderlineOffset: 2 }}
            >
              {t('tutorial.controls.skip')}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
