# FlexSavvy — Calculation Methodology

> Living document. Created by TASK-006 (2026-07-21).
> Specifies deterministic formulas, edge-case behaviour, and worked examples for every
> calculation performed by the simulator.
> No application code is present here; this is the canonical specification that later
> implementation tasks realise.

---

## 1 — Billing and Cost Calculation

### 1.1 Per-interval import cost

For each half-hour interval _i_ with a resolved import rate:

```
import_cost_i (p) = import_kwh_i (kWh) × resolved_import_rate_i (p/kWh)
```

Where:
- `import_kwh_i` is the observed import consumption for interval _i_. A measured zero
  (`0 kWh`) produces zero cost. A missing observation (`null`) means the interval's
  cost contribution is excluded from the total.
- `resolved_import_rate_i` is the tariff rate (pence per kWh, VAT-inclusive) matched to
  this interval by the current scenario's tariff definition.

If the import rate cannot be resolved for an interval with non-zero consumption, that
interval's cost is **excluded** from the subtotal and an interval-level warning is recorded.
The gap is never filled by interpolation or extrapolation.

### 1.2 Standing charge

A standing charge is a fixed daily fee in pence per calendar day:

```
standing_charge_pence (p) = standing_charge_rate (p/day) × N_dates
```

Where `N_dates` is the number of **distinct Europe/London calendar dates** from the
earliest interval's local date through the latest interval's local date, **inclusive**.

Rules:
1. Every date within that span receives exactly one standing charge, regardless of
   whether consumption observations exist for that date.
2. DST transitions do not change the once-per-local-date rule. A spring-forward day
   (46 half-hour intervals) and a fall-back day (50 half-hour intervals) each receive
   exactly one standing charge.
3. If the user does not provide a standing charge, it defaults to `0 p/day` and
   scenario confidence is downgraded to **Medium** (see PRODUCT_SPEC.md §6.2 rule 7).

### 1.3 Export income

For each interval _i_ where **both** export data and an export rate exist:

```
export_income_i (p) = export_kwh_i (kWh) × resolved_export_rate_i (p/kWh)
```

Where:
- `export_kwh_i` is the observed export generation for interval _i_. A measured zero
  produces zero income. A missing observation (`null`) means no income is credited for
  that interval.
- `resolved_export_rate_i` is the applicable export rate (pence per kWh, VAT-inclusive).

If **either** export data or an export rate is absent for a scenario, total export income
is treated as zero for all intervals in that scenario.

### 1.4 Net cost aggregation

The net cost for one scenario is:

```
net_cost (p) = Σ import_cost_i (p) + standing_charge_pence (p) − Σ export_income_i (p)
```

Where the sums run over all intervals whose rates are resolved and consumption is present.
Excluded intervals (unresolved rate or missing consumption) contribute nothing.

All intermediate values retain full precision; no rounding occurs during aggregation.
Rounding is applied only at the presentation boundary (half-up to two decimal places
£ GBP). Conversion from pence to pounds for display:

```
display_cost (£) = net_cost (p) ÷ 100   [rounded half-up to £0.01]
```

### 1.5 Rounding and precision representation

1. **Intermediate calculations** use a decimal-safe representation (e.g., integer-scaled
   units or arbitrary-precision decimals) to avoid binary-floating-point artefacts.
   The exact implementation representation is deferred to the TypeScript layer; this
   methodology only mandates that intermediate values are not rounded.
2. **Display rounding** uses half-up rounding to two decimal places of £ GBP:
   `£0.005 → £0.01`, `£0.004 → £0.00`.
3. **Tariff rates** are expressed to at most two decimal places in source data (p/kWh).
   Calculations must not round rates prematurely.
4. **Energy values** are in kWh and retain source precision through the pipeline.

### 1.6 Worked billing example

**Scenario inputs:**

- Period: 2025-04-14 (Monday) through 2025-04-15 (Tuesday), Europe/London = **2 local dates**
- Flat tariff: import_rate = `28.5 p/kWh`, standing_charge = `75.0 p/day`
- No export rate defined
- Representative subset of consumption intervals (remaining intervals are omitted for
  brevity; the formula applies identically):

| Interval (UTC) | Import kWh | Rate (p/kWh) | Cost (p) |
|---|---|---|---|
| 2025-04-14T08:00:00Z | 1.20 | 28.5 | 1.20 × 28.5 = 34.200 |
| 2025-04-14T12:00:00Z | 0.85 | 28.5 | 0.85 × 28.5 = 24.225 |
| 2025-04-14T17:00:00Z | 2.10 | 28.5 | 2.10 × 28.5 = 59.850 |
| 2025-04-14T20:00:00Z | 1.50 | 28.5 | 1.50 × 28.5 = 42.750 |
| 2025-04-15T09:00:00Z | 0.60 | 28.5 | 0.60 × 28.5 = 17.100 |
| 2025-04-15T14:00:00Z | 0.95 | 28.5 | 0.95 × 28.5 = 27.075 |
| 2025-04-15T18:00:00Z | 1.80 | 28.5 | 1.80 × 28.5 = 51.300 |
| 2025-04-15T21:00:00Z | 0.40 | 28.5 | 0.40 × 28.5 = 11.400 |

**Step 1 — Import cost per interval:** computed as shown in the table above.

**Step 2 — Total import cost (represented subset only):**

```
Σ import_cost_i
= 34.200 + 24.225 + 59.850 + 42.750 + 17.100 + 27.075 + 51.300 + 11.400
= 267.900 p
```

**Step 3 — Standing charge:**

```
standing_charge_pence = 75.0 (p/day) × 2 (days) = 150.0 p
```

**Step 4 — Net cost:**

```
net_cost = 267.900 + 150.0 − 0 = 417.900 p = £4.179 → £4.18 (display)
```

> **Verification:** Sum each row independently, then re-sum the column total, then add
> standing charge. The intermediate value `267.900 p` has three decimal places but no
> rounding occurs until final display.

---

## 2 — Savings Decomposition

All four cost figures are computed from the **same canonical interval set** so that
savings decomposition is exact and reconcilable.

### 2.1 Current net cost

```
current_net_cost (p) = Σ import_cost_i(current tariff) + standing_charge_pence − Σ export_income_i(current tariff)
```

Always produced, even when no candidate tariffs or flexible loads are configured.

### 2.2 Tariff-only saving

For each candidate tariff _c_:

```
tariff_only_saving_c (p) = current_net_cost (p) − candidate_net_cost_c (p)
```

Where `candidate_net_cost_c` is computed with the **identical interval consumption**
under the candidate tariff's rates, standing charge, and export rate. A positive value
means the candidate is cheaper; zero or negative means no tariff-only benefit.

### 2.3 Flexibility-only saving

```
flexibility_only_saving (p) = current_net_cost (p) − flexible_net_cost (p)
```

Where `flexible_net_cost` is computed under the **current tariff** but with all
declared flexible loads shifted to their optimal schedules. This includes appliance
optimisation (always available), and EV/battery optimisation when those modules are
implemented and enabled.

### 2.4 Combined saving

For each candidate tariff _c_:

```
combined_saving_c (p) = current_net_cost (p) − combined_net_cost_c (p)
```

Where `combined_net_cost_c` uses the **candidate tariff** with all flexible loads
optimised under that tariff's rate structure.

### 2.5 Interaction effect

The interaction between tariff switching and load shifting is:

```
interaction_c (p) = combined_saving_c (p) − [tariff_only_saving_c (p) + flexibility_only_saving (p)]
```

This is **not** guaranteed to be zero because the cheapest intervals shift under different
tariffs, changing the optimal schedule. A positive interaction means the two levers are
synergistic; a negative interaction means they partially counteract each other.

### 2.6 Empty-state semantics

When candidate tariffs or flexible loads are absent:

| Case | Tariff-only | Flexibility-only | Combined |
|---|---|---|---|
| No candidates, no flexible loads | Not produced | Equals current cost (saving = 0) | Not produced |
| Candidates, no flexible loads | Produced normally | Equals current cost (saving = 0) | Equals tariff-only |
| No candidates, flexible loads present | Not produced | Produced normally | Not produced |
| Both present | Produced normally | Produced normally | Produced normally |

See PRODUCT_SPEC.md §5.14 for the full specification of these cases.

---

## 3 — Appliance Optimisation

### 3.1 Candidate generation

For one appliance with declared parameters:

- `power_kw` (kW): rated power draw
- `cycle_duration_hours` (h): continuous run duration (multiple of 0.5)
- `earliest_start_local` (HH:MM): earliest acceptable Europe/London start time
- `latest_start_local` (HH:MM): latest acceptable Europe/London start time

The number of half-hour intervals per cycle is:

```
cycle_intervals = cycle_duration_hours (h) ÷ 0.5 (h/interval)
```

A **candidate position** is one valid contiguous block of `cycle_intervals` intervals
whose local start time falls between `earliest_start_local` and `latest_start_local`,
and whose entire block fits within a single local day. Appliance cycles must not cross
midnight unless explicitly declared in a future task.

The **feasible candidate set** for one appliance on one local day is:

```
C = { position p | p.start_local ≥ earliest_start_local
                    AND p.start_local ≤ latest_start_local
                    AND p.start_local + cycle_intervals × 0.5h ≤ 24:00 }
```

### 3.2 Feasibility checking

An appliance is feasible when `|C| ≥ 1`. If the window from `earliest_start_local` to
end-of-day minus `cycle_duration_hours` contains no valid start position, the appliance
is infeasible for that day. The simulator records an infeasibility explanation and
excludes the appliance from optimisation for that scenario.

### 3.3 Cost scoring of a single candidate

For one candidate position _p_ under one tariff, the appliance cost is computed from the
appliance's own interval energy profile — **not** from the household's observed total
import consumption for those intervals. Household `import_kwh` includes all loads and must
never be treated as equivalent to appliance energy.

For the current constant-power appliance model, each profile interval contributes:

```
appliance_energy_j (kWh) = power_kw (kW) × 0.5 (h)
```

The candidate appliance cost is:

```
candidate_appliance_cost_p (p) = Σ_{j ∈ p.intervals} appliance_energy_j (kWh) × resolved_rate_of_candidate_interval_j (p/kWh)
```

The **best position** for one appliance is the candidate with minimum `candidate_appliance_cost_p`.

**Full scenario cost:** The total scenario bill is calculated from the adjusted household
profile, not by adding an isolated appliance saving to the baseline. When shifting an
already-modelled appliance:

1. Remove its declared current profile energy (`power_kw × 0.5 h` per occupied interval)
   from the baseline consumption at each of those intervals.
2. Never permit negative baseline consumption: if the appliance's declared energy exceeds
   the observed household import at any interval, clip that interval's adjusted baseline
to zero.
3. Insert the appliance profile energy at each interval of the candidate position.
4. Bill the resulting adjusted scenario profile using standard interval costing (see §1.1).

### 3.4 Baseline subtraction

The baseline cost is the import cost at the appliance's **current (unmodified)** schedule:

```
baseline_cost (p) = Σ_{i ∈ baseline.intervals} [power_kw × 0.5] (kWh) × resolved_import_rate_i (p/kWh)
```

Isolated per-appliance saving estimate:

```
appliance_saving_estimate (p) = baseline_cost (p) − min(candidate_appliance_cost_p over C)
```

This is **explanatory only and not additive** across appliances. The UI must not sum
isolated estimates into a portfolio total (see PRODUCT_SPEC.md §5.7).

### 3.5 Multi-appliance portfolio optimisation

When multiple appliances are declared, the portfolio problem is:

```
minimize Σ_i net_cost with all appliance schedules shifted simultaneously
subject to each appliance's feasibility constraints
```

The search space is the Cartesian product of each appliance's feasible candidate set.
For small appliance counts and typical window sizes, exhaustive enumeration is tractable
in a Web Worker. When the search space exceeds a configurable threshold, a greedy or
heuristic approach may be used, but the implementation must document which strategy
is applied and any approximation bound.

The **headline flexibility-only saving** uses the joint optimal portfolio schedule.

---

## 4 — EV Charging Optimisation

### 4.1 Energy requirement calculation

For an EV with declared parameters:

- `battery_capacity_kwh` (kWh)
- `current_soc_percent` (%)
- `target_soc_percent` (%)
- `charging_efficiency` (factor, 0 < value ≤ 1; absent = implementation default)

Energy required at the battery terminals:

```
energy_at_battery (kWh) = battery_capacity_kwh (kWh) × [target_soc_percent (%) − current_soc_percent (%)] ÷ 100 (%)
```

Energy drawn from the grid (accounting for efficiency losses):

```
energy_from_grid (kWh) = energy_at_battery (kWh) ÷ charging_efficiency
```

If `charging_efficiency` is absent, a default value (e.g. `0.95`) is applied by the
implementation. The default must be documented at runtime.

### 4.2 Charging window definition

The charging window spans from `plug_in_window_start` to `departure_time_local`, both
in Europe/London local time. Two canonical cases exist:

1. **Same-day window** — If departure local time is strictly later than plug-in local
   time (e.g. 08:00 to 12:00), the entire window falls on one calendar date.
   The window duration is `departure_time_local − plug_in_window_start`.

2. **Overnight window** — If departure local time is equal to or earlier than plug-in
   local time (e.g. 23:00 to 07:00), departure occurs on the following local date.
   The window duration is `(24 − plug_in_window_start_hours) + departure_time_local_hours`.
   This is valid and must never be treated as an error.

The window duration in hours is computed as:

```
if departure_time_local > plug_in_window_start:
    # same-day
    window_duration_hours (h) = departure_time_local − plug_in_window_start
else:
    # overnight — departure on the following local date
    window_duration_hours (h) = (24:00 − plug_in_window_start) + departure_time_local
```

The charging window is generated from actual Europe/London zoned calendar boundaries.
Local half-hour slots are then mapped to real UTC intervals using the Europe/London
time-zone rules in effect on each date. This means:

- The number of available UTC half-hour intervals is determined by enumerating
  actual UTC boundary pairs within the local time window, **not** by dividing a nominal
  duration by 0.5.
- On a spring-forward day (last Sunday in March), 01:00–02:00 BST does not exist;
  any local half-hour slots that would fall in this gap are skipped, producing one
  fewer UTC interval than the nominal count would suggest.
- On a fall-back day (last Sunday in October), 01:00 UTC occurs twice locally
  (as 01:00 GMT and again as 01:00 BST). The window yields one extra UTC interval
  compared to the nominal count.
- These DST adjustments are required so that available intervals match actual UTC
  half-hour slots resolvable against tariff rates (see §7.2).

**Example — overnight window 23:00–07:00 on a non-DST date:**

```
window_duration_hours = (24 − 23) + 7 = 1 + 7 = 8 h
Nominal intervals = 16.
On a normal day (no DST boundary), this maps to exactly 16 UTC half-hour intervals:
    Day 1: 23:00, 23:30 local → 2 UTC intervals
    Day 2: 00:00 through 06:30 local → 14 UTC intervals
Total = 16 ✓
```

This is a valid overnight window and serves as the canonical worked example in §4.5.

### 4.3 Cheapest-interval allocation

Available intervals are sorted by resolved import rate (ascending). Allocation fills the
cheapest intervals first, up to the charger's per-interval capacity:

```
max_kwh_per_interval (kWh) = charger_capacity_kw (kW) × 0.5 (h)
```

For each interval in sorted order:

```
allocated_kwh_i = min(max_kwh_per_interval, remaining_energy_from_grid)
remaining_energy_from_grid ← remaining_energy_from_grid − allocated_kwh_i
```

Allocation terminates when `remaining_energy_from_grid ≤ 0` or all available intervals
are filled.

### 4.4 Unmet energy

If the total capacity in the charging window is insufficient:

```
total_window_capacity (kWh) = available_intervals × max_kwh_per_interval (kWh)
unmet_energy (kWh) = max(0, energy_from_grid − total_window_capacity)
```

When `unmet_energy > 0`, an optimisation-level warning is recorded explaining that the
EV cannot reach its target state of charge within the declared window. The simulator
still allocates as much energy as possible to the cheapest intervals and reports the
shortfall.

### 4.5 Worked EV example

**Inputs:**

- Battery capacity: `60 kWh`
- Current SOC: `30 %`
- Target SOC: `80 %`
- Charging efficiency: `0.95`
- Charger capacity: `7 kW` → max per interval: `7 × 0.5 = 3.5 kWh`
- Plug-in window: 23:00 to 07:00 Europe/London (8 h = 16 half-hour intervals)

**Step 1 — Energy requirement:**

```
energy_at_battery = 60 × (80 − 30) ÷ 100 = 60 × 50 ÷ 100 = 30.0 kWh
energy_from_grid  = 30.0 ÷ 0.95 = 31.578947... kWh (exact value: 30/0.95)
```

> The displayed decimal is truncated for readability; the exact rational value `30 / 0.95`
> is used in all subsequent calculations.

**Step 2 — Window capacity:**

```
total_window_capacity = 16 intervals × 3.5 (kWh/interval) = 56.0 kWh ≥ 31.578947... ✓
```

**Step 3 — Cheapest-interval allocation under TOU tariff:**

Three rate periods in the charging window:

| Local time range | Rate period | Rate (p/kWh) | Intervals in window |
|---|---|---|---|
| 23:00–23:30 | Peak (07:00–23:30) | 30.0 | 1 |
| 23:30, 06:00, 06:30 | Off-peak (23:30–07:00) | 15.0 | 3 |
| 00:00 through 05:30 | Economy (00:00–06:00) | 12.0 | 12 |

Sorted by rate (cheapest first), the economy intervals are filled:

```
intervals_needed = ceil(31.578947... ÷ 3.5) = ceil(9.02256...) = 10 intervals

First 9 full intervals: 9 × 3.5 = 31.50 kWh at 12.0 p/kWh
Remaining energy:    31.578947... − 31.50 = 0.078947... kWh in the 10th interval

Cost from economy intervals:
= 9 × 3.5 (kWh) × 12.0 (p/kWh) + 0.078947... (kWh) × 12.0 (p/kWh)
= 378.0 + 0.9474 = 378.9474 p

Total EV charging cost ≈ 378.95 p (display, rounded to nearest penny)
```

**Verification:** All energy is allocated to economy-rate intervals (12.0 p/kWh).
`(30.0 / 0.95) × 12.0 = 378.947368... p`. The cheapest-interval strategy avoids the off-peak
(15.0) and peak (30.0) rates entirely.

**Comparison — naive even distribution across all 16 intervals:**

```
per_interval_energy = 31.578947... ÷ 16 = 1.973684... kWh

Peak cost:    1 × 1.97368 (kWh) × 30.0 (p/kWh)   = 59.2105 p
Off-peak cost: 3 × 1.97368 (kWh) × 15.0 (p/kWh)   = 88.8158 p
Economy cost: 12 × 1.97368 (kWh) × 12.0 (p/kWh)   = 284.2105 p

Naive total: 59.2105 + 88.8158 + 284.2105 = 432.2368 p
```

Cheapest-interval allocation saves `432.2368 − 378.9474 = 53.2895 p` (rounded from 53.289474...) versus naive distribution.

**Step 4 — Unmet energy check:**

```
unmet_energy = max(0, 31.578947... − 56.0) = 0 kWh ✓
```

---

## 5 — Battery Dispatch Optimisation

### 5.1 State-of-charge discretisation

Battery state of charge (SOC) is tracked as a percentage of `capacity_kwh`:

```
soc_kwh (kWh) = soc_percent (%) × capacity_kwh (kWh) ÷ 100 (%)
```

SOC is bounded:

```
min_soc_kwh = min_soc_percent (%) × capacity_kwh (kWh) ÷ 100 (%)
max_soc_kwh = max_soc_percent (%) × capacity_kwh (kWh) ÷ 100 (%)
```

For discrete optimisation, SOC levels are quantised to a step size chosen by the
implementation. A reasonable default is `soc_step = capacity_kwh ÷ N_levels` where
`N_levels` balances solution quality and computational cost (e.g., `N_levels = 20`).
The implementation must document the chosen discretisation at runtime.

### 5.2 Actions and state transitions

At each half-hour interval, the battery takes one of three actions:

| Action | Power flow | Grid effect |
|---|---|---|
| **Charge** | Grid → Battery (up to `max_charge_rate_kw`) | Increases grid import |
| **Discharge** | Battery → Home (up to `max_discharge_rate_kw`) | Reduces grid import or enables export |
| **Idle** | No flow | SOC unchanged (aside from self-discharge if modelled) |

Per-interval energy transfer:

```
Δsoc_kwh = power_kw (kW) × 0.5 (h) × direction_factor × efficiency_factor
```

Where:
- `direction_factor` = `+1` for charge, `−1` for discharge, `0` for idle.
- `efficiency_factor` accounts for round-trip losses:
  - During charging: `sqrt(round_trip_efficiency)` applied to energy entering the battery.
  - During discharging: `sqrt(round_trip_efficiency)` applied to energy leaving the battery.
  - If `round_trip_efficiency` is absent, a default (e.g. `0.90`) is applied.

SOC transition for interval _i_:

```
soc_after_i = soc_before_i + Δsoc_kwh_i ÷ capacity_kwh × 100 (%)
```

Constraint: `min_soc_percent ≤ soc_after_i ≤ max_soc_percent` for every interval.

### 5.3 Constraints

At each interval:

1. **SOC bounds:** `min_soc_percent ≤ soc_after ≤ max_soc_percent`.
2. **Power limits:** `0 ≤ power_kw ≤ max_charge_rate_kw` (charge),
   `0 ≤ power_kw ≤ max_discharge_rate_kw` (discharge).
3. **Per-interval energy cap:** `Δsoc_kwh ≤ power_kw × 0.5 h`.
4. **Non-negative grid import:** When the battery discharges, it offsets household
   consumption from that interval. If discharge exceeds current consumption, the excess
   may be exported (if export rate exists) or is curtailed (if no export capability).

### 5.4 Single-horizon dynamic programming

For one contiguous horizon of _T_ intervals and _S_ SOC states:

```
V_i(soc) = min over actions a ∈ {charge, discharge, idle} of:
              [grid_cost_i(a, soc) + V_{i+1}(soc') ]
```

Where:
- `grid_cost_i(a, soc)` is the interval cost given action _a_ at SOC state _soc_.
- `soc'` is the resulting SOC after applying action _a_ for 0.5 h.
- Boundary condition at the final interval: `V_T(soc) = terminal_soc_cost(soc)`.

Grid cost per interval:

```
grid_import_i (kWh) = max(0, household_consumption_i − battery_discharge_i + battery_charge_i)
grid_export_i (kWh) = max(0, battery_discharge_i + export_generation_i − household_consumption_i)

grid_cost_i (p) = grid_import_i (kWh) × import_rate_i (p/kWh)
                 − grid_export_i (kWh) × export_rate_i (p/kWh)
```

### 5.5 Rolling horizons and terminal SOC

Because full-year optimisation is intractable, the simulator uses **rolling 48-hour
horizons** (96 half-hour intervals). To avoid horizon-edge artefacts:

1. At each step, solve a 48-hr DP problem.
2. Execute only the first 24 hours of the solution.
3. Advance the horizon by 24 hours and re-solve.

The **terminal SOC** at the end of each 48-hr horizon is penalised to encourage smooth
transitions between consecutive horizons:

```
terminal_soc_cost(soc_T) = λ × (soc_T − soc_target_ref)^2
```

Where `soc_target_ref` is a reference target SOC (e.g., the midpoint of `[min_soc, max_soc]`)
and `λ` is a penalty coefficient chosen by the implementation. The initial SOC for each
new horizon equals the actual SOC at that point from the previously executed decisions.

### 5.6 Worked battery example

**Inputs:**

- Capacity: `10 kWh`
- Current SOC: `50 %` = 5.0 kWh
- Min SOC: `20 %` = 2.0 kWh, Max SOC: `90 %` = 9.0 kWh
- Max charge rate: `5 kW` → max per interval: `2.5 kWh`
- Max discharge rate: `4 kW` → max per interval: `2.0 kWh`
- Round-trip efficiency: `0.90` → per-direction factor: `sqrt(0.90) = 0.94868...`
- 3-interval horizon (for illustration only; production uses 96 intervals)

**Household consumption and tariff:**

| Interval | Consumption (kWh) | Import rate (p/kWh) |
|---|---|---|
| 0 (20:00–20:30) | 2.0 | 35.0 |
| 1 (20:30–21:00) | 1.5 | 30.0 |
| 2 (21:00–21:30) | 3.0 | 10.0 |

**Interval 0 — Charge action:**

SOC before: `50 %` = 5.0 kWh. Action: charge at max rate (`5 kW`).

```
Δsoc_kwh = 5 (kW) × 0.5 (h) × 0.94868 = 2.3717 kWh
soc_after = 5.0 + 2.3717 = 7.3717 kWh → 73.717 % (within [20%, 90%]) ✓

Grid import = household_consumption + battery_charge_power × 0.5h
            = 2.0 + 5.0 × 0.5 = 2.0 + 2.5 = 4.5 kWh

grid_cost_0 = 4.5 (kWh) × 35.0 (p/kWh) = 157.5 p
```

**Interval 1 — Discharge action:**

SOC before: `73.717 %` = 7.3717 kWh. Action: discharge at max rate (`4 kW`).

```
discharge_to_home_kwh = 4 (kW) × 0.5 (h) × 0.94868 = 1.8974 kWh
soc_after = 7.3717 − 1.8974 = 5.4743 kWh → 54.743 % (within bounds) ✓

Battery supplies 1.8974 kWh to the home. Household needs 1.5 kWh.
Net: battery covers all consumption; excess = 1.8974 − 1.5 = 0.3974 kWh.
Excess exported at export rate (if defined); otherwise curtailed.

Grid import = max(0, 1.5 − 1.8974) = 0 kWh
grid_cost_1 = 0 p (no grid import)
```

**Interval 2 — Idle action:**

SOC before: `54.743 %` = 5.4743 kWh. Action: idle.

```
soc_after = 5.4743 kWh → unchanged
Grid import = household_consumption = 3.0 kWh
grid_cost_2 = 3.0 (kWh) × 10.0 (p/kWh) = 30.0 p
```

**Total horizon cost:**

```
total_grid_cost = 157.5 + 0 + 30.0 = 187.5 p
```

> **Verification:** The battery charges during the expensive interval (35.0 p/kWh),
> discharges to offset consumption during the mid-priced interval (30.0 p/kWh), and
> idles during the cheap interval (10.0 p/kWh) when grid import is already economical.
> The final SOC (54.7 %) remains within bounds. A full DP would explore all action
> combinations to find the global minimum for the horizon.

---

## 6 — Carbon Emissions and Weighted Scoring

### 6.1 Per-interval emissions

For each interval _i_ where carbon data is available:

```
emissions_i (g CO₂e) = import_kwh_i (kWh) × intensity_i (g CO₂e/kWh)
```

Where `intensity_i` is the UK grid carbon intensity matched to this interval. If carbon
data is unavailable for an interval, emissions for that interval are set to zero and a
warning is recorded (not a data quality failure — carbon data is optional).

### 6.2 Total emissions

```
total_emissions (g CO₂e) = Σ emissions_i (g CO₂e)
displayed_emissions (kg CO₂e) = total_emissions ÷ 1000 (g/kg)
```

Emissions are calculated independently of cost optimisation. A separate run may be
performed with carbon-aware scheduling if the user enables it.

### 6.3 Weighted cost-carbon scoring

When both cost and carbon objectives are considered, a weighted objective function is used
with lower values preferred:

```
weighted_objective_i = cost_weight × normalised_cost_i + carbon_weight × normalised_emissions_i
```

The candidate with the **minimum** weighted objective is selected.

Where:
- `cost_weight` and `carbon_weight` sum to 1.0. Default weights are visible and
  documented at runtime.
- `normalised_cost_i` = `(cost_i − min_cost) ÷ (max_cost − min_cost)` across all candidate
  schedules, clamped to [0, 1]. Lower cost produces a lower normalised value.
- `normalised_emissions_i` computed analogously:
  `(emissions_i − min_emissions) ÷ (max_emissions − min_emissions)`, clamped to [0, 1].
  Lower emissions produce a lower normalised value.
- When a component range has `max = min` (zero variance), its normalised value is 0
  for all candidates.
- Monetary totals are unchanged by the scoring mode. The weighted objective only affects
  candidate selection, not the computed cost or emission values themselves.
- All component values (normalised_cost, normalised_emissions) and the final
  weighted_objective are exposed in results so the user can inspect each contribution.

This is a transparent Pareto-front approximation with explicit weights, not a
black-box multi-objective optimisation.

---

## 7 — Edge Cases

### 7.1 Missing data handling

| Condition | Behaviour | Confidence effect |
|---|---|---|
| Import rate unresolved for interval | Interval cost excluded; warning recorded | Downgrade per PRODUCT_SPEC §6.2 rule 5 |
| Import consumption `null` (missing) | No substitution; interval contributes nothing to cost | Downgrade per PRODUCT_SPEC §6.2 rule 2 |
| Export data absent entirely | Total export income = 0 for all scenarios | None |
| Standing charge not provided | Defaulted to 0 p/day | Medium confidence (§6.2 rule 7) |
| Duplicate timestamps (unresolved) | Calculation blocked for that interval | Low confidence (§6.2 rule 4) |

**Never interpolate:** missing rates, missing consumption, and missing carbon data are
never filled by averaging adjacent intervals or extrapolating from partial data.

### 7.2 DST transitions

Europe/London has two DST transitions per year:

| Transition | Direction | Effect on half-hour intervals |
|---|---|---|
| Last Sunday March (01:00 UTC → 02:00) | Spring forward | Local day has **46** intervals (not 48) |
| Last Sunday October (01:00 UTC → 00:00) | Fall back | Local day has **50** intervals (not 48) |

Rules:
1. Code must **never assume 48 intervals per local day**. Expected interval counts are
   computed from actual Europe/London calendar boundaries for the specific date range.
2. Standing charges are applied once per distinct local date regardless of interval count.
3. TOU period matching uses Europe/London local time. An interval is assigned to a
   TOU period by its **local start hour**. At DST transitions, the mapping from UTC
   to local time shifts by ±1 h; the implementation must account for this when resolving
   rates.

### 7.3 Annualisation

When the user wishes to estimate annual costs or savings from a partial-period dataset:

```
daily_average_cost (£/day) = net_cost (p) ÷ 100 (p/£) ÷ N_days_in_period
annualised_cost (£/year) = daily_average_cost × 365.25 (days/year)
```

Where `N_days_in_period` is the number of distinct Europe/London calendar dates in the
dataset (from earliest to latest inclusive). This linear extrapolation is labelled as an
**estimate** in the UI — it does not account for seasonal consumption variation, tariff
rate changes, or billing cycle alignment. The annualised figure carries a visible
assumption that results are based on limited-period data extrapolated linearly.

---

## Appendix A — Revision History

| Version | Date | Task | Change |
|---|---|---|---|
| 1.0.0 | 2026-07-21 | TASK-006 | Initial calculation methodology: billing, standing charge, export, aggregation, rounding, savings decomposition, appliance optimisation, EV charging, battery dispatch, carbon emissions, edge cases (missing data, DST, annualisation), worked billing/EV/battery examples |
| 1.1.0 | 2026-07-21 | Corrective audit | §3.3: corrected appliance candidate scoring to use appliance energy profile not household import_kwh; added baseline subtraction rules (remove appliance, clip-to-zero, insert, bill adjusted profile). §4.2: replaced midnight-crossing error rule with same-day/overnight window logic per TASK-054; interval count derived from actual Europe/London UTC boundaries not nominal division; DST spring-forward/fall-back handling. §6.3: replaced maximisation-with-negative-sign objective with lower-is-better minimisation (weighted_objective = cost_weight × normalised_cost + carbon_weight × normalised_emissions); both components now lower-is-better; weights visible and sum to 1; zero-variance normalisation returns 0; monetary totals unchanged; component values exposed.
