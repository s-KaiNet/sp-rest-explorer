# Requirements: SP REST API Explorer — New UI

**Defined:** 2026-02-12
**Core Value:** Developers can find any SharePoint REST API endpoint — at any nesting depth — in seconds, and immediately understand its parameters, return types, and navigation properties.

## v1.1 Requirements

Requirements for milestone v1.1: Search, Types & Polish. Each maps to roadmap phases.

### Search

- [ ] **SRCH-01**: User can open command palette with Cmd+K / Ctrl+K keyboard shortcut
- [ ] **SRCH-02**: User can type a query and see matching entities, functions, and properties in real-time
- [ ] **SRCH-03**: User can select a search result and navigate directly to that item's detail view
- [ ] **SRCH-04**: Search results are grouped by kind (entities, functions, properties) for scannability

### Types

- [ ] **TYPE-01**: User can browse a flat filterable list of all complex types and enum types in the sidebar
- [ ] **TYPE-02**: User can click a type to see its full definition (properties for complex types, members for enums)
- [ ] **TYPE-03**: User can see the inheritance chain for a type (base type and derived types)
- [ ] **TYPE-04**: User can see which entities and functions reference a type (precomputed used-by index)
- [ ] **TYPE-05**: User can click any type reference in Explore API views to jump to its detail in Explore Types
- [ ] **TYPE-06**: User can navigate to Explore Types from the main header navigation

### Navigation

- [ ] **NAV-03**: User can copy the _api/... path to clipboard via a button in the breadcrumb bar

### Content

- [ ] **INFO-01**: User can view a How It Works page explaining where metadata comes from and how the app works
- [ ] **INFO-02**: User can navigate to How It Works from the home screen or header

## Future Requirements

Deferred to future milestones. Tracked but not in current roadmap.

### Search

- **SRCH-05**: Command palette shows recently visited items when opened with no query

### Changelog

- **CHLG-01**: User can view a list of monthly API metadata snapshots
- **CHLG-02**: User can view a diff summary between two consecutive snapshots
- **CHLG-03**: User can see summary stats (added, removed, modified counts) for each diff
- **CHLG-04**: User can filter changelog entries by kind (entity, function, property)
- **CHLG-05**: User can click a changed item to navigate to its current detail view
- **CHLG-06**: User can see which API version introduced a specific entity or function

### Infrastructure

- **ADDL-02**: GitHub Actions CI/CD auto-deployment on push to main

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Full search page / route | CommandDialog sufficient for quick-jump; full search page adds complexity without clear value |
| Type graph visualization | 2,449 entities = unreadable hairball; flat list + detail is more practical |
| Mobile-optimized types view | Desktop only per v1 constraint |
| "Try It" / API Playground | Static SPA, no backend, no SharePoint auth |
| PnPjs code snippets | High value but requires mapping logic, consider post-launch |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SRCH-01 | — | Pending |
| SRCH-02 | — | Pending |
| SRCH-03 | — | Pending |
| SRCH-04 | — | Pending |
| TYPE-01 | — | Pending |
| TYPE-02 | — | Pending |
| TYPE-03 | — | Pending |
| TYPE-04 | — | Pending |
| TYPE-05 | — | Pending |
| TYPE-06 | — | Pending |
| NAV-03 | — | Pending |
| INFO-01 | — | Pending |
| INFO-02 | — | Pending |

**Coverage:**
- v1.1 requirements: 13 total
- Mapped to phases: 0
- Unmapped: 13 (pending roadmap creation)

---
*Requirements defined: 2026-02-12*
*Last updated: 2026-02-12 after initial definition*
