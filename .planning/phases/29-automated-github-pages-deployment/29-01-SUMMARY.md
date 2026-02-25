---
phase: 29-automated-github-pages-deployment
plan: 01
subsystem: infra
tags: [github-actions, ci-cd, vite, github-pages, deployment]

# Dependency graph
requires: []
provides:
  - GitHub Actions workflow for automated GitHub Pages deployment
  - Vite build output to app/dist/ (no longer ../docs)
  - .gitignore blocking docs/ and app/dist/ from being committed
affects: [29-02]

# Tech tracking
tech-stack:
  added: [github-actions, actions/deploy-pages@v4, actions/upload-pages-artifact@v3]
  patterns: [ci-cd-pipeline, automated-deployment]

key-files:
  created:
    - .github/workflows/deploy.yml
  modified:
    - app/vite.config.ts
    - .gitignore
    - app/tsconfig.app.json
    - app/src/lib/diff/compute-diff.ts

key-decisions:
  - "Trigger on master branch (not main) — repo default branch is master"
  - "Widen objectHash return type to string|undefined and add ES2023 lib for toSorted — CI strict mode catches errors dev mode doesn't"
  - "Single build-and-deploy job — simple pipeline, no need for separate jobs"

patterns-established:
  - "CI/CD: GitHub Actions workflow with concurrency group cancelling in-progress runs"
  - "Build output in app/dist/ (inside project root), not ../docs (outside project root)"

requirements-completed: [CICD-01, CICD-02, CICD-03, CICD-04, BLDG-01, BLDG-02, REPO-02]

# Metrics
duration: ~30min
completed: 2026-02-25
---

# Phase 29 Plan 01: CI/CD Pipeline + Build Config Summary

**GitHub Actions workflow deploying to GitHub Pages on push to master, with Vite build output redirected to app/dist/ and .gitignore updated to block build artifacts**

## Performance

- **Duration:** ~30 min (across multiple sessions including checkpoint)
- **Started:** 2026-02-25
- **Completed:** 2026-02-25T22:10:00Z
- **Tasks:** 3 (2 auto + 1 checkpoint:human-verify)
- **Files modified:** 5

## Accomplishments
- Created GitHub Actions CI/CD pipeline that builds and deploys frontend on every push to master
- Changed Vite build output from `../docs` to `dist` (inside app/ directory)
- Updated .gitignore to block both `docs/` and `app/dist/` from being committed
- Live site verified working at https://nicklasmansson.github.io/sp-rest-explorer/

## Task Commits

Each task was committed atomically:

1. **Task 1: Create GitHub Actions deployment workflow** — `68280d5` (feat)
2. **Task 2: Update Vite build output and .gitignore** — `3965073` (feat)
3. **Task 3: Verify automated deployment works** — checkpoint approved by user (no commit)

**Fix commits (deviations):**
- `5e9173f` — fix(29-01): resolve TS build errors for CI
- `005a703` — fix(29-01): trigger workflow on master branch, not main

## Files Created/Modified
- `.github/workflows/deploy.yml` — GitHub Actions workflow for automated GitHub Pages deployment
- `app/vite.config.ts` — Changed outDir from `../docs` to `dist`, removed emptyOutDir
- `.gitignore` — Added `docs/` and `app/dist/` entries
- `app/tsconfig.app.json` — Added ES2023 to lib array for toSorted support
- `app/src/lib/diff/compute-diff.ts` — Widened objectHash return type to `string | undefined`

## Decisions Made
- **master vs main:** Repository default branch is `master`, not `main`. Workflow trigger updated accordingly.
- **TS strict mode fixes:** CI builds with stricter type checking than local dev. Fixed objectHash return type and added ES2023 lib for Array.toSorted().
- **Single job:** Used single `build-and-deploy` job (not separate build/deploy jobs) for simplicity.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] TypeScript build errors in CI**
- **Found during:** Post-Task 2 (CI pipeline execution)
- **Issue:** CI build failed — `objectHash` had wrong return type (string instead of string|undefined) and `Array.toSorted()` needed ES2023 lib
- **Fix:** Widened objectHash return type, added `"ES2023"` to tsconfig.app.json lib array
- **Files modified:** `app/src/lib/diff/compute-diff.ts`, `app/tsconfig.app.json`
- **Verification:** CI build passes
- **Committed in:** `5e9173f`

**2. [Rule 1 - Bug] Workflow triggered on wrong branch name**
- **Found during:** Post-Task 2 (CI pipeline execution)
- **Issue:** Workflow was configured for `main` branch but repo default branch is `master`
- **Fix:** Changed workflow trigger from `main` to `master`
- **Files modified:** `.github/workflows/deploy.yml`
- **Verification:** Workflow triggers on push to master
- **Committed in:** `005a703`

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Both fixes were necessary for CI pipeline to work. No scope creep — these are corrections to the planned work.

## Issues Encountered
None beyond the deviations documented above.

## User Setup Required

**GitHub Pages must be configured for GitHub Actions deployment.** One-time manual step:
- Go to repo Settings → Pages → Source → select "GitHub Actions" (instead of "Deploy from a branch")
- **Status:** Completed (verified during checkpoint — live site works)

## Next Phase Readiness
- CI/CD pipeline is live and verified — automated deployment works
- Ready for Plan 02 (29-02): Delete committed docs/ folder from repository
- The docs/ fallback is now redundant since GitHub Actions deploys from app/dist/

## Self-Check: PASSED

- All 6 key files verified on disk
- All 4 commit hashes verified in git log

---
*Phase: 29-automated-github-pages-deployment*
*Completed: 2026-02-25*
