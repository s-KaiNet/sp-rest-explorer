# Comparison: CSS Modules Approaches with Tailwind CSS 4 + Vite 7 + React 19

**Context:** Determining the best approach for combining CSS Modules with Tailwind CSS 4 in a Vite + React 19 project, where Tailwind is already locked in the stack.
**Researched:** 2026-02-11
**Overall Confidence:** HIGH (verified via Tailwind official docs, Context7, Vite v7 docs, GitHub issues)

**Recommendation:** Use **Approach 3: CSS Modules + Tailwind Hybrid** (Tailwind utility classes in JSX for most styling, CSS Modules only for complex component-specific styles that can't be expressed as utilities). Use CSS variables (`var(--color-*)`) inside CSS Modules instead of `@apply`. Add `vite-css-modules` plugin for correct composition/HMR and enable `generateSourceTypes` for type safety.

---

## Executive Summary

Tailwind CSS v4 has a **fundamentally different relationship with CSS Modules** compared to v3. The official Tailwind documentation explicitly states: **"we don't recommend using CSS modules and Tailwind together if you can avoid it."** This isn't just opinion — it's driven by a real architectural constraint: in v4, each CSS Module is processed separately, meaning Tailwind runs N times for N modules, causing slower builds and requiring explicit `@reference` directives to access theme variables.

However, the project requirements (global/shared CSS + per-component CSS Modules) are valid and achievable. The key insight from research is that the **hybrid approach** — using Tailwind utilities in JSX for the majority of styling and CSS Modules only for genuinely complex component-specific styles — is the only approach that doesn't fight Tailwind v4's architecture. Within CSS Modules, you should prefer **CSS variables** (`var(--color-blue-500)`) over `@apply` because variables don't require Tailwind to process those files at all, resulting in better performance and fewer configuration headaches.

**shadcn/ui** is fully compatible with this approach since it exclusively uses Tailwind utility classes in JSX and CSS variables for theming — it doesn't use CSS Modules at all, so there's zero conflict.

---

## Quick Comparison

| Criterion | 1. Vanilla CSS Modules | 2. CSS Modules + @apply | 3. Hybrid (Recommended) | 4. Typed CSS Modules |
|---|---|---|---|---|
| **Tailwind v4 Compatibility** | Good | Poor | Excellent | Good (orthogonal) |
| **Build Performance** | Medium | Poor (N separate Tailwind runs) | Best | Medium |
| **DX / Ergonomics** | Medium | Poor in v4 | Best | Best with types |
| **shadcn/ui Compatibility** | No conflict | No conflict | No conflict | No conflict |
| **Dark Mode Support** | Via CSS vars | Awkward with @apply | Native via Tailwind `dark:` + CSS vars | N/A (orthogonal) |
| **Type Safety** | None by default | None by default | None for Tailwind classes | Full for CSS Module classes |
| **Tailwind Official Stance** | "Don't recommend" | "Use CSS vars instead" | Acceptable | Not addressed |
| **Setup Complexity** | Low | High (need @reference) | Low | Medium |

---

## Detailed Analysis

### Approach 1: Vanilla CSS Modules (`.module.css`)

**How it works:** Vite has built-in support for `.module.css` files. Any file ending in `.module.css` is treated as a CSS Module, returning a JavaScript object of scoped class names. No additional configuration needed.

**Confidence:** HIGH (verified via Vite v7 docs on Context7)

```css
/* Button.module.css */
.button {
  background-color: blue;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
}
.button:hover {
  background-color: darkblue;
}
```

```tsx
import styles from './Button.module.css';
const Button = () => <button className={styles.button}>Click</button>;
```

**Vite v7 Configuration (from Context7):**
```ts
// vite.config.ts — CSS Modules are zero-config, but can be customized:
export default defineConfig({
  css: {
    modules: {
      localsConvention: 'camelCase', // .my-class → styles.myClass
      scopeBehaviour: 'local',
      generateScopedName: '[name]__[local]___[hash:base64:5]',
    }
  }
});
```

**Note:** If using Lightning CSS (`css.transformer: 'lightningcss'`), use `css.lightningcss.cssModules` instead of `css.modules`.

**Strengths:**
- Zero configuration — works out of the box with Vite
- True style scoping — class names are hashed, no collisions
- Familiar to developers coming from CRA/webpack backgrounds
- No dependency on Tailwind at all within the module files

**Weaknesses:**
- You write traditional CSS, losing Tailwind's design system consistency
- No access to Tailwind's theme values unless you manually use CSS variables
- Duplicates responsibility — some styles in Tailwind, some in CSS Modules
- Can lead to inconsistent styling approaches across the team
- Known Vite bugs with CSS Modules composition and HMR (see `vite-css-modules` below)

**Best for:** Projects migrating FROM CSS Modules TO Tailwind, where you need interim compatibility.

---

### Approach 2: CSS Modules + Tailwind `@apply`

**How it works:** Use `@apply` inside `.module.css` files to compose Tailwind utility classes into scoped class names.

**Confidence:** HIGH (verified via official Tailwind docs and multiple GitHub issues)

```css
/* Button.module.css */
@reference "../app.css"; /* REQUIRED in Tailwind v4 */

.button {
  @apply bg-blue-500 text-white px-4 py-2 rounded;
}
.button:hover {
  @apply bg-blue-600;
}
```

**Critical Tailwind v4 Change:** In v4, CSS Modules are processed **separately** from your main stylesheet. They have **no access** to your `@theme`, custom utilities, or custom variants unless you explicitly import them via `@reference`:

```css
@reference "../app.css"; /* or @reference "tailwindcss"; for defaults only */
```

This is a **fundamental architectural change** from v3 where `@apply` "just worked."

**Official Tailwind stance (from tailwindcss.com/docs/compatibility, fetched 2026-02-11):**
> "When using CSS modules, build tools like Vite, Parcel, and Turbopack process each CSS module separately. That means if you have 50 CSS modules in a project, **Tailwind needs to run 50 separate times**, which leads to much slower build times and a worse developer experience."

**Adam Wathan (Tailwind creator) on @apply (from GitHub Discussion #7651, April 2025):**
> "Using `@apply` is just an unnecessary layer of abstraction over doing `color: var(--color-red-800);` and introduces a bunch of tooling and complexity into your project for no real reason. If you're going to write most of the CSS, just write it all."

**Strengths:**
- Keeps Tailwind's design tokens in CSS Module files
- Familiar pattern for teams used to @apply from v3
- Scoped output — classes are still hashed by CSS Modules

**Weaknesses:**
- **Performance:** Each CSS Module file triggers a full Tailwind processing pass
- **Requires `@reference`:** Every `.module.css` file using @apply needs `@reference` — easy to forget, verbose with deep paths
- **Officially discouraged:** Tailwind team explicitly recommends CSS variables over @apply
- **Adam Wathan hints at deprecation:** Multiple signals that @apply may be removed in future versions
- **173+ thumbs-up issue** on GitHub about @apply being "broken" in v4 — the confusion alone is a maintenance risk
- **`theme()` function is deprecated** in v4 — the CSS variable approach is the forward-compatible path

**Best for:** Legacy projects migrating from Tailwind v3 that heavily relied on @apply. **Not recommended for new projects.**

---

### Approach 3: CSS Modules + Tailwind Hybrid (RECOMMENDED)

**How it works:** Use Tailwind utility classes directly in JSX for the vast majority of styling (layout, spacing, typography, colors, responsive, dark mode). Reserve CSS Modules only for styles that genuinely can't be expressed as Tailwind utilities: complex animations, pseudo-element content, third-party library overrides, or complex selectors.

Inside CSS Modules, use **CSS variables** (`var(--color-*)`) instead of `@apply`.

**Confidence:** HIGH (this is the approach closest to Tailwind's official recommendation, verified via docs)

```tsx
// Button.tsx — Tailwind for most styles
import styles from './Button.module.css';
import { cn } from '@/lib/utils';

const Button = ({ variant = 'primary', children }) => (
  <button className={cn(
    'px-4 py-2 rounded font-medium transition-colors',
    variant === 'primary' && 'bg-blue-500 text-white hover:bg-blue-600',
    variant === 'secondary' && 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    styles.buttonAnimation, // CSS Module for complex animation only
  )}>
    {children}
  </button>
);
```

```css
/* Button.module.css — Only for things Tailwind can't do */
.buttonAnimation {
  /* Complex animation using Tailwind's CSS variables for consistency */
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 0 0 var(--color-blue-500 / 0.4);
  }
  50% {
    opacity: 0.8;
    box-shadow: 0 0 0 8px var(--color-blue-500 / 0);
  }
}
```

**Using CSS variables inside CSS Modules (instead of @apply):**
```css
/* Card.module.css */
.card {
  background-color: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
}

/* Dark mode via :global(.dark) selector */
:global(.dark) .card {
  background-color: var(--color-gray-800);
  border-color: var(--color-gray-700);
}
```

**Strengths:**
- **Best performance:** Tailwind doesn't need to process CSS Module files when they only use CSS variables
- **Aligned with official guidance:** This is what Tailwind docs recommend
- **Future-proof:** CSS variables are the forward path; `@apply` and `theme()` are deprecated/discouraged
- **Clean separation of concerns:** Tailwind handles the design system, CSS Modules handle the edge cases
- **shadcn/ui compatible:** shadcn/ui uses Tailwind utilities in JSX + CSS variables for theming — identical pattern
- **cn() utility works seamlessly:** Merge Tailwind classes and CSS Module classes with `clsx` + `tailwind-merge`

**Weaknesses:**
- Requires team discipline about when to use CSS Modules vs. Tailwind
- Two styling paradigms in the same component (but clearly bounded)
- CSS variable names must be known (IDE support helps — Tailwind CSS IntelliSense extension)

**When to use CSS Modules in this approach:**
- Complex `@keyframes` animations
- `::before` / `::after` pseudo-element content
- Complex CSS selectors (`:nth-child`, sibling selectors, etc.)
- Overriding third-party library styles
- Styles that need CSS `composes` for composition
- Grid/layout patterns too complex for utility classes

**When NOT to use CSS Modules:**
- Colors, spacing, typography — use Tailwind utilities
- Responsive design — use Tailwind breakpoints
- Dark mode — use Tailwind `dark:` variant
- Hover/focus/active states — use Tailwind variants
- Flexbox/Grid basics — use Tailwind utilities

---

### Approach 4: Typed CSS Modules

**How it works:** Generate TypeScript `.d.ts` files for CSS Module imports, providing autocomplete and type checking for class names.

**Confidence:** HIGH (verified via Context7 for vite-css-modules, multiple npm packages confirmed)

This is **orthogonal** to approaches 1-3 — it's a DX enhancement, not a styling approach. It can be combined with any of the above.

**Best option: `vite-css-modules` with `generateSourceTypes: true`**

```ts
// vite.config.ts
import { patchCssModules } from 'vite-css-modules';

export default defineConfig({
  plugins: [
    patchCssModules({
      generateSourceTypes: true, // Auto-generates .d.ts files
      exportMode: 'named',      // Enable named imports
    }),
    // other plugins...
  ],
  css: {
    modules: {
      localsConvention: 'camelCase',
      scopeBehaviour: 'local',
    }
  },
  build: {
    target: 'es2022',
  }
});
```

**This plugin (from Context7) solves multiple Vite CSS Module bugs:**
- Dependency duplication (vitejs/vite#7504, #15683)
- HMR not working in CSS Module dependencies (vitejs/vite#16074)
- PostCSS not applied to composed styles (vitejs/vite#10079)
- Missing `composes` errors not reported (vitejs/vite#16075)

**Generated type example:**
```ts
// Button.module.css.d.ts (auto-generated)
declare const classNames: {
  readonly buttonAnimation: string;
};
export default classNames;
export { classNames as buttonAnimation };
```

**Alternative tools (less recommended):**

| Tool | Approach | Status | Notes |
|------|----------|--------|-------|
| `vite-css-modules` + `generateSourceTypes` | Vite plugin, generates `.d.ts` | Active, 2024+ | **Recommended** — fixes Vite bugs AND provides types |
| `typescript-plugin-css-modules` | TS language service plugin | Active | IDE-only, no build-time checking |
| `vite-plugin-sass-dts` | Vite plugin for SCSS modules | Active | SCSS-specific, not needed for plain CSS |
| `typed-css-modules` (npm) | CLI tool | Older | Requires separate build step |
| `vite-plugin-typed-css-modules` | Vite plugin wrapper | Low activity (9 stars) | Thin wrapper around `typed-css-modules` |

---

## Key Questions Answered

### Does Tailwind CSS 4 work well with CSS Modules?

**Technically yes, but Tailwind officially recommends against it.** (HIGH confidence — official docs)

The compatibility is real but comes with caveats:
1. **Performance penalty:** Each CSS Module is processed separately. 50 modules = 50 Tailwind runs.
2. **Requires `@reference`:** To use `@apply` or access theme variables, every CSS Module needs an explicit `@reference` import.
3. **The recommended workaround is CSS variables:** `var(--color-blue-500)` works without any Tailwind processing of the CSS Module file, eliminating both problems.

### Does shadcn/ui conflict with CSS Modules?

**No conflict whatsoever.** (HIGH confidence — verified via shadcn/ui docs)

shadcn/ui components are:
- Local React files (not a package import)
- Styled entirely with Tailwind utility classes in JSX
- Themed via CSS custom properties defined in `globals.css`
- Use `cn()` (clsx + tailwind-merge) for class merging

Since shadcn/ui doesn't use CSS Modules at all, there's zero conflict. You can use CSS Modules in your own components alongside shadcn/ui components without any issues. The `cn()` utility even works to merge Tailwind classes with CSS Module class names:

```tsx
<div className={cn('p-4 bg-white', styles.myCustomAnimation)}>
```

**One note:** shadcn/ui with Tailwind v4 requires proper `@source` directives if components are in a separate directory/package. This is a Tailwind content scanning issue, not a CSS Modules issue.

### Should `@apply` be used in CSS Modules? Is it an anti-pattern?

**Yes, it is effectively an anti-pattern in Tailwind v4.** (HIGH confidence — from Adam Wathan's own statements + official docs)

Evidence:
1. **Official docs say:** "Alternatively, you can also just use CSS variables instead of `@apply` which has the added benefit of letting Tailwind skip processing those files and will improve your build performance"
2. **Adam Wathan (April 2025):** "Using `@apply` is just an unnecessary layer of abstraction... and introduces a bunch of tooling and complexity into your project for no real reason."
3. **`theme()` function is deprecated** in v4, pushing toward CSS variables
4. **173+ thumbs-up GitHub issue** about @apply being confusing/broken in v4
5. Multiple community members report `@apply` + `@reference` is fragile (wrong relative paths, ordering issues)

**When @apply IS acceptable:**
- Overriding third-party library styles where you can't add classes to elements
- One-off migration situations

### How do CSS custom properties (dark mode) interact with CSS Modules?

**CSS custom properties work perfectly with CSS Modules.** (HIGH confidence — fundamental CSS behavior)

CSS variables cascade normally regardless of CSS Module scoping. The scoping only affects class names, not variable references.

**Tailwind v4 dark mode setup:**
```css
/* app.css (global) */
@import "tailwindcss";

/* Option A: OS-preference based (default) */
/* dark: variant uses @media (prefers-color-scheme: dark) */

/* Option B: Class-based toggle (manual control) */
@custom-variant dark (&:where(.dark, .dark *));
```

**Using in CSS Modules:**
```css
/* Component.module.css */
.panel {
  background-color: var(--color-white);
  color: var(--color-gray-900);
}

/* Dark mode override — :global() escapes CSS Module scoping */
:global(.dark) .panel {
  background-color: var(--color-gray-900);
  color: var(--color-gray-100);
}
```

**Better approach:** Use Tailwind's `dark:` variant in JSX instead:
```tsx
<div className={cn('bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100', styles.panel)}>
```

This is simpler, more maintainable, and doesn't require `:global()` workarounds.

**shadcn/ui theming with CSS variables:**
shadcn/ui defines custom CSS properties in `globals.css` under `:root` and `.dark`:
```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  /* ... */
}
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --primary: oklch(0.985 0 0);
  /* ... */
}
```

These variables are accessible inside CSS Modules without any special configuration since they're defined on `:root`/`.dark`.

---

## Recommended Architecture

### File Structure

```
src/
  app.css                    # Global: @import "tailwindcss", @theme, @custom-variant
  components/
    ui/                      # shadcn/ui components (Tailwind utilities only)
      button.tsx
      dialog.tsx
    features/
      TreeView/
        TreeView.tsx          # Tailwind utilities for most styles
        TreeView.module.css   # CSS Module for complex tree animations/selectors
        TreeView.module.css.d.ts  # Auto-generated types
      Panel/
        Panel.tsx
        Panel.module.css      # CSS Module for resize handle, custom scrollbar
  lib/
    utils.ts                 # cn() utility (clsx + tailwind-merge)
```

### Decision Framework: Tailwind vs CSS Module

```
Is this a color, spacing, typography, or responsive style?
  → YES → Use Tailwind utility class in JSX

Is this a hover/focus/active/dark mode state?
  → YES → Use Tailwind variant (hover:, dark:, focus:, etc.)

Is this a complex animation, pseudo-element, or complex selector?
  → YES → Use CSS Module with CSS variables

Is this a third-party library style override?
  → YES → Use CSS Module (or global CSS with specificity)

Everything else?
  → Use Tailwind utility class in JSX
```

### Vite Configuration

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { patchCssModules } from 'vite-css-modules';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    patchCssModules({
      generateSourceTypes: true,
    }),
  ],
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
});
```

### Packages

```bash
# Already installed (Tailwind v4)
npm install tailwindcss @tailwindcss/vite

# CSS Modules type safety + bug fixes
npm install -D vite-css-modules

# Class merging utility (likely already installed with shadcn/ui)
npm install clsx tailwind-merge
```

---

## Pitfalls & Gotchas

### Critical

1. **@apply in CSS Modules requires @reference in v4** — Every CSS Module file using `@apply` must have `@reference "../app.css"` (or `@reference "tailwindcss"` for defaults). Forgetting this causes "Cannot apply unknown utility class" errors. This is the #1 source of confusion in v4.

2. **Performance with many CSS Modules** — Each CSS Module triggers a separate Tailwind processing pass. With 50+ CSS Modules, build times degrade significantly. Mitigation: Use CSS variables instead of `@apply` so Tailwind doesn't need to process those files.

3. **@source directive ordering matters** — When using Tailwind v4 with shadcn/ui in monorepos, `@source` must come immediately after `@import "tailwindcss"` — before other imports like `tw-animate-css`. Wrong ordering silently fails to detect classes.

### Moderate

4. **CSS Module `:global()` for dark mode** — If you need dark mode styles in CSS Modules, you must use `:global(.dark) .localClass` syntax. This is clunky compared to Tailwind's `dark:` variant. Prefer handling dark mode in JSX with Tailwind.

5. **Vite CSS Module composition bugs** — Vite's built-in CSS Module handling has known bugs with `composes`, HMR, and PostCSS integration. The `vite-css-modules` plugin fixes these. Use it.

6. **Type definition drift** — Auto-generated `.d.ts` files can get out of sync. Add `*.module.css.d.ts` to `.gitignore` and regenerate on build. Or commit them with CI checks.

### Minor

7. **Lightning CSS vs PostCSS for CSS Modules** — If you enable `css.transformer: 'lightningcss'`, use `css.lightningcss.cssModules` instead of `css.modules`. The APIs are different.

8. **VS Code @apply warnings** — VS Code's built-in CSS linter doesn't understand `@apply`, `@reference`, `@theme`. Add `.vscode/settings.json` with `"css.lint.unknownAtRules": "ignore"` and install the Tailwind CSS IntelliSense extension.

---

## Sources

| Source | Type | Confidence |
|--------|------|------------|
| [Tailwind CSS v4 Compatibility Docs](https://tailwindcss.com/docs/compatibility) | Official docs (fetched 2026-02-11) | HIGH |
| [Tailwind CSS v4 Functions & Directives](https://tailwindcss.com/docs/functions-and-directives) | Official docs (Context7) | HIGH |
| [Tailwind CSS v4 Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide) | Official docs (Context7) | HIGH |
| [Vite v7.0.0 CSS Modules docs](https://github.com/vitejs/vite/blob/v7.0.0/docs/guide/features.md) | Official docs (Context7) | HIGH |
| [Vite v7.0.0 css.modules config](https://github.com/vitejs/vite/blob/v7.0.0/docs/config/shared-options.md) | Official docs (Context7) | HIGH |
| [vite-css-modules plugin](https://github.com/privatenumber/vite-css-modules) | Context7 + GitHub | HIGH |
| [Adam Wathan on @apply (GitHub #7651)](https://github.com/tailwindlabs/tailwindcss/discussions/7651) | Maintainer statement | HIGH |
| [shadcn/ui Tailwind v4 docs](https://ui.shadcn.com/docs/tailwind-v4) | Official docs | HIGH |
| [@apply broken in v4 (GitHub #16429)](https://github.com/tailwindlabs/tailwindcss/discussions/16429) | Community issue (173+ thumbs up) | MEDIUM |
| [CSS architecture 2025: Tailwind + CSS Modules](https://dev.to/andriy_ovcharov_312ead391/css-architecture-2025-is-tailwind-a-must-have-or-just-hype-jed) | Community article | MEDIUM |
| [Tailwind v4 @apply + @reference (GitHub #15952)](https://github.com/tailwindlabs/tailwindcss/issues/15952) | Bug report | MEDIUM |
| [shadcn/ui monorepo Tailwind v4 issues (GitHub #6878)](https://github.com/shadcn-ui/ui/issues/6878) | Bug report | MEDIUM |

---

## Final Recommendation

**Use the Hybrid approach (Approach 3) with `vite-css-modules` for type safety (Approach 4).**

Specifically:
1. **Tailwind utility classes in JSX** for 90%+ of all styling
2. **CSS Modules (`.module.css`)** only for complex animations, pseudo-elements, complex selectors, and third-party overrides
3. **CSS variables** (`var(--color-*)`) inside CSS Modules — never `@apply`
4. **`vite-css-modules` plugin** with `generateSourceTypes: true` for type-safe CSS Module imports and Vite bug fixes
5. **`cn()` utility** (clsx + tailwind-merge) to seamlessly merge Tailwind classes with CSS Module class names
6. **shadcn/ui** works out of the box — no special handling needed
7. **Dark mode** handled via Tailwind's `dark:` variant in JSX; use `:global(.dark)` in CSS Modules only when absolutely necessary
