# Requirements: SP REST API Explorer — New UI

**Defined:** 2026-02-25
**Core Value:** Developers can find any SharePoint REST API endpoint — at any nesting depth — in seconds, and immediately understand its parameters, return types, and navigation properties.

## v2.3 Requirements

Requirements for GH Pages milestone. Automate frontend deployment via GitHub Actions CI/CD.

### CI/CD Pipeline

- [ ] **CICD-01**: GitHub Actions workflow triggers on push to `gh-pages` branch and builds the frontend app
- [ ] **CICD-02**: Workflow uses Node.js setup with `npm ci` to install dependencies in `app/` directory
- [ ] **CICD-03**: Workflow builds frontend with `npm run build` producing `app/dist/` output
- [ ] **CICD-04**: Workflow deploys build output to GitHub Pages via `actions/upload-pages-artifact` and `actions/deploy-pages`

### Build Configuration

- [ ] **BLDG-01**: Vite `build.outDir` changed from `'../docs'` to `'dist'` (output stays inside `app/`)
- [ ] **BLDG-02**: Vite `base` path remains `/sp-rest-explorer/` (unchanged, verification only)

### Repo Cleanup

- [ ] **REPO-01**: Committed `docs/` folder deleted from repository
- [ ] **REPO-02**: `.gitignore` updated to exclude `docs/` and `app/dist/` build output directories

## Future Requirements

Deferred to future milestones. Tracked but not in current roadmap.

### CI/CD Enhancements

- **CICD-FUT-01**: Build caching for faster CI runs (node_modules cache)
- **CICD-FUT-02**: Branch protection rules for gh-pages branch
- **CICD-FUT-03**: Build status badges in README

## Out of Scope

| Feature | Reason |
|---------|--------|
| Backend deployment via GH Actions | Backend deploys to Azure Functions separately, different pipeline |
| Preview deployments for PRs | Adds complexity, not needed for single-developer project |
| E2E testing in CI | No test suite exists for frontend, would need to build first |
| Docker-based builds | Vite builds are fast enough without containerization |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| CICD-01 | — | Pending |
| CICD-02 | — | Pending |
| CICD-03 | — | Pending |
| CICD-04 | — | Pending |
| BLDG-01 | — | Pending |
| BLDG-02 | — | Pending |
| REPO-01 | — | Pending |
| REPO-02 | — | Pending |

**Coverage:**
- v2.3 requirements: 8 total
- Mapped to phases: 0
- Unmapped: 8 (pending roadmap creation)

---
*Requirements defined: 2026-02-25*
*Last updated: 2026-02-25 after initial definition*
