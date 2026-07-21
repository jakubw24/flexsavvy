# TASK-005 — Create canonical data schema

| Field | Value |
|---|---|
| Phase | 1 — Product documentation |
| Parent milestone | Milestone 1 |
| Risk | critical |
| Network policy | `none` |
| Dependencies | TASK-004 |
| Suggested commit | `task-005: create-canonical-data-schema` |

## Complete prompt

You are Qwen3.6-27B acting as the senior engineer for the FlexSavvy repository.

Execute **TASK-005 only**. Do not start another task.

### Objective

Define canonical inputs, outputs, units and runtime constraints.

### Preparation

Before editing:

1. Read `AGENTS.md`, `docs/AI_WORKFLOW.md` and this task file.
2. Read the following task-specific sources:
   - `AGENTS.md`
   - `docs/AI_WORKFLOW.md`
   - `docs/AI_TASK_INDEX.md`
   - `docs/PROGRESS.md`
   - `docs/PRODUCT_SPEC.md`
   - `docs/DATA_SCHEMA.md` **if it exists**; otherwise confirm that its absence is expected (TASK-005 creates it) and do not treat the missing file as an incomplete dependency.
3. Confirm all dependency tasks are marked `DONE`.
4. Inspect files created by dependency tasks, relevant tests, `git status --short` and the relevant portion of `git diff`.
5. Search the fresh FlexSavvy repository before creating duplicate symbols or modules.
6. Preserve correct outputs of completed dependency tasks; do not import code from an older repository.
7. State a concise implementation plan before editing.

### Required implementation

1. Create/update `docs/DATA_SCHEMA.md`
2. Define consumption, quality, tariffs, pricing variants, appliances, EV, battery, carbon, scenarios, warnings and results
3. Specify UTC and Europe/London derived fields
4. Specify 30-minute start-inclusive/end-exclusive intervals
5. Specify kWh and VAT-inclusive pence units
6. Define nullable/required fields and schema versioning
7. Include valid and invalid examples
8. Map outputs to required source fields

### Explicit exclusions

- Do not implement TypeScript schemas
- Do not invent API fields

### Required verification

- Validate JSON examples parse
- Create cross-reference table for units and fields

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

- `git status --short`
- `find . -maxdepth 3 -type f | sort`
- `git diff --check`
- Run the repository's Markdown relative-link verification command as defined in [`docs/QUALITY_GATES.md`](../QUALITY_GATES.md) (required for all documentation-only tasks)

The following commands must **not** be included because no application project exists yet:
- No `npx tsc --noEmit`, `npm run typecheck`, or TypeScript commands.
- No `npx vitest run`, `npm run test`, or test runner commands.
- No `npx astro check` or build commands.
- No package installation, build output, or schema-compilation steps.

If a command is missing because a dependency task is incomplete, stop and report the dependency mismatch. Never fabricate output or weaken a quality gate.

### Completion gate

Do not claim completion unless:

- the required behaviour is implemented or verified;
- the required tests pass;
- the final diff is limited to this task;
- sensitive data and private fixtures were not introduced;
- `docs/PROGRESS.md` records actual command results, assumptions and remaining risks;
- the TASK-005 row in `docs/AI_TASK_INDEX.md` is changed from `TODO` to `DONE`;
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
