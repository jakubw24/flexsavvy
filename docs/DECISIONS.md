# Architectural Decision Records

Decisions for FlexSavvy. Each record captures the context, decision, and consequences.

## Template

```markdown
### ADR-XXX: <Title>

**Status:** Accepted | Superseded | Deprecated
**Date:** YYYY-MM-DD
**Context:** <What is the issue we are seeing that is motivating us to make this decision?>
**Decision:** <What is the change that we are proposing to make as a result of the issue?>
**Consequences:** <What resulting context do we expect once this change is made?>
```

---

## Decisions

### ADR-001: Fully static deployment — no server-side runtime

**Status:** Accepted
**Date:** 2026-07-20
**Context:** FlexSavvy must be deployable as a fully static site. No Node.js production server, API routes, upload endpoints, or database are permitted.
**Decision:** Production output consists entirely of static files (HTML, CSS, JS). All computation runs client-side in the browser, with heavy calculations offloaded to a Web Worker.
**Consequences:** Lower hosting cost and simpler deployment. No server-side data processing means smart-meter data never leaves the user's browser.

### ADR-002: Browser-only smart-meter processing

**Status:** Accepted
**Date:** 2026-07-20
**Context:** Smart-meter consumption data is personally identifiable and sensitive. Users must retain full control over their data.
**Decision:** All smart-meter parsing, adaptation, validation, and billing calculations happen in-browser. No upload endpoint exists. No external service receives raw interval data.
**Consequences:** Strong privacy guarantee. Uploads of CSV/JSON files are read via browser File API only. Files are never persisted by default.

### ADR-003: UTC internally, Europe/London for presentation

**Status:** Accepted
**Date:** 2026-07-20
**Context:** UK half-hour intervals require precise time-zone handling, especially across DST boundaries where a "day" may not contain exactly 48 intervals.
**Decision:** All internal timestamps use UTC. Europe/London is applied only when displaying schedules to the user or resolving tariff periods that are defined in local time. Never assume a local day contains 48 half-hour intervals.
**Consequences:** Correct interval counting across DST transitions. Clear separation between storage (UTC) and display (Europe/London).

### ADR-004: No accounts, database, or upload API in the initial product

**Status:** Accepted
**Date:** 2026-07-20
**Context:** The minimum viable product must avoid account systems, databases, and any infrastructure that stores user data server-side.
**Decision:** The initial release has no accounts, no database, no file upload endpoint, and no server-persisted state. All simulator sessions are ephemeral and browser-local.
**Consequences:** Reduced scope, faster delivery, strong privacy by default. Future feature-entitlement work (TASK-113) may add optional account capability without breaking the core architecture.
