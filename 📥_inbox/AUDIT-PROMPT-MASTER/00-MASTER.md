# ANDURA FULL AUDIT — MASTER PROMPT (step-by-step, forced, scored)

> **Purpose.** This is the "no stone unturned" audit Daniel asks for. It is NOT a
> summary and NOT a sample. Every step below is a single, concrete, *individually
> verifiable* check with an expected result, a how-to-verify, and a verdict slot.
> The auditor (Claude or an agent) MUST execute each step and record a verdict —
> **skipping is not allowed**; if a step cannot be run, it is recorded as `BLOCKED`
> with the reason, never silently passed.
>
> **Why this exists.** Past "full audits" missed hardcoded Romanian strings, a
> split source-of-truth on body-fat, and mockup color mismatches — because the
> auditor *sampled and summarized* instead of checking every item, and trusted
> green tests (which encoded the bugs). This document removes the auditor's
> discretion: it enumerates the real surface area item by item so nothing can be
> glossed. Pair it with the deterministic HARNESS (CI scanners + behavior tests +
> screenshot-diff) — the harness proves the machine-checkable items; this prompt
> covers the judgment items the harness cannot.

---

## RUN MODE A — AS A DYNAMIC WORKFLOW (Opus 4.8, preferred)

This audit is designed to be executed by an **Opus 4.8 Dynamic Workflow**: Claude
writes a JS orchestration script from this spec, a runtime runs it in the
background, fanning out **up to 16 concurrent / 1000 total subagents** — each
subagent owns ONE atomic check (one step below), runs its `Verify`, returns a
structured verdict `{id, verdict, evidence, notes}`. The orchestrator aggregates
into the scorecard + per-section gates. The existing test suite + the HARNESS
gates (string scanner, behavior tests, screenshot-diff) are the machine bar.

**How to launch it** (Daniel, Claude Code on Max/Team, auto mode ON — per
official docs code.claude.com/docs/en/workflows):
- Option 1 — ask Claude directly: *"Create a dynamic workflow to run the full
  audit in `📥_inbox/AUDIT-PROMPT-MASTER/`: one subagent per step (id like
  09.001), each runs its `Verify` and returns {id, verdict, evidence, notes};
  add adversarial reviewer agents that try to refute each PASS; aggregate the
  scorecard + per-section gates; STOP at the first CRITICAL-section gate failure;
  report the live % after each section."*
- Option 2 — turn on the `ultracode` setting (effort menu → sets xhigh + lets
  Claude auto-decide to spin up a workflow), then give it the same task.
- Claude Code shows the plan + asks you to CONFIRM on first run. It fans out
  tens-to-hundreds of parallel subagents, **runs independent verification on every
  finding** (the whole point — no single-pass eyeballing), iterates until verdicts
  converge, saves progress (resumable), and hands back one scored report.
- ⚠️ Consumes substantially more tokens than a normal session — expected for a
  full-repo audit; it's the cost of "every line, no stone unturned" done for real.

Each step's `id` (e.g. `09.001`) is one subagent's atomic unit of work —
independently verifiable, no shared state. That is what makes the fan-out + the
adversarial double-check safe and exhaustive.

## RUN MODE B — MANUAL / Agent-tool fallback (no dynamic-workflow runtime)

If the dynamic-workflow runtime is unavailable, run sections sequentially with
the Agent tool (≤4-5 concurrent per Daniel's cap), one agent per SECTION (not per
step), each agent executing every step in its section to the same verdict+evidence
discipline. Slower, same rigor. This is the degraded path — Mode A is preferred.

## HOW TO RUN THIS AUDIT (applies to both modes)

1. **Sequential + gated.** Run sections in order. Each section ends with a GATE:
   if the section score is below its threshold, the audit STOPS and reports —
   you do not proceed to the next section pretending the app is fine.
2. **One verdict per step.** Every step gets exactly one of:
   - `PASS` — verified working, evidence recorded.
   - `FAIL` — verified broken, evidence + file:line recorded.
   - `PARTIAL` — works but deviates (e.g. wrong color vs mockup) — evidence recorded.
   - `BLOCKED` — could not run (env/data/dep missing) — reason recorded. NEVER use BLOCKED to dodge a checkable item.
3. **Evidence is mandatory.** A `PASS` with no evidence (file:line, screenshot,
   command output, computed value) is INVALID — treat as `FAIL`. No "looks fine".
4. **Immediate response.** After each section, emit the running scorecard (below)
   so Daniel sees live progress + percentages, not a wall at the end.
5. **Real data.** Behavior/parity steps run against a SEEDED populated account
   (see §APPENDIX-SEED), not an empty one — an empty app hides most issues.
6. **Against the mockup.** Parity steps diff the LIVE rendered screen against the
   hand-built mockup `04-architecture/mockups/interfata-noua/` (rendered, not the
   code). Color/spacing/typography deltas = `PARTIAL` at minimum.

## SCORING

- **Step score:** PASS=1, PARTIAL=0.5, FAIL=0, BLOCKED=excluded-from-denominator (but COUNTED + listed separately; >5% BLOCKED in a section fails the section regardless).
- **Section %** = Σ(step scores) / (count of PASS+PARTIAL+FAIL steps) × 100.
- **Overall %** = weighted mean of sections (weights in the section index below).
- **Gate thresholds** per section listed in the index. Beta-ready = ALL sections ≥ their gate AND zero open FAIL in CRITICAL sections (safety, data, security).

## RUNNING SCORECARD (emit after every section)

```
SECTION                          PASS  PART  FAIL  BLOCK   %     GATE   STATUS
01 Entry flow                    --    --    --    --      --%   95%    ----
02 Coach tab                     ...
...
OVERALL                          --    --    --    --      --%   —      ----
```

---

## SECTION INDEX (each is its own file NN-*.md; concatenated = the full prompt)

| # | Section | File | Weight | Gate | Critical |
|---|---------|------|--------|------|----------|
| 01 | Entry flow — Splash / Auth / Onboarding (every screen, string, validation, state) | `01-entry-flow.md` | 6% | 95% | no |
| 02 | Coach tab + components (orb, recommendation, schedule, banners) | `02-coach.md` | 7% | 95% | no |
| 03 | Progress tab + body-comp + nutrition + the data-wiring class | `03-progress.md` | 8% | 95% | YES |
| 04 | History tab + calendar + sessions + PR wall | `04-history.md` | 6% | 95% | no |
| 05 | Account tab + every Settings sub-page + every confirm dialog | `05-account.md` | 7% | 95% | no |
| 06 | Workout flow — energy→preview→LIVE→rpe→summary + safety landmines | `06-workout.md` | 10% | 98% | YES |
| 07 | Engines pipeline (Periodization…MMI #9) — I/O + invariants + determinism | `07-engines.md` | 10% | 98% | YES |
| 08 | Data / state / persistence — stores, IndexedDB, Firebase sync, source-of-truth | `08-data.md` | 9% | 98% | YES |
| 09 | i18n completeness — EVERY user-facing string EN+RO, zero hardcode, zero diacritics | `09-i18n.md` | 7% | 100% | no |
| 10 | a11y — every screen WCAG AA, focus, aria, reduced-motion, keyboard | `10-a11y.md` | 6% | 95% | no |
| 11 | Mockup parity — every screen pixel/color/spacing/typography vs interfata-noua/ | `11-parity.md` | 8% | 90% | no |
| 12 | Security / auth / GDPR / privacy / secrets / route-guards | `12-security.md` | 8% | 100% | YES |
| 13 | PWA / offline / service-worker / install / update / cache | `13-pwa.md` | 4% | 95% | no |
| 14 | Performance / bundle / motion budget / cold-start / Maria-65 device | `14-perf.md` | 4% | 90% | no |
| 15 | Cross-cutting invariants — never-delete, medical disclaimer, kcal floor, etc. | `15-invariants.md` | 10% | 100% | YES |

Target total length ≥ 10,000 lines across the section files (Daniel directive —
exhaustive enumeration, diminishing returns accepted).

---

## PER-STEP FORMAT (every step in every section MUST use this block)

```
### [SECTION.STEP] <short title>
- **Check:** <the single concrete thing being verified, unambiguous>
- **Where:** <file:line / route / mockup ref — the exact locus>
- **Expected:** <the correct result, stated precisely>
- **Verify:** <exact command / playwright action / grep / computed value to RUN — reproducible>
- **Verdict:** ☐ PASS ☐ PARTIAL ☐ FAIL ☐ BLOCKED
- **Evidence:** <filled at audit time: output / screenshot path / file:line / value>
- **Notes:** <deviation detail if PARTIAL/FAIL; proposed fix>
```

---

## WORKED EXAMPLE (the pattern every authored step must match)

### [09.001] InstallPrompt heading is internationalized
- **Check:** The PWA install banner heading is rendered via `t()`, not a hardcoded literal.
- **Where:** `src/react/components/InstallPrompt.tsx:78`
- **Expected:** `{t('installPrompt.title')}` (or equivalent key); EN renders English, RO renders no-diacritics Romanian.
- **Verify:** `grep -nE "Instaleaza|Acces rapid" src/react/components/InstallPrompt.tsx` → MUST return zero hardcoded user-facing strings; and the i18n scanner test (`noHardcodedStrings.test.ts`) passes for this file.
- **Verdict:** ☐ PASS ☐ PARTIAL ☑ FAIL  *(as of 2026-05-29 — Daniel found this in smoke)*
- **Evidence:** `InstallPrompt.tsx:71,78,79,87` contain literal "Instaleaza Andura" / "Acces rapid din ecranul de start." / "Instaleaza" — not via `t()`.
- **Notes:** Fix: extract to `installPrompt.*` keys in en.json + ro.json. Root cause of the class: `i18nNoRoLeak` is a MANUAL coverage table; InstallPrompt was never added → leaked. Harness fix = auto-scan ALL files.

### [03.014] Body-fat estimate reacts to a profile weight change
- **Check:** Changing weight in the profile updates the body-fat % shown on Progress.
- **Where:** `src/react/components/Progres/BodyFatStrip.tsx:39` + the profile weight editor.
- **Expected:** bf% recomputes from the current weight the user just set.
- **Verify:** Playwright on seeded account → note bf% on Progress → change weight in Profile → return to Progress → bf% changed accordingly.
- **Verdict:** ☐ PASS ☐ PARTIAL ☑ FAIL  *(as of 2026-05-29 — Daniel found this in smoke)*
- **Evidence:** bf% reads `weightLog[last].kg ?? onboardingWeight`; editing profile weight does not touch `weightLog` → bf% unchanged. Split source-of-truth.
- **Notes:** Fix: unify the "current weight" source, or have the profile editor also append/update weightLog, + recompute. Behavior test in harness pins this.

---

(Section files 01–15 follow. Each authored to the per-step format above,
exhaustive — every screen, every component, every string, every state, every
engine path, every invariant — until the real surface area is covered.)
