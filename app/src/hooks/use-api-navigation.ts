import { useMemo } from 'react'
import { useParams } from 'react-router'
import { useLookupMaps, useMetadataSnapshot } from '@/lib/metadata'
import type { ChildEntry, EntityType, FunctionImport } from '@/lib/metadata'

// ── Types ──

export interface BreadcrumbSegment {
  label: string
  path: string
  kind: 'root' | 'function' | 'navProperty'
}

export interface ApiNavigationState {
  segments: BreadcrumbSegment[]
  children: ChildEntry[]
  currentEntity: EntityType | null
  currentFunction: FunctionImport | null
  isRoot: boolean
}

// ── Hook ──

export function useApiNavigation(): ApiNavigationState {
  const params = useParams()
  const splat = params['*'] ?? ''
  const maps = useLookupMaps()
  const metadata = useMetadataSnapshot()

  return useMemo((): ApiNavigationState => {
    const rootSegment: BreadcrumbSegment = { label: '_api', path: '/_api', kind: 'root' }

    // No maps or metadata yet — return empty root state
    if (!maps || !metadata) {
      return {
        segments: [rootSegment],
        children: [],
        currentEntity: null,
        currentFunction: null,
        isRoot: true,
      }
    }

    const { entityByFullName, functionById, entityChildren } = maps

    // Root: no splat or empty splat
    if (!splat) {
      // Collect root functions (isRoot === true), sorted alphabetically
      const rootChildren: ChildEntry[] = Object.values(metadata.functions)
        .filter((fn) => fn.isRoot)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((fn) => ({
          name: fn.name,
          kind: 'function' as const,
          ref: fn.id,
          returnType: fn.returnType,
        }))

      return {
        segments: [rootSegment],
        children: rootChildren,
        currentEntity: null,
        currentFunction: null,
        isRoot: true,
      }
    }

    // Deep path: split and walk
    const parts = splat.split('/').filter(Boolean)

    // Build breadcrumb segments and resolve entities simultaneously
    const segments: BreadcrumbSegment[] = [rootSegment]
    let currentEntity: EntityType | null = null
    let currentFunction: FunctionImport | null = null

    // First part is always a root function name
    const rootFn = Object.values(metadata.functions).find(
      (fn) => fn.isRoot && fn.name === parts[0],
    )

    segments.push({
      label: parts[0],
      path: '/_api/' + parts[0],
      kind: 'function',
    })

    if (rootFn) {
      currentFunction = rootFn
      if (rootFn.isComposable && rootFn.returnType) {
        currentEntity = entityByFullName.get(rootFn.returnType) ?? null
      }
    }

    // Walk remaining parts — resolve and record kind for each segment
    for (let i = 1; i < parts.length; i++) {
      let segmentKind: 'function' | 'navProperty' = 'function'

      if (!currentEntity) {
        // Can't walk further — previous function was non-composable
        // Still add the segment (unresolved) but stop resolving
        segments.push({
          label: parts[i],
          path: '/_api/' + parts.slice(0, i + 1).join('/'),
          kind: 'function',
        })
        currentFunction = null
        currentEntity = null
        break
      }

      const entityChildList = entityChildren.get(currentEntity.fullName)
      const child = entityChildList?.find((c) => c.name === parts[i])

      if (!child) {
        segments.push({
          label: parts[i],
          path: '/_api/' + parts.slice(0, i + 1).join('/'),
          kind: 'function',
        })
        currentEntity = null
        currentFunction = null
        break
      }

      segmentKind = child.kind === 'navProperty' ? 'navProperty' : 'function'

      if (child.kind === 'navProperty') {
        currentEntity = entityByFullName.get(child.ref as string) ?? null
        currentFunction = null
      } else {
        const fn = functionById.get(child.ref as number)
        currentFunction = fn ?? null
        if (fn?.isComposable && fn.returnType) {
          currentEntity = entityByFullName.get(fn.returnType) ?? null
        } else {
          currentEntity = null
        }
      }

      segments.push({
        label: parts[i],
        path: '/_api/' + parts.slice(0, i + 1).join('/'),
        kind: segmentKind,
      })
    }

    // Get children of the resolved entity (only if we have one — non-composable functions have none)
    const children: ChildEntry[] = currentEntity
      ? (entityChildren.get(currentEntity.fullName) ?? [])
      : []

    return {
      segments,
      children,
      currentEntity,
      currentFunction,
      isRoot: false,
    }
  }, [splat, maps, metadata])
}
