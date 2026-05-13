---
title: ADR 020 — Storage Tiering Strategy (Tier 0/1/2 + Dexie.js + Rotation)
type: entity
subtype: adr
status: locked-v1
locked_date: 2026-04-30
authority: 03-decisions/020-storage-tiering-strategy.md raw layer §Decision SSOT (Tier 0 localStorage Hot 30d + Tier 1 IndexedDB Dexie.js Warm 30-180d + Tier 2 Firebase Cold archive >180d) + §Library decision Dexie.js + §Rotation trigger pragmatic + §Migration runner one-time
voice_preservation: synthesis + verbatim + bugatti + crossrefs
cross_refs:
  - "[[adr-001-local-first-storage]]"
  - "[[adr-002-firebase-rest-not-sdk]]"
  - "[[adr-006-tier-storage-for-logs]]"
  - "[[adr-011-coach-decision-log-architecture]]"
  - "[[adr-018-engine-extensibility-architecture]]"
  - "[[../../concepts/append-only-architecture]]"
  - "[[../../concepts/calendar-feature-v1-spec]]"
  - "[[../engines/engine-coach-director]]"
amendments:
  - date: 2026-05-13
    note: Tier 0 active rolling parity pattern S1.7 — `wv2-missing-equipment` localStorage key Calendar V1 missing equipment lifecycle dedicated picker permanent (10 echipamente standard gym toggle + `toggleEquipmentMissing()` + `hydrateAparateLipsa()` legacy RO normalize via `validIds` filter). Distinct semantic vs ephemeral Tier 0 rotation 30d auto-expire — user-driven edit oricând opt-out aparate selectate anterior ("scoate aparatele care anterior selectate ca lipsa în caz că acum le ai"). Path forward Coach Engine #2 `buildSession()` consume filter pre-build alternative parity equipment-swap logic fără user input. Calendar S1.7 LANDED mockup-only commit `de761f5`
  - date: 2026-05-13b
    note: S2 Production Wiring LANDED Tier 0 parity pattern preserved invariant — `wv2-missing-equipment` localStorage Tier 0 key propagated via `src/engine/coachContext.js` extend SSOT merge prin `safeCtx.meta` defensive-read pattern engines absorb context (S2.B `fce846a`) + `src/ui/screens/aparateLipsa.js` modal overlay page port hydrate post-render legacy RO normalize via `validIds` filter (S2.C `a77587c`) + scheduleAdapter UI-side adapter filter consume Tier 0 list pre-build (S2.A `7c2f520`). User-driven edit oricând opt-in/opt-out preserved invariant (Daniel verbatim S1.7 *"sa poti sa si scoti aparatele pe care anterior le-ai selectat ca nu e ai, in cazul in care acum le ai"*). Distinct semantic vs ephemeral rotation 30d auto-expire reaffirm — Tier 0 = active rolling allows BOTH ephemeral time-bound AND permanent user-driven state. Tests 2914 → 2984 PASS (+70 net new) vitest cluster aparate-lipsa filter
---

# ADR 020 — Storage Tiering Strategy

## Synthesis

ADR 020 = decision **Storage Tiering Strategy** Tier 0/1/2 + Dexie.js + Rotation universal PWA storage arhitectură. Original LOCK V1 2026-04-30 evening. Trigger: anti-pattern actual `localStorage` append-only CDL + logs + cache → PWA hard limit per origin ~5MB browser-wide → pe user activ 6-12 luni utilizare atinge >80% bucket → **crash silent** (writes fail tăcut, browser NU raportează vizibil). Per Gemini 3 Pro cross-check 2026-04-30 evening **Q10 BLIND SPOT #1 — BLOCKER pre-launch**. **De ce blocker NU deferable:** crash silent ≠ recoverable (user pierde data + trust, NU raportează "bug"), Beta micro-launch luna 3-4 (3-5 useri reali) va atinge limita logging dens, foundation pentru Multi-Gym + Profile typing v2 + Synthetic Demographic Prior runtime, fix retroactiv post-launch = migration runner data live = risk corruption + downtime. **Decision SSOT 3 tiers:** **Tier 0 — Hot** (`localStorage`) ultimele 30d data hot UI immediate + Arbitrator current decisions, budget ~1-2MB max target <2MB hard ceiling sub bucket browser ~5MB, sync read/write UI render path; **Tier 1 — Warm** (`IndexedDB` via **Dexie.js**) retention 30-180d pre-launch / 30-365d post-Pro (generalizing ADR 011 fixed 180d cu age+size dual triggers rotation whichever first), Dexie.js ~30KB minified MIT license stable PWA Notion/Obsidian/Linear, budget 50-500MB realist (browser-dependent Chrome ~80% disk free / Firefox 10GB hard), versioned schema Dexie convention `db.version(N).stores({...})` migration runner aligned ADR 018 §4 schema versioning, async read/write NU UI render hot path; **Tier 2 — Cold** (`Firebase` cloud) archive >180d pre-launch / >365d post-Pro Firestore per ADR 002 REST API NU SDK, cost $125/lună 100 users / $1500/lună 1000 users, lazy fetch on-demand. **Rotation trigger initial pragmatic:** `initAutoBackup` la app load + periodic check (interval Sprint 4 implementation detail). Tier 0→Tier 1: localStorage size >4MB SAU entry age >30d (whichever first). Tier 1→Tier 2: IndexedDB size >100MB SAU entry age >180d. **Rotation = move-only zero info loss principle absolut** (per VAULT_RULES §5). Idempotent retry-able failure. **Library Dexie.js v4.x selected** vs `idb-keyval` (lipsa migration runner) vs native IndexedDB (verbose error-prone) vs `localForage` (WebSQL deprecated overhead inutil). **Migration runner one-time** app startup post-deploy: citește localStorage existing → for each age>30d write IndexedDB Tier 1 → verify Dexie transaction commit → DOAR if OK delete localStorage entry (idempotent safe) → log CDL audit + Sentry alert >3 failure attempts.

## Verbatim quotes Daniel

Daniel verbatim chat strategic 2026-04-30 evening Gemini 3 Pro cross-check Q10 BLIND SPOT #1 articulation seminal:

> *"Storage Exhaustion PWA Limit ~5MB — CDL Tier 1 + logs + cache pot atinge 80% rapid pe useri activi 6-12 luni. Showstopper tehnic dacă nu rezolvăm pre-launch."*

(Context: Gemini 3 Pro relay Daniel chat strategic ground-truth confirmation — Daniel accepted blocker classification pre-launch + accepted ADR 020 spec SSOT 3-tier + Dexie.js library decision.)

Daniel articulation chat strategic universal scope zero info loss principle:

> *"Rotation = move-only. Zero info loss. NU silent data loss. Idempotent retry-able failure. VAULT_RULES §5 universal."*

Daniel articulation chat strategic anti-rewrite ADR 018 cross-ref (cross-ref [[adr-018-engine-extensibility-architecture]]):

> *"NU rewrite storage. Generalize. ADR 006 specific case logs → ADR 020 universal Tier 0/1/2 arhitectură. Foundation pentru ADR 011 CDL + ADR 014 onboarding + ADR 017 demographic prior runtime."*

Daniel articulation chat strategic cost discipline (cross-ref [[../../concepts/moat-strategy]]):

> *"$125/lună 100 users Firestore. $1500/lună 1000 users. Cost real. Tier 2 lazy fetch on-demand NU eager prefetch all-time history."*

Daniel verbatim chat ACASĂ 2026-05-12 S1.7 missing equipment lifecycle Tier 0 parity pattern (Calendar V1 dedicated picker permanent localStorage `wv2-missing-equipment` user-driven edit oricând):

> *"La cont trebuie o sectiune de aparate lipsa, unde sa apara tot ce ai selectat in trecut ca nu ai, si cu optiunea de edit, sa poti sa si scoti aparatele pe care anterior le-ai selectat ca nu e ai, in cazul in care acum le ai."*

## Bugatti framing notes

**Quality > Speed via zero info loss absolut:** Rotation = move-only verify-then-delete + idempotent retry. VAULT_RULES §5 zero info loss principle. Bugatti craft = NU silent failure migration runner.

**Anti-RE considerations:** Tier boundaries internal (30d / 180d / 365d cutoffs), Dexie.js implementation detail. User vede seamless data continuity (engines query appropriate tier transparent fallback). **Tier 0 parity pattern user-driven NU time-based** — `wv2-missing-equipment` Calendar V1 S1.7 distinct semantic: user-driven edit oricând opt-in/opt-out NU 30d auto-expire rotation (anti-recurrence pattern "Tier 0 = always ephemeral" → corrected: Tier 0 = active rolling allows BOTH ephemeral time-bound AND permanent user-driven state). Calendar week edit ephemeral (Luni next preset reset) vs missing equipment permanent (user toggles când acquires/loses equipment).

**Anti-paternalism notes:** Cost discipline Firestore $125/lună 100 users / $1500/lună 1000 users = transparent user cost reality NU paternalism "use storage freely". Pro tier post-launch context user agency expanded retention.

**Voice tone notes:** "Storage Exhaustion PWA Limit ~5MB — Showstopper tehnic" = seminal Daniel articulation Gemini cross-check chat strategic 2026-04-30 evening. Identity Andura cross-check Gemini ground-truth discipline preservation §1.

**Gigel test relevance:** Migration runner one-time INVISIBLE to user (Gigel NU vede "rotating your Tier 0 → Tier 1"). User vede engine continuă funcționa post-deploy seamless. Dignified UX transparent backend mechanism.

## Cross-refs raw layer

- [[../../../03-decisions/020-storage-tiering-strategy]] §Decision SSOT (Tier 0/1/2) + §Library Dexie.js v4.x + §Rotation trigger pragmatic + §Migration runner one-time + §Q10 BLIND SPOT #1 BLOCKER pre-launch
- [[../../../03-decisions/001-local-first-storage]] §Decision (foundation principle local-first refined post ADR 020 — local = localStorage + IndexedDB NU doar localStorage)
- [[../../../03-decisions/002-firebase-rest-not-sdk]] §Decision (Firebase REST API foundation Tier 2 Cold storage path)
- [[../../../03-decisions/006-tier-storage-for-logs]] §Decision (3-tier logs specific case generalized ADR 020 Tier 0/1/2 universal)
- [[../../../03-decisions/011-coach-decision-log-architecture]] §Storage (CDL Tier 1=180d locked responseProfile rolling window aligned)
- [[../../../03-decisions/018-engine-extensibility-architecture]] §4 Schema Versioning Migration Runner pattern aligned ADR 020 Dexie migration runner
- [[../../../VAULT_RULES]] §5 zero info loss principle absolut universal
- [[../../../03-decisions/DECISION_LOG]] §2026-04-30 evening Gemini 3 Pro cross-check Q10 + §2026-04-27 Decision 5 Firestore cost estimates
- [[../../../04-architecture/mockups/andura-clasic.html]] §screen-aparate-lipsa NEW S1.7 LANDED + `wv2-missing-equipment` localStorage Tier 0 parity pattern user-driven permanent (Calendar V1 dedicated picker 10 echipamente standard gym `toggleEquipmentMissing()` + `hydrateAparateLipsa()` `validIds` filter legacy RO normalize)
- [[../../../📥_inbox/HANDOVER_2026-05-13_CALENDAR_V1_S1_TO_S1_7_PLUS_STATUSLINE]] §4 S1.7 missing equipment lifecycle + §7 path forward S2 Coach Engine #2 `buildSession()` consume filter
- [[../../../📥_inbox/HANDOVER_2026-05-13_chat_acasa_post_s2_landed_strategic_findings]] §2-§3 S2 Adapt + execute Co-CTO tactical + §13 cross-refs Tier 0 parity pattern preserved S2 LANDED 3 commits chain
- [[../../../src/engine/coachContext.js]] S2.B `fce846a` extend SSOT merge `wv2-missing-equipment` Tier 0 filter via `safeCtx.meta` defensive-read pattern
- [[../../../src/ui/screens/aparateLipsa.js]] S2.C `a77587c` modal overlay page port hydrate post-render legacy RO normalize via `validIds` filter
- [[../../../src/engine/scheduleAdapter.js]] S2.A `7c2f520` UI-side adapter filter consume Tier 0 list pre-build
- [[../../concepts/calendar-feature-v1-spec]] §missing-equipment-lifecycle S1.7 LANDED + §S2 Production Wiring LANDED 2026-05-13b (consumer raw layer pattern reuse Tier 0 active rolling parity)
- [[../engines/engine-coach-director]] §amendments[2026-05-13b] S2 Production Wiring LANDED 3 commits chain consume Tier 0 filter

🦫 **ADR 020 Storage Tiering Strategy LOCK V1 2026-04-30 evening. Tier 0 localStorage 30d Hot + Tier 1 IndexedDB Dexie.js Warm 30-180d + Tier 2 Firebase Cold archive >180d. Gemini 3 Pro Q10 BLIND SPOT #1 BLOCKER pre-launch resolved. Zero info loss absolut VAULT_RULES §5. Migration runner one-time idempotent retry-able verify-then-delete. Generalizes ADR 006 specific case logs → universal PWA storage arhitectură. §AMENDMENT 2026-05-13 Tier 0 parity pattern user-driven `wv2-missing-equipment` Calendar V1 S1.7 distinct semantic vs ephemeral rotation (permanent user-driven NU 30d auto-expire). §AMENDMENT 2026-05-13b S2 Production Wiring LANDED Tier 0 parity propagated `src/engine/coachContext.js` extend SSOT merge + `src/ui/screens/aparateLipsa.js` modal overlay + scheduleAdapter UI-side adapter — user-driven edit oricând opt-in/opt-out preserved invariant. Tests 2914 → 2984 PASS (+70 net new).**
