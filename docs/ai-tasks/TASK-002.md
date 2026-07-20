# TASK-002 — Establish project governance and source-of-truth structure

| Field | Value |
|---|---|
| Phase | 0 — Fresh start initialization |
| Parent milestone | Repository creation |
| Risk | low |
| Network policy | `none` |
| Dependencies | TASK-001 |
| Suggested commit | `task-002: establish-project-governance` |

## Complete prompt

You are Qwen3.6-27B acting as the senior engineer for the new FlexSavvy repository.

Execute **TASK-002 only**. Do not start another task.

### Objective

Create the durable governance structure that every later task must follow.

### Mandatory preparation

1. Read `AGENTS.md`, `docs/AI_WORKFLOW.md`, `docs/AI_TASK_INDEX.md`, `docs/PROGRESS.md`, `docs/DECISIONS.md` and this task.
2. Confirm TASK-001 is `DONE`.
3. Inspect `git status --short` and the current file tree.
4. Stop if application code or a package manifest exists; those belong to later tasks.
5. State a concise plan.

### Required implementation

1. Create `docs/REPOSITORY_CONVENTIONS.md` defining:
   - source, test, fixture, script and public-data locations;
   - naming conventions;
   - module boundaries;
   - dependency rules;
   - public versus private fixtures;
   - generated-file policy;
   - commit and task evidence policy.
2. Create `docs/QUALITY_GATES.md` defining future mandatory commands and the rule that gates may not be weakened to obtain a pass.
3. Create `docs/EXTERNAL_DATA_POLICY.md` defining:
   - offline tests;
   - fixture provenance;
   - allowed public APIs;
   - live-validation separation;
   - no customer credentials;
   - no private data in fixtures.
4. Add an initial decision record confirming:
   - fully static deployment;
   - browser-only smart-meter processing;
   - UTC internally and Europe/London for local schedules;
   - no accounts, database or upload API in the initial product.
5. Add links to these files from the root README.
6. Update progress and mark TASK-002 `DONE`.

### Explicitly out of scope

- Product feature definitions.
- Application source.
- Dependencies or package manager.
- CI configuration.
- External network access.

### Required verification

- All governance documents agree with `AGENTS.md`.
- No application directories are created.
- All Markdown links resolve.

### Commands that must be run

```bash
git status --short
find . -maxdepth 3 -type f | sort
git diff --check
```

Use a small local script to verify relative Markdown links where practical.

### Completion gate

Do not claim completion unless:

- the repository conventions and quality gates are explicit;
- the static/privacy/time-zone decisions are recorded;
- no application code was added;
- progress and index are updated;
- the final response includes `git status --short`.

### Response format

Report exactly:

1. **Files changed**
2. **Governance established**
3. **Verification performed**
4. **Commands executed and actual results**
5. **Assumptions**
6. **Remaining risks**
7. **Suggested commit message**
8. **`git status --short`**

Do not commit or push.
