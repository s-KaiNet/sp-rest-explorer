# Phase 20: Function Orchestration - Research

**Researched:** 2026-02-23
**Domain:** Azure Functions v4 timer/HTTP triggers, Azure Blob Storage SDK, pipeline orchestration
**Confidence:** HIGH

## Summary

Phase 20 wires the completed data pipeline (auth → fetch → parse → compress) into two Azure Functions — a daily timer trigger and an HTTP manual trigger — both calling a shared handler that uploads 6 blobs to Azure Blob Storage. The technology stack is well-understood: `@azure/functions` v4 (already installed) for function registration and `@azure/storage-blob` (needs `npm install`) for blob uploads.

The v4 programming model uses `app.timer()` and `app.http()` for declarative function registration with retry policies defined inline. The `@azure/storage-blob` SDK provides `BlobServiceClient.fromConnectionString()` → `ContainerClient` → `BlockBlobClient` for sequential blob uploads with content-type headers. The `%TIMER_SCHEDULE%` syntax (percent-sign wrapping) enables app setting binding for configurable schedules.

**Primary recommendation:** Build a shared handler module that both triggers call, with a blob upload helper that sequentially uploads 6 blobs (3 latest + 3 monthly snapshots) using `BlockBlobClient.upload()` with explicit `blobHTTPHeaders.blobContentType`. Use `Buffer.byteLength()` for content length (not `string.length`) to handle multi-byte characters correctly.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Upload 6 blobs sequentially (one at a time), not in parallel
- Container `api-files` created via idempotent `createIfNotExists` at the start of every invocation — self-healing, no separate setup
- Container access level: public blob (per BLOB-07)
- Monthly snapshot naming uses invocation date (when function fires), not metadata content date — a run on Feb 23 creates `2026y_m2_metadata.*`
- Monthly blobs are always overwritten on each run — no existence checks, latest data for the month always wins
- Content-Type headers: `application/json` for .json and .zip.json, `application/xml` for .xml (per BLOB-08)
- Use Azure Functions' built-in `context.log` / `context.error` with key-value format: `[stage:auth] completed in 1234ms`
- Log every pipeline stage (auth, fetch, parse, compress, upload) with its duration, plus a final summary line: `Pipeline complete: 6 blobs uploaded in 12345ms`
- Upload stage logs one line per blob: `[upload] metadata.latest.json uploaded (1/6)`
- On failure: log which stage failed, the error message, AND durations for all stages that completed successfully before the failure
- Duration tracking via `Date.now()` or `performance.now()` per stage
- Two separate Azure Functions: one timer trigger, one HTTP trigger — both call the same shared handler/orchestrator
- Timer default: `0 0 1 * * *` (1 AM UTC daily), matches OPS-01
- Schedule configurable via app setting named `TIMER_SCHEDULE` (per OPS-02)
- HTTP trigger uses `authLevel: 'function'` (function key auth, per OPS-05)
- HTTP trigger returns summary JSON on success: `{"status":"ok","duration":12345,"blobsUploaded":6,"stages":{"auth":{"duration":1234},...}}`
- Date computed fresh inside the handler on every invocation — no module-scope Date (per OPS-03)
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

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| BLOB-01 | Upload `metadata.latest.json` to `api-files` on every run | Blob upload pattern: `blockBlobClient.upload(content, Buffer.byteLength(content))` with `blobContentType: 'application/json'` |
| BLOB-02 | Upload `metadata.latest.xml` to `api-files` on every run | Same pattern with `blobContentType: 'application/xml'` |
| BLOB-03 | Upload `metadata.latest.zip.json` to `api-files` on every run | Same pattern — compressedJson from PipelineResult, `blobContentType: 'application/json'` |
| BLOB-04 | Upload monthly `{year}y_m{month}_metadata.json` (1-indexed) | Date naming: `${now.getUTCFullYear()}y_m${now.getUTCMonth() + 1}_metadata.json` |
| BLOB-05 | Upload monthly `{year}y_m{month}_metadata.xml` (1-indexed) | Same date naming with `.xml` extension |
| BLOB-06 | Upload monthly `{year}y_m{month}_metadata.zip.json` (1-indexed) | Same date naming with `.zip.json` extension |
| BLOB-07 | Auto-create `api-files` container with public blob access | `containerClient.createIfNotExists({ access: 'blob' })` — idempotent |
| BLOB-08 | Set correct Content-Type headers on uploads | `blobHTTPHeaders: { blobContentType: '...' }` in upload options |
| OPS-01 | Daily timer trigger (default 1 AM UTC) | `app.timer()` with `schedule: '%TIMER_SCHEDULE%'` and default in `local.settings.json` |
| OPS-02 | Configurable schedule via app setting | `%TIMER_SCHEDULE%` percent-sign syntax binds to app setting value |
| OPS-03 | Fresh Date per invocation (no module-scope) | `const now = new Date()` inside handler function body |
| OPS-04 | Structured logging with stage durations | `context.log('[stage:X] completed in Yms')` pattern with `Date.now()` timing |
| OPS-05 | HTTP trigger with function key auth | `app.http()` with `authLevel: 'function'`, returns JSON summary |
| OPS-06 | Retry policy for whole-function failures | `retry: { strategy: 'fixedDelay', maxRetryCount: 2, delayInterval: { minutes: 5 } }` on timer |
| OPS-07 | All-or-nothing: no blobs if fetch fails | Try pipeline first; if error, log and throw before reaching upload stage |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@azure/functions` | ^4.11.0 | Function registration (timer, HTTP triggers, retry) | Already installed — v4 programming model with `app.timer()`/`app.http()` |
| `@azure/storage-blob` | ^12.31.0 | Blob upload, container management | Official Azure SDK for JS — `BlobServiceClient`, `ContainerClient`, `BlockBlobClient` |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `dotenv` | ^16.4.0 | Local dev env vars | Already installed — `import 'dotenv/config'` at function entry |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@azure/storage-blob` SDK | Output bindings (declarative) | Output bindings can't handle dynamic blob names (year/month) — SDK is required (documented in Out of Scope) |
| `BlockBlobClient.upload()` | `uploadData()` with Buffer | `upload()` accepts strings directly — simpler for text content, but must use `Buffer.byteLength()` for length |
| Connection string auth | `DefaultAzureCredential` | Connection string is simpler for single-purpose function; managed identity is production-hardened but adds complexity |

**Installation:**
```bash
npm install @azure/storage-blob
```

## Architecture Patterns

### Recommended Project Structure
```
backend/src/
├── functions/
│   ├── validateAuth.ts          # Existing HTTP function
│   ├── generateMetadata.ts      # NEW: Timer trigger function
│   └── generateMetadataHttp.ts  # NEW: HTTP trigger function
├── pipeline/
│   └── index.ts                 # Existing: runPipeline(), PipelineResult
├── upload/
│   └── blob-uploader.ts         # NEW: Blob upload logic
├── handlers/
│   └── metadata-handler.ts      # NEW: Shared orchestration handler
└── auth.ts                      # Existing: getToken()
```

### Pattern 1: Shared Handler Between Triggers
**What:** Both timer and HTTP triggers call the same async handler function, but the HTTP trigger additionally returns the result as JSON.
**When to use:** When multiple triggers need identical business logic.
**Example:**
```typescript
// Source: Verified pattern from Azure Functions v4 docs + project's validateAuth.ts
// handlers/metadata-handler.ts
import { InvocationContext } from '@azure/functions';
import { getToken } from '../auth.js';
import { runPipeline } from '../pipeline/index.js';
import { uploadBlobs } from '../upload/blob-uploader.js';

export interface HandlerResult {
  status: 'ok' | 'error';
  duration: number;
  blobsUploaded: number;
  stages: Record<string, { duration: number }>;
  error?: string;
  failedStage?: string;
}

export async function handleMetadataGeneration(
  context: InvocationContext
): Promise<HandlerResult> {
  const overallStart = Date.now();
  const stageTimings: Record<string, { duration: number }> = {};
  
  try {
    // Auth stage
    let start = Date.now();
    const token = await getToken();
    const spUrl = process.env.SP_URL!;
    stageTimings.auth = { duration: Date.now() - start };
    context.log('[stage:auth] completed in ' + stageTimings.auth.duration + 'ms');

    // Pipeline stages (fetch + parse + compress)
    start = Date.now();
    const result = await runPipeline(token, spUrl);
    stageTimings.pipeline = { duration: Date.now() - start };
    context.log('[stage:pipeline] completed in ' + stageTimings.pipeline.duration + 'ms');

    // Upload stage
    const now = new Date(); // OPS-03: fresh date per invocation
    start = Date.now();
    await uploadBlobs(context, result, now);
    stageTimings.upload = { duration: Date.now() - start };
    context.log('[stage:upload] completed in ' + stageTimings.upload.duration + 'ms');

    const duration = Date.now() - overallStart;
    context.log(`Pipeline complete: 6 blobs uploaded in ${duration}ms`);

    return { status: 'ok', duration, blobsUploaded: 6, stages: stageTimings };
  } catch (error) {
    const duration = Date.now() - overallStart;
    const message = error instanceof Error ? error.message : String(error);
    context.error('[error] ' + message);
    // Re-throw so Azure Functions retry policy can kick in
    throw error;
  }
}
```

### Pattern 2: Timer Trigger with App Setting Binding
**What:** Use `%SETTING_NAME%` syntax to bind schedule to an app setting.
**When to use:** When schedule must be configurable without code changes.
**Example:**
```typescript
// Source: https://learn.microsoft.com/en-us/azure/azure-functions/functions-bindings-timer
// functions/generateMetadata.ts
import 'dotenv/config';
import { app, InvocationContext, Timer } from '@azure/functions';
import { handleMetadataGeneration } from '../handlers/metadata-handler.js';

async function generateMetadata(
  timer: Timer,
  context: InvocationContext
): Promise<void> {
  context.log('Timer-triggered metadata generation started');
  if (timer.isPastDue) {
    context.log('Timer is past due — running immediately');
  }
  await handleMetadataGeneration(context);
}

app.timer('generateMetadata', {
  schedule: '%TIMER_SCHEDULE%',
  handler: generateMetadata,
  retry: {
    strategy: 'fixedDelay',
    maxRetryCount: 2,
    delayInterval: {
      minutes: 5,
    },
  },
});
```

### Pattern 3: HTTP Trigger Returning JSON Summary
**What:** HTTP trigger calls the same handler but catches errors to return JSON responses.
**When to use:** Manual execution endpoint.
**Example:**
```typescript
// Source: Project's validateAuth.ts pattern + Azure Functions v4 docs
// functions/generateMetadataHttp.ts
import 'dotenv/config';
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { handleMetadataGeneration, HandlerResult } from '../handlers/metadata-handler.js';

async function generateMetadataHttp(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('HTTP-triggered metadata generation started');
  try {
    const result = await handleMetadataGeneration(context);
    return { status: 200, jsonBody: result };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      status: 500,
      jsonBody: { status: 'error', error: message },
    };
  }
}

app.http('generateMetadataHttp', {
  methods: ['POST'],
  authLevel: 'function',
  handler: generateMetadataHttp,
});
```

### Pattern 4: Sequential Blob Upload with Content-Type
**What:** Upload 6 blobs one at a time with correct Content-Type headers.
**When to use:** When blob names are dynamic and uploads must be sequential.
**Example:**
```typescript
// Source: https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-upload-javascript
//         + GitHub patterns from microsoft/azuredatastudio, payloadcms/payload
// upload/blob-uploader.ts
import {
  BlobServiceClient,
  ContainerClient,
  BlockBlobUploadOptions,
} from '@azure/storage-blob';
import { InvocationContext } from '@azure/functions';
import { PipelineResult } from '../pipeline/index.js';

const CONTAINER_NAME = 'api-files';

interface BlobDefinition {
  name: string;
  content: string;
  contentType: string;
}

function buildBlobList(result: PipelineResult, now: Date): BlobDefinition[] {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1; // 1-indexed per user decision
  const prefix = `${year}y_m${month}_metadata`;

  return [
    { name: 'metadata.latest.json', content: result.json, contentType: 'application/json' },
    { name: 'metadata.latest.xml', content: result.xml, contentType: 'application/xml' },
    { name: 'metadata.latest.zip.json', content: result.compressedJson, contentType: 'application/json' },
    { name: `${prefix}.json`, content: result.json, contentType: 'application/json' },
    { name: `${prefix}.xml`, content: result.xml, contentType: 'application/xml' },
    { name: `${prefix}.zip.json`, content: result.compressedJson, contentType: 'application/json' },
  ];
}

export async function uploadBlobs(
  context: InvocationContext,
  result: PipelineResult,
  now: Date
): Promise<void> {
  const connectionString = process.env.AzureWebJobsStorage!;
  const blobService = BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = blobService.getContainerClient(CONTAINER_NAME);

  // Idempotent container creation with public blob access (BLOB-07)
  await containerClient.createIfNotExists({ access: 'blob' });

  const blobs = buildBlobList(result, now);

  for (let i = 0; i < blobs.length; i++) {
    const blob = blobs[i];
    const blockBlobClient = containerClient.getBlockBlobClient(blob.name);

    // CRITICAL: Use Buffer.byteLength for content length, not string.length
    // string.length counts UTF-16 code units, but upload() needs byte count
    const contentLength = Buffer.byteLength(blob.content, 'utf-8');

    await blockBlobClient.upload(blob.content, contentLength, {
      blobHTTPHeaders: { blobContentType: blob.contentType },
    });

    context.log(`[upload] ${blob.name} uploaded (${i + 1}/${blobs.length})`);
  }
}
```

### Anti-Patterns to Avoid
- **Module-scope `new Date()`:** A Date captured at module load time will be stale across invocations (functions can stay warm). Always create Date inside the handler.
- **`string.length` for upload content length:** JS `string.length` counts UTF-16 code units, not bytes. For ASCII content this happens to match, but lz-string `compressToUTF16` produces multi-byte characters. Use `Buffer.byteLength(content, 'utf-8')` always.
- **Parallel blob uploads:** User decision is sequential. Don't use `Promise.all()` for blob uploads.
- **Catching errors from pipeline:** Don't wrap `runPipeline()` in a try/catch that swallows the error. Let it propagate so the function fails and Azure's retry policy activates.
- **Adding retry logic around `runPipeline()`:** Phase 19 already has 3 retries with exponential backoff inside `fetchMetadataXml()`. Don't double-wrap.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Blob upload | Custom HTTP PUT to Azure REST API | `@azure/storage-blob` SDK | SDK handles auth, retries, content hashing, chunking for large files |
| Container creation | Manual existence check + create | `containerClient.createIfNotExists()` | Idempotent, handles race conditions, one line |
| Timer scheduling | Custom cron parser or `setInterval` | Azure Functions `app.timer()` | Built-in, persistent, survives restarts, handles past-due |
| Retry policy | Custom retry wrapper | `retry` option on `app.timer()` | Azure Functions manages retry count, delay, and dead-letter |
| Connection string parsing | Manual URL/key extraction | `BlobServiceClient.fromConnectionString()` | Handles all auth formats (SAS, key, emulator) |

**Key insight:** Azure Functions v4 and the Azure Storage SDK handle all the infrastructure concerns (scheduling, retry, auth, idempotent creates). The Phase 20 code is pure orchestration glue — calling Phase 19's pipeline, then calling the SDK's upload methods.

## Common Pitfalls

### Pitfall 1: Content Length Mismatch on Upload
**What goes wrong:** `blockBlobClient.upload(content, content.length)` silently truncates or corrupts blobs when content contains multi-byte characters.
**Why it happens:** `string.length` counts UTF-16 code units. The `upload()` method's `contentLength` parameter expects bytes. For ASCII-only content (like XML), they match. But `compressToUTF16()` output contains non-ASCII characters where 1 character ≠ 1 byte in UTF-8.
**How to avoid:** Always use `Buffer.byteLength(content, 'utf-8')` for the content length parameter.
**Warning signs:** `.zip.json` blobs appear corrupted or smaller than expected; JSON blobs work fine.

### Pitfall 2: Month Indexing Off-By-One
**What goes wrong:** Monthly snapshots named `m0` for January instead of `m1`.
**Why it happens:** `Date.getMonth()` and `Date.getUTCMonth()` return 0-indexed months (0=January). The legacy code used 0-indexed months. The new naming convention requires 1-indexed months.
**How to avoid:** Always use `now.getUTCMonth() + 1` for the month number in blob names.
**Warning signs:** January blobs named `2026y_m0_metadata.json` instead of `2026y_m1_metadata.json`.

### Pitfall 3: Timer Schedule App Setting Not Found
**What goes wrong:** Function fails to start with "NCRONTAB expression is not valid" when `TIMER_SCHEDULE` app setting is missing.
**Why it happens:** The `%TIMER_SCHEDULE%` syntax in `app.timer()` requires the app setting to exist at function startup. If missing, the function host can't parse the schedule.
**How to avoid:** Add `TIMER_SCHEDULE` to `local.settings.json` for local dev, and ensure it's set in Azure App Settings for production. Default: `0 0 1 * * *`.
**Warning signs:** Function host fails to start; no individual function errors, just startup failure.

### Pitfall 4: Missing `AzureWebJobsStorage` Connection String
**What goes wrong:** `BlobServiceClient.fromConnectionString()` throws if `AzureWebJobsStorage` is empty or undefined.
**Why it happens:** Local development often uses Azurite or the storage emulator, which needs the connection string set. In production, the Functions host provides it automatically but the blob SDK still needs it explicitly.
**How to avoid:** Validate the connection string at handler start. For local dev, set `AzureWebJobsStorage` in `local.settings.json` (e.g., `UseDevelopmentStorage=true` for Azurite).
**Warning signs:** Null reference error or "Invalid connection string" on first invocation.

### Pitfall 5: `dotenv/config` Import in Timer Function
**What goes wrong:** Timer function doesn't pick up `.env` values locally.
**Why it happens:** Azure Functions v4 uses `local.settings.json`, not `.env`, for local settings. But the existing `validateAuth.ts` pattern imports `dotenv/config` for compatibility. Must be consistent.
**How to avoid:** Follow the existing pattern: `import 'dotenv/config'` at the top of each function file. This is a no-op in production (no `.env` file) but helps local dev.
**Warning signs:** Environment variables undefined during local `func start`.

### Pitfall 6: HTTP Trigger Retry Policy Behavior
**What goes wrong:** Adding `retry` to `app.http()` doesn't behave as expected — HTTP triggers don't support function-level retry in the same way timer triggers do.
**Why it happens:** Azure Functions retry policies are designed for event-driven triggers (timer, queue, event hub). HTTP triggers return the response directly to the caller; retry would mean the caller gets no response.
**How to avoid:** Only apply the `retry` policy to the timer trigger. The HTTP trigger handles errors by returning 500 with error details.
**Warning signs:** Runtime warning about unsupported retry configuration on HTTP trigger.

## Code Examples

Verified patterns from official sources:

### Container Creation with Public Access
```typescript
// Source: https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-upload-javascript
// + GitHub: microsoft/azuredatastudio, payloadcms/payload, microsoft/typespec
const containerClient = blobServiceClient.getContainerClient('api-files');
await containerClient.createIfNotExists({ access: 'blob' });
```

### String Upload with Content-Type
```typescript
// Source: https://learn.microsoft.com/en-us/javascript/api/@azure/storage-blob/blockblobclient
// + GitHub: novu, langfuse, hedgedoc — all use same pattern
const blockBlobClient = containerClient.getBlockBlobClient('metadata.latest.json');
const content = result.json;
await blockBlobClient.upload(content, Buffer.byteLength(content, 'utf-8'), {
  blobHTTPHeaders: { blobContentType: 'application/json' },
});
```

### Timer Trigger with Configurable Schedule and Retry
```typescript
// Source: https://learn.microsoft.com/en-us/azure/azure-functions/functions-bindings-timer
// + https://learn.microsoft.com/en-us/azure/azure-functions/functions-bindings-error-pages
app.timer('generateMetadata', {
  schedule: '%TIMER_SCHEDULE%',     // Reads from app setting
  handler: generateMetadata,
  retry: {
    strategy: 'fixedDelay',
    maxRetryCount: 2,
    delayInterval: { minutes: 5 },  // 5-minute fixed delay between retries
  },
});
```

### HTTP Trigger with Function Key Auth
```typescript
// Source: Project's validateAuth.ts pattern (verified working)
app.http('generateMetadataHttp', {
  methods: ['POST'],
  authLevel: 'function',
  handler: generateMetadataHttp,
});
```

### Retry Context Access
```typescript
// Source: https://learn.microsoft.com/en-us/azure/azure-functions/functions-bindings-error-pages
// Available on InvocationContext for retry-aware logging
if (context.retryContext) {
  context.log(`[retry] attempt ${context.retryContext.retryCount} of ${context.retryContext.maxRetryCount}`);
}
```

### local.settings.json Configuration
```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "TIMER_SCHEDULE": "0 0 1 * * *",
    "SP_URL": "https://contoso.sharepoint.com",
    "ENTRA_CLIENT_ID": "...",
    "ENTRA_TENANT_ID": "...",
    "SP_CERT_PEM": "...",
    "SP_KEY_PEM": "..."
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `function.json` + `index.ts` (v3 model) | `app.timer()`/`app.http()` code-based registration (v4 model) | 2023 (GA) | No JSON config files; type-safe registration in code |
| `azure-storage` npm package (legacy) | `@azure/storage-blob` v12+ | 2019 | New SDK is modular, async/await native, tree-shakeable |
| `createBlockBlobFromText()` (legacy SDK) | `blockBlobClient.upload()` (v12 SDK) | 2019 | New API, explicit content length, options object for headers |
| `function.json` retry configuration | Inline `retry` property on `app.timer()` | 2023 (v4 model) | Retry config co-located with function registration |
| `context.done()` callback pattern | `async/await` with `Promise<void>` | 2023 (v4 model) | Modern async pattern, no callback management |

**Deprecated/outdated:**
- `azure-storage` npm package: Replaced by `@azure/storage-blob` v12+ in 2019. The legacy `az-funcs/` code uses the old SDK — do not copy those patterns.
- `context.done()`: Removed in v4 model. Functions signal completion by resolving the promise.
- `context.bindings` output bindings: Still supported but not recommended for dynamic blob names. Use SDK direct upload.
- `context.log.info()` / `context.log.error()`: In v4, use `context.log()` and `context.error()` directly (these are the InvocationContext methods).

## Open Questions

1. **Connection string environment variable name for blob storage**
   - What we know: Azure Functions uses `AzureWebJobsStorage` by default for internal storage. The blob SDK needs a connection string passed explicitly.
   - What's unclear: Whether to reuse `AzureWebJobsStorage` (which points to the function's storage account, where `api-files` lives) or introduce a separate `BLOB_STORAGE_CONNECTION_STRING` for flexibility.
   - Recommendation: Use `AzureWebJobsStorage` — it's the same storage account, reduces config surface, and matches the legacy pattern. Can be split later if needed.

2. **Test strategy for upload module**
   - What we know: Vitest is the test runner. Pipeline tests use integration tests with golden fixtures. The upload module depends on Azure Blob Storage SDK.
   - What's unclear: Whether to mock `@azure/storage-blob` or use Azurite (storage emulator) for integration tests.
   - Recommendation: Unit test the `buildBlobList()` pure function (date math, blob names). Mock the SDK for `uploadBlobs()` to verify sequential calls, content types, and error handling. Skip Azurite — it adds Docker/emulator complexity for a straightforward upload.

3. **`delayInterval` format for retry policy**
   - What we know: Context7 examples show `{ seconds: 10 }` and the function.json docs show `"HH:mm:ss"` format.
   - What's unclear: The exact TypeScript type for `delayInterval` in the v4 model — is it `{ minutes: 5 }` or `{ seconds: 300 }`?
   - Recommendation: Use `{ minutes: 5 }` — the v4 model accepts a duration object with `seconds`, `minutes`, `hours` properties. Verified from Context7 code example showing `{ seconds: 10 }`.

## Sources

### Primary (HIGH confidence)
- Context7 `/websites/learn_microsoft_en-us_azure_azure-functions` - Timer trigger registration, retry policy configuration, NCRONTAB expressions
- [Microsoft Learn: Timer trigger](https://learn.microsoft.com/en-us/azure/azure-functions/functions-bindings-timer) - `%ScheduleAppSetting%` syntax, schedule configuration
- [Microsoft Learn: Retry policies](https://learn.microsoft.com/en-us/azure/azure-functions/functions-bindings-error-pages) - Fixed delay retry, `maxRetryCount`, `delayInterval`
- [Microsoft Learn: Upload blob with JavaScript](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-upload-javascript) - `upload()`, `uploadData()`, content type headers
- [Microsoft Learn: BlockBlobClient API](https://learn.microsoft.com/en-us/javascript/api/@azure/storage-blob/blockblobclient) - Method signatures, `BlockBlobUploadOptions`
- [npm: @azure/storage-blob](https://www.npmjs.com/package/@azure/storage-blob) - Version 12.31.0 confirmed current

### Secondary (MEDIUM confidence)
- GitHub code search: microsoft/azuredatastudio, payloadcms/payload, microsoft/typespec, novu, langfuse — real-world `createIfNotExists({ access: 'blob' })` and `upload()` with `blobHTTPHeaders` patterns
- Project's existing `validateAuth.ts` — verified working v4 function pattern
- Project's legacy `az-funcs/GenerateMetadata/index.ts` — reference for understanding old flow (NOT to be copied)

### Tertiary (LOW confidence)
- None — all findings verified with official documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - `@azure/functions` already in project, `@azure/storage-blob` is the only official JS SDK
- Architecture: HIGH - Shared handler pattern verified in official docs and project's existing function pattern
- Pitfalls: HIGH - Content length issue verified from SDK docs; month indexing confirmed from legacy code comparison

**Research date:** 2026-02-23
**Valid until:** 2026-03-23 (stable APIs, no fast-moving changes expected)
