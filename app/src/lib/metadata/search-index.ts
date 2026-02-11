import MiniSearch from 'minisearch'
import type { Metadata, SearchDocument } from './types'

// ── Module-level singleton ──

let searchIndex: MiniSearch<SearchDocument> | null = null

// ── Build logic ──

export function buildSearchIndex(metadata: Metadata): MiniSearch<SearchDocument> {
  const index = new MiniSearch<SearchDocument>({
    fields: ['name', 'fullName'],
    storeFields: ['name', 'fullName', 'kind', 'parentEntity'],
    searchOptions: {
      boost: { name: 2 },
      fuzzy: 0.2,
      prefix: true,
    },
    tokenize: (text) => text.split(/[\s._]+/),
  })

  const docs: SearchDocument[] = []

  // 1. All entities
  for (const entity of Object.values(metadata.entities)) {
    docs.push({
      id: `entity:${entity.fullName}`,
      name: entity.name,
      fullName: entity.fullName,
      kind: 'entity',
    })

    // 3. Nav properties for each entity
    for (const nav of entity.navigationProperties) {
      docs.push({
        id: `nav:${entity.fullName}/${nav.name}`,
        name: nav.name,
        fullName: `${entity.name}.${nav.name}`,
        kind: 'navProperty',
        parentEntity: entity.fullName,
      })
    }

    // 4. Bound functions for each entity
    for (const fnId of entity.functionIds) {
      const fn = metadata.functions[fnId]
      if (fn) {
        docs.push({
          id: `fn:${entity.fullName}/${fn.id}`,
          name: fn.name,
          fullName: `${entity.name}.${fn.name}`,
          kind: 'function',
          parentEntity: entity.fullName,
        })
      }
    }
  }

  // 2. Root functions (isRoot === true)
  for (const fn of Object.values(metadata.functions)) {
    if (fn.isRoot) {
      docs.push({
        id: `fn:root:${fn.id}`,
        name: fn.name,
        fullName: fn.name,
        kind: 'function',
      })
    }
  }

  index.addAll(docs)

  console.log('[SP Explorer] Search index:', docs.length, 'items indexed')

  return index
}

// ── Public API ──

/** Build and store search index from metadata. */
export function initSearchIndex(metadata: Metadata): void {
  searchIndex = buildSearchIndex(metadata)
}

/** Get current search index (for non-React code). */
export function getSearchIndex(): MiniSearch<SearchDocument> | null {
  return searchIndex
}
