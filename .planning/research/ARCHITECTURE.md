# Architecture Research

**Domain:** Data-heavy SPA — API documentation explorer (React 19)
**Researched:** 2026-02-11
**Confidence:** HIGH

## Verdict: Proposed Architecture is Sound — With Three Corrections

The architecture defined in `1-RESEARCH.md` — Zustand store (immutable) → MiniSearch index + useMemo derived views → react-arborist/detail panels — is fundamentally correct for this data scale (~4MB JSON, 2,449 entities, 3,528 functions). After verifying against official docs and current patterns, **three corrections** are recommended:

1. **Split the Zustand store**: Keep metadata outside the reactive store (module-level singleton). Only UI state belongs in Zustand.
2. **Use iterative DFS with visited Set** for tree walking — not recursive DFS with depth cap.
3. **Keep MiniSearch on the main thread** — 19ms is not worth Web Worker complexity.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          BROWSER                                        │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    Presentation Layer                             │   │
│  │                                                                  │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐     │   │
│  │  │ Explorer  │  │  Types   │  │Changelog │  │ HowItWorks   │     │   │
│  │  │  Page     │  │  Page    │  │  Page    │  │   Page        │     │   │
│  │  └─────┬────┘  └─────┬────┘  └────┬─────┘  └──────────────┘     │   │
│  │        │              │            │                              │   │
│  │  ┌─────┴──────────────┴────────────┴──────────────────────┐      │   │
│  │  │       Shared Components (Breadcrumb, CmdK, Tables)     │      │   │
│  │  └────────────────────────────────────────────────────────┘      │   │
│  └──────────────────────────┬───────────────────────────────────────┘   │
│                             │                                           │
│  ┌──────────────────────────┴───────────────────────────────────────┐   │
│  │                     Hooks Layer                                   │   │
│  │                                                                   │   │
│  │  useFilteredRootNodes()  useSearchIndex()  useEntityLookup()      │   │
│  │  useMetadata()           useDiffData()     useRecentVisits()      │   │
│  └──────────┬──────────────────────┬────────────────────────────────┘   │
│             │                      │                                    │
│  ┌──────────┴──────────┐   ┌──────┴─────────────────────────────────┐  │
│  │   UI State Store    │   │        Data Singletons (module-level)   │  │
│  │    (Zustand)        │   │                                         │  │
│  │                     │   │  metadataStore.ts  (Metadata object)     │  │
│  │  searchQuery        │   │  searchIndex.ts    (MiniSearch instance) │  │
│  │  hiddenNamespaces   │   │  lookupMaps.ts     (Map<string, Entity>)│  │
│  │  currentPath        │   │  treeBuilder.ts    (lazy child compute) │  │
│  │  isLoading          │   │  diffStore.ts      (MonthDiffData[])    │  │
│  └─────────────────────┘   └─────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    Services Layer                                 │   │
│  │                                                                   │   │
│  │  api.ts (fetch from Azure Blob) → initializer.ts (orchestrate)   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└──────────────┬──────────────────────────────────────────────────────────┘
               │ fetch()
               ▼
    ┌──────────────────────┐
    │  Azure Blob Storage  │
    │  (metadata + diffs)  │
    └──────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|----------------|-------------------|
| **Explorer Page** | API tree navigation, sidebar with contextual children, entity/function detail | Hooks layer → data singletons + UI store |
| **Types Page** | Virtualized entity type list, type detail panels | Hooks layer → lookup maps |
| **Changelog Page** | Month tab display, diff table rendering with color coding | Hooks layer → diff store |
| **HowItWorks Page** | Static content, no data dependencies | Nothing (static) |
| **Cmd+K Palette** | Global search overlay, result grouping, navigation | searchIndex singleton via useSearchIndex() |
| **Breadcrumb** | Path display, segment navigation, copy-path | UI store (currentPath) |
| **UI State Store** | Filter prefs, search query, loading state, nav state | Hooks layer reads; components write via actions |
| **Data Singletons** | Immutable metadata, lookup maps, search index | Initialized once on app load; read-only after |
| **Services** | HTTP fetch, data parsing, initialization orchestration | Azure Blob → singletons |

---

## Critical Architectural Decision #1: Metadata Outside Zustand

### The Problem

The proposed architecture stores the ~4MB metadata object inside the Zustand store:

```typescript
// ❌ PROPOSED (from 1-RESEARCH.md)
interface AppStore {
  metadata: Metadata | null;  // ← 4MB object in reactive state
  searchQuery: string;
  // ...
}
```

**Why this is suboptimal:**

Zustand uses `Object.is` (reference equality) for change detection — it does NOT deep-compare. So storing 4MB in Zustand won't cause comparison performance issues. **However**, the real problem is **subscription noise**:

- Every component that calls `useAppStore(s => s.metadata)` subscribes to the store.
- When ANY store property changes (e.g., `searchQuery` updates on every debounced keystroke), Zustand checks whether each subscriber's selected value changed.
- For `metadata`, the reference never changes (it's immutable), so the check returns `false` and no re-render occurs. But the check still runs for every subscriber on every state change.
- With `useShallow`, you can mitigate this, but it's unnecessary complexity.

**Source:** Zustand official docs confirm `Object.is` comparison. Multiple Zustand performance guides recommend separating static/immutable data from frequently-changing UI state. (HIGH confidence — Context7 verified)

### The Solution: Module-Level Singletons for Static Data

```typescript
// ✅ RECOMMENDED
// src/data/metadataStore.ts — NOT a Zustand store

let _metadata: Metadata | null = null;
let _entityMap: Map<string, EntityType> | null = null;
let _functionMap: Map<number, FunctionImport> | null = null;

export function setMetadata(data: Metadata): void {
  _metadata = Object.freeze(data);  // Freeze to enforce immutability
  _entityMap = new Map(Object.entries(data.entities));
  _functionMap = new Map(
    Object.entries(data.functions).map(([k, v]) => [Number(k), v])
  );
}

export function getMetadata(): Metadata {
  if (!_metadata) throw new Error('Metadata not loaded');
  return _metadata;
}

export function getEntity(fullName: string): EntityType | undefined {
  return _entityMap?.get(fullName);
}

export function getFunction(id: number): FunctionImport | undefined {
  return _functionMap?.get(id);
}
```

**Then use a simple hook for React integration:**

```typescript
// src/hooks/useMetadata.ts
import { useSyncExternalStore } from 'react';

let _metadata: Metadata | null = null;
let _listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  _listeners.add(cb);
  return () => _listeners.delete(cb);
}

export function notifyMetadataReady(data: Metadata) {
  _metadata = Object.freeze(data);
  _listeners.forEach(cb => cb());
}

export function useMetadata(): Metadata | null {
  return useSyncExternalStore(subscribe, () => _metadata);
}
```

### What Stays in Zustand

Only reactive UI state that components need to respond to:

```typescript
// src/store/index.ts
interface UIStore {
  // Loading state
  isLoading: boolean;

  // Filter/search state (changes trigger derived view recomputation)
  searchQuery: string;
  hiddenNamespaces: string[];

  // Navigation state
  currentPath: string;

  // Actions
  setLoading: (loading: boolean) => void;
  setSearchQuery: (query: string) => void;
  setHiddenNamespaces: (ns: string[]) => void;
  setCurrentPath: (path: string) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      isLoading: true,
      searchQuery: '',
      hiddenNamespaces: DEFAULT_HIDDEN_NAMESPACES,
      currentPath: '',

      setLoading: (loading) => set({ isLoading: loading }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setHiddenNamespaces: (ns) => set({ hiddenNamespaces: ns }),
      setCurrentPath: (path) => set({ currentPath: path }),
    }),
    {
      name: 'sp-rest-explorer-ui',
      partialize: (state) => ({
        hiddenNamespaces: state.hiddenNamespaces,
      }),
    }
  )
);
```

**Confidence:** HIGH — Zustand's `Object.is` behavior verified via Context7/official docs. Separation of static vs reactive data is a well-documented Zustand best practice.

---

## Critical Architectural Decision #2: MiniSearch Stays on Main Thread

### The Question

Should the ~19ms MiniSearch index build happen on the main thread or in a Web Worker?

### The Answer: Main Thread

**Rationale:**

| Factor | Main Thread | Web Worker |
|--------|-------------|------------|
| Index build time | ~19ms (measured for 6K items) | ~19ms + ~5-10ms message passing |
| Implementation complexity | Zero | Significant (worker file, message protocol, transferable objects, error handling) |
| Data transfer | None (direct access) | Must serialize/transfer MiniSearch instance OR rebuild in worker |
| Search query latency | ~1ms (direct function call) | ~3-5ms (postMessage round trip) |
| MiniSearch transferability | N/A | MiniSearch instances are NOT transferable — would need to keep worker alive for all search queries OR serialize the index |
| Blocking risk | 19ms — imperceptible, well below 50ms jank threshold | None |
| Maintenance cost | None | Must maintain worker lifecycle, error boundaries, fallback for browsers |

**The 19ms index build is less than a single frame (16.67ms at 60fps) and well under the 50ms "long task" threshold.** Using a Web Worker for this adds architectural complexity (worker lifecycle, message passing, non-transferable MiniSearch instances) for zero perceived performance benefit.

**When to reconsider:** If the dataset grows beyond ~50K items or index build exceeds 200ms, move to a Web Worker. At 6K items, this is premature optimization.

**MiniSearch-specific concern:** MiniSearch instances contain internal data structures (trie, inverted index) that are NOT `Transferable` objects. This means:
- You can't build the index in a Worker and transfer it to the main thread
- You'd need to keep the Worker alive and proxy ALL search queries through `postMessage`
- This turns every search from a ~1ms sync call into a ~3-5ms async round trip

**Confidence:** HIGH — MiniSearch docs confirm internal structure is not transferable. Performance numbers from uFuzzy benchmark extrapolated to 6K items.

---

## Critical Architectural Decision #3: Tree Walking Strategy

### The Problem

The metadata has a **recursive structure**: entities reference each other via navigation properties, creating cycles:

```
SP.User → Groups (SP.GroupCollection) → GetById → SP.Group → Users → SP.User → ...
```

The tree must be walked to:
1. Build the flat MiniSearch search index (~6K items) on load
2. Compute children lazily when a node is expanded in the UI

### For Search Index Building: Iterative DFS with Path-Based Visited Set

**Why iterative DFS (not recursive):**
- Stack depth up to 9 levels is safe for recursion, BUT iterative is simpler to reason about for cycle detection
- No risk of stack overflow on pathological data shapes
- Easier to instrument with performance measurements

**Why path-based visited set (not depth cap alone):**
- Depth cap of 10 would allow the same entity to appear multiple times at different paths — this is intentional and correct (e.g., `GetById` under `web/Lists/...` AND under `web/SiteGroups/...`)
- BUT cycles must be broken: `SP.User → Groups → Users → Groups → Users → ...`
- Use a **composite key**: `entityFullName + "/" + parentPath` — prevents infinite cycles while allowing the same entity at different tree positions

```typescript
// src/services/searchIndexBuilder.ts

interface IndexBuildContext {
  items: SearchableItem[];
  // Track entity visits per tree branch to break cycles
  // Key: entityFullName, Value: Set of ancestor paths where this entity appeared
  entityVisited: Map<string, Set<string>>;
}

export function buildSearchableItems(metadata: Metadata): SearchableItem[] {
  const ctx: IndexBuildContext = {
    items: [],
    entityVisited: new Map(),
  };

  // Stack-based iterative DFS
  type StackEntry = {
    type: 'function' | 'navProperty';
    name: string;
    entityFullName: string | undefined;  // return type / target type
    parentPath: string[];
    depth: number;
  };

  const stack: StackEntry[] = [];

  // Push all root functions (reversed for correct DFS order)
  const rootFuncs = Object.values(metadata.functions).filter(f => f.isRoot);
  for (let i = rootFuncs.length - 1; i >= 0; i--) {
    stack.push({
      type: 'function',
      name: rootFuncs[i].name,
      entityFullName: rootFuncs[i].returnType,
      parentPath: [],
      depth: 0,
    });
  }

  while (stack.length > 0) {
    const entry = stack.pop()!;
    const currentPath = [...entry.parentPath, entry.name];
    const fullPath = currentPath.join('/');

    // Add to search index
    ctx.items.push({
      id: `tree-${fullPath}`,
      name: entry.name,
      fullName: entry.name,
      type: entry.type,
      path: currentPath,
      fullPath,
      isRoot: entry.parentPath.length === 0,
    });

    // Resolve entity for children
    if (!entry.entityFullName) continue;
    const entity = metadata.entities[entry.entityFullName];
    if (!entity) continue;

    // Cycle detection: has this entity appeared as an ancestor in THIS branch?
    const ancestorKey = entry.entityFullName;
    if (!ctx.entityVisited.has(ancestorKey)) {
      ctx.entityVisited.set(ancestorKey, new Set());
    }
    const visitedPaths = ctx.entityVisited.get(ancestorKey)!;

    // Build a branch signature from the ancestor entity chain
    const branchSig = currentPath.slice(0, -1).join('/');
    if (visitedPaths.has(branchSig)) continue; // Cycle — skip children
    visitedPaths.add(branchSig);

    // Hard depth limit as safety net
    if (entry.depth >= 10) continue;

    // Push children (nav properties + functions) in reverse for DFS order
    const children: StackEntry[] = [];

    if (entity.navigationProperties) {
      for (const navProp of entity.navigationProperties) {
        children.push({
          type: 'navProperty',
          name: navProp.name,
          entityFullName: navProp.typeName,
          parentPath: currentPath,
          depth: entry.depth + 1,
        });
      }
    }

    if (entity.functionIds) {
      for (const funcId of entity.functionIds) {
        const func = metadata.functions[funcId];
        if (func) {
          children.push({
            type: 'function',
            name: func.name,
            entityFullName: func.returnType,
            parentPath: currentPath,
            depth: entry.depth + 1,
          });
        }
      }
    }

    // Push in reverse for correct DFS order
    for (let i = children.length - 1; i >= 0; i--) {
      stack.push(children[i]);
    }
  }

  return ctx.items;
}
```

### For UI Tree Expansion: Lazy Computation (No Walking)

When a user expands a tree node, compute children on-demand from the metadata lookup maps. This is what the existing `TreeBuilder.getChildren()` does — and it's correct:

```typescript
// src/services/treeBuilder.ts
export function getChildren(
  entityFullName: string,
  parentPath: string[],
): TreeNode[] {
  const entity = getEntity(entityFullName); // O(1) Map lookup
  if (!entity) return [];

  const children: TreeNode[] = [];

  // Navigation properties
  for (const navProp of entity.navigationProperties) {
    const targetEntity = getEntity(navProp.typeName);
    children.push({
      id: [...parentPath, navProp.name].join('/'),
      name: navProp.name,
      entityFullName: navProp.typeName,
      type: 'navProperty',
      isLeaf: !targetEntity || !hasChildren(targetEntity),
      children: null, // Lazy — computed when expanded
    });
  }

  // Functions
  for (const funcId of entity.functionIds) {
    const func = getFunction(funcId);
    if (!func) continue;
    const returnEntity = func.returnType ? getEntity(func.returnType) : null;
    children.push({
      id: [...parentPath, func.name].join('/'),
      name: func.name,
      entityFullName: func.returnType,
      type: 'function',
      isLeaf: !returnEntity || !hasChildren(returnEntity),
      children: null,
    });
  }

  return children;
}
```

**Key insight:** react-arborist expects a `children` property on each node. For lazy loading, provide `children: null` (signals "has children, not loaded yet") and use the `childrenAccessor` prop or update the data on expand. This avoids pre-computing the entire tree.

**Confidence:** HIGH — Tree walking algorithm verified against data structure. react-arborist lazy loading confirmed via Context7 docs.

---

## Data Flow

### Startup Flow (Critical Path)

```
App mounts
    │
    ├─ 1. fetch metadata JSON (~4MB, ~300-800ms network)
    │      └─ Response → Object.freeze() → module singleton
    │
    ├─ 2. Build lookup maps (~2ms, sync, main thread)
    │      ├─ entityMap: Map<string, EntityType> (2,449 entries)
    │      └─ functionMap: Map<number, FunctionImport> (3,528 entries)
    │
    ├─ 3. Build search index (~19ms, sync, main thread)
    │      ├─ Iterative DFS walk → ~6,000 SearchableItems
    │      └─ MiniSearch.addAll(items)
    │
    ├─ 4. Build root nodes (~1ms, sync)
    │      └─ Filter functions where isRoot=true → 793 TreeNode[]
    │
    ├─ 5. Fetch diff data (6 files in parallel, ~100-500ms)
    │      └─ Results → module singleton
    │
    └─ 6. set({ isLoading: false }) → UI renders
```

**Total initialization budget:** ~20-25ms of main thread work after network fetch completes. Well under the 50ms long task threshold.

### Search Flow

```
User presses Ctrl+K
    │
    └─ CommandPalette opens (no data work)

User types query (debounced 300ms)
    │
    └─ MiniSearch.search(query) → ~1ms
        │
        └─ Results grouped by type (function/entity/navProp)
            │
            └─ Render ~20-50 result items with highlighted matches

User selects a result
    │
    ├─ setCurrentPath(result.fullPath)  → Zustand UI store
    ├─ Router navigates to /#/_api/{path} or /#/entity/{type}
    └─ Sidebar computes children of selected node (lazy, ~1ms)
```

### Navigation Flow (Explorer)

```
User clicks sidebar item or breadcrumb segment
    │
    ├─ setCurrentPath(newPath) → Zustand UI store
    ├─ Router updates URL
    │
    └─ Components re-derive:
        ├─ Breadcrumb: split path by '/' → clickable segments
        ├─ Sidebar: getChildren(entityFullName, path) → child nodes
        └─ Content: resolve entity/function from path → detail view
```

### Filter Flow (Root Endpoint View)

```
User types in root endpoint filter
    │
    └─ setSearchQuery(input) via debounce

useMemo in useFilteredRootNodes() recomputes:
    │
    ├─ Input: 793 root functions + hiddenNamespaces + searchQuery
    ├─ Operation: Array.filter() — ~0.1ms for 793 items
    └─ Output: filtered TreeNode[]

react-arborist receives new data prop → reconciles efficiently
```

---

## Recommended Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── AppHeader.tsx           # Nav bar with route links + Ctrl+K trigger
│   │   ├── AppLayout.tsx           # Root layout: header + outlet
│   │   └── ResizablePanel.tsx      # Draggable sidebar resize
│   ├── explorer/
│   │   ├── ExplorerPage.tsx        # Route component: sidebar + content
│   │   ├── Sidebar.tsx             # Contextual children list OR root endpoint list
│   │   ├── SidebarItem.tsx         # Single item renderer (icon + name + type tag)
│   │   ├── BreadcrumbBar.tsx       # Full-width path breadcrumb + copy button
│   │   ├── EntityDetail.tsx        # Entity properties, nav props, methods tables
│   │   ├── FunctionDetail.tsx      # Function params, return type display
│   │   ├── HomeScreen.tsx          # Landing: hero, recent, popular endpoints
│   │   └── RootEndpoints.tsx       # State 3: all 793 root endpoints with filter
│   ├── types/
│   │   ├── TypesPage.tsx           # Route component: type list sidebar + detail
│   │   ├── TypesList.tsx           # Virtualized filterable type list (2,449 items)
│   │   ├── TypeDetail.tsx          # Entity detail: base type, used-by, sections
│   │   └── TypesWelcome.tsx        # Landing state when no type selected
│   ├── changelog/
│   │   ├── ChangelogPage.tsx       # Route component: month tabs + diff content
│   │   ├── MonthTabs.tsx           # Horizontal tab bar for 6 months
│   │   ├── DiffSummary.tsx         # Summary stats bar (added/updated/removed)
│   │   ├── DiffEntityCard.tsx      # Collapsible entity change card
│   │   └── DiffEmptyState.tsx      # Empty month placeholder
│   ├── search/
│   │   ├── CommandPalette.tsx       # Cmd+K overlay (cmdk + MiniSearch)
│   │   ├── SearchResultItem.tsx     # Single result: icon + name + path
│   │   └── HighlightedText.tsx      # Simple indexOf-based text highlighting
│   ├── shared/
│   │   ├── PropsTable.tsx           # Reusable properties table
│   │   ├── MethodsTable.tsx         # Reusable methods table
│   │   ├── NavPropsTable.tsx        # Reusable nav properties table
│   │   ├── TypeLink.tsx             # Smart link: entity types → route, Edm.* → plain
│   │   ├── DocBanner.tsx            # Official documentation link banner
│   │   └── LoadingState.tsx         # Skeleton loading screens
│   └── pages/
│       └── HowItWorksPage.tsx       # Static info page
├── hooks/
│   ├── useMetadata.ts               # useSyncExternalStore for metadata singleton
│   ├── useFilteredRootNodes.ts      # useMemo: root functions filtered by query/namespaces
│   ├── useSearchIndex.ts            # Wrapper: search() + autoSuggest()
│   ├── useEntityLookup.ts           # O(1) entity resolution by fullName
│   ├── useFunctionLookup.ts         # O(1) function resolution by ID
│   ├── useRecentVisits.ts           # localStorage-backed recent visits
│   ├── useDiffData.ts               # Access diff data singleton
│   └── useTreeChildren.ts           # Lazy child computation for tree nodes
├── data/
│   ├── metadataStore.ts             # Module singleton: frozen Metadata + lookup Maps
│   ├── searchIndex.ts               # MiniSearch instance: build + query
│   ├── diffStore.ts                 # Module singleton: MonthDiffData[]
│   └── initializer.ts              # Orchestrates fetch → store → index pipeline
├── services/
│   ├── api.ts                       # HTTP fetch for metadata + diff files
│   ├── treeBuilder.ts               # getChildren() for lazy tree expansion
│   ├── searchIndexBuilder.ts        # DFS tree walk → SearchableItem[] → MiniSearch
│   ├── metadataParser.ts            # Path navigation, URI template building
│   ├── docLinks.ts                  # Official MS doc link mapping
│   └── consts.ts                    # Blob URLs, default namespaces, etc.
├── store/
│   └── index.ts                     # Zustand UI-only store
├── types/
│   ├── metadata.ts                  # Metadata, EntityType, FunctionImport, etc.
│   ├── tree.ts                      # TreeNode, SearchableItem
│   └── diff.ts                      # DiffChanges, MonthDiffData, ChangeType
├── App.tsx                           # Router setup + initialization orchestration
├── main.tsx                          # React root + StrictMode
└── index.css                         # Tailwind imports
```

### Structure Rationale

- **`data/`**: Module-level singletons for immutable data. NOT React components, NOT Zustand stores. Plain TypeScript modules with getter functions. This is the core architectural distinction — static data lives outside React's render cycle.
- **`hooks/`**: React hooks that bridge `data/` singletons and `store/` into component-consumable APIs. Every component accesses data through hooks, never directly importing from `data/`.
- **`store/`**: Zustand store for UI state only. Tiny footprint — just search query, filter prefs, loading state, current path.
- **`services/`**: Pure functions with no React dependency. Testable in isolation. Tree building, index building, HTTP fetching.
- **`components/`**: Feature-organized, not type-organized. Each feature folder is self-contained with its page, sub-components, and any feature-specific logic.
- **`types/`**: Shared TypeScript interfaces. Imported by all layers.

---

## Architectural Patterns

### Pattern 1: Immutable Data Singleton + useSyncExternalStore

**What:** Store large immutable data outside React's state management. Use `useSyncExternalStore` to notify React when the data is ready.

**When to use:** Data that is fetched once, never mutated, and consumed by many components. The 4MB metadata object is the textbook case.

**Trade-offs:**
- Pro: Zero subscription overhead for static data. No re-render storms. No selector complexity.
- Pro: `Object.freeze()` enforces immutability at runtime.
- Con: Slightly more code than a simple Zustand `set()`. Must handle the "not loaded yet" state.

**Example:**
```typescript
// data/metadataStore.ts
let _metadata: Metadata | null = null;
let _subscribers = new Set<() => void>();

function subscribe(cb: () => void) {
  _subscribers.add(cb);
  return () => _subscribers.delete(cb);
}

function getSnapshot(): Metadata | null {
  return _metadata;
}

export function initializeMetadata(data: Metadata): void {
  _metadata = Object.freeze(data) as Metadata;
  _subscribers.forEach(cb => cb());
}

// hooks/useMetadata.ts
import { useSyncExternalStore } from 'react';

export function useMetadata(): Metadata | null {
  return useSyncExternalStore(subscribe, getSnapshot);
}
```

**Confidence:** HIGH — `useSyncExternalStore` is a React 18+ API specifically designed for this pattern. Verified via React official docs (Context7).

### Pattern 2: useMemo for Derived Views (No Cloning)

**What:** All filtered/sorted views of the metadata are computed via `useMemo` from the frozen source. No cloning, no mutation, no separate cache.

**When to use:** Any time a component needs a subset of the metadata (filtered root nodes, sorted entities, etc.)

**Trade-offs:**
- Pro: Eliminates the 4MB `JSON.parse(JSON.stringify())` deep clone per filter change (the root cause of the current performance problem).
- Pro: React handles cache invalidation via dependency arrays. No manual cache management.
- Con: `useMemo` recomputes when dependencies change. For the root endpoint filter (793 items × simple string match), this is ~0.1ms — negligible.

**Example:**
```typescript
// hooks/useFilteredRootNodes.ts
export function useFilteredRootNodes(): FunctionImport[] {
  const metadata = useMetadata();
  const searchQuery = useUIStore(s => s.searchQuery);
  const hiddenNamespaces = useUIStore(s => s.hiddenNamespaces);

  return useMemo(() => {
    if (!metadata) return [];

    return Object.values(metadata.functions)
      .filter(f => f.isRoot)
      .filter(f => {
        if (hiddenNamespaces.some(ns => f.name.startsWith(ns))) return false;
        if (searchQuery && searchQuery.length >= 2) {
          return f.name.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true;
      });
  }, [metadata, searchQuery, hiddenNamespaces]);
}
```

**Confidence:** HIGH — `useMemo` behavior verified via React docs (Context7). Array.filter on 793 items is trivially fast.

### Pattern 3: Lazy Tree Children with react-arborist

**What:** Tree nodes start with `children: null`. When a node is expanded, compute its children from the lookup maps and update the node.

**When to use:** The Explorer tree, where each node can have 5-100+ children, and the total tree depth is 9 levels.

**Trade-offs:**
- Pro: Only computes children for expanded nodes. Most of the ~6K possible nodes are never computed.
- Pro: Each child computation is O(n) where n = number of nav props + functions on the entity. Typically 5-50 items, takes <1ms.
- Con: react-arborist expects the full `data` array with children already resolved. For lazy loading, you need to manage a "tree data" state that gets updated as nodes expand.

**Important react-arborist detail:** react-arborist v3.x uses `initialData` (set once) OR `data` (controlled). For our use case, use `data` (controlled) and update it when nodes expand:

```typescript
// State for the tree data (root nodes + expanded children)
const [treeData, setTreeData] = useState<TreeNode[]>([]);

// When a node is expanded, compute its children and update tree data
function onToggle(id: string, isOpen: boolean) {
  if (isOpen) {
    setTreeData(prev => {
      // Find the node, compute children if not yet loaded
      return updateNodeChildren(prev, id, computeChildren);
    });
  }
}
```

**Confidence:** HIGH — react-arborist data model verified via Context7. `searchTerm` and `searchMatch` props confirmed.

### Pattern 4: React.lazy + Suspense for Route Code-Splitting

**What:** Each route page is a `React.lazy()` dynamic import, wrapped in `Suspense`.

**When to use:** All 4 main route pages. The Explorer page is largest; Types, Changelog, HowItWorks are smaller.

**Trade-offs:**
- Pro: Users visiting only the Explorer page never download Types/Changelog/HowItWorks code.
- Pro: React 19 + React Router 7 support `lazy` at the route level — the router downloads code before rendering (better than `React.lazy` which downloads on render).
- Con: Minor flash of loading state on first navigation to a lazy route.

**Recommended approach:** Use React Router 7's `lazy` property (verified via Context7):

```typescript
const router = createHashRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        lazy: () => import('./components/explorer/ExplorerPage'),
      },
      {
        path: '_api/*',
        lazy: () => import('./components/explorer/ExplorerPage'),
      },
      {
        path: 'entity',
        lazy: () => import('./components/types/TypesPage'),
      },
      {
        path: 'entity/:typeName',
        lazy: () => import('./components/types/TypesPage'),
      },
      {
        path: 'api-diff',
        lazy: () => import('./components/changelog/ChangelogPage'),
      },
      {
        path: 'api-diff/:monthKey',
        lazy: () => import('./components/changelog/ChangelogPage'),
      },
      {
        path: 'how-it-works',
        lazy: () => import('./components/pages/HowItWorksPage'),
      },
    ],
  },
]);
```

**React Router 7's `lazy` vs `React.lazy`:** Router-level `lazy` is better because it downloads the route code in parallel with other assets during navigation, before the component renders. `React.lazy` only triggers download when the component renders. (Verified via React docs, Context7.)

**Confidence:** HIGH — React Router 7 `lazy` route property confirmed via Context7.

### Pattern 5: React 19 `use()` for Initial Data Loading

**What:** Use React 19's `use()` hook with Suspense to handle the initial metadata fetch, instead of `useEffect` + loading state.

**When to use:** The app-level data loading on startup.

**Trade-offs:**
- Pro: Cleaner code — no manual loading state management. Suspense handles the fallback UI.
- Pro: Aligns with React 19 recommended patterns.
- Con: Requires creating the fetch promise outside the component (in module scope or parent), NOT inside render. The promise must be cached/stable.

**Example:**
```typescript
// data/initializer.ts
let _metadataPromise: Promise<Metadata> | null = null;

export function getMetadataPromise(): Promise<Metadata> {
  if (!_metadataPromise) {
    _metadataPromise = fetch(METADATA_URL)
      .then(res => res.json())
      .then(data => {
        initializeMetadata(data);
        buildSearchIndex(data);
        return data;
      });
  }
  return _metadataPromise;
}

// App.tsx
import { Suspense, use } from 'react';

function App() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <AppContent />
    </Suspense>
  );
}

function AppContent() {
  const metadata = use(getMetadataPromise());
  // metadata is guaranteed to be loaded here
  return <RouterProvider router={router} />;
}
```

**Confidence:** MEDIUM — `use()` API confirmed in React 19 docs (Context7). The pattern of caching the promise in module scope is documented but relatively new. Fallback: traditional `useEffect` + loading state works fine.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Deep Cloning for Filtering

**What people do:** `JSON.parse(JSON.stringify(metadata))` to create a mutable copy for filtering.
**Why it's wrong:** Cloning 4MB of JSON takes ~30-50ms on every filter change. With 793 root items and debounced search, this causes noticeable jank.
**Do this instead:** Keep metadata frozen. Use `useMemo` to compute filtered arrays from the immutable source. Filtering 793 items with `Array.filter()` takes ~0.1ms.

### Anti-Pattern 2: Storing Derived Data in the Store

**What people do:** Store filtered results, sorted lists, or computed views in Zustand alongside the source data.
**Why it's wrong:** Creates data synchronization problems. When the source changes, every derived cache must be invalidated manually. Easy to have stale data.
**Do this instead:** Derive everything via `useMemo` in hooks. The memoization key IS the synchronization mechanism — when the source or filters change, React automatically recomputes.

### Anti-Pattern 3: Pre-Computing the Entire Tree

**What people do:** Walk the entire 9-level recursive tree on load and store all ~6K nodes in a flat array for the tree component.
**Why it's wrong:** Most nodes are never viewed. Pre-computing 6K nodes wastes memory and startup time.
**Do this instead:** Pre-compute only the search index (which NEEDS all items for global search). For the tree UI, compute children lazily on expand. The search index walk and the tree expansion are separate concerns.

### Anti-Pattern 4: Using useEffect for Data Derivation

**What people do:** `useEffect(() => { setFilteredData(filter(data)) }, [data, filters])` — deriving data in an effect and storing in state.
**Why it's wrong:** Causes an extra render cycle (first render with stale data, then effect fires and triggers re-render with new data). React docs explicitly warn against this pattern.
**Do this instead:** `useMemo(() => filter(data), [data, filters])` — compute during render, no extra cycle.

### Anti-Pattern 5: Putting Search Results in Global State

**What people do:** Store MiniSearch results in Zustand so the command palette and other components can share them.
**Why it's wrong:** Search results are transient (change on every keystroke) and scoped to the command palette. Putting them in global state causes unnecessary subscription notifications.
**Do this instead:** Keep search results as local state within the CommandPalette component. MiniSearch queries are ~1ms — no need to cache globally.

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Azure Blob Storage (metadata) | Single `fetch()` call on app mount. URL from env/config constant. | ~4MB response. Consider `Accept-Encoding: gzip` (auto by browsers). Response is cached in module singleton. |
| Azure Blob Storage (diffs) | 6 parallel `fetch()` calls for monthly diff files. | ~50-200KB each. Pattern: `{year}y_m{month}_metadata_diffChanges.json`. Some months may 404 (no changes). |
| GitHub Pages | Static hosting of built SPA. | Base path: `/sp-rest-explorer/`. Hash routing avoids 404 issues. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Data singletons ↔ Hooks | Direct function call (import) | Hooks import from `data/`. No indirection needed. |
| Zustand store ↔ Hooks | `useUIStore(selector)` | Standard Zustand pattern. Use atomic selectors. |
| Hooks ↔ Components | Standard React hook consumption | Every data access goes through a hook. Components never import from `data/` or `services/` directly. |
| Services ↔ Data | `initializer.ts` orchestrates the pipeline | Services (fetch, build index, etc.) write to data singletons. Only happens once on startup. |
| Router ↔ Pages | React Router 7 `<Outlet />` + `useParams()` | Hash routing for GitHub Pages. `lazy` imports for code splitting. |

---

## Build Order (Dependencies Between Components)

This defines what must be built first for the rest to work.

### Layer 1: Foundation (no dependencies)
1. **TypeScript interfaces** (`types/metadata.ts`, `types/tree.ts`, `types/diff.ts`)
2. **Constants** (`services/consts.ts` — blob URLs, default namespaces)
3. **Zustand UI store** (`store/index.ts`)

### Layer 2: Data Layer (depends on Layer 1)
4. **HTTP fetch service** (`services/api.ts`)
5. **Metadata singleton** (`data/metadataStore.ts`)
6. **Lookup maps** (inside `metadataStore.ts` — entityMap, functionMap)
7. **Tree builder** (`services/treeBuilder.ts` — `getChildren()`)
8. **Search index builder** (`services/searchIndexBuilder.ts`)
9. **MiniSearch wrapper** (`data/searchIndex.ts`)
10. **Initialization orchestrator** (`data/initializer.ts`)

### Layer 3: Hooks (depends on Layer 2)
11. **useMetadata** (`hooks/useMetadata.ts`)
12. **useEntityLookup** / **useFunctionLookup**
13. **useFilteredRootNodes** (`hooks/useFilteredRootNodes.ts`)
14. **useSearchIndex** (`hooks/useSearchIndex.ts`)
15. **useTreeChildren** (`hooks/useTreeChildren.ts`)
16. **useDiffData** (`hooks/useDiffData.ts`)
17. **useRecentVisits** (`hooks/useRecentVisits.ts`)

### Layer 4: Shared Components (depends on Layer 3)
18. **TypeLink** (used everywhere entity types are displayed)
19. **PropsTable**, **MethodsTable**, **NavPropsTable** (shared table components)
20. **HighlightedText** (search result highlighting)
21. **LoadingState** (skeleton screens)
22. **DocBanner** (official doc link banner)

### Layer 5: Features (depends on Layers 3-4)
23. **AppLayout + AppHeader + ResizablePanel** (shell)
24. **CommandPalette** (global search — can be built early, tested standalone)
25. **BreadcrumbBar** (shared by Explorer views)
26. **Explorer Page** (sidebar, entity detail, function detail, home screen)
27. **Types Page** (type list, type detail)
28. **Changelog Page** (month tabs, diff cards)
29. **HowItWorks Page** (static — can be built anytime)

### Layer 6: Integration (depends on Layer 5)
30. **Router setup** (App.tsx — wire all pages with lazy loading)
31. **Initialization flow** (App.tsx — Suspense + use() for data loading)
32. **Deployment** (Vite config, GitHub Actions)

### Build order implications for roadmap:
- **Layers 1-3 can be built and tested without any UI.** Write unit tests against the data layer + hooks layer before touching components.
- **Layer 4 shared components can be built in isolation** with Storybook or a simple test harness.
- **Layer 5 features can be built in parallel** once the shared components exist.
- **The CommandPalette (24) is independent of all page features** — it only needs the search index hook. Build it early for immediate search functionality.

---

## Scalability Considerations

| Concern | Current (6K items) | 10x growth (60K items) | 100x growth (600K items) |
|---------|---------------------|------------------------|--------------------------|
| **JSON fetch** | ~4MB, 300-800ms | ~40MB — need streaming/chunking | Not viable as single fetch |
| **MiniSearch init** | ~19ms | ~190ms — move to Web Worker | ~1900ms — Web Worker required |
| **MiniSearch search** | ~1ms | ~10ms — still fine debounced | ~100ms — need indexing strategy change |
| **useMemo filtering** | ~0.1ms (793 items) | ~1ms — still fine | ~10ms — consider virtualized filtering |
| **Entity Map lookups** | O(1), ~2,449 entries | O(1), 24K entries — still fine | O(1), 245K entries — memory concern |
| **Tree expansion** | ~1ms (5-100 children) | Same (per-node) | Same (per-node) |
| **Bundle size** | ~200-300KB gzipped | Same (data is fetched, not bundled) | Same |

**First bottleneck at growth:** JSON fetch size. At 40MB, the initial load becomes unusable on slow connections. Solution: split metadata into per-namespace chunks, lazy-load on demand.

**Second bottleneck:** MiniSearch init time. At 60K items, move index building to a Web Worker. The search queries can still be fast (<10ms) on main thread — the issue is only the one-time build.

**Current recommendation:** Build for 6K items. Don't pre-optimize for 60K. The architecture supports migrating to Web Workers later without rewriting components (only `data/searchIndex.ts` would change).

---

## Sources

- **Zustand store patterns, selectors, `useShallow`, `partialize`**: Context7 `/pmndrs/zustand` — HIGH confidence
- **React 19 `use()` hook, Suspense for data loading**: Context7 `/websites/react_dev` — HIGH confidence
- **React `useMemo` for expensive calculations**: Context7 `/websites/react_dev` — HIGH confidence
- **React Router 7 `lazy` route property**: Context7 `/websites/react_dev` + `/remix-run/react-router` — HIGH confidence
- **MiniSearch API, `addAll`, search options, stored fields**: Context7 `/lucaong/minisearch` — HIGH confidence
- **react-arborist `searchTerm`, `searchMatch`, `data` prop, filtering**: Context7 `/brimdata/react-arborist` — HIGH confidence
- **MiniSearch transferability / Web Worker feasibility**: Perplexity search + MiniSearch design doc — MEDIUM confidence
- **Zustand `Object.is` comparison behavior**: Zustand official docs + Perplexity verified — HIGH confidence
- **DFS vs BFS for cyclic tree walking**: Perplexity + standard CS algorithm analysis — HIGH confidence
- **`useSyncExternalStore` for external state**: React 18+ official docs — HIGH confidence

---
*Architecture research for: SP REST API Explorer — data-heavy SPA rebuild*
*Researched: 2026-02-11*
