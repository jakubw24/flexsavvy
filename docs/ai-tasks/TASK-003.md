# TASK-003 — Validate the fresh-start baseline

| Field | Value |
|---|---|
| Phase | 0 — Fresh start initialization |
| Parent milestone | Repository creation |
| Risk | low |
| Network policy | `none` |
| Dependencies | TASK-001, TASK-002 |
| Suggested commit | `task-003: validate-fresh-start-baseline` |

## Complete prompt

You are Qwen3.6-27B acting as an independent reviewer of the new FlexSavvy repository.

Execute **TASK-003 only**. Do not start another task.

### Objective

Confirm that the project is genuinely clean, internally consistent and ready for product documentation.

### Mandatory preparation

1. Read all root Markdown files and all files directly under `docs/`, excluding individual later task files except TASK-001 through TASK-003.
2. Confirm TASK-001 and TASK-002 are `DONE`.
3. Inspect the complete uncommitted diff and `git status --short`.
4. State a concise review plan.

### Required implementation

1. Verify there is no legacy source code, package manifest, lockfile, build output, private dataset or inherited Git history.
2. Verify all 114 task files exist and dependencies begin correctly from TASK-001.
3. Verify `AGENTS.md`, workflow, repository conventions, quality gates and external-data policy do not conflict.
4. Repair only:
   - broken links;
   - inconsistent terminology;
   - missing ignore rules;
   - task-index defects;
   - governance contradictions.
5. Create `docs/GREENFIELD_BASELINE.md` recording:
   - date;
   - branch;
   - starting file inventory;
   - absence of legacy code;
   - governance checks;
   - readiness for TASK-004.
6. Update progress and mark TASK-003 `DONE`.

### Explicitly out of scope

- Product specification.
- Application setup.
- Dependency installation.
- GitHub remote operations.
- Feature implementation.

### Required verification

```bash
git log --oneline --all
git branch --show-current
git status --short
find . -maxdepth 3 -type f | sort
git diff --check
```

Verify no non-task file points to an older repository or implementation matrix.

### Completion gate

Do not claim completion unless:

- the baseline is demonstrably fresh-start;
- governance files are consistent;
- all task references resolve;
- no product code exists;
- progress and index are updated;
- `git status --short` is reported.

### Response format

Report exactly:

1. **Files changed**
2. **Baseline checks**
3. **Defects repaired**
4. **Commands executed and actual results**
5. **Assumptions**
6. **Remaining risks**
7. **Suggested commit message**
8. **`git status --short`**

Do not commit or push.
