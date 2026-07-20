# Project Baseline — FlexSavvy

| Field | Value |
|---|---|
| Date | 2026-07-20 |
| Branch | `main` |
| Commit at validation | `193a2eb task-002: establish-project-governance` |
| Validated by | TASK-003 review |

## Starting File Inventory

### Root files (4)

| File | Purpose |
|------|---------|
| `AGENTS.md` | Permanent AI engineering rules |
| `README.md` | Project overview and governance links |
| `MANUAL_ACTIONS.md` | Decision gates reserved for human action |
| `.gitignore` | Git ignore rules (node_modules, dist, private-data, etc.) |

### Documentation files (9)

| File | Purpose |
|------|---------|
| `docs/AI_TASK_INDEX.md` | Master task list (114 tasks) with status |
| `docs/AI_WORKFLOW.md` | Task execution workflow and verification cycle |
| `docs/PROGRESS.md` | Progress tracker with command evidence |
| `docs/DECISIONS.md` | Architectural decision records (ADR-001 through ADR-004) |
| `docs/IMPLEMENTATION_PLAN.md` | High-level implementation plan |
| `docs/REPOSITORY_CONVENTIONS.md` | Source layout, naming, module boundaries, commit policy |
| `docs/QUALITY_GATES.md` | Mandatory verification commands per task |
| `docs/EXTERNAL_DATA_POLICY.md` | Offline testing, fixture provenance, and API rules |

### Task files (114)

All 114 task files present: `docs/ai-tasks/TASK-001.md` through `docs/ai-tasks/TASK-114.md`.

### Private data (1)

| File | Purpose |
|------|---------|
| `private-data/README.md` | Placeholder; real data excluded via `.gitignore` |

**Total tracked files: 128** (4 root + 9 docs + 114 tasks + 1 private-data)

## Defects Repaired

One minor repair applied to `docs/PROGRESS.md` line 97: the recorded Python regex for the Markdown link checker contained over-escaped backslashes (`\\]\\(` instead of `\]\(`). Corrected to the functional pattern so the evidence matches what was actually executed.

All other checks passed: links resolve, terminology is consistent, .gitignore rules are complete, task index entries match files on disk, and governance documents contain no contradictions.

## Absence of Legacy Code

The following were verified to be **absent**:

- No `src/` directory
- No `__tests__/` directory
- No `node_modules/` directory
- No `dist/` or `.astro/` build output
- No `public/` directory
- No `package.json`, `package-lock.json`, `pnpm-lock.yaml`, or `yarn.lock`
- No `tsconfig.json`
- No inherited Git history from a previous repository (Git log contains only two commits: task-001 and task-002)

## Governance Checks

### Cross-file consistency

All governance documents are internally consistent. Five key assertions verified across files:

| Assertion | AGENTS.md | DECISIONS.md | REPOSITORY_CONVENTIONS.md | QUALITY_GATES.md | EXTERNAL_DATA_POLICY.md | IMPLEMENTATION_PLAN.md |
|---|---|---|---|---|---|---|
| Fully static, no server runtime | ✓ | ✓ | — | — | — | ✓ |
| No database / no accounts | ✓ | ✓ | — | — | — | — |
| Browser-only smart-meter data | ✓ | ✓ | ✓ | — | — | ✓ |
| UTC internally, Europe/London locally | ✓ | ✓ | — | — | — | ✓ |
| Tests offline / fixtures only | — | — | ✓ | ✓ | ✓ | ✓ |

No contradictions found. Assertions are distributed across files as expected: AGENTS.md and DECISIONS.md carry the primary architectural assertions; operational rules (REPOSITORY_CONVENTIONS, QUALITY_GATES, EXTERNAL_DATA_POLICY) enforce them procedurally.

### Markdown link integrity

All relative Markdown links across every `.md` file resolve to existing paths. No broken internal links found.

### Task index completeness

- 114 tasks listed in `docs/AI_TASK_INDEX.md`
- 114 task files exist on disk: TASK-001 through TASK-114
- TASK-001 status: DONE (commit `59e100c`)
- TASK-002 status: DONE (commit `193a2eb`)
- TASK-003 through TASK-114 status: TODO
- All dependency chains reference earlier tasks only

### Git history

| Commit | Hash | Message |
|--------|------|---------|
| 1 | `59e100c` | task-001: initialize-fresh-start-repository |
| 2 | `193a2eb` | task-002: establish-project-governance |

No remote references to an older FlexSavvy repository. Branch: `main`.

### Working tree state at validation

Clean. No uncommitted changes (`git status --short` produces no output).

## Readiness for TASK-004

The baseline is verified as fresh-start. Governance files are consistent. All task references resolve. No product code exists. TASK-004 (Create product specification) may proceed.
