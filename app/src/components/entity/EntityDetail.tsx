import { useState, useMemo } from 'react'
import type { EntityType, FunctionImport } from '@/lib/metadata'
import { useLookupMaps } from '@/lib/metadata'
import { BaseTypeChain } from './BaseTypeChain'
import { UsedByBar } from './UsedByBar'
import { SectionJumpLinks } from './SectionJumpLinks'
import { CollapsibleSection } from './CollapsibleSection'
import { SectionFilter } from './SectionFilter'
import { PropertiesTable } from './PropertiesTable'
import { NavPropertiesTable } from './NavPropertiesTable'
import { MethodsTable } from './MethodsTable'

interface EntityDetailProps {
  entity: EntityType
}

/**
 * Complete entity detail view.
 * Renders header, fullName, base type chain, used-by bar,
 * section jump links, and three collapsible sections with tables.
 */
export function EntityDetail({ entity }: EntityDetailProps) {
  const maps = useLookupMaps()
  const [propsFilter, setPropsFilter] = useState('')
  const [navPropsFilter, setNavPropsFilter] = useState('')
  const [methodsFilter, setMethodsFilter] = useState('')

  // Resolve functionIds to FunctionImport[]
  const functions = useMemo<FunctionImport[]>(() => {
    if (!maps) return []
    return entity.functionIds
      .map((id) => maps.functionById.get(id))
      .filter((fn): fn is FunctionImport => fn !== undefined)
  }, [entity.functionIds, maps])

  // Filter properties by name
  const filteredProperties = useMemo(() => {
    if (!propsFilter) return entity.properties
    const lower = propsFilter.toLowerCase()
    return entity.properties.filter((p) => p.name.toLowerCase().includes(lower))
  }, [entity.properties, propsFilter])

  // Filter navigation properties by name
  const filteredNavProperties = useMemo(() => {
    if (!navPropsFilter) return entity.navigationProperties
    const lower = navPropsFilter.toLowerCase()
    return entity.navigationProperties.filter((np) => np.name.toLowerCase().includes(lower))
  }, [entity.navigationProperties, navPropsFilter])

  // Filter methods by name
  const filteredFunctions = useMemo(() => {
    if (!methodsFilter) return functions
    const lower = methodsFilter.toLowerCase()
    return functions.filter((fn) => fn.name.toLowerCase().includes(lower))
  }, [functions, methodsFilter])

  return (
    <div className="p-6">
      {/* Header: Entity name + badge */}
      <div className="mb-1 flex items-center gap-3.5">
        <h2 className="text-[22px] font-bold">{entity.name}</h2>
        <span className="rounded-md bg-type-entity/10 px-2.5 py-1 text-xs font-semibold text-type-entity">
          Entity Type
        </span>
      </div>

      {/* Full name */}
      <div className="mb-4 font-mono text-sm text-muted-foreground">
        Full name:{' '}
        <code className="rounded bg-muted px-1.5 py-0.5">{entity.fullName}</code>
      </div>

      {/* Base type chain */}
      <BaseTypeChain entity={entity} />

      {/* Used by bar */}
      <UsedByBar entityFullName={entity.fullName} />

      {/* Section jump links */}
      <SectionJumpLinks
        propertiesCount={entity.properties.length}
        navPropertiesCount={entity.navigationProperties.length}
        methodsCount={functions.length}
      />

      {/* Properties section */}
      <CollapsibleSection
        id="props-section"
        title="Properties"
        count={entity.properties.length}
        emptyMessage="No properties"
        filterSlot={
          entity.properties.length > 0 ? (
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

      {/* Navigation Properties section */}
      <CollapsibleSection
        id="navprops-section"
        title="Navigation Properties"
        count={entity.navigationProperties.length}
        emptyMessage="No navigation properties"
        filterSlot={
          entity.navigationProperties.length > 0 ? (
            <SectionFilter
              value={navPropsFilter}
              onChange={setNavPropsFilter}
              placeholder="Filter nav properties..."
            />
          ) : undefined
        }
      >
        <NavPropertiesTable navigationProperties={filteredNavProperties} />
      </CollapsibleSection>

      {/* Methods section */}
      <CollapsibleSection
        id="methods-section"
        title="Methods"
        count={functions.length}
        emptyMessage="No methods"
        filterSlot={
          functions.length > 0 ? (
            <SectionFilter
              value={methodsFilter}
              onChange={setMethodsFilter}
              placeholder="Filter methods..."
            />
          ) : undefined
        }
      >
        <MethodsTable functions={filteredFunctions} />
      </CollapsibleSection>
    </div>
  )
}
