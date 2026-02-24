---
phase: 21-deployment-validation
plan: 01
subsystem: infra
tags: [azure-functions, deployment, blob-storage, key-vault, managed-identity]

# Dependency graph
requires:
  - phase: 20-function-orchestration
    provides: Complete working function with handler, triggers, and blob upload
provides:
  - Deployed Azure Function App sp-rest-explorer-new running daily timer
  - 6 production blobs in sprestapiexplorernew/api-files container
  - Build and deploy npm scripts for future deployments
affects: [frontend-compression, ci-cd]

# Tech tracking
tech-stack:
  added: [azure-key-vault, managed-identity]
  patterns: [key-vault-secret-references, dotnet-version-workaround]

key-files:
  created: []
  modified:
    - backend/package.json
    - backend/.funcignore
    - backend/src/index.ts

key-decisions:
  - "Key Vault for PEM certificates — Azure app settings mangle multiline values"
  - "System-assigned managed identity with Key Vault Secrets User role for secret access"
  - "--dotnet-version 8.0 workaround for func tools v4.7.0 NormalizeDotnetFrameworkVersion bug"
  - "package.json main field changed from glob to dist/src/index.js — Node.js can't resolve globs as entry points"
  - "src/index.ts imports function registration files for side effects — Azure Functions v4 discovery requires explicit imports"
  - "Removed node_modules/ from .funcignore — runtime dependencies must be included in deploy package"

patterns-established:
  - "Key Vault references: @Microsoft.KeyVault(SecretUri=...) in Azure app settings for multiline secrets"
  - "Deploy workaround: --dotnet-version 8.0 flag until func tools bug is fixed"

requirements-completed: [DEPL-01, DEPL-02, DEPL-03]

# Metrics
duration: ~30min
completed: 2026-02-24
---

# Phase 21 Plan 01: Deploy, Configure & Validate Summary

**Azure Function deployed to sp-rest-explorer-new with Key Vault-backed certificate auth, producing 6 validated blobs (2.2MB JSON, 3.0MB XML, 557KB compressed) in 2.5s**

## Performance

- **Duration:** ~30 min (multi-session with human-action and human-verify checkpoints)
- **Started:** 2026-02-24
- **Completed:** 2026-02-24
- **Tasks:** 3 (1 auto + 1 human-action + 1 human-verify)
- **Files modified:** 3

## Accomplishments
- Build/deploy npm scripts working — `npm run build` (clean && tsc) and `npm run deploy` (clean → build → func publish with --dotnet-version 8.0 workaround)
- Azure Function App sp-rest-explorer-new deployed with 3 discovered functions: generateMetadata (timer), generateMetadataHttp (HTTP), validateAuth (HTTP)
- Key Vault "rest-api-explorer" created for PEM certificate storage with system-assigned managed identity and Key Vault Secrets User role
- All 6 production blobs validated in sprestapiexplorernew/api-files: metadata.latest.json (2.2MB), metadata.latest.xml (3.0MB), metadata.latest.zip.json (557KB), plus 3 monthly snapshots
- HTTP trigger execution confirmed: 6 blobs uploaded in 2.5s (auth 345ms, pipeline 1899ms, upload 318ms)

## Task Commits

Each task was committed atomically:

1. **Task 1: Update build/deploy scripts and enhance .funcignore** - `35c3e41` (chore), `aead9a8` (fix), `d8e753d` (fix)
2. **Task 2: Deploy to Azure and configure app settings** - N/A (human-action checkpoint — deployed via `func publish`)
3. **Task 3: Trigger function and validate production blobs** - N/A (human-verify checkpoint — validated in Azure Portal + CLI)

## Files Created/Modified
- `backend/package.json` - Updated build script (clean && tsc), added deploy script with --dotnet-version 8.0 workaround, fixed main field from glob to dist/src/index.js
- `backend/.funcignore` - Enhanced with test/dev exclusions (.test-fixtures, *.test.ts, vitest.config.*, *.md, .env.example), removed node_modules/ (was incorrectly excluding runtime deps)
- `backend/src/index.ts` - Added imports for function registration files (generateMetadata, generateMetadataHttp, validateAuth) — was empty, preventing function discovery

## Decisions Made
- **Key Vault for certificates:** Azure app settings mangle multiline PEM values. Created Key Vault "rest-api-explorer" with `@Microsoft.KeyVault(SecretUri=...)` references instead of direct app setting values.
- **Managed identity over access keys:** System-assigned managed identity enabled on Function App with Key Vault Secrets User role — no secrets to rotate or leak.
- **--dotnet-version 8.0 workaround:** func tools v4.7.0 has a bug in NormalizeDotnetFrameworkVersion ("Value cannot be null, Parameter 'input'"). Adding `--dotnet-version 8.0` flag works around it.
- **Entry point fix:** package.json `main` field was a glob pattern `dist/src/functions/*.js` which Node.js can't resolve. Changed to `dist/src/index.js` with explicit imports for function registration side effects.
- **node_modules in deploy package:** .funcignore had `node_modules/` which excluded all runtime dependencies. Removed — Azure Functions Node.js runtime needs node_modules deployed with the function.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] func tools v4.7.0 NormalizeDotnetFrameworkVersion bug**
- **Found during:** Task 1 (build/deploy scripts)
- **Issue:** `func azure functionapp publish` crashes with "Value cannot be null (Parameter 'input')" in NormalizeDotnetFrameworkVersion
- **Fix:** Added `--dotnet-version 8.0` flag to deploy script
- **Files modified:** backend/package.json
- **Verification:** Deploy succeeds with flag
- **Committed in:** `aead9a8`

**2. [Rule 1 - Bug] package.json main field was unresolvable glob**
- **Found during:** Task 1 (deploy attempt)
- **Issue:** `main: "dist/src/functions/*.js"` — Node.js can't resolve glob patterns as entry points; Azure Functions couldn't discover functions
- **Fix:** Changed to `main: "dist/src/index.js"`
- **Files modified:** backend/package.json
- **Committed in:** `d8e753d`

**3. [Rule 1 - Bug] src/index.ts was empty — no function registration**
- **Found during:** Task 1 (deploy attempt)
- **Issue:** Azure Functions v4 model requires explicit imports for function registration side effects. src/index.ts was a no-op, so zero functions were discovered.
- **Fix:** Added imports: `import './functions/generateMetadata'`, `import './functions/generateMetadataHttp'`, `import './functions/validateAuth'`
- **Files modified:** backend/src/index.ts
- **Committed in:** `d8e753d`

**4. [Rule 1 - Bug] .funcignore excluded node_modules (runtime dependencies)**
- **Found during:** Task 1 (deploy attempt)
- **Issue:** .funcignore contained `node_modules/` which stripped all runtime dependencies from the deploy package, causing function startup failures
- **Fix:** Removed `node_modules/` from .funcignore
- **Files modified:** backend/.funcignore
- **Committed in:** `d8e753d`

**5. [Rule 3 - Blocking] PEM certificates can't be stored as plain app settings**
- **Found during:** Task 2 (human-action — configuring app settings)
- **Issue:** Azure app settings mangle multiline PEM certificate values (strips newlines, corrupts base64)
- **Fix:** Created Key Vault "rest-api-explorer", stored PEM values as secrets, configured system-assigned managed identity with Key Vault Secrets User role, used `@Microsoft.KeyVault(SecretUri=...)` references in app settings
- **Files modified:** Azure infrastructure (Key Vault, managed identity, app settings) — no code files
- **Verification:** Function successfully reads certificates via Key Vault references

---

**Total deviations:** 5 auto-fixed (2 blocking, 3 bugs)
**Impact on plan:** All fixes were necessary for successful deployment. Key Vault approach is more secure than direct app settings. No scope creep.

## Issues Encountered
None beyond the deviations documented above — all were resolved during execution.

## User Setup Required
None - no external service configuration required. All Azure resources are configured.

## Next Phase Readiness
- **v2.0 Backend Rework is COMPLETE** — all 4 phases (18-21) executed successfully
- Azure Function App sp-rest-explorer-new is running daily at 1 AM UTC
- 6 blobs confirmed in production storage with correct format
- Ready for future milestones: frontend compression switch (FRNT-01), CI/CD (ADDL-02), API changelog (CHLG-01+)

## Self-Check: PASSED

All modified files exist on disk. All 3 task commits verified in git history.

---
*Phase: 21-deployment-validation*
*Completed: 2026-02-24*
