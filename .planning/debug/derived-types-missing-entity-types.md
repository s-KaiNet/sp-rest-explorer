---
status: resolved
trigger: "SP.SecurableObject does not show Derived Types on Explore Types page, even though SP.List inherits from it"
created: 2026-02-14T00:00:00Z
updated: 2026-02-14T00:00:00Z
---

## Current Focus

hypothesis: EntityDetail component does not render derived types — only ComplexTypeDetail does
test: Read EntityDetail.tsx and compare with ComplexTypeDetail.tsx
expecting: EntityDetail lacks derivedTypes lookup and rendering
next_action: Confirmed. Document root cause.

## Symptoms

expected: SP.SecurableObject (an entity type) should show a "Derived Types" section listing SP.List and other types that inherit from it
actual: No "Derived Types" section appears when viewing SP.SecurableObject on the Explore Types page
errors: None — silent omission
reproduction: Navigate to Explore Types → select SP.SecurableObject → observe no Derived Types section
started: Since the feature was built — EntityDetail never had derived types rendering

## Eliminated

(none — root cause found on first hypothesis)

## Evidence

- timestamp: 2026-02-14T00:00:00Z
  checked: type-indexes.ts buildTypeIndexes() lines 82-98
  found: derivedTypes map is built from ALL entities (line 85: `for (const entity of allEntities)`), not just complex types. The data layer is correct.
  implication: The data is available; the bug is in the view layer.

- timestamp: 2026-02-14T00:00:00Z
  checked: ComplexTypeDetail.tsx lines 24-27 and 70-81
  found: ComplexTypeDetail looks up derivedTypes from typeIndexes and renders them. This is correct.
  implication: Complex types show derived types. Entity types do not.

- timestamp: 2026-02-14T00:00:00Z
  checked: EntityDetail.tsx (full file, 145 lines)
  found: EntityDetail does NOT import useTypeIndexes, does NOT look up derivedTypes, and does NOT render a "Derived Types" section. It renders: BaseTypeChain, UsedByBar, SectionJumpLinks, Properties, NavProperties, Methods.
  implication: ROOT CAUSE — EntityDetail is missing the derived types feature entirely.

- timestamp: 2026-02-14T00:00:00Z
  checked: TypesPage.tsx lines 171-176
  found: TypesPage routes to ComplexTypeDetail for complex types and EntityDetail for entity types (line 65: `isComplex` check, lines 171-176: conditional rendering). SP.SecurableObject is an entity type (it has nav properties), so it renders via EntityDetail — which has no derived types section.
  implication: The routing logic is correct; the problem is purely that EntityDetail lacks the derived types UI.

## Resolution

root_cause: EntityDetail.tsx does not look up or render derived types from the typeIndexes. The derivedTypes map in type-indexes.ts correctly indexes ALL entity types (including entity-to-entity inheritance like SP.List → SP.SecurableObject), but EntityDetail.tsx never consumes this data. Only ComplexTypeDetail.tsx renders derived types.

fix: Add derived types lookup and rendering to EntityDetail.tsx — import useTypeIndexes, look up derivedTypes for the entity, and render a "Derived Types" section (similar to ComplexTypeDetail.tsx lines 24-81).

verification: (pending implementation)

files_changed:
- app/src/components/entity/EntityDetail.tsx
