import { Link } from 'react-router'
import { getTypeIndexes } from '@/lib/metadata'

const COLLECTION_RE = /^Collection\((.+)\)$/

function isPrimitive(typeName: string): boolean {
  return typeName.startsWith('Edm.')
}

function typeLabel(name: string): string {
  const indexes = getTypeIndexes()
  return indexes?.complexTypeNames.has(name) ? 'type' : 'entity'
}

interface TypeLinkProps {
  typeName: string
  className?: string
}

/**
 * Renders an entity type name as a clickable link or plain text.
 *
 * - Entity types → green clickable link to /entity/{typeName}
 * - Collection(Entity) → split link: dimmed "Collection" + green inner type
 * - Edm.* primitives → gray monospace text (not clickable)
 * - Collection(Edm.*) → gray monospace text (not clickable)
 */
export function TypeLink({ typeName, className }: TypeLinkProps) {
  // Guard against undefined/empty typeName from metadata gaps
  if (!typeName) {
    return (
      <span className={`font-mono text-muted-foreground italic ${className ?? ''}`}>
        unknown
      </span>
    )
  }

  const collectionMatch = typeName.match(COLLECTION_RE)

  // Collection type
  if (collectionMatch) {
    const innerType = collectionMatch[1]

    // Collection(Edm.*) — not clickable
    if (isPrimitive(innerType)) {
      return (
        <span className={`font-mono text-muted-foreground ${className ?? ''}`}>
          {typeName}
        </span>
      )
    }

    // Collection(Entity/ComplexType) — split link
    return (
      <span className={`font-mono ${className ?? ''}`}>
        <Link
          to={`/entity/${encodeURIComponent(typeName)}`}
          className="text-muted-foreground hover:underline"
          title={`View ${typeName} ${typeLabel(typeName)}`}
        >
          Collection
        </Link>
        <span className="text-muted-foreground">(</span>
        <Link
          to={`/entity/${encodeURIComponent(innerType)}`}
          className="font-medium text-type-entity hover:underline"
          title={`View ${innerType} ${typeLabel(innerType)}`}
        >
          {innerType}
        </Link>
        <span className="text-muted-foreground">)</span>
      </span>
    )
  }

  // Primitive type — not clickable
  if (isPrimitive(typeName)) {
    return (
      <span className={`font-mono text-muted-foreground ${className ?? ''}`}>
        {typeName}
      </span>
    )
  }

  // Entity or complex type — clickable green link
  return (
    <Link
      to={`/entity/${encodeURIComponent(typeName)}`}
      className={`font-mono font-medium text-type-entity hover:underline ${className ?? ''}`}
      title={`View ${typeName} ${typeLabel(typeName)}`}
    >
      {typeName}
    </Link>
  )
}
