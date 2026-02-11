import { useSyncExternalStore } from 'react'
import type { ChildEntry, EntityType, FunctionImport, LookupMaps, Metadata } from './types'

// ── Module-level singleton ──

let lookupMaps: LookupMaps | null = null
const listeners = new Set<() => void>()

// ── Subscription (useSyncExternalStore contract) ──

function subscribe(callback: () => void): () => void {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

function getSnapshot(): LookupMaps | null {
  return lookupMaps
}

// ── Build logic ──

export function buildLookupMaps(metadata: Metadata): LookupMaps {
  const entityByFullName = new Map<string, EntityType>()
  const functionById = new Map<number, FunctionImport>()
  const entityChildren = new Map<string, ChildEntry[]>()

  // Index entities by fullName
  for (const entity of Object.values(metadata.entities)) {
    entityByFullName.set(entity.fullName, entity)
  }

  // Index functions by id (sparse IDs — Map is correct, not Array)
  for (const fn of Object.values(metadata.functions)) {
    functionById.set(fn.id, fn)
  }

  // Build children for each entity: nav properties + bound functions
  for (const entity of Object.values(metadata.entities)) {
    const children: ChildEntry[] = []

    // Nav properties first
    for (const nav of entity.navigationProperties) {
      children.push({
        name: nav.name,
        kind: 'navProperty',
        ref: nav.typeName,
      })
    }

    // Bound functions
    for (const fnId of entity.functionIds) {
      const fn = functionById.get(fnId)
      if (fn) {
        children.push({
          name: fn.name,
          kind: 'function',
          ref: fn.id,
          returnType: fn.returnType,
        })
      }
    }

    // Sort: navProperties first, then functions, alphabetically within each group
    children.sort((a, b) => {
      if (a.kind !== b.kind) {
        return a.kind === 'navProperty' ? -1 : 1
      }
      return a.name.localeCompare(b.name)
    })

    entityChildren.set(entity.fullName, children)
  }

  return { entityByFullName, functionById, entityChildren }
}

// ── Public API ──

/** Build and store lookup maps from metadata. */
export function initLookupMaps(metadata: Metadata): void {
  lookupMaps = buildLookupMaps(metadata)
  listeners.forEach((cb) => cb())
}

/** Get current lookup maps (for non-React code). */
export function getLookupMaps(): LookupMaps | null {
  return lookupMaps
}

/** React hook — returns LookupMaps | null, re-renders on change. */
export function useLookupMaps(): LookupMaps | null {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
