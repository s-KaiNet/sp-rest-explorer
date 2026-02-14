import MiniSearch from 'minisearch'
import { buildApiEndpointIndex } from './api-tree-walk'
import type { LookupMaps, Metadata, PathSearchDocument, SearchDocument } from './types'

// ── Module-level singletons ──

let searchIndex: MiniSearch<SearchDocument> | null = null
let pathDocuments: PathSearchDocument[] = []

// ── Build logic ──

export function buildSearchIndex(
  metadata: Metadata,
  lookupMaps: LookupMaps,
): { nameIndex: MiniSearch<SearchDocument> } {
  const index = new MiniSearch<SearchDocument>({
    fields: ['name', 'fullName'],
    storeFields: ['name', 'fullName', 'kind', 'path', 'parentEntity', 'isRoot', 'endpointKind'],
    searchOptions: {
      boost: { name: 2 },
      fuzzy: 0.2,
      prefix: true,
    },
    tokenize: (text) => text.split(/[\s._]+/),
  })

  const docs: SearchDocument[] = []

  // 1. Entity documents — searchable by both short name and full OData name
  for (const entity of Object.values(metadata.entities)) {
    docs.push({
      id: `entity:${entity.fullName}`,
      name: entity.name,
      fullName: entity.fullName,
      kind: 'entity',
    })
  }

  const entityCount = docs.length

  // 2. Endpoint documents — searchable by leaf name only (path stored but NOT searched)
  const endpoints = buildApiEndpointIndex(metadata, lookupMaps)
  for (const entry of endpoints) {
    docs.push({
      id: `endpoint:${entry.id}`,
      name: entry.name,
      fullName: '',  // Empty — path NOT searchable per design
      kind: 'endpoint',
      path: entry.path,
      endpointKind: entry.kind,
      parentEntity: entry.parentEntity,
      isRoot: entry.isRoot,
    })
  }

  const endpointCount = endpoints.length

  index.addAll(docs)

  // 3. Path documents — stored as flat array for substring filtering
  pathDocuments = []
  for (const entry of endpoints) {
    pathDocuments.push({
      id: entry.id,
      path: entry.path,
      name: entry.name,
      endpointKind: entry.kind,
      parentEntity: entry.parentEntity,
      isRoot: entry.isRoot,
    })
  }

  console.log(
    '[SP Explorer] Search index:',
    docs.length,
    'items indexed (',
    entityCount,
    'entities,',
    endpointCount,
    'endpoints). Path docs:',
    pathDocuments.length,
    'endpoints (substring filter).',
  )

  return { nameIndex: index }
}

// ── Query mode detection ──

export type SearchMode = 'name' | 'path'

export function detectSearchMode(query: string): SearchMode {
  if (query.includes(' ')) return 'path'
  if (query.includes('/')) {
    // Don't trigger on bare "_api/" — too broad (matches all 62K endpoints)
    const trimmed = query.replace(/^_api\/?$/i, '')
    return trimmed.length === 0 ? 'name' : 'path'
  }
  return 'name'
}

// ── Public API ──

/** Build and store search index + path documents from metadata. */
export function initSearchIndex(metadata: Metadata, lookupMaps: LookupMaps): void {
  const result = buildSearchIndex(metadata, lookupMaps)
  searchIndex = result.nameIndex
}

/** Get current name search index (for non-React code). */
export function getSearchIndex(): MiniSearch<SearchDocument> | null {
  return searchIndex
}

/** Search path documents using substring matching. */
export function searchPathDocuments(query: string, limit = 50): PathSearchDocument[] {
  if (pathDocuments.length === 0) return []

  const mode = detectSearchMode(query)

  if (mode === 'name') return [] // shouldn't happen, but guard

  if (query.includes('/')) {
    // SLASH MODE: contiguous substring match
    // Strip leading _api/ from query if present (user might type "_api/web/lists")
    const normalizedQuery = query.replace(/^_api\//i, '').toLowerCase()
    if (normalizedQuery.length === 0) return []

    return pathDocuments
      .filter(doc => {
        const normalizedPath = doc.path.replace(/^_api\//i, '').toLowerCase()
        return normalizedPath.includes(normalizedQuery)
      })
      .slice(0, limit)
  }

  // SPACE MODE: every space-separated term must appear as substring (AND semantics)
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (terms.length === 0) return []

  return pathDocuments
    .filter(doc => {
      const lowerPath = doc.path.toLowerCase()
      return terms.every(term => lowerPath.includes(term))
    })
    .slice(0, limit)
}
