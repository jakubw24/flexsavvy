# FlexSavvy Implementation Plan

This plan creates FlexSavvy from an empty repository. No old application code or Git history is assumed.

The executable prompt for each item is under `docs/ai-tasks/`.

## 0 — Fresh start initialization

- **TASK-001: Initialize the empty FlexSavvy repository** — Turn the current empty task-pack directory into a clean Git repository with explicit fresh-start boundaries and progress tracking.
- **TASK-002: Establish project governance and source-of-truth structure** — Create the durable governance structure that every later task must follow.
- **TASK-003: Validate the fresh-start baseline** — Confirm that the project is genuinely clean, internally consistent and ready for product documentation.
## 1 — Product documentation

- **TASK-004: Create product specification** — Define users, promise, scope, journey, outputs and terminology.
- **TASK-005: Create canonical data schema** — Define canonical inputs, outputs, units and runtime constraints.
- **TASK-006: Create calculation methodology** — Specify deterministic formulas and edge-case behaviour.
- **TASK-007: Create privacy design** — Define browser-only processing and permitted network boundaries.
- **TASK-008: Documentation traceability audit** — Remove contradictions and map every output end to end.
## 2 — Application foundation

- **TASK-009: Bootstrap or verify static Astro and React application** — Create a fully static project shell while preserving correct existing work.
- **TASK-010: Configure strict TypeScript and repository scripts** — Make quality commands explicit and reproducible.
- **TASK-011: Configure Vitest and Playwright** — Establish offline unit and browser testing.
- **TASK-012: Create static pages, layout and navigation** — Build the accessible static shell.
- **TASK-013: Create CI and audit static output** — Mirror local validation in GitHub Actions and prove output is static.
## 3 — Domain schemas

- **TASK-014: Implement shared primitives, warnings and units** — Create reusable validated primitives.
- **TASK-015: Implement consumption and quality schemas** — Validate canonical intervals and data-quality outputs.
- **TASK-016: Implement tariff and pricing schemas** — Validate flat, TOU and interval tariff definitions.
- **TASK-017: Implement appliance, EV, battery and carbon schemas** — Validate all flexibility inputs and cross-field rules.
- **TASK-018: Implement scenario and result schemas; audit domain layer** — Complete runtime validation for complete scenarios and outputs.
## 4 — Generic import

- **TASK-019: Implement browser file selection, limits and safe reading** — Create the browser-only file ingestion boundary.
- **TASK-020: Implement CSV parsing and delimiter detection** — Parse raw CSV into rows with structured errors.
- **TASK-021: Implement numeric parsing and unit conversion** — Normalize supported numeric values to canonical kWh.
- **TASK-022: Implement timestamps with explicit offsets** — Normalize unambiguous timestamps to UTC and local derived fields.
- **TASK-023: Implement naive timestamp and DST handling** — Handle UK local timestamps without silently corrupting DST days.
- **TASK-024: Implement column detection and mapping model** — Suggest mappings with confidence while preserving user control.
- **TASK-025: Implement generic consumption adapter** — Convert parsed rows and confirmed mapping to canonical intervals.
## 5 — Adapters and quality

- **TASK-026: Implement adapter contract and confidence selection** — Create deterministic generic/n3rgy/Octopus adapter selection.
- **TASK-027: Implement n3rgy CSV adapter** — Normalize supported n3rgy exports.
- **TASK-028: Implement multiple-device and replacement resolution** — Require explicit choices for multiple meters and overlaps.
- **TASK-029: Implement Octopus JSON and CSV consumption adapters** — Normalize supported Octopus exports without credentials.
- **TASK-030: Implement expected, missing and duplicate intervals** — Calculate temporal coverage correctly across UK DST.
- **TASK-031: Implement statistics and extreme-value warnings** — Calculate metrics and flag suspicious values without deleting them.
- **TASK-032: Implement acceptance, confidence and quality report** — Turn quality metrics into transparent reject/warn/confidence outcomes.
## 6 — Tariffs and billing

- **TASK-033: Implement flat tariff resolution** — Resolve one deterministic VAT-inclusive flat import rate per eligible interval.
- **TASK-034: Implement basic TOU resolution** — Resolve local wall-time periods for simple same-day schedules.
- **TASK-035: Add overnight, weekday and DST-safe TOU periods** — Support complete UK local tariff schedules.
- **TASK-036: Implement TOU overlap priority, eligibility and validity** — Make complex tariff definitions deterministic and transparent.
- **TASK-037: Implement interval pricing and missing-price handling** — Resolve dynamic rates by exact UTC interval.
- **TASK-038: Implement export pricing resolution** — Resolve optional export tariffs independently.
- **TASK-039: Build manual tariff forms and rate CSV import** — Allow local definition of all supported tariffs.
- **TASK-040: Implement interval billing and standing charges** — Produce exact interval records and one standing charge per distinct local date.
- **TASK-041: Implement aggregation, savings decomposition and precision audit** — Complete exact billing and transparent savings.
## 7 — Octopus catalogue

- **TASK-042: Implement isolated Octopus public API client with fixtures** — Create a typed, mockable public API boundary.
- **TASK-043: Synchronize products and regional tariffs** — Build typed intermediate data for active domestic electricity products.
- **TASK-044: Synchronize standing charges and historical rates** — Retain all rates required for historical replay.
- **TASK-045: Normalize catalogue and generate browser index** — Convert API data into validated internal tariff definitions.
- **TASK-046: Implement atomic catalogue writing and validation** — Prevent failed synchronization from corrupting the last valid catalogue.
- **TASK-047: Add scheduled workflow and limited live verification** — Automate safe refresh and verify live response shape once.
## 8 — Appliance optimisation

- **TASK-048: Implement appliance profiles and candidate generation** — Represent contiguous cycles and exhaustively generate valid starts.
- **TASK-049: Implement constraints and baseline subtraction** — Apply power limits and safely remove a modelled current cycle.
- **TASK-050: Implement appliance cost and carbon scoring** — Select the deterministic best valid start.
- **TASK-051: Add editable templates, UI and results** — Expose useful assumptions and actionable output.
- **TASK-052: Verify appliance optimiser with brute force and invariants** — Prove optimality and energy preservation.
## 9 — EV optimisation

- **TASK-053: Implement EV validation and energy requirement** — Calculate required grid energy from supported inputs.
- **TASK-054: Implement plug-in windows and capacity** — Map sessions to actual half-hour intervals.
- **TASK-055: Implement cheapest-interval allocation** — Allocate fixed energy optimally within a session.
- **TASK-056: Implement future and shift-existing modes** — Apply optimized EV profiles with explicit modelling boundaries.
- **TASK-057: Complete EV outputs, UI and audit** — Expose schedules and prove allocation correctness.
## 10 — Battery optimisation

- **TASK-058: Implement battery constraints and SOC discretisation** — Create a finite valid battery state space.
- **TASK-059: Implement actions and state transitions** — Generate valid charge/idle/discharge transitions.
- **TASK-060: Implement grid flow and interval cost** — Calculate one transition's grid and monetary effects.
- **TASK-061: Implement single-horizon dynamic programming** — Find the least-cost valid path over a fixed horizon.
- **TASK-062: Add terminal SOC and rolling 48-hour horizons** — Prevent terminal dumping and support long data.
- **TASK-063: Implement grid-charging and export restrictions** — Constrain battery actions by scenario policy.
- **TASK-064: Implement battery metrics and results** — Transform optimized path into interval and summary outputs.
- **TASK-065: Move optimisation to cancellable worker and audit optimality** — Keep UI responsive and prove DP correctness.
## 11 — Carbon data

- **TASK-066: Implement carbon adapter contract and fixtures** — Create an optional public-data boundary.
- **TASK-067: Implement regional fetch and public cache** — Fetch only required public interval ranges and cache no private state.
- **TASK-068: Normalize and match carbon intervals** — Align intensities to exact UTC starts.
- **TASK-069: Implement emissions and transparent weighted scoring** — Calculate import emissions and optional cost-carbon decisions.
- **TASK-070: Integrate graceful failure and live-check carbon** — Complete optional integration and verify live response shape once.
## 12 — Simulator wizard

- **TASK-071: Implement typed wizard state and reducer** — Create a single deterministic state model for the 11-step flow.
- **TASK-072: Implement validation, navigation and progress** — Control movement through the wizard accessibly.
- **TASK-073: Build data source, upload and mapping steps** — Integrate all import routes into the wizard.
- **TASK-074: Build quality and current tariff steps** — Require understood data quality and a valid baseline tariff.
- **TASK-075: Build candidate tariff selection** — Select transparent valid comparison tariffs.
- **TASK-076: Build appliance configuration step** — Configure multiple explicit appliance models.
- **TASK-077: Build EV and battery configuration steps** — Configure optional validated EV and battery scenarios.
- **TASK-078: Implement simulation coordinator and worker orchestration** — Run baseline, candidates and selected flexibility consistently.
- **TASK-079: Complete run step, deletion, accessibility and responsive audit** — Finish the full mobile/desktop simulator workflow.
## 13 — Results dashboard

- **TASK-080: Implement summary, decomposition and confidence** — Lead with reconciled financial outcomes and confidence.
- **TASK-081: Implement tariff table and savings waterfall** — Explain how final cost is reached.
- **TASK-082: Implement monthly and load-profile visualisations** — Show temporal cost and consumption changes honestly.
- **TASK-083: Implement appliance, EV and battery schedules** — Turn optimizer results into actionable plans.
- **TASK-084: Implement carbon, warnings and assumptions** — Expose optional environmental output and limitations.
- **TASK-085: Audit results accessibility, responsiveness and reconciliation** — Verify every result surface and numeric identity.
## 14 — Report export

- **TASK-086: Implement scenario JSON and interval CSV export** — Provide local machine-readable outputs.
- **TASK-087: Implement printable HTML report** — Create a complete print-mode report.
- **TASK-088: Implement client-side PDF generation** — Generate the report locally as PDF.
- **TASK-089: Audit export privacy and consistency** — Verify all formats reconcile and stay local.
## 15 — Privacy and security

- **TASK-090: Create executable data inventory and network policy** — Translate privacy design into code classifications.
- **TASK-091: Implement central fetch wrapper and deny-list** — Fail closed on unknown or sensitive requests.
- **TASK-092: Audit persistence, deletion and analytics boundary** — Prevent sensitive retention and define safe event telemetry.
- **TASK-093: Implement security headers and CSP guidance** — Harden static deployment without breaking workers.
- **TASK-094: Run browser network interception and privacy audit** — Prove sentinel sensitive values never leave the browser.
## 16 — Static guidance and SEO

- **TASK-095: Implement SEO primitives, sitemap and robots** — Create reusable static metadata and guide structure.
- **TASK-096: Create smart-meter download and n3rgy guides** — Publish accurate import-focused guidance.
- **TASK-097: Create Octopus import and TOU tariff guides** — Explain supported data and pricing modes.
- **TASK-098: Create EV charging and battery-value guides** — Explain hardware modelling and limitations.
- **TASK-099: Create privacy and methodology guides; audit content** — Complete initial content and remove unsupported claims.
## 17 — Validation suite

- **TASK-100: Create canonical deterministic fixture library** — Build synthetic fixtures for all critical cases.
- **TASK-101: Harden billing, tariff and DST tests** — Prove exact billing over all canonical cases.
- **TASK-102: Harden appliance and EV property tests** — Prove energy conservation and allocation optimality.
- **TASK-103: Harden battery invariants and brute-force tests** — Prove physical consistency and DP optimality.
- **TASK-104: Harden worker, cancellation and privacy tests** — Verify concurrency and fail-closed privacy.
- **TASK-105: Complete E2E scenarios and mutation-oriented audit** — Ensure plausible critical defects are caught.
## 18 — Production deployment

- **TASK-106: Audit production build and code splitting** — Ensure efficient static output with no server assumptions.
- **TASK-107: Verify routes, asset paths and cache policy** — Make deployment reliable at root or configured base path.
- **TASK-108: Create deployment scripts and header configs** — Provide reproducible static deployment artifacts.
- **TASK-109: Implement rollback and smoke procedures** — Make releases recoverable and testable.
- **TASK-110: Run release-readiness engineering audit** — Verify architecture, privacy, calculations, tests and deployment from a clean install.
## 19 — Beta readiness

- **TASK-111: Create safe sample data and demo mode** — Let visitors use the full product without private data.
- **TASK-112: Implement privacy-safe funnel instrumentation interface** — Measure usability without collecting simulator values.
- **TASK-113: Implement feature-entitlement architecture without provider** — Prepare free/pro boundaries without exposing data.
- **TASK-114: Create final beta launch checklist and handoff** — Document all remaining operator actions and no-go gates.
