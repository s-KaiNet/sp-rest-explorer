import { useState } from 'react'
import { Link } from 'react-router'
import { useTypeIndexes } from '@/lib/metadata'

interface UsedByBarProps {
  entityFullName: string
}

const MAX_VISIBLE = 10

/**
 * "Used by" cross-reference bar.
 * Uses the precomputed usedByIndex for O(1) lookups instead of scanning all entities.
 * Shows purple chips with entity.property links.
 * Hidden when 0 references.
 */
export function UsedByBar({ entityFullName }: UsedByBarProps) {
  const typeIndexes = useTypeIndexes()
  const [expanded, setExpanded] = useState(false)

  if (!typeIndexes) return null

  const refs = typeIndexes.usedByIndex.get(entityFullName) ?? []
  if (refs.length === 0) return null

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
