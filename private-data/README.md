# Private Data

This directory is for local private data only. Its contents are ignored by Git (see `.gitignore`).

## What belongs here

- Real smart-meter CSV or JSON files downloaded from your DMP, n3rgy device, or Octopus Energy account.
- Private tariff rate sheets containing personal meter identifiers.
- Household schedules with personally identifiable consumption patterns.

## What must NOT be committed

Under no circumstances should real smart-meter data be committed to the repository:

1. **Consumption intervals** — half-hourly kWh readings are personally identifiable.
2. **Meter identifiers** — MPAN, device IDs, and serial numbers.
3. **Tariff personalisation** — standing charges, region codes, and direct debit amounts tied to a specific supply.
4. **Derived household results** — aggregated profiles that could re-identify a household.

## What you may commit

Test fixtures belong in `fixtures/`. Fixtures must be:

- Synthetic or anonymised data with no real meter identifiers.
- Committed and reviewed as part of the normal pull-request process.
- Sufficient to exercise all parsing, adaptation, and billing code paths.

## Git configuration

The `.gitignore` entry `private-data/*` (with `!private-data/README.md`) ensures that only this README is tracked. All other files in this directory are silently ignored.
