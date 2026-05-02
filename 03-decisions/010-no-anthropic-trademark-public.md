# ADR-010: No Anthropic Trademark in Public-Facing Material

**Status:** Active
**Date:** 25 Apr 2026
**Decision makers:** Daniel (CEO + Product), Co-CTO (Claude chat)
**Supersedes:** Implicit branding decision from 24 Apr 2026 ("Claude AI Opus 4.7 Coach")

---

## Context

During brand strategy discussion on 24 Apr 2026, the project documented a brand concept named "Claude AI Opus 4.7 Coach" — positioning Andura as a coach built on Anthropic's Opus 4.7 model. This terminology appeared in PROJECT_VISION.md, INDEX_MASTER.md, DECISION_LOG.md, and discussions.

On 25 Apr 2026, after legal verification of Anthropic's Consumer Terms of Service and Trademark Policy, it became clear that this naming pattern violates Anthropic's trademark policy:

> "You may not, without our prior written permission, use our name, logos, or other trademarks in connection with products or services other than the Services, or in any other way that implies our affiliation, endorsement, or sponsorship."
> — Anthropic Consumer Terms of Service

Public use of "Claude" in product naming or marketing requires explicit written permission from Anthropic, obtained via marketing@anthropic.com. We have not obtained such permission, and obtaining it is not a priority for our current bootstrap phase.

---

## Decision

**Andura will not reference Anthropic, Claude, or any Anthropic trademark in public-facing material.**

This includes but is not limited to:
- Product name and tagline
- Marketing copy and landing pages
- App store listings
- Press releases and PR
- Public roadmap documents
- Social media presence
- Any user-visible UI text

**Public brand name:** Andura (or successor name TBD pre-launch).

**Public technology positioning:** Generic AI terminology ("AI coaching engine", "advanced AI personalization") without vendor attribution.

---

## What is allowed

The following technical references remain acceptable in their respective contexts:

1. **Internal documentation** (vault, ADRs, technical specs): Anthropic and Claude can be referenced factually for technical accuracy. Examples: "uses Claude API for X feature", "Opus 4.7 is the model behind reasoning step Y". Internal docs are not public-facing.

2. **Privacy Policy and Terms of Service** (legal disclosure): Factual disclosure of vendors used, in compliance with GDPR and CCPA transparency requirements. Example: "Andura uses Anthropic's Claude API to generate personalized coaching recommendations." This is factual disclosure, not promotional language, and is legally required for transparency.

3. **Editorial/journalistic context**: If a journalist or technical blogger writes about Andura's tech stack, they can reference Anthropic. We do not control third-party editorial content.

4. **Code comments and source code**: Internal references to library names, model identifiers (e.g., `model: "claude-opus-4-7"`) are technical implementation details, not public branding.

---

## What is not allowed

- Brand names containing "Claude", "Anthropic", or related trademarks
- Logos: any reproduction of Anthropic's wordmark or visual identity
- Color palettes deliberately matching Anthropic's brand (e.g., the warm brown/tan #D4A574)
- Marketing taglines suggesting partnership: "Powered by Claude", "Built with Claude", "Made with Anthropic AI", "Claude-powered coaching"
- Implied endorsement or sponsorship in any form
- Promotional use of Anthropic-related keywords for SEO

---

## Strategic benefits

This decision is not just defensive. It carries forward-compatibility benefits:

1. **Vendor independence**: If we change AI backend in future (e.g., Mythos-class model when generally available, or a competing provider for cost reasons), the brand does not break. Users know "Andura AI Coach", not "Claude Coach".

2. **Differentiation**: We sell outcomes (transformation, contextual coaching, persistent memory), not implementation details. This is healthier positioning than vendor-tied marketing.

3. **Risk mitigation**: Pre-acquisition due diligence will flag any trademark misuse. Clean trademark posture from day one prevents expensive renegotiation or rebranding later.

4. **Industry analogy**: Coca-Cola does not advertise the Brazilian sugar in their drink. Stripe does not advertise AWS as backbone. Vendor relationships are implementation, not brand.

---

## Implementation actions

Required cleanup of existing vault content (executed 25 Apr 2026):

- [ ] PROJECT_VISION.md — rewrite "CONCEPT BRAND" section
- [ ] INDEX_MASTER.md — rewrite "CONCEPT PRODUS" section
- [ ] DECISION_LOG.md — add entry for this rebrand decision
- [ ] All other vault files — search and review any "Claude AI Opus 4.7 Coach" references

Future enforcement:

- All new copy, landing pages, marketing material reviewed against this ADR
- Pre-launch security audit includes trademark check as line item
- Quarterly review of public-facing material to catch drift

---

## Reconsideration triggers

This decision should be revisited if any of the following occur:

1. Anthropic explicitly grants written permission to use their trademark in our context
2. Andura joins an official Anthropic partner program with brand usage rights
3. Anthropic releases a brand attribution program for builders (e.g., a "Built on Claude" official badge program with terms)
4. Legal counsel advises that our specific use case falls under nominative fair use (unlikely for a product brand)

Until such trigger, this ADR stands.

---

## Related

- Anthropic Consumer Terms of Service: https://www.anthropic.com/legal/consumer-terms
- Anthropic Trademark contact: marketing@anthropic.com
- Internal doc: PROJECT_VISION.md (post-cleanup version)
- Internal doc: MOAT_STRATEGY.md (technology references kept internal-only)

---

**Authored:** Co-CTO (Claude chat)
**Approved:** Daniel
**Effective:** 25 Apr 2026
