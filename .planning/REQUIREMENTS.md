# Requirements: SP REST API Explorer — New UI

**Defined:** 2026-02-15
**Core Value:** Developers can find any SharePoint REST API endpoint — at any nesting depth — in seconds, and immediately understand its parameters, return types, and navigation properties.

## v1.2 Requirements

Requirements for v1.2 UI Improvements. Each maps to roadmap phases.

### Sidebar & Navigation

- [ ] **SIDE-01**: Explore API sidebar does not show horizontal scrollbar during forward navigation animation
- [ ] **SIDE-02**: Explore API sidebar groups root-level items by namespace (like Explore Types), with "No Group" shown first for items without a namespace
- [ ] **SIDE-03**: Root indicator badge is positioned on the right side of Explore API sidebar items, consistent with function/nav property badges
- [ ] **SIDE-04**: Recently visited component includes navigation to /entities path and shows recently visited Types from the Explore Types surface

### Home & Branding

- [ ] **HOME-01**: Home page displays site icon next to "SharePoint REST API Explorer" title (icon then label, same row)
- [ ] **HOME-02**: Home page stats show approximate values: 3.5k+ functions, 2.4k entities, 11k+ properties, 60k+ endpoints
- [ ] **HOME-03**: Explore API home screen shows a centered layout with welcome message, stats, and help text (similar to Explore Types home screen)

### Visual Polish

- [ ] **VISU-01**: Cmd+K search modal borders in dark mode are subdued/darker instead of too bright
- [ ] **VISU-02**: "Entity Type" and "Complex Type" badges are removed from all places in the app

## Future Requirements

### Deferred from previous milestones

- **CHLG-01 through CHLG-06**: API Changelog view (monthly diffs, summary stats, filter chips)
- **ADDL-02**: GitHub Actions CI/CD auto-deployment

## Out of Scope

| Feature | Reason |
|---------|--------|
| Mobile responsive layout | Desktop only per project constraints |
| New search capabilities | Search is stable from v1.1, no changes needed |
| API Changelog | Deferred to future milestone |
| "Try It" / API Playground | No backend, no SharePoint auth |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SIDE-01 | — | Pending |
| SIDE-02 | — | Pending |
| SIDE-03 | — | Pending |
| SIDE-04 | — | Pending |
| HOME-01 | — | Pending |
| HOME-02 | — | Pending |
| HOME-03 | — | Pending |
| VISU-01 | — | Pending |
| VISU-02 | — | Pending |

**Coverage:**
- v1.2 requirements: 9 total
- Mapped to phases: 0
- Unmapped: 9

---
*Requirements defined: 2026-02-15*
*Last updated: 2026-02-15 after initial definition*
