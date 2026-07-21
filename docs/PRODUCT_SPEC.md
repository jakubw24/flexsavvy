# FlexSavvy Product Specification

> Living document. Updated by TASK-004 (2026-07-20). Revises scope, terminology, and user journey as new tasks complete.

---

## 1 — Target User and Job-to-be-done

### Primary user

A UK household electricity customer who:
- Has access to their own half-hourly smart-meter consumption data (via DCC app, n3rgy, Octopus Energy dashboard, or supplier export).
- Wants a clear, numeric explanation of how much they currently pay and what savings are realistically achievable.
- Is not a tariff researcher, energy broker, or commercial user.

### Secondary users

- Household members reviewing a report produced by the primary user.
- Independent financial advisers or switch brokers who want an auditable baseline calculation before recommending action.

### Job-to-be-done (JTBD)

> *"When I have my electricity consumption data, I want to understand exactly how much I currently pay, how much I could save by changing tariff or shifting flexible loads, and what specific actions are required — without having to manually calculate intervals, worry about my data leaving my device, or navigate a marketing-heavy comparison site."*

### What JTBD does **not** include

- Ongoing automatic re-optimisation once the household has switched.
- Gas or other fuel comparisons.
- Commercial or three-phase tariffs.
- Installation of smart meters, EV chargers, or battery hardware.

---

## 2 — Positioning Against Simple Tariff Comparison

Simple tariff comparison sites answer: *"Which published rate is cheapest today?"*

FlexSavvy answers three deeper questions that comparison sites cannot:

| Dimension | Simple tariff comparison | FlexSavvy |
|---|---|---|
| **Consumption fidelity** | Annual or monthly estimate (often guessed) | Actual half-hourly intervals from the user's own meter data |
| **Current cost baseline** | None or supplier-quoted estimate | Calculated from real intervals × actual tariff rates |
| **Tariff-only saving** | Yes, but against estimated consumption | Yes, against real consumption with per-interval pricing |
| **Flexibility saving** | No — assumes fixed consumption profile | Yes — models appliance cycles, EV charging, and battery dispatch |
| **Combined saving** | Impossible without flexibility modelling | Tariff switching + load shifting calculated together, showing interaction effects |
| **Data privacy** | Often requires account creation; data may be transmitted | All processing in-browser; no upload, no accounts, no server-side storage |
| **Actionable output** | "Switch to X tariff" | Specific schedules (which appliance, when, how long) plus the exact cost impact of each action |

**Key differentiator:** FlexSavvy is a *simulator*, not a comparator. The user supplies real data; the product returns deterministic calculations with full transparency about assumptions and confidence levels.

---

## 3 — Scope

### 3.1 Public Alpha scope

The public alpha release delivers:

1. **Data import**
   - Upload CSV or JSON consumption exports (n3rgy, Octopus, generic half-hourly format).
   - Browser-only parsing and validation. No server upload.
   - Data quality report showing expected vs. actual intervals, gaps, duplicates, and extreme values.

2. **Tariff definition**
   - Current tariff entry (flat or time-of-use with standing charges).
   - Optional export rate for households with generation (e.g. solar PV); omitted when unavailable.
   - Manual tariff definition for comparison scenarios (the primary method in public alpha).
   - The Octopus tariff catalogue is **not** part of public alpha; it is a paid-ready capability (§3.2).
   - Rates expressed in pence per kWh including VAT.

3. **Core calculations**
   - **Current cost**: net charge on the existing tariff using real consumption intervals (import cost + standing charges, minus export income when both export data and an export rate are available).
   - **Tariff-only saving**: recalculated cost under each candidate tariff with no behavioural change.
   - **Flexibility-only saving**: optimal scheduling of declared flexible loads under the current tariff.
   - **Combined saving**: both levers applied together, showing interaction effects (not simply additive).

4. **Results dashboard**
   - Summary table with all four cost figures and savings decomposition.
   - Confidence indicators per scenario.
   - Per-interval breakdown available on request.
   - Monthly comparison view.

5. **Appliance flexibility modelling**
   - User declares appliances (power draw, cycle duration, flexible time window).
   - Deterministic optimiser selects the cheapest valid schedule under each tariff.
   - Output: recommended start times and expected saving per appliance.

6. **Export**
   - Printable HTML report summarising results and recommendations.
   - CSV export of interval-level data for local inspection.

7. **Guidance pages**
   - Static informational pages explaining smart-meter data download, tariff types, flexibility concepts, and privacy practices.

### 3.2 Paid-ready scope (beyond alpha)

Items that are defined but deferred to a paid/pro tier or later milestone:

1. **EV charging optimisation** — plug-in window modelling with cheapest-interval allocation.
2. **Battery dispatch optimisation** — state-of-charge discretisation with dynamic programming over the simulation horizon.
3. **Carbon intensity integration** — optional UK carbon forecast data for emissions-aware scheduling and cost-carbon trade-off display.
4. **Octopus tariff catalogue** — browser-cached index of active domestic products with regional TOU schedules.
5. **Replay mode** — upload a second dataset and compare period-over-period changes with consistent methodology.
6. **Feature-entitlement architecture** — optional account boundary for unlocking pro features without compromising the default privacy model.

### 3.3 Non-goals

Non-goals are explicit boundaries to prevent scope creep. Each is testable:

| # | Non-goal | Testable criterion |
|---|----------|--------------------|
| NG-001 | No server-side data processing | Zero network requests containing consumption intervals, filenames, device IDs, meter identifiers, or tariff inputs |
| NG-002 | No account system in alpha | No login form, no registration flow, no authentication cookies in the initial release |
| NG-003 | No third-party scripts in `/simulator` | `grep` of built HTML under `/simulator` finds no `<script src>` pointing to external domains |
| NG-004 | No ongoing subscription model | Alpha release has no billing integration, no Stripe/PayPal SDK, no recurring-payment logic |
| NG-005 | No gas or multi-fuel comparison | Inputs accept electricity consumption only; no gas price fields appear in forms |
| NG-006 | No commercial or three-phase tariffs | No commercial or three-phase tariff category is offered; the product makes no claim to model three-phase installations; calculation assumptions remain residential single-phase unless a later task explicitly expands scope |
| NG-007 | No installation advice | Product does not recommend hardware purchases or installation providers |
| NG-008 | No live smart-meter polling | Product never initiates its own DCC or MPAN queries; data is user-supplied only |
| NG-009 | No browser storage of sensitive state by default | `localStorage`/`sessionStorage` contains no consumption intervals, tariff inputs, or derived costs after page unload (unless user explicitly exports) |
| NG-010 | No automatic re-optimisation service | Product does not schedule recurring calculations or push notifications for future runs |

---

## 4 — User Journey

The full journey from entry to data deletion.

### Step 1: Entry

User lands on the FlexSavvy home page (static). They read a clear, non-marketing explanation of what the tool does and why it does not require an account.

### Step 2: Data source selection

User chooses their consumption data source:
- **Upload file** — select CSV or JSON from local device.
- **Demo mode** — use committed sample data (no personal data required).

### Step 3: File upload and parsing

For file upload:
1. User selects one or more files via standard `<input type="file">`.
2. Files are read entirely in-browser via the File API. Maximum file size enforced client-side.
3. If multiple meters are detected, user is asked to resolve which data set to use.
4. A quality report displays: total intervals found, expected intervals, missing intervals, duplicates, extreme values, and an overall confidence level (High / Medium / Low).

### Step 4: Current tariff configuration

User enters or confirms their current electricity tariff:
- Tariff type (flat or time-of-use).
- Import rate(s) in pence/kWh including VAT.
- Standing charge in pence per day.
- Optional export rate if applicable.

When the Octopus tariff catalogue module has been implemented and enabled, the user may additionally select a known Octopus product from the cached catalogue instead of manual entry. Manual tariff definition remains available even when the catalogue is present.

### Step 5: Candidate tariff selection (optional)

User optionally adds comparison tariffs by manual definition. When the Octopus tariff catalogue module has been implemented and enabled, catalogue selection is also available for candidate tariffs. At least one candidate must differ from the current tariff for tariff-only saving to be meaningful.

### Step 6: Appliance declaration (optional)

User declares flexible appliances:
- Appliance name, power draw (kW), cycle duration (hours).
- Earliest and latest acceptable start times within a day.
- Whether this appliance is already running on a schedule or is currently fixed.

### Step 7: EV / Battery configuration (optional; paid-ready)

If available, user configures:
- EV: battery capacity, current state of charge, target state of charge, plug-in window, charger capacity.
- Battery: capacity, max charge/discharge rate, current SOC, minimum/maximum SOC limits.

### Step 8: Run simulation

User clicks "Run". The Web Worker calculates:
1. Current cost on the existing tariff.
2. Cost under each candidate tariff (tariff-only).
3. Optimal appliance schedules under the current tariff (flexibility-only). If the EV optimisation module is implemented and enabled, EV charging schedules are included. If the battery dispatch module is implemented and enabled, battery charge/discharge schedules are included. Appliance optimisation is always available within public-alpha scope; EV and battery results appear only when their respective paid-ready modules are active.
4. Combined optimisation under each candidate tariff, applying the same module availability rules as step 3.

Results display within seconds for typical monthly data sets.

### Step 9: Results dashboard

User sees:
- **Summary**: current cost, best possible saving, and which levers contribute most.
- **Decomposition**: tariff-only saving, flexibility-only saving, combined saving (showing interaction effects).
- **Confidence**: per-scenario confidence level based on data quality and assumptions.
- **Schedules**: specific recommended start times for each flexible appliance. EV charging profile appears only when the EV optimisation module is implemented and enabled. Battery charge/discharge timeline appears only when the battery dispatch module is implemented and enabled.
- **Monthly view**: cost comparison bar chart across months or weeks.
- **Warnings**: data gaps, extreme values, assumptions that may affect results.

### Step 10: Export / Print (optional)

User may:
- Print the report (HTML print stylesheet).
- Download CSV of interval-level calculations.
- Download JSON scenario file for later replay.

No export occurs server-side; all files are generated locally and downloaded through the browser.

### Step 11: Data deletion

At any point, or after exporting, user may click "Clear my data". This:
1. Removes all consumption intervals from memory.
2. Clears tariff configuration.
3. Resets appliance/EV/battery declarations.
4. Does not persist any state to `localStorage` by default.
5. Returns the user to the entry screen with a confirmation message.

If the user navigates away or reloads the page without explicitly saving, all data is lost — this is the intended behaviour (privacy by default).

---

## 5 — Output Definitions

Every public output has an explicit definition so that tests can independently verify correctness.

### 5.1 Current Cost

The user's net electricity charge on their **existing tariff** using their **actual consumption intervals**, calculated as:

```
current_net_cost =
  Σ (interval_import_kWh × import_rate_pence_per_kWh)
+ (standing_charge_pence_per_day × calendar_days_in_analysis_period)
- Σ (interval_export_kWh × export_rate_pence_per_kWh)
```

- All rates include VAT.
- **Import cost**: calculated per interval using the user's actual import consumption and the tariff's import rate.
- **Standing charges**: applied once per Europe/London calendar date spanning the analysis period (from the earliest to the latest interval timestamp), regardless of whether consumption data exists for that day. Missing consumption data does not remove the standing charge. *Rationale: this matches standard UK supplier billing practice, where standing charges accrue for every calendar day on the account, not only days with recorded usage.*
- **Export income**: only subtracted when both export consumption data and an export rate are available. If either is absent, export income is treated as zero.
- If the user does not provide a standing charge, it defaults to zero and confidence is downgraded to **Medium** (see §6.2 rule 6).
- If an interval's import rate cannot be resolved, the scenario is flagged as incomplete — the cost for that interval is excluded and a warning is shown.

### 5.2 Tariff-Only Saving

The difference between current cost and the cost under a **candidate tariff** with **no change to consumption timing**:

```
tariff_only_saving = current_net_cost − candidate_net_cost(same_intervals, candidate_tariff)
```

- Positive values mean the candidate is cheaper than the current tariff.
- Zero or negative means the candidate offers no tariff-only benefit.
- Each candidate tariff produces one independent tariff-only saving value.
- If the candidate tariff has a different export rate from the current tariff, `candidate_net_cost` incorporates that export rate. When the candidate tariff has no export rate defined, export income is treated as zero for that scenario.

### 5.3 Flexibility-Only Saving

The difference between current cost and the minimum achievable cost when **only load scheduling changes** but the tariff remains the same:

```
flexibility_only_saving = current_net_cost − flexible_net_cost(same_tariff, optimised_schedules)
```

- Uses deterministic optimisation over declared flexible loads.
- Appliance optimisation is always included within public-alpha scope.
- EV charging optimisation is included only when the EV module (paid-ready, §3.2) is implemented and enabled.
- Battery dispatch optimisation is included only when the battery module (paid-ready, §3.2) is implemented and enabled.
- When a paid-ready module is unavailable, the base simulator does not produce results for that load type.
- The headline flexibility-only saving is the portfolio result with all enabled flexible appliances optimised together against the same baseline.
- An appliance-level estimate may show the saving from optimising that single appliance in isolation against the current (unmodified) baseline.
- Isolated appliance estimates are explanatory and **not additive**: the UI must not sum isolated per-appliance savings and present the result as the portfolio total.
- Any future additive attribution method (e.g. cost-allocation or Shapley-value decomposition) would require an explicit methodology decision in a later task.

### 5.4 Combined Saving

The difference between current cost and the minimum achievable cost when **both tariff and load scheduling change**:

```
combined_saving = current_net_cost − flexible_net_cost(candidate_tariff, optimised_schedules)
```

- This is **not** guaranteed to equal `tariff_only_saving + flexibility_only_saving` because optimisation outcomes differ under different tariffs (the cheapest intervals shift).
- The interaction effect is: `interaction = combined_saving − (tariff_only_saving + flexibility_only_saving)`. A non-zero interaction means the two levers are not independent.

### 5.5 Interval-Level Breakdown

The per-interval breakdown is the foundational output from which all summary figures are derived.

It consists of one record per canonical start-inclusive / end-exclusive half-hour interval. Each record contains:

| Field | Meaning |
|---|---|
| **UTC interval identity** | The UTC start timestamp (and implied end timestamp) of the half-hour period. This is the immutable identifier for the interval. |
| **Imported kWh** | The consumption value drawn from the user's meter data for this interval. Zero when no import data exists. |
| **Exported kWh** | Export generation returned to the grid for this interval, when export data is available. Null or absent when the user has not supplied export data or no export meter reading exists. |
| **Resolved import price** | The pence-per-kWh import rate applied to this interval under the current scenario's tariff. Unresolved when the tariff cannot be matched (e.g. dynamic rate missing). |
| **Resolved export price** | The pence-per-kWh export rate applied to this interval, when both an export rate and export data exist for this interval. Null or absent otherwise. |
| **Import cost** | `imported kWh × resolved import price` in pence (or derived monetary unit). Excluded from scenario totals when the import price is unresolved. |
| **Export income** | `exported kWh × resolved export price` in pence. Zero when either exported kWh or export price is unavailable. |
| **Warnings / unresolved-price state** | Any interval-level warning (see §5.10) applicable to this row — for example, unresolved import rate, duplicate timestamp, or extreme value. |
| **Scenario identity** | Which scenario produced this row: the current tariff, a named candidate tariff, the flexibility-only run, or a combined run. Allows the same interval to appear under multiple scenarios. |

**Unresolved prices are never silently interpolated.** When an import rate cannot be resolved for an interval with non-zero consumption, that interval's cost contribution is excluded from the scenario subtotal and an interval-level warning is recorded.

### 5.6 Daily and Monthly Aggregation Boundaries

| Dimension | Rule |
|---|---|
| **Interval identity** | Always UTC (see §5.5). The start timestamp never changes based on calendar grouping. |
| **Daily grouping** | For billing and result summaries, intervals are grouped into Europe/London calendar dates. A single local date may span up to three UTC days at DST transitions. |
| **Monthly grouping** | Result summaries group intervals into Europe/London calendar months. Month boundaries follow the Europe/London calendar, not UTC. |
| **DST interval counts** | A Europe/London calendar day may contain 46 half-hour intervals (spring-forward), 48 (normal), or 50 (fall-back). Code must never assume 48 intervals per local day. |
| **Standing charges** | Applied once per distinct applicable Europe/London date according to the standing-charge rule in §5.1. The number of actual half-hour intervals on a given local date does not affect standing-charge accrual. |

### 5.7 Per-Appliance Saving

The flexibility-only saving (§5.3) is a **portfolio-level** figure. Per-appliance breakdowns are supplementary and carry specific semantics:

1. The **headline flexibility-only saving** is the cost reduction achieved when all declared flexible appliances are optimised simultaneously against the current tariff, using the joint optimal schedule.
2. An **appliance-level estimate** may show the saving from optimising that single appliance in isolation — i.e., moving only that appliance to its cheapest valid window while leaving all other loads at their baseline positions.
3. Isolated appliance estimates are **explanatory only and not additive**. Because appliances compete for cheap intervals, the sum of isolated estimates will generally differ from (and typically exceed) the actual portfolio saving.
4. The UI must not present a column of per-appliance savings whose sum equals the total flexibility-only saving unless an explicit attribution methodology has been adopted in a later task.
5. Any future additive decomposition method (e.g. cost-allocation, marginal contribution, or Shapley-value approach) requires a documented methodology decision before implementation.

### 5.8 Schedules

An appliance schedule is the recommended operating plan produced by the deterministic optimiser for one flexible appliance under one scenario. A schedule record comprises:

| Component | Description |
|---|---|
| **Recommended start time** | The Europe/London local start time of the optimal cycle, derived from the UTC interval selected by the optimiser. |
| **Cycle duration / interval coverage** | The number of contiguous half-hour intervals the appliance runs for, and the covered UTC interval range (start-inclusive, end-exclusive). |
| **Tariff / scenario context** | Which tariff or scenario the schedule was optimised against (e.g. "current tariff" or candidate name). The same appliance may have different schedules under different tariffs. |
| **User constraints satisfied** | Confirmation that the schedule falls within the declared earliest/latest start window, does not exceed the declared cycle duration, and respects any other user-specified limits (e.g. minimum gap between cycles). |
| **Infeasibility explanation** | When no valid schedule exists (e.g. the declared time window is shorter than the required cycle duration), a human-readable reason is provided rather than a blank or error state. |

**EV and battery schedules:** EV charging profiles and battery charge/discharge timelines are described as **conditional paid-ready outputs**. They appear only when the respective optimisation module (§3.2) has been implemented and enabled. The base public-alpha simulator produces appliance schedules but does not generate EV or battery schedules unless those modules are active.

### 5.9 Cost Units

- **Rates** are expressed in pence per kWh including VAT.
- **Energy** is expressed in kWh.
- **Monetary calculations** use a decimal-safe representation or appropriately scaled integers to avoid binary-floating-point rounding artefacts. The exact canonical calculation representation (e.g., integer pence-and-farthing units, arbitrary-precision decimals) will be finalised in TASK-006 (calculation methodology).
- Intermediate values are not rounded merely for display; they retain their full precision until the final presentation boundary.
- Display rounding occurs only when presenting a value to the user, using half-up rounding to two decimal places of £ GBP (e.g., £0.005 rounds to £0.01), unless a tariff explicitly requires another rounding rule.
- Very large sums may show thousands separators in the UI; values less than 1p display as £0.00.

### 5.10 Warnings

Warnings communicate conditions that affect the reliability or completeness of results. Each warning is **scoped** to the output it concerns so that calculation progress does not cause warnings to disappear.

| Scope | Concerns | Examples |
|---|---|---|
| **Dataset-level** | Issues affecting the entire consumption data set before any scenario-specific calculation begins. | Missing intervals exceeding expected count, duplicate timestamps detected during import, extreme values outside Q3 + 3×IQR, file format irregularities. |
| **Interval-level** | Issues affecting a single half-hour interval. These remain attached to the affected row in the per-interval breakdown (§5.5). | Import rate cannot be resolved for this interval (dynamic rate absent), duplicate interval detected at this timestamp, consumption value flagged as outlier. |
| **Scenario-level** | Issues affecting a particular scenario's results as a whole. | Candidate tariff has no export rate defined while the user has export data, scenario confidence downgraded to Medium or Low, simulation classified as Projection rather than Replay. |
| **Optimisation-level** | Issues arising from the scheduling process. | A declared appliance cannot be scheduled within its constraints under this scenario, EV module unavailable but EV appliance declared, battery dispatch not available for a battery load, multiple equally-cheap schedules found. |

A warning remains associated with the output it affects. It must not disappear merely because calculation continues past the affected data point. Warnings are advisory — they do not halt computation but inform interpretation.

### 5.11 Reconciliation Across Output Formats

The dashboard, interval CSV export, scenario JSON export, and printable HTML report all derive from the **same canonical result set**. They must reconcile as follows:

1. **Single source of truth**: One optimisation run produces one canonical interval-level result (§5.5). Every output format is a presentation-layer projection of that result. No output format independently recomputes totals.
2. **Scenario consistency**: The same scenario must produce numerically reconcilable results across all formats. A dashboard summary, the CSV row sum, and the JSON total must agree before display rounding is applied.
3. **Unrounded intermediate calculations**: All calculations use unrounded canonical values throughout the pipeline. Rounding occurs only at presentation boundaries (user-visible figures).
4. **No recomputation**: Different output formats must not apply different formulas to derive totals. A dashboard figure that differs from a CSV row total indicates a bug, not a rounding difference.
5. **Traceability**: Every summary figure in any output format must be derivable from the canonical interval records. If it cannot be derived by summing or aggregating the canonical intervals plus standing charges, its definition is incomplete.

### 5.12 Monthly View

The monthly view groups results by Europe/London calendar month and displays per-month cost breakdowns (current cost, candidate costs, savings).

- Month boundaries follow the **Europe/London calendar**, not UTC month boundaries.
- Each interval is assigned to a local month by converting its UTC start timestamp to Europe/London local date.
- The sum of monthly figures must **reconcile exactly** with the canonical interval-level totals before any display rounding is applied.
- Display rounding (half-up to two decimal places £ GBP) occurs only when presenting monthly values, not during aggregation.

### 5.13 Export Scope — Public Alpha vs. Later Capabilities

| Capability | Scope | Rationale |
|---|---|---|
| **Printable HTML report** | Public alpha | Summary results and recommendations for local printing or PDF generation. Generated in-browser, no server interaction. |
| **Interval CSV export** | Public alpha | Full interval-level breakdown (§5.5) exported as a local download. Generated in-browser, no server interaction. |
| **Scenario JSON (local export)** | Public alpha | The current scenario's configuration and results can be downloaded as a JSON file for the user's own records. This is a one-way export — the file serves as a local copy of what was just calculated. |
| **Replay mode (upload saved scenario)** | Paid-ready / later scope | Uploading a previously exported scenario JSON to compare period-over-period changes or validate methodology consistency requires replay infrastructure (§3.2). This remains a later capability even though the export format exists in alpha. |

The asymmetry is intentional: the user can always export their current results, but importing a saved scenario for comparison requires the replay architecture.

---

## 6 — Confidence Labels

Every calculation result carries a confidence label derived from data quality. This is not a subjective rating — it follows deterministic rules.

### 6.1 Confidence levels

| Label | Criteria |
|---|---|
| **High** | All expected intervals are present, no duplicates, no extreme values outside normal ranges, tariff rates fully resolved for every billable interval |
| **Medium** | Minor gaps (≤5% of expected intervals), or unresolved import rates on greater than 0% and less than or equal to 5% of billable intervals, or duplicate intervals that have been resolved but affected ≤5% of expected intervals, or standing charge must be estimated |
| **Low** | Significant gaps (>5% of expected intervals), unresolved import rates on >5% of billable intervals, duplicate intervals with unresolved timestamps blocking calculation, or extreme values that may distort results unless explicitly accepted by the user |

### 6.2 Confidence calculation rules

1. Start at **High**.
2. If any interval is missing: demote to **Medium** if ≤5% of expected total, else demote to **Low**.
3. If any duplicate intervals exist: unresolved duplicates (same timestamp, conflicting values) block calculation for that interval until the user resolves them; once resolved, demote to **Medium** if greater than 0% and less than or equal to 5% of expected total were duplicates, else demote to **Low**. The duplicate warning remains visible even after resolution.
4. If any import rate cannot be resolved for an interval with non-zero consumption: no downgrade when 0% of billable intervals are affected; demote to **Medium** when greater than 0% and less than or equal to 5% of billable intervals are affected; demote to **Low** when greater than 5% of billable intervals are affected.
5. If any consumption value is an outlier (exceeds Q3 + 3×IQR, where IQR = Q3 − Q1 computed over all non-zero consumption intervals in the dataset): demote to **Medium** unless user explicitly accepts it.
6. If the standing charge was omitted by the user and defaulted to zero: demote to **Medium**.
7. Final confidence is the minimum across all downgrade rules.

### 6.3 Replay vs. Projection labels

| Label | Meaning |
|---|---|
| **Replay** | The simulation uses historical consumption data and known historical tariff rates. Results represent what *did* happen (retrospective accuracy). |
| **Projection** | The simulation uses historical consumption but applies current or future tariff rates, or models flexible loads that have not yet occurred. Results are estimates with inherent uncertainty. |

The label is determined automatically:
- If all interval dates are in the past AND all tariff rates used are the actual rates for those dates → **Replay**.
- Otherwise → **Projection**.

Interval timestamps are stored as UTC (see ADR-003 in `docs/DECISIONS.md`). The "in the past" check is performed on UTC timestamps. Europe/London calendar boundaries are only relevant for standing-charge day counting (§5.1) and TOU period matching — they do not affect whether a simulation is classified as Replay or Projection.

---

## 7 — Plain-Language Terminology

Terms used by FlexSavvy, defined for both developers and end-users.

| Term | Definition |
|---|---|
| **Consumption interval** | A half-hour period during which a specific amount of electricity was consumed, measured in kWh. Each interval has a UTC start time, an end time (exclusive), and a consumption value. |
| **Smart-meter data** | The record of electricity consumption exported from the household's smart meter, typically as CSV or JSON containing timestamps and energy values. |
| **Tariff** | A pricing structure that determines how much the user pays for each interval of consumption. May be flat (single rate) or time-of-use (different rates at different times). |
| **Import rate** | The price in pence per kWh charged by the supplier for electricity drawn from the grid. Includes VAT. |
| **Standing charge** | A fixed daily fee in pence, applied regardless of consumption. Applied once per Europe/London calendar date spanning the analysis period (from the earliest to the latest interval timestamp), even on days where no consumption data is present. |
| **Export rate** | The optional price in pence per kWh paid back to the user for surplus electricity returned to the grid (e.g., from solar PV). |
| **Time-of-use (TOU) tariff** | A tariff where the import rate changes according to a published schedule of periods (e.g., "off-peak" and "peak"). Periods are defined in Europe/London local time. |
| **Current cost** | The user's net electricity charge (variable name: `current_net_cost`) calculated by applying their existing tariff — import rates, standing charges, and export income where available — to their actual consumption data. See Section 5.1. |
| **Tariff-only saving** | Potential saving from switching tariff with no change to when appliances run. See Section 5.2. |
| **Flexibility-only saving** | Potential saving from shifting flexible loads while keeping the same tariff. See Section 5.3. |
| **Combined saving** | Maximum potential saving when both tariff and load scheduling are optimised together. See Section 5.4. |
| **Flexible load** | An appliance, EV charger, or battery whose operation can be shifted to different time periods within declared constraints. |
| **Appliance cycle** | One complete run of an appliance: a contiguous block of intervals during which the appliance draws its rated power. The user declares minimum power, duration, and acceptable start window. |
| **Optimal schedule** | The set of start times for flexible loads that minimises total cost under a given tariff, calculated by the deterministic optimiser. |
| **Data quality report** | A summary showing how many intervals were expected vs. found, any gaps or duplicates, and an overall confidence level (High/Medium/Low). |
| **Confidence label** | A deterministic rating (High/Medium/Low) indicating how much trust can be placed in a calculation result based on data completeness and quality. See Section 6. |
| **Replay** | A simulation using historical consumption and historical tariff rates, producing a retrospective cost estimate. See Section 6.3. |
| **Projection** | A simulation that involves current or future rates, or modelled behaviour changes, producing an estimate with inherent uncertainty. See Section 6.3. |
| **Web Worker** | A background JavaScript thread in the browser that performs heavy calculations without blocking the UI. All FlexSavvy optimisation runs here. |
| **Privacy-first** | The design principle that user data never leaves the browser, no accounts are required, and no sensitive state is persisted by default. |
| **Interval-level breakdown** | One record per canonical half-hour interval containing UTC identity, imported/exported kWh, resolved import/export prices, import cost, export income, applicable warnings, and scenario identity. See §5.5. |
| **Monthly grouping** | Result summaries grouped by Europe/London calendar month. Month boundaries follow the local calendar; a day may contain 46, 48, or 50 half-hour intervals at DST transitions. Monthly figures reconcile exactly with canonical interval totals before display rounding. See §5.6 and §5.12. |
| **Appliance-level estimate** | The cost reduction from optimising one flexible appliance in isolation against the current baseline. Explanatory only — not additive across appliances. The UI must not sum these into a portfolio total. See §5.7. |
| **Schedule** | The recommended operating plan for one flexible appliance under one scenario: start time, cycle duration, tariff context, satisfied constraints, and an explanation when no valid schedule exists. EV and battery schedules are conditional paid-ready outputs. See §5.8. |
| **Warning (scoped)** | A condition affecting the reliability or completeness of results, scoped to dataset-level, interval-level, scenario-level, or optimisation-level. Warnings remain associated with their affected output and do not disappear when calculation continues. See §5.10. |

---

## Appendix A — Revision History

| Date | Task | Change |
|---|---|---|
| 2026-07-20 | TASK-004 | Initial product specification: users, positioning, scope, journey, outputs, confidence, terminology |
| 2026-07-21 | Corrective audit | Defined missing public-output semantics: interval breakdown (§5.5), daily/monthly aggregation boundaries (§5.6), per-appliance saving non-additivity (§5.7), schedules (§5.8), scoped warnings (§5.10), cross-format reconciliation (§5.11), monthly view (§5.12), export scope asymmetry (§5.13); added terminology rows for new definitions |
