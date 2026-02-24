# Phase 20: Function Orchestration - Context

**Gathered:** 2026-02-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Wire Phase 19's pipeline (auth → fetch → parse → compress) into a complete daily timer Azure Function that uploads 6 blobs to Azure Blob Storage. Includes HTTP trigger for manual execution, structured logging with stage durations, and operational controls (retry policy, configurable schedule). Deployment is Phase 21.

Requirements: BLOB-01, BLOB-02, BLOB-03, BLOB-04, BLOB-05, BLOB-06, BLOB-07, BLOB-08, OPS-01, OPS-02, OPS-03, OPS-04, OPS-05, OPS-06, OPS-07

</domain>

<decisions>
## Implementation Decisions

### Blob upload strategy
- Upload 6 blobs sequentially (one at a time), not in parallel
- Container `api-files` created via idempotent `createIfNotExists` at the start of every invocation — self-healing, no separate setup
- Container access level: public blob (per BLOB-07)
- Monthly snapshot naming uses invocation date (when function fires), not metadata content date — a run on Feb 23 creates `2026y_m2_metadata.*`
- Monthly blobs are always overwritten on each run — no existence checks, latest data for the month always wins
- Content-Type headers: `application/json` for .json and .zip.json, `application/xml` for .xml (per BLOB-08)

### Structured logging design
- Use Azure Functions' built-in `context.log` / `context.error` with key-value format: `[stage:auth] completed in 1234ms`
- Log every pipeline stage (auth, fetch, parse, compress, upload) with its duration, plus a final summary line: `Pipeline complete: 6 blobs uploaded in 12345ms`
- Upload stage logs one line per blob: `[upload] metadata.latest.json uploaded (1/6)`
- On failure: log which stage failed, the error message, AND durations for all stages that completed successfully before the failure
- Duration tracking via `Date.now()` or `performance.now()` per stage

### Trigger configuration
- Two separate Azure Functions: one timer trigger, one HTTP trigger — both call the same shared handler/orchestrator
- Timer default: `0 0 1 * * *` (1 AM UTC daily), matches OPS-01
- Schedule configurable via app setting named `TIMER_SCHEDULE` (per OPS-02)
- HTTP trigger uses `authLevel: 'function'` (function key auth, per OPS-05)
- HTTP trigger returns summary JSON on success: `{"status":"ok","duration":12345,"blobsUploaded":6,"stages":{"auth":{"duration":1234},...}}`
- Date computed fresh inside the handler on every invocation — no module-scope Date (per OPS-03)

### All-or-nothing error behavior
- If pipeline (fetch) fails after Phase 19's retries, function exits with error log — no blobs written (per OPS-07)
- If a blob upload fails mid-way (e.g., blob 4/6), stop uploading remaining blobs but do NOT roll back already-uploaded ones. Partial writes get corrected on next successful run.
- Trust Phase 19's fetch retry logic (3 retries with exponential backoff) — no additional retry wrapper around the pipeline call in Phase 20
- Azure Functions built-in retry policy: `maxRetryCount: 2`, fixed delay of 5 minutes (per OPS-06) — retries the entire function invocation on whole-function failures
- HTTP trigger on failure: return 500 with JSON error details: `{"status":"error","stage":"fetch","error":"message","stageTimings":{...}}`

### Claude's Discretion
- Shared handler module design (how timer and HTTP functions share logic)
- Blob upload module organization (single file vs helpers)
- Azure Storage SDK usage patterns (@azure/storage-blob client setup)
- Test strategy for the orchestration layer
- Error type design for pipeline vs upload failures
- Exact key-value log message formatting

</decisions>

<specifics>
## Specific Ideas

- Phase 19's `runPipeline(token, spUrl)` returns `PipelineResult` with `xml`, `json`, and `compressedJson` fields — Phase 20 uploads these as the 3 blob formats
- Existing function pattern in `backend/src/functions/validateAuth.ts` shows Azure Functions v4 registration style — follow the same pattern
- Pipeline barrel export at `backend/src/pipeline/index.ts` provides all stage functions and types for import
- `backend/src/auth.ts` provides `getToken()` for SharePoint authentication
- The legacy function at `az-funcs/src/GenerateMetadata/index.ts` shows the original upload flow — can be referenced but Phase 20 is a clean rewrite

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 20-function-orchestration*
*Context gathered: 2026-02-23*
