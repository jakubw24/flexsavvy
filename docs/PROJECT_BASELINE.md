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

### Documentation files (8)

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

**Total tracked files at validation: 127** (4 root + 8 docs + 114 tasks + 1 private-data)

After TASK-003 created this file (`docs/PROJECT_BASELINE.md`), the repository contained **128 tracked files**.

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

---

## Retrospective Audit Amendment

**Date of amendment:** 2026-07-20
**Triggered by:** Post-baseline review of repository consistency against `AGENTS.md` and `docs/REPOSITORY_CONVENTIONS.md`

A later review identified documentation errors in the original Task 003 baseline that were not visible during the initial fresh-start validation. These are recorded here without altering the historical command evidence below.

### Findings and corrections

1. **Lockfiles ignored despite policy requiring them to be committed.**

   `.gitignore` listed `package-lock.json`, `yarn.lock`, and `pnpm-lock.yaml` as ignored, even though `docs/REPOSITORY_CONVENTIONS.md` (§Generated-File Policy) states: *"Lock files (`package-lock.json`, `pnpm-lock.yaml`) are committed to ensure reproducible builds."*

   **Corrected:** These lines were removed from `.gitignore`.

2. **`.astro/` missing from generated-output ignore rules.**

   Only `dist/` was listed under the Astro output section, but `docs/REPOSITORY_CONVENTIONS.md` states: *"Build output (`dist/`, `.astro/`) is never committed."*

   **Corrected:** `.astro/` was added beside `dist/` in `.gitignore`.

3. **Fixture-location wording in `private-data/README.md` inconsistent with canonical root directory.**

   The file stated: *"Test fixtures belong in `src/fixtures/` or equivalent committed locations."* This contradicted both `docs/REPOSITORY_CONVENTIONS.md` (§Source Layout, which shows `fixtures/` at repository root) and `docs/EXTERNAL_DATA_POLICY.md` (which states integration tests use fixture files under `fixtures/`).

   **Corrected:** The wording was changed to reference only `` `fixtures/` ``.

4. **Original claim of complete ignore rules and no contradictions was too strong.**

   The "Defects Repaired" section stated: *".gitignore rules are complete... governance documents contain no contradictions."* This was inaccurate in light of findings 1 and 2 above. The corrected `.gitignore` now aligns with policy.

5. **Product specification issues from Task 004 handled separately.**

   Additional corrections to `docs/PRODUCT_SPEC.md` were made after baseline validation (interpolation removal, monetary precision clarification, catalogue scope boundary). These are Task 004 product-specification corrections rather than fresh-start validation defects, and were addressed in dedicated prompts.

### Effect on conclusions

- The original Task 003 command evidence recorded above remains historical and is preserved unmodified.
- The current corrected repository state supersedes the inaccurate conclusions in the "Defects Repaired" and "Governance Checks" sections regarding ignore-rule completeness and contradiction absence.
- No legacy application code was introduced by any of these corrections.
- Tasks 001 through 004 remain completed, but their documentation received a corrective audit.
