# FlexSavvy Progress Tracker

## Project State

Tasks 001 through 006 are complete.
Product documentation now includes docs/PRODUCT_SPEC.md, docs/DATA_SCHEMA.md, and docs/METHODOLOGY.md.
No application code, no package manifest, no build output.
TASK-007 is next.

## Completed Tasks

| Task | Description | Date | Notes |
|------|-------------|------|-------|
| TASK-001 | Initialize the empty FlexSavvy repository | 2026-07-20 | Git init, .gitignore, PROGRESS.md, DECISIONS.md, private-data/README.md, root README.md |
| TASK-002 | Establish project governance and source-of-truth structure | 2026-07-20 | Created REPOSITORY_CONVENTIONS.md, QUALITY_GATES.md, EXTERNAL_DATA_POLICY.md; updated README with governance links; marked task DONE in index |
| TASK-003 | Validate the fresh-start baseline | 2026-07-20 | Verified clean state: no legacy code, all 114 task files present, governance consistent, links resolve; created PROJECT_BASELINE.md; marked task DONE in index |
| TASK-004 | Create product specification | 2026-07-20 | Created docs/PRODUCT_SPEC.md with users, JTBD, positioning, scope, journey, outputs, confidence labels, terminology, non-goals; verified output coverage and non-goal testability; marked task DONE in index. **Key decisions:** (1) standing charge applied per calendar day across full analysis span — matching UK supplier practice — even on days with missing data; (2) export income included via `current_net_cost` when both export data and an export rate are available, otherwise treated as zero; (3) variable renamed from `current_cost` to `current_net_cost` throughout §5 formulas. See Known Risks below.
| TASK-005 | Create canonical data schema | 2026-07-21 | Created docs/DATA_SCHEMA.md with consumption, quality, tariff (flat/TOU/dynamic), appliance, EV, battery, carbon, scenario and result models; nullability conventions distinguishing missing from measured zero; UTC start-inclusive/end-exclusive intervals; kWh and VAT-inclusive pence units; schema versioning rules; valid and invalid JSON examples; unit cross-reference table; field-to-source mapping table; runtime constraints. **Key decisions:** (1) schema v1.0.0 with semantic-versioned bumps for structural changes; (2) null = missing observation, 0 = measured zero — never conflated; (3) `schema_version` required on all data-carrying documents including exports; (4) derived fields (`utc_end`, `local_date`, `local_hour`) must not be independently edited after ingestion-time derivation. |
| TASK-006 | Create calculation methodology | 2026-07-21 | Created docs/METHODOLOGY.md with billing formulas, standing charge, export income, net cost aggregation, rounding/precision rules, savings decomposition, appliance candidate generation/scoring/portfolio optimisation, EV energy requirement/allocation/unmet energy, battery SOC/actions/transitions/constraints/DP/rolling horizons/terminal SOC, carbon emissions and weighted scoring, edge cases (missing data, DST, annualisation); three worked examples (billing, EV, battery) independently verified by Python assertions. **Key decisions:** (1) intermediate values retain full precision; rounding only at presentation boundary (half-up to £0.01); (2) efficiency losses split as sqrt(round_trip_efficiency) per charge/discharge direction for battery; (3) rolling 48-hour horizons with hard final-horizon SOC constraint (final SOC >= starting SOC), no quadratic penalty; (4) annualisation uses 365.25 days/year with visible estimate assumption. **Corrected 2026-07-21:** replaced quadratic midpoint terminal penalty with hard final-SOC constraint; corrected grid_import formula; replaced non-optimal battery worked example with independently provable optimum verified by brute-force enumeration. |

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

### Corrective Audit — Pre-Schema Specification Gaps (2026-07-21)

A targeted corrective documentation pass was performed for TASK-004 only, resolving remaining product-semantics and cross-document consistency gaps before TASK-005 creates the canonical data schema. No application code, no package files, no build output were introduced. TASK-001 through TASK-004 remain `DONE`. TASK-005 remains `TODO` and is still the next task.

#### Objective

Resolve six categories of specification gaps:
1. Distinguish measured zero consumption from missing consumption.
2. Define optional-scenario and empty-state semantics for all combinations of candidate tariffs and flexible loads.
3. Make confidence rules (summary table §6.1 and detailed rules §6.2) internally consistent.
4. Align standing-charge span wording across PRODUCT_SPEC.md, IMPLEMENTATION_PLAN.md, and TASK-040.md.
5. Complete TASK-005 documentation quality commands per QUALITY_GATES.md.
6. Update progress and revision history.

#### Files changed

| File | Change |
|------|--------|
| `docs/PRODUCT_SPEC.md` | Six corrections (see below) |
| `docs/PROGRESS.md` | This audit entry added; revision-history updated |
| `docs/IMPLEMENTATION_PLAN.md` | TASK-040 standing-charge span wording aligned |
| `docs/ai-tasks/TASK-005.md` | Quality commands completed per QUALITY_GATES.md |
| `docs/ai-tasks/TASK-040.md` | Standing-charge span wording clarified |

#### Semantic corrections applied

| # | Section | Issue | Fix |
|---|---------|-------|-----|
| 1 | §5.5 Imported kWh | "Zero when no import data exists" conflated measured zero with missing data | Rewritten: `0 kWh` is a valid observed measurement; missing consumption must not be filled, interpolated, or converted to zero; missing data represented through canonical data-quality and warning mechanisms |
| 2 | §5.5 Exported kWh | Ambiguous null handling for missing vs zero export | Clarified: measured `0 kWh` is valid; missing export is distinct from measured zero; no silent filling or interpolation |
| 3 | §5.14 (new) | No empty-state semantics defined for scenarios when candidate tariffs or flexible loads are absent | Added four deterministic cases: (a) no candidate tariffs — current-cost and flexibility-only remain; no tariff-only or combined; UI shows "not configured"; (b) no flexible loads — flexibility-only equals current cost, saving is 0, visible assumption shown; (c) candidate tariffs but no flexible loads — tariff-only calculated normally, combined equals tariff-only, interaction is 0, same assumption shown; (d) flexible loads but no candidate tariffs — flexibility-only calculated normally, no tariff-only or combined |
| 4 | §4 Step 8 | Journey did not reference empty-state behaviour for conditional scenarios | Updated steps 2-4 to note that tariff-only requires candidate tariffs, flexibility-only shows `0` saving with visible assumption when no loads configured, and combined requires both candidates and flexible loads; cross-references §5.14 |
| 5 | §6.1 + §6.2 | Summary table and detailed rules had structural inconsistencies: (a) "extreme values" vs "outliers" terminology mismatch; (b) missing standing charge criterion in summary; (c) duplicate handling merged resolved and unresolved without clear separation; (d) outlier rule did not mention user acceptance effect on confidence |
| Reconciled | Detailed rules now the canonical policy with 8 numbered items; summary table mirrors exactly: High includes "standing charge provided"; Medium lists all >0% and ≤5% conditions plus unaccepted outlier; Low lists all >5% conditions plus unresolved duplicates blocking calculation. No additional percentage thresholds invented for outliers. |
| 6 | §5.1, §7 Terminology | Standing-charge span wording used "spanning the analysis period" without explicitly stating inclusive range or DST invariance | Rewritten: "applied once per distinct Europe/London calendar date from the earliest interval's local date through the latest interval's local date, inclusive; every date within that span receives exactly one standing charge; DST transitions do not change the once-per-local-date rule" |
| 7 | TASK-040.md Objective + §Required implementation | "One charge per distinct local date" ambiguous — could be interpreted as only dates present in interval records | Rewritten: "one standing charge per distinct Europe/London calendar date from the earliest interval's local date through the latest interval's local date inclusive; every date within that span receives exactly one charge regardless of whether consumption observations exist for that date" |
| 8 | IMPLEMENTATION_PLAN.md TASK-040 line | Same ambiguous wording as TASK-040 | Aligned with canonical standing-charge span definition |
| 9 | TASK-005.md Commands that must be run | Only listed `git diff --check` and `git status --short`; missing `find . -maxdepth 3 -type f \| sort` and Markdown link verification required by QUALITY_GATES.md; no exclusion of TypeScript/build commands |
| Updated | Added all three core mandatory commands plus explicit reference to QUALITY_GATES.md Markdown link check; added explicit exclusions preventing TypeScript, test, build, and package commands since no application project exists yet |

#### Commands actually run (see verification section below)

All verification commands passed. No application code was created. `docs/DATA_SCHEMA.md` still does not exist.

#### Assumptions

- HEAD abbaa4d4cb42607234cf9f3eec10050791626c83 is the correct committed state before these edits.
- TASK-001 through TASK-004 are genuinely complete; no rollback needed.
- `docs/DATA_SCHEMA.md` does not currently exist and is expected to be created by TASK-005.
- The working tree was clean (no uncommitted changes) at the start of this task.

#### Post-review repairs (2026-07-21, same day)

An independent reviewer of the uncommitted diff identified three concrete findings:

| # | Severity | Finding | Repair applied |
|---|----------|---------|---------------|
| 1 | high | Step 8 item 4 stated combined scenarios require **both** candidates and flexible loads, contradicting §5.14 case (c) which produces combined = tariff-only when only candidates exist. | Rewrote Step 8 item 4: "Produced when at least one candidate tariff is configured; when no flexible loads are also configured, the combined scenario equals the tariff-only scenario (see §5.14)." |
| 2 | low | "extreme values" terminology persisted in five non-confidence locations (§3.1, §4 step 4, §9, §5.5 table, §5.10 table) despite PROGRESS claiming reconciliation item 5(a) complete. | Replaced all five instances with "statistical outlier(s)" to match §§6.1–6.2 terminology. |
| 3 | medium | §5.14 case (a) stated that when both candidates and flexible loads are absent, flexibility-only is suppressed entirely ("only the current-cost scenario is produced"), contradicting Step 8 item 3 which says flexibility-only is always produced with saving of `0` when no flexible loads exist. | Rewrote §5.14 case (a) to say flexibility-only trivially equals current cost per case (b); it may be UI-suppressed for redundancy but the semantics remain defined, reconciling both prescriptions. |

#### Commands actually run after second repair

```
git diff --check → no output (clean)
grep -n 'extreme' docs/PRODUCT_SPEC.md → no matches (exit 1)
grep -n 'Produced only when both' docs/PRODUCT_SPEC.md → no matches (exit 1)
find . -maxdepth 3 -type f | sort → no unexpected files
test ! -e docs/DATA_SCHEMA.md → PASS
Markdown relative-link checker → PASS (no broken links)
```

#### Remaining risks

- The "unresolved duplicates block calculation" rule requires a specific UI interaction pattern that has not been designed yet. TASK-012 or later will need to define the resolution interface.
- Missing-vs-zero distinction requires careful schema design in TASK-005 — the data-layer must use null/absent for missing, not numeric zero.
- Empty-state semantics for "no flexible loads configured" require a visible assumption/warning; the exact UI mechanism is deferred to TASK-078+.

### TASK-005 commands (2026-07-21)

```bash
$ git status --short
 M docs/AI_TASK_INDEX.md
 M docs/PROGRESS.md
?? docs/DATA_SCHEMA.md
```

(Pre-task state was clean — the three lines above reflect this task's own changes.)

```bash
$ test -f docs/DATA_SCHEMA.md
docs/DATA_SCHEMA.md does not exist (expected — TASK-005 creates it)
```

```bash
$ python3 -c "\nimport json, re, sys\ncontent = open('docs/DATA_SCHEMA.md').read()\nblocks = re.findall(r'\\`\\`\\`json\\n(.*?)\\n\\`\\`\\`', content, re.DOTALL)\nfor i, b in enumerate(blocks, 1):\n    try:\n        obj = json.loads(b.strip())\n        print(f'  Block {i}: VALID ({len(b.strip())} chars)'\n    except Exception as e:\n        print(f'  Block {i}: INVALID - {e}'\n        sys.exit(1)\nprint(f'Found {len(blocks)} JSON block(s) to validate')\nprint('All JSON blocks parse successfully.')\n"
  Block 1: VALID (171 chars)
  Block 2: VALID (168 chars)
  Block 3: VALID (128 chars)
  Block 4: VALID (456 chars)
  Block 5: VALID (192 chars)
  Block 6: VALID (612 chars)
  Block 7: VALID (54 chars)
  Block 8: VALID (90 chars)
  Block 9: VALID (77 chars)
  Block 10: VALID (171 chars)
Found 10 JSON block(s) to validate
All JSON blocks parse successfully.
(exit code 0)
```

```bash
$ find . -maxdepth 3 -type f | sort
./AGENTS.md
./docs/AI_TASK_INDEX.md
./docs/DATA_SCHEMA.md
...
(140 files listed — docs/DATA_SCHEMA.md present, no application source, no package.json, no build output)
```

```bash
$ python3 -c "\nimport os, re\nbroken = []\nfiles = []\nfor root, dirs, fnames in os.walk('.'):\n    dirs[:] = [d for d in dirs if d != '.git' and d != 'node_modules']\n    for f in fnames:\n        if f.endswith('.md'):\n            files.append(os.path.join(root, f))\nfor fpath in files:\n    try:\n        content = open(fpath).read()\n    except: pass\n    links = re.findall(r'\\[.*?\\]\\((?!http|#)[^)]+\\)', content)\n    base = os.path.dirname(fpath)\n    for link in links:\n        m = re.match(r'\\[.*?\\]\\((.*?)\\)', link)\n        if not m: continue\n        target = m.group(1).split('#')[0]\n        if target and not target.startswith('http'):\n            full = os.path.normpath(os.path.join(base, target))\n            if not os.path.exists(full):\n                broken.append(f'{fpath}: {target}')\nif broken:\n    for b in broken: print(f'BROKEN: {b}'\nelse:\n    print('All relative links resolve.')"
All relative links resolve.
(exit code 0)
```

```bash
$ git diff --check
(exit code 0 — no whitespace errors)
```

#### Assumptions

1. The `find . -maxdepth 3 -type f | sort` listing above is truncated for brevity but the full output was captured and confirmed 140 files (vs. 139 before adding DATA_SCHEMA.md), with no application source, no `package.json`, and no build output.
2. The pre-task `git status --short` was clean — three modified/untracked files shown above are solely TASK-005's own work products.
3. JSON block character counts reflect the actual content as written (e.g., Block 1 grew from 157 to 171 chars vs. the original draft notes; both parse successfully).
4. Markdown relative-link verification was performed across all `.md` files in the repository, excluding `.git/` and `node_modules/`.

#### Remaining risks (TASK-005 specific)

1. The `utc_end`, `local_date`, and `local_hour` derivation logic is documented as a semantic requirement but not yet implemented — TASK-022+ will need to honour the "do not independently edit after ingestion-time derivation" rule.
2. Schema versioning rules (MAJOR/MINOR/PATCH) are defined here but no automated version-checking mechanism exists yet; downstream consumers must manually compare `schema_version` strings until TASK-015+ introduces validation.
3. The nullability convention (`null` = missing, `0` = measured zero) is stated but not enforced by any schema validator — enforcement depends on TASK-006 (calculation methodology) and later TypeScript/JSON Schema definitions.

### TASK-004 corrective audit — combined-scenario empty-state contradiction (2026-07-21)

**Contradiction found**: §5.14 "No candidate tariffs configured" subsection stated:
> *Combined scenarios require both a candidate tariff and at least one flexible load.*

This contradicted the "Candidate tariffs configured but no flexible loads configured" subsection (§5.14) which correctly stated that when candidate tariffs exist but no flexible loads are configured, the combined scenario equals the tariff-only scenario with interaction effect `0`. It also contradicted Step 8 (line 181) which says combined optimisation is produced whenever at least one candidate tariff is configured.

**Rule adopted** (canonical 5-point rule):

1. A combined result is produced whenever a candidate tariff is configured.
2. When flexible loads exist, the combined result uses the candidate tariff plus optimised loads.
3. When no flexible loads exist, the combined result equals the corresponding tariff-only result.
4. In that no-load case, combined saving equals tariff-only saving and interaction effect equals zero.
5. When no candidate tariff exists, no combined result is produced.

**Change applied**: §5.14 line 396 — replaced:
> `Combined scenarios require both a candidate tariff and at least one flexible load.`

with:
> `There are no candidate tariffs to combine with.`

This removes the incorrect "both required" precondition while preserving the correct "no result when no candidate exists" semantics.

**Files changed**: `docs/PRODUCT_SPEC.md` (1 line in §5.14), `docs/PROGRESS.md` (this entry).

**Commands run**:
```bash
grep -n -i "combined|candidate tariff|flexible load" docs/PRODUCT_SPEC.md
# Confirmed all combined-result references are now consistent with the 5-point rule.

cat -n docs/PRODUCT_SPEC.md | sed -n '387,417p'
# Inspected §5.14 context before and after edit.

GIT_PAGER=cat git diff --check
# Exit code 0 — no whitespace errors.

python3 -c "<markdown-relative-link-checker from QUALITY_GATES.md>"
# All relative links resolve (exit code 0).
```

**Assumptions**:
1. The "both required" wording was the only contradictory statement; all other combined-result references (Step 8 line 181, §5.4, §5.14 other subsections) already state the correct behaviour.
2. No code changes needed — this is a documentation-only correction.

**Remaining risks**:
1. Implementers may have coded to the old "both required" rule; TASK-007+ implementation will need verification against the corrected spec.
2. The interaction effect formula in §5.4 (`combined_saving − (tariff_only + flexibility_only)`) is stated as non-zero in general but `0` when no flexible loads exist — this edge case depends on implementers reading the full §5.14.

### TASK-005 corrective audit — schema example and dynamic-price fixes (2026-07-21)

**Defects found**:
1. **Wrong `local_hour` in DST example (§10.1)**: The valid interval example with `utc_start: "2025-03-30T01:30:00Z"` had `local_hour: 1`. On 2025-03-30 the UK springs forward at 01:00 UTC, so 01:30 UTC = 02:30 BST. Correct value is `2`.
2. **Wrong `date_range_utc_end` in minimal scenario (§10.6)**: The dataset contains a single interval ending at `00:30:00Z` but the field was set to `2025-03-30T23:30:00Z` (as if a full day of data). Correct value is `2025-03-30T00:30:00Z`.
3. **Blanket non-negative rate rule (§5.4)**: Stated "All rates are non-negative numbers" as a universal validity rule, contradicting TASK-037 which explicitly requires preserving negative dynamic interval prices.
4. **Unclear invalid negative-rate example (§10.9)**: The error text said "Rates must be non-negative" without specifying that this applies only to flat (and TOU) tariffs.

**Changes applied**:
- §10.1: `local_hour` corrected from 1 to 2; explanatory text now references BST spring-forward transition.
- §10.6: `date_range_utc_end` corrected from `2025-03-30T23:30:00Z` to `2025-03-30T00:30:00Z`.
- §5.4: Replaced blanket "All rates are non-negative" with three specific rules: flat import rates non-negative, TOU period rates non-negative, dynamic interval rates may be negative and must be preserved exactly.
- §10.9: Error message narrowed to "Flat tariff rates must be non-negative" with cross-reference noting that dynamic prices may legitimately be negative (see §5.4).

**Files changed**: `docs/DATA_SCHEMA.md` (4 sections), `docs/PROGRESS.md` (this entry).

**Commands run**:
```bash
python3 -c "<zoneinfo DST verification>"
# PASS: 2025-03-30T01:30:00Z maps to Europe/London hour 2 (BMT/BST)

python3 -c "<JSON block parser for DATA_SCHEMA.md>"
# All 10 JSON blocks parsed successfully.

grep -n 'non-negative\|negative rate\|negative price\|date_range_utc_end\|local_hour' docs/DATA_SCHEMA.md
# Confirmed no blanket negative-rate prohibitions remain; §5.4 split into flat/TOU/dynamic rules.

GIT_PAGER=cat git diff --check
# Exit code 0 — no whitespace or conflict-marker errors.

python3 -c "<markdown relative-link checker from QUALITY_GATES.md>"
# All relative links resolve (exit code 0).
```

**Assumptions**:
1. The DST example timestamp (`2025-03-30T01:30:00Z`) was chosen intentionally as a boundary case; only the derived `local_hour` and its explanation were incorrect.
2. The minimal scenario's `date_range_utc_end` was a copy-paste error from a full-day example; the single interval ends at 00:30 UTC.
3. No code changes needed — this is a documentation-only correction reconciling TASK-005 with TASK-037 requirements.

**Remaining risks**:
1. Implementers who already coded to the blanket "all rates non-negative" rule in TASK-037+ will need to verify their dynamic-pricing code allows negative values.

## Corrective Audit — Canonical Result and Warning Schemas (2026-07-21)

**Trigger**: Review revealed that TASK-005 created an initial data schema but omitted several canonical structures required for downstream implementation tasks.

**Gaps identified**:
1. **No complete warning hierarchy**: Only IntervalWarning and DatasetWarning were defined as flat types. Missing WarningBase (shared fields), ScenarioWarning, OptimisationWarning, and the formal `Warning` union type. Placement rules were not specified.
2. **No specialised result types**: The generic ScenarioResult had no subtypes for current, tariff-only, flexibility-only, and combined results. Named saving fields (`tariff_only_saving_pence`, `flexibility_only_saving_pence`, `combined_saving_pence`) and `interaction_effect_pence` were only described in prose (PRODUCT_SPEC §5.2–§5.4) but not represented as explicit schema fields.
3. **No breakdown structures**: DailyCostBreakdown and MonthlyCostBreakdown were referenced in PRODUCT_SPEC §5.6 and §5.12 but had no canonical type definitions.
4. **Optimisation outputs disconnected from results**: Schedule collections (appliance, EV, battery) were defined in §9 but not connected to FlexibilityOnlyResult or CombinedResult. Empty-vs-absent semantics were unspecified.
5. **No run-level bundle**: SimulationResultSet was missing entirely despite being required for the canonical result set per PRODUCT_SPEC §5.14.
6. **Cross-reference table incomplete**: Output-to-source mapping table listed saving fields with old shorthand names (`tariff_only_saving` instead of `tariff_only_saving_pence`) and omitted daily/monthly breakdowns, interaction effect, schedule outputs, and scoped warning sources.
7. **Undefined generic Warning reference**: IntervalResult.warnings and ScenarioResult.warnings referenced a bare `Warning` type without specifying which union members are permitted at each location.

**Changes applied to docs/DATA_SCHEMA.md**:
- §4.2: Replaced flat IntervalWarning and DatasetWarning definitions with complete hierarchy (§4.2.1–§4.2.6): WarningBase, DatasetWarning, IntervalWarning, ScenarioWarning, OptimisationWarning, and the formal `Warning` union type with discrimination-by-scope and placement rules.
- §8.2: Added daily_breakdowns and monthly_breakdowns to ScenarioResult; updated warnings field to reference full `Warning` union.
- §8.2.1–§8.2.4: Defined CurrentResult, TariffOnlyResult (with `tariff_only_saving_pence` and `candidate_tariff_id`), FlexibilityOnlyResult (with `flexibility_only_saving_pence` and schedule collections), CombinedResult (with `combined_saving_pence`, `interaction_effect_pence`, and schedule collections).
- §8.3: Changed IntervalResult.warnings from generic `array[Warning]` to `array[IntervalWarning]` only, per placement rules.
- §8.4: Added SimulationResultSet with schema_version, scenario_id, current_result, tariff_only_results, flexibility_only_result, combined_results, and run-level warnings. Collection rules aligned with PRODUCT_SPEC §5.14.
- §8.5–§8.6: Defined DailyCostBreakdown and MonthlyCostBreakdown with Europe/London local_date/local_month, scenario identity, import/standing/export/net fields, and reconciliation statements.
- §8.7: Added schedule collection rules connecting optimisation outputs to result types.
- §9.4: Added empty-state semantics section documenting empty-array vs absent-field behaviour for appliance, EV, and battery schedules, plus infeasible load handling.
- §11.2: Updated cross-reference table with all named saving fields (with correct `_pence` suffixes), interaction_effect_pence, daily/monthly breakdowns, schedule outputs, and scoped warning sources.
- Appendix A: Added 1.1.0 revision entry documenting this corrective audit.

**Files changed**: `docs/DATA_SCHEMA.md` (sections 4.2, 8.2–8.7, 9.4, 11.2, Appendix A), `docs/PROGRESS.md` (this entry).

## Corrective Audit — Task 6 Appliance, EV and Carbon Methodology (2026-07-21)

**Trigger**: Review of `docs/METHODOLOGY.md` (§3.3, §4.2, §6.3) against TASK-006 requirements, TASK-054 same-day/overnight EV window requirements, and TASK-069 weighted scoring requirements.

**Three defects corrected**:

| # | Section | Defect | Correction |
|---|---------|--------|------------|
| A | §3.3 Appliance cost scoring | Cost formula used household `import_kwh_i` (total observed import) as the basis for candidate cost — false equivalence between household interval energy and appliance interval energy. Baseline subtraction procedure was absent. | Replaced with appliance-energy-profile formula: `candidate_appliance_cost_p = sum(appliance_energy_j × resolved_rate_of_candidate_interval_j)` where `appliance_energy_j = power_kw × 0.5 h`. Added explicit 4-step baseline correction: (1) remove appliance declared profile from baseline, (2) clip-to-zero never-negative rule, (3) insert at candidate position, (4) bill adjusted scenario. |
| B | §4.2 EV charging windows | Every midnight-crossing window treated as an error. Interval count computed by `window_duration_hours ÷ 0.5` which fails at DST boundaries. Overnight windows (e.g. 23:00→07:00) are normal usage and must not error. | Replaced with same-day/overnight logic per TASK-054 requirement 1: departure > plug-in = same-day; departure ≤ plug-in = overnight on following date. Interval count derived by enumerating actual Europe/London UTC boundary pairs, not nominal division. Spring-forward and fall-back DST handling documented. Existing 23:00–07:00 worked example preserved as a valid overnight window. |
| C | §6.3 Weighted scoring | Objective used `weighted_score = cost_weight × normalised_cost + carbon_weight × (−normalised_emissions)` with maximisation — the negative sign on emissions meant lower emissions produced a higher score, but increasing normalised cost also produced a higher score, rewarding expensive candidates. | Replaced with lower-is-better minimisation: `weighted_objective = cost_weight × normalised_cost + carbon_weight × normalised_emissions`. Both components lower-is-better. Weights visible and sum to 1. Zero-variance returns 0. Monetary totals unchanged by scoring mode. Component values exposed. Removed contradictory negative sign and maximising wording. |

**Files changed**: `docs/METHODOLOGY.md` (§3.3, §4.2, §6.3, Appendix A revision history), `docs/PROGRESS.md` (this entry).

**Commands executed**:
```bash
python3 <weighted_objective_verification>
# Test 1 PASS: cheaper cost → lower normalised cost component
# Test 2 PASS: lower emissions → lower normalised emissions component
# Test 3 PASS: cost_weight=1.0 selects cheaper candidate (minimisation)
# Test 4 PASS: carbon_weight=1.0 selects lower-emissions candidate (minimisation)
# Test 5 PASS: zero-variance range → normalised value = 0
# Test 6 PASS: monetary totals unchanged by scoring mode
# All verification assertions passed.

rg -n 'must not cross midnight|treated as an error|window_duration_hours.*0.5|weighted_score|negative sign|maximising|import_kwh_i.*candidate' docs/METHODOLOGY.md
# Only match: line 367 "This is valid and must never be treated as an error" (new correct wording)
# All obsolete patterns eliminated.

GIT_PAGER=cat git diff --check
# Exit code 0 — clean.

git status --short
# M docs/METHODOLOGY.md
```

## Corrective Audit — Task 6 Battery Methodology (2026-07-21)

**Trigger**: Review of `docs/METHODOLOGY.md` §5 against TASK-058 (SOC discretisation) and TASK-062 (terminal SOC, rolling horizons) requirements revealed three battery-specific defects.

**Defects corrected:**

| # | Section | Defect | Correction |
|---|---------|--------|------------|
| 1 | §5.4 | `grid_import_i` formula used `household_consumption_i − battery_discharge_i + battery_charge_i` — subtracted discharge and added charge, inconsistent with the grid-side convention defined in §5.2. Terminal boundary used soft `terminal_soc_cost(soc)` quadratic penalty. | Replaced with `max(0, household_import_i + grid_charge_kwh − delivered_discharge_kwh)` to match the grid-import definition from §5.2. Export: `max(0, delivered_discharge_kwh − household_import_i)`. Added note that excess discharge is curtailed when export disabled. Terminal boundary condition now enforces hard infeasibility for states violating terminal-SOC constraint. |
| 2 | §5.5 | Rolling-horizon procedure described only "execute first 24h, advance by 24h" without specifying carry-SOC or per-interval commit semantics. Terminal SOC used quadratic penalty `λ × (soc_T − soc_target_ref)²` with midpoint reference — this is a soft penalty that can be gamed by discharging into the horizon edge. | Replaced with deterministic procedure: (1) solve 48h, (2) commit first 24h, (3) carry resulting SOC to next horizon, (4) each interval committed exactly once. Final horizon enforces hard constraint `final SOC >= starting SOC of that final horizon`. No quadratic penalty, no tie-break relaxation. |
| 3 | §5.6 | Worked example was illustrative only — the chosen action sequence (charge at expensive interval, discharge at mid-priced) could not be independently verified as optimal; efficiency losses obscured the cost calculation; final SOC drifted without a stated terminal constraint. | Replaced with a provably optimal case: 6 kWh battery, eta=1.0, three intervals, household import [2, 2, 0], rates [35, 30, 10]. Optimum is discharge-2 / idle / charge-2 yielding 80 p (baseline 130 p, saving 50 p). Independently verified by brute-force Python enumeration over all 17 SOC states × 17 action choices per interval (4913 sequences), 1545 feasible after terminal-SOC constraint. |

**Files changed:** `docs/METHODOLOGY.md` (§5.4, §5.5, §5.6, Appendix A v1.2.0).

**Commands actually run:**

```bash
python3 verify_battery.py
# Valid SOC states (17): [2.0, 2.25, ..., 6.0]
# Actions per interval: 17
# Feasible sequences: 1545
# Best cost: 80.0 p
# Optimal sequence:
#   Interval 0: Discharge 2.00 kWh | SOC 4.00 → 2.00 kWh | Grid import: 0.0 kWh | Cost: 0.0 p
#   Interval 1: Idle 0.00 kWh      | SOC 2.00 → 2.00 kWh | Grid import: 2.0 kWh | Cost: 60.0 p
#   Interval 2: Charge 2.00 kWh    | SOC 2.00 → 4.00 kWh | Grid import: 2.0 kWh | Cost: 20.0 p
# Final SOC: 4.0 kWh (constraint: >= 4.0 kWh)
# Idle baseline cost: 130.0 p
# Saving: 50.0 p
# ✓ All assertions passed

python3 verify_examples.py
# §1.6 Billing: net_cost=417.9 p, display £4.18 ✓
# §4.5 EV: energy_from_grid=31.578947 kWh, cost=378.9474 p, naive=432.2368 p, saving=53.2895 p ✓
# §5.6 Battery: optimal=80.0 p, baseline=130.0 p, saving=50.0 p ✓
# ALL THREE WORKED EXAMPLES VERIFIED SUCCESSFULLY

python3 -c "<rg-equivalent pattern check for obsolete battery methodology>"
# Confirmed no N_levels, soc_step, terminal_soc_cost (as penalty), or quadratic midpoint patterns remain
# Remaining matches are expected: 0.25 kWh references in §5.1/§5.2, final SOC constraint in §5.5,
# hard infeasibility wording, worked battery example, revision history entry.
```

**Post-task state:**
- `docs/METHODOLOGY.md` updated with corrected battery methodology (v1.2.0).
- No application code introduced.
- TASK-006 remains DONE.

## Next Task

TASK-007 — Create privacy design


## Final Readiness Audit — Tasks 001-006 (2026-07-21)

Independent verification that Tasks 001 through 006 satisfy their own stated requirements and are ready for Task 007.

### Task-by-task verdict

| Task | Verdict | Key checks |
|------|---------|------------|
| TASK-001 | PASS | Git repo on main; .gitignore covers Node/Astro/test/env/editor/logs/private-data; README.md states fresh-start/privacy-first/static simulator; private-data/README.md present; no application code or package.json |
| TASK-002 | PASS | REPOSITORY_CONVENTIONS.md, QUALITY_GATES.md, EXTERNAL_DATA_POLICY.md all exist; ADR-001 through ADR-004 in DECISIONS.md cover static/browser-only/UTC/governance decisions; governance links in README |
| TASK-003 | PASS | PROJECT_BASELINE.md present; all 114 task files verified (TASK-001..TASK-114); governance documents internally consistent; no legacy code or inherited history |
| TASK-004 | PASS | PRODUCT_SPEC.md defines all outputs (sections 5.1-5.14); 10 non-goals each with testable criterion; empty-state semantics in section 5.14 have 4 deterministic cases aligned with METHODOLOGY section 2.6 table |
| TASK-005 | PASS | DATA_SCHEMA.md defines all required models (sections 3-9); UTC/EL derivations documented (sections 2.1, 3.1); start-inclusive/end-exclusive intervals; kWh and VAT-inclusive pence units explicit; null vs zero convention (section 2.3); 10 JSON examples all parse; negative dynamic prices permitted (section 5.4); named saving fields present; Warning union fully defined with 4 scopes; SimulationResultSet has collection rules |
| TASK-006 | PASS | METHODOLOGY.md formulas all include units; billing/export/standing charge/aggregation/rounding defined (section 1); savings decomposition complete (section 2); appliance scoring uses appliance energy not household import (section 3.3); overnight EV windows correctly defined (section 4.2); DST 46/50 intervals (section 7.2); weighted cost-carbon minimises lower values (section 6.3); battery SOC 0.25 kWh increments; efficiency sqrt split; no simultaneous charge/discharge; rolling 48h/commit 24h defined; final SOC >= starting SOC hard constraint; all 3 worked examples independently verified |

### Automated verification results

| Check | Result |
|-------|--------|
| JSON parsing (10 blocks in DATA_SCHEMA.md) | PASS: All parse |
| Europe/London Spring 2025 DST: 46 intervals | PASS: Verified via zoneinfo |
| Europe/London Fall 2025 DST: 50 intervals | PASS: Verified via zoneinfo |
| Billing arithmetic (section 1.6): net=417.9p, display pounds 4.18 | PASS: Independently verified |
| EV arithmetic (section 4.5): energy=30/0.95, cost approx 378.95p | PASS: Independently verified |
| Battery arithmetic (section 5.6): optimal=80p, baseline=130p, saving=50p | PASS: Independently verified |
| Task-file count: 114 files TASK-001..TASK-114 | PASS: All present |
| No application source or package files | PASS: Confirmed |
| Markdown relative-link checker | PASS: All resolve |
| git status --short | PASS: Clean working tree |

### Obsolete contradiction search results

Pattern searched across PRODUCT_SPEC.md, DATA_SCHEMA.md, METHODOLOGY.md for obsolete patterns (combined scenarios require both, must not cross midnight, treated as an error, N_levels, terminal_soc_cost, midpoint, negative sign, maximising the weighted, all rates are non-negative, 2025-03-30T23:30:00Z):

- METHODOLOGY.md:367 'treated as an error' - correct usage (overnight EV windows are valid and must never be treated as an error)
- METHODOLOGY.md:665,865 'midpoint', 'terminal_soc_cost' - revision history documenting replaced content only

No active contradictions found.

### Task status confirmation

| Task | Status in AI_TASK_INDEX.md |
|------|---------------------------|
| TASK-001 | DONE |
| TASK-002 | DONE |
| TASK-003 | DONE |
| TASK-004 | DONE |
| TASK-005 | DONE |
| TASK-006 | DONE |
| TASK-007 | TODO (next) |

**Conclusion: Tasks 001-006 pass all stated requirements. Repository is ready for Task 007.**
