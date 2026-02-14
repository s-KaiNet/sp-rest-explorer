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
  Property,
  SearchDocument,
} from './types'

// ── Metadata singleton ──
export { getMetadata, useMetadataSnapshot } from './metadata-store'

// ── Lookup maps ──
export { getLookupMaps, useLookupMaps } from './lookup-maps'

// ── Search index ──
export { getSearchIndex } from './search-index'

// ── Boot orchestrator ──
export { bootMetadata, retryBoot } from './boot'
