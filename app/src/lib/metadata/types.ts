// ── Core metadata interfaces (matching Azure Blob Storage JSON shape) ──

export interface Property {
  name: string
  typeName: string
  nullable?: boolean
}

export interface NavigationProperty {
  typeName: string
  name: string
}

export interface Parameter {
  name: string
  typeName: string
  nullable: boolean
}

export interface EntityType {
  name: string
  fullName: string
  alias?: string
  baseTypeName?: string
  properties: Property[]
  functionIds: number[]
  navigationProperties: NavigationProperty[]
}

export interface FunctionImport {
  name: string
  isRoot: boolean
  isComposable: boolean
  isBindable: boolean
  returnType: string
  parameters: Parameter[]
  id: number
}

export interface Metadata {
  entities: Record<string, EntityType>
  functions: Record<number, FunctionImport>
}

// ── Derived types (built from metadata at boot) ──

export interface SearchDocument {
  id: string
  name: string
  fullName: string
  kind: 'entity' | 'endpoint'
  // Endpoint-specific fields (undefined for entities)
  path?: string           // Full _api/... path for display and navigation
  endpointKind?: 'function' | 'navProperty'
  parentEntity?: string   // Entity fullName the leaf belongs to
  isRoot?: boolean        // Whether this is a root function
}

export interface EndpointEntry {
  id: string              // Full _api/... path (unique per entry, used as MiniSearch id)
  name: string            // Leaf name (searchable)
  path: string            // Full _api/... path (displayed, not searched)
  kind: 'function' | 'navProperty'
  parentEntity: string    // Entity fullName the leaf belongs to
  isRoot: boolean         // Whether this is a root function
}

export interface ChildEntry {
  name: string
  kind: 'function' | 'navProperty'
  ref: number | string
  returnType?: string
}

export interface LookupMaps {
  entityByFullName: Map<string, EntityType>
  functionById: Map<number, FunctionImport>
  entityChildren: Map<string, ChildEntry[]>
}

// ── App status ──

export type AppStatus = 'idle' | 'loading' | 'ready' | 'error'
