# TASK-006 — Create calculation methodology

| Field | Value |
|---|---|
| Phase | 1 — Product documentation |
| Parent milestone | Milestone 1 |
| Risk | critical |
| Network policy | `none` |
| Dependencies | TASK-004, TASK-005 |
| Suggested commit | `task-006: create-calculation-methodology` |

## Complete prompt

You are Qwen3.6-27B acting as the senior engineer for the FlexSavvy repository.

Execute **TASK-006 only**. Do not start another task.

### Objective

Specify deterministic formulas and edge-case behaviour.

### Preparation

Before editing:

1. Read `AGENTS.md`, `docs/AI_WORKFLOW.md` and this task file.
2. Read the following task-specific sources:
   - `AGENTS.md`
   - `docs/AI_WORKFLOW.md`
   - `docs/AI_TASK_INDEX.md`
   - `docs/PROGRESS.md`
   - `docs/PRODUCT_SPEC.md`
   - `docs/DATA_SCHEMA.md`
   - `docs/METHODOLOGY.md`
3. Confirm all dependency tasks are marked `DONE`.
4. Inspect files created by dependency tasks, relevant tests, `git status --short` and the relevant portion of `git diff`.
5. Search the fresh FlexSavvy repository before creating duplicate symbols or modules.
6. Preserve correct outputs of completed dependency tasks; do not import code from an older repository.
7. State a concise implementation plan before editing.

### Required implementation

1. Create/update `docs/METHODOLOGY.md`
2. Define billing, standing charge, export, aggregation and rounding
3. Define savings decomposition
4. Define appliance candidate generation/scoring
5. Define EV energy, windows, allocation and unmet energy
6. Define battery state/action/transition/constraints/rolling horizon/terminal SOC
7. Define carbon and weighted scoring
8. Define missing data, annualisation and DST
9. Include worked billing, EV and battery examples

### Explicit exclusions

- Do not implement code
- Do not conceal assumptions

### Required verification

- Check every formula includes units
- Recalculate all worked examples independently

Expected values must be independently derived. Do not put the production formula on both sides of a test. Generated tests must use fixed seeds and print the failing seed.

### Network rule

The policy for this task is **`none`**.

- `none`: no external services.
- `packages`: package-registry access only when required.
- `fixture-only`: use committed typed fixtures; no live API calls.
- `limited-live`: only the public API named by this task may be contacted, in a separately labelled validation command; all automated tests remain offline.
- `github`: only the exact GitHub action explicitly requested by the user.

Do not browse unrelated websites. Do not install an unnecessary dependency.

### Commands that must be run

- `git diff --check`
- `git status --short`

If a command is missing because a dependency task is incomplete, stop and report the dependency mismatch. Never fabricate output or weaken a quality gate.

### Completion gate

Do not claim completion unless:

- the required behaviour is implemented or verified;
- the required tests pass;
- the final diff is limited to this task;
- sensitive data and private fixtures were not introduced;
- `docs/PROGRESS.md` records actual command results, assumptions and remaining risks;
- the TASK-006 row in `docs/AI_TASK_INDEX.md` is changed from `TODO` to `DONE`;
- the final response includes `git status --short`.

### Response format

Report exactly:

1. **Files changed**
2. **Behaviour implemented or verified**
3. **Tests added or changed**
4. **Commands executed and actual results**
5. **Assumptions**
6. **Remaining risks**
7. **Suggested commit message**
8. **`git status --short`**

Do not commit, push, merge or open a pull request unless explicitly instructed.
