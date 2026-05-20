# PROMPT_CC iter 8 — Track 7 CI debug continuare

**Model:** Opus 4.7 EXCLUSIVELY (anti-fallback policy NEVER downgrade)
**CC startup:** `claude --dangerously-skip-permissions`
**Procedure:** D031/D032 LOCKED V1 — continuous neîntrerupt atomic Bugatti commits per fix
**Stop trigger UNIC:** Daniel STOP explicit
**Push:** origin main bypass admin "Always" (D035) final după toate 3 fix-uri LANDED + verify workflow GREEN

---

## CI iter 7 verdict (run `1abf029`)

### ✅ Progress real

- `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true` env global funcționat — Node 20 deprecated warnings acum "forced to Node 24 SUCCESS" (informational only, NU blocking)
- Hint: `peaceiris/actions-gh-pages@v4` + `actions/upload-artifact@v5` ambele forced Node 24 OK

### ❌ Remaining fail 3 issues (iter 8 fix atomic)

---

## FIX 1 — `track-7-nightly.yml:57` secrets context antipattern

**Same root cause iter 1** care a fixat `ci.yml` + `verify-track-7-setup.yml`. CC a ratat propagation la `track-7-nightly.yml`.

Eroare exactă:
```
Invalid workflow file: .github/workflows/track-7-nightly.yml#L1
(Line: 57, Col: 9): Unrecognized named-value: 'secrets'.
Located at position 1 within expression:
secrets.BROWSERBASE_API_KEY != '' && secrets.ANTHROPIC_API_KEY != ''
```

**Fix pattern (apply same iter 1 solution):**

`secrets.X` context NU available în `if:` expression la job level. Move check la step-level via `env:` propagation + shell `[[ -n "$VAR" ]]` test.

ÎNAINTE (broken):
```yaml
stagehand-exploration:
  if: secrets.BROWSERBASE_API_KEY != '' && secrets.ANTHROPIC_API_KEY != ''
  steps:
    - run: node scripts/nightly-exploration.mjs
      env:
        BROWSERBASE_API_KEY: ${{ secrets.BROWSERBASE_API_KEY }}
        ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

DUPĂ (fix):
```yaml
stagehand-exploration:
  # NO if at job level — guard în step shell
  steps:
    - name: Check secrets present
      id: secrets_check
      env:
        BROWSERBASE_API_KEY: ${{ secrets.BROWSERBASE_API_KEY }}
        ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
      run: |
        if [[ -n "$BROWSERBASE_API_KEY" && -n "$ANTHROPIC_API_KEY" ]]; then
          echo "ready=true" >> "$GITHUB_OUTPUT"
        else
          echo "ready=false" >> "$GITHUB_OUTPUT"
          echo "::notice::Stagehand secrets absent — skipping nightly exploration"
        fi
    - name: Run Stagehand exploration
      if: steps.secrets_check.outputs.ready == 'true'
      env:
        BROWSERBASE_API_KEY: ${{ secrets.BROWSERBASE_API_KEY }}
        ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
      run: node scripts/nightly-exploration.mjs
```

Verify pattern identic existing fix în `ci.yml` (iter 1 commit) + `verify-track-7-setup.yml` pentru consistency.

**Commit message:**
```
fix(ci-§7.6-iter-8): track-7-nightly.yml secrets context shell-only env+run pattern (propagate iter 1 fix ratat)
```

---

## FIX 2 — 10 unused-vars cleanup src/engine/

Test files = `_` prefix safe (zero risk).
NON-test files (4 surse) = AUDIT atent înainte: dead code real → delete commit separat, sau guard intenționat unused → `_` prefix.

### Test files (6) — `_` prefix safe

| File | Line | Symbol | Action |
|------|------|--------|--------|
| `src/engine/deload/tests/index.test.js` | 5 | `TRIGGER_SOURCE` | `_TRIGGER_SOURCE` |
| `src/engine/deload/tests/depthCalculator.test.js` | 10 | `GOAL_PHASE` | `_GOAL_PHASE` |
| `src/engine/bayesianNutrition/tests/volumeLandmarks.test.js` | 13 | `VOLUME_METRIC_WEIGHTS` | `_VOLUME_METRIC_WEIGHTS` |
| `src/engine/bayesianNutrition/tests/index.test.js` | 3 | `CALIBRATION_TIERS` | `_CALIBRATION_TIERS` |
| `src/engine/__tests__/ruleEngine.test.js` | 2 | `RULES` | `_RULES` |
| `src/engine/__tests__/profileTyping.test.js` | 24 | `scenarioVolumeCreep` | `_scenarioVolumeCreep` |

### NON-test files (4) — AUDIT atent

| File | Line | Symbol | Audit guidance |
|------|------|--------|-----------------|
| `src/engine/decisionCluster.js` | 182 | `rest` | Likely `const { used, ...rest } = obj` destructure leftover. Verify zero downstream use → DELETE destructure OR `_rest` |
| `src/engine/coachDirector.js` | 246 | `e` | Caught error în try/catch. Best practice: `_e` prefix (preserve catch semantic, signal intentional) |
| `src/engine/bayesianNutrition/index.js` | 58 | `CALIBRATION_TIERS` | NON-test import. Verify zero use în file → DELETE import OR `_CALIBRATION_TIERS` if future-use planned |
| `src/engine/aa.js` | 3 | `COMPOUND_EX` | NON-test import. Verify zero use în file → DELETE import OR `_COMPOUND_EX` |

**Decision rule NON-test:** dacă truly dead (zero referențe în file + în src/) → DELETE clean. Dacă există referențe comentate sau intent forward-use clar → `_` prefix.

**Pre-commit verify:**
```bash
npm run lint   # expect 0 warnings unused-vars
npm test       # expect 4547 PASS preserved (NU 4546)
npm run build  # expect clean Vite output
```

**Commit message:**
```
fix(src/engine-iter-8): 10 unused-vars cleanup — 6 test files _ prefix + 4 NON-test audit dead-code
```

---

## FIX 3 — git 128 REAL diagnostic + alternative npm install

`HUSKY=0` hypothesis WRONG sau incomplete. Toate 4 jobs fail cu `/usr/bin/git exit 128` consistent:
- validate (typecheck + unit + build)
- deploy
- checkly-deploy
- lighthouse-live

### Step A — Add diagnostic step ÎNAINTE de npm install

În `ci.yml` validate job + `deploy.yml` (3 jobs):

```yaml
- name: Diagnostic git/env state
  run: |
    echo "=== which git ==="
    which git
    echo "=== git --version ==="
    git --version
    echo "=== env grep ==="
    env | sort | grep -iE 'git|husky|node|npm|ci=' || true
    echo "=== .npmrc presence ==="
    cat .npmrc 2>/dev/null || echo "no .npmrc"
    echo "=== package.json prepare/postinstall scripts ==="
    cat package.json | grep -A2 -E '"(prepare|postinstall|preinstall)"' || echo "no lifecycle scripts"
    echo "=== package-lock.json head ==="
    head -20 package-lock.json
    echo "=== git config in workspace ==="
    git config --list 2>&1 | head -20 || echo "git config failed"
    echo "=== /tmp permissions ==="
    ls -la /tmp 2>&1 | head -5 || true
```

### Step B — Try alternative install pattern (diagnostic)

Înlocuiește `npm ci --ignore-scripts` cu:
```yaml
- name: Install dependencies (alternative diagnostic)
  env:
    HUSKY: '0'
    CI: 'true'
  run: |
    rm -rf node_modules/.package-lock.json
    npm install --no-audit --no-fund --prefer-offline --no-save
```

Rationale: `npm ci` strict lockfile + clean install. `npm install --no-save` mai permisiv, surface dacă lockfile însuși = source problem.

### Step C — Check `actions/setup-node@v5` cache config

`setup-node` cu `cache: 'npm'` rulează `git` sub the hood pentru cache key. Dacă git binary inaccessible sau workspace permission issue → exit 128.

Try temporary disable cache pentru diagnostic:
```yaml
- uses: actions/setup-node@v5
  with:
    node-version: 24
    # cache: 'npm'  # COMMENTED diagnostic
```

Dacă git 128 dispare cu cache off → cache config issue confirmed. Re-enable cu manual `cache-dependency-path: package-lock.json` explicit.

### Step D — Verify peaceiris/actions-gh-pages@v4 git ops

Deploy job + checkly-deploy + lighthouse-live ALL 3 fail post-build. Probabil `peaceiris/actions-gh-pages@v4` step git checkout/push fail.

Check workflow:
- `permissions: contents: write` la job level (required peaceiris push)
- `with: github_token: ${{ secrets.GITHUB_TOKEN }}` explicit
- `with: publish_branch: gh-pages` default OK?

**Commit message:**
```
fix(ci-§7.6-iter-8): git 128 REAL diagnostic step + alternative npm install pattern + setup-node cache audit
```

---

## Verify post-fix sequence

1. Local pre-commit hook GREEN gate ALL 3 commits (`npm run lint` + `npm test` + `npm run build`)
2. Push origin main bypass admin (D035) după ALL 3 LANDED atomic
3. Check Actions UI iter 8 run — expected GREEN ALL jobs:
   - validate (typecheck + unit + build) ✅
   - e2e-smoke ✅
   - lighthouse ✅
   - deploy ✅
   - checkly-deploy ✅
   - lighthouse-live ✅
   - track-7-nightly (validation only push) ✅
4. Write report `📤_outbox/LATEST.md` append `## §7.6 iter 8 LANDED` cu:
   - 3 commits SHA atomic
   - CI verdict screenshot/summary
   - Production readiness % estimate refresh
   - Next P1 = §7.10 Daniel mobile manual smoke

---

## Stop conditions

- ✅ Continue autonom pe toate 3 fix-uri atomice + verify GREEN
- ❌ STOP dacă FIX 2 NON-test files (`decisionCluster.js`/`coachDirector.js`/`bayesianNutrition/index.js`/`aa.js`) audit reveal dead code semnificativ > 20 LOC → escalate Daniel decision delete vs preserve
- ❌ STOP dacă FIX 3 git 128 persist după toate 4 sub-fix-uri → diagnostic output dump în LATEST.md + Daniel review ROOT CAUSE next chat

---

## Anti-recurrence enforce

- D023: vault writes `filesystem:write_file` only, ZERO `create_file` pe emoji paths
- D030: ZERO modification `.obsidian/` files, autoSave=0 preserved
- f40ebbc Stop hook anti-recurrence: push origin = act conștient final, NU per-commit auto
- Per FIX commit: pre-commit hook GREEN mandatory, ZERO `--no-verify` bypass

🦫 Bugatti craft. Iter 8 atomic. Opus 4.7 exclusively.
