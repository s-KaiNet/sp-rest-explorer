// ── Types ──
export type {
  AppStatus,
  ChildEntry,
  EndpointEntry,
  EntityType,
  FunctionImport,
  LookupMaps,
  Metadata,
  NavigationProperty,
  Parameter,
  PathSearchDocument,
  Property,
  SearchDocument,
} from './types'

export type { SearchMode } from './search-index'
export type { TypeIndexes, UsedByRef, NamespaceGroup } from './type-indexes'

// ── Metadata singleton ──
export { getMetadata, useMetadataSnapshot } from './metadata-store'

// ── Lookup maps ──
export { getLookupMaps, useLookupMaps } from './lookup-maps'

// ── Search index ──
export { getSearchIndex, searchPathDocuments, detectSearchMode } from './search-index'

// ── Type indexes ──
export { getTypeIndexes, useTypeIndexes } from './type-indexes'

// ── Boot orchestrator ──
export { bootMetadata, retryBoot } from './boot'
