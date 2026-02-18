# Requirements: SP REST API Explorer — v1.4 Unify Icons

**Defined:** 2026-02-18
**Core Value:** Developers can find any SharePoint REST API endpoint — at any nesting depth — in seconds, and immediately understand its parameters, return types, and navigation properties.

## v1.4 Requirements

Requirements for this milestone. Each maps to roadmap phases.

### Icon System

- [x] **ICON-01**: User sees distinct Lucide icons for each of the 4 API types (root, nav property, function, type/entity)
- [x] **ICON-02**: A reusable TypeIcon component renders the correct icon and color given a kind
- [x] **ICON-03**: Root endpoints use a dedicated `--type-root` CSS color token (green, OKLCH hue 155)
- [x] **ICON-04**: Types/entities use an orange/amber `--type-entity` CSS color token (OKLCH hue ~75-85) distinct from root green

### Explore API

- [x] **EAPI-01**: Explore API sidebar displays type icons to the left of entry labels (`[icon] Label`)
- [x] **EAPI-02**: Explore API sidebar uses Lucide icons instead of `FN`, `NAV`, `<>` text badges
- [x] **EAPI-03**: Explore API welcome screen uses updated Lucide icon with correct type color
- [x] **EAPI-04**: Root-level namespace-grouped entries show type icons consistent with the new icon system

### Cross-View Consistency

- [x] **XVEW-01**: Cmd+K search modal results display Lucide icons instead of `<>`, `ƒ`, `NAV` text symbols
- [x] **XVEW-02**: "Root" pill badge is removed from individual search result items
- [x] **XVEW-03**: Home page recently visited cards display Lucide icons matching the new icon system
- [x] **XVEW-04**: Explore Types welcome screen uses updated Lucide icon with correct type color
- [x] **XVEW-05**: Explore Types sidebar uses Lucide icons consistent with the new icon system

### Entity Link Colors

- [x] **LINK-01**: Entity type links (e.g., SP.Alert, SP.Group) render in the entity type color (orange/amber `--type-entity`) instead of hardcoded emerald green
- [x] **LINK-02**: Collection wrapper links (e.g., "Collection" prefix) remain muted-foreground, only the inner type name uses entity color

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
| Stats row / table color updates | Not icon-related, existing colors work fine in context |
| Breadcrumb segment color changes | Not icon-related, defer to future visual polish |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| ICON-01 | Phase 13 | Complete |
| ICON-02 | Phase 13 | Complete |
| ICON-03 | Phase 13 | Complete |
| ICON-04 | Phase 13 | Complete |
| EAPI-01 | Phase 14 | Complete |
| EAPI-02 | Phase 14 | Complete |
| EAPI-03 | Phase 14 | Complete |
| EAPI-04 | Phase 14 | Complete |
| XVEW-01 | Phase 15 | Complete |
| XVEW-02 | Phase 15 | Complete |
| XVEW-03 | Phase 15 | Complete |
| XVEW-04 | Phase 15 | Complete |
| XVEW-05 | Phase 15 | Complete |
| LINK-01 | Phase 16 | Planned |
| LINK-02 | Phase 16 | Planned |

**Coverage:**
- v1.4 requirements: 15 total
- Mapped to phases: 15 ✓
- Unmapped: 0

---
*Requirements defined: 2026-02-18*
*Last updated: 2026-02-18 after roadmap creation*
