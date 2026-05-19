# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Andura (https://andura.app), please report it responsibly:

- **Email:** maziludanielconstantin90@gmail.com
- **Subject prefix:** `[SECURITY]`
- **Scope:** `andura.app` web application + this repository
- **Out of scope:** third-party dependencies (please escalate directly to upstream maintainers)

## Response SLA

- **Acknowledge:** within 48 hours
- **Initial assessment:** within 7 days
- **Fix or coordinated disclosure:** within 30 days for High/Critical severity

Please do not publicly disclose the vulnerability before we have had a reasonable opportunity to investigate and respond. We commit to:

- Confirming receipt of your report
- Keeping you informed of progress
- Crediting your contribution (with your permission) in release notes once the issue is resolved

## Out of Scope

The following are intentional behaviors and not vulnerabilities:

- Firebase Web API key visible in client bundle (Firebase docs: public-safe, not a secret; protection via Firebase Security Rules + Authorized Domains)
- Auth tokens in `localStorage` (PWA SPA architecture constraint; mitigated by tight CSP + dependency auditing + no `dangerouslySetInnerHTML` usage)
- `Mock login` button visible in development builds only (gated `import.meta.env.DEV`)

## Supported Versions

Only the latest deployed version at `andura.app` is supported. Pre-Beta phase: single-environment.

---

Per `DECISIONS.md §D031` Phase 7 Findings FIX procedure.
