# Repository Conventions

These conventions govern the FlexSavvy repository structure, naming, module organisation, and evidence practices. Every task and contributor must follow them.

## Source Layout

```
flexsavvy/
├── AGENTS.md                         # Permanent AI engineering rules (source of truth)
├── README.md                         # Root README with links to governance
├── .gitignore                        # Git ignore rules including private-data/*
├── MANUAL_ACTIONS.md                 # Manual decision gates the agent must not cross
│
├── docs/                             # Documentation and governance (non-application)
│   ├── AI_WORKFLOW.md                # Task execution workflow
│   ├── AI_TASK_INDEX.md              # Master task list with status
│   ├── PROGRESS.md                   # Progress tracker with command evidence
│   ├── DECISIONS.md                  # Architectural decision records (ADRs)
│   ├── IMPLEMENTATION_PLAN.md        # High-level implementation plan
│   ├── REPOSITORY_CONVENTIONS.md     # This file
│   ├── QUALITY_GATES.md             # Mandatory verification commands
│   ├── EXTERNAL_DATA_POLICY.md       # External data and fixture policy
│   └── ai-tasks/                     # Individual task specifications
│       ├── TASK-001.md
│       └── ...
│
├── private-data/                     # Local-only private datasets (never committed)
│   └── README.md                    # Placeholder explaining contents are excluded
│
├── src/                              # Application source code (created in Phase 2)
│   ├── components/                   # React UI components
│   ├── pages/                        # Astro page routes
│   ├── layouts/                      # Shared layouts
│   ├── lib/                          # Shared utility and domain logic
│   │   ├── domain/                  # Domain schemas, types, pure business logic
│   │   ├── adapters/                # Data adapter implementations (tariff, consumption)
│   │   ├── workers/                 # Web Worker code for heavy calculations
│   │   └── ui/                      # UI utilities shared by components
│   └── styles/                       # Global and component-level styles
│
├── public/                           # Static assets served at build time
│   └── ...
│
├── fixtures/                         # Committed test fixtures (public, non-sensitive)
│   ├── consumption/                  # Sample smart-meter CSV/JSON data (synthetic or anonymised)
│   ├── tariffs/                      # Tariff rate definitions for testing
│   └── carbon/                       # Carbon intensity fixture data
│
├── scripts/                          # Build and maintenance scripts (offline by default)
│   └── ...
│
├── __tests__/                        # Automated tests (run without internet access)
│   ├── unit/                         # Unit tests for pure modules
│   ├── integration/                  # Integration tests covering adapter + domain pipelines
│   └── e2e/                          # End-to-end browser tests (Playwright)
```

## Naming Conventions

| Concern | Convention |
|---------|------------|
| Directories | `kebab-case` |
| TypeScript source files | `camelCase.ts` or `kebab-case.ts` matching the exported entity name |
| Test files | Named `<module>.test.ts`; unit tests co-located under `src/`, integration and E2E tests under `__tests__/` |
| Fixture files | Named to reflect their origin and purpose: `<source>-<scenario>.<ext>` |
| Git branches | Feature branches: `task-XXX-short-description` |
| ADRs | `ADR-NNN` prefixed, sequential numbering in `docs/DECISIONS.md` |

## Module Boundaries

1. **Domain layer (`src/lib/domain/`)** — Pure TypeScript modules. No browser APIs, no network access, no side effects. Defines schemas, types, validation functions, and deterministic calculations.

2. **Adapters (`src/lib/adapters/`)** — Isolated implementations that translate external data formats (CSV, JSON) into domain types. Network access is behind typed interfaces; committed fixtures are the default data source in tests.

3. **Workers (`src/lib/workers/`)** — Heavy computation moved off the main thread. Receives domain-typed inputs, returns domain-typed results. No direct DOM or fetch access.

4. **UI layer (`src/components/`, `src/pages/`, `src/layouts/`)** — React components and Astro pages. May read from browser APIs (File API, localStorage for non-sensitive state). Must never transmit sensitive data.

5. **Tests (`src/**/*.test.ts` and `__tests__/`)** — Import only what is under test. Unit tests for pure domain modules are co-located as `<module>.test.ts` within `src/`. Integration and E2E tests live under `__tests__/integration/` and `__tests__/e2e/`. Expected values are independently derived, not copied from production formula outputs.

## Dependency Rules

- Application source may depend on `lib/domain` and `lib/adapters`.
- Adapters may depend on `lib/domain` types but never on other adapters.
- UI components may depend on domain types and adapter results but must not import adapter internals directly — communicate through published interfaces.
- Workers may depend on domain and adapters but must be loadable as isolated modules.
- Tests are independent of build output; they import source modules directly.
- Circular dependencies are forbidden. Break cycles by extracting shared types or interfaces into a parent module.

## Public Versus Private Fixtures

| Type | Location | Contents | Committed? |
|------|----------|----------|------------|
| **Public fixtures** | `fixtures/` | Synthetic data, anonymised samples, or publicly licensed datasets | Yes |
| **Private fixtures** | `private-data/` | Real customer data, supplier bills, unanonymised meter exports | No (`.gitignore`) |

- Public fixtures must never contain real meter IDs, filenames, addresses, or personal identifiers.
- Private fixtures are for local development and validation only. They must not be referenced in committed tests.
- Tests that require private data must use an environment variable or flag to optionally load them, with a clear failure message when unavailable.

## Generated-File Policy

- Build output (`dist/`, `.astro/`) is never committed.
- Generated type definitions may be committed only if they are deterministic and reproducible from committed source.
- Lock files (`package-lock.json`, `pnpm-lock.yaml`) are committed to ensure reproducible builds.
- Auto-formatted output (Prettier, ESLint fixes) is part of the same commit as the source change it was generated from — never a separate formatting-only commit unless requested.

## Commit and Task Evidence Policy

- One task = one coherent commit (or small series of squashed commits). Do not mix unrelated changes.
- Every commit message references its task ID: `task-XXX: description`.
- Command evidence (output of verification commands) is recorded in `docs/PROGRESS.md`.
- `git diff --check` must pass before claiming a task complete — no trailing whitespace, no merge conflict markers.
- AI agents must never claim a command passed unless the tool output confirms it.
