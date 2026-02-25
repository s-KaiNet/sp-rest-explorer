# Phase 29: Automated GitHub Pages Deployment - Context

**Gathered:** 2026-02-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace the committed `docs/` build output with a GitHub Actions CI/CD pipeline that automatically builds and deploys the frontend to GitHub Pages on push to main. The `docs/` folder is removed from the repository and `app/dist/` becomes the build output directory (never committed). The live site continues working at `https://{user}.github.io/sp-rest-explorer/`.

</domain>

<decisions>
## Implementation Decisions

### Trigger branch strategy
- Workflow triggers on push to `main` branch (not gh-pages)
- Include `workflow_dispatch` for manual re-deploys from the Actions UI
- Use concurrency group with `cancel-in-progress: true` — only the latest push deploys
- Document the manual step: user must switch GitHub Pages source from "Deploy from a branch" to "GitHub Actions" in Settings > Pages before the first deploy

### Workflow scope & configuration
- No path filters — workflow runs on every push to main (Vite builds are fast, avoids edge cases)
- Pin to Node.js 22 (latest LTS)
- Enable npm caching via `actions/setup-node` built-in `cache: 'npm'` option
- Working directory approach for `app/` subdirectory: Claude's discretion (defaults block vs per-step)

### Build failure handling
- GitHub default email notifications only — no extra notification integrations
- No separate `tsc --noEmit` step — Vite build catches critical errors, keep CI fast
- No retry logic on deploy failure — re-run manually if needed
- No branch protection rules — single-developer project, deferred to CICD-FUT-02

### Transition plan (two-step cutover)
- **Step 1 (PR 1):** Add GitHub Actions workflow file + change Vite `build.outDir` from `'../docs'` to `'dist'` + update root `.gitignore`. Switch Pages source setting to "GitHub Actions" before merging. Verify the GH Actions deploy serves the site correctly.
- **Step 2 (PR 2):** Delete the committed `docs/` folder from the repository. Immediate — no waiting period after step 1 confirmation.
- `.gitignore` changes go in the root `.gitignore` (add `docs/` and `app/dist/`), not in `app/.gitignore`

### Claude's Discretion
- YAML structure: `defaults.run.working-directory` vs per-step working-directory
- Exact workflow job/step naming
- Order of steps within the workflow
- Any additional workflow permissions beyond the required `pages: write` and `id-token: write`

</decisions>

<specifics>
## Specific Ideas

- Two-step cutover was explicitly chosen over atomic single-PR to allow verifying the GH Actions deploy works before removing the docs/ fallback
- The existing `actions/upload-pages-artifact` + `actions/deploy-pages` pattern from CICD-04 requirement is the expected deploy mechanism
- `cache-dependency-path` should point to `app/package-lock.json` since the frontend is in a subdirectory

</specifics>

<deferred>
## Deferred Ideas

- Build caching for faster CI runs beyond npm cache — CICD-FUT-01
- Branch protection rules for gh-pages/main — CICD-FUT-02
- Build status badges in README — CICD-FUT-03
- Separate type checking CI step — could be added later if type errors slip through

</deferred>

---

*Phase: 29-automated-github-pages-deployment*
*Context gathered: 2026-02-25*
