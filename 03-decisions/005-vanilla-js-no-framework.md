# ADR 005: Vanilla JS + Vite, No UI Framework

**Status:** Accepted  
**Date:** 2026-04-23
**See also:** [[DECISION_LOG]] | [[STACK_CURRENT]] | [[008-vitest-playwright-testing]]

## Context

The app is a single-user PWA. Frameworks like React/Vue add bundle size, build complexity, and learning overhead.

## Decision

Use vanilla JS with Vite for bundling. UI is rendered via template literals into DOM nodes. State is localStorage (via DB abstraction). No reactive framework.

## Consequences

- **Positive:** Tiny bundle (~50KB). Fast load even on 3G.
- **Positive:** Zero framework churn — no upgrades, no breaking changes.
- **Negative:** Manual DOM updates. No virtual DOM diffing — full re-renders on state change.
- **Negative:** Template literal HTML is not sanitized — XSS risk if user input is ever rendered (currently exercise names from a fixed list, so risk is low).
- **Mitigation:** If user-generated text is ever rendered, HTML-escape via `text.replace(/[&<>"']/g, c => ({...})[c])`.
