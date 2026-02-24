---
phase: 22-switch-to-compressed-data-source
plan: 01
subsystem: data
tags: [lz-string, compression, metadata, azure-blob-storage, fetch-pipeline]

# Dependency graph
requires:
  - phase: 21-deployment-validation
    provides: Deployed backend producing compressed metadata blobs
provides:
  - lz-string decompression wired into metadata fetch pipeline
  - METADATA_URL pointing to new compressed blob storage
  - ~75% smaller network transfer for metadata (~557KB vs ~2.2MB)
affects: []

# Tech tracking
tech-stack:
  added: [lz-string, "@types/lz-string"]
  patterns: [fetch-text-decompress-parse pipeline]

key-files:
  created: []
  modified:
    - app/package.json
    - app/src/lib/constants.ts
    - app/src/lib/metadata/boot.ts

key-decisions:
  - "Use decompressFromUTF16 named import from lz-string (matches backend compressToUTF16)"
  - "Pipeline: res.text() → decompressFromUTF16 → JSON.parse (compressed blob is not valid JSON)"
  - "Throw on null decompression result — same UX as fetch failure (error state + retry)"
  - "No changes to cache format, boot flow, or UI — minimal diff"

patterns-established:
  - "Compressed metadata pipeline: fetch as text, decompress, then parse"

requirements-completed: [DSRC-01, DSRC-02, DCMP-01, DCMP-02, DCMP-03, DCMP-04, DCMP-05]

# Metrics
duration: 5min
completed: 2026-02-24
---

# Phase 22 Plan 01: Switch to Compressed Data Source Summary

**lz-string decompression added to metadata fetch pipeline, METADATA_URL switched to new compressed blob at sprestapiexplorernew.blob.core.windows.net — ~75% network savings**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-02-24T01:10:00Z
- **Completed:** 2026-02-24T01:18:35Z
- **Tasks:** 2 (1 auto + 1 human-verify checkpoint)
- **Files modified:** 4 (package.json, package-lock.json, constants.ts, boot.ts)

## Accomplishments
- Installed lz-string + @types/lz-string as dependencies
- Switched METADATA_URL from old uncompressed blob to new compressed blob
- Wired decompressFromUTF16 into fetchFresh() pipeline with null-check error handling
- Preserved all existing boot logic (cache, revalidation, hydration)

## Task Commits

Each task was committed atomically:

1. **Task 1: Install lz-string and wire decompression into fetch pipeline** - `fac0e01` (feat)
2. **Task 1.5: Fix METADATA_URL hostname typo** - `8b1ac13` (fix) — continuation fix after checkpoint

**Plan metadata:** (pending final commit)

## Files Created/Modified
- `app/package.json` — Added lz-string dependency and @types/lz-string devDependency
- `app/package-lock.json` — Lock file updated
- `app/src/lib/constants.ts` — METADATA_URL changed to sprestapiexplorernew.blob.core.windows.net compressed blob
- `app/src/lib/metadata/boot.ts` — Added decompressFromUTF16 import and rewired fetchFresh() pipeline

## Decisions Made
- Used named import `{ decompressFromUTF16 }` from lz-string (matches backend convention)
- Pipeline: `res.text()` → `decompressFromUTF16()` → `JSON.parse()` (compressed blob is not valid JSON)
- Throw descriptive error on null decompression result — same UX as fetch failure
- No changes to bootMetadata(), retryBoot(), hydrate(), or cache logic — minimal diff

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed METADATA_URL hostname typo**
- **Found during:** Task 2 (checkpoint:human-verify) — user reported issue
- **Issue:** URL had `sprestexplorernew` instead of `sprestapiexplorernew` (missing "api")
- **Fix:** Corrected hostname in constants.ts, PLAN.md, CONTEXT.md, ROADMAP.md, REQUIREMENTS.md, PROJECT.md
- **Files modified:** app/src/lib/constants.ts, .planning/phases/22-*/22-01-PLAN.md, .planning/phases/22-*/22-CONTEXT.md, .planning/ROADMAP.md, .planning/REQUIREMENTS.md, .planning/PROJECT.md
- **Verification:** Build passes, URL now correct
- **Committed in:** 8b1ac13

---

**Total deviations:** 1 auto-fixed (1 bug — typo in URL)
**Impact on plan:** Typo was in the plan itself (wrong hostname). Fixed across all documentation and code. No scope creep.

## Issues Encountered
- METADATA_URL hostname was wrong in the original plan (sprestexplorernew vs sprestapiexplorernew). The typo propagated from planning docs into the implementation. Fixed in continuation after user reported during verification checkpoint.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 22 complete (single plan) — ready for v2.1 milestone completion
- All 7 requirements (DSRC-01, DSRC-02, DCMP-01-05) implemented
- User verification pending: cold start, warm start, and network transfer size confirmation in browser

## Self-Check: PASSED

- All key files exist on disk (package.json, constants.ts, boot.ts)
- All commits found in git log (fac0e01, 8b1ac13)

---
*Phase: 22-switch-to-compressed-data-source*
*Completed: 2026-02-24*
