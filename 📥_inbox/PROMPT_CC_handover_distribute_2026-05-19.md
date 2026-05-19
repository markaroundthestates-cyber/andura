# PROMPT_CC handover distribute 2026-05-19 — Track 7 setup complete + CI iter 7 debug

**Trigger:** Daniel mâine BIROU `claude rc` connect la CC session acasă, §CC.2 startup citește HANDOVER + acest PROMPT_CC.

## Acțiuni distribute (atomic commits + push)

### 1. DECISIONS.md append D035 + D036 + D037 (D033 + D034 deja în iter 7 batch)

```markdown
| D035 | 2026-05-19 | PROC | Branch protection main bypass admin "Always" config solo dev pre-Beta — rules păstrate force push block + deletion restrict + linear history pentru safety. Strict PR-only mode post-Beta când multiple contributors / real users / audit trail mandatory | LOCKED V1 | DECISIONS.md §D035 |
| D036 | 2026-05-19 | TECH | Track 7 §7.6 deploy.yml de-skeleton + ratchet thresholds + wire activated workflows LANDED `bda24bc` (real implementation post Daniel push-back chore-claim halucinare). Hard gates Bundle size + Lighthouse perf + Snyk vuln. Ratchet pe real `npm run build` measurements (size +13-34% margin) + Lighthouse 0.60 first-baseline realistic (Daniel ratchets UP în PR review post real measurement) | LOCKED V1 | DECISIONS.md §D036 + .github/workflows/ci.yml + deploy.yml + track-7-nightly.yml |
| D037 | 2026-05-19 | COST | Browserbase Developer $20/mo paid Option A full §7.8 activate confirmed (Daniel decision against Co-CTO recommendation defer save cost). §7.8 Stagehand exploration nightly OPERATIONAL pe `bb_live_*` cu 25 concurrent browsers + 100 browser hours/lună budget. Anthropic API $20 EUR credits separate (NU Max x20 plan-based — cloud Stagehand needs separate API key per Anthropic billing model) | LOCKED V1 | DECISIONS.md §D037 |
```

### 2. ANDURA_PRIMER.md §5 + §6 refresh

§5 Current State update:
- Track 7 Automated Testing 9.5/10 LANDED (95%) — §9 + §7.1-§7.9 + §7.6 REAL activation LANDED `bda24bc` (de-skeleton + ratchet + wire) + verify workflow GREEN iter 4
- §7.10 mobile manual smoke Daniel = ultim 5-10%
- CI iter 7 debug în progres (HUSKY=0 + 10 unused-vars src/ + FORCE_NODE24 env)
- 9/9 GitHub Secrets uploaded + verified
- Branch protection "main protection" Active cu bypass admin Always

§6 Backlog refresh:
- IMMEDIATE: CI iter 7 GREEN gate → §7.10 mobile smoke → final tag `track-7-automated-testing-landed-2026-05-20`
- SHORT-TERM: Visual regression baselines first CI run --update-snapshots + commit (D.5)
- POST-Track-7: Phase 8 §7.10 PASS → Beta launch gate. CEO wording review window pre-Beta (D024). Firestore rules parity B.2. Real Firebase API key implementation D.2 (public-safe + restrict referrer).

### 3. Archive post-consume

- `📥_inbox/HANDOVER_2026-05-19_track-7-setup-complete-ci-debug.md` → `📥_inbox/_CONSUMED/`
- `📥_inbox/PROMPT_CC_handover_distribute_2026-05-19.md` (acest fișier) → `📥_inbox/_CONSUMED/`

### 4. Verify CI iter 7 results post overnight rulare

- `gh run list --workflow=ci.yml --limit 3` → identify latest run
- `gh run view <RUN_ID>` → check Validate + Deploy + Checkly + Lighthouse statuses
- If ALL GREEN → continue §7.10 mobile smoke prep (Daniel manual device)
- If FAIL → diagnose iter 8 + atomic commit fix + push

### 5. Atomic commit `chore(handover): consume 2026-05-19 + DECISIONS D035-D037 + PRIMER §5/§6 refresh` + push origin main bypass admin

Stop trigger UNIC Daniel STOP. Opus 4.7. Skills per §2 wrapper.
