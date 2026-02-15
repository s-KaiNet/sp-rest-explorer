---
status: resolved
trigger: "Types sidebar has horizontal scrolling when type names are long"
created: 2026-02-14T14:30:00Z
updated: 2026-02-14T14:35:00Z
---

## Current Focus

hypothesis: Namespace group header text spans in TypesSidebar lack truncate classes, causing horizontal overflow
test: Compared CSS properties of group header spans vs type item text spans
expecting: Group headers missing min-w-0, flex-1, truncate
next_action: Apply fix

## Symptoms

expected: Long type/namespace names should be truncated with ellipsis, no horizontal scrollbar
actual: Horizontal scrollbar appears in Types sidebar; long namespace group headers overflow
errors: none (visual CSS issue)
reproduction: Navigate to Explore Types, scroll down to see long namespace headers
started: Since initial implementation of TypesSidebar

## Eliminated

- hypothesis: TypesSidebarItem text span missing truncate classes
  evidence: TypesSidebarItem line 35 already has `min-w-0 flex-1 truncate` — same as SidebarItem
  timestamp: 2026-02-14T14:31:00Z

- hypothesis: ResizablePanel missing overflow-x-hidden
  evidence: ResizablePanel inner div (line 67) has overflow-x-hidden, but the scroll container inside creates its own scrolling context
  timestamp: 2026-02-14T14:32:00Z

## Evidence

- timestamp: 2026-02-14T14:31:00Z
  checked: TypesSidebarItem.tsx vs SidebarItem.tsx comparison
  found: Both use identical text span classes (min-w-0 flex-1 truncate). Item-level CSS is not the difference.
  implication: Overflow source is elsewhere

- timestamp: 2026-02-14T14:32:00Z
  checked: DOM scrollWidth measurements via JS
  found: Sidebar scroll container has scrollWidth=603 vs clientWidth=361. Namespace group header buttons are primary overflow source (e.g., "Microsoft.SharePoint.Administration.TenantAdmin.SPOAdminRepo..." with scrollWidth=595)
  implication: Group headers are the main cause of horizontal overflow

- timestamp: 2026-02-14T14:33:00Z
  checked: Computed styles on namespace header span
  found: overflow=visible, textOverflow=clip, whiteSpace=normal, minWidth=auto. Classes are only "text-xs font-semibold uppercase tracking-wide text-muted-foreground" — missing truncate, min-w-0, flex-1
  implication: Namespace header text is not constrained to its container width

- timestamp: 2026-02-14T14:34:00Z
  checked: CSS overflow chain from scroll container to ResizablePanel
  found: overflow-y-auto causes browser to default overflow-x to auto (not visible). When content overflows, horizontal scrollbar appears.
  implication: Two-part fix: truncate namespace headers + add overflow-x-hidden to scroll container for defense

## Resolution

root_cause: |
  Two CSS issues in TypesSidebar causing horizontal overflow:

  1. PRIMARY: Namespace group header text span (TypesSidebar.tsx line 108) has classes
     "text-xs font-semibold uppercase tracking-wide text-muted-foreground" but is MISSING
     "min-w-0 truncate" — so long namespace names like
     "Microsoft.SharePoint.Administration.TenantAdmin.SPOAdminReporting" overflow their
     container button instead of being truncated with ellipsis.

  2. SECONDARY: The scroll container div (TypesPage.tsx line 78) uses "overflow-y-auto"
     which causes browsers to default overflow-x to "auto", creating a horizontal scrollbar
     when content overflows. The ExplorePage doesn't hit this because its SidebarItem content
     never overflows in the first place (no long untruncated group headers).

fix: |
  1. TypesSidebar.tsx line 108: Add "min-w-0 truncate" to namespace header span
  2. TypesPage.tsx line 78: Add "overflow-x-hidden" to scroll container div

verification: Visual check — horizontal scrollbar should be gone, long namespace names truncated with ellipsis
files_changed:
  - app/src/components/types/TypesSidebar.tsx
  - app/src/pages/TypesPage.tsx
