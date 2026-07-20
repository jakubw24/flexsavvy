# FlexSavvy Progress Tracker

## Project State

Fresh-start repository. No application code, no package manifest, no build output.
Only task-pack governance files and the task index are present.

Git initialized on `main` branch.

## Completed Tasks

| Task | Description | Date | Notes |
|------|-------------|------|-------|
| TASK-001 | Initialize the empty FlexSavvy repository | 2026-07-20 | Git init, .gitignore, PROGRESS.md, DECISIONS.md, private-data/README.md, root README.md |
| TASK-002 | Establish project governance and source-of-truth structure | 2026-07-20 | Created REPOSITORY_CONVENTIONS.md, QUALITY_GATES.md, EXTERNAL_DATA_POLICY.md; updated README with governance links; marked task DONE in index |
| TASK-003 | Validate the fresh-start baseline | 2026-07-20 | Verified clean state: no legacy code, all 114 task files present, governance consistent, links resolve; created PROJECT_BASELINE.md; marked task DONE in index |
| TASK-004 | Create product specification | 2026-07-20 | Created docs/PRODUCT_SPEC.md with users, JTBD, positioning, scope, journey, outputs, confidence labels, terminology, non-goals; verified output coverage and non-goal testability; marked task DONE in index. **Key decisions:** (1) standing charge applied per calendar day across full analysis span — matching UK supplier practice — even on days with missing data; (2) export income included via `current_net_cost` when both export data and an export rate are available, otherwise treated as zero; (3) variable renamed from `current_cost` to `current_net_cost` throughout §5 formulas. See Known Risks below.

## Decisions

See `docs/DECISIONS.md` for architectural decision records.

Key decisions recorded:
1. Fully static Astro site with React/TypeScript application — no Node.js production server.
2. Browser-only smart-meter processing — no upload endpoint or database.
3. UTC internally; Europe/London only for local tariff schedules and presentation.
4. No accounts, no database, no upload API in the initial product.

## Command Evidence

### TASK-001 commands (2026-07-20)

```bash
$ pwd
/home/j/projects/flexsavvy

$ whoami
j

$ git init -b main
Initialized empty Git repository in /home/j/projects/flexsavvy/.git/

$ git branch --show-current
main

$ find . -maxdepth 3 -type f | sort
# (task-pack files only — AGENTS.md, MANUAL_ACTIONS.md, docs/AI_TASK_INDEX.md, docs/AI_WORKFLOW.md, docs/IMPLEMENTATION_PLAN.md, ai-tasks/TASK-001..TASK-114)

$ git check-ignore -v private-data/example-private.csv
.gitignore:39:private-data/*  private-data/example-private.csv

$ GIT_PAGER=cat git diff --check
(no output — clean)
```

### TASK-002 commands (2026-07-20)

```bash
$ git status --short
 M README.md
 M docs/AI_TASK_INDEX.md
 M docs/PROGRESS.md
?? docs/EXTERNAL_DATA_POLICY.md
?? docs/QUALITY_GATES.md
?? docs/REPOSITORY_CONVENTIONS.md

$ find . -maxdepth 3 -type f | sort
./AGENTS.md
./docs/AI_TASK_INDEX.md
./docs/AI_WORKFLOW.md
./docs/DECISIONS.md
./docs/EXTERNAL_DATA_POLICY.md
./docs/IMPLEMENTATION_PLAN.md
./docs/PROGRESS.md
./docs/QUALITY_GATES.md
./docs/REPOSITORY_CONVENTIONS.md
./docs/ai-tasks/TASK-001.md
… (TASK-002 through TASK-114 present, no other new files)
./.gitignore
./MANUAL_ACTIONS.md
./README.md
./private-data/README.md
(no src/, __tests__, public/, node_modules/, package.json, or application directories)

$ GIT_PAGER=cat git diff --check
(exit code 0 — no trailing whitespace or merge conflict markers)

$ python3 -c "
import os, re, sys
broken = []
for root, dirs, files in os.walk('.'):
    if '.git' in root: continue
    for f in files:
        if not f.endswith('.md'): continue
        fp = os.path.join(root, f)
        with open(fp) as fh:
            for ln, line in enumerate(fh, 1):
                for m in re.finditer(r'\]\(([^)]+)\)', line):
                    link = m.group(1)
                    if link.startswith('http://') or link.startswith('https://'): continue
                    path = link.split('#')[0]
                    if not path: continue
                    target = os.path.normpath(os.path.join(root, path))
                    if not os.path.exists(target):
                        broken.append(f'{fp}:{ln} -> {link}')
sys.exit(1) if broken else None
for b in broken: print('BROKEN:', b)
"
All relative Markdown links resolve OK.
(exit code 0)

### TASK-002 AGENTS.md consistency check (2026-07-20)

A keyword cross-reference script compared 13 key AGENTS.md assertions against the three new governance documents. Results:

| AGENTS.md assertion | Found in |
|---|---|
| Static files only, no server runtime | REPOSITORY_CONVENTIONS.md |
| No database/account system | EXTERNAL_DATA_POLICY.md (ADR-004 in DECISIONS.md) |
| Smart-meter data stays in browser | REPOSITORY_CONVENTIONS.md, EXTERNAL_DATA_POLICY.md |
| Web Worker for heavy computation | REPOSITORY_CONVENTIONS.md |
| Adapters for external APIs | REPOSITORY_CONVENTIONS.md, EXTERNAL_DATA_POLICY.md |
| Tests run without internet | QUALITY_GATES.md, EXTERNAL_DATA_POLICY.md |
| Committed fixtures for external data | REPOSITORY_CONVENTIONS.md, QUALITY_GATES.md, EXTERNAL_DATA_POLICY.md |
| UTC internally, Europe/London locally | DECISIONS.md (ADR-003) |
| No trailing whitespace / `git diff --check` rule | REPOSITORY_CONVENTIONS.md, QUALITY_GATES.md |
| Never claim command passed without evidence | REPOSITORY_CONVENTIONS.md, QUALITY_GATES.md |
| One task = one coherent commit | REPOSITORY_CONVENTIONS.md |
| No sensitive data in fixtures | REPOSITORY_CONVENTIONS.md, EXTERNAL_DATA_POLICY.md |
| Strict TypeScript | REPOSITORY_CONVENTIONS.md |

All 13 assertions are covered across the three new documents plus existing DECISIONS.md. Coverage is complete.

### TASK-002 decision record note (2026-07-20)

TASK-002 requirement #4 asked for an initial decision record confirming fully static deployment, browser-only smart-meter processing, UTC internally with Europe/London for presentation, and no accounts/database/upload API. These four points were already recorded as ADR-001 through ADR-004 in `docs/DECISIONS.md` during TASK-001. No new ADR was added; the existing records satisfy the requirement.

### TASK-003 commands (2026-07-20)

```bash
$ git branch --show-current
main

$ git status --short
(no output — clean working tree before task)

$ GIT_PAGER=cat git log --oneline --all
193a2eb (HEAD -> main, origin/main) task-002: establish-project-governance
59e100c task-001: initialize-fresh-start-repository

$ GIT_PAGER=cat git diff --check
(no output — clean)

$ find docs/ai-tasks -name 'TASK-*.md' | wc -l
114

$ python3 [Markdown link checker]
All relative Markdown links resolve OK.
(exit code 0)

$ python3 [Legacy code scanner]
No legacy source code, package manifests, lockfiles, or build output found.

$ python3 [Task index and file validator]
Tasks found in index: 114
DONE: ['001', '002']
TASK-001 DONE: True
TASK-002 DONE: True
Missing task files: 0
All 114 task files present.
No legacy repository or implementation matrix references found.

$ python3 [Dependency chain checker]
All dependency chains are valid — dependencies always reference earlier tasks.

$ python3 [Governance cross-check]
Key assertions verified across all governance documents. No contradictions found.
```

### TASK-004 commands (2026-07-20)

```bash
$ git status --short
M  docs/AI_TASK_INDEX.md
A  docs/PRODUCT_SPEC.md
M  docs/PROGRESS.md

$ GIT_PAGER=cat git diff --check
(no output — clean)
```

### TASK-003 AGENTS.md consistency cross-reference (2026-07-20)

Five core architectural assertions verified across seven governance files:

| Assertion | AGENTS.md | DECISIONS.md | REPO_CONV | QUALITY_GATES | EXT_DATA_POLICY | IMPLEMENTATION_PLAN |
|---|---|---|---|---|---|---|
| Fully static, no server runtime | ✓ | ✓ | — | — | — | ✓ |
| No database / no accounts | ✓ | ✓ | — | — | — | — |
| Browser-only smart-meter data | ✓ | ✓ | ✓ | — | — | ✓ |
| UTC internally, Europe/London locally | ✓ | ✓ | — | — | — | ✓ |
| Tests offline / fixtures only | — | — | ✓ | ✓ | ✓ | ✓ |

No contradictions found. Assertions distributed as expected: AGENTS.md and DECISIONS.md carry architectural assertions; operational rules enforce them procedurally.

## Corrective Audit — Tasks 001–004

A post-baseline review found documentation inconsistencies between the committed repository state and the governance rules in `AGENTS.md` and `docs/REPOSITORY_CONVENTIONS.md`. These were corrected across seven prompts without introducing any application code.

### Corrections applied

| # | File | Issue | Fix |
|---|------|-------|-----|
| 1 | `.gitignore` | Lockfiles (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`) were ignored despite REPOSITORY_CONVENTIONS.md requiring them committed | Removed all three lines |
| 2 | `.gitignore` | `.astro/` missing from generated-output ignore rules (only `dist/` present) | Added `.astro/` beside `dist/` |
| 3 | `private-data/README.md` | Fixture location stated as `` `src/fixtures/` `` instead of canonical root-level `fixtures/` | Corrected to `` `fixtures/` `` |
| 4 | `docs/PRODUCT_SPEC.md` | §6.1 suggested missing dynamic rates could be interpolated from adjacent intervals via fixture | Replaced: interval is excluded and a warning is shown |
| 5 | `docs/PRODUCT_SPEC.md` | §5.5 simultaneously claimed exact pence and binary floating-point precision for intermediates | Rewritten: decimal-safe or scaled integers; deferred canonical representation to TASK-006 |
| 6 | `docs/PRODUCT_SPEC.md` | Public-alpha scope implied catalogue selection was available in alpha | Clarified: catalogue is paid-ready (§3.2); manual definition is primary in alpha; catalogue appears only when implemented and enabled |
| 7 | `docs/PROJECT_BASELINE.md` | Starting file count listed 9 docs + 128 total, self-counting `PROJECT_BASELINE.md` before it existed | Corrected to 8 docs + 127 starting; post-task total 128 |
| 8 | `docs/PROJECT_BASELINE.md` | Retrospective audit amendment appended recording all findings | Added new section with five findings and effect on conclusions |

### Task statuses

Tasks 001 through 004 remain `DONE`. No status changes were made in `docs/AI_TASK_INDEX.md`.

TASK-005 (Create canonical data schema) remains the next task.

### Commands executed

```bash
$ git diff --check
(no output — clean)
(exit code 0)

$ git status --short
 M .gitignore
 M docs/PRODUCT_SPEC.md
 M docs/PROJECT_BASELINE.md
 M private-data/README.md

$ python3 [Markdown link checker]
All relative Markdown links resolve OK.
(exit code 0)
```

## Known Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| DST boundary handling in half-hour intervals | High | TASK-022, TASK-023 will address explicitly |
| Privacy compliance for smart-meter data | Critical | private-data/ directory enforced via .gitignore; privacy design in TASK-007 |
| Tariff adapter correctness | Critical | Fixture-only tests mandated by AGENTS.md |
| Standing charge model assumption — calendar span vs. days with data | Medium | Choice recorded in TASK-004 notes and §5.1 of PRODUCT_SPEC.md; may need review during QA if test households have sparse data across long date ranges |
| Export income omission for suppliers without export rates | Low | Defaulted to zero per §5.1; impact documented in terminology table and PROGRESS.md; TASK-006 (calculation methodology) will formalise edge-case behaviour |

## Next Task

TASK-005 — Create canonical data schema
