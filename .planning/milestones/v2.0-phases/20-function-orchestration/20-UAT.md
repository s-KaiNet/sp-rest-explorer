---
status: complete
phase: 20-function-orchestration
source: 20-01-SUMMARY.md, 20-02-SUMMARY.md
started: 2026-02-23T22:43:00Z
updated: 2026-02-23T22:48:00Z
---

## Current Test

[testing complete]

## Tests

### 1. All backend tests pass
expected: Running `npx vitest run` in backend/ produces 20 passing tests across 5 test files with zero failures.
result: pass

### 2. TypeScript compiles with zero errors
expected: Running `npx tsc --noEmit` in backend/ completes with no errors — all type checking passes.
result: pass

### 3. Blob upload module produces exactly 6 blob definitions
expected: `buildBlobList()` returns 6 blobs: 3 latest (metadata.latest.json, .xml, .zip.json) and 3 monthly snapshots (e.g. 2026y_m2_metadata.json/xml/zip.json) with correct Content-Type headers.
result: pass

### 4. Upload uses Buffer.byteLength not string.length
expected: In blob-uploader.ts, the upload call uses `Buffer.byteLength(blob.content, 'utf-8')` for content length — critical for multi-byte lz-string output.
result: pass

### 5. Missing AzureWebJobsStorage fails fast with clear message
expected: If AzureWebJobsStorage env var is unset, `uploadBlobs()` throws immediately with "Missing AzureWebJobsStorage connection string environment variable" before attempting any Azure SDK calls.
result: pass

### 6. Shared handler orchestrates auth -> pipeline -> upload
expected: `handleMetadataGeneration()` in metadata-handler.ts calls getToken(), runPipeline(), uploadBlobs() in sequence, logging per-stage durations like `[stage:auth] completed in Xms`.
result: pass

### 7. Timer trigger registered with configurable CRON and retry policy
expected: generateMetadata.ts registers a timer trigger using `%TIMER_SCHEDULE%` app setting (not hardcoded CRON), with fixedDelay retry: maxRetryCount=2, delayInterval=5 minutes.
result: pass

### 8. HTTP trigger returns JSON success/error responses
expected: generateMetadataHttp.ts returns 200 with HandlerResult JSON on success, and 500 with `{status, stage, error, stageTimings}` JSON on failure. Uses POST method with function-level auth.
result: pass

### 9. Error enrichment attaches diagnostics to thrown error
expected: When handler fails, it attaches `stageTimings` and `failedStage` properties to the error object before re-throwing, so HTTP trigger can extract structured error data for JSON response.
result: pass

### 10. Stage timing tracks each pipeline stage independently
expected: Handler builds `Record<string, { duration }>` with entries for auth, pipeline, and upload. On failure, completed stages still have their durations logged.
result: pass

## Summary

total: 10
passed: 10
issues: 0
pending: 0
skipped: 0

## Gaps

[none]
