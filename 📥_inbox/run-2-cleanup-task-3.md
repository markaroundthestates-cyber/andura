# TASK 3 — Archive Capacity A LOCKED + HANDOVER_GLOBAL_SPLIT_PLAN

**Model:** 🔴 OPUS
**Order:** 3/8
**Dependencies:** Task 2 complete (0 residual `[[HANDOVER_MISC|HANDOVER_VAULT_HYGIENE]]` în active vault)
**Scope:** `git mv` 3 files → `📤_outbox/_archive/2026-05/<NN>_*_DEPRECATED.md` chronological NN per VAULT_RULES §3.3.
**Estimate:** ~10-15 min CC
**Risk:** ordering wrong if Task 2 incomplete → pre-flight re-grep mandatory fail-stop

═══════════════════════════════════════════════════════════════════
                  PRE-FLIGHT (re-verify Task 2 complete)
═══════════════════════════════════════════════════════════════════

```bash
# 1. Re-grep CRITICAL — verify Task 2 truly complete (zero active inbound)
RESIDUAL=$(grep -rEn '\[\[(HANDOVER_MISC|HANDOVER_VAULT_HYGIENE)_2026-04-30_evening' \
  --include="*.md" \
  --exclude-dir=_archive \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  . | wc -l)

test "$RESIDUAL" = "0" || {
  echo "FAIL: $RESIDUAL residual inbound — Task 2 INCOMPLETE, NU pot archive"
  exit 1
}
echo "✅ Task 2 verified complete — 0 residual inbound active"

# 2. Verify HANDOVER_GLOBAL_SPLIT_PLAN inbound = 0 (audit confirmed)
SPLIT_PLAN_INBOUND=$(grep -rEn '\[\[HANDOVER_GLOBAL_SPLIT_PLAN' \
  --include="*.md" \
  --exclude-dir=_archive \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  . | wc -l)
test "$SPLIT_PLAN_INBOUND" -le 1 || {
  echo "WARN: $SPLIT_PLAN_INBOUND inbound for SPLIT_PLAN (audit said 0). Review:"
  grep -rEn '\[\[HANDOVER_GLOBAL_SPLIT_PLAN' --include="*.md" --exclude-dir=_archive .
}

# 3. Verify 3 source files exist
test -f "06-sessions-log/HANDOVER_GLOBAL_SPLIT_PLAN_2026-05-05.md" || \
  { echo "FAIL: SPLIT_PLAN missing"; exit 1; }
test -f "06-sessions-log/HANDOVER_VAULT_HYGIENE_2026-04-30_evening.md" || \
  { echo "FAIL: HANDOVER_VAULT_HYGIENE missing"; exit 1; }
test -f "06-sessions-log/HANDOVER_MISC_2026-04-30_evening.md" || \
  { echo "FAIL: HANDOVER_MISC missing"; exit 1; }
echo "✅ All 3 archive sources exist"

# 4. Determine NEXT_NN per VAULT_RULES §3.3 chronological continuous (NU FIFO, NU monthly reset)
# Reusable formula din PROMPT_CC_HYGIENE.md §3.1
NEXT_NN=$(find "📤_outbox/_archive/" -name "*.md" -type f | \
  grep -oE '/[0-9]+_' | grep -oE '[0-9]+' | sort -n | tail -1 | \
  awk '{printf "%03d", $1+1}')

# Sanity check NEXT_NN reasonable (audit said 215 files în 2026-05/; expect NN ≥ 211)
NN_INT=$((10#$NEXT_NN))
[ "$NN_INT" -ge 200 ] && [ "$NN_INT" -le 300 ] || {
  echo "WARN: NEXT_NN=$NEXT_NN outside expected range 200-300. Review NN detection."
}
echo "✅ NEXT_NN determined: $NEXT_NN"

NN1=$NEXT_NN
NN2=$(printf "%03d" $((NN_INT + 1)))
NN3=$(printf "%03d" $((NN_INT + 2)))
echo "Archive sequence: $NN1, $NN2, $NN3"
```

═══════════════════════════════════════════════════════════════════
                  EXECUTION (3 git mv sequential)
═══════════════════════════════════════════════════════════════════

```bash
# Archive 1 — HANDOVER_GLOBAL_SPLIT_PLAN (Batch 1 zero-dependency)
git mv "06-sessions-log/HANDOVER_GLOBAL_SPLIT_PLAN_2026-05-05.md" \
       "📤_outbox/_archive/2026-05/${NN1}_HANDOVER_GLOBAL_SPLIT_PLAN_2026-05-05_DEPRECATED.md"

# Archive 2 — HANDOVER_VAULT_HYGIENE (Capacity A LOCKED)
git mv "06-sessions-log/HANDOVER_VAULT_HYGIENE_2026-04-30_evening.md" \
       "📤_outbox/_archive/2026-05/${NN2}_HANDOVER_VAULT_HYGIENE_2026-04-30_evening_CAPACITY_A_DEPRECATED.md"

# Archive 3 — HANDOVER_MISC (Capacity A LOCKED, large file)
git mv "06-sessions-log/HANDOVER_MISC_2026-04-30_evening.md" \
       "📤_outbox/_archive/2026-05/${NN3}_HANDOVER_MISC_2026-04-30_evening_CAPACITY_A_DEPRECATED.md"
```

═══════════════════════════════════════════════════════════════════
                  VERIFY POST
═══════════════════════════════════════════════════════════════════

```bash
# 1. Sources NU mai există în 06-sessions-log/
test ! -f "06-sessions-log/HANDOVER_GLOBAL_SPLIT_PLAN_2026-05-05.md" || \
  { echo "FAIL: SPLIT_PLAN still exists"; exit 1; }
test ! -f "06-sessions-log/HANDOVER_VAULT_HYGIENE_2026-04-30_evening.md" || \
  { echo "FAIL: VAULT_HYGIENE still exists"; exit 1; }
test ! -f "06-sessions-log/HANDOVER_MISC_2026-04-30_evening.md" || \
  { echo "FAIL: MISC still exists"; exit 1; }
echo "✅ All 3 sources archived (removed from 06-sessions-log/)"

# 2. Destinations exist în archive
test -f "📤_outbox/_archive/2026-05/${NN1}_HANDOVER_GLOBAL_SPLIT_PLAN_2026-05-05_DEPRECATED.md" || \
  { echo "FAIL: archive ${NN1} missing"; exit 1; }
test -f "📤_outbox/_archive/2026-05/${NN2}_HANDOVER_VAULT_HYGIENE_2026-04-30_evening_CAPACITY_A_DEPRECATED.md" || \
  { echo "FAIL: archive ${NN2} missing"; exit 1; }
test -f "📤_outbox/_archive/2026-05/${NN3}_HANDOVER_MISC_2026-04-30_evening_CAPACITY_A_DEPRECATED.md" || \
  { echo "FAIL: archive ${NN3} missing"; exit 1; }
echo "✅ All 3 destinations exist în archive"

# 3. 06-sessions-log/ count -3 (post-archive)
SESSIONS_COUNT=$(ls 06-sessions-log/HANDOVER*.md 2>/dev/null | wc -l)
echo "06-sessions-log/ HANDOVER count: $SESSIONS_COUNT (audit pre-cleanup: 9 → expected post: 6)"

# 4. Final residual check (paranoid)
RESIDUAL_FINAL=$(grep -rEn '\[\[(HANDOVER_MISC|HANDOVER_VAULT_HYGIENE|HANDOVER_GLOBAL_SPLIT_PLAN)_202' \
  --include="*.md" \
  --exclude-dir=_archive \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  . | wc -l)
test "$RESIDUAL_FINAL" = "0" || {
  echo "FAIL: $RESIDUAL_FINAL residual inbound POST archive — REDIRECT incomplete"
  exit 1
}
echo "✅ ZERO residual inbound active vault — Task 3 complete"
```

═══════════════════════════════════════════════════════════════════
                  COMMIT
═══════════════════════════════════════════════════════════════════

```bash
git commit -m "feat(vault-cleanup): Capacity A LOCKED archive + HANDOVER_GLOBAL_SPLIT_PLAN deprecated (Task 3)

Archive 3 files chronological NN ${NN1}+${NN2}+${NN3} per VAULT_RULES §3.3:

- ${NN1}_HANDOVER_GLOBAL_SPLIT_PLAN_2026-05-05_DEPRECATED.md (171 LOC, 0 inbound, plan executed)
- ${NN2}_HANDOVER_VAULT_HYGIENE_2026-04-30_evening_CAPACITY_A_DEPRECATED.md (127 LOC, content covered VAULT_RULES §VAULT_HYGIENE_PASS + §HANDOVER_PROTOCOL step 9 amendment)
- ${NN3}_HANDOVER_MISC_2026-04-30_evening_CAPACITY_A_DEPRECATED.md (5716 LOC, content covered ADR 026 §9.X canonical post-pipeline + 4 unique sections preserved standalone Task 1 split)

Pre-archive REDIRECT 12 inbound complete (Task 2). Verify post: 0 residual matches active vault.

Cumulative LOCKED V1 ~659 PRESERVED unchanged (vault hygiene meta-tooling NU product/architecture additive).
Tests baseline 2648 PASS preserved (doc-only ZERO src ZERO regression possible).

Cross-refs: audit-vault-2026-05-07.md Phase D Batch 1+3 + CURRENT_STATE chat-NEW3 Capacity A LOCKED."
```

═══════════════════════════════════════════════════════════════════
                  ROLLBACK
═══════════════════════════════════════════════════════════════════

```bash
git reset --hard HEAD^  # revert archive commit
# Files restored la 06-sessions-log/ via git mv revert
echo "Task 3 reverted — 3 files restored la 06-sessions-log/"
```
