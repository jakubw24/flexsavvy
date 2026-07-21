# FlexSavvy — Canonical Data Schema

> Living document. Created by TASK-005 (2026-07-21).
> Defines canonical inputs, outputs, units and runtime constraints for all data flowing through the simulator.
> No TypeScript interfaces are defined here — this is the semantic contract that later implementation tasks realise.

---

## 1 — Schema Versioning

| Field | Value |
|---|---|
| Schema version | `1.0.0` |
| Date | 2026-07-21 |
| Created by | TASK-005 |
| Supersedes | None (first canonical schema) |

### Versioning rules

1. The schema is versioned with semantic versioning (MAJOR.MINOR.PATCH).
2. **MAJOR** bump: removal of fields, change of unit semantics, or change of interval granularity.
3. **MINOR** bump: addition of new optional fields or new data categories that do not break existing consumers.
4. **PATCH** bump: corrections to descriptions, examples, or non-breaking clarifications.
5. Every schema-carrying document (scenario JSON export, interval CSV) must include a `schema_version` field so downstream consumers can validate compatibility.

---

## 2 — Global Conventions

### 2.1 Time

| Concept | Representation | Notes |
|---|---|---|
| Internal timestamps | UTC ISO 8601 (`YYYY-MM-DDTHH:mm:ssZ`) | All intervals identified by UTC start time |
| Interval granularity | 30 minutes (1800 seconds) | Canonical half-hour resolution |
| Interval boundaries | **Start-inclusive, end-exclusive** | `[start, start + 30min)` |
| Local calendar dates | Europe/London | Used only for standing-charge day counting and TOU period matching |
| DST awareness | Mandatory | A local day may have 46, 48, or 50 half-hour intervals; code must never assume 48 |

### 2.2 Units

| Quantity | Unit | Symbol | Notes |
|---|---|---|---|
| Energy | kilowatt-hours | `kWh` | All consumption and generation values |
| Power | kilowatts | `kW` | Appliance ratings, charger capacity |
| Energy price | pence per kWh | `p/kWh` | VAT-inclusive UK prices |
| Standing charge | pence per day | `p/day` | Applied once per distinct Europe/London calendar date |
| Cost / income | pence | `p` | Intermediate calculations; display rounding at presentation boundary only |
| Carbon intensity | grams CO₂e per kWh | `gCO2e/kWh` | UK grid carbon forecast data |

### 2.3 Nullability conventions

- **Required fields**: must be present and non-null. Absence is a schema violation.
- **Optional fields**: may be absent (`undefined` in JSON) or explicitly null, depending on the field definition. When both states have different meanings, this document specifies which applies.
- **Missing data** ≠ zero: absence of an observation must never be represented as numeric `0`. Missing intervals are handled via quality mechanisms and warnings, not by filling with zero. A measured value of `0 kWh` is a valid observation (the meter reported zero consumption for that half-hour).

### 2.4 Numeric precision

- Intermediate calculations retain full precision; rounding occurs only at the presentation boundary.
- Rates are expressed to at most two decimal places in source data but calculations must not round prematurely.
- Monetary totals use a decimal-safe representation (e.g., integer-scaled units or arbitrary-precision decimals) to avoid binary-floating-point artefacts. Exact canonical representation deferred to TASK-006 (calculation methodology).

---

## 3 — Consumption Data Model

### 3.1 Half-Hourly Interval

The fundamental data unit. Every consumption observation maps to one interval record.

| Field | Type | Nullable | Unit | Description |
|---|---|---|---|---|
| `utc_start` | string (ISO 8601) | No | — | UTC start timestamp, e.g. `"2025-03-30T01:30:00Z"` |
| `utc_end` | string (ISO 8601) | Yes | — | UTC end timestamp (derived: `utc_start + 30min`). May be absent but must be derivable. |
| `import_kwh` | number | Yes | kWh | Import consumption for this interval. `null` means missing observation; `0` means meter recorded zero. |
| `export_kwh` | number | Yes | kWh | Export generation for this interval. `null` means missing; `0` means no export recorded. Optional — absent when no export data exists. |
| `local_date` | string (YYYY-MM-DD) | Yes | — | Europe/London local date derived from `utc_start`. Used for standing-charge counting and TOU matching. |
| `local_hour` | number | Yes | h | Europe/London local hour (0–23) derived from `utc_start`. Used for TOU period matching. |

#### Derived fields

`utc_end`, `local_date`, and `local_hour` are **derived** from `utc_start` at ingestion time. They must not be independently edited after derivation. The canonical identity key is `utc_start`.

### 3.2 Consumption Dataset

A collection of interval records representing the user's meter data.

| Field | Type | Nullable | Description |
|---|---|---|---|
| `intervals` | array[Interval] | No | Ordered by `utc_start`, ascending |
| `source_format` | enum | Yes | `"n3rgy"`, `"octopus_json"`, `"octopus_csv"`, `"generic_csv"`, `"demo"` or null |
| `date_range_utc_start` | string (ISO 8601) | No | Earliest interval UTC start in the dataset |
| `date_range_utc_end` | string (ISO 8601) | No | Latest interval UTC end in the dataset |
| `interval_count` | integer | No | Number of intervals in the collection |
| `schema_version` | string | No | Schema version, e.g. `"1.0.0"` |

---

## 4 — Quality Data Model

### 4.1 Data Quality Report

Generated during ingestion, used to derive confidence labels (see PRODUCT_SPEC.md §6).

| Field | Type | Nullable | Description |
|---|---|---|---|
| `expected_interval_count` | integer | No | Number of half-hour intervals expected between first and last local dates inclusive. Computed from Europe/London calendar boundaries, not assumed 48 per day. |
| `actual_interval_count` | integer | No | Number of unique valid intervals found after deduplication |
| `missing_interval_count` | integer | No | Intervals with no observation in the expected range |
| `duplicate_interval_count` | integer | No | Duplicate timestamps detected (may be resolved or unresolved) |
| `duplicates_resolved` | boolean | No | Whether all duplicates have been resolved by user action |
| `outlier_count` | integer | No | Intervals flagged as statistical outliers (exceeds Q3 + 3×IQR) |
| `outliers_accepted` | boolean | Yes | Whether user has explicitly accepted flagged outliers. Absent = not applicable; `false` = outliers present and unaccepted. |
| `confidence_label` | enum | No | `"High"`, `"Medium"`, or `"Low"` per PRODUCT_SPEC.md §6.1–§6.2 |

### 4.2 Interval-Level Warning

Scoped warnings attached to individual intervals (PRODUCT_SPEC.md §5.10).

| Field | Type | Nullable | Description |
|---|---|---|---|
| `utc_start` | string (ISO 8601) | No | The interval this warning applies to |
| `warning_code` | string | No | Stable identifier, e.g. `"UNRESOLVED_PRICE"`, `"DUPLICATE_TIMESTAMP"`, `"OUTLIER"` |
| `severity` | enum | No | `"info"`, `"warn"`, or `"error"` |
| `message` | string | No | Human-readable explanation |
| `scope` | enum | No | `"interval"` for interval-level warnings. (Dataset-level, scenario-level, and optimisation-level warnings are stored separately.) |

### 4.3 Dataset-Level Warning

Warnings affecting the entire consumption dataset before any calculation.

| Field | Type | Nullable | Description |
|---|---|---|---|
| `warning_code` | string | No | Stable identifier |
| `severity` | enum | No | `"info"`, `"warn"`, or `"error"` |
| `message` | string | No | Human-readable explanation |
| `scope` | enum | No | `"dataset"` |

---

## 5 — Tariff and Pricing Models

### 5.1 Flat Tariff

A single rate applied to all billable intervals.

| Field | Type | Nullable | Description |
|---|---|---|---|
| `tariff_type` | string | No | `"flat"` |
| `name` | string | Yes | Display name, e.g. `"Current Tariff"`, `"Agile Octopus"` |
| `import_rate` | number | No | p/kWh including VAT |
| `standing_charge` | number | Yes | p/day including VAT. `null` if not provided; defaults to 0 in calculation with confidence downgrade to Medium. |
| `export_rate` | number | Yes | p/kWh including VAT. `null` or absent when no export rate defined. |

### 5.2 Time-of-Use (TOU) Tariff

Rate changes according to a published schedule of periods. Periods are defined in Europe/London local time.

| Field | Type | Nullable | Description |
|---|---|---|---|
| `tariff_type` | string | No | `"tou"` |
| `name` | string | Yes | Display name |
| `standing_charge` | number | Yes | p/day including VAT. Same nullability rules as flat tariff. |
| `export_rate` | number | Yes | p/kWh including VAT. Optional. |
| `periods` | array[TOUPeriod] | No | Ordered schedule of rate periods. At least one period required. |

#### TOU Period

| Field | Type | Nullable | Description |
|---|---|---|---|
| `name` | string | Yes | Period label, e.g. `"peak"`, `"off-peak"`, `"overnight"` |
| `rate` | number | No | p/kWh including VAT |
| `days_of_week` | array[integer] | No | Monday = 0 through Sunday = 6. Which weekdays this period applies to. |
| `start_local_time` | string (HH:MM) | No | Local start time in Europe/London, e.g. `"07:00"` |
| `end_local_time` | string (HH:MM) | No | Local end time in Europe/London, e.g. `"23:00"`. Crosses midnight when `end_local_time < start_local_time`. |
| `date_override_start` | string (YYYY-MM-DD) | Yes | First local date this period is effective. Absent = no lower bound. |
| `date_override_end` | string (YYYY-MM-DD) | Yes | Last local date this period is effective (inclusive). Absent = no upper bound. |

#### TOU overlap priority

When multiple periods overlap the same interval:
1. The period with the most specific date range takes priority (narrower date span wins).
2. If date ranges are equal, the period that appears first in the `periods` array takes priority.
3. Overlap warnings are emitted at the interval level when overlaps occur.

### 5.3 Dynamic / Interval Tariff

Per-interval pricing resolved from an external rate schedule (e.g., Agile Octopus).

| Field | Type | Nullable | Description |
|---|---|---|---|
| `tariff_type` | string | No | `"dynamic"` |
| `name` | string | Yes | Display name |
| `standing_charge` | number | Yes | p/day including VAT |
| `export_rate` | number | Yes | p/kWh including VAT. Optional. |
| `rate_source` | enum | No | `"committed_fixture"`, `"live_api"` or `"manual_csv"` |
| `rates` | array[DynamicRate] | Yes | Per-interval rate records. May be absent initially if resolved at runtime from fixtures. |

#### Dynamic Rate

| Field | Type | Nullable | Description |
|---|---|---|---|
| `utc_start` | string (ISO 8601) | No | UTC start of the priced interval |
| `rate` | number | No | p/kWh including VAT |

### 5.4 Tariff Validity Rules

A tariff is valid when:
- `tariff_type` is one of `"flat"`, `"tou"`, or `"dynamic"`.
- Flat tariff `import_rate` values must be non-negative.
- Scheduled TOU period `rate` values must be non-negative.
- Dynamic interval `rate` values may be negative; a negative dynamic price is valid and must be preserved exactly.
- Flat tariffs have a defined `import_rate`.
- TOU tariffs have at least one period in `periods`.
- TOU periods define valid local times (`HH:MM` where `00 ≤ HH ≤ 23`).
- Dynamic tariffs either have `rates` populated or will be resolved from committed fixtures before calculation.

---

## 6 — Appliance, EV, and Battery Models

### 6.1 Appliance Profile

A flexible appliance the user declares for optimisation (public-alpha scope).

| Field | Type | Nullable | Description |
|---|---|---|---|
| `id` | string | No | Unique identifier within the scenario |
| `name` | string | No | Display name, e.g. `"Washing machine"`, `"Tumble dryer"` |
| `power_kw` | number | No | Rated power draw in kW. Must be positive. |
| `cycle_duration_hours` | number | No | Hours the appliance must run continuously. Must be positive and a multiple of 0.5. |
| `earliest_start_local` | string (HH:MM) | No | Earliest acceptable Europe/London start time, e.g. `"06:00"` |
| `latest_start_local` | string (HH:MM) | No | Latest acceptable Europe/London start time, e.g. `"22:00"` |
| `is_scheduled` | boolean | Yes | Whether the appliance already runs on a fixed schedule. Absent = treated as `false`. |

#### Appliance validation rules

- `power_kw > 0`.
- `cycle_duration_hours > 0` and is a multiple of 0.5 (30 minutes).
- `earliest_start_local` ≤ `latest_start_local` on a same-day basis; if earliest > latest, the window crosses midnight (invalid — appliance cycles must complete within a single local day unless explicitly declared otherwise in a future task).
- The window from `earliest_start_local` to end-of-day minus `cycle_duration_hours` must contain at least one valid start position.

### 6.2 EV Profile

Electric vehicle charging model (paid-ready, deferred scope).

| Field | Type | Nullable | Description |
|---|---|---|---|
| `id` | string | No | Unique identifier |
| `battery_capacity_kwh` | number | No | Total EV battery capacity in kWh. Must be positive. |
| `current_soc_percent` | number | No | Current state of charge as percentage (0–100). |
| `target_soc_percent` | number | No | Desired state of charge at departure (0–100). Must be ≥ `current_soc_percent`. |
| `plug_in_window_start` | string (HH:MM) | No | Earliest Europe/London time the vehicle is plugged in |
| `departure_time_local` | string (HH:MM) | No | Latest Europe/London time the vehicle must be ready |
| `charger_capacity_kw` | number | No | Maximum charger power output in kW. Must be positive. |
| `charging_efficiency` | number | Yes | Efficiency factor (0 < value ≤ 1). Absent = default applied by implementation. |

#### EV validation rules

- `battery_capacity_kwh > 0`.
- `0 ≤ current_soc_percent < target_soc_percent ≤ 100`.
- `charger_capacity_kw > 0`.
- The plug-in window must span at least one half-hour interval.

### 6.3 Battery Profile

Home battery storage model (paid-ready, deferred scope).

| Field | Type | Nullable | Description |
|---|---|---|---|
| `id` | string | No | Unique identifier |
| `capacity_kwh` | number | No | Total battery capacity in kWh. Must be positive. |
| `max_charge_rate_kw` | number | No | Maximum charge power in kW. Must be positive. |
| `max_discharge_rate_kw` | number | No | Maximum discharge power in kW. Must be positive. |
| `current_soc_percent` | number | No | Current state of charge percentage (0–100). |
| `min_soc_percent` | number | No | Minimum allowed state of charge (0–100). |
| `max_soc_percent` | number | No | Maximum allowed state of charge (0–100). Must be ≥ `min_soc_percent`. |
| `round_trip_efficiency` | number | Yes | Combined charge/discharge efficiency factor. Absent = default applied by implementation. |

#### Battery validation rules

- `capacity_kwh > 0`.
- Both rates are positive.
- `0 ≤ min_soc_percent ≤ current_soc_percent ≤ max_soc_percent ≤ 100`.

---

## 7 — Carbon Data Model

Optional carbon intensity data (paid-ready, deferred scope). Sourced from UK public APIs or committed fixtures.

### 7.1 Carbon Interval

| Field | Type | Nullable | Description |
|---|---|---|---|
| `utc_start` | string (ISO 8601) | No | UTC start of the carbon interval (30-min granularity) |
| `intensity_gco2e_per_kwh` | number | No | Grid carbon intensity in grams CO₂-equivalent per kWh. Must be non-negative. |
| `region_code` | string | Yes | UK regional grid identifier, e.g. `"M"` for England & Wales. Absent = national average applied. |

### 7.2 Carbon Dataset

| Field | Type | Nullable | Description |
|---|---|---|---|
| `intervals` | array[CarbonInterval] | No | Ordered by `utc_start`, ascending |
| `data_source` | string | No | `"national_grid_eso"`, `"committed_fixture"` or other source identifier |
| `schema_version` | string | No | Schema version |

---

## 8 — Scenario and Result Models

### 8.1 Scenario Configuration

The complete input bundle for one simulation run.

| Field | Type | Nullable | Description |
|---|---|---|---|
| `scenario_id` | string | No | Unique identifier for this scenario |
| `schema_version` | string | No | Schema version, e.g. `"1.0.0"` |
| `consumption_dataset` | ConsumptionDataset | No | The user's meter data (§3.2) |
| `current_tariff` | Tariff (flat/TOU/dynamic) | No | User's existing tariff |
| `candidate_tariffs` | array[Tariff] | Yes | Comparison tariffs. Empty array or absent = no tariff-only or combined scenarios. |
| `appliances` | array[ApplianceProfile] | Yes | Declared flexible appliances. Empty = no flexibility modelling. |
| `ev_profile` | EVProfile | Yes | Optional EV configuration (paid-ready) |
| `battery_profile` | BatteryProfile | Yes | Optional battery configuration (paid-ready) |
| `carbon_data` | CarbonDataset | Yes | Optional carbon intensity data (paid-ready) |

### 8.2 Scenario Result

Output produced by one simulation run against a specific scenario and tariff combination.

| Field | Type | Nullable | Description |
|---|---|---|---|
| `scenario_id` | string | No | References the parent scenario configuration |
| `tariff_name` | string | No | Name of the tariff this result is calculated against |
| `result_type` | enum | No | `"current"`, `"tariff_only"`, `"flexibility_only"`, or `"combined"` |
| `total_cost_pence` | number | No | Net cost in pence: import costs + standing charges − export income |
| `import_cost_pence` | number | Yes | Sum of import interval costs. Excluded intervals (unresolved prices) not counted. |
| `standing_charge_pence` | number | No | Total standing charges for the analysis period |
| `export_income_pence` | number | Yes | Sum of export income. Absent or zero when no export rate defined. |
| `confidence_label` | enum | No | `"High"`, `"Medium"`, or `"Low"` |
| `replay_projection_label` | enum | No | `"Replay"` or `"Projection"` per PRODUCT_SPEC.md §6.3 |
| `interval_results` | array[IntervalResult] | No | Per-interval breakdown records (§5.5 of PRODUCT_SPEC.md) |
| `warnings` | array[Warning] | No | All warnings applicable to this result (dataset-level, interval-level, scenario-level, optimisation-level) |

### 8.3 Interval Result

One record per half-hour interval in a given scenario's calculation (PRODUCT_SPEC.md §5.5).

| Field | Type | Nullable | Description |
|---|---|---|---|
| `utc_start` | string (ISO 8601) | No | UTC start of the interval |
| `import_kwh` | number | Yes | Consumption for this interval from source data. `null` = missing observation. |
| `export_kwh` | number | Yes | Export for this interval. `null` = missing; absent when no export data. |
| `resolved_import_rate` | number | Yes | Import rate (p/kWh) applied to this interval. `null` when unresolved. |
| `resolved_export_rate` | number | Yes | Export rate (p/kWh). `null` or absent when not applicable. |
| `import_cost_pence` | number | Yes | Cost for this interval: `import_kwh × resolved_import_rate`. Excluded when rate unresolved. |
| `export_income_pence` | number | Yes | Income for this interval: `export_kwh × resolved_export_rate`. Zero when either is unavailable. |
| `warnings` | array[Warning] | No | Interval-level warnings for this row. Empty array if none. |

---

## 9 — Optimisation Output Models

### 9.1 Appliance Schedule

Recommended operating plan for one flexible appliance under one scenario (§5.8 of PRODUCT_SPEC.md).

| Field | Type | Nullable | Description |
|---|---|---|---|
| `appliance_id` | string | No | References the declared appliance profile |
| `scenario_result_type` | enum | No | `"flexibility_only"` or `"combined"` |
| `recommended_utc_start` | string (ISO 8601) | Yes | Recommended UTC start of the optimal cycle. `null` when infeasible. |
| `cycle_interval_count` | integer | Yes | Number of half-hour intervals the appliance occupies. `null` when infeasible. |
| `satisfied_constraints` | boolean | Yes | Whether all user constraints are met by this schedule |
| `infeasibility_reason` | string | Yes | Human-readable explanation when no valid schedule exists |

### 9.2 EV Schedule

Conditional output — produced only when the EV module is implemented and enabled.

| Field | Type | Nullable | Description |
|---|---|---|---|
| `ev_id` | string | No | References the declared EV profile |
| `scenario_result_type` | enum | No | `"flexibility_only"` or `"combined"` |
| `charging_intervals` | array[EVChargingInterval] | Yes | Half-hour intervals with allocated charging power. Absent when infeasible. |

#### EV Charging Interval

| Field | Type | Nullable | Description |
|---|---|---|---|
| `utc_start` | string (ISO 8601) | No | UTC start of the charging interval |
| `power_kw` | number | No | Power allocated in this interval (≤ `charger_capacity_kw`) |

### 9.3 Battery Dispatch Schedule

Conditional output — produced only when the battery module is implemented and enabled.

| Field | Type | Nullable | Description |
|---|---|---|---|
| `battery_id` | string | No | References the declared battery profile |
| `scenario_result_type` | enum | No | `"flexibility_only"` or `"combined"` |
| `dispatch_intervals` | array[BatteryDispatchInterval] | Yes | Half-hour intervals with charge/discharge actions. Absent when infeasible. |

#### Battery Dispatch Interval

| Field | Type | Nullable | Description |
|---|---|---|---|
| `utc_start` | string (ISO 8601) | No | UTC start of the dispatch interval |
| `action` | enum | No | `"charge"`, `"discharge"`, or `"idle"` |
| `power_kw` | number | No | Absolute power in kW. Positive for both charge and discharge; action field disambiguates direction. |
| `soc_after_percent` | number | No | State of charge after this interval's action |

---

## 10 — Valid and Invalid Examples

### 10.1 Valid Consumption Interval

```json
{
  "utc_start": "2025-03-30T01:30:00Z",
  "utc_end": "2025-03-30T02:00:00Z",
  "import_kwh": 0.45,
  "export_kwh": null,
  "local_date": "2025-03-30",
  "local_hour": 2
}
```

This represents a valid import observation of 0.45 kWh during the half-hour from 01:30 to 02:00 UTC on 2025-03-30. On this date the UK has just transitioned to British Summer Time (clocks spring forward at 01:00 UTC), so 01:30 UTC corresponds to 02:30 Europe/London local time, hence `local_hour` is 2. No export data exists for this interval (null, not zero). The local date and hour are derived fields computed at ingestion.

### 10.2 Valid Consumption Interval — Measured Zero

```json
{
  "utc_start": "2025-03-30T04:00:00Z",
  "utc_end": "2025-03-30T04:30:00Z",
  "import_kwh": 0,
  "export_kwh": null,
  "local_date": "2025-03-30",
  "local_hour": 4
}
```

A measured zero is distinct from missing data. The meter actively reported 0 kWh for this interval.

### 10.3 Valid Flat Tariff

```json
{
  "tariff_type": "flat",
  "name": "Current Tariff",
  "import_rate": 28.5,
  "standing_charge": 75.0,
  "export_rate": null
}
```

Standard flat tariff: 28.5 p/kWh import rate including VAT, 75.0 p/day standing charge. No export rate defined (null).

### 10.4 Valid TOU Tariff

```json
{
  "tariff_type": "tou",
  "name": "Economy 7",
  "standing_charge": 80.0,
  "export_rate": null,
  "periods": [
    {
      "name": "off-peak",
      "rate": 15.0,
      "days_of_week": [0, 1, 2, 3, 4, 5, 6],
      "start_local_time": "23:30",
      "end_local_time": "07:00"
    },
    {
      "name": "peak",
      "rate": 28.0,
      "days_of_week": [0, 1, 2, 3, 4, 5, 6],
      "start_local_time": "07:00",
      "end_local_time": "23:30"
    }
  ]
}
```

Two-period Economy 7 tariff. Off-peak from 23:30 to 07:00 local time every day. Peak for the remainder. Crosses midnight correctly (end < start in off-peak period).

### 10.5 Valid Appliance Profile

```json
{
  "id": "washer",
  "name": "Washing Machine",
  "power_kw": 2.5,
  "cycle_duration_hours": 2.5,
  "earliest_start_local": "06:00",
  "latest_start_local": "20:00",
  "is_scheduled": false
}
```

A 2.5 kW washing machine with a 2.5-hour cycle (5 intervals). Must start between 06:00 and 20:00 local time. Not currently on a fixed schedule.

### 10.6 Valid Scenario Configuration (minimal)

```json
{
  "scenario_id": "example-001",
  "schema_version": "1.0.0",
  "consumption_dataset": {
    "intervals": [
      {
        "utc_start": "2025-03-30T00:00:00Z",
        "utc_end": "2025-03-30T00:30:00Z",
        "import_kwh": 0.3,
        "local_date": "2025-03-30",
        "local_hour": 0
      }
    ],
    "source_format": "generic_csv",
    "date_range_utc_start": "2025-03-30T00:00:00Z",
    "date_range_utc_end": "2025-03-30T00:30:00Z",
    "interval_count": 1,
    "schema_version": "1.0.0"
  },
  "current_tariff": {
    "tariff_type": "flat",
    "import_rate": 28.5,
    "standing_charge": 75.0
  }
}
```

Minimal valid scenario: one interval, flat tariff, no candidates, no appliances, no EV/battery. This produces only a current-cost result.

### 10.7 INVALID — Missing `utc_start`

```json
{
  "import_kwh": 0.45,
  "local_date": "2025-03-30"
}
```

**Error**: Required field `utc_start` is absent. This interval cannot be identified or placed in the dataset.

### 10.8 INVALID — Zero used for missing data

```json
{
  "utc_start": "2025-03-30T04:00:00Z",
  "import_kwh": 0,
  "local_date": "2025-03-30"
}
```

**Error (when data is actually missing)**: `import_kwh: 0` means the meter measured zero consumption. If no observation exists for this interval, the value must be `null`, and a quality warning must record it as a missing interval. See §2.3 nullability conventions.

### 10.9 INVALID — Negative tariff rate

```json
{
  "tariff_type": "flat",
  "import_rate": -5.0,
  "standing_charge": 75.0
}
```

**Error**: Flat tariff rates must be non-negative. A negative import rate on a flat tariff is not physically meaningful for residential tariffs. (Dynamic interval prices may legitimately be negative; see §5.4.)

### 10.10 INVALID — Appliance cycle shorter than interval granularity

```json
{
  "id": "bad_appliance",
  "name": "Test Device",
  "power_kw": 1.0,
  "cycle_duration_hours": 0.25,
  "earliest_start_local": "08:00",
  "latest_start_local": "16:00"
}
```

**Error**: `cycle_duration_hours` must be a multiple of 0.5 (30-minute interval granularity). 0.25 hours (15 minutes) cannot be represented in the canonical model.

---

## 11 — Cross-Reference: Units and Fields

### 11.1 Unit Cross-Reference Table

| Data Category | Field Name(s) | Unit | Symbol | Nullable | VAT? |
|---|---|---|---|---|---|
| Consumption | `import_kwh` | kWh | — | Yes (missing = null) | N/A |
| Consumption | `export_kwh` | kWh | — | Yes (missing = null) | N/A |
| Tariff (flat) | `import_rate` | p/kWh | — | No | Included |
| Tariff (flat) | `standing_charge` | p/day | — | Yes (defaults to 0) | Included |
| Tariff (flat) | `export_rate` | p/kWh | — | Yes (absent = none) | Included |
| Tariff (TOU) | `period.rate` | p/kWh | — | No | Included |
| Tariff (dynamic) | `rate` | p/kWh | — | No | Included |
| Appliance | `power_kw` | kW | — | No | N/A |
| Appliance | `cycle_duration_hours` | hours | h | No | N/A |
| EV | `battery_capacity_kwh` | kWh | — | No | N/A |
| EV | `charger_capacity_kw` | kW | — | No | N/A |
| EV | `current_soc_percent`, `target_soc_percent` | percent | % | No | N/A |
| Battery | `capacity_kwh` | kWh | — | No | N/A |
| Battery | `max_charge_rate_kw`, `max_discharge_rate_kw` | kW | — | No | N/A |
| Battery | SOC fields | percent | % | No | N/A |
| Carbon | `intensity_gco2e_per_kwh` | g CO₂e/kWh | — | No | N/A |
| Result | `total_cost_pence`, `import_cost_pence`, etc. | pence | p | Varies | Calculated from VAT-inclusive rates |

### 11.2 Field Mapping: Outputs to Source Fields

This table shows which output fields are derived from which input fields. All calculations use unrounded canonical values; rounding occurs only at presentation boundaries.

| Output Field | Derived From | Notes |
|---|---|---|
| `import_cost_pence` (per interval) | `import_kwh` × `resolved_import_rate` | Excluded when rate unresolved |
| `export_income_pence` (per interval) | `export_kwh` × `resolved_export_rate` | Zero when either unavailable |
| `standing_charge_pence` (total) | `standing_charge` × distinct local dates in span | Once per Europe/London date; DST invariant |
| `total_cost_pence` | Sum of interval costs + standing charges − export income | Uses unrounded intermediates |
| `tariff_only_saving` | `current_net_cost` − `candidate_net_cost` | Per PRODUCT_SPEC.md §5.2 |
| `flexibility_only_saving` | `current_net_cost` − `flexible_net_cost` | Per PRODUCT_SPEC.md §5.3 |
| `combined_saving` | `current_net_cost` − `combined_net_cost` | Per PRODUCT_SPEC.md §5.4 |
| `confidence_label` | Quality report + tariff completeness | Rules in PRODUCT_SPEC.md §6.2 |
| `replay_projection_label` | Interval dates vs current UTC time | Rules in PRODUCT_SPEC.md §6.3 |
| Appliance schedule | Appliance profile + interval prices | Deterministic optimiser output |

---

## 12 — Runtime Constraints

### 12.1 Calculation Environment

| Constraint | Value | Rationale |
|---|---|---|
| Execution context | Browser Web Worker | Heavy calculations off main thread; privacy-first |
| Network access | None for calculation | All data in-browser; no server calls during simulation |
| External data | Committed fixtures only | Tariff rates, carbon data loaded from local cache or fixtures |
| Determinism | Required | Same inputs always produce identical outputs |
| Precision | Decimal-safe | No binary floating-point rounding in intermediate calculations |

### 12.2 Interval Handling Rules

1. **No silent interpolation**: When a rate cannot be resolved for an interval, that interval's cost is excluded and a warning is emitted. The gap is never filled by averaging adjacent intervals or extrapolating.
2. **No assumption of 48 intervals per day**: DST transitions produce 46 (spring-forward) or 50 (fall-back) half-hour intervals on the affected Europe/London date. Expected interval counts are computed from actual calendar boundaries.
3. **Missing ≠ zero**: `null` in `import_kwh` means no observation; `0` means the meter recorded zero. Never substitute one for the other.
4. **Start-inclusive, end-exclusive**: An interval `[2025-03-30T01:30:00Z, 2025-03-30T02:00:00Z)` covers from 01:30:00.000 up to but not including 02:00:00.000 UTC.

---

## Appendix A — Schema Revision History

| Version | Date | Task | Change |
|---|---|---|---|
| 1.0.0 | 2026-07-21 | TASK-005 | Initial canonical data schema: consumption, quality, tariffs (flat/TOU/dynamic), appliances, EV, battery, carbon, scenarios, results, warnings, units, examples, cross-reference tables, runtime constraints |
