import type { DiffFunction } from '@/lib/diff'
import { CodeText } from '@/components/ui/code-text'
import { ChangeBadge } from './ChangeBadge'

interface RootFunctionsTableProps {
  functions: DiffFunction[]
}

/**
 * Sorted table of root function changes with Function Name, Return Type, and Change Badge columns.
 * Matches existing PropertiesTable styling conventions.
 */
export function RootFunctionsTable({ functions }: RootFunctionsTableProps) {
  const sorted = [...functions].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr>
          <th
            className="border-b border-border bg-background py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
            style={{ width: '45%' }}
          >
            Function Name
          </th>
          <th
            className="border-b border-border bg-background py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
            style={{ width: '35%' }}
          >
            Return Type
          </th>
          <th
            className="border-b border-border bg-background py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
            style={{ width: '20%' }}
          >
            Change
          </th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((fn) => (
          <tr
            key={fn.name}
            className="transition-colors hover:bg-muted/50"
          >
            <td className="border-b border-border/50 py-1.5">
              <CodeText variant="fn">{fn.name}</CodeText>
            </td>
            <td className="border-b border-border/50 py-1.5">
              <CodeText>{fn.returnType}</CodeText>
            </td>
            <td className="border-b border-border/50 py-1.5">
              <ChangeBadge changeType={fn.changeType} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
