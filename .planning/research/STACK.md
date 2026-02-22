# Stack Research

**Domain:** Azure Functions backend for SharePoint metadata processing (timer-triggered, blob storage, MSAL auth)
**Researched:** 2026-02-22
**Confidence:** HIGH

## Verification Summary

All package versions verified against npm registry and Context7 documentation on 2026-02-22. Key findings:

| Legacy Package | Replacement | Latest Version | Status |
|----------------|-------------|----------------|--------|
| `azure-storage` v2 | `@azure/storage-blob` | **12.31.0** | ✅ Modern SDK, fully typed |
| `@azure/msal-node` 2.16.0 (ROPC) | `@azure/msal-node` (client credentials) | **5.0.4** | ⚠️ Major version jump (2→5) |
| `@azure/functions` (v2 model) | `@azure/functions` (v4 model) | **4.11.2** | ✅ Code-centric, no function.json |
| `axios` 1.7.7 | `axios` | **1.13.5** | ✅ Minor update |
| `xml2js` 0.4.19 | `xml2js` | **0.6.2** | ✅ Still best fit for existing parser |
| `lz-string` 1.4.4 | `lz-string` | **1.5.0** | ✅ Includes own types |
| `jsondiffpatch` 0.3.11 | `jsondiffpatch` | **0.7.3** | ⚠️ ESM-only in v0.7 |
| `typescript` 5.6.3 | `typescript` | **5.9.x** | ✅ Matches frontend |
| `tslint` 5.x | `eslint` + `typescript-eslint` | ESLint **10.x** | ✅ TSLint long dead |
| `bluebird` 3.x | Native `Promise` / `util.promisify` | N/A — **DROP** | ✅ Node 20+ has native promises |
| `handlebars` 4.x | N/A | N/A — **DROP** | ✅ Was for diff HTML — diff dropped |
| `azure-functions-pack` 1.x | N/A | N/A — **DROP** | ✅ v4 model doesn't need bundling |

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| `@azure/functions` | 4.11.x | Azure Functions v4 programming model | Code-centric function definitions (no `function.json`). Timer triggers, blob outputs defined in TypeScript. Types included. Must be in `dependencies` (not `devDependencies`). Supports Node.js 20 and 22. | HIGH — npm + Context7 + MS Learn verified |
| TypeScript | 5.9.x | Type safety | Matches frontend project. Strict mode. Compiles to `dist/` for Azure Functions. | HIGH — npm verified |
| Node.js | 20.x (LTS) | Runtime | Azure Functions v4 supports Node 18/20/22. Use 20 LTS for stability. Node 22 is supported but newer. | HIGH — MS Learn verified |

### Azure SDK Libraries

| Library | Version | Purpose | Why Recommended | Confidence |
|---------|---------|---------|-----------------|------------|
| `@azure/storage-blob` | 12.31.x | Blob Storage operations | Replaces deprecated `azure-storage` v2. Typed API. `BlobServiceClient` + `ContainerClient` + `BlockBlobClient`. Connection string auth via `BlobServiceClient.fromConnectionString()`. | HIGH — Context7 + npm verified |
| `@azure/msal-node` | 5.0.x | Microsoft Entra ID auth | Client credentials flow via `ConfidentialClientApplication.acquireTokenByClientCredential()`. Scope format: `<resource>/.default`. Replaces legacy ROPC (`acquireTokenByUsernamePassword`). v5 is latest — v3 also maintained but v5 is `@latest` on npm. | HIGH — Context7 + npm verified |

### Processing Libraries

| Library | Version | Purpose | Why Recommended | Confidence |
|---------|---------|---------|-----------------|------------|
| `axios` | 1.13.x | HTTP client | Fetches `$metadata` XML from SharePoint. Built-in timeout, retry interceptors. TypeScript types included. Proven in legacy code. | HIGH — npm verified |
| `xml2js` | 0.6.x | XML-to-JSON parser | **Keep xml2js** — the existing `MetadataParser` class is tightly coupled to xml2js's `$` attribute accessor pattern. xml2js 0.6.2 is the latest. Rewriting the parser for a different XML library (like `fast-xml-parser`) gains nothing for this use case. | HIGH — npm verified |
| `lz-string` | 1.5.x | String compression | Compresses JSON metadata for `metadata.latest.zip.json`. v1.5.0 includes own TypeScript types — **remove** `@types/lz-string` (deprecated stub). Binary compatible with v1.4.4 output. | HIGH — npm + GitHub verified |

### Development Tools

| Tool | Version | Purpose | Notes | Confidence |
|------|---------|---------|-------|------------|
| ESLint | 10.x | Linting | Flat config format (`eslint.config.js`). Replaces TSLint 5.x (deprecated since 2019). | HIGH |
| `typescript-eslint` | 8.x | TypeScript lint rules | `@typescript-eslint/parser` + `@typescript-eslint/eslint-plugin`. | HIGH |
| `@types/xml2js` | latest | xml2js types | xml2js doesn't ship its own types. | HIGH |
| `@types/node` | 20.x | Node.js types | Match the target Node.js version. | HIGH |
| Azure Functions Core Tools | 4.x | Local dev + deployment | `func init`, `func start`, `func azure functionapp publish`. Install globally via npm: `npm install -g azure-functions-core-tools@4`. | HIGH — MS Learn verified |

---

## Libraries to DROP (not needed in new backend)

| Library | Why Drop | Replacement |
|---------|----------|-------------|
| `bluebird` | Used only for `promisify`. Node.js has native `util.promisify()` and `xml2js` 0.6.x supports promises natively via `parseStringPromise()`. | Native promises |
| `handlebars` + `handlebars-helpers` | Used only in `GenerateDiff` for HTML diff rendering. GenerateDiff is dropped entirely. | Nothing — not needed |
| `jsondiffpatch` | Used only in `GenerateDiff`. That function is being dropped. | Nothing — not needed |
| `azure-functions-pack` | Webpack bundler for Azure Functions v2. Not needed — v4 model uses `main` field in `package.json` to find functions. | `main` field in package.json |
| `cross-zip-cli` + `copyfiles` | Part of the old `funcpack` deployment pipeline. Not needed with `func azure functionapp publish`. | Azure Functions Core Tools |
| `ts-node` | Not needed — TypeScript compiles to `dist/`, Azure Functions runs the compiled JS. | `tsc` build step |
| `tslint` + `tslint-config-standard` | TSLint deprecated since 2019. | ESLint + typescript-eslint |
| `@types/bluebird` | Bluebird is being dropped. | Nothing |
| `@types/lz-string` | Deprecated stub — lz-string 1.5.0 includes own types. | Nothing |
| `@types/handlebars` | Handlebars is being dropped. | Nothing |
| `node-static` + `concurrently` | Old local dev utilities. Not needed with `func start`. | Azure Functions Core Tools |

---

## Azure Functions v4 Programming Model — Key Patterns

### Project Structure (Recommended for TypeScript)

```
api/                              # New backend directory (replaces az-funcs/)
├── src/
│   └── functions/
│       └── generateMetadata.ts   # Timer function — config + handler in one file
├── dist/                         # Compiled output (gitignored)
├── host.json
├── local.settings.json           # Local env vars (gitignored)
├── package.json                  # "main": "dist/src/functions/*.js"
├── tsconfig.json
├── eslint.config.js
└── .funcignore                   # Excludes .vscode/, test/, local.settings.json, src/
```

### Timer Trigger (v4 Model)

```typescript
import { app, InvocationContext, Timer } from '@azure/functions';

export async function generateMetadata(
  myTimer: Timer,
  context: InvocationContext
): Promise<void> {
  context.log('Generating metadata files...');
  // ... pipeline logic
}

app.timer('generateMetadata', {
  schedule: '0 0 1 * * *',     // Daily at 1:00 AM UTC
  handler: generateMetadata,
});
```

**Key v4 differences from legacy v2:**
- No `function.json` files — configuration is in code via `app.timer()`
- No `context.done()` — return a Promise (async/await)
- `@azure/functions` is a runtime dependency (not devDependency)
- `package.json` must have `"main": "dist/src/functions/*.js"` (glob to find compiled functions)
- `context.log()` replaces `context.log.info()` (though `.info()` still works)

### host.json (v4)

```json
{
  "version": "2.0",
  "logging": {
    "applicationInsights": {
      "samplingSettings": {
        "isEnabled": true,
        "excludedTypes": "Request"
      }
    }
  },
  "extensionBundle": {
    "id": "Microsoft.Azure.Functions.ExtensionBundle",
    "version": "[4.*, 5.0.0)"
  }
}
```

### tsconfig.json (v4 TypeScript)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "dist",
    "rootDir": ".",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

**Key tsconfig changes from legacy:**
- `"module": "Node16"` replaces `"commonjs"` — supports ESM imports while producing CJS output
- `"target": "ES2022"` replaces `"es6"` — Node 20 supports ES2022 features
- `"strict": true` replaces `"noImplicitAny": false` — catch errors at compile time
- `"moduleResolution": "Node16"` replaces `"node"` — required for `module: "Node16"`

### package.json Pattern

```json
{
  "name": "sp-rest-explorer-api",
  "version": "2.0.0",
  "main": "dist/src/functions/*.js",
  "scripts": {
    "build": "tsc",
    "watch": "tsc -w",
    "prestart": "npm run build",
    "start": "func start",
    "lint": "eslint src/",
    "deploy": "npm run build && func azure functionapp publish sharepoint-rest-explorer"
  },
  "dependencies": {
    "@azure/functions": "^4.11.0",
    "@azure/storage-blob": "^12.31.0",
    "@azure/msal-node": "^5.0.0",
    "axios": "^1.13.0",
    "xml2js": "^0.6.2",
    "lz-string": "^1.5.0"
  },
  "devDependencies": {
    "typescript": "~5.9.0",
    "@types/node": "^20.0.0",
    "@types/xml2js": "^0.4.14",
    "eslint": "^10.0.0",
    "@eslint/js": "^10.0.0",
    "typescript-eslint": "^8.0.0"
  }
}
```

---

## Client Credentials Auth Pattern (Replacing ROPC)

### Why Switch
The legacy code uses ROPC (`acquireTokenByUsernamePassword`) which:
- Is deprecated by Microsoft
- Doesn't work with MFA-enabled accounts
- Requires storing user passwords in environment variables
- Violates least-privilege (uses user context when app context suffices)

### New Pattern

```typescript
import { ConfidentialClientApplication } from '@azure/msal-node';

const msalConfig = {
  auth: {
    clientId: process.env.AZ_ClientId!,
    authority: `https://login.microsoftonline.com/${process.env.AZ_TenantId}`,
    clientSecret: process.env.AZ_ClientSecret!,
  },
};

const cca = new ConfidentialClientApplication(msalConfig);

async function getAccessToken(spUrl: string): Promise<string> {
  const result = await cca.acquireTokenByClientCredential({
    scopes: [`${spUrl}/.default`],  // NOTE: .default suffix required for client credentials
  });

  if (!result) {
    throw new Error('Failed to acquire token via client credentials');
  }

  return result.accessToken;
}
```

**Key differences from legacy ROPC:**
- Uses `acquireTokenByClientCredential()` instead of `acquireTokenByUsernamePassword()`
- Scope format: `<resource>/.default` (not `<resource>/AllSites.Read`)
- No username/password needed — only `clientId`, `clientSecret`, `tenantId`
- Requires Azure AD app registration with **application permissions** (not delegated)
- App registration needs `Sites.Read.All` application permission with admin consent

### Environment Variables (new)

```
AZ_ClientId=<app-registration-client-id>
AZ_ClientSecret=<app-registration-client-secret>
AZ_TenantId=<azure-ad-tenant-id>
SP_Url=https://<tenant>.sharepoint.com
AzureWebJobsStorage=<storage-connection-string>
```

**Removed:** `SP_User`, `SP_Password` (no longer needed with client credentials)

---

## Blob Storage Pattern (Replacing azure-storage v2)

### Legacy Pattern (azure-storage v2 + bluebird)

```typescript
// OLD — promisify-based, callback-based SDK
import { createBlobService } from 'azure-storage';
import { promisify } from 'bluebird';

const blobService = createBlobService(connectionString);
const createBlockBlobFromTextAsync = promisify(blobService.createBlockBlobFromText.bind(blobService));
await createBlockBlobFromTextAsync(container, blobName, content);
```

### New Pattern (@azure/storage-blob v12)

```typescript
// NEW — native async/await, typed API
import { BlobServiceClient } from '@azure/storage-blob';

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AzureWebJobsStorage!
);
const containerClient = blobServiceClient.getContainerClient('api-files');

// Ensure container exists with public blob access
await containerClient.createIfNotExists({ access: 'blob' });

// Upload text content
const blockBlobClient = containerClient.getBlockBlobClient('metadata.latest.json');
await blockBlobClient.upload(jsonContent, Buffer.byteLength(jsonContent), {
  blobHTTPHeaders: { blobContentType: 'application/json' },
});
```

**Key differences:**
- No promisification needed — native async/await
- Fluent client hierarchy: `BlobServiceClient` → `ContainerClient` → `BlockBlobClient`
- Content type headers can be set on upload
- Connection string auth via `BlobServiceClient.fromConnectionString()`

---

## xml2js Migration Notes

### v0.4.19 → v0.6.2 Changes

The legacy parser uses:
```typescript
import { Parser } from 'xml2js';
import { promisify } from 'bluebird';

const parser = new Parser();
const parseStringAsync = promisify(parser.parseString);
const obj = await parseStringAsync(content);
```

In v0.6.x, use the built-in promise API:
```typescript
import { parseStringPromise } from 'xml2js';

const obj = await parseStringPromise(content);
```

**No other breaking changes** — the `$` attribute accessor pattern (`obj['edmx:Edmx']['edmx:DataServices'][0]['Schema']`) is unchanged.

---

## Deployment Approach

### Recommended: Azure Functions Core Tools (`func`)

```bash
# One-time: install globally
npm install -g azure-functions-core-tools@4

# Local development
func start                     # Runs locally with local.settings.json

# Deploy to Azure
func azure functionapp publish sharepoint-rest-explorer
```

This is the same tool the legacy project used (`deploy-az` script). It:
- Compiles TypeScript (via `prestart`/`prebuild` scripts)
- Packages and deploys to the existing Azure Functions app
- Reads connection from Azure CLI login (`az login`)

### NOT Recommended for This Project

| Approach | Why Not |
|----------|---------|
| GitHub Actions CI/CD | Backlog item (ADDL-02). Too complex for initial backend rework. |
| ZIP deploy via Azure CLI | More steps than `func publish`. Core Tools handles it. |
| VS Code deploy button | Not scriptable. Use CLI for reproducibility. |
| Azure DevOps Pipelines | Overkill for a single developer project. |

---

## Alternatives Considered

| Category | Recommended | Alternative | When to Use Alternative |
|----------|-------------|-------------|-------------------------|
| Blob SDK | `@azure/storage-blob` v12 | `@azure/identity` + `DefaultAzureCredential` | If you need managed identity auth instead of connection strings. Overkill for timer functions with `AzureWebJobsStorage` already available. |
| HTTP client | `axios` | Node.js native `fetch` | If you want zero dependencies. Axios has better timeout/retry/interceptor support and the legacy code already uses it. Keep for consistency. |
| XML parser | `xml2js` | `fast-xml-parser` | If starting fresh with no existing parser code. fast-xml-parser is 10x faster and actively maintained (5.3.2). But rewriting MetadataParser is pure risk for zero user-facing gain. |
| MSAL version | `@azure/msal-node` v5 | `@azure/msal-node` v3.8.x | If v5 has compatibility issues. v3.8.x is still maintained (last release: Jan 2026). Both support `acquireTokenByClientCredential`. v5 is `@latest` on npm. |
| Compression | `lz-string` | `pako` (zlib) | If you need standard gzip. lz-string is kept for backward compatibility — the frontend decompresses `metadata.latest.zip.json` with lz-string. Changing compression format would require frontend changes. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `azure-storage` v2 | Deprecated. No TypeScript types. Callback-based API requires promisification with bluebird. | `@azure/storage-blob` v12 |
| `acquireTokenByUsernamePassword` (ROPC) | Deprecated by Microsoft. Doesn't support MFA. Stores user credentials. | `acquireTokenByClientCredential` (client credentials) |
| `bluebird` | Unnecessary in Node 20+. All Azure SDKs and xml2js support native promises. | Native `Promise`, `async/await` |
| `azure-functions-pack` | Webpack bundler for v2 model. v4 model doesn't need bundling — it uses `main` field in package.json. | v4 `main` glob pattern |
| TSLint | Dead project since 2019. No updates. | ESLint + typescript-eslint |
| `handlebars` / `jsondiffpatch` | Only used for GenerateDiff function which is being dropped. | Nothing — not needed |
| `context.done()` | Legacy v2 pattern. v4 uses async/await — function completes when Promise resolves. | `return` / `async/await` |
| Module-scope `new Date()` | **Critical bug in legacy code.** `let now = new Date()` at module scope gets cached across Azure Functions warm starts. Can produce stale date values days/weeks old. | Compute `new Date()` inside the handler function on each invocation. |

---

## MSAL v5 vs v2 — Migration Notes

The project jumps from `@azure/msal-node` 2.16.0 to 5.0.x. Key considerations:

1. **No functional breaking changes for client credentials flow.** The `acquireTokenByClientCredential()` API is identical in v2, v3, and v5.
2. **v5 is latest `@latest` on npm** (5.0.4, published Feb 11, 2026). v3.8.x is also actively maintained.
3. The MSAL team noted: "There have been no functional changes in the MSAL Node v2 release" (from v1→v2). Similarly, v2→v3→v5 are primarily dependency bumps and internal refactoring.
4. **ROPC is still available in v5** but we're deliberately switching away from it to client credentials.
5. Since we're rewriting from scratch (not migrating), there's no migration cost — just use v5.

**Recommendation:** Use `@azure/msal-node` v5.0.x. If issues arise, fall back to v3.8.x — both support the same client credentials API.

---

## Version Compatibility Matrix

| Package | Node.js 20 | TypeScript 5.9 | Azure Functions v4 Runtime | Notes |
|---------|------------|----------------|---------------------------|-------|
| `@azure/functions` 4.11.x | ✅ (18/20/22) | ✅ | ✅ (4.25+) | Types included |
| `@azure/storage-blob` 12.31.x | ✅ (LTS) | ✅ | ✅ | No direct AF dependency |
| `@azure/msal-node` 5.0.x | ✅ (LTS) | ✅ | ✅ | No direct AF dependency |
| `axios` 1.13.x | ✅ | ✅ | ✅ | Types included |
| `xml2js` 0.6.x | ✅ | ✅ (via @types) | ✅ | Needs @types/xml2js |
| `lz-string` 1.5.x | ✅ | ✅ (own types) | ✅ | Drop @types/lz-string |
| ESLint 10.x | ✅ (≥18) | ✅ (via typescript-eslint) | N/A | Dev tool |
| typescript-eslint 8.x | ✅ | ✅ | N/A | Dev tool |

---

## Installation Commands

```bash
# 1. Create project directory (new directory, not inside az-funcs/)
mkdir api && cd api

# 2. Initialize Azure Functions project
func init --worker-runtime typescript --model V4

# 3. Core dependencies
npm install @azure/functions @azure/storage-blob @azure/msal-node axios xml2js lz-string

# 4. Dev dependencies
npm install -D typescript @types/node@20 @types/xml2js eslint @eslint/js typescript-eslint

# 5. Remove packages added by func init that we don't need
# (func init may add @azure/functions to devDependencies — move to dependencies)
```

---

## Sources

- npm registry (verified 2026-02-22) — all version numbers
- Context7 `/websites/learn_microsoft_en-us_azure_azure-functions` — v4 programming model, timer trigger pattern, folder structure, migration guide
- Context7 `/azuread/microsoft-authentication-library-for-js` — ConfidentialClientApplication, client credentials flow, acquireTokenByClientCredential
- Context7 `/azure/azure-sdk-for-js` — @azure/storage-blob upload pattern, BlobServiceClient, migration from azure-storage v2
- Microsoft Learn: Azure Functions Node.js developer guide — folder structure, package.json main field, supported Node.js versions
- Microsoft Learn: Migrate to v4 Node.js programming model — function.json removal, app.timer() registration
- npm `@azure/functions` 4.11.2 — v4 model GA, supported Node versions
- npm `@azure/storage-blob` 12.31.0 — published 2026-02-10
- npm `@azure/msal-node` 5.0.4 — published 2026-02-11
- npm `axios` 1.13.5 — published 2026-02-13
- npm `xml2js` 0.6.2 — published 2023-07-26
- npm `lz-string` 1.5.0 — published 2023-03-04, includes own TypeScript types
- npm `jsondiffpatch` 0.7.3 — ESM-only, but irrelevant (dropping this library)

---
*Stack research for: SP REST API Explorer v2.0 Backend Rework (Azure Functions)*
*Researched: 2026-02-22*
