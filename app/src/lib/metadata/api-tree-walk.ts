import type { EndpointEntry, LookupMaps, Metadata } from './types'

/**
 * BFS tree-walk that builds an API endpoint index from metadata.
 *
 * Starting from root functions, traverses composable return types through
 * entity nav properties and bound functions, building pre-computed _api/ paths.
 *
 * Deduplicates by identity (same function/navProp on same entity type = one entry,
 * shortest path wins). Cycle detection via entity-level visited Set.
 */
export function buildApiEndpointIndex(
  metadata: Metadata,
  lookupMaps: LookupMaps,
): EndpointEntry[] {
  const { entityByFullName, functionById } = lookupMaps

  // Dedup map: identity string → EndpointEntry (shortest path wins)
  const indexed = new Map<string, EndpointEntry>()

  // Entity-level visited set for cycle detection
  const visitedEntities = new Set<string>()

  // BFS queue
  const queue: Array<{ entityFullName: string; path: string }> = []

  // ── Seed phase: all root functions ──
  for (const fn of Object.values(metadata.functions)) {
    if (!fn.isRoot) continue

    const identity = `ROOT|${fn.name}|function`
    const entry: EndpointEntry = {
      id: identity,
      name: fn.name,
      path: `_api/${fn.name}`,
      kind: 'function',
      parentEntity: '',
      isRoot: true,
    }

    // Dedup: keep shorter path
    const existing = indexed.get(identity)
    if (!existing || entry.path.length < existing.path.length) {
      indexed.set(identity, entry)
    }

    // If composable and returns a known entity, enqueue for BFS
    if (fn.isComposable && fn.returnType && entityByFullName.has(fn.returnType)) {
      if (!visitedEntities.has(fn.returnType)) {
        visitedEntities.add(fn.returnType)
        queue.push({ entityFullName: fn.returnType, path: `_api/${fn.name}` })
      }
    }
  }

  // ── BFS phase: traverse entity nav properties and bound functions ──
  while (queue.length > 0) {
    const { entityFullName, path } = queue.shift()!
    const entity = entityByFullName.get(entityFullName)
    if (!entity) continue

    // Nav properties
    for (const nav of entity.navigationProperties) {
      const identity = `${entityFullName}|${nav.name}|navProperty`
      const navPath = `${path}/${nav.name}`
      const entry: EndpointEntry = {
        id: identity,
        name: nav.name,
        path: navPath,
        kind: 'navProperty',
        parentEntity: entityFullName,
        isRoot: false,
      }

      const existing = indexed.get(identity)
      if (!existing || entry.path.length < existing.path.length) {
        indexed.set(identity, entry)
      }

      // If target entity exists and not yet visited, enqueue
      if (entityByFullName.has(nav.typeName) && !visitedEntities.has(nav.typeName)) {
        visitedEntities.add(nav.typeName)
        queue.push({ entityFullName: nav.typeName, path: navPath })
      }
    }

    // Bound functions
    for (const fnId of entity.functionIds) {
      const fn = functionById.get(fnId)
      if (!fn) continue

      const identity = `${entityFullName}|${fn.name}|function`
      const fnPath = `${path}/${fn.name}`
      const entry: EndpointEntry = {
        id: identity,
        name: fn.name,
        path: fnPath,
        kind: 'function',
        parentEntity: entityFullName,
        isRoot: false,
      }

      const existing = indexed.get(identity)
      if (!existing || entry.path.length < existing.path.length) {
        indexed.set(identity, entry)
      }

      // If composable and returns a known entity not yet visited, enqueue
      if (fn.isComposable && fn.returnType && entityByFullName.has(fn.returnType)) {
        if (!visitedEntities.has(fn.returnType)) {
          visitedEntities.add(fn.returnType)
          queue.push({ entityFullName: fn.returnType, path: fnPath })
        }
      }
    }
  }

  return Array.from(indexed.values())
}
