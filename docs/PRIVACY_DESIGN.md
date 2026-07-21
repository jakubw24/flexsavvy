# FlexSavvy — Privacy Design

> Living document. Created by TASK-007 (2026-07-21).
> Defines browser-only processing boundaries, permitted network activity, data lifecycle,
> and threat model for the FlexSavvy static simulator.
> No legal conclusions are provided; this is an engineering specification.

---

## 1 — Data Classification

Every piece of data that flows through the simulator is classified into one of four categories.
This classification determines where the data may exist, how it is processed, and whether it
may leave the browser.

### 1.1 Sensitive Household Data (SHD)

Data that identifies or characterises the user's household energy usage. **Never leaves the
browser under any circumstance.**

| Field | Category | Source | May persist by default? |
|---|---|---|---|
| Consumption intervals (`import_kwh`, `export_kwh`) | SHD | User file upload | No |
| Interval timestamps (when paired with consumption) | SHD | Derived from user data | No |
| Filenames and file paths | SHD | User file selection | No |
| Device IDs, meter identifiers, MPANs, MPRNs | SHD | Embedded in source files | No |
| Tariff inputs (current tariff rates, standing charges) | SHD | User form entry | No |
| Household schedules (appliance declarations, EV plug-in times, battery dispatch profiles) | SHD | User form entry | No |
| Derived household results (costs, savings, per-interval breakdowns) | SHD | Computed from SHD | No |

**Rules:**
1. SHD is processed exclusively in the browser main thread or Web Worker.
2. SHD is never written to `localStorage`, `sessionStorage`, IndexedDB, cookies, or any other persistent storage by default.
3. SHD is never included in HTTP request bodies, query strings, headers, or cache keys.
4. SHD may only leave the browser as a **user-initiated download** (CSV export, JSON scenario file, printable HTML). The user explicitly triggers these exports; they are never automatic.
5. File metadata (filename, last-modified date, MIME type) is treated as SHD — it may reveal household identity or supplier.

### 1.2 Configuration Data (CD)

Non-personal product settings that control behaviour but do not describe the user's energy use.

| Field | Category | Source | May persist by default? |
|---|---|---|---|
| UI language preference | CD | User selection | Yes, `localStorage` |
| Theme (light/dark) | CD | User selection | Yes, `localStorage` |
| Cost-carbon weight slider position | CD | User interaction during session | No — lost on unload |
| Wizard step state | CD | In-app navigation | No — lost on unload |

**Rules:**
1. Configuration data may be persisted in `localStorage` when it improves the user experience and contains no SHD.
2. Configuration data must never include or reference SHD fields (e.g., a cached wizard state must not contain consumption intervals).
3. All configuration storage is opt-in at the product level — the default state is no persistence.

### 1.3 Public Reference Data (PRD)

Data that is publicly available, non-personal, and shared across all users.

| Field | Category | Source | May persist by default? |
|---|---|---|---|
| Tariff catalogue (product names, published rates, TOU schedules) | PRD | Octopus Energy API → committed fixtures | Yes, static files |
| Carbon intensity forecast data | PRD | National Grid ESO API → committed fixtures | Yes, static files |
| Europe/London IANA tzdata rules | PRD | Browser runtime or bundled `Intl` | N/A — browser intrinsic |
| Demo/sample consumption data | PRD | Committed fixtures | Yes, static files |

**Rules:**
1. PRD may be cached in the browser (service worker cache, HTTP cache, or bundled static files).
2. PRD is pre-fetched by automated workflows and committed as typed fixtures — see §5.
3. PRD must never contain identifiers that could link back to a specific household or meter.

### 1.4 Transient Computation State (TCS)

Intermediate values produced during simulation that exist only for the duration of calculation.

| Field | Category | Lifespan |
|---|---|---|
| Optimisation search state (DP tables, candidate rankings) | TCS | Single Web Worker execution |
| Sorted interval lists for allocation algorithms | TCS | Single computation pass |
| Floating-point intermediates before display rounding | TCS | Single computation pass |
| Partial aggregation totals during daily/monthly grouping | TCS | Single computation pass |

**Rules:**
1. TCS exists only in heap memory during active calculation.
2. TCS is never serialised, logged, or persisted.
3. When the Web Worker terminates (page unload, explicit "Clear my data"), all TCS is reclaimed by garbage collection.

---

## 2 — Permitted Outbound Requests

FlexSavvy is a fully static site. The only network activity permitted at runtime is loading the
site's own assets and optional public-reference-data refreshes. Every outbound request type is
enumerated below; any request not listed is forbidden.

### 2.1 Always permitted (site asset loading)

| Request | Destination | Data sent | Contains SHD? |
|---|---|---|---|
| HTML pages, CSS, JavaScript bundles | Same origin (CDN or host) | None | No |
| Static images and icons | Same origin | None | No |
| Web Worker scripts | Same origin | None | No |

These are standard page-load requests. No data is uploaded.

### 2.2 Conditionally permitted (public reference data refresh)

| Request | Destination | Data sent | Contains SHD? | When permitted |
|---|---|---|---|---|
| Octopus tariff catalogue fetch | `api.octopus.energy` (or equivalent) | None — public endpoint, no authentication required | No | Only during committed workflow build; not at browser runtime in public alpha |
| Carbon intensity data fetch | National Grid ESO public API | None | No | Only during committed workflow build; not at browser runtime in public alpha |

**Rules:**
1. In public alpha, **no** reference-data refreshes occur at browser runtime. All PRD is pre-baked as static files or committed fixtures.
2. When the catalogue module (TASK-047) is implemented, a build-time workflow fetches and commits PRD. The browser loads the committed static JSON — it never calls the upstream API directly in alpha.
3. A future `limited-live` validation command may contact the named API for spot-checking, but this runs separately from the simulator and does not transmit SHD.

### 2.3 Forbidden requests

| Request type | Reason | Enforcement |
|---|---|---|
| Upload of consumption data to any endpoint | Violates NG-001 (browser-only processing) | No upload endpoint exists; no `<form action>` targets external URLs |
| Telemetry or analytics pings | No third-party scripts in `/simulator` (NG-003) | Explicitly forbidden by §4 threat model |
| API calls containing tariff inputs, rates, or schedules | These are SHD (§1.1) | Enforced by code review and network interception tests (§7) |
| Beacon requests (`navigator.sendBeacon`) | Could exfiltrate data silently | Forbidden; blocked by CSP if added in TASK-093 |
| WebSocket connections | No streaming requirement; privacy risk | Not implemented |
| Fetch to third-party CDNs for analytics, A/B testing, or tracking | Violates NG-002 and NG-003 | Not included in build output |
| Any request containing filenames, device IDs, MPANs, MPRNs, or meter identifiers | These are SHD (§1.1) | Forbidden by classification rules |

---

## 3 — Forbidden Fields in Network Requests

The following fields must **never** appear in any HTTP request (body, query string, header, or cache key):

| Forbidden field category | Examples | Classification |
|---|---|---|
| Consumption intervals | `import_kwh`, `export_kwh`, per-interval kWh values | SHD §1.1 |
| Interval timestamps (with consumption) | `utc_start` paired with energy values | SHD §1.1 |
| Filenames and paths | `"my_meter_data.csv"`, `"/Users/j/Documents/..."` | SHD §1.1 |
| Device / meter identifiers | MPAN, MPRN, serial number, device UUID | SHD §1.1 |
| User-entered tariff data | Import rate, standing charge, export rate entered by the user | SHD §1.1 |
| Household schedules | Appliance power/duration/window declarations; EV plug-in times | SHD §1.1 |
| Derived results | Cost totals, savings figures, per-interval breakdowns, monthly aggregates | SHD §1.1 |
| Quality report details | Missing interval counts, outlier flags (when derived from user data) | SHD §1.1 |

**Enforcement strategy:**
1. Architectural: the simulator runs entirely in-browser; no upload endpoint exists.
2. Code review: any `fetch()`, `XMLHttpRequest`, or `<form>` submission is audited for SHD content.
3. Automated testing: browser network interception tests (§7) verify that no SHD fields appear in request payloads.
4. CSP headers (TASK-093): restrictive Content-Security-Policy blocks unknown endpoints.

---

## 4 — Memory Lifecycle, Deletion, Storage, and Analytics Restrictions

### 4.1 In-memory data lifecycle

```
User loads page → heap is empty of SHD
  ↓
User uploads file → SHD read into ArrayBuffer / string via File API
  ↓
SHD parsed into canonical intervals (heap)
  ↓
Web Worker processes intervals → TCS on Worker heap
  ↓
Results written to Result objects (heap, main thread or transferred from Worker)
  ↓
User sees results in dashboard (rendered from heap objects)
  ↓
User clicks "Clear my data" OR navigates away OR reloads page
  ↓
Heap objects become unreachable → garbage collected → SHD destroyed
```

**Rules:**
1. SHD enters the system only through explicit user action (file upload).
2. SHD exits the system on explicit clear, navigation away, or page reload — whichever occurs first.
3. No automatic background transfer of SHD to persistent storage.
4. Web Worker `postMessage` transfers use structured clone or `Transferable` objects; SHD is never written to disk during transfer.

### 4.2 Deletion mechanism

The "Clear my data" button (PRODUCT_SPEC.md §4, Step 11) must:

1. Null all module-level variables holding consumption datasets, tariff inputs, and results.
2. Terminate the active Web Worker (if any) to reclaim TCS.
3. Clear any `localStorage` entries that contain CD only — never SHD.
4. Reset the wizard state to step 1.
5. Display a confirmation message.
6. Return the user to the entry screen.

**Verification:** After clearing, inspecting the application state via DevTools should show no consumption intervals, tariff inputs, or derived results in any scope (global, closure, `localStorage`, `sessionStorage`, IndexedDB).

### 4.3 Storage restrictions

| Storage mechanism | SHD permitted? | CD permitted? | PRD permitted? | Notes |
|---|---|---|---|---|
| `localStorage` | **No** | Yes (UI prefs only) | N/A | NG-009: no sensitive state by default |
| `sessionStorage` | **No** | No | N/A | Even session-scoped SHD is forbidden — it survives tab restore |
| IndexedDB | **No** | No | Yes (PRD cache only) | PRD cache must be keyed on data version, not user identity |
| Cookies | **No** | No | No | No cookies set by the application |
| Service Worker cache | **No** | N/A | Yes (site assets, PRD JSON) | Standard HTTP caching for static files |
| Web Worker heap | Yes (transient) | N/A | N/A | Destroyed when Worker terminates |
| Main thread heap | Yes (transient) | Yes (transient) | N/A | Destroyed on page unload |

### 4.4 Analytics restrictions

1. **No analytics scripts in `/simulator`.** The simulator route must contain zero third-party `<script>` tags pointing to external domains (NG-003).
2. **No embedded tracking pixels.** No `<img src="https://tracker...">` or equivalent beacon in simulator HTML.
3. **No custom dimensions or events that carry SHD.** If analytics are added later (TASK-112), they must use the privacy-safe funnel instrumentation interface and never transmit household data.
4. **Server access logs.** Standard HTTP access logs on the hosting server may record IP address, user-agent, referrer, and requested path. These do not contain SHD because all processing is client-side, but operators should be aware that access patterns (e.g., time spent on `/simulator`) could indirectly reveal usage behaviour.
5. **No A/B testing framework.** No experiment or feature-flag service that profiles users across sessions.

---

## 5 — Public-Data Cache Boundary

### 5.1 What is cached

| Data | Format | Cache location | Refresh mechanism |
|---|---|---|---|
| Tariff catalogue | Committed JSON fixtures | Static files in `/public` or build output | Automated workflow (TASK-047) fetches, validates, commits |
| Carbon intensity forecast | Committed JSON fixtures | Static files in `/public` or build output | Automated workflow fetches from National Grid ESO, commits |
| Demo sample data | Committed CSV/JSON | Static files | Manually maintained; updated when new samples are created |
| Site assets (HTML, CSS, JS bundles) | Built static files | CDN / origin server | Deployed via TASK-108+ deployment scripts |

### 5.2 Cache rules

1. **PRD is committed to the repository.** The browser loads PRD from local static files — it never fetches live data during public alpha. This is the "fixture-only" policy (AGENTS.md, EXTERNAL_DATA_POLICY.md).
2. **Cache key on schema version, not user identity.** When PRD JSON files are cached by the service worker, the cache tag includes `schema_version` and a content hash — never any user identifier.
3. **Stale-while-revalidate for PRD.** A future live-fetch mode may use HTTP caching headers (`Cache-Control: max-age=3600, stale-while-revalidate=86400`) but the initial alpha ships with committed fixtures only.
4. **PRD and SHD are stored in separate module namespaces.** Even in memory, PRD modules (tariff catalogue, carbon data) do not share variables or closures with SHD processing modules.

### 5.3 Build-time fetch workflow

When the Octopus catalogue or carbon data is refreshed:

1. A scheduled workflow contacts only the explicitly approved public API named by the relevant task. The currently approved tariff and carbon APIs require no end-user credentials. If an upstream service later requires a secret, it must be supplied through the repository host's encrypted secret store, must never be committed, and requires a dedicated policy and architectural review before use.
2. The fetch occurs at build-time or CI-time — not in the browser at runtime. Only public reference data (PRD) is retrieved; no Sensitive Household Data (SHD) is included in the request.
3. Data is fetched, validated against schema expectations, and normalised.
4. The result is committed as static JSON fixtures under `fixtures/` or equivalent.
5. Automated tests continue to use committed fixtures and remain offline. Live checks follow the task's declared network policy (`fixture-only` or `limited-live`).
6. The application imports these fixtures at build time; no runtime network call to the upstream API occurs in alpha.
7. No credentials are added to source, fixtures, environment examples, or documentation.

---

## 6 — Future Connected-Data Work: Out of Scope

The following capabilities are explicitly defined as **out of scope** for the current product and privacy model. They may be considered in future releases only with a dedicated privacy review and user consent mechanism.

| Capability | Status | Rationale |
|---|---|---|
| Account system with cloud storage of scenarios | Out of scope (TASK-113) | Requires re-architecting data lifecycle; introduces server-side SHD |
| Automatic smart-meter polling via DCC or supplier API | Out of scope (NG-008) | Would require credentials, ongoing network access, and potentially SHD transmission |
| Multi-user household sharing | Out of scope | Introduces identity management and cross-device data transfer |
| Real-time tariff comparison dashboard | Out of scope in alpha | Requires live API calls; deferred to paid-ready with explicit consent |
| Cloud backup of scenario files | Out of scope in alpha | Would store SHD server-side; requires encryption, retention policy, consent flow |
| Push notifications for tariff changes | Out of scope (NG-010) | Requires subscription, device registration, and persistent user identity |
| Integration with smart-home controllers | Out of scope | Would require network connectivity from the application or a companion service |

**Gating condition:** Any future connected-data feature must pass a dedicated privacy review that covers: data minimisation, encryption at rest and in transit, retention limits, deletion guarantees, user consent granularity, and server-side access controls. This is deferred to TASK-113 (feature-entitlement architecture) and beyond.

---

## 7 — Browser Network Test Strategy

### 7.1 Test objectives

Verify that no SHD leaves the browser during normal simulator operation: file upload, parsing,
tariff configuration, simulation run, results display, and export.

### 7.2 Test types

#### 7.2.1 Network interception tests (Playwright)

| Test | What it verifies | Assertion |
|---|---|---|
| File upload isolation | No outbound requests during file reading | Zero network requests after page load until explicit user action |
| Simulation run isolation | Web Worker computation produces no network traffic | All requests during simulation are same-origin asset loads only |
| Export download isolation | CSV/JSON/HTML export generates no server uploads | The only new "request" is the browser's own download mechanism (blob URL) |
| Clear data verification | After clearing, no cached data persists | `localStorage` inspected — only CD entries remain; no SHD in IndexedDB |

**Implementation:** Playwright's `page.route()` or `page.setExtraHTTPHeaders()` combined with request logging. Every outbound request is captured and its payload inspected for SHD field patterns.

#### 7.2.2 Payload content tests

| Test | What it verifies | Assertion |
|---|---|---|
| Request body scan | No HTTP request body contains consumption fields | Regex scan of all request bodies against known SHD field names |
| Query string scan | No URL query parameters contain user data | All URLs match same-origin asset patterns only |
| Cookie scan | No cookies set with household data | Cookie jar is empty or contains only non-SHD session identifiers |

#### 7.2.3 Storage state tests

| Test | What it verifies | Assertion |
|---|---|---|
| Post-upload localStorage | File upload does not write to localStorage | `localStorage` keys unchanged after upload |
| Post-simulation storage | Simulation run does not persist results | No new entries in `localStorage`, `sessionStorage`, or IndexedDB |
| Cross-tab isolation | Data in one tab is invisible to another | Open two tabs; verify SHD in Tab A does not appear in Tab B's storage |

### 7.3 Test fixtures

All network tests use committed fixtures:
- Demo consumption data (known intervals, no real meter IDs).
- Flat tariff with known rates.
- No live API endpoints.

Tests must run without internet access (offline mode) to confirm the simulator functions entirely in-browser.

### 7.4 Test automation scope

These tests are defined here but implemented in TASK-090 through TASK-094 (Privacy and security phase). TASK-011 (Vitest and Playwright configuration) provides the test infrastructure; TASK-094 runs the final privacy audit including network interception.

---

## 8 — Threat Model

### 8.1 Threat categories

| Threat | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Accidental telemetry embedding** | Medium | High — SHD exfiltration | Code review of all `<script>` tags; NG-003 grep gate on built HTML; TASK-094 automated check |
| **Third-party dependency leaking data** | Low-Medium | High — SHD in dependency network requests | Audit all installed packages for known telemetry (e.g., `analytics`, `tracker`); pin versions; prefer minimal dependencies |
| **Service Worker caching SHD by mistake** | Medium | Medium — persistent SHD on disk | Service Worker cache namespacing excludes SHD modules; explicit cache key review |
| **Console.log of sensitive values in production** | Medium | Medium — SHD visible to user or DevTools | Build-time log stripping; lint rule forbidding `console.log` in production bundles (TASK-013 CI) |
| **Export file containing unintended fields** | Low | Medium — data leakage via download | Export schema defined by DATA_SCHEMA.md §8; exports produce only declared fields; test validates export shape |
| **Browser extension reading simulator state** | Medium | Medium — SHD accessible to malicious extensions | Mitigation: browser-only architecture means extensions CAN read page content; user education recommended but cannot be enforced at application level |
| **Server access log correlation** | Low | Low — indirect inference from timing | Standard limitation of any web service; no direct SHD in logs |
| **DevTools / source map exposing internals** | Low | Low — implementation details visible | Production build strips or obfuscates source maps (TASK-106); no SHD in source code anyway |

### 8.2 Telemetry-specific defences

1. **Script audit:** Built HTML under `/simulator` is scanned for `<script src="*">` tags. Only same-origin scripts are permitted. This is enforced by a CI check (NG-003 criterion).
2. **No tracking pixels:** The built HTML is scanned for `<img>` tags with external `src` attributes that could act as beacon requests.
3. **Dependency audit:** All JavaScript dependencies are checked against known telemetry libraries. A blocklist of disallowed packages is maintained (e.g., Google Analytics, Mixpanel, Hotjar, Fathom — unless explicitly approved in a future task).
4. **CSP headers:** TASK-093 implements Content-Security-Policy that restricts `script-src` and `connect-src` to same-origin only, preventing injection of external scripts even if HTML were compromised.

### 8.3 Logging-specific defences

1. **No server-side logging of simulator activity.** Because the site is fully static, there is no application server to log requests. Only infrastructure-level access logs exist (IP, path, user-agent).
2. **Production build strips debug output.** `console.log`, `console.debug`, and `console.warn` calls are removed or silenced in the production bundle. Only `console.error` for unhandled exceptions is retained.
3. **No error reporting services.** No Sentry, Rollbar, Bugsnag, or equivalent error-tracker SDK. Errors remain client-side only.

### 8.4 Export-specific defences

1. **Exports contain only declared fields.** The export schema (DATA_SCHEMA.md §8) is the single source of truth for what appears in CSV, JSON, and HTML exports.
2. **No metadata leakage.** Exported files do not embed filenames, user identifiers, timestamps of creation, or device information.
3. **Local download only.** Exports use `URL.createObjectURL()` with a `Blob` — the file is generated entirely in memory and offered as a download. No upload to server occurs.
4. **Export content review.** Each export format includes only fields defined in the canonical result model. Unexpected fields are caught by schema validation (TASK-089 audit).

### 8.5 Summary threat matrix

| Asset | Threat | Mitigation status | Task responsible |
|---|---|---|---|
| SHD in memory | Accidental persistence | Defined in §4; to be enforced by code | TASK-071+ (wizard state), TASK-092 (persistence audit) |
| SHD in network requests | Upload or telemetry | Forbidden by §2, §3; enforced by tests | TASK-090, TASK-094 (network interception) |
| SHD in exports | Unintended fields | Schema-bound; validated at export | TASK-086–TASK-089 (export audit) |
| Site HTML | Third-party script injection | Grep gate + CSP | TASK-013 (CI), TASK-093 (headers) |
| PRD cache | Contamination with SHD | Separate namespaces; §5 rules | TASK-042–TASK-046 (catalogue workflow) |

---

## Appendix A — Cross-Reference to Governance Documents

| Privacy requirement | Defined in | Enforced by |
|---|---|---|
| Browser-only smart-meter processing | AGENTS.md §Data and privacy; NG-001 | Architecture; TASK-090–TASK-094 tests |
| No third-party scripts in `/simulator` | PRODUCT_SPEC.md §3.3 (NG-003) | CI grep check (TASK-013); CSP (TASK-093) |
| No upload endpoint or database | AGENTS.md §Architecture; ADR-002/ADR-004 | Static build output; no server runtime |
| No localStorage of sensitive state | PRODUCT_SPEC.md §3.3 (NG-009) | Code review; TASK-092 storage audit |
| UTC internally, Europe/London locally | AGENTS.md; ADR-003; DATA_SCHEMA.md §2.1 | Implementation convention |
| No silent interpolation | AGENTS.md; METHODOLOGY.md §7.1 | Calculation code; test fixtures |
| Null vs zero distinction | DATA_SCHEMA.md §2.3 | Type definitions; validation logic |
| Committed fixtures for external data | AGENTS.md; EXTERNAL_DATA_POLICY.md | TASK-047 workflow; TASK-066–TASK-070 |
| Tests run without internet | AGENTS.md; QUALITY_GATES.md | Offline test runner (TASK-011) |
| One task = one coherent change | AGENTS.md §Git; REPOSITORY_CONVENTIONS.md | Git discipline per AI_WORKFLOW.md |

---

## Appendix B — Revision History

| Version | Date | Task | Change |
|---|---|---|---|
| 1.0.0 | 2026-07-21 | TASK-007 | Initial privacy design: data classification (SHD/CD/PRD/TCS), permitted outbound requests, forbidden fields, memory lifecycle, storage restrictions, analytics policy, public-data cache boundary, connected-data out-of-scope statement, browser network test strategy, threat model for telemetry/logs/scripts/exports |
| 1.0.1 | 2026-07-21 | TASK-007 corrective audit | Reconciled §2.2 Octopus row (removed "API key" wording — public endpoint requires no auth) and replaced §5.3 build-time fetch workflow with credential-safe policy matching EXTERNAL_DATA_POLICY.md: no committed credentials, no end-user keys, secrets must use encrypted secret store with dedicated review if ever needed |
