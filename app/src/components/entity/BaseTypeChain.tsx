import type { EntityType } from '@/lib/metadata'
import { useLookupMaps } from '@/lib/metadata'
import { TypeLink } from './TypeLink'

interface BaseTypeChainProps {
  entity: EntityType
}

/**
 * Displays the base type inheritance chain for an entity.
 * Walks the baseTypeName chain using lookup maps.
 * Hidden when entity has no baseTypeName.
 */
export function BaseTypeChain({ entity }: BaseTypeChainProps) {
  const maps = useLookupMaps()

  if (!entity.baseTypeName || !maps) return null

  // Walk the chain: entity → base → base of base → ...
  const chain: string[] = []
  let current = entity.baseTypeName
  const visited = new Set<string>() // safety: prevent infinite loops

  while (current && !visited.has(current)) {
    visited.add(current)
    chain.push(current)
    const baseEntity = maps.entityByFullName.get(current)
    current = baseEntity?.baseTypeName ?? ''
  }

  if (chain.length === 0) return null

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 rounded-lg bg-muted px-4 py-3 text-sm">
      <span className="font-medium text-muted-foreground">Base type:</span>
      {chain.map((typeName, index) => (
        <span key={typeName} className="inline-flex items-center gap-2">
          {index > 0 && (
            <span className="text-xs text-muted-foreground">→</span>
          )}
          <span className={index > 0 ? 'text-xs opacity-70' : ''}>
            <TypeLink typeName={typeName} />
          </span>
        </span>
      ))}
    </div>
  )
}
