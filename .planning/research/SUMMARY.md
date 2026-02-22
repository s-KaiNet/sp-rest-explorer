# Project Research Summary

**Project:** SP REST API Explorer v2.0 — Backend Rework (Azure Functions)
**Domain:** Timer-triggered data pipeline (Azure Functions → SharePoint → Blob Storage)
**Researched:** 2026-02-22
**Confidence:** HIGH

## Executive Summary

This project is a **ground-up rewrite** of a single-purpose Azure Functions backend that runs once daily, fetches SharePoint's `$metadata` XML (~4MB), transforms it to JSON, and uploads 6 blob variants to Azure Blob Storage for consumption by a frontend SPA. The legacy `az-funcs/` codebase uses Azure Functions v2, deprecated SDKs (azure-storage v2, Bluebird promisify), deprecated auth (ROPC password flow), and has known bugs (stale module-scope dates, 0-indexed months). The rewrite migrates to Azure Functions v4 programming model, modern Azure SDKs, and certificate-based client credentials auth.

The recommended approach is a **clean-room rewrite in a new `functions/` directory** using the v4 code-first model (`app.timer()`), `@azure/storage-blob` v12 for all blob operations (not declarative bindings — blob names are dynamic), and `@azure/msal-node` v5 with certificate-based client credentials auth. The core XML parsing logic (`MetadataParser`) should be **ported** line-for-line with only async/await modernization — it's proven correct and rewriting it risks breaking the frontend JSON schema. The pipeline architecture is five sequential stages: Auth → Fetch → Parse → Compress → Upload, orchestrated by a single timer function.

The **single highest risk** is SharePoint's certificate-only auth requirement. SharePoint Online blocks client secret-based app-only tokens entirely — this is a hard platform restriction, not a recommendation. Getting certificate auth working must be the first validated milestone. The second major risk is xml2js parser output fidelity — the frontend depends on the exact JSON shape produced by xml2js default options, and any option change produces silently incompatible output. Everything else (blob upload, timer scheduling, deployment) follows well-documented patterns with low risk.

## Key Findings

### Recommended Stack

The stack is fully modern with all deprecated packages replaced. Every version was verified against npm registry on 2026-02-22 with full compatibility matrix confirmed for Node.js 20 + TypeScript 5.9 + Azure Functions v4 runtime.

**Core technologies:**
- **Azure Functions v4** (`@azure/functions` 4.11.x): Code-first function registration via `app.timer()`. No `function.json` files. `@azure/functions` must be in `dependencies` (runtime code in v4). `main` field in package.json uses glob: `dist/src/functions/*.js`.
- **@azure/storage-blob v12** (12.31.x): Replaces deprecated `azure-storage` v2. Native async/await. Fluent client hierarchy: `BlobServiceClient` → `ContainerClient` → `BlockBlobClient`. Use SDK directly (not output bindings) for dynamic blob names.
- **@azure/msal-node v5** (5.0.x): Client credentials flow via `acquireTokenByClientCredential()`. **Must use certificate auth** (`clientCertificate` config), not client secret — SharePoint blocks secrets. Scope: `https://{tenant}.sharepoint.com/.default`.
- **TypeScript 5.9.x**: Strict mode. Compiles to CommonJS (`module: "Node16"` or `"commonjs"`). Target ES2022 for Node 20.
- **Node.js 20 LTS**: Runtime target. Azure Functions v4 supports 18/20/22.

**Libraries to DROP:** bluebird, handlebars, jsondiffpatch, azure-functions-pack, TSLint, ts-node, cross-zip-cli, `@types/lz-string` (lz-string 1.5.0 ships its own types).

**Critical version note:** `@azure/functions` v4 only ships CommonJS — ESM is not supported. Use `"module": "commonjs"` (or `"Node16"` which compiles to CJS). Do not use `"type": "module"` in package.json.

### Expected Features

**Must have (table stakes — all 12 for launch):**
- T1: Timer-triggered daily execution (CRON `0 0 1 * * *` — 6-part NCRONTAB)
- T2: Certificate-based client credentials auth via MSAL (**P0 — highest risk, validate first**)
- T3: SharePoint `$metadata` fetch with retry (3 attempts, exponential backoff, 60s timeout)
- T4: XML-to-JSON parsing (port MetadataParser, preserve exact output shape)
- T5: lz-string compression (though `.zip.json` is unused by frontends — keep for backward compat)
- T6: Blob upload — 3 latest files (`.xml`, `.json`, `.zip.json`)
- T7: Blob upload — 3 monthly snapshots (1-indexed months, fixing legacy 0-indexed bug)
- T8: Fresh `new Date()` inside handler (fixing legacy warm-start stale date bug)
- T9: Container auto-creation with public blob access
- T10: Environment variable configuration with fail-fast validation
- T11: Structured logging via `context.log()`
- T12: `func azure functionapp publish` deployment workflow

**Should have (add during implementation — near-zero cost):**
- D1: Built-in retry policy on `app.timer()` — one config line
- D2: Axios request timeout (60s) — one config option
- D3: Blob content type headers (`application/json`, `application/xml`)
- D7: Configurable CRON schedule via `%TIMER_SCHEDULE%` app setting

**Defer (after v2.0 validated):**
- D4: HTTP trigger for manual execution
- D5: Skip upload on identical metadata (optimization)
- D6: Execution summary output
- D8: Application Insights integration
- Diff generation / Changelog feature (CHLG-01-06 in backlog)
- CI/CD auto-deployment (ADDL-02 in backlog)

**Anti-features (explicitly avoid):**
- Client secret auth (blocked by SharePoint — will produce 401)
- Declarative blob output bindings (can't handle dynamic blob names)
- Durable Functions orchestration (massive overkill for 15-second pipeline)
- Multi-tenant support (single-tenant, single-site only)
- Azure Key Vault for certificate (overkill — use app settings or Function App certificate store)
- Weekly snapshots (dropped per PROJECT.md — dead storage nobody consumes)

### Architecture Approach

Single timer function with five sequential pipeline stages, each as an isolated module. The orchestrator (`src/functions/generateMetadata.ts`) calls stages in sequence. All blob operations use `@azure/storage-blob` SDK directly — not declarative output bindings — because blob names are computed at runtime from the current date. Module system is CommonJS (required by `@azure/functions` v4). MSAL client is module-scoped for token cache reuse across warm starts; `new Date()` is always computed inside the handler.

**Major components:**
1. **Timer Function** (`src/functions/generateMetadata.ts`) — Entry point. Registers daily schedule. Orchestrates pipeline. Fresh `Date` per invocation.
2. **Auth Stage** (`src/stages/auth.ts`) — MSAL `ConfidentialClientApplication` with certificate. Module-scoped singleton for token cache. Scope: `{spUrl}/.default`.
3. **Fetch Stage** (`src/stages/fetch.ts`) — Axios GET to `/_api/$metadata` with Bearer token. Retry logic (3 attempts, exponential backoff). 60s timeout.
4. **Parse Stage** (`src/stages/parse.ts`) — Port of `MetadataParser`. xml2js `parseStringPromise()` with **default options only**. Extracts entities, functions, associations, complex types. Output JSON shape must match legacy exactly.
5. **Compress Stage** (`src/stages/compress.ts`) — `lz-string.compressToUTF16()`. Trivial wrapper.
6. **Upload Stage** (`src/stages/upload.ts`) — `BlobServiceClient.fromConnectionString()`. Creates container. Uploads 6 blobs (3 latest + 3 monthly). Sets content type headers.
7. **Config** (`src/lib/config.ts`) — Reads env vars with fail-fast validation. Single source of truth.
8. **Blob Naming** (`src/lib/blob-naming.ts`) — Generates `{year}y_m{month}_metadata` with 1-indexed months.

**Project structure:** `functions/src/functions/`, `functions/src/stages/`, `functions/src/lib/`, `functions/src/types/`

### Critical Pitfalls

1. **SharePoint requires certificate auth — client secrets are blocked** — SharePoint Online rejects client secret-based app-only tokens with 401/403. You MUST use `clientCertificate` in MSAL config. Generate self-signed cert, upload public key to Entra ID app registration, store private key in app settings. *Validate first before building anything else.*

2. **Client credentials scope must be `/.default`** — The legacy ROPC code uses granular scopes like `/AllSites.Read`. Client credentials MUST use `https://{tenant}.sharepoint.com/.default`. Using anything else produces `AADSTS70011` errors or tokens with zero permissions.

3. **Module-scope `new Date()` produces stale dates on warm starts** — Azure Functions reuses Node.js processes. Module-scope variables persist. Always compute dates inside the handler function body.

4. **`main` field in package.json must point to compiled JS output** — If `main` points to `.ts` files or wrong directory, Azure discovers 0 functions silently. Must be `"main": "dist/src/functions/*.js"`. `@azure/functions` must be in `dependencies` (not devDependencies).

5. **xml2js parser options must match legacy defaults exactly** — Any change to parser options produces subtly different JSON that breaks the frontend. Use `new Parser()` with zero custom options. Validate with snapshot test against legacy output.

## Implications for Roadmap

Based on the dependency chain, risk profile, and architectural layering from research, the build should follow three phases:

### Phase 1: Project Scaffolding + Auth Validation
**Rationale:** Certificate auth is the single highest-risk item and the critical path blocker for everything downstream. Scaffolding establishes the v4 project structure that prevents the most common deployment failures (wrong `main` path, `@azure/functions` in devDependencies, ESM vs CJS). Get both validated before writing pipeline logic.
**Delivers:** Working Azure Functions v4 project that can acquire a valid SharePoint access token and make a successful test API call.
**Addresses:** T2 (certificate auth), T10 (env var config), project structure (package.json, tsconfig, host.json, .funcignore)
**Avoids:** Pitfall 1 (certificate-only auth), Pitfall 2 (scope format), Pitfall 4 (main field), Pitfall 12 (v2 context patterns)
**Features:** T2, T10, partial T1 (function registration without full pipeline)
**Stack setup:** All npm packages installed. TypeScript compiling. `func start` discovers function locally.

### Phase 2: Pipeline Implementation
**Rationale:** With auth proven, build the core pipeline stages top-down from the dependency chain: types → config → blob-naming → parse → fetch → compress → upload → orchestrator. The parse stage is the most complex (port MetadataParser) and should be built first since it can be tested in isolation with fixture XML. Fetch depends on auth (proven in Phase 1). Upload uses the Blob SDK directly.
**Delivers:** Complete working pipeline that fetches metadata from SharePoint, parses it, compresses it, and uploads 6 blobs to Azure Blob Storage. Timer fires daily.
**Addresses:** T1 (timer trigger), T3 (fetch with retry), T4 (XML parsing), T5 (compression), T6 (latest blobs), T7 (monthly snapshots), T8 (fresh Date), T9 (container creation), T11 (structured logging), D1-D3 (retry policy, timeout, content type headers), D7 (configurable schedule)
**Avoids:** Pitfall 3 (stale Date), Pitfall 5 (xml2js options), Pitfall 6 (blob binding registration), Pitfall 7 (SDK migration), Pitfall 8 (unused lz-string — make informed decision), Pitfall 9 (CRON format), Pitfall 10 (month indexing), Pitfall 13 (public blob access)
**Stack elements:** xml2js, lz-string, axios, @azure/storage-blob, @azure/msal-node
**Key validation:** Snapshot test — new parser output must match legacy output byte-for-byte for same input XML.

### Phase 3: Deployment + Validation
**Rationale:** Pipeline works locally. Now deploy to Azure, validate end-to-end in production, and verify frontend integration. This is also where nice-to-have features (HTTP trigger, skip-identical) get added if time permits.
**Delivers:** Production-deployed function that runs daily and produces blobs the frontend successfully consumes.
**Addresses:** T12 (deploy workflow), D4 (HTTP trigger for manual execution), D5 (skip identical), D6 (execution summary)
**Avoids:** Pitfall 11 (build before deploy), Pitfall 13 (blob public access in production)
**Validation:** Open blob URL in browser. Frontend loads metadata. Azure Portal shows function invocations. Monthly snapshot has correct 1-indexed month name.

### Phase Ordering Rationale

- **Auth first** because everything depends on a valid SharePoint token. If certificate auth doesn't work, nothing else matters. It's also the only item requiring manual Azure Portal setup (app registration, certificate upload, admin consent).
- **Parse stage built early in Phase 2** because it's the most complex code (302 lines in legacy) and can be tested in isolation with fixture XML — no Azure credentials needed. Getting the core logic right before wiring external services reduces debugging surface.
- **Deploy last** because it's the lowest-risk phase (standard `func publish` workflow) and benefits from all local testing being complete. Deploying an untested pipeline wastes debugging time in Azure Portal logs.
- **Differentiator features (D1-D7) woven into Phase 2** because they're near-zero cost additions (one config line each) and improve robustness. No reason to defer them.

### Research Flags

**Phases likely needing deeper research during planning:**
- **Phase 1 (Auth):** Certificate generation (OpenSSL vs PowerShell), MSAL `clientCertificate` config shape, how to store PFX in Azure Functions app settings (Base64 encoding?), Entra ID app registration steps for `Sites.Read.All` application permission with admin consent. The certificate auth path is well-documented but has many manual steps.

**Phases with standard patterns (skip `/gsd-research-phase`):**
- **Phase 2 (Pipeline):** All patterns are well-documented — xml2js parsing, axios retry, blob SDK upload. The MetadataParser port is code-level work, not research. Timer registration is one line of code.
- **Phase 3 (Deployment):** Standard `func azure functionapp publish` workflow. Documented in Microsoft Learn. Only gotcha is ensuring `npm run build` runs first.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified against npm registry 2026-02-22. Compatibility matrix confirmed. Context7 + Microsoft Learn cross-referenced. |
| Features | HIGH | Feature set derived from legacy code analysis + PROJECT.md decisions. Certificate auth requirement confirmed via official Microsoft docs. `.zip.json` unused finding verified by searching both frontends. |
| Architecture | HIGH | v4 programming model patterns confirmed via Context7. SDK-vs-bindings decision backed by GitHub issues on dynamic blob path limitations. CommonJS requirement confirmed via @azure/functions GitHub issue #287. |
| Pitfalls | HIGH | All pitfalls sourced from official docs, Context7 verification, or confirmed legacy bugs. Certificate-only requirement has multiple independent confirmations. |

**Overall confidence:** HIGH

### Gaps to Address

- **Certificate auth end-to-end setup:** Research covers the MSAL API and SharePoint requirement, but the exact Azure Portal steps for app registration + certificate upload + admin consent are multi-step manual processes. Should be documented as a checklist in Phase 1 planning, potentially with PowerShell/az CLI scripts.
- **MSAL `clientCertificate` config shape in v5:** STACK.md shows `clientSecret` config (which won't work for SharePoint). FEATURES.md and PITFALLS.md flag the certificate requirement. The exact `clientCertificate` config object shape (thumbprint vs thumbprintSha256, PEM vs PFX, file path vs inline string) needs verification against MSAL v5 docs during Phase 1 planning.
- **Blob Storage CORS configuration:** The storage account needs CORS rules for frontend to fetch blobs cross-origin. This is a one-time Azure Portal/CLI setting, not code — but must be verified during Phase 3 deployment.
- **`JSON.stringify` indentation:** Legacy uses `JSON.stringify(parsed, null, 4)` producing ~12MB pretty-printed JSON. Research flags this as a performance trap (4x size). Decision needed: keep indentation for human readability or drop for performance. Frontend doesn't care (it parses either).
- **lz-string `.zip.json` generation:** Research confirms neither frontend consumes it. Decision: generate for backward compatibility (cheap) or drop to simplify. Recommend: **skip for MVP**, add back if any consumer is discovered.

## Sources

### Primary (HIGH confidence)
- npm registry — all package versions verified 2026-02-22
- Context7 `/websites/learn_microsoft_en-us_azure_azure-functions` — v4 programming model, timer triggers, folder structure, migration guide
- Context7 `/azuread/microsoft-authentication-library-for-js` — MSAL Node ConfidentialClientApplication, client credentials flow, `.default` scope
- Context7 `/azure/azure-sdk-for-js` — @azure/storage-blob v12 API, migration from azure-storage v2
- [Microsoft Learn: Granting access via Entra ID App-Only](https://learn.microsoft.com/en-us/sharepoint/dev/solution-guidance/security-apponly-azuread) — Certificate-only auth requirement for SharePoint
- [Microsoft Learn: Azure Functions Node.js developer guide](https://learn.microsoft.com/en-us/azure/azure-functions/functions-reference-node) — v4 package.json main field, supported runtimes
- [Microsoft Learn: Migrate to v4 Node.js model](https://learn.microsoft.com/en-us/azure/azure-functions/functions-node-upgrade-v4) — Migration patterns, function.json removal
- [GitHub: @azure/functions #287](https://github.com/Azure/azure-functions-nodejs-library/issues/287) — ESM not supported, CommonJS required
- Legacy codebase `az-funcs/` — direct code analysis of all source files

### Secondary (MEDIUM confidence)
- [Medium: SharePoint App-Only Auth](https://medium.com/@rawandhawez/sharepoint-app-only-auth-when-client-secrets-fail-and-certificates-prevail-ca230b91a601) — Independent confirmation of certificate requirement
- Stack Overflow — Azure Functions v4 "no functions found" deployment issue
- [GitHub Actions — upload-artifact hidden files exclusion](https://stackoverflow.com/questions/78999440/github-actions-deployment-of-azure-functions-stopped-working) — `.azurefunctions` folder issue (relevant for future CI/CD)

---
*Research completed: 2026-02-22*
*Ready for roadmap: yes*
