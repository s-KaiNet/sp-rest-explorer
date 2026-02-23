# Phase 19: Data Pipeline - Context

**Gathered:** 2026-02-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Fetch SharePoint `_api/$metadata` XML with retry/timeout, parse to JSON (identical structure to legacy MetadataParser), compress with lz-string. This phase builds the pipeline logic only — no triggers, no blob upload (those are Phase 20).

Requirements: FTCH-01, FTCH-02, FTCH-03, FTCH-04, PROC-01, PROC-02, PROC-03, PROC-04

</domain>

<decisions>
## Implementation Decisions

### Legacy parser fidelity
- Reproduce ALL legacy MetadataParser behaviors identically — zero deviation from current output
- This includes: alias map, Internal function filtering, underscore-to-dot name replacement, incremental integer function IDs, synthetic Collection() entity types
- Drop legacy dead code (commented-out TODO for sorting, commented-out underscore `continue`) — clean rewrite, no carried-over comments
- Use xml2js for XML parsing — same library as legacy, proven with SharePoint's exact XML format
- Exact same data shape: `entities: {[fullName]: EntityType}`, `functions: {[id]: FunctionImport}` — frontend depends on this
- Port TypeScript interfaces from legacy but tighten types (replace `any` with specific types, add `readonly` where appropriate) — same shape, stricter contracts
- All JSON output uses compact format (no indentation) per PROC-03 — applies to all blobs, not just compressed
- Keep Maps for intermediate processing, convert to plain objects at the end (same pattern as legacy)
- Native Promises throughout — no Bluebird dependency

### Fetch retry & throttling
- Use axios for HTTP calls — already installed from Phase 18, proven with SharePoint
- Exponential backoff: base 2 seconds, doubling each retry (2s, 4s, 8s). Total wait ~14s before final failure
- 429 (throttled) responses count toward the 3-retry limit — if SharePoint throttles hard, fail after 3 total attempts
- When 429 has Retry-After header, respect that wait time before retrying
- 60-second hard timeout per attempt via AbortController — cancels the request, counts as failed attempt, triggers retry
- Retry triggers: network errors, 5xx server errors, 429 throttling, timeouts

### Output validation
- Test against real metadata: download XML from `https://sprestapiexplorer.blob.core.windows.net/api-files/metadata.latest.xml`
- Golden reference JSON: download from `https://sprestapiexplorer.blob.core.windows.net/api-files/metadata.latest.json`
- Acceptance criteria: byte-identical JSON — `JSON.stringify(newOutput) === JSON.stringify(legacyOutput)` with zero tolerance
- No runtime sanity checks in production — tests catch regressions, parser either works or throws
- lz-string compression must pass round-trip test: compress → decompress → compare to original JSON

### Module organization
- All module organization decisions (file layout, interface location, pipeline vs separate modules, entry point shape) are at Claude's discretion
- Phase 19 does NOT include any triggers (HTTP or timer) — only pipeline logic
- Phase 20 handles all triggers and blob upload

### Claude's Discretion
- File layout within backend/src/ (separate modules vs pipeline module)
- Interface file organization (single file vs directory)
- Pipeline entry point design (single function vs step-by-step API)
- Parser constructor design (raw XML input vs pre-parsed object)
- Internal data structure choices beyond Maps
- Test framework and test file organization
- Error types and error message formats

</decisions>

<specifics>
## Specific Ideas

- Real SharePoint metadata XML available at: `https://sprestapiexplorer.blob.core.windows.net/api-files/metadata.latest.xml`
- Legacy JSON golden reference at: `https://sprestapiexplorer.blob.core.windows.net/api-files/metadata.latest.json`
- The legacy parser is at `az-funcs/src/metadataParser.ts` — use as implementation reference
- Legacy interfaces are at `az-funcs/src/interfaces/` — port the shape, tighten the types
- Phase 18 established `backend/` directory with `src/auth.ts` providing `getToken()` — Phase 19 builds on this foundation
- The legacy `GenerateMetadata/index.ts` shows the full pipeline flow: read → parse → compress → upload (Phase 19 handles read → parse → compress only)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 19-data-pipeline*
*Context gathered: 2026-02-23*
