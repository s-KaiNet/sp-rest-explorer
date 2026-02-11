import { useMemo } from 'react'
import { useParams } from 'react-router'
import { useLookupMaps, useMetadataSnapshot } from '@/lib/metadata'
import type { ChildEntry, EntityType } from '@/lib/metadata'

// ── Types ──

export interface BreadcrumbSegment {
  label: string
  path: string
}

export interface ApiNavigationState {
  segments: BreadcrumbSegment[]
  children: ChildEntry[]
  currentEntity: EntityType | null
  isRoot: boolean
}

// ── Hook ──

export function useApiNavigation(): ApiNavigationState {
  const params = useParams()
  const splat = params['*'] ?? ''
  const maps = useLookupMaps()
  const metadata = useMetadataSnapshot()

  return useMemo((): ApiNavigationState => {
    const rootSegment: BreadcrumbSegment = { label: '_api', path: '/_api' }

    // No maps or metadata yet — return empty root state
    if (!maps || !metadata) {
      return {
        segments: [rootSegment],
        children: [],
        currentEntity: null,
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
        isRoot: true,
      }
    }

    // Deep path: split and walk
    const parts = splat.split('/').filter(Boolean)

    // Build breadcrumb segments
    const segments: BreadcrumbSegment[] = [rootSegment]
    for (let i = 0; i < parts.length; i++) {
      segments.push({
        label: parts[i],
        path: '/_api/' + parts.slice(0, i + 1).join('/'),
      })
    }

    // Walk path to resolve current entity
    let currentEntity: EntityType | null = null

    // First part is always a root function name
    const rootFn = Object.values(metadata.functions).find(
      (fn) => fn.isRoot && fn.name === parts[0],
    )

    if (rootFn?.returnType) {
      currentEntity = entityByFullName.get(rootFn.returnType) ?? null
    }

    // Walk remaining parts
    for (let i = 1; i < parts.length && currentEntity; i++) {
      const children = entityChildren.get(currentEntity.fullName)
      const child = children?.find((c) => c.name === parts[i])

      if (!child) {
        // Path doesn't resolve — return what we have so far
        currentEntity = null
        break
      }

      if (child.kind === 'navProperty') {
        // ref is the typeName/fullName of the target entity
        currentEntity = entityByFullName.get(child.ref as string) ?? null
      } else {
        // ref is the function ID — get function, then look up returnType entity
        const fn = functionById.get(child.ref as number)
        if (fn?.returnType) {
          currentEntity = entityByFullName.get(fn.returnType) ?? null
        } else {
          currentEntity = null
        }
      }
    }

    // Get children of the resolved entity
    const children: ChildEntry[] = currentEntity
      ? (entityChildren.get(currentEntity.fullName) ?? [])
      : []

    return {
      segments,
      children,
      currentEntity,
      isRoot: false,
    }
  }, [splat, maps, metadata])
}
