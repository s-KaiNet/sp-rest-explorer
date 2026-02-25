import { useState } from 'react'
import type { DiffEntity, DiffPropertyChange } from '@/lib/diff'
import { ChangeBadge } from './ChangeBadge'

interface EntityChangeCardProps {
  entity: DiffEntity
}

/**
 * Expandable card showing entity-level changes with property, navigation property,
 * and function sub-sections. Cards start expanded by default.
 */
export function EntityChangeCard({ entity }: EntityChangeCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const sortedProperties = [...entity.properties].sort((a, b) =>
    a.name.localeCompare(b.name),
  )
  const sortedNavProperties = [...entity.navigationProperties].sort((a, b) =>
    a.name.localeCompare(b.name),
  )
  const sortedFunctions = [...entity.functions].sort((a, b) =>
    a.name.localeCompare(b.name),
  )

  return (
    <div className="rounded-lg border border-border bg-background">
      {/* Card header — clickable to toggle expand/collapse */}
      <div
        className="flex cursor-pointer select-none items-center gap-3 px-4 py-3"
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsExpanded(!isExpanded)
          }
        }}
      >
        <span className="font-mono text-sm font-bold">{entity.name}</span>
        <ChangeBadge changeType={entity.changeType} />
        <span className="ml-auto text-xs text-muted-foreground">
          {isExpanded ? '▲' : '▼'}
        </span>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="space-y-4 px-4 pb-4">
          {sortedProperties.length > 0 && (
            <PropertySubSection
              title="Properties"
              items={sortedProperties}
            />
          )}
          {sortedNavProperties.length > 0 && (
            <PropertySubSection
              title="Navigation Properties"
              items={sortedNavProperties}
            />
          )}
          {sortedFunctions.length > 0 && (
            <PropertySubSection
              title="Functions"
              items={sortedFunctions}
            />
          )}
        </div>
      )}
    </div>
  )
}

// ── Sub-section for property/navProp/function rows ──

interface PropertySubSectionProps {
  title: string
  items: DiffPropertyChange[]
}

function PropertySubSection({ title, items }: PropertySubSectionProps) {
  return (
    <div>
      {/* Sub-section header */}
      <div className="mb-2 border-b border-border/50 pb-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title} ({items.length})
        </span>
      </div>

      {/* Property rows */}
      <div className="space-y-0">
        {items.map((item) => (
          <div
            key={item.name}
            className="flex items-center gap-2 py-1"
          >
            <span className="font-mono text-sm font-medium">{item.name}</span>
            <span className="font-mono text-xs text-muted-foreground">
              {item.typeName}
            </span>
            <span className="ml-auto">
              <ChangeBadge changeType={item.changeType} />
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
