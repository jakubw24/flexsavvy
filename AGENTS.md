# FlexSavvy — Permanent AI Engineering Rules

## Product
FlexSavvy is a privacy-first UK household electricity flexibility simulator built as a fully static Astro site with an interactive React and TypeScript application.

The product must calculate and explain separately:
1. current electricity cost;
2. tariff-only saving without behavioural change;
3. flexibility-only saving from moving loads;
4. combined saving;
5. appliance, EV and battery schedules;
6. carbon effects when available;
7. the actions required to achieve the saving.

Do not reduce the product to a generic tariff comparison site.

## Architecture
- Production output must be ordinary static files.
- No Node.js production server, API routes, upload endpoint, database or account system.
- Smart-meter data remains inside the browser.
- Heavy calculations run in a Web Worker.
- Public tariff and carbon data use narrowly scoped adapters.
- Automated tests run without internet access.

## Data and privacy
- Never transmit consumption intervals, filenames, device IDs, meter identifiers, tariff inputs, household schedules or derived household results.
- Do not add third-party scripts to `/simulator`.
- Do not persist sensitive simulator state by default.
- Use UTC internally and Europe/London only for local tariff schedules and presentation.
- Never assume a local day contains 48 half-hour intervals.
- Treat intervals as start-inclusive and end-exclusive.
- Store energy in kWh and tariff rates in pence including VAT.
- Never silently interpolate consumption or dynamic prices.
- Do not log sensitive values.

## Engineering
- Use strict TypeScript.
- Avoid `any`.
- Prefer pure, deterministic modules.
- Isolate network access behind typed interfaces.
- Use committed fixtures for external APIs.
- Tests must use independently derived expected values.
- Do not reproduce production formulas inside the expected-value side of tests.
- Do not rewrite unrelated files.
- Inspect the repository before editing.
- Preserve correct existing code and repair only missing or incorrect behaviour.
- Never claim a command passed unless it was executed.
- Never claim a commit, push, workflow, merge or deployment without tool evidence.

## Git
- Work on the current branch unless instructed otherwise.
- Do not commit, push, merge or open a pull request unless explicitly instructed.
- Run `git status --short` and inspect the final diff.
- One task must remain one coherent reviewable change.

## Source of truth
Before each task read:
- `AGENTS.md`
- `docs/AI_WORKFLOW.md`
- `docs/AI_TASK_INDEX.md`
- `docs/PROGRESS.md`
- the current task file;
- relevant product, schema, methodology and privacy documents;
- relevant source and tests.

At the end of a successful task:
- update `docs/PROGRESS.md`;
- mark the matching task `DONE` in `docs/AI_TASK_INDEX.md`;
- record actual command outcomes, assumptions and risks.

## Required completion response
1. Files changed.
2. Behaviour implemented or verified.
3. Tests added or changed.
4. Commands executed and actual results.
5. Assumptions.
6. Remaining risks.
7. Suggested commit message.
8. Final `git status --short`.

Do not begin the next task automatically.
