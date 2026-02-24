# Phase 21: Deployment & Validation - Context

**Gathered:** 2026-02-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Deploy the `backend/` Azure Function to Azure, configure app settings, and verify it runs successfully producing blobs the frontend can consume. The function code is complete (Phases 18-20). This phase handles build scripts, deployment, secrets configuration, and production validation. Legacy function decommission and frontend URL migration are out of scope.

</domain>

<decisions>
## Implementation Decisions

### Deployment target & strategy
- Deploy to pre-created Function App named `sp-rest-explorer-new`
- Function App name is hardcoded in the deploy script (not parameterized)
- Legacy `az-funcs/` functions remain untouched — decommission is out of scope for this phase
- The new function writes to a **different** storage account (`sprestapiexplorernew`) than the legacy functions

### Build & deploy scripts
- `npm run deploy` = `npm run clean && npm run build && func azure functionapp publish sp-rest-explorer-new`
- `npm run build` updated to `npm run clean && tsc` (clean before compile to avoid stale JS from deleted/renamed TS files)
- No pre-deploy lint or test gates — deploy is build + publish only
- `.funcignore` enhanced to also exclude: `.test-fixtures/`, `**/*.test.ts`, `**/*.spec.ts`, `vitest.config.*`, and other dev-only files

### Secrets & app settings
- Secrets configured via `az functionapp config appsettings set` CLI commands (not Portal UI, not Key Vault)
- Required app settings: `ENTRA_TENANT_ID`, `ENTRA_CLIENT_ID`, `SP_CERT_PEM`, `SP_KEY_PEM`, `SP_URL`
- Storage connection string for `sprestapiexplorernew` storage account
- `TIMER_SCHEDULE` set to `0 0 1 * * *` (1:00 AM UTC daily) — same as local dev config
- Plan should include the exact CLI commands as documented steps (repeatable if Function App is recreated)

### Validation approach
- Trigger function via HTTP endpoint immediately after deploy (don't wait for timer)
- Validation passes when all 6 blobs are present in `api-files` container on `sprestapiexplorernew`: 3 latest files (`metadata.latest.json`, `.xml`, `.zip.json`) and 3 monthly snapshots
- Manual comparison of blob JSON structure against existing production blobs to confirm format compatibility
- Frontend URL update to point to new storage account is a **separate concern** — not in this phase

### Claude's Discretion
- Exact `.funcignore` entries beyond what was discussed
- Order of CLI commands for app settings configuration
- How to structure the validation checklist (steps, commands)
- Whether to document rollback steps

</decisions>

<specifics>
## Specific Ideas

- Function App name is `sp-rest-explorer-new` (pre-created, ready to receive deployments)
- Storage account name is `sprestapiexplorernew` (blob URL: `sprestapiexplorernew.blob.core.windows.net`)
- The function has both timer and HTTP triggers (HTTP trigger is key for immediate validation after deploy)
- `.env.example` already documents the required secrets shape — CLI commands should mirror these variable names

</specifics>

<deferred>
## Deferred Ideas

- Legacy `az-funcs/` function decommission — future cleanup phase
- Frontend URL migration to point to `sprestapiexplorernew` storage — separate phase/task
- CI/CD pipeline for automated deployment — out of scope, manual deploy for now

</deferred>

---

*Phase: 21-deployment-validation*
*Context gathered: 2026-02-23*
