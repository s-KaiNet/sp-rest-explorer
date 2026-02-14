import { useSyncExternalStore } from 'react'
import type { EntityType, LookupMaps, Metadata } from './types'

// ── Interfaces ──

export interface UsedByRef {
  entityFullName: string
  entityName: string
  propertyName: string
}

export interface NamespaceGroup {
  namespace: string       // e.g. "SP", "SP.Publishing", "SP.Sharing"
  types: EntityType[]     // sorted alphabetically by name within group
}

export interface TypeIndexes {
  /** All complex types, sorted alphabetically by fullName */
  complexTypes: EntityType[]

  /** Map<typeFullName, EntityType[]> — types that have this type as baseTypeName */
  derivedTypes: Map<string, EntityType[]>

  /** Map<typeFullName, UsedByRef[]> — entities whose nav properties reference this type */
  usedByIndex: Map<string, UsedByRef[]>

  /** Namespace groups for sidebar: { namespace: string, types: EntityType[] }[] */
  namespaceGroups: NamespaceGroup[]

  /** Set of all complex type fullNames for O(1) "is this a complex type?" checks */
  complexTypeNames: Set<string>
}

// ── Module-level singleton ──

let typeIndexes: TypeIndexes | null = null
const listeners = new Set<() => void>()

// ── Subscription (useSyncExternalStore contract) ──

function subscribe(callback: () => void): () => void {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

function getSnapshot(): TypeIndexes | null {
  return typeIndexes
}

// ── Build logic ──

const COLLECTION_RE = /^Collection\((.+)\)$/

/**
 * Determines if an entity is a "complex type" (as opposed to an entity type).
 * Complex types have no navigation properties, no bound functions,
 * and are not synthetic Collection(...) wrappers.
 */
function isComplexType(entity: EntityType): boolean {
  return (
    entity.navigationProperties.length === 0 &&
    entity.functionIds.length === 0 &&
    !entity.fullName.startsWith('Collection(')
  )
}

export function buildTypeIndexes(metadata: Metadata, _maps: LookupMaps): TypeIndexes {
  const allEntities = Object.values(metadata.entities)

  // 1. Classify types
  const complexTypes: EntityType[] = []
  const complexTypeNames = new Set<string>()

  for (const entity of allEntities) {
    if (isComplexType(entity)) {
      complexTypes.push(entity)
      complexTypeNames.add(entity.fullName)
    }
  }
  complexTypes.sort((a, b) => a.fullName.localeCompare(b.fullName))

  // 2. Build derivedTypes index (for ALL entities, not just complex types)
  const derivedTypes = new Map<string, EntityType[]>()

  for (const entity of allEntities) {
    if (entity.baseTypeName) {
      let arr = derivedTypes.get(entity.baseTypeName)
      if (!arr) {
        arr = []
        derivedTypes.set(entity.baseTypeName, arr)
      }
      arr.push(entity)
    }
  }
  // Sort each derived types array alphabetically
  for (const arr of derivedTypes.values()) {
    arr.sort((a, b) => a.fullName.localeCompare(b.fullName))
  }

  // 3. Build usedByIndex (entity types referencing types via nav properties)
  const usedByIndex = new Map<string, UsedByRef[]>()

  for (const entity of allEntities) {
    // Only entity types (not complex types) have nav properties
    if (isComplexType(entity)) continue

    for (const nav of entity.navigationProperties) {
      // Unwrap Collection(...) to get the target type name
      const collectionMatch = nav.typeName.match(COLLECTION_RE)
      const targetTypeName = collectionMatch ? collectionMatch[1] : nav.typeName

      let arr = usedByIndex.get(targetTypeName)
      if (!arr) {
        arr = []
        usedByIndex.set(targetTypeName, arr)
      }
      arr.push({
        entityFullName: entity.fullName,
        entityName: entity.name,
        propertyName: nav.name,
      })
    }
  }
  // Sort each usedBy array alphabetically
  for (const arr of usedByIndex.values()) {
    arr.sort((a, b) =>
      `${a.entityFullName}.${a.propertyName}`.localeCompare(
        `${b.entityFullName}.${b.propertyName}`,
      ),
    )
  }

  // 4. Build namespace groups (ALL types: entity + complex, excluding Collection wrappers)
  const nsMap = new Map<string, EntityType[]>()

  for (const entity of allEntities) {
    if (entity.fullName.startsWith('Collection(')) continue

    const lastDot = entity.fullName.lastIndexOf('.')
    const namespace = lastDot > 0 ? entity.fullName.substring(0, lastDot) : ''

    let arr = nsMap.get(namespace)
    if (!arr) {
      arr = []
      nsMap.set(namespace, arr)
    }
    arr.push(entity)
  }

  const namespaceGroups: NamespaceGroup[] = []
  for (const [namespace, types] of nsMap.entries()) {
    types.sort((a, b) => a.name.localeCompare(b.name))
    namespaceGroups.push({ namespace, types })
  }
  namespaceGroups.sort((a, b) => a.namespace.localeCompare(b.namespace))

  // 5. Build complexTypeNames Set (already built in step 1)

  return {
    complexTypes,
    derivedTypes,
    usedByIndex,
    namespaceGroups,
    complexTypeNames,
  }
}

// ── Public API ──

/** Build and store type indexes from metadata + lookup maps. */
export function initTypeIndexes(metadata: Metadata, maps: LookupMaps): void {
  typeIndexes = buildTypeIndexes(metadata, maps)
  listeners.forEach((cb) => cb())
}

/** Get current type indexes (for non-React code). */
export function getTypeIndexes(): TypeIndexes | null {
  return typeIndexes
}

/** React hook — returns TypeIndexes | null, re-renders on change. */
export function useTypeIndexes(): TypeIndexes | null {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
