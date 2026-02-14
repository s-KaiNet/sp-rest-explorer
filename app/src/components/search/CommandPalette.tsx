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
import { getSearchIndex } from '@/lib/metadata'

// ── Types ──

export interface SearchSelection {
  path: string       // Navigation path (already resolved)
  name: string       // Display name
  kind: 'entity' | 'endpoint'
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (selection: SearchSelection) => void
}

// ── Constants ──

const INITIAL_SHOW = 5

// ── Query highlighting ──

function HighlightedName({ name, query }: { name: string; query: string }) {
  if (!query || query.length < 3) {
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

// ── Collapsible search group ──

function SearchGroup({
  heading,
  results,
  expanded,
  setExpanded,
  collapsed,
  setCollapsed,
  renderItem,
}: {
  heading: string
  results: SearchResult[]
  expanded: boolean
  setExpanded: (v: boolean) => void
  collapsed: boolean
  setCollapsed: (v: boolean) => void
  renderItem: (result: SearchResult) => React.ReactNode
}) {
  if (results.length === 0) return null

  // Collapsed: show one-line summary
  if (collapsed) {
    return (
      <div
        className="cursor-pointer px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground"
        onClick={() => setCollapsed(false)}
      >
        {heading} ({results.length}) &#9654;
      </div>
    )
  }

  const visible = expanded ? results : results.slice(0, INITIAL_SHOW)
  const remaining = results.length - INITIAL_SHOW

  return (
    <CommandGroup
      heading={
        <span className="flex items-center gap-1.5">
          <span>{heading}</span>
          <span className="text-muted-foreground">({results.length})</span>
          <button
            type="button"
            className="ml-1 text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation()
              setCollapsed(true)
            }}
          >
            &#9660;
          </button>
        </span>
      }
    >
      {visible.map(renderItem)}
      {remaining > 0 && !expanded && (
        <CommandItem
          value={`__show_more_${heading}__`}
          onSelect={() => setExpanded(true)}
          className="justify-center text-xs text-muted-foreground"
        >
          Show {remaining} more&hellip;
        </CommandItem>
      )}
    </CommandGroup>
  )
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

  // Per-group UI state
  const [entitiesExpanded, setEntitiesExpanded] = useState(false)
  const [entitiesCollapsed, setEntitiesCollapsed] = useState(false)
  const [endpointsExpanded, setEndpointsExpanded] = useState(false)
  const [endpointsCollapsed, setEndpointsCollapsed] = useState(false)

  // Reset group state when query changes
  useEffect(() => {
    setEntitiesExpanded(false)
    setEntitiesCollapsed(false)
    setEndpointsExpanded(false)
    setEndpointsCollapsed(false)
  }, [debouncedQuery])

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

  // Search execution — return ALL results (no hard cap)
  const searchResults = useMemo(() => {
    if (debouncedQuery.length < 3) return null
    const searchIndex = getSearchIndex()
    if (!searchIndex) return null
    return searchIndex.search(debouncedQuery)
  }, [debouncedQuery])

  // Split into entity and endpoint groups
  const entities = useMemo(
    () => (searchResults ?? []).filter((r) => r.kind === 'entity'),
    [searchResults],
  )
  const endpoints = useMemo(
    () => (searchResults ?? []).filter((r) => r.kind === 'endpoint'),
    [searchResults],
  )

  // Handle entity selection
  const handleEntitySelect = useCallback(
    (result: SearchResult) => {
      onSelect({
        path: `/entity/${encodeURIComponent(result.fullName as string)}`,
        name: result.name as string,
        kind: 'entity',
      })
      onOpenChange(false)
    },
    [onSelect, onOpenChange],
  )

  // Handle endpoint selection
  const handleEndpointSelect = useCallback(
    (result: SearchResult) => {
      onSelect({
        path: `/${result.path as string}`,  // path is "_api/..." so prefix with /
        name: result.name as string,
        kind: 'endpoint',
      })
      onOpenChange(false)
    },
    [onSelect, onOpenChange],
  )

  const hasResults = entities.length > 0 || endpoints.length > 0

  // Render entity result item
  const renderEntityItem = useCallback(
    (result: SearchResult) => (
      <CommandItem
        key={result.id as string}
        value={result.id as string}
        onSelect={() => handleEntitySelect(result)}
        className="flex items-center gap-2.5 py-1"
      >
        <span className="flex size-6 shrink-0 items-center justify-center rounded bg-type-entity/10 font-mono text-xs font-medium text-type-entity">
          {'<>'}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm">
            <HighlightedName name={result.name as string} query={debouncedQuery} />
          </div>
          <span className="text-xs text-muted-foreground">
            {result.fullName as string}
          </span>
        </div>
      </CommandItem>
    ),
    [debouncedQuery, handleEntitySelect],
  )

  // Render endpoint result item
  const renderEndpointItem = useCallback(
    (result: SearchResult) => (
      <CommandItem
        key={result.id as string}
        value={result.id as string}
        onSelect={() => handleEndpointSelect(result)}
        className="flex items-center gap-2.5 py-1"
      >
        {(result.endpointKind as string) === 'function' ? (
          <span className="flex size-6 shrink-0 items-center justify-center rounded bg-type-fn/10 font-mono text-xs font-medium text-type-fn">
            {'\u0192'}
          </span>
        ) : (
          <span className="flex size-6 shrink-0 items-center justify-center rounded bg-type-nav/10 text-[10px] font-semibold text-type-nav">
            NAV
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm">
            <HighlightedName name={result.name as string} query={debouncedQuery} />
          </div>
          <span className="text-xs text-muted-foreground break-all">
            {result.path as string}
          </span>
        </div>
        {(result.isRoot as boolean) && (
          <span className="shrink-0 rounded bg-type-entity/10 px-1.5 py-0.5 text-[10px] font-semibold text-type-entity">
            Root
          </span>
        )}
      </CommandItem>
    ),
    [debouncedQuery, handleEndpointSelect],
  )

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search API"
      description="Search across entities and API endpoints"
      showCloseButton={false}
      className="top-[10%] translate-y-0 sm:max-w-2xl"
      shouldFilter={false}
      loop
    >
      <CommandInput
        placeholder="Search entities and API endpoints..."
        value={query}
        onValueChange={setQuery}
        suffix={
          <kbd className="shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
            ESC
          </kbd>
        }
      />
      <CommandList>
        {/* Empty / below minimum states */}
        {query.length === 0 && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Type to search across all entities and API endpoints
          </div>
        )}
        {query.length >= 1 && query.length < 3 && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Type {3 - query.length} more character{3 - query.length > 1 ? 's' : ''} to search
          </div>
        )}
        {query.length >= 3 && !hasResults && debouncedQuery.length >= 3 && (
          <CommandEmpty>No results for &ldquo;{debouncedQuery}&rdquo;</CommandEmpty>
        )}

        {/* Entities group — first */}
        <SearchGroup
          heading="Entities"
          results={entities}
          expanded={entitiesExpanded}
          setExpanded={setEntitiesExpanded}
          collapsed={entitiesCollapsed}
          setCollapsed={setEntitiesCollapsed}
          renderItem={renderEntityItem}
        />

        {/* API Endpoints group — second */}
        <SearchGroup
          heading="API Endpoints"
          results={endpoints}
          expanded={endpointsExpanded}
          setExpanded={setEndpointsExpanded}
          collapsed={endpointsCollapsed}
          setCollapsed={setEndpointsCollapsed}
          renderItem={renderEndpointItem}
        />
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
