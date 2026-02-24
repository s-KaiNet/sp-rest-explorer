# Requirements: SP REST API Explorer — v2.0 Backend Rework

**Defined:** 2026-02-22
**Core Value:** Rewrite the Azure Functions backend from scratch with modern tooling, simplified blob layout, certificate-based auth, and resilient daily timer — producing the same metadata JSON the frontend consumes.

## v1 Requirements

Requirements for v2.0 milestone. Each maps to roadmap phases.

### Project Setup

- [x] **PROJ-01**: New `functions/` directory with Azure Functions v4 project structure (package.json, tsconfig.json, host.json, .funcignore)
- [x] **PROJ-02**: TypeScript in strict mode with ESLint replacing deprecated TSLint
- [x] **PROJ-03**: All runtime dependencies installed and version-pinned (@azure/functions, @azure/storage-blob, @azure/msal-node, axios, xml2js, lz-string)

### Authentication

- [x] **AUTH-01**: Function authenticates to SharePoint using MSAL client credentials flow with certificate (not client secret, not ROPC)
- [x] **AUTH-02**: Authentication credentials (tenant ID, client ID, certificate path/thumbprint, SP URL) configurable via environment variables

### Data Fetch

- [x] **FTCH-01**: Function fetches SharePoint `_api/$metadata` XML endpoint with Bearer token
- [x] **FTCH-02**: Fetch retries up to 3 times with exponential backoff on network failures and 5xx errors
- [x] **FTCH-03**: Fetch respects 429 Retry-After headers from SharePoint throttling
- [x] **FTCH-04**: Fetch has a 60-second timeout per attempt

### Data Processing

- [x] **PROC-01**: XML-to-JSON parsing produces identical output structure to legacy MetadataParser (entities, functions, associations, navProperties, collection types)
- [x] **PROC-02**: TypeScript interfaces ported from legacy (EntityType, FunctionImport, Metadata, Property, NavigationProperty, Parameter, Association)
- [x] **PROC-03**: JSON output uses compact format (no indentation)
- [x] **PROC-04**: Parsed JSON is compressed via lz-string `compressToUTF16` for .zip.json blobs

### Blob Storage

- [x] **BLOB-01**: Function uploads `metadata.latest.json` to `api-files` container on every run
- [x] **BLOB-02**: Function uploads `metadata.latest.xml` to `api-files` container on every run
- [x] **BLOB-03**: Function uploads `metadata.latest.zip.json` to `api-files` container on every run
- [x] **BLOB-04**: Function uploads monthly snapshot `{year}y_m{month}_metadata.json` with 1-indexed months
- [x] **BLOB-05**: Function uploads monthly snapshot `{year}y_m{month}_metadata.xml` with 1-indexed months
- [x] **BLOB-06**: Function uploads monthly snapshot `{year}y_m{month}_metadata.zip.json` with 1-indexed months
- [x] **BLOB-07**: Container `api-files` is auto-created with public blob access level if it doesn't exist
- [x] **BLOB-08**: Blob uploads set correct Content-Type headers (application/json, application/xml)

### Operations

- [x] **OPS-01**: Function runs on a daily timer trigger (default 1 AM UTC)
- [x] **OPS-02**: Timer schedule is configurable via app setting (not hardcoded)
- [x] **OPS-03**: Date is computed fresh inside the function handler on every invocation (no module-scope Date)
- [x] **OPS-04**: Function logs structured milestones: auth, fetch, parse, compress, upload with durations
- [x] **OPS-05**: HTTP trigger endpoint allows manual execution with function key authentication
- [x] **OPS-06**: Function-level retry policy configured for whole-function failures
- [x] **OPS-07**: If fetch fails after all retries, function exits without writing any blobs (all-or-nothing)

### Deployment

- [x] **DEPL-01**: `npm run build` compiles TypeScript to JavaScript
- [x] **DEPL-02**: `npm run deploy` builds and publishes to Azure via `func azure functionapp publish`
- [x] **DEPL-03**: `.funcignore` excludes local.settings.json, source maps, tests, and source TypeScript

## Future Requirements

Deferred to future milestones. Tracked but not in current roadmap.

### API Changelog (CHLG-01 through CHLG-06)

- **CHLG-01**: Frontend displays monthly metadata diffs using jsondiffpatch in browser
- **CHLG-02**: Monthly diff summary with entity/function add/remove/update counts
- **CHLG-03**: Filter diffs by change type (added, removed, modified)
- **CHLG-04**: Visual diff display with color-coded changes
- **CHLG-05**: Month-to-month navigation for changelog history
- **CHLG-06**: Changelog accessible from main navigation

### CI/CD

- **ADDL-02**: GitHub Actions CI/CD auto-deployment for Azure Functions

### Frontend Compression

- **FRNT-01**: Frontend switches from `metadata.latest.json` to `metadata.latest.zip.json` with lz-string decompression (~30-80ms overhead, ~3.5MB network savings)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Diff generation (GenerateDiff function) | Diffs will be computed client-side with jsondiffpatch in browser — no server-side diff needed |
| `diff-files` blob container | No server-side diffs, so no diff blobs |
| Weekly snapshots | Never consumed by any frontend — dead storage |
| Client secret auth | SharePoint Online blocks client secrets for app-only access — certificates required |
| Declarative blob output bindings | Dynamic blob names (year/month) can't use static binding paths — SDK direct is cleaner |
| Durable Functions orchestration | Pipeline takes ~15 seconds — Durable Functions is massive overkill |
| Multi-tenant support | Single SharePoint tenant, single site |
| Azure Key Vault for certificates | Overkill for one self-signed certificate — direct upload to Function App |
| CI/CD in v2.0 | Premature — single developer, rare deployments. Backlog item ADDL-02 |
| Frontend changes | Separate future milestone — v2.0 is backend only |
| Modifying legacy `az-funcs/` | Clean-room rewrite in new `functions/` directory — legacy preserved as reference |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| PROJ-01 | Phase 18 | Complete |
| PROJ-02 | Phase 18 | Complete |
| PROJ-03 | Phase 18 | Complete |
| AUTH-01 | Phase 18 | Complete |
| AUTH-02 | Phase 18 | Complete |
| FTCH-01 | Phase 19 | Complete |
| FTCH-02 | Phase 19 | Complete |
| FTCH-03 | Phase 19 | Complete |
| FTCH-04 | Phase 19 | Complete |
| PROC-01 | Phase 19 | Complete |
| PROC-02 | Phase 19 | Complete |
| PROC-03 | Phase 19 | Complete |
| PROC-04 | Phase 19 | Complete |
| BLOB-01 | Phase 20 | Complete |
| BLOB-02 | Phase 20 | Complete |
| BLOB-03 | Phase 20 | Complete |
| BLOB-04 | Phase 20 | Complete |
| BLOB-05 | Phase 20 | Complete |
| BLOB-06 | Phase 20 | Complete |
| BLOB-07 | Phase 20 | Complete |
| BLOB-08 | Phase 20 | Complete |
| OPS-01 | Phase 20 | Complete |
| OPS-02 | Phase 20 | Complete |
| OPS-03 | Phase 20 | Complete |
| OPS-04 | Phase 20 | Complete |
| OPS-05 | Phase 20 | Complete |
| OPS-06 | Phase 20 | Complete |
| OPS-07 | Phase 20 | Complete |
| DEPL-01 | Phase 21 | Complete |
| DEPL-02 | Phase 21 | Complete |
| DEPL-03 | Phase 21 | Complete |

**Coverage:**
- v1 requirements: 31 total
- Mapped to phases: 31
- Unmapped: 0

---
*Requirements defined: 2026-02-22*
*Last updated: 2026-02-24 — all v2.0 requirements complete (DEPL-01, DEPL-02, DEPL-03 marked done)*
