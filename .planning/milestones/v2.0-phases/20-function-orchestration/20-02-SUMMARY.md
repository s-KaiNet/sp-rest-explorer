---
phase: 20-function-orchestration
plan: 02
subsystem: orchestration
tags: [azure-functions, timer-trigger, http-trigger, structured-logging, retry-policy]

# Dependency graph
requires:
  - phase: 20-function-orchestration
    provides: uploadBlobs() and buildBlobList() from blob-uploader module (plan 01)
  - phase: 19-data-pipeline
    provides: runPipeline() returning PipelineResult with xml, json, compressedJson
  - phase: 18-backend-skeleton
    provides: getToken() for MSAL certificate-based auth
provides:
  - handleMetadataGeneration() shared handler with stage timing and structured logging
  - HandlerResult interface for JSON response typing
  - Timer trigger (generateMetadata) with configurable CRON and retry policy
  - HTTP trigger (generateMetadataHttp) with function key auth and JSON error response
affects: [21-deployment]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Shared handler pattern: both triggers delegate to single handler function", "Stage timing: Record<string, { duration }> tracking per pipeline stage", "Error enrichment: attach stageTimings/failedStage to error object for HTTP response extraction"]

key-files:
  created:
    - backend/src/handlers/metadata-handler.ts
    - backend/src/functions/generateMetadata.ts
    - backend/src/functions/generateMetadataHttp.ts
    - backend/src/handlers/__tests__/metadata-handler.test.ts
  modified:
    - backend/local.settings.json

key-decisions:
  - "Shared handler pattern: both timer and HTTP triggers call handleMetadataGeneration() — single source of orchestration logic"
  - "Error re-throw with enrichment: handler attaches stageTimings and failedStage to error before re-throwing, HTTP trigger extracts them for JSON error response"
  - "local.settings.json is gitignored — TIMER_SCHEDULE and AzureWebJobsStorage added on disk only, not committed"

patterns-established:
  - "Handler pattern: shared function in handlers/ directory, triggers in functions/ directory are thin wrappers"
  - "Stage timing pattern: Record<string, { duration }> built incrementally, used for both logging and error diagnostics"
  - "Error enrichment: attach structured data to error objects for downstream consumers"

requirements-completed: [OPS-01, OPS-02, OPS-03, OPS-04, OPS-05, OPS-06, OPS-07]

# Metrics
duration: 3min
completed: 2026-02-23
---

# Phase 20 Plan 02: Handler + Triggers Summary

**Shared orchestration handler with auth->pipeline->upload stage timing, timer trigger on configurable CRON with 2-retry policy, and HTTP trigger returning JSON success/error responses**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-23T21:32:23Z
- **Completed:** 2026-02-23T21:35:06Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments
- Created shared `handleMetadataGeneration()` handler orchestrating auth -> pipeline -> upload with per-stage duration tracking and structured logging
- Timer trigger (`generateMetadata`) fires on configurable `%TIMER_SCHEDULE%` app setting with 2-retry fixed-delay policy (5-min interval)
- HTTP trigger (`generateMetadataHttp`) returns 200 with HandlerResult JSON on success, 500 with stage/error details on failure
- 5 unit tests covering happy path, structured logs, all-or-nothing failure, missing env var, retry context logging — all 20 backend tests pass

## Task Commits

Each task was committed atomically:

1. **Task 1: Create shared handler with structured logging and stage timing** - `d3a0e4e` (feat)
2. **Task 2: Create timer trigger, HTTP trigger, and update local settings** - `c3cd57f` (feat)
3. **Task 3: Unit test handler orchestration logic** - `82cfc3a` (test)

## Files Created/Modified
- `backend/src/handlers/metadata-handler.ts` - Shared handler orchestrating auth->pipeline->upload with stage timing
- `backend/src/functions/generateMetadata.ts` - Timer trigger with configurable CRON schedule and retry policy
- `backend/src/functions/generateMetadataHttp.ts` - HTTP trigger with function key auth and JSON response
- `backend/src/handlers/__tests__/metadata-handler.test.ts` - 5 unit tests for handler orchestration logic
- `backend/local.settings.json` - Added TIMER_SCHEDULE and AzureWebJobsStorage values (gitignored)

## Decisions Made
- Shared handler pattern: both timer and HTTP triggers call `handleMetadataGeneration()` — single source of orchestration logic avoids duplication
- Error re-throw with enrichment: handler attaches `stageTimings` and `failedStage` to error before re-throwing so HTTP trigger can extract structured error data for JSON response, while timer trigger lets it propagate for retry
- `local.settings.json` is gitignored by default (Azure Functions convention) — TIMER_SCHEDULE and AzureWebJobsStorage added on disk only

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 20 (Function Orchestration) is now complete — all pipeline stages wired together
- Timer trigger ready for deployment with configurable schedule
- HTTP trigger ready for on-demand manual execution
- Ready for Phase 21 (Deployment) — deploying the Azure Functions app
- All 20 backend tests pass, TypeScript compiles with zero errors

## Self-Check: PASSED

- All 4 key files exist on disk
- All 3 commit hashes verified in git history (d3a0e4e, c3cd57f, 82cfc3a)

---
*Phase: 20-function-orchestration*
*Completed: 2026-02-23*
