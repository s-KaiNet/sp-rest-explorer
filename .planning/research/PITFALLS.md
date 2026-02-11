# Pitfalls Research: Vue 2 → React 19 SPA Rebuild

**Domain:** Static SPA rebuild (Vue 2 → React 19 + Vite + Tailwind CSS 4 + shadcn/ui), GitHub Pages deployment
**Researched:** 2026-02-11
**Confidence:** HIGH (verified via Context7, official docs, Perplexity cross-referenced)

> **Scope:** Pitfalls the existing Phase 1 research (1-RESEARCH.md) does NOT cover.
> The existing research already addresses: deep clone perf, tree re-render storms, search blocking main thread, GitHub Pages 404 (hash routing), large bundle size, types list DOM node count, stale cache collisions, filter logic inversion, react-arborist async lazy loading, and recursive tree depth limiting. This document covers everything else.

---

## Critical Pitfalls

### Pitfall 1: 4MB JSON.parse() Blocks the Main Thread on Startup

**What goes wrong:**
`JSON.parse()` is synchronous. Parsing the ~4MB metadata JSON takes 200–800ms depending on device. During this time, the browser cannot paint, respond to clicks, or run animations. The loading spinner freezes. On low-end devices or throttled connections, users see a white screen or frozen UI for 1+ seconds after the fetch completes.

**Why it happens:**
Developers `await fetch().then(r => r.json())` without realizing that `.json()` calls `JSON.parse()` on the main thread. The fetch itself is async, but the parse is synchronous and cannot be interrupted.

**How to avoid:**
Parse in a Web Worker. The structured clone transfer between worker and main thread adds ~20-50ms overhead but keeps the UI thread completely free:

```typescript
// worker.ts
self.onmessage = (e: MessageEvent<string>) => {
  const data = JSON.parse(e.data);
  self.postMessage(data);
};

// main thread
const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
const response = await fetch(url);
const text = await response.text(); // text(), not json()
worker.postMessage(text);
worker.onmessage = (e) => store.setMetadata(e.data);
```

If Worker is deemed over-engineered for this scale, accept the 200-800ms freeze but ensure a CSS-only spinner (not React-rendered) is visible before React even mounts. The freeze happens after fetch, so the spinner must be in `index.html`, not in a React component.

**Warning signs:**
- Lighthouse "Total Blocking Time" > 500ms
- Users on mobile report "white screen" after loading bar completes
- React Profiler shows a gap between mount and first meaningful paint

**Phase to address:** Phase 1 — Core data layer (metadata fetching). Decision: use `response.text()` + Worker parse, or accept freeze with CSS spinner.

**Confidence:** HIGH — verified via React docs, multiple sources agree on JSON.parse blocking behavior.

---

### Pitfall 2: React 19 Ref Callback Cleanup Breaks Implicit Returns

**What goes wrong:**
React 19 supports returning a cleanup function from ref callbacks. If existing code (or copied snippets) uses arrow functions with implicit returns in ref callbacks, React 19 interprets the returned value as a cleanup function and tries to call it on unmount, causing runtime errors.

```typescript
// BROKEN in React 19 — implicit return of DOM element
<div ref={(el) => (containerRef = el)} />

// React 19 thinks `el` (the DOM node) is a cleanup function
// On unmount, React calls `el()` → TypeError: el is not a function
```

**Why it happens:**
React 18 ignored ref callback return values. React 19 treats them as cleanup functions. This is a silent behavioral change — TypeScript catches it (ref callbacks must return `void | (() => void)`), but JS code or `any`-typed refs won't warn until runtime.

**How to avoid:**
Always use block bodies for ref callbacks. Never implicit-return:

```typescript
// CORRECT — block body, no return
<div ref={(el) => { containerRef = el; }} />
```

This applies to all ref callbacks including those in react-arborist custom renderers and shadcn/ui component wrappers.

**Warning signs:**
- TypeScript errors about ref callback return types after upgrading to React 19 types
- `TypeError: X is not a function` on component unmount
- Components that work on mount but crash on route navigation

**Phase to address:** Phase 1 — Scaffolding. Set `"strict": true` in tsconfig to catch at compile time.

**Confidence:** HIGH — verified via React 19 upgrade guide on react.dev (Context7).

---

### Pitfall 3: Zustand Persist Middleware Shallow Merge Overwrites State

**What goes wrong:**
Zustand's `persist` middleware uses shallow merge by default when rehydrating. If the persisted state has a subset of fields (via `partialize`), and the store shape changes between versions (e.g., adding `searchQuery` field), rehydration overwrites the entire top-level state, setting new fields to `undefined`.

Example: Store v1 persists `{ hiddenNamespaces: [...] }`. Store v2 adds `theme: 'dark'`. On rehydration, shallow merge produces `{ hiddenNamespaces: [...], theme: undefined }` — the default `'light'` is lost.

**Why it happens:**
`Object.assign({}, currentState, persistedState)` is shallow. If `persistedState` doesn't have `theme`, the default from `currentState` survives. But if `persistedState` has `theme: undefined` (from a browser where the field existed but was cleared), it overwrites the default.

**How to avoid:**
1. Always use `version` and `migrate` in persist config:
```typescript
persist(
  (set) => ({ /* ... */ }),
  {
    name: 'sp-rest-explorer',
    version: 1,
    partialize: (state) => ({ hiddenNamespaces: state.hiddenNamespaces }),
    migrate: (persisted, version) => {
      if (version === 0) {
        // Handle migration from v0 → v1
        return { ...persisted, hiddenNamespaces: persisted.hiddenNamespaces ?? DEFAULT_HIDDEN };
      }
      return persisted;
    },
  }
)
```
2. `partialize` must ONLY persist fields that are user preferences, never derived state.
3. Never persist `metadata`, `isLoading`, or `searchQuery` — these are session state.

**Warning signs:**
- User preferences reset after code deployments
- `undefined` values appearing in state after rehydration
- Console errors about reading properties of `undefined` on first load

**Phase to address:** Phase 1 — Store setup. Add `version: 1` from day one.

**Confidence:** HIGH — verified via Zustand v5 docs (Context7) and persist middleware documentation.

---

### Pitfall 4: Tailwind CSS v4 Default Changes Silently Break Styling

**What goes wrong:**
Tailwind CSS v4 changes multiple defaults that cause visual regressions without any build errors or warnings:

| Change | v3 Default | v4 Default | Impact |
|--------|-----------|-----------|--------|
| `border` color | `gray-200` | `currentColor` | All borders become text-colored (often black/white) |
| `ring` width | `3px` | `1px` | Focus rings become nearly invisible |
| `ring` color | `blue-500` | `currentColor` | Focus rings lose their distinctive color |
| `shadow-sm` | (old values) | Renamed, values shifted | Box shadows change appearance |
| `hover:` variant | Always applied | Only on hover-capable devices | Hover states disappear on touch devices |

**Why it happens:**
The Tailwind v4 upgrade tool (`npx @tailwindcss/upgrade`) handles utility class renames but does NOT fix default value changes. Code that relied on `border` implicitly being `border-gray-200` will silently render differently.

**How to avoid:**
1. After running the upgrade tool, manually audit all uses of `border`, `ring`, `ring-*`, and `shadow-*` classes.
2. For shadcn/ui components: use the latest shadcn/ui CLI (`npx shadcn@latest`) which generates v4-compatible component code. Do NOT manually convert v3 component code — re-add components with the CLI.
3. Set explicit values: `border-border` (using CSS variable), `ring-3 ring-blue-500`, never bare `ring`.
4. For dark mode: Replace `darkMode: 'class'` config with CSS-based variant:
```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
```

**Warning signs:**
- Borders appearing as thick black/white lines instead of subtle gray
- Focus rings nearly invisible during keyboard navigation
- Hover states not working on iPad/tablet testing
- Components looking "off" compared to shadcn/ui examples

**Phase to address:** Phase 1 — Scaffolding + component setup. Use Tailwind v4 from the start (don't start with v3 and migrate).

**Confidence:** HIGH — verified via Tailwind CSS v4 upgrade guide (Context7) and official changelog.

---

### Pitfall 5: shadcn/ui Dark Mode Requires CSS Variable Architecture From Day One

**What goes wrong:**
shadcn/ui uses CSS variables for all colors (e.g., `--background`, `--foreground`, `--primary`). If you set up colors using Tailwind's default color palette (`bg-gray-900`, `text-white`) instead of CSS variables, dark mode becomes a per-component retrofit requiring hundreds of `dark:` variant additions.

**Why it happens:**
Developers start building with Tailwind color utilities directly, then try to add dark mode later. shadcn/ui's dark mode works by swapping CSS variable values in `.dark` class — but only if you use the variable-based classes (`bg-background`, `text-foreground`, `bg-card`, etc.).

**How to avoid:**
1. Run `npx shadcn@latest init` FIRST — it sets up the CSS variable architecture in `globals.css`.
2. Always use semantic color tokens from shadcn/ui: `bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `bg-primary`, etc.
3. Never use raw Tailwind colors (`bg-gray-900`) for surfaces/text — only for decorative accents.
4. For Tailwind v4, CSS variables go in `:root` and `.dark` selectors using `@theme inline`:
```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
}
```

**Warning signs:**
- Component looks good in light mode but broken/unreadable in dark mode
- `dark:` prefix appearing in more than 20% of utility classes
- Colors don't match between shadcn/ui components and custom UI

**Phase to address:** Phase 1 — Scaffolding. Initialize shadcn/ui before writing any components.

**Confidence:** HIGH — verified via shadcn/ui Tailwind v4 guide and official docs.

---

### Pitfall 6: Zustand v5 Selector Instability Causes Infinite Re-render Loops

**What goes wrong:**
Zustand v5 enforces strict selector reference stability. Selectors that return new object/array references on every call trigger infinite re-renders, crashing the app with "Maximum update depth exceeded."

```typescript
// BROKEN — creates new array reference every render
const [search, setSearch] = useAppStore(state => [state.searchQuery, state.setSearchQuery]);

// BROKEN — creates new object reference every render
const filters = useAppStore(state => ({
  hidden: state.hiddenNamespaces,
  query: state.searchQuery,
}));
```

**Why it happens:**
Zustand v4 used `Object.is` by default but tolerated unstable selectors in most cases. Zustand v5 strictly re-renders on any reference change, which aligns with React's default behavior but catches patterns that v4 silently accepted.

**How to avoid:**
1. Use `useShallow` for multi-value selectors:
```typescript
import { useShallow } from 'zustand/shallow';
const { searchQuery, setSearchQuery } = useAppStore(
  useShallow(state => ({ searchQuery: state.searchQuery, setSearchQuery: state.setSearchQuery }))
);
```
2. Prefer individual scalar selectors (most performant, no wrapper needed):
```typescript
const searchQuery = useAppStore(state => state.searchQuery);
const setSearchQuery = useAppStore(state => state.setSearchQuery);
```
3. Never return arrays or objects from selectors without `useShallow`.

**Warning signs:**
- `Maximum update depth exceeded` error on component mount
- React DevTools showing hundreds of re-renders per second
- App freezing when navigating to a specific route

**Phase to address:** Phase 1 — Store setup. Establish selector patterns as part of the store module.

**Confidence:** HIGH — verified via Zustand v5 migration guide (Context7).

---

## Moderate Pitfalls

### Pitfall 7: MiniSearch `addAll()` Blocks Main Thread During Index Build

**What goes wrong:**
`MiniSearch.addAll()` is synchronous. For ~6,000 items, this takes ~19ms — usually imperceptible. But the tree walk that BUILDS the ~6,000 `SearchableItem` array from the metadata (BFS/DFS traversal of recursive entity graph capped at depth 10) could take 50-200ms depending on the metadata structure. Combined with JSON parsing, this can create a 300-1000ms freeze on startup.

**Why it happens:**
Developers benchmark `addAll()` in isolation but forget the index preparation step (walking the metadata tree to build the flat array of searchable items).

**How to avoid:**
1. Measure the FULL pipeline: `fetch → parse → tree walk → addAll()` — not just `addAll()`.
2. If total exceeds 100ms, use `MiniSearch.addAllAsync()` with a `batchSize` of 500-1000:
```typescript
await miniSearch.addAllAsync(items, { chunkSize: 1000 });
```
3. Show a meaningful loading state during index build ("Indexing search...").
4. Alternatively, move both tree walk and index build to the same Web Worker as JSON parsing.

**Warning signs:**
- Lighthouse TBT (Total Blocking Time) spike on initial load
- Search "not ready" for 1-2 seconds after metadata appears loaded
- Mobile users report app freezing briefly after loading spinner disappears

**Phase to address:** Phase 1 — Search index setup.

**Confidence:** HIGH — MiniSearch `addAllAsync` verified via MiniSearch docs; tree walk timing is estimated (MEDIUM confidence on exact ms).

---

### Pitfall 8: MiniSearch Tokenizer Strips Dots and Parens from SP.Web, GetById()

**What goes wrong:**
MiniSearch's default tokenizer splits on non-alphanumeric characters. Searching for `SP.Web` tokenizes to `["sp", "web"]` and matches any item containing both "sp" AND "web" anywhere — returning false positives. Searching for `GetById()` tokenizes to `["getbyid"]` and drops the parentheses, which is fine, but users searching for `SP.` expecting prefix filtering of the SP namespace get unexpected results.

**Why it happens:**
The default `tokenize` function uses word boundaries. Dots, parentheses, and other special characters are treated as separators. This is correct for natural language but wrong for code-like identifiers.

**How to avoid:**
Index BOTH the full qualified name (with dots) AND the short name:
```typescript
const miniSearch = new MiniSearch<SearchableItem>({
  fields: ['name', 'fullName', 'fullPath'],
  storeFields: ['name', 'fullName', 'type', 'path', 'fullPath', 'isRoot'],
  tokenize: (text) => {
    // Split on dots and camelCase boundaries, PLUS keep the full string
    const standard = text.toLowerCase().split(/[\s\.\(\)\/]+/).filter(Boolean);
    const full = [text.toLowerCase().replace(/[()]/g, '')];
    return [...new Set([...standard, ...full])];
  },
  searchOptions: {
    tokenize: (query) => {
      // Also handle search queries the same way
      const standard = query.toLowerCase().split(/[\s\.\(\)\/]+/).filter(Boolean);
      const full = [query.toLowerCase().replace(/[()]/g, '')];
      return [...new Set([...standard, ...full])];
    },
    boost: { name: 3, fullName: 1, fullPath: 0.5 },
    fuzzy: 0.2,
    prefix: true,
  },
});
```
Test with these queries: `SP.Web`, `SP.`, `GetById`, `web/Lists`, `currentuser`.

**Warning signs:**
- Searching "SP.Web" returns all SP.* entities (too many results)
- Searching "GetById()" returns nothing (parens break the query)
- Users complaining search "doesn't find what I'm looking for"

**Phase to address:** Phase 1 — Search index builder.

**Confidence:** MEDIUM — tokenizer behavior inferred from MiniSearch docs and standard NLP tokenization; custom tokenizer not verified against MiniSearch v7 API. Validate during implementation.

---

### Pitfall 9: Vite `base` Path Mismatch Between Dev and Production

**What goes wrong:**
Setting `base: '/sp-rest-explorer/'` in `vite.config.ts` means all asset URLs are prefixed with `/sp-rest-explorer/` in production. But in dev mode, Vite serves at `http://localhost:5173/` (root). If code uses `import.meta.env.BASE_URL` for constructing URLs (e.g., for fetching metadata), the URL differs between dev and prod:
- Dev: `http://localhost:5173/metadata.json`
- Prod: `https://user.github.io/sp-rest-explorer/metadata.json`

But the metadata is fetched from Azure Blob Storage (external URL), not from the app itself — so `base` should NOT affect the metadata fetch URL. The trap is accidentally using relative paths or `BASE_URL` for the external fetch.

**Why it happens:**
Developers see `base` in the config and assume it applies to all URLs. It only applies to asset URLs (JS, CSS, images) — not to `fetch()` calls.

**How to avoid:**
1. Hardcode the Azure Blob Storage URL as an environment variable:
```typescript
// .env
VITE_METADATA_URL=https://pnptelemetryproxy.azurewebsites.net/api/...
```
2. Never use relative paths for external data fetches.
3. Test the production build locally with `vite preview` before deploying:
```bash
npm run build && npx vite preview --port 4173
```
4. Verify that `base` is set correctly for the repo name, including trailing slash.

**Warning signs:**
- Assets (JS/CSS) return 404 in production but work in dev
- Metadata fetch works in dev but fails in production (or vice versa)
- Favicon and static images missing in production

**Phase to address:** Phase 1 — Vite config setup.

**Confidence:** HIGH — verified via Vite v7 docs (Context7).

---

### Pitfall 10: react-arborist `data` Prop Reference Instability Causes Full Tree Re-renders

**What goes wrong:**
react-arborist re-renders when the `data` prop reference changes. If the filtered/derived tree data array is computed inline or without proper memoization, every parent re-render creates a new array reference, causing react-arborist to diff and re-render the entire visible tree.

```typescript
// BROKEN — new array reference every render
<Tree data={metadata.functions.filter(f => !hidden.includes(f.namespace))} />

// BROKEN — useMemo with wrong dependencies
const treeData = useMemo(() => buildTree(metadata), [metadata, searchQuery, hiddenNamespaces, unrelatedState]);
```

**Why it happens:**
React's `useMemo` only prevents recomputation when dependencies are stable. If any dependency changes (even an unrelated one mistakenly included), the tree data is rebuilt, creating a new reference, triggering react-arborist's internal reconciliation across all visible nodes.

**How to avoid:**
1. Use `useMemo` with minimal, correct dependencies:
```typescript
const treeData = useMemo(
  () => buildFilteredRootNodes(metadata, hiddenNamespaces),
  [metadata, hiddenNamespaces] // Only what actually affects the result
);
```
2. Separate search from tree filtering — use react-arborist's `searchTerm`/`searchMatch` props for search (it handles visibility internally), and only rebuild `data` when the structural filter changes (namespace hiding).
3. Profile with React DevTools Profiler — look for `<Tree>` re-renders that don't correspond to user actions.

**Warning signs:**
- Tree flickers or scrolls to top when typing in search
- React DevTools shows `<Tree>` re-rendering on every keystroke
- Noticeable lag when expanding/collapsing tree nodes

**Phase to address:** Phase 1 — Tree view implementation.

**Confidence:** HIGH — react-arborist docs confirm `data` prop drives rendering (Context7); memoization pattern is standard React.

---

### Pitfall 11: React Router 7 `createHashRouter` Lacks Data Router Features

**What goes wrong:**
The existing research recommends `createHashRouter` with route-level `loader` and `action` functions for data fetching. However, `createHashRouter` in React Router 7 is a legacy compatibility API primarily for SPAs that cannot use the full framework mode. While it supports data routers, the ecosystem and documentation increasingly assume `createBrowserRouter` or framework mode. Edge cases with hash routing + lazy loading + error boundaries may be less tested.

**Why it happens:**
React Router 7 positions itself as a framework (successor to Remix). The hash router is maintained for backward compatibility but is not the "happy path." Documentation examples predominantly use `createBrowserRouter`.

**How to avoid:**
1. Use `createHashRouter` in library mode (not framework mode) — this is the correct approach for GitHub Pages.
2. Do NOT use React Router's framework features (`react-router.config.ts`, `@react-router/dev`, SSR/pre-rendering). These require `createBrowserRouter`.
3. Keep routing simple: define routes as objects with `element` props, use `React.lazy()` for code splitting. Do NOT use `loader`/`action` functions — they add complexity with no benefit for a static SPA that fetches all data from a single external JSON.
4. Install `react-router` (not `@react-router/dev`) — the library-only package.

**Warning signs:**
- Imports from `@react-router/dev` or `react-router.config.ts` in a hash-routed app
- `loader` functions in routes that just read from Zustand store
- Build errors about missing server modules

**Phase to address:** Phase 1 — Router setup.

**Confidence:** MEDIUM — React Router 7 hash routing verified as supported (Context7), but "less tested edge cases" is an inference, not a documented issue.

---

### Pitfall 12: GitHub Actions Deploy Fails Silently on Permissions or Path Misconfiguration

**What goes wrong:**
GitHub Actions deployment to GitHub Pages fails or deploys stale content when:
1. Workflow lacks `id-token: write` permission (required by `actions/deploy-pages@v4`)
2. `upload-pages-artifact` points to wrong directory (e.g., `dist` vs `docs`)
3. GitHub Pages source is set to "Deploy from a branch" instead of "GitHub Actions"
4. Concurrency group isn't set, causing parallel deployments to corrupt each other

**Why it happens:**
GitHub Pages deployment via Actions requires THREE settings to align: workflow permissions, artifact path, and repo Pages settings. Missing any one causes silent failures — the workflow "succeeds" but the site doesn't update.

**How to avoid:**
Verified working configuration:
```yaml
permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

steps:
  - uses: actions/configure-pages@v5
  - run: npm run build
  - uses: actions/upload-pages-artifact@v3
    with:
      path: ./dist  # Must match Vite's build.outDir
  - uses: actions/deploy-pages@v4
```
Then in repo Settings → Pages → Source: select "GitHub Actions" (NOT "Deploy from a branch").

**Warning signs:**
- Workflow shows green checkmark but site shows old content
- 404 page on `https://user.github.io/repo-name/`
- Workflow fails with "Error: No permission to deploy to GitHub Pages"

**Phase to address:** Phase 1 — CI/CD setup.

**Confidence:** HIGH — verified via Vite static deploy guide and actions/deploy-pages docs.

---

## Minor Pitfalls

### Pitfall 13: Tailwind v4 CSS-First Config Breaks `@apply` in Component Files

**What goes wrong:**
Tailwind v4 removes `tailwind.config.js` in favor of CSS-based configuration (`@theme`, `@custom-variant`). The `@apply` directive still works but behaves differently: it can only reference utilities that are defined in the same CSS scope. If custom utilities are defined in `globals.css` but `@apply` is used in a CSS module, the reference fails.

**Why it happens:**
Tailwind v4's CSS-first approach means configuration is scoped to the CSS file that imports `tailwindcss`. Separate CSS files don't inherit each other's `@theme` definitions.

**How to avoid:**
1. Minimize `@apply` usage — prefer inline Tailwind classes in JSX (the standard approach with shadcn/ui).
2. If `@apply` is needed, put it in `globals.css` where `@import "tailwindcss"` lives.
3. Do NOT use CSS modules with Tailwind v4 — use utility classes in JSX instead.

**Warning signs:**
- Build warnings about unknown utility classes in `@apply`
- Styles working in dev but missing in production
- Custom utilities not available outside `globals.css`

**Phase to address:** Phase 1 — Styling setup.

**Confidence:** MEDIUM — inferred from Tailwind v4 architecture; specific `@apply` scoping behavior needs validation.

---

### Pitfall 14: React 19 StrictMode Double-Invokes Ref Callbacks and Effects

**What goes wrong:**
React 19 in StrictMode double-invokes ref callbacks on initial mount (to simulate Suspense fallback replacement) and double-runs effects. This means:
- `useEffect` side effects (like building MiniSearch index) run twice in dev
- Ref callbacks fire twice, which can cause issues with imperative DOM measurements
- `useMemo` and `useCallback` reuse results from the first render during the second render (optimization, not a bug)

**Why it happens:**
React 19 StrictMode is stricter about simulating mount/unmount cycles to catch bugs early. This is dev-only behavior — production is unaffected.

**How to avoid:**
1. Ensure all effects are idempotent — building a MiniSearch index twice should produce the same result (it does, as long as you create a new instance, not addAll to an existing one).
2. Use cleanup functions in effects:
```typescript
useEffect(() => {
  const index = new MiniSearch({ /* ... */ });
  index.addAll(items);
  setSearchIndex(index);
  return () => { /* cleanup if needed */ };
}, [items]);
```
3. Don't disable StrictMode to "fix" double-render issues — fix the effect instead.

**Warning signs:**
- Console logs appearing twice in development
- MiniSearch index containing duplicate entries (if you `addAll` to an existing instance)
- Performance seeming worse in dev than prod (expected — double rendering)

**Phase to address:** Phase 1 — Effects and lifecycle setup.

**Confidence:** HIGH — verified via React 19 upgrade guide (Context7).

---

### Pitfall 15: `forwardRef` Removal Breaks Third-Party Component Wrapping Patterns

**What goes wrong:**
React 19 makes `forwardRef` optional — `ref` is now a regular prop. But shadcn/ui components (based on Radix primitives) may still use `forwardRef` internally. If you wrap a shadcn/ui component and forget to forward the ref, features like focus management, scroll-to-element, and form validation break silently.

**Why it happens:**
`forwardRef` still works in React 19, but developers see "forwardRef is no longer needed" and remove it from wrapper components without adding `ref` as a prop.

**How to avoid:**
1. When wrapping shadcn/ui components, always accept and pass through `ref`:
```typescript
function CustomButton({ ref, ...props }: ButtonProps & { ref?: React.Ref<HTMLButtonElement> }) {
  return <Button ref={ref} {...props} />;
}
```
2. Don't strip `forwardRef` from existing shadcn/ui component files — they're generated code and should be treated as-is.
3. Wait for shadcn/ui to officially update components to use `ref` as a prop before modifying.

**Warning signs:**
- Focus not moving to expected element after dialog open
- `scrollIntoView` not working on tree nodes
- Form validation not highlighting the correct input

**Phase to address:** Phase 1 — Component authoring patterns.

**Confidence:** MEDIUM — `forwardRef` still works in React 19 (no breaking change), but the migration path for wrappers needs care. shadcn/ui components as of early 2026 may already be updated.

---

### Pitfall 16: Metadata Stored in Zustand Triggers Unnecessary Re-renders

**What goes wrong:**
Storing the entire ~4MB parsed metadata object in Zustand state means ANY component using `useAppStore(state => state.metadata)` re-renders whenever ANY state field changes (if using a non-selective selector). Even with selective selectors, components that read `metadata` re-render whenever the reference changes — which happens on every `setMetadata` call.

**Why it happens:**
Zustand uses `Object.is` for equality checks. The metadata object reference only changes on initial load (once), but if any code accidentally calls `setMetadata` again (e.g., on re-fetch or hot reload), all metadata-consuming components re-render even if the data is identical.

**How to avoid:**
1. `setMetadata` should only be called ONCE on initial load. Guard against re-calls:
```typescript
setMetadata: (data) => set((state) => {
  if (state.metadata !== null) return state; // Already loaded, no-op
  return { metadata: data };
}),
```
2. Never select the entire metadata object — use derived selectors:
```typescript
// BAD — re-renders on any metadata change
const metadata = useAppStore(state => state.metadata);

// GOOD — only re-renders when entities change (never, since metadata is immutable)
const entities = useAppStore(state => state.metadata?.entities);
```
3. For the MiniSearch index and tree data, compute them OUTSIDE the store using `useMemo` in hooks, not as store state.

**Warning signs:**
- React DevTools showing frequent re-renders of EntityDocs or PropsTable
- Typing in search causes detail panel to flicker
- Performance degradation as more components are added

**Phase to address:** Phase 1 — Store design.

**Confidence:** HIGH — standard Zustand pattern, verified via docs.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skip Web Worker for JSON parse | Simpler code, one fewer file | 200-800ms UI freeze on load | MVP only — add Worker in Phase 2 if TBT > 200ms |
| Use `any` types for metadata JSON | Faster initial development | No autocomplete, silent runtime errors | Never — define types from day one using the JSON schema |
| Inline all styles without design tokens | Ship faster | Dark mode retrofit requires touching every component | Never — use shadcn/ui CSS variables from the start |
| Skip `version` in Zustand persist | Less boilerplate | Future store shape changes break existing users' localStorage | Never — version: 1 from day one |
| Use `initialData` instead of `data` prop in react-arborist | Less code (uncontrolled) | Cannot programmatically update tree without remounting | Acceptable for MVP if no tree manipulation needed |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Building search index on every metadata change | Search lag, TBT spike | Build index once, store ref outside React state | If metadata re-fetched (shouldn't happen in SPA) |
| react-arborist `searchMatch` on 5000+ nodes per keystroke | Typing lag in search input | Debounce search term (300ms), use MiniSearch instead of tree-level filtering for deep search | At ~1000+ visible nodes without debounce |
| Re-deriving tree data on unrelated state changes | Tree scroll position resets, flicker | Minimal `useMemo` dependencies, separate search from structure | With 3+ simultaneous state changes |
| Persisting large state to localStorage | Quota exceeded (5-10MB limit), slow serialization | Only persist preferences (~100 bytes), never metadata | If someone adds metadata to `partialize` |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Azure Blob Storage fetch | Using relative URL or `BASE_URL` prefix | Hardcode full external URL in env variable |
| GitHub Pages + hash routing | Adding `404.html` redirect script | Not needed with `createHashRouter` — all routes are `/#/path` |
| shadcn/ui CLI | Running `npx shadcn init` with Tailwind v3 config present | Ensure Tailwind v4 CSS-first config before running CLI |
| Vite build output | Setting `outDir: '../docs'` (old manual deploy pattern) | Use `outDir: 'dist'` + GitHub Actions artifact upload |
| lucide-react icons | Importing from barrel file `import { Icon } from 'lucide-react'` | Import specific icons `import { Search } from 'lucide-react'` for tree-shaking |

## "Looks Done But Isn't" Checklist

- [ ] **Search:** Works for `SP.Web` (dot in name), `GetById()` (parens), single-character queries — verify tokenizer handles special chars
- [ ] **Dark mode:** All custom components (not just shadcn/ui ones) respect CSS variables — check breadcrumbs, code blocks, loading states
- [ ] **Hash routing:** Deep links work after deploy — test `/#/entity/SP.Web` directly in address bar after GitHub Pages deployment
- [ ] **Loading state:** CSS spinner visible DURING JSON parse, not just during fetch — the parse freeze can hide the spinner
- [ ] **Keyboard navigation:** Cmd+K opens search, Escape closes it, arrow keys work in search results — test without mouse
- [ ] **Tree scroll position:** Navigating back to tree view preserves scroll position — react-arborist resets on `data` prop change
- [ ] **localStorage:** Works in private/incognito mode (localStorage available but cleared on close) — don't crash if localStorage throws
- [ ] **Mobile viewport:** Content doesn't overflow horizontally — test at 375px width with long entity names like `SP.WorkManagement.OM.TaskWriteResult`
- [ ] **Concurrent deploys:** Pushing twice rapidly doesn't corrupt the deployment — verify concurrency group in workflow

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Shallow merge overwrites state | LOW | Add `version` + `migrate` to persist config, deploy new version, users' localStorage auto-migrates |
| Wrong `base` path in Vite | LOW | Fix `vite.config.ts`, rebuild, redeploy — no user-facing data loss |
| Selector infinite loops | LOW | Wrap with `useShallow` or split into scalar selectors — localized fix |
| JSON parse blocking | MEDIUM | Add Web Worker — requires new file, message passing, slightly different data flow |
| Missing CSS variables for dark mode | HIGH | Retrofit requires touching every component's color classes — prevention is much cheaper |
| Wrong tree data structure for react-arborist | HIGH | Changing the data shape requires updating tree builder, search index builder, and all node renderers |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| JSON.parse blocking (1) | Phase 1: Core data layer | Lighthouse TBT < 200ms on throttled CPU |
| Ref callback cleanup (2) | Phase 1: Scaffolding | TypeScript strict mode catches at compile time |
| Zustand persist merge (3) | Phase 1: Store setup | Add unit test: clear localStorage → load → verify defaults |
| Tailwind v4 defaults (4) | Phase 1: Scaffolding | Visual regression test: border, ring, shadow on key components |
| Dark mode CSS vars (5) | Phase 1: Scaffolding | Toggle dark mode after first component — must work immediately |
| Selector instability (6) | Phase 1: Store setup | React DevTools Profiler — no component re-renders > 2x per action |
| MiniSearch addAll blocking (7) | Phase 1: Search setup | Measure with `performance.now()` — total pipeline < 100ms |
| MiniSearch tokenizer (8) | Phase 1: Search setup | Test queries: `SP.Web`, `SP.`, `GetById()`, `web/Lists` |
| Vite base path (9) | Phase 1: Vite config | `vite preview` serves correctly at `/sp-rest-explorer/` |
| Tree data reference (10) | Phase 1: Tree view | React DevTools — Tree doesn't re-render on search keystroke |
| Hash router scope (11) | Phase 1: Router setup | No `@react-router/dev` imports in codebase |
| GitHub Actions deploy (12) | Phase 1: CI/CD | First deploy succeeds, second deploy updates correctly |
| @apply scoping (13) | Phase 1: Styling | No `@apply` in component-level CSS files |
| StrictMode double-invoke (14) | Phase 1: Effects | Search index doesn't contain duplicates in dev mode |
| forwardRef patterns (15) | Phase 1: Component authoring | Wrapped components receive and forward refs correctly |
| Metadata re-render (16) | Phase 1: Store design | Only `setMetadata` is called once; React Profiler confirms |

## Sources

- React 19 Upgrade Guide — https://react.dev/blog/2024/04/25/react-19-upgrade-guide (Context7, HIGH confidence)
- React 19 Release Notes — https://react.dev/blog/2024/12/05/react-19 (Context7, HIGH confidence)
- Zustand v5 Migration Guide — https://zustand.docs.pmnd.rs/migrations/migrating-to-v5 (Context7, HIGH confidence)
- Zustand Persist Middleware — https://zustand.docs.pmnd.rs/integrations/persisting-store-data (Context7, HIGH confidence)
- Tailwind CSS v4 Upgrade Guide — https://tailwindcss.com/docs/upgrade-guide (Context7, HIGH confidence)
- Tailwind CSS v4 Dark Mode — https://tailwindcss.com/docs/dark-mode (Context7, HIGH confidence)
- Vite v7 Build Guide — https://vite.dev/guide/build (Context7, HIGH confidence)
- React Router v7 Hash Router — https://reactrouter.com/api/data-routers/createHashRouter (Context7, HIGH confidence)
- react-arborist README — https://github.com/brimdata/react-arborist (Context7, HIGH confidence)
- MiniSearch API — https://lucaong.github.io/minisearch/ (Perplexity + GitHub, MEDIUM confidence)
- shadcn/ui Tailwind v4 Guide — https://ui.shadcn.com/docs/tailwind-v4 (Perplexity, MEDIUM confidence)
- GitHub Actions Deploy Pages — https://vite.dev/guide/static-deploy (Perplexity + official docs, HIGH confidence)

---
*Pitfalls research for: SP REST API Explorer Vue 2 → React 19 rebuild*
*Researched: 2026-02-11*
