import { useMemo } from 'react'
import { useParams } from 'react-router'
import { useMetadataSnapshot, useLookupMaps } from '@/lib/metadata'
import { EntityDetail } from '@/components/entity'

export function TypesPage() {
  const { typeName } = useParams()
  const metadata = useMetadataSnapshot()
  const maps = useLookupMaps()

  // Compute stats from real metadata
  const stats = useMemo(() => {
    if (!metadata) return { entities: 0, properties: 0, methods: 0 }
    const entities = Object.keys(metadata.entities)
    const entityCount = entities.length
    let propertyCount = 0
    let methodCount = 0
    for (const key of entities) {
      const ent = metadata.entities[key]
      propertyCount += ent.properties.length
      methodCount += ent.functionIds.length
    }
    return { entities: entityCount, properties: propertyCount, methods: methodCount }
  }, [metadata])

  // If a type is selected, resolve and render EntityDetail
  if (typeName) {
    const decodedName = decodeURIComponent(typeName)
    const entity = maps?.entityByFullName.get(decodedName) ?? null

    if (!entity) {
      // Loading state (maps not ready) or entity not found
      if (!maps) {
        return (
          <div className="flex flex-1 flex-col items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        )
      }

      // Entity not found
      return (
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-2xl text-destructive">
            ?
          </div>
          <h2 className="mb-2 text-lg font-semibold">Entity not found</h2>
          <p className="max-w-[360px] text-sm text-muted-foreground">
            No entity type matching{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{decodedName}</code>{' '}
            was found in the metadata.
          </p>
        </div>
      )
    }

    // Entity found — render full detail in scrollable area
    return (
      <div className="flex-1 overflow-y-auto">
        <EntityDetail entity={entity} />
      </div>
    )
  }

  // Welcome screen — no type selected
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 py-12 text-center">
      {/* Green icon box */}
      <div className="mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-type-entity/10 text-[32px] font-extrabold text-type-entity">
        T
      </div>

      {/* Title */}
      <h2 className="mb-2 text-xl font-bold">Explore Types</h2>

      {/* Description */}
      <p className="mb-6 max-w-[420px] text-sm leading-relaxed text-muted-foreground">
        Browse all entity types defined in the SharePoint REST API metadata.
        Select a type from the sidebar to view its properties, navigation
        properties, and methods.
      </p>

      {/* Stats row */}
      <div className="flex gap-8">
        <div className="flex flex-col items-center">
          <span className="text-[28px] font-bold text-type-entity">
            {stats.entities.toLocaleString()}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Entity Types
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[28px] font-bold text-type-entity">
            {stats.properties.toLocaleString()}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Properties
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[28px] font-bold text-type-entity">
            {stats.methods.toLocaleString()}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Methods
          </span>
        </div>
      </div>

      {/* Hint box */}
      <div className="mt-7 flex items-center gap-2 rounded-lg bg-type-entity/10 px-[18px] py-3 text-[13px] text-green-800 dark:text-green-200">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="shrink-0"
        >
          <path d="M15 15l-2 5L9 9l11 4-5 2z" />
          <path d="m2 2 7.586 7.586" />
        </svg>
        Select a type from the sidebar, or use{' '}
        <kbd className="rounded border border-border bg-background px-1.5 py-0.5 text-[11px]">
          Ctrl K
        </kbd>{' '}
        to search
      </div>
    </div>
  )
}
