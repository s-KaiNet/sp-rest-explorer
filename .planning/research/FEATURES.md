# Feature Research: v2.0 Azure Functions Backend

**Domain:** Metadata Processing Pipeline — Azure Functions backend for SharePoint REST API Explorer
**Researched:** 2026-02-22
**Confidence:** HIGH

## Context: What This Backend Does

This is a **single-purpose data pipeline**, not a general-purpose API or microservice. It runs once daily as an Azure Function timer trigger, fetches SharePoint's `$metadata` XML (~4MB), transforms it to JSON, compresses it, and uploads multiple blob variants to Azure Blob Storage. The frontend SPA (hosted on GitHub Pages) then fetches `metadata.latest.json` or `metadata.latest.zip.json` directly from Blob Storage.

The pipeline has exactly one job: keep the metadata blobs fresh. It doesn't serve HTTP requests, doesn't have users, and doesn't have a UI. Quality is measured by: Does it run daily? Does it produce correct blobs? Does it recover from failures?

### What Already Exists (Legacy `az-funcs/`)

The legacy codebase proves the concept works but has critical technical debt:
- Azure Functions v2 with `context.done()` pattern (deprecated)
- `azure-storage` SDK v2 with Bluebird promisify wrappers (deprecated)
- ROPC auth flow (`acquireTokenByUsernamePassword`) — deprecated by Microsoft, no MFA support
- Module-scope `let now = new Date()` — stale across Azure Functions warm starts
- Zero-indexed months in blob names (`date.getMonth()` → `0` for January)
- No retry logic, no timeout configuration on SharePoint HTTP call
- No error recovery if SharePoint is temporarily unreachable

### What's Being Rewritten (v2.0 Scope)

The rewrite preserves the **parsing logic** (xml2js, lz-string compression, metadata structure) but replaces everything around it: auth, blob SDK, Functions framework, blob naming, scheduling.

---

## Feature Landscape

### Table Stakes (Must Have for v2.0 Launch)

Features that are non-negotiable for a reliable metadata pipeline. Missing these = pipeline doesn't work or is broken.

| # | Feature | Why Expected | Complexity | Notes |
|---|---------|--------------|------------|-------|
| T1 | **Timer-triggered daily execution** | The pipeline's core job — run once daily to keep metadata fresh. Legacy runs at `0 0 1 * * *` (1 AM UTC). Without this, blobs go stale. | LOW | Azure Functions v4 `app.timer()` with CRON schedule. Straightforward — proven pattern in both legacy code and official docs. |
| T2 | **Client credentials MSAL auth (certificate-based)** | ROPC is deprecated by Microsoft. Client credentials is the approved app-only flow. **CRITICAL: SharePoint Online requires certificate auth, not just client secret.** Microsoft docs FAQ: "Can I use other means besides certificates? No, all other options are blocked by SharePoint Online and will result in an Access Denied message." | HIGH | This is the single highest-risk feature. Requires: (1) self-signed certificate generation, (2) certificate uploaded to Entra ID app registration, (3) MSAL `ConfidentialClientApplication` with `clientCertificate` config, (4) certificate available to Azure Functions runtime (Key Vault or app settings). Scope format: `https://{tenant}.sharepoint.com/.default`. |
| T3 | **SharePoint `$metadata` XML fetch with retry** | SharePoint Online has intermittent 503/504 errors, throttling (429), and cold-start delays. Legacy has zero retry logic — a single failure means no blobs for that day. | MEDIUM | Implement retry with exponential backoff. Configurable max attempts (default 3). Must handle: network timeout, 429 throttle (respect Retry-After header), 5xx server errors. Azure Functions v4 has built-in retry policies — use `retry: { strategy: 'fixedDelay', maxRetryCount: 3 }` at the function level for whole-function retry, plus axios-level retry for just the HTTP call. |
| T4 | **XML-to-JSON parsing pipeline** | Core transformation logic. Parses ~4MB XML via xml2js, extracts entities/functions/properties/associations, populates Collection types, links functions to entities. This is the existing `MetadataParser` logic. | LOW | Direct port from legacy `src/metadataParser.ts`. Logic is proven and stable — 2,449 entities, 3,528 functions correctly parsed. Replace Bluebird promisify with native async/await (`xml2js.parseStringPromise`). |
| T5 | **lz-string compression** | Frontend expects `metadata.latest.zip.json` as a compressed alternative (~1MB vs ~4MB uncompressed). Used by the SPA for faster initial load. | LOW | Direct port. `compressToUTF16(JSON.stringify(parsed))`. One function call, no complexity. |
| T6 | **Blob Storage upload — latest files** | The 3 "latest" blobs are what the frontend reads on every page load: `metadata.latest.json`, `metadata.latest.zip.json`, `metadata.latest.xml`. Without these, the frontend has no data. | MEDIUM | Use `@azure/storage-blob` v12 SDK. Create `BlobServiceClient` from connection string, get `ContainerClient('api-files')`, upload via `BlockBlobClient.upload()`. Set `blobContentType` appropriately (application/json, application/xml). Container must have public blob access level. |
| T7 | **Blob Storage upload — monthly snapshots** | Monthly blobs preserve historical metadata: `{year}y_m{month}_metadata.json`, `{year}y_m{month}_metadata.zip.json`, `{year}y_m{month}_metadata.xml`. **1-indexed months** (January = 1, not 0 like legacy). | LOW | Same upload pattern as T6 but with date-formatted blob names. Fix legacy bug: use `date.getMonth() + 1` for 1-indexed months. Monthly blobs are overwritten daily during that month (idempotent). |
| T8 | **Fresh `Date` per invocation** | Legacy has `let now = new Date()` at module scope — stale across warm starts, meaning blob names could be wrong (e.g., still using January date in February). | LOW | Move `new Date()` inside the function handler. Trivial fix but critical correctness issue. |
| T9 | **Container auto-creation with public access** | The `api-files` container must exist with public blob access. Legacy does `createContainerIfNotExists` on every run. | LOW | `containerClient.createIfNotExists({ access: 'blob' })`. One SDK call, idempotent. |
| T10 | **Environment variable configuration** | Connection strings, tenant IDs, certificate paths, SharePoint URL — all must be configurable via environment variables / `local.settings.json`. No hardcoded secrets. | LOW | Standard pattern. `process.env.SP_URL`, `process.env.AZ_TENANT_ID`, etc. Use `local.settings.json` for local dev, Azure App Settings for production. |
| T11 | **Structured logging** | Pipeline must log: start time, auth success, metadata fetch duration, parse duration, blob upload count, total duration, errors with context. Essential for debugging failures in a timer-triggered function where you can't observe it live. | LOW | Use `context.log()` from `InvocationContext`. Log key milestones: "Authenticating...", "Fetching metadata... (attempt 2/3)", "Parsing XML... (4.2MB)", "Uploading 6 blobs...", "Complete in 12.3s". |
| T12 | **`func azure functionapp publish` deployment** | Developer must be able to deploy from local machine with a single command. No CI/CD in v2.0 scope — that's a future milestone. | LOW | Standard Azure Functions Core Tools workflow: `npm run build && func azure functionapp publish <app-name>`. Requires `.funcignore` to exclude `local.settings.json`, tests, source maps. |

### Differentiators (Nice-to-Have Improvements Over Legacy)

Features that aren't required but make the pipeline significantly more robust or developer-friendly.

| # | Feature | Value Proposition | Complexity | Notes |
|---|---------|-------------------|------------|-------|
| D1 | **Azure Functions built-in retry policy** | In addition to HTTP-level retry (T3), the whole function can be retried if it throws. Covers scenarios where blob upload fails mid-way or auth token expires during execution. | LOW | Add `retry: { strategy: 'fixedDelay', delayInterval: { seconds: 30 }, maxRetryCount: 2 }` to the `app.timer()` config. Built-in v4 feature — zero custom code. Available via `context.retryContext` for conditional logic. |
| D2 | **Request timeout on SharePoint fetch** | Legacy axios call has no timeout — if SharePoint hangs, the function hangs until Azure Functions kills it (default 5 min on Consumption plan). | LOW | `axios.get(url, { timeout: 60000 })`. One config line. Prevents indefinite hangs. |
| D3 | **Blob content type headers** | Setting `blobHTTPHeaders.blobContentType` ensures browsers/CDNs serve blobs with correct MIME types. Legacy doesn't set these — browsers may not handle Content-Type correctly. | LOW | `{ blobHTTPHeaders: { blobContentType: 'application/json' } }` for JSON blobs, `'application/xml'` for XML, `'application/json'` for zip.json. |
| D4 | **HTTP trigger for manual execution** | A secondary HTTP-triggered endpoint that runs the same pipeline on demand. Useful for: testing after deploy, forcing a refresh if metadata changed, debugging without waiting for timer. | LOW | Same handler function, registered with both `app.timer()` and `app.http()`. Add `authLevel: 'function'` for security (requires function key). |
| D5 | **Skip upload on identical metadata** | If today's metadata XML is byte-identical to yesterday's `metadata.latest.xml`, skip all uploads. Saves blob writes (cost) and avoids unnecessary blob modification timestamps. | MEDIUM | Download `metadata.latest.xml`, compare with fetched XML. If identical, log "No changes detected, skipping upload" and exit. Requires one extra blob read per execution. Could use ETag or content hash comparison. |
| D6 | **Execution summary in function output** | Return a structured summary: `{ success: true, duration: 12300, blobsUploaded: 6, metadataSize: 4200000, entities: 2449, functions: 3528 }`. Visible in Azure Functions Monitor. | LOW | Assemble result object during execution, log it as JSON at end. Useful for operational monitoring. |
| D7 | **Configurable CRON schedule via app setting** | Instead of hardcoding `0 0 1 * * *`, reference an app setting: `schedule: '%TIMER_SCHEDULE%'`. Allows changing schedule without redeploying code. | LOW | Azure Functions supports `%AppSettingName%` syntax in CRON schedule field. One-line change. |
| D8 | **Application Insights integration** | Track custom metrics (parse duration, fetch duration, metadata size) in Application Insights for operational dashboards and alerting. | LOW | Azure Functions auto-instruments with Application Insights if `APPLICATIONINSIGHTS_CONNECTION_STRING` is set. Custom metrics via `context.log` are automatically captured. No extra code needed for basic telemetry. |

### Anti-Features (Avoid Building These in v2.0)

Features that seem useful but add complexity without proportional value for this specific pipeline.

| # | Anti-Feature | Why Requested | Why Problematic | Alternative |
|---|-------------|---------------|-----------------|-------------|
| A1 | **Weekly snapshots** | Legacy creates weekly blobs alongside monthly. Seems like more granularity is better. | Weekly snapshots are never consumed. The frontend only reads `metadata.latest.*`. Monthly snapshots exist for the future Changelog feature. Weekly blobs are dead storage costing money. The project already decided to drop them (PROJECT.md). | Monthly snapshots only. If daily granularity is ever needed, the `metadata.latest.*` is overwritten daily anyway. |
| A2 | **Diff generation (GenerateDiff function)** | Legacy computes jsondiffpatch between monthly snapshots and renders HTML. Changelog feature needs diffs. | Diff generation is a separate concern from metadata fetching. It was tightly coupled in v1.0 but should be a separate function if/when the Changelog feature is built. Dropped per PROJECT.md. | Defer to future milestone (CHLG-01 through CHLG-06 in backlog). Monthly snapshots (T7) provide the raw material for future diff generation. |
| A3 | **Blob output bindings (declarative)** | Azure Functions v4 supports `output.storageBlob()` declarative bindings. Seems cleaner than SDK calls. | Output bindings have a fixed path per binding declaration. This function uploads 6+ blobs with dynamic names (containing year/month). You'd need 6 separate `output.storageBlob()` declarations with complex binding expressions, or use `extraOutputs` with `context.extraOutputs.set()` which is awkward for multiple dynamic blobs. Using the `@azure/storage-blob` SDK directly is clearer and more flexible. | Use `@azure/storage-blob` SDK directly (T6/T7). The SDK approach is what Microsoft recommends for dynamic blob paths and multiple uploads. |
| A4 | **CI/CD auto-deployment (GitHub Actions)** | Automating deployment prevents manual errors and enables continuous delivery. | Premature for v2.0. There's one developer, deployments happen rarely (after metadata format changes, which is almost never), and the pipeline code is stable once working. Adding CI/CD adds configuration complexity and secrets management in GitHub. | `func azure functionapp publish` from local machine (T12). CI/CD is explicitly in the backlog (ADDL-02). |
| A5 | **Multi-tenant / multi-site support** | Support fetching metadata from multiple SharePoint tenants or sites. | This pipeline serves exactly one SharePoint tenant's metadata. The frontend is hardcoded to one blob URL. Multi-tenant support adds configuration complexity, multiple certificates, and parallel execution — none of which is needed. | Single-tenant, single-site. If ever needed, duplicate the Function App. |
| A6 | **Azure Key Vault for certificate storage** | "Best practice" for certificate management — store cert in Key Vault and reference via Key Vault reference in app settings. | Adds a Key Vault dependency, RBAC configuration, and app setting reference syntax. For a single self-signed certificate used by one function app, uploading the certificate directly to the Function App's certificate store or using a Base64-encoded PFX in app settings is simpler. Key Vault is overkill for this scale. | Upload PFX certificate to Function App directly, or store Base64-encoded PFX in app settings. For local dev, reference PFX file path in `local.settings.json`. |
| A7 | **Client secret authentication** | Simpler than certificate auth — just a string in environment variables. | **Will not work.** SharePoint Online explicitly blocks client secret-based app-only tokens. Microsoft docs FAQ: "Can I use other means besides certificates for realizing app-only access for my Azure AD app? No, all other options are blocked by SharePoint Online and will result in an Access Denied message." Attempting client secret auth results in `401 Unsupported app only token`. | Certificate-based client credentials (T2). This is non-negotiable. |
| A8 | **Durable Functions for orchestration** | Use Durable Functions to orchestrate fetch → parse → upload as a workflow with automatic checkpointing. | Massive overkill. The entire pipeline takes ~15 seconds. Durable Functions adds SDK dependencies, storage requirements, and conceptual complexity for a linear 3-step process. There's no fan-out/fan-in, no human interaction, no long-running waits. | Simple sequential async/await in a single function (what legacy already does, just modernized). |

---

## Feature Dependencies

```
[T2: Certificate Auth]
    └──requires──> [Entra ID App Registration with certificate uploaded]
    └──requires──> [Certificate available in Azure Functions runtime]
    └──enables──> [T3: SharePoint Metadata Fetch]

[T3: SharePoint Metadata Fetch]
    └──requires──> [T2: Certificate Auth (token)]
    └──enables──> [T4: XML-to-JSON Parsing]

[T4: XML-to-JSON Parsing]
    └──requires──> [T3: Raw XML data]
    └──enables──> [T5: lz-string Compression]
    └──enables──> [T6: Blob Upload - Latest]

[T5: lz-string Compression]
    └──requires──> [T4: Parsed JSON]
    └──enables──> [T6: Blob Upload - Latest (zip.json)]

[T6: Blob Upload - Latest]
    └──requires──> [T4: JSON] + [T5: Compressed JSON] + [T3: Raw XML]
    └──requires──> [T9: Container Exists]
    └──requires──> [T10: Connection String Config]

[T7: Monthly Snapshots]
    └──requires──> [T6: Same upload logic] + [T8: Fresh Date]

[T1: Timer Trigger]
    └──orchestrates──> [T2 → T3 → T4 → T5 → T6 + T7]

[D1: Built-in Retry] ──enhances──> [T1: Timer Trigger]
[D4: HTTP Trigger] ──shares handler with──> [T1: Timer Trigger]
[D5: Skip Identical] ──optimizes──> [T6: Blob Upload]
```

### Dependency Notes

- **T2 is the critical path.** Everything downstream depends on getting a valid access token. Certificate setup is a one-time manual step but must be done before any testing.
- **T4 is a direct port.** The `MetadataParser` logic is proven — it doesn't need re-investigation, just modernization (native async/await instead of Bluebird).
- **T6/T7 use the same upload utility.** Write once, call with different blob names.
- **D4 (HTTP trigger) shares the same handler** as T1 (timer trigger) — the handler function is registered with both trigger types.

---

## MVP Definition

### Launch With (v2.0)

All table stakes features — these are the minimum for a working pipeline that replaces legacy.

- [x] T1: Timer-triggered daily execution (`0 0 1 * * *`)
- [x] T2: Client credentials MSAL auth with certificate
- [x] T3: SharePoint metadata fetch with retry (3 attempts, exponential backoff)
- [x] T4: XML-to-JSON parsing (port MetadataParser)
- [x] T5: lz-string compression
- [x] T6: Blob upload — 3 latest files
- [x] T7: Blob upload — 3 monthly snapshots (1-indexed months)
- [x] T8: Fresh Date per invocation
- [x] T9: Container auto-creation with public access
- [x] T10: Environment variable configuration
- [x] T11: Structured logging
- [x] T12: Local deploy workflow

### Add During Implementation (if trivial)

Features that cost almost nothing to add and improve robustness:

- [ ] D1: Built-in retry policy — one config line in `app.timer()`
- [ ] D2: Request timeout — one axios config option
- [ ] D3: Blob content type headers — one option per upload call
- [ ] D7: Configurable CRON schedule via app setting — one syntax change

### Add After v2.0 Validated

- [ ] D4: HTTP trigger for manual execution — after timer is proven working
- [ ] D5: Skip identical metadata — optimization, not critical
- [ ] D6: Execution summary — nice for monitoring
- [ ] D8: Application Insights — auto-configured if connection string set

### Future Milestones

- [ ] A2/CHLG-01-06: Diff generation as separate function (Changelog feature)
- [ ] A4/ADDL-02: GitHub Actions CI/CD auto-deployment

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Risk | Priority |
|---------|------------|---------------------|------|----------|
| T2: Certificate auth | CRITICAL | HIGH | HIGH — certificate setup, SPO requirements | P0 |
| T3: Fetch with retry | HIGH | MEDIUM | MEDIUM — retry logic, error handling | P1 |
| T4: XML-to-JSON parse | CRITICAL | LOW | LOW — direct port, proven logic | P1 |
| T1: Timer trigger | CRITICAL | LOW | LOW — well-documented pattern | P1 |
| T6: Latest blob upload | CRITICAL | MEDIUM | LOW — standard SDK usage | P1 |
| T5: lz-string compress | HIGH | LOW | LOW — one function call | P1 |
| T7: Monthly snapshots | MEDIUM | LOW | LOW — same as T6 with date formatting | P1 |
| T8: Fresh Date | HIGH | LOW | LOW — trivial code placement | P1 |
| T9: Container creation | HIGH | LOW | LOW — one SDK call | P1 |
| T10: Env var config | CRITICAL | LOW | LOW — standard pattern | P1 |
| T11: Structured logging | MEDIUM | LOW | LOW — context.log calls | P1 |
| T12: Deploy workflow | HIGH | LOW | MEDIUM — deployment gotchas with v4 model | P1 |
| D1: Built-in retry | MEDIUM | LOW | LOW — one config line | P2 |
| D2: Request timeout | MEDIUM | LOW | LOW — one config option | P2 |
| D3: Content type headers | LOW | LOW | LOW — one option per upload | P2 |
| D4: HTTP trigger | MEDIUM | LOW | LOW — shared handler | P2 |
| D7: Configurable schedule | LOW | LOW | LOW — syntax change | P2 |
| D5: Skip identical | LOW | MEDIUM | LOW — extra blob read | P3 |

**Priority key:**
- P0: Must have, highest risk — validate first
- P1: Must have for launch
- P2: Should have, add during implementation
- P3: Nice to have, defer if time-constrained

---

## Critical Research Finding: SharePoint Certificate Auth

**Confidence: HIGH** (Official Microsoft documentation + multiple independent confirmations)

SharePoint Online does NOT support client secret-based app-only tokens for CSOM/REST API access. This is a hard requirement, not a recommendation:

> "In Entra ID when doing app-only you **must use a certificate** to request access to SharePoint CSOM/REST API's"
> — [Microsoft Learn: Granting access via Entra ID App-Only](https://learn.microsoft.com/en-us/sharepoint/dev/solution-guidance/security-apponly-azuread)

> "Can I use other means besides certificates for realizing app-only access for my Azure AD app? **No, all other options are blocked by SharePoint Online** and will result in an Access Denied message."
> — Same source, FAQ section

**Impact on implementation:**
1. The MSAL `ConfidentialClientApplication` must use `clientCertificate` config (not `clientSecret`)
2. A self-signed certificate must be generated (OpenSSL or PowerShell)
3. The public certificate (.cer) must be uploaded to the Entra ID app registration
4. The private key (.pfx or .pem) must be accessible to the Azure Function at runtime
5. For local dev: PFX file path in `local.settings.json`
6. For Azure: Upload certificate to Function App, or store Base64-encoded PFX in app settings
7. Scope must be `https://{tenant}.sharepoint.com/.default` (the `/.default` suffix is required for client credentials flow)
8. Application permission `Sites.Read.All` (or `Sites.Selected` for least-privilege) must be configured in Entra ID and admin-consented

The legacy code uses `acquireTokenByUsernamePassword` (ROPC) which also happens to be deprecated by MSAL. The migration is from ROPC → client credentials with certificate, which is a complete auth rewrite.

---

## Existing Logic to Preserve vs Rewrite

| Component | Action | Rationale |
|-----------|--------|-----------|
| `MetadataParser` (xml2js parsing, entity/function extraction) | **Port** — modernize syntax, keep logic | Proven correct. Replace Bluebird promisify with native async. |
| `MetadataReader` (ROPC auth + axios fetch) | **Rewrite** — new auth mechanism | ROPC → client credentials with certificate. |
| `Utils.generateMonthBlobName()` | **Rewrite** — fix month indexing | Legacy uses `date.getMonth()` (0-indexed). New: `date.getMonth() + 1`. |
| `Utils.generateWeekBlobName()` | **Drop** — weekly snapshots eliminated | Per PROJECT.md decision. |
| `GenerateMetadata/index.ts` (orchestrator) | **Rewrite** — v4 programming model | Legacy v2 pattern → v4 `app.timer()`. Replace `context.done()`, `context.bindings`. |
| `GenerateDiff/` (entire function) | **Drop** — diff generation deferred | Per PROJECT.md decision. |
| `consts.ts` | **Simplify** — only `api-files` container | Drop `diff-files` constant. |
| `azure-storage` SDK usage | **Replace** — use `@azure/storage-blob` v12 | Legacy SDK deprecated. New SDK has cleaner async API. |
| Blob naming pattern | **Simplify** — 6 blobs total per run | Latest: 3 blobs. Monthly: 3 blobs. No weekly. |
| Interface types | **Port** — keep TypeScript interfaces | `EntityType`, `FunctionImport`, `Metadata`, `Property`, etc. Still valid. |

---

## Sources

- [Microsoft Learn: Azure Functions Timer Trigger (v4 model)](https://learn.microsoft.com/en-us/azure/azure-functions/functions-bindings-timer) — **HIGH confidence** (Context7 verified)
- [Microsoft Learn: Azure Functions Retry Policies](https://learn.microsoft.com/en-us/azure/azure-functions/functions-bindings-error-pages) — **HIGH confidence** (Context7 verified)
- [Microsoft Learn: Azure Functions Blob Output Binding (v4)](https://learn.microsoft.com/en-us/azure/azure-functions/functions-bindings-storage-blob-output) — **HIGH confidence** (Context7 verified)
- [Microsoft Learn: Azure Functions Node.js Developer Guide](https://learn.microsoft.com/en-us/azure/azure-functions/functions-reference-node) — **HIGH confidence** (Context7 verified)
- [Microsoft Learn: Granting access via Entra ID App-Only](https://learn.microsoft.com/en-us/sharepoint/dev/solution-guidance/security-apponly-azuread) — **HIGH confidence** (official docs, verified via WebFetch)
- [MSAL Node: ConfidentialClientApplication](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/docs/initialize-confidential-client-application.md) — **HIGH confidence** (Context7 verified)
- [MSAL Node: Client Credentials Flow](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/docs/request.md) — **HIGH confidence** (Context7 verified)
- [@azure/storage-blob README](https://github.com/azure/azure-sdk-for-js/blob/main/sdk/storage/storage-blob/README.md) — **HIGH confidence** (Context7 verified)
- [Medium: SharePoint App-Only Auth — When Client Secrets Fail and Certificates Prevail](https://medium.com/@rawandhawez/sharepoint-app-only-auth-when-client-secrets-fail-and-certificates-prevail-ca230b91a601) — **MEDIUM confidence** (independent confirmation of certificate requirement)
- Legacy codebase: `az-funcs/GenerateMetadata/index.ts`, `az-funcs/src/metadataReader.ts`, `az-funcs/src/metadataParser.ts`, `az-funcs/src/utils.ts` — **HIGH confidence** (direct code analysis)

---
*Feature research for: v2.0 Azure Functions Backend Rework*
*Researched: 2026-02-22*
