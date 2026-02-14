import MiniSearch from 'minisearch'
import { buildApiEndpointIndex } from './api-tree-walk'
import type { LookupMaps, Metadata, SearchDocument } from './types'

// ── Module-level singleton ──

let searchIndex: MiniSearch<SearchDocument> | null = null

// ── Build logic ──

export function buildSearchIndex(
  metadata: Metadata,
  lookupMaps: LookupMaps,
): MiniSearch<SearchDocument> {
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

  console.log(
    '[SP Explorer] Search index:',
    docs.length,
    'items indexed (',
    entityCount,
    'entities,',
    endpointCount,
    'endpoints)',
  )

  return index
}

// ── Public API ──

/** Build and store search index from metadata. */
export function initSearchIndex(metadata: Metadata, lookupMaps: LookupMaps): void {
  searchIndex = buildSearchIndex(metadata, lookupMaps)
}

/** Get current search index (for non-React code). */
export function getSearchIndex(): MiniSearch<SearchDocument> | null {
  return searchIndex
}
