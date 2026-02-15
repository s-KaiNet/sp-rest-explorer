import { useState, useMemo } from 'react'
import { Link } from 'react-router'
import type { EntityType } from '@/lib/metadata'
import { useTypeIndexes } from '@/lib/metadata'
import { TypeLink, CollapsibleSection, SectionFilter, PropertiesTable } from '@/components/entity'

interface ComplexTypeDetailProps {
  type: EntityType
}

const MAX_VISIBLE = 10

/**
 * Complete detail view for a complex type.
 * Renders header, full name, base type link, derived types,
 * used-by entities, and properties table with filter.
 */
export function ComplexTypeDetail({ type }: ComplexTypeDetailProps) {
  const typeIndexes = useTypeIndexes()
  const [propsFilter, setPropsFilter] = useState('')
  const [usedByExpanded, setUsedByExpanded] = useState(false)

  // Derived types for this type
  const derivedTypes = useMemo(() => {
    if (!typeIndexes) return []
    return typeIndexes.derivedTypes.get(type.fullName) ?? []
  }, [typeIndexes, type.fullName])

  // Used-by references for this type
  const usedByRefs = useMemo(() => {
    if (!typeIndexes) return []
    return typeIndexes.usedByIndex.get(type.fullName) ?? []
  }, [typeIndexes, type.fullName])

  // Filter properties by name
  const filteredProperties = useMemo(() => {
    if (!propsFilter) return type.properties
    const lower = propsFilter.toLowerCase()
    return type.properties.filter((p) => p.name.toLowerCase().includes(lower))
  }, [type.properties, propsFilter])

  const visibleUsedBy = usedByExpanded ? usedByRefs : usedByRefs.slice(0, MAX_VISIBLE)
  const remainingCount = usedByRefs.length - MAX_VISIBLE

  return (
    <div className="p-6">
      {/* Header: Type name */}
      <h2 className="mb-1 text-[22px] font-bold">{type.name}</h2>

      {/* Full name */}
      <div className="mb-4 font-mono text-sm text-muted-foreground">
        Full name:{' '}
        <code className="rounded bg-muted px-1.5 py-0.5">{type.fullName}</code>
      </div>

      {/* Base type — single immediate parent as clickable link */}
      {type.baseTypeName && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-muted px-4 py-3 text-sm">
          <span className="font-medium text-muted-foreground">Base type:</span>
          <TypeLink typeName={type.baseTypeName} />
        </div>
      )}

      {/* Derived types — types that inherit from this type */}
      {derivedTypes.length > 0 && (
        <div className="mb-6 rounded-lg bg-muted px-4 py-3 text-sm">
          <div className="mb-1.5 font-semibold text-muted-foreground">
            Derived types:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {derivedTypes.map((dt) => (
              <TypeLink key={dt.fullName} typeName={dt.fullName} />
            ))}
          </div>
        </div>
      )}

      {/* Used by Entities — entities whose nav properties reference this type */}
      {usedByRefs.length > 0 && (
        <div className="mb-6 rounded-lg bg-type-nav/10 px-4 py-3 text-sm">
          <div className="mb-1.5 font-semibold text-type-nav">
            Used by Entities:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {visibleUsedBy.map((ref) => (
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
            {!usedByExpanded && remainingCount > 0 && (
              <button
                type="button"
                onClick={() => setUsedByExpanded(true)}
                className="inline-flex items-center rounded-md border border-type-nav/30 bg-type-nav/5 px-2.5 py-1 font-mono text-xs text-type-nav transition-colors hover:bg-type-nav/20"
              >
                +{remainingCount} more
              </button>
            )}
            {usedByExpanded && remainingCount > 0 && (
              <button
                type="button"
                onClick={() => setUsedByExpanded(false)}
                className="inline-flex items-center rounded-md border border-type-nav/30 bg-type-nav/5 px-2.5 py-1 font-mono text-xs text-type-nav transition-colors hover:bg-type-nav/20"
              >
                show less
              </button>
            )}
          </div>
        </div>
      )}

      {/* Properties section */}
      <CollapsibleSection
        id="props-section"
        title="Properties"
        count={type.properties.length}
        emptyMessage="No properties defined"
        filterSlot={
          type.properties.length > 0 ? (
            <SectionFilter
              value={propsFilter}
              onChange={setPropsFilter}
              placeholder="Filter properties..."
            />
          ) : undefined
        }
      >
        <PropertiesTable properties={filteredProperties} />
      </CollapsibleSection>
    </div>
  )
}
