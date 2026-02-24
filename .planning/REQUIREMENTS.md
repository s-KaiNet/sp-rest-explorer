# Requirements: SP REST API Explorer — New UI

**Defined:** 2026-02-24
**Core Value:** Developers can find any SharePoint REST API endpoint — at any nesting depth — in seconds, and immediately understand its parameters, return types, and navigation properties.

## v2.1 Requirements

Requirements for milestone v2.1 Connect Frontend. Each maps to roadmap phases.

### Data Source

- [ ] **DSRC-01**: Frontend fetches metadata from `sprestexplorernew.blob.core.windows.net/api-files/metadata.latest.zip.json` instead of the old storage account
- [ ] **DSRC-02**: METADATA_URL constant updated in a single location (`constants.ts`)

### Decompression

- [ ] **DCMP-01**: lz-string added as a frontend production dependency
- [ ] **DCMP-02**: Fetched compressed payload is decompressed using `decompressFromUTF16` before JSON.parse
- [ ] **DCMP-03**: Boot pipeline works end-to-end: fetch compressed blob → decompress → parse → hydrate → app ready
- [ ] **DCMP-04**: IndexedDB cache continues to store the decompressed Metadata object (no change to cache format)
- [ ] **DCMP-05**: Background revalidation fetches and decompresses the compressed blob

## Future Requirements

Deferred to future release. Tracked but not in current roadmap.

### API Changelog

- **CHLG-01** through **CHLG-06**: API Changelog view (monthly diffs, summary stats, filter chips)

### CI/CD

- **ADDL-02**: GitHub Actions CI/CD auto-deployment

## Out of Scope

| Feature | Reason |
|---------|--------|
| Fallback to uncompressed blob | Adds complexity for minimal benefit — compressed blob is reliable |
| Fallback to old storage account | Old account will be decommissioned; clean switch preferred |
| Remove legacy `az-funcs/` directory | Cleanup task, not related to data source wiring |
| Change IndexedDB cache format | Cache already stores decompressed Metadata objects; no reason to change |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DSRC-01 | — | Pending |
| DSRC-02 | — | Pending |
| DCMP-01 | — | Pending |
| DCMP-02 | — | Pending |
| DCMP-03 | — | Pending |
| DCMP-04 | — | Pending |
| DCMP-05 | — | Pending |

**Coverage:**
- v2.1 requirements: 7 total
- Mapped to phases: 0
- Unmapped: 7 ⚠️

---
*Requirements defined: 2026-02-24*
*Last updated: 2026-02-24 after initial definition*
