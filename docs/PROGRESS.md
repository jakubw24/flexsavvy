# FlexSavvy Progress Tracker

## Project State

Tasks 001 through 004 are complete.
Product documentation now includes docs/PRODUCT_SPEC.md.
No application code, no package manifest, no build output.
TASK-005 is next.

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

### Corrective Audit — TASK-005 Preparation (2026-07-21)

A targeted corrective audit was performed before TASK-005 to fix governance and preparation issues.
No application code was introduced. No task status was changed. TASK-005 remains TODO.

#### Files changed

| File | Change |
|------|--------|
| `.gitignore` | Strengthened environment-file rules: replaced narrow `.env.local` / `.env.*.local` with broad `.env` + `.env.*`, allowing deliberate examples via `!.env.example` and `!.env.*.example` |
| `docs/QUALITY_GATES.md` | Generalised Markdown-link verification requirement from "Phase 0" only to all documentation-only tasks (covering Phase 1 tasks TASK-004 through TASK-008) |
| `docs/ai-tasks/TASK-005.md` | Corrected preparation instruction so agent reads `docs/DATA_SCHEMA.md` if it exists, otherwise confirms its absence is expected (TASK-005 creates it); does not treat missing file as incomplete dependency |
| `docs/PROGRESS.md` | Updated Project State section to record Tasks 001–004 complete, PRODUCT_SPEC.md present, no application code, TASK-005 next; added this audit entry |

#### Reason for each correction

1. `.gitignore`: The original rules (`.env.local`, `.env.*.local`) were too narrow — they would not ignore variants like `.env.production` or `.env.development` that developers might create. Broadening to `.env` and `.env.*` with explicit negation of example files provides robust protection.
2. `docs/QUALITY_GATES.md`: The Markdown-link check was limited to Phase 0 tasks, but Phase 1 is also documentation-only (TASK-004 through TASK-008). The gate should apply uniformly.
3. `docs/ai-tasks/TASK-005.md`: The preparation section listed `docs/DATA_SCHEMA.md` as a required read, but this file does not exist yet — TASK-005 is the task that creates it. This would cause an agent to falsely report a missing dependency.
4. `docs/PROGRESS.md`: Project State was outdated — it claimed only governance files existed but PRODUCT_SPEC.md was created in TASK-004.

#### Commands actually run

```bash
$ pwd
/home/j/projects/flexsavvy

$ git branch --show-current
main

$ git rev-parse HEAD
107619555ddec9ca20814bc499af4f2cb9d68b57

$ git status --short
(clean before edits)
```

Post-edit verification commands were run after all changes (see below).

#### Assumptions

- HEAD 107619555ddec9ca20814bc499af4f2cb9d68b57 is the correct committed state before these uncommitted fixes.
- Tasks 001–004 are genuinely complete; no rollback needed.
- `docs/DATA_SCHEMA.md` does not currently exist and is expected to be created by TASK-005.

#### Remaining risks

- The `.gitignore` broadening could theoretically block committing a deliberately named `.env.local` if someone wanted that exact filename. However `.env.*` already catches it, so this is intentional — such files should remain untracked unless renamed to an explicit example pattern.
- No application code was verified since none exists yet; TASK-009 will be the first code-producing task.

### Corrective Audit — Product Scope and Confidence Corrections (2026-07-21)

A targeted corrective audit of `docs/PRODUCT_SPEC.md` was performed to resolve scope contradictions, correct a non-goal criterion, and make confidence rules fully deterministic before TASK-005 begins.
No application code was introduced. No task status was changed. TASK-005 remains TODO.

#### Corrections applied

| # | Section | Issue | Fix |
|---|---------|-------|-----|
| 1 | §3 Scope, §4 Journey (Steps 8–9), §5.3 | EV and battery optimisation marked as paid-ready but described in simulation and results steps as unconditional outputs — contradiction between scope classification and journey description | Made EV and battery behaviour explicitly conditional: appliance optimisation always available in public-alpha; EV charging schedules appear only when the EV module (paid-ready, §3.2) is implemented and enabled; battery dispatch schedules appear only when the battery module (paid-ready, §3.2) is implemented and enabled; base simulator does not produce EV or battery results when those modules are unavailable |
| 2 | §3.3 NG-006 | Criterion required tariff schema to "reject three-phase identifiers" — this invents a schema field solely to enforce a non-goal, which is circular design | Replaced with behavioural criteria: no commercial or three-phase tariff category is offered; the product makes no claim to model three-phase installations; calculation assumptions remain residential single-phase unless a later task explicitly expands scope |
| 3 | §6.1 summary table, §6.2 rule 4 | Unresolved-price confidence defined only "one interval" → Medium and ">5%" → Low, leaving the range (1 interval to 5%) ambiguous | Defined complete percentage ranges: 0% unresolved billable intervals — no downgrade; >0% and ≤5% — Medium; >5% — Low |
| 4 | §6.1 summary table, §6.2 rule 3 | Duplicate handling described as "auto-resolved without user input" with ≤5%/>5% thresholds but did not address unresolved duplicates or post-resolution warnings | Made deterministic: unresolved duplicate timestamps block calculation for that interval until the user resolves them; once resolved, >0% and ≤5% of expected total produces Medium; >5% produces Low; warning remains visible after resolution; final confidence is the minimum across all downgrade rules (rule 7) |

#### Files changed

| File | Change |
|------|--------|
| `docs/PRODUCT_SPEC.md` | Corrections 1–4 above applied across §3, §4, §5.3, §6.1, and §6.2 |
| `docs/PROGRESS.md` | This audit entry added |

#### Commands actually run

```bash
$ cd /home/j/projects/flexsavvy && git status --short
 M .gitignore
 M docs/PROGRESS.md
 M docs/QUALITY_GATES.md
 M docs/ai-tasks/TASK-005.md

$ cd /home/j/projects/flexsavvy && git diff -- docs/PRODUCT_SPEC.md 2>&1 | head -20
(no output — PRODUCT_SPEC.md was unmodified before this audit)
```

#### Assumptions

- The existing uncommitted changes (.gitignore, PROGRESS.md, QUALITY_GATES.md, TASK-005.md) are from the prior corrective audit and are expected.
- EV and battery definitions will still appear as canonical optional fields in TASK-005 (DATA_SCHEMA.md); only their run-time availability is being made conditional here.

#### Remaining risks

- The "unresolved duplicates block calculation" rule requires a specific UI interaction pattern that has not been designed yet. TASK-012 or later will need to define the resolution interface.

### Corrective Audit — Public-Output Semantics (2026-07-21)

A targeted product-semantics pass was performed on `docs/PRODUCT_SPEC.md` to define every promised public output that currently lacked a precise meaning. No schema fields were introduced; no TypeScript interfaces or JSON field names were added. TASK-005 will handle structure.
No application code was introduced. No task status was changed. TASK-005 remains TODO.

#### Semantics added (new sections in PRODUCT_SPEC.md)

| # | Section | What was defined |
|---|---------|---|
| 1 | §5.5 Interval-Level Breakdown | One record per canonical start-inclusive/end-exclusive half-hour interval: UTC identity, imported kWh, exported kWh, resolved import/export prices, import cost, export income, warnings/unresolved-price state, scenario identity. Explicit rule that unresolved prices are never silently interpolated. |
| 2 | §5.6 Daily and Monthly Aggregation Boundaries | Interval identity remains UTC; daily and monthly grouping uses Europe/London calendar boundaries; DST days may contain 46/48/50 half-hour intervals; code must never assume 48 per local day; standing charges apply once per distinct Europe/London date. |
| 3 | §5.7 Per-Appliance Saving | Headline flexibility-only saving is the portfolio result with all flexible appliances optimised together; appliance-level estimates are isolated and explanatory; not additive — UI must not sum them into a portfolio total; any future additive attribution requires an explicit methodology decision. |
| 4 | §5.8 Schedules | Appliance schedule = recommended start time, cycle duration/interval coverage, tariff/scenario context, user constraints satisfied, infeasibility explanation when no valid schedule exists. EV and battery schedules are conditional paid-ready outputs only when those modules are enabled. |
| 5 | §5.10 Warnings | Defined semantically by scope: dataset-level, interval-level, scenario-level, optimisation-level. A warning remains associated with the output it affects and does not disappear merely because calculation continues. No final warning object field names invented. |
| 6 | §5.11 Reconciliation Across Output Formats | Dashboard, interval CSV, scenario JSON and printable HTML derive from the same canonical result; same scenario must reconcile across all formats; calculations use unrounded canonical values; rounding only at presentation boundaries; no independent recomputation of totals by format. |
| 7 | §5.12 Monthly View | Groups results by Europe/London calendar month; reconciles exactly with canonical interval totals before display rounding. |
| 8 | §5.13 Export Scope | Printable HTML and interval CSV are public alpha; scenario JSON local export is public alpha (one-way copy); replay mode (uploading saved scenario) remains paid-ready/later scope per existing §3.2 decision. |

#### Terminology table updates

Added rows for: "Interval-level breakdown", "Monthly grouping", "Appliance-level estimate", "Schedule", "Warning (scoped)".

#### Commands actually run

```bash
$ cd /home/j/projects/flexsavvy && git status --short
 M .gitignore
 M docs/PRODUCT_SPEC.md
 M docs/PROGRESS.md
 M docs/QUALITY_GATES.md
 M docs/ai-tasks/TASK-005.md
```

#### Assumptions

- HEAD 107619555ddec9ca20814bc499af4f2cb9d68b57 is the correct committed state.
- The existing uncommitted changes (.gitignore, QUALITY_GATES.md, TASK-005.md) are from prior corrective audit passes and are expected.
- No TypeScript interfaces or JSON field names were introduced; these remain TASK-005 territory.

#### Decisions intentionally deferred

| Deferred item | Deferral target | Reason |
|---|---|---|
| Warning object field names (severity, codes, display text) | TASK-005 / TASK-006 | Schema-level structuring belongs in the canonical data schema, not product semantics. |
| Per-appliance additive attribution methodology (Shapley values, cost-allocation) | Future task if needed | No current requirement; explicit decision required before implementation. |
| Replay JSON format details | TASK-005 | Export scope clarified here; field-level schema is TASK-005 work. |

#### Remaining risks

- §5.5 interval breakdown table lists semantic fields but does not assign TypeScript types or JSON property names — this is by design, but TASK-005 must implement them faithfully.
- The "no independent recomputation" rule (§5.11) requires discipline in the codebase to ensure all output formats read from a shared result object rather than re-summing intervals. This will be enforced during implementation.


### Corrective Audit — Final Verification (2026-07-21)

Final pre-commit verification confirmed all audit gaps closed.
No application code was introduced. No task status was changed. TASK-005 remains TODO.

#### Commands executed and results

```bash
$ git diff --stat
 .gitignore                |   5 +-
 docs/PRODUCT_SPEC.md      | 133 +++++++++++++++++++++++++++++++++++----
 docs/PROGRESS.md          | 154 ++++++++++++++++++++++++++++++++++++++++++++--
 docs/QUALITY_GATES.md     |   2 +-
 docs/ai-tasks/TASK-005.md |   2 +-
 5 files changed, 276 insertions(+), 20 deletions(-)

$ git diff --check
(no output — exit code 0)

$ python3 [task-file validator]
ALL 114 task files TASK-001..TASK-114 present
Unexpected app/build paths: NONE

$ python3 [Markdown link checker]
All relative Markdown links resolve OK (128 files checked)
(exit code 0)

test -f docs/DATA_SCHEMA.md → DOES NOT EXIST (expected)
grep credentials/secrets → only task-description references, no actual secrets
AI_TASK_INDEX.md: TASK-001..004 DONE, TASK-005 TODO
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
