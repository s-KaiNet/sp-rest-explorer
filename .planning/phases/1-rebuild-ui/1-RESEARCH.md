# Phase 1 Research: Rebuild UI with React and Modern Stack

**Phase:** Rebuild the SP REST API Metadata Explorer from Vue 2 + Webpack 3 to React 19 + Vite  
**Research Mode:** Ecosystem + Implementation  
**Confidence Level:** High (verified against official docs, GitHub releases, live site analysis)  
**Date:** 2026-02-10

---

## Executive Summary

The current site is built on Vue 2.5.2, Webpack 3, TypeScript 2.7, and Element UI 2.2.2 — all significantly outdated (4+ years behind). The core performance problem is that search/filter only works on root-level API nodes (~793 items) because the filtering implementation does a `JSON.parse(JSON.stringify())` deep clone of the entire ~4MB metadata on every filter change and explicitly skips non-root items. The rebuild must solve both the modernization and the deep-search performance problem.

---

## Existing Codebase Analysis

### Current Architecture
- **Entry:** `web/src/main.ts` → `App.vue` fetches metadata from Azure Blob Storage, then renders router views
- **Data flow:** Azure Blob → `Api.apiMetadata` (static field) → deep clone + filter → `MetadataParser`/`TreeBuilder` → Vue components
- **State:** Vuex stores only UI state (loading, breadcrumb, filters). Metadata lives in the `Api` service singleton
- **Tree:** Element UI `el-tree` with lazy loading. Brute-force destroy/recreate on filter changes
- **Build output:** Goes to `docs/` at repo root for GitHub Pages. Manual deployment (no CI/CD)

### Data Scale (from `samples/metadata.latest.json`)
- **~2,449 entities** (types like SP.Web, SP.List, etc.)
- **~3,528 functions** (793 root, 2,735 non-root)
- **~515 navigation properties** across 162 entities
- **~11,967 total properties**
- **File size:** ~3.93 MB JSON

### Root Cause of First-Level-Only Filtering

In `web/src/services/api.ts`, the `shouldRemoveFunction()` method (line 136-137):

```typescript
if (!func.isRoot) {
  return false;  // ← NEVER filters non-root functions
}
```

The `getMetadata()` method:
1. Deep-clones the entire 4MB metadata via `JSON.parse(JSON.stringify())`
2. Only iterates root functions for filtering
3. Never touches entities or navigation properties
4. Caches results by hash of filter+search, but any new search busts the cache

### Other Performance Issues Found
1. **No tree virtualization** — TypesTree renders all ~2,449 entities as DOM `<li>` elements
2. **Full tree destruction** on filter change — `ApiTree.vue` sets `refreshing=true` then `false` on `nextTick`
3. **No code splitting** — all components eagerly imported in router
4. **Repeated MetadataParser instantiation** in computed properties
5. **No CI/CD** — manual `npm run docs` + commit `docs/` folder

---

## Standard Stack

Use these exact versions. No substitutions.

| Category | Choice | Version | Why |
|----------|--------|---------|-----|
| **Runtime** | React | 19.x | Latest stable, concurrent features, improved perf |
| **Build** | Vite | 6.x+ | Fast HMR, native ESM, optimal for static SPA |
| **Language** | TypeScript | 5.x | Strict mode, modern features |
| **Routing** | React Router | 7.x | Proven SPA router, hash mode support, lazy loading |
| **State** | Zustand | 5.x | Lightweight, no boilerplate, ideal for this data pattern |
| **Styling** | Tailwind CSS | 4.x | Utility-first, tree-shaken, rapid iteration |
| **Components** | shadcn/ui | Latest | Radix primitives, Tailwind-native, accessible, copy-paste |
| **Tree View** | react-arborist | 3.4.x | Virtualized rendering, built-in search/filter, React 19 support |
| **Search Index** | MiniSearch | 7.x | Native TS, returns docs, fast init, prefix+fuzzy, field boosting |
| **Tables** | @tanstack/react-table | 8.x | Headless, sortable, flexible column defs |
| **Icons** | lucide-react | Latest | Tree-shakeable, consistent with shadcn/ui |
| **Linting** | ESLint + Prettier | Latest | Standard code quality |
| **Package Manager** | npm | 10.x | Standard, GitHub Actions compatible |

### Why Zustand over Valtio/Jotai/Redux
- The app has a single large JSON blob + UI state (filters, search, breadcrumb, loading)
- Zustand's `create()` store pattern maps directly to the current `Api` static class pattern
- No need for proxy-based reactivity (Valtio) or atomic state (Jotai) for this data shape
- Zero boilerplate compared to Redux

### Why React Router over TanStack Router
- Hash mode (`HashRouter`) is required for GitHub Pages — React Router has battle-tested hash routing
- TanStack Router is newer and its hash mode support is less proven for production
- The app has simple routes (4 main views), no need for file-based routing

---

## Architecture Patterns

### Data Flow (New)
```
Azure Blob Storage
  → fetch() on app mount
  → Raw metadata stored in Zustand store (single source of truth)
   → MiniSearch index built on load (~19ms for 6K items)
  → Tree data derived via useMemo from raw metadata + active filters
  → react-arborist renders virtualized tree from derived data
  → Detail panel reads from store via selectors
```

### Store Design
```typescript
interface AppStore {
  // Raw data
  metadata: Metadata | null;
  diffData: MonthDiffData[];
  isLoading: boolean;
  
  // Filters & search
  hiddenNamespaces: string[];  // Namespace prefixes to HIDE
  searchQuery: string;
  
  // Navigation
  currentPath: string;
  breadcrumb: string;
  
  // Actions
  setMetadata: (data: Metadata) => void;
  setHiddenNamespaces: (filters: string[]) => void;
  setSearchQuery: (query: string) => void;
}
```

### Key Architecture Decisions

1. **NO deep cloning.** The raw metadata is immutable in the store. Derived/filtered views are computed via `useMemo` or selectors. Never mutate or clone the original.

2. **Pre-build flat indexes on load.** When metadata arrives:
   - Build a `Map<string, EntityType>` for O(1) entity lookups
   - Build a `Map<number, FunctionImport>` for O(1) function lookups
   - Build a `Map<string, TreeNode[]>` mapping parent paths to children
   - Build a MiniSearch index containing all function names, entity names, and paths
   
3. **Filtering is a derived computation.** Use `useMemo` to compute the visible root nodes from the full set based on `hiddenNamespaces` + `searchQuery`. This is fast because it's just array filtering on ~793 root items.

4. **Deep search via MiniSearch.** Instead of filtering the tree data, search the pre-built MiniSearch index. Results include stored fields with full paths, allowing the Cmd+K palette to show "paths to matches" with breadcrumbs, and the tree to expand ancestors of the selected match.

5. **Lazy tree children.** Children are computed on-demand when a node is expanded (same pattern as current `el-tree` lazy loading, but using react-arborist's data model).

### Component Structure
```
src/
  components/
    layout/
      AppHeader.tsx          # Nav bar (Explore API, Types, Changelog, How it works)
      AppLayout.tsx          # Root layout with sidebar + content area
      ResizablePanel.tsx     # Resizable sidebar (use CSS resize or @radix-ui/react-resizable)
    explorer/
      ApiTree.tsx            # react-arborist tree with search input
      ApiTreeNode.tsx        # Custom node renderer (function icon, entity icon)
      FilterDialog.tsx       # Namespace filter modal (shadcn Dialog + Checkboxes)
      BreadCrumb.tsx         # Path breadcrumb with doc links
      EntityDocs.tsx         # Entity detail view (properties, nav props, methods tables)
      FunctionDocs.tsx       # Function detail view (params, return type)
      PropsTable.tsx         # Collapsible properties table
      FuncsTable.tsx         # Collapsible methods table
      DocLink.tsx            # Smart link (router-link for types, plain for Edm.*)
    types/
      TypesList.tsx          # Virtualized list of all entity types (use @tanstack/virtual)
      TypeDetail.tsx         # Entity detail when browsing types
    changelog/
      ChangelogView.tsx      # Tabs for months
      MonthDiff.tsx          # Diff tables with color coding
    pages/
      HowItWorks.tsx         # Static info page
  hooks/
    useMetadata.ts           # Hook to access metadata from store
    useFilteredTree.ts       # Hook computing visible tree nodes
    useSearchIndex.ts        # Hook managing MiniSearch index
    useEntityLookup.ts       # Hook for O(1) entity resolution by path
  services/
    api.ts                   # fetch metadata and diff data
    searchIndex.ts           # MiniSearch index builder
    treeBuilder.ts           # Derive tree nodes from metadata
    metadataParser.ts        # Path navigation, URI template building
    filterManager.ts         # Filter persistence (localStorage)
    docLinks.ts              # Official MS doc link mapping
  store/
    index.ts                 # Zustand store definition
  types/
    metadata.ts              # TypeScript interfaces (Entity, Function, etc.)
    tree.ts                  # TreeNode type
  App.tsx
  main.tsx
  index.css                  # Tailwind imports
```

### Routing
```typescript
// Using HashRouter for GitHub Pages compatibility
const router = createHashRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <ExplorerPage /> },
      { path: "_api/*", element: <ExplorerPage /> },
      { path: "entity", element: <TypesPage /> },
      { path: "entity/:typeName", element: <TypesPage /> },
      { path: "entity/:typeName/func/:funcName", element: <TypesPage /> },
      { path: "api-diff", element: <ChangelogPage /> },
      { path: "api-diff/:monthKey", element: <ChangelogPage /> },
      { path: "how-it-works", element: <HowItWorksPage /> },
    ],
  },
]);
```

---

## Don't Hand-Roll

| Problem | Use Instead | Why |
|---------|------------|-----|
| Tree virtualization | react-arborist | Built-in virtual rendering via react-window, search filtering, keyboard nav |
| List virtualization (types) | @tanstack/react-virtual | Handles ~2,449 items with ease, headless |
| Full-text search | MiniSearch | ~1ms search on 6,000 items, native TS, returns full docs, prefix+fuzzy |
| Deep cloning for filtering | `useMemo` + selectors | Never clone. Derive filtered views from immutable source |
| Resizable panels | CSS `resize` property or `react-resizable-panels` | Don't use interactjs like the current code |
| Dialog/modal | shadcn/ui Dialog | Accessible, animated, keyboard-friendly |
| Tabs | shadcn/ui Tabs | Accessible, composable |
| Tables | shadcn/ui Table + @tanstack/react-table | Sortable, accessible |
| Collapsible sections | shadcn/ui Collapsible | Animated, accessible |
| Breadcrumbs | shadcn/ui Breadcrumb | Semantic, accessible |
| Hash routing | React Router `createHashRouter` | Battle-tested for GitHub Pages |

---

## Common Pitfalls

### 1. Deep Clone Performance Trap
**Current problem:** `JSON.parse(JSON.stringify(metadata))` on 4MB JSON per filter change.  
**Solution:** NEVER clone. Store raw metadata once. All filtered views are derived computations via `useMemo`. The memoization key is the filter/search state — when it changes, `useMemo` recomputes a new filtered array (not a clone of the entire object).

### 2. Tree Re-render Storms
**Current problem:** Entire tree destroyed and recreated on filter change.  
**Solution:** react-arborist manages its own virtual DOM list. Changing the `data` prop triggers efficient reconciliation. Use `searchTerm` and `searchMatch` props for filtering — the tree handles visibility internally without re-creating nodes.

### 3. Search Blocking the Main Thread
**Risk:** Searching 6,000+ items with regex on every keystroke blocks the UI.  
**Solution:** 
- Build MiniSearch index once on load (~19ms for 6K items, runs synchronously without jank)
- Debounce search input (300ms)
- MiniSearch returns results with stored fields in ~1ms for this data size
- Display results in Cmd+K command palette with path breadcrumbs

### 4. GitHub Pages 404 on Direct URL Access
**Risk:** `https://site.github.io/repo/entity/SP.Web` returns 404.  
**Solution:** Use hash routing (`/#/entity/SP.Web`). With `createHashRouter`, all URLs use the fragment, so GitHub Pages always serves `index.html`.

### 5. Large Bundle Size
**Risk:** Including entire component libraries inflates the bundle.  
**Solution:**
- shadcn/ui is copy-paste (not a dependency — only used components are in the bundle)
- Tailwind CSS v4 tree-shakes unused utilities
- Code-split routes with `React.lazy()` and `Suspense`
- Vite automatically chunks vendor code

### 6. Types List Rendering All ~2,449 DOM Nodes
**Current problem:** TypesTree renders every entity as a `<li>` with no virtualization.  
**Solution:** Use `@tanstack/react-virtual` (useVirtualizer) for the types list. Only ~20-30 items rendered in the viewport at any time.

### 7. Stale Metadata Cache Collisions
**Current problem:** 32-bit hash of `filters.join('') + search` can collide.  
**Solution:** No cache needed. `useMemo` with proper dependency arrays replaces the manual cache entirely. React handles memoization correctly. MiniSearch's internal index replaces the need for any manual caching of search results.

### 8. Filter Logic Inversion Confusion
**Current problem:** "Filters" are namespaces to HIDE, but the UI shows them as checkboxes to SHOW. The mixin inverts the logic.  
**Solution:** In the new store, use clear naming: `hiddenNamespaces: string[]`. The filter dialog shows checkboxes where unchecked = hidden. No inversion needed.

---

## Code Examples

### MiniSearch Index Setup
```typescript
// services/searchIndex.ts
import MiniSearch from 'minisearch';

interface SearchableItem {
  id: string;
  name: string;
  fullName: string;
  path: string[];     // Breadcrumb path from root
  fullPath: string;   // Full tree path for navigation
  type: 'function' | 'entity' | 'navProperty';
  isRoot: boolean;
}

let miniSearch: MiniSearch<SearchableItem> | null = null;

export function buildIndex(items: SearchableItem[]) {
  miniSearch = new MiniSearch<SearchableItem>({
    fields: ['name', 'fullName', 'fullPath'],
    storeFields: ['name', 'fullName', 'type', 'path', 'fullPath', 'isRoot'],
    searchOptions: {
      boost: { name: 3, fullName: 1, fullPath: 0.5 },
      fuzzy: 0.2,
      prefix: true,
    },
  });
  miniSearch.addAll(items);
}

export function search(query: string, limit = 50): SearchableItem[] {
  if (!miniSearch || !query || query.length < 2) return [];
  return miniSearch.search(query, { limit }) as unknown as SearchableItem[];
}
```

### Filtered Tree with useMemo
```typescript
// hooks/useFilteredTree.ts
import { useMemo } from 'react';
import { useAppStore } from '../store';

export function useFilteredRootNodes() {
  const metadata = useAppStore(s => s.metadata);
  const hiddenNamespaces = useAppStore(s => s.hiddenNamespaces);
  const searchQuery = useAppStore(s => s.searchQuery);

  return useMemo(() => {
    if (!metadata) return [];
    
    const rootFunctions = Object.values(metadata.functions)
      .filter(f => f.isRoot);
    
    return rootFunctions.filter(func => {
      // Namespace filter
      if (hiddenNamespaces.some(ns => func.name.startsWith(ns))) {
        return false;
      }
      // Search filter (if active)
      if (searchQuery && searchQuery.length > 2) {
        return func.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });
  }, [metadata, hiddenNamespaces, searchQuery]);
}
```

### react-arborist Tree with Search
```tsx
// components/explorer/ApiTree.tsx
import { Tree, NodeRendererProps } from 'react-arborist';
import { useState } from 'react';
import { useFilteredRootNodes } from '../../hooks/useFilteredTree';

function ApiTreeNode({ node, style, dragHandle }: NodeRendererProps) {
  return (
    <div style={style} className="flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-accent">
      {node.isInternal && (
        <span onClick={() => node.toggle()} className="w-4">
          {node.isOpen ? '▼' : '▶'}
        </span>
      )}
      <span className={node.data.type === 'function' ? 'text-blue-600' : 'text-green-700'}>
        {node.data.type === 'function' ? 'ƒ' : '▲'}
      </span>
      <span className="truncate">{node.data.name}</span>
    </div>
  );
}

export function ApiTree() {
  const [searchTerm, setSearchTerm] = useState('');
  const treeData = useFilteredRootNodes();

  return (
    <div className="flex flex-col h-full">
      <input
        type="text"
        placeholder="Search APIs..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="p-2 border-b"
      />
      <Tree
        data={treeData}
        searchTerm={searchTerm}
        searchMatch={(node, term) => 
          node.data.name.toLowerCase().includes(term.toLowerCase())
        }
        width="100%"
        height={800}
        rowHeight={28}
        openByDefault={false}
      >
        {ApiTreeNode}
      </Tree>
    </div>
  );
}
```

### Zustand Store
```typescript
// store/index.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppStore {
  metadata: Metadata | null;
  diffData: MonthDiffData[];
  isLoading: boolean;
  hiddenNamespaces: string[];
  searchQuery: string;
  currentPath: string;
  
  setMetadata: (data: Metadata) => void;
  setDiffData: (data: MonthDiffData[]) => void;
  setLoading: (loading: boolean) => void;
  setHiddenNamespaces: (namespaces: string[]) => void;
  setSearchQuery: (query: string) => void;
  setCurrentPath: (path: string) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      metadata: null,
      diffData: [],
      isLoading: true,
      hiddenNamespaces: DEFAULT_HIDDEN_NAMESPACES,
      searchQuery: '',
      currentPath: '',
      
      setMetadata: (data) => set({ metadata: data }),
      setDiffData: (data) => set({ diffData: data }),
      setLoading: (loading) => set({ isLoading: loading }),
      setHiddenNamespaces: (namespaces) => set({ hiddenNamespaces: namespaces }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setCurrentPath: (path) => set({ currentPath: path }),
    }),
    {
      name: 'sp-rest-explorer',
      partialize: (state) => ({ hiddenNamespaces: state.hiddenNamespaces }),
    }
  )
);
```

### Vite Config for GitHub Pages
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/sp-rest-explorer/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: '../docs',  // Match current deployment target
    emptyOutDir: true,
  },
});
```

### GitHub Actions Deployment
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: web/package-lock.json
      - run: npm ci
        working-directory: web
      - run: npm run build
        working-directory: web
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: docs
      - uses: actions/deploy-pages@v4
```

---

## Deep Search Architecture (Solving the Core UX Problem)

The most important improvement: users can search across ALL levels of the API tree, not just root nodes.

### Approach: Pre-indexed Search + Tree Path Expansion

```
1. On metadata load:
   - Walk entire tree (BFS, depth-capped at 10) to build ~5,000-8,000 SearchableItems
   - Build MiniSearch index with name, fullName, fullPath fields (~19ms init)
   - Each item stores its breadcrumb path from root

2. When user types in Cmd+K search (debounced 300ms):
   - Query MiniSearch index → get matching items with their paths and scores
   - Results come back with stored fields (name, type, path, fullPath)
   - Group by type (functions, entities, properties) for display
   - Show truncated breadcrumb path for disambiguation

3. When user selects a result:
   - Navigate to the item's route
   - Expand tree to show the selected item's ancestors

4. Performance characteristics:
   - MiniSearch search: ~1ms for 6,000 items
   - Results include stored fields (no separate lookup needed)
   - Path computation: O(n * depth) where n = match count, depth ≈ 5-8
   - Tree re-render: Only visible nodes re-render (virtualized)
   - Total latency: <10ms even for broad searches
```

### Hybrid: Sidebar Filter + Command Palette Search
For the root-level filter (namespace hiding), continue using simple `Array.filter` on ~793 root functions — this is already fast. MiniSearch is for the deep cross-level search via the Cmd+K command palette.

---

## Migration Strategy

### Phase approach (within this rebuild):
1. **Scaffold** — Vite + React + TypeScript + Tailwind + shadcn/ui setup
2. **Core data layer** — Zustand store, metadata fetching, MiniSearch indexing
3. **Tree view** — react-arborist with namespace filters and deep search
4. **Detail panels** — Entity docs, function docs, breadcrumb, doc links
5. **Types explorer** — Virtualized types list with detail view
6. **Changelog** — Month tabs with diff tables
7. **Static pages** — How it works
8. **Deployment** — GitHub Actions CI/CD, remove manual docs/ build
9. **Polish** — Loading states, error handling, responsive design, dark mode (optional)

### What to Preserve
- All URL patterns (hash routing: `/#/_api/...`, `/#/entity/...`, `/#/api-diff/...`)
- Filter persistence in localStorage (key: `_filters_`)
- The Azure Blob Storage URL for metadata source
- Official doc links mapping
- Google Analytics / Application Insights tracking

### What to Drop
- Element UI (replace with shadcn/ui)
- Vuex (replace with Zustand)
- Webpack 3 (replace with Vite)
- `interactjs` for resizable panel (use CSS or react-resizable-panels)
- Manual `docs/` deployment (replace with GitHub Actions)
- `JSON.parse(JSON.stringify())` deep cloning (replace with useMemo derivation)

---

## Verification Checklist

- [ ] All 4 main views work: Explore API, Explore Types, API Changelog, How it works
- [ ] Tree search works across ALL levels (not just root)
- [ ] Namespace filters show/hide correct API groups
- [ ] Entity detail shows properties, nav properties, methods
- [ ] Function detail shows parameters, return type, parent entity
- [ ] Type links navigate between entities
- [ ] Breadcrumb shows current API path
- [ ] Official doc links appear when available
- [ ] Changelog shows color-coded diffs by month
- [ ] URL patterns match current site (hash routing)
- [ ] Filter preferences persist in localStorage
- [ ] Site deploys to GitHub Pages via GitHub Actions
- [ ] Bundle size < 500KB gzipped (current is ~300KB+)
- [ ] Initial load time ≤ current (metadata fetch is the bottleneck)
- [ ] Tree interaction is smooth with no jank

---

---

## DEEP DIVE: Search Solutions, UI/UX, and Result Presentation

*Added after further research on search alternatives, deeply nested result UX, and modern API explorer patterns.*

### Actual Tree Depth Analysis (from live site)

Explored the live site via Chrome DevTools. Confirmed nesting depth:

```
Level 1: web (root function)
Level 2: └ Lists (nav property)
Level 3:   └ GetByTitle (function)
Level 4:     └ Items (nav property)
Level 5:       └ GetById (function)
Level 6:         └ File (nav property)
Level 7:           └ Author (nav property)
Level 8:             └ Alerts (nav property)
Level 9:               └ Groups > GetById (keeps going)
```

**Maximum observed depth: 9 levels.** The tree is recursive — entities like SP.User have nav properties (Groups, Alerts) that lead back to entities with their own nav properties and functions. This creates deeply nested paths like:

`_api/web/Lists/GetByTitle(...)/Items/GetById(...)/File/Author/Alerts/`

When a single node like `GetByTitle` is expanded, it shows **~100+ children** (mix of nav properties and functions). This means the tree can be both wide AND deep.

---

### Search Library Comparison — With Real Benchmarks

#### Hard Data: uFuzzy Benchmark (162,000 items, 86 search operations, Chrome 117)

Source: [leeoniya/uFuzzy benchmark](https://github.com/leeoniya/uFuzzy) — the most comprehensive public benchmark of JS search libraries.

| Library | Version | Init Time | Search (x86 ops) | Heap (peak) | Retained Memory | Match Highlighting |
|---------|---------|-----------|-------------------|-------------|-----------------|-------------------|
| **FlexSearch** | Light | 3210ms | **83ms** | 670MB | 316MB | No built-in |
| **MiniSearch** | 3.4 | 504ms | **1453ms** | 438MB | 67MB | Term-to-field map only |
| **Fuse.js** | 6.6 | 31ms | **33,875ms** | 245MB | 13.9MB | Best (char indices) |
| **Orama** | 1.1 | 2650ms | **225ms** | 313MB | 192MB | Positions available |
| **uFuzzy** | 1.0 | 0.5ms | **434ms** | 28.4MB | 7.4MB | Built-in `highlight()` |

These are on **162,000 items**. For our **~6,000 items** (27x smaller), estimated single-search latency:

| Library | Est. per-search @6K items | Init @6K items | Verdict |
|---------|--------------------------|----------------|---------|
| **FlexSearch** | **<1ms** | ~120ms | Fastest search, heavy init |
| **MiniSearch** | **~1ms** | ~19ms | Fast search, fast init, good DX |
| **Fuse.js** | **~15ms** | ~1ms | Marginal for type-ahead, great highlighting |
| **Orama** | **~1ms** | ~100ms | Fast search, heavy init |
| **uFuzzy** | **~0.2ms** | ~0ms (no index) | Fastest overall, no index needed |

#### Deep Dive: MiniSearch

**Version:** 7.2.0 (September 2025, actively maintained)  
**TypeScript:** Native (typed `MiniSearch<T>` class, no `@types` needed)  
**License:** MIT  
**Size:** 29.1KB minified

**API for our use case:**
```typescript
import MiniSearch from 'minisearch';

const miniSearch = new MiniSearch<SearchableItem>({
  fields: ['name', 'fullName', 'fullPath'],  // Fields to index
  storeFields: ['name', 'fullName', 'type', 'path', 'fullPath', 'isRoot'],  // Fields to return
  searchOptions: {
    boost: { name: 3, fullName: 1, fullPath: 0.5 },  // Prioritize name matches
    fuzzy: 0.2,        // 20% edit distance tolerance
    prefix: true,       // "GetBy" matches "GetById"
  },
});

miniSearch.addAll(searchableItems);  // ~6,000 items, takes ~19ms

const results = miniSearch.search('GetById');
// Returns:
// [{
//   id: 'tree-web/Lists/GetByTitle/Items/GetById',
//   score: 8.234,
//   terms: ['getbyid'],
//   match: { getbyid: ['name', 'fullPath'] },  // ← Which terms matched which fields
//   name: 'GetById',
//   fullName: 'GetById',
//   type: 'function',
//   path: ['web', 'Lists', 'GetByTitle', 'Items'],
//   fullPath: 'web/Lists/GetByTitle/Items/GetById',
//   isRoot: false,
// }]
```

**MiniSearch `match` field structure:**
```json
{
  "match": {
    "getbyid": ["name", "fullPath"],
    "items": ["fullPath"]
  }
}
```
This is **term → field names**, NOT character-level indices. It tells you WHICH terms matched in WHICH fields, but not WHERE in the string. For highlighting, you still need to do `string.indexOf(term)` yourself — same as FlexSearch.

**MiniSearch Pros:**
- Native TypeScript with generic `MiniSearch<T>` — best DX of all options
- Returns full stored documents (no separate lookup Map needed, unlike FlexSearch)
- Supports `add()`, `remove()`, `replace()` for incremental updates
- Prefix search + fuzzy matching built-in with simple config
- Field boosting (prioritize name matches over path matches)
- Custom filter function in search options
- Fast init (~19ms for 6K items vs FlexSearch's ~120ms)
- Good retained memory (67MB for 162K items, ~2.5MB for 6K)

**MiniSearch Cons:**
- Search is ~17x slower than FlexSearch on 162K items (1453ms vs 83ms for 86 ops)
- At 6K items, this scales to ~1ms per search — still fast enough for debounced (300ms) search
- No built-in character-level match highlighting (same as FlexSearch)
- Benchmark shows higher peak heap than uFuzzy (438MB vs 28MB at 162K scale)

#### Deep Dive: FlexSearch

**Version:** 0.8.212 (September 2025)  
**TypeScript:** Via bundled typings (less ergonomic than MiniSearch)  
**License:** Apache-2.0

**Critical API difference:** FlexSearch `Document.search()` returns **arrays of IDs**, not documents. You MUST maintain a separate `Map` for document lookup:

```typescript
import { Document } from 'flexsearch';

const docStore = new Map<string, SearchableItem>();
const index = new Document({
  id: 'id',
  field: ['name', 'fullName', 'fullPath'],
  tokenize: 'forward',  // Enables prefix matching
});

// Must add to BOTH index AND store
items.forEach(item => {
  index.add(item);
  docStore.set(item.id, item);
});

const ids = index.search('GetById', 50);
// Returns: [id1, id2, id3, ...]  ← Just IDs!

// Must resolve manually:
const results = ids.map(id => docStore.get(id));
```

**FlexSearch Pros:**
- Absolute fastest search (<1ms at 6K items)
- Forward tokenizer gives excellent prefix matching

**FlexSearch Cons:**
- Returns only IDs — need separate Map for document data (more memory, more code)
- Heavy init time (~120ms for 6K items) and memory (~316MB retained at 162K)
- TypeScript types are less ergonomic than MiniSearch
- API is more complex (Document vs Index, separate store management)
- 0.7.x → 0.8.x had breaking API changes, documentation can be inconsistent

#### The Real Question: Is 1ms vs <1ms Meaningful?

For our use case (debounced search at 300ms), both FlexSearch and MiniSearch are **well within the performance budget**:

```
User types → 300ms debounce → search executes → results render
                                  ↑
                         FlexSearch: <1ms
                         MiniSearch: ~1ms
                         Both: imperceptible
```

The difference is only visible if you have >50,000 items or search without debounce (on every keystroke). At 6,000 items, both are instant.

#### Revised Recommendation: **MiniSearch**

**Changed from FlexSearch to MiniSearch.** Rationale:

| Factor | FlexSearch | MiniSearch | Winner |
|--------|-----------|------------|--------|
| Search speed @6K | <1ms | ~1ms | Tie (both instant) |
| Init time @6K | ~120ms | ~19ms | **MiniSearch** |
| Memory @6K | ~12MB retained | ~2.5MB retained | **MiniSearch** |
| TypeScript DX | Bundled, awkward | Native generic `MiniSearch<T>` | **MiniSearch** |
| Returns documents | No (IDs only, need Map) | Yes (stored fields returned) | **MiniSearch** |
| Prefix search | Yes (tokenize: forward) | Yes (prefix: true) | Tie |
| Fuzzy search | Yes (suggest mode) | Yes (fuzzy: 0.2) | Tie |
| Field boosting | Limited | Yes (boost: { name: 3 }) | **MiniSearch** |
| Incremental updates | Yes | Yes (add/remove/replace) | Tie |
| Match highlighting | No (need custom) | No (need custom, same effort) | Tie |
| API simplicity | Complex (Document + Map) | Simple (single class) | **MiniSearch** |
| Active maintenance | 0.8.212, Sept 2025 | 7.2.0, Sept 2025 | Tie |

**The speed difference is irrelevant at our scale.** MiniSearch wins on DX, memory, init time, and API simplicity. Both need custom highlighting (simple `indexOf`).

#### Highlighting Strategy (unchanged, works with MiniSearch)

```typescript
// Lightweight highlight — only runs on ~20-50 displayed results
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query || query.length < 2) return text;
  
  const lower = text.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());
  if (idx === -1) return text;
  
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}
```

#### Fallback Plan

If MiniSearch proves too slow in practice (unlikely at 6K items):
1. First try: reduce indexed fields (only `name` instead of `name` + `fullPath`)
2. Second try: switch to FlexSearch with a Map<string, SearchableItem> store
3. Nuclear option: uFuzzy (fastest, no index, but less feature-rich)

---

### Search & Navigation UX Architecture (Revised)

**Design decision:** Single search mode via Cmd+K command palette. No sidebar search/filter.

The current site's fundamental problem is that the sidebar tree tries to be BOTH a global navigation tool AND a search tool, and does neither well. The new design cleanly separates concerns:

- **Cmd+K** = find anything (global search across all ~6,000 items at all tree levels)
- **Sidebar** = show where you are (contextual navigation for current node)

This follows the VS Code / Figma pattern: the file tree shows your current context; Cmd+P/Cmd+K finds anything globally.

#### Sidebar: Contextual Navigation (Not a Tree)

The sidebar is **no longer a tree view**. It shows only the immediate children of the currently selected node:

```
┌─ Sidebar ─────────────┐
│ Contextual             │
│  GetById               │
│  GetByName             │
│  RemoveById            │
│  Expire                │
│  Update                │
└────────────────────────┘
```

**Behavior:**
- Shows immediate children of the selected node (functions + navigation properties)
- Each breadcrumb segment in the header is clickable — clicking a segment updates the sidebar to show that segment's children
- No search box in the sidebar
- No namespace filters (removed entirely — Cmd+K search replaces them)
- Clicking a child navigates to it, updating both the breadcrumb and sidebar context

**Why this is better:**
- A single node typically has 5-30 children (not 793 root items)
- No virtualization needed for the sidebar — it's always a short list
- No filter/search complexity in the sidebar
- Users always know exactly where they are in the API hierarchy
- Navigation is breadcrumb-driven: click any segment to jump to that level

#### Breadcrumb: Primary Navigation Control

```
API > lists > Add(...) > Author > Groups > GetById(...) > Users > AddUserById(...) > Alerts > Groups
```

- Each segment is clickable — navigates to that node and updates sidebar
- The breadcrumb IS the tree — it shows the full path linearly instead of as a nested tree
- Copy button to copy the full `_api/...` path
- Shows the URI template format (with `(...)` for parameterized functions)

#### Initial/Home State (To Be Decided During Planning)

When the user first lands on the site with no node selected, the sidebar and content area need a home state. Options being considered:

1. **Sidebar: Recent + Pinned**, Content: popular API tiles + collapsible "All Root Endpoints"
2. **Minimal:** Auto-focus Cmd+K search, show recent visits below
3. **Content-only:** No sidebar on home; content area shows all root endpoints as a searchable grid; sidebar appears after selecting a node

This decision is deferred to the planning phase. The architecture supports any of these — the key constraint is avoiding the 40+ root item wall in the sidebar.

#### Namespace Filters: Removed

The current namespace filter dialog (hiding SP.Directory, SP.WorkManagement, etc.) is **removed entirely**. With Cmd+K deep search, users find what they need directly without needing to filter noise from the root tree. The root tree itself no longer exists as a long list.

#### Command Palette: Cmd+K / Ctrl+K (The Only Search)

Full cross-level search across ALL functions, entities, and properties via a centered overlay modal.

- **Trigger:** `Cmd+K` (Mac) / `Ctrl+K` (Windows) keyboard shortcut, or a search icon in the header
- **Results:** Grouped by category, with path breadcrumbs and match highlighting
- **Implementation:** `cmdk` library (via shadcn/ui `<CommandDialog>`) + MiniSearch backend
- **On select:** Navigate to the item, update breadcrumb, update sidebar to show that node's children

---

### Command Palette Design (Cmd+K)

Use the `cmdk` library (pacocoursey/cmdk, v1.x) — a fast, unstyled, accessible command menu component for React. It integrates perfectly with shadcn/ui (shadcn/ui actually ships a `<CommandDialog>` component built on cmdk).

#### Visual Layout for Each Search Result

```
┌──────────────────────────────────────────────────────────┐
│  🔍 Search SharePoint REST APIs...              [Esc]    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Functions (12)                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │ ƒ  Get[ById]          web > Lists > GetByTitle     │  │
│  │                       > Items                      │  │
│  ├────────────────────────────────────────────────────┤  │
│  │ ƒ  Get[ById]          web > Lists > GetByTitle     │  │
│  │                       > Items > ... > File         │  │
│  ├────────────────────────────────────────────────────┤  │
│  │ ƒ  Get[ById]          web > SiteGroups > Groups    │  │
│  ├────────────────────────────────────────────────────┤  │
│  │ ƒ  Get[ByTitle]       web > Lists                  │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  Entities (3)                                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │ ▲  SP.List[Item]      Entity Type                  │  │
│  ├────────────────────────────────────────────────────┤  │
│  │ ▲  SP.ListItem[Version]  Entity Type               │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  Properties (2)                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │ ◆  ItemCount          SP.List > Properties         │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
└──────────────────────────────────────────────────────────┘

[ById] = highlighted match portion
```

#### Result Item Anatomy (each row ~48px):
```
[Icon 16px] [Name with highlighted match]     [Truncated path breadcrumb, faded gray]
            Category tag (small pill)          [Type: Function/Entity/Property]
```

#### Path Truncation Strategy for Deeply Nested Results

For a path like `web > Lists > GetByTitle(...) > Items > GetById(...) > File > Author > Alerts`:

| Depth | Display Strategy | Example |
|-------|-----------------|---------|
| 1-3 | Show full path | `web > Lists > GetByTitle` |
| 4-5 | Show first + last 2 | `web > ... > Items > GetById` |
| 6+ | Show first + "..." + last 2 | `web > ... > Author > Alerts` |

**Hover/tooltip:** Show full path on hover  
**Click:** Navigate to the item AND expand the tree path to that node

---

### Implementation: cmdk + MiniSearch Integration

```tsx
// components/CommandPalette.tsx
import { Command } from 'cmdk';
import { useEffect, useState, useMemo } from 'react';
import { search, SearchableItem } from '../services/searchIndex';

function CommandPalette({ open, onOpenChange }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchableItem[]>([]);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }
    // MiniSearch is sync and ~1ms, no need for debounce here
    // (cmdk already handles its own internal debouncing)
    const hits = search(query);
    setResults(hits);
  }, [query]);

  const grouped = useMemo(() => ({
    functions: results.filter(r => r.type === 'function'),
    entities: results.filter(r => r.type === 'entity'),
    properties: results.filter(r => r.type === 'property'),
  }), [results]);

  return (
    <Command.Dialog open={open} onOpenChange={onOpenChange}>
      <Command.Input
        placeholder="Search SharePoint REST APIs..."
        value={query}
        onValueChange={setQuery}
      />
      <Command.List>
        <Command.Empty>No results found.</Command.Empty>

        {grouped.functions.length > 0 && (
          <Command.Group heading={`Functions (${grouped.functions.length})`}>
            {grouped.functions.slice(0, 20).map(result => (
              <Command.Item
                key={result.id}
                value={result.fullPath}
                onSelect={() => navigateToResult(result)}
              >
                <FunctionIcon />
                <HighlightedName name={result.name} query={query} />
                <TruncatedPath path={result.breadcrumb} />
              </Command.Item>
            ))}
          </Command.Group>
        )}

        {grouped.entities.length > 0 && (
          <Command.Group heading={`Entities (${grouped.entities.length})`}>
            {grouped.entities.slice(0, 20).map(result => (
              <Command.Item
                key={result.id}
                value={result.fullName}
                onSelect={() => navigateToResult(result)}
              >
                <EntityIcon />
                <HighlightedName name={result.name} query={query} />
                <span className="text-xs text-muted-foreground">
                  {result.fullName}
                </span>
              </Command.Item>
            ))}
          </Command.Group>
        )}
      </Command.List>
    </Command.Dialog>
  );
}

// Lightweight highlight function (only runs on displayed results)
function HighlightedName({ name, query }: { name: string; query: string }) {
  if (!query) return <span>{name}</span>;

  const lowerName = name.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const idx = lowerName.indexOf(lowerQuery);

  if (idx === -1) return <span>{name}</span>;

  return (
    <span>
      {name.slice(0, idx)}
      <mark className="bg-yellow-200 text-foreground">
        {name.slice(idx, idx + query.length)}
      </mark>
      {name.slice(idx + query.length)}
    </span>
  );
}

// Truncated breadcrumb for deep paths
function TruncatedPath({ path }: { path: string[] }) {
  if (path.length <= 3) {
    return (
      <span className="text-xs text-muted-foreground ml-auto">
        {path.join(' > ')}
      </span>
    );
  }
  const truncated = [path[0], '...', ...path.slice(-2)];
  return (
    <span className="text-xs text-muted-foreground ml-auto" title={path.join(' > ')}>
      {truncated.join(' > ')}
    </span>
  );
}
```

---

### UI Improvement Recommendations

#### 1. Replace Sidebar Tree With Collapsible Groups Pattern

The current tree shows ALL root items in a flat list. With ~40-50 visible root items (after default filters), this is still a lot. Instead of a flat tree, group root items by namespace prefix:

```
📂 Core (web, site, lists, me, contextinfo...)     ← Expanded by default
  ƒ web
  ƒ site
  ƒ lists
  ƒ me
  ƒ contextinfo
  ...

📂 Services (machinelearning, sphomeservice, ...)   ← Collapsed by default
  ƒ machinelearning
  ƒ sphomeservice
  ...

📂 Management (SiteManager, GroupService, ...)      ← Collapsed by default
  ...

📂 SP.Directory (SP.Directory.*)                    ← Collapsed
📂 SP.WorkManagement (SP.WorkManagement.*)          ← Collapsed
```

This turns 40+ root items into 5-8 collapsible groups, dramatically improving scanability.

#### 2. Add a "Recently Visited" Section at the Top of the Tree
Track the last 5-10 visited API paths in localStorage. Show them above the main tree:

```
⏱ Recent
  _api/web/Lists/GetByTitle
  _api/web/CurrentUser
  _api/site/Features

📂 Core APIs
  ...
```

#### 3. Improve the Detail Panel Layout

Current layout is functional but dated. Recommendations:
- **Sticky breadcrumb header** — the API path breadcrumb should be sticky at the top as user scrolls through properties
- **Collapsible sections** with item counts: "Properties (15)" "Methods (8)" "Navigation Properties (3)"
- **Type links should be visually distinct** — use colored pills/badges: `SP.User` in blue, `Edm.String` in gray
- **Add a "Copy API Path" button** next to the breadcrumb — developers frequently need to copy the full `_api/...` path
- **Show parameter types inline** for functions — currently just shows parameter name and type, could show a more code-like signature: `GetById(id: Int32) → SP.ListItem`

#### 4. Add Dark Mode
- shadcn/ui + Tailwind CSS v4 makes this trivial with `dark:` variants
- Store preference in localStorage
- Toggle in header

#### 5. Mobile Responsiveness
Current site is not mobile-friendly. The sidebar tree should:
- Collapse into a slide-over drawer on mobile
- Search should be full-width
- Detail panel should take full width below

#### 6. Keyboard Navigation
- `Cmd+K` / `Ctrl+K` — Open command palette
- `↑`/`↓` — Navigate tree nodes (react-arborist handles this)
- `Enter` — Expand/select node
- `Escape` — Close command palette / clear search
- `Cmd+[` / `Cmd+]` — Navigate back/forward in history

---

### Search Index Structure (Revised)

The MiniSearch index needs to include not just names, but also paths and entity types, so the command palette can show rich results:

```typescript
interface SearchableItem {
  id: string;                    // Unique ID
  name: string;                  // Display name (e.g., "GetById")
  fullName: string;              // Full qualified name (e.g., "SP.List.GetById")
  type: 'function' | 'entity' | 'navProperty';
  path: string[];                // Breadcrumb path from root (e.g., ["web", "Lists", "GetByTitle", "Items", "GetById"])
  fullPath: string;              // URL path (e.g., "web/Lists/GetByTitle/Items/GetById")
  returnType?: string;           // For functions
  entityFullName?: string;       // Parent entity for nav properties
  isRoot: boolean;               // Is this a root-level function?
}
```

Build the index by walking the entire tree (BFS/DFS) once on metadata load:

```typescript
function buildSearchIndex(metadata: Metadata): SearchableItem[] {
  const items: SearchableItem[] = [];

  // 1. Index all root functions and recursively walk their children
  for (const func of Object.values(metadata.functions)) {
    if (func.isRoot) {
      walkTree(func, [], metadata, items);
    }
  }

  // 2. Index all entities (for type search)
  for (const entity of Object.values(metadata.entities)) {
    items.push({
      id: `entity-${entity.fullName}`,
      name: entity.name,
      fullName: entity.fullName,
      type: 'entity',
      path: [],
      fullPath: '',
      isRoot: false,
    });
  }

  return items;
}

function walkTree(
  node: FunctionImport | NavigationProperty,
  parentPath: string[],
  metadata: Metadata,
  items: SearchableItem[],
  depth = 0
) {
  if (depth > 10) return; // Prevent circular references

  const currentPath = [...parentPath, node.name];

  items.push({
    id: `tree-${currentPath.join('/')}`,
    name: node.name,
    fullName: node.name,
    type: 'function', // or 'navProperty' based on node type
    path: currentPath,
    fullPath: currentPath.join('/'),
    isRoot: parentPath.length === 0,
  });

  // Get the entity this node returns
  const entity = resolveEntity(node, metadata);
  if (!entity) return;

  // Walk nav properties
  for (const navProp of entity.navigationProperties) {
    walkTree(navProp, currentPath, metadata, items, depth + 1);
  }

  // Walk functions
  for (const funcId of entity.functionIds) {
    const func = metadata.functions[funcId];
    if (func) {
      walkTree(func, currentPath, metadata, items, depth + 1);
    }
  }
}
```

**IMPORTANT:** The tree is recursive (e.g., SP.User has Groups which has Users which has Groups...). The `depth > 10` guard prevents infinite recursion. This means the index captures paths up to 10 levels deep, which covers the observed maximum of 9.

**Estimated index size:** With an average of ~5 paths per root function across ~793 roots, plus ~2,449 entities, the index will contain roughly **5,000-8,000 items**. MiniSearch handles this in ~1ms search time with ~19ms init.

---

### Handling "Same Name, Different Path" in Search Results

A key challenge: many functions have the same name but appear at different tree positions. For example, `GetById` appears under:
- `web > Lists > GetByTitle > Items > GetById`  
- `web > Lists > GetByTitle > Items > GetById > File > Versions > GetById`
- `web > SiteGroups > GetById`
- `lists > GetById`

The search results MUST differentiate these. The path breadcrumb is essential. Each result item shows:

```
ƒ  GetById                    web > Lists > ... > Items
ƒ  GetById                    web > SiteGroups
ƒ  GetById                    lists
ƒ  GetById                    web > ... > File > Versions
```

The path breadcrumb is what makes each result unique and useful. Without it, users see 15 identical "GetById" results with no way to distinguish them.

---

### Updated Standard Stack (Search Section Only)

| Category | Previous Choice | Revised Choice | Reason |
|----------|----------------|----------------|--------|
| Search engine | FlexSearch | **MiniSearch 7.x** | Native TS, returns docs directly, ~1ms search, 19ms init, simpler API |
| Match highlighting | (not specified) | **Custom `indexOf`-based highlighter** | Only runs on displayed results (~20-50), instant |
| Command palette | (not specified) | **cmdk** v1.x (via shadcn/ui `<CommandDialog>`) | Fast, unstyled, accessible, groups + custom filter |
| Fallback search | (not specified) | **FlexSearch** then **uFuzzy** | If MiniSearch too slow (unlikely at 6K) |

---

## RESEARCH COMPLETE (Updated)

**Key findings (original + new):**
1. react-arborist 3.4.3 is the right tree component — virtualized, supports search/filter, React 19 compatible
2. **MiniSearch 7.x is the search engine** — best DX (native TS, returns docs), ~1ms search, 19ms init. Fuse.js disqualified (394ms/search at 162K scale). FlexSearch faster but worse DX (IDs only, separate Map needed)
3. The "no deep clone" architecture (useMemo + immutable store) eliminates the core performance bottleneck
4. Vite + React 19 + Zustand + Tailwind + shadcn/ui is the modern stack baseline
5. GitHub Actions deployment replaces the manual docs/ workflow
6. **Two-mode search UX:** Inline tree filter (quick) + Cmd+K command palette (deep search)
7. **cmdk library** for command palette with grouped results and path breadcrumbs
8. **Custom highlight function** — only runs on ~20-50 displayed results, not all 6K items
9. **Tree depth goes to level 9** — path truncation strategy needed for deeply nested results
10. **Same-name disambiguation** via path breadcrumbs is critical (many functions named "GetById", "Update", "DeleteObject" etc.)

**Search comparison summary (based on uFuzzy benchmark, 162K items):**
- FlexSearch: 83ms/86ops (fastest search), 3210ms init, IDs only, TS quirks
- MiniSearch: 1453ms/86ops (~1ms/search at 6K), 504ms init, full docs returned, native TS ← **CHOSEN**
- Fuse.js: 33,875ms/86ops (way too slow), great highlighting but unusable at scale
- Orama: 225ms/86ops, 2650ms init, TypeScript-native, good fallback
- uFuzzy: 434ms/86ops, 0.5ms init (no index!), best perf/memory, nuclear fallback

**UI Improvements recommended:**
- Group root items by namespace prefix (5-8 collapsible groups vs 40+ flat items)
- Recently visited section at top of tree
- Sticky breadcrumb with "Copy API Path" button
- Collapsible detail sections with counts
- Function signatures shown inline: `GetById(id: Int32) → SP.ListItem`
- Dark mode (trivial with shadcn/ui + Tailwind)
- Mobile responsive sidebar as drawer

**Risks (updated):**
- react-arborist doesn't natively support async lazy loading — children must be provided upfront in data. Workaround: compute children on node expand and update the tree data array.
- The metadata JSON format from Azure must remain unchanged (it's produced by Azure Functions in `az-funcs/`).
- **Recursive tree structure** (SP.User → Groups → Users → ...) requires depth limiting in index building (max depth 10).
- **Index building time** on load: needs profiling. MiniSearch init at 6K items should be ~19ms (well under budget). If somehow >500ms, move to Web Worker.

---

---

## UI/UX DESIGN SPECIFICATION

*Finalized from interactive mockup sessions. Static HTML mockups at `.planning/phases/1-rebuild-ui/mockups/`.*

### Design System

**Color palette:**
| Token | Value | Usage |
|-------|-------|-------|
| `--fn-color` | `#2563eb` (blue-600) | Function names, function icons, Explore API accent |
| `--entity-color` | `#059669` (emerald-600) | Entity type names, type links, Explore Types accent |
| `--nav-color` | `#7c3aed` (violet-600) | Navigation property names, "Used by" section |
| `--accent` | `#2563eb` (blue-600) | Active nav, focus rings, primary actions |
| `--text` | `#111827` | Primary text |
| `--text-secondary` | `#6b7280` | Labels, descriptions |
| `--text-muted` | `#9ca3af` | Placeholders, hints, counts |
| `--surface` | `#ffffff` | Cards, panels, header |
| `--bg` | `#fafafa` | Page background |
| `--border` | `#e5e7eb` | Dividers, card borders |

**Typography:**
- Body: System font stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`)
- Monospace: `'SF Mono', 'Cascadia Code', 'Consolas', monospace` — used for all type names, property names, method signatures, code
- Header logo: 15px bold
- Nav links: 13.5px medium
- Content body: 13px-14px
- Table headers: 11px uppercase, letter-spacing 0.04em

**Spacing & sizing:**
- Header: 56px height, sticky
- Sidebar: 280-300px default width, min 200px, max 500px, resizable with drag handle
- Border radius: 8px (`--radius`), 12px (`--radius-lg`)
- Shadows: `--shadow-sm` (subtle), `--shadow-md` (cards)

---

### Page Structure Overview

The app has 4 main views accessible via the header nav:

| View | Route | Sidebar | Content |
|------|-------|---------|---------|
| **Explore API** | `/#/` or `/#/_api/*` | Contextual children of current node | Entity/function detail OR home screen |
| **Explore Types** | `/#/entity` or `/#/entity/:name` | All 2,449 types (filterable) | Type detail OR types welcome |
| **API Changelog** | `/#/api-diff` | Month tabs | Diff tables with color coding |
| **How it works** | `/#/how-it-works` | None | Static info page |

---

### State 1: Home Screen (Explore API, no node selected)

**Layout:** Full-width content, NO sidebar.

**Components (top to bottom):**
1. **Hero section** — centered
   - Title: "SharePoint REST API Explorer"
   - Subtitle: "Browse, search, and understand every endpoint in the SharePoint REST API."
   - Hero search input (read-only, opens Cmd+K on focus)
   - Stats row: `3,528 functions · 2,449 entities · 515 nav properties` with colored dots

2. **Recently Visited** — grid of cards (auto-fill, min 320px)
   - Each card: icon (blue ƒ for function, green T for entity) + name + path (mono) + time
   - Max 6 items, stored in localStorage

3. **Popular Endpoints** — grouped into feature-area cards
   - 6 cards in a 2-column grid:
     - **Core** (web, site, lists, me, contextinfo, files, hubsites)
     - **Content & Pages** (SitePageCollection, TopicPageCollection, sitepages)
     - **People & Social** (PeopleManager, SocialFeedManager, FollowedContent)
     - **Search** (search, SearchSetting)
     - **Administration** (SPSiteManager, TenantCdnApi, SiteMoveService)
     - **Machine Learning** (SPMachineLearningHub)
   - Each card has a colored icon, category name, and clickable endpoint chips
   - Chips use the `ƒ` marker for functions

4. **Browse All** — dashed border link at bottom
   - "Browse all root endpoints (793)" — navigates to State 3 (_api root view)

5. **Footer hint** — "Press Ctrl K to search across all API levels"

**Design rationale:** Grouping all 793+ root endpoints is impractical (names up to 119 chars, 92% over 20 chars). Curated popular endpoints grouped by feature area provides immediate value. Power users use Cmd+K or "Browse All".

---

### State 2: Browsing an API Node (Explore API, node selected)

**Layout:** Breadcrumb bar (full-width) + Sidebar (280px) + Content panel

**Breadcrumb bar:**
- Spans full page width ABOVE sidebar + content (not inside either)
- Format: `_api` > `web` > `Lists` > `GetByTitle(...)` > **Items** (current = bold)
- Each segment is clickable — navigates to that node
- Copy button on far right: copies the full `_api/...` path
- Italic hint text: "click to navigate"

**Sidebar (contextual children):**
- No "Children of" header — items start immediately
- Lists nav properties and functions of the current node
- Each item: icon (ƒ italic for functions, none for nav) + name + type tag (FN/NAV)
- Type tags: `FN` (blue) for functions, `NAV` (purple) for nav properties
- Active item highlighted with blue accent background

**Content panel:**
- Doc banner (green background): "Official documentation available" with link (when available)
- Entity name (20px bold) + full name (mono)
- Collapsible sections with item counts:
  - **Properties** — table with Property | Type columns. Entity types are linked in green.
  - **Navigation Properties** — table with Name | Type. Nav prop names in purple, types linked.
  - **Methods** — table with Method | Parameters | Returns columns.
    - Method names in blue mono
    - Parameters listed one-per-line: `paramName`: `ParamType`
    - Entity types in parameters are linked in green
    - Returns column: entity type link or italic `void`
    - COMPOSABLE badge next to return type when applicable

---

### State 3: All Root Endpoints (_api breadcrumb clicked)

**Layout:** Breadcrumb bar + Wide sidebar (360px) + Content panel

**Sidebar:**
- Filter input at top: "Filter root endpoints..."
- Filter count: "Showing 22 of 793 endpoints"
- All 793 root functions listed
- Long names truncated with prefix ellipsis: `...SiteScriptUtility.CreateSiteScriptPackage`
- Hover shows full name via tooltip
- Sidebar is resizable (drag handle)
- Each item: ƒ icon + truncated name + FN tag

**Content panel:**
- Welcome text: "All Root Endpoints" heading
- Description of the 793 endpoints + filter/search instructions
- Hint: "Click any endpoint in the sidebar to explore its entity, methods, and navigation properties."

---

### State 4a: Explore Types — Landing (no type selected)

**Layout:** Sidebar (300px) + Content panel

**Sidebar:**
- Filter input: "Filter 2,449 types..."
- Count: "2,449 entity types"
- All types listed alphabetically with `T` icon in green
- Long namespaced names truncated with ellipsis

**Content panel (centered welcome):**
- Large green `T` icon (72px)
- Title: "Explore Types"
- Description: "Browse all entity types defined in the SharePoint REST API metadata. Select a type from the sidebar to view its properties, navigation properties, and methods."
- Stats: `2,449 Entity Types · 11,967 Properties · 3,528 Methods`
- Hint: "Select a type from the sidebar, or use Ctrl K to search"

---

### State 4b: Explore Types — Type Detail (e.g., SP.List)

**Layout:** Sidebar (300px, filtered) + Content panel

**URL:** `/#/entity/SP.List`

**Content panel components (top to bottom):**

1. **Type header**
   - Entity name: `SP.List` (22px bold) + "Entity Type" badge (green)
   - Full name in mono: `Full name: SP.List`

2. **Base type chain** (gray background bar)
   - Format: `Base type:` **SP.SecurableObject** → `SP.ClientObject`
   - Each base type is a clickable link (navigates to that type)
   - If no base type: orange background with "No base type (standalone entity)"

3. **"Used by" cross-references** (purple background bar)
   - Shows which entities reference this type via navigation properties
   - Format: "Referenced as navigation property in:" followed by chips
   - Each chip: `SP.Web` `.Lists` — entity name bold, property name dimmed
   - Clickable — navigates to that entity's type page
   - This section is NEW — not in the original site

4. **Section jump links** (row of pills)
   - `Properties (91)` | `Navigation Properties (18)` | `Methods (102)`
   - Each is an anchor link to jump to that section

5. **Properties section** (collapsible)
   - Header: "Properties" + count badge `91` + inline filter input + chevron
   - 3-column table: **Property** | **Type** | **Nullable**
   - Property names in mono font-weight 500
   - Type column: primitive types in gray (`Edm.String`, `Edm.Boolean`, etc.), entity types linked in green (`SP.ChangeToken`, `SP.ResourcePath`)
   - Nullable: "yes" in muted, "no" in blue bold (highlights required fields)
   - Inline filter in header to search within properties

6. **Navigation Properties section** (collapsible)
   - Header: "Navigation Properties" + count badge `18` + chevron
   - 2-column table: **Name** | **Target Type**
   - Name in purple mono (nav-color)
   - Target type linked in green: `SP.User`, `Collection(SP.ContentType)`, `Collection(SP.ListItem)`, etc.
   - All type links navigate to that type's detail page

7. **Methods section** (collapsible)
   - Header: "Methods" + count badge `102` + inline filter input + chevron
   - 3-column table: **Method** | **Parameters** | **Returns**
   - Method name: blue mono bold
   - Parameters column: each param on its own line as `paramName: ParamType`
     - Param name in dark text, param type in muted
     - Entity param types linked in green
     - No params: show italic "none"
   - Returns column: entity type linked in green, or italic `void`
   - COMPOSABLE badge: small blue pill next to return type for composable methods
   - Inline filter in header to search within methods

**Design rationale for methods table:** The original single-line signature format (`MethodName(p1: T1, p2: T2) → ReturnType`) became unreadable for methods with many parameters (e.g., `BulkValidateUpdateListItems` with 5 params). The 3-column table approach matches Properties and Nav Props for consistency, and each parameter on its own line keeps things scannable even for the most complex signatures (up to 133 params on `RenderIBSegmentListDataAsStream`).

---

### State 4c: Explore Types — Different type (navigation)

Clicking any type link (in properties, nav props, method params, or return types) navigates to that type's detail page. The sidebar filter updates to match the new type name, and the content panel shows the new type's detail.

Example: Clicking `SP.View` in SP.List's nav props → URL changes to `/#/entity/SP.View`, sidebar filters to "SP.View" showing 3 results, content shows SP.View detail.

---

### Cmd+K Command Palette (always available)

**Trigger:** `Ctrl+K` (Windows) / `Cmd+K` (Mac), or click the search bar in the header

**Layout:** Centered modal overlay (560px wide), dimmed background

**Components:**
1. **Search input** — full-width, auto-focused, placeholder "Search SharePoint REST APIs..."
2. **Results** — grouped by category:
   - **Functions (N)** — each result shows: ƒ icon + name with highlighted match + truncated path breadcrumb
   - **Entities (N)** — each result shows: T icon + name with highlighted match + "Entity Type" + stats
3. **Footer** — keyboard navigation hints: `↑↓ Navigate · ↵ Open · Esc Close`

**Result disambiguation:** Same-named functions (e.g., multiple `GetById`) are distinguished by their path breadcrumb:
```
ƒ  GetById     web › Lists › GetByTitle › Items
ƒ  GetById     web › SiteGroups
ƒ  GetById     lists
ƒ  GetById     web › ... › File › Versions
```

---

### Cross-View Navigation Rules

| From | To | Trigger |
|------|----|---------|
| Home → API node | Click a popular endpoint chip | Navigate to `/#/_api/{endpoint}` |
| API node → Type | Click any entity type link in content area (e.g., `SP.List` in return type) | Navigate to `/#/entity/SP.List` |
| Type → Type | Click any type link in properties, nav props, method params, or returns | Navigate to `/#/entity/{typeName}` |
| Type → API node | Click entity name in "Used by" chips | Navigate to `/#/entity/{referencingType}` |
| Cmd+K → anything | Select a search result | Navigate to function route or entity route |
| Breadcrumb → parent | Click a breadcrumb segment | Navigate to that API path |
| All Roots → API node | Click any sidebar item in State 3 | Navigate to `/#/_api/{endpoint}` |

---

### Data Model Recap (from metadata.latest.json)

```
entities (Map, keyed by fullName — 2,449 entries)
  ├── name: string                          "List"
  ├── fullName: string                      "SP.List"
  ├── baseTypeName?: string                 "SP.SecurableObject" (230 have this)
  ├── properties: Array                     (up to 348 per entity)
  │   ├── name: string                      "Title"
  │   ├── typeName: string                  "Edm.String" or "SP.ChangeToken"
  │   └── nullable?: false                  (absent = nullable, false = required)
  ├── navigationProperties: Array           (up to 47 per entity)
  │   ├── name: string                      "Items"
  │   └── typeName: string                  "Collection(SP.ListItem)" or "SP.View"
  └── functionIds: number[]                 (up to 271 per entity)

functions (Map, keyed by numeric ID — 3,528 entries)
  ├── id: number
  ├── name: string                          "AddItem" or "SP.Directory.SPHelper.GetMembers"
  ├── isRoot?: true                         (793 functions — XOR with isBindable)
  ├── isBindable?: true                     (2,735 functions — XOR with isRoot)
  ├── isComposable?: true                   (699 functions — flag on either type)
  ├── returnType?: string                   (2,564 have this; 964 are void)
  └── parameters: Array                     (up to 133 per function)
      ├── name: string                      "this" (first param for bindable) or param name
      └── typeName: string                  "Edm.Boolean" or "SP.ListItemCreationInformation"
```

---

### Mockup Files

| File | Contents |
|------|----------|
| `mockups/home-screen.html` | States 1-4 (original): Home, API browsing, All roots, Types (initial sketch) + Cmd+K overlay |
| `mockups/types-view.html` | States 4a-4c (detailed): Types landing, SP.List detail (full), SP.View detail (navigation example) + Cmd+K overlay |
| `mockups/changelog-view.html` | States 5a-5c: Changelog with data, empty month, filtered view (added only) |

All are self-contained static HTML/CSS files with inline styles and minimal JS. Open directly in a browser to view.

---

### State 5a: API Changelog — Active month with changes

**URL:** `/#/api-diff/Feb-2026`

**Layout:** Full-width centered content (max 960px), no sidebar

**Page header:**
- Title: "API Changelog" (26px bold)
- Subtitle: "What's new and what's changed in SharePoint REST API — updated monthly"

**Month tabs:**
- Horizontal tab bar with underline indicator (matches rest of site's tab pattern)
- 6 months shown (current + 5 prior), most recent first
- Active tab: blue text + blue underline
- Labels: `"February 2026"`, `"January 2026"`, etc.
- Clicking a tab navigates to `/#/api-diff/{MonthKey}` (e.g. `Feb-2026`)

**Summary bar** (white card with border):
- Three colored stats in a row: `● 9 Added` (green) · `● 13 Updated` (amber) · `● 8 Removed` (red)
- Each stat has a colored dot, large count number (20px bold), and label
- Right side: total context — `"26 entities · 2 root functions"`
- Vertical separator between stats and total

**Filter chips:**
- Label: "SHOW:" (uppercase, muted)
- Three toggle chips: `Added` (green), `Updated` (amber), `Removed` (red)
- Each chip has a small colored dot + text
- All active by default; clicking toggles visibility of that change type
- Inactive chips: reduced opacity (0.35)
- When filtered, entities/rows not matching the filter are hidden entirely

**Root Functions section:**
- Section header: "Root Functions" + badge "2 changes"
- Clean table with column headers: FUNCTION | RETURN TYPE | CHANGE
- Each row has a colored left border (3px) indicating change type
- Function name in monospace font
- Return type in muted monospace (entity types linked in green)
- CHANGE column: colored pill tag — `ADDED` (green), `REMOVED` (red), `UPDATED` (amber)

**Entities section:**
- Section header: "Entities" + badge "24 entities changed"
- Each entity is a **collapsible card** (not a raw table like the old site)
- Entity card header (always visible):
  - Chevron (rotate 90° when expanded)
  - **Color bar** (4px tall, colored by entity-level changeType: green/amber/red)
  - **Entity name** in monospace bold — clickable link to `/#/entity/{typeName}`
  - **Micro-badges** showing change counts: `+7 props` (green), `-1 fn` (red), etc.
  - For new/deleted entities: `NEW` or `REMOVED` tag pill
- Entity card body (shown when expanded):
  - Sub-sections: Properties, Navigation Properties, Functions — each with uppercase header
  - Sub-table: two columns — Name | Type (or Name | Return Type for functions)
  - Each row has a left border color (3px) indicating its individual changeType
  - Deleted rows: text has `line-through` + reduced opacity
  - Entity type links are green and navigate to `/#/entity/{type}`
  - `void` return types shown in muted italic
- Long entity names: prefix-truncated with `...` (e.g., `...ContentControlStdContent`)
- Cards default: first few expanded, rest collapsed (or all collapsed with click-to-expand)

**Design improvements over original:**
- Summary stats at a glance (original had none — you had to scroll through everything)
- Filter chips to show only adds/updates/removes (original showed everything mixed)
- Collapsible cards instead of one giant flat table (easier to scan 24+ entities)
- Color-coded left borders instead of full-row background tinting (cleaner, more modern)
- Entity names link to type explorer (original linked but less visually prominent)
- Change type tags are explicit pills (original relied on background color only — accessibility concern)
- Centered max-width layout (original was left-aligned at 60% width)

---

### State 5b: API Changelog — Empty month

**URL:** `/#/api-diff/Dec-2025` (example empty month)

**Layout:** Same as 5a but with empty state

**Summary bar:** All counts show `0`, total shows `"0 changes"`

**Empty state (centered):**
- Muted clipboard-check icon (48px, light gray)
- Heading: "No changes recorded"
- Description: "No API changes were detected for December 2025. The diff is generated by comparing monthly metadata snapshots."

---

### State 5c: API Changelog — Filtered view (e.g., "Added" only)

**URL:** `/#/api-diff/Feb-2026` (same URL — filtering is client-side state, not in URL)

**Behavior when filter is active:**
- Summary bar: unchanged (always shows full counts for context)
- Summary total text: changes to `"Showing added only"` (or "Showing removed only")
- Active filter chip: normal opacity; inactive chips: 0.35 opacity
- Root Functions table: only shows rows matching the filter
- Entity cards: only shows entities that have matching changes
  - Updated entities are still shown if they contain added rows (when filtering to "Added")
  - Within expanded cards, only rows matching the filter are shown
  - Sub-section header appends "(added only)" when filtered

**Filter toggle behavior:**
- Click a chip to toggle it on/off independently
- Multiple filters can be active (e.g., "Added" + "Removed" but not "Updated")
- All off = show nothing (edge case, but allowed)
- All on = default state (no filter label)

---

### Data Architecture — Changelog

**Data source:** Static JSON files in Azure Blob Storage
- URL pattern: `https://sprestapiexplorer.blob.core.windows.net/diff-files/{YYYY}y_m{M}_metadata_diffChanges.json`
- `M` is 0-indexed (January = 0)
- 6 months loaded in parallel at app startup, cached in memory

**Data model (from Azure Function output):**

```typescript
interface DiffChanges {
  entities: DiffEntity[]
  functions: DiffFunction[]  // root-level functions only
}

interface DiffEntity {
  changeType: ChangeType       // 0=Add, 1=Update, 2=Delete
  name: string                 // e.g. "SP.Web"
  properties: DiffItem[]
  navigationProperties: DiffItem[]
  functionIds: DiffItem[]      // entity-bound functions
}

interface DiffFunction {
  changeType: ChangeType
  name: string
  returnType?: string
}

interface DiffItem {
  changeType: ChangeType
  name: string
  typeName: string             // type for props/navProps, returnType for functions
}

enum ChangeType {
  Add = 0,
  Update = 1,
  Delete = 2,
  NoChange = 3
}
```

**Client-side derived data:**
- `hasChanges`: computed boolean per entity — true if any of properties/navProps/functionIds is non-empty
- `monthKey`: `"Feb-2026"` format (3-char month name + dash + 4-digit year)
- Summary counts: computed from iterating entities + functions and grouping by changeType

**Route:**
- `/#/api-diff` → redirect to `/#/api-diff/{latestMonthKey}`
- `/#/api-diff/:monthKey` → show that month's diff

---

### State 6: How It Works

**URL:** `/#/how-it-works`

**Layout:** Full-width centered content (max 720px), no sidebar

**Page header:**
- Title: "How it works" (28px bold)
- Subtitle: "Understanding the data behind the SharePoint REST API Metadata Explorer"

**Stats row** (4 cards in a row):
- `2,449 Entity Types` | `11,967 Properties` | `3,528 Functions` | `793 Root Endpoints`
- White cards with border, centered numbers (24px bold) + label (12px muted)

**Content sections** (each with h2 heading + bottom border):

1. **"What is this?"** — Explains $metadata concept. That it's fetched via `GET /_api/$metadata`, is large (~1.5MB), and this explorer parses it into a searchable interface.

2. **"What you should know"** — Yellow callout box warning that $metadata only describes API structure (no examples, HTTP methods, usage guidance). Links to official SharePoint REST docs. Notes Targeted release tenant usage.

3. **"Architecture"** — CSS-based flow diagram (no image):
   - `SharePoint Online` → `Azure Function` → `Azure Blob Storage` → `Explorer App`
   - Each node: colored icon + label + sublabel
   - Arrows with text labels: `_api/$metadata`, `JSON + diff`, `fetch on load`
   - Numbered steps below: 1. Daily fetch, 2. Parse + diff, 3. Store in blob, 4. App loads JSON

4. **"Monthly change tracking"** — Brief explanation linking to the API Changelog page

5. **"Feedback & contributions"** — Two button-links: "Report an issue" and "View on GitHub"

**Design notes:**
- No architecture diagram image — replaced with pure CSS flow (simpler, loads instantly, matches theme)
- Callout box for the important caveat (original had plain text — easy to miss)
- Stats at top give immediate context about the data scope
- Narrower max-width (720px vs 960px) for readability — it's a text-heavy page

---

### Updated Mockup Files

| File | Contents |
|------|----------|
| `mockups/home-screen.html` | States 1-4: Home, API browsing, All roots, Types (initial sketch) + Cmd+K overlay |
| `mockups/types-view.html` | States 4a-4c: Types landing, SP.List detail, SP.View detail + Cmd+K overlay |
| `mockups/changelog-view.html` | States 5a-5c: Changelog with data, empty month, filtered "Added" view |
| `mockups/how-it-works-view.html` | State 6: How it works static page |

All are self-contained static HTML/CSS files. Open directly in a browser to view.
