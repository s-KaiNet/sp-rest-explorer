# Phase 24: Diff Engine - Context

**Gathered:** 2026-02-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Port DiffGenerator from az-funcs/ to app/src/lib/ and wire a client-side pipeline that fetches the current metadata blob and a historical monthly blob, decompresses both with lz-string, and computes a structured diff (DiffChanges) describing added, updated, and removed entities and root functions. This phase delivers the computation engine only — no UI rendering (Phase 25+).

</domain>

<decisions>
## Implementation Decisions

### Blob fetch strategy
- Fetch historical blob **on-demand** when the user navigates to the changelog page — not at boot
- Reuse the **in-memory metadata singleton** (from `getMetadata()` / metadata-store) for the "current" side of the diff — no re-fetch needed
- Fetch **compressed** historical blobs (`.zip.json` format), decompress with lz-string `decompressFromUTF16` — same pattern as boot
- **No caching** of historical blobs this phase — fetch fresh each time (IndexedDB caching is deferred as CHLG-FUT-03)

### Diff result storage & reactivity
- Store diff result as a **module-level singleton** with `useSyncExternalStore` — same pattern as metadata-store
- **Dedicated loading/error/ready status** within the diff module itself — independent from the global app-store status
- **Recompute from scratch** when the selected range changes (Phase 27) — no caching of multiple diff results
- Output is a **UI-ready DiffChanges object** (entities with change types, property lists, function lists) — the full transform pipeline lives in Phase 24, not deferred to rendering phases

### DiffGenerator porting decisions
- Keep the **SP.Data.* property filter** — these auto-generated list schema entities are noise in the changelog
- Code lives in **`app/src/lib/diff/`** — new directory parallel to `lib/metadata/`
- Use **jsondiffpatch** as the diff library (ESM import, not legacy CommonJS require)
- Port includes both DiffGenerator logic AND the delta-to-DiffChanges transformation — full pipeline in one phase

### Historical blob availability
- If a monthly blob returns **404**: show an empty state ("No historical data available for this period") — fail gracefully, don't crash
- If a fetch fails due to **network error**: show a clear error message with a "Try again" button — same error UX pattern as the main boot flow
- **Default comparison**: current metadata vs the blob from one month ago (e.g., in Feb 2026, fetch `2026y_m1_metadata.zip.json`)
- Extract a **shared base URL constant** in constants.ts — both METADATA_URL and historical blob URLs derive from it (single point of change if storage account changes)

### Claude's Discretion
- Whether to keep the DiffGenerator as a class or convert to plain exported functions (codebase leans toward functions)
- Internal module structure within `app/src/lib/diff/` (file names, how to split responsibilities)
- Exact typing for the jsondiffpatch delta intermediate format
- Whether `fixJson` preprocessing stays as a separate function or gets inlined

</decisions>

<specifics>
## Specific Ideas

- The legacy DiffGenerator source is at `az-funcs/src/diffGenerator.ts` — use as the implementation reference
- Legacy interfaces at `az-funcs/src/interfaces/diffChanges.ts` and `az-funcs/src/interfaces/diffResult.ts` — port the DiffChanges/DiffEntity/DiffFunction/ChangeType types
- Historical blob URL pattern: `https://sprestapiexplorernew.blob.core.windows.net/api-files/{year}y_m{month}_metadata.zip.json` (1-indexed months)
- The `fixJson` step re-keys functions by a unique composite name (`parentObject-name-returnType`) so jsondiffpatch can match them correctly across snapshots — this logic must be preserved
- Existing boot.ts `fetchFresh()` pattern (fetch → res.text() → decompressFromUTF16 → JSON.parse) should be reused for historical blob fetching

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 24-diff-engine*
*Context gathered: 2026-02-25*
