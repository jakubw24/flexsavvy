# FlexSavvy — Traceability Matrix

> Living document. Created by TASK-008 (2026-07-21).
> Maps every promised output to its input fields, formula, confidence handling, and privacy classification.
> Ensures no output is undefined, no formula is orphaned, and no forbidden field is untested.

---

## 1 — Output-to-Source Traceability

Every public output defined in PRODUCT_SPEC.md §5 is traced to:
- **Input fields** from DATA_SCHEMA.md
- **Formula** from METHODOLOGY.md or PRODUCT_SPEC.md
- **Confidence handling** per PRODUCT_SPEC.md §6
- **Privacy class** per PRIVACY_DESIGN.md §1

### 1.1 Current Cost (PRODUCT_SPEC §5.1)

| Dimension | Value |
|---|---|
| Output name | Current net cost (`current_net_cost`) |
| Product spec | PRODUCT_SPEC.md §5.1 |
| Schema type | `CurrentResult` (DATA_SCHEMA §8.2.1) |
| Input fields | `import_kwh`, `export_kwh`, `resolved_import_rate`, `resolved_export_rate`, `standing_charge`, distinct Europe/London dates derived from interval timestamps |
| Formula | METHODOLOGY.md §1.4: `net_cost = Σ import_cost_i + standing_charge_pence − Σ export_income_i` |
| Sub-formulas | Import: METHODOLOGY §1.1; Standing charge: METHODOLOGY §1.2; Export: METHODOLOGY §1.3 |
| Unit | Intermediate pence (`p`); display £ GBP rounded half-up to 0.01 (METHODOLOGY §1.5) |
| Privacy class | SHD — derived household result (PRIVACY_DESIGN §1.1) |
| Confidence label | High/Medium/Low per PRODUCT_SPEC §6.2 rules 1-8 |
| Replay/Projection | Determined by interval dates vs current UTC time (PRODUCT_SPEC §6.3) |

### 1.2 Tariff-Only Saving (PRODUCT_SPEC §5.2)

| Dimension | Value |
|---|---|
| Output name | Tariff-only saving per candidate tariff |
| Product spec | PRODUCT_SPEC.md §5.2 |
| Schema type | `TariffOnlyResult` (DATA_SCHEMA §8.2.2) |
| Input fields | Same as Current Cost + `candidate_tariff` definition (flat/TOU/dynamic rates, standing charge, optional export rate) |
| Formula | METHODOLOGY.md §2.2: `tariff_only_saving_c = current_net_cost − candidate_net_cost_c` |
| Derivation rule | Saving fields derive from unrounded canonical values (DATA_SCHEMA §8.7) |
| Unit | Pence (`p`) |
| Privacy class | SHD — derived household result (PRIVACY_DESIGN §1.1) |
| Confidence label | Inherited from scenario calculation; downgraded per same rules as current cost |
| Empty-state | Not produced when no candidate tariffs configured (PRODUCT_SPEC §5.14) |

### 1.3 Flexibility-Only Saving (PRODUCT_SPEC §5.3)

| Dimension | Value |
|---|---|
| Output name | Flexibility-only saving with appliance schedules |
| Product spec | PRODUCT_SPEC.md §5.3 |
| Schema type | `FlexibilityOnlyResult` (DATA_SCHEMA §8.2.3) |
| Input fields | `ApplianceProfile` (power_kw, cycle_duration_hours, earliest/latest start), optional `EVProfile`, optional `BatteryProfile`, current tariff rates, consumption intervals |
| Formula | METHODOLOGY.md §2.3: `flexibility_only_saving = current_net_cost − flexible_net_cost`; appliance optimisation via METHODOLOGY §3; EV via METHODOLOGY §4; battery via METHODOLOGY §5 |
| Sub-formulas | Appliance candidate scoring: METHODOLOGY §3.3; baseline subtraction: METHODOLOGY §3.4; portfolio optimisation: METHODOLOGY §3.5 |
| Unit | Pence (`p`) |
| Privacy class | SHD — household schedules and derived results (PRIVACY_DESIGN §1.1) |
| Confidence label | Downgraded per PRODUCT_SPEC §6.2 |
| Module availability | Appliance: always available; EV: conditional paid-ready; battery: conditional paid-ready (PRODUCT_SPEC §3.2) |
| Empty-state | When no flexible loads: saving = 0, appliance_schedules = `[]`, ScenarioWarning `NO_FLEXIBLE_LOADS` emitted |

### 1.4 Combined Saving (PRODUCT_SPEC §5.4)

| Dimension | Value |
|---|---|
| Output name | Combined saving with interaction effect |
| Product spec | PRODUCT_SPEC.md §5.4 |
| Schema type | `CombinedResult` (DATA_SCHEMA §8.2.4) |
| Input fields | Candidate tariff + flexible load declarations + consumption intervals |
| Formula | METHODOLOGY.md §2.4: `combined_saving_c = current_net_cost − combined_net_cost_c`; interaction: METHODOLOGY §2.5: `interaction = combined − (tariff_only + flexibility_only)` |
| Derivation rule | Saving fields derive from unrounded canonical values (DATA_SCHEMA §8.7) |
| Unit | Pence (`p`) |
| Privacy class | SHD — derived household result (PRIVACY_DESIGN §1.1) |
| Empty-state | Equals tariff-only when candidates exist but no flexible loads (PRODUCT_SPEC §5.14); not produced when no candidates |

### 1.5 Interval-Level Breakdown (PRODUCT_SPEC §5.5)

| Dimension | Value |
|---|---|
| Output name | Per-interval cost and warning breakdown |
| Product spec | PRODUCT_SPEC.md §5.5 |
| Schema type | `IntervalResult` (DATA_SCHEMA §8.3) — one per half-hour interval per scenario |
| Input fields | Per-interval: `utc_start`, `import_kwh`, `export_kwh`; matched import/export rates; scenario identity |
| Formula | Import cost: METHODOLOGY §1.1; Export income: METHODOLOGY §1.3; excluded intervals for unresolved rates |
| Unit | Energy in kWh, prices in p/kWh, costs in pence |
| Privacy class | SHD — per-interval breakdowns (PRIVACY_DESIGN §1.1) |
| Warnings | `IntervalWarning` entries only (DATA_SCHEMA §4.2.6 placement rules) |
| Reconciliation | Sum of interval costs + standing charges must equal scenario total_cost_pence exactly before display rounding (PRODUCT_SPEC §5.11) |

### 1.6 Daily and Monthly Aggregation (PRODUCT_SPEC §5.6, §5.12)

| Dimension | Value |
|---|---|
| Output name | Daily and monthly cost breakdowns |
| Product spec | PRODUCT_SPEC.md §5.6, §5.12 |
| Schema types | `DailyCostBreakdown` (DATA_SCHEMA §8.5), `MonthlyCostBreakdown` (DATA_SCHEMA §8.6) |
| Input fields | Derived from `IntervalResult` collection + standing charge per local date |
| Formula | Aggregation of interval costs by Europe/London local_date (daily) or local_month (monthly) |
| Unit | Pence (`p`) |
| Privacy class | SHD — derived household result (PRIVACY_DESIGN §1.1) |
| DST handling | A day may have 46, 48, or 50 half-hour intervals; standing charge once per distinct local date |
| Reconciliation | Sum of daily = sum of monthly = scenario total_cost_pence exactly before display rounding |

### 1.7 Per-Appliance Saving (PRODUCT_SPEC §5.7)

| Dimension | Value |
|---|---|
| Output name | Appliance-level saving estimate |
| Product spec | PRODUCT_SPEC.md §5.7 |
| Schema reference | Part of FlexibilityOnlyResult and CombinedResult; individual estimates are explanatory |
| Formula | METHODOLOGY §3.4: `appliance_saving_estimate = baseline_cost − min(candidate_appliance_cost)` |
| Unit | Pence (`p`) |
| Privacy class | SHD — household schedule (PRIVACY_DESIGN §1.1) |
| Non-additivity | UI must not sum isolated estimates into portfolio total (PRODUCT_SPEC §5.7, DATA_SCHEMA §9.4) |

### 1.8 Schedules (PRODUCT_SPEC §5.8)

| Dimension | Value |
|---|---|
| Output name | Recommended operating plans per flexible load |
| Product spec | PRODUCT_SPEC.md §5.8 |
| Schema types | `ApplianceSchedule` (§9.1), `EVSchedule` (§9.2), `BatteryDispatchSchedule` (§9.3) |
| Connection rules | DATA_SCHEMA §8.7 and §9.4 — appliance schedules always present (empty array when none configured); EV/battery absent when module unavailable |
| Privacy class | SHD — household schedules (PRIVACY_DESIGN §1.1) |
| Infeasibility | SCHEDULE_INFEASIBLE warning + schedule entry with null start and explanation |

### 1.9 Warnings (PRODUCT_SPEC §5.10)

| Dimension | Value |
|---|---|
| Output name | Scoped warnings: dataset, interval, scenario, optimisation |
| Product spec | PRODUCT_SPEC.md §5.10 |
| Schema types | `WarningBase`, `DatasetWarning`, `IntervalWarning`, `ScenarioWarning`, `OptimisationWarning` (DATA_SCHEMA §4.2.1-§4.2.5) |
| Union type | `Warning = DatasetWarning | IntervalWarning | ScenarioWarning | OptimisationWarning` (§4.2.6) |
| Placement rules | IntervalResult.warnings → only `IntervalWarning`; scenario/run level → full union |
| Privacy class | SHD when derived from user data (PRIVACY_DESIGN §3); TCS when purely computational |

### 1.10 Export Outputs (PRODUCT_SPEC §5.11, §5.12, §5.13)

| Output format | Product spec | Schema basis | Privacy class | Scope |
|---|---|---|---|---|
| Printable HTML report | §5.11, §5.13 | ScenarioResult + all sub-results | SHD — user-initiated download only | Public alpha |
| Interval CSV export | §5.11, §5.13 | IntervalResult collection | SHD — user-initiated download only | Public alpha |
| Scenario JSON (local) | §5.13 | SimulationResultSet + ScenarioConfiguration | SHD — user-initiated download only | Public alpha |
| Replay mode (upload) | §5.13 | Same as above | N/A — paid-ready, deferred | Paid-ready |

### 1.11 Confidence Labels (PRODUCT_SPEC §6)

| Dimension | Value |
|---|---|
| Product spec | PRODUCT_SPEC.md §6.1, §6.2 |
| Schema field | `confidence_label` on `ScenarioResult` and `DataQualityReport` (DATA_SCHEMA §4.1, §8.2) |
| Rules | 8 numbered downgrade rules in §6.2; final confidence = minimum across all applicable rules |
| Privacy class | TCS — computed from quality metrics, not itself sensitive data |

### 1.12 Replay/Projection Labels (PRODUCT_SPEC §6.3)

| Dimension | Value |
|---|---|
| Product spec | PRODUCT_SPEC.md §6.3 |
| Schema field | `replay_projection_label` on `ScenarioResult` (DATA_SCHEMA §8.2) |
| Determination | All interval dates in past AND all rates are actual historical rates → Replay; otherwise → Projection |
| Privacy class | TCS — computed classification |

---

## 2 — Engine Rule Acceptance Criteria

Every METHODOLOGY.md formula has at least one acceptance criterion that can be independently verified by a test.

| Rule ID | Methodology Section | Rule Description | Acceptance Criterion | Test Fixture Required |
|---|---|---|---|---|
| ER-001 | §1.1 | Per-interval import cost = import_kwh × resolved_import_rate | Given interval with 0.5 kWh at 28.5 p/kWh, import_cost = 14.25 p | Known rate and consumption |
| ER-002 | §1.1 | Missing import rate excludes interval from subtotal | Scenario with one unresolved-rate interval has that interval's cost excluded; warning emitted | Unresolved dynamic rate fixture |
| ER-003 | §1.1 | Measured zero kWh produces zero cost (not exclusion) | 0 kWh × any rate = 0 p, interval included in total | Zero consumption fixture |
| ER-004 | §1.2 | Standing charge once per distinct Europe/London date | 3-day span with gaps: standing_charge = rate × 3, not fewer | Multi-date fixture with gaps |
| ER-005 | §1.2 | DST days still receive exactly one standing charge | Spring-forward day (46 intervals): 1 standing charge; fall-back day (50 intervals): 1 standing charge | DST boundary fixture |
| ER-006 | §1.2 | Missing standing charge defaults to 0, confidence → Medium | No standing_charge provided: total includes 0 for standing; confidence downgraded per rule 7 | Tariff without standing charge |
| ER-007 | §1.3 | Export income requires BOTH export data and export rate | Export data present but no export rate → export_income = 0; export rate present but no export data → export_income = 0 | Missing-half export fixture |
| ER-008 | §1.4 | Net cost = Σ import + standing − export | Independently derived total matches formula for multi-interval dataset | Full billing fixture (METHODOLOGY §1.6) |
| ER-009 | §1.5 | Display rounding half-up to £0.01 only at presentation | Intermediate value 417.900 p displays as £4.18; internal computation uses full precision | Rounding edge case fixture |
| ER-010 | §2.2 | Tariff-only saving = current_net − candidate_net (no load shift) | Given identical intervals under two tariffs, saving equals the arithmetic difference | Two-tariff same-consumption fixture |
| ER-011 | §2.3 | Flexibility-only uses current tariff with optimised schedules | Optimisation result cost differs from baseline only by load repositioning, not rate change | Single-tariff appliance fixture |
| ER-012 | §2.4 | Combined = candidate tariff + optimised loads | Cost uses candidate rates AND shifted schedule; interaction effect ≠ 0 in general | Candidate + appliance fixture |
| ER-013 | §2.5 | Interaction = combined − (tariff_only + flexibility_only) | For a case where cheapest intervals differ between tariffs, interaction is non-zero | Multi-tariff multi-appliance fixture |
| ER-014 | §2.6 | Empty-state: no candidates → no tariff-only or combined results | SimulationResultSet.tariff_only_results and .combined_results are empty/absent | Minimal scenario fixture |
| ER-015 | §2.6 | Empty-state: no flexible loads → flexibility saving = 0 | FlexibilityOnlyResult.total_cost = CurrentResult.total_cost; saving_pence = 0; NO_FLEXIBLE_LOADS warning | No-appliance fixture |
| ER-016 | §3.1 | Candidate positions within declared window only | Appliance with window 06:00–20:00 and 5h cycle produces start positions from 06:00 through 15:00 only | Single-appliance feasibility fixture |
| ER-017 | §3.2 | Infeasible appliance → warning + excluded from optimisation | Window too narrow for cycle duration → SCHEDULING_INFEASIBLE warning, no schedule produced | Impossible window fixture |
| ER-018 | §3.3 | Appliance cost uses appliance energy profile (power × 0.5h), NOT household import_kwh | Candidate cost for 2.5 kW appliance over 5 intervals = 5×(2.5×0.5)×rate; differs from household interval sum | Appliance-isolated fixture |
| ER-019 | §3.3 | Baseline subtraction clips to zero (never negative) | When appliance energy > observed import at an interval, adjusted baseline clamped to 0 | Edge case: high appliance/low consumption fixture |
| ER-020 | §3.5 | Portfolio optimisation minimises joint cost | Multiple appliances optimised together produce lower cost than any single-appliance optimisation applied individually | Multi-appliance fixture |
| ER-021 | §4.1 | EV energy requirement = capacity × (target − current) / 100 ÷ efficiency | 60 kWh, 30%→80%, η=0.95 → energy_at_battery = 30 kWh; energy_from_grid = 30/0.95 kWh | EV worked example fixture |
| ER-022 | §4.2 | Overnight window valid (departure ≤ plug-in) | Window 23:00→07:00 produces 16 intervals on normal day, no error | Overnight EV fixture |
| ER-023 | §4.2 | DST spring-forward skips non-existent local slots | Spring-forward day in charging window → one fewer interval than nominal count | DST boundary fixture |
| ER-024 | §4.2 | DST fall-back adds extra interval at ambiguous hour | Fall-back day in charging window → one more interval than nominal count | DST boundary fixture |
| ER-025 | §4.3 | Cheapest-interval allocation fills cheapest first | Intervals sorted by rate ascending; cheapest filled to capacity before moving to next-cheapest | Multi-rate TOU fixture |
| ER-026 | §4.4 | Unmet energy when window insufficient | Window capacity < required energy → unmet_energy > 0, warning emitted, allocation still done greedily | Over-constrained EV fixture |
| ER-027 | §5.1 | SOC discretised to 0.25 kWh increments | Valid states for 6 kWh battery = {2.0, 2.25, ..., 6.0} (17 states) | Battery discretisation fixture |
| ER-028 | §5.1 | Half-step ties round downward | SOC 2.125 maps to 2.0 (floor), not 2.25 | Edge case mapping fixture |
| ER-029 | §5.2 | Charge/discharge split efficiency as sqrt of round_trip | η=0.81 → eta_charge = eta_discharge = 0.9 | Efficiency calculation fixture |
| ER-030 | §5.2 | No simultaneous charge and discharge | Only one of {charge, discharge, idle} per interval; SOC transition uses only the active action | Mutual exclusion invariant check |
| ER-031 | §5.4 | grid_import = max(0, household_import + grid_charge − delivered_discharge) | Discharge exceeding household import → grid_import = 0 (not negative); excess may export or curtail | Battery grid flow fixture |
| ER-032 | §5.4 | Terminal SOC states receive infinite cost in DP backward pass | Final interval: states with SOC < starting_SOC are pruned from feasible set | Hard constraint test fixture |
| ER-033 | §5.5 | Rolling 48h horizons, commit 24h, carry SOC | Each interval committed exactly once; no interval re-optimised in subsequent horizon | Multi-horizon rolling fixture |
| ER-034 | §5.5 | Final horizon enforces final SOC ≥ starting SOC of that horizon | Last horizon solution's terminal state satisfies constraint; violation makes solution infeasible | Final-horizon constraint fixture |
| ER-035 | §5.6 | Worked battery example independently verified by brute force | Optimum = 80 p for the given 3-interval case; baseline = 130 p; saving = 50 p | Brute-force enumeration fixture |
| ER-036 | §6.1 | Emissions = import_kwh × carbon_intensity per interval | Given intensity 200 gCO2e/kWh and 1 kWh import → 200 g CO2e | Carbon emission fixture |
| ER-037 | §6.2 | Missing carbon data → emissions = 0, warning emitted (not quality failure) | Interval without carbon data: emission contribution = 0; one IntervalWarning for missing carbon | Partial carbon fixture |
| ER-038 | §6.3 | Weighted scoring minimises lower values | cost_weight=1.0 selects cheapest candidate; carbon_weight=1.0 selects lowest-emission candidate | Weighted objective fixture |
| ER-039 | §6.3 | Zero-variance component → normalised value = 0 for all candidates | All candidates have identical cost (or emissions) → that component's contribution is 0 | Identical-cost fixture |
| ER-040 | §6.3 | Monetary totals unchanged by scoring mode | Switching from pure-cost to weighted objective does not alter computed net_cost values | Scoring-independence fixture |
| ER-041 | §7.1 | Missing consumption never interpolated or filled with zero | Gap in consumption data → interval excluded, warning emitted, total reflects gap | Missing-interval fixture |
| ER-042 | §7.1 | Duplicate timestamps block calculation until resolved | Unresolved duplicate → confidence = Low; interval cost not computed for that timestamp | Duplicate-timestamp fixture |
| ER-043 | §7.2 | DST spring-forward day has 46 intervals, fall-back has 50 | Expected interval count for dataset spanning DST boundary = correct count (not 48 × days) | DST-counting fixture |
| ER-044 | §7.3 | Annualisation uses 365.25 days/year with visible estimate label | daily_average × 365.25 produces annualised figure; UI labels as "estimate" | Annualisation fixture |

---

## 3 — Forbidden Field → Privacy Test Mapping

Every SHD field declared forbidden in PRIVACY_DESIGN.md must be covered by a planned privacy test. Tests are implemented in TASK-090–TASK-094 but specified here for traceability.

| SHD Field Category | Example Fields | Forbidden In (PRIVACY_DESIGN §3) | Test Coverage (PRIVACY_DESIGN §7) | Implementation Task |
|---|---|---|---|---|
| Consumption intervals | `import_kwh`, `export_kwh` | HTTP request body, query string, header, cache key | Payload content scan: regex against all outbound request bodies | TASK-091 |
| Interval timestamps (with consumption) | `utc_start` paired with kWh values | Same as above | Network interception: no outbound requests during simulation | TASK-094 |
| Filenames and paths | Upload filename, file path | HTTP request, cache key | File upload isolation test: no requests after file load | TASK-091 |
| Device/meter identifiers | MPAN, MPRN, serial number, device UUID | HTTP request body or query | Payload content scan; storage state post-upload check | TASK-092 |
| User-entered tariff data | Import rate, standing charge, export rate from forms | HTTP request body | Query string scan + cookie scan after simulation | TASK-094 |
| Household schedules | Appliance power/duration/window; EV plug-in times | HTTP request body | Network interception during optimisation run | TASK-094 |
| Derived results | Cost totals, savings, per-interval breakdowns, monthly aggregates | HTTP request body or query | Export download isolation: only blob URLs, no server uploads | TASK-091 |
| Quality report details | Missing interval counts, outlier flags (from user data) | HTTP request body | Post-simulation storage check: no results persisted | TASK-092 |

### 3.1 Test Completeness Check

The test strategy in PRIVACY_DESIGN §7 defines three categories:

1. **Network interception tests** (§7.2.1) — cover items 2, 6, 7 above
2. **Payload content tests** (§7.2.2) — cover items 1, 3, 4, 5 above
3. **Storage state tests** (§7.2.3) — cover items 4, 8 above

All eight SHD field categories have at least one planned test type mapped. No forbidden field is untested.

---

## 4 — Terminology Consistency Audit

Cross-document check of key terms across all four Phase-1 documents.

### 4.1 Term Definitions (Aligned)

| Term | PRODUCT_SPEC §7 | DATA_SCHEMA §2 | METHODOLOGY §1 | PRIVACY_DESIGN | Status |
|---|---|---|---|---|---|
| **Consumption interval** | Half-hour period with kWh value | Half-hourly Interval model (§3.1) | Per-interval import cost formula (§1.1) | Classified as SHD (§1.1) | ✓ Consistent |
| **Standing charge** | Fixed daily fee, once per local date, inclusive span | p/day in Tariff models (§5.1-§5.3) | p/day × N_dates, every date in span (§1.2) | Classified as SHD when user-entered (§1.1) | ✓ Consistent |
| **Export rate** | Optional, subtracted from cost | p/kWh including VAT (§5.1-§5.3) | Requires both data and rate (§1.3) | N/A — tariff input is SHD | ✓ Consistent |
| **Null vs zero** | Zero = measured, null = missing (§5.5) | §2.3: null ≠ 0, never conflated | §1.1: 0 kWh produces zero cost; null excluded | Referenced in cross-ref appendix A | ✓ Consistent |
| **UTC / Europe/London** | UTC for intervals, EL for local dates (§5.6) | §2.1: UTC timestamps, EL calendar | §7.2: DST transitions use EL boundaries | Referenced in appendix A | ✓ Consistent |
| **Half-hour interval** | 30-minute granularity throughout | §2.1: 1800 seconds canonical | All formulas use per-interval basis | N/A — structural concept | ✓ Consistent |
| **pence (intermediate)** | Monetary in pence until display (§5.9) | §2.2: intermediate calculations in pence | §1.4, §1.5: full precision, round only at display | N/A | ✓ Consistent |
| **kWh** | All energy in kWh | §2.2: energy unit = kWh | All consumption/production in kWh | N/A — unit convention | ✓ Consistent |
| **p/kWh (rates)** | Rates in pence per kWh including VAT | §2.2: p/kWh with VAT inclusive | Rate variable in formulas has p/kWh units | N/A | ✓ Consistent |
| **Confidence** | High/Medium/Low, 8 downgrade rules (§6) | `confidence_label` enum on results/quality report | Not directly — but quality conditions feed rules | N/A — TCS classification | ✓ Consistent |

### 4.2 Term Conflicts Found and Repaired

| Conflict ID | Location | Original Issue | Status |
|---|---|---|---|
| TC-001 | None active | Previously: "extreme values" vs "statistical outliers" in PRODUCT_SPEC §6 (repaired by TASK-004 corrective audit) | ✓ Resolved before this task |
| TC-002 | None active | Previously: negative-rate blanket prohibition in DATA_SCHEMA §5.4 (repaired by TASK-005 corrective audit — now split flat/TOU non-negative, dynamic may be negative) | ✓ Resolved before this task |
| TC-003 | None active | Previously: combined scenario "both required" contradiction in PRODUCT_SPEC §5.14 (repaired by TASK-004 corrective audit) | ✓ Resolved before this task |

**Result:** No unresolved terminology conflicts remain across the four Phase-1 documents after all prior corrective audits.

### 4.3 Timezone Consistency

| Document | UTC usage | Europe/London usage | GMT/BST references | Status |
|---|---|---|---|---|
| PRODUCT_SPEC.md | Interval identity, Replay/Projection check (§6.3) | Standing charge dates, TOU periods, monthly grouping, DST intervals | None — uses "Europe/London" throughout | ✓ Consistent |
| DATA_SCHEMA.md | `utc_start`, `utc_end` fields; internal timestamps §2.1 | `local_date`, `local_hour` derived fields; standing-charge and TOU | None in definitions; DST worked example mentions BST correctly as timezone label | ✓ Consistent |
| METHODOLOGY.md | UTC interval boundaries, Replay classification | Standing charge dates, TOU matching, EV windows (§4.2), DST rules §7.2 | Mentions BST/GMT only to explain DST transition mechanics (spring-forward at 01:00 UTC → 02:00 BST) — explanatory only | ✓ Consistent |
| PRIVACY_DESIGN.md | Referenced in Appendix A cross-reference table | Referenced in Appendix A cross-reference table | None | ✓ Consistent |

---

## 5 — Unit Consistency Audit

Cross-document unit usage verified. All monetary intermediates use pence; energy uses kWh; rates use p/kWh including VAT.

| Document | Monetary Intermediate Unit | Energy Unit | Rate Unit | Display Rounding | Status |
|---|---|---|---|---|---|
| PRODUCT_SPEC.md | Pence (p) in formulas (§5.1-§5.4); £ at display (§5.9) | kWh throughout | p/kWh including VAT | Half-up to £0.01 at presentation boundary only | ✓ Consistent |
| DATA_SCHEMA.md | `total_cost_pence`, etc. — intermediate in pence (§8.2) | kWh (§2.2) | p/kWh with VAT (§5.1-§5.3, §11.1) | Display rounding at presentation boundary only (§2.4) | ✓ Consistent |
| METHODOLOGY.md | All formulas compute in pence; display £ = p ÷ 100 (§1.4, §1.5) | kWh throughout | p/kWh | Half-up to £0.01, intermediates retain full precision (§1.5) | ✓ Consistent |
| PRIVACY_DESIGN.md | N/A (no calculations) | kWh mentioned in SHD table | N/A | N/A | ✓ N/A |

---

## 6 — Scope Consistency Audit

Cross-document scope alignment checked between PRODUCT_SPEC §3, DATA_SCHEMA model definitions, METHODOLOGY coverage, and PRIVACY_DESIGN permissions.

### 6.1 Public Alpha Scope Items

| Capability | PRODUCT_SPEC §3.1 | DATA_SCHEMA defined? | METHODOLOGY covered? | Privacy rules defined? | Status |
|---|---|---|---|---|---|
| Data import (CSV/JSON) | §3.1 item 1 | Yes (§3, §4) | Partial — adapter logic deferred to TASK-019+ | SHD classification for upload data (§1.1) | ✓ Consistent |
| Tariff definition (flat/TOU) | §3.1 item 2 | Yes (§5.1, §5.2) | Rate resolution covered; TOU matching rules in §7.2 | SHD when user-entered (§1.1) | ✓ Consistent |
| Current cost calculation | §3.1 item 3 | Yes (§8.2.1) | Yes (§1.1-§1.6, §2.1) | SHD derived result (§1.1) | ✓ Consistent |
| Tariff-only saving | §3.1 item 3 | Yes (§8.2.2) | Yes (§2.2) | SHD derived result (§1.1) | ✓ Consistent |
| Flexibility-only saving | §3.1 item 3 | Yes (§8.2.3) | Yes (§2.3, §3) | SHD derived + schedules (§1.1) | ✓ Consistent |
| Combined saving | §3.1 item 3 | Yes (§8.2.4) | Yes (§2.4, §2.5) | SHD derived result (§1.1) | ✓ Consistent |
| Results dashboard | §3.1 item 4 | Yes (§8.2-§8.6) | Aggregation rules in §1.4 | SHD results displayed in-browser only | ✓ Consistent |
| Appliance modelling | §3.1 item 5 | Yes (§6.1, §9.1) | Yes (§3.1-§3.5) | SHD schedules (§1.1) | ✓ Consistent |
| Export (HTML/CSV) | §3.1 item 6 | Export format schema in §8 | N/A — formatting deferred | User-initiated download only (§4.1 rule 4) | ✓ Consistent |
| Guidance pages | §3.1 item 7 | N/A | N/A | PRD/static content — no SHD risk | ✓ Consistent |

### 6.2 Paid-Ready / Deferred Scope Items

| Capability | PRODUCT_SPEC §3.2 | DATA_SCHEMA defined? | METHODOLOGY covered? | Privacy rules defined? | Status |
|---|---|---|---|---|---|
| EV optimisation | §3.2 item 1 | Yes (§6.2, §9.2) — marked conditional | Yes (§4.1-§4.5) | SHD EV schedule (§1.1); absence rules in §9.4 | ✓ Consistent |
| Battery optimisation | §3.2 item 2 | Yes (§6.3, §9.3) — marked conditional | Yes (§5.1-§5.6) | SHD battery schedule (§1.1); absence rules in §9.4 | ✓ Consistent |
| Carbon integration | §3.2 item 3 | Yes (§7) — optional/deferred | Yes (§6.1-§6.3) | PRD when from fixtures (§1.3) | ✓ Consistent |
| Octopus catalogue | §3.2 item 4 | Flat/TOU/dynamic tariff models exist | Rate resolution covers all types | PRD cached as static files (§5) | ✓ Consistent |

### 6.3 Non-Goal Verification

Each non-goal in PRODUCT_SPEC §3.3 has a testable criterion and cross-document enforcement:

| NG ID | Non-goal | Testable Criterion | Enforcement in PRIVACY_DESIGN | STATUS |
|---|---|---|---|---|
| NG-001 | No server-side data processing | Zero network requests with SHD fields | §2.3 forbidden requests, §7 test strategy | ✓ Traceable |
| NG-002 | No account system in alpha | No login/registration/auth cookies | §4.3 storage restrictions — no cookies set by app | ✓ Traceable |
| NG-003 | No third-party scripts in /simulator | Built HTML grep: no external script tags | §8.2 script audit + CSP (TASK-093) | ✓ Traceable |
| NG-004 | No subscription model | No billing/Stripe/PayPal SDK | Not applicable to privacy design — no financial SDKs listed | ✓ Traceable |
| NG-005 | No gas/multi-fuel | Inputs accept electricity only; no gas fields | N/A — schema has no gas fields (§11.1) | ✓ Traceable |
| NG-006 | No commercial/three-phase | No commercial tariff category offered | N/A — not a privacy concern, structural boundary | ✓ Traceable |
| NG-007 | No installation advice | No hardware recommendations in output | N/A — content scope | ✓ Traceable |
| NG-008 | No live smart-meter polling | No DCC/MPAN queries initiated by product | §2.3 forbidden: any request with meter identifiers | ✓ Traceable |
| NG-009 | No localStorage of sensitive state | localStorage/sessionStorage contains no SHD after unload | §4.3 table: SHD prohibited in localStorage, sessionStorage, IndexedDB | ✓ Traceable |
| NG-010 | No automatic re-optimisation | No recurring calculation scheduling or push notifications | §6 future connected-data work explicitly out of scope | ✓ Traceable |

---

## 7 — Implementation Matrix Update

Status of all Phase 1 documentation deliverables as of TASK-008 completion.

| Deliverable | Document | Created By Task | Status |
|---|---|---|---|
| Product specification | `docs/PRODUCT_SPEC.md` | TASK-004 | ✓ Complete, audited |
| Canonical data schema | `docs/DATA_SCHEMA.md` | TASK-005 | ✓ Complete, audited |
| Calculation methodology | `docs/METHODOLOGY.md` | TASK-006 | ✓ Complete, audited |
| Privacy design | `docs/PRIVACY_DESIGN.md` | TASK-007 | ✓ Complete, audited |
| Traceability matrix | `docs/TRACEABILITY.md` | TASK-008 | ✓ Complete — this document |

### 7.1 Downstream Task Dependencies Satisfied

| Task Range | Depends On Phase 1 Doc(s) | Available? |
|---|---|---|
| TASK-009 to TASK-013 (Application foundation) | PRODUCT_SPEC §3 scope; AGENTS.md architecture rules | ✓ Available |
| TASK-014 to TASK-018 (Domain schemas) | DATA_SCHEMA §§2-7 model definitions | ✓ Available |
| TASK-019 to TASK-032 (Import and quality) | DATA_SCHEMA §3, §4; METHODOLOGY §7.1 | ✓ Available |
| TASK-033 to TASK-041 (Tariffs and billing) | DATA_SCHEMA §5; METHODOLOGY §§1-2 | ✓ Available |
| TASK-048 to TASK-057 (Appliance/EV optimisation) | DATA_SCHEMA §§6, §9; METHODOLOGY §§3-4 | ✓ Available |
| TASK-058 to TASK-065 (Battery optimisation) | DATA_SCHEMA §6.3, §9.3; METHODOLOGY §5 | ✓ Available |
| TASK-066 to TASK-070 (Carbon data) | DATA_SCHEMA §7; METHODOLOGY §6 | ✓ Available |
| TASK-086 to TASK-089 (Report export) | DATA_SCHEMA §8; PRIVACY_DESIGN §4, §8.4 | ✓ Available |
| TASK-090 to TASK-094 (Privacy and security) | PRIVACY_DESIGN §§2-8; PRODUCT_SPEC §3.3 non-goals | ✓ Available with test strategy |

---

## 8 — Contradiction Summary

**Audit scope:** All four Phase 1 documents (PRODUCT_SPEC, DATA_SCHEMA, METHODOLOGY, PRIVACY_DESIGN).

**Previous corrective audits completed before TASK-008:**
- TASK-004: Combined-scenario empty-state contradiction (§5.14), confidence table reconciliation (§6.1/§6.2)
- TASK-005: DST local_hour correction (§10.1), negative-rate rule split (§5.4), missing vs zero clarity
- TASK-006: Appliance cost formula correction (§3.3), EV overnight window fix (§4.2), battery worked example replacement (§5.6)

**TASK-008 findings:**
| Finding ID | Severity | Description | Resolution |
|---|---|---|---|
| None | — | No new contradictions identified during TASK-008 cross-document audit. All prior corrective audits resolved active issues. Terminology, units, timezone conventions, and scope classifications are consistent across all four documents. | N/A — audit passed |

---

## Appendix A — Revision History

| Version | Date | Task | Change |
|---|---|---|---|
| 1.0.0 | 2026-07-21 | TASK-008 | Initial traceability matrix: output-to-source mapping (§1), engine rule acceptance criteria table with 44 rules (§2), forbidden-field-to-test mapping (§3), terminology consistency audit (§4), unit consistency audit (§5), scope consistency audit (§6), implementation matrix update (§7), contradiction summary (§8) |
