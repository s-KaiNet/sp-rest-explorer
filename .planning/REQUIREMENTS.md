# Requirements: SP REST API Explorer — New UI

**Defined:** 2026-02-25
**Core Value:** Developers can find any SharePoint REST API endpoint — at any nesting depth — in seconds, and immediately understand its parameters, return types, and navigation properties.

## v2.2 Requirements

Requirements for API Changelog milestone. Each maps to roadmap phases.

### Data Pipeline

- [x] **DATA-01**: User can view changelog computed by fetching compressed metadata.latest.zip.json and historical monthly blob via client-side download
- [x] **DATA-02**: App decompresses fetched blobs client-side using lz-string decompressFromUTF16
- [x] **DATA-03**: App computes diff using DiffGenerator class (ported from az-funcs/) with jsondiffpatch
- [x] **DATA-04**: User can select a range of 1-6 months; app compares current metadata vs the blob from N months ago for a merged cumulative diff

### Changelog UI

- [x] **VIEW-01**: User can navigate to an API Changelog page via a dedicated route
- [x] **VIEW-02**: User sees a summary bar with counts of added, updated, and removed entities/functions
- [x] **VIEW-03**: User sees expandable entity cards showing property-level and function-level changes
- [x] **VIEW-04**: User sees a root functions table showing added/updated/removed top-level functions
- [x] **VIEW-05**: User sees a friendly empty state when no changes exist for the selected period
- [x] **VIEW-06**: User sees change-type badges (New, Added, Removed, Updated) on entities and individual rows

### Filtering & Navigation

- [x] **FILT-01**: User can toggle filter chips to show/hide Added, Updated, and Removed changes
- [x] **FILT-02**: User can select a range (1-6 months) via a range selector control (default: 1 month)
- [ ] **FILT-03**: User can click entity names in the changelog to navigate to the Explore Types detail page
- [x] **FILT-04**: User sees "API Changelog" as a navigation entry in the app header

### Integration

- [x] **INTG-01**: Changelog route is registered in React Router with hash routing
- [x] **INTG-02**: Changelog page matches the app's existing dark mode, typography, and layout patterns
- [x] **INTG-03**: User sees a loading indicator while metadata blobs are being fetched and diff is being computed
- [x] **INTG-04**: App handles fetch failures and missing blobs gracefully with an error message

## Future Requirements

### Enhancements (deferred)

- **CHLG-FUT-01**: URL state for selected range (shareable changelog links)
- **CHLG-FUT-02**: Search within changelog results
- **CHLG-FUT-03**: IndexedDB caching for changelog blobs
- **CHLG-FUT-04**: Keyboard navigation within changelog cards

## Out of Scope

| Feature | Reason |
|---------|--------|
| Backend-computed diffs | Client-side is sufficient, avoids backend changes |
| Per-month tabs (independent diffs) | Cumulative merged view chosen over per-month tabs |
| Changelog RSS/Atom feed | No backend for feed generation |
| Diff for enum types | DiffGenerator focuses on entities and functions |
| Historical diffs beyond 6 months | Blob availability limited, diminishing value |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DATA-01 | Phase 24 | Complete |
| DATA-02 | Phase 24 | Complete |
| DATA-03 | Phase 24 | Complete |
| DATA-04 | Phase 27 | Complete |
| VIEW-01 | Phase 25 | Complete |
| VIEW-02 | Phase 25 | Complete |
| VIEW-03 | Phase 26 | Complete |
| VIEW-04 | Phase 26 | Complete |
| VIEW-05 | Phase 25 | Complete |
| VIEW-06 | Phase 26 | Complete |
| FILT-01 | Phase 27 | Complete |
| FILT-02 | Phase 27 | Complete |
| FILT-03 | Phase 27 | Pending |
| FILT-04 | Phase 25 | Complete |
| INTG-01 | Phase 25 | Complete |
| INTG-02 | Phase 25 | Complete |
| INTG-03 | Phase 25 | Complete |
| INTG-04 | Phase 25 | Complete |

**Coverage:**
- v2.2 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0

---
*Requirements defined: 2026-02-25*
*Last updated: 2026-02-25 — all 18 requirements mapped to phases 24-27*
