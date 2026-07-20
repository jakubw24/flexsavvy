# FlexSavvy AI Task Index

This queue builds a new repository from an empty directory. Run tasks in numerical order.

Status values: `TODO`, `IN PROGRESS`, `DONE`, `BLOCKED`.

| ID | Status | Phase | Title | Dependencies | Network | Risk |
|---|---|---|---|---|---|---|
| [001](ai-tasks/TASK-001.md) | DONE | 0 — Fresh start initialization | Initialize the empty FlexSavvy repository | None | `none` | low |
| [002](ai-tasks/TASK-002.md) | DONE | 0 — Fresh start initialization | Establish project governance and source-of-truth structure | 001 | `none` | low |
| [003](ai-tasks/TASK-003.md) | TODO | 0 — Fresh start initialization | Validate the fresh-start baseline | 001, 002 | `none` | low |
| [004](ai-tasks/TASK-004.md) | TODO | 1 — Product documentation | Create product specification | 003 | `none` | high |
| [005](ai-tasks/TASK-005.md) | TODO | 1 — Product documentation | Create canonical data schema | 004 | `none` | critical |
| [006](ai-tasks/TASK-006.md) | TODO | 1 — Product documentation | Create calculation methodology | 004, 005 | `none` | critical |
| [007](ai-tasks/TASK-007.md) | TODO | 1 — Product documentation | Create privacy design | 004, 005 | `none` | critical |
| [008](ai-tasks/TASK-008.md) | TODO | 1 — Product documentation | Documentation traceability audit | 004, 005, 006, 007 | `none` | high |
| [009](ai-tasks/TASK-009.md) | TODO | 2 — Application foundation | Bootstrap or verify static Astro and React application | 008 | `packages` | high |
| [010](ai-tasks/TASK-010.md) | TODO | 2 — Application foundation | Configure strict TypeScript and repository scripts | 009 | `packages` | medium |
| [011](ai-tasks/TASK-011.md) | TODO | 2 — Application foundation | Configure Vitest and Playwright | 009, 010 | `packages` | medium |
| [012](ai-tasks/TASK-012.md) | TODO | 2 — Application foundation | Create static pages, layout and navigation | 009, 010, 011 | `none` | medium |
| [013](ai-tasks/TASK-013.md) | TODO | 2 — Application foundation | Create CI and audit static output | 009, 010, 011, 012 | `packages` | high |
| [014](ai-tasks/TASK-014.md) | TODO | 3 — Domain schemas | Implement shared primitives, warnings and units | 013 | `none` | high |
| [015](ai-tasks/TASK-015.md) | TODO | 3 — Domain schemas | Implement consumption and quality schemas | 014 | `none` | critical |
| [016](ai-tasks/TASK-016.md) | TODO | 3 — Domain schemas | Implement tariff and pricing schemas | 014 | `none` | critical |
| [017](ai-tasks/TASK-017.md) | TODO | 3 — Domain schemas | Implement appliance, EV, battery and carbon schemas | 014 | `none` | critical |
| [018](ai-tasks/TASK-018.md) | TODO | 3 — Domain schemas | Implement scenario and result schemas; audit domain layer | 015, 016, 017 | `none` | critical |
| [019](ai-tasks/TASK-019.md) | TODO | 4 — Generic import | Implement browser file selection, limits and safe reading | 018 | `none` | critical |
| [020](ai-tasks/TASK-020.md) | TODO | 4 — Generic import | Implement CSV parsing and delimiter detection | 019 | `none` | high |
| [021](ai-tasks/TASK-021.md) | TODO | 4 — Generic import | Implement numeric parsing and unit conversion | 020 | `none` | critical |
| [022](ai-tasks/TASK-022.md) | TODO | 4 — Generic import | Implement timestamps with explicit offsets | 020 | `none` | critical |
| [023](ai-tasks/TASK-023.md) | TODO | 4 — Generic import | Implement naive timestamp and DST handling | 022 | `none` | critical |
| [024](ai-tasks/TASK-024.md) | TODO | 4 — Generic import | Implement column detection and mapping model | 020, 021, 022, 023 | `none` | critical |
| [025](ai-tasks/TASK-025.md) | TODO | 4 — Generic import | Implement generic consumption adapter | 021, 022, 023, 024 | `none` | critical |
| [026](ai-tasks/TASK-026.md) | TODO | 5 — Adapters and quality | Implement adapter contract and confidence selection | 025 | `none` | high |
| [027](ai-tasks/TASK-027.md) | TODO | 5 — Adapters and quality | Implement n3rgy CSV adapter | 026 | `fixture-only` | critical |
| [028](ai-tasks/TASK-028.md) | TODO | 5 — Adapters and quality | Implement multiple-device and replacement resolution | 027 | `none` | critical |
| [029](ai-tasks/TASK-029.md) | TODO | 5 — Adapters and quality | Implement Octopus JSON and CSV consumption adapters | 026 | `fixture-only` | critical |
| [030](ai-tasks/TASK-030.md) | TODO | 5 — Adapters and quality | Implement expected, missing and duplicate intervals | 025, 028, 029 | `none` | critical |
| [031](ai-tasks/TASK-031.md) | TODO | 5 — Adapters and quality | Implement statistics and extreme-value warnings | 030 | `none` | high |
| [032](ai-tasks/TASK-032.md) | TODO | 5 — Adapters and quality | Implement acceptance, confidence and quality report | 030, 031 | `none` | critical |
| [033](ai-tasks/TASK-033.md) | TODO | 6 — Tariffs and billing | Implement flat tariff resolution | 018, 032 | `none` | critical |
| [034](ai-tasks/TASK-034.md) | TODO | 6 — Tariffs and billing | Implement basic TOU resolution | 033 | `none` | critical |
| [035](ai-tasks/TASK-035.md) | TODO | 6 — Tariffs and billing | Add overnight, weekday and DST-safe TOU periods | 034 | `none` | critical |
| [036](ai-tasks/TASK-036.md) | TODO | 6 — Tariffs and billing | Implement TOU overlap priority, eligibility and validity | 035 | `none` | critical |
| [037](ai-tasks/TASK-037.md) | TODO | 6 — Tariffs and billing | Implement interval pricing and missing-price handling | 033 | `none` | critical |
| [038](ai-tasks/TASK-038.md) | TODO | 6 — Tariffs and billing | Implement export pricing resolution | 033, 035, 036, 037 | `none` | critical |
| [039](ai-tasks/TASK-039.md) | TODO | 6 — Tariffs and billing | Build manual tariff forms and rate CSV import | 033, 035, 036, 037, 038 | `none` | critical |
| [040](ai-tasks/TASK-040.md) | TODO | 6 — Tariffs and billing | Implement interval billing and standing charges | 033, 035, 036, 037, 038 | `none` | critical |
| [041](ai-tasks/TASK-041.md) | TODO | 6 — Tariffs and billing | Implement aggregation, savings decomposition and precision audit | 040 | `none` | critical |
| [042](ai-tasks/TASK-042.md) | TODO | 7 — Octopus catalogue | Implement isolated Octopus public API client with fixtures | 016, 041 | `fixture-only` | critical |
| [043](ai-tasks/TASK-043.md) | TODO | 7 — Octopus catalogue | Synchronize products and regional tariffs | 042 | `fixture-only` | critical |
| [044](ai-tasks/TASK-044.md) | TODO | 7 — Octopus catalogue | Synchronize standing charges and historical rates | 043 | `fixture-only` | critical |
| [045](ai-tasks/TASK-045.md) | TODO | 7 — Octopus catalogue | Normalize catalogue and generate browser index | 043, 044 | `none` | critical |
| [046](ai-tasks/TASK-046.md) | TODO | 7 — Octopus catalogue | Implement atomic catalogue writing and validation | 045 | `none` | critical |
| [047](ai-tasks/TASK-047.md) | TODO | 7 — Octopus catalogue | Add scheduled workflow and limited live verification | 042, 043, 044, 045, 046 | `limited-live` | critical |
| [048](ai-tasks/TASK-048.md) | TODO | 8 — Appliance optimisation | Implement appliance profiles and candidate generation | 017, 041 | `none` | critical |
| [049](ai-tasks/TASK-049.md) | TODO | 8 — Appliance optimisation | Implement constraints and baseline subtraction | 048 | `none` | critical |
| [050](ai-tasks/TASK-050.md) | TODO | 8 — Appliance optimisation | Implement appliance cost and carbon scoring | 048, 049, 041 | `none` | critical |
| [051](ai-tasks/TASK-051.md) | TODO | 8 — Appliance optimisation | Add editable templates, UI and results | 048, 049, 050 | `none` | high |
| [052](ai-tasks/TASK-052.md) | TODO | 8 — Appliance optimisation | Verify appliance optimiser with brute force and invariants | 048, 049, 050, 051 | `none` | critical |
| [053](ai-tasks/TASK-053.md) | TODO | 9 — EV optimisation | Implement EV validation and energy requirement | 017, 041 | `none` | critical |
| [054](ai-tasks/TASK-054.md) | TODO | 9 — EV optimisation | Implement plug-in windows and capacity | 053 | `none` | critical |
| [055](ai-tasks/TASK-055.md) | TODO | 9 — EV optimisation | Implement cheapest-interval allocation | 054, 041 | `none` | critical |
| [056](ai-tasks/TASK-056.md) | TODO | 9 — EV optimisation | Implement future and shift-existing modes | 053, 054, 055 | `none` | critical |
| [057](ai-tasks/TASK-057.md) | TODO | 9 — EV optimisation | Complete EV outputs, UI and audit | 053, 054, 055, 056 | `none` | critical |
| [058](ai-tasks/TASK-058.md) | TODO | 10 — Battery optimisation | Implement battery constraints and SOC discretisation | 017, 041 | `none` | critical |
| [059](ai-tasks/TASK-059.md) | TODO | 10 — Battery optimisation | Implement actions and state transitions | 058 | `none` | critical |
| [060](ai-tasks/TASK-060.md) | TODO | 10 — Battery optimisation | Implement grid flow and interval cost | 059, 041 | `none` | critical |
| [061](ai-tasks/TASK-061.md) | TODO | 10 — Battery optimisation | Implement single-horizon dynamic programming | 058, 059, 060 | `none` | critical |
| [062](ai-tasks/TASK-062.md) | TODO | 10 — Battery optimisation | Add terminal SOC and rolling 48-hour horizons | 061 | `none` | critical |
| [063](ai-tasks/TASK-063.md) | TODO | 10 — Battery optimisation | Implement grid-charging and export restrictions | 060, 062 | `none` | critical |
| [064](ai-tasks/TASK-064.md) | TODO | 10 — Battery optimisation | Implement battery metrics and results | 062, 063 | `none` | critical |
| [065](ai-tasks/TASK-065.md) | TODO | 10 — Battery optimisation | Move optimisation to cancellable worker and audit optimality | 061, 062, 063, 064 | `none` | critical |
| [066](ai-tasks/TASK-066.md) | TODO | 11 — Carbon data | Implement carbon adapter contract and fixtures | 018, 041 | `fixture-only` | high |
| [067](ai-tasks/TASK-067.md) | TODO | 11 — Carbon data | Implement regional fetch and public cache | 066 | `fixture-only` | critical |
| [068](ai-tasks/TASK-068.md) | TODO | 11 — Carbon data | Normalize and match carbon intervals | 066, 067 | `none` | critical |
| [069](ai-tasks/TASK-069.md) | TODO | 11 — Carbon data | Implement emissions and transparent weighted scoring | 068 | `none` | critical |
| [070](ai-tasks/TASK-070.md) | TODO | 11 — Carbon data | Integrate graceful failure and live-check carbon | 066, 067, 068, 069 | `limited-live` | critical |
| [071](ai-tasks/TASK-071.md) | TODO | 12 — Simulator wizard | Implement typed wizard state and reducer | 018, 032, 039, 052, 057, 065, 070 | `none` | critical |
| [072](ai-tasks/TASK-072.md) | TODO | 12 — Simulator wizard | Implement validation, navigation and progress | 071 | `none` | critical |
| [073](ai-tasks/TASK-073.md) | TODO | 12 — Simulator wizard | Build data source, upload and mapping steps | 019, 024, 025, 026, 027, 029, 071, 072 | `none` | critical |
| [074](ai-tasks/TASK-074.md) | TODO | 12 — Simulator wizard | Build quality and current tariff steps | 032, 039, 071, 072, 073 | `none` | critical |
| [075](ai-tasks/TASK-075.md) | TODO | 12 — Simulator wizard | Build candidate tariff selection | 039, 047, 071, 072, 074 | `none` | critical |
| [076](ai-tasks/TASK-076.md) | TODO | 12 — Simulator wizard | Build appliance configuration step | 051, 071, 072 | `none` | high |
| [077](ai-tasks/TASK-077.md) | TODO | 12 — Simulator wizard | Build EV and battery configuration steps | 057, 065, 071, 072 | `none` | critical |
| [078](ai-tasks/TASK-078.md) | TODO | 12 — Simulator wizard | Implement simulation coordinator and worker orchestration | 041, 052, 057, 065, 070, 071, 072, 073, 074, 075, 076, 077 | `none` | critical |
| [079](ai-tasks/TASK-079.md) | TODO | 12 — Simulator wizard | Complete run step, deletion, accessibility and responsive audit | 071, 072, 073, 074, 075, 076, 077, 078 | `none` | critical |
| [080](ai-tasks/TASK-080.md) | TODO | 13 — Results dashboard | Implement summary, decomposition and confidence | 041, 078, 079 | `none` | critical |
| [081](ai-tasks/TASK-081.md) | TODO | 13 — Results dashboard | Implement tariff table and savings waterfall | 080 | `none` | high |
| [082](ai-tasks/TASK-082.md) | TODO | 13 — Results dashboard | Implement monthly and load-profile visualisations | 080 | `none` | critical |
| [083](ai-tasks/TASK-083.md) | TODO | 13 — Results dashboard | Implement appliance, EV and battery schedules | 051, 057, 064, 080 | `none` | critical |
| [084](ai-tasks/TASK-084.md) | TODO | 13 — Results dashboard | Implement carbon, warnings and assumptions | 069, 070, 080 | `none` | high |
| [085](ai-tasks/TASK-085.md) | TODO | 13 — Results dashboard | Audit results accessibility, responsiveness and reconciliation | 080, 081, 082, 083, 084 | `none` | critical |
| [086](ai-tasks/TASK-086.md) | TODO | 14 — Report export | Implement scenario JSON and interval CSV export | 018, 085 | `none` | critical |
| [087](ai-tasks/TASK-087.md) | TODO | 14 — Report export | Implement printable HTML report | 085 | `none` | high |
| [088](ai-tasks/TASK-088.md) | TODO | 14 — Report export | Implement client-side PDF generation | 087 | `packages` | critical |
| [089](ai-tasks/TASK-089.md) | TODO | 14 — Report export | Audit export privacy and consistency | 086, 087, 088 | `none` | critical |
| [090](ai-tasks/TASK-090.md) | TODO | 15 — Privacy and security | Create executable data inventory and network policy | 007, 089 | `none` | critical |
| [091](ai-tasks/TASK-091.md) | TODO | 15 — Privacy and security | Implement central fetch wrapper and deny-list | 090 | `none` | critical |
| [092](ai-tasks/TASK-092.md) | TODO | 15 — Privacy and security | Audit persistence, deletion and analytics boundary | 079, 090, 091 | `none` | critical |
| [093](ai-tasks/TASK-093.md) | TODO | 15 — Privacy and security | Implement security headers and CSP guidance | 091, 092 | `none` | high |
| [094](ai-tasks/TASK-094.md) | TODO | 15 — Privacy and security | Run browser network interception and privacy audit | 090, 091, 092, 093 | `none` | critical |
| [095](ai-tasks/TASK-095.md) | TODO | 16 — Static guidance and SEO | Implement SEO primitives, sitemap and robots | 012, 094 | `none` | high |
| [096](ai-tasks/TASK-096.md) | TODO | 16 — Static guidance and SEO | Create smart-meter download and n3rgy guides | 095 | `none` | medium |
| [097](ai-tasks/TASK-097.md) | TODO | 16 — Static guidance and SEO | Create Octopus import and TOU tariff guides | 095 | `none` | medium |
| [098](ai-tasks/TASK-098.md) | TODO | 16 — Static guidance and SEO | Create EV charging and battery-value guides | 095 | `none` | medium |
| [099](ai-tasks/TASK-099.md) | TODO | 16 — Static guidance and SEO | Create privacy and methodology guides; audit content | 095, 096, 097, 098 | `none` | high |
| [100](ai-tasks/TASK-100.md) | TODO | 17 — Validation suite | Create canonical deterministic fixture library | 099 | `none` | critical |
| [101](ai-tasks/TASK-101.md) | TODO | 17 — Validation suite | Harden billing, tariff and DST tests | 100 | `none` | critical |
| [102](ai-tasks/TASK-102.md) | TODO | 17 — Validation suite | Harden appliance and EV property tests | 100 | `none` | critical |
| [103](ai-tasks/TASK-103.md) | TODO | 17 — Validation suite | Harden battery invariants and brute-force tests | 100 | `none` | critical |
| [104](ai-tasks/TASK-104.md) | TODO | 17 — Validation suite | Harden worker, cancellation and privacy tests | 100 | `none` | critical |
| [105](ai-tasks/TASK-105.md) | TODO | 17 — Validation suite | Complete E2E scenarios and mutation-oriented audit | 100, 101, 102, 103, 104 | `none` | critical |
| [106](ai-tasks/TASK-106.md) | TODO | 18 — Production deployment | Audit production build and code splitting | 105 | `none` | critical |
| [107](ai-tasks/TASK-107.md) | TODO | 18 — Production deployment | Verify routes, asset paths and cache policy | 106 | `none` | critical |
| [108](ai-tasks/TASK-108.md) | TODO | 18 — Production deployment | Create deployment scripts and header configs | 093, 107 | `none` | high |
| [109](ai-tasks/TASK-109.md) | TODO | 18 — Production deployment | Implement rollback and smoke procedures | 108 | `none` | high |
| [110](ai-tasks/TASK-110.md) | TODO | 18 — Production deployment | Run release-readiness engineering audit | 106, 107, 108, 109 | `packages` | critical |
| [111](ai-tasks/TASK-111.md) | TODO | 19 — Beta readiness | Create safe sample data and demo mode | 110 | `none` | critical |
| [112](ai-tasks/TASK-112.md) | TODO | 19 — Beta readiness | Implement privacy-safe funnel instrumentation interface | 092, 111 | `none` | critical |
| [113](ai-tasks/TASK-113.md) | TODO | 19 — Beta readiness | Implement feature-entitlement architecture without provider | 111, 112 | `none` | critical |
| [114](ai-tasks/TASK-114.md) | TODO | 19 — Beta readiness | Create final beta launch checklist and handoff | 110, 111, 112, 113 | `none` | critical |
