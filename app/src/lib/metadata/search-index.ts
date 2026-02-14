import MiniSearch from 'minisearch'
import { buildApiEndpointIndex } from './api-tree-walk'
import type { LookupMaps, Metadata, PathSearchDocument, SearchDocument } from './types'

// ── Module-level singletons ──

let searchIndex: MiniSearch<SearchDocument> | null = null
let pathSearchIndex: MiniSearch<PathSearchDocument> | null = null

// ── Build logic ──

export function buildSearchIndex(
  metadata: Metadata,
  lookupMaps: LookupMaps,
): { nameIndex: MiniSearch<SearchDocument>; pathIndex: MiniSearch<PathSearchDocument> } {
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

  // 3. Path index — tokenized on / for path-based search
  const pathIndex = new MiniSearch<PathSearchDocument>({
    fields: ['path'],
    storeFields: ['path', 'name', 'endpointKind', 'parentEntity', 'isRoot'],
    tokenize: (text) => text.split('/'),
    searchOptions: {
      prefix: true,
      fuzzy: 0.2,
      combineWith: 'AND',
    },
  })

  const pathDocs: PathSearchDocument[] = []
  for (const entry of endpoints) {
    pathDocs.push({
      id: entry.id,
      path: entry.path,
      name: entry.name,
      endpointKind: entry.kind,
      parentEntity: entry.parentEntity,
      isRoot: entry.isRoot,
    })
  }
  pathIndex.addAll(pathDocs)

  console.log(
    '[SP Explorer] Search index:',
    docs.length,
    'items indexed (',
    entityCount,
    'entities,',
    endpointCount,
    'endpoints). Path index:',
    pathDocs.length,
    'endpoints.',
  )

  return { nameIndex: index, pathIndex }
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

/** Build and store both search indexes from metadata. */
export function initSearchIndex(metadata: Metadata, lookupMaps: LookupMaps): void {
  const result = buildSearchIndex(metadata, lookupMaps)
  searchIndex = result.nameIndex
  pathSearchIndex = result.pathIndex
}

/** Get current name search index (for non-React code). */
export function getSearchIndex(): MiniSearch<SearchDocument> | null {
  return searchIndex
}

/** Get current path search index (for non-React code). */
export function getPathSearchIndex(): MiniSearch<PathSearchDocument> | null {
  return pathSearchIndex
}
