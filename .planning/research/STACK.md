# Stack Research

**Domain:** Data-heavy API documentation explorer SPA (static, GitHub Pages)
**Researched:** 2026-02-11
**Confidence:** HIGH

## Verification Summary

The locked choices from Phase 1 research are **mostly confirmed with version updates**. Key corrections:

| Original Choice | Actual Current Version | Status |
|----------------|----------------------|--------|
| React 19 | **19.2.4** | ✅ Confirmed — latest stable |
| Vite 6 | **7.3.1** | ⚠️ **UPDATE** — Vite 7 is current, Vite 6 still maintained at 6.4.1 |
| TypeScript 5 | **5.9.3** | ✅ Confirmed |
| Zustand 5 | **5.0.11** | ✅ Confirmed |
| Tailwind CSS 4 | **4.1.18** | ✅ Confirmed |
| React Router 7 | **7.13.0** | ✅ Confirmed — `createHashRouter` verified in docs |
| react-arborist 3.4.x | **3.4.3** | ✅ Confirmed — supports React ≥16.14 |
| MiniSearch 7.x | **7.2.0** | ✅ Confirmed |
| cmdk v1.x | **1.1.1** | ✅ Confirmed — supports React 18/19 |
| @tanstack/react-table 8.x | **8.21.3** | ✅ Confirmed |
| lucide-react | **0.563.0** | ✅ Confirmed |
| shadcn/ui | CLI at **3.8.4** | ✅ Confirmed — Vite installation guide current |

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| React | 19.2.x | UI framework | Latest stable. Concurrent features, `use()` API, improved Suspense. Industry standard for SPA development. | HIGH — npm registry verified |
| React DOM | 19.2.x | DOM rendering | Paired with React. Required for SPA rendering. | HIGH |
| Vite | 7.x | Build tool & dev server | **Updated from v6.** Vite 7 is the current latest (7.3.1). Requires Node.js 20.19+ or 22.12+. `@vitejs/plugin-react` 5.x supports Vite 4–7. Native ESM, fast HMR, Rollup-based production bundling. | HIGH — npm + Context7 verified |
| TypeScript | 5.9.x | Type safety | Latest stable. Strict mode, modern features, excellent IDE support. | HIGH — npm verified |
| Zustand | 5.0.x | State management | Lightweight (2KB), hook-based, persist middleware built-in. Perfect for single-store pattern (one large JSON blob + UI state). No boilerplate. v5 requires `useShallow` for array/object selectors. | HIGH — Context7 verified |
| Tailwind CSS | 4.x | Styling | v4 uses `@tailwindcss/vite` plugin (no PostCSS config). CSS-first configuration, automatic content detection, dark mode via `dark:` variants. Zero runtime. | HIGH — Context7 verified |
| React Router | 7.x | Client-side routing | `createHashRouter` confirmed in v7.9.4+ docs. Hash routing required for GitHub Pages (no server-side routing). Library mode (not framework mode) — no `@react-router/dev` needed. | HIGH — Context7 verified |

### Feature Libraries

| Library | Version | Purpose | Why Recommended | Confidence |
|---------|---------|---------|-----------------|------------|
| react-arborist | 3.4.x | Virtualized tree view | Built on react-window. Virtual rendering, keyboard nav, search/filter, drag-and-drop (not needed but free). Rich `TreeApi` and `NodeApi` for programmatic control (`scrollTo`, `openParents`, `focus`). Peer dep: React ≥16.14 (React 19 ✅). | HIGH — Context7 API verified |
| MiniSearch | 7.2.x | Full-text search index | Native TypeScript generic `MiniSearch<T>`. Returns stored documents directly (no separate Map needed). Prefix + fuzzy + field boosting. ~19ms init / ~1ms search at 6K items. MIT license, 29KB minified. | HIGH — Context7 verified |
| cmdk | 1.1.x | Command palette (Cmd+K) | Fast, unstyled, accessible. `Command.Dialog` for modal overlay. Keyboard navigation built-in. Peer dep: React 18/19 ✅. shadcn/ui wraps this as `<CommandDialog>`. | HIGH — Context7 verified |
| @tanstack/react-table | 8.x | Data tables | Headless, sortable, filterable. Used for properties/methods tables in entity detail views. Peer dep: React ≥16.8 ✅. Types included in base package. | HIGH — Context7 verified |
| @tanstack/react-virtual | 3.x | List virtualization | For the Types list (~2,449 entities). `useVirtualizer` hook. Peer dep: React 16–19 ✅. Separate from react-arborist (which handles tree virtualization). | HIGH — npm verified |
| lucide-react | latest (0.563.x) | Icons | Tree-shakeable SVG icons. Default icon library for shadcn/ui. Consistent style. No version pinning needed — follows semver. | HIGH — shadcn/ui docs verified |
| react-resizable-panels | 4.x | Resizable sidebar | Peer dep: React 18/19 ✅. Keyboard accessible. CSS-based, no canvas. Replaces the current `interactjs` approach. | HIGH — npm verified |

### UI Component System

| Tool | Version | Purpose | Notes | Confidence |
|------|---------|---------|-------|------------|
| shadcn/ui (CLI: `shadcn`) | 3.8.x | Component scaffolding | NOT a dependency — copies component source into project. Uses Radix UI primitives under the hood. Tailwind CSS 4 compatible. Components needed: Button, Dialog, Command, Tabs, Table, Collapsible, Breadcrumb, Input, Badge, Tooltip, DropdownMenu, Sheet (mobile drawer), Skeleton. | HIGH — Context7 verified |
| class-variance-authority | 0.7.x | Component variant styling | Required by shadcn/ui components. Enables type-safe variant props. | HIGH |
| clsx | 2.x | Conditional classnames | Required by shadcn/ui `cn()` utility. | HIGH |
| tailwind-merge | 3.x | Tailwind class dedup | Required by shadcn/ui `cn()` utility. Merges conflicting Tailwind classes. | HIGH |
| tw-animate-css | 1.x | CSS animations | Required by shadcn/ui for component animations (dialog enter/exit, etc.). | HIGH |

### Development Tools

| Tool | Version | Purpose | Notes | Confidence |
|------|---------|---------|-------|------------|
| @vitejs/plugin-react | 5.x | Vite React integration | Fast Refresh, JSX transform. Peer dep: Vite 4–7 ✅. | HIGH |
| @tailwindcss/vite | 4.x | Tailwind Vite plugin | Replaces PostCSS-based setup. Matches Tailwind CSS version. | HIGH |
| ESLint | 10.x | Linting | ESLint 10 is current. Use flat config format (`eslint.config.js`). | HIGH |
| @eslint/js | 10.x | ESLint core rules | Base recommended rules. | HIGH |
| typescript-eslint | 8.x | TypeScript lint rules | `@typescript-eslint/parser` + `@typescript-eslint/eslint-plugin` in one package. | HIGH |
| eslint-plugin-react-hooks | 7.x | React hooks lint rules | Enforces Rules of Hooks + exhaustive deps. | HIGH |
| eslint-plugin-react-refresh | 0.5.x | Fast Refresh lint rules | Warns on components not compatible with React Fast Refresh. | HIGH |
| Prettier | 3.x | Code formatting | 3.8.1 current. Standard formatting. | HIGH |
| @types/react | 19.x | React type definitions | 19.2.13 current. | HIGH |
| @types/react-dom | 19.x | React DOM types | 19.2.3 current. | HIGH |

### Testing (Optional but Recommended)

| Tool | Version | Purpose | Notes | Confidence |
|------|---------|---------|-------|------------|
| Vitest | 4.x | Test runner | Vite-native test runner. Shares Vite config. Fast, Jest-compatible API. | HIGH |
| @testing-library/react | 16.x | React component testing | Peer dep: React 18/19 ✅. | HIGH |
| @testing-library/jest-dom | 6.x | DOM assertion matchers | `toBeInTheDocument()`, `toHaveTextContent()`, etc. | HIGH |
| @testing-library/user-event | 14.x | User interaction simulation | `userEvent.click()`, `userEvent.type()`. More realistic than `fireEvent`. | HIGH |
| jsdom | 28.x | DOM environment | Provides browser-like DOM for Vitest. | HIGH |

---

## Installation Commands

```bash
# 1. Scaffold the project
npm create vite@latest app -- --template react-ts

# 2. Core dependencies
npm install react@19 react-dom@19 react-router zustand minisearch react-arborist cmdk @tanstack/react-table @tanstack/react-virtual lucide-react react-resizable-panels

# 3. shadcn/ui prerequisites
npm install tailwindcss @tailwindcss/vite class-variance-authority clsx tailwind-merge tw-animate-css

# 4. Dev dependencies
npm install -D typescript @types/react @types/react-dom @vitejs/plugin-react eslint @eslint/js typescript-eslint eslint-plugin-react-hooks eslint-plugin-react-refresh prettier

# 5. Testing (optional)
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom

# 6. Initialize shadcn/ui (after Vite config + Tailwind are set up)
npx shadcn@latest init

# 7. Add shadcn/ui components as needed
npx shadcn@latest add button dialog command tabs table collapsible breadcrumb input badge tooltip dropdown-menu sheet skeleton
```

---

## Alternatives Considered

| Category | Recommended | Alternative | When to Use Alternative |
|----------|-------------|-------------|-------------------------|
| Build tool | Vite 7 | Vite 6 (6.4.1) | If a dependency has Vite 7 incompatibility (unlikely — `@vitejs/plugin-react` 5.x supports both). Vite 6 is still maintained with security patches. |
| State management | Zustand | Jotai | If you need atomic/granular reactivity for many independent pieces of state. Overkill here — one store with one large blob + UI flags. |
| State management | Zustand | Redux Toolkit | If you need Redux DevTools ecosystem, middleware chains, or team familiarity. Too much boilerplate for this app's simple state shape. |
| Routing | React Router 7 | TanStack Router | If you need type-safe route params and file-based routing. Hash mode support is less proven. Our app has 4 simple routes — React Router is simpler. |
| Search | MiniSearch | FlexSearch | If searching 50K+ items where sub-millisecond matters. At 6K items both are instant (~1ms). FlexSearch returns only IDs (need separate Map), worse DX. |
| Search | MiniSearch | uFuzzy | If you need zero init time and minimal memory. Less feature-rich (no field boosting, no stored fields). Good fallback if MiniSearch is somehow too slow. |
| Tree view | react-arborist | Custom + react-window | If react-arborist's API doesn't fit the contextual sidebar pattern. May need custom wrapper regardless — research says sidebar shows children of current node, not full tree. |
| UI components | shadcn/ui | Radix UI Themes | If you want a pre-styled component library instead of copy-paste. Less customizable, heavier bundle. |
| Tables | @tanstack/react-table | AG Grid | If you need Excel-like features (cell editing, row grouping, pivoting). Massive overkill for read-only property tables. |
| Icons | lucide-react | Heroicons | If you prefer Heroicons style. Less integrated with shadcn/ui (which defaults to lucide). |
| CSS | Tailwind CSS 4 | CSS Modules | If you prefer scoped CSS-in-file. Slower iteration, no utility-first composition, no built-in dark mode toggle. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Element UI / Ant Design / MUI | Heavy component libraries with their own styling systems. Conflict with Tailwind. Large bundle. | shadcn/ui (copy-paste, Tailwind-native, tree-shaken) |
| Redux (vanilla) | Excessive boilerplate for simple state. Actions, reducers, action creators for what Zustand does in 20 lines. | Zustand 5 |
| Webpack | Slow HMR, complex config, outdated for new projects. | Vite 7 |
| CSS-in-JS (styled-components, Emotion) | Runtime overhead, larger bundle, conflicts with Tailwind. Moving away from industry favor. | Tailwind CSS 4 |
| Fuse.js | ~15ms per search at 6K items. Marginal for type-ahead. 34 seconds for 86 searches at 162K items. | MiniSearch (~1ms at 6K items) |
| react-table (v7, old package) | Deprecated. Replaced by @tanstack/react-table v8. | @tanstack/react-table 8.x |
| react-window (standalone) | react-arborist already uses react-window internally for tree virtualization. Don't add separately for the tree. | Built into react-arborist |
| interactjs | Heavy drag-and-drop library used in old code for resizable panels. Overkill. | react-resizable-panels |
| Create React App | Deprecated, unmaintained. | Vite |
| Next.js / Remix | SSR frameworks. This is a static SPA on GitHub Pages — no server. | Vite + React Router (library mode) |

---

## Version Compatibility Matrix

All peer dependency compatibility verified against npm registry on 2026-02-11.

| Package | React 19 | Vite 7 | TypeScript 5.9 | Notes |
|---------|----------|--------|----------------|-------|
| react-arborist 3.4.3 | ✅ (≥16.14) | N/A | ✅ | No Vite dep |
| cmdk 1.1.1 | ✅ (18/19) | N/A | ✅ | No Vite dep |
| @tanstack/react-table 8.21.3 | ✅ (≥16.8) | N/A | ✅ | No Vite dep |
| @tanstack/react-virtual 3.13.18 | ✅ (16–19) | N/A | ✅ | No Vite dep |
| zustand 5.0.11 | ✅ (≥18) | N/A | ✅ | Optional peer: immer |
| react-router 7.13.0 | ✅ (≥18) | N/A | ✅ | No Vite dep |
| react-resizable-panels 4.6.2 | ✅ (18/19) | N/A | ✅ | No Vite dep |
| @vitejs/plugin-react 5.1.4 | N/A | ✅ (4–7) | ✅ | Bridges React + Vite |
| @tailwindcss/vite 4.1.18 | N/A | ✅ | ✅ | Matches Tailwind ver |
| @testing-library/react 16.3.2 | ✅ (18/19) | N/A | ✅ | Optional |
| lucide-react 0.563.0 | ✅ | N/A | ✅ | No version constraints |
| minisearch 7.2.0 | N/A | N/A | ✅ | Pure JS, no React dep |

---

## Zustand v5 Gotcha: `useShallow` Requirement

Zustand v5 changed selector behavior. Selectors returning new references (arrays, objects) can cause infinite loops. This is the most likely migration pitfall.

**Problem:**
```typescript
// ❌ This causes "Maximum update depth exceeded" in Zustand v5
const [query, setQuery] = useAppStore(s => [s.searchQuery, s.setSearchQuery])
```

**Solution:**
```typescript
import { useShallow } from 'zustand/shallow'

// ✅ Correct in Zustand v5
const [query, setQuery] = useAppStore(useShallow(s => [s.searchQuery, s.setSearchQuery]))

// ✅ Or even better: select individual values
const query = useAppStore(s => s.searchQuery)
const setQuery = useAppStore(s => s.setSearchQuery)
```

---

## Vite 7 vs Vite 6 Decision

**Recommendation: Use Vite 7** because:

1. It's the current `@latest` on npm (7.3.1 as of 2026-02-11)
2. `@vitejs/plugin-react` 5.x explicitly supports Vite 4–7
3. `@tailwindcss/vite` 4.x works with Vite 7
4. `npm create vite@latest` scaffolds a Vite 7 project
5. Node.js requirement (20.19+ or 22.12+) is fine — GitHub Actions `setup-node` supports Node 22

The original research specified Vite 6, which was current at the time (2026-02-10). Vite 7 was released between then and now. Since this is a greenfield project, there's no migration cost — use the latest.

**If Vite 7 causes issues:** Fall back to `vite@6` (6.4.1). Both are maintained. The Vite config is identical between v6 and v7 for this project's needs.

---

## Node.js Requirement

Vite 7 requires **Node.js 20.19+ or 22.12+**. GitHub Actions should use:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 22
```

---

## shadcn/ui Setup Notes

shadcn/ui is NOT installed as a package. It's a CLI that copies component source files into your project. Setup flow:

1. Install prerequisites (Tailwind CSS 4, CVA, clsx, tailwind-merge, tw-animate-css)
2. Configure `vite.config.ts` with path aliases (`@/` → `./src/`)
3. Configure `tsconfig.json` with matching path aliases
4. Run `npx shadcn@latest init` — creates `components.json` + `lib/utils.ts`
5. Add components: `npx shadcn@latest add <component-name>`

Components are source files in `src/components/ui/` — fully customizable, no version lock-in.

---

## React Router 7: Library Mode (Not Framework Mode)

React Router 7 can be used as a library (like v6) or as a framework (with `@react-router/dev`). **Use library mode.**

- No `@react-router/dev` needed
- No file-based routing
- No SSR/streaming
- Just `createHashRouter` + `RouterProvider` — same pattern as React Router 6

```typescript
import { createHashRouter, RouterProvider } from 'react-router'

const router = createHashRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <ExplorerPage /> },
      { path: '_api/*', element: <ExplorerPage /> },
      { path: 'entity', element: <TypesPage /> },
      { path: 'entity/:typeName', element: <TypesPage /> },
      { path: 'api-diff', element: <ChangelogPage /> },
      { path: 'api-diff/:monthKey', element: <ChangelogPage /> },
      { path: 'how-it-works', element: <HowItWorksPage /> },
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}
```

---

## TanStack Table v8 vs v9

The original research locked @tanstack/react-table 8.x. Current latest is **8.21.3** — there is no v9 release. v8 is the current major version. No change needed.

Note from TanStack Table docs: "May have compatibility issues with React 19's new Compiler." This is LOW confidence — the React Compiler is opt-in and this app doesn't need it. Standard React 19 without the Compiler works fine.

---

## Sources

- npm registry (verified 2026-02-11) — all version numbers
- Context7 `/websites/react_dev` — React 19 features, `use()` API
- Context7 `/vitejs/vite/v7.0.0` — Vite 7 migration, Node.js requirements
- Context7 `/pmndrs/zustand/v5.0.8` — Zustand v5 migration, `useShallow` requirement
- Context7 `/remix-run/react-router/react-router_7.9.4` — `createHashRouter` API, library mode
- Context7 `/websites/tailwindcss` — Tailwind CSS v4 Vite integration
- Context7 `/websites/tanstack_table` — TanStack Table v8 installation, React 19 note
- Context7 `/brimdata/react-arborist` — Tree API reference, NodeApi, search/filter
- Context7 `/pacocoursey/cmdk` — Command palette API, Dialog, keyboard shortcut pattern
- Context7 `/shadcn-ui/ui/shadcn_3.5.0` — Vite installation guide, manual dependencies
- Context7 `/lucaong/minisearch` — MiniSearch API, search options, TypeScript usage

---
*Stack research for: SP REST API Explorer rebuild (Vue 2 → React 19)*
*Researched: 2026-02-11*
