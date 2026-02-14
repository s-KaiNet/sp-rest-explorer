import type { EndpointEntry, LookupMaps, Metadata } from './types'

/**
 * Max depth for BFS traversal (segments below root function).
 * Depth 4 covers ~62K endpoints in ~15ms — comprehensive paths up to 5 segments
 * (e.g. `_api/lists/GetById/RootFolder/Files/GetByUrlOrAddStub`).
 */
const MAX_DEPTH = 4

/**
 * BFS tree-walk that builds an API endpoint index from metadata.
 *
 * Starting from root functions, traverses composable return types through
 * entity nav properties and bound functions, building pre-computed _api/ paths.
 *
 * Every unique path is indexed — the same function on the same entity type
 * reachable via different paths produces separate entries so users can find
 * e.g. `GetByUrlOrAddStub` at every path it appears.
 *
 * Cycle prevention uses **per-path ancestor tracking**: an entity type is only
 * skipped if it already appears in the current path's ancestor chain (prevents
 * infinite loops like SP.Web → ParentWeb → SP.Web). The same entity type CAN
 * be visited via independent paths. Depth limit provides a hard cap.
 */
export function buildApiEndpointIndex(
  metadata: Metadata,
  lookupMaps: LookupMaps,
): EndpointEntry[] {
  const { entityByFullName, functionById } = lookupMaps

  // All endpoint entries — one per unique path
  const entries: EndpointEntry[] = []

  // Path dedup: multiple root function overloads can produce the same path
  const seenPaths = new Set<string>()

  // BFS queue: each item carries ancestor entity types for per-path cycle detection
  const queue: Array<{
    entityFullName: string
    path: string
    depth: number
    ancestors: Set<string>
  }> = []

  // ── Seed phase: all root functions ──
  for (const fn of Object.values(metadata.functions)) {
    if (!fn.isRoot) continue

    const rootPath = `_api/${fn.name}`
    if (seenPaths.has(rootPath)) continue
    seenPaths.add(rootPath)

    entries.push({
      id: rootPath,
      name: fn.name,
      path: rootPath,
      kind: 'function',
      parentEntity: '',
      isRoot: true,
    })

    // If composable and returns a known entity, enqueue for BFS
    if (fn.isComposable && fn.returnType && entityByFullName.has(fn.returnType)) {
      const ancestors = new Set<string>([fn.returnType])
      queue.push({ entityFullName: fn.returnType, path: rootPath, depth: 1, ancestors })
    }
  }

  // ── BFS phase: traverse entity nav properties and bound functions ──
  while (queue.length > 0) {
    const { entityFullName, path, depth, ancestors } = queue.shift()!
    if (depth > MAX_DEPTH) continue

    const entity = entityByFullName.get(entityFullName)
    if (!entity) continue

    // Nav properties
    for (const nav of entity.navigationProperties) {
      const navPath = `${path}/${nav.name}`
      if (seenPaths.has(navPath)) continue
      seenPaths.add(navPath)

      entries.push({
        id: navPath,
        name: nav.name,
        path: navPath,
        kind: 'navProperty',
        parentEntity: entityFullName,
        isRoot: false,
      })

      // Enqueue if target entity exists and NOT in current path's ancestors (cycle check)
      if (entityByFullName.has(nav.typeName) && !ancestors.has(nav.typeName)) {
        const childAncestors = new Set(ancestors)
        childAncestors.add(nav.typeName)
        queue.push({ entityFullName: nav.typeName, path: navPath, depth: depth + 1, ancestors: childAncestors })
      }
    }

    // Bound functions
    for (const fnId of entity.functionIds) {
      const fn = functionById.get(fnId)
      if (!fn) continue

      const fnPath = `${path}/${fn.name}`
      if (seenPaths.has(fnPath)) continue
      seenPaths.add(fnPath)

      entries.push({
        id: fnPath,
        name: fn.name,
        path: fnPath,
        kind: 'function',
        parentEntity: entityFullName,
        isRoot: false,
      })

      // Enqueue if composable, returns known entity, and NOT in ancestor chain
      if (fn.isComposable && fn.returnType && entityByFullName.has(fn.returnType) && !ancestors.has(fn.returnType)) {
        const childAncestors = new Set(ancestors)
        childAncestors.add(fn.returnType)
        queue.push({ entityFullName: fn.returnType, path: fnPath, depth: depth + 1, ancestors: childAncestors })
      }
    }
  }

  return entries
}
