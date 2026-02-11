import type { NavigationProperty } from '@/lib/metadata'
import { TypeLink } from './TypeLink'

interface NavPropertiesTableProps {
  navigationProperties: NavigationProperty[]
}

/**
 * Navigation properties table with Name | Target Type columns.
 * Names displayed in purple monospace.
 * Always sorted alphabetically by name.
 */
export function NavPropertiesTable({ navigationProperties }: NavPropertiesTableProps) {
  const sorted = [...navigationProperties].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr>
          <th className="border-b border-border bg-background py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground" style={{ width: '40%' }}>
            Name
          </th>
          <th className="border-b border-border bg-background py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Target Type
          </th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((nav) => (
          <tr
            key={nav.name}
            className="transition-colors hover:bg-muted/50"
          >
            <td className="border-b border-border/50 py-1.5 font-mono font-medium text-type-nav">
              {nav.name}
            </td>
            <td className="border-b border-border/50 py-1.5 text-xs">
              <TypeLink typeName={nav.typeName} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
