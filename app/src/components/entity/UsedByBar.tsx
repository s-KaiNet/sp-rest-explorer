import { useState } from 'react'
import { Link } from 'react-router'
import { useMetadataSnapshot } from '@/lib/metadata'

interface UsedByBarProps {
  entityFullName: string
}

interface UsedByRef {
  entityFullName: string
  entityName: string
  propertyName: string
}

const MAX_VISIBLE = 10

/**
 * "Used by" cross-reference bar.
 * Scans all entities' navigation properties to find which reference this entity.
 * Shows purple chips with entity.property links.
 * Hidden when 0 references.
 */
export function UsedByBar({ entityFullName }: UsedByBarProps) {
  const metadata = useMetadataSnapshot()
  const [expanded, setExpanded] = useState(false)

  if (!metadata) return null

  // Scan all entities' nav properties on-demand
  const refs: UsedByRef[] = []

  for (const entity of Object.values(metadata.entities)) {
    for (const nav of entity.navigationProperties) {
      // Check direct reference or Collection reference
      if (
        nav.typeName === entityFullName ||
        nav.typeName === `Collection(${entityFullName})`
      ) {
        refs.push({
          entityFullName: entity.fullName,
          entityName: entity.name,
          propertyName: nav.name,
        })
      }
    }
  }

  if (refs.length === 0) return null

  // Sort for consistent ordering
  refs.sort((a, b) =>
    `${a.entityFullName}.${a.propertyName}`.localeCompare(
      `${b.entityFullName}.${b.propertyName}`,
    ),
  )

  const visibleRefs = expanded ? refs : refs.slice(0, MAX_VISIBLE)
  const remainingCount = refs.length - MAX_VISIBLE

  return (
    <div className="mb-6 rounded-lg bg-type-nav/10 px-4 py-3 text-sm">
      <div className="mb-1.5 font-semibold text-type-nav">
        Referenced as navigation property in:
      </div>
      <div className="flex flex-wrap gap-1.5">
        {visibleRefs.map((ref) => (
          <Link
            key={`${ref.entityFullName}.${ref.propertyName}`}
            to={`/entity/${encodeURIComponent(ref.entityFullName)}`}
            className="inline-flex items-center gap-1 rounded-md border border-transparent bg-type-nav/10 px-2.5 py-1 font-mono text-xs text-type-nav transition-colors hover:border-type-nav hover:bg-type-nav/20"
            title={`View ${ref.entityFullName} entity`}
          >
            <span className="font-semibold">{ref.entityName}</span>
            <span className="opacity-60">.{ref.propertyName}</span>
          </Link>
        ))}
        {!expanded && remainingCount > 0 && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="inline-flex items-center rounded-md border border-type-nav/30 bg-type-nav/5 px-2.5 py-1 font-mono text-xs text-type-nav transition-colors hover:bg-type-nav/20"
          >
            +{remainingCount} more
          </button>
        )}
        {expanded && remainingCount > 0 && (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="inline-flex items-center rounded-md border border-type-nav/30 bg-type-nav/5 px-2.5 py-1 font-mono text-xs text-type-nav transition-colors hover:bg-type-nav/20"
          >
            show less
          </button>
        )}
      </div>
    </div>
  )
}
