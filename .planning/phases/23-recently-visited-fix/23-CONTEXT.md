# Phase 23: Recently visited fix - Context

**Gathered:** 2026-02-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix three bugs in the recently visited feature: (1) clear button doesn't purge in-memory state across components causing old entries to reappear, (2) entity type icon shows as Box instead of Braces when selected from search, (3) endpoint icons always show function icon regardless of actual type (function vs navProperty). No new capabilities — pure bug fix.

</domain>

<decisions>
## Implementation Decisions

### State architecture for clear (Bug #1)
- Migrate from independent `useState` hooks to a **new standalone Zustand store** (`recently-visited-store.ts`)
- Use **Zustand persist middleware** for localStorage persistence — handles hydration, serialization, and storage automatically
- Keep the existing `useRecentlyVisited` hook as a **thin wrapper** around the Zustand store for API compatibility — minimal changes to consumers
- `clearAll` becomes atomic across all consumers since they share a single store instance

### Search kind propagation (Bugs #2 and #3)
- **Expand `SearchSelection` type** to use a single `kind` field with all specific types: `'entity' | 'function' | 'navProperty' | 'root'`
- Remove the `kindMap` in `App.tsx` — CommandPalette emits the correct kind, App.tsx passes it **straight through** to `addVisit` with no mapping
- Root-level endpoints (depth-2, direct children of `/_api`) should be recorded as kind `'root'` — consistent with `ExplorePage` behavior
- Entity selections from search store `kind: 'entity'` directly — no remapping to 'root'

### Icon correctness rules
- **Keep current icon mapping as-is**: root=Box (green), function=Zap (amber), navProperty=Compass (blue), entity=Braces (orange)
- The icons themselves are correct — the bug is in the kind assignment, not the icon mapping
- **Clear old localStorage data on store upgrade** — fresh start, no migration of buggy entries
- **Search result icons are fine** — no changes needed to CommandPalette's icon rendering, only fix the recently visited kind assignment

### Claude's Discretion
- Exact Zustand store file structure and naming conventions
- How to handle the localStorage version/migration in persist middleware
- Whether to use Zustand selectors or direct store access in the thin wrapper hook
- Test approach for verifying the fixes

</decisions>

<specifics>
## Specific Ideas

- Search icons in CommandPalette are already correct — the user confirmed no issues there. The fix is scoped to how kinds flow from search selection to recently visited entries only.
- The `endpointKind` is already computed inside CommandPalette but never propagated through `SearchSelection`. This existing computation should be leveraged rather than recomputed.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 23-recently-visited-fix*
*Context gathered: 2026-02-24*
