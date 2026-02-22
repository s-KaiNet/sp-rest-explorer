# Pitfalls Research: Azure Functions Backend Rewrite (v2 → v4)

**Domain:** Azure Functions backend rewrite — v4 programming model, modern SDKs, client credentials auth, blob storage, timer triggers
**Researched:** 2026-02-22
**Confidence:** HIGH (verified via Context7 @azure/functions docs, Microsoft Learn official docs, MSAL Node docs, @azure/storage-blob migration guide)

> **Scope:** Pitfalls specific to rewriting the `az-funcs/` backend from scratch — Azure Functions v2→v4 migration, deprecated SDK replacement, auth flow change, and deployment. Does NOT cover frontend pitfalls (those are in the v1.x research archives).

---

## Critical Pitfalls

### Pitfall 1: SharePoint App-Only Access REQUIRES Certificates — Client Secrets Are Blocked

**What goes wrong:**
You configure MSAL `ConfidentialClientApplication` with `clientSecret` for the client credentials flow (replacing ROPC), obtain a valid access token, but get **403 Forbidden** or **401 Unauthorized** when calling SharePoint REST APIs (e.g., `_api/$metadata`). The token is valid, Microsoft Entra ID is happy, but SharePoint rejects it.

**Why it happens:**
Microsoft documentation explicitly states: **"In Entra ID when doing app-only you must use a certificate to request access to SharePoint CSOM/REST API's"** and **"Can I use other means besides certificates for realizing app-only access for my Azure AD app? No, all other options are blocked by SharePoint Online and will result in an Access Denied message."** (Source: [Microsoft Learn — Granting access via Entra ID App-Only](https://learn.microsoft.com/en-us/sharepoint/dev/solution-guidance/security-apponly-azuread))

Client secrets work fine for Microsoft Graph API, but SharePoint REST APIs enforce certificate-only authentication for app-only (client credentials) flows. This is a SharePoint-specific restriction, not a general Entra ID limitation.

**How to avoid:**
1. Generate a self-signed certificate (PFX + CER) for the app registration
2. Upload the CER public key to the Entra ID app registration under Certificates & secrets → Certificates
3. Use MSAL `ConfidentialClientApplication` with `clientCertificate` instead of `clientSecret`:
```typescript
const msalConfig = {
  auth: {
    clientId: process.env.AZ_ClientId,
    authority: `https://login.microsoftonline.com/${process.env.AZ_TenantId}`,
    clientCertificate: {
      thumbprintSha256: process.env.CERT_THUMBPRINT,
      privateKey: process.env.CERT_PRIVATE_KEY, // PEM string
    }
  }
};
```
4. Store the certificate private key as a PEM string in Azure Functions app settings (or use Azure Key Vault)
5. The scope for SharePoint client credentials is: `https://{tenant}.sharepoint.com/.default` — note the `.default` suffix is mandatory for client credentials flows

**Warning signs:**
- Token acquisition succeeds but SharePoint calls fail with 401/403
- `x-ms-diagnostics` header contains `3002002; reason=App principal does not exist`
- Works against Microsoft Graph but fails against SharePoint REST APIs

**Phase to address:**
Phase 1 (Auth & Infra Setup) — this must be the FIRST thing validated. If auth doesn't work, nothing else matters. Test with a simple `_api/web` call before building the rest of the pipeline.

**Confidence:** HIGH — verified via Microsoft official documentation (November 2025 update) and multiple community confirmations on SharePoint Stack Exchange and Microsoft Q&A.

---

### Pitfall 2: Client Credentials Scope Format is `https://{tenant}.sharepoint.com/.default` — NOT Individual Permissions

**What goes wrong:**
You use granular scopes like `https://{tenant}.sharepoint.com/AllSites.Read` (the format used in ROPC flows) with `acquireTokenByClientCredential()`, and get an `AADSTS70011: The provided request must include a 'scope' input parameter` error or a token with no permissions.

**Why it happens:**
Client credentials (app-only) flows use a fundamentally different scope format than delegated (user) flows. The legacy ROPC code uses: `scopes: [`${spUrl}/AllSites.Read`]` — this is a **delegated** scope format. Client credentials MUST use the `.default` scope, which requests all application permissions granted in the Entra ID portal: `scopes: ["https://{tenant}.sharepoint.com/.default"]`.

The MSAL Node docs confirm: **"With client credentials flows permissions need to be granted in the portal by a tenant administrator. The scope is always in the format `<resource>/.default`"** (Source: [MSAL Node request docs](https://github.com/azuread/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/docs/request.md), verified via Context7).

**How to avoid:**
1. Grant `Sites.Read.All` (or `Sites.FullControl.All`) as **Application** permissions (NOT delegated) in Azure Portal → App Registration → API Permissions
2. Get admin consent for those permissions
3. Use exactly: `scopes: ["https://{tenant}.sharepoint.com/.default"]`
4. Remove the old `SP_User` and `SP_Password` environment variables — they are no longer needed

**Warning signs:**
- `AADSTS70011` scope error during token acquisition
- Token succeeds but returns 0 permissions
- Scope string contains anything other than `/.default` for client credentials

**Phase to address:**
Phase 1 (Auth Setup) — validate scope format immediately.

**Confidence:** HIGH — Context7 MSAL Node docs + Microsoft Learn SharePoint app-only documentation.

---

### Pitfall 3: Module-Scope `new Date()` Returns Stale Time on Azure Functions Warm Starts

**What goes wrong:**
The legacy code has `let now = new Date()` at **module scope** (line 10 of `GenerateMetadata/index.ts`). On the first invocation (cold start), this captures the correct time. On subsequent invocations (warm starts), `now` retains the stale value from the first invocation — meaning monthly blob names use the wrong date, potentially overwriting the wrong monthly snapshot.

**Why it happens:**
Azure Functions reuses the same process across invocations (warm starts). Module-scope code runs once during cold start and is cached. Variables set at module scope persist their initial values. This is documented Azure Functions behavior.

The impact in the existing code: `Utils.generateMonthBlobName(now)` uses the stale `now`, so if the function cold-starts in January and warm-runs in February, it keeps writing to `2026y_m0_metadata` (January) instead of `2026y_m1_metadata` (February).

**How to avoid:**
1. **NEVER** compute date/time at module scope
2. Create `new Date()` inside the handler function:
```typescript
app.timer('generateMetadata', {
  schedule: '0 0 1 * * *',
  handler: async (timer, context) => {
    const now = new Date(); // Always fresh
    // ... rest of handler
  }
});
```
3. As a general rule: module scope should only contain configuration constants, type definitions, and client singletons (SDK clients, MSAL app instances). NEVER mutable state or time-dependent values.

**Warning signs:**
- Blob names stop changing month-to-month
- Monthly snapshots don't appear in storage
- `context.log` shows month values that don't match calendar month

**Phase to address:**
Phase 2 (Timer + Pipeline) — establish the pattern from the start with a code review checklist.

**Confidence:** HIGH — this is a known bug in the existing `az-funcs/` code (documented in PROJECT.md as a pain point). Well-documented Azure Functions behavior.

---

### Pitfall 4: Azure Functions v4 — `main` Field in package.json MUST Point to Compiled Output

**What goes wrong:**
You create a new Azure Functions v4 TypeScript project, register functions using `app.timer()`, everything works locally, but after deploying to Azure the portal shows **"No job functions found"** and the function never fires.

**Why it happens:**
In v4, functions are registered via code (not `function.json` files). The Azure Functions runtime discovers functions by loading the `main` entry point from `package.json`. If `main` points to the wrong path (e.g., `src/functions/*.ts` instead of `dist/src/functions/*.js`), the runtime silently finds zero functions. **The v3 model's `function.json` files are IGNORED** when any v4 function is registered.

Key requirements per Microsoft docs:
- `@azure/functions` v4 must be in **`dependencies`** (not `devDependencies`) — it's runtime code now
- `main` in `package.json` must point to the **compiled JS output**, e.g., `"main": "dist/src/functions/*.js"`
- The runtime requires `@azure/functions` v4.0.0+, Node.js 18+, Runtime v4.25+, Core Tools v4.0.5382+

**How to avoid:**
1. Set `"main": "dist/src/functions/*.js"` in `package.json` (match your `tsconfig.json` `outDir`)
2. Move `@azure/functions` from `devDependencies` to `dependencies`
3. Ensure `tsconfig.json` output matches the `main` glob pattern
4. Test locally with `npm run build && func start` — if functions appear locally, the `main` path is correct
5. After deploying, check Azure Portal → Function App → Functions — if empty, the `main` path is wrong

**Warning signs:**
- `func start` locally shows "No job functions found"
- Azure portal shows 0 functions after deployment
- Build succeeds but no functions are registered at runtime
- Any v3 `function.json` files in the project are being silently ignored

**Phase to address:**
Phase 1 (Project Scaffolding) — get the project structure right from day one. This is the #1 most common v4 migration issue based on Stack Overflow and Microsoft Q&A reports.

**Confidence:** HIGH — verified via Microsoft Learn migration guide, Context7 Azure Functions docs, and multiple confirmed Stack Overflow answers.

---

### Pitfall 5: xml2js Parser Options MUST Match Legacy Output Structure Exactly

**What goes wrong:**
You rewrite the metadata parser using xml2js with default options, the parsing succeeds, but the output JSON structure is subtly different from the legacy output. The frontend renders empty tables, missing properties, or crashes on undefined lookups — because it expects specific property paths like `obj['edmx:Edmx']['edmx:DataServices'][0]['Schema']`.

**Why it happens:**
xml2js has several options that dramatically affect output structure, all with specific defaults that have changed across versions:

| Option | Default | Impact if Changed |
|--------|---------|-------------------|
| `explicitArray` | `true` (since 0.2) | Every child is an array `[value]` even if single. Setting to `false` changes access patterns |
| `attrkey` | `$` (since 0.2) | Attributes accessed via `obj.$`. Was `@` in 0.1 |
| `charkey` | `_` (since 0.2) | Text content via `obj._`. Was `#` in 0.1 |
| `explicitRoot` | `true` | Root tag is included in output |
| `trim` | `false` | Whitespace in text nodes is preserved |
| `normalizeTags` | `false` | Tag names keep original case |

The legacy code uses `new Parser()` with **default options** (xml2js 0.4.x). The frontend's metadata JSON is shaped by these defaults. If you use a different xml2js version or change any options, the access paths change and the frontend breaks.

**How to avoid:**
1. Use `new Parser()` with **zero custom options** — exactly as the legacy code does
2. Pin xml2js version to `^0.4.23` (latest 0.4.x, same major as legacy `^0.4.19`)
3. **Snapshot test:** Parse the same XML input with old and new code, `JSON.stringify` both outputs, and `assert.deepStrictEqual()` them
4. Critical paths to verify:
   - `obj['edmx:Edmx']['edmx:DataServices'][0]['Schema']` — the colon-separated tag names with array wrappers
   - `schema.$.Namespace` — attribute access pattern
   - `func.$.IsBindable`, `func.$.IsComposable` — boolean string attributes
   - `type.NavigationProperty[i].$.ToRole` — nested attribute access

**Warning signs:**
- Frontend renders but shows 0 entities or 0 functions
- `Cannot read properties of undefined` errors in frontend console
- JSON file is different size than the legacy one
- Entity count doesn't match expected ~2,449

**Phase to address:**
Phase 2 (XML Parsing Pipeline) — must include a byte-for-byte comparison test against the known-good legacy output.

**Confidence:** HIGH — xml2js option documentation verified via npm (npmjs.com/package/xml2js), and the legacy code's dependency on default options confirmed by reading the source.

---

### Pitfall 6: v4 Blob Output Bindings Require `extraOutputs` Registration at Function Definition Time

**What goes wrong:**
In v2, blob output bindings were declarative in `function.json` and accessed via `context.bindings.latestJson = data`. In v4, you try to create an `output.storageBlob()` inside the handler or forget to register it in `extraOutputs`, and nothing gets written to blob storage — **silently**. No errors, no warnings, just empty blobs.

**Why it happens:**
In v4, output bindings must be:
1. **Declared** at function registration time using `output.storageBlob()` 
2. **Registered** in the function's `extraOutputs` array
3. **Set** via `context.extraOutputs.set(bindingObject, data)` inside the handler

Creating a new `output.storageBlob()` inside the handler (a common mistake) won't work because the runtime doesn't know about it. The binding must be the **same object reference** registered in `extraOutputs`.

**How to avoid:**
For declarative bindings (simple, fixed blob paths like `metadata.latest.json`):
```typescript
import { app, output, InvocationContext, Timer } from '@azure/functions';

const latestJsonBlob = output.storageBlob({
  path: 'api-files/metadata.latest.json',
  connection: 'AzureWebJobsStorage',
});

const latestXmlBlob = output.storageBlob({
  path: 'api-files/metadata.latest.xml',
  connection: 'AzureWebJobsStorage',
});

app.timer('generateMetadata', {
  schedule: '0 0 1 * * *',
  extraOutputs: [latestJsonBlob, latestXmlBlob],
  handler: async (timer: Timer, context: InvocationContext) => {
    // ... fetch and parse metadata ...
    context.extraOutputs.set(latestJsonBlob, JSON.stringify(parsed, null, 4));
    context.extraOutputs.set(latestXmlBlob, xmlContent);
  }
});
```

For **dynamic** blob paths (monthly snapshots with date-computed names), declarative bindings won't work. Use the `@azure/storage-blob` SDK programmatically instead:
```typescript
const containerClient = blobServiceClient.getContainerClient('api-files');
const blobName = `${year}y_m${month}_metadata.json`;
const blockBlobClient = containerClient.getBlockBlobClient(blobName);
await blockBlobClient.upload(content, Buffer.byteLength(content));
```

**Warning signs:**
- No errors in logs but blob content is empty or missing
- `context.bindings.xyz = data` pattern from v2 doesn't work in v4
- Output binding declared inside handler function body

**Phase to address:**
Phase 2 (Blob Upload Pipeline) — decide upfront which blobs use declarative bindings vs programmatic SDK.

**Confidence:** HIGH — verified via Context7 Azure Functions docs and Microsoft Learn blob output binding documentation.

---

### Pitfall 7: `azure-storage` v2 → `@azure/storage-blob` v12 API Is Completely Different

**What goes wrong:**
You try to incrementally migrate blob operations by updating import paths, but the entire API surface has changed. `createBlobService()` doesn't exist. `createBlockBlobFromText()` doesn't exist. Promisify patterns are unnecessary because the v12 SDK is natively async/await.

**Why it happens:**
The Azure Storage SDK was completely rewritten from v2 (`azure-storage`) to v12 (`@azure/storage-blob`). It's not a version upgrade — it's a different package with a different architecture:

| v2 (`azure-storage`) | v12 (`@azure/storage-blob`) |
|----------------------|---------------------------|
| `createBlobService(connString)` | `BlobServiceClient.fromConnectionString(connString)` |
| `blobService.createContainerIfNotExists(name, opts, callback)` | `containerClient.createIfNotExists(opts)` |
| `blobService.createBlockBlobFromText(container, blob, text, callback)` | `blockBlobClient.upload(text, text.length)` |
| Callback-based, requires `bluebird.promisify()` | Native Promises/async-await |
| Single monolithic package | Modular package per service |
| Connection string auth only | Connection string, SharedKey, DefaultAzureCredential, SAS |

**How to avoid:**
1. Don't try to incrementally migrate — rewrite blob operations from scratch using the v12 API
2. Use the official [migration guide](https://github.com/azure/azure-sdk-for-js/blob/main/sdk/storage/storage-blob/MigrationGuide.md)
3. Key pattern for this project:
```typescript
import { BlobServiceClient } from '@azure/storage-blob';

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AzureWebJobsStorage!
);
const containerClient = blobServiceClient.getContainerClient('api-files');
await containerClient.createIfNotExists({ access: 'blob' }); // public read

// Upload text content
const blockBlobClient = containerClient.getBlockBlobClient('metadata.latest.json');
await blockBlobClient.upload(jsonContent, Buffer.byteLength(jsonContent), {
  blobHTTPHeaders: { blobContentType: 'application/json' }
});
```
4. Remove `bluebird` entirely — no more promisify needed

**Warning signs:**
- `createBlobService is not a function` errors
- Import errors from `azure-storage` package
- Attempting to promisify v12 SDK methods (they're already async)

**Phase to address:**
Phase 2 (Blob Operations) — use v12 SDK from the start, don't try to bridge.

**Confidence:** HIGH — verified via Context7 `@azure/storage-blob` migration guide and README.

---

## Moderate Pitfalls

### Pitfall 8: lz-string `compressToUTF16` — Frontend Doesn't Use It Anymore

**What goes wrong:**
You spend time implementing the `compressToUTF16` compression pipeline and generating `metadata.latest.zip.json`, then discover that neither the old Vue frontend nor the new React frontend actually consumes it. Both frontends fetch `metadata.latest.json` (the uncompressed version) directly.

**Why it happens:**
The legacy backend generates three blob files: `.xml`, `.json`, and `.zip.json`. But the frontend (both old `web/` and new `app/`) only uses `metadata.latest.json`. The `.zip.json` file appears to be a legacy artifact that was never wired up in the frontend, or was abandoned early on. HTTP gzip compression from Azure Blob Storage makes the lz-string compression redundant for browser clients.

**How to avoid:**
1. Check if `metadata.latest.zip.json` is consumed anywhere before building the compression pipeline
2. Based on codebase analysis: **it is NOT consumed** — both `web/config/prod.env.js` and `app/src/lib/constants.ts` reference `metadata.latest.json` only
3. Still generate it for backward compatibility (cheap to add), but don't block on it and don't make it part of the critical path
4. Consider dropping it entirely in v2.0 to simplify

**Warning signs:**
- Building a complex decompression pipeline that nothing uses
- Wasting time debugging UTF-16 encoding issues for a dead code path

**Phase to address:**
Phase 2 (Pipeline) — decide early whether to keep `.zip.json` generation. Recommendation: skip it for MVP, add later if needed.

**Confidence:** HIGH — verified by searching both frontend codebases for `zip.json`, `decompressFromUTF16`, and `lz-string` — zero results in either frontend.

---

### Pitfall 9: Timer Trigger CRON Expression — 6-Part Format, Not 5-Part Unix Cron

**What goes wrong:**
You configure the timer with a standard 5-part Unix cron expression like `0 1 * * *` (daily at 1 AM), and get a runtime error: `The TimeSpan string '0 1 * * *' is not a valid TimeSpan`. Or worse, the 6-part format is used incorrectly and the function fires every second.

**Why it happens:**
Azure Functions timer triggers use **6-part NCRONTAB expressions** (second, minute, hour, day, month, day-of-week), not the standard 5-part Unix cron. The legacy `function.json` has `"schedule": "0 0 1 * * *"` which means "at second 0, minute 0, hour 1 (1:00 AM) every day."

| Position | Unix cron (5-part) | Azure Functions (6-part) |
|----------|-------------------|--------------------------|
| 1st | Minute | **Second** |
| 2nd | Hour | Minute |
| 3rd | Day | Hour |
| 4th | Month | Day |
| 5th | Day-of-week | Month |
| 6th | — | Day-of-week |

**How to avoid:**
```typescript
app.timer('generateMetadata', {
  schedule: '0 0 1 * * *', // 6-part: sec=0, min=0, hour=1, every day
  handler: async (timer, context) => { ... }
});
```
1. Always include 6 parts
2. Test locally — `func start` will validate the expression
3. The legacy schedule `0 0 1 * * *` means daily at 01:00:00 — preserve this

**Warning signs:**
- Timer error in function startup logs
- Function fires too frequently (e.g., every second if the first field is `*`)
- Function never fires (invalid expression silently rejected)

**Phase to address:**
Phase 2 (Timer Setup) — copy the exact schedule from `function.json` into the v4 code registration.

**Confidence:** HIGH — verified via Context7 Azure Functions timer trigger documentation.

---

### Pitfall 10: Zero-Indexed Months in Legacy Blob Names → 1-Indexed in New Code

**What goes wrong:**
The new code generates monthly blob names with 1-indexed months (e.g., `2026y_m2_metadata.json` for February), but the legacy code used `date.getMonth()` which is 0-indexed (e.g., `2026y_m1_metadata.json` for February). If the frontend or changelog feature ever references old blob names, the URL patterns won't match.

**Why it happens:**
JavaScript's `Date.getMonth()` returns 0–11. The legacy `Utils.generateMonthBlobName()` uses `date.getMonth()` directly, producing `2026y_m0_metadata` for January. PROJECT.md explicitly states the v2.0 goal is "monthly snapshots with 1-indexed months."

**How to avoid:**
1. New code uses `date.getMonth() + 1` for month blob names: `${year}y_m${month}_metadata`
2. Document the naming convention change clearly
3. If the future API Changelog feature needs to read old blobs, it must handle BOTH naming conventions
4. Consider: do any existing consumers rely on the zero-indexed naming? Verify before changing.

**Warning signs:**
- Blob not found (404) when accessing monthly snapshots
- Off-by-one in month when comparing old vs new snapshots

**Phase to address:**
Phase 2 (Blob Layout) — define the naming convention before writing any blob code. Test with January data to catch the boundary case.

**Confidence:** HIGH — confirmed by reading `az-funcs/src/utils.ts` line 34: `date.getMonth()` (0-indexed).

---

### Pitfall 11: Deployment — `func azure functionapp publish` Requires Build Step First

**What goes wrong:**
You run `func azure functionapp publish <app-name>` on a TypeScript project and it deploys successfully, but Azure shows 0 functions. The raw `.ts` files were uploaded instead of compiled `.js` files.

**Why it happens:**
The `func` CLI doesn't automatically run `npm run build` before deploying. For TypeScript projects, you must build first so the `dist/` directory contains compiled JS. The `main` field in `package.json` points to `dist/`, but if `dist/` doesn't exist or is stale, the runtime finds nothing.

**How to avoid:**
1. Always run `npm run build` before `func azure functionapp publish`
2. Add a npm script: `"deploy": "npm run build && func azure functionapp publish <app-name>"`
3. For GitHub Actions: build step must run BEFORE the deploy step
4. Include `.funcignore` to exclude `src/`, `node_modules/`, and other dev files from the deployment package
5. **GitHub Actions gotcha:** Since September 2024, `actions/upload-artifact@v4` excludes hidden files by default — the `.azurefunctions` folder is hidden and essential. Add `include-hidden-files: true` if using artifacts.

**Warning signs:**
- Deployment succeeds but 0 functions shown
- `.ts` files in Azure deployment instead of `.js`
- `dist/` directory missing or containing stale output

**Phase to address:**
Phase 3 (Deployment) — create deployment scripts/workflows early and test them.

**Confidence:** HIGH — verified via Microsoft Learn migration guide and multiple community reports.

---

### Pitfall 12: `context.done()` and `context.log.error()` Are v2 Patterns — v4 Uses Different APIs

**What goes wrong:**
You copy logging and completion patterns from the legacy code (`context.log.error()`, `context.done()`) and get runtime errors or warnings. The function appears to hang because it's waiting for `context.done()` which doesn't exist in v4.

**Why it happens:**
v4 changed the context API:

| v2 Pattern | v4 Replacement |
|-----------|----------------|
| `context.done()` | Just return (async functions complete automatically) |
| `context.done(err)` | Throw the error |
| `context.log.error(msg)` | `context.error(msg)` |
| `context.log.warn(msg)` | `context.warn(msg)` |
| `context.log.info(msg)` | `context.log(msg)` |
| `context.bindings.xyz = data` | `context.extraOutputs.set(binding, data)` |

**How to avoid:**
1. Don't copy v2 patterns — rewrite handlers from scratch following v4 patterns
2. Use async handler functions that return naturally
3. Error handling: wrap in try/catch, let unhandled errors propagate

**Warning signs:**
- `context.done is not a function` error
- `context.log.error is not a function` error
- Function hangs / times out after logic completes

**Phase to address:**
Phase 1 (Project Scaffolding) — establish the v4 handler pattern from the first function.

**Confidence:** HIGH — verified via Context7 Azure Functions v4 migration guide.

---

### Pitfall 13: Blob Public Access — Container Must Be `blob` Access Level for Frontend to Read

**What goes wrong:**
You create the `api-files` container but forget to set public access, or Azure's default security settings block public access. The frontend gets CORS or 403 errors when fetching `metadata.latest.json`.

**Why it happens:**
Azure Storage containers default to private access. The legacy code explicitly sets `publicAccessLevel: 'blob'`. In v12 SDK, the method is `containerClient.createIfNotExists({ access: 'blob' })`. Additionally, Azure Storage accounts created after 2023 may have "Allow Blob public access" disabled at the account level, which overrides container-level settings.

**How to avoid:**
1. Use `{ access: 'blob' }` when creating the container (allows public read for individual blobs, but not container listing)
2. Verify the Storage Account has "Allow Blob public access" enabled in Azure Portal → Storage Account → Configuration
3. Configure CORS on the Storage Account: Origin `*`, Methods `GET`, Headers `*`
4. Test by opening the blob URL directly in a browser: `https://{account}.blob.core.windows.net/api-files/metadata.latest.json`

**Warning signs:**
- Frontend shows loading state indefinitely
- Browser console shows 403 or CORS errors for blob URLs
- Blob URL returns XML error about public access

**Phase to address:**
Phase 2 (Blob Operations) — verify public access as part of the first successful blob upload test.

**Confidence:** HIGH — confirmed by reading legacy code and general Azure Storage documentation.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skip `.zip.json` generation | Saves 1-2 hours of lz-string work | None — no consumer exists | Always (it's unused) |
| Hardcode blob paths instead of config | Faster to implement | Harder to change if storage layout changes | MVP only — extract to constants early |
| Skip retry logic on SharePoint fetch | Simpler code | Transient failures cause missed daily snapshots | Never — retry is essential for daily timer |
| Single function file instead of module split | Less boilerplate | Parser/auth/storage logic all in one file | Never — split by responsibility |
| Use `AzureWebJobsStorage` for everything | No extra config | Tight coupling to Functions storage | Acceptable for this project (single storage account) |
| Skip setting `Content-Type` header on blobs | Works without it | Browsers may not parse JSON correctly | Never — always set `application/json` |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| SharePoint `$metadata` | No timeout on HTTP request; SharePoint occasionally hangs for 30+ seconds | Use `axios` with `timeout: 30000` and retry logic (3 attempts with exponential backoff) |
| SharePoint `$metadata` | `response.data` returns a parsed object instead of raw XML string | Ensure `responseType: 'text'` in axios config — SharePoint returns XML, and axios may auto-parse it |
| MSAL token cache | Creating new `ConfidentialClientApplication` on every invocation | Create MSAL client at **module scope** (singleton) so token cache persists across warm starts — tokens are cached automatically |
| Blob Storage Content-Type | Uploading JSON without content type header | Set `blobHTTPHeaders: { blobContentType: 'application/json' }` on upload — otherwise Azure defaults to `application/octet-stream` |
| Blob Storage CORS | Forgetting CORS configuration on the storage account | Add CORS rule: Origin `*`, Methods `GET`, Allowed Headers `*`, Max Age `86400` |
| Azure Functions environment | Using `process.env.X` without fallback | Use a helper that checks both `process.env.X` and `process.env.CUSTOMCONNSTR_X` (Azure custom connection strings) |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Parsing 4MB XML synchronously on function cold start | Function timeout (default 5 min on Consumption plan) | xml2js is async by design — don't wrap in sync; ensure the pipeline is fully async/await | When XML grows beyond ~10MB or function timeout is set below 2 minutes |
| `JSON.stringify(parsed, null, 4)` on 4MB object | Produces ~12MB pretty-printed JSON; slow to upload | Use `JSON.stringify(parsed)` (no indentation) for blob storage; save ~8MB per upload | Already a pain point — 4x size for readability nobody uses |
| Creating new `BlobServiceClient` on every invocation | Connection overhead on each function run | Create at module scope (singleton) — connection pooling persists across warm starts | On frequent invocations (shouldn't matter for daily timer, but good practice) |
| Uploading blobs sequentially instead of in parallel | Total time = sum of all uploads | Use `Promise.all()` for independent uploads (latest.json, latest.xml, monthly.json, monthly.xml) | When upload count exceeds 4-5 blobs |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Storing certificate private key in code or committed config | Certificate compromised → full SharePoint access | Store in Azure Functions App Settings or Key Vault; never commit to git |
| Using `clientSecret` for SharePoint REST API calls | 401/403 errors that seem inexplicable | Use certificate-based auth only (SharePoint enforces this) |
| Leaving `SP_User`/`SP_Password` in environment | Unused credentials lingering in config; ROPC could be re-enabled accidentally | Remove user credentials entirely from app settings |
| Container access level `container` instead of `blob` | Anyone can list ALL blobs in the container | Use `blob` access level — allows reading individual blobs by URL but not listing |
| Not granting admin consent for application permissions | Token works but has no permissions; silent failure | Verify admin consent in Azure Portal → App Registration → API Permissions (green checkmarks) |

## "Looks Done But Isn't" Checklist

- [ ] **Auth:** Token acquired ≠ SharePoint accepts it — test with an actual `_api/web` GET request, not just token acquisition
- [ ] **Blob upload:** Upload succeeds ≠ frontend can read it — test the public URL in a browser (CORS + public access)
- [ ] **XML parsing:** Parser runs without errors ≠ output matches legacy format — run a snapshot comparison test
- [ ] **Timer trigger:** Function registered ≠ timer fires — check Azure Portal → Function → Monitor for actual invocations
- [ ] **Monthly snapshots:** Blob written ≠ correct filename — verify month is 1-indexed, not 0-indexed
- [ ] **Deployment:** Deploy succeeds ≠ functions discovered — check Azure Portal → Functions list (common v4 issue)
- [ ] **Content-Type:** Blob exists ≠ browser parses it correctly — verify `Content-Type: application/json` in blob properties
- [ ] **Environment vars:** Works locally ≠ works in Azure — verify all `local.settings.json` values are also in Azure App Settings (minus `SP_User`/`SP_Password`, plus certificate config)

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Certificate vs secret auth failure | LOW | Generate certificate, upload to Entra ID, update MSAL config — no code architecture change |
| Wrong scope format (.default) | LOW | Change one string literal — `scopes: ["https://{tenant}.sharepoint.com/.default"]` |
| Stale module-scope Date | LOW | Move `new Date()` into handler — 1-line fix |
| Wrong `main` path in package.json | LOW | Fix the glob pattern, redeploy — no code change needed |
| xml2js output structure mismatch | HIGH | Must identify which parser options produce the legacy output; potentially requires deep debugging of every access path in the 302-line parser file |
| Blob output binding not working | MEDIUM | Switch between declarative binding and programmatic SDK approach — may require refactoring handler |
| Monthly blob name format wrong | LOW | Fix the month calculation, but old incorrectly-named blobs remain in storage |
| Deployment discovers 0 functions | LOW | Fix `main` in package.json, rebuild, redeploy |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Certificate-only auth (Pitfall 1) | Phase 1 — Auth Setup | Successfully call `_api/web` with client credentials token |
| Scope format `.default` (Pitfall 2) | Phase 1 — Auth Setup | Token contains expected permissions (decode JWT at jwt.ms) |
| Module-scope Date stale (Pitfall 3) | Phase 2 — Timer Handler | `new Date()` is inside handler body, not at module scope |
| `main` field wrong path (Pitfall 4) | Phase 1 — Scaffolding | `func start` discovers and lists the function locally |
| xml2js output structure (Pitfall 5) | Phase 2 — Parser | Snapshot test passes: new output === legacy output for same input |
| Blob binding registration (Pitfall 6) | Phase 2 — Blob Upload | Blob appears in storage with correct content after test run |
| azure-storage → storage-blob (Pitfall 7) | Phase 2 — Blob Upload | All blob operations use `@azure/storage-blob` v12 API |
| lz-string unused (Pitfall 8) | Phase 2 — Pipeline | Decision documented; skip or include `.zip.json` |
| CRON 6-part format (Pitfall 9) | Phase 2 — Timer | Timer fires at expected time (check Monitor tab) |
| Month indexing change (Pitfall 10) | Phase 2 — Blob Layout | February snapshot named `2026y_m2_metadata` not `2026y_m1_metadata` |
| TypeScript build before deploy (Pitfall 11) | Phase 3 — Deployment | Deploy script includes `npm run build` step; functions appear in portal |
| v2 context API patterns (Pitfall 12) | Phase 1 — Scaffolding | No `context.done()`, `context.log.error()`, or `context.bindings` in codebase |
| Blob public access (Pitfall 13) | Phase 2 — Blob Upload | Blob URL accessible from browser without authentication |

## Sources

- [Microsoft Learn — Granting access via Entra ID App-Only](https://learn.microsoft.com/en-us/sharepoint/dev/solution-guidance/security-apponly-azuread) — Official docs confirming certificate-only auth requirement (HIGH confidence)
- [Microsoft Learn — Migrate to v4 Node.js model](https://learn.microsoft.com/en-us/azure/azure-functions/functions-node-upgrade-v4) — Official v4 migration guide (HIGH confidence)
- [Microsoft Learn — Timer trigger for Azure Functions](https://learn.microsoft.com/en-us/azure/azure-functions/functions-bindings-timer) — NCRONTAB format, verified via Context7 (HIGH confidence)
- [Microsoft Learn — Blob storage output binding](https://learn.microsoft.com/en-us/azure/azure-functions/functions-bindings-storage-blob-output) — v4 extraOutputs pattern (HIGH confidence)
- [Context7 — MSAL Node ConfidentialClientApplication](https://github.com/azuread/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/docs/request.md) — Client credentials scope `.default` requirement (HIGH confidence)
- [Context7 — @azure/storage-blob Migration Guide](https://github.com/azure/azure-sdk-for-js/blob/main/sdk/storage/storage-blob/MigrationGuide.md) — v2 to v12 API changes (HIGH confidence)
- [npm — xml2js options documentation](https://www.npmjs.com/package/xml2js) — Parser options and version defaults (HIGH confidence)
- [Microsoft Learn — Azure Functions runtime versions](https://learn.microsoft.com/en-us/azure/azure-functions/functions-versions) — Node.js 20/22 support dates (HIGH confidence)
- [Microsoft TechCommunity — Sites.Selected for SPO](https://techcommunity.microsoft.com/blog/spblog/develop-applications-that-use-sites-selected-permissions-for-spo-sites-/3790476) — Certificate requirement for SharePoint APIs (HIGH confidence)
- [Stack Overflow — Azure Functions v4 no functions found after deploy](https://stackoverflow.com/questions/75994451/azure-function-app-v4-node-js-no-functions-found-after-zip-deployment) — Common deployment issue (MEDIUM confidence)
- [GitHub Actions — upload-artifact hidden files exclusion](https://stackoverflow.com/questions/78999440/github-actions-deployment-of-azure-functions-stopped-working) — `.azurefunctions` folder issue (MEDIUM confidence)
- Legacy codebase: `az-funcs/` directory — all source files read directly (HIGH confidence)

---
*Pitfalls research for: Azure Functions Backend Rewrite (v2.0)*
*Researched: 2026-02-22*
