import { Link } from 'react-router'
import type { DiffFunction } from '@/lib/diff'
import { CodeText } from '@/components/ui/code-text'
import { ChangeBadge } from './ChangeBadge'

interface RootFunctionsTableProps {
  functions: DiffFunction[]
}

/**
 * Sorted table of root function changes with Function Name, Return Type, and Change Badge columns.
 * Uses table-fixed layout with truncation to prevent long SP API names from pushing columns off-screen.
 */
export function RootFunctionsTable({ functions }: RootFunctionsTableProps) {
  const sorted = [...functions].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <table className="w-full table-fixed border-collapse text-sm">
      <colgroup>
        <col className="w-[50%]" />
        <col className="w-[35%]" />
        <col className="w-[15%]" />
      </colgroup>
      <thead>
        <tr>
          <th className="border-b border-border bg-background py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Function Name
          </th>
          <th className="border-b border-border bg-background py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Return Type
          </th>
          <th className="border-b border-border bg-background py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
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
            <td className="truncate border-b border-border/50 py-1.5 pr-3">
              {fn.changeType !== 'removed' ? (
                <Link to={`/_api/${fn.name}`} className="hover:underline" title={`View ${fn.name} in Explore API`}>
                  <CodeText variant="fn">{fn.name}</CodeText>
                </Link>
              ) : (
                <span className="text-muted-foreground">
                  <CodeText variant="fn">{fn.name}</CodeText>
                </span>
              )}
            </td>
            <td className="truncate border-b border-border/50 py-1.5 pr-3">
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
