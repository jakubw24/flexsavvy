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
   - Optional manual tariff definition for comparison scenarios.
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
| NG-006 | No commercial or three-phase tariffs | Tariff schema rejects three-phase identifiers and limits single-phase power assumptions |
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

If the user's tariff is a known Octopus product, they may select it from a cached catalogue instead of manual entry.

### Step 5: Candidate tariff selection (optional)

User optionally adds comparison tariffs — either from a catalogue or by manual definition. At least one candidate must differ from the current tariff for tariff-only saving to be meaningful.

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
3. Optimal appliance/EV/battery schedules under the current tariff (flexibility-only).
4. Combined optimisation under each candidate tariff.

Results display within seconds for typical monthly data sets.

### Step 9: Results dashboard

User sees:
- **Summary**: current cost, best possible saving, and which levers contribute most.
- **Decomposition**: tariff-only saving, flexibility-only saving, combined saving (showing interaction effects).
- **Confidence**: per-scenario confidence level based on data quality and assumptions.
- **Schedules**: specific recommended start times for each flexible appliance; EV charging profile; battery charge/discharge timeline.
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
- Does not include EV or battery if those modules are not yet active.
- The saving is decomposed per-appliance in the results.

### 5.4 Combined Saving

The difference between current cost and the minimum achievable cost when **both tariff and load scheduling change**:

```
combined_saving = current_net_cost − flexible_net_cost(candidate_tariff, optimised_schedules)
```

- This is **not** guaranteed to equal `tariff_only_saving + flexibility_only_saving` because optimisation outcomes differ under different tariffs (the cheapest intervals shift).
- The interaction effect is: `interaction = combined_saving − (tariff_only_saving + flexibility_only_saving)`. A non-zero interaction means the two levers are not independent.

### 5.5 Cost Units

All monetary values are expressed in **pence** internally and displayed in **£ GBP** to two decimal places, using half-up rounding at the point of display (e.g., £0.005 rounds to £0.01). Values less than 1p display as £0.00 but retain full precision for further calculations. Very large sums may show thousands separators in the UI but the underlying value is always exact pence converted at display time. No rounding occurs until final display; intermediate calculations retain full floating-point precision.

---

## 6 — Confidence Labels

Every calculation result carries a confidence label derived from data quality. This is not a subjective rating — it follows deterministic rules.

### 6.1 Confidence levels

| Label | Criteria |
|---|---|
| **High** | All expected intervals are present, no duplicates, no extreme values outside normal ranges, tariff rates fully resolved for every interval |
| **Medium** | Minor gaps (≤5% of expected intervals), or minor rate resolution issues (e.g., a single dynamic rate missing but interpolatable from adjacent intervals via committed fixture), or standing charge must be estimated |
| **Low** | Significant gaps (>5% of expected intervals), unresolved import rates on >5% of billable intervals, duplicate intervals requiring user confirmation, or extreme values that may distort results unless explicitly accepted by the user |

### 6.2 Confidence calculation rules

1. Start at **High**.
2. If any interval is missing: demote to **Medium** if ≤5% of expected total, else demote to **Low**.
3. If any duplicate intervals exist and were auto-resolved without user input: demote to **Medium** if ≤5% of expected total, else demote to **Low**.
4. If any import rate cannot be resolved for an interval with non-zero consumption: demote to **Medium** (one interval) or **Low** (>5% of billable intervals).
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

---

## Appendix A — Revision History

| Date | Task | Change |
|---|---|---|
| 2026-07-20 | TASK-004 | Initial product specification: users, positioning, scope, journey, outputs, confidence, terminology |
