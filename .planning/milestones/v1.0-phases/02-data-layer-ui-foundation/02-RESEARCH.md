# Phase 2: Data Layer & UI Foundation - Research

**Researched:** 2026-02-11
**Domain:** Metadata loading, indexing, caching, and visual foundation (color system, typography, skeletons)
**Confidence:** HIGH

## Summary

Phase 2 transforms the Phase 1 app shell into a data-ready application. The core challenge is loading ~4.5MB of SharePoint REST API metadata from Azure Blob Storage, parsing it into usable structures, building a search index of ~6,500 items, and establishing the visual language (color-coded types, monospace code identifiers, skeleton loading states) that all subsequent phases depend on.

The metadata is a well-understood JSON blob with 2,450 entities and 3,534 functions (793 root, 2,741 bound). The data model from the old Vue app is stable and maps cleanly to TypeScript interfaces. The architectural centerpiece is storing this 4.5MB frozen singleton outside Zustand reactive state (via `useSyncExternalStore`) while using Zustand only for lightweight loading/error status. MiniSearch indexes 6,499 items (entities + root functions + nav properties + bound functions) with 19ms init time at this scale. IndexedDB caching via idb-keyval provides instant repeat-visit loads with background revalidation.

**Primary recommendation:** Build three cleanly separated layers: (1) metadata singleton module with `useSyncExternalStore`, (2) Zustand store for loading/error/ready status only, (3) pre-computed lookup Maps built once on load. Wire color tokens and typography into CSS custom properties following the existing shadcn/ui pattern so all phases inherit them automatically.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Loading & transition states
- Skeleton screens mimicking the actual layout (sidebar + content area shapes) during metadata fetch
- Header with navigation renders immediately on first paint — only the content area shows skeletons
- Nav links in header are clickable during loading — each route shows its own skeleton layout
- Real content fades in over ~200ms replacing the skeleton when metadata is ready
- CSS spinner in index.html as pre-React fallback (covers the ~200-800ms JSON.parse window noted in known risks)

#### Color-coded type system
- Blue for functions, green for entities, purple for navigation properties — applied as **text color only** in detail/content views
- Sidebar (Phase 3) gets small FN/NAV **badges** — list scanning context warrants the extra visual cue; detail views use color-only
- Entity type names styled as links everywhere: green text + underline (or underline on hover) — clear clickable affordance
- Same hue in both light and dark mode, with **adjusted brightness** for dark mode to maintain readability and contrast
- Define color tokens as CSS custom properties so they're reusable across all phases

#### Monospace & typography rules
- Inline code identifiers (type names, property names, method signatures) get a **subtle background tint** (light gray) like markdown inline `code` — clearly distinct from prose
- Claude's discretion on monospace font choice (system stack, JetBrains Mono, Fira Code — whatever balances load time and readability)
- Claude's discretion on code text sizing relative to body text
- Claude's discretion on table typography (code columns only vs full monospace) — optimize for readability

#### Error & offline states
- Metadata fetch failure shows an **error message with retry button** — no silent auto-retry
- Error replaces the **entire content area** — header stays visible, content zone becomes error message + retry button
- Error tone is **technical and direct**: "Failed to load API metadata from Azure. Check your connection and try again." — no fluff for a developer audience
- **Cache with revalidation**: cache metadata in IndexedDB, serve cached on load, fetch fresh in background — fast repeat visits, eventually consistent

### Claude's Discretion
- Monospace font choice (system stack vs web font)
- Code text sizing relative to body text (same size vs slightly smaller)
- Table typography approach (code columns only vs full monospace)
- Exact skeleton shimmer animation style
- IndexedDB cache eviction strategy and staleness threshold
- MiniSearch configuration and tokenizer details

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope

</user_constraints>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| zustand | 5.0.11 | Loading/error/ready state management | Already decided. Lightweight store for UI status flags only — metadata lives outside |
| minisearch | 7.2.0 | Full-text search index (~6.5K items) | Already decided. Native TS, returns full docs, 19ms init at this scale, simpler API than FlexSearch |
| idb-keyval | 6.2.2 | IndexedDB cache for metadata | Simplest Promise-based IndexedDB wrapper. 1KB gzipped. Perfect for single key-value caching |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react (useSyncExternalStore) | 19.2.0 | Subscribe to frozen metadata singleton | Already installed. Core React API for external stores |

### No New Dependencies Needed
The phase requires no libraries beyond zustand, minisearch, and idb-keyval. Everything else (CSS custom properties, skeleton animations, font stack) is built with existing Tailwind CSS 4 + standard CSS.

**Installation:**
```bash
cd app && npm install zustand minisearch idb-keyval
```

## Architecture Patterns

### Recommended Project Structure
```
app/src/
├── lib/
│   ├── utils.ts                  # Existing cn() utility
│   ├── metadata/
│   │   ├── types.ts              # TypeScript interfaces (Metadata, EntityType, FunctionImport, etc.)
│   │   ├── metadata-store.ts     # Frozen singleton + useSyncExternalStore integration
│   │   ├── lookup-maps.ts        # Pre-computed Maps (entityByFullName, functionById, parentChildren)
│   │   ├── search-index.ts       # MiniSearch index builder
│   │   └── metadata-cache.ts     # idb-keyval cache layer
│   └── constants.ts              # Azure URL, cache keys, etc.
├── stores/
│   └── app-store.ts              # Zustand store: loading/error/ready status only
├── hooks/
│   └── use-metadata.ts           # Hook combining useSyncExternalStore + Zustand status
├── components/
│   ├── layout/
│   │   ├── Header.tsx            # Existing
│   │   └── index.ts              # Existing
│   ├── theme/                    # Existing
│   ├── ui/
│   │   ├── skeleton.tsx          # Reusable skeleton building block
│   │   └── code-text.tsx         # <CodeText> for inline monospace identifiers
│   └── loading/
│       ├── ContentSkeleton.tsx   # Full content area skeleton (sidebar + main shapes)
│       └── ErrorState.tsx        # Error message + retry button component
├── pages/                        # Existing
└── styles/                       # Color tokens (or add to index.css)
```

### Pattern 1: Metadata Frozen Singleton with useSyncExternalStore
**What:** Store the 4.5MB metadata object as a module-level frozen singleton. React components subscribe to it via `useSyncExternalStore`. Zustand manages only the loading/error status.
**When to use:** Always — this is the core data access pattern for the entire app.
**Why:** Prevents Zustand from deep-cloning 4.5MB on every state change. `Object.freeze()` is essentially free (< 0.1ms measured). Components get reactive updates when metadata transitions from null to loaded.

```typescript
// lib/metadata/metadata-store.ts
import { useSyncExternalStore } from 'react'
import type { Metadata } from './types'

let metadata: Metadata | null = null
const listeners = new Set<() => void>()

function getSnapshot(): Metadata | null {
  return metadata
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

export function setMetadata(data: Metadata): void {
  metadata = Object.freeze(data) as Metadata
  listeners.forEach(cb => cb())
}

export function getMetadata(): Metadata | null {
  return metadata
}

/** React hook — reactive, triggers re-render when metadata loads */
export function useMetadataSnapshot(): Metadata | null {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
```

### Pattern 2: Zustand Store for UI Status Only
**What:** Minimal Zustand store tracking `status: 'idle' | 'loading' | 'ready' | 'error'` and `error: string | null`. No metadata in Zustand.
**When to use:** Any component that needs to show loading/error/ready states.

```typescript
// stores/app-store.ts
import { create } from 'zustand'

type AppStatus = 'idle' | 'loading' | 'ready' | 'error'

interface AppState {
  status: AppStatus
  error: string | null
  setStatus: (status: AppStatus, error?: string | null) => void
}

export const useAppStore = create<AppState>()((set) => ({
  status: 'idle',
  error: null,
  setStatus: (status, error = null) => set({ status, error }),
}))
```

### Pattern 3: Cache-Then-Revalidate with idb-keyval
**What:** On app mount, check IndexedDB for cached metadata. If found, use it immediately (instant load). Then fetch fresh from Azure in background. If fetch succeeds and data differs, update the singleton and IndexedDB.
**When to use:** Every app load.

```typescript
// lib/metadata/metadata-cache.ts
import { get, set } from 'idb-keyval'

interface CachedMetadata {
  data: Metadata
  timestamp: number
}

const CACHE_KEY = 'sp-explorer-metadata'
const MAX_AGE_MS = 24 * 60 * 60 * 1000 // 24 hours — data changes rarely

export async function getCachedMetadata(): Promise<Metadata | null> {
  try {
    const cached = await get<CachedMetadata>(CACHE_KEY)
    if (cached) return cached.data
  } catch {
    // IndexedDB unavailable (private browsing, etc.) — proceed without cache
  }
  return null
}

export async function setCachedMetadata(data: Metadata): Promise<void> {
  try {
    await set(CACHE_KEY, { data, timestamp: Date.now() })
  } catch {
    // Silently fail — cache is optional
  }
}
```

### Pattern 4: Pre-computed Lookup Maps
**What:** Build `Map<string, EntityType>`, `Map<number, FunctionImport>`, and a parent-children map once when metadata loads. These provide O(1) access for all navigation and detail views.
**When to use:** Built once on load, consumed by every phase.

```typescript
// lib/metadata/lookup-maps.ts
import type { Metadata, EntityType, FunctionImport } from './types'

export interface LookupMaps {
  entityByFullName: Map<string, EntityType>       // "SP.Web" → EntityType
  functionById: Map<number, FunctionImport>        // 2189 → FunctionImport
  entityChildren: Map<string, ChildEntry[]>        // "SP.Web" → [{name, type, ...}]
}

interface ChildEntry {
  name: string
  kind: 'function' | 'navProperty'
  /** For functions: function ID. For navProps: target entity fullName */
  ref: number | string
  returnType?: string
}

export function buildLookupMaps(metadata: Metadata): LookupMaps {
  const entityByFullName = new Map<string, EntityType>()
  const functionById = new Map<number, FunctionImport>()
  const entityChildren = new Map<string, ChildEntry[]>()

  // Index entities
  for (const [fullName, entity] of Object.entries(metadata.entities)) {
    entityByFullName.set(fullName, entity)

    const children: ChildEntry[] = []

    // Navigation properties → children
    for (const nav of entity.navigationProperties) {
      children.push({
        name: nav.name,
        kind: 'navProperty',
        ref: nav.typeName,
      })
    }

    // Bound functions → children
    for (const funcId of entity.functionIds) {
      const fn = metadata.functions[funcId]
      if (fn) {
        children.push({
          name: fn.name,
          kind: 'function',
          ref: fn.id,
          returnType: fn.returnType,
        })
      }
    }

    entityChildren.set(fullName, children)
  }

  // Index functions
  for (const fn of Object.values(metadata.functions)) {
    functionById.set(fn.id, fn)
  }

  return { entityByFullName, functionById, entityChildren }
}
```

### Pattern 5: MiniSearch Index Construction via DFS
**What:** Build the search index by walking all searchable items: entities, root functions, and DFS through entity children (nav properties + bound functions). Each item gets a unique composite ID.
**When to use:** Built once on metadata load.

```typescript
// lib/metadata/search-index.ts
import MiniSearch from 'minisearch'
import type { Metadata } from './types'

interface SearchDocument {
  id: string           // Unique: "entity:SP.Web", "fn:123", "nav:SP.Web/Lists"
  name: string         // Display name: "Web", "GetById", "Lists"
  fullName: string     // Full qualified name for display
  kind: 'entity' | 'function' | 'navProperty'
  parentEntity?: string // For nav props and bound functions
}

export function buildSearchIndex(metadata: Metadata): MiniSearch<SearchDocument> {
  const index = new MiniSearch<SearchDocument>({
    fields: ['name', 'fullName'],
    storeFields: ['name', 'fullName', 'kind', 'parentEntity'],
    searchOptions: {
      boost: { name: 2 },       // Name matches rank higher
      fuzzy: 0.2,               // Tolerate typos
      prefix: true,             // "GetBy" matches "GetById"
    },
    tokenize: (text) => text.split(/[\s._]+/),  // Split on space, dot, underscore
  })

  const docs: SearchDocument[] = []

  // Entities
  for (const entity of Object.values(metadata.entities)) {
    docs.push({
      id: `entity:${entity.fullName}`,
      name: entity.name,
      fullName: entity.fullName,
      kind: 'entity',
    })
  }

  // Root functions
  for (const fn of Object.values(metadata.functions)) {
    if (fn.isRoot) {
      docs.push({
        id: `fn:${fn.id}`,
        name: fn.name,
        fullName: fn.name,
        kind: 'function',
      })
    }
  }

  // DFS: entity children (nav properties + bound functions)
  for (const [fullName, entity] of Object.entries(metadata.entities)) {
    for (const nav of entity.navigationProperties) {
      docs.push({
        id: `nav:${fullName}/${nav.name}`,
        name: nav.name,
        fullName: `${entity.name}.${nav.name}`,
        kind: 'navProperty',
        parentEntity: fullName,
      })
    }
    for (const funcId of entity.functionIds) {
      const fn = metadata.functions[funcId]
      if (fn) {
        docs.push({
          id: `fn:${fn.id}`,
          name: fn.name,
          fullName: `${entity.name}.${fn.name}`,
          kind: 'function',
          parentEntity: fullName,
        })
      }
    }
  }

  index.addAll(docs)
  return index
}
```

**Important note on DFS deduplication:** Bound functions appear both in the functions object and in entity.functionIds. The approach above indexes them once under their entity context (as `fn:{id}`) — if a function is bound to multiple entities, the second `addAll` attempt would fail with a duplicate ID. The actual implementation should either use a Set to track indexed function IDs, or use composite IDs like `fn:{entityFullName}/{funcId}` to allow the same function to appear under multiple parent contexts. Based on the data analysis, each function ID appears in only one entity's `functionIds` array (verified: 2,741 non-root functions = 2,741 entity function references), so simple `fn:{id}` IDs should work without deduplication.

### Anti-Patterns to Avoid
- **Storing metadata in Zustand state:** Zustand does shallow merge on `set()`. Even though it doesn't deep-clone, storing 4.5MB in reactive state means every `set({ status: 'ready' })` call creates a new state object reference that includes the metadata reference. Keeping metadata external avoids this entirely.
- **Deep-freezing the metadata:** `Object.freeze()` is shallow. Deep-freezing 4.5MB with thousands of nested objects is expensive and unnecessary — the data is read-only by convention and never mutated.
- **Building Maps from Zustand selectors:** Pre-compute Maps once and store as module-level singletons (like the metadata). Don't compute them in selectors or useMemo — they're static after load.
- **Using localStorage for 4.5MB cache:** localStorage has a ~5MB limit per origin and is synchronous (blocks main thread on read). IndexedDB is async and handles large values well.

## Discretion Recommendations

### Monospace Font: System Stack
**Recommendation:** Use the system monospace font stack.
**Rationale:** Zero additional load time, no FOIT/FOUT, and every platform has a good monospace font (SF Mono on macOS, Cascadia Code on Windows 11, Liberation Mono on Linux). The font is used only for inline code identifiers (type names, property names, method signatures) — not full code blocks — so the consistency of a web font adds minimal value versus the cost of loading 50-100KB of font files.

```css
--font-mono: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas,
  'Liberation Mono', 'Courier New', monospace;
```

### Code Text Sizing: Slightly Smaller (0.9em)
**Recommendation:** Set inline code text to `0.9em` relative to surrounding text.
**Rationale:** This matches the convention established by GitHub, MDN, and most documentation sites. Monospace fonts tend to appear slightly larger at the same point size due to wider character widths. `0.9em` compensates and creates visual parity with the surrounding proportional text.

### Table Typography: Code Columns Only
**Recommendation:** Use monospace font only for columns containing code identifiers (Property Name, Type Name, Method Name). Use the body font for column headers and non-code content.
**Rationale:** Full monospace tables are harder to scan when mixing code identifiers with labels like "Nullable" or count badges. Selective monospace draws the eye to code content specifically.

### Skeleton Animation: Tailwind animate-pulse
**Recommendation:** Use Tailwind's built-in `animate-pulse` class for skeleton shimmer. It produces a smooth opacity pulse (1 → 0.5 → 1) that's subtle and performant.
**Rationale:** Built-in, zero configuration, GPU-accelerated (opacity animation), and universally recognized as a loading indicator. More complex shimmer effects (gradient sweep) require custom keyframes and perform worse on low-end devices.

### IndexedDB Cache Strategy
**Recommendation:** 24-hour staleness threshold. Always serve cached data immediately, then revalidate in background. Replace cache on successful revalidation regardless of whether data changed (simpler than diffing 4.5MB). No explicit eviction — the cache is a single key that gets overwritten.
**Rationale:** SharePoint API metadata changes infrequently (monthly at most). 24 hours means users get fresh data within a day while enjoying instant loads on repeat visits. The simplicity of "always revalidate, always overwrite" eliminates cache invalidation bugs.

### MiniSearch Configuration
**Recommendation:**
- **Fields indexed:** `name` (boosted 2x) and `fullName`
- **Stored fields:** `name`, `fullName`, `kind`, `parentEntity`
- **Tokenizer:** Split on whitespace, dots, and underscores (`/[\s._]+/`) — this handles "SP.Web" → ["SP", "Web"] and "GetByTitle" stays as one token (camelCase splitting is unnecessary since users search by prefix)
- **Search options:** `prefix: true` (so "GetBy" matches "GetById"), `fuzzy: 0.2` (tolerate typos)
- **No stop words:** All tokens are meaningful in API names

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Full-text search | Custom filter/regex matching | MiniSearch | Handles prefix, fuzzy, scoring, field boosting — dozens of edge cases |
| IndexedDB persistence | Raw IndexedDB API (transactions, cursors) | idb-keyval `get`/`set` | Single key-value pair doesn't need transactions, indexes, or cursors |
| State management | React Context + useReducer for loading states | Zustand | DevTools integration, simpler API, no provider nesting |
| CSS utility generation | Manual CSS classes for color tokens | Tailwind @theme inline + CSS vars | Existing pattern from shadcn/ui setup — generates `text-*`, `bg-*`, `border-*` automatically |
| Skeleton components | Custom skeleton with complex animation | Tailwind `animate-pulse` + `bg-muted` | Built-in, GPU-accelerated, zero config |

**Key insight:** Every temptation to "just write a quick utility" for search, caching, or state management leads to reimplementing edge cases that libraries already handle. The entire data layer should be ~300 lines of application code gluing libraries together.

## Common Pitfalls

### Pitfall 1: Metadata in Zustand Reactive State
**What goes wrong:** Storing 4.5MB metadata object inside Zustand state causes every `set()` call to create a new top-level state reference. While Zustand doesn't deep-clone, any component selecting from the store re-evaluates its selector, and the metadata reference is part of every state snapshot.
**Why it happens:** It's the "obvious" approach — put all data in the store.
**How to avoid:** Module-level singleton + `useSyncExternalStore`. Zustand holds only `{ status, error }`.
**Warning signs:** Large bundle of data appearing in Zustand DevTools; unnecessary re-renders when status changes.

### Pitfall 2: Race Condition in Cache-Then-Revalidate
**What goes wrong:** App loads cached data, user starts browsing. Background fetch completes with different data. If the singleton is replaced mid-navigation, component state becomes inconsistent (e.g., entity detail shows properties from old data, but a clicked link resolves against new data).
**Why it happens:** Replacing the frozen singleton while components hold references to the old one.
**How to avoid:** On background revalidation, only update the cache in IndexedDB — don't replace the live singleton during the same session. The fresh data takes effect on next page load. Alternatively, show a subtle "New data available, reload?" toast.
**Warning signs:** Console errors about missing entities, broken navigation after a few minutes.

### Pitfall 3: Skeleton Layout Mismatch
**What goes wrong:** Skeleton screens show generic bars that don't match the actual layout dimensions. When real content replaces the skeleton, the page "jumps" as elements reflow.
**Why it happens:** Skeletons are built without reference to the actual component dimensions.
**How to avoid:** Design skeletons to match the exact layout structure: sidebar width (280px), content area with header-height offset, breadcrumb bar height. Use the same CSS grid/flex layout for both skeleton and real content.
**Warning signs:** Visible layout shift when transitioning from skeleton to real content. CLS (Cumulative Layout Shift) score degradation.

### Pitfall 4: JSON.parse Blocking the Main Thread
**What goes wrong:** `JSON.parse()` on 4.5MB of JSON takes ~10-50ms depending on the device. During this time, the UI is unresponsive.
**Why it happens:** JSON.parse is synchronous and runs on the main thread.
**How to avoid:** This is already handled by the user's decision to have a CSS spinner in index.html as pre-React fallback. The ~10-50ms window is too short to warrant a Web Worker for parse offloading. However, if the parse + Object.freeze + Map building takes >100ms on slow devices, consider `requestIdleCallback` or chunking.
**Warning signs:** Noticeable jank on first load, especially on mobile devices.

### Pitfall 5: Color Token Contrast Failures in Dark Mode
**What goes wrong:** Using the same oklch lightness value for both light and dark mode results in unreadable text — e.g., dark blue text on dark background.
**Why it happens:** Forgetting that text color contrast requires opposite adjustments for light vs dark backgrounds.
**How to avoid:** Define separate oklch values for `:root` (lower lightness for dark text on light bg) and `.dark` (higher lightness for light text on dark bg). Verify WCAG AA contrast ratio (4.5:1 minimum) for each combination.
**Warning signs:** Squinting to read colored text in dark mode.

### Pitfall 6: MiniSearch Duplicate ID Errors
**What goes wrong:** MiniSearch throws an error when adding a document with an ID that already exists in the index.
**Why it happens:** If the same function is bound to multiple entities, it could be indexed twice with the same `fn:{id}` key.
**How to avoid:** Verified by data analysis: each non-root function appears in exactly one entity's `functionIds` array (2,741 non-root functions = 2,741 total entity function references). Simple `fn:{id}` IDs work without deduplication at current data volumes. Add a defensive check if the metadata schema ever changes.
**Warning signs:** Uncaught error during search index construction.

## Code Examples

### Color Token CSS Custom Properties (following existing shadcn/ui pattern)

```css
/* In index.css — add to :root and .dark blocks */

/* --- Light mode type colors --- */
:root {
  /* ... existing shadcn vars ... */
  --type-fn: oklch(0.55 0.2 255);        /* Blue for functions */
  --type-entity: oklch(0.45 0.18 155);   /* Green for entities */
  --type-nav: oklch(0.55 0.2 300);       /* Purple for nav properties */
  --code-bg: oklch(0.95 0 0);            /* Light gray background for inline code */
}

.dark {
  /* ... existing shadcn vars ... */
  --type-fn: oklch(0.75 0.18 255);       /* Lighter blue for dark mode */
  --type-entity: oklch(0.72 0.16 155);   /* Lighter green for dark mode */
  --type-nav: oklch(0.75 0.18 300);      /* Lighter purple for dark mode */
  --code-bg: oklch(0.25 0 0);            /* Dark gray background for inline code */
}

/* In @theme inline block — makes them available as Tailwind utilities */
@theme inline {
  /* ... existing shadcn mappings ... */
  --color-type-fn: var(--type-fn);
  --color-type-entity: var(--type-entity);
  --color-type-nav: var(--type-nav);
  --color-code-bg: var(--code-bg);
}
```

This generates utilities: `text-type-fn`, `text-type-entity`, `text-type-nav`, `bg-code-bg`, etc.

### Inline Code Component

```tsx
// components/ui/code-text.tsx
import { cn } from '@/lib/utils'

interface CodeTextProps {
  children: React.ReactNode
  className?: string
}

/** Inline monospace text with subtle background tint — like markdown `code` */
export function CodeText({ children, className }: CodeTextProps) {
  return (
    <code
      className={cn(
        'rounded px-1.5 py-0.5 font-mono text-[0.9em] bg-code-bg',
        className
      )}
    >
      {children}
    </code>
  )
}
```

### Skeleton Screen for Content Area

```tsx
// components/loading/ContentSkeleton.tsx
export function ContentSkeleton() {
  return (
    <div className="flex flex-1">
      {/* Sidebar skeleton */}
      <div className="w-[280px] border-r border-border p-4">
        <div className="h-8 w-3/4 animate-pulse rounded bg-muted mb-3" />
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-6 animate-pulse rounded bg-muted"
              style={{ width: `${60 + Math.random() * 30}%` }} />
          ))}
        </div>
      </div>
      {/* Main content skeleton */}
      <div className="flex-1 p-6">
        {/* Breadcrumb bar */}
        <div className="h-8 w-1/3 animate-pulse rounded bg-muted mb-6" />
        {/* Content blocks */}
        <div className="space-y-4">
          <div className="h-6 w-1/2 animate-pulse rounded bg-muted" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-32 w-full animate-pulse rounded bg-muted mt-6" />
        </div>
      </div>
    </div>
  )
}
```

### Error State Component

```tsx
// components/loading/ErrorState.tsx
import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorStateProps {
  onRetry: () => void
}

export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <AlertCircle className="h-10 w-10 text-destructive" />
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground">
          Failed to load API metadata
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Failed to load API metadata from Azure. Check your connection and try again.
        </p>
      </div>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <RefreshCw className="h-4 w-4" />
        Try again
      </button>
    </div>
  )
}
```

### App Boot Sequence

```typescript
// Orchestrates the full loading flow
async function bootMetadata(
  setStatus: (status: AppStatus, error?: string | null) => void
) {
  setStatus('loading')

  // 1. Try IndexedDB cache first
  const cached = await getCachedMetadata()
  if (cached) {
    setMetadata(cached)
    initLookupMaps(cached)
    initSearchIndex(cached)
    setStatus('ready')

    // 2. Background revalidation — update cache only, not live singleton
    fetchFromAzure().then(fresh => {
      if (fresh) setCachedMetadata(fresh)
    }).catch(() => { /* silent — cached data is good enough */ })
    return
  }

  // 3. No cache — fetch from Azure
  try {
    const data = await fetchFromAzure()
    setMetadata(data)
    initLookupMaps(data)
    initSearchIndex(data)
    await setCachedMetadata(data)
    setStatus('ready')
  } catch (err) {
    setStatus('error', 'Failed to load API metadata from Azure. Check your connection and try again.')
  }
}
```

### Monospace Font Definition

```css
/* In @theme inline block */
@theme inline {
  --font-mono: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas,
    'Liberation Mono', 'Courier New', monospace;
}
```

This makes `font-mono` available as a Tailwind utility class.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Zustand v4 + `create()` | Zustand v5 + `create()` (same API, ESM-only) | 2024 | No API change for our use case; v5 is ESM-only which Vite handles natively |
| MiniSearch v6 | MiniSearch v7 | 2024 | v7 has better TypeScript generics; `MiniSearch<T>` now properly types stored fields in results |
| `idb` (full wrapper) for simple caching | `idb-keyval` v6 | 2023 | For single key-value cache, `idb-keyval` is dramatically simpler than full `idb` |
| React Context for loading states | Zustand or useSyncExternalStore | 2022+ | Context causes unnecessary re-renders for all consumers on any state change |
| `@apply` in Tailwind for component styles | `@theme` directive in Tailwind v4 | 2025 | CSS-first approach; `@theme inline` for variable-based tokens |

**Deprecated/outdated:**
- `FlexSearch`: Still works but returns IDs not documents — requires extra lookup step. MiniSearch is the better fit for this data volume.
- `idb` (full wrapper): Overkill for a single key-value cache. Use `idb-keyval` instead.
- `localStorage` for large data: Synchronous API blocks main thread. 5MB limit is dangerously close to our 4.5MB payload.

## Open Questions

1. **Background revalidation UX**
   - What we know: User decided on cache-with-revalidation. Background fetch updates IndexedDB cache.
   - What's unclear: Should the live singleton be updated mid-session if fresh data arrives? This could cause inconsistencies.
   - Recommendation: Update cache only; live data refreshes on next page load. This is the safest approach and matches the "eventually consistent" decision from CONTEXT.md.

2. **CSS spinner in index.html timing**
   - What we know: User wants a CSS spinner as pre-React fallback. React loads in ~200-800ms.
   - What's unclear: Should the spinner cover just the React hydration window, or also the metadata fetch? The metadata fetch will show skeleton screens (React is loaded by then).
   - Recommendation: CSS spinner covers only the pre-React window. Once React mounts, skeleton screens take over. The spinner should be in the `#root` div and gets replaced when React renders.

3. **Exact oklch color values**
   - What we know: Blue/green/purple with adjusted brightness for dark mode.
   - What's unclear: The exact oklch values need visual testing for WCAG contrast compliance.
   - Recommendation: Start with the values in the code example above, verify contrast ratios during implementation, and adjust lightness values as needed. The architecture (CSS custom properties) makes adjustments trivial.

## Sources

### Primary (HIGH confidence)
- `/lucaong/minisearch` (Context7) — MiniSearch configuration, tokenizer, search options, `addAll` API
- `/pmndrs/zustand` (Context7) — Store creation, `useSyncExternalStore` integration, vanilla store pattern, immutable state patterns
- `/jakearchibald/idb-keyval` (Context7) — `get`/`set`/`createStore` API
- Actual metadata JSON from `https://sprestapiexplorer.blob.core.windows.net/api-files/metadata.latest.json` — 2,450 entities, 3,534 functions, 6,499 searchable items, ~4.5MB
- Old Vue app source (`web/src/services/treeBuilder.ts`, `web/src/services/api.ts`, `az-funcs/src/interfaces/`) — data model, tree navigation logic
- Existing Phase 1 source code (`app/src/`) — CSS variable pattern, Tailwind 4 `@theme inline` usage, component structure

### Secondary (MEDIUM confidence)
- Perplexity search — `useSyncExternalStore` pattern for large immutable data outside Zustand (verified against React docs and Zustand docs)
- Perplexity search — IndexedDB caching best practices, stale-while-revalidate pattern (verified against multiple sources)
- Perplexity search — Monospace font comparison for web (verified against Google Fonts and known defaults)
- Perplexity search — Tailwind CSS 4 `@theme` vs `@theme inline` (verified against existing project code pattern)

### Tertiary (LOW confidence)
- None — all findings verified against primary or secondary sources.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all three libraries (zustand, minisearch, idb-keyval) verified via Context7 with current version numbers from npm
- Architecture: HIGH — metadata singleton + useSyncExternalStore pattern verified via multiple sources; data model verified against actual JSON and old Vue app
- Color system: HIGH — follows existing shadcn/ui pattern already in the codebase; exact oklch values need visual tuning but architecture is proven
- Pitfalls: HIGH — derived from actual data analysis (counts, structure) and known patterns from the old Vue app

**Data facts verified:**
- Entities: 2,450
- Functions: 3,534 (793 root, 2,741 bound)
- Navigation properties: 515 total across all entities
- Searchable items: 6,499 (entities + root funcs + nav props + bound funcs)
- JSON size: ~4.5MB
- JSON.parse time: ~10ms (Node.js, desktop)
- Object.freeze time: <0.1ms (shallow)
- Function IDs: 1-3576 with gaps (sparse, use Map not Array)
- Each bound function belongs to exactly one entity

**Research date:** 2026-02-11
**Valid until:** 2026-03-11 (stable libraries, stable data model)
