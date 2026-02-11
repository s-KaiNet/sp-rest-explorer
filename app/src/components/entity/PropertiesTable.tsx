import type { Property } from '@/lib/metadata'
import { TypeLink } from './TypeLink'

interface PropertiesTableProps {
  properties: Property[]
}

/**
 * Properties table with Property | Type | Nullable columns.
 * Always sorted alphabetically by property name.
 * Custom table classes matching mockup styling.
 */
export function PropertiesTable({ properties }: PropertiesTableProps) {
  const sorted = [...properties].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr>
          <th className="border-b border-border bg-background py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground" style={{ width: '40%' }}>
            Property
          </th>
          <th className="border-b border-border bg-background py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground" style={{ width: '40%' }}>
            Type
          </th>
          <th className="border-b border-border bg-background py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground" style={{ width: '20%' }}>
            Nullable
          </th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((prop) => (
          <tr
            key={prop.name}
            className="transition-colors hover:bg-muted/50"
          >
            <td className="border-b border-border/50 py-1.5 font-mono font-medium">
              {prop.name}
            </td>
            <td className="border-b border-border/50 py-1.5 text-xs">
              <TypeLink typeName={prop.typeName} />
            </td>
            <td className="border-b border-border/50 py-1.5 font-mono text-xs">
              {prop.nullable ? (
                <span className="text-muted-foreground">yes</span>
              ) : (
                <span className="font-semibold text-type-fn">no</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
