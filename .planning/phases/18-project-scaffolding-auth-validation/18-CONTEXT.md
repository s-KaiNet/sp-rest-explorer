# Phase 18: Project Scaffolding & Auth Validation - Context

**Gathered:** 2026-02-23
**Status:** Ready for planning

<domain>
## Phase Boundary

A working Azure Functions v4 project that acquires a valid SharePoint access token via certificate-based client credentials. The function proves auth works by making a GET to `_api/web` and returning the response. No pipeline logic, no blob storage, no timer trigger orchestration — those are Phases 19-20.

</domain>

<decisions>
## Implementation Decisions

### Project structure
- New `backend/` directory at repository root (sibling to `src/`)
- Fully independent from frontend — own package.json, tsconfig.json, node_modules
- No shared config, no monorepo workspaces
- Package manager: npm (same as frontend)
- Node.js target: Node 20 LTS

### Certificate handling
- PEM format stored in environment variables (not PFX, not file paths)
- Two separate env vars: one for the certificate PEM, one for the private key PEM
- Thumbprint computed from the cert PEM at startup using Node crypto — no separate thumbprint env var
- For local dev: `.env` file loaded via dotenv (handles multiline PEM values naturally)

### Function shape & triggers
- Auth logic in a separate module (`src/auth.ts` exporting a `getToken()` function) — reused by Phase 19+
- HTTP trigger returns the raw SharePoint `_api/web` JSON response — proves auth and shows real data
- Function key required from the start (not anonymous)
- Trigger type: Claude's discretion (HTTP-only vs HTTP+timer stub)

### Dev workflow & local testing
- dotenv loaded at application startup (import dotenv/config at entry point)
- No local.settings.json dependency — .env is the single source for local config
- ESLint flat config (`eslint.config.mjs`) — ESLint v9 modern style
- No automated tests this phase — the HTTP trigger calling `_api/web` is the validation
- NPM scripts: standard names (`build`, `start`, `lint`, `clean`)

### Claude's Discretion
- Whether to include a timer trigger stub alongside the HTTP trigger, or HTTP-only
- TypeScript compilation output directory structure
- Exact ESLint rules/presets to use
- Error handling shape (what the function returns on auth failure)
- host.json configuration details

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. The key constraint is that this must work with Azure Functions v4 programming model (function registration in code, not function.json files).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 18-project-scaffolding-auth-validation*
*Context gathered: 2026-02-23*
