# FlexSavvy

A privacy-first, static UK household electricity flexibility simulator.

## What it does

FlexSavvy helps UK households understand their electricity costs and explore savings from:

1. **Tariff switching** — cost comparison using real half-hourly consumption data.
2. **Load flexibility** — moving appliance, EV, and battery schedules to cheaper intervals.
3. **Combined optimisation** — the maximum achievable saving when both levers are used together.

All calculations run entirely in your browser. No smart-meter data is uploaded or stored server-side.

## Architecture

- Fully static Astro site with an interactive React and TypeScript application.
- Heavy computation runs in a Web Worker.
- No Node.js production server, API routes, database, or account system.
- Smart-meter data remains inside the browser.

## Privacy

- Never transmits consumption intervals, filenames, device IDs, or tariff inputs.
- No third-party scripts in the simulator.
- No default persistence of sensitive state.

## Development

Implementation is controlled by the task index:

- [AI Task Index](docs/AI_TASK_INDEX.md) — full task list with dependencies and status
- [Progress Tracker](docs/PROGRESS.md) — current state and completed tasks
- [Decisions](docs/DECISIONS.md) — architectural decision records
- [Agent Rules](AGENTS.md) — permanent engineering rules for AI-assisted development

### Governance

- [Repository Conventions](docs/REPOSITORY_CONVENTIONS.md) — source layout, naming, module boundaries, and commit policy
- [Quality Gates](docs/QUALITY_GATES.md) — mandatory verification commands per task
- [External Data Policy](docs/EXTERNAL_DATA_POLICY.md) — offline testing, fixture provenance, and API rules

Run tasks in numerical order. Each task is self-contained and reviewable.

## License

To be determined.
