import type { Metadata } from '@/lib/metadata/types'
import type {
  ChangeType,
  DiffChanges,
  DiffEntity,
  DiffFunction,
  DiffPropertyChange,
} from './types'

// ── Public API ──

/**
 * Transform a raw jsondiffpatch delta into a UI-ready DiffChanges object.
 *
 * Returns `{ entities: [], functions: [] }` when the delta is null/undefined
 * (meaning the two snapshots are identical).
 */
export function transformDelta(
  delta: Record<string, unknown> | null | undefined,
  _currentMetadata: Metadata,
): DiffChanges {
  if (!delta) return { entities: [], functions: [] }

  const entities: DiffEntity[] = []
  const functions: DiffFunction[] = []

  // ── Process entities ──
  const entityDelta = delta.entities as
    | Record<string, unknown>
    | undefined

  if (entityDelta) {
    for (const name in entityDelta) {
      if (!Object.hasOwn(entityDelta, name)) continue

      const value = entityDelta[name]

      if (Array.isArray(value)) {
        // Entity was added or removed (whole entity is the delta)
        const changeType = detectChangeType(value)

        const entity: DiffEntity = {
          changeType,
          name,
          properties: [],
          navigationProperties: [],
          functions: [],
        }

        if (changeType === 'added') {
          const addedEntity = value[0] as Record<string, unknown>
          entity.properties = copyAddedProperties(addedEntity, 'properties')
          entity.navigationProperties = copyAddedProperties(
            addedEntity,
            'navigationProperties',
          )
          entity.functions = copyAddedProperties(addedEntity, 'functionIds')
        }

        entities.push(entity)
      } else if (typeof value === 'object' && value !== null) {
        // Properties inside entity were updated
        const entityObj = value as Record<string, unknown>

        const entity: DiffEntity = {
          changeType: 'updated',
          name,
          properties: extractChildChanges(entityObj, 'properties'),
          navigationProperties: extractChildChanges(
            entityObj,
            'navigationProperties',
          ),
          functions: extractChildChanges(entityObj, 'functionIds'),
        }

        entities.push(entity)
      }
    }
  }

  // ── Process root functions ──
  const funcDelta = delta.functions as
    | Record<string, unknown>
    | undefined

  if (funcDelta) {
    for (const name in funcDelta) {
      if (!Object.hasOwn(funcDelta, name)) continue
      // Only process root functions (keyed with `_is_root_` prefix)
      if (!name.startsWith('_is_root_')) continue

      const value = funcDelta[name]
      // Only detect add/delete — skip property changes within functions
      if (!Array.isArray(value)) continue

      const funcObj = value[0] as Record<string, unknown>

      const funcDiff: DiffFunction = {
        changeType: detectChangeType(value),
        name: funcObj.name as string,
        returnType: funcObj.returnType as string,
      }

      functions.push(funcDiff)
    }
  }

  // Sort by name for stable output
  entities.sort((a, b) => a.name.localeCompare(b.name))
  functions.sort((a, b) => a.name.localeCompare(b.name))

  return { entities, functions }
}

// ── Internal helpers ──

/**
 * Detect change type from a jsondiffpatch delta node.
 * @see https://github.com/benjamine/jsondiffpatch/blob/master/docs/deltas.md
 */
function detectChangeType(node: unknown[]): ChangeType {
  if (node.length === 1) return 'added'
  if (node.length === 3 && node[1] === 0 && node[2] === 0) return 'removed'
  if (node.length === 2) return 'updated'

  // Fallback — should not occur with well-formed deltas
  return 'updated'
}

/**
 * Copy properties from a newly-added entity, marking all as 'added'.
 */
function copyAddedProperties(
  addedEntity: Record<string, unknown>,
  key: string,
): DiffPropertyChange[] {
  const items = addedEntity[key] as
    | Array<Record<string, unknown>>
    | undefined
  if (!items || !Array.isArray(items)) return []

  return items.map((prop) => ({
    changeType: 'added' as ChangeType,
    name: prop.name as string,
    typeName: (prop.typeName as string) || (prop.returnType as string) || '',
  }))
}

/**
 * Extract child property changes from an entity delta.
 *
 * Ported from legacy `populateChildProperties` in templateGenerator.ts.
 * Expects jsondiffpatch array marker (`_t: 'a'`) on the sub-delta.
 */
function extractChildChanges(
  entityDelta: Record<string, unknown>,
  key: string,
): DiffPropertyChange[] {
  const sub = entityDelta[key] as Record<string, unknown> | undefined
  if (!sub || typeof sub !== 'object' || sub._t !== 'a') return []

  const changes: DiffPropertyChange[] = []

  for (const idx in sub) {
    if (!Object.hasOwn(sub, idx) || idx === '_t') continue

    const propertyValue = sub[idx]
    // Only process array entries (jsondiffpatch delta nodes)
    if (!Array.isArray(propertyValue)) continue

    const item = propertyValue[0] as Record<string, unknown>
    changes.push({
      changeType: detectChangeType(propertyValue),
      name: item.name as string,
      typeName:
        (item.typeName as string) || (item.returnType as string) || '',
    })
  }

  return changes
}
