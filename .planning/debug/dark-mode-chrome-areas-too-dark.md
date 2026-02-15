---
status: resolved
trigger: "Dark mode header, breadcrumb bar, and sidebar are too dark — not visually distinct from main background"
created: 2026-02-15T00:00:00Z
updated: 2026-02-15T00:00:00Z
---

## Current Focus

hypothesis: Header, breadcrumb, and sidebar all use `bg-background` which maps to the same oklch(0.14) as the page background — no surface elevation differentiation exists
test: Checked CSS variables and component classes
expecting: Chrome areas should use a lighter surface variable, not the base background
next_action: Report root cause diagnosis

## Symptoms

expected: In dark mode, header/breadcrumb/sidebar should be visually distinct from the main content background — like GitHub Dark where the header is slightly lighter than the page background
actual: All chrome areas appear the same darkness as the page background, making the UI feel flat
errors: n/a
reproduction: Toggle dark mode, observe header and sidebar blend into the page background
started: After Phase 08-03 reworked dark mode palette

## Eliminated

(none needed — root cause found on first investigation)

## Evidence

- timestamp: 2026-02-15T00:01:00Z
  checked: Header.tsx line 36
  found: `bg-background` class → maps to `--background: oklch(0.14 0.005 260)`
  implication: Header uses the base page background, no elevation

- timestamp: 2026-02-15T00:01:00Z
  checked: BreadcrumbBar.tsx line 25
  found: `bg-background` class → same oklch(0.14)
  implication: Breadcrumb bar identical to page background

- timestamp: 2026-02-15T00:01:00Z
  checked: ResizablePanel.tsx (sidebar container)
  found: No explicit background class at all — inherits from parent, which is `bg-background`
  implication: Sidebar has no distinct background

- timestamp: 2026-02-15T00:01:00Z
  checked: SidebarFilter.tsx
  found: No background class — transparent, inherits page background
  implication: Filter area also has no distinct surface

- timestamp: 2026-02-15T00:02:00Z
  checked: CSS variables in .dark block
  found: |
    --background: oklch(0.14 0.005 260)  ← page bg
    --sidebar-background: oklch(0.12 0.005 260)  ← DARKER than page (L=0.12 < 0.14)
    --secondary: oklch(0.20 0.005 260)  ← exists but unused for chrome
    --muted: oklch(0.20 0.005 260)  ← exists but unused for chrome
    Content area uses bg-muted/30 which is very subtle
  implication: |
    1. sidebar-background variable exists but is DARKER (0.12) than page (0.14) — opposite of GitHub Dark pattern
    2. No component actually uses `bg-sidebar` class anyway
    3. Header and breadcrumb use `bg-background` — same as page

- timestamp: 2026-02-15T00:03:00Z
  checked: GitHub Dark reference colors
  found: |
    #0d1117 (L~0.065) = page background
    #161b22 (L~0.104) = header, sidebar (LIGHTER than page)
    #21262d (L~0.147) = more elevated surfaces
    #30363d (L~0.209) = borders
  implication: GitHub Dark makes chrome areas LIGHTER than the page bg; our palette does the opposite for sidebar (darker) and same for header/breadcrumb

## Resolution

root_cause: All chrome surfaces (header, breadcrumb bar, sidebar) use `bg-background` which resolves to the same base dark value oklch(0.14), and the `--sidebar-background` variable is actually set DARKER (oklch 0.12) instead of lighter — the opposite of GitHub Dark's elevation pattern where chrome areas are lighter than the page.
fix: (not applied — diagnosis only)
verification: (n/a)
files_changed: []
