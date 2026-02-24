# Phase 22: Switch to Compressed Data Source - Context

**Gathered:** 2026-02-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Frontend loads metadata from the new backend's compressed blobs with lz-string decompression, delivering ~75% network savings while preserving the existing app experience. The METADATA_URL is updated to point to `sprestexplorernew.blob.core.windows.net/api-files/metadata.latest.zip.json`, lz-string is added as a dependency, and the boot pipeline (fetch → decompress → parse → hydrate) works end-to-end for both cold and warm starts. IndexedDB cache continues to store decompressed Metadata objects.

</domain>

<decisions>
## Implementation Decisions

### Cutover strategy
- Hard switch: change METADATA_URL in constants.ts to the new compressed blob URL
- No fallback to old uncompressed URL — if fetch fails, show existing error state with retry
- Remove old URL entirely from codebase (git history preserves it)
- Bare fetch() with no additional headers — same as current approach (Azure Blob Storage handles caching via its own response headers)

### Cache migration
- Keep same CACHE_KEY (`sp-explorer-metadata`) — no key change
- Natural overwrite via stale-while-revalidate: returning users load old cached data instantly, background revalidation fetches compressed blob, decompresses, and overwrites cache for next visit
- CachedMetadata shape stays `{ data: Metadata, timestamp: number }` — no version field, no shape changes
- No staleness/TTL checks — timestamp continues to be written but not read
- If cached data fails hydration (bad shape from old version): catch the error, clear the cache entry, fall through to cold-start path (fetch fresh from new URL)

### Decompression error handling
- If decompressFromUTF16 returns null, treat as an error — throw with descriptive message
- Decompression failure is treated same as fetch failure: show existing error state with retry button
- Modify fetchFresh() inline to add decompression — callers don't change, minimal diff
- User-facing error stays generic ("Failed to load metadata") — decompression details go to the thrown Error message for developer debugging
- No automatic retry before showing error — user clicks retry manually

### Boot UX during transition
- Single loading state — no change to loading indicator. Decompression is sub-second and imperceptible
- Cache-only background revalidation — no hot-swap of live data mid-session (same as current behavior)
- No console.log debug logging for decompression stats — verify savings via DevTools Network tab
- Fetch pipeline: `res.text()` → `decompressFromUTF16()` → `JSON.parse()` → return as Metadata (the compressed blob is a UTF-16 encoded string, not valid JSON, so res.json() cannot be used)

### Claude's Discretion
- Exact lz-string import style (named import vs default)
- Whether to add a brief code comment explaining the decompress step
- Error message wording in the thrown Error for decompression failures
- Any minor refactoring within fetchFresh to accommodate the new pipeline

</decisions>

<specifics>
## Specific Ideas

- The fetch pipeline must be: `fetch(URL)` → `res.text()` → `decompressFromUTF16(text)` → `JSON.parse(decompressed)` → `Metadata`
- lz-string's `decompressFromUTF16` is the specific function to use (matches the backend's `compressToUTF16`)
- The change should be minimal-diff — constants.ts URL change + fetchFresh() decompression addition + package.json dependency. No architectural changes
- Success criteria verification: check Network tab for ~557KB transfer size vs previous ~2.2MB

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 22-switch-to-compressed-data-source*
*Context gathered: 2026-02-24*
