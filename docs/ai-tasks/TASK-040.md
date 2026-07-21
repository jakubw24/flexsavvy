# TASK-040 — Implement interval billing and standing charges

| Field | Value |
|---|---|
| Phase | 6 — Tariffs and billing |
| Parent milestone | Milestone 9 |
| Risk | critical |
| Network policy | `none` |
| Dependencies | TASK-033, TASK-035, TASK-036, TASK-037, TASK-038 |
| Suggested commit | `task-040: implement-interval-billing-and-standing-charges` |

## Complete prompt

You are Qwen3.6-27B acting as the senior engineer for the FlexSavvy repository.

Execute **TASK-040 only**. Do not start another task.

### Objective

Produce exact interval records and apply one standing charge per distinct Europe/London calendar date from the earliest interval's local date through the latest interval's local date inclusive. Every date within that span receives exactly one standing charge, regardless of whether consumption data exists for that date.

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
   - `docs/PRIVACY_DESIGN.md`
   - `docs/TRACEABILITY.md`
3. Confirm all dependency tasks are marked `DONE`.
4. Inspect files created by dependency tasks, relevant tests, `git status --short` and the relevant portion of `git diff`.
5. Search the fresh FlexSavvy repository before creating duplicate symbols or modules.
6. Preserve correct outputs of completed dependency tasks; do not import code from an older repository.
7. State a concise implementation plan before editing.

### Required implementation

1. Resolve import/export rates per interval
2. Calculate cost/income without display rounding
3. Retain energy, rates, components and source IDs
4. Apply one standing charge per distinct Europe/London calendar date spanning from the earliest interval's local date through the latest interval's local date inclusive; every date within that span receives exactly one charge regardless of whether consumption observations exist for that date
5. Return structured warnings

### Explicit exclusions

- Do not aggregate monthly
- Do not decompose savings

### Required verification

- Manual normal, spring, autumn, export and negative-price examples

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

- `npm run typecheck`
- `npm run test`
- `npm run build`
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
- the TASK-040 row in `docs/AI_TASK_INDEX.md` is changed from `TODO` to `DONE`;
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
