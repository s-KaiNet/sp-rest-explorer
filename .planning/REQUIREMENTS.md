# Requirements: SP REST API Explorer — v1.3 Improvements

**Defined:** 2026-02-17
**Core Value:** Developers can find any SharePoint REST API endpoint — at any nesting depth — in seconds, and immediately understand its parameters, return types, and navigation properties.

## v1.3 Requirements

Requirements for this milestone. Each maps to roadmap phases.

### Search UX

- [ ] **SRCH-06**: Search input treats dots literally — "SP.File" matches only items containing the exact substring "SP.File", not all items matching "SP" and "File" separately
- [ ] **SRCH-07**: Collapsing a search result group does not cause the group label to visually jump; the entire group header row is clickable (with pointer cursor), not just the collapse icon
- [ ] **SRCH-08**: API Endpoints search results are sorted by path length (shortest paths first)
- [ ] **SRCH-09**: Search result items show hover highlight and pointer cursor

### Entity Detail

- [ ] **ENTD-12**: Nullable column on entity properties page shows "no" when a property has `"nullable": false`, and "yes" in all other cases

### Layout

- [ ] **LAYO-01**: Explore API breadcrumb is rendered inside the main content area, not in the header/chrome

## Future Requirements

Deferred to future milestones. Tracked but not in current roadmap.

### API Changelog

- **CHLG-01 through CHLG-06**: API Changelog view (monthly diffs, summary stats, filter chips)

### Infrastructure

- **ADDL-02**: GitHub Actions CI/CD auto-deployment

## Out of Scope

| Feature | Reason |
|---------|--------|
| "Try It" / API Playground | Static SPA, no backend, no SharePoint auth |
| Code sample generation | Metadata has no HTTP methods or request bodies |
| AI-powered search / chat | MiniSearch is better for structured metadata search |
| Mobile-optimized UX | Desktop only, data density makes mobile impractical |
| Full-tree visualization | 2,449 entities = unreadable hairball |
| PnPjs code snippets | High value but requires mapping logic, consider post-launch |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SRCH-06 | — | Pending |
| SRCH-07 | — | Pending |
| SRCH-08 | — | Pending |
| SRCH-09 | — | Pending |
| ENTD-12 | — | Pending |
| LAYO-01 | — | Pending |

**Coverage:**
- v1.3 requirements: 6 total
- Mapped to phases: 0
- Unmapped: 6 (awaiting roadmap)

---
*Requirements defined: 2026-02-17*
*Last updated: 2026-02-17 after initial definition*
