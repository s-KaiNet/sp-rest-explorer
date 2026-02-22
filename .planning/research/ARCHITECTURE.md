# Architecture Research

**Domain:** Azure Functions v4 backend — SharePoint metadata fetch/parse/upload pipeline
**Researched:** 2026-02-22
**Confidence:** HIGH

## Verdict: Single Timer Function with Pipeline Stages, @azure/storage-blob for All Blob Ops

The v4 programming model replaces function.json bindings with code-first registration via `app.timer()`. For this project, **use @azure/storage-blob SDK directly for all blob uploads** instead of declarative output bindings. Rationale: the blob names are dynamic (date-based monthly snapshots like `2026y_m2_metadata.json`) — output bindings require the path to be known at configuration time, but our blob names are computed at runtime from the current date. The SDK approach is cleaner, more explicit, and avoids the `output.storageBlob()` + `context.extraOutputs.set()` ceremony that doesn't support dynamic paths well.

**Module system: CommonJS.** The `@azure/functions` v4 npm package only publishes a CommonJS module (confirmed: [GitHub issue #287](https://github.com/Azure/azure-functions-nodejs-library/issues/287) — ESM support not yet shipped). TypeScript compiles to CommonJS via `"module": "commonjs"` in tsconfig. This is the standard, well-tested path.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    AZURE FUNCTIONS v4 RUNTIME                           │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Timer Trigger (daily 1:00 AM UTC — CRON: "0 0 1 * * *")        │  │
│  │                                                                   │  │
│  │  app.timer("generateMetadata", { schedule, handler })             │  │
│  └────────────────────────┬──────────────────────────────────────────┘  │
│                           │                                             │
│  ┌────────────────────────▼──────────────────────────────────────────┐  │
│  │                    PIPELINE STAGES                                 │  │
│  │                                                                   │  │
│  │  1. AUTH ──► 2. FETCH ──► 3. PARSE ──► 4. COMPRESS ──► 5. UPLOAD │  │
│  │                                                                   │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐  ┌──────┐│  │
│  │  │  MSAL    │  │  Axios   │  │  xml2js  │  │lz-string│  │Blob  ││  │
│  │  │  client  │→ │  HTTP    │→ │  parse + │→ │compress │→ │SDK   ││  │
│  │  │  creds   │  │  + retry │  │  enrich  │  │to UTF16 │  │upload││  │
│  │  └──────────┘  └──────────┘  └──────────┘  └─────────┘  └──────┘│  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    SHARED MODULES                                 │   │
│  │                                                                   │   │
│  │  config.ts (env vars)    │  types/ (interfaces)                   │   │
│  │  logger.ts (context.log) │  blob-naming.ts (path generation)      │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└──────────────────┬──────────────────────────────────────────────────────┘
                   │ HTTPS (upload)
                   ▼
        ┌──────────────────────┐
        │  Azure Blob Storage  │
        │                      │
        │  Container: api-files│
        │  ├─ metadata.latest  │
        │  │  ├─ .xml          │
        │  │  ├─ .json         │
        │  │  └─ .zip.json     │
        │  └─ 2026y_m2_metadata│
        │     ├─ .xml          │
        │     ├─ .json         │
        │     └─ .zip.json     │
        └──────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|----------------|-------------------|
| **Timer Trigger** | Entry point. Registers daily schedule. Orchestrates pipeline stages sequentially. Handles top-level error logging. | Pipeline stages (calls in sequence) |
| **Auth (MSAL)** | Acquires OAuth token via client credentials flow. Caches token for reuse within the same invocation. | Azure AD login endpoint |
| **Fetch (Axios)** | HTTP GET to SharePoint `$metadata` endpoint with Bearer token. Retry logic and timeout. | SharePoint Online |
| **Parse (xml2js)** | Converts XML string → Metadata JSON object. Extracts associations, entities, complex types, functions. Populates collection objects and entity methods. | None (pure transformation) |
| **Compress (lz-string)** | `compressToUTF16()` on the JSON string for the `.zip.json` blob. | None (pure transformation) |
| **Upload (Blob SDK)** | Creates container if missing. Uploads 6 blobs: 3 latest + 3 monthly snapshot. Sets public access. | Azure Blob Storage |
| **Config** | Reads environment variables with validation. Single source of truth for all settings. | `process.env` |
| **Blob Naming** | Generates month-based blob paths with 1-indexed months (fixing legacy 0-indexed bug). | None (pure functions) |

---

## Recommended Project Structure

```
functions/                          # NEW directory (separate from az-funcs/)
├── src/
│   ├── functions/
│   │   └── generateMetadata.ts     # Timer trigger registration + orchestrator
│   ├── stages/
│   │   ├── auth.ts                 # MSAL client credentials token acquisition
│   │   ├── fetch.ts                # SharePoint $metadata XML fetch with retry
│   │   ├── parse.ts                # XML → Metadata JSON transformation
│   │   ├── compress.ts             # lz-string compression
│   │   └── upload.ts               # @azure/storage-blob upload operations
│   ├── lib/
│   │   ├── config.ts               # Environment variable access + validation
│   │   ├── blob-naming.ts          # Blob path generation (latest + monthly)
│   │   └── logger.ts               # Logger wrapper (InvocationContext.log)
│   └── types/
│       ├── metadata.ts             # Metadata, EntityType, FunctionImport, etc.
│       ├── association.ts          # Association (internal parsing type)
│       └── index.ts                # Barrel export
├── host.json                       # Functions runtime config + extension bundle
├── local.settings.json             # Local dev environment variables (gitignored)
├── local.sample.settings.json      # Template for local.settings.json
├── package.json                    # Dependencies + main entry + scripts
├── tsconfig.json                   # TypeScript config (CommonJS output)
└── .funcignore                     # Exclude src/, node_modules from deployment
```

### Structure Rationale

- **`src/functions/`**: Azure Functions v4 convention. The `main` field in package.json points to `dist/src/functions/*.js` to auto-register all functions. Only one file here (`generateMetadata.ts`) since we have a single timer function.
- **`src/stages/`**: Each pipeline stage is a separate module with a single responsibility. Stages are pure-ish functions (auth depends on external service, but the interface is clean). Testable in isolation.
- **`src/lib/`**: Shared utilities. Config reads env vars once. Blob naming generates paths. Logger wraps InvocationContext for consistent log formatting.
- **`src/types/`**: TypeScript interfaces shared across stages. These types define the contract between parse output and upload input — they are the same types the frontend consumes.
- **No `src/index.ts` barrel**: Each stage imports what it needs directly. Barrel files add complexity with no benefit in a 5-file pipeline.

---

## Azure Functions v4 Timer Registration (Code-First)

**Source:** Microsoft Learn — Azure Functions Node.js developer guide (HIGH confidence — Context7 verified)

In v4, there is NO `function.json`. The function is registered in code:

```typescript
// src/functions/generateMetadata.ts
import { app, InvocationContext, Timer } from "@azure/functions";
import { acquireToken } from "../stages/auth";
import { fetchMetadataXml } from "../stages/fetch";
import { parseMetadata } from "../stages/parse";
import { compressJson } from "../stages/compress";
import { uploadAllBlobs } from "../stages/upload";
import { getConfig } from "../lib/config";

async function generateMetadata(
  timer: Timer,
  context: InvocationContext
): Promise<void> {
  context.log("GenerateMetadata: started");

  // Fresh Date per invocation — fixes legacy warm-start stale date bug
  const now = new Date();

  const config = getConfig();

  // Stage 1: Auth
  const token = await acquireToken(config, context);

  // Stage 2: Fetch XML
  const xml = await fetchMetadataXml(config.spUrl, token, context);

  // Stage 3: Parse XML → JSON
  const metadata = await parseMetadata(xml, context);
  const jsonStr = JSON.stringify(metadata, null, 2);

  // Stage 4: Compress
  const compressedJson = compressJson(jsonStr);

  // Stage 5: Upload
  await uploadAllBlobs(config, now, xml, jsonStr, compressedJson, context);

  context.log("GenerateMetadata: completed successfully");
}

app.timer("generateMetadata", {
  schedule: "0 0 1 * * *",   // Daily at 1:00 AM UTC
  handler: generateMetadata,
});
```

### Key v4 Details

| Aspect | v2 (Legacy `az-funcs/`) | v4 (New `functions/`) |
|--------|-------------------------|------------------------|
| Function config | `function.json` per function | `app.timer()` in code |
| Handler signature | `export = function(context, timer)` | `async (timer, context) => void` |
| Parameter order | `context` first | `timer` first, `context` second |
| Completion signal | `context.done()` | Return/throw from async function |
| Logging | `context.log()` | `context.log()` (unchanged) |
| Output bindings | `context.bindings.latestJson = data` | `output.storageBlob()` + `context.extraOutputs.set()` OR SDK direct |
| Module format | CommonJS (`export =`) | CommonJS (`import/export` compiled to CJS) |
| Entry point | `function.json` → `scriptFile` | `package.json` → `"main": "dist/src/functions/*.js"` |

---

## Pipeline Stage Details

### Stage 1: Auth — Client Credentials via @azure/msal-node

**Source:** MSAL.js official docs (HIGH confidence — Context7 verified)

The legacy code uses `acquireTokenByUsernamePassword` (ROPC flow) which is deprecated by Microsoft, doesn't support MFA, and requires a user account. Switch to `acquireTokenByClientCredential` (app-only, no user context).

```typescript
// src/stages/auth.ts
import {
  ConfidentialClientApplication,
  AuthenticationResult,
} from "@azure/msal-node";
import { AppConfig } from "../lib/config";
import { InvocationContext } from "@azure/functions";

let msalClient: ConfidentialClientApplication | null = null;

export async function acquireToken(
  config: AppConfig,
  context: InvocationContext
): Promise<string> {
  // Reuse MSAL client across warm starts (safe — config is immutable)
  if (!msalClient) {
    msalClient = new ConfidentialClientApplication({
      auth: {
        clientId: config.clientId,
        authority: `https://login.microsoftonline.com/${config.tenantId}`,
        clientSecret: config.clientSecret,
      },
    });
  }

  context.log("Auth: acquiring token via client credentials");

  const result: AuthenticationResult | null =
    await msalClient.acquireTokenByClientCredential({
      // Client credentials MUST use .default scope
      scopes: [`${config.spUrl}/.default`],
    });

  if (!result?.accessToken) {
    throw new Error("Auth: failed to acquire access token");
  }

  context.log("Auth: token acquired");
  return result.accessToken;
}
```

**Critical detail — `.default` scope:** Client credentials flow requires `<resource>/.default` as the scope. The legacy code used `${spUrl}/AllSites.Read` which worked with ROPC but will NOT work with client credentials. The `.default` scope requests all permissions that the app registration has been granted via admin consent.

**MSAL client reuse:** The `ConfidentialClientApplication` instance is module-scoped. Azure Functions reuses the same Node.js process across invocations (warm starts). The MSAL client has built-in token caching — it will return a cached token if still valid, avoiding unnecessary Azure AD calls.

**Confidence:** HIGH — `acquireTokenByClientCredential` API confirmed via Context7 MSAL docs. `.default` scope requirement confirmed.

### Stage 2: Fetch — Axios with Retry and Timeout

```typescript
// src/stages/fetch.ts
import axios, { AxiosError } from "axios";
import { InvocationContext } from "@azure/functions";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;
const TIMEOUT_MS = 60000; // 60 seconds

export async function fetchMetadataXml(
  spUrl: string,
  token: string,
  context: InvocationContext
): Promise<string> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      context.log(`Fetch: attempt ${attempt}/${MAX_RETRIES}`);

      const response = await axios.get(`${spUrl}/_api/$metadata`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: TIMEOUT_MS,
        responseType: "text",
      });

      context.log(`Fetch: received ${response.data.length} bytes`);
      return response.data;
    } catch (error) {
      const isRetryable =
        error instanceof AxiosError &&
        (error.code === "ECONNRESET" ||
          error.code === "ETIMEDOUT" ||
          error.code === "ECONNABORTED" ||
          (error.response?.status ?? 0) >= 500);

      if (attempt < MAX_RETRIES && isRetryable) {
        context.log(
          `Fetch: retryable error (${(error as AxiosError).code}), waiting ${RETRY_DELAY_MS}ms`
        );
        await delay(RETRY_DELAY_MS);
        continue;
      }

      throw new Error(
        `Fetch: failed after ${attempt} attempts: ${(error as Error).message}`
      );
    }
  }

  throw new Error("Fetch: unreachable");
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

**Addresses legacy pain point:** The old code had zero retry/timeout logic. SharePoint metadata endpoint can be slow (~5-20 seconds) and occasionally returns 503 during maintenance windows.

### Stage 3: Parse — xml2js Transformation

The parser is the most complex stage and should be ported from the existing `metadataParser.ts` with these improvements:

1. **Use `xml2js.parseStringPromise()`** instead of bluebird promisify (xml2js has native Promise support)
2. **Keep the same output shape** — the frontend depends on the Metadata JSON format
3. **Extract as functional code** — replace class with module functions
4. **Preserve all existing logic**: association extraction, entity/complex type extraction, function import extraction, Collection object population, entity method population, alias mapping, Internal API filtering

```typescript
// src/stages/parse.ts (simplified interface)
import { parseStringPromise } from "xml2js";
import { Metadata } from "../types/metadata";
import { InvocationContext } from "@azure/functions";

export async function parseMetadata(
  xml: string,
  context: InvocationContext
): Promise<Metadata> {
  context.log("Parse: starting XML → JSON transformation");

  const obj = await parseStringPromise(xml);
  const schemas = obj["edmx:Edmx"]["edmx:DataServices"][0]["Schema"];

  // Port existing extraction logic:
  const associations = extractAssociations(schemas);
  const entities = extractEntities(schemas, associations);
  const functions = extractFunctions(schemas);

  const metadata: Metadata = {
    entities: Object.fromEntries(entities),
    functions: Object.fromEntries(
      functions.map((f) => [f.id, f])
    ),
  };

  populateCollectionObjects(metadata);
  populateEntityMethods(metadata);

  const entityCount = Object.keys(metadata.entities).length;
  const funcCount = Object.keys(metadata.functions).length;
  context.log(`Parse: completed — ${entityCount} entities, ${funcCount} functions`);

  return metadata;
}
```

**Key decisions for the port:**
- **Same output JSON shape**: The frontend's `Metadata`, `EntityType`, `FunctionImport`, `Property`, `NavigationProperty`, and `Parameter` interfaces must match exactly.
- **Functions as modules, not classes**: The `MetadataParser` class had instance state (associations, entities, functions maps) that was only used during `parseMetadata()`. Convert to module-level functions that take parameters and return values.
- **bluebird removal**: xml2js v0.5+ ships `parseStringPromise()` natively. No need for bluebird promisify.

### Stage 4: Compress — lz-string

```typescript
// src/stages/compress.ts
import { compressToUTF16 } from "lz-string";

export function compressJson(jsonStr: string): string {
  return compressToUTF16(jsonStr);
}
```

Trivial stage. Keeping it separate for pipeline clarity and testability.

### Stage 5: Upload — @azure/storage-blob v12

**Source:** Azure SDK for JS official docs (HIGH confidence — Context7 verified)

```typescript
// src/stages/upload.ts
import {
  BlobServiceClient,
  ContainerClient,
} from "@azure/storage-blob";
import { generateBlobNames } from "../lib/blob-naming";
import { AppConfig } from "../lib/config";
import { InvocationContext } from "@azure/functions";

export async function uploadAllBlobs(
  config: AppConfig,
  now: Date,
  xml: string,
  json: string,
  compressedJson: string,
  context: InvocationContext
): Promise<void> {
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    config.storageConnectionString
  );

  const containerClient = blobServiceClient.getContainerClient("api-files");
  await containerClient.createIfNotExists({ access: "blob" });

  const blobNames = generateBlobNames(now);

  // Upload latest blobs (overwritten daily)
  await uploadBlob(containerClient, "metadata.latest.xml", xml, context);
  await uploadBlob(containerClient, "metadata.latest.json", json, context);
  await uploadBlob(containerClient, "metadata.latest.zip.json", compressedJson, context);

  // Upload monthly snapshot blobs
  await uploadBlob(containerClient, `${blobNames.monthly}.xml`, xml, context);
  await uploadBlob(containerClient, `${blobNames.monthly}.json`, json, context);
  await uploadBlob(containerClient, `${blobNames.monthly}.zip.json`, compressedJson, context);

  context.log(`Upload: 6 blobs uploaded to api-files container`);
}

async function uploadBlob(
  container: ContainerClient,
  blobName: string,
  content: string,
  context: InvocationContext
): Promise<void> {
  const blockBlobClient = container.getBlockBlobClient(blobName);
  await blockBlobClient.upload(content, Buffer.byteLength(content));
  context.log(`Upload: ${blobName} (${Buffer.byteLength(content)} bytes)`);
}
```

**Why @azure/storage-blob SDK instead of output bindings:**

| Concern | Output Bindings (`output.storageBlob()`) | SDK Direct (`@azure/storage-blob`) |
|---------|-------------------------------------------|--------------------------------------|
| Dynamic blob names | ❌ Path is fixed at registration time. Binding expressions like `{DateTime}` exist but are limited and don't support 1-indexed months. | ✅ Full control — compute any blob name at runtime |
| Multiple blobs per invocation | ❌ Need one output binding per blob, all declared upfront. 6 bindings = cluttered registration. | ✅ Loop over names, upload dynamically |
| Container creation | ❌ Bindings don't create containers. Need separate SDK call anyway. | ✅ `createIfNotExists()` built in |
| Public access level | ❌ Can't set container access level via bindings | ✅ `{ access: "blob" }` on create |
| Error handling per blob | ❌ Binding errors are opaque | ✅ Try/catch per upload with specific error info |
| Content-Type header | ❌ Limited control | ✅ Full `BlobHTTPHeaders` control |
| Connection | Uses `AzureWebJobsStorage` app setting via `connection` property | Uses `AzureWebJobsStorage` via `BlobServiceClient.fromConnectionString()` |

**Verdict:** SDK is clearly better for this use case. Output bindings are designed for simple, fixed-path single-blob writes. Our use case (6 dynamic blobs, container creation, public access) maps cleanly to the SDK.

**Confidence:** HIGH — `BlobServiceClient.fromConnectionString()` and `ContainerClient` APIs confirmed via Context7 Azure SDK docs.

---

## Blob Naming — Fixing the 0-Indexed Month Bug

The legacy code uses `date.getMonth()` which returns 0-11. The new code uses 1-indexed months:

```typescript
// src/lib/blob-naming.ts
export interface BlobNames {
  monthly: string; // e.g., "2026y_m2_metadata"
}

export function generateBlobNames(date: Date): BlobNames {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // FIX: 1-indexed (January = 1)

  return {
    monthly: `${year}y_m${month}_metadata`,
  };
}
```

**Note:** The legacy code also generated weekly snapshots (`2026y_w8_metadata`). Per PROJECT.md, the new design drops weekly snapshots — only monthly + latest.

---

## Configuration Management

```typescript
// src/lib/config.ts
export interface AppConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  spUrl: string;
  storageConnectionString: string;
}

export function getConfig(): AppConfig {
  const config: AppConfig = {
    clientId: requireEnv("AZ_ClientId"),
    clientSecret: requireEnv("AZ_ClientSecret"),
    tenantId: requireEnv("AZ_TenantId"),
    spUrl: requireEnv("SP_Url"),
    storageConnectionString: requireEnv("AzureWebJobsStorage"),
  };

  return config;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
```

**Changes from legacy:**
- **Removed:** `SP_User` and `SP_Password` (not needed with client credentials flow)
- **Removed:** `CUSTOMCONNSTR_` fallback (unnecessary Azure complexity)
- **Added:** Fail-fast validation — throw immediately if any env var is missing

### local.sample.settings.json

```json
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "AZ_ClientId": "<app-registration-client-id>",
    "AZ_ClientSecret": "<app-registration-client-secret>",
    "AZ_TenantId": "<azure-ad-tenant-id>",
    "SP_Url": "https://<tenant>.sharepoint.com"
  }
}
```

---

## host.json Configuration

```json
{
  "version": "2.0",
  "extensionBundle": {
    "id": "Microsoft.Azure.Functions.ExtensionBundle",
    "version": "[4.0.0, 5.0.0)"
  },
  "logging": {
    "logLevel": {
      "default": "Information",
      "Function.generateMetadata": "Information"
    }
  }
}
```

**Extension bundles:** Required even though we don't use declarative bindings — the timer trigger extension is provided via the bundle. Version range `[4.0.0, 5.0.0)` is the current recommended range (confirmed via Microsoft Learn host.json reference).

**Confidence:** HIGH — host.json schema confirmed via Microsoft Learn docs.

---

## package.json Configuration

```json
{
  "name": "sp-rest-explorer-functions",
  "version": "2.0.0",
  "main": "dist/src/functions/*.js",
  "scripts": {
    "build": "tsc",
    "watch": "tsc -w",
    "start": "npm run build && func start",
    "deploy": "npm run build && func azure functionapp publish <app-name>"
  },
  "dependencies": {
    "@azure/functions": "^4.6.0",
    "@azure/msal-node": "^2.16.0",
    "@azure/storage-blob": "^12.26.0",
    "axios": "^1.7.0",
    "lz-string": "^1.5.0",
    "xml2js": "^0.6.0"
  },
  "devDependencies": {
    "@types/lz-string": "^1.5.0",
    "@types/xml2js": "^0.4.14",
    "typescript": "^5.6.0"
  }
}
```

**Key package.json detail — `"main"` field:** In v4, the Functions runtime uses the `main` field glob to discover and register functions. The glob `dist/src/functions/*.js` matches all compiled function files in the output directory. This replaces the per-function `function.json` discovery mechanism from v2.

**`@azure/functions` is a runtime dependency:** In v4, `@azure/functions` is used at runtime for `app.timer()` registration and the `InvocationContext` type. In v2, it was only a dev dependency (used for types).

---

## tsconfig.json Configuration

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "moduleResolution": "node",
    "outDir": "dist",
    "rootDir": ".",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": false,
    "sourceMap": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

**Module system decision — CommonJS:**
- `@azure/functions` v4 only ships CommonJS (confirmed via [GitHub issue #287](https://github.com/Azure/azure-functions-nodejs-library/issues/287))
- Azure Functions Node.js worker loads modules via `require()` (CommonJS)
- ESM support is technically possible with workarounds (tsup bundler, `.mjs` extensions) but adds complexity for zero benefit
- CommonJS is the recommended, battle-tested path for Azure Functions v4 TypeScript

**`target: ES2022`:** Azure Functions v4 requires Node.js 18+ (recommended: 20 or 22). ES2022 is fully supported and gives access to modern JS features (top-level await in modules, `Array.at()`, `Object.hasOwn()`).

**`strict: true`:** Upgrade from legacy code's `noImplicitAny: false`. The new codebase should be fully strict.

**Confidence:** HIGH — tsconfig patterns confirmed via Microsoft Learn Azure Functions Node.js guide + multiple verified blog posts.

---

## Data Flow

### Complete Pipeline Flow

```
Timer fires (daily 1:00 AM UTC)
    │
    ├─ 1. AUTH: MSAL client credentials → Azure AD
    │      └─ Returns: Bearer access token (string)
    │      └─ ~200-500ms (cached on warm start: ~1ms)
    │
    ├─ 2. FETCH: GET /_api/$metadata → SharePoint Online
    │      └─ Returns: XML string (~4MB)
    │      └─ ~5-20 seconds (retry up to 3x on failure)
    │
    ├─ 3. PARSE: xml2js → extract → enrich → Metadata
    │      └─ Returns: Metadata object + JSON string
    │      └─ ~1-3 seconds
    │
    ├─ 4. COMPRESS: lz-string compressToUTF16
    │      └─ Returns: compressed JSON string
    │      └─ ~500ms-1s
    │
    └─ 5. UPLOAD: 6 blobs to Azure Blob Storage
           ├─ createIfNotExists("api-files", { access: "blob" })
           ├─ metadata.latest.xml     ← raw XML
           ├─ metadata.latest.json    ← pretty JSON
           ├─ metadata.latest.zip.json ← lz-string compressed
           ├─ {year}y_m{month}_metadata.xml
           ├─ {year}y_m{month}_metadata.json
           └─ {year}y_m{month}_metadata.zip.json
           └─ ~2-5 seconds total
```

**Total execution time:** ~10-30 seconds typical. Well within Azure Functions default timeout (5 minutes for Consumption plan).

### Error Flow

```
Any stage throws
    │
    ├─ Error propagates to handler (async function)
    ├─ Azure Functions runtime catches unhandled rejection
    ├─ Logs error via context.log.error (if structured logging used)
    ├─ Function marked as failed in Azure portal
    └─ Timer retries on next scheduled run (no built-in retry for timer triggers)
```

**Note:** Timer triggers do NOT have automatic retry like queue triggers. If the function fails, it simply runs again at the next scheduled time. For this use case (daily metadata refresh), this is acceptable — missing one day's run means the data is 1 day stale, which is fine. If stronger retry is needed, wrap the pipeline in a try/catch with a manual delay-and-retry loop.

---

## Integration Points

### External Services

| Service | Protocol | Auth | Notes |
|---------|----------|------|-------|
| Azure AD (`login.microsoftonline.com`) | HTTPS | Client ID + Secret | Token acquisition. MSAL handles token caching. |
| SharePoint Online (`{tenant}.sharepoint.com`) | HTTPS | Bearer token | `/_api/$metadata` endpoint returns OData CSDL XML |
| Azure Blob Storage | HTTPS | Connection string | `AzureWebJobsStorage` app setting. Same storage account as Functions runtime uses. |

### New Components (to be created)

| Component | File | Type | Dependencies |
|-----------|------|------|-------------|
| Timer function | `src/functions/generateMetadata.ts` | Function registration | All stages |
| Auth stage | `src/stages/auth.ts` | Module | `@azure/msal-node`, config |
| Fetch stage | `src/stages/fetch.ts` | Module | `axios`, config |
| Parse stage | `src/stages/parse.ts` | Module | `xml2js`, types |
| Compress stage | `src/stages/compress.ts` | Module | `lz-string` |
| Upload stage | `src/stages/upload.ts` | Module | `@azure/storage-blob`, blob-naming, config |
| Config | `src/lib/config.ts` | Module | `process.env` |
| Blob naming | `src/lib/blob-naming.ts` | Module | None |
| Types | `src/types/*.ts` | Type definitions | None |

### Modified Components

**None.** The new `functions/` directory is entirely separate from `az-funcs/`. No existing files are modified.

### Frontend Integration Points

The frontend (`app/`) consumes blobs from Azure Blob Storage via HTTP fetch:
- `metadata.latest.json` — pretty-printed metadata JSON (~4MB)
- `metadata.latest.zip.json` — lz-string compressed metadata

**The blob URL format and JSON schema must remain identical.** The frontend's `services/api.ts` fetches from hardcoded blob URLs. As long as the new backend writes to the same container (`api-files`) with the same blob names (`metadata.latest.*`), the frontend requires zero changes.

---

## Patterns to Follow

### Pattern 1: Fresh Date per Invocation

**What:** Compute `new Date()` INSIDE the handler, not at module scope.

**Why:** Azure Functions reuses the same Node.js process across invocations (warm starts). Module-scope variables persist between invocations. The legacy code had `let now = new Date()` at module scope, which meant the date was stale after the first cold start.

```typescript
// ❌ LEGACY BUG (az-funcs/GenerateMetadata/index.ts line 10)
let now = new Date(); // Module scope — stale across warm starts!

// ✅ CORRECT
async function generateMetadata(timer: Timer, context: InvocationContext) {
  const now = new Date(); // Fresh per invocation
}
```

### Pattern 2: Module-Scoped MSAL Client (Safe Reuse)

**What:** Create the `ConfidentialClientApplication` once at module scope and reuse it across invocations.

**Why:** MSAL clients have built-in token caching. Creating a new client per invocation wastes the cache and forces a new Azure AD token request every time (~200-500ms). The client config (clientId, tenantId, clientSecret) is immutable from environment variables, so reuse is safe.

```typescript
// src/stages/auth.ts
let msalClient: ConfidentialClientApplication | null = null;

export async function acquireToken(config: AppConfig, context: InvocationContext) {
  if (!msalClient) {
    msalClient = new ConfidentialClientApplication({ ... });
  }
  // MSAL internally caches tokens and returns cached if still valid
  return msalClient.acquireTokenByClientCredential({ scopes: [...] });
}
```

### Pattern 3: Pipeline Stage Isolation

**What:** Each stage is a pure-ish function that takes input and returns output. No shared mutable state between stages.

**Why:** Makes each stage independently testable. Can mock the auth stage to test fetch, mock fetch to test parse, etc. The orchestrator (`generateMetadata.ts`) is the only place that knows about all stages.

```
acquireToken(config) → token
fetchMetadataXml(spUrl, token) → xml
parseMetadata(xml) → metadata
compressJson(jsonStr) → compressedJson
uploadAllBlobs(config, now, xml, jsonStr, compressedJson) → void
```

### Pattern 4: Fail-Fast Config Validation

**What:** Validate all environment variables at the start of each invocation, before any work begins.

**Why:** Better to fail immediately with "Missing AZ_ClientId" than to fail 20 seconds later after fetching metadata and parsing XML, with an opaque MSAL error.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Using Output Bindings for Dynamic Blob Names

**What:** Registering `output.storageBlob({ path: "api-files/{dynamicName}" })` and trying to set the blob name at runtime.

**Why bad:** Azure Functions v4 output bindings resolve the path at registration time, not at invocation time. Binding expressions like `{DateTime}` exist but don't support custom formats (e.g., 1-indexed months). For 6 blobs with computed names, you'd need 6 static output bindings — defeating the purpose.

**Instead:** Use `@azure/storage-blob` SDK directly. Full control, clear code, no binding magic.

### Anti-Pattern 2: Module-Scope Date

**What:** `let now = new Date()` outside the handler function.

**Why bad:** Azure Functions warm starts reuse the Node.js process. The date variable will be from the first cold start, potentially hours or days old. This was a real bug in the legacy code — monthly snapshots could be written with wrong month.

**Instead:** Always compute dates inside the handler.

### Anti-Pattern 3: Mixing v2 and v4 Patterns

**What:** Having both `function.json` files and `app.timer()` registrations in the same function app.

**Why bad:** Azure Functions v4 ignores ALL `function.json` files as soon as any v4 function is registered. This is an all-or-nothing migration.

**Instead:** The new `functions/` project is 100% v4. The old `az-funcs/` is preserved as reference but never deployed alongside.

### Anti-Pattern 4: ESM in Azure Functions

**What:** Using `"type": "module"` in package.json with `.mjs` extensions.

**Why bad:** The `@azure/functions` v4 package only ships CommonJS. While ESM can be made to work with bundlers (tsup) or workarounds, it adds complexity and fragility. The Azure Functions Node.js worker internally uses `require()` to load function modules.

**Instead:** Use CommonJS. TypeScript `import/export` syntax compiles cleanly to `require()`/`module.exports` via `"module": "commonjs"` in tsconfig.

---

## Build Order (Dependency Chain)

Each layer depends only on layers above it.

### Layer 1: Foundation (no dependencies)

1. **TypeScript interfaces** (`src/types/metadata.ts`, `src/types/association.ts`, `src/types/index.ts`)
   - Port from `az-funcs/src/interfaces/` — EntityType, FunctionImport, Property, NavigationProperty, Parameter, Metadata
   - Add Association (used internally by parser only)
   - These define the contract; everything else depends on them

2. **Config module** (`src/lib/config.ts`)
   - AppConfig interface + getConfig() + requireEnv()
   - No external dependencies

3. **Blob naming** (`src/lib/blob-naming.ts`)
   - generateBlobNames() — pure function, no dependencies

### Layer 2: Pipeline Stages (depends on Layer 1)

4. **Auth stage** (`src/stages/auth.ts`)
   - Depends on: `@azure/msal-node`, config types
   - Can be tested with mock Azure AD endpoint or MSAL test utilities

5. **Fetch stage** (`src/stages/fetch.ts`)
   - Depends on: `axios`
   - Can be tested with nock/msw HTTP mocks

6. **Parse stage** (`src/stages/parse.ts`)
   - Depends on: `xml2js`, types
   - The most complex stage. Port line-by-line from `az-funcs/src/metadataParser.ts`
   - Can be tested with fixture XML files
   - **Build this before anything else in the pipeline** — it's the core logic

7. **Compress stage** (`src/stages/compress.ts`)
   - Depends on: `lz-string`
   - Trivial — one function call

8. **Upload stage** (`src/stages/upload.ts`)
   - Depends on: `@azure/storage-blob`, config, blob-naming
   - Can be tested against Azurite (local storage emulator)

### Layer 3: Orchestration (depends on Layer 2)

9. **Timer function** (`src/functions/generateMetadata.ts`)
   - Depends on: all stages
   - Wires everything together
   - Requires Azure Functions runtime to test (or mock InvocationContext)

### Layer 4: Project Infrastructure

10. **Project files** (`package.json`, `tsconfig.json`, `host.json`, `.funcignore`, `local.sample.settings.json`)
    - These should be created FIRST so the project compiles, but they're "infrastructure" not "code"

### Suggested Implementation Sequence

```
1. Create project scaffold (package.json, tsconfig, host.json)     ← enables compilation
2. Port TypeScript interfaces from az-funcs/src/interfaces/         ← types first
3. Build config + blob-naming modules                               ← simple, enables testing
4. Port parse stage from az-funcs/src/metadataParser.ts             ← core logic, most complex
5. Build auth stage (client credentials)                            ← new code, MSAL API
6. Build fetch stage (axios + retry)                                ← new code, straightforward
7. Build compress stage                                             ← trivial
8. Build upload stage                                               ← @azure/storage-blob API
9. Wire orchestrator (timer function)                               ← connects all stages
10. Test end-to-end with local.settings.json + func start           ← integration test
```

**Why parse stage (#4) before auth/fetch (#5-6):** The parser is the most complex code and the most likely to have bugs during porting. It can be tested in isolation with saved XML fixture files — no Azure AD credentials or SharePoint access needed. Get the core logic right first, then build the surrounding infrastructure.

---

## Scalability Considerations

| Concern | Current | If Metadata Doubles | Notes |
|---------|---------|---------------------|-------|
| XML fetch size | ~4MB | ~8MB | axios handles. Increase timeout. |
| Parse time | ~1-3s | ~2-6s | Still well within 5min timeout |
| Compress time | ~0.5-1s | ~1-2s | lz-string is CPU-bound, not memory |
| Upload time | ~2-5s (6 blobs) | ~4-10s | Parallel uploads would help |
| Total execution | ~10-30s | ~20-60s | Consumption plan 5min timeout is plenty |
| Storage cost | ~6 blobs/month × ~4MB each ≈ 24MB/month | ~48MB/month | Negligible at Azure Blob pricing |

**Optimization opportunities (not needed now):**
- Parallel blob uploads (currently sequential — simpler, and 2-5s total is fine)
- Skip monthly snapshot if content unchanged (hash comparison)
- Gzip blob content for smaller storage footprint

---

## Sources

- **Azure Functions v4 Node.js programming model, timer trigger, folder structure, package.json `main` field**: Context7 `/websites/learn_microsoft_en-us_azure_azure-functions` — HIGH confidence
- **MSAL Node.js `ConfidentialClientApplication`, `acquireTokenByClientCredential`, `.default` scope**: Context7 `/azuread/microsoft-authentication-library-for-js` — HIGH confidence
- **@azure/storage-blob `BlobServiceClient.fromConnectionString()`, `ContainerClient`, `BlockBlobClient.upload()`**: Context7 `/azure/azure-sdk-for-js` — HIGH confidence
- **Azure Functions v4 ESM limitation** (CommonJS only): [GitHub issue #287](https://github.com/Azure/azure-functions-nodejs-library/issues/287) — HIGH confidence
- **host.json extensionBundle configuration**: Microsoft Learn host.json reference — HIGH confidence
- **Azure Functions v4 output bindings `output.storageBlob()` + `context.extraOutputs.set()`**: Microsoft Learn blob output binding reference — HIGH confidence
- **Dynamic blob naming limitations with bindings**: [GitHub issue #85](https://github.com/Azure/azure-functions-host/issues/85) + Stack Overflow — HIGH confidence
- **Legacy code analysis** (`az-funcs/`): Direct code review — HIGH confidence

---
*Architecture research for: SP REST API Explorer — v2.0 Backend Rework (Azure Functions v4)*
*Researched: 2026-02-22*
