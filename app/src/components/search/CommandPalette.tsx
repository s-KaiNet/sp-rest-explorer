import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { SearchResult } from 'minisearch'
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'
import {
  getSearchIndex,
  getMetadata,
  getLookupMaps,
} from '@/lib/metadata'
import type { Metadata, LookupMaps } from '@/lib/metadata'

// ── Types ──

export interface SearchSelection {
  path: string
  name: string
  kind: 'entity' | 'function' | 'navProperty'
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (selection: SearchSelection) => void
}

interface GroupedResults {
  entities: SearchResult[]
  functions: SearchResult[]
  navProperties: SearchResult[]
}

// ── Path map builder (BFS from root functions) ──

function buildEntityPathMap(
  metadata: Metadata,
  lookupMaps: LookupMaps,
): Map<string, string> {
  const pathMap = new Map<string, string>()
  const { entityByFullName } = lookupMaps

  const queue: Array<{ entityFullName: string; path: string }> = []

  // Seed: root functions → their return type entities
  for (const fn of Object.values(metadata.functions)) {
    if (fn.isRoot && fn.isComposable && fn.returnType) {
      if (!pathMap.has(fn.returnType)) {
        const path = `/_api/${fn.name}`
        pathMap.set(fn.returnType, path)
        queue.push({ entityFullName: fn.returnType, path })
      }
    }
  }

  // BFS through nav properties
  while (queue.length > 0) {
    const { entityFullName, path } = queue.shift()!
    const entity = entityByFullName.get(entityFullName)
    if (!entity) continue

    for (const nav of entity.navigationProperties) {
      const navPath = `${path}/${nav.name}`
      if (!pathMap.has(nav.typeName)) {
        pathMap.set(nav.typeName, navPath)
        queue.push({ entityFullName: nav.typeName, path: navPath })
      }
    }
  }

  return pathMap
}

// ── Path resolution ──

function resolveSearchResultPath(
  result: SearchResult,
  entityPathMap: Map<string, string>,
  metadata: Metadata,
): string | null {
  const id = result.id as string

  // Root function: fn:root:{fnId}
  if (id.startsWith('fn:root:')) {
    const fnId = Number(id.slice('fn:root:'.length))
    const fn = metadata.functions[fnId]
    return fn ? `/_api/${fn.name}` : null
  }

  // Bound function: fn:{parentEntity}/{fnId}
  if (id.startsWith('fn:')) {
    const rest = id.slice('fn:'.length)
    const slashIdx = rest.lastIndexOf('/')
    if (slashIdx === -1) return null
    const parentFullName = rest.slice(0, slashIdx)
    const fnId = Number(rest.slice(slashIdx + 1))
    const fn = metadata.functions[fnId]
    if (!fn) return null
    const parentPath = entityPathMap.get(parentFullName)
    if (!parentPath) return null
    return `${parentPath}/${fn.name}`
  }

  // Nav property: nav:{parentEntity}/{navName}
  if (id.startsWith('nav:')) {
    const rest = id.slice('nav:'.length)
    const slashIdx = rest.lastIndexOf('/')
    if (slashIdx === -1) return null
    const parentFullName = rest.slice(0, slashIdx)
    const navName = rest.slice(slashIdx + 1)
    const parentPath = entityPathMap.get(parentFullName)
    if (!parentPath) return null
    return `${parentPath}/${navName}`
  }

  // Entity: entity:{fullName}
  if (id.startsWith('entity:')) {
    const fullName = id.slice('entity:'.length)
    return entityPathMap.get(fullName) ?? null
  }

  return null
}

// ── Query highlighting ──

function HighlightedName({ name, query }: { name: string; query: string }) {
  if (!query || query.length < 2) {
    return <span>{name}</span>
  }

  const parts: Array<{ text: string; highlight: boolean }> = []
  const lowerName = name.toLowerCase()
  const lowerQuery = query.toLowerCase()
  let lastIndex = 0

  while (lastIndex < name.length) {
    const matchIndex = lowerName.indexOf(lowerQuery, lastIndex)
    if (matchIndex === -1) {
      parts.push({ text: name.slice(lastIndex), highlight: false })
      break
    }
    if (matchIndex > lastIndex) {
      parts.push({ text: name.slice(lastIndex, matchIndex), highlight: false })
    }
    parts.push({
      text: name.slice(matchIndex, matchIndex + query.length),
      highlight: true,
    })
    lastIndex = matchIndex + query.length
  }

  return (
    <span>
      {parts.map((part, i) =>
        part.highlight ? (
          <strong key={i} className="font-bold text-foreground">
            {part.text}
          </strong>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </span>
  )
}

// ── Kind icon components ──

function KindIcon({ kind }: { kind: string }) {
  switch (kind) {
    case 'entity':
      return (
        <span className="flex size-6 shrink-0 items-center justify-center rounded bg-type-entity/10 font-mono text-xs font-medium text-type-entity">
          {'<>'}
        </span>
      )
    case 'function':
      return (
        <span className="flex size-6 shrink-0 items-center justify-center rounded bg-type-fn/10 font-mono text-xs font-medium text-type-fn">
          {'\u0192'}
        </span>
      )
    case 'navProperty':
      return (
        <span className="flex size-6 shrink-0 items-center justify-center rounded bg-type-nav/10 text-[10px] font-semibold text-type-nav">
          NAV
        </span>
      )
    default:
      return null
  }
}

// ── Breadcrumb for disambiguation ──

function ResultBreadcrumb({
  result,
  isRootFn,
}: {
  result: SearchResult
  isRootFn: boolean
}) {
  const kind = result.kind as string
  const parentEntity = result.parentEntity as string | undefined

  const kindLabel =
    kind === 'function'
      ? 'Functions'
      : kind === 'navProperty'
        ? 'Nav Properties'
        : ''

  if (isRootFn) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="rounded bg-type-entity/10 px-1.5 py-0.5 text-[10px] font-semibold text-type-entity">
          Root
        </span>
      </span>
    )
  }

  if (parentEntity) {
    // Extract short name from fullName (e.g. "SP.List" → "SP.List")
    const parentShortName = parentEntity
    return (
      <span className="text-xs text-muted-foreground">
        {parentShortName} &rsaquo; {kindLabel}
      </span>
    )
  }

  return null
}

// ── Group results by kind ──

const MAX_PER_GROUP = 7

function groupResults(results: SearchResult[]): GroupedResults {
  const grouped: GroupedResults = {
    entities: [],
    functions: [],
    navProperties: [],
  }

  for (const result of results) {
    const kind = result.kind as string
    if (kind === 'entity' && grouped.entities.length < MAX_PER_GROUP) {
      grouped.entities.push(result)
    } else if (kind === 'function' && grouped.functions.length < MAX_PER_GROUP) {
      grouped.functions.push(result)
    } else if (
      kind === 'navProperty' &&
      grouped.navProperties.length < MAX_PER_GROUP
    ) {
      grouped.navProperties.push(result)
    }
  }

  return grouped
}

// ── Main component ──

export function CommandPalette({
  open,
  onOpenChange,
  onSelect,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Build entity path map once from metadata + lookup maps
  const entityPathMap = useMemo(() => {
    const metadata = getMetadata()
    const lookupMaps = getLookupMaps()
    if (!metadata || !lookupMaps) return new Map<string, string>()
    return buildEntityPathMap(metadata, lookupMaps)
  }, [])

  // Debounce the query
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query)
    }, 120)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query])

  // Reset query when palette closes
  useEffect(() => {
    if (!open) {
      setQuery('')
      setDebouncedQuery('')
    }
  }, [open])

  // Search execution
  const searchResults = useMemo(() => {
    if (debouncedQuery.length < 2) return null
    const searchIndex = getSearchIndex()
    if (!searchIndex) return null
    return searchIndex.search(debouncedQuery, { limit: 21 })
  }, [debouncedQuery])

  // Group results
  const grouped = useMemo(() => {
    if (!searchResults) return null
    return groupResults(searchResults)
  }, [searchResults])

  // Handle result selection
  const handleSelect = useCallback(
    (resultId: string) => {
      const metadata = getMetadata()
      if (!metadata) return

      // Find the result from search results to get name + kind
      const allResults = searchResults ?? []
      const result = allResults.find((r) => (r.id as string) === resultId)

      const path = resolveSearchResultPath(
        { id: resultId } as SearchResult,
        entityPathMap,
        metadata,
      )

      if (path) {
        const name = result ? (result.name as string) : path.split('/').pop() ?? path
        const kind = result ? (result.kind as SearchSelection['kind']) : 'function'
        onSelect({ path, name, kind })
        onOpenChange(false)
      }
    },
    [entityPathMap, onSelect, onOpenChange, searchResults],
  )

  const isRootFn = (result: SearchResult) =>
    (result.id as string).startsWith('fn:root:')

  const hasResults =
    grouped &&
    (grouped.entities.length > 0 ||
      grouped.functions.length > 0 ||
      grouped.navProperties.length > 0)

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search API"
      description="Search across entities, functions, and navigation properties"
      showCloseButton={false}
      className="top-[20%] translate-y-0"
      shouldFilter={false}
      loop
    >
      <CommandInput
        placeholder="Type to search entities, functions, properties..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {/* Empty / below minimum states */}
        {query.length === 0 && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Type to search across all API entities, functions, and properties
          </div>
        )}
        {query.length === 1 && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Type 2+ characters to search
          </div>
        )}
        {query.length >= 2 && !hasResults && debouncedQuery.length >= 2 && (
          <CommandEmpty>No results for &ldquo;{debouncedQuery}&rdquo;</CommandEmpty>
        )}

        {/* Grouped results */}
        {grouped && grouped.entities.length > 0 && (
          <CommandGroup heading="Entities">
            {grouped.entities.map((result) => (
              <CommandItem
                key={result.id as string}
                value={result.id as string}
                onSelect={handleSelect}
                className="flex items-center gap-3 py-2"
              >
                <KindIcon kind="entity" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm">
                    <HighlightedName
                      name={result.name as string}
                      query={debouncedQuery}
                    />
                  </div>
                  <ResultBreadcrumb result={result} isRootFn={false} />
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {grouped && grouped.functions.length > 0 && (
          <CommandGroup heading="Functions">
            {grouped.functions.map((result) => (
              <CommandItem
                key={result.id as string}
                value={result.id as string}
                onSelect={handleSelect}
                className="flex items-center gap-3 py-2"
              >
                <KindIcon kind="function" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm">
                    <HighlightedName
                      name={result.name as string}
                      query={debouncedQuery}
                    />
                  </div>
                  <ResultBreadcrumb
                    result={result}
                    isRootFn={isRootFn(result)}
                  />
                </div>
                {isRootFn(result) && (
                  <span className="shrink-0 rounded bg-type-entity/10 px-1.5 py-0.5 text-[10px] font-semibold text-type-entity">
                    Root
                  </span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {grouped && grouped.navProperties.length > 0 && (
          <CommandGroup heading="Nav Properties">
            {grouped.navProperties.map((result) => (
              <CommandItem
                key={result.id as string}
                value={result.id as string}
                onSelect={handleSelect}
                className="flex items-center gap-3 py-2"
              >
                <KindIcon kind="navProperty" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm">
                    <HighlightedName
                      name={result.name as string}
                      query={debouncedQuery}
                    />
                  </div>
                  <ResultBreadcrumb result={result} isRootFn={false} />
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>

      {/* Footer hint bar */}
      <div className="flex items-center gap-3 border-t border-border px-3 py-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">
            &uarr;&darr;
          </kbd>
          <span>Navigate</span>
        </span>
        <span className="flex items-center gap-1">
          <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">
            &crarr;
          </kbd>
          <span>Open</span>
        </span>
        <span className="flex items-center gap-1">
          <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">
            Esc
          </kbd>
          <span>Close</span>
        </span>
      </div>
    </CommandDialog>
  )
}
